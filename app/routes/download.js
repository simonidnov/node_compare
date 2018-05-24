var express = require('express'),
    download = express.Router(),
    fs = require('fs'),
    path = require('path'),
    mime = require('mime'),
    Userproducts_controller = require('../controllers/userproducts_controller'),
    auth_helper = require('../helpers/auth_helper'),
    language_helper = require('../helpers/languages_helper'),
    uri_helper = require('../helpers/uri_helper'),
    lang = require('../public/languages/auth_lang');

    download.use(function(req, res, next){
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
        //res.setHeader('Content-type', 'audio/mp3');
        //SET OUTPUT FORMAT
        /* TODO IS LOGGED */
        var dataCheck = req.query;
        if(req.method === "PUT" || req.method === "POST" || req.method === "DELETE"){
            dataCheck = req.body;
        }
        auth_helper.validate_user(dataCheck, req.get('host'), function(response){
            if(response.status === 200){
                if(typeof response.updated_token !== "undefined"){
                    req.query.updated_token = response.updated_token;
                }
                next();
            }else{
                res.status(response.status).send(response);
                return false;
            }
        });
        //next();
    });
download.get('/', function(req, res, next) {
  //res.setHeader('Content-disposition', 'attachment; filename=ma_chanson_personnalisee.mp3');
  /* TODO GET PRODUCT */
  /* TODO CHECKING USER PRODUCTS */
  Userproducts_controller.get(req, res, function(e){
    if(e.status === 200){
      if(e.datas.length >= 1){
        var file =  __dirname + "/../" +e.datas[0].meta_datas.medias[0][0].path;
        /* TODO UPGRADE LINK like prenom_style_machansonpersonnalisee_joyvox */
        res.download(file, e.datas[0].meta_datas.label+"_"+e.datas[0].meta_datas.extra_category+'_'+e.datas[0].meta_datas.sub_category+'_joyvox.mp3');
      }else{
        res.status(201).send({status:201, message:"NOT_ALLOWED", response_display:{title:"Téléchargement", message:"Vous n'avez pas les droits pour téléchrger ce fichier."}});
      }
    }else{
      res.status(201).send({status:201, message:"NOT_ALLOWED", response_display:{title:"Téléchargement", message:"Vous n'avez pas les droits pour téléchrger ce fichier."}});
    }
  });

});

module.exports = download;
