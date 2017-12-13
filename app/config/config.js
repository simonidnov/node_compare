var fs = require("fs");
module.exports = {
    'secrets': {
        "global":{
            secret:"hello"
        }
    },
    'database': {
        'user':'idkids-app-28273',
        'password':'gLEv44TTJrw4z5q4',
        'name':'mongodb://localhost/idkids-app-com'
    }
};
//TODO CHECK SSH KEY SIGNING
//fs.readFileSync('/ssh/id_rsa_idkids.pub')