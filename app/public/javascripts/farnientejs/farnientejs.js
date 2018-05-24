function farnientejs(_callback, _api){
  this.attributs = null;
  this.init = function(){
    $('[data-farniente]').off('click').on('click', function(){
        var datas = {};
        $(this).each(function() {
          $.each(this.attributes, function() {
              if(this.specified && this.name !== "class" && this.name !== "data-farniente") {
                datas[this.name.replace('data-', '')] = this.value;
              }
          });
        });
        switch($(this).attr('data-farniente')){
            case 'get':
              _api["get"](datas.url, datas, _callback);
              break;
            case 'post':
              _api["post"](datas.url, datas, _callback);
              break;
            case 'put':
              _api["put"](datas.url, datas, _callback);
              break;
            case 'delete':
              _api["deleting"](datas.url, datas, _callback);
              break;
            case 'template':
              break;
            default:
              break;
        }
    });
  }
  this.update = function(){
  }
  this.destroy = function(){
  }
}
