// GOOGLE API KEY : AIzaSyB_MlYEDlRnNWYtrn-y63pbjrWecYaocqs
const db = require('mongoose'),
      config = require('../config/config'),
      products_datas = {
          label             : {type:"string", unique: true},
          description       : {type:"string"},
          keywords          : {type:"string"},
          thumb             : {type:"string"},
          picture           : {type:"string"},
          details           : {type:"string"},
          price             : {type:"number"},
          devise            : {type:"string", "enum": ["€", "£", "$"]},
          type              : {type:"string", "enum": ["physical", "demateralized"]},
          attributs         : {type:"Object"},
          medias            : {type:"Array"},
          created           : {type:"Date", "default": Date.now},
          updated           : {type:"Date", "default": Date.now}
      },
      fs = require('fs');;

if(db.connection.readyState === 0){
    db.connect(config.database.users, {useMongoClient: true});
}
const productsSchemas = new db.Schema(products_datas),
      Products = db.model('Products', productsSchemas);

module.exports = {
    attributes: products_datas
};
module.exports.get = function(user_id, query, callback){
    Products.find(query, function(err, infos){
        if(err){
            callback({status:304, "datas":{title:"PRODUCT_GET_ERROR", "message":"PRODUCT_GET_ERROR_MESSAGE", "media":"PRODUCT_GET_ERROR_MEDIA", "code":err.code, "errmsg":err.errmsg}});
        }else{
            callback({status:200, datas:infos});
        }
    });
};
module.exports.create = function(user_id, datas, callback){
    //datas.user = user._id;
    delete datas.options;
    delete datas.device_infos;
    new_product = new Products(datas);
    new_product.save(function(err, infos){
        if(err){
          callback({"status":304, "datas":{title:"PRODUCT_CREATED_ERROR", "message":"PRODUCT_CREATED_ERROR_MESSAGE", "media":"PRODUCT_CREATED_ERROR_MEDIA", "code":err.code, "errmsg":err.errmsg}});
        }else{
          callback({"status":200, "datas":{infos:infos, title:"PRODUCT_CREATED", "message":"PRODUCT_CREATED_MESSAGE", "media":"PRODUCT_CREATED_MEDIA"}});
        }
    });
};
module.exports.update = function(user_id, products_id, datas, callback){
    delete datas.options;
    delete datas._id;
    datas.updated = Date.now();
    Products.updateOne(
        {
            _id  : products_id
        },
        {
            $set : datas
        },
        function(err, infos){
            if(err) callback({"status":304, "datas":{title:"PRODUCT_UPDATED_ERROR", "message":"PRODUCT_UPDATED_ERROR_MESSAGE", "media":"PRODUCT_UPDATED_ERROR_MEDIA", "code":err.code, "errmsg":err.errmsg}});
            else callback({"status":200, "datas":{infos:infos, title:"PRODUCT_UPDATED", "message":"PRODUCT_UPDATED_MESSAGE", "media":"PRODUCT_UPDATED_MEDIA"}});
        }
    )
};
module.exports.addFile = function(product_id, file, callback){
    Products.updateOne(
        {
            _id  : product_id
        },
        {
            $push: {
              medias: {
                fieldname: file.filedname,
                originalname: file.originalname,
                encoding: file.encoding,
                mimetype: file.mimetype,
                destination: file.destination,
                filename: file.filename,
                path: file.path,
                size: file.size
              }
            }
        },
        function(err, infos){
            if(err) callback({"status":403, "datas":{title:"PRODUCT_UPDATED_ERROR", "message":"PRODUCT_UPDATED_ERROR_MESSAGE", "media":"PRODUCT_UPDATED_ERROR_MEDIA", "code":err.code, "errmsg":err.errmsg}});
            else callback({"status":200, "datas":{infos:infos, title:"PRODUCT_UPDATED", "message":"PRODUCT_UPDATED_MESSAGE", "media":"PRODUCT_UPDATED_MEDIA"}});
        }
    )
};
module.exports.removeFile = function(product_id, filename, callback){
    fs.unlink('./uploads/'+filename, function(){});
    this.get(null, {_id:product_id}, function(e){
      if(e.status === 200){
        var medias = [];
        for(var i=0; i<e.datas[0].medias.length; i++){
          if(typeof e.datas[0].medias[i] !== "undefined" && typeof e.datas[0].medias[i][0] !== "undefined" && e.datas[0].medias[i][0] !== null){
            if(e.datas[0].medias[i][0].filename !== filename){
              medias.push(e.datas[0].medias[i]);
            }
          }
        }
        Products.updateOne(
            {
                _id  : product_id
            },
            {
              medias:medias
            },
            function(err, infos){
                if(err) callback({"status":403, "datas":{title:"PRODUCT_UPDATED_ERROR", "message":"PRODUCT_UPDATED_ERROR_MESSAGE", "media":"PRODUCT_UPDATED_ERROR_MEDIA", "code":err.code, "errmsg":err.errmsg}});
                else callback({"status":200, "datas":{infos:infos, title:"MEDIA_DELETED", "message":"MEDIA_DELETED", "media":"MEDIA_DELETED"}});
            }
        );
      }else{
        callback({"status":403, "datas":{title:"PRODUCT_UPDATED_ERROR", "message":"PRODUCT_UPDATED_ERROR_MESSAGE", "media":"PRODUCT_UPDATED_ERROR_MEDIA", "code":err.code, "errmsg":err.errmsg}});
      }
    });
};
module.exports.deleting = function(user_id, products_id, callback){
    Products.deleteOne(
        {
            _id     : products_id
        },
        function(err, infos){
            if(err) callback({"status":304, "datas":{title:"PRODUCT_DELETED_ERROR", "message":"PRODUCT_DELETED_ERROR_MESSAGE", "media":"PRODUCT_DELETED_ERROR_MEDIA", "code":err.code, "errmsg":err.errmsg}});
            else callback({"status":200, "datas":{infos:infos, title:"PRODUCT_DELETED", "message":"PRODUCT_DELETED_MESSAGE", "media":"PRODUCT_DELETED_MEDIA"}});
        }
    )
};
