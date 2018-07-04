//import {machineId, machineIdSync} from 'node-machine-id';

var express = require('express'),
    media = express.Router(),
    Mime = require('mime'),
    mkdirp = require('mkdirp'),
    crypto = require('crypto'),
    multer = require('multer'),
    storage = multer.diskStorage({
      destination: function (req, file, cb) {
        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();

        var dest = 'public/uploads/'+year+'-'+month+'-'+day;
        mkdirp.sync(dest);
        cb(null, dest);
      },
      filename: function (req, file, cb) {
        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();
        crypto.pseudoRandomBytes(16, function (err, raw) {
           cb(null, year+'-'+month+'-'+day +'-'+ raw.toString('hex') + '.' + Mime.getExtension(file.mimetype));
        });
      }
    }),
    upload = multer({ storage:storage, dest: 'public/uploads/', inMemory: true, includeEmptyFields: true });

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
