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
        $(target).find('.delete_input_array_button').off('click').on('click', function(){
            $(this).parent().remove();
        });
        $(target).find('.add_input_array_button').off('click').on('click', function(){
            var name = $(this).parent().parent().attr('data-name')+""+$(this).parent().parent().find('input').length;
            $(this).parent().parent().find(".array_list_inputs").append('<li class="form-group material_input"><input minlength="5" type="text" name="'+name+'" value=""/><label>Entrez une valeur</label><div class="delete_input_array_button">Supprimer</div></li>');
            $(target).find('.delete_input_array_button').off('click').on('click', function(){
                $(this).parent().remove();
            });
        });
        $(target).find('select').off('change').on('change', function(e){
          self.inputCheck($(this), true);
        });
        $(target).find('[data-file]').off('change').on('change', function(e){
            var input = this,
                input_id = $(this).attr("id");
            var formData = new FormData();
            formData.append('avatar', $(this)[0].files[0]);
            $.ajax({
                url: '/media',  //Server script to process data
                type: 'POST',
                method : 'POST',
                data: formData,
                contentType: false,
                processData: false,
                //Ajax events
                success: function(response){
                    $(target).find('[for="'+input_id+'"] img').attr('src', "/"+response.path);
                    $(target).find('#'+input_id.replace('_file', '')).val("/"+response.path);
                }
            });
        });

        $(target).find(".image_cropper").change(function() {
            var $image = document.getElementById($(this).attr('id')+'_preview'),
                oFReader = new FileReader(),
                _target = $(this);
            oFReader.readAsDataURL(this.files[0]);
            oFReader.onload = function (oFREvent) {
                $image.src = this.result;
                _target.parent().append('<div class="btn btn-success valid_crop">Valider</div>');
                var cropper = new Cropper($image, {
                  aspectRatio: _target.attr('data-width') / _target.attr('data-height'),
                  crop: function(e) {}
                });
                _target.parent().find('.valid_crop').off('click').on('click', function(){
                    _target.parent().find('.valid_crop').remove();
                    $image.src = cropper.getCroppedCanvas().toDataURL();
                    cropper.destroy();

                    var url = "url/action";
                    var image = $('#image-id').attr('src');
                    var base64ImageContent = $image.src.replace(/^data:image\/(png|jpg);base64,/, "");
                    var blob = base64ToBlob(base64ImageContent, 'image/png');
                    var formData = new FormData();
                    formData.append('base64', blob);

                    $.ajax({
                        url: '/media/base64',  //Server script to process data
                        type: 'POST',
                        method : 'POST',
                        data: formData,
                        contentType: false,
                        processData: false,
                        //Ajax events
                        success: function(response){
                            $(target).find('#'+_target.attr('data-target')).val(response.path);
                        }
                    });
                });
            };
        });
        $(target).find('[data-action], [data-formaction]').off("click").on("click", function(e){
            e.preventDefault();
            var action = $(this).attr('data-action');
            switch(action){
                case 'switch_tab':
                    self.callback({"status":"hitted", "action":action});
                    break;
                case 'submit':
                    // PERHAPS WE CAN POST DATA HERE
                    // ACTUALLY WE NEED TO USE CALLBACK LIGHTER FORM CLASS
                    if(typeof $(target).find('form').attr('action') !== "undefined" && typeof $(target).find('form').attr('method') !== "undefined"){
                        callback({status:"hitted", "action":"submit_form", form:$(target).find('form')});
                        callback({status:"hitted", "action":"submit", form:$(target).find('form')});
                    }else{
                        callback({status:"hitted", "action":"submit"});
                    }
                    break;
                default:
                    self.callback({"status":"hitted", "action":action});
                    break;
            }

            return false;
        });

        $(target).find('[data-formaction]').off("click").on("click", function(e){
            e.preventDefault();
            var action = $(this).attr('data-formaction');
            switch(action){
                case 'switch_tab':
                    self.callback({"status":"hitted", "action":action});
                    break;
                case 'submit':
                    callback({status:"hitted", "action":"submit_form", form:$("#"+$(this).attr("data-formid"))});
                    break;
                default:
                    self.callback({"status":"hitted", "action":action});
                    break;
            }

            return false;
        });

        $(target).find('.material_input input').off('focus').on('focus', function(){
            $(this).parent().addClass('focused');
            self.callback({"status":"focus", value:$(this)});
            if($(this).attr('type') === "date"){
                var userAgent = navigator.userAgent || navigator.vendor || window.opera;
                if (/windows phone/i.test(userAgent)) {
                    return false;
                }

                if (/android/i.test(userAgent)) {
                    return false;
                }

                // iOS detection from: http://stackoverflow.com/a/9039885/177710
                if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
                    return false;
                }
                var cal = new datepicker($(this), function(e){
                });
            }
        });


        //, .maxlength, .minmaxlength
        self.check_min_max();
        $(target).find('.material_input input, .material_input textarea').off('keypress').on('keypress', function(){
            self.check_min_max();
        });

        $(target).find('.material_input input, .material_input textarea').off('blur').on('blur', function(){
            self.check_min_max();
            self.inputCheck($(this), true);
            //self.checkInputs();
            $(this).parent().removeClass('focused');
            self.callback({"status":"blur", value:$(this)});
        });
        $(target).find('.material_input input, .material_input textarea').off('input').on('input', function(){
            self.inputCheck($(this), false);
        });
        $(target).find('input[type="checkbox"]').off('change').on('change', function(){
            console.log('INPUT CHECK CHANGE ');
            self.inputCheck($(this), true);
            //self.checkInputs(false);
            self.callback({"status":"checkbox", name:$(this).attr('name'), value:$(this).is(':checked')});
        });
        self.checkInputs(false);
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
    this.check_min_max = function(){
        $.each($(target).find('.minlength'), function(index, input){
            var input = null,
                val = "";
            if($(this).find('input').length > 0){
                input = $(this).find('input');
                val = input.val();
            }else if($(this).find('textarea').length > 0){
                input = $(this).find('textarea');
                val = input.val();
            }else{
                return false;
            }

            if($(this).find('.number').length === 0){
                $(this).append('<span class="number"></span>');
            }
            if(val.length+1 >= parseInt(input.attr('minlength'))){
                $(this).find('.number').html('<span class="icon idkids-icon icon-check"></span>');
            }else{
                $(this).find('.number').html(val.length+'/'+input.attr('minlength'));
            }
        });
    }
    this.checkInputs = function(with_message){
        var self = this;
        $.each($(target).find('.material_input input, .material_input select, .material_input textarea'), function(index, input){
            self.inputCheck($(this), with_message);
            //var type=$(this).attr('type');
        });
    };
    this.check_error = function(target, with_message){
      if(!with_message){
        return false;
      }
      if(target.val() === ""){
        target.parent().addClass('empty').removeClass('notempty').removeClass('valid').removeClass('invalid');
        target.parent().find('.input_error').remove();
        return false;
      }else{
        target.parent().removeClass('empty').addClass('notempty');
      }
      if(target.attr('data-errormessage') !== "undefined" && target.parent().find('.input_error').length === 0){
        target.parent().append('<div class="input_error">'+target.attr('data-errormessage')+'</div>');
      }
    };
    this.inputCheck = function(target, with_message){
        var self = this;
        if(target.attr('type') === "checkbox"){
            this.validform();
            if(!target.is(':checked')){
                console.log('NOT CHECKED');
                if(target.is(':required')){
                  target.parent().addClass('error_check');
                  console.log('NOT CHECKED AND REQUIRED');
                  this.check_error(target, true);
                }
                $('[data-checkboxrelative="'+target.attr('id')+'"]').css('display', 'none');
                return false;
            }else{
                target.parent().removeClass('error_check');
                target.parent().find('.input_error').remove();
                $('[data-checkboxrelative="'+target.attr('id')+'"]').css('display', 'block');
                return true;
            }

        }
        if(target.prop("tagName") === "SELECT"){
          if(target.val() === null && target.is(':required')){
            if(with_message && target.is(':required')){
              target.parent().addClass('invalid');
              target.parent().removeClass('valid');
              this.check_error(target, with_message);
              /*if(typeof target.attr('data-errormessage') !== "undefined" && target.parent().find('.input_error').length == 0 && with_message){
                  target.parent().append('<div class="input_error">'+target.attr('data-errormessage')+'</div>');
              }*/
            }else{
              target.parent().removeClass('invalid');
              target.parent().removeClass('valid');
              target.parent().removeClass('notempty');
              target.parent().find('.input_error').remove();
            }
          }else{
            target.parent().removeClass('invalid');
            target.parent().addClass('valid');
            target.parent().addClass('notempty');
            target.parent().find('.input_error').remove();
          }
          return false;
        }
        if(target.val() === ""){
            target.parent().removeClass('notempty').addClass('empty');
            if(with_message && target.is(':required')){
              if(typeof target.attr('data-errormessage') !== "undefined" && target.parent().find('.input_error').length == 0 && with_message){
                  target.parent().addClass('invalid');
                  target.parent().removeClass('valid');
                  this.check_error(target, with_message);
                  //target.parent().append('<div class="input_error">'+target.attr('data-errormessage')+'</div>');
              }
            }else{
                target.parent().removeClass('invalid');
                target.parent().removeClass('valid');
                target.parent().find('.input_error').remove();
            }
            return;
        }else{
            target.parent().addClass('notempty').removeClass('empty');
            var type = target.attr('type');
            switch(type){
                case "email":
                    if(this.validateEmail(target.val())){
                        target.parent().addClass('valid');
                        target.parent().removeClass('invalid');
                        target.parent().find('.input_error').remove();
                    }else{
                        target.parent().addClass('invalid');
                        target.parent().removeClass('valid');
                        this.check_error(target, with_message);
                        /*if(typeof target.attr('data-errormessage') !== "undefined" && target.parent().find('.input_error').length == 0 && with_message){
                            target.parent().append('<div class="input_error">'+target.attr('data-errormessage')+'</div>');
                        }*/
                    }
                    self.validform();
                    return;
                    break;
                case "text":
                    target.parent().addClass('valid');
                    target.parent().removeClass('invalid');
                    target.parent().find('.input_error').remove();
                    break;
                case "date":
                    target.parent().addClass('valid');
                    self.validform();
                    return;
                    break;
                case "radio":
                    self.validform();
                    break;
                case "checkbox":
                    self.validform();
                    break;
            }

            if(typeof target.attr('data-regex') !== "undefined"){
                if(target.attr('data-regex') === 'same'){
                    if(target.val() === $('#'+target.attr('data-target')).val()){
                        target.parent().addClass('valid');
                        target.parent().removeClass('invalid');
                        target.parent().find('.input_error').remove();
                    }else{
                        target.parent().addClass('invalid');
                        target.parent().removeClass('valid');
                        this.check_error(target, with_message);
                        /*if(typeof target.attr('data-errormessage') !== "undefined" && target.parent().find('.input_error').length == 0 && with_message){
                            target.parent().append('<div class="input_error">'+target.attr('data-errormessage')+'</div>');
                        }*/
                    }
                    return false;
                }
                var validator = new RegExp(target.attr('data-regex').toString());
                if(!validator.test(target.val())){
                    this.check_error(target, with_message);
                    /*if(typeof target.attr('data-errormessage') !== "undefined" && target.parent().find('.input_error').length == 0 && with_message){
                        target.parent().append('<div class="input_error">'+target.attr('data-errormessage')+'</div>');
                    }*/
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
                    if($('[data-checkinput="'+target.attr('id')+'"] .check_hash').length > 0 && target.val().indexOf('#') !== -1){
                        $('[data-checkinput="'+target.attr('id')+'"] .check_hash').addClass('checked');
                    }else{
                        $('[data-checkinput="'+target.attr('id')+'"] .check_hash').removeClass('checked');
                    }

                    if($('[data-checkinput="'+target.attr('id')+'"] .check_arobase').length > 0 && target.val().indexOf('@') !== -1){
                        $('[data-checkinput="'+target.attr('id')+'"] .check_arobase').addClass('checked');
                    }else{
                        $('[data-checkinput="'+target.attr('id')+'"] .check_arobase').removeClass('checked');
                    }

                    if($('[data-checkinput="'+target.attr('id')+'"] .check_dot').length > 0 && target.val().indexOf('.') !== -1){
                        $('[data-checkinput="'+target.attr('id')+'"] .check_dot').addClass('checked');
                    }else{
                        $('[data-checkinput="'+target.attr('id')+'"] .check_dot').removeClass('checked');
                    }

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
            }

            if(typeof target.attr('minlength') !== "undefined"){
                var minlength = target.attr('minlength');
                if(target.val().length < minlength && target.is(':required')){
                    target.parent().addClass('invalid');
                    target.parent().removeClass('valid');

                    this.check_error(target, with_message);
                    /*if(with_message){
                      if(typeof target.attr('data-errormessage') !== "undefined" && target.parent().find('.input_error').length == 0 && with_message){
                          target.parent().append('<div class="input_error">'+target.attr('data-errormessage')+'</div>');
                      }
                    }*/
                }else{
                    target.parent().addClass('valid');
                    target.parent().removeClass('invalid');
                    target.parent().find('.input_error').remove();
                }
            }else{
                target.parent().addClass('valid');
                target.parent().removeClass('invalid');
            }
        }
        self.validform();
    };
    this.validform = function(target_form){
        $.each($(this.target).find('form'), function(index, form){
            var valid = true,
                target_form = $(this);
            $.each(target_form.find('input, textarea, select'), function(index, target){
                if($(this).attr('required')){
                   if($(this).attr('type') === "checkbox"){
                        if(!$(this).is(':checked')){
                            $('[data-checkboxrelative="'+$(this).attr('id')+'"]').css('display', 'none');
                            valid = false;
                        }else{
                            $('[data-checkboxrelative="'+$(this).attr('id')+'"]').css('display', 'block');
                        }
                    }else if($(this).attr('type') === "radio"){

                    }else{
                        if(!$(this).parent().hasClass('valid') && $(this).attr('required')){
                            valid = false;
                        }
                    }
                    if($(this).val() === null){
                      valid = false;
                    }
                    if($(this).val() === ""){
                      valid = false;
                    }
                }
            });
            if(valid){
                target_form.find('button[type="submit"], [data-action="submit"]').removeClass('btn-disabled');
                callback({form:target_form.attr('id'), status:"validated"});
            }else{
                target_form.find('button[type="submit"], [data-action="submit"]').addClass('btn-disabled');
                callback({form:target_form.attr('id'), status:"invalid"});
            }
        });
    };
    this.validateEmail = function(email){
        if(this.email_tester.test(email)) return true;
        else return false;
    };
    this.get_datas = function(){
        var form_datas = {};
        $.each($(target).find("form").serializeArray(), function(index, serie){
            form_datas[serie.name] = serie.value;
        });

        $(target).find('input:checkbox, input:radio').map(function() {
            form_datas[$(this).attr('name')] = $(this).is(':checked');
            //return { name: this.name, value: this.checked ? this.value : "false" };
        });

        $.each($(target).find('.array_list_inputs'), function(index, array_list){
            var array_list = {};
            //var data = {};
            $.each($(this).find('input'), function(index, input_list){
                var name = $(this).attr('name'),
                    value = $(this).val();
                if($(this).attr('type') === "checkbox" || $(this).attr('type') === "radio"){
                    value = $(this).is(':checked');
                }
                //data[name] = value;
                array_list[name] = value;
            });
            form_datas[$(this).attr('data-name')] = array_list;
        });
        return form_datas;
    }
}

function datepicker(target, callback){
    this.years = [];
    this.month = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    this.days = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    target.append();
    $('#idkids_calendar').remove();
    //$('html, body').scrollTop(target.offset().top + 30);

    $('body').append('<div id="idkids_calendar" class="calendar"><div class="content"><div class="top_header">'+$('label[for="'+target.attr('id')+'"]').html()+'</div><div class="choices"><div class="selector"></div><div class="wrapper days"><ul class=""></ul></div><div class="wrapper months"><ul class=""></ul></div><div class="wrapper years"><ul class=""></ul></div></div><div class="bottom_footer"><div class="btn btn-lg btn-success" id="validate_and_close_calendar">Valider</div></div></div></div>');

    $('.calendar .content').css({"left":target.offset().left, "top":target.offset().top - $('html, body').scrollTop() + 40, "width":target.width()});
    if(parseInt($('.calendar .content').css('top').replace('px', '')) + $('.calendar .content').outerHeight() > window.innerHeight){
        $('.calendar .content').css('top', window.innerHeight - $('.calendar .content').outerHeight());
    }
    $('body').css('overflow', 'hidden');
    var n = 0,
        self = this,
        max = 2018,
        min = 1890;

    if(target.attr('min')){
        min =  new Date(target.attr('min')).getFullYear();
    }
    if(target.attr('max')){
        max =  new Date(target.attr('max')).getFullYear();
    }

    for(var i=max; i>min; i--){
        $('.calendar .years ul').append('<li data-index="'+n+'" data-value="'+i+'" class="'+((n == 0)? "selected" : "")+'">'+i+'</li>');
        n++;
    }
    for(var i=0; i<this.month.length; i++){
        $('.calendar .months ul').append('<li data-index="'+i+'" data-value="'+(((i+1)<10)? "0"+(i+1) : (i+1))+'" class="'+((i == 0)? "selected" : "")+'">'+this.month[i]+'</li>');
    }
    for(var i=1; i<32; i++){
        $('.calendar .days ul').append('<li data-index="'+(i-1)+'" data-value="'+((i<10)? "0"+i : i)+'" class="'+((i == 1)? "selected" : "")+'">'+((i<10)? "0"+i : i)+'</li>');
    }

    if(target.val() !== ""){
        var defaultdate = new Date(target.val()),
            year = defaultdate.getFullYear(),
            month = defaultdate.getMonth(),
            day = defaultdate.getDate(),
            yearid = $('.calendar .wrapper.years [data-value="'+year+'"]').attr('data-index');
        $('.calendar .wrapper.days').scrollTop((day-1)*40);
        $('.calendar .wrapper.months').scrollTop(month*40);
        $('.calendar .wrapper.years').scrollTop(yearid*40);

    }
    $.fn.scrollEnd = function(callback, timeout) {
      $(this).scroll(function(){
        var $this = $(this);
        if ($this.data('scrollTimeout')) {
          clearTimeout($this.data('scrollTimeout'));
        }
        $this.data('scrollTimeout', setTimeout(callback,timeout));
      });
    };

    $('.calendar .wrapper.days').scrollEnd(function(e){
        var target = $('.calendar .wrapper.days'),
            num = Math.round(target.scrollTop()/40),
            scrollto = num * 40;
        target.find('li').removeClass('selected');
        target.find('li').eq(num).addClass('selected');
        target.animate({
            scrollTop: scrollto
        }, 200);
        self.setDate();
    }, 500);
    $('.calendar .wrapper.months').scrollEnd(function(e){
         var target = $('.calendar .wrapper.months'),
            num = Math.round(target.scrollTop()/40),
            scrollto = num * 40;
        target.find('li').removeClass('selected');
        target.find('li').eq(num).addClass('selected');
        target.animate({
            scrollTop: scrollto
        }, 200);
        self.setDate();
    }, 500);
    $('.calendar .wrapper.years').scrollEnd(function(e){
        var target = $('.calendar .wrapper.years'),
            num = Math.round(target.scrollTop()/40),
            scrollto = num * 40;
        target.find('li').removeClass('selected');
        target.find('li').eq(num).addClass('selected');
        target.animate({
            scrollTop: scrollto
        }, 200);
        self.setDate();
    }, 500);
    $('.calendar .wrapper li').off("click").on('click', function(){
        $(this).parent().parent().animate({
            scrollTop: ($(this).attr('data-index')*40)
        }, 200);
    });
    $('#validate_and_close_calendar').off('click').on('click', function(){
        self.setDate();
        $('#idkids_calendar').remove();
        $('body').css('overflow', 'scroll');
    });
    this.setDate = function(){
        var day = $('.calendar .wrapper.days .selected').attr('data-value'),
            month = $('.calendar .wrapper.months .selected').attr('data-value'),
            year = $('.calendar .wrapper.years .selected').attr('data-value');
        if(self.days[parseInt(month)-1] === 30){
            $('.calendar .wrapper.days li').eq(30).addClass('disabled');
            $('.calendar .wrapper.days li').eq(29).removeClass('disabled');
        }else if(self.days[parseInt(month)-1] === 29){
            $('.calendar .wrapper.days li').eq(29).addClass('disabled');
            $('.calendar .wrapper.days li').eq(30).addClass('disabled');
        }else{
            $('.calendar .wrapper.days li').removeClass('disabled');
        }
        target.val(year+'-'+month+'-'+day);
        target.blur();
    }
}



function base64ToBlob(base64, mime)
{
    mime = mime || '';
    var sliceSize = 1024;
    var byteChars = window.atob(base64);
    var byteArrays = [];

    for (var offset = 0, len = byteChars.length; offset < len; offset += sliceSize) {
        var slice = byteChars.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, {type: mime});
}
