"use strict";
$(function(){
    lost_password.init();
});
var lost_password = {
  init:function(){
    this.form = new formular('#update_password', function(e){
      if(e.status === "hitted" && e.action === "submit_form"){
        $.post("/auth/update_password", {
            method: "POST",
            contentType: 'application/json',
            dataType: "json",
            data: lost_password.form.get_datas()
        })
        .done($.proxy(function(e) {
        }, this))
        .fail(function(e) {
        })
        .always($.proxy(function(e) {
            if(typeof e.message !== "undefined"){
              $('#error_display').html('');
              if($('#error_display').length === 0){
                $("#update_password").append('<br/><div class="error" id="error_display"></div>');
              }
              $('#error_display').html(translation[e.message]);
            }
            if(typeof e.status !== "undefined"){
              if(e.status === 200){
                $('#update_password').css('display', 'none');
                $('#update_password_success').css('display', 'block');
                setTimeout(function(){
                  window.location.href = "/auth";
                },2000);
              }
            }
        },this));
      }
    });
    this.form.init();
  }
}
