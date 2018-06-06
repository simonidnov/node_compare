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
      },
      usershare_datas = {
          user_id           : {type:"string"},
          product_id        : {type:"string"},
          share_name        : {type:"string"},
          share_email       : {type:"string"},
          share_message     : {type:"string"},
          share_link        : {type:"string"},
          share_later       : {type:"boolean", default:false},
          share_date        : {type:"Date"},
          share_sent        : {type:"boolean", default:false},
          created           : {type:'Date', default: Date.now},
          updated           : {type:'Date', default: Date.now}
      };

if(db.connection.readyState === 0){
    db.connect(config.database.users, {useMongoClient: true});
}
const userproductsSchemas = new db.Schema(userproducts_datas),
      Userproducts = db.model('Userproducts', userproductsSchemas),
      usershareSchemas = new db.Schema(usershare_datas),
      Usershares = db.model('Usershares', usershareSchemas);

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
        if(typeof req.query.product_id !== "undefined"){
          query.product_id = req.query.product_id;
        }
    req.user_id = query.user_id;
    self.checkOrders(req, res, function(e){
      Userproducts.find(query, function(err, userproducts){
        if(err){
            callback({status:405, datas:err});
            return false;
        }else{
          callback({status:200, datas:userproducts});
          return false;
        }
      }).sort({'created':-1});
    });

};
module.exports.allreadyBuy = function(user_id, product_id, callback){
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
          if(typeof e.datas[i].refund !== "undefined"){
            if(e.datas[i].refund.code === "charge_already_refunded" || typeof e.datas[i].refund.status === "succeeded"){
              self.remove({
                user_id : req.user_id,
                product_id :e.datas[i].basketdatas.products[p].product_id
              }, res, function(e){
              });
            }
          }else{
            self.create({
              user_id : req.user_id,
              product_id :e.datas[i].basketdatas.products[p].product_id
            }, res, function(e){
            });
          }
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
module.exports.remove = function(datas, res, callback){
    Userproducts.deleteOne(
      {
        user_id:datas.user_id,
        product_id:datas.product_id
      },
      function(err, infos){
        if(err || infos.length === 0){
          callback({"status":401, "err":err, "message":"PRODUCT_DELETED_ERROR"});
        }else{
          callback({"status":201, "datas":infos, "message":"PRODUCT_DELETED"});
        }
      }
    );
};
module.exports.getShare = function(req, res, callback){
  Usershares.find({
    share_email: req.params.user_email,
    product_id: req.params.product_id,
    _id: req.params.share_id,
  }, function(err, share){
      if(err) callback({status:404, message:"UNKNOW_SHARE_CONTENT"});
      else{
        if(share.length === 0){
          callback({status:404, message:"UNKNOW_SHARE_CONTENT"});
        }else{
          Products_model.get({product_id:share[0].product_id}, res, function(e){
            callback({status:200, datas:{share:share[0], product:e.datas[0]}});
          });
        }
      }
  });
}
module.exports.shares_of_the_day = function(req, res, callback){
  var currentDate = new Date();

  /* PATCH WRONG DATES WHEN SHARE_LATER NOT DEFINED */
  Usershares.find(
    {
      share_date: {
        $not: {
          $type: 9
        }
      }
    }, function(err, data){
      data.forEach(function(doc, index){
        if(doc.share_date === null){
          doc.share_date = new Date();
        }
        doc.share_date = new Date(doc.share_date);
        Usershares.update(
          {
            _id:doc._id
          },
          {
            $set:{
              share_date : doc.share_date
            }
          },
          function(err, updates){
          }
        );
      });
    }
  );
  /* GET SHARE OF THE DAY AGGREGATION ,
  TODO ADD :::: share_sent : false :::: TO PATCH BLOCK REDONDANCE */
  Usershares.aggregate(
  [
  	{
  		$project: {
  		    day               : {$dayOfMonth: "$share_date"},
  		    month             : {$month: "$share_date"},
  		    year              : {$year: "$share_date"},
          user_id           : "$user_id",
          product_id        : "$product_id",
          share_name        : "$share_name",
          share_email       : "$share_email",
          share_message     : "$share_message",
          share_link        : "$share_link",
          share_later       : "$share_later",
          share_date        : "$share_date",
          share_sent        : "$share_sent",
          created           : "$created",
          updated           : "$updated"
  		},
  	},
  	{
  		$match: {
        day: currentDate.getDate(),
        month: currentDate.getMonth() + 1,
        share_later : true
  		}
  	}
  ],
  function(err, shares){
    if(err) callback({status:500, message:"ERROR_OCCURED_REQUEST", err:err});
    else{
      var count = 0,
          total = shares.length,
          success = 0;

      if(shares.length === 0){
        callback({status:200, message:"NO_EMAILS_FOR_TODAY", shares:shares});
      }else{
        var Email_controller = require("../controllers/email_controller"),
            Auth_controller = require("../controllers/auth_controller");
        shares.forEach(function(share, index){
          req.query.user = {
            _id:share.user_id
          };
          Auth_controller.getUserInfos(req, res, function(e){
            if(e.status === 200){
              var user = e.user[0];
              var options = { month: 'long', day: 'numeric' };
              var date_send = new Date(share.share_date).toLocaleDateString('fr-FR', options);
              Email_controller.sendMaChansonEcard(
                req,
                {
                  subject:"Bonjour "+share.share_name+", "+user.pseudo+" vous souhaite un joyeux anniversaire en chanson",
                  title:"Bonjour "+share.share_name+", "+user.pseudo+" vous souhaite un joyeux anniversaire en chanson",
                  name:share.share_name,
                  friend:user.pseudo,
                  friend_email:user.email,
                  default_message:"Bonjour "+share.share_name+",<br>votre ami(e) "+user.pseudo+" vous souhaite un joyeux anniversaire en chanson !",
                  message:share.share_message,
                  product_id:share.product_id,
                  share_id:share._id,
                  email:user.email,
                  to:share.share_email
                },
                function(e) {
                  if(e.status === 200){
                    Usershares.update(
                      {
                        _id:share._id
                      },
                      {
                        $set:{
                          share_sent : true
                        }
                      },
                      function(err, updates){
                      }
                    );
                    success++;
                    Email_controller.send(
                      null,
                      {
                        subject:"La chanson d'anniversaire personnalisée pour "+share.share_name+" à bien été envoyée",
                        title:"La chanson d'anniversaire personnalisée pour "+share.share_name+" à bien été envoyée",
                        message:"Bonjour "+user.pseudo+"<br>Vous avez envoyé une chanson d'anniversaire pour votre ami(e) "+share.share_name+".<br>Cet email confirme l'envoi de votre chanson sur l'adresse email de votre ami(e) : "+share.share_email+"<br>Voici votre message personnalisé qui accompagnera la chanson :<br>"+share.share_message,
                        email:"contact@joyvox.fr",
                        share_id:share._id,
                        to:user.email
                      },
                      function(e) {
                      }
                    );
                  }
                  count++;
                  if(count === total-1){
                    callback({status:200, message:"EMAILS_SENT", total:total, success:success});
                  }
                }
              );
            }else{
              count++;
              if(count === total-1){
                callback({status:200, message:"EMAILS_SENT", total:total, success:success});
              }
            }
          });
        });
      }
    }
  });
}
module.exports.share = function(req, res, callback){
  var datas = req.body.data;
  Userproducts.find({user_id:datas.options.user_id, product_id:datas.product_id}, function(err, userproducts){
    if(err) callback({status:200, message:"ERROR_PRODUCT_GET", response_display:{title:"Erreur de partage", message:"Il semble que vous n'ayez pas acheté le produit que vous souhaitez partager."}});
    else {
      if(userproducts.length === 0){
        callback({status:200, message:"UNKNOW_USER_PRODUCT", response_display:{title:"Erreur de Partage", message:"Il semble que vous n'ayez pas acheté le produit que vous souhaitez partager."}});
      }else{
        var Email_controller = require("../controllers/email_controller"),
            Auth_controller = require("../controllers/auth_controller");

        req.query.user = {
          _id:datas.options.user_id
        };
        Auth_controller.getUserInfos(req, res, function(e){
          if(e.status === 200){
            var user = e.user[0];
            var data_share = {

            };
            new_shareproduct = new Usershares({
              user_id           : e.user[0]._id,
              product_id        : datas.product_id,
              share_name        : datas.share_name,
              share_email       : datas.share_email,
              share_message     : datas.share_message,
              share_link        : datas.share_link,
              share_date        : (datas.share_date)? datas.share_date : new Date(),
              share_later       : datas.share_later
            });
            new_shareproduct.save(function(err, infos){
                if(err){
                  callback({"status":200, "datas":e.datas, "response_display":{"title":"Erreur de Partage", "message":"Une erreur est survenue lors du partage de votre chanson personnalisée, nous vous conseillons de la télécharger et de l'envoyer manuellement.<br>Il est possible que nous n'arrivions pas à joindre la boite mail de votre ami(e)."}});
                }else{
                  //callback({"status":200, "datas":infos});
                  if(datas.share_later === 'true'){
                    var options = { month: 'long', day: 'numeric' };
                    var date_send = new Date(datas.share_date).toLocaleDateString('fr-FR', options);
                    Email_controller.send(
                      null,
                      {
                        subject:"L'envoi de la chanson d'anniversaire personnalisée pour "+datas.share_name+" à bien été configuré",
                        title:"L'envoi de votre chanson d'anniversaire à bien été configuré",
                        message:"Bonjour "+user.pseudo+"<br>Vous avez configuré l'envoi d'une chanson d'anniversaire pour votre ami(e) "+datas.share_name+" pour le "+date_send+".<br>Cet email confirme que l'email sera envoyé à 9h00 ce jour précis sur l'adresse email de votre ami(e) : "+datas.share_email+"<br>Voici votre message personnalisé qui accompagnera la chanson :<br>"+datas.share_message,
                        email:"contact@joyvox.fr",
                        share_id:infos._id,
                        to:user.email
                      },
                      function(e) {
                        callback({"status":200, "datas":e.datas, "response_display":{"title":"Partager", "message":"Le partage de la chanson d'anniversaire pour "+datas.share_name+" a bien été configurée, elle sera envoyé à votre ami(e) sur son email "+datas.share_email+" le "+date_send+" !"}});
                      }
                    );
                  }else{
                    Email_controller.sendMaChansonEcard(
                      req,
                      {
                        subject:"Bonjour "+datas.share_name+", "+user.pseudo+" vous souhaite un joyeux anniversaire en chanson",
                        title:"Bonjour "+datas.share_name+", "+user.pseudo+" vous souhaite un joyeux anniversaire en chanson",
                        default_message:"Bonjour "+datas.share_name+",<br>votre ami(e) "+user.pseudo+" vous souhaite un joyeux anniversaire en chanson !",
                        message:datas.share_message,
                        friend:user.pseudo,
                        friend_email:user.email,
                        product_id:datas.product_id,
                        share_id:infos._id,
                        email:user.email,
                        to:datas.share_email
                      },
                      function(e) {
                        if(e.status === 200){
                          Email_controller.send(
                            null,
                            {
                              subject:"La chanson d'anniversaire personnalisée pour "+datas.share_name+" à bien été envoyée",
                              title:"La chanson d'anniversaire personnalisée pour "+datas.share_name+" à bien été envoyée",
                              message:"Bonjour "+user.pseudo+"<br>Vous avez envoyé une chanson d'anniversaire pour votre ami(e) "+datas.share_name+".<br>Cet email confirme l'envoi de votre chanson sur l'adresse email de votre ami(e) : "+datas.share_email+"<br>Voici votre message personnalisé qui accompagnera la chanson :<br>"+datas.share_message,
                              email:"contact@joyvox.fr",
                              share_id:infos._id,
                              to:user.email
                            },
                            function(e) {
                              callback({"status":200, "datas":e.datas, "response_display":{"title":"Partager ma chanson", "message":"La chanson a bien été envoyée à "+datas.share_name+" sur son adresse email "+datas.share_email+" !"}});
                            }
                          );
                        }else{
                          callback({"status":203, "datas":e.datas, "response_display":{"title":"Erreur de Partage", "message":"Nous n'avons pas réussi à envoyer la chanson à votre ami(e)."}});
                        }
                      }
                    );
                  }
                }
            });
          }else{
            callback({"status":203, "datas":e.datas, "response_display":{"title":"Erreur de Partage", "message":"Nous n'avons pas réussi à vous authentifier pour créer l'envoi de votre chanson."}});
          }
        });
      }
    }
  });
}
