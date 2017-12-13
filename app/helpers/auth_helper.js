const db = require('mongoose'),
      config = require('../config/config'),
      Auth_model = require('../models/auth_model'),
      Apps_model = require('../models/apps_model'),
      machineId = require('node-machine-id'),
      jwt = require('jsonwebtoken'),
      device_uid = machineId.machineIdSync({original: true});



module.exports = {
    validate_from:function(req, host, callback) {
        //callback(true);
        if(typeof req.options === "undefined"){
            callback(false);
            return false;
        }
        if(typeof req.options.secret === "undefined" || typeof req.options.from_origin === "undefined"){
            callback(false);
            return false;
        }
        if(req.options.from_origin === "localhost:9000"){
            // SPECIAL DEBUG LOCAL HOST BEFORE WEBSITE ARE SETTED
            callback(true);
            return true;
        }
        Apps_model.validate(req.options.secret, req.options.from_origin, function(e){
            /* TODO CHECK RESULT LENGTH OR TRUE */
            if(e.datas.length === 0){
                callback(false);
            }else{
                callback(true);
            }
        });
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
        /* TOFO VERIFY TOKEN FROM USER SECRET */
        //jwt.verify(token, 'shhhhh', function(err, decoded) {console.log(decoded.foo) // bar});
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
            callback({status:200, "message":"AUTHAURIZED"});
        }
    },
    validate_admin:function(req, callback){
        if(typeof req.session.Auth.rights === "undefined"){
            callback({status:401, "message":"UNAUTHAURIZED"});
        }else{
            /* UNCOMMENT IF USER READ AND WRITE OWNER RWO IS SET */
            //if(req.session.Auth.rights.type === "RWO"){
                callback({status:200, "message":"AUTHAURIZED"});
            //}else{
            //    callback({status:301, "message":"UNAUTHAURIZED"});
            //}
        }
    },
    check_session:function(req, user_id, callback){
        Auth_model.reset_session(req, user_id, callback);
    }
}