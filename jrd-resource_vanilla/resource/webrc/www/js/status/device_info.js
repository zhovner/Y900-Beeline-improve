define([ 'jquery', 'service', 'knockout', 'config/config' ], function ($, service, ko, config) {

    function DeviceInformationViewModel() {
        var self = this;
        var data = service.getDeviceInfo();
        var info = getStatusInfo(); 
        var netInfo = getNetSelectInfo();
        var apnSettings = service.getCurrentProfile();
		var wanInfo = service.getConnectionInfo();
        var setting = getSmsSetting();
        self.currentText = ko.observable('connection');
        self.currentText2 = ko.observable('connection');
        self.ssid = ko.observable(verifyDeviceInfo(data.ssid));
        self.m_ssid = ko.observable(verifyDeviceInfo(data.m_ssid));
        self.m_max_access_num = ko.observable(verifyDeviceInfo(data.m_max_access_num));
        self.showMssid = ko.observable(data.multi_ssid_enable == "1" && config.HAS_MULTI_SSID);
        self.ipAddress = ko.observable(verifyDeviceInfo(service.getLanInfo().ipAddress));
        self.wanIpAddress = ko.observable(wanInfo.wan_ip);
        self.ipv6WanIpAddress = ko.observable(wanInfo.wan_ip6);
        self.macAddress = ko.observable(verifyDeviceInfo(data.macAddress));
        self.simSerialNumber = ko.observable(verifyDeviceInfo(setting.centerNumber));
        self.lanDomain = ko.observable(verifyDeviceInfo(data.lanDomain));
        self.imei = ko.observable(verifyDeviceInfo(data.imei));
        self.sw_version = ko.observable(verifyDeviceInfo(data.web_version));
        self.fw_version = ko.observable(verifyDeviceInfo(data.fw_version));
        self.hw_version = ko.observable(verifyDeviceInfo(data.hw_version));
        self.max_access_num = ko.observable(verifyDeviceInfo(data.max_access_num));
        self.showMacAddress = ko.observable(config.SHOW_MAC_ADDRESS);
        self.hasWifi = ko.observable(config.HAS_WIFI);
        var ipv6Mode = "IP";//data.ipv6PdpType.toLowerCase().indexOf("v6") > 0;
        //self.showIpv6WanIpAddr = ko.observable(config.IPV6_SUPPORT && ipv6Mode);
        self.showIpv6WanIpAddr = ko.observable();
        self.showIpv4WanIpAddr = ko.observable();
        self.imsi = ko.observable(verifyDeviceInfo(data.imsi));
        self.signal = ko.observable(signalFormat(data.signal));
        var roamStatus=info.roamingStatus?true:false;
        self.networkOperator = ko.observable(wanInfo.network_name);
        //self.networkOperatorSPN = ko.observable(getNetWorkProvider(info.spn_b1_flag,info.spn_name_data,info.spn_b2_flag,info.networkOperator,roamStatus));
        self.networkOperatorSPN = ko.observable(wanInfo.network_name);
        self.selectedType = ko.observable(getNetworkType("auto_select_type_" + netInfo.net_select));
        self.pppStatus = ko.observable(getPPPStatus(wanInfo.connectStatus));
        self.selectMode = ko.observable(getNetType(info.connectionMode_t));
        self.selectedProfile = ko.observable(apnSettings.profileName || "--");
        self.apn = ko.observable(apnSettings.wanApn || "--");
        self.apnV6 = ko.observable(apnSettings.wanApnV6 || "--");
        self.dnsPriAddrV4 = ko.observable(verifyDeviceInfo(apnSettings.dns_mode_v4 == "auto" ? wanInfo.ip4_pri_dns : apnSettings.dnsPriAddrV4_manual));
		self.dnsSecAddrV4 = ko.observable(verifyDeviceInfo(apnSettings.dns_mode_v4 == "auto" ? wanInfo.ip4_sec_dns : apnSettings.dnsSecAddrV4_manual));
		self.dnsPriAddrV6 = ko.observable(verifyDeviceInfo(apnSettings.dns_mode_v6 == "auto" ? wanInfo.ip6_pri_dns : apnSettings.dnsPriAddrV6_manual));
        self.dnsSecAddrV6 = ko.observable(verifyDeviceInfo(apnSettings.dns_mode_v6 == "auto" ? wanInfo.ip6_sec_dns : apnSettings.dnsSecAddrV6_manual));
      
	  	self.capabilitySMSForSIM = ko.observable();
        self.capabilityPbmForSIM = ko.observable(updatePhmCapabilityStatus());
        self.modelText = ko.observable(data.modelName);

        if (config.IPV6_SUPPORT) {//支持IPV6
            if (apnSettings.pdpType == "IP") {//ipv4
                self.showIpv6WanIpAddr(false);
                self.showIpv4WanIpAddr(true);
            } else if (apnSettings.pdpType == "IPv6") {
                    self.showIpv6WanIpAddr(true);
                    self.showIpv4WanIpAddr(false);
            } else {
                    self.showIpv6WanIpAddr(true);
                    self.showIpv4WanIpAddr(true);
            }
        } else {//不支持IPV6
            self.showIpv6WanIpAddr(false);
            self.showIpv4WanIpAddr(true);
        }
        //联网时显示万网地址，否则为空
        var connectStatus = getConnectStatus(wanInfo.connectStatus);
        if (connectStatus == 1) {
        	 self.wanIpAddress(verifyDeviceInfo(wanInfo.wan_ip));
             self.ipv6WanIpAddress(verifyDeviceInfo(wanInfo.wan_ip6));
        } else if (connectStatus == 2) {
        	 self.wanIpAddress(verifyDeviceInfo(wanInfo.wan_ip));
             self.ipv6WanIpAddress(verifyDeviceInfo(wanInfo.wan_ip6));
        } else if (connectStatus == 3) {
            self.wanIpAddress(verifyDeviceInfo(wanInfo.wan_ip));
            self.ipv6WanIpAddress(verifyDeviceInfo(wanInfo.wan_ip6));
        } else {
            self.wanIpAddress("--");
            self.ipv6WanIpAddress("--");
        }

        self.wifiRange = ko.observable("wifi_" + data.wifiRange);
        function getSmsSetting() {
            return service.getSmsSetting();
        }

        function updateSmsCapabilityStatus() {
            service.getSmsCapability({}, function (capability) {
                if((capability.simUsed && capability.simUsed != "") || (capability.simTotal && capability.simTotal != "")){
                 //   $("#simCap").text((capability.simUsed > capability.simTotal ? capability.simTotal : capability.simUsed) + "/" + capability.simTotal);
                   /* self.capabilitySMSForSIM((capability.simUsed > capability.simTotal ? capability.simTotal : capability.simUsed) + "/" + capability.simTotal); modify by houailing, change used/total to new/used */
				   self.capabilitySMSForSIM(capability.simNew + "/" + capability.simUsed);
                }else{
               //     $("#simCap").text("0 / 0");
                    self.capabilitySMSForSIM("0 / 0");
                }
            });
        }
        updateSmsCapabilityStatus();
        function updatePhmCapabilityStatus() {
                var capability =  service.getSIMPhoneBookCapacity();
                if((capability.simPbmUsedCapacity && capability.simPbmUsedCapacity != "") || (capability.simPbmTotalCapacity && capability.simPbmTotalCapacity != "")){
                    return  capability.simPbmUsedCapacity  + "/" + capability.simPbmTotalCapacity ;
                }else{
                    return "0 / 0";
                }
        }
        self.showConnectModeItem = function(item){
            if(item == "modem"){
                // $("#currentStatus").text($.i18n.prop("mod_sim"));
                self.currentText($.i18n.prop("mod_sim"));
                self.currentText2("mod_sim");
                $("#connect_menu_current").hide();
                $("#modem_menu_current").show();
                $("#modemSIM").show();
                $("#connectDiv").hide();
            }else{
                //  $("#currentStatus").text($.i18n.prop("connection"));
                self.currentText($.i18n.prop("connection"));
                self.currentText2("connection");
                $("#modem_menu_current").hide();
                $("#connect_menu_current").show();
                $("#modemSIM").hide();
                $("#connectDiv").show();
            }
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
     * 获取网络选择信息
     * @method getNetSelectInfo
     */
    function getNetSelectInfo() {
        return service.getNetSelectInfo();
    }

    /**
     * 获取apn相关信息
     * @method getApnSettings
     */
    function getApnSettings(){
        var settings = service.getApnSettings();
       // settings.ipv6ApnConfigs = getApnConfigs(settings.ipv6APNs, true);
     //   settings.apnConfigs = getApnConfigs(settings.APNs, false);
    //    settings.autoApnConfigs = getAutoApns(settings.autoApns, settings.autoApnsV6);
        return settings;
    }
    function getNetWorkProvider(spn_b1_flag,spn_name_data,spn_b2_flag,network_provider,roamStatus){
        if(spn_name_data==""){
            return "--";
        }else{
            spn_name_data=decodeMessage(spn_name_data);

            if(spn_b1_flag=="1" && spn_b2_flag=="1"){
                if(roamStatus){//漫游
                    return "--";
                }else{//不漫游
                    return spn_name_data;
                }
            }else if(spn_b1_flag=="1"){
                if(roamStatus){//漫游
                    return spn_name_data;
                }else{//不漫游
                    return spn_name_data;
                }
            }else if(spn_b2_flag=="1"){
                if(roamStatus){//漫游
                    return "--";
                }else{//不漫游
                    return spn_name_data;
                }
            }else if(spn_b1_flag=="0" && spn_b2_flag=="0"){
                if(roamStatus){//漫游
                    return spn_name_data;
                }else{//不漫游
                    return spn_name_data;
                }
            }
            return "--";
        }
    }
    function verifyDeviceInfo(field) {
        if (field && field != "") {
            return field;
        } else {
            return "--";
        }
    }

    function getConnectStatus(status) {
        if (status == "ppp_disconnected" || status == "ppp_connecting" || status == "ppp_disconnecting") {
            return 0;
        } else if (status == "ppp_connected") {
            return 1;
        } else if (status == "ipv6_connected") {
            return 2;
        } else if (status == "ipv4_ipv6_connected") {
            return 3;
        }
    }
    function getNetType(type){
        var typeStatus;
        if(type == "auto_dial"){
            typeStatus =  "auto_select";
        }else{
            typeStatus =  "manual_select";
        }
        $("#selectMode").attr("trans",typeStatus);
        return typeStatus;
    }
    function getPPPStatus(status){
        var connectStatus;
        if (status == "ppp_connecting") {
            connectStatus="ppp_connecting";
        } else if(status == "ppp_disconnecting"){
            connectStatus="ppp_disconnecting";
        }else if(status == "ppp_disconnected"){
            connectStatus="ppp_disconnected";
        }else{
            connectStatus="ppp_connected";
        }
      //  $("#connectStatus").attr("trans", connectStatus);
        if( typeof status == "undefined"){
             return "";
        }
        return $.i18n.prop(connectStatus);
    }
   function getNetworkType(typeStatus){
       var networkTypeText;
       networkTypeText = typeStatus;
        $("#selectedType").attr("trans",networkTypeText);
        return networkTypeText;
    }
    function signalFormat(signal) {
        if (signal) {
            return signal + " "+ $.i18n.prop("dBm");
        } else {
            return "--";
        }
    }

    function init() {
        $("#dropdownMain").show();
        var container = $('#container')[0];
        ko.cleanNode(container);
        var vm = new DeviceInformationViewModel();
        ko.applyBindings(vm, container);
        $("#connectDiv").show();
        addInterval(function () {
            service.getDeviceInfo({}, function (data) {
                vm.signal(signalFormat(data.signal));
            });
            var statusInfo =  service.getStatusInfo();
            vm.pppStatus(getPPPStatus(statusInfo.connectStatus));
			vm.networkOperator(statusInfo.networkOperator);
			vm.networkOperatorSPN(statusInfo.networkName);
        }, 6000);
    }

    return {
        init:init
    };
});