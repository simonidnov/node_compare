//import {machineId, machineIdSync} from 'node-machine-id';

var express = require('express'),
    media = express.Router(),
    multer = require('multer'),
    upload = multer({ dest: 'public/uploads/' });

media.get('/', function(req, res, next) {
        res.send({ message: "media upload GET is on development"});
    })
    .post('/', upload.single('avatar'), function (req, res, next) {
        res.status(200).send({status:200, message:"file upload success", path:req.file.path, file:req.file});
    })
    .put('/', function(req, res, next) {
        res.send({ message: "media upload PUT is on development"});
    })
    .post('/base64', upload.single('base64'), function(req, res, next){
        res.status(200).send({status:200, message:"file upload success", path:"/"+req.file.path, file:req.file});
    });
    
module.exports = media;
