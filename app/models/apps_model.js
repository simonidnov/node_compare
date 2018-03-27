// GOOGLE API KEY : AIzaSyB_MlYEDlRnNWYtrn-y63pbjrWecYaocqs
const db = require('mongoose'),
      config = require('../config/config'),
      jwt = require('jsonwebtoken'),
      apps_datas = {
          icon              : {type:"string"},
          logo              : {type:"string"},
          splash            : {type:"string"},
          color             : {type:"string"},
          label             : {type:"string"},
          name              : {type:"string", unique: true},
          short_name        : {type:"string"},
          bundle            : {type:"string", unique: true},
          description       : {type:"string"},
          short_desc        : {type:"string"},
          host              : {type:"string"},
          aliases           : {type:"Object"},
          redirect_url      : {type:"string"},
          tags              : {type:"Array"},
          secret            : {type:"string"},
          token             : {type:"string"},
          is_widget         : {type:"bool"},
          has_newsletter    : {type:"bool"},
          has_sms           : {type:"bool"},
          has_notifications : {type:"bool"},
          authorizations    : {
                user_public     : {type:"bool"},
                user_private    : {type:"bool"},
          },
          certificats       : {
              apple:{type:"string"},
              android:{type:"string"},
              osx:{type:"string"},
              windows:{type:"string"}
          },
          terms_url         : {type:"String"},
          created           : {type:'Date', default: Date.now},
          updated           : {type:'Date', default: Date.now}
      };

if(db.connection.readyState === 0){
    db.connect(config.database.users, {useMongoClient: true});
}
const appsSchemas = new db.Schema(apps_datas),
      Apps = db.model('Apps', appsSchemas);

module.exports = {
    attributes: apps_datas
};
module.exports.validate = function(secret, host, callback){
  /*
  ,
  $or:{
      aliases:{$indexOfArray: [host]},
      secret:secret
  }
  */
  console.log('*************************');
  console.log('*************************');
  console.log('*************************');
  console.log('*************************');
  console.log(secret, host);
  console.log('*************************');
  console.log('*************************');
  console.log('*************************');
  console.log('*************************');
    Apps.find(
        {
            secret:secret
        },
        function(err, infos){
            if(err) callback({status:405, datas:err});
            else callback({status:200, datas:infos});
        }
    );

    //callback({status:200, secret:secret});
}
module.exports.get = function(user_id, apps_id, callback){
    var query = {};
    Apps.find(query, function(err, infos){
        if(err) callback({status:405, datas:err});
        else callback({status:200, datas:infos});
    });
}
module.exports.create = function(user_id, datas, callback){
    var _self = this;
    datas.secret = jwt.sign({secret:user_id}, config.secrets.global.secret);
    datas.token = jwt.sign({secret:user_id+Date.now()}, config.secrets.global.secret);
    new_apps = new Apps(datas);
    new_apps.save(function(err, infos){
        if(err){
          callback({"status":405, "message":err});
        }else{
          _self.get(null, null, function(e){
              app.locals.applications = e.datas;
          });
          callback({"status":200, "datas":infos});
        }
    });

}
module.exports.update = function(user_id, apps_id, datas, callback){

    delete datas.options;
    delete datas._id;
    var _self = this;
    datas.updated = Date.now();
    Apps.updateOne(
        {
            _id     : apps_id
        },
        {
            $set : datas
        },
        function(err, infos){
            if(err){
              callback({"status":405, "message":err});
            }
            else{
              _self.get(null, null, function(e){
                  app.locals.applications = e.datas;
              });
              callback({"status":200, "apps":infos});
            }
        }
    )
}
module.exports.delete = function(user_id, apps_id, callback){
    Apps.deleteOne(
        {
            _id     : apps_id
        },
        function(err, infos){
            if(err) callback({"status":405, "message":err});
            else callback({"status":200, "apps":infos});
        }
    )
}
