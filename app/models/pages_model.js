// GOOGLE API KEY : AIzaSyB_MlYEDlRnNWYtrn-y63pbjrWecYaocqs
const db = require('mongoose'),
      config = require('../config/config'),
      pages_datas = {
          label             : {type:"string", unique: true},
          description       : {type:"string"},
          keywords          : {type:"string"},
          url               : {type:"string"},
          thumb             : {type:"string"},
          details           : {type:"string"},
          html              : {type:"string"},
          structure         : {type:"Object"},
          stylsheet         : {type:"string"},
          javascript        : {type:"string"},
          user              : {type:"string"},
          created           : {type:'Date', default: Date.now},
          updated           : {type:'Date', default: Date.now}
      };

if(db.connection.readyState === 0){
    db.connect(config.database.users, {useMongoClient: true});
}
const pagesSchemas = new db.Schema(pages_datas),
      Pages = db.model('Pages', pagesSchemas);

module.exports = {
    attributes: pages_datas
};
module.exports.get = function(params, pages_id, callback){
    var query = {};
    if(typeof params.page_url !== "undefined"){
      query.url = params.page_url;
    }
    if(typeof params.page_id !== "undefined"){
      query._id = params.page_id;
    }
    Pages.find(query, function(err, infos){
        if(err) callback({status:405, datas:err});
        else callback({status:200, datas:infos});
    });
};
module.exports.create = function(user_id, datas, callback){
    //datas.user = user._id;
    new_page = new Pages(datas);
    new_page.save(function(err, infos){
        if(err) callback({"status":405, "message":err});
        else callback({"status":200, "datas":infos});
    });
};
module.exports.update = function(user_id, pages_id, datas, callback){
    delete datas.options;
    delete datas._id;
    datas.updated = Date.now();
    Pages.updateOne(
        {
            _id     : pages_id
        },
        {
            $set : datas
        },
        function(err, infos){
            if(err) callback({"status":304, "message":err});
            else callback({"status":200, "pages":infos});
        }
    )
};
module.exports.delete = function(user_id, pages_id, callback){
    Pages.deleteOne(
        {
            _id     : pages_id
        },
        function(err, infos){
            if(err) callback({"status":405, "message":err});
            else callback({"status":200, "pages":infos});
        }
    )
};
