var fs = require("fs");
module.exports = {
    'secrets': {
        "global":{
            secret:"hello"
        }
    },
    'database': {
<<<<<<< HEAD
        'user':'idkids-app-28273'
        'password':'gLEv44TTJrw4z5q4'
	'name':'idkids-app-com'
=======
        'user':'idkids-app-28273',
        'password':'gLEv44TTJrw4z5q4',
        'name':'mongodb://localhost/idkids-app-com'
>>>>>>> 9e22cc3a81b44c672cf69b5ddf726b22b98f9a51
    }
};
//TODO CHECK SSH KEY SIGNING
//fs.readFileSync('/ssh/id_rsa_idkids.pub')
