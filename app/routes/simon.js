var express = require('express'),
    router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond simon');
});

module.exports = router;
