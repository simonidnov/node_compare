var express = require('express'),
    crons = express.Router(),
    auth_helper = require('../helpers/auth_helper'),
    language_helper = require('../helpers/languages_helper'),
    Userproducts_model = require('../models/userproducts_model.js'),
    uri_helper = require('../helpers/uri_helper'),
    lang = require('../public/languages/auth_lang');

    crons.use(function(req, res, next){
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
        //res.setHeader('Content-type', 'audio/mp3');
        //SET OUTPUT FORMAT
        next();
    });
crons.get('/share_email_birth_of_the_day', function(req, res, next) {
  Userproducts_model.shares_of_the_day(req, res, function(e) {
    res.status(e.status).send(e);
  });
});

module.exports = crons;
