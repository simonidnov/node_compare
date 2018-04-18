var express = require('express'),
    basket = express.Router(),
    Basket_controller = require('../controllers/basket_controller'),
    Auth_helper = require('../helpers/auth_helper'),
    language_helper = require('../helpers/languages_helper'),
    uri_helper = require('../helpers/uri_helper'),
    lang = require('../public/languages/auth_lang');

basket.use(function(req, res, next){
    //ACCEPT CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    Auth_helper.validate_admin(req, function(e){
      (e.status === 200)? req.isAdmin = true : req.isAdmin = false;
    });
    Auth_helper.validate_user(req, function(e){
      if(e.status === 200) {
        next();
      }else {
        res.status(e.status).send(e.datas);
      }
    });
});
/* GET home page. */
basket
    .get('/', function(req, res, next) {
        Basket_controller.get(req, res, function(e){
            res.status(e.status).send(e.datas);
        });
    })
    .post('/', function(req, res, next) {
        Products_controller.create(req, res, function(e){
            res.status(e.status).send(e.datas);
        });
    })
    .put('/', function(req, res, next) {
        Products_controller.update(req, res, function(e){
            res.status(e.status).send(e.datas);
        });
    })
    .delete('/', function(req, res, next) {
        Products_controller.deleting(req, res, function(e){
            res.status(e.status).send(e.datas);
        });
    });

module.exports = product;
