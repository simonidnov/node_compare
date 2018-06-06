$(document).ready(function(){
    users.init();
});
var users = {
    fjs : null,
    filter_form : null,
    init:function(){
        this.create_filter_form();
        /*this.fjs=null;
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
        this.fjs.init();*/
        $('[data-farniente]').off('click').on('click', function(){
          alert('Nous n\'avez pas accès à cette fonctionnalité pour éviter de foutre le souk');
        });
        $('[data-navigate]').off('click').on('click', function(){
          window.location.href=$(this).attr('data-navigate');
        });
        $('#refreshUsersFilters').on('click', function(){
          index.sdk.api.get('/api/checkUserFilterTask', {}, function(e){console.log(e);});
        });
    },
    create_filter_form : function(){
        this.filter_form = new formular('#users_filter', function(e){
          console.log(e);
        });
        this.filter_form.init();
    }
}
