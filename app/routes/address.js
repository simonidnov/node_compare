var express = require('express'),
    _ = require('underscore'),
    address = express.Router(),
    Address_controller = require('../controllers/address_controller'),
    Auth_helper = require('../helpers/auth_helper'),
    language_helper = require('../helpers/languages_helper'),
    uri_helper = require('../helpers/uri_helper'),
    lang = require('../public/languages/auth_lang');

address.use(function(req, res, next){
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
            res.redirect(301, '/auth');
        }
    });
});
/* GET home page. */
address
    .get('/', function(req, res, next) {
        Address_controller.get(req, res, function(e){
            //res.status(e.status).send(e);
            res.redirect(301, '/account/addresses'+req.url.replace('/',''));
        });
    })
    .post('/', function(req, res, next) {
        Address_controller.create(req, res, function(e){
            //res.status(e.status).send(e);
            res.redirect(301, '/account/addresses'+req.url.replace('/',''));
        });
    })
    .put('/', function(req, res, next){
        Address_controller.update(req, res, function(e){
            //res.status(e.status).send(e);
            res.redirect(301, '/account/addresses'+req.url.replace('/',''));
        });
    })
    .delete('/', function(req, res, next) {
        console.log("DELETE ADDRESS");
        Address_controller.delete(req, function(e){
            res.status(e.status).send(e);
            //res.redirect(301, '/account/addresses'+req.url.replace('/',''));
        });
    });

module.exports = address;
