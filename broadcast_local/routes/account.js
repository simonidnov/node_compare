var express = require('express'),
    router = express.Router(),
    Auth_controller = require('../controllers/auth_controller'),
    language_helper = require('../helpers/languages_helper'),
    uri_helper = require('../helpers/uri_helper'),
    lang = require('../public/languages/auth_lang');

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log('account session  ', req.session.Auth);
    if(typeof req.session.Auth === "undefined"){
        res.redirect(307, '/auth');
    }
    res.render('account', {
        title: 'User Account',
        user : req.session.Auth,
        locale:language_helper.getlocale(),
        lang:lang, 
        js:[
            '/public/javascripts/account.js',
            '/node_modules/qrcode/build/qrcode.min.js'
        ], css:[
            '/public/stylesheets/account.css',
            '/public/stylesheets/components/formular.css'
        ]
    });
});

module.exports = router;
