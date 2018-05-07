// GOOGLE API KEY : AIzaSyB_MlYEDlRnNWYtrn-y63pbjrWecYaocqs
const db = require('mongoose'),
      config = require('../config/config'),
      basket_model = require('../models/basket_model'),
      wallets_model = require('../models/wallets_model'),
      coupon_model = require('../models/coupon_model'),
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
        query = {user_id : datas.user_id};
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
          console.log("coupons_code i :::: ", coupons_code[i]);
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
        //console.log('CALLBACK STRIPE CHARGE ');
        if(err) {
          //console.log("STRIPE ERROR HANDLER ", err);
          callback({status:401, message:"BASKET_DOESNT_MATCH"});
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
                coupon_model.useOne({id:coupons_code[c].id, user_id:datas.user_id}, function(e){
                  console.log('coupon used : ', e);
                });
              }
            }
            /* TODO ON VIDE LE PANIER DE l'UTILISATEUR */
            basket_model.deleteUserBasket(datas.user_id, function(e){
              console.log('BASKET DELETED ', e);
            });
            self.create(new_order_datas, res, function(e){
              if(e.status === 200){
                callback({status:200, datas:new_order_datas});
              }else{
                e.datas = new_order_datas;
                callback(e)
              }
            });
          });
        }
      });
    }else{
      callback({status:401, message:"BASKET_DOESNT_MATCH"});
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
