/**
 * 密码管理 模块
 * @module password
 * @class password
 */
define([ 'jquery', 'knockout', 'config/config', 'service', 'underscore' ],

    function ($, ko, config, service, _) {

        /**
         * password ViewModel
         * @class passwordModel
         */
        function passwordModel() {
            var self = this;
            self.currentPassword = ko.observable();
            self.newPassword = ko.observable();
            self.confirmPassword = ko.observable();
            /**
             * 修改密码
             * @event changePassword
             */
            self.changePassword = function () {
                var para = {
                    oldPassword:self.currentPassword(),
                    newPassword:self.newPassword()
                };
                showLoading('operating');
                service.changePassword(para, function (data) {
                    self.cancel();
                    if (data && data.result == true) {
                        successOverlay();
                    } else {
                        if (data && data.errorType == "badPassword") {
                            hideLoading();
                            showAlert("current_password_error",function(){
                                $("#txtCurrentPassword").focus();
                            });
                        } else {
                            errorOverlay();
                        }
                    }
                });
            };
            /**
             * 清除输入的密码
             * @event cancel
             */
            self.cancel = function () {
                self.currentPassword("");
                self.newPassword("");
                self.confirmPassword("");
            };

        }

        /**
         * 初始化 ViewModel，并进行绑定
         * @method init
         */
        function init() {
            $("#dropdownMain").show();
            
            var vm = new passwordModel();
            ko.applyBindings(vm, $('#container')[0]);

            $('#frmPassword').validate({
                submitHandler:function () {
                    vm.changePassword();
                },
                rules:{
                    txtCurrentPassword:"password_check",
                    txtNewPassword:"password_check",
                    txtConfirmPassword:{ equalTo:"#txtNewPassword"}
                }
            });

        }

        return {
            init:init
        }
    });
