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
    current_app = null,
    config = require('../config/config'),
    passport = require('passport'),
    OIDCStrategy = require('passport-azure-ad').OIDCStrategy;

    /*passport.use(new OIDCStrategy({
        callbackURL: config.azure.returnURL,
        realm: config.azure.realm,
        clientID: config.azure.clientID,
        clientSecret: config.azure.clientSecret,
        oidcIssuer: config.azure.issuer,
        identityMetadata: config.azure.identityMetadata,
        skipUserProfile: config.azure.skipUserProfile,
        responseType: config.azure.responseType,
        responseMode: config.azure.responseMode
    },
    function(iss, sub, profile, accessToken, refreshToken, done) {
        if (!profile.email) {
          return done(new Error("No email found"), null);
        }
        // asynchronous verification, for effect...
        process.nextTick(function () {
        findByEmail(profile.email, function(err, user) {
          if (err) {
            return done(err);
          }
          if (!user) {
            // "Auto-registration"
            users.push(profile);
            return done(null, profile);
          }
          return done(null, user);
        });
      });
    }
    ));
    */

    auth.use(function(req, res, next){
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
        //SET OUTPUT FORMAT
        referer = getReferer(req);
        //res.setHeader('Content-Type', 'application/json');
        if(typeof req.query.secret !== "undefined" && req.query.secret !== ""){
          //TODO GET APP FROM REFERER + SECRET THEN SET REDIRECT URL TO REFERER
          auth_helper.validate_origin({options:{secret:req.query.secret, host:referer}}, req.get('origin'), function(e){
            if(!e){
              if(typeof req.get('origin') === "undefined"){
                res.redirect(307, "/auth?message=UNAUTHORISED_SERVER");
              }else{
                res.redirect(307, req.get('origin')+"/auth?message=UNAUTHORISED_SERVER");
              }
            }else{

              current_app = e;
              //referer = current_app.redirect_url;
              //current_app.referer = referer;
              next();
            }
          });
        }else if(typeof req.query.app_id !== "undefined"){
          Apps_controller.get(req, {_id:req.query.app_id}, function(e){
            if(e.status === 200){
              current_app = e.datas[0];
              //referer = current_app.redirect_url;
              next();
            }else{
              if(typeof req.get('origin') === "undefined"){
                res.redirect(307, "/auth?message=UNAUTHORISED_SERVER");
              }else {
                res.redirect(307, req.get('origin')+"/auth?message=UNAUTHORISED_SERVER");
              }
            }
          });
        }else if(typeof req.body.app_id !== "undefined"){
          Apps_controller.get(req, {_id:req.body.app_id}, function(e){
            if(e.status === 200){
              if(e.datas.length > 0){
                current_app = e.datas[0];
                //referer = current_app.redirect_url;
              }
              next();
            }else{
              if(typeof req.get('origin') === "undefined"){
                res.redirect(307, "/auth?message=UNAUTHORISED_SERVER");
              }else {
                res.redirect(307, req.get('origin')+"/auth?message=UNAUTHORISED_SERVER");
              }
            }
          });
        }else{
          next();
        }
        //next();
    });
/* DEVICE UID IS UNIQ BY DEVICE, NOT BROWSER PERHAPS WE NEED TO IDENTIFY BROWSER UNIQ ID NOT SURE... */
/* GET home page. */
auth.get('/', function(req, res, next) {
        Auth_controller.login(req, req.query, function(e){
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
                        '/public/javascripts/login.js?v='+app.locals.version,
                        '/public/javascripts/components/popeye.js?v='+app.locals.version,
                        '/public/javascripts/components/formular.js?v='+app.locals.version
                    ],
                    css:[
                        '/public/stylesheets/components/formular.css?v='+app.locals.version,
                        '/public/stylesheets/auth.css?v='+app.locals.version,
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
                delete current_app;
                current_app = null;
            });
    })
    .post('/login', function(req, res, next) {
        req.query = req.body.data;
        Auth_controller.login(req, req.body.data, function(e){
            res.status(e.status).send(Auth_helper.addParams(e, req));
            res.end();
        });
    })
    .post('/subscribe', function(req, res, next) {
        Auth_controller.register(req, function(e){
            if(typeof e.user !== "undefined"){
                e.idkids_user = {datas:e.user};
                res.status(e.status).send(Auth_helper.addParams(e, req));
                res.end();
            }else{
                res.status(e.status).send(Auth_helper.addParams(e, req));
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
            referer:referer,
            current_app:current_app,
            js:[
                '/public/javascripts/lost_password.js?v='+app.locals.version,
                '/public/javascripts/components/formular.js?v='+app.locals.version,
                '/public/javascripts/components/popeye.js?v='+app.locals.version
            ], css:[
                '/public/stylesheets/components/formular.css?v='+app.locals.version,
                '/public/stylesheets/auth.css?v='+app.locals.version,
            ]
          }
        );
        res.end();
    })
    .post('/update_password', function(req, res, next){
        Auth_controller.validCode(req.body.data, function(e){
          if(e.status === 200){
            next();
          }else{
            res.status(203).send(Auth_helper.addParams(e, req));
            res.end();
          }
        });
    }, function(req, res, next){
        if(typeof req.body.data.password === "undefined" || typeof req.body.data.retype_password === "undefined"){
            res.status(203).send(Auth_helper.addParams({message:"NEED_PASSWORD"}, req));
            res.end();
        }
        if(req.body.data.password !== req.body.data.retype_password){
            res.status(203).send(Auth_helper.addParams({message:"NEED_SAME_PASSWORD"}, req));
            res.end();
        }else{
          Auth_controller.update_password({email:req.body.data.email, password:req.body.data.password}, res, function(e){
            res.status(e.status).send(Auth_helper.addParams(e, req));
            res.end();
            //res.redirect(307, "/auth?message="+e.message);
          });
        }
    })
    .post('/lost_password', function(req, res, next){
        Auth_controller.lost_password(req, res, function(e){
          if(typeof e.response_display !== "undefined"){
            e.response_display.title = lang[language_helper.getlocale(req)].keys[e.response_display.title];
            e.response_display.message = lang[language_helper.getlocale(req)].keys[e.response_display.message];
          }
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
            }
            res.end();
        });
    })
    .get(['/:form_name', '/:form_name/*'], function(req, res, next) {
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
                referer:referer,
                current_app:current_app,
                js:[
                    '/public/javascripts/login.js?v='+app.locals.version,
                    '/public/javascripts/components/formular.js?v='+app.locals.version,
                    '/public/javascripts/components/popeye.js?v='+app.locals.version
                ], css:[
                    '/public/stylesheets/components/formular.css?v='+app.locals.version,
                    '/public/stylesheets/auth.css?v='+app.locals.version,
                ]
            };
            if(typeof e.idkids_user !== "undefined"){
                res.status(e.status).send(Auth_helper.addParams(e));
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
            res.send(Auth_helper.addParams(e));
            res.end();
        });
    })
    .get('/facebook', function(req, res, next){
        var facebook_call = req;
        Auth_controller.login(req, req.query, function(e){
            var datas = {
                title: 'Mon compte',
                datas: req.query,
                locale:language_helper.getlocale(req),
                lang:lang,
                uri_params : uri_helper.get_params(req),
                response:e,
                facebook_call: facebook_call,
                js:[
                    '/public/javascripts/login.js?v='+app.locals.version,
                    '/public/javascripts/components/formular.js?v='+app.locals.version
                ], css:[
                    '/public/stylesheets/components/formular.css?v='+app.locals.version,
                    '/public/stylesheets/auth.css?v='+app.locals.version,
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
        Auth_controller.get_user_from_device(req.params.device_uid, function(users_device){
            Auth_controller.login(req, req.query, function(e){
                var datas = {
                    title: 'Mon compte',
                    datas: req.query,
                    locale:language_helper.getlocale(req),
                    lang:lang,
                    uri_params : uri_helper.get_params(req),
                    users_device:users_device.users_device,
                    response:e,
                    js:[
                        '/public/javascripts/login.js?v='+app.locals.version,
                        '/public/javascripts/components/formular.js?v='+app.locals.version
                    ], css:[
                        '/public/stylesheets/components/formular.css?v='+app.locals.version,
                        '/public/stylesheets/auth.css?v='+app.locals.version,
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
