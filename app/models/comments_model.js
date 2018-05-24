// GOOGLE API KEY : AIzaSyB_MlYEDlRnNWYtrn-y63pbjrWecYaocqs
const db = require('mongoose'),
      config = require('../config/config'),
      _ = require('underscore'),
      Users_model = require('../models/auth_model'),
      await = require('await'),
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
    Comments.find(query).sort({updated: -1}).limit(50).exec(function(err, comments){
        if(err) {
          callback({status:405, datas:err});
        }else {
          var datas = [];
          comments.forEach(function (comment) {
              Users_model.getPublicProfile(comment.user_id, function(user_info){
                datas.push({
                  _id : comment._id,
                  label : comment.label,
                  page_url : comment.page_url,
                  content : comment.content,
                  stars : comment.stars,
                  user_id : comment.user_id,
                  created : comment.created,
                  updated : comment.updated,
                  user_infos : user_info.datas
                });
              });
          });
          setTimeout(function(){
            var sorted = _.sortBy(datas,function(node){
              return - (new Date(node.created).getTime());
            });
            callback({status:200, datas:sorted});
          }, 500);
        }
    });
};

module.exports.getStats = function(req, res, callback){
    if(typeof req.query.page_url === "undefined"){
      callback({status:405, messsage:"need page url"});
    }
    Comments.aggregate([
    		{
          "$match": {
            page_url: req.query.page_url
          }
        },
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
            if(infos.length === 0){
              infos = [{count:0, stars:0, _id:req.query.page_url}];
            }else if(typeof infos[0].count === "undefined"){
              infos = [{count:0, stars:0, _id:req.query.page_url}];
            }
            callback({status:200, datas:infos});
        }
    });
};
module.exports.create = function(req, res, callback){
    //datas.user = user._id;
    if(typeof req.body.data !== "undefined"){
      req.body = req.body.data;
    }
    if(typeof req.body === "undefined"){
      callback({status:203, datas:{message:"METHOD NOT ALLOWED"}});
    }
    if(typeof req.body.label === "undefined"){
      callback({status:203, datas:{message:"NEED_LABEL"}});
    }
    if(typeof req.body.page_url === "undefined"){
      callback({status:203, datas:{message:"NEED_PAGE_URL"}});
    }
    if(typeof req.body.content === "undefined"){
      callback({status:203, datas:{message:"NEED_CONTENT"}});
    }
    if(typeof req.body.stars === "undefined"){
      callback({status:203, datas:{message:"NEED_STARS"}});
    }
    if(typeof req.body.options.user_id === "undefined"){
      callback({status:203, datas:{message:"NEED_USER_ID"}});
    }
    //callback({status:200, body:req.body});
    var comment_datas = {
      label: req.body.label,
      page_url : req.body.page_url,
      content : req.body.content,
      stars : req.body.stars,
      user_id: req.body.options.user_id
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
module.exports.delete = function(req, res, callback){
    Comments.deleteOne(
        {
            _id     : req.body.comment_id,
            user_id : req.body.options.user_id
        },
        function(err, infos){
            if(err) callback({"status":405, "message":err});
            else callback({"status":200, "datas":infos});
        }
    )
};
