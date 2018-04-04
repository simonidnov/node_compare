const Basket_model = require('../models/basket_model'),
      Orders_model = require('../models/orders_model'),
      auth_helper     = require('../helpers/auth_helper');

// check user login then return user_infos
exports.get = function(req, res, callback) {
    Orders_model.get(req, res, function(e){
        callback(e);
    });
};
// check user login then return user_infos
exports.create = function(req, res, callback) {
    Orders_model.create(req, res, function(e){
        callback(e);
    });
};
// check user logout then return user_infos
exports.update = function(req, res, callback) {
    Orders_model.update(req, res, function(e){
        callback(e);
    });
};
// check user register then return user_infos
exports.deleting = function(req, res, callback) {
    Orders_model.deleting(req, res, function(e){
        callback(e);
    });
};
