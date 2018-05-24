var express = require('express'),
    metas_controller = require('../controllers/metas_controller'),
    metas = express.Router();

metas.get('/', function(req, res, next) {
      metas_controller.get(req, res, function(e){
        res.status(e.status).send(e);
      });
    })
    .post('/', function (req, res, next) {
      metas_controller.create(req, res, function(e){
        res.status(e.status).send(e);
      });
    })
    .put('/', function(req, res, next) {
        res.send({ message: "metas upload PUT is on development"});
    })
    .delete('/base64', function(req, res, next){
        res.send({ message: "metas upload DELETE is on development"});
    });

module.exports = metas;
