const Products_model = require('../models/products_model'),
      auth_helper     = require('../helpers/auth_helper');

// check user login then return user_infos
exports.get = function(req, res, callback) {
    Products_model.get(req, res, function(e){
        callback(e);
    });
};
// check user login then return user_infos
exports.create = function(req, res, callback) {
    Products_model.create(null, req, function(e){
        callback(e);
    });
};
// check user logout then return user_infos
exports.update = function(req, res, callback) {
    Products_model.update(null, req.body._id, req.body, function(e){
        callback(e);
    });
};
exports.updateAmount = function(req, res, callback) {
    Products_model.updateAmount(req, res, function(e){
        callback(e);
    });
};
// check user register then return user_infos
exports.delete = function(req, res, callback) {
    Products_model.delete(null, req._id, function(e){
        callback(e);
    });
};
exports.deleteAllProducts = function(req, res, callback){
  Products_model.deleteAllProducts(null, req._id, function(e){
      callback(e);
  });
};
// check user logout then return user_infos
exports.addFile = function(req, file, callback) {
    Products_model.addFile(req.body.product_id, file, function(e){
        callback(e);
    });
};
exports.createProductFromFileName = function(req, file, callback){
  Products_model.createProductFromFile(req.body, file, function(e){
      callback(e);
  });
};
exports.updatePhonetik = function(req, res, callback){
  Products_model.updatePhonetik(req, res, function(e){
      callback(e);
  });
};
exports.getFile = function(req, res, callback) {
    Products_model.getFile(req, res, function(e){
        callback(e);
    });
};
exports.removeFile = function(req, res, callback) {
    Products_model.removeFile(req.body.product_id, req.body.filename, function(e){
        callback(e);
    });
};
