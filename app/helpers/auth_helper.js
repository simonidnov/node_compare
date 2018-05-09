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
        if(typeof req.options.secret === "undefined"){
            callback(false);
            return false;
        }
        if(req.options.from_origin === "http://localhost:3000" || host !== -1 || req.options.from_origin === app.locals.settings.host){
            // SPECIAL DEBUG LOCAL HOST BEFORE WEBSITE ARE SETTED
            callback(true);
            return true;
        }
        Apps_model.validate(req.options.secret, host, function(e){
            /* TODO CHECK RESULT LENGTH OR TRUE */
            if(e.datas.length === 0){
                callback(false);
            }else{
                callback(true);
            }
        });
    },
    validate_origin:function(req, host, callback) {
        Apps_model.validate(req.options.secret, host, function(e){
            /* TODO CHECK RESULT LENGTH OR TRUE */
            if(e.datas.length === 0){
                callback(false);
            }else{
                callback(e.datas[0]);
            }
        });
    },
    validate_user : function(req, host, callback) {
      //var datas = req.query;
      /* check user id */

        if(typeof req.options === "undefined"){
            callback({status:203, "message":"UNAUTHARISED need OPTIONS"});
        }else{
          /*
          if(typeof req.options.user_id === "undefined"){
              callback({status:203, "message":"UNAUTHARISED need valid user ID"});
          }else if(typeof req.options.user_secret === "undefined"){
              callback({status:203, "message":"UNAUTHARISED need valid user secret"});
          }else{
            if(typeof req.options.user_token === "undefined"){
                callback({status:203, "message":"UNAUTHARISED need valid user token"});
            }else{*/
              //jwt.verify(token, 'shhhhh', function(err, decoded) {console.log(decoded.foo) // bar});
              console.log("validate_user :::: ", req);
              //db.connect(config.database.users, {useMongoClient: true});
              Auth_model.check_user(req, function(e){
                  callback(e);
              });
            /*}
          }*/
        }

    },
    validate_session : function(req, callback) {
        console.log("req.session ::::::::::: ", req.session);
        console.log("req.session.Auth ::::::::::: ", req.session.Auth);
        if(typeof req.session.Auth === "undefined"){
            callback({status:401, "message":"UNAUTHAURIZED"});
        }else{
            callback({status:200, "message":"AUTHAURIZED"});
        }
    },
    validate_admin:function(req, callback){
        if(typeof req.session === "undefined"){
          callback({status:401, "message":"UNAUTHAURIZED"});
          return;
        }
        if(typeof req.session.Auth === "undefined"){
          callback({status:401, "message":"UNAUTHAURIZED"});
          return;
        }
        if(typeof req.session.Auth.rights === "undefined"){
            callback({status:401, "message":"UNAUTHAURIZED"});
        }else{
            /* UNCOMMENT IF USER READ AND WRITE OWNER RWO IS SET */
            if(req.session.Auth.rights.type === "RWO"){
                callback({status:200, "message":"AUTHAURIZED"});
            }else{
                callback({status:401, "message":"UNAUTHAURIZED"});
            }
        }
    },
    check_session:function(req, user_id, callback){
      Auth_model.reset_session(req, user_id, callback);
    },
    has_media_right:function(req, callback){
      if(typeof req.session.Auth === "undefined" || typeof req.session.Auth.rights === "undefined"){
            //TODO CHECK IF USER HAS MEDIA RIGHT KEY CHECKOUT BASKET AND ORDERS SET META USER RIGHT
            callback({status:401, "message":"UNAUTHAURIZED"});
        }else{
            /* UNCOMMENT IF USER READ AND WRITE OWNER RWO IS SET */
            switch(req.session.Auth.rights.type){
              case 'RWO':
                callback({status:200, "message":"AUTHAURIZED"});
                break;
              case 'RW':
                callback({status:200, "message":"AUTHAURIZED"});
                break;
              default:
                callback({status:401, "message":"UNAUTHAURIZED"});
                break;
            }
        }
    }
}
