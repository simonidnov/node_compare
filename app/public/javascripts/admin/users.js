$(document).ready(function(){
    users.init();
});
var users = {
    init:function(){
        this.create_filter_form();
    },
    create_filter_form : function(){
        this.filter_form = new formular('#users_filter', function(e){
            console.log("users_filter ",  e);
        }).init();
    }
}
