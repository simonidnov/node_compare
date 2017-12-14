function popeye(target, datas, callback){
    this.init = function(){
        var self = this;
        index.sdk.template('popeye', datas, function(e){
            target.append(e);
            $('#popeye .cross_button').off('click').on('click', function(){
                callback({status:'close', value:"cross_button"});
                self.hide();
            });
            $('#popeye [data-optionid]').off('click').on('click', function(){
                callback({status:'option', value:$(this).attr('data-optionid')}); self.hide();
            });
            $('#popeye [data-buttonid]').off('click').on('click', function(){
                callback({status:'button', value:$(this).attr('data-buttonid')}); self.hide();
            });
        });
    }
    this.hide = function(){
        $('#popeye .popeye_content').addClass('closing');
        setTimeout($.proxy(function(){
            $("#popeye").remove();
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