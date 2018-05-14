const Userproducts_model = require('../models/userproducts_model');

exports.get = function(req, res, callback) {
    Userproducts_model.get(req, res, callback);
};
exports.allreadyBuy = function(user_id, product_id, callback){
  Userproducts_model.allreadyBuy(user_id, product_id, callback);
}
exports.checkorders = function(req, res, callback) {
    //Userproducts_model.create(req, res, callback);
};
exports.create = function(datas, res, callback) {
    //Userproducts_model.update(req, res, callback);
    Userproducts_model.create(datas, res, callback);
};
