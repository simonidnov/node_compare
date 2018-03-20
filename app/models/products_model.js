// GOOGLE API KEY : AIzaSyB_MlYEDlRnNWYtrn-y63pbjrWecYaocqs
const db = require('mongoose'),
      config = require('../config/config'),
      products_datas = {
          label             : {type:"string", unique: true},
          description       : {type:"string"},
          keywords          : {type:"string"},
          thumb             : {type:"string"},
          details           : {type:"string"},
          medias            : {type:"Array"},
          price             : {type:"number"},
          devise            : {type:"string", "enum": ["€", "£", "$"]},
          type              : {type:"string", "enum": ["physical", "demateralized"]},
          attributs         : {type:"Object"},
          medias            : {type:"Object"},
          created           : {type:"Date", "default": "Date.now"},
          updated           : {type:"Date", "default": "Date.now"}
      };

if(db.connection.readyState === 0){
    db.connect(config.database.users, {useMongoClient: true});
}
const productsSchemas = new db.Schema(products_datas),
      Products = db.model('Products', productsSchemas);

module.exports = {
    attributes: products_datas
};
module.exports.get = function(user_id, product_id, callback){
    var query = {"_id":product_id};
    Products.find(query, function(err, infos){
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
            if(err) callback({"status":304, "message":err});
            else callback({"status":200, "pages":infos});
        }
    )
};
module.exports.deleting = function(user_id, products_id, callback){
    Products.deleteOne(
        {
            _id     : products_id
        },
        function(err, infos){
            if(err) callback({"status":405, "message":err});
            else callback({"status":200, "pages":infos});
        }
    )
};
