// GOOGLE API KEY : AIzaSyB_MlYEDlRnNWYtrn-y63pbjrWecYaocqs
const db = require('mongoose'),
      config = require('../config/config'),
      basket_datas = {
          products          : {type:"Object", datas:{
              product_id : {type:"string"},
              quantity   : {type:"number"},
              datas      : {type:"Object"}
          }},
          created           : {type:'Date', default: Date.now},
          updated           : {type:'Date', default: Date.now}
      };

if(db.connection.readyState === 0){
    db.connect(config.database.users, {useMongoClient: true});
}
const basketSchemas = new db.Schema(basket_datas),
      Baskets = db.model('Baskets', basketSchemas);

module.exports = {
    attributes: basket_datas
};
module.exports.get = function(req, res, callback){
    var query = {};
    Baskets.find(query, function(err, infos){
        if(err){
            callback({status:405, datas:err});
        }else{
            callback({status:200, datas:infos});
        }
    });
}
module.exports.create = function(req, res, callback){
    var _self = this;
    datas.secret = jwt.sign({secret:user_id}, config.secrets.global.secret);
    datas.token = jwt.sign({secret:user_id+Date.now()}, config.secrets.global.secret);
    new_basket = new Baskets(datas);
    new_basket.save(function(err, infos){
        if(err){
          callback({"status":405, "message":err});
        }else{
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
