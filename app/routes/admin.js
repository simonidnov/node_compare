var express = require('express'),
    _ = require('underscore'),
    admin = express.Router(),
    Auth_model = require('../models/auth_model'),
    Auth_helper = require('../helpers/auth_helper'),
    Apps_controller = require('../controllers/apps_controller'),
    Basket_controller = require('../controllers/basket_controller'),
    Orders_controller = require('../controllers/orders_controller'),
    Pages_controller = require('../controllers/pages_controller'),
    Products_controller = require('../controllers/products_controller'),
    language_helper = require('../helpers/languages_helper'),
    uri_helper = require('../helpers/uri_helper'),
    lang = require('../public/languages/auth_lang');

admin.use(function(req, res, next){
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    //SET OUTPUT FORMAT
    //res.setHeader('Content-Type', 'application/json');
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
            locale:language_helper.getlocale(req),
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
            locale:language_helper.getlocale(req),
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
        var applications = [];
        Apps_controller.get(req, {}, function(e){
            applications = e.datas;
            res.status(e.status).render('admin/apps', {
                title: 'Admin Dashboard',
                user : req.session.Auth,
                locale:language_helper.getlocale(req),
                lang:lang,
                page:'apps',
                applications:applications,
                js:[
                    '/public/javascripts/components/jquery-ui/jquery-ui.min.js',
                    '/public/javascripts/admin/apps.js',
                    '/node_modules/cropperjs/dist/cropper.min.js',
                    '/public/javascripts/components/formular.js',
                    '/node_modules/qrcode/build/qrcode.min.js'
                ],
                css:[
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
        var applications = null;
        Apps_controller.get(req, {}, function(e){
            applications = e.datas;
            res.render('admin/apps', {
                title: 'Application',
                user : req.session.Auth,
                locale:language_helper.getlocale(req),
                lang:lang,
                page:req.params.page,
                applications:applications,
                js:[
                    '/public/javascripts/components/jquery-ui/jquery-ui.min.js',
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
        var applications = null;
        var edit_application = null;
        Apps_controller.get(req, {}, function(e){
            applications = e.datas;
            //application = _.where(applications, {_id:"5a2eb38289fda770c4af9312"})[0];
            edit_application = _.where(JSON.parse(JSON.stringify(applications)), {_id:req.params._id})[0];
            res.render('admin/apps', {
                title: 'Admin Dashboard',
                user : req.session.Auth,
                locale:language_helper.getlocale(req),
                lang:lang,
                page:req.params.page,
                applications:applications,
                app_id:req.params._id,
                edit_application:edit_application,
                _:_,
                js:[
                    '/public/javascripts/components/jquery-ui/jquery-ui.min.js',
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
            res.render('admin/users', {
                title: 'Admin Users',
                user : req.session.Auth,
                locale:language_helper.getlocale(req),
                lang:lang,
                page:'users',
                users:e.users,
                js:[
                    '/public/javascripts/admin/users.js',
                    '/public/javascripts/components/formular.js',
                    '/node_modules/qrcode/build/qrcode.min.js',
                    '/public/javascripts/farnientejs/farnientejs.min.js'
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
            locale:language_helper.getlocale(req),
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
            locale:language_helper.getlocale(req),
            lang:lang,
            page:'settings',
            js:[
                '/public/javascripts/admin/settings.js',
                '/public/javascripts/components/formular.js',
                '/node_modules/qrcode/build/qrcode.min.js'
            ], css:[
                '/public/stylesheets/admin/admin.css',
                '/public/stylesheets/admin/settings.css',
                '/public/stylesheets/components/formular.css'
            ]
        });
    })
    .get('/translations', function(req, res, next) {
         res.render('admin/translations', {
            title: 'Admin translations',
            user : req.session.Auth,
            locale:language_helper.getlocale(req),
            lang:lang,
            page:'translations',
            js:[
                '/public/javascripts/admin/translations.js',
                '/public/javascripts/components/formular.js',
                '/node_modules/qrcode/build/qrcode.min.js'
            ], css:[
                '/public/stylesheets/admin/admin.css',
                '/public/stylesheets/admin/translations.css',
                '/public/stylesheets/components/formular.css'
            ]
        });
    })
    .get('/pages', function(req, res, next) {
      Pages_controller.get(req, res, function(e){
        pages = e.datas;
         res.render('admin/pages', {
            title: 'Admin Pages',
            user : req.session.Auth,
            locale:language_helper.getlocale(req),
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
      });
    })
    .get('/pages/:page', function(req, res, next) {
        var applications = null;
        Pages_controller.get(req, res, function(e){
            pages = e.datas;
            res.render('admin/pages', {
                title: 'Admin Pages',
                user : req.session.Auth,
                locale:language_helper.getlocale(req),
                lang:lang,
                page:req.params.page,
                pages:pages,
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
        });
        return;
    })
    .get('/pages/:page/:_id', function(req, res, next) {
      var pages = null;
      var edit_application = null;
      Pages_controller.get(req, res, function(e){
          pages = e.datas;
          //application = _.where(applications, {_id:"5a2eb38289fda770c4af9312"})[0];
          edit_page = _.where(JSON.parse(JSON.stringify(pages)), {_id:req.params._id})[0];
          res.render('admin/pages', {
              title: 'Admin Pages',
              user : req.session.Auth,
              locale:language_helper.getlocale(req),
              lang:lang,
              page:req.params.page,
              pages:pages,
              page_id:req.params._id,
              edit_page:edit_page,
              _:_,
              js:[
                  '/public/javascripts/admin/pages.js',
                  '/public/javascripts/components/pager/pager.js',
                  '/node_modules/cropperjs/dist/cropper.min.js',
                  '/public/javascripts/components/formular.js',
                  '/public/javascripts/components/jquery-ui.min.js',
                  '/node_modules/qrcode/build/qrcode.min.js'
              ], css:[
                  '/public/stylesheets/admin/admin.css',
                  '/node_modules/cropperjs/dist/cropper.min.css',
                  '/public/stylesheets/admin/pages.css',
                  '/public/stylesheets/components/formular.css',
                  '/public/stylesheets/components/pager/pager.css'
              ]
          });
      });
      return;
    })
    .get('/products', function(req, res, next) {
      Products_controller.get(req, res, function(e){
          products = e.datas;
          res.render('admin/products', {
              title: 'Admin Products',
              user : req.session.Auth,
              locale: language_helper.getlocale(req),
              lang: lang,
              page: 'products',
              products: products,
              js:[
                  '/public/javascripts/admin/products.js',
                  '/public/javascripts/components/formular.js',
                  '/node_modules/qrcode/build/qrcode.min.js'
              ], css:[
                  '/public/stylesheets/admin/admin.css',
                  '/public/stylesheets/admin/products.css',
                  '/public/stylesheets/components/formular.css'
              ]
          });
      });
    })
    .get('/products/:page', function(req, res, next) {
      Products_controller.get(req, res, function(e){
        products = e.datas;
         res.render('admin/products', {
            title: 'Admin Products',
            user : req.session.Auth,
            locale:language_helper.getlocale(req),
            lang:lang,
            page:req.params.page,
            products: products,
            js:[
                '/public/javascripts/admin/products.js',
                '/public/javascripts/components/formular.js',
                '/node_modules/qrcode/build/qrcode.min.js'
            ], css:[
                '/public/stylesheets/admin/admin.css',
                '/public/stylesheets/admin/products.css',
                '/public/stylesheets/components/formular.css'
            ]
        });
      });
    })
    .get('/products/:page/:_id', function(req, res, next) {
      Products_controller.get(req, res, function(e){
        products = e.datas;
        req.body = {_id:req.params._id};
        Products_controller.get(req, res, function(e){
           product_datas = e.datas[0];
           res.render('admin/products', {
              title: 'Admin Products',
              user : req.session.Auth,
              locale:language_helper.getlocale(req),
              lang:lang,
              page:req.params.page,
              products: products,
              edit_product : product_datas,
              js:[
                  '/public/javascripts/admin/products.js',
                  '/public/javascripts/components/formular.js',
                  '/node_modules/cropperjs/dist/cropper.min.js',
                  '/node_modules/qrcode/build/qrcode.min.js'
              ], css:[
                  '/public/stylesheets/admin/admin.css',
                  '/public/stylesheets/admin/products.css',
                  '/node_modules/cropperjs/dist/cropper.min.css',
                  '/public/stylesheets/components/formular.css'
              ]
          });
        });
      });
    })
    .get('/orders', function(req, res, next) {
      Orders_controller.get(req, res, function(e){
          orders = e.datas;
          res.render('admin/orders', {
              title: 'Admin Orders',
              user : req.session.Auth,
              locale: language_helper.getlocale(req),
              lang: lang,
              page: 'orders',
              orders: orders,
              js:[
                  '/public/javascripts/admin/orders.js',
                  '/public/javascripts/components/formular.js',
                  '/node_modules/qrcode/build/qrcode.min.js'
              ], css:[
                  '/public/stylesheets/admin/admin.css',
                  '/public/stylesheets/admin/orders.css',
                  '/public/stylesheets/components/formular.css'
              ]
          });
      });
    })
    .get('/baskets', function(req, res, next) {
      Basket_controller.get(req, res, function(e){
          baskets = e.datas;
          res.render('admin/baskets', {
              title: 'Admin Baskets',
              user : req.session.Auth,
              locale: language_helper.getlocale(req),
              lang: lang,
              page: 'baskets',
              baskets: baskets,
              js:[
                  '/public/javascripts/admin/baskets.js',
                  '/public/javascripts/components/formular.js',
                  '/node_modules/qrcode/build/qrcode.min.js'
              ], css:[
                  '/public/stylesheets/admin/admin.css',
                  '/public/stylesheets/admin/baskets.css',
                  '/public/stylesheets/components/formular.css'
              ]
          });
      });
    });

module.exports = admin;
