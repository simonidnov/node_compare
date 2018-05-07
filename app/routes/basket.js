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
    if(req.method === "PUT" || req.method === "POST" || req.method === "DELETE"){
      dataCheck = req.body;
    }
    //dataCheck.options = dataCheck;
    Auth_helper.validate_user(dataCheck, req.get('host'), function(e){
      console.log('Auth_helper.validate_user ', e);
      if(e.status === 200) {
        next();
      } else {
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
    .get('/amount', function(req, res, next) {
        Basket_controller.getAmount(req, res, function(e){
            res.status(e.status).send(e.datas);
        });
    })
    .post('/', function(req, res, next) {
        /* ON CHECK SI L'UTILISATEUR N'AURAIT PAS DEJA ACHETE LE PRODUIT ES FOIS PAR HASARD */
        Userproducts_controller.allreadyBuy(req.body.options.user_id, req.body.product_id, function(e){
            console.log("Userproducts_controller.allreadyBuy ::::: ", e);
            if(e.status === 200){
              res.status(e.status).send(
                {
                  status:e.status,
                  response_display:{
                    title:"OUPS",
                    message:"Vous avez déjà acheté ce produit, rendez-vous sur votre compte client pour le télécharger !",
                    type:"modal",
                    motion:{
                      color:"blue",
                      src:app.locals.settings.host+"/public/images/assets/account_1.svg"
                    },
                    buttons:[
                      {
                        class:"btn-success centered",
                        label:"MON COMPTE",
                        href:app.locals.settings.host+"/account/orders",
                        target:"_blank",
                        value:"/account/orders"
                      }
                    ]
                  }
                }
              );
            }else{
              next();
            }
        });
    }, function(req, res, next){
        Basket_controller.create(req.body, res, function(e){
            res.status(e.status).send(
              {
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
                      target:"_blank",
                      value:"/account/basket"
                    }
                  ]
                }
              }
            );
        });
    })
    .put('/', function(req, res, next) {
        Basket_controller.update(req.body.data, res, function(e){
            res.status(e.status).send({status:e.status, infos:e.datas});
        });
    })
    .delete('/', function(req, res, next) {
        Basket_controller.delete(req, res, function(e){
            res.status(e.status).send({status:e.status, infos:e.datas});
        });
    });

module.exports = basket;
