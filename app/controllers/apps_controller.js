const Apps_model = require('../models/apps_model'),
      auth_helper     = require('../helpers/auth_helper');

// check user login then return user_infos
exports.get = function(req, datas, callback) {
    Apps_model.get(req, datas, function(e){
        callback(e);
    });
};
exports.validate = function(secret, origin, callback){
  Apps_model.validate(secret, origin, function(e){
      callback(e);
  });
}
exports.getApps = function(req, datas, callback) {
    Apps_model.get(req, datas, function(e){
        return e.datas;
    });
};
// check user login then return user_infos
exports.create = function(req, datas, callback) {
    Apps_model.create(req.session.Auth._id, req.body, function(e){
        callback(e);
    });
};
// check user logout then return user_infos
exports.update = function(req, datas, callback) {
    console.log('UPDATE APP ', req.body);
    Apps_model.update(req.session.Auth._id, req.body._id, req.body, function(e){
        callback(e);
    });
};
// check user register then return user_infos
exports.delete = function(req, res, callback) {
    Apps_model.delete(req.session.Auth._id, req.body._id, function(e){
        callback(e);
    });
};
