var express = require('express'),
    settings = express.Router(),
    Settings_model = require('../models/settings_model'),
    Auth_helper = require('../helpers/auth_helper'),
    language_helper = require('../helpers/languages_helper'),
    uri_helper = require('../helpers/uri_helper'),
    lang = require('../public/languages/auth_lang');

settings.use(function(req, res, next){
    //ACCEPT CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    //SET OUTPUT FORMAT
    //res.setHeader('Content-Type', 'application/json');
    // TODO : VALIDATE SESSION USER
    Auth_helper.validate_session(req, function(e){
        if(e.status === 200){
            next();
        }else{
            res.redirect(307, '/auth');
        }
    });
});
/* GET home page. */
settings
    .get('/', function(req, res, next) {
        Settings_model.get(req, res, function(e){
            res.status(e.status).send(e);
        });
    })
    .put('/', function(req, res, next) {
        //res.status(200).send(req.body);
        //TODO CHECK ID ADMIN MODE
        Settings_model.update(req, req.body, function(e){
            res.status(e.status).send(e);
            //res.redirect(307, '/account/addresses'+req.url.replace('/',''));
        });
    });

module.exports = settings;
