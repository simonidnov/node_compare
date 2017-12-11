const Address_model = require('../models/address_model'),
      auth_helper     = require('../helpers/auth_helper');

// check user login then return user_infos
exports.get = function(req, datas, callback) {
    Address_model.get(req.query.options.user_id, null, function(e){
        callback(e);
    });
};
// check user login then return user_infos
exports.create = function(req, datas, callback) {
    console.log("req.body ====== ", req.body);
    Address_model.create(req.body.user_id, req.body, function(e){
        /* IF REQ SESSIONS AUTH HAVE TO SET MEMBERS */
        auth_helper.check_session(req, req.body.user_id, function(){
            callback(e); 
        });
    });
};
// check user logout then return user_infos
exports.update = function(req, datas, callback) {
    Address_model.update(req.body.options.user_id, req.body.address_id, req.body, function(e){
        /* IF REQ SESSIONS AUTH HAVE TO SET MEMBERS */
        auth_helper.check_session(req, req.body.options.user_id, function(){
            e.updated_token = req.query.updated_token;
            callback(e); 
        });
    });
};
// check user register then return user_infos
exports.delete = function(req, callback) {
    Address_model.delete(req.body.options.user_id, req.body.address_id, function(e){
        /* IF REQ SESSIONS AUTH HAVE TO SET MEMBERS */
        auth_helper.check_session(req, req.body.options.user_id, function(){
            e.updated_token = req.query.updated_token;
            callback(e); 
        });
    });
};