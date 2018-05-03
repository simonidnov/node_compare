const Orders_model = require('../models/orders_model');

exports.get = function(req, res, callback) {
    Orders_model.get(req, res, function(e){
        callback(e);
    });
};
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
