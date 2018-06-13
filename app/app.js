//run $ mongod
//DEBUG=idkids_app:* npm start
//forever start "script": "index.js",
const express = require('express'),
    path = require('path'),
    ga = require('express-ga-middleware'),
    compression = require('compression'),
    config = require('./config/config'),
    favicon = require('serve-favicon'),
    cp = require('childprocess').spawn,
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    index = require('./routes/index'),
    basket = require('./routes/basket'),
    billing = require('./routes/billing'),
    orders = require('./routes/orders'),
    crons = require('./routes/crons'),
    comments = require('./routes/comments'),
    users = require('./routes/users'),
    metas = require('./routes/metas'),
    media = require('./routes/media'),
    gmail = require('./routes/gmail'),
    download = require('./routes/download'),
    admin = require('./routes/admin'),
    products = require('./routes/products'),
    redirect = require('./routes/redirect'),
    validation = require('./routes/validation'),
    api = require('./routes/api'),
    templating = require('./routes/templating'),
    auth = require('./routes/auth'),
    checking_session = require('./routes/checking_session'),
    me = require('./routes/me'),
    coupon_code = require('./routes/coupon_code'),
    address = require('./routes/address'),
    account = require('./routes/account'),
    settings = require("./routes/settings"),
    session = require("express-session"),
    Apps_controller = require('./controllers/apps_controller');
    Settings_model = require('./models/settings_model'),
    router = express.Router(),
    serveIndex = require('serve-index');

app = module.exports = express();

/* DEFINE STATIC GLOBAL APP SPEC HERE ACCESS IN ALL CONTROLLER INSIDE app.locals NEED TO REBOOT SERVER TO REFRESH */
Apps_controller.get(null, {}, function(e){
    app.locals.applications = e.datas;
});
Settings_model.get(null, {}, function(e){
    app.locals.settings = e;
});
app.locals.version = "1.0.5";
app.locals.auth_lang = require('./public/languages/auth_lang');
app.locals.api_lang = require('./public/languages/api_lang');
app.locals.admin_lang = require('./public/languages/admin_lang');
app.locals._ = require("underscore");

/* END DEFINED GLOBAL STATIC APP VARS */


//app.set('port', process.env.PORT || 8080);
app.listen(9000);

app.use(session({
    secret: "secret",
    cookie: {
	      secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 15
    },
    name: "Auth",
    proxy: false,
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(compression());

//REST ANALYTICS MIDDLE WARE
//app.use(analytics.middleware());

// UNCOMMENT TO REST ANALYTICS WITH GOOGLE ANALYTICS
//app.use(express.cookieParser());
app.use(ga(config.analytics.key, {
    safe: true
}));

//TODO CHECH IT store: sessionStore, // connect-mongo session store
/*
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: false,
        maxAge: 1000 * 60 * 60 * 24
    }
}));
*/

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(__dirname + '/public')
app.use("/uploads", express.static(path.join(__dirname, 'uploads')));

app.use('/.well-known', express.static('.well-known'), serveIndex('.well-known'));

app.use("/public", express.static(path.join(__dirname, 'public')));
app.use("/node_modules", express.static(path.join(__dirname, 'node_modules')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
/* TRY REDIRECT HTTPS */

app.use(express.static(path.join(__dirname, 'public')));

router.all('*', function (req, res, next) {
  next(); // pass control to the next handler
});
router.use('/admin', admin);
router.use('/admin/:any', admin);
router.use('/users', users);
router.use('/me', me);
router.use('/account', account);
router.use('/crons', crons);
router.use('/account/:any', account);
router.use('/api', api);
router.use('/metas', metas);
router.use('/media', media);
router.use('/gmail', gmail);
router.use('/download', download);
router.use('/address', address);
router.use('/validation', validation);
router.use('/templating', templating);
router.use('/redirect', redirect);
router.use('/auth', auth);
router.use('/checking_session', checking_session);
router.use('/products', products);
router.use('/settings', settings);
router.use('/basket', basket);
router.use('/billing', billing);
router.use('/orders', orders);
router.use('/comments', comments);
router.use('/coupon_code', coupon_code);
router.use('/coupon_code/:any', coupon_code);
router.use('/', index);

app.use('/', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//module.exports = app;
