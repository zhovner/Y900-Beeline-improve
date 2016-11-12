/**
 * wifi advance 模块
 * @module wifi advance
 * @class wifi advance
 */
define([ 'underscore', 'jquery', 'knockout', 'config/config', 'service' ], function(_, $, ko, config, service) {

	/**
	 * 根据国家生成相应的频道
	 * @method channelOption
	 * @param {String} country 国家码
	 */
	function channelOption(country) {
		var options = [ new Option('Auto', '0') ];
		var type = getCountryType(country) + '';
		switch (type) {
		case '1':
			addChannelOption(options, 2407, 11);
			break;
		case '3':
			addChannelOption(options, 2407, 11);
			addChannelOption(options, 2462, 2);
			break;
		case '7':
			addChannelOption(options, 2307, 13);
			addChannelOption(options, 2407, 11);
			addChannelOption(options, 2462, 2);
			break;
		default:
			addChannelOption(options, 2407, 11);
		}
		return options;
	}

    function channelOption5g(country){
        for(key in config.countryCode_5g){
            var item = config.countryCode_5g[key];
            if($.inArray(country, item.codes) != -1){
                return addChannelOption5g(item.channels);
            }
        }
        return [new Option('Auto', '0')];
    }

    function addChannelOption(options, start, count) {
        for ( var i = 1; i <= count; i++) {
            var txt = start + i * 5 + "MHz (Channel " + options.length + ")";
            options.push(new Option(txt, options.length + "_" + (start + i * 5)));
        }
    }

    function addChannelOption5g(channels) {
        var options = [new Option('Auto', '0')];
        for ( var i = 0; i < channels.length; i++) {
            var channel = channels[i];
            var mhz = 5000 + channel * 5;
            var txt = mhz + "MHz (Channel " + channel + ")";
            options.push(new Option(txt, channel + "_" + (mhz)));
        }
        return options;
    }
	
	function getBandOptions(){
		var options = [];
		options.push(new Option('2.4GHz', WLAN_MODE_2GHZ));
		options.push(new Option('5GHz', WLAN_MODE_5GHZ));
		return options;
	}	
	
	/**
	 * 获取国家类型
	 * @method getCountryType
	 * @param {String} country 国家码
	 * @return {String} 类型
	 */
	function getCountryType(country) {
		var countryCode = config.countryCode;
		var type = '';
		for (key in countryCode) {
			var codes = countryCode[key];
			if ($.inArray(country, codes) != -1) {
				type = key;
				break;
			}
		}
		var typeCode = config.countryCodeType[type];
		return typeCode ? typeCode : "0";
	}

	function countryOption(is5G) {
		var countries = is5G ? config.countries_5g:config.countries;
		var options = [];
        for(key in countries){
            options.push(new Option(countries[key], key));
        }
        options = _.sortBy(options, function(opt){
            return opt.text;
        });
		return options;
	}

	function getWifiBasic() {
		return service.getWifiBasic();
	}

    function getWpsInfo() {
        return service.getWpsInfo();
    }
    
    function getModeOption(wlan_mode){
    	var modes = config.NETWORK_MODES;
		 $("#mode").show();
		 $("#modeFor5HZ").hide();
    	if(wlan_mode == WLAN_MODE_5GHZ){
    		modes = config.NETWORK_MODES_BAND;
		$("#modeFor5HZ").show();
		$("#mode").hide();
    	}
		var modeArr = [];
		for ( var i = 0; i < modes.length; i++) {
			modeArr.push(new Option(modes[i].name, modes[i].value));
		}
		return modeArr;
    }

	function getChannelSelectedVal(channel, channels){
		for(var i = 0; i < channels.length; i++){
			var opt = $(channels[i]);
			if(opt.val().split("_")[0] == channel){
				return opt.val();
			}
		}
		return '0';
	}

	/**
	 * WifiAdvanceViewModel
	 * @class WifiBasicViewModel
	 */
	function WifiAdvanceViewModel() {
		// Data
		var self = this;
		var wifiInfo = getWifiBasic();
		self.modes = ko.observableArray(getModeOption(wifiInfo.wlan_mode));
		self.bands = ko.observableArray(getBandOptions());
		
		var countryOpts = countryOption(wifiInfo.wlan_mode == WLAN_MODE_5GHZ);
		self.countries = ko.observableArray(countryOpts);
		self.channels = ko.observableArray(wifiInfo.wlan_mode == WLAN_MODE_5GHZ ? channelOption5g(wifiInfo.wifi_country_code) : channelOption(wifiInfo.wifi_country_code));
		
		self.hasWifiBand = ko.observable(config.WIFI_BAND_SUPPORT);
		
		// Init data
		self.selectedBand = ko.observable(wifiInfo.wlan_mode);//5:a, 2.5:b

		self.selectedMode = ko.observable(wifiInfo.wlan_mode == WLAN_MODE_5GHZ ? wifiInfo.wmode_5g:wifiInfo.wmode);
		self.selectedCountry = ko.observable(wifiInfo.wifi_country_code.toUpperCase());
		var selectedChannel = getChannelSelectedVal(wifiInfo.wlan_mode == WLAN_MODE_5GHZ ? wifiInfo.channel_5g:wifiInfo.channel, self.channels());
		self.selectedChannel = ko.observable(selectedChannel);
				
		wifiInfo = $.extend(wifiInfo, self);

		// //////////////////////Event Handler
		
		self.bandChangeHandler = function(){
			if(self.selectedBand() == WLAN_MODE_5GHZ){ //5g
				//802.11a only；802.11n only；802.11a/n 
				self.modes(getModeOption(self.selectedBand()));
                self.countries(countryOption(true));
			} else { // 2.4g
				//802.11 n only；802.11 b/g/n
				self.modes(getModeOption(self.selectedBand()));
                self.countries(countryOption(false));
			}
            //self.selectedCountry('0');
            self.channels(self.generateChannelOption());			
            //self.selectedChannel('0');
		};
		
		/**
		 * 国家切换事件处理
		 * @event countryChangeHandler
		 */
		self.countryChangeHandler = function(data, event) {
			var opts = self.generateChannelOption();//channelOption(self.selectedCountry());			
			self.channels(opts);
			//self.selectedChannel('0');
		};

        self.generateChannelOption = function(){
            if(self.selectedBand() == WLAN_MODE_5GHZ){
                return channelOption5g(self.selectedCountry());
            } else {
                return channelOption(self.selectedCountry());
            }
        };

		/**
		 * 保存修改
		 * @event save
		 */
		self.save = function() {
            var status = getWpsInfo();
            if(status.wpsFlag == '1') {
                showAlert('wps_on_info');
                return;
            }
            if(status.radioFlag == '0') {
                showAlert('wps_wifi_off');
                return;
            }
          
			showConfirm('wifi_disconnect_confirm', function(){
					showLoading('operating');
					var params = {};
				   /*no change param*/
					params.wifi_enable = wifiInfo.wifi_enable;
					params.apIsolation = wifiInfo.apIsolation;
					params.AuthMode = wifiInfo.AuthMode;
					params.wep_key = wifiInfo.wep_key;
					params.wep_sec = wifiInfo.wep_sec;				
					params.passPhrase = wifiInfo.passPhrase; 
					params.cipher = wifiInfo.cipher;
					params.curr_num = wifiInfo.curr_num;
					params.SSID = wifiInfo.SSID;
					params.broadcast = wifiInfo.broadcast;
					params.station = wifiInfo.MAX_Access_num;
					params.m_SSID = wifiInfo.m_SSID;
					params.m_broadcast = wifiInfo.m_broadcast;
					params.m_station = wifiInfo.m_MAX_Access_num;
					/*other params*/				
					params.wlan_mode = self.selectedBand();
					params.wifi_country_code = self.selectedCountry();
					var selectedChannel = self.selectedChannel();
				if(params.wlan_mode == WLAN_MODE_5GHZ){
				   params.channel_5g = selectedChannel == '0' ? '0' : selectedChannel.split("_")[0];
				   params.channel = wifiInfo.channel;
				   params.wmode_5g = self.selectedMode();
				   params.wmode = wifiInfo.wmode;
				  
				}else{
				   params.channel = selectedChannel == '0' ? '0' : selectedChannel.split("_")[0];
				   params.channel_5g =  wifiInfo.channel_5g;
				   params.wmode_5g = wifiInfo.wmode_5g;
				   params.wmode = self.selectedMode();
				}		
				
				service.setWifiBasic(params, function(result) {
					if (result.result == "success") {
						//successOverlay();
						var getWifiRebootReady = function () {
							var data = service.getWifiBasic();	//console.info(data.wifi_enable);					
							if (data.wifi_enable == "1") {								
								successOverlay();
							} else {
								setTimeout(getWifiRebootReady, 2000);								
							}							
						};
						getWifiRebootReady();  	  
					} else {
						errorOverlay();
					}
				});
            });			
		};
	}

	/**
	 * view model初始化
	 * @method init
	 */
	function init() {
        $("#dropdownMain").show();
        
		var container = $('#container');
		ko.cleanNode(container[0]);
		var vm = new WifiAdvanceViewModel();
		ko.applyBindings(vm, container[0]);

		$('#wifi_advance_form').validate({
			submitHandler : function() {
				vm.save();
			}
		});
	}

	return {
		init : init
	};
});
