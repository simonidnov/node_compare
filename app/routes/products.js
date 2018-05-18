var express = require('express'),
    Mime = require('mime'),
    path = require('path'),
    crypto = require('crypto'),
    product = express.Router(),
    UserProducts_controller = require('../controllers/userproducts_controller'),
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
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    //res.setHeader("Access-Control-Allow-Origin", "*");
    //res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");

    //res.setHeader('Content-Type', 'application/json');

    next();
});
/* GET home page. */
product
    .get('/', function(req, res, next) {
        //res.status(200).send({title:"API"});
        Products_controller.get(req.query, res, function(e){
            res.status(e.status).send(e.datas);
        });
    })
    .get('/update_amount', function(req, res, next){
        //Products_controller.updateAmount(req, res, function(e){
        //    res.status(e.status).send(e.datas);
        //});
    })
    .get('/updatephonetik', function(req, res, next) {
        //res.status(200).send({title:"API"});
        //Products_controller.updatePhonetik(req, res, function(e){
        //    res.status(e.status).send(e.datas);
        //});
    })

    .get('/deleteallproducts', function(req, res, next) {
        //res.status(200).send({title:"API"});
        //Products_controller.deleteAllProducts(req, res, function(e){
        //    res.status(e.status).send(e.datas);
        //});
    })

    .post('/', function(req, res, next) {
        Auth_helper.validate_admin(req, function(e){
            if(e.status === 200){
                Products_controller.create(req.body, res, function(e){
                    res.status(e.status).send(e.datas);
                });
            }else{
                res.redirect(307, '/auth?message=NO_ACCESS_RIGHTS');
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
                res.redirect(307, '/auth?message=NO_ACCESS_RIGHTS');
            }
        });
    })
    .delete('/', function(req, res, next) {
        Auth_helper.validate_admin(req, function(e){
            if(e.status === 200){
                Products_controller.delete(req.body, res, function(e){
                    res.status(e.status).send(e.datas);
                });
            }else{
                res.redirect(307, '/auth?message=NO_ACCESS_RIGHTS');
            }
        });
    })
    .get('/medias/:filename', function(req, res, next){
        /*
        Auth_helper.has_media_right(req, function(e){
          if(e.status === 200){
            next();
            return;
          }
        });
        */
        var fs = require('fs'),
            shortcut = 15;

        //console.log('FILE EXIST ::: ', req.params.filename.replace('.mp3', "_shortcut"+shortcut+".mp3"));
        if (fs.existsSync("./uploads/"+req.params.filename.replace('.mp3', "_shortcut"+shortcut+".mp3"))) {
            // Do something
            req.params.filename = req.params.filename.replace('.mp3', "_shortcut"+shortcut+".mp3");
            next();
        }else{

            var ffmpeg = require('fluent-ffmpeg');
            var track = "./uploads/"+req.params.filename;//your path to source file
            ffmpeg(track)
            .duration(shortcut)
            .toFormat('mp3')
            .audioFilters([
              {
                filter: 'afade',
                options: 't=out:st='+(shortcut-2)+':d=2'
              }
            ])
            .on('error', function (err) {
              console.log('An error occurred: ' + err.message);
              res.status("400").send(err);
            })
            .on('progress', function (progress) {
              // console.log(JSON.stringify(progress));
              console.log('Processing: ' + progress.targetSize + ' KB converted');
            })
            .on('end', function () {
              console.log('Processing finished !');
              req.params.filename = req.params.filename.replace('.mp3', "_shortcut"+shortcut+".mp3");
              /* TODO CREATE CHECKING EVENT FS EXIST ? */
              setTimeout(function(){
                next();
              }, 500);
            })
            .save("./uploads/"+req.params.filename.replace('.mp3', "_shortcut"+shortcut+".mp3"));
        }
    }, function(req, res, next){
        res.sendFile(req.params.filename, {root: path.join(__dirname, '../uploads')}, function(err){
            if (err) {
              console.log('errror ', err);
                  //res.status(403).send({"message":"Vous n'avez pas les droits nécéssaires pour uploader des fichiers", err:err});
                  //next(err);
            } else {
              console.log('success ');
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



          //}else{
          //  res.status(e.status).send(e);
          //}
        //});
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
    })
    .post('/importFromFiles', upload.single('file'), function(req, res, next){
        //icon /public/uploads/379838de348418139f127570be26776a
        //picture /public/uploads/c9c03bcd78c43bd9b6d9852b7c2f0dc3
        //label = get file first_name
        //description = chanson personnalisée pour {first_name}
        //price = 499
        //devise = €
        //keyword = chansons-mp3-joyvox-oxybul-prenom-anniversaire-personnalisee // split('-')
        //category = divertissement
        //sub_catégegory = AUDIO
        //extra_category = CHANSONPERSONNALISEE
        //META = COMPTINE | FEERIQUE | POP enum choice
        //APPID = 5ad9cfbb3bb3b98dc9b4e4d9 === JOYVOX LOCAL ||| 5a81ba8a3818c45d83cca840 === JOYVOX IDKID-SAPP
        //filename === relative origin parsed

        //379838de348418_139f127570be26776a_c9c03bcd78c43bd9b6d9852b7c2f0dc3_{first_name}_DESCRIPTION_499_€_chansons-mp3-joyvox-oxybul-prenom-anniversaire-personnalisee_divertissement_AUDIO_CHANSONPERSONNALISEE_CONTINE_5ad9cfbb3bb3b98dc9b4e4d9_{original_file_name}.mp3

        Auth_helper.validate_admin(req, function(e){
          if(e.status === 200){
            Products_controller.createProductFromFileName(req, req.file, function(e){
              res.status(e.status).send(e.datas);
            });
            //res.status(200).send({"message":"En cours de developpement", "req":req.body, "files":req.file});
          }else{
            res.status(403).send({"message":"Vous n'avez pas les droits nécéssaires pour uploader des fichiers"});
          }
        });
    })
    .get(['/sharing', '/sharing/:share_id', '/sharing/:share_id/:product_id', '/sharing/:share_id/:product_id/:user_email'], function(req, res, next){
        UserProducts_controller.getShare(req, res, function(e){
          res.status(e.status).send(e);
        });
    })
    .post('/share', function(req, res, next){
        Auth_helper.validate_user(req.body, req.get('host'), function(e){
          if(e.status === 200){
            UserProducts_controller.shareProduct(req, res, function(e){
              res.status(e.status).send(e);
            });
            //res.status(200).send({"message":"En cours de developpement", "req":req.body, "files":req.file});
          }else{
            res.status(203).send({"message":"Vous n'avez pas les droits nécéssaires pour partager ce fichier"});
          }
        });
    });

module.exports = product;
