/**
 * 联网设置模块
 * @module dial_setting
 * @class dial_setting
 */
define([ 'jquery', 'knockout', 'config/config', 'service', 'underscore' ],

function($, ko, config, service, _) {
	
	var oledTimesout = _.map(config.OLED_TIME_ITEM, function(item) {
        return new Option(item.name, item.value);
    });

    /**
     * 联网设置view model
     * @class OLEDSettingVM
     */
	function OLEDSettingVM() {
		var oledSetting = service.getOledSettings();
		
		var self = this;
		
		self.oledtimes = ko.observableArray(oledTimesout);
		self.selectedTime = ko.observable(oledSetting.OledOuttimes);

        self.isCharingOn = ko.observable(oledSetting.isCharingOn);
		self.isCharingOnState = ko.observable(oledSetting.isCharingOn);

        self.setCharingOnState = function() {
            var checkbox = $("#isCharingOn:checked");
            if(checkbox && checkbox.length == 0 ){
                    self.isCharingOnState("1");
            }else{
                     self.isCharingOnState("0");
            }
        };

        /**
         * 修改联网模式
         * @method save
         */
        self.save = function () {
            showLoading('operating');
            var select_times = self.selectedTime();
            service.setOledSettings({
                OledOuttimes: select_times,
                isCharingOn: self.isCharingOnState()
            }, function (result) {
                if (result.result == "success") {
                    successOverlay();
                } else {
                    errorOverlay();
                }
            });
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
		var vm = new OLEDSettingVM();
		ko.applyBindings(vm, container[0]);
	}
	return {
		init: init
	};
});