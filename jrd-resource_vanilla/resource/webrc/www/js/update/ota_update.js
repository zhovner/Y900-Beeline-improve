define([ 'jquery', 'service', 'knockout', 'config/config', 'status/statusBar'], function ($, service, ko, config, status) {

    function OTAUpdateVM() {
        var self = this;
        var setting = service.getOTAUpdateSetting();
        self.updateMode = ko.observable(setting.updateMode);
        self.updateIntervalDay = ko.observable(setting.updateIntervalDay);
        self.allowRoamingUpdate = ko.observable(setting.allowRoamingUpdate);

        self.clickAllowRoamingUpdate = function () {
            var checkbox = $("#chkUpdateRoamPermission:checked");
            if (checkbox && checkbox.length == 0) {
                self.allowRoamingUpdate("1");
            } else {
                self.allowRoamingUpdate("0");
            }
        };

        self.apply = function () {
            var para = {
                updateMode: self.updateMode(),
                updateIntervalDay: self.updateIntervalDay(),
                allowRoamingUpdate: self.allowRoamingUpdate()
            };
            showLoading('operating');
            service.setOTAUpdateSetting(para, function (data) {
                if (data && data.result == "success") {
                    setting.allowRoamingUpdate = self.allowRoamingUpdate();
                    successOverlay();
                } else {
                    errorOverlay();
                }
            });
        };

        self.changeImag = function(){
            if(self.updateMode() == 0){
                self.updateMode(1);
                $("#otaStatus").text($.i18n.prop("enable"));
            }else{
                self.updateMode(0);
                $("#otaStatus").text($.i18n.prop("disable"));
            }
        }

        self.checkNewVersion = function () {
            var s = service.getNewVersionState();
            if (s.hasNewVersion) {
                status.showOTAAlert();
                return;
            } else {
                if(config.UPGRADE_TYPE=="FOTA"){
                    var runningState = ["version_no_new_software", "version_has_new_critical_software"
                        , "version_has_new_optional_software", "version_start", "version_processing"
                        , "version_roaming", "version_checking", "version_checking_failed"];
                    if ($.inArray(s.new_version_state, runningState) != -1) {
                        showAlert("ota_update_running");
                        return;
                    }
                }
            }
            //OTA开始下载时，会将new_version_state清空，此处判断是否已经在下载过程中
            var info = service.getStatusInfo();
			
			if(!service.getFOTABatteryState()){
				info.current_upgrade_state = 'low_battery';
			}
			
            if (info.current_upgrade_state == "upgrade_prepare_install") {
                showInfo('ota_download_success');
                return;
            }
            if (info.current_upgrade_state == "low_battery") {
                showInfo('ota_low_battery');
                return;
            }
            var upgradingState = ["upgrade_pack_redownload", "connecting_server", "connect_server_success", "upgrading", "accept"];
            if ($.inArray(info.current_upgrade_state, upgradingState) != -1) {
                status.showOTAAlert();
                return;
            }

            if (info.roamingStatus) {
                showConfirm("ota_manual_check_roaming_confirm", function () {
                    checkNewVersion();
                });
            } else {
                checkNewVersion();
            }

            function checkNewVersion() {
                showLoading("ota_new_version_checking");
                function checkResult() {
                   var  roamStatue = service.getConnectionInfo();  
				   var r = service.getNewVersionState();
				   switch(r.new_version_state){
					   case "upgrading":
					   		r.new_version_state = "version_processing";
							break;
					   case "connect_server_failed":
					   		r.new_version_state = "version_checking_failed";
							break;
					   default:break;
				   }
				   
				   if(roamStatue.roamState == "on"){
					   r.new_version_state = "in_roaming";
				   }
								
                    if (r.hasNewVersion) {
                        status.showOTAAlert();
                    } else if (r.new_version_state == "0" || r.new_version_state == "version_no_new_software") {
                        showAlert("ota_no_new_version");
                    } else if (r.new_version_state == "version_processing" || r.new_version_state == "in_session") {
                        showAlert("ota_update_running");
                    } else if (r.new_version_state == "version_roaming" || r.new_version_state == "in_roaming") {
                        showAlert("ota_roamming");
                    } else if (r.new_version_state == "version_checking_failed" || r.new_version_state == "network_unavailable") {
						errorOverlay("ota_check_fail");
                    }else if(r.new_version_state == "upgrade_prepare_install"){
						status.showOTAAlert();
					}else {
                        addTimeout(checkResult, 1000);
                    }
                }

                /*service.setUpgradeSelectOp({selectOp: 'check'}, function (result) {
                    if (result.result == "success") {
                        checkResult();
                    } else {
						alert("setUpgradeSelectOp" + " sdfds")
                        errorOverlay();
                    }
                });*/
				//add start check --houailing	
				service.setFOTACheckNewVersion({}, function (result) {								 
					if (result.result) {
                        checkResult();
                    } else {
						
                        errorOverlay();
                    }
                });										
            }
        };
        /**
         * 处理页面元素的可用状态
         * @method fixPageEnable
         */
        self.fixPageEnable = function () {
            var info = service.getStatusInfo();
            if (info.connectWifiStatus == "connect" || checkConnectedStatus(info.connectStatus)) {
                enableBtn($("#btnCheckNewVersion"));
            } else {
                disableBtn($("#btnCheckNewVersion"));
            }
        };
    }

    function init() {
        $("#dropdownMain").show();
        
        var container = $('#container')[0];
        ko.cleanNode(container);
        var vm = new OTAUpdateVM();
        ko.applyBindings(vm, container);

        vm.fixPageEnable();
        addInterval(function () {
            vm.fixPageEnable();
        }, 1000);

        $('#frmOTAUpdate').validate({
            submitHandler: function () {
                vm.apply();
            }
        });
    }

    return {
        init: init
    };
});