// GOOGLE API KEY : AIzaSyB_MlYEDlRnNWYtrn-y63pbjrWecYaocqs
const db = require('mongoose'),
      config = require('../config/config'),
      wallet_datas = {
          basket_id         : {type:"string"},
          amount            : {type:"Number"},
          created           : {type:'Date', default: Date.now},
          updated           : {type:'Date', default: Date.now}
      };

if(db.connection.readyState === 0) {
    db.connect(config.database.users, {useMongoClient: true});
}
const walletsSchemas = new db.Schema(wallet_datas),
      Wallets = db.model('Wallets', walletsSchemas);

module.exports = {
    attributes: wallet_datas
};
module.exports.get = function(req, res, callback) {
    var query = {};
    Wallets.find(query, function(err, infos){
        if(err){
            callback({status:405, datas:err});
        }else{
            callback({status:200, datas:infos});
        }
    });
};
module.exports.create = function(req, res, callback) {
    var datas = {};
    new_wallet = new Orders(datas);
    new_wallet.save(function(err, infos){
        if(err){
          callback({"status":405, "message":err});
        }else{
          callback({"status":200, "datas":infos});
        }
    });
};
module.exports.update = function(req, res, callback) {
    var datas = {};
    datas.updated = Date.now();
    Wallets.updateOne(
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
};
module.exports.delete = function(req, res, callback) {
    Wallets.deleteOne(
        {
            _id     : ORDER_ID
        },
        function(err, infos){
            if(err) callback({"status":405, "message":err});
            else callback({"status":200, "apps":infos});
        }
    )
};
