/* ------------ SDK ALONE TEST ----------- */

var idkids_jssdk = function(options, callback){
    this.options = options;
    this.callback = callback;
    this.inited = false;
    this.api = {
        user : null,
        options:null,
        get : function(request, params, callback) {
            this.call('GET', request, params, callback);
        },
        post : function(request, params, callback) {
            this.call('POST', request, params, callback);
        },
        put : function(request, params, callback) {
            this.call('PUT', request, params, callback);
        },
        delete : function(request, params, callback) {
            this.call('DELETE', request, params, callback);
        },
        call : function(type, request, params, callback){
            this.show_loader();
            params = this.add_params(params);
            dataType = 'json';
            if(type === "POST" || type === "PUT" || type === "DELETE"){
                dataType = 'json';
                params = JSON.stringify(params);
            }
            jQuery.ajax(request, {
                method: type,
                contentType: 'application/json',
                dataType: dataType,
                data: params
            })
            .done($.proxy(function(e) {
                console.log("IS DONE :::: ", e);
                if(typeof e.updated_token !== "undefined"){
                    this.user.token = e.updated_token;
                    this.store('idkids_local_user', this.user);
                }
                callback(e);
            }, this))
            .fail(function(e) {
                console.log('fail ', e);
            })
            .always($.proxy(function(e) {
                this.hide_loader();
                /* TODO CHECK IF HAS MESSAGE THEN DISPLAY POPIN MESSAGE OR TOAST ? */
                console.log('always ', e);
            },this));
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
        show_loader : function(){
            if($('.idkids_jssdk.loader').length === 0){
                $('body').append('<div class="idkids_jssdk loader"><div class="centered"><svg version="1.1" id="Calque_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"	 viewBox="0 0 256 256" style="enable-background:new 0 0 256 256;" xml:space="preserve"><style type="text/css">	.st0{fill:none;stroke:#4F555A;stroke-width:28;stroke-miterlimit:10;}	.st1{fill:#C93632;}</style><circle class="st0" cx="128" cy="128" r="53"/><circle class="st1" cx="128" cy="128" r="26"/></svg></div></div>');
            }  
            setTimeout(function(){
                $('.idkids_jssdk.loader').addClass('showed');
            }, 200);
        },
        hide_loader : function(){
            $('.idkids_jssdk.loader').remove();  
        },
        add_params : function(params){
            params.options = this.options;
            params.options.from_origin   = window.location.origin;
            if(this.user){
                params.options.user_token    = this.user.token;
                params.options.user_id       = this.user._id;
                params.options.user_secret   = this.user.secret;
                params.options.user_device   = this.user.current_device;
            }
            return params;
        },
        reset_user : function(callback){
            var url = new URL(window.location.href),
                c = url.searchParams.get("idkids-token");
            if(c !== null){
                var jeton = {
                    "token":url.searchParams.get("idkids-token"),
                    "_id":url.searchParams.get("idkids-id"),
                    "secret":url.searchParams.get("idkids-secret"),
                    "device":url.searchParams.get("idkids-device")
                };
                this.store('idkids_local_user', jeton);
                
                this.set_user();
                callback(jeton);
                //window.location.href =window.location.pathname;
                //window.location.reload(window.location.pathname+'/');
            }
        },
        set_user : function(){
            this.getStore('idkids_local_user');
        },
        store:function(key, datas){
            try {
                window.localStorage.setItem(key, JSON.stringify(datas));
            } catch(e) {
                console.log("error ::: ", e); // error in the above string (in this case, yes)!
            }
        },
        getStore:function(key){
            try {
                this.user = JSON.parse(window.localStorage.getItem(key));
            } catch(e) {
                console.log("error ::: ", e); // error in the above string (in this case, yes)!
            }
        }
    };
    this.logout = function(){
        this.api.store('idkids_local_user', '');
    }
    this.api.options = options;
    this.init = function(callback){
        //var sdkel;
        //if(document.getElementById('idkids-dsk') === null){ return false; }
        /* TODO REQUEST SECRET FROM SERVER URL THEN RETURN INITED OR NOT IDENTIFIED */
        
        /* TODO ON STARTUP GET URL PARAMS THEN SET DEFAULT USER ID NEEDED THEN REDIRECT ONLY IF WEBSITE IS IDENTIFIED SERVER SIDE */
        this.api.reset_user(function(datas){
            //console.log('reset user ', datas);
        });
        this.api.get('/me/from', {}, function(e){
            callback(e);
        });
    }
    this.isLogged = function(callback){
        callback(this.api.get_user_status());
    }
    this.template = function(template_name, params, callback){
        $.get('/templating/'+template_name, params, function(e){callback(e);});
    }
    this.createAuthbutton = function(target, callback){
        if(document.getElementById(target) === null){
            callback({"status":"error", "message":"TARGET_ID_TAG_ELEMENT_NOT_FOUND"});
        }else{
            document.getElementById(target).innerHTML = '<div class="idkids-sdk"><a href="'+window.location.origin+'/auth?from='+window.location.origin.replace(new RegExp('/', 'g'), 'R|')+'&redirect='+this.options.callback_url.replace(new RegExp('/', 'g'), '|')+'&secret='+this.options.secret+'" class="auth_button" data-action="login"><div class="avatar"></div><div class="label">CONNEXION</div></a></div>';
        }
    }
    callback({status:"sdk instance created"}, this.options);
}