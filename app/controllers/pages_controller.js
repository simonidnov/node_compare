const Pages_model = require('../models/pages_model'),
      auth_helper     = require('../helpers/auth_helper');

// check user login then return user_infos
exports.get = function(req, datas, callback) {
    Pages_model.get(req, datas, function(e){
        callback(e);
    });
};
// check user login then return user_infos
exports.create = function(req, datas, callback) {
    console.log('exports.create req.body ', req.body.data);
    Pages_model.create(req.session.Auth._id, req.body.data, function(e){
        callback(e);
    });
};
// check user logout then return user_infos
exports.update = function(req, datas, callback) {
    Pages_model.update(req.session.Auth._id, req.body._id, req.body, function(e){
        callback(e);
    });
};
// check user register then return user_infos
exports.delete = function(req, res, callback) {
    Pages_model.delete(req.session.Auth._id, req.body._id, function(e){
        callback(e);
    });
};
