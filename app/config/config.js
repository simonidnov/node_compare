var fs = require("fs");
module.exports = {
    'secrets': {
        "global":{
            secret:"hello"
        }
    },
    'database': {
        'users':'mongodb://localhost/auth_users'
    }
};
//TODO CHECK SSH KEY SIGNING
//fs.readFileSync('/ssh/id_rsa_idkids.pub')