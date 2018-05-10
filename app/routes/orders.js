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
    }
    //dataCheck.options = dataCheck;
    Auth_helper.validate_session(req, function(e){
      if(e.status === 200) {
        next();
      }else {
        res.status(e.status).send(e.datas);
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
    .get('/amount', function(req, res, next) {
        Orders_controller.getAmount(req, res, function(e){
          res.status(e.status).send(e.datas);
        });
    })
    .post('/transaction', function(req, res, next){
        //res.status(200).send({status:"POST", body:req.body});
        Orders_controller.createCharge(req, res, function(e){
            e.title = "Paiement";
            console.log(e);
            res.status(e.status).render("order", e);
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
    });

module.exports = orders;
