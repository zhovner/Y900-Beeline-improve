/**
 * network_lock 模块
 * @module network_lock
 * @class network_lock
 */
define(['knockout', 'service', 'jquery', 'config/config', 'home'], function (ko, service, $, config, home) {

    function lockVM() {
        var self = this;
        self.deviceInfo = ko.observable([]);
        self.hasWifi = ko.observable(config.HAS_WIFI);

        self.supportUnlock = config.NETWORK_UNLOCK_SUPPORT;
        self.unlockCode = ko.observable();

        var info = service.getNetworkUnlockTimes();
        self.times = ko.observable(info.unlock_nck_time);
        self.imeiText = ko.observable(info.imei);
        self.imagePath = ko.observable("img/disconnect.png");
        self.isHomePage = ko.observable(false);
        if (window.location.hash == "#home") {
            self.isHomePage(true);
        }

        self.unlock = function () {
            showLoading('operating');
            service.unlockNetwork({
                unlock_network_code:self.unlockCode()
            }, function (data) {
                self.unlockCode("");
                if (data && data.result == "success") {
                    successOverlay();
                    if (location.hash == "#home") {
                        setTimeout(function () {
                            location.reload();
                        }, 500);
                    } else {
                        location.hash = "#home";
                    }
                } else {
                    var info = service.getNetworkUnlockTimes();
                    self.times(info.unlock_nck_time);
                    showAlert("errorUnloakNotice");
                }
            })
        }
    }
     cancelConfirm = function(){
         showAlert("netlockNotice");
    }
    function init() {
        $("#dropdownMain").show();
        //$("#dropdownMainForGuest").hide();
        var container = $('#container')[0];
        ko.cleanNode(container);
        var vm = new lockVM();
        ko.applyBindings(vm, container);

        $("#frmNetworkLock").validate({
            submitHandler:function () {
                vm.unlock();
            },
            rules:{
                txtLockNumber: {
                    txtLength_check: true,
                    unlock_code_check: true
                }
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