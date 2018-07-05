/* ------------ SDK ALONE TEST ----------- */
var idkids_jssdk = function(options, callback){
    this.options = options;
    this.callback = callback;
    this.inited = false;
    (window.location.origin.indexOf('127.0.0.1') === -1)? options.is_debug = false : options.is_debug = true;
    this.logout = function(){
        this.api.store('idkids_local_user', '');
        //window.location.href = window.location.origin + window.location.pathname;
        window.history.pushState({"pageTitle":document.title}, document.title, window.location.origin + window.location.pathname);
    };
    $('html, body, *').off('click').on("click", function(event){});
    this.api = {
        user : null,
        parent : null,
        options:null,
        config : {
          url:"https://auth.joyvox.fr",
          debug_url:"http://127.0.0.1:3000"
        },
        get : function(request, params, callback, error_callback, always_callback) {
            this.call('GET', request, params, callback, error_callback, always_callback);
        },
        post : function(request, params, callback, error_callback, always_callback) {
            if(this.options.is_debug){
              this.config.url = this.config.debug_url;
            }
            //this.call('POST', request, params, callback);
            this.add_params(params, $.proxy(function(params){
              $.post(this.config.url+request, {
                  Accept: "text/plain; charset=utf-8",
                  method: "POST",
                  xhrFields: {
                     withCredentials: false
                  },
                  contentType: 'application/jsonp; charset=utf-8',
                  dataType: "json",
                  data: params
              })
              .done($.proxy(function(e) {
                  callback(e);
              }, this))
              .fail(function(e) {
                  if(typeof error_callback !== "undefined" && error_callback !== null){
                    error_callback(e);
                  }
              })
              .always($.proxy(function(e) {
                  if(typeof always_callback !== "undefined" && always_callback !== null){
                    always_callback(e);
                  }
                  this.hide_loader();
                  this.check_response(e);
              }, this));
            }, this));

            //this.call('POST', request, params, callback);
        },
        put : function(request, params, callback, error_callback, always_callback) {
            this.call('PUT', request, params, callback, error_callback, always_callback);
        },
        deleting : function(request, params, callback, error_callback, always_callback) {
            this.call('DELETE', request, params, callback, error_callback, always_callback);
        },
        call : function(method, request, params, callback, error_callback, always_callback){
            if(this.options.is_debug){
              this.config.url = this.config.debug_url;
            }
            this.show_loader();
            this.add_params(params, $.proxy(function(new_params){
                params = new_params;
                dataType = 'json';

                if(method === "POST" || method === "PUT" || method === "DELETE"){
                    dataType = 'json';
                    params = JSON.stringify(params);
                }
                jQuery.ajax(this.config.url+request, {
                    method: method,
                    contentType: 'application/json',
                    dataType: dataType,
                    data: params
                })
                .done($.proxy(function(e) {
                    if(typeof e.updated_token !== "undefined"){
                        this.user.token = e.updated_token;
                        this.store('idkids_local_user', this.user);
                    }
                    callback(e);
                }, this))
                .fail(function(e) {
                    if(typeof error_callback !== "undefined" && error_callback !== null){
                      error_callback(e);
                    }
                })
                .always($.proxy(function(e) {
                    this.hide_loader();
                    /*if(typeof e.responseJSON !== "undefined"){
                        if(typeof e.responseJSON.message !== "undefined"){
                            e.message = e.responseJSON.message;
                        }
                    }*/
                    if(typeof always_callback !== "undefined" && always_callback !== null){
                      always_callback(e);
                    }
                    /* TODO CHECK IF HAS MESSAGE THEN DISPLAY POPIN MESSAGE OR TOAST ? */
                    this.check_response(e);
                },this));
            }, this));
        },
        check_response : function(e){
          if(typeof e.responseJSON !== "undefined"){
            e = e.responseJSON;
          }
          if(typeof e.idkids_user !== "undefined"){

            var jeton = {
                "token":e.idkids_user.datas.token,
                "_id":e.idkids_user.datas._id,
                "secret":e.idkids_user.datas.secret,
                "device":e.idkids_user.datas.current_device
            };
            this.store('idkids_local_user', jeton);
          }
          if(typeof e.response_display !== "undefined"){
              if(e.status === 203){
                callback("logout");
                this.store('idkids_local_user', "");
                this.get('/auth/logout', {}, function(){});
                if(typeof e.response_display.buttons === "undefined"){
                  e.response_display.buttons = [
                    {
                      "class":"btn-success",
                      "label":"Me connecter",
                      "value":0,
                      "href":((typeof this.config.url !== "undefined")? this.config.url : "")+"/auth?secret="+this.options.secret
                    },
                    {
                      "class":"",
                      "label":"Créer un compte",
                      "value":1,
                      "href":((typeof this.config.url !== "undefined")? this.config.url : "")+"/auth/subscribe?secret="+this.options.secret
                    }
                  ];
                }
              }else if(e.status === 401){
                this.get('/auth/logout', {}, function(){});
                e.response_display.buttons = [
                  {
                    "class":"btn-success",
                    "label":"Me connecter",
                    "value":0,
                    "href":((typeof this.config.url !== "undefined")? this.config.url : "")+"/auth?secret="+this.options.secret
                  },
                  {
                    "class":"btn-warning",
                    "label":"Créer un compte",
                    "value":1,
                    "href":((typeof this.config.url !== "undefined")? this.config.url : "")+"/auth/subscribe?secret="+this.options.secret
                  }
                ];
              }
              e.response_display.type ="modal";
              var pop = new popeye (
                  $('body'),
                  e.response_display,
                  function(e){
                  }
              );
              pop.init();
          }
        },
        get_user_status : function(){
            this.set_user();
            if(this.user === null){
                return {"status":"not_connected", "infos":"call api.get('me')"};
            }else{
                if(typeof this.user._id === "undefined"){
                  return {"status":"not_connected", "infos":"call api.get('me')"};
                }
                if(typeof Unity !== "undefined"){
                    Unity.call('{"status":"logged", "user":"'+JSON.stringify(this.user)+'", "token":"'+this.user.token+'", "id":"'+this.user.id+'", "device":"'+this.user.device+'"}');
                }
                return {"status":"logged", "user":this.user, "token":this.user.token, "id":this.user.id, "device":this.user.device};
            }
        },
        get_params : function(){

        },
        show_loader : function(){
            if($('.idkids_jssdk.loader').length === 0){
                $('body').append('<div class="idkids_jssdk loader"><div class="centered"><svg version="1.1" id="Calque_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"	 viewBox="0 0 256 256" style="enable-background:new 0 0 256 256;" xml:space="preserve"><style type="text/css">	.st0{fill:none;stroke:#4F555A;stroke-width:28;stroke-miterlimit:10;}	.st1{fill:#C93632;}</style><circle class="st0" cx="128" cy="128" r="53"/><circle class="st1" cx="128" cy="128" r="26"/></svg><span>Chargement</span></div></div>');
            }
            //setTimeout(function(){
                $('.idkids_jssdk.loader').addClass('showed').addClass('visible');
            //}, 200);
        },
        hide_loader : function(){
            setTimeout(function(){
              $('.idkids_jssdk.loader').removeClass('showed');
              setTimeout(function(){
                $('.idkids_jssdk.loader').removeClass('visible');
                $('.idkids_jssdk.loader').remove();
              }, 200);
            }, 100);
        },
        add_params : function(params, callback){
            params.options = this.options;
            //DEFAULT PUSH THIS OPTIONS TRY TO RM CAUSE TO LONG FOR URI REQUEST GET -> this.options;
            params.options.from_origin   = window.location.origin;
            if(this.user){
                params.options.user_token    = this.user.token;
                params.options.user_id       = this.user._id;
                params.options.user_secret   = this.user.secret;
                params.options.user_device   = this.user.current_device;
            }
            this.get_device_uid(function(e){
                if(e.status !== 200){
                    params.need_fingerprint = true;
                }
                delete e.status;
                params.device_infos = e;
                callback(params);
            });
        },
        reset_user : function(callback){
            var url = new URL(window.location.href);
            if(typeof url.searchParams !== "undefined"){
              var c = url.searchParams.get("idkids-token");
              if(c !== null && c !== "" && typeof c !== "undefined"){
                  var jeton = {
                      "token":url.searchParams.get("idkids-token"),
                      "_id":url.searchParams.get("idkids-id"),
                      "secret":url.searchParams.get("idkids-secret"),
                      "device":url.searchParams.get("idkids-device")
                  };
                  this.store('idkids_local_user', jeton);

                  this.set_user();
                  window.history.pushState({"pageTitle":document.title},document.title, window.location.origin + window.location.pathname);
                  callback(jeton);
              }
            }else{
              var params = getLocationParameters(window.location, 'both');
              var c = params["idkids-token"];
              if(typeof c !== "undefined" && c !== null && c !== "undefined"){
                  var jeton = {
                      "token":params["idkids-token"],
                      "_id":params["idkids-id"],
                      "secret":params["idkids-secret"],
                      "device":params["idkids-device"]
                  };
                  this.store('idkids_local_user', jeton);

                  this.set_user();
                  window.history.pushState({"pageTitle":document.title},document.title, window.location.origin + window.location.pathname);
                  callback(jeton);
              }
            }

        },
        set_user : function(){
            this.getStore('idkids_local_user');
        },
        store:function(key, datas){
            try {
                window.localStorage.setItem(key, JSON.stringify(datas));
            } catch(e) {
              Cookies.set(key, JSON.stringify(datas), { expires: 7 });
            }
        },
        getStore:function(key){
            try {
              if(key === "idkids_local_user"){
                this.user = JSON.parse(window.localStorage.getItem(key));
              }
              return JSON.parse(window.localStorage.getItem(key));
            } catch(e) {
              if(key === "idkids_local_user"){
                this.user = JSON.parse(Cookies.get(key));
              }
              return JSON.parse(JSON.parse(Cookies.get(key)));
            }
        },
        get_device_uid : function(callback){
            $('[name="appCodeName"]').val(navigator.appCodeName);
            $('[name="appName"]').val(navigator.appName);
            $('[name="appVersion"]').val(navigator.appVersion);
            $('[name="userAgent"]').val(navigator.userAgent);
            $('[name="vendor"]').val(navigator.vendor);
            if(typeof Fingerprint2 !== "undefined"){
                new Fingerprint2().get(function(result, components){
                    $('[name="device_uid"]').val(result);
                    callback(
                        {
                            status : 200,
                            device_uid : result
                        }
                    );
                    /* REMOVE FROM RESULT LIGHTER REQUESTS
                    ,
                    platform : navigator.platform,
                    appCodeName : navigator.appCodeName,
                    appName : navigator.appName,
                    appVersion : navigator.appVersion,
                    userAgent : navigator.userAgent,
                    vendor : navigator.vendor
                    */
                    //a hash, representing your device fingerprint
                });
            }else{
                callback(
                    {
                        status:404,
                        platform:navigator.platform,
                        appCodeName : navigator.appCodeName,
                        appName : navigator.appName,
                        appVersion : navigator.appVersion,
                        userAgent : navigator.userAgent,
                        vendor : navigator.vendor
                    }
                )
            }
        }
    };

    this.api.parent = this;
    this.api.options = options;
    this.init = function(callback){
        this.check_cookies();
        if (window.matchMedia('(display-mode: standalone)').matches) {
        }
        if (typeof(Unity) === 'undefined') {
           Unity = {
            call: function(msg) {
                var iframe = document.createElement('IFRAME');
                iframe.setAttribute('src', 'unity:' + msg);
                document.documentElement.appendChild(iframe);
                document.documentElement.removeChild(iframe);
                },
            };
        }
        this.api.get_device_uid(function(e){
        });
        this.api.reset_user(function(datas){
        });
        this.api.get('/me/from', {secret:{}}, function(e){
            callback(e);
        });
        /* check uri params call action SDK tools */
        var url = new URL(window.location.href);
        if(typeof url.searchParams !== "undefined"){
          var action = url.searchParams.get("idkids-sdk-action");
        }else{
          var params = getLocationParameters(window.location, 'both');
          var action = params['idkids-sdk-action'];
        }
        switch(action){
          case 'logout':
            this.logout();
            break;
          default:
            console.log('IDKIDS SDK TOOLKIT has returned an action not defined in your javascript sdk version. please upgrade the latest version of idkids-js-sdk on your server then try again.');
            break;
        }
        this.reset_listeners();
    };
    this.isLogged = function(callback){
        callback(this.api.get_user_status());
    };
    this.getPage = function(url, datas, callback){
      this.api.get(
        url,
        datas,
        callback,
        null,
        function(e){
          callback(e);
        }
      );
    };
    this.template = function(template_name, params, callback){
        $.get(this.api.config.url+'/templating/'+template_name, params, function(e){callback(e);});
    };
    this.createAuthbutton = function(target, callback){
        if(document.getElementById(target) === null){
            callback({"status":"error", "message":"TARGET_ID_TAG_ELEMENT_NOT_FOUND"});
        }else{
            var _self = this;
            this.template("auth_button", {user:this.api.user, options:this.options}, function(temp){
              document.getElementById(target).innerHTML = temp;
              callback({"status":"success", "message":"AUTH_BUTTON_CREATED"});
            });
        }
    };
    this.createNotificationButton = function(target, callback){
        if(document.getElementById(target) === null){
            callback({"status":"error", "message":"TARGET_ID_TAG_ELEMENT_NOT_FOUND"});
        }else{
            var _self = this;
            this.template("notif_button", {user:this.api.user, options:this.options}, function(temp){
              document.getElementById(target).innerHTML = temp;
              callback({"status":"success", "message":"AUTH_BUTTON_CREATED"});
            });
        }
    };
    this.validInitedApp = function(callback){
        this.api.get(this.api.config.url+'/api/apps/validate',
        {
          secret:this.options.secret
        },
        function(e){
            callback(e);
        });
    }
    this.reset_listeners = function(){
      var self = this;
      $('[data-idkidssdk]').off('click').on('click', function(e){
        switch($(this).attr('data-idkidssdk')){
          case 'add_basket' :
            // TODO call api add_basket
            self.api.post('/basket',
              {
                product_id : $(this).attr('data-productid'),
                quantity : $(this).attr('data-quantity'),
                url:window.location.href
              },
              function(e) {
                if(e.status === 200){
                  var total = parseInt($('#notifications .indice').html())+1;
                  $('#notifications .indice').html(total);
                  $('#total_basket').html('('+total+')');
                }
                self.callback({status:"ADD_BASKET"});
              }
            );
            break;
          case "delete_basket_product" :
            self.api.deleting('/basket',
              {
                basket_id : $(this).attr('data-basketid'),
                product_id : $(this).attr('data-productid')
              },
              function(e){
                if(e.status === 200){
                  window.location.reload();
                }
              }
            );
            break;
          default :
            console.log('action not reconized by idkids sdk, please upgrade your sdk version');
            break;
        }
      });
    }
    this.check_cookies = function(){
      var accept = this.api.getStore('accept_cookies');
      if(accept === null){
        var template = '<div class="idkids_cookies" id="idkids_cookies">';
              template+= '<p>En poursuivant votre navigation sur ce site, vous acceptez l’utilisation de cookies à des fins de partage sur les réseaux sociaux et de statistiques de visites, afin de bénéficier d\'une navigation et d\'offres personnalisées à vos besoins. Pour en savoir plus cliquez ici et pour paramétrer les cookies <a href="https://auth.joyvox.fr/uses-of-cookies">cliquez ici.</a></p>';
              template+= '<div class="btn btn-danger centered" id="accept_cookies">J\'accepte</div>';
            template+= '</div>';
        $('body').append(template);
        $('#accept_cookies').on('click', $.proxy(function(e){
          this.api.store('accept_cookies', {status:'checked'});
          $('#idkids_cookies').remove();
        }, this));
      }
    }
    this.connect = function(){
      window.location.href = this.api.config.url+"/auth?secret="+this.options.secret;
    }
    this.downloadFile = function(file){
      var request = new XMLHttpRequest(),
          fileName = file.split('/')[file.split('/').length-1];
      index.sdk.createProgressBar("Téléchargement de "+fileName, $('body'));

      request.responseType = 'blob';
      request.open('GET', file);
      request.addEventListener('error', function(event) {
        console.log('error ' + request);
      });
      request.addEventListener('progress', function(event) {
        var bitLoaded = (event.loaded/1000000).toFixed(2),
            bitTotal  = (event.total/1000000).toFixed(2),
            percentProgress = ((event.loaded/event.total)*100).toFixed(2);
        index.sdk.updateProgressBar(percentProgress, bitLoaded+" / "+bitTotal+" Mb | "+Math.round(percentProgress)+"%");
      });
      request.addEventListener('load', function (event) {
        index.sdk.deleteProgressBar();
        if (request.readyState == 4 && request.status == 200) {
          var blob = new Blob([request.response], {type: "application/zip"});
          saveAs(blob, fileName);
        }
      });
      request.send();
    }
    this.createProgressBar = function(label, target){
      target.prepend('<div class="idkids_progressbar"><div class="content_panel"><h3>'+label+'</h3><div class="progress"><div class="infos">En attente d\'information</div><div class="bar"><div class="infos">En attente d\'information</div></div></div></div></div>');
      setTimeout(function(){
        $('.idkids_progressbar .content_panel').css('top', 0);
      },200);
    }
    this.updateProgressBar = function(percent, message){
      $('.idkids_progressbar .bar').css('width', percent+'%');
      $('.idkids_progressbar .infos').html(message);
    }
    this.deleteProgressBar = function(){
      setTimeout(function(){
        $('.idkids_progressbar .content_panel').css('top', "150%");
        setTimeout(function(){
          $('.idkids_progressbar').remove();
        },400);
      },1000);
    }
}



function decodeUriComponentWithSpace (component) {
    return decodeURIComponent(component.replace(/\+/g, '%20'))
  }

  // type : 'hash', 'search' or 'both'
  function getLocationParameters (location, type) {
    if (type !== 'hash' && type !== 'search' && type !== 'both') {
      throw 'getLocationParameters expect argument 2 "type" to be "hash", "search" or "both"';
    }

    var searchString = typeof location.search === 'undefined' ? '' : location.search.substr(1);
    var hashString = typeof location.hash === 'undefined' ? '' : location.hash.substr(1);
    var queries = [];
    if (type === 'search' || type === 'both') {
      queries = queries.concat(searchString.split('&'));
    }
    if (type === 'hash' || type === 'both') {
      queries = queries.concat(hashString.split('&'));
    }

    var params = {};
    var pair;

    for (var i = 0; i < queries.length; i++) {
      if (queries[i] !== '') {
        pair = queries[i].split('=');
        params[this.decodeUriComponentWithSpace(pair[0])] = this.decodeUriComponentWithSpace(pair[1]);
      }
    }
    return params;
}


;(function (factory) {
	var registeredInModuleLoader = false;
	if (typeof define === 'function' && define.amd) {
		define(factory);
		registeredInModuleLoader = true;
	}
	if (typeof exports === 'object') {
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;
			if (typeof document === 'undefined') {
				return;
			}

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				// We're using "expires" because "max-age" is not supported by IE
				attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				if (!converter.write) {
					value = encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
				} else {
					value = converter.write(value, key);
				}

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				var stringifiedAttributes = '';

				for (var attributeName in attributes) {
					if (!attributes[attributeName]) {
						continue;
					}
					stringifiedAttributes += '; ' + attributeName;
					if (attributes[attributeName] === true) {
						continue;
					}
					stringifiedAttributes += '=' + attributes[attributeName];
				}
				return (document.cookie = key + '=' + value + stringifiedAttributes);
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				if (!this.json && cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = parts[0].replace(rdecode, decodeURIComponent);
					cookie = converter.read ?
						converter.read(cookie, name) : converter(cookie, name) ||
						cookie.replace(rdecode, decodeURIComponent);

					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					if (key === name) {
						result = cookie;
						break;
					}

					if (!key) {
						result[name] = cookie;
					}
				} catch (e) {}
			}

			return result;
		}

		api.set = api;
		api.get = function (key) {
			return api.call(api, key);
		};
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));



(function (view) {
	"use strict";

	view.URL = view.URL || view.webkitURL;

	if (view.Blob && view.URL) {
		try {
			new Blob;
			return;
		} catch (e) {}
	}

	// Internally we use a BlobBuilder implementation to base Blob off of
	// in order to support older browsers that only have BlobBuilder
	var BlobBuilder = view.BlobBuilder || view.WebKitBlobBuilder || view.MozBlobBuilder || (function(view) {
		var
			  get_class = function(object) {
				return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
			}
			, FakeBlobBuilder = function BlobBuilder() {
				this.data = [];
			}
			, FakeBlob = function Blob(data, type, encoding) {
				this.data = data;
				this.size = data.length;
				this.type = type;
				this.encoding = encoding;
			}
			, FBB_proto = FakeBlobBuilder.prototype
			, FB_proto = FakeBlob.prototype
			, FileReaderSync = view.FileReaderSync
			, FileException = function(type) {
				this.code = this[this.name = type];
			}
			, file_ex_codes = (
				  "NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR "
				+ "NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR"
			).split(" ")
			, file_ex_code = file_ex_codes.length
			, real_URL = view.URL || view.webkitURL || view
			, real_create_object_URL = real_URL.createObjectURL
			, real_revoke_object_URL = real_URL.revokeObjectURL
			, URL = real_URL
			, btoa = view.btoa
			, atob = view.atob

			, ArrayBuffer = view.ArrayBuffer
			, Uint8Array = view.Uint8Array

			, origin = /^[\w-]+:\/*\[?[\w\.:-]+\]?(?::[0-9]+)?/
		;
		FakeBlob.fake = FB_proto.fake = true;
		while (file_ex_code--) {
			FileException.prototype[file_ex_codes[file_ex_code]] = file_ex_code + 1;
		}
		// Polyfill URL
		if (!real_URL.createObjectURL) {
			URL = view.URL = function(uri) {
				var
					  uri_info = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
					, uri_origin
				;
				uri_info.href = uri;
				if (!("origin" in uri_info)) {
					if (uri_info.protocol.toLowerCase() === "data:") {
						uri_info.origin = null;
					} else {
						uri_origin = uri.match(origin);
						uri_info.origin = uri_origin && uri_origin[1];
					}
				}
				return uri_info;
			};
		}
		URL.createObjectURL = function(blob) {
			var
				  type = blob.type
				, data_URI_header
			;
			if (type === null) {
				type = "application/octet-stream";
			}
			if (blob instanceof FakeBlob) {
				data_URI_header = "data:" + type;
				if (blob.encoding === "base64") {
					return data_URI_header + ";base64," + blob.data;
				} else if (blob.encoding === "URI") {
					return data_URI_header + "," + decodeURIComponent(blob.data);
				} if (btoa) {
					return data_URI_header + ";base64," + btoa(blob.data);
				} else {
					return data_URI_header + "," + encodeURIComponent(blob.data);
				}
			} else if (real_create_object_URL) {
				return real_create_object_URL.call(real_URL, blob);
			}
		};
		URL.revokeObjectURL = function(object_URL) {
			if (object_URL.substring(0, 5) !== "data:" && real_revoke_object_URL) {
				real_revoke_object_URL.call(real_URL, object_URL);
			}
		};
		FBB_proto.append = function(data/*, endings*/) {
			var bb = this.data;
			// decode data to a binary string
			if (Uint8Array && (data instanceof ArrayBuffer || data instanceof Uint8Array)) {
				var
					  str = ""
					, buf = new Uint8Array(data)
					, i = 0
					, buf_len = buf.length
				;
				for (; i < buf_len; i++) {
					str += String.fromCharCode(buf[i]);
				}
				bb.push(str);
			} else if (get_class(data) === "Blob" || get_class(data) === "File") {
				if (FileReaderSync) {
					var fr = new FileReaderSync;
					bb.push(fr.readAsBinaryString(data));
				} else {
					// async FileReader won't work as BlobBuilder is sync
					throw new FileException("NOT_READABLE_ERR");
				}
			} else if (data instanceof FakeBlob) {
				if (data.encoding === "base64" && atob) {
					bb.push(atob(data.data));
				} else if (data.encoding === "URI") {
					bb.push(decodeURIComponent(data.data));
				} else if (data.encoding === "raw") {
					bb.push(data.data);
				}
			} else {
				if (typeof data !== "string") {
					data += ""; // convert unsupported types to strings
				}
				// decode UTF-16 to binary string
				bb.push(unescape(encodeURIComponent(data)));
			}
		};
		FBB_proto.getBlob = function(type) {
			if (!arguments.length) {
				type = null;
			}
			return new FakeBlob(this.data.join(""), type, "raw");
		};
		FBB_proto.toString = function() {
			return "[object BlobBuilder]";
		};
		FB_proto.slice = function(start, end, type) {
			var args = arguments.length;
			if (args < 3) {
				type = null;
			}
			return new FakeBlob(
				  this.data.slice(start, args > 1 ? end : this.data.length)
				, type
				, this.encoding
			);
		};
		FB_proto.toString = function() {
			return "[object Blob]";
		};
		FB_proto.close = function() {
			this.size = 0;
			delete this.data;
		};
		return FakeBlobBuilder;
	}(view));

	view.Blob = function(blobParts, options) {
		var type = options ? (options.type || "") : "";
		var builder = new BlobBuilder();
		if (blobParts) {
			for (var i = 0, len = blobParts.length; i < len; i++) {
				if (Uint8Array && blobParts[i] instanceof Uint8Array) {
					builder.append(blobParts[i].buffer);
				}
				else {
					builder.append(blobParts[i]);
				}
			}
		}
		var blob = builder.getBlob(type);
		if (!blob.slice && blob.webkitSlice) {
			blob.slice = blob.webkitSlice;
		}
		return blob;
	};

	var getPrototypeOf = Object.getPrototypeOf || function(object) {
		return object.__proto__;
	};
	view.Blob.prototype = getPrototypeOf(new view.Blob());
}(
	   typeof self !== "undefined" && self
	|| typeof window !== "undefined" && window
	|| this
));



var saveAs = saveAs || (function(view) {
	"use strict";
	// IE <10 is explicitly unsupported
	if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
		return;
	}
	var
		  doc = view.document
		  // only get URL when necessary in case Blob.js hasn't overridden it yet
		, get_URL = function() {
			return view.URL || view.webkitURL || view;
		}
		, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
		, can_use_save_link = "download" in save_link
		, click = function(node) {
			var event = new MouseEvent("click");
			node.dispatchEvent(event);
		}
		, is_safari = /constructor/i.test(view.HTMLElement) || view.safari
		, is_chrome_ios =/CriOS\/[\d]+/.test(navigator.userAgent)
		, setImmediate = view.setImmediate || view.setTimeout
		, throw_outside = function(ex) {
			setImmediate(function() {
				throw ex;
			}, 0);
		}
		, force_saveable_type = "application/octet-stream"
		// the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
		, arbitrary_revoke_timeout = 1000 * 40 // in ms
		, revoke = function(file) {
			var revoker = function() {
				if (typeof file === "string") { // file is an object URL
					get_URL().revokeObjectURL(file);
				} else { // file is a File
					file.remove();
				}
			};
			setTimeout(revoker, arbitrary_revoke_timeout);
		}
		, dispatch = function(filesaver, event_types, event) {
			event_types = [].concat(event_types);
			var i = event_types.length;
			while (i--) {
				var listener = filesaver["on" + event_types[i]];
				if (typeof listener === "function") {
					try {
						listener.call(filesaver, event || filesaver);
					} catch (ex) {
						throw_outside(ex);
					}
				}
			}
		}
		, auto_bom = function(blob) {
			// prepend BOM for UTF-8 XML and text/* types (including HTML)
			// note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
			if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
				return new Blob([String.fromCharCode(0xFEFF), blob], {type: blob.type});
			}
			return blob;
		}
		, FileSaver = function(blob, name, no_auto_bom) {
			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			// First try a.download, then web filesystem, then object URLs
			var
				  filesaver = this
				, type = blob.type
				, force = type === force_saveable_type
				, object_url
				, dispatch_all = function() {
					dispatch(filesaver, "writestart progress write writeend".split(" "));
				}
				// on any filesys errors revert to saving with object URLs
				, fs_error = function() {
					if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
						// Safari doesn't allow downloading of blob urls
						var reader = new FileReader();
						reader.onloadend = function() {
							var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
							var popup = view.open(url, '_blank');
							if(!popup) view.location.href = url;
							url=undefined; // release reference before dispatching
							filesaver.readyState = filesaver.DONE;
							dispatch_all();
						};
						reader.readAsDataURL(blob);
						filesaver.readyState = filesaver.INIT;
						return;
					}
					// don't create more object URLs than needed
					if (!object_url) {
						object_url = get_URL().createObjectURL(blob);
					}
					if (force) {
						view.location.href = object_url;
					} else {
						var opened = view.open(object_url, "_blank");
						if (!opened) {
							// Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
							view.location.href = object_url;
						}
					}
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
					revoke(object_url);
				}
			;
			filesaver.readyState = filesaver.INIT;

			if (can_use_save_link) {
				object_url = get_URL().createObjectURL(blob);
				setImmediate(function() {
					save_link.href = object_url;
					save_link.download = name;
					click(save_link);
					dispatch_all();
					revoke(object_url);
					filesaver.readyState = filesaver.DONE;
				}, 0);
				return;
			}

			fs_error();
		}
		, FS_proto = FileSaver.prototype
		, saveAs = function(blob, name, no_auto_bom) {
			return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
		}
	;

	// IE 10+ (native saveAs)
	if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
		return function(blob, name, no_auto_bom) {
			name = name || blob.name || "download";

			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			return navigator.msSaveOrOpenBlob(blob, name);
		};
	}

	// todo: detect chrome extensions & packaged apps
	//save_link.target = "_blank";

	FS_proto.abort = function(){};
	FS_proto.readyState = FS_proto.INIT = 0;
	FS_proto.WRITING = 1;
	FS_proto.DONE = 2;

	FS_proto.error =
	FS_proto.onwritestart =
	FS_proto.onprogress =
	FS_proto.onwrite =
	FS_proto.onabort =
	FS_proto.onerror =
	FS_proto.onwriteend =
		null;

	return saveAs;
}(
	   typeof self !== "undefined" && self
	|| typeof window !== "undefined" && window
	|| this
));
