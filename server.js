const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu
} = require('electron');

function createMenu() {
	const template = [
		{
			label: 'File',
			submenu: [
        {
          label: 'Open',
          accelerator: 'CommandOrControl+O',
          click(menuItem, browserWindow, event) {
            dialog.showOpenDialog({
              title: 'Open...',
              properties: ['multiSelections', 'openFile'],
            }).then(result => {
              if (!result.canceled && result.filePaths.length > 0) {
                setWindowPath(browserWindow.webContents, result.filePaths[0]);
              }
            });
          },
        },
        {
          type: 'separator'
        },
        // {
          // role: 'close'
        // },
			]
		},
		{
			label: 'View',
			submenu: [
        // The accelerators for some roles aren't working properly on Linux. I
        // guess I'll "role" my own.
        {
          label: 'Reload',
          accelerator: 'CommandOrControl+R',
          click(item, focusedWindow) {
            focusedWindow.reload();
          },
        },
        {
          label: 'Force Reload',
          accelerator: 'CommandOrControl+Shift+R',
          click(item, focusedWindow) {
            focusedWindow.webContents.reloadIgnoringCache();
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'CommandOrControl+Alt+I',
          click(item, focusedWindow) {
            focusedWindow.toggleDevTools();
          },
        },
				{type: 'separator'},
        {
          label: 'Toggle Fullscreen',
          accelerator: 'F11',
          click(item, focusedWindow) {
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
          },
        },
			]
		},
	];

  if (process.platform === 'darwin') {
    const name = app.getName();
    template.unshift({
      label: name,
      submenu: [
        {
          label: `About ${name}`,
          role: 'about',
        },
        { type: 'separator' },
        { type: 'separator' },
        {
          label: `Hide ${name}`,
          accelerator: 'Command+H',
          role: 'hide',
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Alt+H',
          role: 'hideothers',
        },
        {
          label: 'Show All',
          role: 'unhide',
        },
        { type: 'separator' },
        {
          label: `Quit ${name}`,
          accelerator: 'Command+Q',
          click() { app.quit(); },
        },
      ],
    });
  }

	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
}


function createWindow() {
  let browser = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    },
  });

  browser.loadFile('index.html');
}

function setWindowPath(webContents, path) {
  webContents.send('setPath', path); 
}

ipcMain.on('getPath', event => {
  setWindowPath(event.sender, process.argv[2]);
})

app.on('ready', () => {
  createMenu();
  createWindow();
});
