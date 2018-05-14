// GOOGLE API KEY : AIzaSyB_MlYEDlRnNWYtrn-y63pbjrWecYaocqs
const db = require('mongoose'),
      config = require('../config/config'),
      Email_controller = require('../controllers/email_controller'),
      contact_datas = {
          subject           : {type:"string"},
          message           : {type:"string"},
          email             : {type:"string"},
          firstName         : {type:"string"},
          lastName          : {type:"string"},
          email_filter      : {type:"string"},
          is_read           : {type:"bool"},
          user_id           : {type:"string"},
          created           : {type:"Date", "default": Date.now},
          updated           : {type:"Date", "default": Date.now}
      };

if(db.connection.readyState === 0){
    db.connect(config.database.users, {useMongoClient: true});
}
const contactSchemas = new db.Schema(contact_datas),
      Contacts = db.model('Contacts', contactSchemas);

      Contacts.collection.dropIndexes();
module.exports = {
    attributes: contact_datas
};
module.exports.get = function(req, res, callback){
    Contacts.find({}).sort({updated: -1}).limit(50).exec(function(err, contacts){
        if(err) {
          callback({status:203, datas:err});
        }else {
          callback({status:200, datas:contacts});
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
    if(typeof req.body.subject === "undefined"){
      callback({status:203, datas:{message:"NEED_SUBJECT"}});
    }
    if(typeof req.body.message === "undefined"){
      callback({status:203, datas:{message:"NEED_MESSAGE"}});
    }
    if(typeof req.body.email === "undefined"){
      callback({status:203, datas:{message:"NEED_EMAIL"}});
    }
    if(typeof req.body.email_filter === "undefined"){
      callback({status:203, datas:{message:"NEED_FILTER"}});
    }
    if(typeof req.body.firstName === "undefined"){
      callback({status:203, datas:{message:"NEED_FIRSTNAME"}});
    }
    if(typeof req.body.lastName === "undefined"){
      callback({status:203, datas:{message:"NEED_LASTNAME"}});
    }
    //callback({status:200, body:req.body});
    var contact_datas = {
      subject: req.body.subject,
      message : req.body.message,
      email : req.body.email,
      email_filter : req.body.email_filter,
      is_read: false
    }
    if(typeof req.body.options !== "undefined"){
      if(typeof req.body.options.user_id !== "undefined"){
        contact_datas.user_id = req.body.options.user_id;
      }
    }
    new_contact = new Contacts(contact_datas);
    new_contact.save(function(err, infos){
        if(err) callback({"status":400, "datas":{"message":err}});
        else {
          /* ON ENVOIE LE MAIL DE CONFIRMATION AU CLIENT */
          Email_controller.send(
            null,
            {
              subject:"Votre email pour JOYVOX",
              title:req.body.subject,
              message:"Votre message à bien été envoyé : <br><br><b>Voici votre message pour Joyvox :</b><br>"+req.body.email_filter+"<br>"+req.body.message,
              email:req.body.email,
              to:req.body.email
            },
            function(e){
              /* ON ENVOIE LE MAIL A JOYVOX */
              Email_controller.send(
                null,
                {
                  subject:"Nouvel Email depuis Joyvox",
                  title:req.body.subject,
                  message:"<b>Voici le message reçu :</b><br>"+req.body.email_filter+"<br>"+req.body.message+"<br>Envoyé par"+req.body.email+"<br>"+req.body.firstName+"<br>"+req.body.lastName,
                  email:config.emailing.from,
                  to:"contact@joyvox.fr"
                },
                function(e){
                  /* ON ENVOIE LE MAIL A JOYVOX */
                  callback({"status":200, "datas":infos, "response_display":{"title":"Contact", "message":"Nous avons bien reçu votre demande et nous vous recontacterons dans les plus bref délais"}});
                  console.log(e);
                }
              );
              console.log(e);
            }
          );

        }
    });

};
module.exports.update = function(req, res, callback){
    callback({"status":200, "message":"CURRENTLY ON DEV"});
};
module.exports.delete = function(req, res, callback){
    callback({"status":200, "message":"CURRENTLY ON DEV"});
};
