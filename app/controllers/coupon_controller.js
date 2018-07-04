const Coupon_model = require('../models/coupon_model'),
      Auth_helper = require('coupon-code');

// check user login then return user_infos
exports.get = function(req, res, callback) {
    Coupon_model.get(req, res, function(e){
        callback(e);
    });
};
exports.updateAmount = function(req, res, callback){
  Coupon_model.updateAmount(req, res, function(e){
      callback(e);
  });
};
exports.getOffersCSV = function(req, res, callback){
    Coupon_model.getOffersCSV(req, res, function(e){
        callback(e);
    });
}
exports.getOffers = function(req, res, callback) {
    Coupon_model.getOffers(req, res, function(e){
        callback(e);
    });
};
// check user login then return user_infos
exports.create = function(req, res, callback) {
    Coupon_model.create(req, res, function(e){
        callback(e);
    });
};
exports.createOffer = function(req, res, callback){
    Coupon_model.createOffer(req, res, function(e){
        callback(e);
    });
};
exports.updateOffer = function(req, res, callback){
  Coupon_model.updateOffer(req, res, function(e){
      callback(e);
  });
}
// check user logout then return user_infos
exports.update = function(req, res, callback) {
    Coupon_model.update(req, res, function(e){
        callback(e);
    });
};
// check user register then return user_infos
exports.delete = function(req, res, callback) {
    Coupon_model.delete(req, res, function(e){
        callback(e);
    });
};
