var pager = function() {
  this.init = function(target, callback){
    this.templates = {};
    this.target = target;
    this.callback = callback;
    this.components = {};
    if(!this.target.hasClass('pager')){
      this.target.addClass('pager');
    }
    this.callback({status:200, "message":"pager inited"});
    this.preload_templates($.proxy(function(){
      this.createEvents();
    },this));
  }
  this.createEvents = function() {
    this.target.find('.content_area').on('mouseenter', $.proxy(function(e){
      $(e.target).addClass('selected');
      $(e.target).append(this.templates.container_topleftmenu_template({}));
      $(e.target).append(this.templates.container_bottomleftmenu_template({}));
      $(e.target).append(this.templates.container_toprightmenu_template({}));
      $(e.target).append(this.templates.container_bottomrightmenu_template({}));
    }, this) );
    this.target.find('.content_area').on('mouseleave', $.proxy(function(e){
      $(e.toElement).removeClass('selected')
        .find('.pager_option').remove();
    }, this));
    $(document).off('resize').on('resize', $.proxy(function(){
      this.resize_area();
    }, this));
    $('.draggable_module').draggable();
    this.resize_area();
    this.tool_form = new formular($('#pager_tab_form'), function(e){console.log(e);});
    this.tool_form.init();
  }
  this.resize_area = function(){
    $('.pager_content_editor').css('width', this.target.width()-360);
  }
  this.preload_templates = function(loaded){
    this.target.load('/public/javascripts/components/pager/pager.tmpl', $.proxy(function(e){
      $.each(this.target.find('script[type="text/template"]'), $.proxy(function(index, template){
        this.templates[""+$(template).attr('id')] = _.template($(template).html());
        loaded();
      },this));
    },this));
  }
}
