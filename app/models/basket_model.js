// GOOGLE API KEY : AIzaSyB_MlYEDlRnNWYtrn-y63pbjrWecYaocqs
const db = require('mongoose'),
      products_controller = require('../controllers/products_controller'),
      config = require('../config/config'),
      _ = require('underscore'),
      basket_datas = {
          user_id        : {type:"string"},
          products       : {type:[], datas:
              {
                _id        : {type:"Schema.ObjectId"},
                product_id : {type:"string", unique:true},
                quantity   : {type:"number", default:1},
                datas      : {type:[]}, // push all products datas prperties
                price      : {type:"Number"},
                total      : {type:"Number"},
                created    : {type:'Date', default: Date.now}, // date d'jout au panier
                updated    : {type:'Date', default: Date.now}
              }
          },
          total          : {type:'number', default:0.00},
          created        : {type:'Date', default: Date.now},
          updated        : {type:'Date', default: Date.now}
      };

if(db.connection.readyState === 0){
    db.connect(config.database.users, {useMongoClient: true});
}
const basketSchemas = new db.Schema(basket_datas),
      Baskets = db.model('Baskets', basketSchemas);

module.exports = {
    attributes: basket_datas
};
module.exports.get = function(datas, req, callback) {
    //TODO EXECPT IS ADMIN WITH BASKET ID ONLY
    var query = {};
    if(datas.isAdmin && typeof datas.basket_id !== "undefined"){
        query = {_id : datas.basket_id};
    }else if(typeof datas.options !== "undefined"){
        if(typeof datas.options.user_id !== "undefined"){
          query = {user_id : datas.options.user_id};
        }
    }else if(typeof req.session.Auth !== "undefined"){
        query = {user_id : req.session.Auth._id};
    }else{
        callback({status:401, message:"NOT_LOGGED_IN"});
        return false;
    }
    Baskets.find(query, function(err, infos){
        if(err){
            callback({status:401, datas:err});
        }else{
            infos.forEach(function(basket){
              basket.products.forEach(function(product){
                products_controller.get({product_id : product.product_id}, req, function(e){
                  product.infos = e.datas[0];
                });
              });
            });
            //_.findWhere(infos, {id: id});
            setTimeout(function(){
              callback({status:200, datas:infos});
            }, 10);
        }
    });
}
module.exports.create = function(datas, res, callback) {
  //TODO on check si le produit existe....
  var _self = this,
      product_infos = null;
  products_controller.get(datas, res, function(e){
    if(e.status === 200){
      product_infos = e.datas[0];
      if(typeof datas.options.user_id === "undefined") {
        callback({"status":405, "message":"user not defined"});
        return false;
      }
      /* TODO CHECK IF USER ALREADY HAS A BASKET NOT VALIDATED */
      _self.get(datas, res, function(e){
        if(e.status === 200 && e.datas.length > 0){
          var basket = e.datas[0];
          // l'utilisateur à déjà un panier en cours
          /* ON AJOUTE LES PRODUITS DANS LA LISTE ET ON FAIT UN ARRAY MERGE sur products */
          if(typeof datas.product_id !== "undefined"){
            var already_exist = _.where(basket.products, {product_id:datas.product_id});
            if(already_exist.length > 0) {
              already_exist = already_exist[0];
              /* LE PRODUIT EST DEJA DANS LE PANIER on incrémente la quantité ?*/
              already_exist.quantity++;
              // on met à jour les totaux...
              already_exist.total = parseFloat(already_exist.price) * parseInt(already_exist.quantity);
              // on met à jour la date de checking du produit...
              already_exist.updated = Date.now();
            }else {
              // on push le nouveau produit dans products.
              basket.products.push({
                product_id : datas.product_id,
                datas      : datas.datas, // push all products datas prperties
                price      : product_infos.price, // TODO GET PRODUCT PRICE UPDATED
                total      : (parseFloat(product_infos.price) * parseInt(datas.quantity)).toFixed(2), // TODO GET PRODUCT PRICE UPDATED * quantity
                created    : Date.now(), // date d'jout au panier
                updated    : Date.now()
              });
            }

            /* ON MET A JOUR LE PANIER APRES LES TRAITEMENTS DE L'OBJET BASKET */
            basket.updated = Date.now();
            Baskets.updateOne(
                {
                    _id  : basket._id
                },
                {
                    $set : basket
                },
                function(err, infos){
                    if(err){
                      callback({"status":405, "message":err});
                    }
                    else{
                      callback({"status":200, "datas":infos});
                    }
                }
            );
          }
        }else {
          var data_set = {
              user_id        : datas.options.user_id,
              products       : [
                  {
                    product_id : datas.product_id,
                    quantity   : datas.quantity,
                    datas      : datas.datas, // push all products datas prperties
                    price      : product_infos.price,
                    total      : (parseFloat(product_infos.price)*parseFloat(datas.quantity)).toFixed(2),
                    created    : Date.now(), // date d'jout au panier
                    updated    : Date.now()
                  }
              ],
              total          : (parseFloat(product_infos.price)*parseFloat(datas.quantity)).toFixed(2),
              created        : Date.now(),
              updated        : Date.now()
          }
          /* ELSE CREATE BASKET */
          new_basket = new Baskets(data_set);
          new_basket.save(function(err, infos) {
              if(err) {
                callback({"status":405, "message":err});
              }else {
                callback({"status":200, "datas":infos});
              }
          });
        }
      });
    }else{
      callback(e);
    }
  });
}
module.exports.update = function(req, res, callback){
    delete datas.options;
    delete datas._id;
    var _self = this;
    datas.updated = Date.now();
    Baskets.updateOne(
        {
            _id     : req.body._id
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
    Baskets.deleteOne(
        {
            _id     : req.body._id
        },
        function(err, infos){
            if(err) callback({"status":405, "message":err});
            else callback({"status":200, "apps":infos});
        }
    )
}
