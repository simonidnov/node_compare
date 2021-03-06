//import {machineId, machineIdSync} from 'node-machine-id';

var express = require('express'),
    me = express.Router(),
    language_helper = require('../helpers/languages_helper'),
    uri_helper      = require('../helpers/uri_helper'),
    auth_helper     = require('../helpers/auth_helper'),
    lang            = require('../public/languages/auth_lang'),
    machineId       = require('node-machine-id'),
    Auth_model      = require('../models/auth_model'),
    Members_model   = require('../models/members_model'),
    Address_model   = require('../models/address_model'),
    Userproducts_controller = require('../controllers/userproducts_controller');

var device_uid = null;

//machineId.machineIdSync({original: true})
me.use(function(req, res, next) {
    //ACCEPT CORS
    //res.setHeader('Access-Control-Allow-Credentials', false);
    res.setHeader("Access-Control-Allow-Origin", "*");
    //res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    //res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");

    //res.setHeader("Access-Control-Allow-Methods", "OPTIONS,GET,PUT,POST,DELETE");
    //res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');

    //SET OUTPUT FORMAT
    res.setHeader('Content-Type', 'application/json');

    var dataCheck = req.query;
    if(req.method === "PUT" || req.method === "POST" || req.method === "DELETE"){
        dataCheck = req.body;
    }

    if(typeof dataCheck.device_infos !== "undefined"){
        device_uid = dataCheck.device_infos.device_uid;
    }else if(typeof dataCheck.device_uid !== "undefined"){
        device_uid = dataCheck.device_uid;
    }

    auth_helper.validate_from(dataCheck, req.get('origin'), function(e){
        if(!e){
            res.status(401).send({ message: "your server was not authorised", secret:dataCheck.data, host:req.get('origin'), is_ok:""});
        }else{
            // TODO : indexof not suffisant reason... check real request -- manage token request by URL GET? POST! PUT! DELETE!
            if(req.url.indexOf('/from') === -1){
                auth_helper.validate_user(dataCheck, req.get('host'), function(response){
                    if(response.status === 200){
                        if(typeof response.updated_token !== "undefined"){
                            req.query.updated_token = response.updated_token;
                        }
                        next();
                    }else{
                        res.status(response.status).send(response);
                        return false;
                    }
                });
            }else{
                next();
            }
        }
    });

});

/* DEVICE UID IS UNIQ BY DEVICE, NOT BROWSER PERHAPS WE NEED TO IDENTIFY BROWSER UNIQ ID NOT SURE... */
/* GET home page. */
me.get('/', function(req, res, next) {
        Auth_model.getPublicProfile(req.query.options.user_id, function(e){
            e.updated_token = req.query.updated_token;
            res.status(e.status).send(e).end();
        });
    })
    .post('/', function(req, res, next) {
        res.send({ message: "me post is under development redirect to /account/profile", updated_token:req.query.updated_token, host:req.get('host')});
        res.end();
    })
    .put('/', function(req, res, next) {
        res.send({ message: "me put is under development redirect to /account/profile", updated_token:req.query.updated_token, host:req.get('host')});
        res.end();
    })
    .delete('/', function(req, res, next) {
        res.send({ message: "me delete is under development redirect to /account/profile", updated_token:req.query.updated_token, host:req.get('host')});
        res.end();
    })
    /* ------------ MEMBERS MANAGMENT ------------ */
    .get('/members', function(req, res, next) {
        Members_model.get(req.query.options.user_id, null, function(e){
            e.updated_token = req.query.updated_token;
            res.status(e.status).send(Auth_helper.addParams(e, req));
            res.end();
        });
    })
    .post('/members', function(req, res, next) {
        Members_model.create(req.body.data.options.user_id, req.body.data, function(e){
            /* IF REQ SESSIONS AUTH HAVE TO SET MEMBERS */
            //auth_helper.check_session(req, req.body.data.options.user_id, function(){
            //    e.updated_token = req.query.updated_token;
                Auth_model.reset_session(req, req.body.data.options.user_id, function(){
                  res.status(e.status).send(Auth_helper.addParams(e, req));
                  res.end();
                });

            //});
        });
    })
    .put('/members', function(req, res, next) {
        Members_model.update(req.body.options.user_id, req.body.member_id, req.body, function(e){
            /* IF REQ SESSIONS AUTH HAVE TO SET MEMBERS */
            //auth_helper.check_session(req, req.body.options.user_id, function(){
            //    e.updated_token = req.query.updated_token;
                Auth_model.reset_session(req, req.body.options.user_id, function(e){
                  res.status(e.status).send(Auth_helper.addParams(e, req));
                  res.end();
                });

            //});
        });
    })
    .delete('/members', function(req, res, next) {
        Members_model.delete(req.body.options.user_id, req.body.member_id, function(e){
            /* IF REQ SESSIONS AUTH HAVE TO SET MEMBERS */
            //auth_helper.check_session(req, req.body.options.user_id, function(){
            //    e.updated_token = req.query.updated_token;
            Auth_model.reset_session(req, req.body.options.user_id, function(){
              res.status(e.status).send(Auth_helper.addParams(e, req));
              res.end();
            });

            //});
        });
    })
    /* ------------ ORDERS MANAGMENT ----------- */
    .get('/friends', function(req, res, next) {
        res.send({ message: "friends get is under development", updated_token:req.query.updated_token, host:req.get('host')});
        res.end();
    })
    .post('/friends', function(req, res, next) {
        res.send({ message: "friends post is under development", updated_token:req.query.updated_token, host:req.get('host')});
        res.end();
    })
    .put('/friends', function(req, res, next) {
        res.send({ message: "friends put is under development", updated_token:req.query.updated_token, host:req.get('host')});
        res.end();
    })
    .delete('/friends', function(req, res, next) {
        res.send({ message: "friends delete is under development", updated_token:req.query.updated_token, host:req.get('host')});
        res.end();
    })
    /* ------------ ADRESS MANAGMENT ------------- */
    .get('/address', function(req, res, next) {
        Address_model.get(req.query.options.user_id, null, function(e){
            res.status(e.status).send(Auth_helper.addParams(e));
            res.end();
        });
    })
    .post('/address', function(req, res, next) {
        Address_model.create(req.body.options.user_id, req.body, function(e){
          Auth_model.reset_session(req, req.body.options.user_id, function(){
            res.status(e.status).send(Auth_helper.addParams(e));
            res.end();
          });
        });
    })
    .put('/address', function(req, res, next) {
        Address_model.update(req.body.options.user_id, req.body.address_id, req.body, function(e){
          Auth_model.reset_session(req, req.body.options.user_id, function(){
            res.status(e.status).send(Auth_helper.addParams(e, req));
            res.end();
          });
        });
    })
    .delete('/address', function(req, res, next) {
        Address_model.delete(req.body.options.user_id, req.body.address_id, function(e){
          Auth_model.reset_session(req, req.body.options.user_id, function(){
            res.status(e.status).send(Auth_helper.addParams(e, req));
            res.end();
          });
        });
    })
    /* ------------ SERVICES MANAGMENT ----------- */
    .get('/services', function(req, res, next) {
        Auth_model.getServices(req.query.options.user_id, function(e){
            res.status(e.status).send(Auth_helper.addParams(e, req));
            res.end();
        });
    })
    .post('/services', function(req, res, next) {
        res.send({ message: "services post is under development redirect to /account/profile", updated_token:req.query.updated_token, host:req.get('host')});
        res.end();
    })
    .put('/services', function(req, res, next) {
        res.send({ message: "services put is under development redirect to /account/profile", updated_token:req.query.updated_token, host:req.get('host')});
        res.end();
    })
    .delete('/services', function(req, res, next) {
        res.send({ message: "services delete is under development redirect to /account/profile", updated_token:req.query.updated_token, host:req.get('host')});
        res.end();
    })
    /* ------------ BASKET MANAGMENT ----------- */
    .get('/basket', function(req, res, next) {
        res.send({ message: "basket get is under development", updated_token:req.query.updated_token, host:req.get('host')});
        res.end();
    })
    .post('/basket', function(req, res, next) {
        res.send({ message: "basket post is under development", updated_token:req.query.updated_token, host:req.get('host')});
        res.end();
    })
    .put('/basket', function(req, res, next) {
        res.send({ message: "basket put is under development", updated_token:req.query.updated_token, host:req.get('host')});
        res.end();
    })
    .delete('/basket', function(req, res, next) {
        res.send({ message: "basket delete is under development", updated_token:req.query.updated_token, host:req.get('host')});
        res.end();
    })
    /* ------------ ORDERS MANAGMENT ----------- */
    .get('/orders', function(req, res, next) {
        res.send({ message: "basket get is under development", updated_token:req.query.updated_token, host:req.get('host')});
        res.end();
    })
    .post('/orders', function(req, res, next) {
        res.send({ message: "basket post is under development", updated_token:req.query.updated_token, host:req.get('host')});
        res.end();
    })
    .put('/orders', function(req, res, next) {
        res.send({ message: "basket put is under development", updated_token:req.query.updated_token, host:req.get('host')});
        res.end();
    })
    .delete('/orders', function(req, res, next) {
        res.send({ message: "basket delete is under development", updated_token:req.query.updated_token, host:req.get('host')});
        res.end();
    })
    /* ------------ notifications MANAGMENT ----------- */
    .get('/notifications', function(req, res, next) {
        res.send({ message: "notifications get is under development", updated_token:req.query.updated_token, host:req.get('host')});
        res.end();
    })
    .post('/notifications', function(req, res, next) {
        res.send({ message: "notifications post is under development", updated_token:req.query.updated_token, host:req.get('host')});
        res.end();
    })
    .put('/notifications', function(req, res, next) {
        res.send({ message: "notifications put is under development", updated_token:req.query.updated_token, host:req.get('host')});
        res.end();
    })
    .delete('/notifications', function(req, res, next) {
        res.send({ message: "notifications delete is under development", updated_token:req.query.updated_token, host:req.get('host')});
        res.end();
    })
    /* ------------ USER PRODUCTS ------------- */
    .get('/products', function(req, res, next){
        Userproducts_controller.get(req, res, function(e){
            res.status(200).send(Auth_helper.addParams(e, req));
            res.end();
        });
    })
    /* ------------ FROM VALIDATION ----------- */
    .get('/from', function(req, res, next) {
        //Apps_controller.validate(req.query.options.secret, req.get('origin'), function(e){
        //    res.status(e.status).send(e);
        //});
        res.status(200).send(Auth_helper.addParams({status:"me from callback", origin:req.get('origin'), options:req.query.options.secret}, req));
        res.end();
    });
module.exports = me;
