const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { DownloadFilePromise } = require('./common.js');
const co = require('./node_modules/co/index.js');
const path = require('path');
const serverRoot = 'http://www.ignjewelry.com';
const UpdateFolder = serverRoot + '/Public/tools/IgniteDeskApp/dist/current/';

function *downloadDatas(_window, _config) {
	const id = dialog.showMessageBox(_window, {
		type: 'question',
		title: '更新',
		message: '下载程序需要的数据，之后重启程序。',
		cancelId: -1,
		buttons: ['确定']
	});
	if(id == 0) {
		const serverUrl = serverRoot + '/Public/tools/server/php/server.php?method=IgniteDeskAppUpdate';
		const updateFiles = JSON.parse(yield DownloadFilePromise(serverUrl));
		const total = updateFiles.length;
		_window.setProgressBar(0);
		for(let j = 0; j < total; j++) {
			let webFile = updateFiles[j];
			let localFile = path.resolve(__dirname, webFile.replace(UpdateFolder, ''));
			yield DownloadFilePromise(webFile, localFile);
			_window.setProgressBar((j + 1) / total);
		}
	}
	app.quit();
};

let isOnLine = false, timer;
app.on('ready', () => {
	let mainWindow = new BrowserWindow({width: 800, height: 600, fullscreen: true});
	mainWindow.loadURL('file://' + __dirname + '/online_status.html');
	timer = setInterval(() => {
		if(isOnLine) {
			co(downloadDatas(mainWindow));
			clearInterval(timer);
		}
	}, 1000);
});

ipcMain.on('online-status-changed', (event, status) => {
	isOnLine = status;
});