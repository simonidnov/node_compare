var fs = require("fs");
module.exports = {
    'secrets': {
        "global":{
            secret:fs.readFileSync('./ssh/id_rsa_idkids.pub')
        }
    },
    'database': {
        'users':'mongodb://localhost/auth_users'
    }
};