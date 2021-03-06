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
          name              : {type:"string"},
          short_name        : {type:"string"},
          bundle            : {type:"string", unique: true},
          description       : {type:"string"},
          short_desc        : {type:"string"},
          host              : {type:"string"},
          aliases           : {type:"Object"},
          redirect_url      : {type:"string"},
          tags              : {type:[]},
          secret            : {type:"string"},
          token             : {type:"string"},
          is_widget         : {type:"bool"},
          has_newsletter    : {type:"bool"},
          has_sms           : {type:"bool"},
          has_notifications : {type:"bool"},
          order             : {type:"Number"},
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
          StripeMode                : {type:"bool"},
          StripekeyPublishableTest  : {type:"string"},
          StripekeySecretTest       : {type:"string"},
          StripekeyPublishable      : {type:"string"},
          StripekeySecret           : {type:"string"},
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
    attributes: apps_datas,
    Apps: Apps
};
module.exports.validate = function(secret, host, callback){
  /*
  ,
  $or:{
      aliases:{$indexOfArray: [host]},
      secret:secret
  }
  */
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
module.exports.get = function(user_id, query, callback){
    var query = query;
    Apps.find(query, function(err, infos){
        if(err){
            callback({status:405, datas:err});
        }else{
            if(typeof query === "undefined" || query === null || Object.keys(query).length === 0){
              app.locals.applications = infos;
            }
            callback({status:200, datas:infos});
        }
    }).sort( { order: 1 } );
}
module.exports.create = function(user_id, datas, callback){
    var _self = this;
    console.log('datas add apps :::::::::::: ', datas);
    if(typeof datas.data !== "undefined"){
      datas = datas.data;
    }
    datas.secret = jwt.sign({secret:user_id}, config.secrets.global.secret);
    datas.token = jwt.sign({secret:user_id+Date.now()}, config.secrets.global.secret);
    new_apps = new Apps(datas);
    new_apps.save(function(err, infos){
        if(err){
          callback({"status":405, "message":err});
        }else{
          _self.get(null, {}, function(e){

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
            _id  : apps_id
        },
        {
            $set : datas
        },
        function(err, infos){
            if(err){
              callback({"status":405, "message":err});
            }
            else{
              _self.get(null, {}, function(e){
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
