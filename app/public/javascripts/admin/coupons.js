$(document).ready(function(){coupons.init();});
var coupons = {
    generate_coupons_form : null,
    init:function(){
        this.create_forms();
    },
    create_forms : function(){
        var self = this;
        this.generate_coupons_form = new formular("#create_coupons", function(e){
            if(e.status === "hitted" && e.action=== "submit"){
                var form_datas = coupons.generate_coupons_form.get_datas();
                index.sdk.api.post($("#create_coupons form").attr('action'), form_datas, function(e){
                });
            }
        });
        $('[data-action="delete_offer"]').off('click').on('click', function(e){
          index.sdk.api.deleting("/coupon_code/", {offer:$(this).attr('data-offer')}, function(e){
              // window.location.reload();
              if(e.status === 200){
                window.location.href = "/admin/coupons/";
              }
          });
        });
        this.generate_coupons_form.init();
    }
}
