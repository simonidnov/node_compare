function formular(target, callback){
    this.target = target;
    this.callback = callback;
    this.email_tester = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-?\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
    this.init = function(){
        this.callback({"status":"inited"});
        this.setListeners();
    };
    this.setListeners = function(){
        var self = this;
        $('[data-action]').on("click", function(e){
            var action = $(this).attr('data-action');
            switch(action){
                case 'switch_tab':
                    break;
                default:
                    break;
            }
        });
        $(target).find('.material_input input').off('focus').on('focus', function(){
            $(this).parent().addClass('focused');
            self.callback({"status":"focus", value:$(this)});
        });
        $(target).find('.material_input input').off('blur').on('blur', function(){
            self.checkInputs();
            $(this).parent().removeClass('focused');
            self.callback({"status":"blur", value:$(this)});
        });
        $(target).find('.material_input input').off('input').on('input', function(){
            self.inputCheck($(this));
        });
        $(target).find('input[type="checkbox"]').off('change').on('change', function(){
            self.inputCheck($(this));
            self.callback({"status":"checkbox", name:$(this).attr('name'), value:$(this).is(':checked')});
        });
        $(target).find('[data-tab]').off('click').on('click', function(){
            var tab = $(this).attr('data-tab');
            $.each($(this).parent().find('[data-tab]'), function(index, switch_tab){
                if($(this).attr('data-tab') === tab){
                    $('#'+$(this).attr('data-tab')).css('display', 'block');
                    $('[data-tab="'+$(this).attr('data-tab')+'"]').addClass('selected');
                }else{
                    $('#'+$(this).attr('data-tab')).css('display', 'none'); 
                    $('[data-tab="'+$(this).attr('data-tab')+'"]').removeClass('selected');
                }
            });
            self.callback({"status":"tab_change", value:$(this).attr('data-tab')});
        });
    };
    this.checkInputs = function(){
        var self = this;
        $.each($('.material_input input'), function(index, input){
            self.inputCheck($(this));
            //var type=$(this).attr('type');
        });
    };
    this.inputCheck = function(target){
        var self = this;
        if(target.attr('type') === "checkbox"){
            this.validform();
            if(!target.is(':checked')){
                $('[data-checkboxrelative="'+target.attr('id')+'"]').css('display', 'none');
                return false;
            }else{
                $('[data-checkboxrelative="'+target.attr('id')+'"]').css('display', 'block');
                return true;
            }
        }
        if(target.val() == ""){
            target.parent().removeClass('invalid');
            target.parent().removeClass('valid');
            target.parent().removeClass('notempty');
            target.parent().find('.input_error').remove();
            return;
        }else{
            var type = target.attr('type');
            if(type == "email"){
                if(this.validateEmail(target.val())){
                    target.parent().addClass('valid');
                    target.parent().removeClass('invalid');
                    target.parent().find('.input_error').remove();
                }else{
                    target.parent().addClass('invalid');
                    target.parent().removeClass('valid');
                    if(typeof target.attr('data-errormessage') !== "undefined" && target.parent().find('.input_error').length == 0){
                        target.parent().append('<div class="input_error">'+target.attr('data-errormessage')+'</div>');
                    }
                }
                return;
            }
            target.parent().addClass('notempty');
            if(typeof target.attr('data-regex') !== "undefined"){
                if(target.attr('data-regex') === 'same'){
                    if(target.val() === $('#'+target.attr('data-target')).val()){
                        target.parent().addClass('valid');
                        target.parent().removeClass('invalid');
                        target.parent().find('.input_error').remove();
                    }else{
                        target.parent().addClass('invalid');
                        target.parent().removeClass('valid');
                        if(typeof target.attr('data-errormessage') !== "undefined" && target.parent().find('.input_error').length == 0){
                            target.parent().append('<div class="input_error">'+target.attr('data-errormessage')+'</div>');
                        }
                    }
                    return false;
                }
                var validator = new RegExp(target.attr('data-regex').toString());
                if(!validator.test(target.val())){
                    if(typeof target.attr('data-errormessage') !== "undefined" && target.parent().find('.input_error').length == 0){
                        target.parent().append('<div class="input_error">'+target.attr('data-errormessage')+'</div>');
                    }
                    target.parent().addClass('invalid');
                    target.parent().removeClass('valid');
                }else{
                    target.parent().removeClass('invalid');
                    target.parent().addClass('valid');
                    if(target.parent().find('.input_error').length > 0){
                        target.parent().find('.input_error').remove();
                    }
                    if($('[data-checkinput="'+target.attr('id')+'"]').length > 0){
                        $('[data-checkinput="'+target.attr('id')+'"] .check').addClass('checked');
                    }
                }
                if($('[data-checkinput="'+target.attr('id')+'"]').length > 0){
                    $('[data-checkinput="'+target.attr('id')+'"] .check').removeClass('checked');
                    /* TEST SI LA LONGEUR EST DEMANDEE */
                    if($('[data-checkinput="'+target.attr('id')+'"] .check_length').length > 0 && target.val().length >= target.attr('minlength')){
                        $('[data-checkinput="'+target.attr('id')+'"] .check_length').addClass('checked');
                    }else{
                        $('[data-checkinput="'+target.attr('id')+'"] .check_length').removeClass('checked');
                    }
                    /* TEST SI ON DEMANDE UNE MAJUSCULE */
                    if($('[data-checkinput="'+target.attr('id')+'"] .check_capital').length > 0){
                        var cap_reg = new RegExp("[A-Z]+", "g");
                        if(cap_reg.test(target.val())){
                            $('[data-checkinput="'+target.attr('id')+'"] .check_capital').addClass('checked');
                        }else{
                            $('[data-checkinput="'+target.attr('id')+'"] .check_capital').removeClass('checked');
                        }
                    }
                    /* TEST SI ON DEMANDE UN CHIFFRE */
                    if($('[data-checkinput="'+target.attr('id')+'"] .check_number').length > 0){
                        var num_reg = new RegExp("[0-9]+", "g");
                        if(num_reg.test(target.val())){
                            $('[data-checkinput="'+target.attr('id')+'"] .check_number').addClass('checked');
                        }else{
                            $('[data-checkinput="'+target.attr('id')+'"] .check_number').removeClass('checked');
                        }
                    }
                }
            }else if(typeof target.attr('minlength') !== "undefined"){
                var minlength = target.attr('minlength');
                if(target.val().length < minlength){
                    target.parent().addClass('invalid');
                    target.parent().removeClass('valid');
                }else{
                    target.parent().addClass('valid');
                    target.parent().removeClass('invalid');
                }    
            }else{
                target.parent().removeClass('valid');
                target.parent().removeClass('invalid');
            }
        }
        self.validform();
    };
    this.validform = function(target_form){
        $.each($(this.target).find('form'), function(index, form){
            var valid = true,
                target_form = $(this);
            $.each(target_form.find('input'), function(index, target){
                if($(this).attr('required')){
                   if($(this).attr('type') === "checkbox"){
                        if(!$(this).is(':checked')){
                            $('[data-checkboxrelative="'+$(this).attr('id')+'"]').css('display', 'none');
                            console.log(target_form.attr('id'), " invalid ", $(this));
                            valid = false;
                        }else{
                            $('[data-checkboxrelative="'+$(this).attr('id')+'"]').css('display', 'block');
                        }
                    }else{
                        if(!$(this).parent().hasClass('valid')){
                            console.log(target_form.attr('id'), " invalid ", $(this));
                            valid = false;
                        }      
                    }
                }
            });
            if(valid){
                target_form.find('button[type="submit"]').removeClass('btn-disabled');
                callback({form:target_form.attr('id'), status:"validated"});
            }else{
                target_form.find('button[type="submit"]').addClass('btn-disabled');
                callback({form:target_form.attr('id'), status:"invalid"});
            }
        });
    };
    this.validateEmail = function(email){
        console.log('validateEmail ::: ', this.email_tester.test(email));
        if(this.email_tester.test(email)) return true;
        else return false;
    }
}