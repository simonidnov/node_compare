var express = require('express'),
    Mime = require('mime'),
    path = require('path'),
    crypto = require('crypto'),
    product = express.Router(),
    Products_controller = require('../controllers/products_controller'),
    Auth_helper = require('../helpers/auth_helper'),
    language_helper = require('../helpers/languages_helper'),
    uri_helper = require('../helpers/uri_helper'),
    lang = require('../public/languages/auth_lang'),
    multer  = require('multer'),
    storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, './uploads/')
      },
      filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
           cb(null, raw.toString('hex') + Date.now() + '.' + Mime.getExtension(file.mimetype));
        });
      }
    }),
    upload = multer({ storage:storage, dest: "./uploads/", inMemory: true, includeEmptyFields: true});

product.use(function(req, res, next){
    //ACCEPT CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");

    var dataCheck = req.query;
    if(req.method === "PUT" || req.method === "POST" || req.method === "DELETE"){
        dataCheck = req.body;
    }
    next();
});
/* GET home page. */
product
    .get('/', function(req, res, next) {
        //res.status(200).send({title:"API"});
        Products_controller.get(req, res, function(e){
            res.status(e.status).send(e.datas);
        });
    })
    .post('/', function(req, res, next) {
        Auth_helper.validate_admin(req, function(e){
            if(e.status === 200){
                Products_controller.create(req, res, function(e){
                    res.status(e.status).send(e.datas);
                });
            }else{
                res.redirect(301, '/auth?message="Vous n\'avez pas de droits administrateur sur la plateforme IDKIDS account"');
            }
        });
    })
    .put('/', function(req, res, next){
        Auth_helper.validate_admin(req, function(e){
            if(e.status === 200){
                Products_controller.update(req, res, function(e){
                    res.status(e.status).send(e.datas);
                });
            }else{
                res.redirect(301, '/auth?message="Vous n\'avez pas de droits administrateur sur la plateforme IDKIDS account"');
            }
        });
    })
    .delete('/', function(req, res, next) {
        Auth_helper.validate_admin(req, function(e){
            if(e.status === 200){
                Products_controller.deleting(req, res, function(e){
                    res.status(e.status).send(e.datas);
                });
            }else{
                res.redirect(301, '/auth?message="Vous n\'avez pas de droits administrateur sur la plateforme IDKIDS account"');
            }
        });
    })
    .get('/medias/:filename', function(req, res, next){
      Auth_helper.has_media_right(req, function(e){
          if(e.status === 200){

            res.sendFile(req.params.filename, {root: path.join(__dirname, '../uploads')}, function(err){
                if (err) {
                  //res.status(403).send({"message":"Vous n'avez pas les droits nécéssaires pour uploader des fichiers", err:err});
                  //next(err);
                } else {
                  //res.status(200).send({"message":"le fichier est autorisé à la lecture", filename:req.params.filename});
                }
            });

            /* TODO CHECK ORDERS USER KEY THEN AUTHORIZE OR NOT DIRECTLY ON HAS MEDIA RIGHT ?
            Products_controller.getFile(req, res, function(e){
              if(e.status === 200){
                res.status(e.status).send(e);
              }else{
                res.status(e.status).send(e);
              }
            });
            */
          }else{
            res.status(e.status).send(e);
          }
        });
    })
    .post('/medias', upload.single('file'), function(req, res, next){
        Auth_helper.validate_admin(req, function(e){
          if(e.status === 200){
            Products_controller.addFile(req, req.file, function(e){
              res.status(e.status).send(e.datas);
            });
            //res.status(200).send({"message":"En cours de developpement", "req":req.body, "files":req.file});
          }else{
            res.status(403).send({"message":"Vous n'avez pas les droits nécéssaires pour uploader des fichiers"});
          }
        });
    })
    .delete('/medias', function(req, res, next){
        console.log('put medias ', req.body);
        Auth_helper.validate_admin(req, function(e){
          if(e.status === 200){
            Products_controller.removeFile(req, res, function(e){
              res.status(e.status).send(e.datas);
            });
            //res.status(200).send({"message":"En cours de developpement", "req":req.body, "files":req.file});
          }else{
            res.status(403).send({"message":"Vous n'avez pas les droits nécéssaires pour uploader des fichiers"});
          }
        });
    });

module.exports = product;
