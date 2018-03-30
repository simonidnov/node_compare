var express = require('express'),
    product = express.Router(),
    Products_controller = require('../controllers/products_controller'),
    Auth_helper = require('../helpers/auth_helper'),
    language_helper = require('../helpers/languages_helper'),
    uri_helper = require('../helpers/uri_helper'),
    lang = require('../public/languages/auth_lang');

product.use(function(req, res, next){
    //ACCEPT CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");

    var dataCheck = req.query;
    if(req.method === "PUT" || req.method === "POST" || req.method === "DELETE"){
        dataCheck = req.body;
    }
    next();
});
/* GET home page. */
product
    .get('/', function(req, res, next) {
        //res.status(200).send({title:"API"});
        Products_controller.get(req, res, function(e){
            res.status(e.status).send(e.datas);
        });
    })
    .post('/', function(req, res, next) {
        Auth_helper.validate_admin(req, function(e){
            if(e.status === 200){
                Products_controller.create(req, res, function(e){
                    console.log("Products_controller API callback sattus ? ", e);
                    res.status(e.status).send(e.datas);
                });
            }else{
                res.redirect(301, '/auth?message="Vous n\'avez pas de droits administrateur sur la plateforme IDKIDS account"');
            }
        });
    })
    .put('/', function(req, res, next){
        Auth_helper.validate_admin(req, function(e){
            if(e.status === 200){
                Products_controller.update(req, res, function(e){
                    res.status(e.status).send(e.datas);
                });
            }else{
                res.redirect(301, '/auth?message="Vous n\'avez pas de droits administrateur sur la plateforme IDKIDS account"');
            }
        });
    })
    .delete('/', function(req, res, next) {
        Auth_helper.validate_admin(req, function(e){
            if(e.status === 200){
                Products_controller.deleting(req, res, function(e){
                    res.status(e.status).send(e.datas);
                });
            }else{
                res.redirect(301, '/auth?message="Vous n\'avez pas de droits administrateur sur la plateforme IDKIDS account"');
            }
        });
    });

module.exports = product;
