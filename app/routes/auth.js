//import {machineId, machineIdSync} from 'node-machine-id';

var express = require('express'),
    auth = express.Router(),
    Auth_controller = require('../controllers/auth_controller'),
    language_helper = require('../helpers/languages_helper'),
    uri_helper = require('../helpers/uri_helper'),
    lang = require('../public/languages/auth_lang'),
    machineId = require('node-machine-id'),
    device_uid = machineId.machineIdSync({original: true}),
    Fb = require('fb');

/* DEVICE UID IS UNIQ BY DEVICE, NOT BROWSER PERHAPS WE NEED TO IDENTIFY BROWSER UNIQ ID NOT SURE... */
/* GET home page. */
auth.get('/', function(req, res, next) {
        //req.query.device_uid = device_uid;
        console.log('TRY FA facebook INIT API app id 143900369638121 SECRET 393fec1031105f7144748d3d569b7896');
        /*
        Fb.getLoginUrl({
          client_id: '143900369638121',
          scope: 'email,user_likes',
          redirect_uri: 'https://www.idkids-app.com/auth/facebook'
        });
        */
        Fb.api('oauth/access_token', {
            client_id: '143900369638121',
            client_secret: '393fec1031105f7144748d3d569b7896',
            scope: 'email,user_likes',
            redirect_uri: 'https://www.idkids-app.com/auth/facebook',
            code: 'code'
        }, function (res) {
            if(!res || res.error) {
                console.log(!res ? 'error occurred' : res.error);
                return;
            }
            var accessToken = res.access_token;
            var expires = res.expires ? res.expires : 0;
        });

        //Auth_controller.get_user_from_device(req, res, function(users_device){
            Auth_controller.login(req, req.query, function(e){
                //Auth_controller.get_user_from_device("fingerprint", function(users_device){
                //    console.log("users_device >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  ", users_device);
                //});
                var datas = {
                    title: 'Mon compte',
                    datas: req.query,
                    locale:language_helper.getlocale(),
                    lang:lang,
                    uri_params : uri_helper.get_params(req),
                    response:e,
                    js:[
                        '/public/javascripts/login.js',
                        '/public/javascripts/components/formular.js'
                    ], css:[
                        '/public/stylesheets/components/formular.css',
                        '/public/stylesheets/auth.css',
                    ]
                };
                datas.user_session = req.session.Auth;
                if(typeof e.user !== "undefined"){
                    res.redirect(307, '/account?idkids-token='+e.user.token+'&idkids-id='+e.user._id+'&idkids-device='+e.user.current_device);
                }
                res.render('auth/login', datas);
            });
        //});
    })
    .get('/facebook', function(req, res, next){
        console.log('//////////////////');
        console.log('//////////////////');
        console.log('//////////////////');
        console.log('//////////////////');
        console.log(req, res, next);
        console.log('//////////////////');
        console.log('//////////////////');
        console.log('//////////////////');
        console.log('//////////////////');
        var facebook_call = req;
        Auth_controller.login(req, req.query, function(e){
            //Auth_controller.get_user_from_device("fingerprint", function(users_device){
            //    console.log("users_device >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  ", users_device);
            //});
            var datas = {
                title: 'Mon compte',
                datas: req.query,
                locale:language_helper.getlocale(),
                lang:lang,
                uri_params : uri_helper.get_params(req),
                response:e,
                facebook_call: facebook_call,
                js:[
                    '/public/javascripts/login.js',
                    '/public/javascripts/components/formular.js'
                ], css:[
                    '/public/stylesheets/components/formular.css',
                    '/public/stylesheets/auth.css',
                ]
            };
            datas.user_session = req.session.Auth;
            if(typeof e.user !== "undefined"){
                res.redirect(307, '/account?idkids-token='+e.user.token+'&idkids-id='+e.user._id+'&idkids-device='+e.user.current_device);
            }
            res.render('auth/login', datas);
        });
    })
    .get('/fingerprint/:device_uid', function(req, res, next) {
        //req.query.device_uid = device_uid;

        Auth_controller.get_user_from_device(req.params.device_uid, function(users_device){
            Auth_controller.login(req, req.query, function(e){
                //Auth_controller.get_user_from_device("fingerprint", function(users_device){
                //    console.log("users_device >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  ", users_device);
                //});
                var datas = {
                    title: 'Mon compte',
                    datas: req.query,
                    locale:language_helper.getlocale(),
                    lang:lang,
                    uri_params : uri_helper.get_params(req),
                    users_device:users_device.users_device,
                    response:e,
                    js:[
                        '/public/javascripts/login.js',
                        '/public/javascripts/components/formular.js'
                    ], css:[
                        '/public/stylesheets/components/formular.css',
                        '/public/stylesheets/auth.css',
                    ]
                };
                datas.user_session = req.session.Auth;
                if(typeof e.user !== "undefined"){
                    res.redirect(307, '/account?idkids-token='+e.user.token+'&idkids-id='+e.user._id+'&idkids-device='+e.user.current_device);
                }
                res.render('auth/login', datas);
            });
        });
    })
    .get('/google/callback', function(req, res, next){

    })
    .get('/facebook/callback', function(req, res, next){

    })
    .get('/twitter/callback', function(req, res, next){

    })
    .post('/login', function(req, res, next) {

        Auth_controller.register(req, function(e){
            if(typeof e.user !== "undefined"){
                res.redirect(307, '/account/?idkids-token='+e.user.token+'&idkids-id='+e.user._id+'&idkids-device='+e.user.current_device);
            }
            var user_device = [];
            var datas = {
                title: 'Mon compte',
                datas: req.query,
                locale:language_helper.getlocale(),
                lang:lang,
                uri_params : uri_helper.get_params(req),
                response:e,
                js:[
                    '/public/javascripts/login.js',
                    '/public/javascripts/components/formular.js'
                ], css:[
                    '/public/stylesheets/components/formular.css',
                    '/public/stylesheets/auth.css',
                ]
            };
            res.render('auth/login', datas);
        });
    })
    .put('/login', function(req, res, next) {

        Auth_controller.update(req, res, function(){
            res.send('login put params');
        });
    })
    .delete('/login', function(req, res, next) {
        Auth_controller.unregister(req, res, function(){
            res.send('login delete params');
        });
    })
    .get('/:form_name/*', function(req, res, next) {
        //req.query.device_uid = device_uid;
        Auth_controller.login(req, req.query, function(e){
            var datas = {
                title: 'Mon compte',
                datas: req.query,
                response:e,
                locale:language_helper.getlocale(),
                lang:lang,
                uri_params:uri_helper.get_params(req),
                form:req.params.form_name,
                js:[
                    '/public/javascripts/login.js',
                    '/public/javascripts/components/formular.js'
                ], css:[
                    '/public/stylesheets/components/formular.css',
                    '/public/stylesheets/auth.css',
                ]
            };
            if(typeof e.idkids_user !== "undefined"){
                res.redirect(307, '/account?idkids-token='+e.idkids_user.datas.token+'&idkids-id='+e.idkids_user.datas._id+'&idkids-device='+e.idkids_user.datas.current_device+'&idkids-secret='+e.idkids_user.datas.secret);
            }
            res.render('auth/login', datas);
        });
    })
    .delete('/device', function(req, res, next){
        Auth_controller.delete_device(req, res, function(e){
            res.send(e);
        });
    })
    .get('/logout', function(req, res, next) {
        Auth_controller.logout(req, res, function(err, data){
            res.redirect(307, req.headers.referer);
            //res.render(req.headers.referer, { title: 'logout auth page' });
        });
    })
    .get('/account', function(req, res, next) {
      res.render('account', { title: 'account auth page' });
    });

module.exports = auth;
