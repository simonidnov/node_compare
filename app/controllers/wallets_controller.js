const Wallets_model = require('../models/wallets_model');

exports.get = function(req, res, callback) {
    Wallets_model.get(req, res, function(e){
        callback(e);
    });
};
exports.create = function(req, res, callback) {
    Wallets_model.create(req, res, function(e){
        callback(e);
    });
};
exports.update = function(req, res, callback) {
    Wallets_model.update(req, res, function(e){
        callback(e);
    });
};
exports.deleting = function(req, res, callback) {
    Wallets_model.deleting(req, res, function(e){
        callback(e);
    });
};
