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
            res.redirect(307, '/account/addresses'+req.url.replace('/',''));
        });*/
        switch(redirect_lang){
          case 'fr':
            res.redirect(307, 'http://www.okaidi.fr/disneynature/');
            break;
          case 'nl':
            res.redirect(307, 'https://nl.okaidi.be/dinseynature/');
            break;
          case 'it':
            res.redirect(307, 'https://www.okaidi.it/disneynature/');
            break;
          case 'es':
            res.redirect(307, 'https://www.okaidi.es/disneynature');
            break;
          case 'de':
            res.redirect(307, 'https://www.okaidi.de/disneynature/');
            break;
          case 'pl':
            res.redirect(307, 'https://www.okaidi.pl/disneynature/');
            break;
          case 'ca':
            res.redirect(307, 'https://ca.okaidi.es/disneynature');
            break;
          case 'ch':
            res.redirect(307, 'https://fr.okaidi.ch/disneynature/');
            break;
          default:
            res.redirect(307, 'http://www.okaidi.fr/disneynature/');
            break;
        }
        //res.redirect(307, 'https://www.okaidi.fr/jeu-planet-challenge/');
    })
    .get('/:url', function(req, res, next) {
        var redirect_lang = req.headers["accept-language"].split('-')[0];
        switch(redirect_lang){
          case 'fr':
            res.redirect(307, 'http://www.okaidi.fr/disneynature/');
            break;
          case 'nl':
            res.redirect(307, 'https://nl.okaidi.be/dinseynature/');
            break;
          case 'it':
            res.redirect(307, 'https://www.okaidi.it/disneynature/');
            break;
          case 'es':
            res.redirect(307, 'https://www.okaidi.es/disneynature');
            break;
          case 'de':
            res.redirect(307, 'https://www.okaidi.de/disneynature/');
            break;
          case 'pl':
            res.redirect(307, 'https://www.okaidi.pl/disneynature/');
            break;
          case 'ca':
            res.redirect(307, 'https://ca.okaidi.es/disneynature');
            break;
          case 'ch':
            res.redirect(307, 'https://fr.okaidi.ch/disneynature/');
            break;
          default:
            res.redirect(307, 'http://www.okaidi.fr/disneynature/');
            break;
        }
        /*switch(req.params.adress){
          case "planet_chellenge_surfrider":
            res.redirect(307, 'https://www.okaidi.fr/jeu-planet-challenge/');
            break;
          case "planet_chellenge":
            res.redirect(307, 'https://www.okaidi.fr/jeu-planet-challenge/');
            break;
          default:
            res.redirect(307, 'https://www.okaidi.fr/jeu-planet-challenge/');
            break;
        }*/
        /*Address_controller.get(req, res, function(e){
            //res.status(e.status).send(e);
            res.redirect(307, '/account/addresses'+req.url.replace('/',''));
        });*/
    });

module.exports = redirect;
