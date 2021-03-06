var express = require('express'),
    basket = express.Router(),
    Basket_controller = require('../controllers/basket_controller'),
    Userproducts_controller = require('../controllers/userproducts_controller')
    Auth_helper = require('../helpers/auth_helper'),
    language_helper = require('../helpers/languages_helper'),
    uri_helper = require('../helpers/uri_helper'),
    lang = require('../public/languages/auth_lang');

basket.use(function(req, res, next){
    //ACCEPT CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");

    // res.setHeader("Access-Control-Allow-Origin", "*");
    // res.setHeader("Content-Type: application/json", true);
    // res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    // res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");

    //res.setHeader('Content-Type', 'application/json');
    Auth_helper.validate_admin(req, function(e){
      if(e.status === 200){
        req.body.isAdmin = true;
        req.query.isAdmin = true;
      }else {
        req.body.isAdmin = false;
        req.query.isAdmin = false;
      }
    });
    var dataCheck = req.query;
    if(req.method === "PUT" || req.method === "POST" || req.method === "DELETE") {
      dataCheck = req.body;
    }
    //dataCheck.options = dataCheck;
    Auth_helper.validate_user(dataCheck, req.get('host'), function(e){
      if(e.status === 200) {
        next();
      } else {
        res.status(e.status).send(e);
      }
    });
});
/* GET home page. */
basket
    .get('/', function(req, res, next) {
        Basket_controller.get(req, res, function(e){
            res.status(e.status).send(Auth_helper.addParams(e.datas, req));
        });
    })
    .get('/amount', function(req, res, next) {
        Basket_controller.getAmount(req, res, function(e){
            res.status(e.status).send(Auth_helper.addParams(e.datas, req));
        });
    })
    .post('/', function(req, res, next) {
        if(typeof req.body.data !== "undefined"){
          req.body = req.body.data;
        }
        /* ON CHECK SI L'UTILISATEUR N'AURAIT PAS DEJA ACHETE LE PRODUIT ES FOIS PAR HASARD */
        Userproducts_controller.allreadyBuy(req.body.options.user_id, req.body.product_id, function(e){
            if(e.status === 200){
              res.status(e.status).send(
                Auth_helper.addParams({
                  status:e.status,
                  response_display:{
                    title:"Mon Panier",
                    message:"Vous avez déjà acheté ce produit, rendez-vous sur <a href=\"http://machanson.joyvox.fr/playlist\">votre playlist</a> pour l'écouter !",
                    type:"modal",
                    motion:{
                      color:"coral",
                      src:app.locals.settings.host+"/public/images/assets/basket.svg"
                    },
                    buttons:[
                      {
                        class:"btn-warning centered",
                        label:"MON COMPTE",
                        href:app.locals.settings.host+"/account/orders",
                        target:"_self",
                        value:"/account/orders"
                      }
                    ]
                  }
                }, req)
              );
            }else{
              next();
            }
        });
    }, function(req, res, next){
        Basket_controller.create(req.body, res, function(e){
            res.status(e.status).send(
              Auth_helper.addParams({
                status:e.status,
                response_display:{
                  title:"Ajouté",
                  illus:{
                    src:app.locals.settings.host+"/public/images/assets/basket.svg",
                    color:"lightseagreen"
                  },
                  message:"Votre produit a bien été ajouté dans votre panier.",
                  buttons:[
                    {
                      class:"btn-success centered",
                      label:"MON PANIER",
                      href:app.locals.settings.host+"/account/basket",
                      target:"_self",
                      value:"/account/basket"
                    }
                  ]
                }
              }, req)
            );
        });
    })
    .put('/', function(req, res, next) {
        Basket_controller.update(req.body, res, function(e){
            res.status(e.status).send(Auth_helper.addParams({status:e.status, infos:e.datas}, req));
        });
    })
    .delete('/', function(req, res, next) {
        Basket_controller.delete(req, res, function(e){
            res.status(e.status).send(Auth_helper.addParams({status:e.status, infos:e.datas}, req));
        });
    });

module.exports = basket;
