var settings = {
  form : null,
  init : function(){
    this.form = new formular("#update_settings", function(e){
        if(e.status === "hitted" && e.action=== "submit"){
            var form_datas = settings.form.get_datas();
            //$.each($("#create_product form").serializeArray(), function(index, serie){
            //    form_datas[serie.name] = serie.value;
            //});
            index.sdk.api.put($("#update_settings form").attr('action'), form_datas, function(e){
                // window.location.reload();
                console.log(e);
            });
        }
    });
    this.form.init();
  }
}
$(document).ready(function(){
  settings.init();
});
