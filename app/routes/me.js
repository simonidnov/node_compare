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
    getmac = require('getmac');

var device_uid = machineId.machineIdSync({original: true});
getmac.getMac(function(err,macAddress){
    device_uid = macAddress;
});

//machineId.machineIdSync({original: true})
me.use(function(req, res, next) {
    //ACCEPT CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    //SET OUTPUT FORMAT
    res.setHeader('Content-Type', 'application/json');
    
    var dataCheck = req.query;
    if(req.method === "PUT" || req.method === "POST" || req.method === "DELETE"){
        dataCheck = req.body;
    }
    
    auth_helper.validate_from(dataCheck, req.get('host'), function(e){
        console.log('validate_from ::::: ', e);
        if(!e){
            res.status(401).send({ message: "your server was not authorised", request:dataCheck, host:req.get('host'), is_ok:""});
        }else{
            // TODO : indexof not suffisant reason... check real request -- manage token request by URL GET? POST! PUT! DELETE!
            if(req.url.indexOf('/from') === -1){
                auth_helper.validate_user(dataCheck, req.get('host'), function(response){
                    console.log("response.status validate_user ::::: ", response);
                    if(response.status === 200){
                        if(typeof response.updated_token !== "undefined"){
                            req.query.updated_token = response.updated_token;
                        }
                        next();
                    }else{
                        res.status(response.status).send({ message: "the user token was not up to date", request:dataCheck, host:req.get('host')});
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
    })
    .put('/', function(req, res, next) {
        res.send({ message: "me put is under development redirect to /account/profile", updated_token:req.query.updated_token, host:req.get('host')});
    })
    .delete('/', function(req, res, next) {
        res.send({ message: "me delete is under development redirect to /account/profile", updated_token:req.query.updated_token, host:req.get('host')});
    })
    /* ------------ MEMBERS MANAGMENT ------------ */
    .get('/members', function(req, res, next) {
        Members_model.get(req.query.options.user_id, null, function(e){
            e.updated_token = req.query.updated_token;
            res.status(e.status).send(e);
        });
    })
    .post('/members', function(req, res, next) {
        Members_model.create(req.body.options.user_id, req.body, function(e){
            /* IF REQ SESSIONS AUTH HAVE TO SET MEMBERS */
            auth_helper.check_session(req, req.body.options.user_id, function(){
                e.updated_token = req.query.updated_token;
                res.status(e.status).send(e); 
            });
        });
    })
    .put('/members', function(req, res, next) {
        Members_model.update(req.body.options.user_id, req.body.member_id, req.body, function(e){
            /* IF REQ SESSIONS AUTH HAVE TO SET MEMBERS */
            auth_helper.check_session(req, req.body.options.user_id, function(){
                e.updated_token = req.query.updated_token;
                res.status(e.status).send(e); 
            });
        });
    })
    .delete('/members', function(req, res, next) {
        Members_model.delete(req.body.options.user_id, req.body.member_id, function(e){
            /* IF REQ SESSIONS AUTH HAVE TO SET MEMBERS */
            auth_helper.check_session(req, req.body.options.user_id, function(){
                e.updated_token = req.query.updated_token;
                res.status(e.status).send(e); 
            });
        });
    })
    /* ------------ ORDERS MANAGMENT ----------- */
    .get('/friends', function(req, res, next) {
        res.send({ message: "basket get is under development", updated_token:req.query.updated_token, host:req.get('host')});
    })
    .post('/friends', function(req, res, next) {
        res.send({ message: "basket post is under development", updated_token:req.query.updated_token, host:req.get('host')});
    })
    .put('/friends', function(req, res, next) {
        res.send({ message: "basket put is under development", updated_token:req.query.updated_token, host:req.get('host')});
    })
    .delete('/friends', function(req, res, next) {
        res.send({ message: "basket delete is under development", updated_token:req.query.updated_token, host:req.get('host')});
    })
    /* ------------ ADRESS MANAGMENT ------------- */
    .get('/address', function(req, res, next) {
        Address_model.get(req.query.options.user_id, null, function(e){
            e.updated_token = req.query.updated_token;
            res.status(e.status).send(e);
        });
    })
    .post('/address', function(req, res, next) {
        Address_model.create(req.body.options.user_id, req.body, function(e){
            /* IF REQ SESSIONS AUTH HAVE TO SET MEMBERS */
            auth_helper.check_session(req, req.body.options.user_id, function(){
                e.updated_token = req.query.updated_token;
                res.status(e.status).send(e); 
            });
        });
    })
    .put('/address', function(req, res, next) {
        Address_model.update(req.body.options.user_id, req.body.address_id, req.body, function(e){
            /* IF REQ SESSIONS AUTH HAVE TO SET MEMBERS */
            auth_helper.check_session(req, req.body.options.user_id, function(){
                e.updated_token = req.query.updated_token;
                res.status(e.status).send(e); 
            });
        });
    })
    .delete('/address', function(req, res, next) {
        Address_model.delete(req.body.options.user_id, req.body.address_id, function(e){
            /* IF REQ SESSIONS AUTH HAVE TO SET MEMBERS */
            auth_helper.check_session(req, req.body.options.user_id, function(){
                e.updated_token = req.query.updated_token;
                res.status(e.status).send(e); 
            });
        });
    })
    /* ------------ SERVICES MANAGMENT ----------- */
    .get('/services', function(req, res, next) {
        Auth_model.getServices(req.query.options.user_id, function(e){
            e.updated_token = req.query.updated_token;
            res.status(e.status).send(e);
        });
    })
    .post('/services', function(req, res, next) {
        res.send({ message: "services post is under development redirect to /account/profile", updated_token:req.query.updated_token, host:req.get('host')});
    })
    .put('/services', function(req, res, next) {
        res.send({ message: "services put is under development redirect to /account/profile", updated_token:req.query.updated_token, host:req.get('host')});
    })
    .delete('/services', function(req, res, next) {
        res.send({ message: "services delete is under development redirect to /account/profile", updated_token:req.query.updated_token, host:req.get('host')});
    })
    /* ------------ BASKET MANAGMENT ----------- */
    .get('/basket', function(req, res, next) {
        res.send({ message: "basket get is under development", updated_token:req.query.updated_token, host:req.get('host')});
    })
    .post('/basket', function(req, res, next) {
        res.send({ message: "basket post is under development", updated_token:req.query.updated_token, host:req.get('host')});
    })
    .put('/basket', function(req, res, next) {
        res.send({ message: "basket put is under development", updated_token:req.query.updated_token, host:req.get('host')});
    })
    .delete('/basket', function(req, res, next) {
        res.send({ message: "basket delete is under development", updated_token:req.query.updated_token, host:req.get('host')});
    })
    /* ------------ ORDERS MANAGMENT ----------- */
    .get('/orders', function(req, res, next) {
        res.send({ message: "basket get is under development", updated_token:req.query.updated_token, host:req.get('host')});
    })
    .post('/orders', function(req, res, next) {
        res.send({ message: "basket post is under development", updated_token:req.query.updated_token, host:req.get('host')});
    })
    .put('/orders', function(req, res, next) {
        res.send({ message: "basket put is under development", updated_token:req.query.updated_token, host:req.get('host')});
    })
    .delete('/orders', function(req, res, next) {
        res.send({ message: "basket delete is under development", updated_token:req.query.updated_token, host:req.get('host')});
    })
    /* ------------ notifications MANAGMENT ----------- */
    .get('/notifications', function(req, res, next) {
        res.send({ message: "notifications get is under development", updated_token:req.query.updated_token, host:req.get('host')});
    })
    .post('/notifications', function(req, res, next) {
        res.send({ message: "notifications post is under development", updated_token:req.query.updated_token, host:req.get('host')});
    })
    .put('/notifications', function(req, res, next) {
        res.send({ message: "notifications put is under development", updated_token:req.query.updated_token, host:req.get('host')});
    })
    .delete('/notifications', function(req, res, next) {
        res.send({ message: "notifications delete is under development", updated_token:req.query.updated_token, host:req.get('host')});
    })
    /* ------------ FROM VALIDATION ----------- */
    .get('/from', function(req, res, next) {
        res.send({ status:200, message: "website authorised", updated_token:req.query.updated_token, host:req.get('host')});
    });
module.exports = me;