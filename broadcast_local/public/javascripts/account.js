"use strict";
$(function(){
    account.init();
});
var account = {
    user:null,
    init:function(){
        console.log('init account ', idkids_user);
        if(idkids_user !== ""){
            this.save_account();
        }
        this.set_user();
    },
    save_account:function(){
        console.log("save_account ::: ", idkids_user);
        window.localStorage.setItem('idkids_local_user', JSON.stringify(idkids_user));
    },
    set_user:function(){
        this.user = JSON.parse(window.localStorage.getItem('idkids_local_user'));
    }
}