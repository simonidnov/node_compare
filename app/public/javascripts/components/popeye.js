function popeye(target, datas, callback){
    this.init = function(){
        var self = this;
        index.sdk.template('popeye', datas, function(e){
            var elements = $(e);
            if(datas.type === "toast" && $('#popeye .toast').length > 0){
                $('#popeye .toast').append(elements.find('.toast .popeye_content'));
            }else{
                target.append(e);
            }
            $('#popeye .cross_button').off('click').on('click', function(){
                callback({status:'close', value:"cross_button"});
                self.hide($(this));
            });
            $('#popeye [data-optionid]').off('click').on('click', function(){
                callback({status:'option', value:$(this).attr('data-optionid')});
                self.hide($(this));
            });
            $('#popeye [data-buttonid]').off('click').on('click', function(){
                callback({status:'button', value:$(this).attr('data-buttonid')});
                self.hide($(this));
            });
            if(datas.type === "toast"){
                setTimeout($.proxy(function(){
                   self.hide($('.toast .popeye_content').last().find('.cross_button'));
                }, this),4000);
            }
        });
    }
    this.hide = function(target){
        target.parent().addClass('closing');
        setTimeout($.proxy(function(){
            if($('#popeye .toast').length > 0 && $('#popeye .toast .popeye_content').length > 1){
                target.parent().remove();
            }else{
                $("#popeye").remove();
            }
            $("#popeye.modal").remove();
        }, this),400);
    }
}
/* POPEYE SAMPLE MODAL 
    var pop = new popeye($('body'), 
        {
            type:"modal",
            color:"lightseagreen",
            illus:"My Illus URL",
            title:"My Title",
            message:"My Message",
            buttons:[
                {class:"btn-success", value:1, label: "mon bouton 1"},
                {class:"btn-danger", value:2, label: "mon bouton 2"}
            ],
            options:[
                {label:"option 1", value:0},
                {label:"option 2", value:1},
                {label:"option 3", value:2}
            ]
        },function(e){
            console.log(e);
        }
    ).init();
*/
/* POPEYE SAMPLE TOAST 
    var pop = new popeye($('body'), 
        {
            type:"toast",
            color:"lightseagreen",
            title:"My Title",
            message:"My Message",
            options:[
                {label:"option 1", value:0},
                {label:"option 2", value:1}
            ]
        },function(e){
            console.log(e);
        }
    ).init();
*/