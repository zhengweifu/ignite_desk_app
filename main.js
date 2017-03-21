const {app, BrowserWindow} = require('electron');

app.on('ready', () => {
	let mainWindow = new BrowserWindow({width: 800, height: 600, fullscreen: true});
	
	mainWindow.loadURL('file://' + __dirname + '/index.html');

	mainWindow.setMenu(null);
	// mainWindow.webContents.openDevTools();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

// app.on('will-quit', () => {
// 	console.log(electron);
// });

