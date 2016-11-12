/**
 * restart 模块
 * @module restart
 * @class restart
 */

define([ 'jquery', 'knockout', 'config/config', 'service', 'underscore' ],

    function ($, ko, config, service, _) {
        /**
         * RestartVM
         * @class RestartVM
         */
        function RestartVM() {
            var self = this;
            /**
             * 重启
             * @event restart
             */
            self.restart = function () {

                showConfirm("restart_confirm", function () {
                    showLoading("restarting");
                    service.restart({}, function (data) {
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
            
            var vm = new RestartVM();
            ko.applyBindings(vm, $('#container')[0]);

            $('#frmRestart').validate({
                submitHandler:function () {
                    vm.restart();
                }
            });
        }

        return {
            init:init
        }
    });
