const Basket_model = require('../models/basket_model'),
      auth_helper     = require('../helpers/auth_helper');

// check user login then return user_infos
exports.get = function(req, datas, callback) {
    Basket_model.get(req, datas, function(e){
        callback(e);
    });
};
// check user login then return user_infos
exports.create = function(req, datas, callback) {
    Basket_model.create(req.session.Auth._id, req.body, function(e){
        callback(e);
    });
};
// check user logout then return user_infos
exports.update = function(req, datas, callback) {
    Basket_model.update(req.session.Auth._id, req.body._id, req.body, function(e){
        callback(e);
    });
};
// check user register then return user_infos
exports.deleting = function(req, res, callback) {
    Basket_model.deleting(req.session.Auth._id, req.body._id, function(e){
        callback(e);
    });
};
