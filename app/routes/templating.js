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


/* DEVICE UID IS UNIQ BY DEVICE, NOT BROWSER PERHAPS WE NEED TO IDENTIFY BROWSER UNIQ ID NOT SURE... */
/* GET home page. */
templating.get('/:template', function(req, res, next) {
    res.render('templates/'+req.params.template, {
        user : req.session.Auth,
        locale:language_helper.getlocale(),
        lang:lang,
        query:req.query,
        _:_und
    });
    //res.render('templates/'+req.params.template, req.query);
});

module.exports = templating;
