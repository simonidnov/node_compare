var express = require('express'),
    _ = require('underscore'),
    config = require('../config/config'),
    account = express.Router(),
    Auth_model = require('../models/auth_model'),
    Auth_helper = require('../helpers/auth_helper'),
    Basket_controller = require('../controllers/basket_controller'),
    language_helper = require('../helpers/languages_helper'),
    uri_helper = require('../helpers/uri_helper'),
    lang = require('../public/languages/auth_lang'),
    Fb = require('fb');

account.use(function(req, res, next){
    //ACCEPT CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    //SET OUTPUT FORMAT
    //res.setHeader('Content-Type', 'application/json');

    var dataCheck = req.query;
    if(req.method === "PUT" || req.method === "POST" || req.method === "DELETE"){
        dataCheck = req.body;
    }
    //SET OUTPUT FORMAT
    //res.setHeader('Content-Type', 'application/json');
    // TODO : VALIDATE SESSION USER
    //res.setHeader('Content-Type', 'application/json');
    Auth_helper.validate_session(req, function(e){
        /* TODO SEND ORIGIN FOR RESIRECTION AFTER CHECKING */
        if(e.status === 200){
            next();
        }else{
            res.redirect(301, '/checking_session');
        }
    });
});
account
    .get('/', function(req, res, next) {
        res.redirect(307, '/account/profile'+req.url.replace('/',''));
    })
    .get('/:page', function(req, res, next) {
        Basket_controller.get(req, res, function(e){
            baskets = e.datas;
            res.render('account', {
                title : 'User Account',
                user  : req.session.Auth,
                locale: language_helper.getlocale(req),
                lang  : lang,
                page  : req.params.page,
                basket : baskets,
                _:_,
                js:[
                    '/public/javascripts/account.js',
                    '/node_modules/cropperjs/dist/cropper.min.js',
                    '/public/javascripts/components/formular.js',
                    '/node_modules/qrcode/build/qrcode.min.js',
                    'https://maps.googleapis.com/maps/api/js?key='+config.google.map
                ], css:[
                    '/public/stylesheets/account.css',
                    '/public/stylesheets/ui.css',
                    '/node_modules/cropperjs/dist/cropper.min.css',
                    '/public/stylesheets/components/formular.css'
                ]
            });
            res.end();
        });
    })
    .get('/member/:member_id', function(req, res, next){
        Basket_controller.get(req, res, function(e){
            baskets = e.datas;
            res.render('account', {
                title: 'User Account',
                user : req.session.Auth,
                locale:language_helper.getlocale(req),
                lang:lang,
                page:"member",
                basket : baskets,
                member_infos:_.where(req.session.Auth.members, {_id:req.params.member_id})[0],
                _:_,
                js:[
                    '/public/javascripts/account.js',
                    '/node_modules/cropperjs/dist/cropper.min.js',
                    '/public/javascripts/components/formular.js',
                    '/node_modules/qrcode/build/qrcode.min.js',
                    'https://maps.googleapis.com/maps/api/js?key='+config.google.map
                ], css:[
                    '/public/stylesheets/account.css',
                    '/public/stylesheets/ui.css',
                    '/node_modules/cropperjs/dist/cropper.min.css',
                    '/public/stylesheets/components/formular.css'
                ]
            });
            res.end();
        });
    })
    .get('/addresses/:address_id', function(req, res, next){
        Basket_controller.get(req, res, function(e){
            baskets = e.datas;
            res.render('account', {
                title: 'Edit address',
                user : req.session.Auth,
                locale:language_helper.getlocale(req),
                lang:lang,
                page:"addresses",
                basket : baskets,
                address_infos:_.where(req.session.Auth.address, {_id:req.params.address_id})[0],
                _:_,
                js:[
                    '/public/javascripts/account.js',
                    '/node_modules/cropperjs/dist/cropper.min.js',
                    '/public/javascripts/components/formular.js',
                    '/node_modules/qrcode/build/qrcode.min.js',
                    'https://maps.googleapis.com/maps/api/js?key='+config.google.map
                ], css:[
                    '/public/stylesheets/account.css',
                    '/public/stylesheets/ui.css',
                    '/node_modules/cropperjs/dist/cropper.min.css',
                    '/public/stylesheets/components/formular.css'
                ]
            });
            res.end();
        });
    })
    .post('/profile', function(req, res, next) {
        Auth_model.update(req, req.session.Auth._id, req.body, function(e){
            if(e.status === 200){
                res.redirect(200, e.datas);
                res.end();
            }else{
                res.redirect(307, '/account/'+req.url.replace('/','')+"?error_message="+e.message);
                res.end();
            }
        });
    })
    .put('/profile', function(req, res, next) {
        Auth_model.update(req, req.session.Auth._id, req.body, function(e){
            if(e.status === 200){
                res.status(e.status).send(e.datas);
                res.end();
            }else{
                res.status(e.status).send('/account/'+req.url.replace('/','')+"?error_message="+e.message);
                res.end();
            }
        });
    });

module.exports = account;
