// GOOGLE API KEY : AIzaSyB_MlYEDlRnNWYtrn-y63pbjrWecYaocqs
const db = require('mongoose'),
      config = require('../config/config'),
      Orders_model = require('../models/orders_model'),
      Products_model = require('../models/products_model'),
      userproducts_datas = {
          user_id           : {type:"string"},
          product_id        : {type:"string"},
          meta_datas        : {type:"Object"},
          created           : {type:'Date', default: Date.now},
          updated           : {type:'Date', default: Date.now}
      };

if(db.connection.readyState === 0){
    db.connect(config.database.users, {useMongoClient: true});
}
const userproductsSchemas = new db.Schema(userproducts_datas),
      Userproducts = db.model('Userproducts', userproductsSchemas);

module.exports = {
    attributes: userproducts_datas
};
module.exports.get = function(req, res, callback){
    var query = {},
        self = this;

        if(typeof req.session.Auth !== "undefined"){
            query = {user_id : req.session.Auth._id};
        }else if(typeof req.query.user_id !== "undefined"){
            query = {user_id : datas.user_id};
        }else if(typeof req.query.options !== "undefined"){
          query = {user_id:req.query.options.user_id}
        }
        if(typeof query.user_id === "undefined"){
          callback({status:401, datas:{message:"UNAUTHORISED_NEED_USER"}});
          return false;
        }
    req.user_id = query.user_id;
    self.checkOrders(req, res, function(e){
      Userproducts.find(query, function(err, userproducts){
        if(err){
            callback({status:405, datas:err});
            return false;
        }else{
          /*
          for(var num=0; num<userproducts.length; num++){
            Products_model.get(userproducts[num], res, function(e){
              console.log(e.datas);
              //infos[d].details = e.datas;
              if(num === userproducts.length - 1){
                console.log("num === userproducts.length >< ", num, " length = ", userproducts.length);

              }
            });
          }
          */
          callback({status:200, datas:userproducts});
          return false;
        }
      }).sort({'created':-1});
    });

};
module.exports.allreadyBuy = function(user_id, product_id, callback){
  console.log('allreadyBuy');
  Userproducts.findOne(
    {
      user_id:user_id,
      product_id:product_id
    },
    function(err, hasone){
      if(err) callback({status:404, message:"NEVER_BUY"});
      else{
        if(hasone === null){
          callback({status:404, message:"NEVER_BUY", datas:hasone});
        }else{
          callback({status:200, message:"ALREADY_BUY", datas:hasone});
        }
      }
    }
  );
};
module.exports.checkOrders = function(req, res, callback){
  var self = this;
  Orders_model.get(req, res, function(e){
    if(e.status === 200){
      for(var i=0; i<e.datas.length; i++){
        for(var p=0; p<e.datas[i].basketdatas.products.length; p++){
          self.create({
            user_id : req.user_id,
            product_id :e.datas[i].basketdatas.products[p].product_id
          }, res, function(e){
          });
        }
      }
      //callback(e);
    }else{

    }
  });
  callback({status:200, message:"CHECKING"});
}
module.exports.create = function(datas, res, callback){
    Userproducts.find(
      {
        user_id:datas.user_id,
        product_id:datas.product_id
      },
      function(err, infos){
        if(err || infos.length === 0){
          Products_model.get({product_id:datas.product_id}, res, function(e){
            //infos[d].details = e.datas;
            new_userproduct = new Userproducts({
              user_id:datas.user_id,
              product_id:datas.product_id,
              meta_datas:e.datas[0]
            });
            new_userproduct.save(function(err, infos){
                if(err){
                  callback({"status":405, "message":err});
                }else{
                  callback({"status":200, "datas":infos});
                }
            });
          });
        }else{
          callback({"status":201, "datas":infos, "message":"ALREADY_ADDED_PRODUCT_ON_USER"});
        }
      }
    );
};
