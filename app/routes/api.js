var express = require('express'),
    api = express.Router(),
    Apps_controller = require('../controllers/apps_controller'),
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
    //res.setHeader('Content-Type', 'application/json');
    
    var dataCheck = req.query;
    if(req.method === "PUT" || req.method === "POST" || req.method === "DELETE"){
        dataCheck = req.body;
    }
    next();
});
/* GET home page. */
api
    .get('/', function(req, res, next) {
        res.status(200).send({title:"API"});
    })
    .post('/', function(req, res, next) {
        Auth_helper.validate_admin(req, function(e){
            if(e.status === 200){
                next();
            }else{
                //next();
                res.redirect(301, '/auth?message="Vous n\'avez pas de droits administrateur sur la plateforme IDKIDS account"');
            }
        });
        //Apps_controller.create(req, res, function(e){
            res.status(200).send({title:"POST API"});
            //res.redirect(301, '/account/informations'+req.url.replace('/',''));
        //});
    })
    .put('/', function(req, res, next){
        Auth_helper.validate_admin(req, function(e){
            if(e.status === 200){
                next();
            }else{
                //next();
                res.redirect(301, '/auth?message="Vous n\'avez pas de droits administrateur sur la plateforme IDKIDS account"');
            }
        });
        res.status(200).send({title:"PUT API"});
        //Apps_controller.update(req, res, function(e){
        //    res.status(e.status).send(e);
            //res.redirect(301, '/account/informations'+req.url.replace('/',''));
        //});
    })
    .delete('/', function(req, res, next) {
        Auth_helper.validate_admin(req, function(e){
            if(e.status === 200){
                next();
            }else{
                //next();
                res.redirect(301, '/auth?message="Vous n\'avez pas de droits administrateur sur la plateforme IDKIDS account"');
            }
        });
        res.status(200).send({title:"DELETE API"});
        //Apps_controller.delete(req, function(e){
        //    res.status(e.status).send(e);
            //res.redirect(301, '/account/informations'+req.url.replace('/',''));
        //});
    })
    .get('/apps', function(req, res, next) {
        Apps_controller.get(req, res, function(e){
            res.status(e.status).send(e);
            //res.redirect(301, '/account/informations'+req.url.replace('/',''));
        });
    })
    .post('/apps', function(req, res, next) {
        Apps_controller.create(req, res, function(e){
            res.status(e.status).send(e);
            //res.redirect(301, '/account/informations'+req.url.replace('/',''));
        });
    })
    .put('/apps', function(req, res, next) {
        Apps_controller.update(req, res, function(e){
            res.status(e.status).send(e);
            //res.redirect(301, '/account/informations'+req.url.replace('/',''));
        });
    })
    .delete('/apps', function(req, res, next) {
        Apps_controller.delete(req, res, function(e){
            res.status(e.status).send(e);
            //res.redirect(301, '/account/informations'+req.url.replace('/',''));
        });
    });

module.exports = api;