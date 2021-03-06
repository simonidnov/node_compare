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
          if(typeof req.data !== "undefined"){
            if(typeof req.data.options !== "undefined"){
              req.options = req.data.options;
            }
          }
        }

        if(req.options.from_origin === "http://localhost:3000" || host !== -1 || req.options.from_origin === app.locals.settings.host){
            // SPECIAL DEBUG LOCAL HOST BEFORE WEBSITE ARE SETTED
            callback(true);
            return true;
        }
        if(typeof req.options === "undefined"){
            callback(false);
            return false;
        }
        if(typeof req.options.secret === "undefined"){
            callback(false);
            return false;
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
        if(typeof req.options === "undefined"){
          if(typeof req.data !== "undefined"){
            if(typeof req.data.options !== "undefined"){
              req.options = req.data.options;
            }
          }
        }
        if(typeof req.options === "undefined"){
            callback({status:401, "message":"UNAUTHARISED_NEED_LOGIN", response_display:{"title":"Connexion", "message":"Vous devez être connecté pour effectuer cette action."}});
        }else{
          Auth_model.check_user(req, function(e){
            callback(e);
          });
        }
    },
    addParams : function(datas, req){
      if(typeof datas.updated_token === "undefined" && typeof req.updated_token !== "undefined"){
        datas.updated_token = req.updated_token;
      }
      return datas;
    },
    validate_session : function(req, callback) {
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
