"use strict";
$(function(){
    login.init();
});
var login = {
    form : null,
    init:function(){
        if(response.status === "error" && response.code == 11){
            $('#email').parent().addClass('invalid');
        }else if(response.status === "error" && response.code == 13){
            $('#email').parent().addClass('valid');
            $('#password').parent().addClass('invalid');
        }
        this.add_account();
        this.form = new formular('#auth_form', function(e){
            $('.formular.auth').css({
                height:($('.displayblock').height()+140)+"px"
            });
        }).init();
        window.addEventListener('popstate', this.navigate);
        this.set_listeners();
        if(this.parse_url(window.location.pathname.replace('/auth')).length === 0){
            this.sdk.api.get_device_uid(function(e){
                if(e.status === 200){
                    window.location.href="/auth/fingerprint/"+e.device_uid;
                }
            });
        }
        setTimeout(function(){
          login.initFB();
        },1500);
    },
    initFB : function(){
      FB.getLoginStatus(function(response) {
          $('#facebook_login').addClass('enabled').off('click').on('click', function(){
            login.loginFB();
          });
      });
    },
    loginFB : function(){
      FB.login(function(response) {
          FB.api('/me?fields=email,name,friends,likes,avatar', function (response) {
            console.log(response);
              if(typeof response.email !== "undefined"){

                  $('#email').val(response.email);
                  //window.location.href = "/auth/login/?email="+response.email+"&fb_id="+response.id;
                  //$('#fb_id').val(response.id);

              }else{
                alert('impossible de vous connecter car Facebook refuse de fournir vos informations');
              }
          });
      }, {
          scope: 'public_profile,user_friends,email,user_birthday',
          return_scopes: true
      });
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
    set_listeners : function(){
        $('[data-action]').off('click').on('click', function(e){
            e.preventDefault();
            var action = $(this).attr('data-action');
            switch(action){
                case 'page_reload':
                    window.history.pushState({"pageTitle":$(this).attr('title')},"", login.add_params($(this).attr('href')));
                    login.navigate();
                    break;
                default:
                    console.log('default ', action);
                    break;
            }
        });
    },
    add_account : function(){
       this.sdk = new idkids_jssdk(
            {
                "secret":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZWNyZXQiOiI1YTMwZGViZmYzNjViMzBhZmQ3ODY4OWMiLCJpYXQiOjE1MTMxNTgxODV9.8e9JhLtcpzf8hO2CguRuUINBpLWOOClx_-3GfFoVqcM",
                "callback_url":window.location.origin+"/redirect/",
                "authorisation":{
                    "email"         : true,
                    "mobile"        : true,
                    "friends"       : true,
                    "profile"       : true,
                    "members"       : true,
                    "address"       : true,
                    "services"      : true,
                    "wallet"        : true,
                    "basket"        : true,
                    "orders"        : true,
                    "loyalty_card"  : true
                }
            },
            function(response, params){
                //console.log(response, params);
            }
        );
        var self = this;
        this.sdk.init($.proxy(function(status){
            this.sdk.isLogged($.proxy(function(status){
                this.sdk.api.get('/me', {}, $.proxy(function(e){
                    if($('[data-userid="'+e.datas._id+'"]').length == 0){
                        $('.account_list').prepend('<a href="/auth/login/email/'+e.datas.email+'" data-action="page_reload"><li data-userid="'+e.datas._id+'"><div class="avatar" style="background-image:url('+e.datas.avatar+')"></div><div class="option_infos"><div class="label">'+e.datas.pseudo+'</div><div class="email">'+e.datas.email+'</div><div class="status">connected</div></div></li></a>');
                    }
                    this.set_listeners();
                    this.navigate();
                }, this));
            }, this));
        }, this));
    },
    navigate : function(){
        var params = login.parse_url(window.location.pathname);
        if(typeof params.auth !== "undefined"){
            switch(params.auth){
                case 'login':
                    $('#account_selection').addClass('displaynone').removeClass('displayblock');
                    $('#account_forms').removeClass('displaynone').addClass('displayblock');
                    if(typeof params.email !== "undefined"){
                        $('#email').val(params.email);
                    }else{
                        $('#email').val("");
                    }
                    break;
                case 'subscribe':
                    $('#account_selection').addClass('displaynone').removeClass('displayblock');
                    $('#account_forms').removeClass('displaynone').addClass('displayblock');
                    $('#email').val("");
                    break;
                default:
                    $('#account_selection').removeClass('displaynone').addClass('displayblock');
                    $('#account_forms').addClass('displaynone').removeClass('displayblock');
                    break;
            }
        }else{
            $('#account_selection').removeClass('displaynone').addClass('displayblock');
            $('#account_forms').addClass('displaynone').removeClass('displayblock');
        }
        $('.formular.auth').css({
            height:($('.displayblock').height()+140)+"px"
        });
        //setTimeout(function(){
        //    $('.formular.auth').css({'height': ($('.displayblock').height()+140)+"px"});
        //},200);
    },
    add_params : function(href){
        if(typeof uri_params.from !== "undefined"){
            href+="/from/"+uri_params.from;
        }
        if(typeof uri_params.device_uid !== "undefined"){
            href+="/device_uid/"+uri_params.device_uid;
        }
        return href;
    },
    parse_url : function(url){
        var uri_params = [],
            uri_array  = url.split('/');
        for(var i=1; i<uri_array.length; i+=2){
            uri_params.push({});
            uri_params[uri_array[i]] = uri_array[i+1];
        }
        return uri_params;
    }
}
