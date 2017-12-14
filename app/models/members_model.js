const db = require('mongoose'),
      config = require('../config/config'),
      member_datas = {
          user_id         : {type:"string"},
          first_name      : {type:'string'},
          last_name       : {type:'string'},
          pseudo          : {type:'string'},
          avatar          : {type:'string'},
          birth_date      : {type:'string'},
          gender          : {type:'string', enum:['undefined', 'male', 'female'], defaults :'undefined'},
          tags:{
              type:{type:'string', enum:['sport', 'éducation', 'culture', 'divertissements', 'autre'], defaults :'undefined'},
              label:{type:'string'}
          }
      };

if(db.connection.readyState === 0){ 
    db.connect(config.database.users, {useMongoClient: true});
}
const memberSchemas = new db.Schema(member_datas),
      Member = db.model('Member', memberSchemas);
//db.close();

module.exports = {
    attributes: member_datas
};
// check user login then return user_infos

module.exports.get = function(user_id, member_id, callback){
    var query = {};  
    if(user_id !== null){
        query['user_id'] = user_id;
        //callback({status:403, datas:[], message:"NO USER ID SPECIFIED"});
    }
    if(member_id !== null){
        query['member_id'] = member_id;
    }
    Member.find(query, function(err, members){
        if(err) callback({status:405, datas:err});
        else callback({status:200, datas:members});
    });
}
module.exports.create = function(user_id, datas, callback){
    datas.user_id = user_id;
    new_member = new Member(datas);
    new_member.save(function(err, infos){  
        if(err) callback({"status":405, "message":err});
        else callback({"status":200, "datas":infos});
    });
}
module.exports.update = function(user_id, member_id, datas, callback){
    Member.updateOne(
        {
            user_id     : user_id,
            _id   : member_id
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
module.exports.delete = function(user_id, member_id, callback){
    Member.deleteOne(
        {
            user_id     : user_id,
            _id   : member_id
        },
        function(err, infos){
            if(err) callback({"status":405, "message":err});
            else callback({"status":200, "user":infos});
        }
    )
}