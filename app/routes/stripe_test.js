var keyPublishable = "",
      keySecret = "",
      express = require('express'),
      stripe_test = express.Router();
      stripe = require("stripe"),
      Coupon_controller = require('../controllers/coupon_controller');

stripe_test.use(function(req, res, next){
    //ACCEPT CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    //SET OUTPUT FORMAT
    //res.setHeader('Content-Type', 'application/json');
    // TODO : VALIDATE SESSION USER
    if(app.locals.settings.StripeMode){
      keyPublishable = app.locals.settings.StripekeyPublishable;
      keySecret = app.locals.settings.StripekeySecret;
    }else{
      keyPublishable = app.locals.settings.StripekeyPublishableTest;
      keySecret = app.locals.settings.StripekeySecretTest;
    }
    stripe = require("stripe")(keySecret);

    next();
});
//stripe test secret key : sk_test_GTIdxcnyVDrnuJLN3ZfYBnKf
//stripe test publishable key : pk_test_TOES8lsubOvARxEieu1c1kAO

//stripe secret key : sk_live_v9RIngFtIPcIzRRwRpIvQ5Wf
//stripe publishable key : pk_live_zkBcPD9ZS5tUVYtKfvtCEPhT

/* GET users listing. */
stripe_test
  .get('/', function(req, res, next) {
    /*const charge = stripe.charges.create({
      amount: 499,
      currency: 'eur',
      source: 'tok_visa',
      receipt_email: 'sdelamarre@idnovant.fr',
    });*/
    Coupon_controller.get(req, res, function(e){
      res.render('stripe_test', {
          title: 'Stripe',
          keyPublishable:keyPublishable,
          coupon:e,
          js:[
          ], css:[
          ]
      }).end();
    });

  })
  .get("/charge", function(req, res) {
    console.log("req.query ::::: ", req.query);
  })
  .post("/charge", function(req, res) {
    console.log("req.body ::::: ", req.body);
    console.log(JSON.stringify(req.body, null, 2));
    var stripeToken = req.body.token;

    var charge = stripe.charges.create({
        amount: 0005, // amount in cents, again
        currency: "eur",
        card: stripeToken,
        description: req.body.stripeEmail
    }, function(err, charge) {
        console.log('ERROR ? ', err);
        if (err && err.type === 'StripeCardError') {
            console.log(JSON.stringify(err, null, 2));
        }
        console.log('charge :::: ', charge);
        res.send("completed payment!")
    });
    /*
    var amount = 500;
    console.log("STRIPE CHARGE REQ ::: ", req);
    console.log("STRIPE CHARGE RES ::: ", res);
    stripe.customers.create({
       email: req.body.stripeEmail,
       source: req.body.stripeToken
    }, function(customer){
        console.log('customer');
    });
    */
  });

module.exports = stripe_test;
