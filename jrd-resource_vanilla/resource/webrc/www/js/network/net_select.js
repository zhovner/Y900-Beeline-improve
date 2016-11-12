/**
 * 选网模块
 * @module net_select
 * @class net_select
 */
define([ 'jquery', 'knockout', 'config/config', 'service', 'underscore' ],

function($, ko, config, service, _) {
	
	var selectModes = _.map(config.AUTO_MODES, function(item) {
		return new Option(item.name, item.value);
	});

    /**
     * 选网功能view model
     * @class NetSelectVM
     */
	function NetSelectVM() {
		var self = this;

        self.enableFlag = ko.observable(true);
        self.types = ko.observableArray(selectModes);
		self.selectedType = ko.observable();
		self.selectMode = ko.observable();
		self.networkList = ko.observableArray([]);
		self.selectNetwork = ko.observable('');

        self.networkStatus = function(data) {
            return $.i18n.prop(getNetworkStatus(data.nState));
        };

        self.networkStatusId = function(data) {
            return getNetworkStatus(data.nState);
        };

		self.networkText = function(data) {
			return data.strNumeric;
		};

        self.operatorName = function(data) {
            return data.strShortName;
        };

        self.networkType = function(data) {
            var result = getNetworkType(data.nRat);
            if(result == "auto")
                result = $.i18n.prop("auto");
            return result;
        };

        self.radioEnable = function(data){
        	return data.nState != 3;
            //return data.radioEnabled;
        };

        self.networkTypeId = function(data) {
            return getNetworkType(data.nRat);
        };

		self.networkValue = function(data) {
			var result = [];
			//strNumeric
			result.push(data.strNumeric);
			//nRat
			result.push(data.nRat);
			
			return result.join(',');
		};

        /**
         * 自动选网时设置网络模式
         * @method save
         */
		self.save = function() {
			showLoading('operating');
			
			//AutoSelect call SetBearerPreference
			var params = {};
			params.strBearerPreference = self.selectedType();
			service.setBearerPreference(params, function(result) {
				if (result.result == "success") {
                    self.networkList([]);
					successOverlay();
				} else {
					errorOverlay();
				}
			});
		};

        /**
         * 手动搜网
         * @method search
         */
		self.search = function() {
			showLoading('searching_net');
            var status = service.getStatusInfo();
            var mccAndMnc = "46001";//status.mdmMcc + "" + status.mdmMnc;
			net_select = self.selectedType();
			service.scanForNetwork(net_select,function(result, networkList2) {
				hideLoading();
                var networkList = [];
                var mccmncs = ["25099","28301","28204","40101","43605","25502","25503","43404","43701"];
				if (result) {
                    if ($.inArray(mccAndMnc, mccmncs) != -1){
                    for(var i = 0 ; i < networkList2.length; i++){
                            networkList.push({
                                strShortName: networkList2[i].strShortName,
                                strNumeric: networkList2[i].strNumeric,
                                nRat: networkList2[i].nRat,
                                nState: networkList2[i].nState,
                                nId:networkList2[i].nId,
                                radioEnabled: $.inArray(networkList2[i].strNumeric,mccmncs) != -1? true : false
                            })
                        }
                    }else{
                        networkList = networkList2;
                    }
					self.networkList(networkList);
                    for (var i = 0; i < networkList.length; i++) {
                        var n = networkList[i];
                        if (n.nState == SE_NW_STATE_CURRENT) {
                            self.selectNetwork(n.strNumeric + ',' + n.nRat);
                            return;
                        }
                    }
				} else {
					self.networkList([]);
				}
			});
		};

        /**
         * 注册选择的网络
         * @method register
         */
		self.register = function() {
			showLoading('registering_net');
			
			/* strShortName: networkList2[i].strShortName,
             strNumeric: networkList2[i].strNumeric,
             nRat: networkList2[i].nRat,
             nState: networkList2[i].nState,
             nId:networkList2[i].nId*/
			
			var networkToSet = self.selectNetwork().split(',');
			var networkSelList = self.networkList();
			var nId = -1;
			for ( var i = 0; i < networkSelList.length; i++)
			{
				if (networkSelList[i].nRat == parseInt(networkToSet[1]) && networkSelList[i].strNumeric == networkToSet[0])
				{
					nId = parseInt(networkSelList[i].nId);
				}
			}
			if (nId == -1)
			{
				errorOverlay();
			}
			service.setNetwork(networkToSet[0], parseInt(networkToSet[1]),nId, function(result) {
				if (result) {
					self.networkList([]);
					successOverlay();
                    var info2 = getNetSelectInfo();
                    self.selectedType(info2.net_select); 
				} else {
					self.networkList([]);
					errorOverlay();
					self.selectedType("NETWORK_auto"); 
					self.selectMode("auto_select");
				}
			});
		};

        self.checkEnable = function() {
            var status = service.getStatusInfo();
            if (checkConnectedStatus(status.connectStatus) || status.connectStatus == "ppp_connecting") {
                self.enableFlag(false);
            }
            else {
                self.enableFlag(true);
            }
        };

		//init data
		self.checkEnable();
        var info = getNetSelectInfo();
		if ("manual_select" == info.net_select_mode || "manual_select" == info.m_netselect_save){
			self.selectMode("manual_select");
		}
		else {
			self.selectMode("auto_select");
		}

        self.selectedType(info.net_select);
	}

    /**
     * 获取网络选择信息
     * @method getNetSelectInfo
     */
	function getNetSelectInfo() {
		return service.getNetSelectInfo();
	}

    /**
     * 搜网结果中的状态转换为对应的语言项
     * @method getNetworkStatus
     * @param {String} status
     * @return {String}
     */
	function getNetworkStatus(status) {
		if (SE_NW_STATE_AVAILABLE == status){
			return "available";
		}else if (SE_NW_STATE_CURRENT == status){
			return "current";
		}else if (SE_NW_STATE_FORBIDDEN == status){
			return "forbidden";
		}else {
			return "unknown";
		}
	}

    /**
     * 网络类型转换
     * @method getNetworkType
     * @param {String} type
     * @return {String}
     */
	function getNetworkType(type)
	{		serviceValue = "auto";
		 switch(type){
	        case SE_NW_TYPE_GSM:
	            serviceValue = "2G";
	            break;
	        case SE_NW_TYPE_UMTS:
	            serviceValue = "3G";
	            break;
	        case SE_NW_TYPE_LTE:
	            serviceValue = "4G";
	            break;
	        case SE_NW_TYPE_TD_SCDMA:
	        	serviceValue = "TD_SCDMA";
	            break;
	        default:
	        	serviceValue =  "auto";
	    }
		 return serviceValue;
	}

    /**
     * 初始化选网功能view model
     * @method init
     */
	function init() {
        $("#dropdownMain").show();
        
		var container = $('#container');
		ko.cleanNode(container[0]);
		var vm = new NetSelectVM();
		ko.applyBindings(vm, container[0]);
		
		addInterval( vm.checkEnable, 1000);
	}

	return {
		init : init
	};
});