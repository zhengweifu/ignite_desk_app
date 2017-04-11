const { app, BrowserWindow, dialog } = require('electron');
const { DownloadFilePromise } = require('./common.js');
const co = require('./node_modules/co/index.js');
const path = require('path');
const serverRoot = 'http://www.ignjewelry.com';
const UpdateFolder = serverRoot + '/Public/tools/IgniteDeskApp/dist/current/';

app.on('ready', () => {
	let mainWindow = new BrowserWindow({width: 800, height: 600, fullscreen: false});
	co(function *() {
		const id = dialog.showMessageBox(mainWindow, {
			type: 'question',
			title: '更新',
			message: '下载程序需要的数据，之后重启程序。',
			buttons: ['确定']
		});
		if(id == 0) {
			const serverUrl = serverRoot + '/Public/tools/server/php/server.php?method=IgniteDeskAppUpdate';
			const updateFiles = JSON.parse(yield DownloadFilePromise(serverUrl));
			const total = updateFiles.length;
			mainWindow.setProgressBar(0);
			for(let j = 0; j < total; j++) {
				let webFile = updateFiles[j];
				let localFile = path.resolve(__dirname, webFile.replace(UpdateFolder, ''));
				yield DownloadFilePromise(webFile, localFile);
				mainWindow.setProgressBar((j + 1) / total);
			}
		}
		app.quit();
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

