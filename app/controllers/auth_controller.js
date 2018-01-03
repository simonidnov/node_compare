const Auth_model = require('../models/auth_model');
exports.get = function(req, datas, callback) {
    Auth_model.get(req, datas, callback);
};
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
exports.request_validation_code = function(req, datas, callback){
    Auth_model.getValidationCode(req.body.user_id, callback);
};
exports.get_user_from_device = function(device_uid, callback){
    Auth_model.getUsersDevice(device_uid, callback);
};
exports.delete_device = function(req, res, callback){
    Auth_model.deleteDevice(req, callback);
}
exports.update_password = function(req, res, callback){
    Auth_model.updatePassword(req, callback);
}