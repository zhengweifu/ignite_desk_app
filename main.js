const {app, BrowserWindow} = require('electron');
const { GetConfig, DownloadFilePromise } = require('./common.js');
const path = require('path');
const co = require('co');
const exec = require('child_process').exec
let config = GetConfig();
const http = require('http');

const UpdateFolder = config.serverRoot + '/Public/tools/IgniteDeskApp/dist/';


app.on('ready', () => {
	let mainWindow = new BrowserWindow({width: 800, height: 600, fullscreen: false});
			
	mainWindow.loadURL('file://' + __dirname + '/index.html');

	mainWindow.setMenu(null);
	// mainWindow.webContents.openDevTools();
	
	co(function *() {
		const currentVersion = process.env.npm_package_version;
		const webPackage = JSON.parse(yield DownloadFilePromise(UpdateFolder + 'package.json'));
		const webVersion = webPackage.version;

		if(currentVersion != webVersion) {
			const serverUrl = config.serverRoot + '/Public/tools/server/php/server.php?method=IgniteDeskAppUpdate';
			const updateFiles = JSON.parse(yield DownloadFilePromise(serverUrl));

			for(let webFile of updateFiles) {
				let localFile = path.resolve(__dirname, webFile.replace(UpdateFolder, ''));
				console.log(localFile);
				yield DownloadFilePromise(webFile, localFile);
			}
			exec(process.argv.join(' '));
			app.quit();
		}
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

// app.on('will-quit', () => {
// 	console.log(electron);
// });

