/* ------------ SDK ALONE TEST ----------- */
var idkids_jssdk = function(options, callback){
    this.options = options;
    this.callback = callback;
    this.inited = false;

    this.api = {
        user : null,
        options:null,
        config : {
          url:"https://www.idkids-app.com",
          debug_url:"https://127.0.0.1:3000"
        },
        get : function(request, params, callback) {
            this.call('GET', request, params, callback);
        },
        post : function(request, params, callback) {
            if(this.options.is_debug){
              this.config.url = this.config.debug_url;
            }
            //this.call('POST', request, params, callback);
            this.add_params(params, $.proxy(function(params){
              $.post(this.config.url+request, {
                  Accept: "text/plain; charset=utf-8",
                  method: "POST",
                  xhrFields: {
                     withCredentials: false
                  },
                  contentType: 'application/jsonp; charset=utf-8',
                  dataType: "json",
                  data: params
              })
              .done($.proxy(function(e) {
                  callback(e);
              }, this))
              .fail(function(e) {
                  console.log('fail ', e);
              })
              .always($.proxy(function(e) {
                  this.hide_loader();
                  this.check_response(e);
              },this));
            }, this));
            this.call('POST', request, params, callback);
        },
        put : function(request, params, callback) {
            this.call('PUT', request, params, callback);
        },
        deleting : function(request, params, callback) {
            this.call('DELETE', request, params, callback);
        },
        call : function(method, request, params, callback){
            if(this.options.is_debug){
              this.config.url = this.config.debug_url;
            }
            this.show_loader();
            this.add_params(params, $.proxy(function(new_params){
                params = new_params;
                dataType = 'json';

                if(method === "POST" || method === "PUT" || method === "DELETE"){
                    dataType = 'json';
                    params = JSON.stringify(params);
                }
                jQuery.ajax(this.config.url+request, {
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
                    /* TODO CHECK IF HAS MESSAGE THEN DISPLAY POPIN MESSAGE OR TOAST ? */
                    this.check_response(e);
                },this));
            }, this));
        },
        check_response : function(e){
          if(typeof e.response_display !== "undefined"){
              e.response_display.type ="modal";
              var pop = new popeye(
                  $('body'),
                  e.response_display,
                  function(e){
                  }
              ).init();
          }
        },
        get_user_status : function(){
            this.set_user();
            if(this.user === null){
                return {"status":"not_connected", "infos":"call api.get('me')"};
            }else{
                if(typeof Unity !== "undefined"){
                    Unity.call('{"status":"logged", "user":"'+JSON.stringify(this.user)+'", "token":"'+this.user.token+'", "id":"'+this.user.id+'", "device":"'+this.user.device+'"}');
                }
                return {"status":"logged", "user":this.user, "token":this.user.token, "id":this.user.id, "device":this.user.device};
            }
        },
        get_params : function(){

        },
        show_loader : function(){
            if($('.idkids_jssdk.loader').length === 0){
                $('body').append('<div class="idkids_jssdk loader showed"><div class="centered"><svg version="1.1" id="Calque_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"	 viewBox="0 0 256 256" style="enable-background:new 0 0 256 256;" xml:space="preserve"><style type="text/css">	.st0{fill:none;stroke:#4F555A;stroke-width:28;stroke-miterlimit:10;}	.st1{fill:#C93632;}</style><circle class="st0" cx="128" cy="128" r="53"/><circle class="st1" cx="128" cy="128" r="26"/></svg></div></div>');
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
            //DEFAULT PUSH THIS OPTIONS TRY TO RM CAUSE TO LONG FOR URI REQUEST GET -> this.options;
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
                window.history.pushState({"pageTitle":document.title},document.title, window.location.origin + window.location.pathname);
                callback(jeton);
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
                            device_uid : result
                        }
                    );
                    /* REMOVE FROM RESULT LIGHTER REQUESTS
                    ,
                    platform : navigator.platform,
                    appCodeName : navigator.appCodeName,
                    appName : navigator.appName,
                    appVersion : navigator.appVersion,
                    userAgent : navigator.userAgent,
                    vendor : navigator.vendor
                    */
                    //a hash, representing your device fingerprint
                    //console.log(result, components); // an array of FP components
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
        window.location.href = window.location.origin + window.location.pathname;
    };
    this.api.options = options;
    this.init = function(callback){
        if (typeof(Unity) === 'undefined') {
           Unity = {
            call: function(msg) {
                var iframe = document.createElement('IFRAME');
                iframe.setAttribute('src', 'unity:' + msg);
                document.documentElement.appendChild(iframe);
                document.documentElement.removeChild(iframe);
                },
            };
        }
        this.api.get_device_uid(function(e){console.log('device uid ', e);});
        this.api.reset_user(function(datas){
        });
        this.api.get('/me/from', {secret:{}}, function(e){
            callback(e);
        });
        /* check uri params call action SDK tools */
        var url = new URL(window.location.href),
            action = url.searchParams.get("idkids-sdk-action");
        switch(action){
          case 'logout':
            this.logout();
            break;
          default:
            console.log('IDKIDS SDK TOOLKIT has returned an action not defined in your javascript sdk version. please upgrade the latest version of idkids-js-sdk on your server then try again.');
            break;
        }
        this.reset_listeners();
    };
    this.isLogged = function(callback){
        callback(this.api.get_user_status());
    };
    this.template = function(template_name, params, callback){
        $.get(this.api.config.url+'/templating/'+template_name, params, function(e){callback(e);});
    };
    this.createAuthbutton = function(target, callback){
        if(document.getElementById(target) === null){
            callback({"status":"error", "message":"TARGET_ID_TAG_ELEMENT_NOT_FOUND"});
        }else{
            var _self = this;
            this.template("auth_button", {user:this.api.user, options:this.options}, function(temp){
              document.getElementById(target).innerHTML = temp;
              callback({"status":"success", "message":"AUTH_BUTTON_CREATED"});
            });
        }
    };
    this.createNotificationButton = function(target, callback){
        if(document.getElementById(target) === null){
            callback({"status":"error", "message":"TARGET_ID_TAG_ELEMENT_NOT_FOUND"});
        }else{
            var _self = this;
            this.template("notif_button", {user:this.api.user, options:this.options}, function(temp){
              document.getElementById(target).innerHTML = temp;
              callback({"status":"success", "message":"AUTH_BUTTON_CREATED"});
            });
        }
    };
    this.validInitedApp = function(callback){
        this.api.get(this.api.config.url+'/api/apps/validate',
        {
          secret:this.options.secret
        },
        function(e){
            callback(e);
        });
    }
    this.reset_listeners = function(){
      var self = this;
      $('[data-idkidssdk]').off('click').on('click', function(e){
        switch($(this).attr('data-idkidssdk')){
          case 'add_basket':
            // TODO call api add_basket
            self.api.post('/basket',
              {
                product_id : $(this).attr('data-productid'),
                quantity : $(this).attr('data-quantity')
              },
              function(e){
                console.log('AJOUT AU PANIER AVEC SUCCES ? ', e);
              }
            );
            break;
          default:
            console.log('action not reconized by idkids sdk, please upgrade your sdk version');
            break;
        }
      });
    }
}
