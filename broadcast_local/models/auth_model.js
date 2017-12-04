const db = require('mongoose'),
      app = require('../app'),
      sha1 = require('sha1'),
      jwt = require('jsonwebtoken'),
      validator = require("email-validator"),
      config = require('../config/config'),
      os = require('os'),
      gravatar = require('gravatar'),
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
          secret      : {type:'string'},
          qrcode      : {type:'Object'},
          birthDate   : {type:'Date'},
          civility    : {type:'string', enum:['undefined', 'male', 'female'], defaults :'undefined'},
          address     : {type:'Array'},
          relations   : {type:'Array'},
          tags        : {type:'Object'},
          devices     : {type:'Object'},
          members     : {type:'Object'},
          termAccept  : {type:'Boolean'},
          newsletter  : {type:'Boolean'},
          rights      : {type:'Object'},
          newsletter_services : {type:'Object'},
          validated   : {type:'Boolean'},
          created     : {type:'Date', default: Date.now},
          updated     : {type:'Date', default: Date.now}
      };

if(db.connection.readyState === 0){
    db.connect(config.database.users, {useMongoClient: true});
}
const userSchemas = new db.Schema(user_datas),
      User = db.model('User', userSchemas);
//db.close();

module.exports = {
    attributes: user_datas
};
// check user login then return user_infos
module.exports.login = function(datas, callback) {
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
                        new_token = jwt.sign({secret:users[0].secret}, config.secrets.global.secret);
                    
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
                                //console.log('new_device FIND error ::: ', err);
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
                                //console.log('new_device FIND success device result ', device);
                                if(device.length === 0){
                                    //console.log('-------------------- new_device device introuvable on l\'ajoute -------------- ', device);
                                    /* ON AJOUTE UN DeVICE INCONNU SUr l'UTILISATEUR */
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
                                    //console.log('-------------------- MISE A JOUR DU TOKEN SUR LE DEVICE TROUVE --------------------- ');
                                    /* Update Object in Array Collection */
                                    User.update(
                                        {id:users[0]._id, devices: {$elemMatch: {uid:datas.device_uid}}}, // ON SELECTIONNE L'OBJECT DANS LE TABLEAU
                                        {
                                            $set : {token : new_token}
                                        } , // ON SET LES VARIABLES A METTRE A JOUR ICI LE TOKEN JETON UTILISATEUR
                                        function(err, infos){
                                            if(err) console.log('update device token error ', err);
                                            else console.log('update device token success ', infos);
                                        } , // CALLBACK
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
                                //console.log('DELETE PASSWORD update success ', user);
                                User.find(
                                    {
                                        _id: users[0]._id
                                    }, 
                                    function(err, users){
                                        if (err){
                                            callback({"status":"error", "code":err.code, "error":err, "message":err.message});
                                        }else{
                                            var return_datas = JSON.parse(JSON.stringify(users[0]));
                                            //delete return_datas.password;
                                            //delete return_datas.relations;
                                            //delete return_datas.address;
                                            return_datas.current_device = datas.device_uid;
                                            callback({"status":"success", "idkids_user":return_datas});
                                        }
                                    }
                                );
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
            secret  : jwt.sign({}, config.secrets.global.secret, {}),
            termAccept : true,
            rights  : {
                "type":'RWU',
                "authorizations":['me']
            }
        }
    new_user_datas.token = jwt.sign({secret:new_user_datas.secret}, config.secrets.global.secret);
    new_user_datas.device = [{
        uid     : datas.body.device_uid,
        arch    : os.arch(),
        name    : os.hostname(),
        token   : jwt.sign({secret:new_user_datas.secret}, config.secrets.global.secret),
        avatar  : gravatar.url(datas.body.subscribe_email, {s: '200', r: 'pg', d: '404'}).replace('//', 'http://')
    }];
    console.log('---------------- new_user_datas avatar ------------------------ ');
    console.log('---------------- new_user_datas------------------------ ');
    console.log(new_user_datas.avatar);
    console.log(gravatar.url(datas.body.subscribe_email, {s: '200', r: 'pg', d: '404'}).replace('//', 'http://'));
    console.log('---------------- new_user_datas------------------------ ');
    console.log('---------------- new_user_datas------------------------ ');
    //network : os.networkInterfaces(),
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
        if(err) callback({"status":"error", "code":err.code , "duplicated_value":err.message.split('{ : "')[1].replace('" }', ''), "error":err});
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
module.exports.update = function(datas) {
    /* UPDATE token, updated then free user session and storage */
    return datas;
};


/* SPECIAL REQUEST SCHEMA SAMPLE CODE */
user_datas.getFullName = function(){
    return this.firstName + ' ' + this.lastName;
};
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