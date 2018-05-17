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
            res.redirect(307, '/auth');
        }
    });
});
/* GET home page. */
// TODO RES SEND ON PUT POST DELETE NO REDIRECT ALLOWED
address
    .get('/', function(req, res, next) {
        Address_controller.get(req, res, function(e){
            res.redirect(307, '/account/addresses'+req.url.replace('/',''));
        });
    })
    .post('/', function(req, res, next) {
        console.log('ADD ADDRESS');
        if(typeof req.body.data !== "undefined"){
          req.body = req.body.data;
        }
        console.log('ADD ADDRESS ', req.body);
        Address_controller.create(req, res, function(e){
          console.log('CREATED ? ', e);
            res.status(e.status).send(Auth_helper.addParams(e, req));
            //res.redirect(307, '/account/addresses'+req.url.replace('/',''));
        });
    })
    .put('/', function(req, res, next){
        if(typeof req.body.data !== "undefined"){
          req.body = req.body.data;
        }
        Address_controller.update(req, res, function(e){
          res.status(e.status).send(Auth_helper.addParams(e, req));
          //res.redirect(307, '/account/addresses'+req.url.replace('/',''));
      });
    })
    .delete('/', function(req, res, next) {
        if(typeof req.body.data !== "undefined"){
          req.body = req.body.data;
        }
        Address_controller.delete(req, function(e){
          res.status(e.status).send(Auth_helper.addParams(e, req));
          //res.redirect(307, '/account/addresses'+req.url.replace('/',''));
        });
    });

module.exports = address;
