"use strict";
$(function(){
    account.init();
});
var account = {
    user : null,
    sdk  : null,
    coupons : [],
    init : function(){
        this.create_forms();
        this.set_listeners();
        //this.init_apple_pay();
    },
    set_listeners : function(){
        $('#request_validation_code').off('click').on('click', function(){
            index.sdk.api.post('/api/request_validation_code', {
                user_id:$(this).attr('data-userid'),
                user_email:$(this).attr('data-useremail')
            }, function(e){
            });
        });
        $('.account_validation .cross_button').off('click').on('click', function(){
            $('#account_validation').remove();
        });
        $('[data-action]').on('click', function(){
            switch($(this).attr('data-action')){
                case "delete" :
                    var send_datas = {};
                        send_datas[$(this).attr('data-type')] = $(this).attr('data-value');
                    index.sdk.api.call(
                        "DELETE",
                        $(this).attr('data-post'),
                        send_datas,
                        function(e){
                            window.location.reload();
                        }
                    );
                    break;
                case "edit" :
                    if($('#'+$(this).attr('data-edittemplate')).length > 0){
                        $('#'+$(this).attr('data-edittemplate')).remove();
                    }
                    $('.editable').removeClass('editable');
                    var target = $(this).parent().parent();
                    index.sdk.template($(this).attr('data-edittemplate'), {member_id:$(this).attr("data-value")}, function(e){
                        target.append(e);
                        account.member_edit_form = new formular('#member_edit_form', function(e){
                            if(typeof e.action !== "undefined"){
                                switch(e.action){
                                    case "cancel":
                                        target.removeClass('editable');
                                        $('#member_edit_form').remove();
                                        break;
                                    case "save":
                                        var data_form = {
                                            member_id : $('#member_edit_form').attr('data-memberid')
                                        };
                                        $.each($("#member_edit_form form").serializeArray(), function(index, serie){
                                            data_form[serie.name] = serie.value;
                                        });
                                        if(typeof $('#member_edit_form #child_avatar').attr('data-path') !== "undefined"){
                                            data_form.avatar = $('#member_edit_form #child_avatar').attr('data-path');
                                        }
                                        index.sdk.api.put("/me/members", data_form, function(e){
                                            if(e.status === 200){
                                              target.removeClass('editable');
                                              $('#member_edit_form').remove();
                                            }
                                        });
                                        break;
                                    default:
                                        break;
                                }
                            }
                        }).init();
                        target.addClass('editable');
                    });
                    break;
            }
        });
        this.init_map();
    },
    init_map : function(){
        var uluru = {lat: 40, lng: 1},
            self  = this;
        var map = new google.maps.Map(document.getElementById('map_preview'), {
          zoom: 1,
          center: uluru
        });
        var geocoder = new google.maps.Geocoder;
        var infowindow = new google.maps.InfoWindow;
        $('#postalCode, #city, #address, #addressCountry').off('blur').on('blur', function(){
            if(typeof self.marker !== "undefined"){
                self.marker.setMap(null);
            }
            if($('#address').val() === "" && $('#city').val() === "" && $('#postalCode').val() === ""){
                return false;
            }
            $.get("https://maps.googleapis.com/maps/api/geocode/json?address="+$('#address').val()+"+"+$('#city').val()+"+"+$('#postalCode').val()+"+"+$('#addressCountry').val()+"&key=AIzaSyB_MlYEDlRnNWYtrn-y63pbjrWecYaocqs", function(data){

                self.marker = new google.maps.Marker({
                  position: data.results[0].geometry.location,
                  map: map
                });
                map.setZoom(16);
                map.setCenter(self.marker.getPosition());
            });
        });
    },
    check_amount : function(){
      index.sdk.api.get('/basket/amount', {
        coupon_code:account.coupons
      }, function(e){
        $('.coupons_infos .message').html('Nouveau montant à régler :');
        $('.coupons_infos .amount').html(((e.new_amount/100).toFixed(2))+' €');
        $('.coupons_infos').addClass('showed');
        var codes = "";
        for(var i=0; i<account.coupons.length; i++){
          codes += account.coupons[i].code+" ";
        }
        $('#coupons_code').val(JSON.stringify(account.coupons));
        if(typeof e.wallet_infos !== "undefined"){
          $('.wallet_infos .message').html('En validant votre panier avec vos '+account.coupons.length+' coupons de réduction, un coupon de réduction '+e.wallet_infos.label+' sera crédité sur votre porte monnaie d\'une valeur de '+(e.dif_amount/100)+"€, vous pourrez l'utiliser plus tard avec votre compte client.<br><br>");
        }
        $('#order_transaction').attr('data-amount', e.new_amount);
        $('.wallet_infos .message').append('En validant, vous utiliserez les coupons suivants :<br><b>'+codes+"</b>");
        $('.wallet_infos').addClass('showed');
      });
    },
    create_forms : function(){
        /* --------------------------- BASKET FORM --------------------------- */
        this.checkout_form = new formular('#checkout_form', function(e){
          if(e.status === "blur"){
            if($('#coupon_code').val().length >=3 ){
              index.sdk.api.get('/coupon_code/valid', {code:$('#coupon_code').val()}, function(e){
                if(e.datas.length >= 1){
                  if($('[data-code="'+e.datas[0].code+'"]').length === 0){
                    $('#coupons_list').append('<li data-code="'+e.datas[0].code+'" data-amount="'+e.datas[0].amount+'"><div class="code">coupon code : '+e.datas[0].code+'</div><div class="amount">'+e.datas[0].label+" : "+(e.datas[0].amount/100)+' €</div></li>');
                  }
                  $('#coupon_code').val('').parent().removeClass('notempty').removeClass('valid');
                  account.coupons.push(e.datas[0]);
                  account.check_amount();
                  $('#coupon_code').parent().find('.input_error').remove();
                }else{
                  $('#coupon_code').parent()
                    .removeClass('valid')
                    .addClass('invalid')
                    .append('<div class="input_error">'+$('#coupon_code').attr('data-errormessage')+'</div>');
                }
              });
            }
          }
          if(e.status==="hitted" && e.action==="submit"){
            var $button = $("#order_transaction"),
                $form = $button.parents('form');
            var opts = $.extend({}, $button.data(), {
                token: function(result) {
                    $form.append($('<input>').attr({ type: 'hidden', name: 'stripeToken', value: result.id })).submit();
                }
            });
            StripeCheckout.open(opts);

            //index.sdk.api.post('/orders/transaction', {basket_id:$('#order_transaction').attr('data-basketid'), coupons:account.coupons}, function(){});
          }
        });
        this.checkout_form.init();
        /* --------------------------- BASKET FORM --------------------------- */

        this.public_form = new formular("#public_datas", function(e){
          if(e.status==="hitted" && e.action==="submit"){
              var public_datas = account.public_form.get_datas();
              index.sdk.api.put("/account/profile/", public_datas, function(e){});
          }
        });
        this.public_form.init();
        this.kid_form = new formular("#add_kid", function(e){
            if(e.status === "hitted" && e.action === "submit"){
                var form_datas = {};
                $.each($("#add_kid form").serializeArray(), function(index, serie){
                    form_datas[serie.name] = serie.value;
                });
                index.sdk.api.post('/me/members', form_datas, function(e){
                    window.location.reload();
                });
            }
        }).init();
        this.security_form = new formular('#security_form', function(e){
            if(e.status === "hitted" && e.action === "submit"){
                index.sdk.api.put("/api/change_password/", {
                    user_id:$('#security_form #user_id').val(),
                    password:$('#security_form #change_password_old').val(),
                    new_password:$('#security_form #change_password_new').val(),
                    retype_new_password:$('#security_form #retype_change_password_new').val()
                }, function(e){
                });
            }
        }).init();
        this.address_form = new formular('#address_form', function(e){
            if(e.status === "validated"){
                var addr = $('#addressLine1').val()+'+'+$('#postalCode').val()+'+'+$('#city').val()+'+'+$('#addressCountry').val()
                //$('#address_preview').attr('src', "https://maps.googleapis.com/maps/api/staticmap?center="+addr+"&key=AIzaSyB_MlYEDlRnNWYtrn-y63pbjrWecYaocqs");
            }
            //"https://maps.googleapis.com/maps/api/staticmap?center="
        }).init();

        this.private_form = new formular('#private_datas', function(e){}).init();

        this.services_form = new formular('#services_form', function(e){
            if(e.status==="hitted" && e.action==="submit"){
                var user_datas = account.services_form.get_datas();
                index.sdk.api.put("/account/profile/", user_datas, function(e){});
            }
        });
        this.services_form.init();
        if($('#member_datas').length > 0){
            this.member_form = new formular("#member_datas", function(e){
                if(typeof e.action !== "undefined"){
                    switch(e.action){
                        case "save":
                            var form_datas = {
                                member_id:$('#member_datas').attr('data-memberid')
                            };
                            $.each($("#member_datas form").serializeArray(), function(index, serie){
                                form_datas[serie.name] = serie.value;
                            });
                            index.sdk.api.put("/me/members", form_datas, function(e){
                                window.location.reload();
                            });
                            break;
                        default:
                            break;
                    }
                }
            }).init();
        }
        $('.delete_device').off('click').on('click', function(){
            var self = $(this);
            index.sdk.api.call("DELETE",'/auth/device',{uid:$(this).attr('data-device_uid')},
                function(e){
                    self.parent().parent().remove();
                }
            );
        });
    },
    init_apple_pay : function(){
      document.getElementById('apple-pay-button').addEventListener('click', function(e) {
        e.preventDefault();
        var paymentRequest = {
          requiredBillingContactFields: ['postalAddress'],
          requiredShippingContactFields: ['phone'],
          countryCode: 'FR',
          currencyCode: 'EUR',
          total: {
            label: 'joyvox.fr',
            amount: '4.99'
          }
        };
        var session = Stripe.applePay.buildSession(paymentRequest,
          function(result, completion) {
          console.log(result.token.card.address_line1); // 12 Main St
          console.log(result.shippingContact.phoneNumber); // 8885551212
          completion(true);
        });
        session.begin();
        return false;
      });
    }
}
