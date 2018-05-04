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
          auth_helper.validate_origin({options:{secret:req.query.secret, host:referer}}, req.get('origin'), function(e){
            if(!e){
              res.redirect(307, req.get('origin')+"/auth?message=UNAUTHORISED_SERVER");
            }else{

              current_app = e;
              referer = current_app.redirect_url;
              //current_app.referer = referer;
              next();
            }
          });
        }else if(typeof req.query.app_id !== "undefined"){
          Apps_controller.get(req, {_id:req.query.app_id}, function(e){
            if(e.status === 200){
              current_app = e.datas[0];
              referer = current_app.redirect_url;
              next();
            }else{
              res.redirect(307, req.get('origin')+"/auth?message=UNAUTHORISED_SERVER");
            }
          });
        }else if(typeof req.body.app_id !== "undefined"){
          Apps_controller.get(req, {_id:req.body.app_id}, function(e){
            if(e.status === 200){
              if(e.datas.length > 0){
                current_app = e.datas[0];
                referer = current_app.redirect_url;
              }
              next();
            }else{
              res.redirect(307, req.get('origin')+"/auth?message=UNAUTHORISED_SERVER");
            }
          });
        }else{
          next();
        }
        console.log("req.body ");
        //next();
    });
/* DEVICE UID IS UNIQ BY DEVICE, NOT BROWSER PERHAPS WE NEED TO IDENTIFY BROWSER UNIQ ID NOT SURE... */
/* GET home page. */
auth.get('/', function(req, res, next) {
        //req.query.device_uid = device_uid;
        /*
        Fb.getLoginUrl({
          client_id: '143900369638121',
          scope: 'email,user_likes',
          redirect_uri: app.locals.settings.host+'/auth/facebook'
        });
        */
        /*
        Fb.api('oauth/access_token', {
            client_id: '143900369638121',
            client_secret: '393fec1031105f7144748d3d569b7896',
            scope: 'email,user_likes',
            redirect_uri: app.locals.settings.host+'/auth/facebook',
            code: 'code'
        }, function (res) {
            if(!res || res.error) {
                return;
            }
            var accessToken = res.access_token;
            var expires = res.expires ? res.expires : 0;
        });
        */
        //Auth_controller.get_user_from_device(req, res, function(users_device){
            Auth_controller.login(req, req.query, function(e){
                //Auth_controller.get_user_from_device("fingerprint", function(users_device){
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

                console.log('current_app  ::::::::::: ', current_app);
                console.log('referer  ::::::::::: ', referer);

                if(typeof e.user !== "undefined"){
                    res.redirect(307, referer+'?idkids-token='+e.user.token+'&idkids-id='+e.user._id+'&idkids-device='+e.user.current_device);
                    res.end();
                }else{
                  res.render('auth/login', datas);
                  res.end();
                }
                delete current_app;
                current_app = null;
            });
        //});
    })
    .post('/login', function(req, res, next) {
        Auth_controller.register(req, function(e){
            if(typeof e.user !== "undefined"){
                console.log('LOGIN current_app  ::::::::::: ', current_app);
                console.log('LOGIN referer  ::::::::::: ', referer);

                res.redirect(307, referer+'?idkids-token='+e.user.token+'&idkids-id='+e.user._id);
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
                res.end();
            }
            delete current_app;
            current_app = null;
        });
    })
    .get(['/update_password', '/update_password/:email/:validation_code'], function(req, res, next){
        res.render('auth/update_password',
          {
            email:req.params.email,
            validation_code:req.params.validation_code,
            locale:language_helper.getlocale(req),
            lang:lang,
            uri_params : uri_helper.get_params(req),
            js:[
                '/public/javascripts/lost_password.js',
                '/public/javascripts/components/formular.js'
            ], css:[
                '/public/stylesheets/components/formular.css',
                '/public/stylesheets/auth.css',
            ]
          }
        );
        res.end();
    })
    .post('/update_password', function(req, res, next){
        Auth_controller.validCode(req.body, function(e){
          if(e.status === 200){
            next();
          }else{
            res.status(e.status).send(e);
            res.end();
          }
        });
    }, function(req, res, next){
        if(typeof req.body.password === "undefined" || typeof req.body.retype_password === "undefined"){
            res.status(304).send({message:"NEED_PASSWORD"});
            res.end();
        }
        if(req.body.password !== req.body.retype_password){
            res.status(304).send({message:"NEED_SAME_PASSWORD"});
            res.end();
        }
        Auth_controller.update_password({email:req.body.email, password:req.body.password}, res, function(e){
            res.redirect(307, "/auth?message="+e.message);
        });
    })
    .post('/lost_password', function(req, res, next){
        Auth_controller.lost_password(req, res, function(e){
          res.status(e.status).send(e);
        });
    })
    .put('/login', function(req, res, next) {
        Auth_controller.update(req, res, function(){
            res.send('login put params');
            res.end();
        });
    })
    .delete('/login', function(req, res, next) {
        Auth_controller.unregister(req, res, function(){
            res.send('login delete params');
            res.end();
        });
    })
    .get('/logout', function(req, res, next) {
        var user_id = req.session;
        Auth_controller.logout(req, res, function(e){

            var param = "?";
            if(typeof req.headers.referer === "undefined" || req.headers.referer.indexOf('/account') !== -1){
              res.redirect(307, "/auth?idkids-sdk-action=logout");
              //res.end();
            }else{
              if(req.headers.referer.indexOf('?') !== -1){
                param = "&";
              }

              res.redirect(307, req.headers.referer+param+"idkids-sdk-action=logout");
              //res.end();
            }
            res.end();
            //res.send(e);
            //res.render('logout', { "title": "déconnexion", "referer":req.headers.referer });
            //res.render(req.headers.referer, { "title": "déconnexion", "referer":req.headers.referer, "idkids_sdk":"logout" });
        });
    })
    .get(['/:form_name', '/:form_name/*'], function(req, res, next) {
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
                form:req.params.form_name.replace('_form', ''),
                form_name:req.params.form_name,
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
                res.end();
            }else{
              res.render('auth/login', datas);
              res.end();
            }
            delete current_app;
            current_app = null;
        });
    })
    .delete('/device', function(req, res, next){
        Auth_controller.delete_device(req, res, function(e){
            res.send(e);
            res.end();
        });
    })
    .get('/facebook', function(req, res, next){
        var facebook_call = req;
        //req.get('origin');
        Auth_controller.login(req, req.query, function(e){
            //Auth_controller.get_user_from_device("fingerprint", function(users_device){
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
                res.end();
            }else{
                res.render('auth/login', datas);
                res.end();
            }
        });
    })
    .get('/fingerprint/:device_uid', function(req, res, next) {
        //req.query.device_uid = device_uid;
        //req.get('origin');
        Auth_controller.get_user_from_device(req.params.device_uid, function(users_device){
            Auth_controller.login(req, req.query, function(e){
                //Auth_controller.get_user_from_device("fingerprint", function(users_device){
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
                    res.end();
                }else{
                    res.render('auth/login', datas);
                    res.end();
                }
            });
        });
    })
    .get('/google/callback', function(req, res, next){

    })
    .get('/facebook/callback', function(req, res, next){

    })
    .get('/twitter/callback', function(req, res, next){

    });

module.exports = auth;

function getReferer(req){
  var referer = req.headers.referer;
  if(typeof referer === "undefined" || referer.indexOf('/auth') !== -1){
    referer = "/account";
  }
  return referer;
}
