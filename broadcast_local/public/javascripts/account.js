"use strict";
$(function(){
    account.init();
});
var account = {
    user : null,
    sdk  : null,
    init : function(){
        this.sdk = new idkids_jssdk(
            {
                "secret":"000-000-000",
                "callback_url":"http://localhost:3000/account/",
                "authorisation":{
                    "basket":true,
                    "friends":true,
                    "profile":true,
                    "members":true,
                    "email":true,
                    "mobile":true,
                    "address":true,
                    "badges":true,
                    "newsletter":true,
                    "wallet":true,
                    "loyalty_card":true
                }
            },
            function(response, params){
                console.log(response, params);
            }
        );
        this.sdk.init(function(status){
            console.log('init status ', status);
        });
        this.sdk.getLoginStatus(function(status){
            console.log("getLoginStatus ::: ", status);
            QRCode.toCanvas(document.getElementById('canvas'), status.id, function (error) {
                if (error) console.error(error)
                console.log('success!');
            });
        });
        this.sdk.createAuthbutton("account_infos", function(){
            
        });
    }
}
var idkids_jssdk = function(options, callback){
    this.options = options;
    this.callback = callback;
    this.inited = false;
    this.api = {
        user : null,
        options:null,
        get : function(request, params, callback) {
            this.save_account();
            callback(request, params);
        },
        post : function(request, params, callback) {
            
        },
        put : function(request, params, callback) {
            
        },
        delete : function(request, params, callback) {
            
        },
        get_user_status : function(){
            this.set_user();
            if(this.user === null){
                return {"status":"not_connected", "infos":"call api.get('me')"};
            }else{
                return {"status":"logged", "token":this.user.token, "id":this.user.id, "device":this.user.device};
            }
        },
        get_params : function(){
            
        },
        add_params : function(){
            var datas = this.options;
            datas.from_origin   = window.location.origin;
            datas.user_token    = this.user.token;
            datas.user_id       = this.user._id;
            datas.user_secret   = this.user.secret;
            datas.user_device   = this.user.current_device;
            return datas;
        },
        reset_user : function(callback){
            var url = new URL(window.location.href);
            var c = url.searchParams.get("idkids-token");
            if(c !== null){
                var jeton = {
                    "token":url.searchParams.get("idkids-token"),
                    "id":url.searchParams.get("idkids-id"),
                    "device":url.searchParams.get("idkids-device")
                };
                window.localStorage.setItem('idkids_local_user', JSON.stringify(jeton));
                this.set_user();
                callback(jeton);
            }
        },
        set_user : function(){
            try {
                this.user = JSON.parse(window.localStorage.getItem('idkids_local_user'));
            } catch(e) {
                console.log("error ::: ", e); // error in the above string (in this case, yes)!
            }
        }
    };
    this.api.options = options;
    this.init = function(callback){
        if(document.getElementById('idkids-dsk') === null){ var sdkel = document.createElement('div'); sdkel.id = 'idkids-dsk';}else{return true};
        /* TODO REQUEST SECRET FROM SERVER URL THEN RETURN INITED OR NOT IDENTIFIED */
        
        /* TODO ON STARTUP GET URL PARAMS THEN SET DEFAULT USER ID NEEDED THEN REDIRECT ONLY IF WEBSITE IS IDENTIFIED SERVER SIDE */
        this.api.reset_user(function(datas){
            console.log('reset user ', datas);
        });
        callback({status:"inited"});
        this.inited = true;
    }
    this.getLoginStatus = function(callback){
        callback(this.api.get_user_status());
    }
    this.createAuthbutton = function(target, callback){
        if(document.getElementById(target) === null){
            callback({"status":"error", "message":"TARGET_ID_TAG_ELEMENT_NOT_FOUND"});
        }else{
            document.getElementById(target).innerHTML = '<div class="idkids-sdk"><a href="http://localhost:3000/auth?from='+window.location.origin.replace(new RegExp('/', 'g'), 'R|')+'&redirect='+this.options.callback_url.replace(new RegExp('/', 'g'), '|')+'&secret='+this.options.secret+'" class="auth_button" data-action="login"><div class="avatar"></div><div class="label">CONNEXION</div></a></div>';
        }
    }
    callback({status:"sdk instance created"}, this.options);
}