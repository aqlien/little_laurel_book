const { app, BrowserWindow, Menu, nativeImage, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

let database;
const allowedPhoneLabels = new Set(['', 'Home', 'Work', 'Mobile']);
const allowedAddressLabels = new Set(['', 'Home', 'Work', 'Other']);

function configureDataDirectory() {
  const argument = process.argv.find((value) => value.startsWith('--data-dir='));
  const configuredDirectory = argument
    ? argument.slice('--data-dir='.length)
    : process.env.LITTLE_LAUREL_BOOK_DATA_DIR;

  if (configuredDirectory) {
    const dataDirectory = path.resolve(configuredDirectory);
    fs.mkdirSync(dataDirectory, { recursive: true });
    app.setPath('userData', dataDirectory);
  }
}

function initializeDatabase() {
  const databasePath = path.join(app.getPath('userData'), 'little-laurel-book.sqlite');
  database = new Database(databasePath);
  database.pragma('journal_mode = WAL');
  database.pragma('foreign_keys = ON');

  const contactColumns = database.prepare('PRAGMA table_info(contacts)').all();
  if (contactColumns.some((column) => column.name === 'phone')) {
    database.exec('DROP TABLE IF EXISTS contact_phones; DROP TABLE IF EXISTS contact_addresses; DROP TABLE IF EXISTS contact_dates; DROP TABLE contacts;');
  }

  database.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contact_phones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_id TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      label TEXT NOT NULL DEFAULT '',
      display_order INTEGER NOT NULL,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS contact_addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_id TEXT NOT NULL,
      line_1 TEXT NOT NULL DEFAULT '',
      line_2 TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      state TEXT NOT NULL DEFAULT '',
      postal_code TEXT NOT NULL DEFAULT '',
      country TEXT NOT NULL DEFAULT '',
      label TEXT NOT NULL DEFAULT '',
      display_order INTEGER NOT NULL,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS contact_dates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_id TEXT NOT NULL,
      important_date TEXT NOT NULL,
      label TEXT NOT NULL DEFAULT '',
      display_order INTEGER NOT NULL,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS contact_numbers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_id TEXT NOT NULL,
      important_number TEXT NOT NULL,
      label TEXT NOT NULL DEFAULT '',
      display_order INTEGER NOT NULL,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
    )
  `);
}

function registerDatabaseHandlers() {
  ipcMain.handle('contacts:load', () => {
    const contactRows = database.prepare(`
      SELECT id, name, email, notes
      FROM contacts
      ORDER BY created_at DESC
    `).all();
    const phoneRows = database.prepare(`
      SELECT contact_id, phone_number, label
      FROM contact_phones
      ORDER BY display_order
    `).all();
    const addressRows = database.prepare(`
      SELECT contact_id, line_1, line_2, city, state, postal_code, country, label
      FROM contact_addresses
      ORDER BY display_order
    `).all();
    const dateRows = database.prepare(`
      SELECT contact_id, important_date, label
      FROM contact_dates
      ORDER BY display_order
    `).all();
    const numberRows = database.prepare(`
      SELECT contact_id, important_number, label
      FROM contact_numbers
      ORDER BY display_order
    `).all();

    const phonesByContact = new Map();
    for (const phone of phoneRows) {
      const phones = phonesByContact.get(phone.contact_id) || [];
      phones.push({ number: phone.phone_number, label: phone.label });
      phonesByContact.set(phone.contact_id, phones);
    }

    const addressesByContact = new Map();
    for (const address of addressRows) {
      const addresses = addressesByContact.get(address.contact_id) || [];
      addresses.push({
        line1: address.line_1,
        line2: address.line_2,
        city: address.city,
        state: address.state,
        postalCode: address.postal_code,
        country: address.country,
        label: address.label,
      });
      addressesByContact.set(address.contact_id, addresses);
    }

    const datesByContact = new Map();
    for (const date of dateRows) {
      const dates = datesByContact.get(date.contact_id) || [];
      dates.push({ date: date.important_date, label: date.label });
      datesByContact.set(date.contact_id, dates);
    }

    const numbersByContact = new Map();
    for (const number of numberRows) {
      const numbers = numbersByContact.get(number.contact_id) || [];
      numbers.push({ number: number.important_number, label: number.label });
      numbersByContact.set(number.contact_id, numbers);
    }

    return contactRows.map((contact) => ({
      ...contact,
      phones: phonesByContact.get(contact.id) || [],
      addresses: addressesByContact.get(contact.id) || [],
      dates: datesByContact.get(contact.id) || [],
      numbers: numbersByContact.get(contact.id) || [],
    }));
  });

  ipcMain.handle('contacts:save', (_event, contact) => {
    const phones = Array.isArray(contact.phones)
      ? contact.phones.filter((phone) => phone && String(phone.number).trim())
      : [];
    const addresses = Array.isArray(contact.addresses)
      ? contact.addresses.filter((address) => address && [address.line1, address.line2, address.city, address.state, address.postalCode, address.country].some((value) => String(value || '').trim()))
      : [];
    const dates = Array.isArray(contact.dates)
      ? contact.dates.filter((date) => date && String(date.date || '').trim())
      : [];
    const numbers = Array.isArray(contact.numbers)
      ? contact.numbers.filter((number) => number && String(number.number || '').trim())
      : [];

    if (phones.length === 0 || (phones.length > 1 && phones.some((phone) => !phone.label))) {
      throw new Error('A contact must have one phone number, or all multiple phone numbers must be labeled.');
    }

    if (phones.some((phone) => !allowedPhoneLabels.has(String(phone.label || '')))) {
      throw new Error('Phone labels must be Home, Work, or Mobile.');
    }

    if (addresses.length > 1 && addresses.some((address) => !address.label)) {
      throw new Error('A contact with multiple addresses must label every address.');
    }

    if (addresses.some((address) => !allowedAddressLabels.has(String(address.label || '')))) {
      throw new Error('Address labels must be Home, Work, or Other.');
    }

    const save = database.transaction(() => {
      database.prepare(`
      INSERT INTO contacts (id, name, email, notes, created_at)
      VALUES (@id, @name, @email, @notes, @createdAt)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        email = excluded.email,
        notes = excluded.notes
    `).run({
        id: String(contact.id),
        name: String(contact.name),
        email: String(contact.email || ''),
        notes: String(contact.notes || ''),
        createdAt: Date.now(),
      });

      database.prepare('DELETE FROM contact_phones WHERE contact_id = ?').run(String(contact.id));
      const insertPhone = database.prepare(`
      INSERT INTO contact_phones (contact_id, phone_number, label, display_order)
      VALUES (@contactId, @number, @label, @displayOrder)
    `);

      phones.forEach((phone, displayOrder) => {
        insertPhone.run({
          contactId: String(contact.id),
          number: String(phone.number),
          label: String(phone.label || ''),
          displayOrder,
        });
      });

      database.prepare('DELETE FROM contact_addresses WHERE contact_id = ?').run(String(contact.id));
      const insertAddress = database.prepare(`
      INSERT INTO contact_addresses (contact_id, line_1, line_2, city, state, postal_code, country, label, display_order)
      VALUES (@contactId, @line1, @line2, @city, @state, @postalCode, @country, @label, @displayOrder)
    `);

      addresses.forEach((address, displayOrder) => {
        insertAddress.run({
          contactId: String(contact.id),
          line1: String(address.line1 || ''),
          line2: String(address.line2 || ''),
          city: String(address.city || ''),
          state: String(address.state || ''),
          postalCode: String(address.postalCode || ''),
          country: String(address.country || ''),
          label: String(address.label || ''),
          displayOrder,
        });
      });

      database.prepare('DELETE FROM contact_dates WHERE contact_id = ?').run(String(contact.id));
      const insertDate = database.prepare(`
      INSERT INTO contact_dates (contact_id, important_date, label, display_order)
      VALUES (@contactId, @date, @label, @displayOrder)
    `);

      dates.forEach((date, displayOrder) => {
        insertDate.run({
          contactId: String(contact.id),
          date: String(date.date),
          label: String(date.label || ''),
          displayOrder,
        });
      });

      database.prepare('DELETE FROM contact_numbers WHERE contact_id = ?').run(String(contact.id));
      const insertNumber = database.prepare(`
      INSERT INTO contact_numbers (contact_id, important_number, label, display_order)
      VALUES (@contactId, @number, @label, @displayOrder)
    `);

      numbers.forEach((number, displayOrder) => {
        insertNumber.run({
          contactId: String(contact.id),
          number: String(number.number),
          label: String(number.label || ''),
          displayOrder,
        });
      });
    });

    save();
  });

  ipcMain.handle('contacts:delete', (_event, id) => {
    database.prepare('DELETE FROM contacts WHERE id = ?').run(String(id));
  });
}

function getUpdateFeedUrl() {
  const argument = process.argv.find((value) => value.startsWith('--update-host='));
  const configuredUrl = argument
    ? argument.slice('--update-host='.length)
    : process.env.LITTLE_LAUREL_BOOK_UPDATE_URL;

  if (!configuredUrl) {
    return null;
  }

  try {
    const updateUrl = new URL(configuredUrl);
    return updateUrl.protocol === 'https:' ? updateUrl.toString() : null;
  } catch {
    return null;
  }
}

function checkForUpdates() {
  if (!app.isPackaged) {
    return;
  }

  const updateFeedUrl = getUpdateFeedUrl();
  if (!updateFeedUrl) {
    return;
  }

  autoUpdater.setFeedURL({
    provider: 'generic',
    url: updateFeedUrl,
  });
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.checkForUpdates().catch(() => {
    // Update failures should not prevent the address book from opening.
  });
}

function createAppIcon() {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <rect width="256" height="256" rx="48" fill="#2563eb" />
  <rect x="48" y="56" width="160" height="144" rx="22" fill="#fff" />
  <path d="M76 92h104v20H76zM76 132h104v16H76zM76 164h68v16H76z" fill="#2563eb" />
</svg>`;
  const svgBase64 = Buffer.from(svg).toString('base64');
  return nativeImage.createFromDataURL(`data:image/svg+xml;base64,${svgBase64}`);
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 760,
    minWidth: 840,
    minHeight: 620,
    title: 'Little Laurel Book',
    icon: createAppIcon(),
    autoHideMenuBar: true,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  Menu.setApplicationMenu(null);
  mainWindow.webContents.on('context-menu', (event) => event.preventDefault());
}

app.on('ready', () => {
  configureDataDirectory();
  initializeDatabase();
  registerDatabaseHandlers();
  createWindow();
  checkForUpdates();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
