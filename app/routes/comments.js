var express = require('express'),
    comments = express.Router(),
    Comment_controller = require('../controllers/comments_controller'),
    Auth_helper = require('../helpers/auth_helper'),
    language_helper = require('../helpers/languages_helper'),
    uri_helper = require('../helpers/uri_helper'),
    lang = require('../public/languages/auth_lang');

comments.use(function(req, res, next){
    //ACCEPT CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");

    Auth_helper.validate_admin(req, function(e){
      if(e.status === 200){
        req.body.isAdmin = true;
        req.query.isAdmin = true;
      }else {
        req.body.isAdmin = false;
        req.query.isAdmin = false;
      }
    });
    var dataCheck = req.query;
    if(req.method === "PUT" || req.method === "POST" || req.method === "DELETE"){
        dataCheck = req.body;
        Auth_helper.validate_user(dataCheck, req.get('host'), function(e){
          if(e.status === 200) {
            next();
          }else {
            res.status(e.status).send(e);
          }
        });
    }else{
      next();
    }
});
/* GET home page. */
comments
    .get('/', function(req, res, next) {
        Comment_controller.get(req, res, function(e){
            res.status(e.status).send(Auth_helper.addParams(e.datas, req));
        });
    })
    .get('/stats', function(req, res, next) {
        Comment_controller.getStats(req, res, function(e){
            res.status(e.status).send(Auth_helper.addParams(e.datas, req));
        });
    })
    .post('/', function(req, res, next) {
        Comment_controller.create(req, res, function(e){
            res.status(e.status).send(Auth_helper.addParams(
              {
                status:e.status,
                datas:e.datas,
                response_display:{
                  title:"COMMENTAIRE",
                  message:"Votre commentaire a bien été pris en compte et sera publié prochainement !<br>Merci !"
                }
              },
              req
            ));
        });
    })
    .put('/', function(req, res, next) {
        Comment_controller.update(req, res, function(e){
            res.status(e.status).send(Auth_helper.addParams(e, req));
        });
    })
    .delete('/', function(req, res, next) {
        Comment_controller.delete(req, res, function(e){
            e.response_display = {title:"COMMENTAIRE", message:"Votre commentaire a bien été supprimé !<br>Merci !"};
            res.status(e.status).send(Auth_helper.addParams(e, req));
        });
    });

module.exports = comments;
