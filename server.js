const { app, BrowserWindow } = require('electron');

function createWindow() {
  let browser = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    },
  });

  browser.loadFile('index.html').then(() => {
    browser.webContents.send('initialize');
  });
}

app.on('ready', createWindow);
