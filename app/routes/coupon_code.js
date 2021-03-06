var express = require('express'),
    coupon_code = express.Router(),
    Json2csvParser = require('json2csv').Parser,
    fs = require('fs'),
    Auth_helper = require('../helpers/auth_helper'),
    Coupon_controller = require('../controllers/coupon_controller'),
    auth_helper = require('../helpers/auth_helper'),
    language_helper = require('../helpers/languages_helper'),
    uri_helper = require('../helpers/uri_helper'),
    lang = require('../public/languages/auth_lang');

    coupon_code.use(function(req, res, next){
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
        res.setHeader('Content-Type', 'application/json');
        //SET OUTPUT FORMAT
        next();
    });
coupon_code.get('/', function(req, res, next) {
    Auth_helper.validate_admin(req, function(e){
      if(e.status === 200){
        next();
      }else{
        res.redirect(307, '/auth?message=NO_ACCESS_RIGHTS_COUPONS');
      }
    });
}, function(req, res, next){
    Coupon_controller.get(req, res, function(e){
      res.status(e.status).send(e);
      res.end();
    });
});
coupon_code.get('/update_amount', function(req, res, next) {
    Auth_helper.validate_admin(req, function(e){
      if(e.status === 200){
        next();
      }else{
        res.redirect(307, '/auth?message=NO_ACCESS_RIGHTS_COUPONS');
      }
    });
}, function(req, res, next){
    Coupon_controller.updateAmount(req, res, function(e){
      res.status(e.status).send(e);
      res.end();
    });
});
coupon_code.get('/valid', function(req, res, next) {
    next();
}, function(req, res, next){
    if(typeof req.query.code === "undefined"){
      res.status(400).send({status:400, message:"NEED_CODE"});
    }
    Coupon_controller.get(req, res, function(e){
      res.status(e.status).send(e);
      res.end();
    });
});
coupon_code.get('/download/:offer', function(req, res, next){
  //res.status(200).send({offer:req.params});

  Auth_helper.validate_admin(req, function(e){
    if(e.status === 200){
      next();
    }else{
      res.status(403).send({title:"UNAUTHORIZED", message:"NO_ACCESS_RIGHTS_COUPONS"});
    }
  });

}, function(req, res, next){
  Coupon_controller.getOffersCSV(req, res, function(e){
    //res.status(e.status).send(e);
    //res.download(e.path);

    var fields = ['code', 'offer', 'amount'];
    var json2csvParser = new Json2csvParser({fields:fields});
    var csv = json2csvParser.parse(e.datas);
    //var fields = ['code', 'offer', 'amount'];
    //var csv = Json2csv({ data: e.datas, fields: fields });
    var path='./uploads/file'+Date.now()+'.csv';
    fs.writeFile(path, csv, function(err,data) {
      if (err) {
        res.status(200).send(err);
      }else{
        res.redirect(307, path.replace('./', '/'));
        //res.status(200).send({csv:csv, datas:e.datas});
        //res.end();
      }
    });
  });
});
coupon_code.get('/offers', function(req, res, next) {
    Auth_helper.validate_admin(req, function(e){
      if(e.status === 200){
        next();
      }else{
        res.redirect(307, '/auth?message=NO_ACCESS_RIGHTS_COUPONS');
      }
    });
}, function(req, res, next){
    Coupon_controller.getOffers(req, res, function(e){
      res.status(e.status).send(e);
      res.end();
    });
});

coupon_code.post('/', function(req, res, next) {
    res.status(200).send({message:"OUTCH PADAWAN ! YOU CANNOT CREATE ANY COUPON"});
    res.end();
});
coupon_code.post('/create_offer', function(req, res, next) {
    Auth_helper.validate_admin(req, function(e){
      if(e.status === 200){
        next();
      }else{
        res.redirect(307, '/auth?message=NO_ACCESS_RIGHTS_COUPONS');
      }
    });
}, function(req, res, next){
    Coupon_controller.createOffer(req, res, function(e){
      res.status(e.status).send(e);
      res.end();
    });
});
coupon_code.put('/', function(req, res, next) {
  console.log('PUT COUPON UPDATE !!!!!!!!!!');
    Coupon_controller.update(req, res, function(e){
      res.status(e.status).send(e);
      res.end();
    });
});
coupon_code.put('/update_offer', function(req, res, next) {
  console.log('PUT OFFER UPDATE !!!!!!!!!!');
    Coupon_controller.updateOffer(req, res, function(e){
      res.status(e.status).send(e);
      res.end();
    });
});
coupon_code.delete('/', function(req, res, next) {
    Auth_helper.validate_admin(req, function(e){
      if(e.status === 200){
        next();
      }else{
        res.redirect(307, '/auth?message=NO_ACCESS_RIGHTS_COUPONS');
      }
    });
}, function(req, res, next){
    Coupon_controller.delete(req, res, function(e){
      res.status(e.status).send(e);
      res.end();
    });
});

module.exports = coupon_code;
