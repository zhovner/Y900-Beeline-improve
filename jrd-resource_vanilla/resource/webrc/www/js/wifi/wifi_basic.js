/**
 * @module wifi basic
 * @class wifi basic
 */
define([ 'jquery', 'knockout', 'config/config', 'service', 'underscore' ],

    function ($, ko, config, service, _) {

        var securityModes = _.map(config.AUTH_MODES, function (item) {
            return new Option(item.name, item.value);
        });

        function maxStationOption(max) {
            var options = [];
            for (var i = 1; i <= max; i++) {
                options.push(new Option(i, i));
            }
            return options;
        }

        /**
         * wifi basic view model
         * @class WifiBasicVM
         */
        function WifiBasicVM() {
            var self = this;
            var info = getWifiBasic(); 
            self.wifi_enable = ko.observable(info.wifi_enable);	
			if(info.wifi_enable == 2){
				self.wifi_enable = ko.observable(true);	
			}
            self.isShowSSIDInfoDiv = ko.observable(false);
            if(config.WIFI_SWITCH_SUPPORT) {
                if(info.wifi_enable == "1" || info.wifi_enable == "2") {
                    self.isShowSSIDInfoDiv(true);
                } else {
                    self.isShowSSIDInfoDiv(false);
                }
            } else {
                self.isShowSSIDInfoDiv(true);//如果不支持软开关，整个SSID信息块显示
            }
            self.showPassword = ko.observable(false);

			self.modes = ko.observableArray(securityModes);
            self.selectedMode = ko.observable(info.AuthMode);
            self.passPhrase = ko.observable(info.passPhrase);     
			self.maxStations = ko.observableArray(maxStationOption(info.MAX_Station_num));
			self.apIsolation = ko.observable(info.apIsolation == '1' ? '1' : '0');	
			if(info.wlan_mode == 0){
				self.ssid = ko.observable(info.SSID);
				self.broadcast = ko.observable(info.broadcast == '1' ? '1' : '0');
				self.selectedStation = ko.observable(info.MAX_Access_num);						
			}else{
				self.ssid = ko.observable(info.m_SSID);
				self.broadcast = ko.observable(info.m_broadcast == '1' ? '1' : '0');			
				self.selectedStation = ko.observable(info.m_MAX_Access_num);
			}
			



            self.clear = function (option) {
                if (option == "switch") {
					self.wifi_enable(info.wifi_enable);
                    
                } else if (option == "ssid1") {					
                    self.selectedMode(info.AuthMode);
                    self.passPhrase(info.passPhrase);
                    self.ssid(info.SSID);
                    self.broadcast(info.broadcast == '1' ? '1' : '0');
                    self.cipher = info.cipher;
                    self.selectedStation(info.MAX_Access_num);
                } else {
                    clearTimer();
                    clearValidateMsg();
                    init();
                }
            };

            /**
             * 检测wps是否开启，最大接入数是否超过最大值。
             *
             * @event checkSettings
             */
            self.checkSettings = function (ssid) {
                var status = getWpsInfo();
                if (!config.WIFI_SWITCH_SUPPORT && status.radioFlag == "0") {
                    showAlert('wps_wifi_off');
                    return true;
                }
                if (status.wpsFlag == '1') {
                    showAlert('wps_on_info');
                    return true;
                }               
                if (ssid == "switch") {
                    var result = service.getStatusInfo();
                    if (result.connectWifiSSID && (result.connectWifiStatus == "connecting" || result.connectWifiStatus == "connect")) {
                        showAlert('cannot_operate_when_wifi_connected');
                        return true;
                    }
                }
                return false;
            };

            self.saveSSID1 = function () {
                if (self.checkSettings("ssid1")) {
                    return;
                }
                showConfirm('wifi_disconnect_confirm', function(){
                    self.saveSSID1Action();
                });
            };
            /**
             * 保存SSID1的设置
             *
             * @event saveSSID1
             */
            self.saveSSID1Action = function () {
                showLoading('operating');
                var params = {};
				/*no change param*/
				params.wlan_mode = info.wlan_mode;
				params.cipher = info.cipher;
				params.channel = info.channel;
				params.channel_5g = info.channel_5g;
				params.curr_num = info.curr_num;
				params.wep_key = info.wep_key;
				params.wep_sec = info.wep_sec;
				params.wifi_country_code = info.wifi_country_code;
				params.wmode = info.wmode;
				params.wmode_5g = info.wmode_5g;
				
		    	/*other params*/
                params.AuthMode = self.selectedMode();
                params.passPhrase = self.passPhrase();
                params.cipher = self.selectedMode() == "WPA2PSK" ? 1: 2;
                params.apIsolation = self.apIsolation();
				params.wifi_enable = self.wifi_enable();
				if(info.wlan_mode == 0){
					params.SSID = self.ssid();
					params.broadcast = self.broadcast();
					params.station = self.selectedStation();
					params.m_SSID = info.m_SSID;
					params.m_broadcast = info.m_broadcast;
					params.m_station = info.m_MAX_Access_num;
				}else{
					params.SSID = info.SSID;
					params.broadcast = info.broadcast;
					params.station = info.MAX_Access_num;
					params.m_SSID = self.ssid();
					params.m_broadcast = self.broadcast();
					params.m_station = self.selectedStation();
				}
				
                service.setWifiBasic(params, function (result) {
                    if (result.result == "success") {  
						var getWifiRebootReady = function () {
							var data = service.getWifiBasic();	//console.info(data.wifi_enable);					
							if (data.wifi_enable == "1") {								
								successOverlay();
								self.clear();
							} else {
								setTimeout(getWifiRebootReady, 2000);								
							}							
						};
						getWifiRebootReady();  	                        
                    } else {
                        errorOverlay();
                    }                    
                });
            };

            /**
             * 设置Wifi开关
             *
             * @event seWifiSwitch
             */
            self.seWifiSwitch = function () {
                if (self.checkSettings("switch")) {
                    return;
                }
				if(self.wifi_enable() == "0"){
                    showConfirm3("cus_notice", function(){
                        var setSwitch = function () {
                            showLoading('operating');
                            var params = {};                           
                            params.wifi_enable = self.wifi_enable();
							
                            service.setWifiSwitch(params, function (result) {
                                if (result.result == "success") {
                                    successOverlay();
                                    self.clear();
                                } else {
                                    errorOverlay();
                                }                               
                            });
                        };
						setSwitch();	
                    });
                }else{
                    var setSwitch = function () {
                        showLoading('operating');
                        var params = {};                      
                        params.wifi_enable = self.wifi_enable();
                        
                        service.setWifiSwitch(params, function (result) {
                            if (result.result == "success") {
                                successOverlay();
                                self.clear();
                            } else {
                                errorOverlay();
                            }                           
                        });
                    }; 
					setSwitch();	
                }
            };

            /**
             * SSID1密码显示事件
             *
             * @event showPasswordHandler
             */
            self.showPasswordHandler = function () {
                $("#passShow").parent().find(".error").hide();
                var checkbox = $("#showPassword:checked");
                if (checkbox && checkbox.length == 0) {
                    self.showPassword(true);
                } else {
                    self.showPassword(false);
                }
            };

        }

        /**
         * 获取wifi基本信息
         * @method getWifiBasic
         * @return {Object}
         */
        function getWifiBasic() {
            return service.getWifiBasic();
        }

        /**
         * 获取wps信息
         * @method getWpsInfo
         */
        function getWpsInfo() {
            return service.getWpsInfo();
        }

        /**
         * 初始化wifi基本view model
         * @method init
         */
        function init() {
            $("#dropdownMain").show();
            
            var container = $('#container');
            ko.cleanNode(container[0]);
            var vm = new WifiBasicVM();
            ko.applyBindings(vm, container[0]);

            function checkWifiStatus() {
                var info = service.getAPStationBasic();
                if (info.ap_station_enable == "1") {
                    $('#frmSSID1 :input').each(function () {
                        $(this).attr("disabled", true);
                    });
                } else {
                    $('#frmSSID1 :input').each(function () {
                        $(this).attr("disabled", false);
                    });
                }
            }

           /* if (config.AP_STATION_SUPPORT) {
                checkWifiStatus();
            }*/
            //clearTimer();
            //addInterval(checkWifiStatus, 1000);

            $('#frmWifiSwitch').validate({
                submitHandler:function () {
                    vm.seWifiSwitch();
                }
            });
            $('#frmSSID1').validate({
                submitHandler:function () {
                    vm.saveSSID1();
                },
                rules:{
                    ssid:'ssid',
                    pass:'wifi_password_check',
                    passShow:'wifi_password_check'
                },
                errorPlacement:function (error, element) {
                    var id = element.attr("id");
                    if (id == "pass" || id == "passShow") {
                        error.insertAfter("#passShow");
                    } else {
                        error.insertAfter(element);
                    }
                }
            });
        }

        return {
            init:init
        };
    });
