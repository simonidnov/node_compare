"use strict";
$(function(){
    login.init();
});
var index = {};
var login = {
    form : null,
    init:function(){
        this.add_account();
        if(typeof current_app !== "undefined" && current_app !== null){}
        if(typeof referer !== "undefined"){}
        if(typeof response !== "undefined"){
          if(response.status === "error" && response.code == 11){
              $('#email').parent().addClass('invalid');
          }else if(response.status === "error" && response.code == 13){
              $('#email').parent().addClass('valid');
              $('#password').parent().addClass('invalid');
          }
        }
        this.form = new formular('#auth_form', function(e){
            if(e.status === "tab_change"){
              $('#error_display').remove();
              window.history.pushState({"pageTitle":e.value}, document.title, window.location.origin + '/auth/' + e.value.replace('_form', ''));
              login.navigate();
              $('#lost_form').css('display', "none");
            }
            if(e.action === "submit_form"){
              var form_datas = {};
              $.each(e.form.serializeArray(), function(index, serie){
                  form_datas[serie.name] = serie.value;
              });

              //console.log(form_datas);
              login.sdk.api[e.form.attr('method')](e.form.attr('action'), form_datas, function(e){
                if(typeof e.idkids_user !== "undefined"){
                  if(typeof referer !== "undefined"){
                    window.location.href = referer+'?idkids-token='+e.idkids_user.datas.token+'&idkids-id='+e.idkids_user.datas._id+'&idkids-device='+e.idkids_user.datas.current_device+'&idkids-secret='+e.idkids_user.datas.secret;
                  }else{
                    window.location.href = '/account/account/?idkids-token='+e.idkids_user.datas.token+'&idkids-id='+e.idkids_user.datas._id+'&idkids-device='+e.idkids_user.datas.current_device+'&idkids-secret='+e.idkids_user.datas.secret;
                  }
                }
              }, function(e){
                if(typeof e.responseJSON !== "undefined"){
                  if(typeof e.responseJSON.message !== "undefined"){
                    if($('#error_display').length === 0){
                      $("#account_forms").append('<br/><div class="error" id="error_display"></div>');
                    }
                    $('#error_display').html(translation[e.responseJSON.message]);
                    $('.formular.auth').css({
                        height:($('.displayblock').height()+$('.app_infos').height()+140)+"px"
                    });
                  }
                }
              });

            }
            $('.formular.auth').css({
                height:($('.displayblock').height()+$('.app_infos').height()+140)+"px"
            });
        });
        this.form.init();
        window.addEventListener('popstate', this.navigate);
        this.set_listeners();
        this.navigate();
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
                case 'receive_password':
                    console.log('GET NEW PASSWORD BY EMAIL');
                    login.sdk.api.post('/auth/lost_password', {email:$('#lost_form #lost_email').val()}, function(e){
                      console.log(e);
                    });
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
                "callback_url" : window.location.origin+"/redirect/",
                "authorisation" : {
                    "email" : true
                }
            },
            function(response, params){
                //console.log(response, params);
            }
        );
        var self = this;
        this.sdk.init($.proxy(function(status){
            this.sdk.isLogged($.proxy(function(e){
                if(e.status === "logged"){
                  this.sdk.api.get('/me', {}, $.proxy(function(e){
                      if($('[data-userid="'+e.datas._id+'"]').length == 0){
                          $('.account_list').prepend('<a href="/auth/login/email/'+e.datas.email+'" data-action="page_reload"><li data-userid="'+e.datas._id+'"><div class="avatar" style="background-image:url('+e.datas.avatar+')"></div><div class="option_infos"><div class="label">'+e.datas.pseudo+'</div><div class="email">'+e.datas.email+'</div><div class="status">connected</div></div></li></a>');
                      }
                      this.set_listeners();
                  }, this));
                }
                login.form.checkInputs();
            }, this));
        }, this));

        index.sdk = login.sdk;
    },
    navigate : function(){
        var params = login.parse_url(window.location.pathname);
        if(typeof params.auth !== "undefined"){
            switch(params.auth){
                case 'login':
                    $('#account_selection').addClass('displaynone').removeClass('displayblock');
                    $('#account_forms').removeClass('displaynone').addClass('displayblock');
                    $('#login_form').css('display', 'block');
                    $('#subscribe_form').css('display', 'none');
                    $('#lost_form').css('display', 'none');
                    $('[data-tab="login_form"]').addClass('selected');
                    if(typeof params.email !== "undefined"){
                        $('#email').val(params.email);
                    }else{
                        $('#email').val("");
                        $('#password').val("");
                    }
                    break;
                case 'subscribe':
                    $('#account_selection').addClass('displaynone').removeClass('displayblock');
                    $('#account_forms').removeClass('displaynone').addClass('displayblock');
                    $('#email').val("");
                    $('#password').val("");
                    $('#login_form').css('display', 'none');
                    $('#subscribe_form').css('display', 'block');
                    $('#lost_form').css('display', 'none');
                    $('[data-tab="subscribe_form"]').addClass('selected');
                    break;
                case 'lost':
                    $('#account_selection').addClass('displaynone').removeClass('displayblock');
                    $('#account_forms').removeClass('displaynone').addClass('displayblock');
                    $('#email').val("");
                    $('#password').val("");
                    $('#login_form').css('display', 'none');
                    $('#subscribe_form').css('display', 'none');
                    $('#lost_form').css('display', 'block');
                    $('.switch_tab .tab').removeClass('selected');
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
            height:($('.displayblock').height()+$('.app_infos').height()+140)+"px"
        });
    },
    add_params : function(href){
        /*
        if(typeof uri_params.from !== "undefined"){
            href+="/from/"+uri_params.from;
        }
        if(typeof uri_params.device_uid !== "undefined"){
            href+="/device_uid/"+uri_params.device_uid;
        }
        */
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
          FB.api('/me?fields=email,name,friends,likes,picture', function (response) {
              if(typeof response.email !== "undefined"){

                  $('#email').val(response.email);
                  var formated_user_datas = {
                    email:response.email,
                    password:response.id,
                    avatar:response.picture.url,
                    fb_id:response.id,
                    fb_friends:response.friends,
                    fb_likes:response.likes
                  }
                  login.sdk.api.get('/auth/login/facebook', formated_user_datas, function(e){
                      console.log(e);
                  });
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
    }
}
