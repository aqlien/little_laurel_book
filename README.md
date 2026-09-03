# Address Book

This is a simple desktop address book prototype built with Electron.

## Run locally

1. Open a terminal in `d:\Work\gems\address_book`
2. Run `npm install`
3. Run `npm start`

## Build a Windows installer

1. Open a terminal in `d:\Work\gems\address_book`
2. Run `npm install`
3. Run `npm run dist`
4. Open the generated installer in `dist\`

After installation, Windows will treat the app like a standard installed program and it will appear in the system's app list.

## Files

- `index.html` — app HTML
- `css/main.css` — app styles
- `js/main.js` — app logic
- `electron-main.js` — Electron main process
- `preload.js` — preload script
- `package.json` — Electron startup settings and build config
