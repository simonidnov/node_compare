$(document).ready(function(){pages.init();});
var pages = {
    init:function(){
        this.create_form();
        this.create_page();
    },
    create_form : function(){
        this.create_page_form = new formular("#create_page", function(e){
            if(e.status === "hitted" && e.action=== "submit"){
                var form_datas = {};
                $.each($("#create_page form").serializeArray(), function(index, serie){
                    form_datas[serie.name] = serie.value;
                });
                index.sdk.api.post($("#create_page form").attr('action'), form_datas, function(e){
                    // window.location.reload();
                });
            }
        });
        this.create_page_form.init();
        this.edit_page_form = new formular("#edit_page", function(e){
            if(e.status === "hitted"){
                switch(e.action){
                    case "submit":
                        var form_datas = pages.edit_page_form.get_datas();
                        //{};
                        index.sdk.api.put($("#edit_page form").attr('action'), form_datas, function(e){
                            //window.location.href= "/admin/apps/";
                        });
                        break;
                    case "delete":
                        var form_datas = {};
                        index.sdk.api.deleting($("#edit_page form").attr('action'), {_id:$("#edit_page form").attr('data-id')}, function(e){
                            console.log(e);
                        });
                        break;
                }
            }
        });
        this.edit_page_form.init();
    },
    create_page : function(){
      if(typeof pager === "undefined"){
        return false;
      }
      this.pager = new pager();
      this.pager.init($('#pager_interface'), function(e){
        console.log(e);
      });
    }
}
