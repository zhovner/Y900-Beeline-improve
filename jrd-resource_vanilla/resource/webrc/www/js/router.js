/**
 * @module router
 * @class router
 */
define([
    'config/menu',
    'jquery',
    'config/config',
    'service',
    'underscore'],
function(menu, $, config, service,_) {
	var currentHash = '';
	var container = $('#container');
    var _otaUpdateCancelFlag = false;

    /**
     * 默认入口页面为#home, 定时检查hash状态
     * @method init
     */
	function init() {
		//checkSimCardStatus();
		listenLogout.init();
		listenLogout.flushed();
		window.location.hash = window.location.hash || config.defaultRoute;
        //if support onhashchange then use. If ie8 in ie7 mode, it doesn't trigger onhashchange.
        if(('onhashchange' in window) && ((typeof document.documentMode==='undefined') || document.documentMode==8)) {
            window.onhashchange = hashCheck;
            hashCheck();
        } else {
            setInterval(hashCheck, 200);
        }

        //如果修改了页面内容, 离开时给出提示
        $("a[href^='#']").die('click').live('click', function() {
            var $this = $(this);
            config.CONTENT_MODIFIED.checkChangMethod();
            return checkFormContentModify($this.attr('href'));
        });
	}
	
	var listenLogout = {
		init: function(){
			var that = this;
			that.start();
			that.listenObj($("#mainBody-fluid"));
			that.heartbeat();
		},
			
		logoutMethod: null,
			
		start: function(){
			var that=this;
			if(that.logoutMethod != null){
				that.stop();
			}
			that.logoutMethod = setTimeout(function(){
				  that.logout();
			},360000);
		},
			
		stop: function(){
			var that=this;
			if(that.logoutMethod != null){
				clearTimeout(that.logoutMethod);
				that.logoutMethod = null;
			}
		},
			
		listenObj: function(DomObject){
			var that=this;
			DomObject.live("keydown touchstart",function(){
				that.stop();
			});
		
			DomObject.live('keyup touchend click', function(){
				that.start();
			});
		},
		
		flushed: function(){
			$.ajax({
				type: "GET",
				url: "/heartBeat.asp?rand=" + Math.random()  
			});
		},
		
		heartbeat: function(){
			var that=this;
			setInterval(function(){
				that.flushed();
			}, 10000);
		},
		
		logout: function () {
			service.logout({}, function(){
                       showAlert('need_login_again', function () {
                        window.location = "index.html";
                    });
            });
     	}
	};
	
    checkFormContentModify = function(href){
        if(config.CONTENT_MODIFIED.modified && window.location.hash != href) {
            if(config.CONTENT_MODIFIED.message == 'sms_to_save_draft'){
                config.CONTENT_MODIFIED.callback.ok(config.CONTENT_MODIFIED.data);
                config.resetContentModifyValue();
                window.location.hash = href;
            } else {
                showConfirm(config.CONTENT_MODIFIED.message, {ok: function() {
                    config.CONTENT_MODIFIED.callback.ok(config.CONTENT_MODIFIED.data);
                    config.resetContentModifyValue();
                    window.location.hash = href;
                }, no: function(){
                    var result = config.CONTENT_MODIFIED.callback.no(config.CONTENT_MODIFIED.data);
                    if(!result) {
                        window.location.hash = href;
                        config.resetContentModifyValue();
                    }
                }});
            }
            return false;
        } else {
            return true;
        }
    }

    /**
     * 定时查看SIM卡的状态，若当前SIM卡状态不为就绪状态且未显示
     * nosimcard页面，则显示nosimcard页面
     * 以避免不关闭webui，重新插拔设备后，不再判断SIM卡状态的问题
     * @method checkSimCardStatus
     */
    function checkSimCardStatus(){
        setInterval(function(){
           var data = {};//service.getStatusInfo();
		   var simInfo = service.getLoginData();
		   data.simStatus = simInfo.modem_main_state;	
		   loginStatus = service.getLoginStatus();
		   
            var match = menu.findMenu();
            if(match.length == 0){
                return false;
            }
            var requirePinHash = ["phonebook/phonebook", "sms/smslist"];
            var isRequirePin = ($.inArray(match[0].path, requirePinHash) != -1);
            if (match[0].checkSIMStatus === true) {
                var simstatus = data.simStatus == "modem_sim_undetected"
                    || data.simStatus == "modem_sim_destroy" || data.simStatus == "modem_waitpin"
                    || data.simStatus == "modem_waitpuk";
                var netlockstatus = data.simStatus == "modem_imsi_waitnck";
                if (/*data.isLoggedIn*/(loginStatus.status == "loggedIn") && (
                        ($('#div-nosimcard')[0] == undefined && simstatus)
                        || ($('#div-network-lock')[0] == undefined && netlockstatus)
                    ||(($('#div-nosimcard')[0] != undefined || $('#div-network-lock')[0] != undefined)&&data.simStatus == "modem_init_complete"))
                    ) {
                    fixedLoadResources(match[0], data.simStatus, isRequirePin);
                }
            }
        }, 1000);
    }

	/**
	 * 检查登录页面背景
	 * @method checkLoginPageBg
	 */
	function checkLoginPageBg(){
        var h = window.location.hash;
        if (h == '#login' || _.indexOf(config.GUEST_HASH, h) != -1) {
           $("#themeContainer").attr("style","margin-top:-36px;");
           $("#language").attr("style","width: 80px; margin-top: 65px; position: absolute; right: 0px;");
        }else{
           $("#themeContainer").attr("style","margin-top:0px;");
           $("#language").attr("style","margin-top: 0px; position: absolute; right: 0px; padding-top: 30px;");
        }

        if (h == '#home'){
            $("#statusBar").attr("style","margin-top:-70px; float: right; width: 340px;");
            $("#container_span9").attr("style", "margin-left:3px");
        }else{
            $("#statusBar").attr("style","margin-top:-70px; float: right; width: 340px;");
            $("#container_span9").attr("style", "margin-left:3px");
        }

		if(window.location.hash == '#login'){
			$("#mainContainer").addClass('loginBackgroundBlue');
		} else {
			var mainContainer = $("#mainContainer");
            $("#mainBody-fluid").attr("style","padding-top:30px;");
			if(mainContainer.hasClass('loginBackgroundBlue')){
				$("#container").css({margin: 0});
				mainContainer.removeClass('loginBackgroundBlue').height('auto');
			}
			/*
			//页面高度自适应，是footer位于页面底部
			var windowH = window.innerHeight;
			var statusH = $("#topStatus").outerHeight(true);
			var navH = $("#nav").outerHeight(true);
			var footerH = $("#footer").outerHeight(true);
			var containerHeight = windowH - statusH - navH - footerH - mainContainer.outerHeight();
			if(containerHeight > 0){
				var h = windowH - statusH - navH - footerH - 5;
				mainContainer.height(h + 'px');
			}
			*/
		}
	}

    /**
     * 比对hash状态, 如果变化则根据新的hash匹配菜单配置,
     * 匹配不上时跳转到home页面, 匹配上时记录hash值并动态加载
     * 对应的资源文件
     * @method hashCheck
     */
    function hashCheck() {
		if(window.location.hash != currentHash) {
            //解决登陆后后退问题, 登陆用户访问非登录用户时页面不跳转
            
            var info = service.getStatusInfo();
            var simInfo = service.getLoginData();
            info.simStatus = simInfo.modem_main_state;				
			 			
            if (window.location.hash == config.defaultRoute || _.indexOf(config.GUEST_HASH, window.location.hash) != -1) {
                if (info.isLoggedIn) {
					listenLogout.init();
                    window.location.hash = currentHash == "" ? "#home" : currentHash;
                    return;
                }
            }

			var match = menu.findMenu();
			
			if(match.length == 0) {
				//window.location.hash = config.defaultRoute;
				window.location = "index.html";
			} else {
                //TODO: 二级菜单与对应三级菜单第一项互相切换时不重新加载数据, 与下面的TODO: click the same menu 实现方式互斥
                var oldMenu = menu.findMenu(currentHash);
                currentHash = match[0].hash;
                if(currentHash == "#login") {
                    menu.rebuild();
                }

                if(oldMenu.length != 0 && match[0].path == oldMenu[0].path && match[0].level != oldMenu[0].level && match[0].level != '1' && oldMenu[0].level != '1') {
                    return;
                }

                //TODO: click the same menu
//                $('a[href=' + currentHash + ']').die('click').live('click', function() {
//                    if(window.location.hash == currentHash) {
//                        require([match[0].path], function(vm) {
//                            clearValidateMsg();
//                            vm.init();
//                        });
//                    }
//                });

                checkLoginPageBg();
                var requirePinHash = ["phonebook/phonebook", "sms/smslist"];
                var isRequirePin = ($.inArray(match[0].path, requirePinHash) != -1);
                if (match[0].checkSIMStatus === true || isRequirePin) {
                    //simStatus is undefined when refreshing page
                    if (info.simStatus == undefined) {
                        showLoading('waiting');
                        function checkSIM() {
                           // var data = service.getStatusInfo();
						   var data = {};//service.getStatusInfo();
		                   var simInfo = service.getLoginData();
		                   data.simStatus = simInfo.modem_main_state;
						   
                            if (data.simStatus == undefined || $.inArray(data.simStatus, config.TEMPORARY_MODEM_MAIN_STATE) != -1) {
                                addTimeout(checkSIM, 500);
                            } else {
                                fixedLoadResources(match[0], data.simStatus, isRequirePin);
                                hideLoading();
                            }
                        }

                        checkSIM();
                    } else {
                        fixedLoadResources(match[0], info.simStatus, isRequirePin);
                    }
                } else {
                    loadResources(match[0]);
                }
            }
		}
	}

    function fixedLoadResources(menuItem, simStatus, isRequirePin) {
        var item = {};
        $.extend(item, menuItem);
        //没有SIM卡时，针对home页面不做处理。
        //网络被锁时，home页面显示解锁页面
        if (simStatus == "modem_sim_undetected" || simStatus == "modem_sim_destroy") {
            if (!isRequirePin) {
                item.path = "nosimcard";
            }
        } else if (simStatus == "modem_waitpin" || simStatus == "modem_waitpuk") {
            item.path = "nosimcard";
        } else if (simStatus == "modem_imsi_waitnck") {
            item.path = "network_lock";
        }
        //load tmpl and controller js
        loadResources(item);
    }

    //TODO: prevent first menu click cover the second menu content, need test with device
    //var loadInterrupt;
    /**
     * 根据菜单配置item加载对应的资源
     * @method loadResources
     * @param {Object} item 菜单对象
     */
    function loadResources(item) {
        clearTimer();
        hideLoading();
        var tmplPath = 'text!/' + item.path + '.html';
        //TODO: prevent first menu click cover the second menu content, need test with device
        //loadInterrupt = false;
        require([tmplPath, item.path], function (tmpl, viewModel) {
            //TODO: prevent first menu click cover the second menu content, need test with device
//            if(loadInterrupt) {
//                return;
//            }
//            loadInterrupt = true;
            //window.document.title = $.i18n.prop(window.location.hash.substring(1)) + ' - ' + config.WEBUI_TITLE;
            menu.buildMenu();
			container.stop(true, true);
            container.hide();
            container.html(tmpl);
            viewModel.init();
            //support backward/forward
            menu.refreshMenu();
            $('#left, #container').translate();
            menu.activeSubMenu();

            $("form").attr("autocomplete", "off");
            if(location.hash=="#home" || location.hash=="#login"){
                $('#weblogo').show();
                $('#top_menu,#thirdMenu').hide();
            }else{
                $('#weblogo').hide();
                $('#top_menu,#thirdMenu').show();
            }
            var hideTitle = ["#home", "#group_all", "#sms", "#smslist", "#sim_messages", "#device_messages"
                , "#mybalance", "#my_account", "#my_services","#help","#wifiinfo"
                , "#router","#apstation", "#device","#balance","#myAccount","#phonebook"];
            if ($.inArray(location.hash, hideTitle) == -1) {
                //$(".form-title").hide();
                $("#thirdMenu").show();
            } else {
                $(".form-title").show();
                $("#thirdMenu").hide();
            }

            container.fadeIn();

            if (config.UPGRADE_TYPE == "FOTA" || config.UPGRADE_TYPE == "OTA") {
                var info = service.getStatusInfo();
                var state = service.getCurrentUpgradeState();
                var currentState = state.current_upgrade_state;
                if (!info.isLoggedIn) {
                    var r = service.getMandatory();
                    if (!r.is_mandatory) {
                        if (currentState == 'upgrade_pack_redownload') {
                            showAlert("ota_interrupted_alert");
                        } else if (currentState == '') {
                            var data = service.getNewVersionState();
                            if (data.hasNewVersion) {
                                showAlert("ota_interrupted_alert");
                            }
                        }
                    }
                }
            }
            firstFormElementFocus();
        });
    }

    function firstFormElementFocus(){
        var firstFormElement = $('input:visible:enabled:not(.noDefaultFocus):first', '#container').focus();
        var firstFormDomElement = firstFormElement[0];
        if (firstFormDomElement && (firstFormElement.is(":text") || firstFormDomElement.nodeName.toUpperCase() == 'TEXTAREA')) {
            setInsertPos(firstFormDomElement, firstFormDomElement.value.length);
        }
    }
	return {
		init: init
	};
});