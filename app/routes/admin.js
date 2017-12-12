var express = require('express'),
    _ = require('underscore'),
    admin = express.Router(),
    Auth_model = require('../models/auth_model'),
    Auth_helper = require('../helpers/auth_helper'),
    language_helper = require('../helpers/languages_helper'),
    uri_helper = require('../helpers/uri_helper'),
    lang = require('../public/languages/auth_lang');

admin.use(function(req, res, next){
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    //SET OUTPUT FORMAT
    //res.setHeader('Content-Type', 'application/json');
    // TODO : VALIDATE SESSION USER
    Auth_helper.validate_session(req, function(e){
        if(e.status === 200){
            Auth_helper.validate_admin(req, function(e){
                if(e.status === 200){
                    next();
                }else{
                    //next();
                    res.redirect(301, '/auth?message="Vous n\'avez pas de droits administrateur sur la plateforme IDKIDS account"');
                }
            });
        }else{
            res.redirect(301, '/auth');
        }
    });
    //next();
});
/* GET admin page. */
admin
    .get('/', function(req, res, next) {
        return res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            user : req.session.Auth,
            locale:language_helper.getlocale(),
            lang:lang,
            page:'dashboard',
            js:[
                '/public/javascripts/admin/dashboard.js',
                '/public/javascripts/components/formular.js',
                '/node_modules/qrcode/build/qrcode.min.js'
            ], css:[
                '/public/stylesheets/admin/admin.css',
                '/public/stylesheets/admin/dashboard.css',
                '/public/stylesheets/components/formular.css'
            ]
        });
        //res.redirect(307, '/admin/dashboard');
    })
    .get('/dashboard', function(req, res, next) {
         res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            user : req.session.Auth,
            locale:language_helper.getlocale(),
            lang:lang,
            page:'dashboard',
            js:[
                '/public/javascripts/admin/dashboard.js',
                '/public/javascripts/components/formular.js',
                '/node_modules/qrcode/build/qrcode.min.js'
            ], css:[
                '/public/stylesheets/admin/admin.css',
                '/public/stylesheets/admin/dashboard.css',
                '/public/stylesheets/components/formular.css'
            ]
        });
    })
    .get('/apps', function(req, res, next) {
        var Apps_controller = require('../controllers/apps_controller');
        var applications = null;
        Apps_controller.get(req, res, function(e){
            applications = e.datas;
            res.render('admin/apps', {
                title: 'Admin Dashboard',
                user : req.session.Auth,
                locale:language_helper.getlocale(),
                lang:lang,
                page:'apps',
                applications:applications,
                js:[
                    '/public/javascripts/admin/apps.js',
                    '/node_modules/cropperjs/dist/cropper.min.js',
                    '/public/javascripts/components/formular.js',
                    '/node_modules/qrcode/build/qrcode.min.js'
                ], css:[
                    '/public/stylesheets/admin/admin.css',
                    '/node_modules/cropperjs/dist/cropper.min.css',
                    '/public/stylesheets/admin/apps.css',
                    '/public/stylesheets/components/formular.css'
                ]
            });
        });
        return;
    })
    .get('/apps/:page', function(req, res, next) {
        var Apps_controller = require('../controllers/apps_controller');
        var applications = null;
        Apps_controller.get(req, res, function(e){
            applications = e.datas;
            res.render('admin/apps', {
                title: 'Admin Dashboard',
                user : req.session.Auth,
                locale:language_helper.getlocale(),
                lang:lang,
                page:req.params.page,
                applications:applications,
                js:[
                    '/public/javascripts/admin/apps.js',
                    '/node_modules/cropperjs/dist/cropper.min.js',
                    '/public/javascripts/components/formular.js',
                    '/node_modules/qrcode/build/qrcode.min.js'
                ], css:[
                    '/public/stylesheets/admin/admin.css',
                    '/node_modules/cropperjs/dist/cropper.min.css',
                    '/public/stylesheets/admin/apps.css',
                    '/public/stylesheets/components/formular.css'
                ]
            });
        });
        return;
    })
    .get('/apps/:page/:_id', function(req, res, next) {
        var Apps_controller = require('../controllers/apps_controller');
        var applications = null;
        var edit_application = null;
        Apps_controller.get(req, res, function(e){
            applications = e.datas;
            //application = _.where(applications, {_id:"5a2eb38289fda770c4af9312"})[0];
            edit_application = _.where(JSON.parse(JSON.stringify(applications)), {_id:req.params._id})[0];
            res.render('admin/apps', {
                title: 'Admin Dashboard',
                user : req.session.Auth,
                locale:language_helper.getlocale(),
                lang:lang,
                page:req.params.page,
                applications:applications,
                app_id:req.params._id,
                edit_application:edit_application,
                _:_,
                js:[
                    '/public/javascripts/admin/apps.js',
                    '/node_modules/cropperjs/dist/cropper.min.js',
                    '/public/javascripts/components/formular.js',
                    '/node_modules/qrcode/build/qrcode.min.js'
                ], css:[
                    '/public/stylesheets/admin/admin.css',
                    '/node_modules/cropperjs/dist/cropper.min.css',
                    '/public/stylesheets/admin/apps.css',
                    '/public/stylesheets/components/formular.css'
                ]
            });
        });
        return;
    })
    .get('/users', function(req, res, next) {
         var Auth_controller = require('../controllers/auth_controller');
         Auth_controller.get(req, res, function(e){
            console.log(e); 
            res.render('admin/users', {
                title: 'Admin Users',
                user : req.session.Auth,
                locale:language_helper.getlocale(),
                lang:lang,
                page:'users',
                users:e.users,
                js:[
                    '/public/javascripts/admin/users.js',
                    '/public/javascripts/components/formular.js',
                    '/node_modules/qrcode/build/qrcode.min.js'
                ], css:[
                    '/public/stylesheets/admin/admin.css',
                    '/public/stylesheets/ui.css',
                    '/public/stylesheets/admin/users.css',
                    '/public/stylesheets/components/formular.css'
                ]
            });
         });
         
    })
    .get('/notifications', function(req, res, next) {
         res.render('admin/notifications', {
            title: 'Admin Notifications',
            user : req.session.Auth,
            locale:language_helper.getlocale(),
            lang:lang,
            page:'notifications',
            js:[
                '/public/javascripts/admin/notifications.js',
                '/public/javascripts/components/formular.js',
                '/node_modules/qrcode/build/qrcode.min.js'
            ], css:[
                '/public/stylesheets/admin/admin.css',
                '/public/stylesheets/admin/notifications.css',
                '/public/stylesheets/components/formular.css'
            ]
        });
    })
    .get('/settings', function(req, res, next) {
         res.render('admin/settings', {
            title: 'Admin Settings',
            user : req.session.Auth,
            locale:language_helper.getlocale(),
            lang:lang,
            page:'settings',
            js:[
                '/public/javascripts/admin/notifications.js',
                '/public/javascripts/components/formular.js',
                '/node_modules/qrcode/build/qrcode.min.js'
            ], css:[
                '/public/stylesheets/admin/admin.css',
                '/public/stylesheets/admin/notifications.css',
                '/public/stylesheets/components/formular.css'
            ]
        });
    })
    .get('/pages', function(req, res, next) {
         res.render('admin/pages', {
            title: 'Admin Pages',
            user : req.session.Auth,
            locale:language_helper.getlocale(),
            lang:lang,
            page:'pages',
            js:[
                '/public/javascripts/admin/pages.js',
                '/public/javascripts/components/formular.js',
                '/node_modules/qrcode/build/qrcode.min.js'
            ], css:[
                '/public/stylesheets/admin/admin.css',
                '/public/stylesheets/admin/pages.css',
                '/public/stylesheets/components/formular.css'
            ]
        });
    })

module.exports = admin;
