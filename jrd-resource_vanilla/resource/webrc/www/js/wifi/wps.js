/**
 * @module wps
 * @class wps
 */
define([ 'jquery', 'knockout', 'config/config', 'service', 'underscore' ],

function($, ko, config, service, _) {

	/**
	 * WPS View Model
	 * @class WpsVM
	 */
	function WpsVM() {
        var self = this;
        var info = getWpsInfo();
        self.wpsType = ko.observable('');
        self.wpsPin = ko.observable('');
        //wps on/off
        self.wpsFlag = ko.observable(info.wpsFlag);       
        //radio on/off
        self.radioFlag = ko.observable(info.radioFlag);	
				
        self.save = function() {
            var info = getWpsInfo();
		
            if(info.radioFlag == '0') {
                showAlert('wps_wifi_off');
                return;
            }

            if(info.wpsFlag == '1') {
                showAlert('wps_on_info');
                return true;
            }

			var basic=service.getWifiBasic();
			if(basic.wlan_mode == 0){
				if(basic.broadcast=='1'){
					showAlert('wps_ssid_broadcast_disable');
                    return ;
				}
			}else if(basic.wlan_mode == 1){
				if(basic.m_broadcast=='1'){
					showAlert('wps_ssid_broadcast_disable');
                    return ;
				}
			}

            showLoading('operating');
            var params = {};
            params.wpsType = self.wpsType();
            params.wpsPin = self.wpsPin();  
			
            service.openWps(params, function(result) {
                if (result.result == "success") {
                    self.wpsPin('');
                    clearValidateMsg();
                    successOverlay();
                } else {
                    errorOverlay();
                }
            });

        };
        
        self.wpsType('PIN');
    }

    /**
     * 获取wps相关信息
     * @method getWpsInfo
     */
    function getWpsInfo() {
        return service.getWpsInfo();
    }

    /**
     * 初始化wps view model
     * @method init
     */
	function init() {
        $("#dropdownMain").show();
        
		var container = $('#container');
		ko.cleanNode(container[0]);
		var vm = new WpsVM();
		ko.applyBindings(vm, container[0]);
		$('#wpsForm').validate({
			submitHandler : function() {
				vm.save();
			},
            rules: {
                txtPin: "wps_pin_length_check"
            }
		});

	}

	return {
		init : init
	};
});