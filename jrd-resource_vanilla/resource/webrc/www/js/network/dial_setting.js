/**
 * 联网设置模块
 * @module dial_setting
 * @class dial_setting
 */
define([ 'jquery', 'knockout', 'config/config', 'service', 'underscore' ],

function($, ko, config, service, _) {

    /**
     * 联网设置view model
     * @class DialVM
     */
	function DialVM() {
		var mode = service.getConnectionMode();
		var self = this;

		self.selectMode = ko.observable(mode.connectionMode);
        self.enableFlag = ko.observable(true);
        self.isAllowedRoaming = ko.observable(mode.isAllowedRoaming);

        self.setAllowedRoaming = function() {
            if(!$("#roamBtn").hasClass("disable")){
                var checkbox = $("#isAllowedRoaming:checked");
                if(checkbox && checkbox.length == 0 ){
                    self.isAllowedRoaming("on");
                }else{
                    self.isAllowedRoaming("off");
                }
            }
        };

        /**
         * 修改联网模式
         * @method save
         */
        self.save = function () {
            showLoading('operating');
            var selectMode = self.selectMode();
			var pro_string;
			
			if(selectMode == 'auto_dial'){
				pro_string = "auto_confirm";				
			}else{;
				pro_string = "manual_confirm";
			}
			
            showConfirm(pro_string,{ok:function(){
				service.setConnectionMode({
					connectionMode: selectMode,
					isAllowedRoaming: self.isAllowedRoaming()
				}, function (result) {
					if (result.result == "success") {
						successOverlay();
					} else {
						errorOverlay();
					}
				});
			} , no:function(){
				 return;
				}			               
            });	
        };

        var checkbox = $("#roamBtn");
        self.checkEnable = function() {
           // var status = service.getStatusInfo();
			var status = service.getConnectionInfo();
            if (checkConnectedStatus(status.connectStatus) || status.connectStatus == "ppp_connecting") {
                self.enableFlag(false);
                disableCheckbox(checkbox);
            }
            else {
                self.enableFlag(true);
                enableCheckbox(checkbox);
            }
        };

	}

    /**
     * 联网设置初始化
     * @method init
     */
	function init() {
        $("#dropdownMain").show();
        
		var container = $('#container');
		ko.cleanNode(container[0]);
		var vm = new DialVM();
		ko.applyBindings(vm, container[0]);

        vm.checkEnable();
        addInterval( vm.checkEnable, 1000);
	}
	
	return {
		init: init
	};
});