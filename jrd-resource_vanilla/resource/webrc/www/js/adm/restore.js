/**
 * restore 模块
 * @module restore
 * @class restore
 */

define([ 'jquery', 'knockout', 'config/config', 'service', 'underscore' ],

    function ($, ko, config, service, _) {
        /**
         * restoreViewModel
         * @class restoreVM
         */
        function restoreVM() {
            var self = this;
            /**
             * 恢复出厂设置
             * @event restore
             */
            self.restore = function () {
                showConfirm("restore_confirm", function () {
                    showLoading("restoring");
                    service.restoreFactorySettings({}, function (data) {
                        if (data && data.result == "success") {
                            successOverlay();
                        } else {
                            errorOverlay();
                        }
                    }, $.noop);
                });
            }
        }

        /**
         * 初始化 ViewModel，并进行绑定
         * @method init
         */
        function init() {
            $("#dropdownMain").show();
            
            var vm = new restoreVM();
            ko.applyBindings(vm, $('#container')[0]);

            $('#frmPin').validate({
                submitHandler:function () {
                    vm.restore();
                }
            });
        }

        return {
            init:init
        }
    });
