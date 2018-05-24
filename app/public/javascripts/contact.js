"use strict";
$(function(){
    contact.init();
});
var contact = {
  init:function(){
    //if($('#contact_form').length === 1){
    setTimeout(function(){
      contact.create_contact_form();
    },500);
    //}
  },
  create_contact_form : function(){
    this.form = new formular('#contact_formular', function(e){
      if (e.action !== "submit_form") return false;
      contact.form.checkInputs(true);
      index.sdk.api.post('/api/contact', contact.form.get_datas(), function(e){
        if(e.status === 200){
          $('#success_form').css('display', 'block');
          $('#contact_form').css('display', 'none');
        }
      }, function(e){
      });
    });
    this.form.init();
  }
}
