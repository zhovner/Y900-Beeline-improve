/**
 * AP Station模块
 * @module AP Station
 * @class AP Station
 */

define([ 'jquery', 'knockout', 'config/config', 'service', 'underscore' ],

    function ($, ko, config, service, _) {

        /**
         * AP Station ViewModel
         * @class apModel
         */
        function apModel() {
            var self = this;
            self.hasMultiSSID = config.HAS_MULTI_SSID;
            var securityModes = _.map(config.AUTH_MODES_ALL, function (item) {
                return new Option(item.name, item.value);
            });

            self.page = {list:1, add:2, edit:3};

            var gridColumn = [
                { columnType:"radio", headerTextTrans:"option",rowText:"profileName", width:"10%" },
                { headerTextTrans:"ssid_title", rowText:"ssid", width:"30%" },
                { columnType:"images", headerTextTrans:"signal", rowText:"imgSignal", width:"30%" },
                { headerTextTrans:"security_mode", rowText:"authMode", width:"30%" }
            ];
            var searchGridColumn = [
                { columnType:"radio", rowText:"index", width:"10%" },
                { headerTextTrans:"ssid_title", rowText:"ssid", width:"30%" },
                { columnType:"images", headerTextTrans:"signal", rowText:"imgSignal", width:"30%" },
                { headerTextTrans:"security_mode", rowText:"authMode", width:"30%" }
            ];

            self.pageState = ko.observable(self.page.list);

            var info = service.getAPStationBasic();

            self.origin_ap_station_enable = info.ap_station_enable;
            self.ap_station_enable = ko.observable(info.ap_station_enable);
            self.ap_station_mode = ko.observable(info.ap_station_mode);
            self.origin_ap_station_mode = info.ap_station_mode;
            self.apList = ko.observable([]);
            if (self.origin_ap_station_enable == "1") {
                var apList = service.getHotspotList();
                self.apList(fixHotspotList(apList.hotspotList));
            }

            self.apSearchList = ko.observable([]);

            self.connectButtonStatus = ko.observable("disable");
            self.hasSelectFromUser = ko.observable();
            self.showPassword = ko.observable(false);

            /**
             * 密码显示事件
             *
             * @event showPasswordHandler
             */
            self.showPasswordHandler = function () {
                $("#pwdWepKey").parent().find(".error").hide();
                $("#pwdWPAKey").parent().find(".error").hide();
                var checkbox = $("#showPassword:checked");
                if (checkbox && checkbox.length == 0) {
                    self.showPassword(true);
                } else {
                    self.showPassword(false);
                }
            };

            /**
             * 计算并设置按钮的状态
             * @method computeButtonState
             *
             */
            function computeButtonState() {
                var profileName = self.apGrid.radioSelectValue();
                if (!profileName) {
                    self.hasSelectFromUser(false);
                    self.connectButtonStatus("disable");
                    return;
                }

                var status = "";
                var fromProvider = "";
                for (var i = 0; i < self.apList().length; i++) {
                    var item = self.apList()[i];
                    if (item.profileName == profileName) {
                        status = item.connectStatus;
                        fromProvider = item.fromProvider;
                        break;
                    }
                }

                if (status == "1") {
                    self.connectButtonStatus("hide");
                    self.hasSelectFromUser(false);
                } else {
                    var btnStatus = (self.origin_ap_station_mode == "dial_pref") ? "disable" : "show";
                    if (btnStatus == "disable") {
                        var info = service.getStatusInfo();
                        var networkType = info.networkType.toLowerCase();
                        if (networkType == '' || networkType == 'limited_service' || networkType == 'no_service') {
                            btnStatus = "show";
                        }
                    }
                    self.connectButtonStatus(btnStatus);
                    self.hasSelectFromUser(fromProvider == "0");
                }
            }

            self.apGrid = new ko.simpleGrid.viewModel({
                data:self.apList(),
                idName:"profileName",
                columns:gridColumn,
                pageSize:100,
                tmplType:'list',
                primaryColumn:"fromProvider",
                radioClickHandler:function () {
                    computeButtonState();
                }
            });


            self.apSearchGrid = new ko.simpleGrid.viewModel({
                data:self.apSearchList(),
                idName:"index",
                columns:searchGridColumn,
                pageSize:100,
                tmplType:'list',
                radioClickHandler:function () {
                    var index = self.apSearchGrid.radioSelectValue();
                    var aplist = self.apSearchList();
                    for (var i = 0; i < aplist.length; i++) {
                        var item = aplist[i];
                        if (item.index == index) {
                            self.profileName("");
                            self.ssid(item.ssid);
                            self.signal(item.signal);
                            self.authMode(item.authMode);
                            self.password(item.password);
                            if (item.authMode == "WPAPSK" || item.authMode == "WPA2PSK" || item.authMode == "WPAPSKWPA2PSK") {
                                self.encryptType_WPA(item.encryptType);
                            } else {
                                self.encryptType(item.encryptType);
                            }
                            self.keyID(item.keyID);
                            break;
                        }
                    }
                }
            });

            /**
             * 计算并设置当前连接和按钮的状态
             * @method computeConnectStatus
             *
             */
            self.computeConnectStatus = function () {
                computeButtonState();

                var networkStatus = self.connectStatus();
                if (checkConnectedStatus(networkStatus)) {
                    self.current_status_trans("ap_station_wan_connected");
                    self.current_status_text($.i18n.prop("ap_station_wan_connected"));
                    return;
                }

                var ssid = self.connectWifiSSID();
                var wifiStatus = self.connectWifiStatus();
                if (ssid && wifiStatus == "connect") {
                    self.current_status_trans("ap_station_wlan_connected");
                    self.current_status_text($.i18n.prop("ap_station_wlan_connected"));
                    return;
                }

                self.current_status_trans("ap_station_no_connection");
                self.current_status_text($.i18n.prop("ap_station_no_connection"));
            };

            var statusInfo = service.getStatusInfo();
            self.networkType = ko.observable(statusInfo.networkType);
            self.networkOperator = ko.observable(statusInfo.networkOperator);
            self.connectStatus = ko.observable(statusInfo.connectStatus);
            self.connectWifiStatus = ko.observable(statusInfo.connectWifiStatus);
            self.connectWifiProfile = ko.observable(statusInfo.connectWifiProfile);
            self.connectWifiSSID = ko.observable(statusInfo.connectWifiSSID);

            self.current_status_trans = ko.observable("");
            self.current_status_text = ko.observable("");
            self.current_status = ko.computed(function () {
                self.computeConnectStatus()
            });

            self.modes = securityModes;
            self.profileName = ko.observable("");
            self.ssid = ko.observable();
            self.signal = ko.observable("0");
            self.authMode = ko.observable();
            self.password = ko.observable();
            self.encryptType = ko.observable();
            self.encryptType_WPA = ko.observable("TKIPCCMP");
            self.keyID = ko.observable("0");

            /**
             * 打开添加页面
             * @event openAddPage
             *
             */
            self.openAddPage = function () {
                if (wifiClosedCheck()) {
                    return;
                }
				if (wpsOnCheck()) {
                    return;
                }
                self.clear();
                self.pageState(self.page.add);
                getSearchHotspot();
            }

            /**
             * 打开基本设置页面
             * @event openAddPage
             *
             */
            self.openListPage = function () {
                if (wifiClosedCheck()) {
                    return;
                }
				if (wpsOnCheck()) {
                    return;
                }
                self.clear();
                self.pageState(self.page.list);
                self.apGrid.data(self.apList());
                self.computeConnectStatus();
            }

            /**
             * 添加热点
             * @event addHotspot
             *
             */
            self.addHotspot = function () {
                if (wifiClosedCheck()) {
                    return;
                }
				if (wpsOnCheck()) {
                    return;
                }
                if (self.pageState() == self.page.add && self.apList().length >= config.AP_STATION_LIST_LENGTH) {
                    showAlert({msg:"ap_station_exceed_list_max", params:config.AP_STATION_LIST_LENGTH});
                    return;
                }
                showLoading('operating');
                var para = {};
                var profileName = self.apGrid.radioSelectValue();
                para.profileName = self.profileName();
                para.ssid = self.ssid();
                para.signal = self.signal();
                para.authMode = self.authMode();
                para.password = self.password();
                if (para.authMode == "WPAPSK" || para.authMode == "WPA2PSK" || para.authMode == "WPAPSKWPA2PSK") {
                    para.encryptType = self.encryptType_WPA();
                } else if (para.authMode == "SHARED") {
                    para.encryptType = "WEP";
                } else {
                    para.encryptType = self.encryptType();
                }
                para.keyID = self.keyID();
                para.apList = self.apList();
                service.saveHotspot(para, function (data) {
                    self.callback(data, true);
                });
            };

            /**
             * 删除热点
             * @event deleteHotspot
             *
             */
            self.deleteHotspot = function () {
                if (wifiClosedCheck()) {
                    return;
                }
				if (wpsOnCheck()) {
                    return;
                }
                showConfirm("confirm_data_delete", function () {
                    var para = {};
                    para.profileName = self.apGrid.radioSelectValue();
                    para.apList = self.apList();
                    showLoading('operating');
                    service.deleteHotspot(para, function (data) {
                        self.callback(data, true);
                    });
                });
            };

            /**
             * 打开编辑页面
             * @event openEditPage
             *
             */
            self.openEditPage = function () {
                if (wifiClosedCheck()) {
                    return;
                }
				if (wpsOnCheck()) {
                    return;
                }
                var profileName = self.apGrid.radioSelectValue();
                var aplist = self.apList();
                for (var i = 0; i < aplist.length; i++) {
                    var item = aplist[i];
                    if (item.profileName == profileName) {
                        self.profileName(profileName);
                        self.ssid(item.ssid);
                        self.signal(item.signal);
                        self.authMode(item.authMode);
                        self.password(item.password);
                        if (item.authMode == "WPAPSK" || item.authMode == "WPA2PSK" || item.authMode == "WPAPSKWPA2PSK") {
                            self.encryptType_WPA(item.encryptType);
                        } else {
                            self.encryptType(item.encryptType);
                        }
                        self.keyID(item.keyID);
                    }
                }
                self.pageState(self.page.edit);
            };

            /**
             * 连接热点
             * @event connectHotspot
             *
             */
            self.connectHotspot = function () {
                if (wifiClosedCheck()) {
                    return;
                }
				if (wpsOnCheck()) {
                    return;
                }
                var profileName = self.apGrid.radioSelectValue();

                function connect() {
                    showLoading("connecting");
                    var para = {};
                    var apList = self.apList();
                    var connectIndex = -1;
                    var ssid = "";
                    for (var i = 0; i < apList.length; i++) {
                        if (apList[i].profileName == profileName) {
                            connectIndex = i;
                            ssid = apList[i].ssid;
                            para.EX_SSID1 = apList[i].ssid;
                            para.EX_AuthMode = apList[i].authMode;
                            para.EX_EncrypType = apList[i].encryptType;
                            para.EX_DefaultKeyID = apList[i].keyID;
                            para.EX_WEPKEY = apList[i].password;
                            para.EX_WPAPSK1 = apList[i].password;
                            para.EX_wifi_profile = apList[i].profileName;
                            break;
                        }
                    }

                    self.connectWifiSSID(ssid);
                    self.connectWifiStatus("connecting");
                    self.apGrid.setRadioSelect(profileName);
                    self.connectButtonStatus("disable");

                    service.connectHotspot(para, function (data) {
                        if (data && data.result == "success") {
                            self.connectButtonStatus("disable");
                            //有时会出现取得的状态不是最新的，所以延迟检测状态
                            addTimeout(checkWifiStatus, 2000);
                        } else {
                            apList[connectIndex].connectStatus = "0";
                            self.connectButtonStatus("show");
                            self.connectWifiStatus("disconnect");
                            hideLoading();
                            errorOverlay();
                        }
                        self.connectWifiSSID(ssid);
                        self.connectWifiProfile(profileName);
                        self.apList(fixHotspotList(apList));
                        self.apGrid.data([]);
                        self.apGrid.data(self.apList());
                        self.apGrid.setRadioSelect(profileName);
                    });
                }

                var count = 0;
                var connectStatus = false;

                function checkWifiStatus() {
                    count = count + 1;
                    if (count > 60) {
                        hideLoading();
                        errorOverlay();
                        return;
                    }
                    if (!connectStatus) {
                        var status = service.getStatusInfo();
                        if(status.connectWifiStatus == "connect"){
                            connectStatus = true;
                        } else {
                            addTimeout(checkWifiStatus, 1000);
                        }
                    }
                    if (connectStatus) {
                        //继续判断profile中连接状态是否为1
                        service.getHotspotList({}, function (data) {
                            for (var i = 0, len = data.hotspotList.length; i < len; i++) {
                                var item = data.hotspotList[i];
                                if (item.profileName == profileName) {
                                    if (item.connectStatus == "1") {
                                        hideLoading();
                                        return;
                                    }
                                    break;
                                }
                            }
                            addTimeout(checkWifiStatus, 1000);
                        });
                    }
                }

                var status = service.getStatusInfo();
                if (status.connectStatus == "ppp_connecting" || checkConnectedStatus(status.connectStatus)) {
                    showConfirm("ap_station_connect_change_alert", function () {
                        showLoading('operating');
                        service.disconnect({}, function (data) {
                            if (data.result) {
                                connect();
                            } else {
                                errorOverlay();
                            }
                        })
                    });
                } else {
                    connect();
                }

            };

            /**
             * 断开连接
             * @event 断开连接
             *
             */
            self.disconnectHotspot = function () {
                showLoading('disconnecting');
                service.disconnectHotspot({}, function (data) {
                    self.callback(data, true);
                })
            };

            /**
             * 刷新搜到的热点列表
             * @event searchHotspot
             *
             */
            self.searchHotspot = function () {
                if (wifiClosedCheck()) {
                    return;
                }
				if (wpsOnCheck()) {
                    return;
                }
                getSearchHotspot();
            };

            /**
             * 获取搜到的热点列表
             * @method getSearchHotspot
             *
             */
            function getSearchHotspot() {
                var count = 0;

                function search() {
                    var result = service.getSearchHotspotList();
                    if (result.scan_finish) {
                        self.apSearchList(fixHotspotList(result.hotspotList));
                        self.apSearchGrid.data(self.apSearchList());
                        hideLoading();
                    } else {
                        if (count <= 60) {
                            count = count + 1;
                            addTimeout(search, 1000);
                        } else {
                            hideLoading();
                            showAlert("ap_station_search_hotspot_fail");
                        }
                    }
                }

                showLoading('scanning');
                service.searchHotspot({}, function (data) {
                    if (data && data.result == "success") {
                        search();
                    } else {
                        hideLoading();
                        showAlert("ap_station_search_hotspot_fail");
                    }
                });
            }

            /**
             * 清除编辑页面的信息
             * @event clear
             *
             */
            self.clear = function () {
                self.apSearchGrid.clearRadioSelect();
                self.profileName("");
                self.ssid("");
                self.signal("0");
                self.authMode("OPEN");
                self.password("");
                self.encryptType("NONE");
                self.encryptType_WPA("TKIPCCMP");
                self.keyID("0");
            }

            /**
             * 设置AP station参数
             * @event clear
             *
             */
            self.apply = function () {
                if (wifiClosedCheck()) {
                    return;
                }
				if (wpsOnCheck()) {
                    return;
                }

                function setBasic(){
                    showLoading('operating');
                    var para = {};
                    para.ap_station_enable = self.ap_station_enable();
                    para.ap_station_mode = self.ap_station_mode();
                    service.setAPStationBasic(para, function (data) {
                        self.callback(data, true);
                    });
                }

                if (self.origin_ap_station_enable == "0" && self.ap_station_enable() == "1" && config.HAS_MULTI_SSID) {
                    showConfirm("ap_station_enable_confirm", setBasic);
                } else {
                    setBasic();
                }
            };

            /**
             * 和服务器交互时的回调
             * @event callback
             *
             */
            self.callback = function (data, isInitPage) {
                if (data) {
                    if (isInitPage) {
                        init();
                        $("#apList").translate();
                    }
                    if (data.result == "success") {
                        successOverlay();
                    } else if (data.result == "spot_connecting" || data.result == "spot_connected") {
                        showAlert("ap_station_update_fail");
                    } else {
                        errorOverlay();
                    }
                } else {
                    errorOverlay();
                }
            }
        }

        /**
         * 处理热点列表内容，以便在表格显示
         * @method callback
         *
         */
        function fixHotspotList(list) {
            var fixedList = [];
            for (var i = 0; i < list.length; i++) {
                list[i].index = i;
                var imageUrl = "";
                if (list[i].connectStatus == "1") {
                    if (list[i].authMode.toLowerCase() == "open" && list[i].encryptType.toLowerCase() == "none") {
                        imageUrl = "images/wifi_connected.png";
                    } else {
                        imageUrl = "images/wifi_lock_connected.png";
                    }
                } else {
                    if (list[i].authMode.toLowerCase() == "open" && list[i].encryptType.toLowerCase() == "none") {
                        imageUrl = "images/wifi_signal_" + list[i].signal + ".png";
                    } else {
                        imageUrl = "images/wifi_lock_signal_" + list[i].signal + ".png";
                    }
                }
                list[i].imgSignal = imageUrl;
            }
            return list;
        }

        /**
         * 检测wifi是否关闭，关闭时提示
         * @method callback
         *
         */
        function wifiClosedCheck() {
            var info = service.getWpsInfo();
            if (info.radioFlag == "0") {
                showAlert('wps_wifi_off');
                return true;
            }
        }
		
		/**
         * 检测WPS是否激活，激活时提示
         * @method callback
         *
         */
		function wpsOnCheck() {
            var info = service.getWpsInfo();
			if (info.wpsFlag == '1') {
                showAlert('wps_on_info');
                return true;
            }	
        }
		

        /**
         * 设置页面的元素是否可用
         * @method callback
         *
         */
        function setPageDisabled(disablePage) {
            if (disablePage) {
                $('#frmAPStation :input').each(function () {
                    $(this).attr("disabled", true);
                });
                clearValidateMsg();
            } else {
                $("#frmAPStation :input[id!='btnDelete'][id!='btnEdit'][id!='btnConnect']").each(function () {
                    $(this).attr("disabled", false);
                });
            }
        }

        /**
         * 初始化ViewModel并进行绑定
         * @method init
         */
        function init() {
            $("#dropdownMain").show();
            
            var container = $('#container')[0];
            ko.cleanNode(container);
            var vm = new apModel();
            ko.applyBindings(vm, container);

            function refreshPage(initPage) {
                var info = service.getStatusInfo();
                if (info.multi_ssid_enable == "1") {
                    setPageDisabled(true);
                    clearValidateMsg();
                } else {
                    setPageDisabled(false);

                    vm.networkType(info.networkType);
                    vm.connectStatus(info.connectStatus);
                    vm.connectWifiProfile(info.connectWifiProfile);
                    vm.connectWifiSSID(info.connectWifiSSID);
                    vm.connectWifiStatus(info.connectWifiStatus);
                    vm.computeConnectStatus();

                    service.getHotspotList({}, function (data) {
                        var list = fixHotspotList(data.hotspotList);
                        vm.apList(list);

                        var radios = $("input[type='radio']", "#apList").each(function () {
                            for (var i = 0, len = list.length; i < len; i++) {
                                if (list[i].profileName == $(this).val()) {
                                    var img = $(this).parent().parent().find("img")[0];
                                    img.src = list[i].imgSignal;
                                    if (initPage) {
                                        if (list[i].connectStatus == "1") {
                                            vm.hasSelectFromUser(false);
                                            vm.connectButtonStatus("disable");
                                        }
                                    }
                                }
                            }
                        });
                    });
                }
            }

            refreshPage(true);
            clearTimer();
            addInterval(function () {
                refreshPage(false)
            }, 1000);

            $("#frmAPStation").validate({
                submitHandler:function () {
                    vm.addHotspot();
                },
                rules:{
                    txtSSID:"ssid",
                    txtWepKey:"wifi_wep_password_check",
                    pwdWepKey:"wifi_wep_password_check",
                    txtWPAKey:"wifi_password_check",
                    pwdWPAKey:"wifi_password_check"
                },
                errorPlacement:function (error, element) {
                    var id = element.attr("id");
                    if (id == "pwdWepKey" || id == "txtWepKey") {
                        error.insertAfter("#lblShowPassword");
                    } else if (id == "pwdWPAKey" || id == "txtWPAKey") {
                        error.insertAfter("#lblshowWPAPassword");
                    } else {
                        error.insertAfter(element);
                    }
                }
            });
        }

        return {
            init:init
        }
    });
