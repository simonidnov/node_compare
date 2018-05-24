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
  })
  .post("/charge", function(req, res) {
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
  });

module.exports = stripe_test;
