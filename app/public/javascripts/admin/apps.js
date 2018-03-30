$(document).ready(function(){applications_page.init();});
var applications_page = {
    create_app_form : null,
    edit_app_form : null,
    init:function(){
        this.create_form();
    },
    create_form : function(){
        this.create_app_form = new formular("#create_app", function(e){
            if(e.status === "hitted" && e.action=== "submit"){
                var form_datas = {};
                $.each($("#create_app form").serializeArray(), function(index, serie){
                    form_datas[serie.name] = serie.value;
                });
                index.sdk.api.post($("#create_app form").attr('action'), form_datas, function(e){
                    window.location.reload();
                });
            }
        });
        this.create_app_form.init();
        this.edit_app_form = new formular("#edit_app", function(e){
            if(e.status === "hitted"){
                switch(e.action){
                    case "submit":
                        var form_datas = applications_page.edit_app_form.get_datas();
                        //{};
                        index.sdk.api.put($("#edit_app form").attr('action'), form_datas, function(e){
                            //console.log(e);
                            window.location.href= "/admin/apps/";
                        });
                        break;
                    case "delete":

                        var form_datas = {};
                        index.sdk.api.deleting($("#edit_app form").attr('action'), {_id:$("#edit_app form").attr('data-id')}, function(e){
                            console.log(e);
                        });
                        break;
                }
            }
        });
        this.edit_app_form.init();
        //console.log("this.edit_app_form ::: ", this.edit_app_form);
        $( ".order_left_panel_list" ).sortable({
            update: function( event, ui ) {
              $.each($('.app_list li'), function(order, app){
                //console.log($(app).attr('data-id'), " index order ", order);
                index.sdk.api.put("/api/apps", {_id:$(app).attr('data-id'), order:order}, function(e){
                    console.log(e);
                    //window.location.href= "/admin/apps/";
                });
              });
            }
        });
        //$( "#sortable" ).disableSelection();
    }
}
