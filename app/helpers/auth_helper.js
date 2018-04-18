const db = require('mongoose'),
      config = require('../config/config'),
      Auth_model = require('../models/auth_model'),
      Apps_model = require('../models/apps_model'),
      machineId = require('node-machine-id'),
      jwt = require('jsonwebtoken'),
      device_uid = machineId.machineIdSync({original: true});

module.exports = {
    validate_from:function(req, host, callback) {
      console.log('?????????????????????????????????????????? VALIDATE FROM ?????????????????????????????????????????');
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
        console.log('?????????????????????????????????????????? VALIDATE ORIGIN ?????????????????????????????????????????');
        Apps_model.validate(req.options.secret, host, function(e){
            /* TODO CHECK RESULT LENGTH OR TRUE */
            if(e.datas.length === 0){
                callback(false);
            }else{
                callback(e.datas[0]);
            }
        });
    },
    validate_user:function(req, host, callback) {
      console.log('?????????????????????????????????????????? VALIDATE USER ?????????????????????????????????????????');
      /* check user id */
        if(typeof req.options.user_id === "undefined"){
            callback({status:401, "message":"UNAUTHARISED need valid user ID"});
            return false;
        }
        /* check user device */
        if(typeof req.options.user_secret === "undefined"){
            callback({status:401, "message":"UNAUTHARISED need valid user secret"});
            return false;
        }
        /* check user token */
        if(typeof req.options.user_token === "undefined"){
            callback({status:401, "message":"UNAUTHARISED need valid user token"});
            return false;
        }
        /* TOFO VERIFY TOKEN FROM USER SECRET */
        //jwt.verify(token, 'shhhhh', function(err, decoded) {console.log(decoded.foo) // bar});
        /* match user token + device */

        //db.connect(config.database.users, {useMongoClient: true});
        req.options.device_uid = device_uid;
        Auth_model.check_user(req, function(e){
            callback(e);
            return true;
        });
    },
    validate_session:function(req, callback){
      console.log('?????????????????????????????????????????? VALIDATE SESSION ?????????????????????????????????????????');
      //console.log('validate_session ', req.session.Auth);
        if(typeof req.session.Auth === "undefined"){
            console.log('WHAT THE FCK');
            callback({status:401, "message":"UNAUTHAURIZED"});
        }else{
            console.log('GREAT SESSION');
            callback({status:200, "message":"AUTHAURIZED"});
        }
    },
    validate_admin:function(req, callback){
      console.log('?????????????????????????????????????????? VALIDATE ADMIN ?????????????????????????????????????????');
      console.log('validate admin ', req.session.Auth.rights);
        if(typeof req.session.Auth.rights === "undefined"){
            console.log('not admin');
            callback({status:401, "message":"UNAUTHAURIZED"});
        }else{
            /* UNCOMMENT IF USER READ AND WRITE OWNER RWO IS SET */
            if(req.session.Auth.rights.type === "RWO"){
                console.log('IS ADMIN TRUE');
                callback({status:200, "message":"AUTHAURIZED"});
            }else{
                console.log('not admin');
                callback({status:401, "message":"UNAUTHAURIZED"});
            }
        }
    },
    check_session:function(req, user_id, callback){
      console.log('?????????????????????????????????????????? CHECK SESSION ?????????????????????????????????????????');
      Auth_model.reset_session(req, user_id, callback);
    },
    has_media_right:function(req, callback){
      console.log('?????????????????????????????????????????? HAS MEDIA RIGHT ?????????????????????????????????????????');
      if(typeof req.session.Auth === "undefined" || typeof req.session.Auth.rights === "undefined"){
            //TODO CHECK IF USER HAS MEDIA RIGHT KEY
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
