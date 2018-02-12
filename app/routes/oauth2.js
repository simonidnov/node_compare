var express = require('express'),
    oauth2 = express.Router(),
    bodyParser = require('body-parser'),
    oauthserver = require('oauth2-server');

oauth2.use(bodyParser.urlencoded({ extended: true }));
oauth2.use(bodyParser.json());

oauth2.oauth = oauthserver({
  model: {}, // See below for specification
  grants: ['password'],
  debug: true
});
oauth2.all('/oauth/token', app.oauth.grant());

oauth2.get('/', function(req, res, next) {
  res.send('Secret area');
});
oauth2.use(oauth2.oauth.errorHandler());
