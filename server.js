var fs = require('fs')
var express = require('express')
var tpb = require('thepiratebay')
var spawn   = require('child_process').spawn

var app = express()

app.get('/', function(req, res){
    fs.readFile('./index.html', function(error, content) {
        if (error) {
            res.writeHead(500)
            res.end()
        }
        else {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(content, 'utf-8')
        }
    })
})

app.get('/top_torrents', function(req, res){
    var search_cat = req.query.category

    search_cat = (search_cat && search_cat > 0) ? search_cat : null

    tpb.topTorrents(search_cat).then(function(results){
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(results), 'utf-8')
    }).catch(function(err){
        console.log(err)
    })
})

app.get('/search', function(req, res){
    var search_cat = req.query.category
    var search_term = req.query.term
    var sort_field = req.query.sortField
    var page = req.query.page

    tpb.search(search_term, {
        category: search_cat,
        orderBy: sort_field,
        page: page
    }).then(function(results){
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(results), 'utf-8')
    }).catch(function(err){
        console.log(err)
    })
})

app.get('/download_transmission', function(req, res) {
    var link = req.query.link
    console.log('Adding to transmission: ' + link)

    var command = spawn(__dirname + '/add_to_transmission.sh', [ link || '' ])
    var outputStr = ''
    var output  = []

    command.stdout.on('data', function(chunk) {
        output.push(chunk)
        outputStr = outputStr + chunk.toString()
    }) 

    command.on('close', function(code) {
    if (code === 0)
      res.send(outputStr)
    else
      res.send(500) 
    })
})

var port = 9090
app.listen(port.toString())
console.log('Server is Running on port: ' + port.toString())
exports = module.exports = app
