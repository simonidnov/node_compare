// GOOGLE API KEY : AIzaSyB_MlYEDlRnNWYtrn-y63pbjrWecYaocqs
const db = require('mongoose'),
      config = require('../config/config'),
      comments_datas = {
          label             : {type:"string", unique: true},
          description       : {type:"string"},
          content           : {type:"string"},
          user_id           : {type:"string"},
          is_response       : {type:"bool"},
          comment_id        : {type:"string"},
          page_url          : {type:"string"},
          stars             : {type:"integer"},
          is_valid          : {type:"bool"},
          created           : {type:"Date", "default": "Date.now"},
          updated           : {type:"Date", "default": "Date.now"}
      };

if(db.connection.readyState === 0){
    db.connect(config.database.users, {useMongoClient: true});
}
const commentsSchemas = new db.Schema(comments_datas),
      Comments = db.model('Comments', commentsSchemas);

module.exports = {
    attributes: comments_datas
};
module.exports.get = function(user_id, page_url, callback){
    var query = {"page_url":page_url};
    Comments.find(query, function(err, infos){
        if(err) callback({status:405, datas:err});
        else callback({status:200, datas:infos});
    });
};
module.exports.create = function(user_id, datas, callback){
    console.log(datas);
    //datas.user = user._id;
    new_product = new Products(datas);
    new_product.save(function(err, infos){
        if(err) callback({"status":405, "message":err});
        else callback({"status":200, "datas":infos});
    });
};
module.exports.update = function(user_id, comment_id, datas, callback){
    delete datas.options;
    delete datas._id;
    datas.updated = Date.now();
    Products.updateOne(
        {
            _id  : comment_id,
            user_id : user_id
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
module.exports.deleting = function(user_id, comment_id, callback){
    Products.deleteOne(
        {
            _id     : comment_id,
            user_id : user_id
        },
        function(err, infos){
            if(err) callback({"status":405, "message":err});
            else callback({"status":200, "pages":infos});
        }
    )
};
