/**
 * @module upnp setting
 * @class upnp setting
 */
define([ 'jquery', 'knockout', 'config/config', 'service', 'underscore' ],

function($, ko, config, service, _) {

    /**
     * system upnp setting VM
     * @class UpnpSettingVM
     */
	function UpnpSettingVM() {
        var self = this;
        var info = getUpnpSetting();

        self.upnpSetting = ko.observable(info.upnpSetting);

        self.save = function() {
            showLoading('operating');
            var params = {};
            params.upnpSetting = self.upnpSetting();
            service.setUpnpSetting(params, function(result) {
                if (result.result == "success") {
                    successOverlay();
                } else {
                    errorOverlay();
                }
            });

        };
    }

    /**
     * 获取upnp 信息
     * @method getUpnpSetting
     */
    function getUpnpSetting() {
        return service.getUpnpSetting();
    }

    /**
     * 初始化UpnpSettingVM model
     * @method init
     */
	function init() {
        $("#dropdownMain").show();
        
		var container = $('#container');
		ko.cleanNode(container[0]);
		var vm = new UpnpSettingVM();
		ko.applyBindings(vm, container[0]);
        $('#upnpSettingForm').validate({
            submitHandler : function() {
                vm.save();
            }
        });
	}

	return {
		init : init
	};
});