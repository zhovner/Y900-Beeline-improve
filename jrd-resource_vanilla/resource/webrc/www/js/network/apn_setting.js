/**
 * APN Setting 模块
 * @module apn_setting
 * @class apn_setting
 */
define([ 'jquery', 'knockout', 'config/config', 'service', 'underscore' ],

function($, ko, config, service, _) {

	/**
	 * 获取鉴权方式
	 * @method getAuthModes
	 * @return {Array} Auth mode Options
	 */
	function getAuthModes(){
		return _.map(config.APN_AUTH_MODES, function(item){
			return new Option(item.name, item.value);
		});
	}
	
	function getPdpTypes(){
		var pdpTypes = [new Option('IPv4', 'IP')];
		if(config.IPV6_SUPPORT){
			pdpTypes.push(new Option('IPv6', 'IPv6'));
			pdpTypes.push(new Option('IPv4 & IPv6', 'IPv4v6'));
		}
		return pdpTypes;
	}

	/**
	 * 获取apn相关信息
	 * @method getApnSettings
	 */
	function getApnSettings(){
		var settings = service.getApnSettings();
		settings.ipv6ApnConfigs = getApnConfigs(settings.ipv6APNs, true);
		settings.apnConfigs = getApnConfigs(settings.APNs, false);
		settings.autoApnConfigs = getAutoApns(settings.autoApns, settings.autoApnsV6);
		return settings;
	}
	var apnConfigs = {};
	var ipv6ApnConfigs = {};
	var autoApnConfigs = {};

	/**
	 * 解析apn信息
	 * @method getApnConfigs
	 * @param apnsStr {String} 用||分割的apns字符串
	 * @param isIpv6 {Boolean} 是否为ipv6 apns字符串
	 */
	function getApnConfigs(apnsStr, isIpv6){
		var configs = [];
		var theApnConfigs = {};
		if(apnsStr && apnsStr.length > 10){
			var apnArr = apnsStr.split("||");
			for (var i = 0; i < apnArr.length; i++) {
				if (apnArr[i] != "") {
					var apnItem = parseApnItem(apnArr[i], isIpv6);
					configs.push(apnItem);
					theApnConfigs[apnItem.profileName] = apnItem;
				}
			}
		}
		if(isIpv6){
			ipv6ApnConfigs = theApnConfigs;
		}else{
			apnConfigs = theApnConfigs;
		}
		return configs;
	}
	/**
	 * 解析自动apn信息
	 * @method getAutoApns
	 * @param apnsStr {String} 用||分割的apns ipv4字符串
	 * @param apnsV6Str {String} 用||分割的apns ipv6字符串
	 */
	function getAutoApns(autoApnV4, autoApnV6){
		var autoApnsV4 = [];
		var autoApnsV6 = [];

		if(autoApnV4 && autoApnV4.length > 5){
			var apnArr = autoApnV4.split("||");
			for (var i = 0; i < apnArr.length; i++) {
				if (apnArr[i] != "") {
					var apnItem = parseApnItem(apnArr[i], false);
					autoApnsV4.push(apnItem);
				}
			}
		}
		if(autoApnV6 && autoApnV6.length > 5){
			var apnArr = autoApnV6.split("||");
			for (var i = 0; i < apnArr.length; i++) {
				if (apnArr[i] != "") {
					var apnItem = parseApnItem(apnArr[i], false);
					autoApnsV6.push(apnItem);
				}
			}
		}
		return dealAutoApnsV6(autoApnsV4, autoApnsV6);
	}
	
	function dealAutoApnsV6(v4, v6){
		autoApnConfigs = {};
		var autoApns = []; 
		for(var i = 0; i < v4.length; i++){
			var apn = v4[i];
			var itemsV6 = v6[i];
			if(itemsV6 && (itemsV6.pdpType == 'IPv6' || itemsV6.pdpType == 'IPv4v6')){
				apn.wanApnV6 = itemsV6.wanApn;
				apn.authModeV6 = itemsV6.authMode;
				apn.usernameV6 = itemsV6.username;
				apn.passwordV6 = itemsV6.password;
				apn.dnsModeV6 = itemsV6.dnsMode;
				apn.dns1V6 = itemsV6.dns1;
				apn.dns2V6 = itemsV6.dns2;
			}
			autoApns.push(apn);
			autoApnConfigs[apn.profileName] = apn;
		}
		return autoApns;
	}

	/**
	 * 解析单条apn信息
	 * @method parseApnItem
	 * @param apnsStr {String} 用($)分割的apn字符串
	 */
	function parseApnItem(apnStr, isIpv6){
		var apn = {};
		var items = apnStr.split("($)");
		for(var i = 0; i < items.length; i++){
			apn.profileName = items[0];
			apn.pdpType = items[7];
			if(isIpv6){
                apn.wanApnV6 = items[1];
                apn.authModeV6 = items[4].toLowerCase();
                apn.usernameV6 = items[5];
                apn.passwordV6 = items[6];
              	apn.dnsMode = items[10];
				apn.dns1 = items[11];
				apn.dns2 = items[12];
				apn.dnsModeV6 = items[13];
				apn.dns1V6 = items[14];
		        apn.dns2V6 = items[15];	
			} else {
				apn.wanApn = items[1];
				apn.authMode = items[4].toLowerCase();
				apn.username = items[5];
				apn.password = items[6];
				apn.dnsMode = items[10];
				apn.dns1 = items[11];
				apn.dns2 = items[12];
				apn.dnsModeV6 = items[13];
				apn.dns1V6 = items[14];
                apn.dns2V6 = items[15];
			}
		}
		return apn;
	}
	
	function getProfileOptions(apns){
		return _.map(apns, function(item){
			return new Option(item.profileName, item.profileName);
		});
	}
	
	/**
	 * APNViewModel
	 * @class APNViewModel
	 */
	function APNViewModel(){
		var self = this;
		var apnSettings = getApnSettings();
        self.showApnDns = ko.observable(config.SHOW_APN_DNS);
		self.index = ko.observable(apnSettings.currIndex);
        self.supportIPv6 = ko.observable(config.IPV6_SUPPORT);

		self.defApn = ko.observable(apnSettings.profileName);
		self.apnMode = ko.observable(apnSettings.apnMode);
		self.autoProfiles = ko.observableArray(getProfileOptions(apnSettings.autoApnConfigs));
		self.profiles = ko.observableArray(getProfileOptions(apnSettings.apnConfigs));

		self.pdpTypes = ko.observableArray(getPdpTypes());
		self.selectedPdpType = ko.observable(apnSettings.pdpType);
		self.profileName = ko.observable(apnSettings.profileName);
        self.profileName2 = ko.observable(apnSettings.profileName);
		self.apn = ko.observable(apnSettings.wanApn);
		self.dnsMode = ko.observable(apnSettings.dnsMode == 'manual' ? 'manual' : 'auto');
		self.dns1 = ko.observable(apnSettings.dns1);
		self.dns2 = ko.observable(apnSettings.dns2);
		self.authModes = ko.observableArray(getAuthModes());
		self.username = ko.observable(apnSettings.username);
		self.password = ko.observable(apnSettings.password);
		
		self.apnV6 = ko.observable(apnSettings.wanApnV6);
		self.dnsModeV6 = ko.observable(apnSettings.dnsModeV6 == 'manual' ? 'manual' : 'auto');
		self.dns1V6 = ko.observable(apnSettings.dns1V6);
		self.dns2V6 = ko.observable(apnSettings.dns2V6);
		self.authModesV6 = ko.observableArray(getAuthModes());
		self.usernameV6 = ko.observable(apnSettings.usernameV6);
		self.passwordV6 = ko.observable(apnSettings.passwordV6);

		self.selectedProfile = ko.observable(apnSettings.profileName);
		if(apnSettings.autoApnConfigs && apnSettings.autoApnConfigs.length > 0){
			self.selectedAutoProfile = ko.observable(apnSettings.autoApnConfigs[0].profileName);
		}else{
			self.selectedAutoProfile = ko.observable();
		}
		self.selectedAuthentication = ko.observable(apnSettings.authMode);
		self.selectedAuthenticationV6 = ko.observable(apnSettings.authModeV6);
		
		self.disableProfile = ko.observable(false);
		self.addApnHide = ko.observable(true);
		self.defaultCfg = ko.observable(true);
        self.showFlag = ko.observable(false);
        self.transApn = ko.observable('apn');
        self.transDnsMode = ko.observable('apn_dns_mode');
        self.transDns1 = ko.observable(config.IPV6_SUPPORT ? 'apn_dns1_ipv4' : 'apn_dns1');
        self.transDns2 = ko.observable(config.IPV6_SUPPORT ? 'apn_dns2_ipv4' : 'apn_dns2');
        self.transAuth = ko.observable('apn_authentication');
        self.transUserName = ko.observable('apn_user_name');
        self.transPassword = ko.observable('apn_password');

		self.setDefaultVisible = ko.observable(!isConnectedNetWork());

        self.hasCapacity = ko.computed(function(){
            if(self.profiles().length >= config.maxApnNumber){
                return false;
            } else {
                return true;
            }
        });

		self.autoApnChecked = ko.computed(function(){
			return self.apnMode() == "auto";
		});

		self.showDns = ko.computed(function(){
			return self.dnsMode() == "manual";
		});
		
		self.showDnsV6 = ko.computed(function(){
			return self.dnsModeV6() == "manual";
		});
		
		self.checkInputDisable = ko.computed(function(){
			if(self.apnMode() == "auto" || ((self.apnMode() != "auto" && self.defaultCfg() && !self.disableProfile()))){
				return true;
			}
			if(self.apnMode() != "auto" && (!self.disableProfile() || !self.defaultCfg())){
				return false;
			}
			return false;
		});
		
		self.showAutoApnDetail = ko.computed(function(){
			if(self.apnMode() == "auto"){
				return self.autoProfiles().length > 0;
			} else {
                return true;
			}
		});

//		var currentStatus = '';
		/**
		 * profile change 事件处理
		 * @event profileChangeHandler
		 */
		var profileNameSelOld = "";
		self.profileChangeHandler = function(data, event) {
			if(self.apnMode() != 'manual'){
				return true;
			}
               self.showFlag(true);
                var cfg = self.getSelectedManualProfile();
                profileNameSelOld = cfg.profileName;
                self.setUIData(cfg);
                checkDefaultProfileStatus();
                return true;
		};
		
		/**
		 * auto apn profile change 事件处理
		 * @event autoProfileChangeHandler
		 */
		self.autoProfileChangeHandler = function(data, event) {
			if(self.apnMode() != 'auto'){
				return true;
			}
			/*var profileVal = $("#autoProfile").val();
			if(currentStatus != '' && currentStatus == profileVal){
				return true;
			}
			currentStatus = profileVal;*/
			var cfg = autoApnConfigs[self.selectedAutoProfile()];
			self.setUIData(cfg);
			checkDefaultProfileStatus();
			return true;
		};
		
		self.setUIData = function(data){
			clearValidateMsg('#apn_setting_form');
			if(!data){
				return;
			}
			self.profileName(data.profileName);
			self.apn(data.wanApn);
			self.dnsMode(data.dnsMode != 'manual' ? 'auto' : 'manual');
			self.dns1(data.dns1);
			self.dns2(data.dns2);
			self.username(data.username);
			self.password(data.password);
			self.selectedAuthentication(data.authMode || 'none');
			self.dnsModeV6(data.dnsModeV6 != 'manual' ? 'auto' : 'manual');
			self.dns1V6(data.dns1V6);
			self.dns2V6(data.dns2V6);
			self.selectedPdpType(data.pdpType);
		};
		
		/**
		 * 设置默认apn状态
		 * @method checkDefaultProfileStatus
		 */
		function checkDefaultProfileStatus(){
			var index = getProfileIndex();
			var cfg = self.getSelectedManualProfile();
            profileNameSelOld = cfg.profileName;
            var profileList = service.getApnSettingsList();
			var profileInfo={};
			$.each(profileList,function(i,v){
                if(v.profile_name==profileNameSelOld){
                	profileInfo.profile_type = v.profile_type;
                    profileInfo.profile_defualt = v.profile_defualt;
                }
            });
			//默认apn不允许编辑
			if(profileInfo.profile_type == PROFILE_TYPE_BUILD_IN || profileInfo.profile_defualt == DEFUALT_PROFILE_VALUE){
				self.defaultCfg(true);
			}else{
				self.defaultCfg(false);
			}
		}

		/**
		 * APN mode change 事件处理
		 * @event apnModeChangeHandler
		 */
		self.apnModeChangeHandler = function(data, event) {
			if(self.apnMode() == 'auto'){
				if(self.showAutoApnDetail()){
					self.autoProfileChangeHandler();
				}
			} else {
				self.profileChangeHandler();
			}
			return true;
		};

		/**
		 * 设置为默认apn
		 * @event setDefaultAct
		 */
		self.setDefaultAct = function(){
			if(!self.selectedProfile()){
				return false;
			}
			var connectStatus = service.getConnectionInfo().connectStatus;
            if (checkConnectedStatusAndConnectingDisconnecting(connectStatus)) {
                errorOverlay("apn_setDefault_notice");
                return false;
            }
            if(self.apnMode() == 'auto' || self.defaultCfg() || true){
                showLoading('operating');
                doSetDefaultAct();
            } else {
                if($('#apn_setting_form').valid()){
                    var exist = false;
                    $.each(self.profiles(), function (i, e) {
                        if (e.value == self.profileName()) {
                            exist = true;
                        }
                    });
                    if (exist && self.selectedProfile() != self.profileName()) {
                        showInfo("apn_save_profile_exist");
                        return false;
                    }
                    showLoading('operating');
                    editApn(function () {
                        doSetDefaultAct();
                    });
                }else{
                    $(".error:first", "#apn_setting_form").focus();
                }
            }
		};

        function doSetDefaultAct(){
        	var cfg = self.getSelectedManualProfile();
        	profileNameSelOld = cfg.profileName;
            var index = 0;
            if(self.apnMode() == 'auto'){
                index = getAutoApnIndex();
                self.selectedAutoProfile($("#autoProfile").val());
            } else {
                index = getApnIndex();
                self.selectedProfile($("#profile").val());
            }
            var selectedProfileDetail = self.getSelectedManualProfile();
            var profileList = service.getApnSettingsList();
			var profileInfo={};
			$.each(profileList,function(i,v){
                if(v.profile_name==profileNameSelOld){
                    profileInfo.profile_id=v.profile_id;
                    profileInfo.profile_defualt= v.profile_defualt;
                }
            });
            if(profileInfo.profile_defualt == DEFUALT_PROFILE_VALUE){
            	errorOverlay("apn_default_already");
            	return false
            }
            service.setDefaultApn({
                index : profileInfo.profile_id
            }, function(data) {
                if(data.result){
                   // currentStatus = '';
                    addTimeout(function(){
                        init();
                        self.apnModeChangeHandler();
                        successOverlay();
                    }, self.apnMode() == 'auto' ? 5000 : 500);
//					self.defApn(self.selectedProfile());
//					self.profileChangeHandler();
                } else {
                    errorOverlay();
                }
            }, function(data) {
                errorOverlay();
            });
        }

        self.getSelectedManualProfile = function(){
            var cfg = {};
            var profileVal = $("#profile").val();
            if(typeof self.selectedProfile() == 'undefined'){
                self.selectedProfile(profileVal);
            }
            var cfgV4 = apnConfigs[profileVal];
            var cfgV6 = ipv6ApnConfigs[profileVal];
            if(cfgV4 && cfgV6){
                if(!!cfgV4.pdpType){
                    $.extend(cfg, cfgV6);
                    $.extend(cfg, cfgV4);
                } else {
                    $.extend(cfg, cfgV4);
                    $.extend(cfg, cfgV6);
                }
            } else if(cfgV4 && !cfgV6){
                $.extend(cfg, cfgV4);
            }
            return cfg;
        };
		
		/**
		 * 获取apn索引
		 * @method getApnIndex
		 */
		function getApnIndex(){
			var opts = $("#profile option");
			for(var i = 0; i < opts.length; i++){
				if(opts[i].value == self.selectedProfile()){
					return i;
				}
			}
			return opts.length - 1;
		}
		
		/**
		 * 获取自动apn索引
		 * @method getAutoApnIndex
		 */
		function getAutoApnIndex(){
			var opts = $("#autoProfile option");
			for(var i = 0; i < opts.length; i++){
				if(opts[i].value == self.selectedAutoProfile()){
					return i;
				}
			}
			return opts.length - 1;
		}
		
		/**
		 * 保存APN设置信息
		 * @event saveAct
		 */
		self.saveAct = function(){
			var exist = false;
			$.each(self.profiles(), function(i, e){
				if(e.value == self.profileName()){
					exist = true;
				}
			});
			
			if(self.disableProfile() == true){
				if($("#profile option").length >= config.maxApnNumber){
					showInfo({msg: "apn_profile_full", params: [config.maxApnNumber]});
					return false;
				}
				if(exist){
					showInfo("apn_save_profile_exist");
					return false;
				}
				addNewApn();
			}else{
				if(exist && self.selectedProfile() != self.profileName()){
					showInfo("apn_save_profile_exist");
					return false;
				}
				editApn();
			}
		};

		/**
		 * 新增APN信息
		 * @event addNewApn
		 */
		var curprofile_operate = null;
		function addNewApn(){
			showLoading('operating');
			curprofile_operate = PROFILE_OPERATE_NEW;
			var params = {
				profileName: self.profileName(),
				pdpType: self.selectedPdpType(),
				index: $("#profile option").length,//getFirstBlankApnIndex(),
				
				wanApn : self.apn(),
				authMode : self.selectedAuthentication(),
				username : self.username(),
				password : self.password(),
				dnsMode : config.SHOW_APN_DNS?self.dnsMode():'auto',
				dns1 : config.SHOW_APN_DNS?self.dns1():'',
				dns2 : config.SHOW_APN_DNS?self.dns2():'',
				
				dnsModeV6 : config.SHOW_APN_DNS?self.dnsModeV6():'auto',
				dns1V6 : config.SHOW_APN_DNS?self.dns1V6():'',
				dns2V6 : config.SHOW_APN_DNS?self.dns2V6():''
			};

			$.extend(params,PROFILE_OPERATE_NEW ==curprofile_operate?{"key":"new"}:{"key":"edit"});
			service.addOrEditApn(params, function(data) {
				if(data.result){
					init();
					successOverlay();
				}else{
					errorOverlay();
				}
			}, function(data) {
				errorOverlay();
			});
		}

		/**
		 * 编辑APN信息
		 * @event editApn
		 */
		function editApn(cb){
            var preAct = $.isFunction(cb);
            var profileList = service.getApnSettingsList();
			
			var profileInfo={};
			$.each(profileList,function(i,v){
                if(v.profile_name==profileNameSelOld){
                    profileInfo.profile_id=v.profile_id;
                    profileInfo.profile_type=v.profile_type;
                    profileInfo.profile_defualt= v.profile_defualt;
                }
            });
            if(!preAct){
                showLoading('operating');
            }
            var index = getProfileIndex();
            curprofile_operate = PROFILE_OPERATE_EDIT;
      
            if(profileInfo.profile_type == PROFILE_TYPE_BUILD_IN){
                if(preAct){
                    cb();
                }else{
                    errorOverlay("apn_cant_modify_status");
                }
                return false;
            }else if( profileInfo.profile_defualt == DEFUALT_PROFILE_VALUE){
                if(preAct){
                    cb();
                }else{
                    errorOverlay("apn_cant_modify_status");
                }
                return false;
            }else if( !(profileInfo.profile_defualt == DEFUALT_PROFILE_VALUE) && profileInfo.profile_type == PROFILE_TYPE_BUILD_IN){
                if(preAct){
                    cb();
                }else{
                   //errorOverlay("apn_preinstalled_notice");
                    var connectStatus = service.getConnectionInfo().connectStatus;
                    var connectFlag = checkConnectedStatusAndConnectingDisconnecting(connectStatus);
                    if(connectFlag){
                        errorOverlay("apn_preinstalled_notice");
                    }else{
                        errorOverlay("apn_preinstalled_notice");
                    }
                }
                return false;
            }
            var dns1,
            	dns2,
            	dns1V6,
            	dns2V6;
            if( self.dnsMode() == "auto"){
            	dns1="";            	
            	dns2="";
            	self.dns1("");
            	self.dns2("");	
            }else {
            	dns1=self.dns1();
            	dns2=self.dns2();
            }
            if(self.dnsModeV6() == "auto"){
            	dns1V6="";
            	dns2V6="";
            	self.dns1V6("");
            	self.dns2V6("");
            }else{	    		
            	dns1V6=self.dns1V6();
            	dns2V6=self.dns2V6(); 
	    	}
            var params = {
				profileName: self.profileName(),
				pdpType: self.selectedPdpType(),
				profileID:profileInfo.profile_id,
					
				wanApn : self.apn(),
				authMode : self.selectedAuthentication(),
				username : self.username(),
				password : self.password(),
				dnsMode : self.dnsMode(),
				dns1 : dns1,
				dns2 : dns2,
	
				dnsModeV6 :self.dnsModeV6(),
				dns1V6 : dns1V6,
				dns2V6 : dns2V6
			}
            var pamamsA = PROFILE_OPERATE_NEW ==curprofile_operate?{"key":"new"}:{"key":"edit"};
            $.extend(params,pamamsA);

			service.addOrEditApn(params, function(data) {

				if(data.result){
                    apnSettings = getApnSettings();
                    if(self.profileName() != self.selectedProfile()){
                        var newProfileName = self.profileName();
                        self.profiles(getProfileOptions(apnSettings.apnConfigs));
                        $('#profile').val(newProfileName).trigger('change');
                    }
                    if(preAct){
                        cb();
                    } else {
                        successOverlay();
                    }
				} else {
					errorOverlay();
				}
			}, function(data) {
				errorOverlay();
			});
		}

		var tempApn = {};
		/**
		 * 进入新增APN页面
		 * @event addAct
		 */
		self.addAct = function(){
			clearValidateMsg('#apn_setting_form');
			self.disableProfile(true);
			self.addApnHide(true);
            self.showFlag(true);
			tempApn = {
				profileName : self.profileName(),
				selectedPdpType : self.selectedPdpType(),
				
				wanApn : self.apn(),
				dnsMode : config.SHOW_APN_DNS?self.dnsMode():'auto',
				dns1 : config.SHOW_APN_DNS?self.dns1():'',
				dns2 : config.SHOW_APN_DNS?self.dns2():'',
				authMode : self.selectedAuthentication(),
				username : self.username(),
				password : self.password(),
				
				dnsModeV6 : config.SHOW_APN_DNS?self.dnsModeV6():'auto',
				dns1V6 : config.SHOW_APN_DNS?self.dns1V6():'',
				dns2V6 : config.SHOW_APN_DNS?self.dns2V6():''
			};
			self.profileName("");
			self.selectedPdpType("IP");
			
			self.apn("");
			self.dnsMode("auto");
			self.dns1("");
			self.dns2("");
			self.selectedAuthentication("none");
			self.username("");
			self.password("");
			
			self.dnsModeV6("auto");
			self.dns1V6("");
			self.dns2V6("");
            $("#apn_authentication_ipv4").translate();
            $("#authentication_ipv6").translate();
		};

		/**
		 * 取消新增APN
		 * @event cancelAddAct
		 */
		self.cancelAddAct = function(){
			clearValidateMsg('#apn_setting_form');
            self.showFlag(false);
			self.disableProfile(false);
			self.addApnHide(false);
			self.profileName(tempApn.profileName);
			self.selectedPdpType(tempApn.selectedPdpType);
			
			self.apn(tempApn.wanApn);
			self.dnsMode(tempApn.dnsMode);
			self.dns1(tempApn.dns1);
			self.dns2(tempApn.dns2);
			self.selectedAuthentication(tempApn.authMode);
			self.username(tempApn.username);
			self.password(tempApn.password);

			self.dnsModeV6(tempApn.dnsModeV6);
			self.dns1V6(tempApn.dns1V6);
			self.dns2V6(tempApn.dns2V6);
		};
        /**
         * 获取选中apn索引
         * @method getApnIndex
         */
        function getSelectApnIndex(){
            var opts = $("#profile option");
            for(var i = 0; i < opts.length; i++){
                if(opts[i].value == self.selectedProfile()){
                    break;
                }
            }
            return i;
        }
		/**
		 * 删除APN
		 * @event deleteAct
		 */
		self.deleteAct = function(){
            var i = getSelectApnIndex();
            var cfg = self.getSelectedManualProfile();
            profileNameSelOld = cfg.profileName;
            var profileList = service.getApnSettingsList();
			var profileInfo={};
			$.each(profileList,function(i,v){
                if(v.profile_name==profileNameSelOld){
                    profileInfo.profile_id=v.profile_id;
                    profileInfo.profile_type=v.profile_type;
                    profileInfo.profile_defualt= v.profile_defualt;
                }
            });
            if( profileInfo.profile_type == PROFILE_TYPE_BUILD_IN ){//是预置
                errorOverlay("apn_cant_deletePre_status");
                return false;
            }else if( profileInfo.profile_defualt == DEFUALT_PROFILE_VALUE ){//是默认
                errorOverlay("apn_cant_delete_status");
                return false;
            }else if(!(profileInfo.profile_defualt == DEFUALT_PROFILE_VALUE) && profileInfo.profile_type == PROFILE_TYPE_BUILD_IN){//是预置不是默认
               // errorOverlay("apn_cant_deletePre_status");
                var connectStatus = service.getConnectionInfo().connectStatus;
                var connectFlag = checkConnectedStatusAndConnectingDisconnecting(connectStatus);
                if(connectFlag){
                    errorOverlay("apn_cant_deletePre_status");
                }else{
                    errorOverlay("apn_cant_deletePre_status");
                }
                return false;
            }
			
			showConfirm("apn_delete_confirm", function(){
                showLoading('deleting');
                
				service.deleteApn({
					index: profileInfo.profile_id
				}, function(data){
					if(data.result){
						self.profiles(getProfileOptions(getApnSettings().apnConfigs));
						successOverlay();
					} else {
						errorOverlay();
					}
				}, function(data){
					errorOverlay();
				});
			});
		};
		
		function getProfileIndex(){
			var opts = $("#profile").find("option");
			var i = 0;
			for(; i < opts.length; i++){
				if(opts[i].value == self.profileName()){
					break;
				}
			}
			return i;
		}
	}

	/**
	 * 是否已联网
	 * @method isConnectedNetWork
	 */
	function isConnectedNetWork(){
		var info = service.getConnectionInfo();
		return checkConnectedStatus(info.connectStatus);
	}

    function initVar(){
        apnConfigs = {};
        ipv6ApnConfigs = {};
        autoApnConfigs = {};
    }

    var intervalTimer = null;
	/**
	 * 初始化ViewModel
	 * @method init
	 */
	function init() {
        $("#dropdownMain").show();
        
        initVar();
		var container = $('#container');
		ko.cleanNode(container[0]);
		var vm = new APNViewModel();
		ko.applyBindings(vm, container[0]);

        if(!intervalTimer){
            intervalTimer = addInterval(function () {
                vm.setDefaultVisible(!isConnectedNetWork());
            }, 1000);
        }

		$('#apn_setting_form').validate({
			submitHandler : function() {
				vm.saveAct();
			},
			rules:{
				profile_name : 'apn_profile_name_check',
				apn_ipv4_apn : 'apn_check',
				apn_dns1_ipv4 : "ipv4",
				apn_dns2_ipv4 : "ipv4",
				apn_ipv6_apn : 'apn_check',
				apn_dns1_ipv6 : "ipv6",
				apn_dns2_ipv6 : "ipv6",
				apn_user_name_ipv4 : 'ppp_username_check',
				apn_password_ipv4 : 'ppp_password_check',
				apn_user_name_ipv6 : 'ppp_username_check',
				apn_password_ipv6 : 'ppp_password_check'
			}
		});
	}

	return {
		init : init
	};
});