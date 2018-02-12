$(document).ready(function(){
    users.init();
});
var users = {
    fjs:null,
    init:function(){
        this.create_filter_form();
        this.fjs=null;
        this.fjs = new farnientejs(
          function(e){
            if(typeof e.datas !== "undefined"){
              if(e.datas.type !== "undefined"){
                switch(e.datas.type){
                  case 'delete':
                    $('[data-memberid="'+e.datas.id+'"]').remove();
                    break;
                  case 'get':
                    break;
                  case 'post':
                    break;
                  case 'put':
                    break;
                }
              }
            }
          },
          index.sdk.api
        );
        this.fjs.init();
    },
    create_filter_form : function(){
        this.filter_form = new formular('#users_filter', function(e){
            console.log("users_filter ",  e);
        }).init();
    }
}
