"use strict";
$(function(){
    login.init();
});
var login = {
    form : null,
    init:function(){
        this.set_listeners();
        if(response.status === "error" && response.code == 11){
            $('#email').parent().addClass('invalid');
        }else if(response.status === "error" && response.code == 13){
            $('#email').parent().addClass('valid');
            $('#password').parent().addClass('invalid');
        }
    },
    set_listeners : function(){
        this.form = new formular('#auth_form', function(e){
            console.log(e);
            $('.formular.auth').css({
                height:($('.displayblock').height()+140)+"px"
            });
        }).init();
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
        window.addEventListener('popstate', this.navigate);
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