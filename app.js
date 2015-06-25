var fs=require('fs'),
	connect = require('connect'),
	serveStatic = require('serve-static');

var app = connect();

app.use('/problems-list', function(req, res, next) {
	var path = "app/data/tasks/",
		data = [];

	fs.readdir(path, function(err, files){
    	if (err) throw err;

    	files.forEach(function(file){
        	data.push(JSON.parse(fs.readFileSync(path + file, 'utf-8')));
        });

        res.end(JSON.stringify(data));
  		next();
	});
});

app.use(serveStatic(__dirname + '/app')).listen(3001);