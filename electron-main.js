const { app, BrowserWindow, Menu, nativeImage } = require('electron');
const path = require('path');

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
    title: 'Address Book',
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

app.on('ready', createWindow);

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
