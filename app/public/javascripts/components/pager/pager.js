var pager = function() {
  this.init = function(target, callback){
    this.templates = {};
    this.target = target;
    this.callback = callback;
    this.components = {};
    if(!this.target.hasClass('pager')){
      this.target.addClass('pager');
    }
    if(this.target.find('.content_area').length === 0){
      this.target.append('<div class="content_area"></div>');
    }
    this.callback({status:200, "message":"pager inited"});
    this.createEvents();
  }
  this.createEvents = function(){
    this.target.find('.content_area').on('mouseenter', $.proxy(function(e){
      $(e.target).addClass('selected');
      $(e.target).append(this.templates.container_topleftmenu_template({}));
      $(e.target).append(this.templates.container_bottomleftmenu_template({}));
      $(e.target).append(this.templates.container_toprightmenu_template({}));
      $(e.target).append(this.templates.container_bottomrightmenu_template({}));
    }, this) );
    this.target.find('.content_area').on('mouseleave', $.proxy(function(e){
      console.log("$(e.relatedTarget) ::: ", $(e.toElement));
      $(e.toElement).removeClass('selected')
        .find('.pager_option').remove();
    }, this));
    this.preload_templates();
  }
  this.preload_templates = function(){
    if(this.target.find('#pager_content').length === 0){
      this.target.append('<div id="pager_content"></div>');
    }
    $('#pager_content').load('/public/javascripts/components/pager/pager.tmpl', $.proxy(function(e){
      console.log(e);
      $.each($('#pager_content').find('script[type="text/template"]'), $.proxy(function(index, template){
        console.log("temp:::: ", _.template($(template).html()));
        console.log("this.templates :::: ", this);
        this.templates[""+$(template).attr('id')] = _.template($(template).html());
      },this));
    },this));
  }
}
