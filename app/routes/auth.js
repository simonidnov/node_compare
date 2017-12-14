//import {machineId, machineIdSync} from 'node-machine-id';

var express = require('express'),
    auth = express.Router(),
    Auth_controller = require('../controllers/auth_controller'),
    language_helper = require('../helpers/languages_helper'),
    uri_helper = require('../helpers/uri_helper'),
    lang = require('../public/languages/auth_lang'),
    machineId = require('node-machine-id'),
    device_uid = machineId.machineIdSync({original: true});

/* DEVICE UID IS UNIQ BY DEVICE, NOT BROWSER PERHAPS WE NEED TO IDENTIFY BROWSER UNIQ ID NOT SURE... */
/* GET home page. */
auth.get('/', function(req, res, next) {
        req.query.device_uid = device_uid; 
        Auth_controller.login(req, req.query, function(e){
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
            //datas.user_session = req.session.Auth;
            if(typeof e.user !== "undefined"){
                res.redirect(307, '/account?idkids-token='+e.user.token+'&idkids-id='+e.user._id+'&idkids-device='+e.user.current_device);
            }
            res.render('auth/login', datas);
        });
    })
    .post('/login', function(req, res, next) {
        Auth_controller.register(req, function(e){
            if(typeof e.user !== "undefined"){
                res.redirect(307, '/account/?idkids-token='+e.user.token+'&idkids-id='+e.user._id+'&idkids-device='+e.user.current_device);
            }
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
        req.query.device_uid = device_uid; 
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

auth.get('/logout', function(req, res, next) {
    Auth_controller.logout(req.query, function(err, data){
        res.render('auth/logout', { title: 'logout auth page' });
    });
});
auth.get('/account', function(req, res, next) {
  res.render('account', { title: 'account auth page' });
});

module.exports = auth;