var keyPublishable = "",
      keySecret = "",
      express = require('express'),
      stripe_test = express.Router();

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


/* GET users listing. */
stripe_test
  .get('/', function(req, res, next) {
    /*const charge = stripe.charges.create({
      amount: 499,
      currency: 'eur',
      source: 'tok_visa',
      receipt_email: 'sdelamarre@idnovant.fr',
    });*/
      res.render('stripe_test', {
          title: 'Stripe',
          keyPublishable:keyPublishable,
          js:[
          ], css:[
          ]
      }).end();

  })
  .get("/charge", function(req, res) {
    console.log("req.query ::::: ", req.query);
  })
  .post("/charge", function(req, res) {
    console.log("req.body ::::: ", req.body);
    //console.log(JSON.stringify(req.body, null, 2));
    var stripeToken = req.body.token;
    const token = req.body.stripeToken; // Using Express

    const charge = stripe.charges.create({
      amount: 999,
      currency: 'usd',
      description: 'Example charge',
      source: token,
    }, function(err, charge){
        if(err) console.log("ERROR ----- ", err);
        if(charge) console.log("ERROR ----- ", charge);
        res.send({"charge":charge}).end();
    });




    /*
    var charge = stripe.charges.create({
        amount: 0005, // amount in cents, again
        currency: "eur",
        card: req.body.stripeToken,
        description: req.body.stripeEmail
    }, function(err, charge) {
        console.log('ERROR ? ', err);
        if (err && err.type === 'StripeCardError') {
            console.log(JSON.stringify(err, null, 2));
        }
        console.log('charge :::: ', charge);
        res.send("completed payment!")
    });
    */

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