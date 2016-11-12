/**
 * @module dmz setting
 * @class dmz setting
 */
define([ 'jquery', 'knockout', 'config/config', 'service', 'underscore' ],

function($, ko, config, service, _) {

    /**
     * system dmz setting VM
     * @class DmzSettingVM
     */
	function DmzSettingVM() {
        $("#dropdownMain").show();
        
        var self = this;
        var info = getDmzSetting();

        self.dmzSetting = ko.observable(info.dmzSetting);
        self.ipAddress = ko.observable(info.ipAddress);

        self.clear = function() {
            init();
        };

        self.save = function() {
            showLoading('operating');
            var params = {};
            params.dmzSetting = self.dmzSetting();
            params.ipAddress = self.ipAddress();
            service.setDmzSetting(params, function(result) {
                if (result.result == "success") {
                    self.clear();
                    successOverlay();
                } else {
                    errorOverlay();
                }
            });
        };
    }

    /**
     * 获取dmz 信息
     * @method getDmzSetting
     */
    function getDmzSetting() {
        return service.getDmzSetting();
    }

    /**
     * 初始化DmzSettingVM model
     * @method init
     */
	function init() {
		var container = $('#container');
		ko.cleanNode(container[0]);
		var vm = new DmzSettingVM();
		ko.applyBindings(vm, container[0]);
        $('#dmzSettingForm').validate({
            submitHandler : function() {
                vm.save();
            },
            rules: {
                txtIpAddress: 'dmz_ip_check'
            }
        });
	}

	return {
		init : init
	};
});