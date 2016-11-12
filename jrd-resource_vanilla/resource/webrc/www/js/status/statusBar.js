/**
 * statusBar 模块
 * @module statusBar
 * @class statusBar
 */
define([ 'knockout', 'jquery', 'underscore', 'service', 'config/config', 'config/menu', 'tooltip'], function (ko, $, _, service, config, menu, tooltip) {
    var msgPopStack = {};
    var trafficAlertPopuped = false;
    var trafficAlert100Popuped = false;
    var resetTrafficAlertPopuped = false;
    var _smsInitComplete = false;
	var _hasCheckedSmsCapacity = false;
    var _smsNewMessageInDealing = false;
    var _otaUpdateCancelFlag = null;
    var _checkTimes = 0;

/*    *//**
     * 根据语言项加载语言资源并翻译页面上的body部分
     * @method setLocalization
     * @param {String} locale 语言项:zh-cn
     *//*
    function setLocalization(locale){
        $.i18n.properties({
            name:'Messages',
            path:'resource',
            mode:'map',
            cache: true,
            language:locale,
            callback: function() {
                jQuery.validator.messages = $.i18n.map;
                $('body').translate();
				document.title = $.i18n.prop("main_header");
            }
        });
    }*/

    /**
     * 初始化ViewModel
     * @method init
     */
    function init() {
        window.setTimeout(function () {
            var vm = new statusViewModel();
          //  vm.changeLanguage(vm.currentLan);
            ko.applyBindings(vm, $('#statusBar')[0]);
            ko.applyBindings(vm, $('#currentData')[0]);
            ko.applyBindings(vm, $('#weblogo')[0]);
            setInterval(function () {
                var info = getStatusInfo();
                vm.OTAStatus(info.new_version_state);
                vm.networkType(getNetworkType(info.networkType));
                vm.signalCssClass(getSignalCssClass(info.signalImg, info.networkType, info.simStatus));
				var roamStatus=info.roamingStatus?true:false;
                vm.networkOperator(getNetWorkProvider(info.spn_b1_flag,info.spn_name_data,info.spn_b2_flag,info.networkOperator,roamStatus));
                vm.roamingStatus(info.roamingStatus ? "R" : "");
                vm.wifiStatusImg(getWifiStatusImg(info.wifiStatus, info.wifi_client_num));
                vm.simStatus(convertSimStatus(info.simStatus));
                vm.batteryPers(convertBatteryPers(info.batteryPers, info.batteryStatus));
                vm.pinStatus(info.pinStatus);
                vm.batteryStatus(info.batteryStatus);
                vm.batteryCapacity(info.batteryCapacity);
                vm.attachedDevices(info.attachedDevices);
                vm.showAttachedDevices(info.wifiStatus);
				
				var info_conn = service.getConnectionInfo();
				
               // if (checkConnectedStatus(info_conn.connectStatus)) 
			   if(info_conn.connectStatus == "ppp_connected"){
                    vm.connected_Time(transSecond2Time(info.data_counter.currentConnectedTime));
                    vm.up_Speed(transUnit(info.data_counter.uploadRate, true));
                    vm.down_Speed(transUnit(info.data_counter.downloadRate, true));
					
					$('#disconing_wrap_id2').css("display","none");
					$('#currentData').css("background","none");
					
					$('#coning_wrap_id2').css("display","none");
					$('#discon_wrap_id2').css("display","none");
					$('#con_wrap_id2').css("display","");
					
                }else if(info_conn.connectStatus == "ppp_connecting"){
					
					$('#currentData').css("background","#d0c8ba");
					
					$('#disconing_wrap_id2').css("display","none");					
					$('#coning_wrap_id2').css("display","");
					$('#discon_wrap_id2').css("display","none");
					$('#con_wrap_id2').css("display","none");
					
				}else if(info_conn.connectStatus == "ppp_disconnecting"){
					
					$('#currentData').css("background","#d0c8ba");
					
					$('#disconing_wrap_id2').css("display","");
					$('#coning_wrap_id2').css("display","none");
					$('#discon_wrap_id2').css("display","none");
					$('#con_wrap_id2').css("display","none");
					
				}else {
                    vm.connected_Time(transSecond2Time(0));
                    vm.up_Speed(transUnit(0, true));
                    vm.down_Speed(transUnit(0, true));

					$('#currentData').css("background","none");
					
					$('#disconing_wrap_id2').css("display","none");
					$('#coning_wrap_id2').css("display","none");
					$('#discon_wrap_id2').css("display","");
					$('#con_wrap_id2').css("display","none");
										
                }
				
                var autoConnMode = service.getConnectionMode();
                 autoConnRoam = autoConnMode.isAllowedRoaming;
                vm.isAutoConnect2(autoConnMode.connectionMode);

                vm.isLoggedIn(info.isLoggedIn);
				
                if(config.HAS_SMS && _smsInitComplete && !simStatusInvalid(info.simStatus)){
					if(!_hasCheckedSmsCapacity && info.isLoggedIn){
						checkSmsCapacity(info.smsUnreadCount);
					} else {
						vm.smsUnreadCount(info.smsUnreadCount);
					}
                }
                getConnectionCssClass(vm, info.connectStatus, info.data_counter, info.connectWifiSSID, info.connectWifiStatus);
               // refreshConnectStatus(vm, info.connectStatus,info.connectWifiSSID,info.connectWifiStatus);
               // refreshConnectStatus2(vm, info.connectStatus,info.connectWifiSSID,info.connectWifiStatus);
                vm.connectWifiSSID(info.connectWifiSSID);
                vm.connectWifiStatus(info.connectWifiStatus);
                vm.uploadRate(info.data_counter.uploadRate);
                vm.downloadRate(info.data_counter.downloadRate);
               /* if(info.connectStatus == "ppp_disconnected") {
                    if (info.connectWifiSSID && info.connectWifiStatus == "connect") {
                        service.getHotspotList({}, function (data) {
                            for (var i = 0, len = data.hotspotList.length; i < len; i++) {
                                if (data.hotspotList[i].connectStatus == "1") {
                                    vm.wifiStatusText("images/icon_wifi_connect.png");
                                    break;
                                }
                            }
                        });
                    }
                }*/
               // checkTrafficLimitAlert(vm, info);
                updateStatusBarTrans({simStatus: info.simStatus, wifiStatus: info.wifiStatus, deviceSize: info.wifi_client_num, networkType: info.networkType});
                var $langLogoBar = $("#langLogoBar");
                if(info.isLoggedIn){
                	if(!$langLogoBar.hasClass("langborderBg")){
                        $langLogoBar.addClass("langborderBg");
                	}
                	$("#statusBar:hidden").show();
                } else {
                	if($langLogoBar.hasClass("langborderBg")){
                        $langLogoBar.removeClass("langborderBg");
                	}
                	$("#statusBar:visible").hide();
                }
            }, 1000);

            if(config.HAS_SMS){
                window.setInterval(function(){
                    if(vm.isLoggedIn()){
                        checkSmsCapacity();
                    }
                }, 10000);

                checkSmsModelReady();
            }

            window.setInterval(function() {
                if (vm.isLoggedIn() == true && !($("#progress").is(":visible"))){
                    var data = getStatusInfo();
                    if(data.current_upgrade_state == 'connecting_server' || data.current_upgrade_state == 'upgrading'
                        || data.current_upgrade_state == 'accept' || data.current_upgrade_state == 'connect_server_success' ){
                        if(null == _otaUpdateCancelFlag){
                            if(!data.is_mandatory){
                                $.modal.close();
                            }
                            showOtaStatus();
                        }else if(false == _otaUpdateCancelFlag){
                            _otaUpdateCancelFlag = null;
                        }
                    }
                }
            }, 1000);

            var checkOtaResult = function () {
                if (config.UPGRADE_TYPE == "FOTA" || config.UPGRADE_TYPE == "OTA") {
                    var info = service.getStatusInfo();
                    if (info.isLoggedIn) {
                        service.getUpgradeResult({}, function (data) {
                            if (data.upgrade_result == "success") {
                                showOtaResult(true);
                            } else if (data.upgrade_result == "fail") {
                                showOtaResult(false);
                            } else {
                                window.setTimeout(checkOtaResult, 1000);
                            }
                        }, function () {
                            window.setTimeout(checkOtaResult, 1000);
                        });
                    } else {
                        window.setTimeout(checkOtaResult, 1000);
                    }
                }
            }
            //checkOtaResult();

            if (config.UPGRADE_TYPE == "TWO_PORTION") {
                window.setInterval(function () {
                    var info = getStatusInfo();
                    if (checkConnectedStatus(info.connectStatus) && info.isLoggedIn) {//只有在联网中才给予新版本提示
                        if (!config.ALREADY_NOTICE) {
                            service.getUpdateInfoWarning({}, function (notice) {
                                if (notice.upgrade_notice_flag == 2) {
                                    config.ALREADY_NOTICE = true;
                                    showAlert("update_notice");
                                }
                            });
                        }
                    }
                }, 60000);
            }

            var OTAInterval = window.setInterval(function () {
                if (!config.ALREADY_OTA_NOTICE && config.HAS_OTA_NEW_VERSION) {
                    if (_checkTimes > 3) {
                        window.clearInterval(OTAInterval);
                    }
                    _checkTimes++;
                    if (checkConnectedStatus(vm.connectStatus())) {
                        window.clearInterval(OTAInterval);
                        config.ALREADY_OTA_NOTICE = true;
                        var data = getStatusInfo();
                        if (!data.is_mandatory) {
                            showOTAConfirm(data);
                        }
                    }
                }
            }, 1000);

			function checkSmsCapacity(unreadCount){
				service.getSmsCapability({}, function(info){
					var showSmsConfirm = false;
					//if(info.nvTotal != 0 && info.nvUsed >= info.nvTotal){
					if( info.nvLeft <= 0){	
						$("#sms_unread_count").attr("tipTitle", "sms_capacity_is_full");
						showSmsConfirm = true;
					//} else if(info.nvTotal != 0 && info.nvUsed + 5 >= info.nvTotal) {
					} else if( 5 >= info.nvLeft) {
						$("#sms_unread_count").attr("tipTitle", "sms_capacity_will_full");
						showSmsConfirm = true;
					} else {
						$("#sms_unread_count").attr("tipTitle", "sms_unread_count");
					}
					vm.showSmsDeleteConfirm(showSmsConfirm);
					if(typeof unreadCount != "undefined"){
						vm.smsUnreadCount(unreadCount);
					}
					_hasCheckedSmsCapacity = true;
				});
			}
        }, 1200);
        
        tooltip.init();
        
        /**
         * 检查短息模块初始化状态
         * @method checkSmsModelReady
         */
        function checkSmsModelReady(){
            var info = getStatusInfo();
            if(info.isLoggedIn){
                service.getSMSReady({}, function (data) {
                    if (data.sms_cmd_status_result == "1") {
                        window.setTimeout(function(){checkSmsModelReady();}, 1000);
                    } else {
                        _smsInitComplete = true;
                    }
                });
            } else {
                window.setTimeout(function(){checkSmsModelReady();}, 1000);
            }
        }

        /**
         * 检查浏览提醒状态
         * @method checkTrafficLimitAlert
         */
        checkTrafficLimitAlert = function(vm, info){
            var APStationEnabled = service.getStatusInfo().ap_station_enable;
            //先确定Ap Station使能状态再确定用什么方式来提醒
            if (config.AP_STATION_SUPPORT && typeof APStationEnabled == "undefined") {
                service.refreshAPStationStatus({}, $.noop());
                return false;
            }
            var inShow = $("#confirm-container:visible").length > 0;
            //未登录，正在提示，已弹出，提醒未开启，（AP Station未开启并且没有联网）
            if (!info.isLoggedIn || inShow || (trafficAlertPopuped && trafficAlert100Popuped)
                || !info.limitVolumeEnable || (!APStationEnabled && !checkConnectedStatus(info.connectStatus))) {
                return false;
            }
            if (resetTrafficAlertPopuped) {
                window.setTimeout(function () {
                    resetTrafficAlertPopuped = false;
                }, 2000);
                return false;
            }
            var trafficResult = getTrafficResult(info);
            if (trafficResult.showConfirm) {
                var confirmMsg = null;
                if (trafficResult.usedPercent > 100 && !trafficAlert100Popuped) {
                    trafficAlertPopuped = trafficAlert100Popuped = true;
                    confirmMsg = {msg: APStationEnabled ? 'traffic_beyond_msg' : 'traffic_beyond_disconnect_msg'};
                } else if (!trafficAlertPopuped) {
                    trafficAlertPopuped = true;
                    trafficAlert100Popuped = false;
                    confirmMsg = {msg: APStationEnabled ? 'traffic_limit_msg' : 'traffic_limit_disconnect_msg',
                        params: [trafficResult.limitPercent]};
                }
                if (confirmMsg != null) {
                    if (APStationEnabled) {
                        showAlert(confirmMsg);
                    } else {
                        showConfirm(confirmMsg, function () {
                            showLoading("disconnecting");
                            service.disconnect({}, function (data) {
                                if (data.result) {
                                    successOverlay();
                                } else {
                                    errorOverlay();
                                }
                            });
                        });
                    }
                }
            }
            return true;
        };
        
        /**
         * 更新状态中的tooltip
         * @method updateStatusBarTrans
         * @param {String} status
         */
        function updateStatusBarTrans(status){
    		$("#statusItemSimStatus").attr("tipTitle", "sim_status_" + status.simStatus);
    		if (status.wifiStatus) {
				if (status.deviceSize == 0) {
					$("#wifi_status").attr("tipTitle","wifi_status_on");
				} else {
					$("#wifi_status").attr("tipTitle","wifi_status" + status.deviceSize);
				}
			} else {
				$("#wifi_status").attr("tipTitle","wifi_status_off");
			}
        }


        /**
    	 * 刷新联网状态
    	 * 
    	 * @method refreshConnectStatus
    	 */
        function refreshConnectStatus(vm, status, wifiSSID, wifiStatus) {
            /*
    		 * if (vm.connectStatus() == status) { return; }
    		 */
            vm.connectStatus(status);
            if (status == "ppp_connecting") {
                vm.connectStatusTrans("connecting");
                vm.connectStatusText($.i18n.prop("connecting"));
            } else if (checkConnectedStatus(status)) {
                vm.connectStatusTrans("connected");
                vm.connectStatusText($.i18n.prop("connected"));
            } else if (status == "ppp_disconnecting") {
                vm.connectStatusTrans("disconnecting");
                vm.connectStatusText($.i18n.prop("disconnecting"));
            } else if(wifiSSID){
                if(wifiStatus =="connect"){
                //    vm.connectStatus("wifi_connect");
                    vm.connectStatusTrans("connected");
                    vm.connectStatusText($.i18n.prop("connected"));
                }else if(wifiStatus =="connecting"){
                    vm.connectStatus("wifi_connecting");
                    vm.connectStatusTrans("connecting");
                    vm.connectStatusText($.i18n.prop("connecting"));
                }else{
                    vm.connectStatus("ppp_disconnected");
                    vm.connectStatusTrans("disconnected");
                    vm.connectStatusText($.i18n.prop("disconnected"));
                }
            }else{
                vm.connectStatusTrans("disconnected");
                vm.connectStatusText($.i18n.prop("disconnected"));
            }

        }
        var getWifiStatus = "";
        function getWIFIConnectStatus(){
            service.getHotspotList({}, function (data) {
                for (var i = 0, len = data.hotspotList.length; i < len; i++) {
                    if (data.hotspotList[i].connectStatus == "1") {
                        getWifiStatus = "wifi_conected";
                        return;
                    }
                }
            });
        }
        function refreshConnectStatus2(vm, status, wifiSSID, wifiStatus) {
            /*
             * if (vm.connectStatus() == status) { return; }
             */
            var connectionStatus = "";
            if (status == "ppp_disconnected") {
                if (wifiSSID && wifiStatus == "connect") {
                    getWIFIConnectStatus();
                    if(getWifiStatus != ""){
                        vm.connectStatusTrans2("wifi_conected");
                        vm.connectStatusText2($.i18n.prop("wifi_conected"));
                    }
                } else if (wifiSSID && wifiStatus == "connecting") {
                    vm.connectStatusTrans2("connecting");
                    vm.connectStatusText2($.i18n.prop("connecting"));
                } else {
                    vm.connectStatusTrans2("connect");
                    vm.connectStatusText2($.i18n.prop("connect"));
                }
            } else if (status == "ppp_connecting" || status == "wifi_connecting") {
                vm.connectStatusTrans2("connecting");
                vm.connectStatusText2($.i18n.prop("connecting"));
            } else if(status == "ppp_disconnecting"){
                vm.connectStatusTrans2("disconnecting");
                vm.connectStatusText2($.i18n.prop("disconnecting"));
            } else {
                if (vm.uploadRate != '0' && vm.downloadRate != '0') {
                    vm.connectStatusTrans2("disconnect");
                    vm.connectStatusText2($.i18n.prop("disconnect"));
                } else if (vm.uploadRate != '0' && vm.downloadRate == '0') {
                    vm.connectStatusTrans2("disconnect");
                    vm.connectStatusText2($.i18n.prop("disconnect"));
                } else if (vm.uploadRate == '0' && vm.downloadRate != '0') {
                    vm.connectStatusTrans2("disconnect");
                    vm.connectStatusText2($.i18n.prop("disconnect"));
                } else {
                    vm.connectStatusTrans2("disconnect");
                    vm.connectStatusText2($.i18n.prop("disconnect"));
                }
            }
        }
        /**
    	 * 获取当前网络状态
    	 * 
    	 * @method getNetworkType
    	 */
        getNetworkType = function(networkType) {
            var type_2g = ["GSM", "GPRS", "EDGE"];
            var type_3g = ["UMTS", "HSDPA", "HSUPA", "HSPA", "HSPA+", "DC-HSPA+"];
            var type_4g = ["LTE"];
            var type_4g_plus = ["LTE+"];

			var networkTypeTmp = networkType.toLowerCase();
			if (networkTypeTmp == '') {
				networkTypeTmp = 'limited_service';
			}
			if (networkTypeTmp == 'limited_service' || networkTypeTmp == 'no_service') {
				$("#networkType", "#statusBar").attr("trans", "network_type_" + networkTypeTmp);
				return $.i18n.prop("network_type_" + networkTypeTmp);
			} else {
                $("#networkType", "#statusBar").removeAttr("trans");
                if ($.inArray(networkType, type_2g) != -1) {
                    networkType = "2G ("+networkType + ")";
                } else if ($.inArray(networkType, type_3g) != -1) {
                    networkType = "3G ("+networkType + ")";
                } else if ($.inArray(networkType, type_4g) != -1) {
                    networkType = "4G ("+networkType + ")";
                }else if($.inArray(networkType, type_4g_plus) != -1){
                    networkType = "4G+ (LTE)";
                }
                return networkType;
            }
		};

		if(config.HAS_SMS && menu.checkIsMenuExist("sms/smslist")){
            window.setInterval(function () {
                var info = getStatusInfo();
        		if(window.location.hash == "#login" || simStatusInvalid(info.simStatus)){
        			return;
        		}
        		for(key in msgPopStack){
        			var val = msgPopStack[key];
        			if($.now() - val > 5000){
        				delete(msgPopStack["m" + val]);
        				var node = $(".bubbleItem#m" + val, "#buttom-bubble");
        				node.fadeOut(1000, function(){
        					$(this).remove();
        				});
        			}
        		}
        		if(info.isLoggedIn){
        			if(info.newSmsReceived && !_smsNewMessageInDealing){
                        _smsNewMessageInDealing = true;
        				service.resetNewSmsReceivedVar();
        				checkNewMessages();
        			}
        			if(info.smsReportReceived){
        				service.resetSmsReportReceivedVar();
        				responseSmsReport();
        			}
        		}
			}, 1000);

            window.setInterval(function(){
				if(menu.checkIsMenuExist("sms/smslist")){
					var info = getStatusInfo();
					if(info.isLoggedIn && !_smsNewMessageInDealing && !simStatusInvalid(info.simStatus)){
                        _smsNewMessageInDealing = true;
						checkNewMessages();
					}
				}
			}, 20001);
		}
    	
    	function checkNewMessages(){
            var smsCount = 5;
            var tags = 1;
            if(!config.dbMsgs || config.dbMsgs.length == 0){
                smsCount = 500;
                tags = 10;
            }
            service.getNewSMS({}, function(data){
                if(data && data.messages){
                    filterNewMsg(data.messages);
                }
                _smsNewMessageInDealing = false;
            });
    	}

        if(config.HAS_SMS){
            $(".bubbleItem", "#buttom-bubble").live("mouseover", function(){
                var $this = $(this);
                delete(msgPopStack[$this.attr("id")]);
            }).live("mouseout", function(){
                    var $this = $(this);
                    var now = $.now();
                    msgPopStack["m" + now] = now;
                    $this.attr("id", "m" + now);
                    $(".bubbleItem h3 a.bubbleCloseBtn", "#buttom-bubble").data("targetid", "m" + now);
                });

            $(".bubbleItem h3 a.bubbleCloseBtn", "#buttom-bubble").die().live("click", function(){
                var id = $(this).data("targetid");
                delete(msgPopStack[id]);
                var node = $(".bubbleItem#" + id, "#buttom-bubble");
                node.fadeOut(1000, function(){
                    $(this).remove();
                });
            });
        }
    }

    /**
     * 获取网络、SIM、WIFI等状态
     * @method getStatusInfo
     */
    var getStatusInfo = function () {
        return service.getStatusInfo();
    };

    /**
     * statusViewModel
     * @class statusViewModel
     */
    function statusViewModel() {
        var self = this;
        var info = getStatusInfo();
     /*   var currentLan = getLanguage();
        var languages = _.map(config.LANGUAGES, function(item) {
            return new Option(item.name, item.value);
        });
        self.languages = ko.observableArray(languages);
        self.currentLan = ko.observable(currentLan.Language);*/
        self.OTAStatus = ko.observable(info.new_version_state);
		self.hasWifi = ko.observable(config.HAS_WIFI);
        self.hasBattery = ko.observable(config.HAS_BATTERY);
        self.networkType = ko.observable(getNetworkType(info.networkType));
        self.signalCssClass = ko.observable(getSignalCssClass(info.signalImg, info.networkType, info.simStatus));
		var roamStatus=info.roamingStatus?true:false;
        self.networkOperator = ko.observable(getNetWorkProvider(info.spn_b1_flag,info.spn_name_data,info.spn_b2_flag,info.networkOperator,roamStatus));
        self.roamingStatus = ko.observable(info.roamingStatus ? "R" : "");
        self.wifiStatusImg = ko.observable(getWifiStatusImg());
        self.simStatus = ko.observable(convertSimStatus(info.simStatus));
        self.pinStatus = ko.observable(info.pinStatus);
        self.pinStatusText = ko.observable();
        self.batteryStatus = ko.observable(info.batteryStatus);
        self.batteryCapacity = ko.observable(info.batteryCapacity);
        self.batteryPers = ko.observable(convertBatteryPers(info.batteryPers, info.batteryStatus));
        self.connectStatus = ko.observable(info.connectStatus);
        self.connectWifiSSID = ko.observable(info.connectWifiSSID);
        self.connectWifiStatus = ko.observable(info.connectWifiStatus);
        self.uploadRate = ko.observable(info.data_counter.uploadRate);
        self.downloadRate = ko.observable(info.data_counter.downloadRate);
        self.wifiStatusText = ko.observable();
        self.connectStatusText = ko.observable();
        self.connectStatusTrans = ko.observable();
        self.connectStatusText2 = ko.observable();
        self.connectStatusTrans2 = ko.observable();
        self.attachedDevices = ko.observable(info.attachedDevices);
        self.showAttachedDevices = ko.observable(info.wifiStatus);
        self.isLoggedIn = ko.observable(info.isLoggedIn);
        self.showSmsDeleteConfirm = ko.observable(false);
        self.smsUnreadCount = ko.observable(0);
        self.connectionCssClass = ko.observable("");
        self.imagePath = ko.dependentObservable(function() {
            var connectionStatus = "";
            if (self.connectStatus() == "ppp_disconnected") {
                if (self.connectWifiSSID() && self.connectWifiStatus() == "connect") {
                    if(self.wifiStatusText() && self.wifiStatusText() !=""){
                        connectionStatus = self.wifiStatusText();
                    }
                } else if (self.connectWifiSSID() && self.connectWifiStatus() == "connecting") {
                    connectionStatus = "images/connecting.gif";
                } else {
                    connectionStatus = "images/disconnect.png";
                }
            }else if (self.connectStatus() == "ppp_connecting" || self.connectStatus() == "wifi_connecting") {
                connectionStatus = "images/connecting.gif";
            }else if(self.connectStatus() == "ppp_disconnecting"){
                connectionStatus = "images/disconnecting.gif";
            } else {
                if (self.uploadRate() != '0' && self.downloadRate() != '0') {
                    connectionStatus = "images/connect.png";
                } else if (self.uploadRate() != '0' && self.downloadRate() == '0') {
                    connectionStatus = "images/connect.png";
                } else if (self.uploadRate() == '0' && self.downloadRate() != '0') {
                    connectionStatus = "images/connect.png";
                } else {
                    connectionStatus = "images/connect.png";
                }
            }
            return connectionStatus;
        });
        //if (checkConnectedStatus(info.connectStatus)) 
		if(info.connectStatus == "ppp_connected"){
            self.connected_Time = ko.observable(transSecond2Time(info.data_counter.currentConnectedTime));
            self.up_Speed = ko.observable(transUnit(info.data_counter.uploadRate, true));
            self.down_Speed = ko.observable(transUnit(info.data_counter.downloadRate, true));
			
			$('#currentData').css("background","none");

			$('#disconing_wrap_id2').css("display","none");
			$('#coning_wrap_id2').css("display","none");
			$("#discon_wrap_id2").css("display","none");
			$("#con_wrap_id2").css("display","");
			//add need houailing show connect status
        }else if(info.connectStatus == "ppp_connecting"){
			
			$('#currentData').css("background","#d0c8ba");
			
			$('#disconing_wrap_id2').css("display","none");
			$('#coning_wrap_id2').css("display","");
			$('#discon_wrap_id2').css("display","none");
			$('#con_wrap_id2').css("display","none");
					
		}else if(info.connectStatus == "ppp_disconnecting"){
			
			$('#currentData').css("background","#d0c8ba");
			
			$('#disconing_wrap_id2').css("display","");
			$('#coning_wrap_id2').css("display","none");
			$('#discon_wrap_id2').css("display","none");
			$('#con_wrap_id2').css("display","none");
			
		}else {
            self.connected_Time = ko.observable(transSecond2Time(0));
            self.up_Speed = ko.observable(transUnit(0, true));
            self.down_Speed = ko.observable(transUnit(0, true));
			
			$('#currentData').css("background","none");
			
			$('#disconing_wrap_id2').css("display","none");
			$('#coning_wrap_id2').css("display","none");
			$("#discon_wrap_id2").css("display","none");
			$("#con_wrap_id2").css("display","");			
			//add need houailing show connect status
        }
		
		var autoConnMode = service.getConnectionMode();
		var autoConnRoam = autoConnMode.isAllowedRoaming;
		
		
		self.isAutoConnect2 = ko.observable(autoConnMode.connectionMode);
		
        getConnectionCssClass(self, info.connectStatus, info.data_counter, info.connectWifiSSID, info.connectWifiStatus);
        var $langLogoBar = $("#langLogoBar");
        if(info.isLoggedIn){
        	if(!$langLogoBar.hasClass("langborderBg")){
                $langLogoBar.addClass("langborderBg");
        	}
        	$("#statusBar:hidden").show();
        } else {
        	if($langLogoBar.hasClass("langborderBg")){
                $langLogoBar.removeClass("langborderBg");
        	}
        	$("#statusBar:visible").hide();
        }
       /* self.changeLanguage = function(lan){
            self.currentLan(lan);
            self.langChangeHandler();
        }
        *//**
         * 语言切换事件处理
         * @event langChangeHandler
         *//*
        self.langChangeHandler = function(data, event) {
            clearValidateMsg();

            service.setLanguage({Language: self.currentLan()}, function() {
                setLocalization(self.currentLan());
                if(self.currentLan() == "ru"){
                    $("#titleImg").attr("src","images/logo_ru.png");
                }else{
                    $("#titleImg").attr("src","images/logo_en.png");
                }
            });
        };*/
        //init language
     //  setLocalization(self.currentLan());
        /**
         * 联网事件处理
         * @event connect
         */
        self.connect = function () {
            showLoading("connecting");
            service.connect({}, function (data) {
                if (data.result) {
                    refreshConnectStatus(self, data.status);
                }
                successOverlay();
            }, function (data) {
                errorOverlay();
            });
        };
        function doConnect2(){
           // showLoading('connecting');
            service.connect({}, function(data) {
                if(data.result){
                   // successOverlay();		
				   return;
                } else {
                    errorOverlay();
                }
            });
        }
        self.connect2 = function () {
           /* var trafficResult = getTrafficResult(info);
            if(info.limitVolumeEnable && trafficResult.showConfirm){
                var confirmMsg = null;
                if(trafficResult.usedPercent > 100){
                    confirmMsg = {msg: 'traffic_beyond_connect_msg'};
                    setTrafficAlertPopuped(true);
                } else {
                    confirmMsg = {msg: 'traffic_limit_connect_msg', params: [trafficResult.limitPercent]};
                    setTrafficAlert100Popuped(false);
                }
                showConfirm(confirmMsg, function(){
                    doConnect2();
                });
            }else{
                doConnect2();
            }*/
			doConnect2();
        };
        /**
         * 断网事件处理
         * @event disconnect
         */
        self.disconnect = function () {
            showLoading("disconnecting");
            service.disconnect({}, function (data) {
                if (data.result) {
                    refreshConnectStatus(self, data.status);
                }
                successOverlay();
            }, function (data) {
                errorOverlay();
            });
        };
        function hasHotspotConnected(){
            var info2 = service.getStatusInfo();
            var wifiStatus = info2.connectWifiStatus;
            if (wifiStatus == "connect") {
                return true;
            }else{
                return false;
            }
        }
		
		self.setConnectModeHandler2 = function(){
			var checkbox = $("#autoConnectCheckbox2:checked");	
			var connMode;
			var pro_string;
			
			if(checkbox && checkbox.length == 0){
				self.isAutoConnect2('auto_dial');
				connMode = 'auto_dial';
				pro_string = "auto_confirm";
			}else{
				self.isAutoConnect2('manual_dial');
				connMode = 'manual_dial';
				pro_string = "manual_confirm";
			}
			
		   showConfirm(pro_string,{ok:function(){
			   service.setConnectionMode({
					connectionMode: connMode,
					isAllowedRoaming: autoConnRoam}, function (result) {
					if (result.result == "success") {
						successOverlay();
					} else {
						errorOverlay();
					}});
				} , no:function(){
					if(connMode == 'auto_dial' ){
						self.isAutoConnect2('manual_dial');	
					}else{
						self.isAutoConnect2('auto_dial');	
					}
				}			               
            });		
			
		};
		
		self.cancelConnectHandler2 = function(){
			service.setConnectCancel({}, function (result) {
                if (result.result == "success") {
                    successOverlay();
                } else {
                    errorOverlay();
                }
            });
		};
		
        self.connectHandler2 = function() {
			var conn_status = service.getConnectionInfo();
            if (checkConnectedStatus(conn_status.connectStatus)) {
                //showLoading('disconnecting');
                service.disconnect({}, function(data) {
                    if(data.result){
                    	//successOverlay();	
                        return;
                    } else {
                        errorOverlay();
                    }
                });
				
            } else {
                if(info.roamingStatus && info.roamMode == "off") {
                    showAlert("dial_roam_info");
                }else /*if(hasHotspotConnected()){
                    showConfirm("wan_connect_change_alert", function(){
                        showLoading('operating');
                        service.disconnectHotspot({}, function (data) {
                            if (data) {
                                if (data.result == "success") {
                                    self.connect2();
                                } else if (data.result == "spot_connecting" || data.result == "spot_connected") {
                                    showAlert("ap_station_update_fail");
                                } else {
                                    errorOverlay();
                                }
                            } else {
                                errorOverlay();
                            }
                        });
                    });
                } else */{
                    self.connect2();
                }
            }
        };
    }
    /**
     * 获取语言项
     * @method getLanguage
     */
/*    function getLanguage() {
        return service.getLanguage();
    }*/
	function getNetWorkProvider(spn_b1_flag,spn_name_data,spn_b2_flag,network_provider,roamStatus){		
		if(spn_name_data==""){
			return network_provider;
		}else{
			spn_name_data=decodeMessage(spn_name_data);
			
			if(spn_b1_flag=="1" && spn_b2_flag=="1"){
				if(roamStatus){//漫游
					return network_provider;
				}else{//不漫游
					return network_provider+"  "+spn_name_data;
				}				
			}else if(spn_b1_flag=="1"){
				if(roamStatus){//漫游
					return network_provider+"  "+spn_name_data;
				}else{//不漫游
					return network_provider+"  "+spn_name_data;
				}
			}else if(spn_b2_flag=="1"){
				if(roamStatus){//漫游
					return network_provider;
				}else{//不漫游
					return spn_name_data;
				}
			}else if(spn_b1_flag=="0" && spn_b2_flag=="0"){
				if(roamStatus){//漫游
					return network_provider+"  "+spn_name_data;
				}else{//不漫游
					return spn_name_data;
				}
			}
			return "--";
		}
	}
    var dbMsgIds = [];
    /**
     * 过滤最新的5条短消息，将未添加到短信列表中的弹出提示
     * @method filterNewMsg
     * @param {Array} msgs
     */
    function filterNewMsg(msgs){
    	if(!config.dbMsgs){
    		config.dbMsgs = [];
    	}
    	if(dbMsgIds.length == 0){
    		$.each(config.dbMsgs, function(i, e){
    			dbMsgIds.push(e.id);
    		});
    	}
    	$.each(msgs, function(j, e){
    		if($.inArray(e.id, dbMsgIds) == -1){//增加新短信
    			dbMsgIds.push(e.id);
    			config.dbMsgs.push(e);
    			if(e.tag == '1'){
    				addNewMsg(e, false);
    			}
    		}else{
    			for(var i = 0; i < config.dbMsgs.length; i++){//更新级联短信
    				if(config.dbMsgs[i].id == e.id && config.dbMsgs[i].content != e.content && e.tag == '1'){
    					config.dbMsgs[i].content = e.content;
    					addNewMsg(e, true);
    					break;
    				}
    			}
    		}
    	});
    }
    
    var isFirstLoadNewMsg = true;
    var newMessagePopTmpl = null;
    /**
     * 添加新短消息提示，并更新相关内容
     * @method addNewMsg
     * @param {Object} msg
     */
    function addNewMsg(msg, isUpdate){
    	config.smsMaxId = msg.id;
    	var now = $.now();
    	msgPopStack["m" + now] = now;
    	var name = msg.number;
    	if(isFirstLoadNewMsg && config.phonebook && config.phonebook.length == 0){
    		isFirstLoadNewMsg = false;
    		if(config.HAS_PHONEBOOK){
				getPhoneBooks();
			}else{
				config.phonebook = [];
			}
    	}
    	for(i in config.phonebook){
    		if(getLast8Number(config.phonebook[i].pbm_number) == getLast8Number(msg.number)){
    			name = config.phonebook[i].pbm_name;
    			break;
    		}
    	}
		var newMsg = {
			mark : "m" + now,
			name: name,
			title: $.i18n.prop("sms"),
			titleTrans: "sms",
			tag: msg.tag,
			content : msg.content,
			datetime : msg.time
		};
		if(newMessagePopTmpl == null){
			newMessagePopTmpl = $.template("newMessagePopTmpl", $("#newMessagePopTmpl"));
		}
        $(".bubbleItem:not(.report)", "#buttom-bubble").remove();
        $.tmpl("newMessagePopTmpl", newMsg).appendTo("#buttom-bubble");
		if(window.location.hash == "#sms" || window.location.hash == "#device_messages"){
            dealChosenNumber(newMsg.name, msg.number);
			var inChating = config.currentChatObject && config.currentChatObject == getLast8Number(msg.number);
			var itemId = getLast8Number(msg.number);
			var item = $("#smslist-item-" + itemId);
			if(item && item.length > 0){
                // 已存在内容，更新内容调整顺序
				for(var i = 0; config.listMsgs && i < config.listMsgs.length; i++){
					if(getLast8Number(config.listMsgs[i].number) == getLast8Number(msg.number)){
						config.listMsgs[i].id = msg.id;
						config.listMsgs[i].latestId = msg.id;
						config.listMsgs[i].latestSms = msg.content;
						config.listMsgs[i].latestTime = msg.time;
						if(!isUpdate){
							config.listMsgs[i].newCount++;
							config.listMsgs[i].totalCount++;
						}
						break;
					}
				}
				item.find(".smslist-item-checkbox p.checkbox").attr("id", msg.id);
				item.find(".smslist-item-checkbox input:checkbox").val(msg.id).attr("id", "checkbox" + msg.id);
				if(!isUpdate){
					var count = item.find(".smslist-item-total-count").text();
					count = Number(count.substring(1, count.length - 1));
					item.find(".smslist-item-total-count").text("(" + (count + 1) + ")");
					if(!config.currentChatObject || config.currentChatObject != getLast8Number(msg.number)){
						var newNum = item.find(".smslist-item-new-count").removeClass("hide");
						if(newNum && newNum.text().length > 0){
							newNum.text(Number(newNum.text()) + 1);
						}else{
							newNum.text(1);
						}
					}
				}
				var msgContent = item.find(".smslist-item-msg pre").text(msg.content);
				if (config.currentChatObject && config.currentChatObject == getLast8Number(msg.number)) {
					msgContent.removeClass("txtBold");
				} else {
					msgContent.addClass("txtBold");
				}
				item.find(".smslist-item-repeat span").die().click(function() {
					forwardClickHandler(msg.id);
				});
				item.find("span.clock-time").text(msg.time);
				var tmpItem = item;
				item.hide().remove();
				$("#smslist_container").prepend(tmpItem.show());
			} else {
                // 如果短信列表中不存在相应的联系人短息，应在短信列表中新增数据
				var theName = "";
				if(config.phonebook && config.phonebook.length > 0) {
					for(i in config.phonebook){
						if(getLast8Number(config.phonebook[i].pbm_number) == getLast8Number(msg.number)){
							theName = config.phonebook[i].pbm_name;
							break;
						}
					}
				}
				var theNewMsg = {
					id : msg.id,
					name : theName,
					number : msg.number,
					latestId : msg.id,
					totalCount : 1,
					newCount : inChating ? 0 : 1,
					latestSms : msg.content,
					latestTime : msg.time,
					checked : false,
                    hasDraft : false,
					itemId : getLast8Number(msg.number)
				};
				if(smsListTmpl == null){
					smsListTmpl = $.template("smsListTmpl", $("#smsListTmpl"));
				}
				$.tmpl("smsListTmpl", {data: [theNewMsg]}).prependTo("#smslist_container");
            }
            if(config.HAS_PHONEBOOK){
                $(".sms-add-contact-icon").removeClass("hide");
            }else{
                $(".sms-add-contact-icon").addClass("hide");
            }
			if(inChating){
				var talkItem = $("#talk-item-" + msg.id, "#chatlist");
				if (talkItem && talkItem.length > 0) {// 更新级联短信内容
					$(".J_content pre", talkItem).html(dealContent(msg.content));
					$(".time .smslist-item-time", talkItem).text(msg.time);
					$(".smslist-item-repeat", talkItem).die().click(
							function() {
								forwardClickHandler(msg.id);
							});
					$(".smslist-item-delete", talkItem).die().click(
							function() {
								deleteSingleItemClickHandler(msg.id);
							});
				} else {// 增加新的回复内容
					$("#smsOtherTmpl").tmpl(msg).appendTo("#chatlist");
					$(".clear-container", "#chatpanel").animate({
						scrollTop : $("#chatlist").height()
					});
				}
				service.setSmsRead({ids: [msg.id]}, function(){});
			}
            enableCheckbox($("#smslist-checkAll"));
		}
	}

    function dealChosenNumber(name, num) {
        setTimeout(function () {
            var chosen = $("#chosenUserSelect");
            var options = $("option", chosen);
            for (var i = 0; i < options.length; i++) {
                if (getLast8Number(num) == options[i].value) {
                    options[i].value = num;
                    options[i].text = name + '/' + num;
                    break;
                }
            }
            chosen.trigger("liszt:updated");
        }, 0);
    }
    /**
     * 处理短信发送报告
     * @method responseSmsReport
     */
    function responseSmsReport(){
    	if(isFirstLoadNewMsg && config.phonebook && config.phonebook.length == 0){
    		isFirstLoadNewMsg = false;
    		if(config.HAS_PHONEBOOK){
				getPhoneBooks();
			}else{
				config.phonebook = [];
			}
    	}
    	service.getSMSDeliveryReport({
    		page: 0,
    		smsCount: 10
    	}, function(data){
    		var messages = data.messages;
    		var nums = [];
    		$.each(messages, function(i, msg){
    			if($.inArray(msg.number, nums) == -1){
    				nums.push(msg.number);
                    window.setTimeout(function(){
    					var now = $.now();
    					msgPopStack["m" + now] = now;
    					msg.name = msg.number;
    					for(i in config.phonebook){
    						if(getLast8Number(config.phonebook[i].pbm_number) == getLast8Number(msg.number)){
    							msg.name = config.phonebook[i].pbm_name;
    							break;
    						}
    					}
    					var msgContent = $.i18n.prop("sms_delivery_report_" + "1"/*msg.content*/);
    					var newMsg = {
    							mark : "m" + now,
    							name: msg.name,
    							title: $.i18n.prop("sms_report"),
    							titleTrans: "sms_report",
    							content : msgContent,
    							datetime : msg.time,
    							report : 'report',
								id : msg.id
    					};
    					if(newMessagePopTmpl == null){
    						newMessagePopTmpl = $.template("newMessagePopTmpl", $("#newMessagePopTmpl"));
    					}
                        $(".report", "#buttom-bubble").remove();
    					$.tmpl("newMessagePopTmpl", newMsg).appendTo("#buttom-bubble");
						deleteReportSms(newMsg.id);
    				}, 100);
    			}
    		});
    	}, function(){
    		//No Deal
    	});
    }

	/**
	 * 删除短信报告
	 * @method deleteDraftSms
	 * @param id
	 * @param numbers
	 */
	function deleteReportSms(id){
		service.deleteSMSReport({
			id: id
		});
	}
	/**
	 * 获取电话本信息
	 * @method getPhoneBooks
	 */
	function getPhoneBooks() {
		var books = service.getPhoneBooks({
            page : 0,
            data_per_page : 2000,
            orderBy : "id",
            isAsc : false
		});
		dealPhoneBooksResult(books);
	}

	/**
	 * 双异步获取设备侧和sim卡测得短信息，并将其合并
	 * @method dealPhoneBooksResult
	 * @param {Array} books 电话本
	 */
	function dealPhoneBooksResult(books){
		if($.isArray(books.pbm_data) && books.pbm_data.length > 0){
			config.phonebook = books.pbm_data;
		}
	}

	/**
	 * 获取信号量的CSS样式
	 * @method getSignalCssClass
	 */
    function getSignalCssClass(siganl, networkType, simStatus) {
    	networkType = networkType.toLowerCase();
    	simStatus = simStatus ? simStatus.toLowerCase() : '';
        if(networkType == '' || networkType == 'limited_service' || networkType == 'no_service'
            || simStatus != 'modem_init_complete'){
            siganl = '_none';
        }
        return "signal signal" + siganl;
    }

    function simStatusInvalid(simStatus){
        return simStatus == 'modem_sim_undetected' || simStatus == 'modem_undetected' || simStatus == 'modem_sim_destroy'
            || simStatus == 'modem_waitpin' || simStatus == 'modem_waitpuk' || simStatus == 'modem_imsi_waitnck';
    }

    /**
	 * 获取联网状态的CSS样式
	 * @method getConnectionCssClass
	 */
    function getConnectionCssClass(vm, status, data_counter, wifiSSID, wifiStatus) {
        var connectionStatus = "icon_connection ";
        if (status == "ppp_disconnected") {
            if (wifiSSID && wifiStatus == "connect") {
                service.getHotspotList({}, function (data) {
                    var cssName = "icon_connection ";
                    var css = "connecting ";
                    for (var i = 0, len = data.hotspotList.length; i < len; i++) {
                        if (data.hotspotList[i].connectStatus == "1") {
                            css = "wifi_connected";
                            break;
                        }
                    }
                    cssName += css;
                    vm.connectionCssClass(cssName);
                });
                return;
            } else if (wifiSSID && wifiStatus == "connecting") {
                connectionStatus += "connecting";
            } else {
                connectionStatus += "disconnect";
            }
        } else if (status == "ppp_connecting" || status == "wifi_connecting") {
            connectionStatus += "connecting";
        } else {
            if (data_counter.uploadRate != '0' && data_counter.downloadRate != '0') {
                connectionStatus += "connectionBoth";
            } else if (data_counter.uploadRate != '0' && data_counter.downloadRate == '0') {
                connectionStatus += "connectionUp";
            } else if (data_counter.uploadRate == '0' && data_counter.downloadRate != '0') {
                connectionStatus += "connectionDown";
            } else {
                connectionStatus += "connectionNone";
            }
        }
        vm.connectionCssClass(connectionStatus);
    }
    
    /**
     * 根据wifi状态获取wifi的图片资源
     * @method getWifiStatusImg
     */
    function getWifiStatusImg(status, deviceSize) {
		if (status) {
			if (deviceSize == 0) {
				return "./images/wifi0.png";
			} else {
				return "./images/wifi" + deviceSize + ".png";
			}
		} else {
			return "./images/wifi_off.png";
		}
	}

    /**
     * 将SIM卡状态转化为响应的文字描述
     * @method convertSimStatus
     * @return {String}
     */
    function convertSimStatus(status) {
        //modem_sim_undetected, modem_imsi_waitnck, modem_sim_destroy, modem_init_complete, modem_waitpin, modem_waitpuk
        var result;
        switch (status) {
            case "modem_init_complete":
                result = "./images/sim_detected.png";//$.i18n.prop("sim_status_ready");
                break;
            case "modem_waitpin":
                result = "./images/sim_undetected.png";//$.i18n.prop("sim_status_waitpin");
                break;
            case "modem_waitpuk":
                result = "./images/sim_undetected.png";//$.i18n.prop("sim_status_waitpuk");
                break;
            case "modem_sim_undetected":
                result = "./images/sim_undetected.png";//$.i18n.prop("sim_status_undetected");
                break;
            case "modem_undetected":
                result = "./images/sim_undetected.png";
                break;
            case "modem_imsi_waitnck":
                result = "./images/sim_undetected.png";//$.i18n.prop("sim_status_waitnck");
                break;
            case "modem_sim_destroy":
                result = "./images/sim_undetected.png";//$.i18n.prop("sim_status_destroy");
                break;
            case "modem_destroy":
                result = "./images/sim_undetected.png";//$.i18n.prop("sim_status_destroy");
                break;
            default:
                result = "./images/sim_detected.png";//$.i18n.prop("sim_status_ready");
                break;
        }
        return result;
    }

    /**
     * 将电量转化为对应图片
     * @method convertBatteryPers
     * @param pers
     * @param status
     */
    function convertBatteryPers(pers, status) {
    	var src = null;
		if ("0" == status) {
			if ("1" == pers) {
                $("#batteryStatus").attr("tipTitle","battery_level");
				src = "images/battery_one.png";
			} else if ("2" == pers) {
                $("#batteryStatus").attr("tipTitle","battery_level");
				src = "images/battery_two.png";
			} else if ("3" == pers) {
                $("#batteryStatus").attr("tipTitle","battery_level");
				src = "images/battery_three.png";
			} else if ("4" == pers) {
                $("#batteryStatus").attr("tipTitle","battery_level");
				src = "images/battery_full.png";
			} else { //"5" == pers || "0" == pers
                $("#batteryStatus").attr("tipTitle","battery_level");
				src = "images/battery_out.png";
			}
		} else {
            $("#batteryStatus").attr("tipTitle","charging");
			src = "images/battery_charging.gif";
		}
		return src;
    }
    
    gotoSmsList = function(){

        var href = '#device_messages';
        if(window.location.hash == '#device_messages'){
            href = '#sms';
    }
        //    location.hash == '#device_messages'
        if(checkFormContentModify(href)){
            window.location.hash = href;
        }

    };

    /**
     * 显示OTA升级结果
     * @method showOtaResult
     */
    function showOtaResult(otaResult) {
        if ((!($("#loading").is(":visible"))) && (!($("#confirm").is(":visible")))) {
            var msg = otaResult ? "ota_update_success" : "ota_update_failed";
            showAlert(msg, function () {
                if (config.UPGRADE_TYPE == "OTA") {
                    service.clearUpdateResult({}, $.noop());
                }
            });
        } else {
            window.setTimeout(function () {
                showOtaResult(otaResult)
            }, 1000);
        }
    }

    /**
     * 显示升级状态
     * @method showOtaStatus
     */
    function showOtaStatus() {
        _otaUpdateCancelFlag = true;
        if(!($("#progress").is(":visible"))){
            var info = service.getCurrentUpgradeState();
            if(info.current_upgrade_state == 'connecting_server' || info.current_upgrade_state == 'upgrading'
                || info.current_upgrade_state == 'accept' || info.current_upgrade_state == 'connect_server_success'){
                hideLoading();
                showOTAUpgradeStatus();
            }
        }
        var times = 0;
        var getOTAUpgradeState = function () {
            var data = null;
            if (times <= 3) {
                times = times + 1;
                data = service.getCurrentUpgradeState();
            } else {
                data = service.getCurrentUpgradeState();//getStatusInfo();
            }
            var state;
			if(!service.getFOTABatteryState()){
				state = 'low_battery';
			}else{
				state = data.current_upgrade_state;
			}
			
            if(_otaUpdateCancelFlag){
                if(state == 'connecting_server'){
                }else if(state == 'connect_server_failed') {
                    _otaUpdateCancelFlag = false;
                    window.clearTimeout(timer);
                    hideProgressBar();
                    showAlert('ota_connect_server_failed');
                    return;
                }else if(state == 'connect_server_success') {
                }else if(state == 'upgrading') {
                    getDownloadSize();
                }else if(state == 'download_success') {
                }else if(state == 'upgrade_pack_check_ok') {
                }else if(state == 'download_failed') {
                    hideProgressBar();
                    _otaUpdateCancelFlag = false;
                    showAlert('ota_download_failed');
                    window.clearTimeout(timer);
                    return;
                }else if(state == 'server_unavailable'){
                    hideProgressBar();
                    _otaUpdateCancelFlag = false;
                    showAlert('ota_connect_server_failed');
                    window.clearTimeout(timer);
                    return;
                }else if(state == 'network_unavailable'){
                    hideProgressBar();
                    _otaUpdateCancelFlag = false;
                    showAlert('ota_no_network');
                    window.clearTimeout(timer);
                    return;
                }else if(state == 'pkg_exceed'){
                    hideProgressBar();
                    _otaUpdateCancelFlag = false;
                    showAlert('ota_pkg_exceed');
                    window.clearTimeout(timer);
                    return;
                }else if(state == 'accept'){
                }else if(state == 'low_battery'){
                    hideProgressBar();
                    _otaUpdateCancelFlag = false;
                    showInfo('ota_low_battery');
                    window.clearTimeout(timer);
                    return;
                }else if(state == 'upgrade_pack_error'){
                    hideProgressBar();
                    _otaUpdateCancelFlag = false;
                    showInfo('ota_md5_error');
                    window.clearTimeout(timer);
                    return;
                }else if(state == 'upgrade_prepare_install'){
                    hideProgressBar();
                    _otaUpdateCancelFlag = false;
                    service.removeTimerThings('current_upgrade_state',function(){});
					//add set device update ---houailing
					service.setFOTAStartUpdate();
                    showInfo('ota_download_success');
                    window.clearTimeout(timer);
                    return;
                }else if(state == 'checking' || state == "fota_idle"){
                }else if(state == 'upgrade_pack_redownload'){
                }else{
                    _otaUpdateCancelFlag = false;
                    hideProgressBar();
                    window.clearTimeout(timer);
                    return;
                }
                timer = window.setTimeout(getOTAUpgradeState , 2000);
            }
        };

        if(_otaUpdateCancelFlag){
            timer = window.setTimeout(getOTAUpgradeState , 1000);
        }else{
            window.clearTimeout(timer);
        }
    }

    function getUserSelector(choice){
       // var selector = service.getUserChoice();
        if(choice){
            var info = getStatusInfo();
            if(!checkConnectedStatus(info.connectStatus)){
                showAlert("ota_network_disconnected");
                return;
            }
			
			startOTAUpgrade();

          /*  if(selector.if_has_select == 'none'){
                startOTAUpgrade();
            }else if(selector.if_has_select == 'accept'){
                showOtaStatus();
            }else if(selector.if_has_select == 'cancel'){
                showAlert("ota_have_cancel");
            }else if(selector.if_has_select == 'downloading_cancel'){
                showAlert("ota_have_cancel");
            }*/
        }else{
            /*if(selector.if_has_select == 'none'){
                cancelOTAUpgrade();
            }else if(selector.if_has_select == 'accept'){
                showOtaStatus();
            }else if(selector.if_has_select == 'cancel'){

            }else if(selector.if_has_select == 'downloading_cancel'){

            }*/
			
			cancelOTAUpgrade();
        }


    }

    function getDownloadSize(){
        service.getPackSizeInfo({}, function (data) {
            var percents;
           /* if (parseInt(data.pack_total_size) == 0) {
                percents = 0;
            } else {
                percents = parseInt(parseInt(data.download_size) * 100 / parseInt(data.pack_total_size));
            }
            if (percents > 100) {
                percents = 100;
            }*/
			percents = data.dl_process;
			
            if (percents > 0) {
                if (percents > 95) {
                    showProgressBar("ota_update", "<br/>" + $.i18n.prop("ota_update_warning"));
                }
                setProgressBar(percents);
            }
        });
    }

    function startOTAUpgrade(){
	
		//add download start--houailing
		service.setFOTAStartDownload();
		showOtaStatus();
		
       /* service.setUpgradeSelectOp({selectOp:'1'},function(result){
            if (result.result == "success"){
                showOtaStatus();
            }});*/
    }

    function cancelOTAUpgrade(){
       // service.setUpgradeSelectOp({selectOp:'0'},function(result){ });
	   
        _otaUpdateCancelFlag = false;
        hideLoading();
        showAlert('ota_cancel');
    }

    function showOTAUpgradeStatus() {
        var data = service.getMandatory();
        var isMandatory = data.is_mandatory;
        if (isMandatory) {
            showProgressBar("ota_update", "<br/>" + $.i18n.prop("ota_update_warning"));
        } else {
            var cancelHtml = "";
            if (config.UPGRADE_TYPE == "OTA") {
                cancelHtml = "<br/><br/><button id='btnStopUpgrade' onclick='stopOTAUpgrade();' class='btn-1 btn-primary'>" + $.i18n.prop("cancel") + "</button>";
            }
            showProgressBar("ota_update", "<br/>" + $.i18n.prop("ota_update_warning") + cancelHtml);
        }
        setProgressBar(0);
    }

    function showOTAConfirm(upgradeState) {
        var upgState = upgradeState.current_upgrade_state;
        if (upgState == 'upgrade_pack_redownload') {//y850 can not program this
            showConfirm("ota_interrupted", {ok: function () {
                getUserSelector(1);
            }, no: function () {
                getUserSelector(0);
            }});
        } else {
            var upgradingState = ["upgrade_prepare_install", "low_battery",
                "connecting_server", "connect_server_success", "upgrading", "accept"];
            if ($.inArray(upgState, upgradingState) != -1) {//downloading show this 
                showOtaStatus();
            } else {
                var info = service.getNewVersionInfo();
                var version = "";
                if (info.version) {
                    version = "<br/>" + $.i18n.prop('ota_version') + info.version;
                }
                showConfirm($.i18n.prop('ota_new_version') + version, {ok: function () {
                    getUserSelector(1);
                }, no: function () {
                    getUserSelector(0);
                }});
            }
        }
    }

    showOTAAlert = function () {
        var is_mandatory = service.getMandatory().is_mandatory;
        if (is_mandatory) {
            showOtaStatus();
        } else {
            var upgradeState = {};
            upgradeState = service.getCurrentUpgradeState();
            showOTAConfirm(upgradeState);
        }
    };

    /**
     * 终止OTA升级
     * @method stopOTAUpgrade
     */
    stopOTAUpgrade = function () {
        //service.setUpgradeSelectOp({selectOp:'2'},function(result){ });		
		//add cancel downloading ---houailing
		service.setFOTACancelDownload();
        _otaUpdateCancelFlag = false;
        window.clearTimeout(timer);
        hideLoading();
        showAlert('ota_cancel');
    };

    /**
     * 设置流量提醒是否提醒过
     * @method setTrafficAlertPopuped
     * @param {Boolean} val
     */
    function setTrafficAlertPopuped(val){
    	trafficAlertPopuped = !!val;
        trafficAlert100Popuped = !!val;
        if(!val){
            resetTrafficAlertPopuped = true;
        }
    }

    function setTrafficAlert100Popuped(val){
        trafficAlert100Popuped = !!val;
        if(!val){
            resetTrafficAlertPopuped = true;
        }
    }

    /**
     * 计算流量结构
     * @method getTrafficResult
     * @param {Object} info service.getStatusInfo()
     */
    function getTrafficResult(info){
        var trafficResult = {
            showConfirm : false,
            limitPercent : info.limitVolumePercent
        };
        if(info.limitVolumeType == '1'){
            var monthlyTraffic = parseInt(info.data_counter.monthlySent, 10) + parseInt(info.data_counter.monthlyReceived, 10);
            trafficResult.usedPercent = monthlyTraffic / info.limitVolumeSize * 100;
            if(trafficResult.usedPercent > trafficResult.limitPercent){
                trafficResult.showConfirm = true;
                trafficResult.type = 'data';
            }
        }else{
            trafficResult.usedPercent = info.data_counter.monthlyConnectedTime / info.limitVolumeSize * 100;
            if(trafficResult.usedPercent > trafficResult.limitPercent){
                trafficResult.showConfirm = true;
                trafficResult.type = 'time';
            }
        }
        return trafficResult;
    }
    
    return {
        init:init,
        setTrafficAlertPopuped: setTrafficAlertPopuped,
        setTrafficAlert100Popuped: setTrafficAlert100Popuped,
        getTrafficResult: getTrafficResult,
        showOTAAlert:showOTAAlert
    };
});