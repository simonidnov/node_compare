const db = require('mongoose'),
      app = require('../app'),
      sha1 = require('sha1'),
      jwt = require('jsonwebtoken'),
      validator = require("email-validator"),
      Members_model = require('../models/members_model'),
      Address_model = require('../models/address_model'),
      config = require('../config/config'),
      os = require('os'),
      gravatar = require('gravatar'),
      user_datas = {
          email       : {type:'string', unique: true},
          password    : {type:'string'},
          pseudo      : {type:'string', unique: true},
          firstName   : {type:'string'},
          avatar      : {type:'string'},
          lastName    : {type:'string'},
          phone       : {type:'string'},
          mobile      : {type:'string'},
          token       : {type:'string'},
          secret      : {type:'string'},
          qrcode      : {type:'Object'},
          birthDate   : {type:'Date'},
          gender      : {type:'string', enum:['undefined', 'male', 'female'], defaults :'undefined'},
          address     : {type:'Array'},
          friends     : {type:'Array'},
          relations   : {type:'Array'},
          apps        : {type:'Array'},
          tags        : {type:'Object'},
          devices     : {type:'Object'},
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
          public_profile : {type:'Object'}
      },
      machineId = require('node-machine-id'),
      device_uid = machineId.machineIdSync({original: true});

if(db.connection.readyState === 0){ 
    db.connect(config.database.users, {useMongoClient: true});
}
const userSchemas = new db.Schema(user_datas),
      User = db.model('User', userSchemas);
//db.close();

db.connection.on('open', function (ref) {
  console.log('Connected to mongo server.');
});
db.connection.on('error', function (err) {
  console.log('Could not connect to mongo server!');
  console.log(err);
});

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
    var self = this;
    User.find({}, function(err, users){
        if (err){
            callback({"status":304, "code":err.code, "error":err, "message":err.message});
        }else{
            callback({"status":200, "users":users, "total":self.getCount()});
        }
    }).skip (parseInt(datas.page)*50).limit (50);
};
// check user login then return user_infos
module.exports.login = function(req, datas, callback) {
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
                                callback({"status":"error", "code":11, "error":err, "message":"user_not_found"});   
                            }else{
                                if(users.length === 0){
                                    callback({"status":"error", "code":11, "error":err, "message":"user_not_found", email_valid:users.length});
                                }else{
                                    callback({"status":"error", "code":13, "error":err, "message":"wrong_pawword", email_valid:users.length});
                                }
                            }
                        });
                        return false;
                    }
                    /* CHECK DEVICE */
                    var new_device  = {
                            uid     : datas.device_uid,
                            arch    : os.arch(),
                            name    : os.hostname()
                        },
                        new_token = jwt.sign({secret:users[0].secret}, config.secrets.global.secret, { expiresIn: '2 days' });
                    
                    new_device.token = new_token;
                    
                    //console.log('users[0]._id ', users[0]._id);
                    /* check if device exist */
                    User.find(
                        {
                            _id:users[0]._id, 
                            devices:{ 
                                $elemMatch : {
                                    uid:datas.device_uid
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
                                        else console.log("new_device ajouté success ", device)
                                    }
                                );
                            }else{
                                if(device.length === 0){
                                    //console.log('-------------------- new_device device introuvable on l\'ajoute -------------- ', device);
                                    /* ON AJOUTE UN DeVICE INCONNU SUR l'UTILISATEUR */
                                    User.update(
                                        { _id: users[0]._id },
                                        { 
                                            $push: { devices: new_device }
                                        },
                                        function(err, device){
                                            if(err) console.log('impossible d insérer le new_device ', err);
                                            else console.log("new_device ajouté success ", device)
                                        }
                                    );
                                }else{
                                    /*
                                    User.update({devices: { devices: new_device } }, function(err, device){
                                        if(err) console.log('impossible d insérer le new_device ', err);
                                        else console.log("new_device ajouté success ", device)
                                    });
                                    */
                                    /* Update Object in Array Collection */
                                    User.update(
                                        {id:users[0]._id, devices: {$elemMatch: {uid:datas.device_uid}}}, // ON SELECTIONNE L'OBJECT DANS LE TABLEAU
                                        {
                                            $set : {token : new_token}
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
                    
                    /* UPDATE */
                    if(users[0].avatar === "" || users[0].avatar == null){
                        var avatar = gravatar.url(users[0].email, {s: '200', r: 'pg', d: '404'}).replace('//', 'http://');
                    }else{
                        var avatar = users[0].avatar;
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
                                callback({"status":"error", "code":err.code, "error":err, "message":err.message});
                            }else{
                                self.reset_session(req, users[0]._id, function(infos){
                                    callback({status:200, "message":"User updated", "idkids_user":infos});
                                });
                            }
                        }
                    );
                }
            });
            //
            //User.find({email: datas.email, password: sha1(datas.password), termAccept:1}, callback);
        }else{
            callback({"message":"email invalide"}, null);   
        }
    }else{
        callback([]);
    }
    return datas;
};
// check user logout then return user_infos
module.exports.logout = function(datas, callback) {
    /* UPDATE token, updated then free user session and storage */
    callback();
    return datas;
};
// check user register then return user_infos
module.exports.register = function(datas, callback) {
    /* UPDATE ALL datas set check email is uniq and valid then send confirmation email */
    /* ----- CHECK EMAIL UNIQ ----- */
    /* ----- GENERATE TOKEN FIRST expire in 24 H ----- */
    db.connect(config.database.users, {useMongoClient: true});
    
    var new_user_datas = {
            email   : datas.body.subscribe_email,
            password: sha1(datas.body.subscribe_password),
            pseudo  : datas.body.pseudo,
            secret  : jwt.sign({}, config.secrets.global.secret, {}, { expiresIn: '2 days' }),
            termAccept : true,
            rights  : {
                "type":'RWO',
                "authorizations":['me']
            }
        }
    new_user_datas.token = jwt.sign({secret:new_user_datas.secret}, config.secrets.global.secret, { expiresIn: '2 days' });
    new_user_datas.device = [{
        uid     : datas.body.device_uid,
        arch    : os.arch(),
        name    : os.hostname(),
        token   : jwt.sign({secret:new_user_datas.secret}, config.secrets.global.secret, { expiresIn: '2 days' }),
        avatar  : gravatar.url(datas.body.subscribe_email, {s: '200', r: 'pg', d: '404'}).replace('//', 'http://')
    }];
    //network : os.networkInterfaces(),
    /* TODO CHECK ARRAY SEND FORM DATA */
    if(datas.body.subscribe_newsletter){
        new_user_datas.newsletter = true;
        new_user_datas.newsletter_services = {};
        if(datas.body.newsletter_okaidi){
            new_user_datas.newsletter_services.okaidi = 1;
        }
        if(datas.body.newsletter_obaibi){
            new_user_datas.newsletter_services.obaibi = 1; 
        }
        if(datas.body.newsletter_jacadi){
            new_user_datas.newsletter_services.jacadi = 1;
        }
        if(datas.body.newsletter_oxybul){
            new_user_datas.newsletter_services.oxybul = 1;
        }
        if(datas.body.newsletter_rclv){
            new_user_datas.newsletter_services.rclv = 1;
        }
        if(datas.body.newsletter_njoy){
            new_user_datas.newsletter_services.njoy = 1;
        }
        if(datas.body.newsletter_joyvox){
            new_user_datas.newsletter_services.joyvox = 1;
        }
    }else{
        new_user_datas.newsletter = false;
        new_user_datas.newsletter_services = {};
    }
    
    new_user = new User(new_user_datas);
    new_user.save(function(err){  
        if(err) callback({"status":"error", "message":err});
        else callback({"status":"success", "user":new_user_datas});
        //db.close();
    });
    //callback(new_user);
    return datas.body;
};
// check user unregister then return user_infos
module.exports.unregister = function(datas) {
    /* DELETE where email, passe, secret and token */
    return datas;
};
// check user login then return user_infos
module.exports.update = function(req, user_id, datas, callback) {
    var self = this;
    /* UPDATE token, updated then free user session and storage */
    datas.updated = Date.now();
    if(typeof datas.birthDate !== "undefined"){
        datas.birthDate = datas.birthDate;
    }
    //User.findOne({ _id: 'bourne' }, function (err, doc){
    User.update(
        {
            _id:user_id
        }, // ON SELECTIONNE L'OBJECT DANS LE TABLEAU
        {
            $set : datas
        }, // ON SET LES VARIABLES A METTRE A JOUR ICI LE TOKEN JETON UTILISATEUR
        function(err, infos){
            if(err){
                callback({status:401, "message":"Impossible de mettre à jour le token WHY ?", "datas":err});
            } else {
                /* TODO RESET SESSION USER FUNCTION */
                self.reset_session(req, user_id, function(){
                    callback({status:200, "message":"User updated", "datas":infos});
                });   
            }
        } , // CALLBACK
        true //SAIS PAS POURQUOI
    );
};
module.exports.check_user = function(req, callback){
    var new_device  = {
            uid     : req.options.device_uid,
            arch    : os.arch(),
            name    : os.hostname()
        },
        new_token = jwt.sign({secret:req.options.user_secret}, config.secrets.global.secret, { expiresIn: '2 days' });
    
    new_device.token = new_token;
    
    /* check if device exist */
    User.find(
        {
            _id:req.options.user_id, 
            secret : req.options.user_secret,
            devices:{ 
                $elemMatch : {
                    uid:req.options.device_uid,
                    token:req.options.user_token
                }
            }
        },
        function(err, user) {
            if(err){
                callback({status:401, "message":"user token device doesn't match", "datas":err});
            }else{
                /* ON MET A JOUR LE TOKEN */
                User.update(
                    {
                        id:req.options.user_id, 
                        devices: {
                            $elemMatch: {
                                uid:req.options.device_uid
                            }
                        }
                    }, // ON SELECTIONNE L'OBJECT DANS LE TABLEAU
                    {
                        $set : {
                            token : new_token,
                            updated : Date.now()
                        }
                    } , // ON SET LES VARIABLES A METTRE A JOUR ICI LE TOKEN JETON UTILISATEUR
                    function(err, infos){
                        if(err) callback({status:401, "message":"Impossible de mettre à jour le token WHY ?", "datas":err});
                        else callback({status:200, "message":"User auth success", "datas":user, "updated_token":new_token});
                    } , // CALLBACK
                    true //SAIS PAS POURQUOI
                );
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
                        req.session.Auth = user_infos;
                        callback({status:200, "message":"Session Updated", "datas":user_infos});    
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
                callback({status:401, "message":"This is no way to peace -> peace is the way. UNAUTHORIZED", "datas":err});
            }else{
                if(user !== null){
                    Members_model.get(_id, null, function(e){
                        user['members'] = e.datas;
                        callback({status:200, "message":"success me", "datas":user});
                    });
                }else{
                    callback({status:304, "message":"USER NOT FOUND", "datas":user});
                }
            }
        }
    );
};
/* SPECIAL REQUEST SCHEMA SAMPLE CODE */
user_datas.getAge = function(){
    return this.birthDate;
};





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
//Todo.find({name: /^Simon/ }, callback);

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