var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var zlib = require('zlib');
var tpb = require('thepiratebay');
var fs = require('fs');
var app = express();
var sqlite = require('sqlite3').verbose();
var spawn   = require('child_process').spawn;

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
	    category: search_cat,
	    orderBy: '7'
	}).then(function(results){
	    res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify(results), 'utf-8');
	}).catch(function(err){
	    console.log(err);
	});
});

app.get('/download_transmission', function(req, res) {
	var link = req.param("link");
	console.log('Adding to transmission: ' + link);

	var command = spawn(__dirname + '/add_to_transmission.sh', [ link || '' ]);
	var output  = [];

	command.stdout.on('data', function(chunk) {
		output.push(chunk);
	}); 

	command.on('close', function(code) {
	if (code === 0)
	  res.send(Buffer.concat(output));
	else
	  res.send(500); // when the script fails, generate a Server Error HTTP response
	});


});

/*
app.get('/scrape', function(req, res){	
	var pagesToScrape = 2500;
	var category_id = '200'; // category id for video

	var db = new sqlite.Database('tbp.sqlite', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE, function() {
		//db.serialize(function() {
		  db.run("CREATE TABLE IF NOT EXISTS torrents (name TEXT, uploadDate TEXT, size TEXT, seeders TEXT, leechers TEXT, link TEXT, magnetLink TEXT, torrentLink TEXT, categoryId TEXT, subcategoryId TEXT)");
		  //db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
		  //    console.log(row.id + ": " + row.info);
		  //});
			console.log('Database is open');
		//});

		for (var i=0; i < pagesToScrape; i++)
			scrapePage(i);

	function scrapePage(pageNum) {
		if (pageNum >= pagesToScrape)
		{
			console.log('Database is closing');
			db.close();
			return;
		}

		var baseUrl = 'https://thepiratebay.se';
		var url = baseUrl + '/browse/200/' + pageNum.toString() + '/3';

		request(url, function (error, response, html) {
			if (!error && response.statusCode == 200) {
				var $ = cheerio.load(html);

				console.log('On Page: ' + pageNum.toString());
				
				//var stmt = db.prepare("INSERT INTO torrents (name, uploadDate, size, seeders, leechers, link, magnetLink, torrentLink, categoryId, subcategoryId) VALUES (?,?,?,?,?,?,?,?,?,?)");	
				$('table#searchResult tr:has(a.detLink)').each(function(i, element) {
				    var tname = $(this).find('a.detLink').text()
				    var uploadDate = $(this).find('font').text().match(/Uploaded\s(?:<b>)?(.+?)(?:<\/b>)?,/)[1]
				    var size = $(this).find('font').text().match(/Size (.+?),/)[1]
				    var seeders = $(this).find('td[align="right"]').first().text()
				    var leechers = $(this).find('td[align="right"]').next().text()
				    var link = baseUrl + $(this).find('div.detName a').attr('href')
				    var magnetLink = $(this).find('a[title="Download this torrent using magnet"]').attr('href')
				    var torrentLink = $(this).find('a[title="Download this torrent"]').attr('href')
				    var category = {
				      id: $(this).find('center a').first().attr('href').match(/\/browse\/(\d+)/)[1],
				      cname: $(this).find('center a').first().text()
				  	}
				    var subcategory = {
				      id: $(this).find('center a').last().attr('href').match(/\/browse\/(\d+)/)[1],
				      sname: $(this).find('center a').last().text()
				    }

				    db.run("INSERT INTO torrents (name, uploadDate, size, seeders, leechers, link, magnetLink, torrentLink, categoryId, subcategoryId) VALUES (?,?,?,?,?,?,?,?,?,?)", [ tname, uploadDate, size, seeders, leechers, link, magnetLink, torrentLink, category.id, subcategory.id ], function(error) {
				    	if (error)
				    		console.log('An error has occurred:' + error);
				    });	

					//scrapeNextPage();
				});
			} else {
				console.log(error);
			}
		});
	}

	});

});
*/


var port = 8081;
app.listen(port.toString());
console.log('Server is Running on port: ' + port.toString());
exports = module.exports = app;