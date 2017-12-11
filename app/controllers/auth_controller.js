const Auth_model = require('../models/auth_model');

// check user login then return user_infos
exports.login = function(req, datas, callback) {
    Auth_model.login(req, datas, callback);
};
// check user logout then return user_infos
exports.logout = function(req, datas, callback) {
    Auth_model.logout(req, datas, callback);
};
// check user register then return user_infos
exports.register = function(req, callback) {
    Auth_model.register(req, callback);
};
// check user unregister then return user_infos
exports.unregister = function(req, res) {
    Auth_model.unregister(req);
};
// check user login then return user_infos
exports.update = function(req, res) {
    Auth_model.update(req);
};