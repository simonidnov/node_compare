const express = require('express'),
    router = express.Router(),
    language_helper = require('../helpers/languages_helper'),
    Page_controller = require('../controllers/pages_controller'),
    Apps_controller = require('../controllers/apps_controller'),
    uri_helper = require('../helpers/uri_helper'),
    lang = require('../public/languages/auth_lang'),
    apps = Apps_controller.getApps();

router.use(function(req, res, next) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  //res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  //res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");

  next();
});
/* GET home page. */
/*router.get('/', function(req, res, next) {

    res.render('offline', {title: 'IDKIDS.community WELCOME'});
    res.end();
});*/
router.get('google62e1de2dacd60926.html', function(){
  res.render('google62e1de2dacd60926', {});
  res.end();
});

router.get(['/', '/:page_url'], function(req, res, next) {
    if(typeof req.params.page_url === "undefined"){
      req.params.page_url = "apps";
    }
    Page_controller.get(req.params, res, function(e) {
      if(e.datas.length === 1){
        res.render('page_templates/'+e.datas[0].template, {
            title: e.datas[0].label+" - "+app.locals.settings.label,
            user : req.session.Auth,
            locale:language_helper.getlocale(req),
            lang:lang,
            page:e.datas[0].url,
            page_datas:e.datas[0],
            js:[
              "/public/javascripts/contact.min.js",
              "/node_modules/swiper/dist/js/swiper.min.js",
              "/public/javascripts/components/formular.min.js"
            ],
            css:[
              "/node_modules/swiper/dist/css/swiper.min.css",
              "/public/stylesheets/components/formular.min.css"
            ]
        });
        res.end();
      }else{
        res.render('404', {
            title: '404',
            user : req.session.Auth,
            locale:language_helper.getlocale(req),
            lang:lang,
            page:req.params.page_name,
            page_datas:e.datas,
            js:[
              "/public/javascripts/contact.min.js",
              "/node_modules/swiper/dist/js/swiper.min.js",
              "/public/javascripts/components/formular.min.js"
            ],
            css:[
              "/node_modules/swiper/dist/css/swiper.min.css",
              "/public/stylesheets/components/formular.min.css"
            ]
        });
        res.end();
      }
    });
});

module.exports = router;
