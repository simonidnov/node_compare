const db = require('mongoose'),
      metas_datas = {
          key         : {type:"string"},
          value       : {type:"string"},
          content     : {type:'Object'},
          created     : {type:'Date', default: Date.now},
          updated     : {type:'Date', default: Date.now}
      };

if(db.connection.readyState === 0){
    db.connect(config.database.users, {useMongoClient: true});
}
const metasSchemas = new db.Schema(metas_datas),
      Metas = db.model('Metas', metasSchemas);
//db.close();

module.exports = {
    attributes: metas_datas
};
module.exports.get = function(req, res, callback){
  if(typeof req.query.data !== "undefined"){
    req.query = req.query.data;
  }
  if(typeof req.query.key === "undefined"){
    callback({status:405, datas:"NEED_KEY"});
  }else{
    Metas.find({}, function(err, infos){
        if(err){
            callback({status:405, datas:err});
        }else{
            callback({status:200, datas:infos});
        }
    });
  }
};
module.exports.create = function(req, res, callback){
  if(typeof req.body.data !== "undefined"){
    var data_set = req.body.data;
  }
  if(typeof data_set.key === "undefined"){
    callback({"status":204, "datas":{"message":"NEED_META_KEY"}});
  }
  if(typeof data_set.value === "undefined"){
    callback({"status":204, "datas":{"message":"NEED_META_VALUE"}});
  }
  //callback({status:200, body:req.body});
  var new_meta_datas = {
    key: data_set.key,
    value : data_set.value,
    content : data_set.content
  }

  new_meta = new Metas(new_meta_datas);
  new_meta.save(function(err, infos){
      if(err) callback({"status":400, "datas":{"message":err}});
      else callback({"status":200, "datas":infos});
  });
}
