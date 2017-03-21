const fs = require('fs');
const path = require('path');

exports = module.exports = {
	GetConfig: function() {
		let data = fs.readFileSync(path.resolve(__dirname, 'config.json'), 'utf8');
		return JSON.parse(data.toString('utf8'));
	}
}