/**
 * sim 模块
 * @module simVM
 * @class simVM
 */
define(['knockout', 'service', 'jquery', 'config/config', 'home'], function (ko, service, $, config, home) {
    function simVM() {
        var self = this;
        self.pageState = {NO_SIM:0, WAIT_PIN:1, WAIT_PUK:2, PUK_LOCKED:3, LOADING:4};

        self.deviceInfo = ko.observable([]);
        self.hasWifi = ko.observable(config.HAS_WIFI);

        var info = service.getLoginData();
        self.PIN = ko.observable();
        self.PUK = ko.observable();
        self.newPIN = ko.observable();
        self.confirmPIN = ko.observable();
        self.pinNumber = ko.observable(info.pinnumber);
        self.pukNumber = ko.observable(info.puknumber);
		
		self.imagePath = ko.observable("img/disconnect.png");
		self.isHomePage = ko.observable(false);
		if(window.location.hash=="#home"){
			self.isHomePage(true);
		}

        var state = computePageState(info);
        self.page = ko.observable(state);
        if (state == self.pageState.LOADING) {
            addTimeout(refreshPage, 500);
        }
        self.supportQrCode = ko.observable(config.WIFI_SUPPORT_QR_CODE);
        self.qrcode_ssid1 = ko.observable(getRQCodeImage(true));

        function getRQCodeImage(isSSID1) {
            if (self.supportQrCode()) {
                var timestamp = new Date().getTime();
                if (isSSID1) {
                    return './img/qrcode_ssid_wifikey.png?_=' + timestamp;
                } else {
                    return './img/qrcode_multi_ssid_wifikey.png?_=' + timestamp;
                }
            } else {
                return './img/menu_normal1.png';
            }
        }
        /**
         * 验证输入PIN事件处理
         *
         * @event enterPIN
         */
        self.enterPIN = function () {
            showLoading('operating');
            self.page(self.pageState.LOADING);
            var pin = self.PIN();
            service.enterPIN({
                PinNumber:pin
            }, function (data) {
                if (!data.result) {
                    hideLoading();
                    showAlert("pin_error", function () {
                        refreshPage();
                    });
                    self.PIN('');
                }
                refreshPage();
                if (self.page() == self.pageState.WAIT_PUK) {
                    hideLoading();
                }
            });
        };
        /**
         * 输入PUK设置新PIN事件处理
         *
         * @event enterPUK
         */
        self.enterPUK = function () {
            showLoading('operating');
            self.page(self.pageState.LOADING);
            var newPIN = self.newPIN();
            var confirmPIN = self.confirmPIN();
            var params = {};
            params.PinNumber = newPIN;
            params.PUKNumber = self.PUK();
            service.enterPUK(params, function (data) {
                if (!data.result) {
                    hideLoading();
                    showAlert("puk_error", function () {
                        refreshPage();
                        if (self.page() == self.pageState.PUK_LOCKED) {
                            hideLoading();
                        }
                    });
                    self.PUK('');
                    self.newPIN('');
                    self.confirmPIN('');
                }else{
                    refreshPage();
                    if (self.page() == self.pageState.PUK_LOCKED) {
                        hideLoading();
                    }
                }
            });
        };
        /**
         * 刷新页面状态
         *
         * @method refreshPage
         */
        function refreshPage() {
            var data = service.getLoginData();
            var state = computePageState(data);
            if (state == self.pageState.LOADING) {
                addTimeout(refreshPage, 500);
            } else {
                self.page(state);
                self.pinNumber(data.pinnumber);
                self.pukNumber(data.puknumber);
            }
        }

        /**
         * 根据登录状态和SIM卡状态设置页面状态
         * @method computePageState
         */
        function computePageState(data) {
            var state = data.modem_main_state;
            if (state == "modem_sim_undetected" || state == "modem_undetected" || state == "modem_sim_destroy") {
                return self.pageState.NO_SIM;
            } else if ($.inArray(state, config.TEMPORARY_MODEM_MAIN_STATE) != -1) {
                return self.pageState.LOADING;
            } else if (state == "modem_waitpin") {
                return self.pageState.WAIT_PIN;
            } else if ((state == "modem_waitpuk" || data.pinnumber == 0) && (data.puknumber != 0)) {
                return self.pageState.WAIT_PUK;
            } else if ((data.puknumber == 0 || state == "modem_sim_destroy")
                && state != "modem_sim_undetected" && state != "modem_undetected") {
                return self.pageState.PUK_LOCKED;
            } else {
                location.reload();
            }
        }


    }

    function init() {
        $("#dropdownMain").show();
       // $("#dropdownMainForGuest").hide();
        var container = $('#container')[0];
        ko.cleanNode(container);
        var vm = new simVM();
        ko.applyBindings(vm, container);

        $('#frmPIN').validate({
            submitHandler:function () {
                vm.enterPIN();
            },
            rules:{
                txtPIN:"pin_check"
            }
        });

        $('#frmPUK').validate({
            submitHandler:function () {
                vm.enterPUK();
            },
            rules:{
                txtNewPIN:"pin_check",
                txtConfirmPIN:{equalTo:"#txtNewPIN"},
                txtPUK:"puk_check"
            }
        });

        if (vm.hasWifi()) {
            home.refreshAttachedDevicesInfo(vm);
            addInterval(function () {
                home.refreshAttachedDevicesInfo(vm);
            }, 1000);
        }
    }

    return {
        init:init
    };
});