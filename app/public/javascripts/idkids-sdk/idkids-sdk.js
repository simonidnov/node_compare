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
        deleting : function(request, params, callback) {
            this.call('DELETE', request, params, callback);
        },
        call : function(method, request, params, callback){
            this.show_loader();
            this.add_params(params, $.proxy(function(new_params){
                params = new_params;
                dataType = 'json';
                if(method === "POST" || method === "PUT" || method === "DELETE"){
                    dataType = 'json';
                    params = JSON.stringify(params);
                }
                jQuery.ajax(request, {
                    method: method,
                    contentType: 'application/json',
                    dataType: dataType,
                    data: params
                })
                .done($.proxy(function(e) {
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
                    /*if(typeof e.responseJSON !== "undefined"){
                        if(typeof e.responseJSON.message !== "undefined"){
                            e.message = e.responseJSON.message;
                        }
                    }*/
                    if(typeof e.response_display !== "undefined"){
                        e.response_display.type ="modal";
                        var pop = new popeye(
                            $('body'),
                            e.response_display,
                            function(e){
                            }
                        ).init();
                    }
                    /* TODO CHECK IF HAS MESSAGE THEN DISPLAY POPIN MESSAGE OR TOAST ? */
                },this));
            }, this));
        },
        get_user_status : function(){
            this.set_user();
            if(this.user === null){
                return {"status":"not_connected", "infos":"call api.get('me')"};
            }else{
                if(typeof onJS !== "undefined"){
                    onJS("hello world from onJS");
                }
                if(typeof cb !== "undefined"){
                    cb("hello world from cb");
                }
                return {"status":"logged", "user":this.user, "token":this.user.token, "id":this.user.id, "device":this.user.device};
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
        add_params : function(params, callback){
            params.options = this.options;
            params.options.from_origin   = window.location.origin;
            if(this.user){
                params.options.user_token    = this.user.token;
                params.options.user_id       = this.user._id;
                params.options.user_secret   = this.user.secret;
                params.options.user_device   = this.user.current_device;
            }
            this.get_device_uid(function(e){
                if(e.status !== 200){
                    params.need_fingerprint = true;
                }
                delete e.status;
                params.device_infos = e;
                callback(params);
            });
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
        },
        get_device_uid : function(callback){
            //console.log("get_device_uid");
            $('[name="appCodeName"]').val(navigator.appCodeName);
            $('[name="appName"]').val(navigator.appName);
            $('[name="appVersion"]').val(navigator.appVersion);
            $('[name="userAgent"]').val(navigator.userAgent);
            $('[name="vendor"]').val(navigator.vendor);
            if(typeof Fingerprint2 !== "undefined"){
                new Fingerprint2().get(function(result, components){
                    $('[name="device_uid"]').val(result);
                    callback(
                        {
                            status : 200,
                            device_uid : result,
                            platform : navigator.platform,
                            appCodeName : navigator.appCodeName,
                            appName : navigator.appName,
                            appVersion : navigator.appVersion,
                            userAgent : navigator.userAgent,
                            vendor : navigator.vendor
                        }
                    ); //a hash, representing your device fingerprint
                    console.log(result, components); // an array of FP components
                });
            }else{
                callback(
                    {
                        status:404,
                        platform:navigator.platform,
                        appCodeName : navigator.appCodeName,
                        appName : navigator.appName,
                        appVersion : navigator.appVersion,
                        userAgent : navigator.userAgent,
                        vendor : navigator.vendor
                    }
                )
            }
        }
    };
    this.logout = function(){
        this.api.store('idkids_local_user', '');
    }
    this.api.options = options;
    this.init = function(callback){
        alert('Init SDK');
        if(typeof onJS !== "undefined"){
            alert('onJS is defined');
            onJS("hello world from onJS");
        }
        if(typeof cb !== "undefined"){
            alert('cb is defined');
            cb("hello world from cb");
        }
        if (typeof Unity !== 'undefined') {
            alert('Unity is defined');
            $('body').html("<h1>UNITY IS DEFINED</h1>");
            Unity.call("MESSAGE FROM JS !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        }else{
            console.log('UNITY IS NOT DEFINED');
            $('body').html("<h1>UNITY IS NOT DEFINED</h1>");
        }
        //var sdkel;
        //if(document.getElementById('idkids-dsk') === null){ return false; }
        /* TODO REQUEST SECRET FROM SERVER URL THEN RETURN INITED OR NOT IDENTIFIED */
        this.api.get_device_uid(function(e){console.log('device uid ', e);});
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
        console.log('createAuthbutton');
        if(document.getElementById(target) === null){
            callback({"status":"error", "message":"TARGET_ID_TAG_ELEMENT_NOT_FOUND"});
        }else{
            document.getElementById(target).innerHTML = '<div class="idkids-sdk"><a href="'+window.location.origin+'/auth?from='+window.location.origin.replace(new RegExp('/', 'g'), 'R|')+'&redirect='+this.options.callback_url.replace(new RegExp('/', 'g'), '|')+'&secret='+this.options.secret+'" class="auth_button" data-action="login"><div class="avatar"></div><div class="label">CONNEXION</div></a></div>';
        }
    }
    callback({status:"sdk instance created"}, this.options);
}
