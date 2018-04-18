// GOOGLE API KEY : AIzaSyB_MlYEDlRnNWYtrn-y63pbjrWecYaocqs
const db = require('mongoose'),
      products_controller = require('products_controller'),
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
module.exports.get = function(req, res, callback) {
    //TODO EXECPT IS ADMIN WITH BASKET ID ONLY
    var query = {};
    if(req.isAdmin && typeof req.query.basket_id !== "undefined"){
        query = {_id : req.query.basket_id};
    }else if(typeof req.query.user_id !== "undefined"){
        query = {user_id : req.query.user_id};
    }else{
        callback({status:405, message:"NOT_LOGGED_IN"});
        return false;
    }
    Baskets.find(query, function(err, infos){
        if(err){
            callback({status:405, datas:err});
        }else{
            callback({status:200, datas:infos});
        }
    });
}
module.exports.create = function(req, res, callback) {
  //TODO on check si le produit existe....
  products_controller.get(res, res, function(e){

  });
  next();
}, function(){
    var _self = this;
    /* TODO CHECK ALL REFERENCE OF jwt.sign IN PROJECT, THERE IS NO WAY TO PUT IT HERE */
    //datas.secret = jwt.sign({secret:user_id}, config.secrets.global.secret);
    //datas.token = jwt.sign({secret:user_id+Date.now()}, config.secrets.global.secret);
    if(typeof req.body.user_id === "undefined") {
      callback({"status":405, "message":"user not defined"});
      return false;
    }
    /* TODO CHECK IF USER ALREADY HAS A BASKET NOT VALIDATED */
    this.get(req, res, function(e){
      if(e.status === 200 && e.datas.length > 0){
        var basket = e.datas;
        // l'utilisateur à déjà un panier en cours
        /* ON AJOUTE LES PRODUITS DANS LA LISTE ET ON FAIT UN ARRAY MERGE sur products */
        if(typeof req.query.product_id !== "undefined"){
          var already_exist = _.where(basket.products, {product_id:req.query.product_id});
          if(already_exist.length > 0) {
            /* LE PRODUIT EST DEJA DANS LE PANIER on incrémente la quantité ?*/
            already_exist.quantity.length++;
            // on met à jour les totaux...
            already_exist.total = already_exist.price*already_exist.quantity;
            // on met à jour la date de checking du produit...
            already_exist.updated = Date.now();
          }else {
            // on push le nouveau produit dans products.
            basket.products.push({
              product_id : req.query.product_id,
              quantity   : req.query.quantity,
              datas      : req.query.datas, // push all products datas prperties
              price      : 0, // TODO GET PRODUCT PRICE UPDATED
              total      : 0, // TODO GET PRODUCT PRICE UPDATED * quantity
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
                    callback({"status":200, "apps":infos});
                  }
              }
          )
        }
      }else{
        // on crée un nouveau panier...
        next();
      }
    });
}, function(req, res, callback) {

    /* ELSE CREATE BASKET */
    new_basket = new Baskets(datas);
    new_basket.save(function(err, infos) {
        if(err) {
          callback({"status":405, "message":err});
        }else {
          callback({"status":200, "datas":infos});
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
