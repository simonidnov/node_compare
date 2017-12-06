//import {machineId, machineIdSync} from 'node-machine-id';

var express = require('express'),
    me = express.Router(),
    Auth_controller = require('../controllers/auth_controller'),
    language_helper = require('../helpers/languages_helper'),
    uri_helper = require('../helpers/uri_helper'),
    auth_helper = require('../helpers/auth_helper'),
    lang = require('../public/languages/auth_lang'),
    machineId = require('node-machine-id'),
    device_uid = machineId.machineIdSync({original: true});


me.use(function(req, res, next) {
    //ACCEPT CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //SET OUTPUT FORMAT
    res.setHeader('Content-Type', 'application/json');
    if(!auth_helper.validate_from(req.query, req.get('host'))){
        res.status(401).send({ message: "your server was not authorised", request:req.query, host:req.get('host'), is_ok:req.query.options.from_origin.indexOf(req.get('host'))});
    }
    // TODO : Check if request is not only ME/FROM
    console.log('-----------------------');
    console.log("req.query :: ", req);
    console.log("req.query URL :: ", req.url);
    console.log("req.query pathname :: ", req.pathname);
    console.log("req.query :: ", req.get('Url'));
    console.log('-----------------------');
    // TODO : indexof not suffisant reason... check real request
    if(req.url.indexOf('/from') === -1){
        if(!auth_helper.validate_user(req.query, req.get('host'))){
            res.status(401).send({ message: "the user token was not up to date", request:req.query, host:req.get('host')});
        }
    }
    next();
});

/* DEVICE UID IS UNIQ BY DEVICE, NOT BROWSER PERHAPS WE NEED TO IDENTIFY BROWSER UNIQ ID NOT SURE... */
/* GET home page. */
me.get('/', function(req, res, next) {
        //console.log("req.get('Origin') :::: ",req.get('origin'));
        //console.log("req.get('host') :::: ",req.get('host'));
        res.send({ message: "me get", request:req.query, host:req.get('host')});
    })
    .post('/', function(req, res, next) {
        res.send({ message: "me post", request:req.query});
    })
    .put('/', function(req, res, next) {
        res.send({ message: "me put", request:req.query});
    })
    .delete('/', function(req, res, next) {
        res.send({ message: "me delete", request:req.query});
    })
    /* ------------ MEMBERS MANAGMENT ------------ */
    .get('/members', function(req, res, next) {
        res.send({ message: "members get", request:req.query});
    })
    .post('/members', function(req, res, next) {
        res.send({ message: "members post", request:req.query});
    })
    .put('/members', function(req, res, next) {
        res.send({ message: "members put", request:req.query});
    })
    .delete('/members', function(req, res, next) {
        res.send({ message: "members delete", request:req.query});
    })
    /* ------------ ADRESS MANAGMENT ------------- */
    .get('/address', function(req, res, next) {
        res.send({ message: "address get", request:req.query});
    })
    .post('/address', function(req, res, next) {
        res.send({ message: "address post", request:req.query});
    })
    .put('/address', function(req, res, next) {
        res.send({ message: "address put", request:req.query});
    })
    .delete('/address', function(req, res, next) {
        res.send({ message: "address delete", request:req.query});
    })
    /* ------------ SERVICES MANAGMENT ----------- */
    .get('/services', function(req, res, next) {
        res.send({ message: "services get", request:req.query});
    })
    .post('/services', function(req, res, next) {
        res.send({ message: "services post", request:req.query});
    })
    .put('/services', function(req, res, next) {
        res.send({ message: "services put", request:req.query});
    })
    .delete('/services', function(req, res, next) {
        res.send({ message: "services delete", request:req.query});
    })
    /* ------------ SERVICES MANAGMENT ----------- */
    .get('/basket', function(req, res, next) {
        res.send({ message: "basket get", request:req.query});
    })
    .post('/basket', function(req, res, next) {
        res.send({ message: "basket post", request:req.query});
    })
    .put('/basket', function(req, res, next) {
        res.send({ message: "basket put", request:req.query});
    })
    .delete('/basket', function(req, res, next) {
        res.send({ message: "basket delete", request:req.query});
    })
    /* ------------ FROM VALIDATION ----------- */
    .get('/from', function(req, res, next) {
        res.send({ message: "website authorised", request:req.query});
    })
module.exports = me;