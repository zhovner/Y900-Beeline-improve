/**
 * HOME模块
 * @module Home
 * @class Home
 */
define([ 'jquery', 'knockout', 'config/config', 'service', 'underscore', 'status/statusBar' ],

function($, ko, config, service, _, statusBar) {

	/**
	 * connection information ViewModel
	 * 
	 * @class connectInfoVM
	 */
	function connectInfoVM() {
		var self = this;
		var info = service.getConnectionInfo();
		self.connectStatus = ko.observable(info.connectStatus);
		if (checkConnectedStatus(info.connectStatus)) {
			self.current_Flux = ko.observable(transUnit(parseInt(info.data_counter.currentReceived, 10) + parseInt(info.data_counter.currentSent, 10), false));
			//self.total_Flux = ko.observable(transUnit(parseInt(info.data_counter.totalSent, 10) + parseInt(info.data_counter.totalReceived, 10), false));
			self.connected_Time = ko.observable(transSecond2Time(info.data_counter.currentConnectedTime));
			self.up_Speed = ko.observable(transUnit(info.data_counter.uploadRate, true));
			self.down_Speed = ko.observable(transUnit(info.data_counter.downloadRate, true));
		} else {
			self.current_Flux = ko.observable(transUnit(0, false));
			self.connected_Time = ko.observable(transSecond2Time(0));
			self.up_Speed = ko.observable(transUnit(0, true));
			self.down_Speed = ko.observable(transUnit(0, true));
		}
        self.hasWifi = ko.observable(config.HAS_WIFI);
		self.transText = ko.dependentObservable(function() {
			if (checkConnectedStatus(self.connectStatus())) {
				return "disconnect";
			} else {
				return "connect";
			}
		});
		
		self.canConnect = ko.observable(getCanConnectNetWork());
		self.connectStatusText = ko.dependentObservable(function() {
			self.canConnect();
			
			if (checkConnectedStatus(self.connectStatus())) {
				return $.i18n.prop("disconnect");
			} else {
				return $.i18n.prop("connect");
			}
		});
		self.imagePath = ko.dependentObservable(function() {
			if (checkConnectedStatus(self.connectStatus())) {
				return "images/connect.png";
			} else if(self.connectStatus() == 'ppp_disconnected'){
				return "images/disconnect.png";
			} else if(self.connectStatus() == 'ppp_connecting'){
				return "images/connecting.gif";
			} else {
				return "images/disconnecting.gif";
			}
		});

        //var devices = service.getCurrentlyAttachedDevicesInfo();
        var dev = fixAttachedDevicesInfo([]);
        self.deviceInfo = ko.observable(dev);		

		/**
		 * 响应连接按钮事件
		 * 
		 * @event connectHandler
		 */
		self.connectHandler = function() {
			if (checkConnectedStatus(self.connectStatus())) {
                showLoading('disconnecting');
				service.disconnect({}, function(data) {
					if(data.result){
						successOverlay();
					} else {
						errorOverlay();
					}
				});
			} else {
                if(service.getStatusInfo().roamingStatus) {
                    showConfirm('dial_roaming_connect', function(){
                        self.connect();
                    });
                } else {
                    self.connect();
                }
			}
		};

        self.connect = function() {
            var statusInfo = service.getStatusInfo();
            var trafficResult = statusBar.getTrafficResult(statusInfo);
            if(statusInfo.limitVolumeEnable && trafficResult.showConfirm){
                var confirmMsg = null;
                if(trafficResult.usedPercent > 100){
                    confirmMsg = {msg: 'traffic_beyond_connect_msg'};
                    statusBar.setTrafficAlertPopuped(true);
                } else {
                    confirmMsg = {msg: 'traffic_limit_connect_msg', params: [trafficResult.limitPercent]};
                    statusBar.setTrafficAlert100Popuped(false);
                }
                showConfirm(confirmMsg, function(){
                    doConnect();
                });
            }else{
                doConnect();
            }
        };
	}

    function doConnect(){
        showLoading('connecting');
        service.connect({}, function(data) {
            if(data.result){
                successOverlay();
            } else {
                errorOverlay();
            }
        });
    }

    function fixAttachedDevicesInfo(devices) {
        var emptyInfo = {
            macAddress:"",
            ipAddress:"",
            hostName:"",
            timeConnected:""
        };
        var deviceNum = 0;
        if (devices) {
            deviceNum = devices.length;
        } else {
            devices = [];
        }
		var info = service.getWifiBasic();
        var emptyLen = info.MAX_Station_num - deviceNum;
        for (var i = 0; i < emptyLen; i++) {
            devices.push(emptyInfo);
        }
        return devices;
    }

    function getCanConnectNetWork(){
        var status = service.getStatusInfo();
        if (status.simStatus != "modem_init_complete") {
            return false;
        }
        
        if (checkConnectedStatus(status.connectStatus)) {
            if (config.AP_STATION_SUPPORT) {
                var ap = service.getAPStationBasic()
                if (ap.ap_station_enable == "1") {
                    var result = service.getConnectionMode();
                    if (result.connectionMode == "auto_dial") {
                        return false;
                    }
                }
            }
            return true;
        }
	
	//如果已联网，但是没有信号，断网按钮需要可以用
        if (status.signalImg == "0") {
            return false;
        }
        var networkTypeTmp = status.networkType.toLowerCase();
        if (networkTypeTmp == '' || networkTypeTmp == 'limited_service' || networkTypeTmp == 'no_service') {
            return false;
        }
        if("ppp_connecting"==status.connectStatus || "ppp_disconnecting"==status.connectStatus){
            return false;
        }
        if (config.AP_STATION_SUPPORT) {
            var ap = service.getAPStationBasic()

            if (status.connectWifiStatus == "connect") {
                if (ap.ap_station_mode == "wifi_pref") {
                    return false;
                }
            }
        }

        return true;
    }

    function refreshHomeData(connectionVM){
        var info = service.getConnectionInfo();
        connectionVM.connectStatus(info.connectStatus);
        if (checkConnectedStatus(info.connectStatus)) {
            connectionVM.current_Flux(transUnit(parseInt(info.data_counter.currentReceived, 10) + parseInt(info.data_counter.currentSent, 10), false));
            //connectionVM.total_Flux(transUnit(parseInt(info.data_counter.totalSent, 10) + parseInt(info.data_counter.totalReceived, 10), false));
            connectionVM.connected_Time(transSecond2Time(info.data_counter.currentConnectedTime));
            connectionVM.up_Speed(transUnit(info.data_counter.uploadRate, true));
            connectionVM.down_Speed(transUnit(info.data_counter.downloadRate, true));
        } else {
            connectionVM.current_Flux(transUnit(0, false));
            //connectionVM.total_Flux(transUnit(parseInt(info.data_counter.totalSent, 10) + parseInt(info.data_counter.totalReceived, 10), false));
            connectionVM.connected_Time(transSecond2Time(0));
            connectionVM.up_Speed(transUnit(0, true));
            connectionVM.down_Speed(transUnit(0, true));
        }
        connectionVM.canConnect(getCanConnectNetWork());
    }

    function refreshAttachedDevicesInfo(connectionVM, callback) {
        service.getCurrentlyAttachedDevicesInfo({}, function (devices) {
            var dev = fixAttachedDevicesInfo(devices.attachedDevices);
            connectionVM.deviceInfo(dev);
            if ($.isFunction(callback)) {
                callback();
            }
        });
    }

    function refreshAttachedDevicesInterval(connectionVM) {
        refreshAttachedDevicesInfo(connectionVM, function () {
            addTimeout(function () {
                refreshAttachedDevicesInterval(connectionVM);
            }, 1000);
        });
    }

    /**
	 * 初始化vm
	 * 
	 * @method init
	 */
	function init() {
		var container = $('#container')[0];
		ko.cleanNode(container);

		var connectionVM = new connectInfoVM();
		ko.applyBindings(connectionVM, container);

		$('#frmHome').validate({
			submitHandler : function() {
				connectionVM.connectHandler();
			}
		});

        refreshHomeData(connectionVM);
		addInterval(function() {
            refreshHomeData(connectionVM);
        }, 1000);

        refreshAttachedDevicesInterval(connectionVM);
	}

    return {
        init:init,
        refreshAttachedDevicesInfo:refreshAttachedDevicesInfo
    };
});