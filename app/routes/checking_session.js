//import {machineId, machineIdSync} from 'node-machine-id';

var express = require('express'),
    checking_session = express.Router(),
    Auth_model = require('../models/auth_model'),
    auth_helper = require('../helpers/auth_helper'),
    language_helper = require('../helpers/languages_helper'),
    uri_helper = require('../helpers/uri_helper'),
    lang = require('../public/languages/auth_lang');

    checking_session.use(function(req, res, next){
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
        //SET OUTPUT FORMAT
        next();

    });
checking_session.get('/', function(req, res, next) {
    if(typeof req.query._id !== "undefined" && typeof req.query.secret !== "undefined" && typeof req.query.token !== "undefined"){
      if(req.query._id === "undefined"){
        res.redirect(307, '/auth');
        res.end();
      }else{
        Auth_model.checking_session(req, req.query._id, function(e){
          if(typeof e.datas.password !== "undefined"){
              res.redirect(307, "/account"+'?idkids-token='+e.datas.token+'&idkids-id='+e.datas._id+'&idkids-device='+e.datas.current_device);
              res.end();
          }else{
              res.redirect(307, '/auth');
              res.end();
          }
        });
      }
    }else{
      res.render('auth/checking_session', {});
      res.end();
    }
});

module.exports = checking_session;
