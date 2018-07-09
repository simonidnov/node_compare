var express = require('express'),
    _ = require('underscore'),
    playlist = express.Router(),
    Auth_helper = require('../helpers/auth_helper'),
    language_helper = require('../helpers/languages_helper'),
    uri_helper = require('../helpers/uri_helper'),
    userproducts_controller = require('../controllers/userproducts_controller'),
    products_controller = require('../controllers/products_controller'),
    lang = require('../public/languages/auth_lang');

playlist.use(function(req, res, next){
    //ACCEPT CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    //SET OUTPUT FORMAT
    //res.setHeader('Content-Type', 'application/json');
    Auth_helper.validate_session(req, function(e){
        if(e.status === 200){
            next();
        }else{
            res.redirect(307, '/auth');
        }
    });
});
playlist
    .get(['/', '/:playlist_name'], function(req, res, next) {
      console.log("req.params ==== ", req.query);
      res.render('account/playlist', {
          title: 'Account Playlist',
          user : req.session.Auth,
          locale:language_helper.getlocale(req),
          lang:lang,
          page:'playlist',
          params : req.query,
          js:[
              '/public/javascripts/account/playlist.js',
              "/public/javascripts/contact.min.js",
              "/node_modules/swiper/dist/js/swiper.min.js",
              "/public/javascripts/components/formular.min.js"
          ], css:[
              '/public/stylesheets/account/account.css',
              "/node_modules/swiper/dist/css/swiper.min.css",
              "/public/stylesheets/components/formular.min.css"
          ]
      });
      res.end();
    });

module.exports = playlist;
