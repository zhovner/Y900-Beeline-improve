/**
 * 短信参数设置
 * @module sms_setting
 * @class sms_setting
 */
define([ 'underscore', 'jquery', 'knockout', 'config/config', 'service' ],
    function(_, $, ko, config, service) {

        var validityModes = _.map(config.SMS_VALIDITY, function(item) {
            return new Option(item.name, item.value);
        });

        function SmsSettingVM() {
            var self = this;
            var setting = getSmsSetting();
            self.modes = ko.observableArray(validityModes);
            self.selectedMode = ko.observable(setting.validity);
            self.centerNumber = ko.observable(setting.centerNumber);
            self.deliveryReport = ko.observable(setting.deliveryReport);
            self.reportText = ko.observable();
            self.changeSMSonoff = function(){
                if(self.deliveryReport() == 0){
                    self.deliveryReport(1);
                   $("#reportText").text($.i18n.prop("settings_messages_delivery_state_on"));
                }else{
                    self.deliveryReport(0);
                    $("#reportText").text($.i18n.prop("settings_messages_delivery_state_off"));
                }
            }
            self.clear = function() {
                init();
                clearValidateMsg();
            };

            self.save = function() {
                showLoading('operating');
                var params = {};
                params.validity = self.selectedMode();
                params.centerNumber = self.centerNumber();
                params.deliveryReport = self.deliveryReport();
                params.memStroe = setting.memStroe;
                service.setSmsSetting(params, function(result) {
                    if (result.result == "success") {
                        successOverlay();
                    }else{
                        errorOverlay();
                    }
                });
            };

        }

        /**
         * 获取短信设置参数
         * @method getSmsSetting
         * @return {Object}
         */
        function getSmsSetting() {
            return service.getSmsSetting();
        }

        function init() {
            $("#dropdownMain").show();
            
            var container = $('#container');
            ko.cleanNode(container[0]);
            var vm = new SmsSettingVM();
            ko.applyBindings(vm, container[0]);
            $('#smsSettingForm').validate({
                submitHandler : function() {
                    vm.save();
                },
                rules: {
                    txtCenterNumber: "phonenumber_check"
                }
            });
        }

        return {
            init : init
        };
    }
);
