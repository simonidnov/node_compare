var express = require('express'),
    router = express.Router(),
    language_helper = require('../helpers/languages_helper'),
    uri_helper = require('../helpers/uri_helper'),
    lang = require('../public/languages/auth_lang');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('offline', { title: 'IDKIDS.community WELCOME' });
});
router.get('/:page_name', function(req, res, next) {
    res.render('index', {
        title: 'Welcome',
        user : req.session.Auth,
        locale:language_helper.getlocale(),
        lang:lang, 
        page:req.params.page_name,
        js:[
            
        ], 
        css:[
            
        ]
    });
    
});

module.exports = router;
