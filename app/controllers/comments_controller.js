const Comments_model = require('../models/comments_model'),
      auth_helper     = require('../helpers/auth_helper');

exports.get = function(req, res, callback) {
    Comments_model.get(req, res, function(e){
        callback(e);
    });
};
exports.getStats = function(req, res, callback) {
    Comments_model.getStats(req, res, function(e){
        callback(e);
    });
};
exports.create = function(req, res, callback) {
    Comments_model.create(req, res, function(e){
        callback(e);
    });
};
exports.update = function(req, res, callback) {
    Comments_model.update(req, res, function(e){
        callback(e);
    });
};
exports.delete = function(req, res, callback) {
    Comments_model.delete(req, res, function(e){
        callback(e);
    });
};
