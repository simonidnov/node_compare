"use strict";
$(function(){
    account.init();
});
var account = {
    user : null,
    sdk  : null,
    init : function(){
        $('.hor_nav').animate( { scrollLeft: $('.hor_nav li.selected').position().left + $('.hor_nav').scrollLeft() - 50 }, 500 );
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
        var self = this;
        self.sdk.init(function(status){
            console.log('init status :::::: ', status);
            self.sdk.isLogged(function(status){
                //QRCode.toCanvas(document.getElementById('canvas'), status._id, function (error) {
                //    if (error) console.error(error)
                //    console.log('QRCode success!');
                //});
                self.sdk.api.get('/me', {}, function(e){
                    console.log('/me :::: ', e);
                });
            });
        });
        $('[data-action]').off('click').on('click', function(e){
            e.preventDefault();
            var action = $(this).attr('data-action');
            switch(action){
                case 'page_reload':
                    window.history.pushState({"pageTitle":$(this).attr('title')},"", account.add_params($(this).attr('href')));
                    account.navigate();
                    break;
                default:
                    console.log('default ', action);
                    break;
            }
        });
        this.create_forms();
        window.addEventListener('popstate', this.navigate);
    },
    create_forms : function(){
        this.public_form = new formular("#public_datas", function(e){
            //console.log(e);
        }).init();
        this.public_form = new formular("#add_kid", function(e){
            //console.log(e);
        }).init();
        this.private_form = new formular('#private_datas', function(e){
            //console.log(e);
        }).init();
    },
    navigate : function(){
        var params = this.parse_url(window.location.pathname);
        $('[data-for]').removeClass('selected');
        $('[data-for="'+params.account+'"]').addClass('selected');
        $.each($('[data-for]'), function(index, page){
            $('#'+$(this).attr('data-for')).css('display', 'none');
        });
        $('#'+params.account).css('display', 'block');
        $('.hor_nav').animate( { scrollLeft: $('.hor_nav li.selected').position().left + $('.hor_nav').scrollLeft() - 50 }, 500 );
    },
    parse_url : function(url){
        var uri_params = [],
            uri_array  = url.split('/');
        for(var i=1; i<uri_array.length; i+=2){
            uri_params.push({});
            uri_params[uri_array[i]] = uri_array[i+1];
        }
        return uri_params;
    },
    add_params : function(href){
        return href;
    }
}


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
            params = this.add_params(params);
            console.log('call ', type, request, params, callback);
            jQuery.ajax(request, {
                method: type,
                contentType: 'application/json',
                data: params
            })
            .done(function(e) {
                callback(e);
            })
            .fail(function() {
            })
            .always(function() {
            });
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
        add_params : function(params){
            params.options = this.options;
            params.options.from_origin   = window.location.origin;
            if(this.user){
                console.log("this.user ::: ", this.user);
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
                window.location.href =window.location.pathname;
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
    this.api.options = options;
    this.init = function(callback){
        //var sdkel;
        //if(document.getElementById('idkids-dsk') === null){ return false; }
        /* TODO REQUEST SECRET FROM SERVER URL THEN RETURN INITED OR NOT IDENTIFIED */
        
        /* TODO ON STARTUP GET URL PARAMS THEN SET DEFAULT USER ID NEEDED THEN REDIRECT ONLY IF WEBSITE IS IDENTIFIED SERVER SIDE */
        this.api.reset_user(function(datas){
            console.log('reset user ', datas);
        });
        this.api.get('/me/from', {}, function(e){
            callback(e);
        });
    }
    this.isLogged = function(callback){
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