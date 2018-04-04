// GOOGLE API KEY : AIzaSyB_MlYEDlRnNWYtrn-y63pbjrWecYaocqs
const fs = require('fs');

module.exports.get = function(req, res, callback){
  fs.readFile('config/app_settings.json', 'utf8', function readFileCallback(err, data){
      if (err){
          callback(err);
      } else {
          obj = JSON.parse(data); //now it an object
          app.locals.settings = obj;
          callback(obj);
          //obj.table.push({id: 2, square:3}); //add some data
          //json = JSON.stringify(obj); //convert it back to json
          //fs.writeFile('myjsonfile.json', json, 'utf8', callback); // write it back
      }
  });
};
module.exports.update = function(user_id, datas, callback){
  delete datas.options;
  delete datas.user;
  delete datas.device_infos;
  fs.writeFile('./config/app_settings.json', JSON.stringify(datas), 'utf8', function(err, data){
    if (err){
        callback({status:403, error:err});
    } else {
        console.log(data);
        app.locals.settings = datas;
        callback({status:200, datas:data});
    }
  });
}
