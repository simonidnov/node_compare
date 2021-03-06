var express = require('express'),
    _ = require('underscore'),
    config = require('../config/config'),
    account = express.Router(),
    Auth_model = require('../models/auth_model'),
    Auth_helper = require('../helpers/auth_helper'),
    Basket_controller = require('../controllers/basket_controller'),
    Userproducts_controller = require('../controllers/userproducts_controller'),
    Order_controller = require('../controllers/orders_controller'),
    language_helper = require('../helpers/languages_helper'),
    uri_helper = require('../helpers/uri_helper'),
    lang = require('../public/languages/auth_lang'),
    Fb = require('fb'),
    keyPublishable ="",
    keySecret="";
    var keyPublishable = "",
        keySecret = "";

account.use(function(req, res, next){
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    //SET OUTPUT FORMAT
    //res.setHeader('Content-Type', 'application/json');
    if(app.locals.settings.StripeMode){
      keyPublishable = app.locals.settings.StripekeyPublishable;
      keySecret = app.locals.settings.StripekeySecret;
    }else{
      keyPublishable = app.locals.settings.StripekeyPublishableTest;
      keySecret = app.locals.settings.StripekeySecretTest;
    }


      var dataCheck = req.query;
      if(req.method === "PUT" || req.method === "POST" || req.method === "DELETE" || req.method === "OPTIONS"){
          dataCheck = req.body;
      }
      if(app.locals.settings.StripeMode){
        keyPublishable = app.locals.settings.StripekeyPublishable;
        keySecret = app.locals.settings.StripekeySecret;
      }else{
        keyPublishable = app.locals.settings.StripekeyPublishableTest;
        keySecret = app.locals.settings.StripekeySecretTest;
      }
      stripe = require("stripe")(keySecret);

      //SET OUTPUT FORMAT
      //res.setHeader('Content-Type', 'application/json');
      // TODO : VALIDATE SESSION USER
      //res.setHeader('Content-Type', 'application/json');
      Auth_helper.validate_session(req, function(e){
          /* TODO SEND ORIGIN FOR REDIRECTION AFTER CHECKING */
          if (e.status === 200) {
              next();
          } else {
              res.redirect(307, '/checking_session');
          }
      });
});
account
    .get('/', function(req, res, next) {
        res.redirect(307, '/account/account'+req.url.replace('/',''));
    })
    .post('/', function(req, res, next) {
        res.redirect(307, '/account/account'+req.url.replace('/',''));
    })
    .get('/:page', function(req, res, next) {
        Basket_controller.get(req, res, function(e){
            baskets = e.datas;
            next();
        });
    }, function (req, res, next){
        Order_controller.get(req, res, function(e){
            if(e.status === 200){
              orders = e.datas;
              next();
            }else{
              next();
            }
        });
    }, function(req, res, next){
        Userproducts_controller.get(req, res, function(e){
            userproducts = e.datas;
            next();
        });
    }, function(req, res, next){
        res.render('account', {
            title : 'User Account',
            profile_percent : getPercent(req.session.Auth),
            profile_needs : getNeeds(req.session.Auth),
            user  : req.session.Auth,
            locale: language_helper.getlocale(req),
            lang  : lang,
            page  : req.params.page,
            basket : baskets,
            orders : (typeof orders !== "undefined")? orders : "",
            userproducts : (typeof userproducts !== "undefined")? userproducts: "",
            keyPublishable:keyPublishable,
            _:_,
            js:[
                '/public/javascripts/account.min.js',
                '/node_modules/cropperjs/dist/cropper.min.js',
                '/public/javascripts/components/formular.min.js',
                '/public/javascripts/components/popeye.min.js',
                '/node_modules/qrcode/build/qrcode.min.js',
                'https://maps.googleapis.com/maps/api/js?key='+config.google.map
            ], css:[
                '/public/stylesheets/account.min.css',
                '/public/stylesheets/ui.min.css',
                '/node_modules/cropperjs/dist/cropper.min.css',
                '/public/stylesheets/components/formular.min.css'
            ]
        });
        res.end();
    })
    .get('/member/:member_id', function(req, res, next){
        Basket_controller.get(req, res, function(e){
            baskets = e.datas;
            next();
        });
    }, function (req, res, next){
        Order_controller.get(req, res, function(e){
            orders = e.datas;
            next();
        });
    }, function(req, res, next){
        res.render('account', {
                title: 'User Account',
                profile_percent : getPercent(req.session.Auth),
                profile_needs : getNeeds(req.session.Auth),
                user : req.session.Auth,
                locale:language_helper.getlocale(req),
                lang:lang,
                page:"member",
                basket : baskets,
                keyPublishable:keyPublishable,
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
    })
    .get('/addresses/:address_id', function(req, res, next) {
        Basket_controller.get(req, res, function(e){
            baskets = e.datas;
            next();
        });
    }, function (req, res, next){
        Order_controller.get(req, res, function(e){
            orders = e.datas;
            next();
        });
    }, function(req, res, next){
            //baskets = e.datas;
            res.render('account', {
                title: 'Edit address',
                profile_percent : getPercent(req.session.Auth),
                profile_needs : getNeeds(req.session.Auth),
                user : req.session.Auth,
                locale:language_helper.getlocale(req),
                lang:lang,
                page:"addresses",
                basket : baskets,
                keyPublishable:keyPublishable,
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
    })
    .post('/profile', function(req, res, next) {
        Auth_model.update(req, req.session.Auth._id, req.body, function(e) {
            if(e.status === 200){
                res.status(200).send(Auth_helper.addParams(e, req));
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
                res.status(e.status).send(Auth_helper.addParams(e, req));
                res.end();
            }else{
                res.redirect(307, '/account/'+req.url.replace('/','')+"?error_message="+e.message);
                res.end();
            }
        });
    });

var getPercent = function(user){
  var percent = 20;
  if(user.address.length > 0){
    percent+=10;
  }
  if(user.members.length > 0){
    percent+=10;
  }
  if(user.termAccept){
    percent+=10;
  }
  if(user.validated){
    percent+=10;
  }
  if(typeof user.gender !== "undefined"){
    percent+=10;
  }
  if(typeof user.firstName !== "undefined"){
    percent+=10;
  }
  if(typeof user.lastName !== "undefined"){
    percent+=10;
  }
  if(typeof user.birthDate !== "undefined"){
    percent+=10;
  }
  return percent;
}
var getNeeds = function(user){
  return [{title:"Validation", message:"Valider votre email"}];
}
module.exports = account;
