//import {machineId, machineIdSync} from 'node-machine-id';

const express = require('express'),
      _und = require("underscore"),
      templating = express.Router(),
      Auth_controller = require('../controllers/auth_controller'),
      Basket_controller = require('../controllers/basket_controller'),
      Basket_model = require('../models/basket_model'),
      language_helper = require('../helpers/languages_helper'),
      uri_helper = require('../helpers/uri_helper'),
      lang = require('../public/languages/auth_lang'),
      machineId = require('node-machine-id');

var  device_uid = machineId.machineIdSync({original: true});

templating.use(function(req, res, next){
    //ACCEPT CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT,OPTIONS");
    //SET OUTPUT FORMAT
    //res.setHeader('Content-Type', 'application/json');
    var dataCheck = req.query;
    if(req.method === "PUT" || req.method === "POST" || req.method === "DELETE"){
        dataCheck = req.body;
    }
    next();
});
/* DEVICE UID IS UNIQ BY DEVICE, NOT BROWSER PERHAPS WE NEED TO IDENTIFY BROWSER UNIQ ID NOT SURE... */
/* GET home page. */
templating.get('/:template', function(req, res, next) {
    req.datas_set= {
        locale:language_helper.getlocale(req),
        lang:lang,
        query:req.query,
        _:_und
    };
    switch(req.params.template){
      case 'notif_button':
        if(typeof req.query.user !== "undefined"){
          console.log('HAS USER ? ', req.query.user);
          Basket_model.get({user_id:req.query.user._id}, req, function(e){
            console.log('GET BASKET USER FROM TEMPLATING ', e);
            req.datas_set.basket = e.datas;
            next();
          });
        }else{
          next();
        }
        break;
      case 'auth_button':
        if(typeof req.query.user !== "undefined"){
          Auth_controller.getUserInfos(req, res, function(e){
            if(typeof e.user !== "undefined"){
              req.datas_set.user = e.user;
            }
            next();
          });
        }else{
          next();
        }
        break;
      default:
        if(typeof req.session.Auth !== "undefined"){
          req.datas_set.user = req.session.Auth;
          if(typeof req.query.member_id !== "undefined"){
            req.datas_set.member = _und.where(req.datas_set.user.members, {_id:req.query.member_id})[0];
          }
        }
        next();
        break;
    }
    //res.render('templates/'+req.params.template, req.query);
}, function(req, res, next){
    res.render('templates/'+req.params.template, req.datas_set);
    res.end();
});

module.exports = templating;
