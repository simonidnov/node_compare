// GOOGLE API KEY : AIzaSyB_MlYEDlRnNWYtrn-y63pbjrWecYaocqs
const db = require('mongoose'),
      config = require('../config/config'),
      Users_model = require('../models/auth_model'),
      comments_datas = {
          label             : {type:"string"},
          description       : {type:"string"},
          content           : {type:"string"},
          user_id           : {type:"string"},
          is_response       : {type:"bool"},
          comment_id        : {type:"string"},
          page_url          : {type:"string"},
          stars             : {type:"Number"},
          is_valid          : {type:"bool"},
          created           : {type:"Date", "default": Date.now},
          updated           : {type:"Date", "default": Date.now}
      };

if(db.connection.readyState === 0){
    db.connect(config.database.users, {useMongoClient: true});
}
const commentsSchemas = new db.Schema(comments_datas),
      Comments = db.model('Comments', commentsSchemas);

      Comments.collection.dropIndexes();
module.exports = {
    attributes: comments_datas
};
module.exports.get = function(req, res, callback){
    if(typeof req.query.page_url === "undefined"){
      callback({status:405, messsage:"need page url"});
    }
    var query = {"page_url":req.query.page_url};
    Comments.find(query).limit(50).exec(function(err, infos){
        if(err) {
          callback({status:405, datas:err});
        }else {
          console.log(' COMMENT GET ------------- ', infos);
          callback({status:200, datas:infos});
        }
    });
};
module.exports.getStats = function(req, res, callback){
    if(typeof req.query.page_url === "undefined"){
      callback({status:405, messsage:"need page url"});
    }

    Comments.aggregate([
    		{
          "$group" : {
            _id:"$page_url",
            count: {
              $sum:1
            },
            stars: {
              $sum:{ $multiply: [ "$stars", 1 ] }
            }
          }
        }
      ], function(err, infos){
        if(err){
            callback({status:405, datas:err});
        }else{
            callback({status:200, datas:infos});
        }
    });
    /*
    var query = {"page_url":req.query.page_url};
    Comments.find(query).limit(50).exec(function(err, infos){
        if(err) {
          callback({status:405, datas:err});
        }else {
          console.log(' COMMENT GET ------------- ', infos);
          callback({status:200, datas:infos});
        }
    });
    */
};
module.exports.create = function(req, res, callback){
    //datas.user = user._id;
    console.log("req.body ===== ", req.body);
    if(typeof req.body.data === "undefined"){
      callback({status:400, datas:{message:"METHOD NOT ALLOWED"}});
    }
    if(typeof req.body.data.label === "undefined"){
      callback({status:400, datas:{message:"NEED_LABEL"}});
    }
    if(typeof req.body.data.page_url === "undefined"){
      callback({status:400, datas:{message:"NEED_PAGE_URL"}});
    }
    if(typeof req.body.data.content === "undefined"){
      callback({status:400, datas:{message:"NEED_CONTENT"}});
    }
    if(typeof req.body.data.stars === "undefined"){
      callback({status:400, datas:{message:"NEED_STARS"}});
    }
    if(typeof req.body.data.options.user_id === "undefined"){
      callback({status:400, datas:{message:"NEED_USER_ID"}});
    }
    //callback({status:200, body:req.body});
    var comment_datas = {
      label: req.body.data.label,
      page_url : req.body.data.page_url,
      content : req.body.data.content,
      stars : req.body.data.stars,
      user_id: req.body.data.options.user_id
    }

    new_comment = new Comments(comment_datas);
    new_comment.save(function(err, infos){
        if(err) callback({"status":400, "datas":{"message":err}});
        else callback({"status":200, "datas":infos});
    });

};
module.exports.update = function(req, res, callback){
    delete datas.options;
    delete datas._id;
    datas.updated = Date.now();
    Comments.updateOne(
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
module.exports.deleting = function(req, res, callback){
    Comments.deleteOne(
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
