var connect = require('connect'),
	serveStatic = require('serve-static');

connect().use(serveStatic(__dirname + '/app')).listen(3001);