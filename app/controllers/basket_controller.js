const Basket_model = require('../models/basket_model'),
      auth_helper     = require('../helpers/auth_helper');

// check user login then return user_infos
exports.get = function(req, res, callback) {
    Basket_model.get(req.query, req, function(e){
        callback(e);
    });
};
exports.getAmount = function(req, res, callback) {
    Basket_model.getAmount(req.query, req, function(e){
        callback(e);
    });
};
// check user login then return user_infos
exports.create = function(datas, res, callback) {
  console.log('basket controller create ', datas);
    Basket_model.create(datas, res, function(e){
        callback(e);
    });
};
// check user logout then return user_infos
exports.update = function(req, res, callback) {
    Basket_model.update(req, res, function(e){
        callback(e);
    });
};
// check user register then return user_infos
exports.delete = function(req, res, callback) {
    Basket_model.delete(req, res, function(e){
        callback(e);
    });
};
