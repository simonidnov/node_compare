var express = require('express'),
    api = express.Router(),
    Apps_controller = require('../controllers/apps_controller'),
    Pages_controller = require('../controllers/pages_controller'),
    Auth_controller = require('../controllers/auth_controller'),
    Email_controller = require('../controllers/email_controller'),
    Auth_helper = require('../helpers/auth_helper'),
    language_helper = require('../helpers/languages_helper'),
    uri_helper = require('../helpers/uri_helper'),
    lang = require('../public/languages/auth_lang');

api.use(function(req, res, next){
    //ACCEPT CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    //SET OUTPUT FORMAT
    res.setHeader('Content-Type', 'application/json');

    var dataCheck = req.query;
    if(req.method === "PUT" || req.method === "POST" || req.method === "DELETE"){
        dataCheck = req.body;
        /* UNCOMMENT TO ADMIN MODE API FOR ALL */
        /*
        Auth_helper.validate_admin(req, function(e){
            if(e.status === 200){
                next();
            }else{
                res.redirect(307, '/auth?message=NO_ACCESS_RIGHTS_API');
            }
        });
        */
    }
    Auth_helper.validate_user(dataCheck, req.get('host'), function(e){
      if(e.status === 200) {
        next();
      }else {
        res.status(e.status).send(Auth_helper.addParams(e, req));
      }
    });
    //next();
});
/* GET home page. */
api
    .get('/', function(req, res, next) {
        res.status(200).send(Auth_helper.addParams({title:"API"}, req));
    })
    .post('/', function(req, res, next) {
        res.status(200).send(Auth_helper.addParams({title:"POST API"}, req));
    })
    .put('/', function(req, res, next){
        res.status(200).send(Auth_helper.addParams({title:"PUT API"}, req));
    })
    .delete('/', function(req, res, next) {
        res.status(200).send(Auth_helper.addParams({title:"DELETE API"}, req));
    })
    .get('/apps', function(req, res, next) {
        Apps_controller.get(req, {}, function(e){
            res.status(e.status).send(Auth_helper.addParams(e, req));
        });
    })
    .get('/apps/:action', function(req, res, next) {
        switch(action){
          case 'valid_sdk':
            Apps_controller.validate(req, res, function(e){
                res.status(e.status).send(Auth_helper.addParams(e, req));
                //res.redirect(307, '/account/informations'+req.url.replace('/',''));
            });
            break;
          default:
            res.status(200).send({"status":"Hello", "title":"action non définie", "message":"votre requête n'est pas reconnue par l\'api"});
            break;
        }
    })
    .post('/apps', function(req, res, next) {
        Apps_controller.create(req, res, function(e){
            res.status(e.status).send(Auth_helper.addParams(e, req));
            //res.redirect(307, '/account/informations'+req.url.replace('/',''));
        });
    })
    .put('/apps', function(req, res, next) {
        Apps_controller.update(req, res, function(e){
            res.status(e.status).send(Auth_helper.addParams(e, req));
            //res.redirect(307, '/account/informations'+req.url.replace('/',''));
        });
    })
    .delete('/apps', function(req, res, next) {
        Apps_controller.delete(req, res, function(e){
            res.status(e.status).send(Auth_helper.addParams(e, req));
            //res.redirect(307, '/account/informations'+req.url.replace('/',''));
        });
    })
    .get('/pages', function(req, res, next) {
        Pages_controller.get(req, res, function(e){
            res.status(e.status).send(Auth_helper.addParams(e, req));
            //res.redirect(307, '/account/informations'+req.url.replace('/',''));
        });
    })
    .post('/pages', function(req, res, next) {
        Pages_controller.create(req, res, function(e){
            res.status(e.status).send(Auth_helper.addParams(e, req));
            //res.redirect(307, '/account/informations'+req.url.replace('/',''));
        });
    })
    .put('/pages', function(req, res, next) {
        Pages_controller.update(req, res, function(e){
            res.status(e.status).send(Auth_helper.addParams(e, req));
            //res.redirect(307, '/account/informations'+req.url.replace('/',''));
        });
    })
    .delete('/pages', function(req, res, next) {
        Pages_controller.delete(req, res, function(e){
            res.status(e.status).send(Auth_helper.addParams(e, req));
            //res.redirect(307, '/account/informations'+req.url.replace('/',''));
        });
    })
    .post('/request_validation_code', function(req, res, next){
        Auth_controller.request_validation_code(req, res, function(e){
            if(e.status === 200){
                Email_controller.validate_account(req, e, function(e){
                    res.status(e.status).send(Auth_helper.addParams(e, req));
                });
            }else{
                res.status(e.status).send(Auth_helper.addParams(e, req));
            }
        });
    })
    .put('/change_password', function(req, res, next){
        req.email = req.body.decoded.email;
        req.password = req.body.new_password;
        Auth_controller.update_password(req.body, res, function(e){
          res.status(200).send(Auth_helper.addParams(e, req));
        });
        /*
        Auth_helper.validate_admin(req, function(e){
            if(e.status === 200){
                next();
            }else{
                //next();
                res.redirect(307, '/auth?message=NO_ACCESS_RIGHTS_API');
            }
        });
        */
        //res.status(200).send({title:"POST UPDATE PASSWORD IS CURRENTLY ON TODO LIST"});
        /*
        Auth_controller.update_password(req, res, function(e){
            res.status(e.status).send(e);
        });
        */
    })
    .post('/contact', function(req, res, next){
        var Contact_controller = require('../controllers/contact_controller');
        Contact_controller.create(req, res, function(e){
          res.status(e.status).send(e);
        });
    })
    .get('/users/:any', function(req, res, next){
        res.status(200).send({title:"SERVICE CURRENTLY UNAIVALABLE"});
    })
    .post('/users/:any', function(req, res, next){
        res.status(200).send({title:"SERVICE CURRENTLY UNAIVALABLE"});
    })
    .put('/users/:any', function(req, res, next){
        res.status(200).send({title:"SERVICE CURRENTLY UNAIVALABLE"});
    })
    .delete('/users/:any', function(req, res, next){
        Auth_controller.unregister(req, res, function(e){
            res.status(200).send({title:"USER DELETED", datas:e});
        });
    })
    .get('/oauth/:any', function(req, res, next){
        res.status(200).send({title:"SERVICE CURRENTLY UNAIVALABLE"});
    })
    .post('/oauth/:any', function(req, res, next){
        res.status(200).send({title:"SERVICE CURRENTLY UNAIVALABLE"});
    })
    .put('/oauth/:any', function(req, res, next){
        res.status(200).send({title:"SERVICE CURRENTLY UNAIVALABLE"});
    })
    .delete('/oauth/:any', function(req, res, next){
        res.status(200).send({title:"SERVICE CURRENTLY UNAIVALABLE"});
    })
    .get('/send-sms', function(req, res, next){
        //textbelt key : 57652f35ce6bd73e072a37701775ee0e3dec4194VPqWleqqdvVMWkw0VLpUasUvu
        var request = require('request');
        request.post('https://textbelt.com/text', {
          form: {
            phone: '+33768651457',
            message: 'Hello world',
            key: '57652f35ce6bd73e072a37701775ee0e3dec4194VPqWleqqdvVMWkw0VLpUasUvu',
          },
        }, function(err, httpResponse, body) {
          if (err) {
            return;
          }
        });
    });

module.exports = api;
