	var AIRBOX = AIRBOX || {};

	/*------------------------------------------------------------------------
	 * 
	 * AIRBOX.core
	 * ----------
	 * AIRBOX.menu
	 * AIRBOX.logged
	 * AIRBOX.popinLng
	 * AIRBOX.popinAuth
	 * AIRBOX.fota
	 * ----------
	 * document.ready
	 * 
	 --------------------------------------------------------------------------*/

	/* -------------------------------------------------------------------------
	 class - core
     ----------------------------------------------------------------------------- */
	AIRBOX.core = (function() {
	    var settings = {
	        overEvent: (Modernizr.touch) ? 'click' : 'mouseover focusin', 
	        clickEvent: (Modernizr.touch) ? 'touchstart click' : 'click',
	        downEvent: (Modernizr.touch) ? 'touchstart' : 'mousedown',
	        upEvent: (Modernizr.touch) ? 'touchend' : 'mouseup',
	        moveEvent: (Modernizr.touch) ? 'touchmove' : 'mousemove',
	        isTouch: Modernizr.touch,
	        isIos: (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) != null) ? true : false,
	        $body: $("body"),
	        $header: $("header"),
	        $main: $("#main")
	    };

	    function init(options) {
	        $.extend(settings, options);
	        AIRBOX.menu.init({});
	        AIRBOX.popinLng.init();
	        AIRBOX.logged.init();
			AIRBOX.fota.init();
	        if (settings.$body.hasClass('index')) {
	            AIRBOX.popinAuth.init();
	            //AIRBOX.auth.init();
	        } else {
	            AIRBOX.slide.init({});
	            /*AIRBOX.sms.init();
				AIRBOX.connection.init();
				AIRBOX.usage.init();			
				AIRBOX.sharing.init();*/
	        }


	    };

	    return {
	        init: init,
	        settings: settings
	    };
	}());

	/* -------------------------------------------------------------------------
	 class - menu
     ----------------------------------------------------------------------------- */
	AIRBOX.menu = (function() {
	    var s = {
	            $btnLng: $('#linkLanguages'),
	            $btnMenu: $('#linkMenu'),
	            $btnStart: $('header nav li.start'),
	            $subLng: $('#languages'),
	            $subMenu: $('#menu'),
	            $PopinLng: $('#popin_languages'),
				$TopMenu:$("#TopMenu"),
				$linkTopMenu:$("#linkTopMenu"),
	            T_HEADER_HEIGHT: 90
	        },
	        cs = {},
	        $_win = $(window);

	    function init(options) {
	        $.extend(s, options);
	        cs = AIRBOX.core.settings;

	        $_win.on("resize.menu", _resize);
	        _resize();

	        _initOver();
	        _initClickPopinLng();
	        _initMenuLngList();
	        _initPopinLngList();
			_initTopMenu();
			_initLanMenu();
			_helpMuneHide();
	        if (!cs.isTouch) _initOut();
	    };

	    function _initOver() {
	        s.$btnLng.on(cs.overEvent, function(e) {
	            e.preventDefault();

	            if (!s.$btnLng.hasClass("on")) {
	                _hideSubMenu();
	                s.$btnLng.addClass("on");
	                s.$subLng.fadeIn(100);
	            } else
	                _hideSubMenu();

	        });

	        s.$btnMenu.on(cs.overEvent, function(e) {
	            e.preventDefault();

	            if (!s.$btnMenu.hasClass("on")) {
	                _hideSubMenu();
	                cs.$header.css({
	                    'z-index': 99
	                });
	                //s.$btnMenu.addClass("on");
	                s.$subMenu.fadeIn(100);
	            } else
	                _hideSubMenu();

	        });

	        s.$btnStart.on(cs.overEvent, function(e) {
	            e.preventDefault();
	            _hideSubMenu();
	        });

	        if (!cs.isTouch) {
	            $("#container", cs.$main).on(cs.overEvent, function(e) {
	                e.preventDefault();
	                _hideSubMenu();
	            });
	        }

	    };

	    function _initOut() {
	        s.$subLng.on("mouseleave", function(e) {
	            e.preventDefault();
	            _hideSubMenu()
	        });

	        s.$subMenu.on("mouseleave", function(e) {
	            e.preventDefault();
	            _hideSubMenu();
	        });
	    };

	    function _initClickPopinLng() {
	        $("li.lng a", s.$subMenu).on(cs.clickEvent, function(event) {
	            event.preventDefault();
	            _hideSubMenu();
	            AIRBOX.popinLng.show();
	        });
	    };

	    function _initMenuLngList() {	        
	        var subLng_HtmlStr = "<ul>";
	        $.each(sys_language, function(index, val) {
				if(index == language){
					s.$btnLng.html(val);
				}
	            subLng_HtmlStr += "<li><a>" + val + "</a></li>"
	        });
	        s.$subLng.html(subLng_HtmlStr + "</ul>")

	    };

	    function _initPopinLngList() {
	        var subLng_HtmlStr = "<ul>";
	        $.each(sys_language, function(index, val) {
	            if (index == language) {
	                subLng_HtmlStr += "<li><a class=\"on\">" + val + "</a></li>"
	            } else {
	                subLng_HtmlStr += "<li><a>" + val + "</a></li>"
	            }

	        });
	        s.$PopinLng.html(subLng_HtmlStr + "</ul>")

	    };
		function _initTopMenu(){
				 s.$linkTopMenu.on("click", function(event) {
	             	s.$TopMenu.css({
								 "display":"block"
								 });
					event.stopPropagation();
	       		 });
				$(window).on("click",function(){
								s.$TopMenu.css({
								 "display":"none"
								 });  
				})

			};
			function _initLanMenu(){
					$("#linkLanguages-lan").on("click",function(){
							$("#popinLng").removeClass("hidden");									 
					}); 
			};
		

	    function _hideSubMenu() {
	        s.$subMenu.hide();
	        s.$subLng.hide();
	        s.$btnMenu.removeClass("on");
	        s.$btnLng.removeClass("on");
	        cs.$header.css({
	            'z-index': 10
	        });
	    };
		function _helpMuneHide(){
				if(cs.isIos){
						$(".btn_help").parent("li").addClass("hidden");
					}else{
						$(".btn_help").parent("li").removeClass("hidden");
						}
			};

	    function _resize() {
	        /*
			var l = s.$btnMenu.offset().left + (s.$btnMenu.width()/2 - s.$subMenu.width()/2);
			s.$subMenu.css({left : l+"px" });

			var l2 = s.$btnLng.offset().left + (s.$btnLng.width()/2 - s.$subLng.width()/2);
			s.$subLng.css({left : l2+"px" });
			*/
	        if (!cs.isTouch) {
	            if (cs.$body.hasClass("home")) {
	                var h = $_win.height() * 0.2;
	                cs.$header.css({
	                    height: h + "px"
	                });
	            };
	        } else {
	            cs.$header.css({
	                //height: s.T_HEADER_HEIGHT + "px"
	            });
	        }
	    };

	    return {
	        init: init,
	        hide: _hideSubMenu
	    };
	}())

	/* -------------------------------------------------------------------------
	 class - popin auth
     ----------------------------------------------------------------------------- */
	 AIRBOX.popinAuth = (function() {
	    var s = {
	            $content: $('#popinAuth'),
	            $error: $('#popinAuth p.alert'),
	            $cache: $('#popinAuth .cache'),
	            URL_SUBMIT: '',
	            message: '',
	            callback: null,
	            url: ''
	        },
	        $_win = $(window),
	        cs = {};

	    function init(options) {
	        $.extend(s, options);
	        cs = AIRBOX.core.settings;

	        _initClose();
	        //_initForm();
	        _initContentEvent()
	    };

	    function _initClose() {
	        $('span.close', s.$content).on('click', function(event) {
	            event.preventDefault();
	            _hide();
	        });

	        s.$cache.on('click', function(event) {
	            event.preventDefault();
	            _hide();
	        });
	    };

	    function _show(options) {
	        $.extend(s, options);
	        if (s.message != "undefined") {
	            $("p.error", s.$content).text(s.message);
	        }

	        s.$content.removeClass("hidden");

	    };

	    function _hide() {
	        s.$content.addClass("hidden");
	        $("input[type=password]").val("");
	    };

	    function _initContentEvent() {
	        _initLoginFormEvent();
	        _initPinForm();
	        _initPukForm();
	        _initSimlockForm();

	        s.$error.html("").hide(0);
	    }

	    function _initLoginFormEvent() {
	        var $loginBtn = $("#f_submit_login");

	        $loginBtn.on("click", function(event) {
	            event.preventDefault();
	            _loginEvent();
	        }); /*add event to login button*/
	    }

	    function _initPinForm() {
	        var $pinBtn = $("#btnPinApply");
	        var $pinTimes = $("#spnPinTime");

	        $pinBtn.on("click", function(event) {
	            event.preventDefault();
	            _applyPinEvent();
	        }); /*add event to pin button*/

	        $pinTimes.html(simInfo.PinRemainingTimes);
			
		if(autoPinStatus == SIM_AUTO_PIN_DISABLE){			
			$("#chkAutoPin").attr("checked",false)
		}else{
			$("#chkAutoPin").attr("checked",true);
		}
			
	    }

	    function _applyPinEvent() {
	        var pinVal = $.trim($("#iptPinCode").val());

	        var chkAutoPinChecked = $("#chkAutoPin").attr("checked");
	        var chkAutoPinVal = chkAutoPinChecked ? 1 : 0;

	        if (false == validatePin(pinVal)) {
	            s.$error.html(sys.getRes("ids_sim_pinRule")).removeClass("hidden");
	            _errorEvernt($("#iptPinCode"));
	            return false;
	        }

	        var result = SDK.SIM.UnlockPin(pinVal);
	        if (result == SIM_UNLOCK_PIN_SUCCESS) {
	            if (chkAutoPinVal) {
	                pageInitSimCard(1);
	            } else {
	                pageInitSimCard(0);
	            }
	        } else if (result == SIM_UNLOCK_PIN_FAILED) {
	            simInfo = SDK.SIM.GetSimStatus();

	            if (simInfo.PinState == MACRO_UIM_PIN_STATE_BLOCKED) {

	                $("#spnPukTime").html(simInfo.PukRemainingTimes);

	                $('.pin_wrap').addClass('hidden');

	                $('.puk_wrap').removeClass('hidden');

	            } else {
	                $("#iptPinCode").val("");
	                $("#spnPinTime").html(simInfo.PinRemainingTimes);
	                s.$error.html(sys.getRes("ids_fail")).removeClass("hidden");
	                _errorEvernt($("#iptPinCode"));
	            }
	        } else {
	            s.$error.html(sys.getRes("ids_sim_pinRule")).removeClass("hidden");
	            _errorEvernt($("#iptPinCode"));
	            return false;
	        }
	    }

	    function _initPukForm() {
	        var $pukBtn = $("#btnPukApply");
	        var $pukTimes = $("#spnPukTime");

	        $pukBtn.on("click", function(event) {
	            event.preventDefault();
	            _applyPukEvent();
	        }); /*add event to puk button*/

	        $pukTimes.html(simInfo.PukRemainingTimes);
	    }

	    function _applyPukEvent() {
	        var pukVal = $.trim($("#iptPukCode").val());
	        var pinNewVal = $.trim($("#iptNewPin").val());
	        var pinConfirmVal = $.trim($("#iptConPin").val());

	        if (false == validatePuk(pukVal)) {
	            s.$error.html(sys.getRes("ids_sim_pukRule")).removeClass("hidden");
	            _errorEvernt($("#iptPukCode"));

	            return false;
	        }

	        if (false == validatePin(pinNewVal)) {
	            s.$error.html(sys.getRes("ids_sim_newPinRule")).removeClass("hidden");
	            _errorEvernt($("#iptNewPin"));

	            return false;
	        }

	        if (false == validatePin(pinConfirmVal)) {
	            s.$error.html(sys.getRes("ids_sim_comfirmPinRule")).removeClass("hidden");
	            _errorEvernt($("#iptConPin"));

	            return false;
	        }

	        if (pinNewVal != pinConfirmVal) {
	            s.$error.html(sys.getRes("ids_sim_pinConfirmed")).removeClass("hidden");
	            _errorEvernt($("#iptConPin"));
	            _errorEvernt($("#iptNewPin"));

	            return false;
	        }

	        var result = SDK.SIM.UnlockPuk(pukVal, pinNewVal);

	        if (result == SIM_UNLOCK_PUK_SUCCESS) {
	            pageInitSimCard(3);
	        } else {
	            $("#iptConPin, #iptNewPin, #iptPukCode").val("");
	            $("#spnPukTime").html(SDK.SIM.GetSimStatus().PukRemainingTimes);

	            s.$error.html(sys.getRes("ids_fail")).removeClass("hidden");
	            _errorEvernt($("#iptPukCode"));
	        }
	    }

	    function _initSimlockForm() {

	        var $simlockBtn = $("#btnSimlockApply");
	        var $simlockTimes = $("#spnSimlockTime");

	        $simlockBtn.on("click", function(event) {
	            event.preventDefault();
	            _applySimlockEvent();
	        }); /*add event to sim lock button*/

	        $simlockTimes.html(simInfo.SIMLockRemainingTimes);
	        $("#labSimlockState").html(simlock_state_str(simInfo.SIMLockState));
	    }

	    function _applySimlockEvent() {

	        var simLockVal = $("#iptSimlockCode").val();

	        if (false == validateSimlock(simLockVal)) {
	            s.$error.html(sys.getRes("ids_sim_lockCodeRule")).removeClass("hidden");
	            _errorEvernt($("#iptSimlockCode"));

	            return false;
	        }

	        var result = SDK.SIM.UnlockSimlock(simInfo.SIMLockState, simLockVal);
			
			if (result == API_RESULT_SUCCESS) {
				startLoading();	
				initSimCard(function(){
					 stopLoading();
					var _url = s.url ==null?"/index.html":s.url;
					window.location.href = _url; 
				});
				
				
			} else {
	            simInfo = SDK.SIM.GetSimStatus();

	            if (simInfo.SIMLockState == SIMLOCK_PERSO_RCK_FORBID) {
	                _submitForm();
	                window.location.href = s.url;
	            } else {
					
		    	$("#iptSimlockCode").val("");
	                $("#spnSimlockTime").html(simInfo.SIMLockRemainingTimes);
	                $("#labSimlockState").html(simlock_state_str(simInfo.SIMLockState));

	                s.$error.html(sys.getRes("ids_fail")).removeClass("hidden");
	                _errorEvernt($("#iptSimlockCode"));
	            }
	        }
	    }

	    function _loginEvent() {
	    	s.$error.html("");
	        var $f_username = $("input[name='f_username']");
	        var $f_password = $("input[name='f_password']");
	        var usernameVal = $.trim($f_username.val());
	        var passwordVal = $.trim($f_password.val());

	        if (passwordVal == "") {
	            s.$error.html(sys.getRes("ids_login_inputPwd")).removeClass("hidden");
	            _errorEvernt($f_password);
	            return;
	        }

	        var result = SDK.User.Login("admin", passwordVal);

	        switch (result) {
	            case LOGIN_STATE_SUCCESS:
	                if ((simInfo.SIMState == MACRO_UIM_STATE_PIN1_OR_UPIN_REQ) ||
	                    (simInfo.SIMState == MACRO_UIM_STATE_PUK1_OR_PUK_REQ) ||
	                    ((simInfo.SIMState == MACRO_UIM_STATE_PERSON_CHECK_REQ) && (simInfo.SIMLockState!=SIMLOCK_PERSO_RCK_FORBID))) {

	                    sessionId = SDK.User.GetLoginState();
	                    AIRBOX.logged.init();
	                    listenLogout.flushed();
	                    listenLogout.init();
	                    show_simcard_status();
	                } else {
	                    _submitForm();
	                    var _url = s.url ==null?"/index.html":s.url;
	                    window.location.href = _url;
	                }

	                break;
	            case LOGIN_STATE_PASSWORD_WRONG:
	                s.$error.html(sys.getRes("ids_login_wrongPwd")).removeClass("hidden");
	                $f_password.val("");
	                break;
	            case LOGIN_STATE_SOME_ONE_LOGINED:
	                s.$error.html(sys.getRes("ids_login_otherLogin")).removeClass("hidden");
	                break;
	            case LOGIN_STATE_LOGIN_TIMES_USEDOUT:
	                s.$error.html(sys.getRes("ids_login_timeuseout")).removeClass("hidden");
	                break;
	            default:
	                break;
	        }

	        _errorEvernt($f_password);
	    }

	    function show_simcard_status() {
	        if (simInfo.SIMState == MACRO_UIM_STATE_PUK1_OR_PUK_REQ) {
	            $('.puk_wrap').removeClass('hidden');
	        } else if (simInfo.SIMState == MACRO_UIM_STATE_PERSON_CHECK_REQ) {
	            $('.simlock_wrap').removeClass('hidden');
	        } else {
	            $('.pin_wrap').removeClass('hidden');
	        }

	        $('.login_wrap').addClass('hidden');
	    }

	    function pageInitSimCard(auto_pin_flag) {
	        startLoading();
	        initSimCard(function() {
	            var result = SDK.SIM.GetSimStatus();

	            if ((result.SIMState == MACRO_UIM_STATE_READY) || (result.SIMState == MACRO_UIM_STATE_PIN1_PERM_BLOCKED)) {
	                if ((auto_pin_flag == 1 || auto_pin_flag == 0)&&(result.SIMState == MACRO_UIM_STATE_READY)) {
	                    SDK.SIM.SetAutoEnterPinState(auto_pin_flag, $.trim($("#iptPinCode").val()));
	                }
	                stopLoading();
	                _submitForm();
	                window.location.href = s.url;	
				} else {
					stopLoading();

					if((result.SIMState == MACRO_UIM_STATE_PERSON_CHECK_REQ) && (result.SIMLockState == SIMLOCK_PERSO_RCK_FORBID))
					{
						_submitForm();
						window.location.href = s.url;
					}else{		   

						$("#spnSimlockTime").html(result.SIMLockRemainingTimes);
						$("#labSimlockState").html(simlock_state_str(result.SIMLockState));

						$('.pin_wrap').addClass('hidden');
						$('.puk_wrap').addClass('hidden');
						$('.simlock_wrap').removeClass('hidden');
					}
				}
	        });
	    }

	    function _submitForm() {
	        s.$content.fadeOut(150);
	        AIRBOX.logged.init();
	        _hide();

	        var getType = {};

	        if (s.callback && getType.toString.call(s.callback) === '[object Function]') s.callback();
	    }

	    function _errorEvernt(id) {
	        id.on("keypress", function(event) {
	            s.$error.html("").addClass("hidden");
	        })
	    }

	    return {
	        init: init,
	        show: _show
	    };
	}())
	 
/* -------------------------------------------------------------------------
	 class - airbox fota
     ----------------------------------------------------------------------------- */
	 AIRBOX.fota = (function() {
	    var s = {
			   $content:$(".item-update")
			},
	        cs = {};

	    function init(options) {
	        $.extend(s, options);
	        cs = AIRBOX.core.settings;
			initUpdateClickEvents();
			//showFotaMainThread(connectionState);
	    };
		
		function initUpdateClickEvents (){
			$("#downloadImg").off().on(cs.clickEvent, function(event) {
				cf.moveToIndex(getIndexByPageUrl("#more/update.html"));
				setTimeout(function(){
					page.changePage("#more/update.html");
				},500);
			});	
			$("#btnStartUpdate").off().on(cs.clickEvent, function(event) {
				showConfirmUpdate();
		    });	
			$("#btnStopUpdate").off().on(cs.clickEvent, function(event) {
				stopDownloadFOTA();
			});
		}
		
		function showFotaMainThread(iwanState){
			if(iwanState == MACRO_PPP_CONNECTED){
				startCheckUpgradeState();
			}else{
				Fotabox.noNewVersion();
			}
		}

		function showVersionInfo(){
			if(versionState == null || versionState == VERSION_NO_SERVICE || versionState == VERSION_CHECK_ERROR){
				  var result = SDK.Update.SetCheckNewVersion();
				  if(result==API_RESULT_SUCCESS){
					  versionInfo = SDK.Update.GetDeviceNewVersion();
				  }else{
					  versionInfo = {State : VERSION_CHECK_ERROR,Version:""}				
				  }	
			}else if( versionState == VERSION_CHECKING){
				versionInfo = SDK.Update.GetDeviceNewVersion();
			}			
			if(versionInfo&&versionInfo!=null){
				versionState = versionInfo.State;
				NewVersionNum = versionInfo.Version;	
			}
			
			if(versionState == VERSION_CHECKING){
				 isFotaCheckEnd =false;	
				 Fotabox.noNewVersion();
				 return;	
			}
			if(versionState == VERSION_NEW_NO){
				Fotabox.noNewVersion();
				isFotaCheckEnd = true;
				return;
			}
			if(versionState == VERSION_NEW_YES){
				 isFotaCheckEnd =true;
				 Fotabox.haveVersion();	
				 return;
			}
		}
		
		function downLoadImageHover(){
			$(".downloadImg").hover(function(){
				$(".tooltipImg,.tooltip-arrow").css("display","block");
				$(".tooltipImg").html(sys.getRes("ids_fota_haveNewVersion"));				
			},function(){
				$(this).find(".tooltipImg,.tooltip-arrow").stop(true,true).hide();
			});
		}
		
		function startCheckUpgradeState(){
			UpgradeInfo = SDK.Update.GetDeviceUpgradeState();
			FOTADownloadState = UpgradeInfo.Status;			
			downloadProcess = UpgradeInfo.Process;
			if(FOTADownloadState == FOTA_DOWNLOAD_STATE_COMPLETED){
				Fotabox.Upgrading();	
			}else if(FOTADownloadState == FOTA_DOWNLOAD_STATE_DOWNLOADING){
				listenLogout.stop(); 
				showDownloadFOTABox();
			}else if(FOTADownloadState == FOTA_DOWNLOAD_STATE_FREE){	
					showVersionInfo();
			}else{
				sys.alert("ids_error");
			}		
		}
		
		function showDownloadFOTABox(){	
			Fotabox.Downloading();
			showFOTADownloadProcess();
		}
		
		function showFOTADownloadProcess(){
			if(FOTADownloadState==FOTA_DOWNLOAD_STATE_COMPLETED){
				$("#spnDownloadProcess").html("100%");			
				Fotabox.Upgrading();	
			}else if(FOTADownloadState==FOTA_DOWNLOAD_STATE_DOWNLOADING){
				$("#spnDownloadProcess").html(downloadProcess+"%");
			}else{
				 Fotabox.haveVersion();		
			}
		}
		
		function startDownloadFOTA(){
			var result = SDK.Update.SetDeviceStartUpdate();
			if(result==API_RESULT_SUCCESS){				 
				startCheckUpgradeState();				
			}else{
			  sys.alert("ids_error");
			}			
		}
		
		function stopDownloadFOTA(){
			var result = SDK.Update.SetDeviceUpdateStop();
			if(result==API_RESULT_SUCCESS){
				listenLogout.start();  
				Fotabox.haveVersion();	
				startCheckUpgradeState();				
			}else{
			  sys.alert("ids_error");
			}		
		}
		
		function showConfirmUpdate(){			
			if(batteryState==FOTA_BATTERY_STATE_ENOUGH){
				startDownloadFOTA();
			}else{
				sys.alert("ids_fota_batteryTips");
			}
		}

		var Fotabox ={
			checkVersion:function (){
			sys.prompt('<div id="showVersionInfoDiv">' + sys.getRes("ids_fota_checking") + '</div>', -1);
			},
			
			Downloading:function (){
				 $("#fotaDownloading,.downloadImg").css("display","block");		
				 $("#noNewVersion,#haveVersion").css("display","none");
				 downLoadImageHover();
				 $(".NewVersionNum").html(NewVersionNum);
				 var BAR_WIDTH = $("div.bar",$("#more")).width();
				 $("div.progress",$("#more")).css("width",downloadProcess/100* BAR_WIDTH+"px");
			},
			
			haveVersion:function (){
				 $("#noNewVersion,#fotaDownloading").css("display","none");		
				 $(".downloadImg,#haveVersion").css("display","block");	
				 downLoadImageHover();
				 $(".downloadImg,#downloadProces").css("cursor","pointer");				
			     $(".NewVersionNum").html(NewVersionNum);				
			},			
			
			Upgrading:function (){	
			    initProgressBar($("article#more"),1);	
				popUp.showBox('<div id="showLoadingDiv">' + sys.getRes("ids_fota_upgrading") + '<div style="color: red;">' + sys.getRes("ids_fota_upgradingTips") + '</div></div>');
				$("#popUpTitle").html(sys.getRes("ids_fota_updateTitle"));
			},
			hide:function(){
				popUp.hide();
			},
			noNewVersion:function(){
				$(".downloadImg,#haveVersion,#fotaDownloading").css("display","none");		
				$("#noNewVersion").css("display","block");
				$("#CurrVersionNum").html(versionNum);
			}
		}		
		
	    return {
	        init: init,
			showFotaMainThread: showFotaMainThread,
			initUpdateClickEvents:initUpdateClickEvents
	    };
	}())

	/* -------------------------------------------------------------------------
	 class - airbox when logged
     ----------------------------------------------------------------------------- */
	 AIRBOX.logged = (function() {
	    var s = {},
	        cs = {};

	    function init(options) {
	        $.extend(s, options);
	        cs = AIRBOX.core.settings;
	        $("#logout").on(cs.clickEvent, function(event) {
	            event.preventDefault();
	            logoutEvent();
	        });
			$("#logoutLan").on("click",function(event){
				 event.preventDefault();
				 logoutEvent();						  
			});

	        $("#login").on(cs.clickEvent, function(event) {
	            event.preventDefault();
	            logintEvent();
	            $("#f_password").focus();
	        });
	        


	        if (sys.isLogin(sessionId)) {
	            _logIn();
	        } else {
	            _logOut();
	        }
	    };

	    function logoutEvent() {
	        if (API_RESULT_SUCCESS == SDK.User.Logout())
	            location.reload();
	    }

	    function logintEvent() {

	        var o = {
	            'message': $(this).attr('title'),
	            'url': null
	        };

	        AIRBOX.popinAuth.show(o);
	    }

	    function _logIn() {
	        $('.guest').addClass('hidden');
	        $('.logged').removeClass('hidden');
	        $('.logouted').addClass('hidden');

	    }

	    function _logOut() {
	        $('.guest').removeClass('hidden'); //hal can delete
	        $('.logged').addClass('hidden');
	        $('.logouted').removeClass('hidden');
	    }

	    return {
	        init: init
	    };
	}())


	/* -------------------------------------------------------------------------
	 class - popin Languages
     ----------------------------------------------------------------------------- */
	 AIRBOX.popinLng = (function() {
	    var s = {
	            $popin: $('#popinLng'),
	            $cache: $('#popinLng .cache')
	        },
	        cs = {};

	    function init(options) {
	        $.extend(s, options);
	        cs = AIRBOX.core.settings;

	        _initClose();
	    };

	    function _show(options) {
	        $.extend(s, options);
	        s.$popin.removeClass("hidden");
	    };

	    function _hide() {
	        s.$popin.addClass("hidden");
	        s.$cache.off();
	    };

	    function _initClose() {
	        s.$cache.on('click', function(event) {
	            event.preventDefault();
	            _hide();
	        });
	    };

	    return {
	        init: init,
	        show: _show,
	        hide: _hide
	    };
	}())

	/* -------------------------------------------------------------------------
	 READY
     ----------------------------------------------------------------------------- */
	 $(window).ready(function() {
	    document.title = titleValue;
	    if ($(window).width() < 320)
	        $('head').append('<meta name="viewport" content="initial-scale=0.75, minimum-scale=0.75, maximum-scale=0.75, user-scalable=no">');

	    AIRBOX.core.init({});
	});

	/* -------------------------------------------------------------------------
	 LANGUAGE EVENTS
     ----------------------------------------------------------------------------- */
	$(document).ready(function() {

	    $("#languages ul li a").click(function(event) {
	        event.preventDefault();
	        var currentLang = this.innerHTML;
	        $.each(sys_language, function(index, val) {
	            if (val == currentLang) {
	                language = index;
	            }
	        });
	        $("a.navigation#linkLanguages")[0].innerHTML = language;
	        AIRBOX.menu.hide();
	        setLanguageEvent(language);
	    });

	    $("#popinLng .popin ul li a").click(function(event) {
	        event.preventDefault();
	        var currentLang = this.innerHTML;
	        $.each(sys_language, function(index, val) {
	            if (val == currentLang) {
	                language = index;
	            }
	        });
	        $("#popinLng .popin ul li a").removeClass('on');
	        $(this).addClass('on');
	        $("a.navigation#linkLanguages")[0].innerHTML = language;
	        AIRBOX.popinLng.hide();
	        setLanguageEvent(language);
	    });

	});


	function setLanguageEvent(languageID) {
	    var result = SDK.System.SetLanguage(languageID);

	    if (result == API_RESULT_SUCCESS) {
	        location.reload();
	    } else {
	        sys.alert("ids_fail");
	    }
	}

	function simlock_state_str(simlockStatus) {
	    var simLockStateStr;
	    switch (simlockStatus) {
	        case SIMLOCK_PERSO_NET_PIN_REQUIRED:
	            simLockStateStr = sys.getRes("ids_sim_nck") + ":";
	            break;
	        case SIMLOCK_PERSO_NETSUB_PIN_REQUIRED:
	            simLockStateStr = sys.getRes("ids_sim_nsck") + ":"
	            break;
	        case SIMLOCK_PERSO_SP_PIN_REQUIRED:
	            simLockStateStr = sys.getRes("ids_sim_spck") + ":"
	            break;
	        case SIMLOCK_PERSO_CORP_PIN_REQUIRED:
	            simLockStateStr = sys.getRes("ids_sim_cck") + ":";
	            break;
	        case SIMLOCK_PERSO_PH_FSIM_PIN_REQUIRED:
	            simLockStateStr = sys.getRes("ids_sim_pck") + ":";
	            break;
	        case SIMLOCK_PERSO_NET_PUK_REQUIRED:
	        case SIMLOCK_PERSO_NETSUB_PUK_REQUIRED:
	        case SIMLOCK_PERSO_SP_PUK_REQUIRED:
	        case SIMLOCK_PERSO_CORP_PUK_REQUIRED:
	        case SIMLOCK_PERSO_PH_FSIM_PUK_REQUIRED:
	            simLockStateStr = sys.getRes("ids_sim_rck") + ":";
	            break;
	        default:
	            break;
	    }

	    return simLockStateStr;
	}

	function initSimCard(callback) {

	    SDK.requestJsonRpcAsync("GetSimStatus", null, "2.1", function(data) {

	        if (data != null && !data.hasOwnProperty("error")) {

				if (data.SIMState == MACRO_UIM_STATE_INITING) {
					setTimeout(function() {
					initSimCard(callback);
					}, 1000);
				} else {
					if(data.SIMState == MACRO_UIM_STATE_READY){
						initSMSStatus(callback);
					}else{
						callback();
					}
				}

	        } else {
	            callback(); // SaveSms SMS failed
	        }
	    });

	}
	
    function initSMSStatus(callback) {	 
	    SDK.requestJsonRpcAsync("GetSMSInitStatus", null, "6.1", function(data) {
	        if (data != null && !data.hasOwnProperty("error")) {
	            if (data.Status == SMS_INIT_STATUS_INITING) {
	                setTimeout(function() {
	                    initSMSStatus(callback);
	                }, 1000);
	            } else {				   
	                callback();//SMS Inited
	            }
	        } else {
	            callback(); // Get SMS Init Status failed
	        }
	    });
	}
	
	function startLoading() {
	    if (!(!($.browser.msie && ($.browser.version == "6.0") && !$.support.style))) {
	        $("#mask,#loading").css({
	            height: $("#wrap").height()
	        });
	    }
	    $("#mask,#loading").css({
	        display: "block"
	    });
	    $("#mask").css({
	        opacity: 0.01
	    })

	}

	function stopLoading() {
	    $("#mask,#loading").css("display", "none");
	}


	//UM download
	$(function($){
		$(".btn_help").off("click").on("click",function(){
			var language = SDK.System.GetLanguage();
			$(".help-iframe").empty().remove();
			$("body").append("<iframe class='help-iframe' src='/help/USER_Manual_"+language+".pdf' style='display: none'></iframe>");
			setTimeout(function(){
				location.reload();
			}, 100)
		})
	})
	/***************end*******************/
