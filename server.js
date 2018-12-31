'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dns = require("dns");
var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI, { useNewUrlParser: true });
var urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
});
var Url = mongoose.model('Url', urlSchema);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.post("/api/shorturl/new", (req, res) => {
  let url = req.body.url;
  dns.lookup(url.replace("https://","").replace("http://",""), (err, address, family) => {
    if (err)
      res.json({"error":"invalid URL"});
    else
      Url.estimatedDocumentCount().then(count =>{
        let shortUrl = { "original_url": req.body.url,
                       "short_url": count + 1 };
        let shortUrldb = new Url(shortUrl);
        shortUrldb.save();
        res.json(shortUrl);
      });
  })
});

app.get("/api/shorturl/:shorturl", (req, res) => {
  let shortUrl = req.params.shorturl;
  Url.findOne({"short_url": shortUrl},(err, url) => {
    if (err) ;
    else
      res.redirect(url.original_url);
  });

});

app.listen(port, function () {
  console.log('Node.js listening ...');
});