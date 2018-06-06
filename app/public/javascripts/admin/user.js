$(document).ready(function(){
    user.init();
});
var user = {
    init:function(){
      $('[data-refund]').on('click', function(e){
        index.sdk.api.post('/orders/refund', {order_id:$(this).attr('data-refund')}, function(e){
          console.log(e);
        });
      });
    }
}
