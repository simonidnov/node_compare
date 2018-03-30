$(document).ready(function(){products_page.init();});
var products_page = {
    create_product_form : null,
    edit_product_form : null,
    init:function(){
        this.create_form();
    },
    create_form : function(){
        this.create_product_form = new formular("#create_product", function(e){
            if(e.status === "hitted" && e.action=== "submit"){
                var form_datas = {};
                $.each($("#create_product form").serializeArray(), function(index, serie){
                    form_datas[serie.name] = serie.value;
                });
                index.sdk.api.post($("#create_product form").attr('action'), form_datas, function(e){
                    // window.location.reload();
                });
            }
        });
        this.create_product_form.init();
        this.edit_product_form = new formular("#edit_product", function(e){
            if(e.status === "hitted"){
                switch(e.action){
                    case "submit":
                        var form_datas = products_page.edit_product_form.get_datas();
                        //{};
                        index.sdk.api.put($("#edit_product form").attr('action'), form_datas, function(e){
                            console.log(e);
                            //window.location.href= "/admin/apps/";
                        });
                        break;
                    case "delete":

                        var form_datas = {};
                        index.sdk.api.deleting($("#edit_product form").attr('action'), {_id:$("#edit_product form").attr('data-id')}, function(e){
                            console.log(e);
                        });
                        break;
                }
            }
        });
        this.edit_product_form.init();
        //$( "#sortable" ).disableSelection();
    }
}