var express = require('express'),
    _ = require('underscore'),
    redirect = express.Router(),
    language_helper = require('../helpers/languages_helper'),
    uri_helper = require('../helpers/uri_helper'),
    lang = require('../public/languages/auth_lang');

redirect.use(function(req, res, next){
    //ACCEPT CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    //SET OUTPUT FORMAT
    //res.setHeader('Content-Type', 'application/json');
    // TODO : VALIDATE SESSION USER
    next();
});
/* GET home page. */
redirect
    .get('/', function(req, res, next) {
        /*Address_controller.get(req, res, function(e){
            //res.status(e.status).send(e);
            res.redirect(301, '/account/addresses'+req.url.replace('/',''));
        });*/
        res.redirect(301, 'https://www.okaidi.fr');
    })
    .get('/:adress', function(req, res, next) {
        switch(req.params.page){
          case "planet_chellenge_surfrider":
            res.redirect(301, 'https://www.okaidi.fr/jeu-planet-challenge/');
            break;
          case "planet_chellenge":
            res.redirect(301, 'https://www.okaidi.com');
            break;
          default:
            res.redirect(301, 'https://www.okaidi.com');
            break;
        }
        /*Address_controller.get(req, res, function(e){
            //res.status(e.status).send(e);
            res.redirect(301, '/account/addresses'+req.url.replace('/',''));
        });*/
    });

module.exports = redirect;
