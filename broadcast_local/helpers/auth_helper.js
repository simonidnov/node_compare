const db = require('mongoose'),
      config = require('../config/config');



module.exports = {
    validate_from:function(req, host) {
        if(typeof req.options.secret === "undefined" || typeof req.options.from_origin === "undefined"){
            return false;
        }
        if(req.options.secret !== "000-000-000" || req.options.from_origin !== "http://localhost:3000" || req.options.from_origin.indexOf(host) === -1){
            return false;
        }
        return true;
    },
    validate_user:function(req, host) {
        /* check user id */
        if(typeof req.options.user_id === "undefined"){
            return false;
        }
        /* check user device */
        if(typeof req.options.user_secret === "undefined"){
            return false;
        }
        /* check user token */
        if(typeof req.options.user_token === "undefined"){
            return false;
        }
        /* match user token + device */
        db.connect(config.database.users, {useMongoClient: true});
        
        //var Auth_model = require('../models/auth_model');
        //Auth_model.check_user(req);
        
            //db.close();
        return true;
    }
}