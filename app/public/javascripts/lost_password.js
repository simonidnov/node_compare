"use strict";
$(function(){
    lost_password.init();
});
var lost_password = {
  init:function(){
    console.log('init lost password');
    this.form = new formular('#update_password', function(e){
      console.log(e);
    });
    this.form.init();
  }
}
