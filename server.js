var express = require('express');
var tpb = require('thepiratebay');
var fs = require('fs');
var app     = express();

app.get('/', function(req, res){
	fs.readFile('./index.html', function(error, content) {
		if (error) {
			res.writeHead(500);
			res.end();
		}
		else {
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end(content, 'utf-8');
		}
	});
});

app.get('/search', function(req, res){
	var search_cat = req.param("category");
	var search_term = req.param("term");

	tpb.search(search_term, {
	    category: search_cat
	}).then(function(results){
	    res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify(results), 'utf-8');
	}).catch(function(err){
	    console.log(err);
	});
});

var port = 8081;
app.listen(port.toString());
console.log('Server is Running on port: ' + port.toString());
exports = module.exports = app;