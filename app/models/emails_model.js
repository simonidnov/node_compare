const db = require('mongoose'),
      emailing = require('express')(),
      path = require('path'),
      config = require('../config/config'),
      mailer = require('express-mailer'),
      email_datas = {
          user_id         : {type:"string"},
          email           : {type:"string"},
          created         : {type:'Date', default: Date.now},
          sended          : {type:'Date', default: Date.now},
          updated         : {type:'Date', default: Date.now},
          content         : {type:'string'}
      };

mailer.extend(emailing, config.emailing);

emailing.set('views', path.join(__dirname, '../views'));
emailing.set('view engine', 'pug');

if(db.connection.readyState === 0){
    db.connect(config.database.users, {useMongoClient: true});
}
const emailSchemas = new db.Schema(email_datas),
      Email = db.model('Emails', emailSchemas);
//db.close();

module.exports = {
    attributes: email_datas
};

module.exports.send = function(template, user_id, datas, callback){
    data = {
        user_id : user_id,
        email : datas.email,
        content : template
    }
    new_email = new Email(data);
    new_email.save(function(err, infos){
        if(err) callback({"status":405, "message":"error email sending impossible"});
        else console.log('success entry')
    });
    //callback({"status":200, "datas":infos});
    emailing.mailer.send(template, datas, function(err, infos){
        if (err) {
            callback({status:405, response_display:{message:'Email ERROR', type:'modal'}, err:err, datas:datas, config:config});
            return;
        }
        callback({status:200, response_display:{message:'L\'email à bien été envoyé', type:'modal'}, datas:datas, infos:infos});
    });
}
