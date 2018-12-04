var express = require('express'),
    Mime = require('mime'),
    path = require('path'),
    fs = require('fs'),
    fse = require('fs-extra'),
    mkdirp = require('mkdirp'),
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
        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();

        var dest = './uploads/'+year+'-'+month+'-'+day;
        mkdirp.sync(dest);
        cb(null, dest);
      },
      filename: function (req, file, cb) {
        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();
        crypto.pseudoRandomBytes(16, function (err, raw) {
           cb(null, year+'-'+month+'-'+day +'-'+ raw.toString('hex') + '.' + Mime.getExtension(file.mimetype));
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
        Products_controller.updatePhonetik(req, res, function(e){
            res.status(e.status).send(e.datas);
        });
    })

    .get('/deleteallproducts', function(req, res, next) {
        //res.status(200).send({title:"API"});
        //Products_controller.deleteAllProducts(req, res, function(e){
        //    res.status(e.status).send(e.datas);
        //});
    })
    .get('/download/:product_id', function(req, res, next) {
      Auth_helper.validate_user(req.query, req.get('host'), function(e) {
        if(e.status === 200) {
          next();
        }else {
          res.status(203).send({"message":"You need to connect to download."});
        }
      });
    }, function(req, res, next) {
      // GET PRODUCT INFOS
      Products_controller.get({product_id:req.params.product_id}, {product_id:req.params.product_id}, function(e) {
          if(e.status === 200 && e.datas.length === 1) {
            req.product_datas = e.datas;
            next();
          }else {
            res.status(404).send({"message":"Product not found."});
          }
      });
    }, function(req, res, next) {
      // CHECK USER HAS PRODUCT ENROLEMENT
      UserProducts_controller.allreadyBuy(req.query.options.user_id, req.params.product_id, function(e){
        if(e.status === 200) {
          next();
        }else {
          res.status(404).send({"message":"you don't have rights to download this product."});
        }
      });
    }, function(req, res, next) {
      // si le ZIP existe on continu
      console.log('EST CE QUE LE ZIP EXISTE ?');
      if (fs.existsSync('/uploads/products/'+req.product_datas[0].label+'.zip')) {
          // Do something
          console.log('LE ZIP EXISTE');
          res.status(200).send({status:200, message:"DOWNLOAD will be start in few seconds", zip_file:app.locals.settings.host+'/uploads/products/'+req.product_datas[0].label+'.zip', product_datas:req.product_datas});
      }else {
          console.log('LE ZIP N EXISTE PAS');
          next();
      }
    }, function(req, res, next) {
      // DOWNLOAD
      //CREATE TEMP PRODUCT FOLDER WITH ressources
      var dest = './uploads/products/'+req.product_datas[0].label;
      mkdirp.sync(dest);
      // DUPLICATE AND MOVE ALL MEDIA FILES IN SPECIFIC FOLDER WITH ORIGINAL NAMESPACE
      var itemsProcessed = 0;
      req.error_files_process = [];
      req.product_datas[0].medias.forEach(function(media){
        // GET FS media[0].path
        // DUPLICATE AND MOVE IT TO dest+"/"+media[0].originalname
        fse.copy(media[0].path, dest+"/"+media[0].originalname)
          .then(() => {
            console.log('COPY SUCCESS');
            itemsProcessed++;
            if(itemsProcessed === req.product_datas[0].medias.length - 1 || req.product_datas[0].medias.length === 1) {
              next();
            }
          })
          .catch(err => {
            console.log('COPY ERROR');
            itemsProcessed++;
            error_files_process.push({message:media[0].originalname+" can't be moved !", file:media[0].path, err:err});
          })
      });
    },
    function(req, res, next){
        // ZIP FOLDER zip(dest);
        var zipFolder = require('zip-folder');
        zipFolder(
          './uploads/products/'+req.product_datas[0].label,
          './uploads/products/'+req.product_datas[0].label+'.zip',
          function(err) {
            if(err) {
                console.log('oh no!', err);
                res.status(203).send({status:203, err:err, message:"Impossible de zipper les ressources"});
            } else {
                console.log('ZIP CREATED SUCCESFUL');
                next();
            }
          }
        );
    },
    function(req, res, next){
        // START DOWNLOAD
        res.status(200).send({status:200, message:"DOWNLOAD will be start in few seconds", zip_file:app.locals.settings.host+'/uploads/products/'+req.product_datas[0].label+'.zip', product_datas:req.product_datas});
        // its look great but not that
        // res.download(path.join(__dirname, '../uploads/products/'+req.product_datas[0].label+'.zip'));
        // res.end('../uploads/products/'+req.product_datas[0].label+'.zip');
        //res.sendFile(path.join(__dirname, '../uploads/products/'+req.product_datas[0].label+'.zip'));

        // attahcment look great to so no received has download
        //res.attachment(path.join(__dirname, '/uploads/products/'+req.product_datas[0].label+'.zip'));
        //archive.pipe(res);
        //res.on('close', function() {
        //  console.log('Archive wrote %d bytes', archive.pointer());
        //  return res.status(200).send({status:200, message:"DOWNLOAD will be start in few seconds", zip_file:app.locals.settings.host+'/uploads/products/'+req.product_datas[0].label+'.zip', product_datas:req.product_datas});
        //});

        //download to ...
        //.download('./uploads/products/'+req.product_datas[0].label+'.zip', req.product_datas[0].label+'.zip');
        //.send({status:200, message:"DOWNLOAD will be start in few seconds", zip_file:app.locals.settings.host+'/uploads/products/'+req.product_datas[0].label+'.zip', product_datas:req.product_datas});

        //WTF ***
        /*var http = require('http');
        var file = fs.createWriteStream('./uploads/products/'+req.product_datas[0].label+'.zip');
        var request = http.get(app.locals.settings.host, function(response) {
          console.log('response ', response);
          response.pipe(file);
          res.status(200).send({status:200, message:"DOWNLOAD will be start in few seconds", zip_file:app.locals.settings.host+'/uploads/products/'+req.product_datas[0].label+'.zip', product_datas:req.product_datas});
        });*/
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
    .get('/medias/', function(req, res, next){
      UserProducts_controller.allreadyBuy(req.query.user_id, req.query.product_id, function(e){
        if(e.status === 200) {
          //next(); SEND FILE
          console.log('SEND FILE');
          res.sendFile(req.query.media_path, {root: path.join(__dirname, '../')}, function(err){
            console.log('FILE IS SENDED ', err);
          });
        }else {
          next();
          //res.status(203).send({"message":"you don't have rights to download this product."});
        }
      });
    }, function(req, res, next){
      // return media short cut
      var fs = require('fs'),
          shortcut = 15,
          path = req.query.media_path,
          extension = req.query.media_path.split('.')[1];
      if (fs.existsSync(req.query.media_path.replace('.'+extension, "_shortcut"+shortcut+".mp3"))) {
          // Do something
          console.log('SHORTCUT ALREADY EXIST');
          req.query.media_path = "/"+req.query.media_path.replace('.'+extension, "_shortcut"+shortcut+".mp3");
          console.log('SHORTCUT ALREADY EXIST ', req.query.media_path);
          next();
      }else{
          console.log('CREATE SHORT CUT');
          var ffmpeg = require('fluent-ffmpeg');
          var track = "./"+req.query.media_path;//your path to source file
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
            console.log('ERROR SHORT CUT CREATION');
            res.status("400").send(err);
          })
          .on('progress', function (progress) {
            console.log('PROGRESS SHORT CUT');
          })
          .on('end', function () {
            console.log('SHORT CUT CREATED');
            req.query.media_path = "/"+req.query.media_path.replace('.'+extension, "_shortcut"+shortcut+".mp3");
            /* TODO CREATE CHECKING EVENT FS EXIST ? */
            setTimeout(function(){
              console.log('SHORT CUT CREATED NEXT ', req.query.media_path);
              next();
            }, 500);
          })
          .save("./"+req.query.media_path.replace('.'+extension, "_shortcut"+shortcut+".mp3"));
      }
      //res.status(200).send({"message":"ALREADYBUY GREAT."});
    }, function(req, res, next){
      console.log('SEND FILE ? ', req.query.media_path)
      res.sendFile(req.query.media_path, {root: path.join(__dirname, '../')}, function(err){
          console.log('FILE IS SENDED ? ', err);
      });
    })
    .get('/medias/:filename', function(req, res, next){
        var path = "";
        if(req.params.filename.indexOf('-') !== -1){
          var row_path = req.params.filename.split('-');
          for(var i=0; i<row_path.length-1; i++){
            path += row_path[i];
            if(i === row_path.length-2){
              req.params.fullpath = path;
              next();
            }else{
              path += "-";
            }
          }
        }else{
          req.params.fullpath = path;
          next();
        }

      }, function(req, res, next){
        var fs = require('fs'),
            shortcut = 15,
            path = req.params.fullpath;
        if (fs.existsSync("./uploads/"+path+"/"+req.params.filename.replace('.mp3', "_shortcut"+shortcut+".mp3"))) {
            // Do something
            req.params.filename = path+"/"+req.params.filename.replace('.mp3', "_shortcut"+shortcut+".mp3");
            next();
        }else{

            var ffmpeg = require('fluent-ffmpeg');
            var track = "./uploads/"+path+'/'+req.params.filename;//your path to source file
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
              res.status("400").send(err);
            })
            .on('progress', function (progress) {
            })
            .on('end', function () {
              req.params.filename = path+"/"+req.params.filename.replace('.mp3', "_shortcut"+shortcut+".mp3");
              /* TODO CREATE CHECKING EVENT FS EXIST ? */
              setTimeout(function(){
                next();
              }, 500);
            })
            .save("./uploads/"+path+"/"+req.params.filename.replace('.mp3', "_shortcut"+shortcut+".mp3"));
        }
    }, function(req, res, next){
        res.sendFile(req.params.filename, {root: path.join(__dirname, '../uploads')}, function(err){
            if (err) {
                  //res.status(403).send({"message":"Vous n'avez pas les droits nécéssaires pour uploader des fichiers", err:err});
                  //next(err);
            } else {
                  //res.status(200).send({"message":"le fichier est autorisé à la lecture", filename:req.params.filename});
            }
        });
    })
    .put('/medias', function(req, res, next){
        Auth_helper.validate_admin(req, function(e){
          if(e.status === 200){
            Products_controller.updateFileOrder(req, res, function(e){
              res.status(e.status).send(e.datas);
            });
          }else{
            res.status(403).send({"message":"Vous n'avez pas les droits nécéssaires pour mettre a jour les fichiers"});
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
