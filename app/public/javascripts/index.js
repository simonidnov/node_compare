"use strict";
$(function(){
    index.init();
});
var index = {
    user : null,
    sdk  : null,
    init : function(){
        this.set_hornav();
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
            this.sdk.isLogged($.proxy(function(e){
                this.sdk.api.get('/me', {}, function(e){
                  //$('.icon-account_1').replaceWith('<div class="avatar sm"><img src="'+e.datas.avatar+'" alt="avatar"/></div>');
                  $('.account_infos .avatar img').attr('src', e.datas.avatar);
                  $('.account_infos .infos .label').html(e.datas.pseudo);
                  $('.account_infos .infos .email').html(e.datas.email);
                });
                /*
                this.sdk.api.get('/me/members', {}, function(e){
                    console.log('/me/members :::: ', e);
                });
                this.sdk.api.get('/me/address', {}, function(e){
                    console.log('/me/address :::: ', e);
                });
                this.sdk.api.get('/me/services', {}, function(e){
                    console.log('/me/services :::: ', e);
                });
                this.sdk.api.get('/me/basket', {}, function(e){
                    console.log('/me/basket :::: ', e);
                });
                this.sdk.api.get('/me/orders', {}, function(e){
                    console.log('/me/orders :::: ', e);
                });
                this.sdk.api.get('/me/notifications', {}, function(e){
                    console.log('/me/notifications :::: ', e);
                });
                */
            }, this));
        }, this));
        /*$('.short_cuts li').off('touchstart').on('touchstart', function(){
            $(this).focus();
        });*/
        $('[data-navigate]').off('click').on('click', function(e){
            e.preventDefault();
            var action = $(this).attr('data-navigate');
            switch(action){
                case 'page_reload':
                    window.history.pushState({"pageTitle":$(this).attr('title')},"", self.add_params($(this).attr('href')));
                    self.navigate();
                    break;
                default:
                    console.log('default ', action);
                    break;
            }
        });
        if ('ontouchstart' in document.documentElement) {
            $('[data-navigate]').off('click, touchstart').on('click, touchstart', function(e){
                e.preventDefault();
                var action = $(this).attr('data-navigate');
                switch(action){
                    case 'page_reload':
                        window.history.pushState({"pageTitle":$(this).attr('title')},"", self.add_params($(this).attr('href')));
                        self.navigate();
                        break;
                    default:
                        console.log('default ', action);
                        break;
                }
            });
        }
        window.addEventListener('popstate', this.navigate);
        window.addEventListener("scroll", function(){index.replace_scroll();});


        var a=document.getElementsByTagName("a");
        for(var i=0;i<a.length;i++)
        {
            a[i].onclick=function()
            {
                window.location=this.getAttribute("href");
                return false
            }
        }
    },
    navigate : function(){
        var params = this.parse_url(window.location.pathname),
            keys = Object.keys(params),
            data_for = keys[1];
        if(typeof params[data_for] !== "undefined"){
            data_for = params[data_for];
        }
        $('[data-for]').removeClass('selected');
        $('[data-for="'+data_for+'"]').addClass('selected');
        $.each($('[data-for]'), function(index, page){
            $('#'+$(this).attr('data-for')).css('display', 'none');
        });
        $('#'+data_for).css('display', 'block');
        $('html, body').animate({scrollTop:0}, 500, 'swing', function() {});
        this.set_hornav();
    },
    set_hornav : function(){
        if($('.hor_nav li.selected').length > 0){
            $('.hor_nav').animate( { scrollLeft: $('.hor_nav li.selected').position().left + $('.hor_nav').scrollLeft() - 50 }, 500 );
        }
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
    },
    replace_scroll:function(){
        var st = $( document ).scrollTop();
        if($( document ).scrollTop() > 300){
            $('.header').addClass('sticky');
        }else{
            $('.header').removeClass('sticky');
        }
        $('.scroll_progress').css('width', (($(window).scrollTop()*100)/($('body').height()-$(window).height()))+"%");
    }
}
