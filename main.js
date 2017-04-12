const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { GetConfig, DownloadFilePromise } = require('./common.js');
const path = require('path');
const co = require('./node_modules/co/index.js');
let config = GetConfig();
const http = require('http');

let isOnLine = false;

let mainWindow, timer;

function *downloadDatas(_window, _config) {
	const UpdateFolder = config.serverRoot + '/Public/tools/IgniteDeskApp/dist/current/';
	const currentVersion = app.getVersion();
	const webPackage = JSON.parse(yield DownloadFilePromise(UpdateFolder + 'package.json'));
	const webVersion = webPackage.version;
	if(currentVersion != webVersion && _config.checkUpdate) {
		const id = dialog.showMessageBox(_window, {
			type: 'question',
			title: '更新',
			cancelId: 1,
			message: '发现有新的版本可以更新，单击确定按钮更新，之后重启程序。',
			buttons: ['确定', '取消']
		});
		if(id == 0) {
			const serverUrl = _config.serverRoot + '/Public/tools/server/php/server.php?method=IgniteDeskAppUpdate';
			const updateFiles = JSON.parse(yield DownloadFilePromise(serverUrl));
			const total = updateFiles.length;
			_window.setProgressBar(0);
			for(let j = 0; j < total; j++) {
				let webFile = updateFiles[j];
				let localFile = path.resolve(__dirname, webFile.replace(UpdateFolder, ''));
				yield DownloadFilePromise(webFile, localFile);
				_window.setProgressBar((j + 1) / total);
			}

			app.quit();
		}
	}

	_window.loadURL('file://' + __dirname + '/index.html');
	_window.setMenu(null);
	if(_config.showDevTools) _window.webContents.openDevTools();
};

app.on('ready', () => {
	mainWindow = new BrowserWindow({width: 800, height: 600, fullscreen: true});
	mainWindow.loadURL('file://' + __dirname + '/online_status.html');
	timer = setInterval(() => {
		if(isOnLine) {
			co(downloadDatas(mainWindow, config));
			clearInterval(timer);
		}
	}, 1000);
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

ipcMain.on('online-status-changed', (event, status) => {
	isOnLine = status;
});
