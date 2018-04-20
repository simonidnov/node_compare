//import {machineId, machineIdSync} from 'node-machine-id';

var express = require('express'),
    auth = express.Router(),
    Auth_controller = require('../controllers/auth_controller'),
    Apps_controller = require('../controllers/apps_controller'),
    auth_helper = require('../helpers/auth_helper'),
    language_helper = require('../helpers/languages_helper'),
    uri_helper = require('../helpers/uri_helper'),
    lang = require('../public/languages/auth_lang'),
    machineId = require('node-machine-id'),
    device_uid = machineId.machineIdSync({original: true}),
    Fb = require('fb'),
    referer = null,
    current_app = null;

    auth.use(function(req, res, next){
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
        //SET OUTPUT FORMAT
        referer = getReferer(req);
        //res.setHeader('Content-Type', 'application/json');
        if(typeof req.query.secret !== "undefined"){
          //TODO GET APP FROM REFERER + SECRET THEN SET REDIRECT URL TO REFERER
          auth_helper.validate_origin({options:{secret:req.query.secret}}, req.get('origin'), function(e){
            if(!e){
              res.status(401).send({ message: "UNAUTHORISED SERVER", host:req.get('origin'), is_ok:""});
            }else{
              current_app = e;
              current_app.referer = referer;
            }
            next();
          });
        }else if(typeof req.query.app_id !== "undefined"){
          Apps_controller.get(req, {_id:req.query.app_id}, function(e){
            if(e.status === 200){
              current_app = e.datas[0];
              referer = current_app.redirect_url;
            }
            next();
          });
        }else{
          next();
        }
        //next();
    });
/* DEVICE UID IS UNIQ BY DEVICE, NOT BROWSER PERHAPS WE NEED TO IDENTIFY BROWSER UNIQ ID NOT SURE... */
/* GET home page. */
auth.get('/', function(req, res, next) {
        //req.query.device_uid = device_uid;
        //console.log('TRY FA facebook INIT API app id 143900369638121 SECRET 393fec1031105f7144748d3d569b7896');
        /*
        Fb.getLoginUrl({
          client_id: '143900369638121',
          scope: 'email,user_likes',
          redirect_uri: 'https://www.idkids-app.com/auth/facebook'
        });
        */
        /*
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
        */
        //console.log('req.query ::::::::::::::::::::::::::: ', req.query);
        //Auth_controller.get_user_from_device(req, res, function(users_device){
            Auth_controller.login(req, req.query, function(e){
                //Auth_controller.get_user_from_device("fingerprint", function(users_device){
                //    console.log("users_device >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  ", users_device);
                //});
                var datas = {
                    title: 'Mon compte',
                    datas: req.query,
                    locale:language_helper.getlocale(req),
                    lang:lang,
                    uri_params : uri_helper.get_params(req),
                    response:e,
                    referer:referer,
                    current_app:current_app,
                    js:[
                        '/public/javascripts/login.js',
                        '/public/javascripts/components/formular.js'
                    ],
                    css:[
                        '/public/stylesheets/components/formular.css',
                        '/public/stylesheets/auth.css',
                    ]
                };
                datas.user_session = req.session.Auth;

                if(typeof e.user !== "undefined"){
                    res.redirect(307, referer+'?idkids-token='+e.user.token+'&idkids-id='+e.user._id+'&idkids-device='+e.user.current_device);

                }else{
                  res.render('auth/login', datas);
                }
                delete current_app;
                current_app = null;
            });
        //});
    })
    .get('/facebook', function(req, res, next){
        var facebook_call = req;
        //req.get('origin');
        Auth_controller.login(req, req.query, function(e){
            //Auth_controller.get_user_from_device("fingerprint", function(users_device){
            //    console.log("users_device >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  ", users_device);
            //});
            var datas = {
                title: 'Mon compte',
                datas: req.query,
                locale:language_helper.getlocale(req),
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
                res.redirect(307, referer+'?idkids-token='+e.user.token+'&idkids-id='+e.user._id+'&idkids-device='+e.user.current_device);
            }else{
                res.render('auth/login', datas);
            }
        });
    })
    .get('/fingerprint/:device_uid', function(req, res, next) {
        //req.query.device_uid = device_uid;
        //req.get('origin');
        Auth_controller.get_user_from_device(req.params.device_uid, function(users_device){
            Auth_controller.login(req, req.query, function(e){
                //Auth_controller.get_user_from_device("fingerprint", function(users_device){
                //    console.log("users_device >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  ", users_device);
                //});
                var datas = {
                    title: 'Mon compte',
                    datas: req.query,
                    locale:language_helper.getlocale(req),
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
                    res.redirect(307, referer+'?idkids-token='+e.user.token+'&idkids-id='+e.user._id+'&idkids-device='+e.user.current_device);
                }else{
                    res.render('auth/login', datas);
                }
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
                res.redirect(307, referer+'?idkids-token='+e.user.token+'&idkids-id='+e.user._id+'&idkids-device='+e.user.current_device);
                //res.redirect(307, '/account/?idkids-token='+e.idkids_user.token+'&idkids-id='+e.idkids_user._id+'&idkids-device='+e.idkids_user.current_device);
            }else{
                var user_device = [];
                var datas = {
                    title: 'Mon compte',
                    datas: req.query,
                    locale:language_helper.getlocale(req),
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
            }
            delete current_app;
            current_app = null;
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
        //req.get('origin');
        Auth_controller.login(req, req.query, function(e){
            var datas = {
                title: 'Mon compte',
                datas: req.query,
                response:e,
                locale:language_helper.getlocale(req),
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
                res.redirect(307, referer+'?idkids-token='+e.idkids_user.datas.token+'&idkids-id='+e.idkids_user.datas._id+'&idkids-device='+e.idkids_user.datas.current_device+'&idkids-secret='+e.idkids_user.datas.secret);
            }
            res.render('auth/login', datas);
            delete current_app;
            current_app = null;
        });
    })
    .delete('/device', function(req, res, next){
        Auth_controller.delete_device(req, res, function(e){
            res.send(e);
        });
    })
    .get('/logout', function(req, res, next) {
        var user_id = req.session;
        Auth_controller.logout(req, res, function(err, data){
            var param = "?";
            if(req.headers.referer.indexOf('?') !== -1){
              param = "&";
            }
            res.redirect(307, req.headers.referer+param+"idkids-sdk-action=logout");
            //res.render('logout', { "title": "déconnexion", "referer":req.headers.referer });
            //res.render(req.headers.referer, { "title": "déconnexion", "referer":req.headers.referer, "idkids_sdk":"logout" });
        });
    })
    .get('/account', function(req, res, next) {
      res.render('account', { title: 'account auth page' });
    });

module.exports = auth;

function getReferer(req){
  var referer = req.headers.referer;
  if(typeof referer === "undefined" || referer.indexOf('/auth') !== -1){
    referer = "/account/account";
  }
  return referer;
}
