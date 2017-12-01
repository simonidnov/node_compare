var express = require('express'),
    router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if (typeof localStorage === "undefined" || localStorage === null) {
        var LocalStorage = require('node-localstorage').LocalStorage;
        localStorage = new LocalStorage('./idkids');
    }
    var set_user = localStorage.getItem('idkids_user_infos');
    localStorage.setItem('idkids_user_infos', '');
    res.render('account', { 
        title: 'User Account', 
        idkids_user: set_user,
        js:[
            '/public/javascripts/account.js'
        ], css:[
            '/public/stylesheets/account.css'
        ]
    });
});

module.exports = router;
