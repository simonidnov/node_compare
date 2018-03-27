//import {machineId, machineIdSync} from 'node-machine-id';

const express = require('express'),
      _und = require("underscore"),
      templating = express.Router(),
      Auth_controller = require('../controllers/auth_controller'),
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
    res.render('templates/'+req.params.template, {
        locale:language_helper.getlocale(),
        lang:lang,
        query:req.query,
        _:_und
    });
    //res.render('templates/'+req.params.template, req.query);
});

module.exports = templating;
