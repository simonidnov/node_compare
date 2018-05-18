// GOOGLE API KEY : AIzaSyB_MlYEDlRnNWYtrn-y63pbjrWecYaocqs
const db = require('mongoose'),
      config = require('../config/config'),
      basket_model = require('../models/basket_model'),
      wallets_model = require('../models/wallets_model'),
      coupon_model = require('../models/coupon_model'),
      Auth_model = require('../models/auth_model'),
      Products_controller = require('../controllers/products_controller'),
      Userproducts_controller = require('../controllers/userproducts_controller'),
      Email_controller = require('../controllers/email_controller'),
      order_datas = {
          basket_id         : {type:"string"},
          user_id           : {type:"string"},
          stripeToken       : {type:"string"},
          devise            : {type:"string"},
          amount            : {type:"Number"},
          reduced_amount    : {type:"Number"},
          coupons_code      : {type:"Object"},
          bill_number       : {type:"string"},
          metadata          : {type:"Object"},
          response          : {type:"Object"},
          basketdatas       : {type:"Object"},
          status            : {type:"Boolean"},
          created           : {type:'Date', default: Date.now},
          updated           : {type:'Date', default: Date.now}
      };
var keyPublishable ="",
    keySecret="";

if(db.connection.readyState === 0){
    db.connect(config.database.users, {useMongoClient: true});
}
const ordersSchemas = new db.Schema(order_datas),
      Orders = db.model('Orders', ordersSchemas);

module.exports = {
    attributes: order_datas
};
module.exports.get = function(req, res, callback){
    var query = {};
    if(typeof req.session.Auth !== "undefined"){
        query = {user_id : req.session.Auth._id};
    }else if(typeof req.query.user_id !== "undefined"){
        query = {user_id : req.query.user_id};
    }else if(typeof req.query.options!== "undefined"){
        query = {user_id : req.query.options.user_id};
    }
    if(typeof req.query._id !== "undefined"){
      query._id = req.query._id;
    }
    if(typeof query.user_id === "undefined"){
      callback({status:401, datas:{message:"UNAUTHORISED_NEED_USER"}});
    }
    Orders.find(query, function(err, infos){
        if(err){
            callback({status:405, datas:err});
        }else{
            callback({status:200, datas:infos});
        }
    }).sort({'created':-1});
}
module.exports.getBill = function(user_id, datas, callback){
  var query = {};
  if(!datas.is_admin){
    query.user_id = user_id;
  }
  if(typeof datas.bill_number !== "undefined"){
    query.bill_number = datas.bill_number;
  }
  if(typeof datas._id !== "undefined"){
    query._id = datas._id;
  }
  Orders.findOne(query, function(err, infos){
      if(err){
          callback({status:405, datas:err});
      }else{
          callback({status:200, datas:infos});
      }
  })
}
module.exports.buy_with_coupon = function(req, res, callback){
  if(typeof req.body.data.coupon_code === "undefined"){
    callback({status:400, message:"NEED_COUPON_CODE", response_display:{"title":"Code de téléchargement", "message":"Vous devez renseigner un Code de téléchargement valide pour effectuer cette opération."}});
    return false;
  }
  if(typeof req.body.data.coupon_id === "undefined"){
    callback({status:400, message:"NEED_COUPON_ID", response_display:{"title":"Code de téléchargement", "message":"Le coupon est incorrect ou mal renseigné, veuillez réessayer ultérieurement."}});
    return false;
  }
  if(typeof req.body.data.product_id === "undefined"){
    callback({status:400, message:"NEED_PRODUCT_ID", response_display:{"title":"Code de téléchargement", "message":"Pour utiliser votre Code de téléchargement, vous devez choisir un produit."}});
    return false;
  }
  if(typeof req.body.data.options.user_id === "undefined"){
    callback({status:400, message:"NEED_USER_ID", response_display:{"title":"Code de téléchargement", "message":"Vos identifiants sont incorrects, si le problème persiste veuillez vous déconnecter puis vous reconnecter"}});
    return false;
  }
  var product = null,
      coupon = null,
      user = null;
  /* ON CHECK SI LE PRODUIT EXISTE BIEN */
  Products_controller.get(req.body.data, res, function(e){
    /* TODO ON CHECK SI L'UTILISATEUR A DEJA ACHETE CE PRODUIT */
    if(e.status === 200){
      Userproducts_controller.allreadyBuy(req.body.data.options.user_id, req.body.data.product_id, function(e){
        if(e.status === 200){
          /* L'UTILISATEUR TENTE D'ACHETER UN PRODUIT QU'iL A DEJA ACHETE */
          callback(
            {
              status:208,
              message:"PRODUCT_ALREADY_BUY",
              response_display : {
                "title":"Coupon Code Produit déjà ajouté !",
                "message":"Vous tentez d'ajouter un produit que vous avez déjà acheté !<br>rendez-vous sur votre compte pour le télécharger ou sur machanson.joyvox.fr/playlist pour l'écouter.",
                buttons:[
                  {
                    class:"btn-success",
                    label:"MES ACHATS",
                    href:app.locals.settings.host+"/account/orders",
                    target:"_blank",
                    value:"/account/orders"
                  },
                  {
                    class:"",
                    label:"PLAYLIST",
                    href:"/playlist",
                    target:"_blank",
                    value:"/playlist"
                  }
                ]
              }
            }
          );
        }else{
          /* ON CHECK SI LE COUPON EXISTE ET EST VALIDE */
          coupon_model.is_valid(req.body.data.coupon_code, req.body.data.coupon_id, function(e){
            if(e.status === 200){
              /* ON AJOUTE LE PRODUIT SUR L'UTILISATEUR */
              Userproducts_controller.create({
                user_id:req.body.data.options.user_id,
                product_id:req.body.data.product_id
              }, res, function(e){
                if(e.status === 200){
                  /* LE PRODUIT EST BIEN AJOUTE SUR L4UTILISATEUR */
                  /* SUCCESS PRODUCT COUPON CODE ADDED */
                  /* ON UTILISE LE COUPON POUR NE PLUS POUVOIR L'UTILISER */
                  coupon_model.useOne({_id:req.body.data.coupon_id, user_id:req.body.data.options.user_id}, function(e){
                    if(e.status === 200){
                      callback(
                        {
                          status:200,
                          message:"PRODUCT_ADDED",
                          response_display : {
                            "title":"Votre chanson !",
                            "message":"Votre chanson est à présent disponible sur votre playlist !<br>Votre code de téléchargement est à présent validé et ne peut plus être utilisé.",
                            buttons:[
                              {
                                class:"btn-success",
                                label:"PLAYLIST",
                                href:"http://machanson.joyvox.fr/playlist",
                                target:"_blank",
                                value:"/playlist"
                              }
                            ]
                          }
                        }
                      );
                    }else{
                      callback(
                        {
                          status:208,
                          message:"UNABLE_TO_USE_COUPON_CODE",
                          response_display:{
                            title:"ERREUR",
                            message:"une erreur est survenur, pas d'inquiètude, votre coupon code de téléchargement est toujours valide."
                          }
                        }
                      );
                    }
                  });

                }else{
                  /* ERROR PRODUCT COUPON CODE ADDED */
                  e.response_display = {title:"Coupon Code", message:"une erreur est survenur mais pas d'inquiètudes !<br>votre coupon code de téléchargement est toujours valide, vous pouvez toujours l'utiliser."};
                  callback(e);
                }
              });
            }else{
              callback({status:208, message:"WRONG_COUPON_CODE", response_display:{
                "title":"Coupon Code",
                "message":"Le coupon renseigné est invalide, veuillez en utiliser un autre.<br>Si vous n'avez jamais utilisé ce coupon, veuillez nous contacter pour en obtenir un nouveau.",
                "buttons":[
                  {
                    class:"btn-warning",
                    label:"NOUS CONTACTER",
                    href:app.locals.settings.host+"/contact",
                    target:"_blank",
                    value:"/account/contact"
                  }
                ]
              }});
            }
          });
        }
      });
    }
  });

  /*

  */
};
module.exports.createCharge = function(datas, res, callback){
  if(app.locals.settings.StripeMode){
    keyPublishable = app.locals.settings.StripekeyPublishable;
    keySecret = app.locals.settings.StripekeySecret;
  }else{
    keyPublishable = app.locals.settings.StripekeyPublishableTest;
    keySecret = app.locals.settings.StripekeySecretTest;
  }
  var stripe = require("stripe")(keySecret);

  if(typeof datas.basket_id === "undefined"){
    callback({status:401, message:"NEED_BASKET_ID"});
  }
  if(typeof datas.user_id === "undefined"){
    callback({status:401, message:"NEED_USER_ID"});
  }
  var amount = 0,
      reduced_amount = 0,
      self = this;
  /* TODO FIRST_STEP :::: GET BASKET MATCH USER_ID AND BASKET_ID */
  basket_model.get(datas, res, function(e){
    var basket = e.datas[0];
    if(e.status === 200){
      for(var i=0; i<e.datas[0].products.length; i++){
        amount+= e.datas[0].products[i].price;
      }
      reduced_amount = amount;
      if(typeof datas.coupons_code !== "undefined" && datas.coupons_code !== ""){
        //callback({status:401, message:"NEED_USER_ID"});
        var coupons_code = JSON.parse(datas.coupons_code);
        /* TODO CHECK ALL COUPONS CODE VALIDITY ATTRIBUTS */
        for(var i=0; i<coupons_code.length; i++){
          /* TODO GET COUPONS THEN USE IT FROM coupons_code[i]._id */
          reduced_amount-= coupons_code[i].amount;
        }
      }
      if(reduced_amount < 0){
        reduced_amount = 0;
      }
      const token = datas.stripeToken; // Using Express
      const charge = stripe.charges.create({
        amount: reduced_amount,
        currency: 'eur',
        description: 'payment ',
        source: token,
      }, function (err, charge) { // <-- callback
        if(err) {
          callback({status:401, message:"BASKET_DOESNT_MATCH", response_display:{"title":"Mon Panier", "message":"Nous ne pouvons finaliser l'opération car votre panier est introuvable."}});
          //callback({status:401, message:"STIPE_ERROR_CHARGES", err:err});
        }else {
          Orders.find().count().exec(function(err, infos){
            var count = infos;
            var bill_number = "FA";
                bill_number+= new Date(Date.now()).getFullYear().toString().substring(1,4);
                bill_number+= (count/1000000).toString().replace('0.', '');
            var new_order_datas = {
                basket_id         : datas.basket_id,
                user_id           : datas.user_id,
                stripeToken       : token,
                devise            : "eur",
                amount            : amount,
                reduced_amount    : reduced_amount,
                coupons_code      : coupons_code,
                bill_number       : bill_number,
                metadata          : basket,
                response          : charge,
                basketdatas       : e.datas[0],
                status            : 1
            }
            /* TODO ON UTILISE LES COUPONS S'IL Y EN A */
            //already_used      : {type:"bool", default:false},
            //is_valid
            if(typeof coupons_code !== "undefined"){
              for(var c=0; c<coupons_code.length; c++){
                coupon_model.useOne({_id:coupons_code[c].id, user_id:datas.user_id}, function(e){
                });
              }
            }
            /* TODO ON VIDE LE PANIER DE l'UTILISATEUR */
            basket_model.deleteUserBasket(datas.user_id, function(e){
            });
            self.create(new_order_datas, res, function(e){
              if(e.status === 200){
                Auth_model.getUserInfosFromOrderController(datas.user_id, function(e){
                  if(e.status === 200){
                    Email_controller.send(
                      null,
                      {
                        subject:"Votre facture Joyvox",
                        title:"Votre commande vient d'être validée !",
                        message:"Votre réglement pour la commande "+bill_number+" d'un montant de "+(charge.amount/100)+"€ a bien été pris en charge.<br>Pour plus d'informations et obetenir votre facture, rendez-vous sur <a href=\"https://auth.joyvox.fr/account/orders\">votre compte client dans la rubrique Achats</a>.<br>",
                        email:e.user.email,
                        to:e.user.email
                      },
                      function(e){
                      }
                    );

                    Email_controller.send(
                      null,
                      {
                        subject:"Nouvelle commande sur JOYVOX",
                        title:"UNE NOUVELLE COMMANDE VIENT D'ÊTRE RÉGLÉE SUR JOYVOX",
                        message:"Numéro de commande : "+bill_number+"<br>Montant : "+(charge.amount/100)+"€<br>a bien été pris en charge.<br>Pour plus d'informations et obetenir la facture, rendez-vous sur <a href=\"https://auth.joyvox.fr/admin\">Dans la rubrique facturation</a>.<br>",
                        email:"service.transaction@joyvox.fr",
                        to:"service.transaction@joyvox.fr"
                      },
                      function(e){
                      }
                    );
                  }
                });
                callback({status:200, datas:new_order_datas});
              }else{
                e.datas = new_order_datas;

                callback(e);
                /* GET USER INFOS IN DATAS ???? */
              }
            });
          });
        }
      });
    }else{
      callback({status:401, message:"BASKET_DOESNT_MATCH", response_display:{"title":"Mon Panier", "message":"Impossible de continuer car les paramètres de votre requête sont invalides."}});
    }
  });
}
module.exports.create = function(datas, res, callback){
    //var datas = {};
    new_order = new Orders(datas);
    new_order.save(function(err, infos){
        if(err){
          callback({"status":405, "message":err});
        }else{
          callback({"status":200, "datas":infos});
        }
    });

}
module.exports.update = function(req, res, callback){
    var datas = {};
    datas.updated = Date.now();
    Orders.updateOne(
        {
            _id     : ORDER_ID
        },
        {
            $set : datas
        },
        function(err, infos){
            if(err){
              callback({"status":405, "message":err});
            }
            else{
              callback({"status":200, "apps":infos});
            }
        }
    )
}
module.exports.delete = function(req, res, callback){
    callback({"status":401, "message":"UNAUTHORISED_METHOD"});
    /*
    Orders.deleteOne(
        {
            _id     : ORDER_ID
        },
        function(err, infos){
            if(err) callback({"status":405, "message":err});
            else callback({"status":200, "apps":infos});
        }
    )
    */
}
