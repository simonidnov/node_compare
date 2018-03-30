//run $ mongod
//DEBUG=broadcast_local:* npm start
//forever start "script": "index.js",
const express = require('express'),
    path = require('path'),
    config = require('./config/config'),
    favicon = require('serve-favicon'),
    cp = require('childprocess').spawn,
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    index = require('./routes/index'),
    users = require('./routes/users'),
    media = require('./routes/media'),
    gmail = require('./routes/gmail'),
    admin = require('./routes/admin'),
    products = require('./routes/products'),
    redirect = require('./routes/redirect'),
    validation = require('./routes/validation'),
    api = require('./routes/api'),
    templating = require('./routes/templating'),
    auth = require('./routes/auth'),
    me = require('./routes/me'),
    address = require('./routes/address'),
    account = require('./routes/account'),
    session = require("express-session"),
    Apps_controller = require('./controllers/apps_controller');

app = module.exports = express();

/* DEFINE STATIC GLOBAL APP SPEC HERE ACCESS IN ALL CONTROLLER INSIDE app.locals NEED TO REBOOT SERVER TO REFRESH */
Apps_controller.get(null, null, function(e){
    app.locals.applications = e.datas;
});
app.locals.auth_lang = require('./public/languages/auth_lang');
app.locals.api_lang = require('./public/languages/api_lang');
app.locals.admin_lang = require('./public/languages/admin_lang');
/* END DEFINED GLOBAL STATIC APP VARS */


//app.set('port', process.env.PORT || 8080);
app.listen(9000);

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));


//REST ANALYTICS MIDDLE WARE
//app.use(analytics.middleware());

// UNCOMMENT TO REST ANALYTICS WITH GOOGLE ANALYTICS
//app.use(express.cookieParser());
//app.use(ga(config.analytics.key, {
//    safe: true
//}));

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: false,
        maxAge: 1000 * 60 * 60 * 24
    }
}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(__dirname + '/public')
app.use("/public", express.static(path.join(__dirname, 'public')));
app.use("/node_modules", express.static(path.join(__dirname, 'node_modules')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', users);
app.use('/admin', admin);
app.use('/admin/:any', admin);
app.use('/me', me);
app.use('/api', api);
app.use('/media', media);
app.use('/gmail', gmail);
app.use('/account', account);
app.use('/address', address);
app.use('/validation', validation);
app.use('/templating', templating);
app.use('/redirect', redirect);
app.use('/auth', auth);
app.use('/products', products);
app.use('/', index);

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
