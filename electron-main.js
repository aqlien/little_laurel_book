const { app, BrowserWindow, Menu, nativeImage, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

let database;
const allowedPhoneLabels = new Set(['', 'Home', 'Work', 'Mobile']);

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
    database.exec('DROP TABLE IF EXISTS contact_phones; DROP TABLE contacts;');
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
    const phonesByContact = new Map();

    for (const phone of phoneRows) {
      const phones = phonesByContact.get(phone.contact_id) || [];
      phones.push({ number: phone.phone_number, label: phone.label });
      phonesByContact.set(phone.contact_id, phones);
    }

    return contactRows.map((contact) => ({
      ...contact,
      phones: phonesByContact.get(contact.id) || [],
    }));
  });

  ipcMain.handle('contacts:save', (_event, contact) => {
    const phones = Array.isArray(contact.phones)
      ? contact.phones.filter((phone) => phone && String(phone.number).trim())
      : [];

    if (phones.length === 0 || (phones.length > 1 && phones.some((phone) => !phone.label))) {
      throw new Error('A contact must have one phone number, or all multiple phone numbers must be labeled.');
    }

    if (phones.some((phone) => !allowedPhoneLabels.has(String(phone.label || '')))) {
      throw new Error('Phone labels must be Home, Work, or Mobile.');
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
