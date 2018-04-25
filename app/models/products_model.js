// GOOGLE API KEY : AIzaSyB_MlYEDlRnNWYtrn-y63pbjrWecYaocqs
const db = require('mongoose'),
      _ = require('underscore'),
      Apps_model = require('../models/apps_model'),
      config = require('../config/config'),
      language_helper  = require('../helpers/languages_helper');
      products_datas = {
          label             : {type:"string", unique:false},
          description       : {type:"string"},
          keywords          : {type:"string"},
          category          : {type:"string"},
          sub_category      : {type:"string"},
          extra_category    : {type:"string"},
          public_target     : {type:"string"},
          typology          : {type:"string"},
          app_id            : {type:"ObjectId"},
          app_icon          : {type:"string"},
          app_label         : {type:"string"},
          phonetik          : {type:[]},
          thumb             : {type:"string"},
          picture           : {type:"string"},
          details           : {type:"string"},
          price             : {type:"number"},
          devise            : {type:"string", "enum": ["€", "£", "$"]},
          type              : {type:"string", "enum": ["physical", "demateralized"]},
          attributs         : {type:"Array"},
          medias            : {type:"Array"},
          created           : {type:"Date", "default": Date.now},
          updated           : {type:"Date", "default": Date.now}
      },
      fs = require('fs');

if(db.connection.readyState === 0){
    db.connect(config.database.users, {useMongoClient: true}, function(err, client){
      if(err){
      }else{
      }
    });
}


const productsSchemas = new db.Schema(products_datas);

      productsSchemas.pre('find', function(next) {
        next();
      });

const Products = db.model('Products', productsSchemas);
//Products.collection.dropIndexes();

//Products.dropIndex( { "label" : -1 } );


module.exports = {
    attributes: products_datas,
    Products : Products
};
module.exports.get = function(datas, res, callback){
    var query = {},
        self = this;
    if(typeof datas.product_id !== "undefined"){
      query._id = datas.product_id;
    }
    if(typeof datas.label !== "undefined"){
      //query.label = {$in:[datas.label]};
      query.label = datas.label;
      //{ $regex: new RegExp("^" + datas.label.toLowerCase(), "i") }
    }
    if(typeof datas.phonetik !== "undefined"){
      //console.log("WORDLAB :::: ", language_helper.wordlab(datas.phonetik).split('-'));
      query.phonetik = {$in:language_helper.wordlab(datas.phonetik).split('-')};
    }
    let skip = 0,
        limit = 50;
    if(typeof datas.skip !== "undefined"){
      skip = parseInt(datas.skip);
    }
    //query.limit = Number(5);
    console.log("GET PRODUCT :::: ", query);
    /*query.$lookup = {
       from: "Apps_model.Apps",
       localField: "app_id",
       foreignField: "_id",
       as: "app_infos"
    }*/

    /*Products.aggregate(
        [
          {
            _id: "DFGHJKLM",
            $group:{
              totalAmount:{ $sum: { $multiply: [ "$price", "$quantity" ] } }
            }
          }
        ], function(err, infos){
        }
    );
    ,
    {
      $lookup: {
        from: "apps",
        localField: "Products.app_id",
        foreignField: "_id",
        as: "app_infos"
      }
    }
    */
    let productQuery = Products.find(query).limit(limit).skip(skip).sort({'label': 1}).exec(function(err, products_datas){
        if(err){
            callback({status:304, "datas":{title:"PRODUCT_GET_ERROR", "message":"PRODUCT_GET_ERROR_MESSAGE", "media":"PRODUCT_GET_ERROR_MEDIA", "code":err.code, "errmsg":err.errmsg}});
        }else{
            /*
            infos.forEach(function(info, index){
              Apps_model.get(null, {_id:info.app_id}, function(e){
                if(e.datas.length > 0){
                  info.app_label = e.datas[0].label;
                  info.app_icon = e.datas[0].icon;
                }
              });
            });
            */
            var index = 0;
            if(products_datas.length === 0){
              callback({status:200, datas:products_datas});
            }
            products_datas.forEach(function(prod){
              Apps_model.get(null, {_id : prod.app_id}, function(e){
                if(e.datas.length > 0){
                  prod.app_icon = e.datas[0].icon;
                  prod.app_label = e.datas[0].label;
                  prod.app_infos = [];
                  index++;
                  if(index === products_datas.length){
                    callback({status:200, datas:products_datas});
                  }
                }else{
                  callback({status:200, datas:products_datas});
                }
              });
            });
            //callback({status:200, datas:infos});
        }
    });
};
module.exports.create = function(user_id, datas, callback){
    //datas.user = user._id;
    delete datas.options;
    delete datas.device_infos;

    datas.label = datas.label.toUpperCase();
    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }
    var a = language_helper.wordlab(datas.label+" "+datas.description).split('-');
    datas.phonetik = a.filter( onlyUnique );
    //datas.phonetik = language_helper.wordlab(datas.label+" "+datas.description).split('-');
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
    delete datas.device_infos;
    delete datas._id;
    if(typeof datas.label !== "undefined"){
      datas.label = datas.label.toUpperCase();
    }
    datas.updated = Date.now();
    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }
    var a = language_helper.wordlab(datas.label+" "+datas.description).split('-'),
        phonetik = a.filter( onlyUnique ); // returns ['a', 1, 2, '1']

    Products.updateOne(
        {
            _id: products_id
        },
        {
            $set: datas,
            phonetik : phonetik
        },
        function(err, infos){
            if(err) callback({"status":304, "datas":{title:"PRODUCT_UPDATED_ERROR", "message":"PRODUCT_UPDATED_ERROR_MESSAGE", "media":"PRODUCT_UPDATED_ERROR_MEDIA", "code":err.code, "errmsg":err.errmsg}});
            else callback({"status":200, "datas":{infos:infos, title:"PRODUCT_UPDATED", "message":"PRODUCT_UPDATED_MESSAGE", "media":"PRODUCT_UPDATED_MEDIA"}});
        }
    )
};
module.exports.delete = function(user_id, products_id, callback){
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
/* ----------------------- PRODUCT FILE PROCESS -------------------------- */
module.exports.getFile = function(req, res, callback){
    fs.readFile('./uploads/'+req.params.filename, function read(err, data) {
        if (err) {
            throw err;
        }
        content = data;
        // Invoke the next step here however you like
        callback({status:200, datas:content});   // Put all of the code here (not the best solution)
        //processFile();          // Or put the next step in a function and invoke it
    });
}
module.exports.updatePhonetik = function(req, res, callback){
    Products.find({}, function(err, products_datas){
        if(err){
            callback({status:304, "datas":{title:"PRODUCT_GET_ERROR", "message":"PRODUCT_GET_ERROR_MESSAGE", "media":"PRODUCT_GET_ERROR_MEDIA", "code":err.code, "errmsg":err.errmsg}});
        }else{
            var index = 0;
            if(products_datas.length === 0){
              callback({status:200, datas:products_datas});
            }
            products_datas.forEach(function(prod){
                //if(typeof prod.phonetik === "undefined" || prod.phonetik === "" || prod.phonetik.length === 0){
                  prod.label = prod.label.toUpperCase();
                  function onlyUnique(value, index, self) {
                      return self.indexOf(value) === index;
                  }
                  var a = language_helper.wordlab(prod.label+" "+prod.description).split('-');
                  prod.phonetik = a.filter( onlyUnique );
                  console.log(a);
                  console.log(prod.phonetik);

                  Products.updateOne(
                      {
                          _id: prod._id
                      },
                      {
                          $set: prod
                      },
                      function(err, infos){
                          if(err) console.log("----------------- ERROR PHONETIK -----------------", err);
                          else console.log('updated ', infos);
                      }
                  );
                //}
                //callback({"status":200, "datas":{infos:infos, title:"PRODUCT_UPDATED", "message":"PRODUCT_UPDATED_MESSAGE", "media":"PRODUCT_UPDATED_MEDIA"}});
                index++;
                if(index === products_datas.length){
                  callback({status:200, datas:products_datas});
                }
            });
        }
    });
}
module.exports.createProductFromFile = function(datas, file_infos, callback){
    //console.log("datas product received :::: ", datas);
    //console.log("file created received ::::: ", file_infos);

    var products_datas = {},
        parse_string_file_name = datas.parse_string_file_name.split(';'),
        parse_file_name = file_infos.originalname.split('.')[0].split(datas.separator);
    for(var i=0; i<parse_string_file_name.length; i++){
        products_datas[parse_string_file_name[i]] = parse_file_name[i];
    }

    _.templateSettings = {interpolate: /\{\{(.+?)\}\}/g};
    var description_template = _.template(datas.description);
    products_datas.description = description_template(products_datas);
    products_datas.app_id = datas.app_id;

    //products_datas.medias = file_infos;

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }
    var a = language_helper.wordlab(datas.label+" "+datas.description).split('-');
    products_datas.phonetik = a.filter( onlyUnique );

    products_datas.label = products_datas.label.toUpperCase();

    var self = this;
    new_product = new Products(products_datas);
    new_product.save(function(err, infos){
        if(err){
          callback({"status":304, "datas":{title:"PRODUCT_CREATED_ERROR", "message":"PRODUCT_CREATED_ERROR_MESSAGE", "media":"PRODUCT_CREATED_ERROR_MEDIA", "code":err.code, "errmsg":err.errmsg}});
        }else{
          console.log(infos);
          self.addFile(infos._id, file_infos, function(){
            callback({"status":200, "datas":{infos:infos, title:"PRODUCT_CREATED", "message":"PRODUCT_CREATED_MESSAGE", "media":"PRODUCT_CREATED_MEDIA"}});
          });
        }
    });

    //callback({status:200, body:datas, file:file_infos, message:"simon say hello"});
}
module.exports.deleteAllProducts = function(req, res, callback){
  Products.remove({}, function(err, infos){
    callback({status:200, error:err, datas:infos});
  })
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
