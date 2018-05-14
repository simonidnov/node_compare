var express = require('express'),
    orders = express.Router(),
    Orders_controller = require('../controllers/orders_controller'),
    Auth_helper = require('../helpers/auth_helper'),
    language_helper = require('../helpers/languages_helper'),
    uri_helper = require('../helpers/uri_helper'),
    lang = require('../public/languages/auth_lang');

orders.use(function(req, res, next){
    //ACCEPT CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");

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
      if(typeof req.body.data !== "undefined"){
        dataCheck = req.body.data;
      }
    }
    //dataCheck.options = dataCheck;
    Auth_helper.validate_session(req, function(e){
      console.log('VALIDATE SESSION ', e);
      if(e.status === 200) {
        next();
      }else {
        /* SI ON A PAS DE SESSION ON CHECK L'UTILISATEUR DEPUIS L'API OPTIONS PARAMS */
        Auth_helper.validate_user(dataCheck, req.get('host'), function(e){
          if(e.status === 200) {
            next();
          } else {
            res.status(e.status).send(e);
          }
        });
        //res.status(e.status).send(e.datas);
      }
    });
});
/* GET home page. */
orders
    .get('/', function(req, res, next) {
        Orders_controller.get(req, res, function(e){
            res.status(e.status).send(e.datas);
        });
    })
    .get('/transaction', function(req, res, next){
      res.render('order', {
          title : 'User Account',
          user  : req.session.Auth,
          locale: language_helper.getlocale(req),
          lang  : lang,
          page  : "transaction",
          js:[
              '/public/javascripts/order.js',
              '/public/javascripts/components/formular.js',
              '/public/javascripts/components/popeye.js',
          ], css:[
              '/public/stylesheets/order.css',
              '/public/stylesheets/ui.css',
              '/public/stylesheets/components/formular.css'
          ]
      });
      res.end();
    })
    .get('/amount', function(req, res, next) {
        Orders_controller.getAmount(req, res, function(e){
          res.status(e.status).send(e.datas);
        });
    })
    .post('/transaction', function(req, res, next){
        //res.status(200).send({status:"POST", body:req.body});
        Orders_controller.createCharge(req, res, function(e){
            res.render('order', {
                title : 'User Account',
                user  : req.session.Auth,
                locale: language_helper.getlocale(req),
                lang  : lang,
                page  : "transaction",
                order_datas : e.datas,
                js:[
                    '/public/javascripts/order.js',
                    '/public/javascripts/components/formular.js',
                    '/public/javascripts/components/popeye.js',
                ], css:[
                    '/public/stylesheets/order.css',
                    '/public/stylesheets/ui.css',
                    '/public/stylesheets/components/formular.css'
                ]
            });
            res.end();
        });
    })
    .post('/', function(req, res, next) {
        Orders_controller.create(req.body.data, res, function(e){
          if(e.status === 200){
            res.status(e.status).send({status:e.status, response_display:{title:"Commande", message:"Votre commande est prête à être réglée.", buttons:["OK"]}});
          }else{
            res.status(e.status).send(e);
          }
        });
    })
    .put('/', function(req, res, next) {
        Orders_controller.update(req.body.data, res, function(e){
            res.status(e.status).send({status:e.status, infos:e.datas});
        });
    })
    .delete('/', function(req, res, next) {
        Orders_controller.delete(req, res, function(e){
            res.status(e.status).send({status:e.status, infos:e.datas});
        });
    })
    .post('/buy_product_with_coupon_code', function(req, res, next){
        Orders_controller.buy_with_coupon(req, res, function(e){
            //res.status(200).send({status:200, message:"CURRENTLY IN PROGRESS"});
            res.status(e.status).send(e);
        });
    });

module.exports = orders;
