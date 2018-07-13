var express = require('express'),
    _ = require('underscore'),
    playlist = express.Router(),
    Auth_helper = require('../helpers/auth_helper'),
    language_helper = require('../helpers/languages_helper'),
    uri_helper = require('../helpers/uri_helper'),
    userproducts_controller = require('../controllers/userproducts_controller'),
    products_controller = require('../controllers/products_controller'),
    lang = require('../public/languages/auth_lang'),
    request = require('request');

playlist.use(function(req, res, next){
    //ACCEPT CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    //SET OUTPUT FORMAT
    //res.setHeader('Content-Type', 'application/json');
    //Auth_helper.validate_session(req, function(e){
    //    if(e.status === 200){
    //        next();
    //    }else{
    //        res.redirect(307, '/auth');
    //    }
    //});
    next();
});
playlist
    .get(['/', '/:product_id'], function(req, res, next) {
      products_controller.get({extra_category:"LIVRECD"}, req, function(e){
        req.products = e.datas;
        next();
      });
    }, function(req, res, next){
      request("https://www.joyvox.fr/api/albums/album", function(err, resp, body) {
        if(typeof body !== "undefined"){
          req.joyvox_albums = JSON.parse(body);
          next();
        }
      });
    }, function(req, res, next) {
      if(typeof req.params.product_id !== "undefined"){
        // GET PRODUCT TO BUILD ORIGINAL PLAYLIST
        products_controller.get({product_id:req.params.product_id}, req, function(e){
          if(e.status === 200 && e.datas.length === 1){
            req.product = e.datas[0];
            next();
          }else{
            req.product = null;
            next();
          }
        });
      }else{
        req.product = null;
        next();
      }
    }, function(req, res, next){
      res.render('audio_player', {
          title: req.params.playlist_name,
          user : req.session.Auth,
          locale:language_helper.getlocale(req),
          lang:lang,
          page:'playlist',
          params : req.query,
          fs: require('fs'),
          product : req.product,
          albums : req.products,
          userproducts : [],
          joyvox_albums: req.joyvox_albums,
          js:[
              "/node_modules/swiper/dist/js/swiper.min.js",
              "/public/javascripts/components/formular.min.js"
          ], css:[
              "/public/stylesheets/components/formular.min.css"
          ]
      });
      //res.end();
    });

module.exports = playlist;
