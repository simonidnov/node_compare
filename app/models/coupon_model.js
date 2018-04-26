// GOOGLE API KEY : AIzaSyB_MlYEDlRnNWYtrn-y63pbjrWecYaocqs
const db = require('mongoose'),
      config = require('../config/config'),
      cc = require('coupon-code'),
      coupons_datas = {
          offer             : {type:"string"},
          label             : {type:"string"},
          description       : {type:"string"},
          code              : {type:"string"},
          amount            : {type:"number"},
          parts             : {type:"number", default:1},
          partLen           : {type:"number", default:4},
          admin_id          : {type:"string"},
          user_id           : {type:"string"},
          already_used      : {type:"bool", default:false},
          is_valid          : {type:"bool", default:true},
          created           : {type:'Date', default: Date.now},
          updated           : {type:'Date', default: Date.now}
      };

if(db.connection.readyState === 0){
    db.connect(config.database.users, {useMongoClient: true});
}
const couponsSchemas = new db.Schema(coupons_datas),
      Coupon = db.model('Coupons', couponsSchemas);

module.exports = {
    attributes: coupons_datas
};
module.exports.get = function(req, res, callback){
    var query = {};
    if(typeof req.params.offer !== "undefined"){
      query.offer = req.params.offer;
    }
    if(typeof req.query.code !== "undefined"){
      query.code = req.query.code;
      query.is_valid = 1;
      query.already_used = 0;
    }
    Coupon.find(query, function(err, infos) {
        if(err){
            callback({status:405, datas:err});
        }else{
            callback({status:200, datas:infos});
        }
    });
};
module.exports.getOffers = function(req, res, callback){
    Coupon.aggregate([
    		{
          "$group" : {
            _id:"$offer",
            count: {
              $sum:1
            },
            already_used: {
              $sum:{
                $cond : [ "$already_used", 1, 0 ]
              }
            },
            is_valid: {
              $sum:{
                $cond : [ "$is_valid", 1, 0 ]
              }
            }
          }
        }
      ], function(err, infos){
        if(err){
            callback({status:405, datas:err});
        }else{
            callback({status:200, datas:infos});
        }
    });
};
module.exports.getOffersCSV = function(req, res, callback){
  if(typeof req.params.offer === "undefined"){
    callback({"status":405, response_display:{title:"COUPON_ERROR", message:"COUPON_NEED_OFFER_NAME", body_datas:req.params}});
  }else{
    var query = {offer:req.params.offer}
  }
  Coupon.find(query, function(err, infos) {
      if(err){
          callback({status:405, datas:err});
      }else{
          callback({status:200, datas:infos});
      }
  });
}
module.exports.createOffer = function(req, res, callback){
    var body_datas = req.body;
    if(typeof body_datas.data !== "undefined"){
      body_datas = req.body.data;
    }
    if(typeof body_datas.offer === "undefined"){
      callback({"status":405, response_display:{title:"COUPON_ERROR", message:"COUPON_NEED_OFFER_NAME", body_datas:body_datas}});
    }
    if(typeof body_datas.label === "undefined"){
      callback({"status":405, response_display:{title:"COUPON_ERROR", message:"COUPON_NEED_LABEL"}});
    }
    if(typeof body_datas.description === "undefined"){
      callback({"status":405, response_display:{title:"COUPON_ERROR", message:"COUPON_NEED_DESCRIPTION"}});
    }
    if(typeof body_datas.quantity === "undefined"){
      callback({"status":405, response_display:{title:"COUPON_ERROR", message:"COUPON_NEED_QUANTITY"}});
    }
    if(typeof body_datas.parts === "undefined"){
      callback({"status":405, response_display:{title:"COUPON_ERROR", message:"COUPON_PARTS"}});
    }
    if(typeof body_datas.partLen === "undefined"){
      callback({"status":405, response_display:{title:"COUPON_ERROR", message:"COUPON_PARTLEN"}});
    }
    if(typeof body_datas.amount === "undefined"){
      callback({"status":405, response_display:{title:"COUPON_ERROR", message:"COUPON_AMOUNT"}});
    }

    var errors_array = 0,
        success_array = 0;
    for(var i=0; i<body_datas.quantity; i++){
      var new_coupon_datas = {
        offer : body_datas.offer,
        label : body_datas.label,
        description : body_datas.description,
        code : cc.generate({parts : body_datas.parts, partLen:body_datas.partLen}),
        amount : body_datas.amount,
        admin_id : req.session.Auth._id,
        parts : body_datas.parts,
        partLen : body_datas.partLen,
        already_used : false,
        is_valid : true
      }
      new_coupon = new Coupon(new_coupon_datas);
      new_coupon.save(function(err, infos){
          if(err){
            errors_array++;
          } else{
            success_array++;
          }
      });
      if(i === body_datas.quantity-1){
        callback(
          {
            "status":200,
            "errors":errors_array,
            "success":success_array,
            "total":success_array,
            "percent":((body_datas.quantity/success_array)*100),
            "quantity":body_datas.quantity,
            "response_display":{
              "title":"Coupons créés",
              "message":body_datas.quantity+" Coupons viennent d'être créés | "+errors_array+" erreurs détectées"
            }
          }
        );
      }
    }
};
module.exports.create = function(req, res, callback){
    var datas = req.body;
    delete datas.options;
    delete datas._id;
    delete datas.user;
    new_coupon = new Coupon(req.body);
    new_coupon.save(function(err, infos){
        if(err) callback({"status":405, "message":err});
        else callback({"status":200, "datas":infos});
    });
};
module.exports.update = function(req, res, callback){
    req.body.updated = Date.now();
    Coupon.updateOne(
        {
            _id  : req.body.coupon_id
        },
        {
            $set : req.body
        },
        function(err, infos){
            if(err) callback({"status":304, "message":err});
            else callback({"status":200, "datas":infos});
        }
    )
};
module.exports.updateAmount = function(req, res, callback){
    Coupon.updateMany(
       {
          offer: "chansonspersonnalisees"
       },
       {
          $set :{
            amount: 499
          }
       }
    ).exec(function(err, infos){
        callback({"status":200, "datas":infos});
    });
}
module.exports.delete = function(req, res, callback){
    var query = {};
    if(typeof req.body.offer !== "undefined"){
      query.offer = req.body.offer;
    }
    if(typeof req.body.coupon_id !== "undefined"){
      query._id = req.body.coupon_id;
    }
    if(typeof req.body.code !== "undefined"){
      query.code = req.body.code;
    }
    Coupon.deleteMany(
        query,
        function(err, infos){
            if(err) callback({"status":405, "message":err});
            else callback({"status":200, "pages":infos});
        }
    )
};
