const fs = require('fs');
const path = require('path');
const http = require('http');

exports = module.exports = {
	GetConfig: function() {
		let data = fs.readFileSync(path.resolve(__dirname, 'config.json'), 'utf8');
		return JSON.parse(data.toString('utf8'));
	},

	DownloadFile: function(url, dest, callback) {
		let request = http.get(url, response => {
			if(dest) {
				let file = fs.createWriteStream(dest);
				response.pipe(file);
				file.on('end', () => {
					file.end();
				});

				file.on('finish', () => {
					callback();
				});
			} else  {
				let rawData = '';
				response.on('data', chunk => {
					rawData += chunk;
				});
				response.on('end', () => {
					callback(rawData);
				});
			}	
		}).on('error', err => {
			if(dest) {
				fs.unlink(dest);
			}
			if (callback) callback(err.message);
		});
	},

	DownloadFilePromise: function(url, dest) {
		return new Promise((resolve, reject) => {
			exports.DownloadFile(url, dest, (data) => {
				resolve(data);
			});
	    });
	}
}