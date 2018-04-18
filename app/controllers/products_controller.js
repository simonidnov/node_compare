const Products_model = require('../models/products_model'),
      auth_helper     = require('../helpers/auth_helper');

// check user login then return user_infos
exports.get = function(req, datas, callback) {
    Products_model.get(req, datas, function(e){
        callback(e);
    });
};
// check user login then return user_infos
exports.create = function(req, datas, callback) {
    Products_model.create(req.session.Auth._id, req.body, function(e){
        callback(e);
    });
};
// check user logout then return user_infos
exports.update = function(req, datas, callback) {
    Products_model.update(req.session.Auth._id, req.body._id, req.body, function(e){
        callback(e);
    });
};
// check user logout then return user_infos
exports.addFile = function(req, file, callback) {
    Products_model.addFile(req.body.product_id, file, function(e){
        callback(e);
    });
};
exports.getFile = function(req, res, callback) {
    Products_model.getFile(req, res, function(e){
        callback(e);
    });
}
exports.removeFile = function(req, res, callback) {
    Products_model.removeFile(req.body.product_id, req.body.filename, function(e){
        callback(e);
    });
};
// check user register then return user_infos
exports.deleting = function(req, res, callback) {
    Products_model.deleting(req.session.Auth._id, req.body._id, function(e){
        callback(e);
    });
};
