var express = require('express'),
    billing = express.Router(),
    Orders_controller = require('../controllers/orders_controller'),
    Auth_helper = require('../helpers/auth_helper'),
    language_helper = require('../helpers/languages_helper'),
    uri_helper = require('../helpers/uri_helper'),
    lang = require('../public/languages/auth_lang');

billing.use(function(req, res, next){
    //ACCEPT CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");

    // res.setHeader("Access-Control-Allow-Origin", "*");
    // res.setHeader("Content-Type: application/json", true);
    // res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    // res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");

    //res.setHeader('Content-type', 'application/pdf');

    res.setHeader('Content-type', 'text/html');

    //res.setHeader('Content-Type', 'application/json');
    Auth_helper.validate_admin(req, function(e){
      if(e.status === 200){
        req.body.isAdmin = true;
        req.query.isAdmin = true;
      }else {
        req.body.isAdmin = false;
        req.query.isAdmin = false;
      }
    });
    var dataCheck = req.query;
    if(req.method === "PUT" || req.method === "POST" || req.method === "DELETE"){
      dataCheck = req.body;
    }
    //dataCheck.options = dataCheck;
    Auth_helper.validate_session(req, function(e){
      if(e.status === 200) {
        next();
      } else {
        res.status(e.status).send(e.datas);
      }
    });
});
/* GET home page. */
billing
    .get('/', function(req, res, next) {
        res.status(304).send({message:"UNAUTHORISED"});
    })
    .get('/:bill_id', function(req, res, next) {

      Orders_controller.getBill(req.session.Auth._id, {_id:req.params.bill_id}, function(e){
            res.render('bill', {
                title : 'Ma facture '+e.bill_number,
                user  : req.session.Auth,
                locale: language_helper.getlocale(req),
                lang  : lang,
                order : e,
                js:[
                ], css:[
                    '/public/stylesheets/billing.css'
                ]
            }, function(err, html) {
                var fs = require('fs');
                var pdf = require('html-pdf');
                var filename = '/uploads/ma-facture-'+req.params.bill_id+'.pdf';
                //var html = fs.readFileSync(app.locals.settings.host+"/billing/"+req.params.bill_id, 'utf8');
                var options = { format: 'Letter' };

                pdf.create(html, options).toStream(function(err, stream) {
                  if (err) return console.log(err);
                  stream.pipe(fs.createWriteStream('.'+filename));
                  setTimeout(function(){
                    res.status(200).redirect(filename);
                  },100);
                  setTimeout(function(){
                    fs.unlink('.'+filename, function(err, infos){
                      if (err) throw err;
                    });
                  },20000);
                });
            });

            //res.end();
        });
    });

module.exports = billing;
