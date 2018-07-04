"use strict";
$(function(){
    coupon_code.init();
});
var coupon_code = {
  init:function(){
    //if($('#contact_form').length === 1){
    setTimeout(function(){
      coupon_code.create_coupon_form();
    },500);
    //}
  },
  create_coupon_form : function(){
    $('#coupon_code').off('blur, change, keyup').on('blur, change, keyup', function(e){
        if($('#coupon_code').val().length >= 3){
          $('.btn_coupon_code').prop("disabled", false).html('&#10004;');
          coupon_code.checkIt();
        }else{
          $('.btn_coupon_code').prop("disabled", true).removeClass('error').html('&#10004;');
        }
    });
    $('#coupon_code_form').off('submit').on('submit', function(e){
      e.preventDefault();
      e.stopPropagation();
      coupon_code.checkIt();
    });
  },
  checkIt : function(){
    $('.btn_coupon_code').addClass('loading').html('<span class="loader"></span>');
    index.sdk.api.get('/coupon_code/valid', {code:$('#coupon_code').val().toUpperCase()}, function(e){
      $('.coupon_datas').html('');
      if(e.datas.length === 0){
        $('.btn_coupon_code').addClass('error').html('&#10008;');
      }else{
        var has_valid = false;
        $('.coupon_datas').append('<div class="message">Ce code est valid pour télécharger :</div><ul class="coupon_list"></ul>');
        for(var i=0; i<e.datas.length; i++){
          if(e.datas[i].offer === "chansonspersonnalisees"){
            if(!e.datas[i].already_used){
              if($('[data-offer="'+e.datas[i].offer+'"]').length === 0){
                $('.coupon_list').append('<li data-offer="'+e.datas[i].offer+'">'+e.datas[i].label+'<br>'+e.datas[i].description+'<br><a href="http://machanson.joyvox.fr">choisir une chanson personnalisée</a></li>');
              }
            }else{
              $('.coupon_list').append('<li> Coupon déjà utilisé</li>');
            }
          }else{
            if($('[data-offer="'+e.datas[i].offer+'"]').length === 0){
              $('.coupon_list').append('<li class="buyWithCoupon" data-offer="'+e.datas[i].offer+'" data-productid="'+e.datas[i].product_id+'"  data-couponcode="'+e.datas[i].code+'"  data-couponid="'+e.datas[i]._id+'" data-amount="'+e.datas[i].amount+'">'+e.datas[i].label+'<br>'+e.datas[i].description+'<br><a href="/download">télécharger '+e.datas[i].label+'</a></li>');
            }
          }
          $('.btn_coupon_code').removeClass('error').html('&#10004;');
        }
      }
      $('.buyWithCoupon').off('click').on('click', function(){
        alert($(this).attr('data-productid') + $(this).attr('data-couponcode') + $(this).attr('data-couponid') + $(this).attr('data-amount'));
        //coupon_code.buyProductWithCoupon($(this).attr('data-productid'), $(this).attr('data-couponcode'), $(this).attr('data-couponid'), $(this).attr('data-amount'));
      });
    }, function(e){
      console.log(e);
    });
  },
  buyProductWithCoupon : function(product_id, coupon_code, coupon_id, amount){
    /*
    data[product_id]: 5adf1a638a9fb33cdcc5f61f
    data[coupon_code]: 6A2A
    data[coupon_id]: 5addcb1f5c7ef91734125f3d
    data[amount]: 499
    */
    index.sdk.api.post('/orders/buy_product_with_coupon_code',
      {
        product_id:product_id,
        coupon_code:coupon_code,
        coupon_id:coupon_id,
        amount:amount
      }, function(e){

      }
    );
  }
}
