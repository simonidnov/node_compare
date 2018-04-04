// GOOGLE API KEY : AIzaSyB_MlYEDlRnNWYtrn-y63pbjrWecYaocqs
const db = require('mongoose'),
      config = require('../config/config'),
      order_datas = {
          basket_id         : {type:"string"},
          created           : {type:'Date', default: Date.now},
          updated           : {type:'Date', default: Date.now}
      };

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
    Orders.find(query, function(err, infos){
        if(err){
            callback({status:405, datas:err});
        }else{
            callback({status:200, datas:infos});
        }
    });
}
module.exports.create = function(req, res, callback){
    var datas = {};
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
    Orders.deleteOne(
        {
            _id     : ORDER_ID
        },
        function(err, infos){
            if(err) callback({"status":405, "message":err});
            else callback({"status":200, "apps":infos});
        }
    )
}
