//import {machineId, machineIdSync} from 'node-machine-id';

var express = require('express'),
    validation = express.Router(),
    Auth_model = require('../models/auth_model');

validation.use(function(req, res, next){
    //ACCEPT CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    next();
});

validation.get('/', function(req, res, next) {
        res.render('validation', {
            title: 'Validation',
            infos : {},
            js:[], 
            css:[]
        });
    })
    .get('/account/:email/:validation_code', function (req, res, next) {
        Auth_model.validAccount(req.params, function(e){
            //res.status(200).send(e);
            res.render('validation', {
                title: 'Validation',
                infos : e,
                js:[
                ], css:[
                ]
            });
        });
        //res.status(200).send({status:200, message:"file upload success", path:req.file.path, file:req.file});
    });
    
module.exports = validation;
