const Orders_model = require('../models/orders_model');
exports.getUserOrders = function(req, res, callback) {
    Orders_model.getUserOrders(req, res, function(e){
        callback(e);
    });
}
exports.get = function(req, res, callback) {
    Orders_model.get(req, res, function(e){
        callback(e);
    });
};
exports.getBill = function(user_id, datas, callback){
    Orders_model.getBill(user_id, datas, function(e){
        callback(e);
    });
}
exports.createCharge = function(req, res, callback){
    Orders_model.createCharge(req.body, res, callback);
}
exports.create = function(req, res, callback) {
    Orders_model.create(req, res, function(e){
        callback(e);
    });
};
exports.update = function(req, res, callback) {
    Orders_model.update(req, res, function(e){
        callback(e);
    });
};
exports.deleting = function(req, res, callback) {
    Orders_model.deleting(req, res, function(e){
        callback(e);
    });
};
exports.buy_with_coupon = function(req, res, callback){
    Orders_model.buy_with_coupon(req, res, function(e){
        callback(e);
    });
}
