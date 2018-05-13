"use strict";
$(function(){
  console.log('inited');
    contact.init();
});
var contact = {
  init:function(){
    console.log('init');
    //if($('#contact_form').length === 1){
    setTimeout(function(){
      contact.create_contact_form();
    },500);
    //}
  },
  create_contact_form : function(){
    this.form = new formular('#contact_form', function(e){
      console.log(e);
    });
    this.form.init();
  }
}
console.log('embed contact');
