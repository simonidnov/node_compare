const db = require('mongoose'),
      app = require('../app'),
      http = require('http'),
      sha1 = require('sha1'),
      jwt = require('jsonwebtoken'),
      validator = require("email-validator"),
      Members_model = require('../models/members_model'),
      Address_model = require('../models/address_model'),
      Email_controller = require('../controllers/email_controller'),
      config = require('../config/config'),
      gravatar = require('gravatar'),
      urlExists = require('url-exists'),
      user_datas = {
          email       : {type:'string', unique: true},
          password    : {type:'string'},
          pseudo      : {type:'string'},
          firstName   : {type:'string'},
          avatar      : {type:'string'},
          lastName    : {type:'string'},
          phone       : {type:'string'},
          mobile      : {type:'string'},
          token       : {type:'string'},
          validation_code  : {type:'string'},
          secret      : {type:'string'},
          qrcode      : {type:'Object'},
          birthDate   : {type:'Date'},
          gender      : {type:'string', enum:['undefined', 'male', 'female'], defaults :'undefined'},
          address     : {type:'Array'},
          friends     : {type:'Array'},
          relations   : {type:'Array'},
          apps        : {type:'Array'},
          tags        : {type:'Object'},
          authorized_apps : {type:'Object'},
          facebook    : {
              id:{type:'string'},
              name:{type:'string'},
              email:{type:'string'},
              likes:{type:'array'},
              friends:{type:'array'},
              pages:{type:'array'},
              shared:{type:'boolean'},
              accessToken:{type:'string'}
          },
          devices     : {
              uid:'string',
              name:'string',
              arch:'string',
              appCodeName:'string',
              appName:'string',
              appVersion:'string',
              userAgent:'string',
              vendor:'string',
              last_connexion:'string',
              token:'string',
              ua_parser:{type:'Object'}
          },
          termAccept  : {type:'Boolean'},
          newsletter  : {type:'Boolean'},
          newsletter_services : {type:'Object'},
          sms         : {type:'Boolean'},
          sms_services : {type:'Object'},
          notifications : {type:'Boolean'},
          notifications_services : {type:'Object'},
          rights      : {type:'Object'},
          validated   : {type:'Boolean'},
          created     : {type:'Date', default: Date.now},
          updated     : {type:'Date', default: Date.now},
          public_locale : {type:'Boolean'},
          public_profile : {type:'Boolean'},
          public_kids : {type:'Boolean'},
          public_created : {type:'Boolean'},
          public_gamification : {type:'Boolean'},
          public_interest : {type:'Boolean'}
      },
      machineId = require('node-machine-id'),
      ua_parser = require('ua-parser-js');

      var device_uid = machineId.machineIdSync({original: true});

if(db.connection.readyState === 0){
    db.connect(config.database.users, {useMongoClient: true});
}
const userSchemas = new db.Schema(user_datas),
      User = db.model('User', userSchemas);
//db.close();
db.connection.on('open', function (ref) {
});
db.connection.on('error', function (err) {
});

User.collection.dropIndexes();

module.exports = {
    attributes: user_datas
};
module.exports.getCount = function(){
    return User.find({}).count();
};
module.exports.getActive = function(){
    return User.find(
        {
            updated : {$gte:new Date(ISODate().getTime() - 1000 * 86400 * 3)}
        }
    ).count();
};
module.exports.get = function(req, datas, callback) {
    device_uid = req.query.device_uid;
    //machineId.machineIdSync({original: true});

    var self = this;
    User.find({}, function(err, users){
        if (err){
            callback({"status":304, "code":err.code, "error":err, "message":err.message});
        }else{
            callback({"status":200, "users":users, "total":self.getCount()});
        }
    }).skip (parseInt(datas.page)*50).limit (50);
};
module.exports.getUserInfos = function(req, res, callback){
    if(typeof req.query.user === "undefined" || req.query.user === ""){
      callback({"status":304, "datas":{message:"NEED_USER"}});
    }
    User.find({_id:req.query.user._id}, function(err, users){
        if (err){
            callback({"status":304, "code":err.code, "error":err, "message":"NEED_USER"});
        }else{
            callback({"status":200, "user":users});
        }
    });
}
/* EXPERIMENTAL MONGO REQUEST DELETE FROM {OBJECT} SCHEMAS */
module.exports.deleteDevice = function(req, datas, callback){
    User.update(
        { _id : datas.user_id },
        { $pull: { devices: { uid: req.query.device_uid } }},
        function(err, deleted){
            if(errr) callback({status:403, message:"DEVICE_DELETE_ERROR"})
            else callback({status:200, message:"DEVICE_DELETE_SUCCESS"})
        }
    );
}
// check user login then return user_infos
module.exports.login = function(req, datas, callback) {
    var new_device = null;
    if(typeof req.query.remember_me === "undefined"){
    }else{
        if(typeof req.query.device_infos !== "undefined"){
            device_uid = req.query.device_infos.device_uid;
            new_device  = {
                uid            : device_uid,
                appCodeName    : req.query.device_infos.appCodeName,
                appName        : req.query.device_infos.appName,
                appVersion     : req.query.device_infos.appVersion,
                userAgent      : req.query.device_infos.userAgent,
                vendor         : req.query.device_infos.vendor,
                last_connexion : Date.now(),
                ua_parser      : ua_parser(req.query.device_infos.userAgent)
            };
        }else if(typeof req.query.device_uid !== "undefined"){
            device_uid = req.query.device_uid;
            new_device  = {
                uid            : device_uid,
                appCodeName    : req.query.appCodeName,
                appName        : req.query.appName,
                appVersion     : req.query.appVersion,
                userAgent      : req.query.userAgent,
                vendor         : req.query.vendor,
                last_connexion : Date.now(),
                ua_parser      : ua_parser(req.query.userAgent)
            };
        }
    }

    /*
    {
        device_uid: '1be17d56f318dda2e37670a5eca8fc2a',
        appCodeName: 'Mozilla',
        appName: 'Netscape',
        appVersion: '5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36',
        vendor: 'Google Inc.'
    }
    */
    //device_uid = machineId.machineIdSync({original: true});
    var self = this;

    if(datas.password){
        if(validator.validate(datas.email)){
            /* REQUEST UPDATED USER */
            User.find({email: datas.email, password: sha1(datas.password)}, function (err, users) {
                if (err){
                    callback({"status":"error", "code":err.code, "error":err, "message":err.message});
                }else{
                    if(users.length === 0){
                        User.find({email: datas.email}, function (err, users) {
                            if(err){
                                callback({"status":400, "code":11, "error":err, "message":"USER_WRONG_EMAIL"});
                            }else{
                                if(users.length === 0){
                                    callback({"status":400, "code":11, "error":err, "message":"USER_WRONG_EMAIL", email_valid:users.length});
                                }else{
                                    callback({"status":400, "code":13, "error":err, "message":"USER_WRONG_PASSWORD", email_valid:users.length});
                                }
                            }
                        });
                        return false;
                    }
                    /* CHECK DEVICE */

                    var new_token = jwt.sign({secret:users[0].secret}, config.secrets.global.secret, { expiresIn: '2 days' });

                    if(typeof req.query.remember_me !== "undefined"){
                        new_device.token = new_token;
                        /* check if device exist */
                        User.find(
                            {
                                _id:users[0]._id,
                                devices:{
                                    $elemMatch : {
                                        uid:device_uid
                                    }
                                }
                            },
                            function(err, device) {
                                if(err){
                                    // TODO : ON PUSH UN DEVICE AVEC LE UID CORRESPONDANT POUR LA PROCHAINE SESSION ET ON SET UN JETON TOKEN
                                    User.update(
                                        { _id: users[0]._id },
                                        {
                                            $push: { devices: new_device }
                                        },
                                        function(err, device){
                                            if(err) console.log('impossible d insérer le new_device ', err);
                                            else console.log("new_device ajouté success ", new_device)
                                        }
                                    );
                                }else{
                                    if(device.length === 0){
                                        /* ON AJOUTE UN DeVICE INCONNU SUR l'UTILISATEUR */
                                        User.update(
                                            { _id: users[0]._id },
                                            {
                                                $push: { devices: new_device }
                                            },
                                            function(err, device){
                                                if(err) console.log('impossible d insérer le new_device ', err);
                                                else console.log("new_device ajouté success ", new_device)
                                            }
                                        );
                                    }else{
                                        /* Update Object in Array Collection */
                                        User.update(
                                            {id:users[0]._id, devices: {$elemMatch: {uid:device_uid}}}, // ON SELECTIONNE L'OBJECT DANS LE TABLEAU
                                            {
                                                $set : {token : new_token},
                                                device : {
                                                    $set : new_device
                                                }
                                            } , // ON SET LES VARIABLES A METTRE A JOUR ICI LE TOKEN JETON UTILISATEUR
                                            function(err, infos){
                                                if(err) console.log('update device token error ', err);
                                                else console.log('update device token success ', infos);
                                            }, // CALLBACK
                                            true //SAIS PAS POURQUOI
                                        );
                                    }
                                }
                            }
                        );
                    }

                    /* UPDATE */
                    var avatar = users[0].avatar;
                    if(users[0].avatar === "" || users[0].avatar == null){
                        if(datas.avatar === "" || datas.avatar == null || typeof datas.avatar == "undefined"){
                          avatar = gravatar.url(users[0].email, {s: '200', r: 'pg', d: '404'}).replace('//', 'http://');
                        }else{
                          avatar = datas.avatar;
                        }
                    }else{
                        avatar = users[0].avatar;
                    }

                    urlExists(avatar, function(err, exists) {
                      if(!exists){
                        avatar = app.locals.settings.host+"/public/images/assets/account.svg";
                      }
                      /* TODO !IMPORTANT REMOVE USER RIGHTS AFTER FIRST ONE IS SETTED */
                      /*
                          TO SPECIFY A NEW ADMIN OWNER FIRST TIME ADD THIS PARAMS ON UPDATE :
                                  rights  : {
                                      "type":'RWO',
                                      "authorizations":['me']
                                  }
                      */
                      User.update(
                          {
                              _id: users[0]._id
                          },
                          {
                              $set:{
                                  token : new_token,
                                  updated : Date.now(),
                                  avatar : avatar
                              }
                          },
                          function(err, user){
                              if (err){
                                  callback({"status":400, "code":err.code, "error":err, "message":"USER_LOGIN_ERROR"});
                              }else{
                                  self.reset_session(req, users[0]._id, function(infos){
                                      infos.avatar = infos.avatar;
                                      callback({status:200, "message":"USER_LOGIN_SUCCESS", "idkids_user":infos});
                                  });
                              }
                          }
                      );
                    });
                }
            });
            //
            //User.find({email: datas.email, password: sha1(datas.password), termAccept:1}, callback);
        }else{
            callback({status:400, "message":"USER_WRONG_EMAIL"});
        }
    }else{
        callback({status:400, "message":"USER_LOGIN_ERROR"});
    }
    return datas;
};
// check user logout then return user_infos
module.exports.logout = function(req, datas, callback) {
    //console.log("AUTH MODEL LOGOUT <<<<<< ", req.session);
    if(typeof req.session.Auth !== "undefined"){
      //req.session.Auth.destroy();
      req.session.destroy();
    }
    //console.log("AUTH MODEL LOGOUT AFTER >>>>> ", req.session);
    //req.session.destroy();
    callback({status:200, datas:{message:"SESSION_DELETED"}});
};
// check user register then return user_infos
module.exports.register = function(datas, callback) {
    //device_uid = req.body.device_uid;
    //device_uid = machineId.machineIdSync({original: true});
    /* UPDATE ALL datas set check email is uniq and valid then send confirmation email */
    /* ----- CHECK EMAIL UNIQ ----- */
    /* ----- GENERATE TOKEN FIRST expire in 24 H ----- */
    if(typeof datas.body === "undefined"){
      //callback({"status":"error", "message":"NO_BODY"});
      return false;
    }
    if(typeof datas.body.subscribe_password === "undefined"){
      //callback({"status":"error", "message":"NO_BODY"});
      return false;
    }
    //sha1 = require('sha1');
    var pass = sha1(datas.body.subscribe_password);
    db.connect(config.database.users, {useMongoClient: true});
    var self = this;
    var new_user_datas = {
            email   : datas.body.subscribe_email,
            password: pass,
            pseudo  : datas.body.pseudo,
            secret  : jwt.sign({}, config.secrets.global.secret, {}, { expiresIn: '2 days' }),
            termAccept : true,
            rights  : {
                "type":'R',
                "authorizations":['me']
            }
        }
    new_user_datas.token = jwt.sign({secret:new_user_datas.secret}, config.secrets.global.secret, { expiresIn: '2 days' });
    new_user_datas.device = [{
        uid     : device_uid,
        token   : jwt.sign({secret:new_user_datas.secret}, config.secrets.global.secret, { expiresIn: '2 days' }),
        avatar  : gravatar.url(datas.body.subscribe_email, {s: '200', r: 'pg', d: '404'}, true).replace('//', 'http://')
    }];
    //network : os.networkInterfaces(),
    /* TODO CHECK ARRAY SEND FORM DATA */
    if(datas.body.subscribe_newsletter){
        new_user_datas.newsletter = true;
        new_user_datas.newsletter_services = {};
        if(typeof app.locals !== "undefined" && typeof app.locals.applications !== "undefined"){
          for(var i=0; i<app.locals.applications.length; i++){
            if(datas.body['newsletter_'+app.locals.applications[i].short_name]){
                new_user_datas.newsletter_services[app.locals.applications[i].short_name] = 1;
            }
          }
        }
    }else{
        new_user_datas.newsletter = false;
        new_user_datas.newsletter_services = {};
    }

    new_user = new User(new_user_datas);
    new_user.save(function(err, usr){
        if(err){
          callback({"status":400, "message":"SUBSCRIBE_EMAIL_EXIST", err:err});
        }
        else{
          self.reset_session(datas, usr._id, function(infos){
              callback({"status":200, "user":usr});
          });
        }
    });
    //callback(new_user);
    //return datas.body;
};
module.exports.lost_password = function(req, res, callback){
    if(typeof req.body.email === "unefined"){
      callback({status:403, message:"UNKNOW_USER_EMAIL"});
    }
    var self = this;
    User.findOne({
      email:req.body.email
    }, function(err, user){
        if(err) callback({"status":403, datas:{"message":err}});
        else{
          if(user === null){
            callback({"status":403, "message":"UNKNOW_USER_EMAIL"});
          }else{
            self.getValidationCode(user._id, function(e){
              if(e.status === 200){
                Email_controller.lost_password(req, e, function(email){
                    console.log('----------------------- ');
                    console.log(email);
                    console.log('----------------------- ');
                    callback({"status":email.status, response_display:{message:"REQUEST_PASSWORD_MESSAGE", title:"REQUEST_PASSWORD_TITLE"}, "message":"PASSWORD_SENDED"});
                });
              }else{
                callback({"status":e.status, datas:e});
              }
            });
          }
        }
    });
}
// check user unregister then return user_infos
module.exports.unregister = function(req, res, callback) {
    //device_uid = req.body.device_uid;
    //device_uid = machineId.machineIdSync({original: true});
    /* DELETE where email, passe, secret and token */
    User.remove( {"_id": req.body.id}, function(){
      callback({status:200, message:"USER_DELETED", infos:req.body});
    });

    return req.body;
};
// check user login then return user_infos
module.exports.update = function(req, user_id, datas, callback) {
    device_uid = req.body.device_uid;
    //device_uid = machineId.machineIdSync({original: true});
    var self = this;
    /* UPDATE token, updated then free user session and storage */
    datas.updated = Date.now();
    if(typeof datas.birthDate !== "undefined"){
        datas.birthDate = datas.birthDate;
    }
    //User.findOne({ _id: 'bourne' }, function (err, doc){
    User.update(
        {
            _id: user_id
        }, // ON SELECTIONNE L'OBJECT DANS LE TABLEAU
        {
            $set: datas
        }, // ON SET LES VARIABLES A METTRE A JOUR ICI LE TOKEN JETON UTILISATEUR
        function(err, infos){
            if(err){
                callback({status:401, "message":"CANT_UPDATE_TOKEN", "datas":err});
            } else {
                /* TODO RESET SESSION USER FUNCTION */
                self.reset_session(req, user_id, function(){
                    callback({status:200, "message":"TOKEN_UPDATED", "datas":infos, response_display:{title:"Mis à jour", message:"Votre profil vient d'être mis à jour."}});
                });
            }
        } , // CALLBACK
        true //SAIS PAS POURQUOI
    );
};
module.exports.updatePassword = function(req, res, callback){
    User.update({
      email: req.email
    },{
      $set:{password:sha1(req.password)}
    }, function(err, user){
      if(err){
        callback({status:401, "message":"CANT_UPDATE_PASSWORD", "error":err});
      }else{
        callback({status:200, "message":"PASSWORD_UPDATED", "infos":user});
      }
    })
}
module.exports.check_user_session = function(req, callback){

}
module.exports.check_user = function(req, callback){
    device_uid = req.device_infos.device_uid;
    //device_uid = machineId.machineIdSync({original: true});
    var new_device  = {
            uid     : device_uid
        },
        new_token = jwt.sign({secret:req.options.user_secret}, config.secrets.global.secret, { expiresIn: '2 days' });

    jwt.verify(req.options.user_token, config.secrets.global.secret, function(err, decoded) {
      if (err){
        callback({status:203, "message":"UNAUTHORISED_TOKEN", "response_display":{"title":"Session invalide", "message":"Vous n'êtes plus connecté.<br>veuillez vous reconnecter."}, "datas":err});
      }else{
        User.find(
            {
                _id : req.options.user_id,
                token : req.options.user_token
            },
            function(err, user) {
                if(err){
                    callback({status:203, "message":"UNAUTHORISED_TOKEN", "datas":err, "response_display":{"title":"Session invalide", "message":"Vous n'êtes plus connecté.<br>veuillez vous reconnecter."}});
                }else{
                    if(user.length === 0){
                      callback({status:203, "message":"UNAUTHORISED", "response_display":{"title":"Session invalide", "message":"Vous n'êtes plus connecté.<br>veuillez vous reconnecter."}});
                    }else{

                      /* ON MET A JOUR LE TOKEN */
                      jwt.verify(req.options.user_token, config.secrets.global.secret, function(err, decoded) {
                        if (err){
                          User.update(
                              {
                                  id:req.options.user_id
                              }, // ON SELECTIONNE L'OBJECT DANS LE TABLEAU
                              {
                                  $set : {
                                      token : new_token,
                                      updated : Date.now()
                                  }
                              } , // ON SET LES VARIABLES A METTRE A JOUR ICI LE TOKEN JETON UTILISATEUR
                              function(err, infos){
                                  if(err) callback({status:401, "message":"CANT_UPDATE_TOKEN", "datas":err});
                                  else callback({status:200, "message":"TOKEN_UPDATED", "datas":user, "updated_token":new_token});
                              } , // CALLBACK
                              true //SAIS PAS POURQUOI
                          );
                          //callback({status:203, "message":"UNAUTHORISED_TOKEN", "response_display":{"title":"Session invalide", "message":"Vous n'êtes plus connecté.<br>veuillez vous reconnecter."}, "datas":err});
                        }else{
                          callback({status:200, "message":"TOKEN_UPDATED", "datas":user});
                        }
                      });
                    }
                }
            }
        );
      }
      //console.log({ auth: false, message: 'Failed to authenticate token.' });
      //console.log("decoded :::::::: ", decoded);
      //callback({status:200, "message":"TOKEN_VALIDATED"});
      //res.status(200).send(decoded);
    });
    /* check if device exist */

}
module.exports.checking_session = function(req, user_id, callback){
  var self = this;
  User.findOne(
      {
          _id: req.query._id,
          token: req.query.token,
          secret: req.query.secret
      },
      function(err, user){
          if (err){
              callback({"status":401, "code":err.code, "error":err, "message":err.message});
          }else{
              self.reset_session(req, req.query._id, callback);
          }
      }
    );
}
module.exports.reset_session = function(req, user_id, callback){
    User.findOne(
        {
            _id: user_id
        },
        function(err, user){
            if (err){
                callback({"status":401, "code":err.code, "error":err, "message":err.message});
            }else{
                user_infos = JSON.parse(JSON.stringify(user));
                user_infos.current_device = device_uid;
                Members_model.get(user_id, null, function(e){
                    user_infos.members = e.datas;
                    Address_model.get(user_id, null, function(e){
                        user_infos.address = e.datas;
                        //TODO FIX SSL
                        //if(req.get('origin').replace('http://', '').replace('https://', '') === app.locals.settings.host.replace('http://', '').replace('https://', '')){
                          req.session.Auth = user_infos;
                        //}
                        callback({status:200, "message":"SESSION_UPDATED", "datas":user_infos});
                    });
                });
            }
        }
    );
}
module.exports.getPublicProfile = function(_id, callback){
    this.getFullUser(_id, function(e){
        if(e.status === 200){
            var public_profile = {
                "_id" : e.datas._id,
                "pseudo"  : e.datas.pseudo,
                "email"   : e.datas.email,
                "avatar"  : e.datas.avatar,
                "created" : e.datas.created,
                "updated" : e.datas.updated
            };
            callback({status:e.status, message:e.message, datas:public_profile});
        }else{
            callback(e);
        }
    });
}
module.exports.getServices = function(_id, callback){
    this.getFullUser(_id, function(e){
        if(e.status === 200){
            var public_services = {
                is_newsletter : e.datas.is_newsletter,
                newsletter_services : e.datas.newsletter_services
            }
            callback({status:e.status, message:e.message, datas:e.datas.public_services});
        }else{
            callback(e);
        }
    });
}
module.exports.getFullUser = function(_id, callback){
    User.findOne(
        {
            _id:_id
        },
        function(err, user) {
            if(err){
                callback({status:401, "message":"UNAUTHORISED_TOKEN", "datas":err});
            }else{
                if(user !== null){
                    Members_model.get(_id, null, function(e){
                        user['members'] = e.datas;
                        callback({status:200, "message":"success me", "datas":user});
                    });
                }else{
                    callback({status:404, "message":"USER_NOT_FOUND", "datas":user});
                }
            }
        }
    );
};
module.exports.getValidationCode = function(_id, callback){
    User.findOne(
        {
            _id:_id
        },
        function(err, user) {
            if(err){
                callback({status:401, "message":"UNAUTHORISED_TOKEN", "datas":err});
            }else{
                if(user !== null){
                    var validation_code = jwt.sign({secret:user.secret}, config.secrets.global.secret, { expiresIn: '2 days' });
                    User.update(
                        { _id: user._id },
                        {
                            $set: { validation_code: validation_code }
                        },
                        function(err, validation){
                            if(err) console.log('impossible de mettre à jour le code de validation ', err);
                            else callback({status:200, validation_code:validation_code, email:user.email, pseudo:user.pseudo, avatar:user.avatar});
                        }
                    );
                }else{
                    callback({status:304, "message":"USER_NOT_FOUND", "datas":user});
                }
            }
        }
    );
};
module.exports.validCode = function(params, callback){
  User.findOne(
      {
          email:params.email,
          validation_code : params.validation_code
      },
      function(err, user){
        if(err || user === null){
            callback({status:304, message:"INVALID_CODE", datas:err});
        }else{
            callback({status:200, message:"CODE_VALID", datas:user})
        }
      }
    );
};
module.exports.validAccount = function(params, callback){
    User.findOne(
        {
            email:params.email,
            validation_code : params.validation_code
        },
        function(err, user){
            if(err || user === null){
                callback({status:304, message:"UNAUTHORISED_TOKEN", datas:err});
            }else{
                User.update(
                    {
                        _id: user._id
                    },
                    {
                        $set: { validated: true, certified: true }
                    },
                    function(err, validation){
                        if(err) callback({status:304, message:"UNAUTHORISED_TOKEN", datas:err});
                        else callback({status:200, message:"USER_VALIDATED", datas:validation});
                    }
                );
            }
        }
    );
};
module.exports.getUsersDevice = function(device_uid, callback){
    User.find(
        {
            devices:{
                $elemMatch : {
                    uid:device_uid
                }
            }
        },
        {
            email:1,
            avatar:1,
            pseudo:1
        },
        function(err, users){
            if(err || users.length === 0){
                callback({status:304, message:"NEW_DEVICE", datas:err});
            }else{
                callback({status:200, message:"liste des utilisateurs ayant utilisé ce device", users_device:users})
            }
        }
    )

}
module.exports.deleteDevice = function(req, callback){
    var self = this,
        device_uid = req.query.device_uid;
    User.update(
        {
            _id: req.session.Auth._id
        },
        {
            $pull : {
                devices:{
                    uid:req.body.uid
                }
            }
        },
        function(err, users){
            if(err || users.length === 0){
                callback({status:304, message:"DEVICE_DELETE_ERROR", datas:err});
            }else{
                self.reset_session(req, req.session.Auth._id, function(infos){
                    infos.avatar = infos.avatar;
                    callback({status:200, message:"DEVICE_DELETE_SUCCESS", "idkids_user":infos});
                });
            }
        }
    )
}
/* SPECIAL REQUEST SCHEMA SAMPLE CODE */
user_datas.getAge = function(){
    return this.birthDate;
};

function checkAvatarExist(avatar){
  var http = require('http'),
    options = {method: 'HEAD', host: avatar, port: 80, path: '/'},
    req = http.request({}, function(r) {
      if(http.status != 404){
        return avatar;
      }else{
        return app.locals.settings.host+"/public/images/assets/account.svg";
      }
    });
    req.end();
}

// Load mongoose package
//var mongoose = require('mongoose');
// Connect to MongoDB and create/use database called todoAppTest
//mongoose.connect('mongodb://localhost/todoAppTest');
// Create a schema
/*var TodoSchema = new mongoose.Schema({
  name: String,
  completed: Boolean,
  note: String,
  updated_at: { type: Date, default: Date.now },
});*/
// Create a model based on the schema
//var Todo = mongoose.model('Todo', TodoSchema);


// Create a todo in memory
//var todo = new Todo({name: 'Simon NodeJS', completed: true, note: 'Getting there...'});
// Save it to database
/*todo.save(function(err){
  if(err) console.log("SAVE ERROR :::: ", err);
  else console.log("SUCCESS TODO :::: ", todo);
});*/

// Find all data in the Todo collection
/*
Todo.find(function (err, todos) {
  if (err) return console.error("error ::: ", err);
  console.log("TODOS ::: ", todos)
});
*/

// callback function to avoid duplicating it all over
//var callback = function (err, data) {
//  if (err) { return console.error("callback error ::: ", err); }
//  else { console.log("callback success ::: ", data); }
//}
// Get ONLY completed tasks
//Todo.find({completed: true }, callback);
// Get all tasks ending with `JS`
//Todo.find({name: /^JS/ }, callback);

/*var oneYearAgo = new Date();
oneYearAgo.setYear(oneYearAgo.getFullYear() - 1);
// Get all tasks staring with `Master`, completed
Todo.find({name: /^Master/, completed: true }, callback);
// Get all tasks staring with `Master`, not completed and created from year ago to now...
Todo.find({name: /^Master/, completed: false }).where('updated_at').gt(oneYearAgo).exec(callback);

// Model.update(conditions, update, [options], [callback])
// update `multi`ple tasks from complete false to true
Todo.update({ name: /master/i }, { completed: true }, { multi: true }, callback);
//Model.findOneAndUpdate([conditions], [update], [options], [callback])
Todo.findOneAndUpdate({name: /JS$/ }, {completed: false}, callback);
*/
