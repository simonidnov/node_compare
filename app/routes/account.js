var express = require('express'),
    _ = require('underscore'),
    account = express.Router(),
    Auth_model = require('../models/auth_model'),
    Auth_helper = require('../helpers/auth_helper'),
    language_helper = require('../helpers/languages_helper'),
    uri_helper = require('../helpers/uri_helper'),
    lang = require('../public/languages/auth_lang');

account.use(function(req, res, next){
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
account
    .get('/', function(req, res, next) {
        res.redirect(307, '/account/profile'+req.url.replace('/',''));
    })
    .get('/:page', function(req, res, next) {
        res.render('account', {
            title: 'User Account',
            user : req.session.Auth,
            locale:language_helper.getlocale(),
            lang:lang,
            page:req.params.page,
            js:[
                '/public/javascripts/account.js',
                '/node_modules/cropperjs/dist/cropper.min.js',
                '/public/javascripts/components/formular.js',
                '/node_modules/qrcode/build/qrcode.min.js'
            ], css:[
                '/public/stylesheets/account.css',
                '/node_modules/cropperjs/dist/cropper.min.css',
                '/public/stylesheets/components/formular.css'
            ]
        });
    })
    .get('/member/:member_id', function(req, res, next){
        res.render('account', {
            title: 'User Account',
            user : req.session.Auth,
            locale:language_helper.getlocale(),
            lang:lang,
            page:"member",
            member_infos:_.where(req.session.Auth.members, {_id:req.params.member_id})[0],
            js:[
                '/public/javascripts/account.js',
                '/node_modules/cropperjs/dist/cropper.min.js',
                '/public/javascripts/components/formular.js',
                '/node_modules/qrcode/build/qrcode.min.js'
            ], css:[
                '/public/stylesheets/account.css',
                '/node_modules/cropperjs/dist/cropper.min.css',
                '/public/stylesheets/components/formular.css'
            ]
        });
    })
    .get('/addresses/:address_id', function(req, res, next){
        res.render('account', {
            title: 'Edit address',
            user : req.session.Auth,
            locale:language_helper.getlocale(),
            lang:lang,
            page:"addresses",
            address_infos:_.where(req.session.Auth.address, {_id:req.params.address_id})[0],
            js:[
                '/public/javascripts/account.js',
                '/node_modules/cropperjs/dist/cropper.min.js',
                '/public/javascripts/components/formular.js',
                '/node_modules/qrcode/build/qrcode.min.js'
            ], css:[
                '/public/stylesheets/account.css',
                '/node_modules/cropperjs/dist/cropper.min.css',
                '/public/stylesheets/components/formular.css'
            ]
        });
    })
    .post('/profile', function(req, res, next) {
        Auth_model.update(req, req.session.Auth._id, req.body, function(e){
            if(e.status === 200){
                res.redirect(301, '/account/'+req.url.replace('/',''));
            }else{
                res.redirect(307, '/account/'+req.url.replace('/','')+"?error_message="+e.message);
            }
        });
    });

module.exports = account;
