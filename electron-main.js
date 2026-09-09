const { app, BrowserWindow, Menu, nativeImage, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

let database;

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
  database.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL
    )
  `);
}

function registerDatabaseHandlers() {
  ipcMain.handle('contacts:load', () => {
    return database.prepare(`
      SELECT id, name, phone, email, notes
      FROM contacts
      ORDER BY created_at DESC
    `).all();
  });

  ipcMain.handle('contacts:save', (_event, contact) => {
    database.prepare(`
      INSERT INTO contacts (id, name, phone, email, notes, created_at)
      VALUES (@id, @name, @phone, @email, @notes, @createdAt)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        phone = excluded.phone,
        email = excluded.email,
        notes = excluded.notes
    `).run({
      id: String(contact.id),
      name: String(contact.name),
      phone: String(contact.phone),
      email: String(contact.email || ''),
      notes: String(contact.notes || ''),
      createdAt: Date.now(),
    });
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
