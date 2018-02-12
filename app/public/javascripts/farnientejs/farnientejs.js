function farnientejs(callback){
  this.callback = callback;
  this.attributs = null;
  this.init = function(){
    $('[data-farniente]').off('click').on('click', function(){
        switch($(this).attr('data-farniente')){
            case 'api':
              console.log('call api');
              break;
            case 'template':
              console.log('get template + params');
              break;
            default:
              console.log('get template');
              break;
        }
    });
  }
  this.update = function(){
    console.log('destroy ferniente');
  }
  this.destroy = function(){
    console.log('destroy ferniente');
  }
}
