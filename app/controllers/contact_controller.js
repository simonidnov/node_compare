const Contact_model = require('../models/contact_model');

// check user login then return user_infos
exports.get = function(req, res, callback) {
    callback({status:200, message:"CONTACT GET IS ON DEVELOPPEMENT"});
};
// check user login then return user_infos
exports.create = function(req, res, callback) {
    Contact_model.create(req, res, function(e){
        callback(e);
    });
};
// check user logout then return user_infos
exports.update = function(req, res, callback) {
    callback({status:200, message:"CONTACT UPDATE PUT IS ON DEVELOPPEMENT"});
};
// check user register then return user_infos
exports.delete = function(req, res, callback) {
    callback({status:200, message:"CONTACT DELETE IS ON DEVELOPPEMENT"});
};
