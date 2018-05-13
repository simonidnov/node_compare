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
router.get('/', function(req, res, next) {

    res.render('offline', {title: 'IDKIDS.community WELCOME'});
    res.end();
});
router.get('/:page_url', function(req, res, next) {
    Page_controller.get(req.params, res, function(e) {
      if(e.datas.length === 1){
        res.render('page_templates/'+e.datas[0].template, {
            title: 'Welcome',
            user : req.session.Auth,
            locale:language_helper.getlocale(req),
            lang:lang,
            page:req.params.page_name,
            page_datas:e.datas[0],
            js:[
              "/node_modules/swiper/dist/js/swiper.min.js"
            ],
            css:[
              "/node_modules/swiper/dist/css/swiper.min.css"
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
            js:[],
            css:[]
        });
        res.end();
      }
    });
});

module.exports = router;
