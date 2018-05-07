// GOOGLE API KEY : AIzaSyB_MlYEDlRnNWYtrn-y63pbjrWecYaocqs
const db = require('mongoose'),
      config = require('../config/config'),
      address_datas = {
          user_id         : {type:"string"},
          label           : {type:"string"},
          first_name      : {type:"string"},
          last_name       : {type:"string"},
          AddressLine1    : {type:'string'},
          AddressLine2    : {type:'string'},
          AddressLine3    : {type:'string'},
          city            : {type:'string'},
          country         : {type:'string'},
          country_code    : {type:'string'},
          cp              : {type:'string'},
          cp_id           : {type:'string'},
          phone           : {type:'string'},
          uniq_encoder    : {type:'string'},
          geocoder        : {
              latitude      : {type:'string'},
              longitude     : {type:'string'},
              country       : {type:'string'},
              countryCode   : {type:'string'},
              city          : {type:'string'},
              zipcode       : {type:'string'},
              streetName    : {type:'string'},
              streetNumber  : {type:'string'},
              administrativeLevels: {
                level1long  : {type:'string'},
                level1short : {type:'string'},
                level2long  : {type:'string'},
                level2short : {type:'string'}
              },
              provider: {type:'string'}
          },
          created     : {type:'Date', default: Date.now},
          updated     : {type:'Date', default: Date.now}
      },
      NodeGeocoder = require('node-geocoder'),
      options = {
          provider: 'google',
          httpAdapter: 'https',
          apiKey: config.google.map,
          formatter: null
      },
      geocoder = NodeGeocoder(options);

if(db.connection.readyState === 0){
    db.connect(config.database.users, {useMongoClient: true});
}
const addressSchemas = new db.Schema(address_datas),
      Address = db.model('Address', addressSchemas);
//db.close();

module.exports = {
    attributes: address_datas
};
// check user login then return user_infos

module.exports.get = function(user_id, address_id, callback){
    var query = {};
    if(user_id !== null){
        query['user_id'] = user_id;
    }
    if(address_id !== null){
        query['address_id'] = address_id;
    }
    Address.find(query, function(err, addresses){
        if(err) callback({status:405, datas:err});
        else callback({status:200, datas:addresses});
    });
}
module.exports.create = function(user_id, datas, callback){
    datas.user_id = user_id;
    console.log('module.exports.create');
    geocoder.geocode(datas.AddressLine1+" "+datas.AddressLine2+" "+datas.AddressLine3+" "+datas.cp+" "+datas.city+" "+datas.country)
        .then(function(res) {
            console.log('geocode success ', res);
            datas.geocoder = res[0];
            new_address = new Address(datas);
            new_address.save(function(err, infos){
                if(err) callback({"status":405, "message":err});
                else callback({"status":200, "datas":infos});
                console.log("res :::: ", res, "    infos ::::: ", infos);
            });
        })
        .catch(function(err) {
            console.log('geocode catch err ', err);
            new_address = new Address(datas);
            new_address.save(function(err, infos){
                if(err) callback({"status":405, "message":err});
                else callback({"status":200, "datas":infos});
                console.log("err ::::: ", err , " infos ::::: ", infos);
            });
        });
}
module.exports.update = function(user_id, address_id, datas, callback){
    Address.updateOne(
        {
            user_id : user_id,
            _id     : address_id
        },
        {
            $set : datas
        },
        function(err, infos){
            if(err) callback({"status":405, "message":err});
            else callback({"status":200, "user":infos});
        }
    )
}
module.exports.delete = function(user_id, address_id, callback){
    Address.deleteOne(
        {
            user_id : user_id,
            _id     : address_id
        },
        function(err, infos){
            if(err) callback({"status":405, "message":err});
            else callback({"status":200, "user":infos});
        }
    )
}
