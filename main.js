const {app, BrowserWindow, dialog} = require('electron');
const { GetConfig, DownloadFilePromise } = require('./common.js');
const path = require('path');
const co = require('./node_modules/.4.6.0@co/index.js');
const exec = require('child_process').exec
let config = GetConfig();
const http = require('http');

const UpdateFolder = config.serverRoot + '/Public/tools/IgniteDeskApp/dist/current/';

app.on('ready', () => {
	let mainWindow = new BrowserWindow({width: 800, height: 600, fullscreen: true});
	co(function *() {
		const currentVersion = app.getVersion();
		const webPackage = JSON.parse(yield DownloadFilePromise(UpdateFolder + 'package.json'));
		const webVersion = webPackage.version;
		if(currentVersion != webVersion) {
			const id = dialog.showMessageBox(mainWindow, {
				type: 'question',
				title: '更新',
				message: '发现有新的版本可以更新，单击确定按钮更新，之后重启程序。',
				buttons: ['确定', '取消']
			});
			if(id == 0) {
				const serverUrl = config.serverRoot + '/Public/tools/server/php/server.php?method=IgniteDeskAppUpdate';
				const updateFiles = JSON.parse(yield DownloadFilePromise(serverUrl));
				const total = updateFiles.length;
				mainWindow.setProgressBar(0);
				for(let j = 0; j < total; j++) {
					let webFile = updateFiles[j];
					let localFile = path.resolve(__dirname, webFile.replace(UpdateFolder, ''));
					yield DownloadFilePromise(webFile, localFile);
					mainWindow.setProgressBar((j + 1) / total);
				}

				app.quit();
			}
		}

		mainWindow.loadURL('file://' + __dirname + '/index.html');
		mainWindow.setMenu(null);
		// mainWindow.webContents.openDevTools();
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

