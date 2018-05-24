var express = require('express'),
    download = express.Router(),
    fs = require('fs'),
    path = require('path'),
    mime = require('mime'),
    auth_helper = require('../helpers/auth_helper'),
    language_helper = require('../helpers/languages_helper'),
    uri_helper = require('../helpers/uri_helper'),
    lang = require('../public/languages/auth_lang');

    download.use(function(req, res, next){
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
        //res.setHeader('Content-type', 'audio/mp3');
        //SET OUTPUT FORMAT
        next();
    });
download.get('/', function(req, res, next) {
  //res.setHeader('Content-disposition', 'attachment; filename=ma_chanson_personnalisee.mp3');
  var file =  __dirname + "/../" +req.query.file;
  res.download(file, 'ma_chanson_personnalisee.mp3');
});

module.exports = download;
