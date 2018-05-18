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
        res.end();
    })
    .get('/account/:email/:validation_code', function (req, res, next) {
        Auth_model.validAccount(req, req.params, function(e){
            //res.status(200).send(e);
            if(e.status === 200){
              e.message = "Félicitations, votre compte à bien été validé !";
            }else{
              e.message = "la clé de validation de votre compte Joyvox est périmée, veuillez vous connecter pour recevoir un nouveau lien.";
            }
            res.status(200).render('validation', {
                title: 'Validation',
                infos : e,
                js:[
                ], css:[
                ]
            });
            res.end();
        });
        //res.status(200).send({status:200, message:"file upload success", path:req.file.path, file:req.file});
    });

module.exports = validation;
