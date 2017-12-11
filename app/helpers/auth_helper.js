const db = require('mongoose'),
      config = require('../config/config'),
      Auth_model = require('../models/auth_model'),
      machineId = require('node-machine-id'),
      device_uid = machineId.machineIdSync({original: true});



module.exports = {
    validate_from:function(req, host) {
        if(typeof req.options.secret === "undefined" || typeof req.options.from_origin === "undefined"){
            return false;
        }
        if(req.options.secret !== "000-000-000" || req.options.from_origin !== "http://localhost:3000"  && req.options.from_origin !== "http://localhost:8080" || req.options.from_origin.indexOf(host) === -1){
            console.log(' ---------------- UNAUTHORIZED ---------------------- ');
            console.log(' ---------------- UNAUTHORIZED ---------------------- ');
            console.log(' ---------------- UNAUTHORIZED ---------------------- ');
            console.log(' ---------------- UNAUTHORIZED ---------------------- ');
            console.log(' ---------------- UNAUTHORIZED ---------------------- ');
            console.log(' ---------------- UNAUTHORIZED ---------------------- ');
            console.log(' ---------------- UNAUTHORIZED ---------------------- ');
            console.log(' ---------------- UNAUTHORIZED ---------------------- ');
            console.log(' ---------------- UNAUTHORIZED ---------------------- ');
            console.log(' ---------------- UNAUTHORIZED ---------------------- ');
            console.log(' ---------------- UNAUTHORIZED ---------------------- ');
            console.log(' ---------------- UNAUTHORIZED ---------------------- ');
            console.log(' ---------------- UNAUTHORIZED ---------------------- ');
            return false;
        }
        return true;
    },
    validate_user:function(req, host, callback) {
        /* check user id */
        if(typeof req.options.user_id === "undefined"){
            callback({status:401, "message":"UNAUTHARISED need valid user ID"});
        }
        /* check user device */
        if(typeof req.options.user_secret === "undefined"){
            callback({status:401, "message":"UNAUTHARISED need valid user secret"});
        }
        /* check user token */
        if(typeof req.options.user_token === "undefined"){
            callback({status:401, "message":"UNAUTHARISED need valid user token"});
        }
        /* match user token + device */
        db.connect(config.database.users, {useMongoClient: true});
        req.options.device_uid = device_uid;
        Auth_model.check_user(req, function(e){
            callback(e);
        });
    },
    validate_session:function(req, callback){
        if(typeof req.session.Auth === "undefined"){
            callback({status:401, "message":"UNAUTHAURIZED"});
        }else{
            callback({status:200, "message":"UNAUTHAURIZED"});
        }
    },
    check_session:function(req, user_id, callback){
        console.log('-------------------------------- RESET SESSION --------------------------------------------- ', user_id);
        console.log('-------------------------------- user_id --------------------------------------------- ', user_id);
        Auth_model.reset_session(req, user_id, callback);
    }
}