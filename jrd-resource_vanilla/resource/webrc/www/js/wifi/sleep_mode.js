/**
 * @module sleep_mode
 * @class sleep_mode
 */
define([ 'jquery', 'knockout', 'config/config', 'service', 'underscore' ],

function($, ko, config, service, _) {

    var sleepModes = _.map(config.SLEEP_MODES, function(item) {
        return new Option(item.name, item.value);
    });

    /**
     * sleepmode VM
     * @class SleepModeVM
     */
	function SleepModeVM() {
        var self = this;
        var info = getSleepMode();

        self.modes = ko.observableArray(sleepModes);
        self.selectedMode = ko.observable(info.sleepTime);

        //var wifiRangeInfo = getWifiRange();
        self.wifiRangeMode = ko.observable(info.wifiRange);

        /**
         * 设置wifi休眠模式
         * @method setSleepMode
         */
        self.setSleepMode = function() {
            showLoading('operating');
            service.getWpsInfo({}, function (info) {
                if (info.radioFlag == '0') {
                    showAlert('wps_wifi_off');
                } else if (info.wpsFlag == '1') {
                    showAlert('wps_on_info');
                } else {
                    self.setSleepModeAct();
                }
            });
        };

        self.setSleepModeAct = function() {
            var params = {};
            params.sleepMode = self.selectedMode();
            service.setSleepMode(params, function(result) {
                if (result.result == "success") {
                    successOverlay();
                } else {
                    errorOverlay();
                }
            });
        };

        /**
         * 设置wifi覆盖范围
         * @method setWifiRange
         */
        self.setWifiRange = function() {
            showLoading('operating');
            service.getWpsInfo({}, function (info) {
                if (info.radioFlag == '0') {
                    showAlert('wps_wifi_off');
                } else if (info.wpsFlag == '1') {
                    showAlert('wps_on_info');
                } else {
                    self.setWifiRangeAct();
                }
            });
        };

        self.setWifiRangeAct = function() {
            var params = {};
            params.wifiRangeMode = self.wifiRangeMode();
            service.setWifiRange(params, function(result) {
                if (result.result == "success") {
                    successOverlay();
                } else {
                    errorOverlay();
                }
            });
        };
    }

    /**
     * 获取wifi覆盖范围信息
     * @method getWifiRange
     */
    function getWifiRange() {
        return service.getWifiRange();
    }

    /**
     * 获取wifi休眠模式
     * @method getSleepInfo
     */
    function getSleepMode() {
        return service.getSleepMode();
    }

    /**
     * 初始化sleep mode view model
     * @method init
     */
	function init() {
        $("#dropdownMain").show();
        
		var container = $('#container');
		ko.cleanNode(container[0]);
		var vm = new SleepModeVM();
		ko.applyBindings(vm, container[0]);
        $('#sleepModeForm').validate({
            submitHandler : function() {
                vm.setSleepMode();
            }
        });

        $('#wifiRangeForm').validate({
            submitHandler : function() {
                vm.setWifiRange();
            }
        });
	}

	return {
		init : init
	};
});