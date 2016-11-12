/**
 * 联网设置模块
 * @module dial_setting
 * @class dial_setting
 */
define(['jquery', 'knockout', 'config/config', 'service', 'underscore'],

    function($, ko, config, service, _) {

        /**
         * 联网设置view model
         * @class OLEDSettingVM
         */
        function LEDSettingVM() {
            var ledSetting = service.getLedSettings();
            if (!ledSetting.hasOwnProperty('showType')) {
                ledSetting.showType = 0;
            }
            var self = this;
            self.showType = ko.observable(ledSetting.showType);
            /**
             * 修改联网模式
             * @method save
             */
            self.save = function() {
                showLoading('operating');
                var showType = self.showType();
                service.setLedSettings({
                    showType: showType
                }, function(result) {
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
            var container = $('#container');
            ko.cleanNode(container[0]);
            var vm = new LEDSettingVM();
            ko.applyBindings(vm, container[0]);
            $('#ledSettingForm').validate({
                submitHandler: function() {
                    vm.save();
                }
            });
        }
        return {
            init: init
        };
    });
