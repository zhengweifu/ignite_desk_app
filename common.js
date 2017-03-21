const fs = require('fs');

exports = module.exports = {
	GetConfig: function() {
		let data = fs.readFileSync('./config.json', 'utf8');
		return JSON.parse(data.toString('utf8'));
	}
}