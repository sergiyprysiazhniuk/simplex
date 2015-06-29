var fs=require('fs');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();


app.use(bodyParser.json());       
app.use(bodyParser.urlencoded({     
  extended: true
})); 

app.get('/problems-list', function(req, res, next) {
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

app.post('/save', function(req, res, next) {
	fs.writeFileSync("app/data/tasks/" + Date.now() + ".json", req.body.data);
	res.statusCode = 200;
	res.end();
	next();
});

app.use(express.static('app'));

app.listen(3001);

console.log("Server started on port 3001");