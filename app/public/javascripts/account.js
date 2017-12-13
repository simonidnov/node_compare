"use strict";
$(function(){
    account.init();
});
var account = {
    user : null,
    sdk  : null,
    init : function(){
        this.create_forms();
        this.set_listeners();
    },
    set_listeners : function(){
        $('[data-action]').on('click', function(){
            switch($(this).attr('data-action')){
                case "delete" :
                    var send_datas = {};
                        send_datas[$(this).attr('data-type')] = $(this).attr('data-value');
                    index.sdk.api.call(
                        "DELETE",
                        $(this).attr('data-post'),
                        send_datas,
                        function(e){
                            window.location.reload();
                        }
                    );
                    break;
                case "edit" :
                    if($('#'+$(this).attr('data-edittemplate')).length > 0){
                        $('#'+$(this).attr('data-edittemplate')).remove();
                    }
                    $('.editable').removeClass('editable');
                    var target = $(this).parent().parent();
                    index.sdk.template($(this).attr('data-edittemplate'), {member_id:$(this).attr("data-value")}, function(e){
                        target.append(e);
                        account.member_edit_form = new formular('#member_edit_form', function(e){
                            if(typeof e.action !== "undefined"){
                                switch(e.action){
                                    case "cancel":
                                        target.removeClass('editable');
                                        $('#member_edit_form').remove();
                                        break;
                                    case "save":
                                        var data_form = {
                                            member_id : $('#member_edit_form').attr('data-memberid')
                                        };
                                        $.each($("#member_edit_form form").serializeArray(), function(index, serie){
                                            data_form[serie.name] = serie.value;
                                        });
                                        if(typeof $('#member_edit_form #child_avatar').attr('data-path') !== "undefined"){
                                            data_form.avatar = $('#member_edit_form #child_avatar').attr('data-path');
                                        }
                                        index.sdk.api.put("/me/members", data_form, function(e){
                                            console.log(e);
                                        });
                                        break;
                                    default:
                                        break;
                                }
                            }
                        }).init();
                        target.addClass('editable');
                    });
                    break;
            }
        });
    },
    create_forms : function(){
        this.public_form = new formular("#public_datas", function(e){
            console.log(e);
        }).init();
        this.public_form = new formular("#add_kid", function(e){
            console.log(e);
            if(e.status === "hitted" && e.action === "submit"){
                var form_datas = {};
                $.each($("#add_kid form").serializeArray(), function(index, serie){
                    form_datas[serie.name] = serie.value;
                });
                index.sdk.api.post('/me/members', form_datas, function(e){
                    window.location.reload();
                });
            }
        }).init();
        this.address_form = new formular('#address_form', function(e){
            console.log(e);
            if(e.status === "validated"){
                var addr = $('#addressLine1').val()+'+'+$('#postalCode').val()+'+'+$('#city').val()+'+'+$('#addressCountry').val()
                //$('#address_preview').attr('src', "https://maps.googleapis.com/maps/api/staticmap?center="+addr+"&key=AIzaSyB_MlYEDlRnNWYtrn-y63pbjrWecYaocqs");
            }
            //"https://maps.googleapis.com/maps/api/staticmap?center="
        }).init();
        
        this.private_form = new formular('#private_datas', function(e){
            //console.log(e);
        }).init();
        
        this.services_form = new formular('#services_form', function(e){
            console.log(e);
            if(e.status==="hitted" && e.action==="submit"){
                var user_datas = account.services_form.get_datas();
                console.log(user_datas);
                index.sdk.api.post("/account/profile/", user_datas, function(e){
                    console.log(e);
                });
                
            }
        });
        this.services_form.init();
        if($('#member_datas').length > 0){
            this.member_form = new formular("#member_datas", function(e){
                if(typeof e.action !== "undefined"){
                    switch(e.action){
                        case "save":
                            var form_datas = {
                                member_id:$('#member_datas').attr('data-memberid')
                            };
                            $.each($("#member_datas form").serializeArray(), function(index, serie){
                                form_datas[serie.name] = serie.value;
                            });
                            index.sdk.api.put("/me/members", form_datas, function(e){
                                window.location.reload();
                            });
                            break;
                        default:
                            break;
                    }
                }
            }).init();
        }
    }
}
