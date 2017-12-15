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
        'name':'mongodb://localhost/idkids-app-com',
        'users':"mongodb://idkids-app-28273:gLEv44TTJrw4z5q4@localhost:27017/idkids-app-com"
    },
    'emailing': {
        'from': 'idnovant.it@gmail.com',
        'host': 'smtp.gmail.com', // hostname
	'secure':true, 
        'secureConnection': true, // use SSL 
        'port': 465, // port for secure SMTP 
        'transportMethod': 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts 
        'auth': {
            'user': 'idnovant.it@gmail.com',
            'pass': 'Idn#2015'
        },
    	'tls': {
    	    'rejectUnauthorized': false
    	}
    }
};
//TODO CHECK SSH KEY SIGNING
//fs.readFileSync('/ssh/id_rsa_idkids.pub')
