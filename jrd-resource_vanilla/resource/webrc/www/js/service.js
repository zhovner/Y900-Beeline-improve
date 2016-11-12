define([ 'underscore', 'jquery', 'config/config'], function(_, $, config) {
    /**
     * Service
     * @module service
     * @class service
     */
	var wifiCallbackDestination = window;
	var unknownErrorObject = {
		errorType : 'UnknownError',
		errorId : '123',
		errorText : 'UnknownError'
	};
    
	var isTest = config.IS_TEST;
    if (isTest) {
		$("#buttom-bubble").hide();
	}
    var timerUpdaterEnable = true;
	
	var fotaDownloadStatus = 0;
	// in Product Env, isTest should  be false
	/**
	 * Ajax同步调用
	 * @method syncRequest
	 * @param {Object} params json参数对象
	 * @param {Boolean} isPost 是否为post方法
	 */
	function syncRequest(params, isPost) {
		return ajaxRequest(params, null, null, false, isPost);
	}

	/**
	 * Ajax异步调用
	 * @method asyncRequest
	 * @param {Object} params json参数对象
	 * @param {Function} successCallback 成功回调函数
	 * @param {Function} errorCallback 失败回调函数
	 * @param {Boolean} isPost 是否为post方法
	 */
	function asyncRequest(params, successCallback, errorCallback, isPost) {
		ajaxRequest(params, successCallback, errorCallback, true, isPost);
	}

	/**
	 * Ajax异步调用
	 * @method ajaxRequest
	 * @param {Object} params json参数对象
	 * @param {Function} successCallback 成功回调函数
	 * @param {Function} errorCallback 失败回调函数
	 * @param {Boolean} async 是否为异步方法
	 * @param {Boolean} isPost 是否为post方法
	 */
	function ajaxRequest(params, successCallback, errorCallback, async, isPost) {
		var result = null;
		/*if(params.isTest){
				result = simulate.simulateRequest(params, successCallback, errorCallback, async, isPost);
				if (async) {
					setTimeout(function() {successCallback(result);}, getRandomInt(120) + 50);
					//successCallback(result)
					return;
				}else{
					return result;
				}
		}*/
		$.ajax({
			type : !!isPost ? "POST" : "GET",
			url : params.goformId +"?rand=" + Math.random(),
			data : params.formdata,
			dataType : "json",
			async : !!async,
			cache : false,
			error : function() {
				//log("ajax error callback");
				if (async) {
					errorCallback(null);
				} else {
					result = null;
				}
			},
			success : function(data) {
				//log($.extend(params, data));
				if (async) {
					successCallback(data);
				} else {
					result = data;
				}
			}
		});
		if (!async) {
			return result;
		}
	}

	/**
	 * doStuff业务处理函数
	 * @method doStuff
	 * @param {Object} params json参数对象
	 * @param {Object} result 错误对象
	 * @param {Function} prepare 数据准备函数
	 * @param {Function} dealMethod 结果适配函数
	 * @param {Object} errorObject 默认错误对象
	 * @param {Boolean} isPost 是否为post方法
	 */
	function doStuff(args, result, prepare, dealMethod, errorObject, isPost) {
		var params = args[0], callback = args[1], errorCallback = args[2];
		var objectToReturn;

		if (result && typeof result.errorType === 'string') {
			objectToReturn = $.extend(unknownErrorObject, result);

			if (!callback) {
				// sleep(DelayOnEachCallMillis);
				return objectToReturn;
			}
			doCallback(objectToReturn, callback, errorCallback);
		} else {
			objectToReturn = $.extend({}, result); // Duplicate it.

			var requestParams;
			if (prepare) {
				requestParams = prepare(params, isPost);
			} else {
				requestParams = params;
			}
			if (!callback) {
				if (requestParams && requestParams.goformId) {
					var r = syncRequest(requestParams, isPost);
					if (dealMethod) {
						objectToReturn = $.extend({}, dealMethod(r));
					}else{
                        objectToReturn = r;
                    }
				}
				// sleep(DelayOnEachCallMillis);
				return objectToReturn;
			} else {
				if (requestParams && requestParams.goformId) {
					var r = syncRequest(requestParams,/* function(data) {
						if (dealMethod) {
							objectToReturn = $.extend({}, dealMethod(data));
						} else {
							objectToReturn = $.extend({}, data);
						}
						//手动处理callback
						if(!requestParams.notCallback){
							doCallback(objectToReturn, callback, errorCallback);
						}
					}, function() {
						if (errorObject) {
							objectToReturn = $.extend(unknownErrorObject, errorObject);
						} else {
							objectToReturn = $.extend(unknownErrorObject, {
								errorType : 'Unknown'
							});
						}
						doCallback(objectToReturn, callback, errorCallback);
					},*/ isPost);
					if (dealMethod) {
						objectToReturn = $.extend({}, dealMethod(r));
					}else{
                        objectToReturn = r;
                    }
					
					callback(objectToReturn);
					
				} else {
					doCallback(objectToReturn, callback, errorCallback);
				}
			}
		}
		function doCallback(resultToReturn, callback, errorCallback) {
			errorCallback = errorCallback ? errorCallback : callback;
			if (isErrorObject(resultToReturn)) {
				switch (resultToReturn.errorType) {
				case 'cellularNetworkError':
				case 'deviceError':
				case 'wifiConnectionError':
					wifiCallbackDestination.receivedNonSpecificError(resultToReturn);
					break;
				default:
					errorCallback(resultToReturn);
				}
			} else {
				callback(resultToReturn);
			}
		}
	}

	/**
	 * 获取基本的wifi信息
	 * @method getWifiBasic
	 * @return {Object} wifi JSON 对象 
	 */
    function getWifiBasic() {
 
	  return doStuff(arguments, {}, prepare, deal, null, false);

       function prepare(params, isPost) {
           var requestParams = {};
           requestParams.goformId = "/goform/getWlanInfo";
            return requestParams;
        }

       function deal(data) {
            if (data) {
			if(data.security_mode == 0) {
				AuthMode = "NONE";				               
            }
            else if(data.security_mode == 4){
                AuthMode = "WPAPSKWPA2PSK";
            }else{
				AuthMode = "WPA2PSK";
			}
               var result = {                    
                    MAX_Station_num: config.MAX_STATION_NUMBER,
					wifi_enable:data.wifi_state,
                    wlan_mode:data.wlan_mode,//0:2GHz ssid,1:5GHz ssid
					apIsolation:data.ap_status,
					AuthMode:AuthMode,
					wep_key : data.wep_key,
					wep_sec : data.wep_sec,
					passPhrase: data.wpa_passphrase,
					cipher:data.wpa_sec,
					curr_num : data.curr_num,
					wifi_country_code : data.wifi_country_code,	
                    //ssid 2GHz                    
                    SSID:data.ssid,
                    broadcast:data.hidden_ssid,
                    MAX_Access_num:data.max_numsta,
					channel : data.channel,
					wmode : data.wmode,
                    //ssid 5GHz
                    m_SSID:data.ssid_5g,
                    m_broadcast:data.hidden_ssid_5g,
                    m_MAX_Access_num:data.max_numsta_5g,
					channel_5g : data.channel_5g,					
					wmode_5g : data.wmode_5g
                };
                return result;
            } else {
                return unknownErrorObject;
            }
	   }
    }

	/**
	 * 设置基本的wifi信息(SSID1)
	 * @method setWifiBasic(SSID1)
	 * @param {Object} JSON 参数对象
	 * @return {Object}
	 */
	 
	function setWifiBasic() {
		return doStuff(arguments, {}, prepare, deal, null, true);

		function prepare(params, isPost) {
			var requestParams = {};
			requestParams.goformId = "/goform/setWlanInfo";	
			var securityMode;
			if(params.AuthMode == "OPEN") {
                securityMode = 0;               
            }else if(params.AuthMode == "WPAPSKWPA2PSK"){
                securityMode = 4;     
            }else{
				securityMode = 3;     
			}
			
			requestParams.formdata = {
				wifi_state:params.wifi_enable,
				wlan_mode:params.wlan_mode,
				security_mode: securityMode,
				security_mode_5g: securityMode,
				curr_num:params.curr_num, 
				wifi_country_code:params.wifi_country_code,
				//ssid 2GHz  
				ssid : params.SSID,
				channel:params.channel, 
				hidden_ssid : params.broadcast,
				ap_status:params.apIsolation,
				max_numsta : params.station,
				wmode:params.wmode,
				wep_key:params.wep_key,
				wep_sec:params.wep_sec,
				wpa_passphrase:params.passPhrase,	
                wpa_sec: params.cipher,
				//ssid 5GHz
				channel_5g:params.channel_5g,
				ap_status_5g:params.apIsolation,
				wmode_5g:params.wmode_5g,
				wep_key_5g:params.wep_key,
				wep_sec_5g:params.wep_sec,
				wpa_passphrase_5g:params.passPhrase,	
                wpa_sec_5g: params.cipher
			};

			if(params.wlan_mode==0){
				requestParams.formdata.ssid_5g = requestParams.formdata.ssid = params.SSID;
				requestParams.formdata.hidden_ssid_5g = requestParams.formdata.hidden_ssid = params.broadcast;
				requestParams.formdata.max_numsta_5g = requestParams.formdata.max_numsta = params.station;
			}else{
				requestParams.formdata.ssid_5g = requestParams.formdata.ssid = params.m_SSID;
				requestParams.formdata.hidden_ssid_5g = requestParams.formdata.hidden_ssid = params.m_broadcast;
				requestParams.formdata.max_numsta_5g = requestParams.formdata.max_numsta = params.m_station;
			}
            
			return requestParams;
		}

        function deal(data) {
			var result = {};			
			if (data && (data.error == API_RESULT_SUCCESS)) {
				result.result = "success";
			}else {
                result.result = "fail";
			}
					
		  return result;
        }
	}

    /**
     * 设置基本的wifi信息
     * @method setWifiBasic
     * @param {Object} JSON 参数对象
     * @example
     * @return {Object}
     */
    function setWifiSwitch() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
			var wifi_state;
			requestParams.goformId = "/goform/setWifiSwitch";
			requestParams.formdata = {wifi_state : params.wifi_enable};
            return requestParams;
        }

        function deal(data) {
			var result = {};			
			if (data && (data.error == API_RESULT_SUCCESS)) {
				result.result = "success";
			}else {
                result.result = "fail";
			}
					
		  return result;
        }
    }
	
    /**
     * 获取wifi安全设置信息
     * @method getSecurityInfo
     * @return {Object} wifi 安全 json 对象
     */
	function getSecurityInfo() {
		return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
        	var requestParams = {};
			requestParams.isTest = isTest;
        	requestParams.cmd = "AuthMode,passPhrase";
        	requestParams.multi_data = 1;
        	return requestParams;
        }
        
        function deal(data) {
        	if (data) {
        		var result = {};
        		result.AuthMode = data.AuthMode;
        		result.passPhrase = config.PASSWORD_ENCODE ? Base64.decode(data.passPhrase) : data.passPhrase;
        		return result;
        	} else {
        		return unknownErrorObject;
        	}
        }
	}
	
	function setSecurityInfo() {
		return doStuff(arguments, {}, prepare, deal, null, true);

		function prepare(params, isPost) {
			var requestParams = {};
			requestParams.isTest = isTest;
			requestParams.goformId = "SET_WIFI_SECURITY_INFO";
			requestParams.AuthMode = params.AuthMode;
            if(requestParams.AuthMode == "WPAPSKWPA2PSK") {
			    requestParams.passPhrase = config.PASSWORD_ENCODE ? Base64.encode(params.passPhrase) : params.passPhrase;
            }
			return requestParams;
		}

		function deal(data) {
			if (data) {
				return data;
			} else {
				return unknownErrorObject;
			}
		}
	}

    /**
     * 获取当前已连接设备的信息
     * @method getCurrentlyAttachedDevicesInfo
     * @return {Object} JSON
     * @example
     //返回结构格式
     * {
     *  macAddress:"E8-E3-A5-AB-86-44",
     *  ipAddress:"192.168.0.45",
     *  hostName:"myhostName",
     *  timeConnected:10
     * }
     */
    function getCurrentlyAttachedDevicesInfo(){
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
			var requestParams = {};
			requestParams.goformId = "/goform/getWlanClientInfo";
			requestParams.formdata = {};
            return requestParams;
        }

        function deal(data) { 
            var deviceArr = [];
            var attachedDevices = data.data;
            for(var i = 0; attachedDevices && i < attachedDevices.length; i++ ){
                var obj = {};
                obj.macAddress = attachedDevices[i].mac_addr;
                var hostname = attachedDevices[i].host_name;
                obj.hostName = hostname == "" ? $.i18n.prop("unknown") : hostname;
                deviceArr.push(obj);
            }
            return {attachedDevices: deviceArr};
        }
    }

	function getLanguage() {
		return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "/goform/getCurrentLanguage";
			requestParams.formdata = {};
         
            return requestParams;
        }

        function deal(data) {
            if (data) {
                var result = {};
                result.Language = (data && data.language) ? data.language : "en";
                return result;
            } else {
                return unknownErrorObject;
            }
        }
	}

    function setLanguage() {
    	return doStuff(arguments, {}, prepare, deal, null, true);

		function prepare(params, isPost) {
			var requestParams = {};
			requestParams.goformId = "/goform/setLanguage";
			requestParams.formdata = {language : params.Language};
			return requestParams;
		}

		function deal(data) {
			if (data) {
				return data;
			} else {
				return unknownErrorObject;
			}
		}
    }

    function getNetSelectInfo() {
		return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.multi_data = 1;
			requestParams.goformId = "/goform/getNetworkList";	
            return requestParams;
        }
        
        function deal(data) {
            if (data) {
            	var m_netselect_contents = "";
            	var nw_sel_stat = data.nw_sel_stat;
            	var nw_list_len = parseInt(data.nw_list_len);
            	var nw_list_data = data.nw_list_data;
            	if (nw_list_len>0 && nw_list_data.length > 0)
				{
					for ( var i = 0; i < nw_list_data.length; i++)
					{
						var plmn = nw_list_data[i].mcc.toString()+(nw_list_data[i].mnc.toString().length<2?"0"+nw_list_data[i].mnc:nw_list_data[i].mnc);
						m_netselect_contents =m_netselect_contents + nw_list_data[i].state + "," + nw_list_data[i].fullname + "," + plmn + "," + nw_list_data[i].rat+ "," + nw_list_data[i].id + ";";
					}
					m_netselect_contents =m_netselect_contents + "manual_selecting";
				}
            	var bearerInfo = getBearerPreference();
                var result = {};
                result.current_network_mode = "";
                result.net_select_mode = "";
                result.m_netselect_save = bearerInfo.m_netselect_save;
                result.m_netselect_contents = m_netselect_contents;
                result.net_select = bearerInfo.net_select;
                result.ppp_status = "";
                result.modem_main_state = "modem_init_complete";
                result.nw_sel_stat = nw_sel_stat;
                result.nw_list_len = nw_list_len;
                result.nw_list_data = nw_list_data;
                return result;
            } else {
                return unknownErrorObject;
            }
        }
	}
        
    function getBearerPreference()
	{
    	return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
        	var requestParams = {};
        	requestParams.goformId = "/goform/getNetworkInfo";	
        	return requestParams;
        }
        function deal(data) {
        	if (data) {
        		var nw_mode = parseInt(data.nw_mode);
        		//console.info(nw_mode);
        		var bearer = "NETWORK_auto";
    			switch (nw_mode)
    			{
    			case 28:
    				bearer = "NETWORK_auto";
    				break;
    			case 16:
    				bearer = "Only_LTE";
    				break;
    			case 8:
    				bearer = "Only_WCDMA";
    				break;
    			case 4:
    				bearer = "Only_GSM";
    				break;
    			default:
    				bearer = "NETWORK_auto";
    				break;
    			}
    			var network_select_mode = parseInt(data.network_select_mode);
    			var m_netselect_save = "auto_select";
    			if (network_select_mode == SEL_MODE_MANUAL)
				{
    				m_netselect_save = "manual_select";
				}
    			 var result = {};
                 result.net_select = bearer;
                 result.m_netselect_save = m_netselect_save;
                 
                 return result;
        	} else {
        		return unknownErrorObject;
        	}
        }
	}

	function setBearerPreference() {
		return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
        	var requestParams = {};
        	var nw_sel_mode = params.nw_sel_mode;
        	if (!nw_sel_mode)
			{
				nw_sel_mode = SEL_MODE_AUTOMATIC;
			}
        	var bearer = params.strBearerPreference;
        	var nw_mode = 28;
        	requestParams.goformId = "/goform/setNetworkInfo";	
			switch (bearer)
			{
			case "NETWORK_auto":
				nw_mode = 28;
				break;
			case "Only_LTE":
				nw_mode = 16;
				break;
			case "Only_WCDMA":
				nw_mode = 8;
				break;
			case "Only_GSM":
				nw_mode = 4;
				break;
			default:
				nw_mode = 28;
				break;
			}
			requestParams.formdata = {
				"nw_mode":nw_mode,
				"nw_sel_mode":nw_sel_mode
			}
        	return requestParams;
        }
        function deal(data) {
        	if (data.error == API_RESULT_SUCCESS) {
        		data.result = "success";
        		return data;
        	} else {
        		return unknownErrorObject;
        	}
        }
    }
	function setNetworkSelect() {
		return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
        	var requestParams = {};
        	requestParams.goformId = "/goform/setNetworkSelect";	
        	
        	return requestParams;
        }
        function deal(data) {
        	if (data.error == API_RESULT_SUCCESS) {
        		data.result = "success";
        		return data;
        	} else {
        		return unknownErrorObject;
        	}
        }
    }
	
	function setNetworkRegister() {
		return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
        	var requestParams = {};
        	requestParams.goformId = "/goform/setNetworkRegister";	
        	requestParams.formdata = {
				"index":params.nId
			}
        	return requestParams;
        }
        function deal(data) {
        	if (data.error == API_RESULT_SUCCESS) {
        		data.result = "success";
        		return data;
        	} else {
        		return unknownErrorObject;
        	}
        }
    }
	

	
	/**************************************************************************
	 Description : scan the network
	 Parameters :
	 [IN] : function :callback(bResult, listNetwork) : call back function, and the parameters list below:
	 [IN] : bool   : bResult     : true = succeed, false = failed.
	 [IN] : object : listNetwork : network information array, the object attribute in the array below:
	 type   :   name                   : description
	 string : strFullName              : operator full name(the value is maybe ""),
	 such as 'china mobile'
	 string : strShortName             : operator short name(the value is maybe ""),
	 such as 'china mobile'
	 string : strNumeric               : the digital number, such as '460'
	 number : nRat                     : the network connect technology, 0 = '2G', 2 = '3G'.
	 number : nState : operator availability as int at+cops=? <stat> (This is as per 3GPP TS 27.007)
	 if get net work list failed, the return value will be an null array.
	 return : void
     @method scanForNetwork
	 **************************************************************************/
	function scanForNetwork(net_select,callback) {
        if(isTest) {
            setTimeout(function() {parseScanResult(simulate.m_netselect_contents);}, 500);
            return;
        }
        var selectInfo = getNetSelectInfo();
        var m_netselect_save = selectInfo.m_netselect_save;
        //var net_select = selectInfo.net_select;
        if (m_netselect_save != "manual_select")
		{
        	var setResultInfo = setBearerM(net_select);
        	if (setResultInfo != "success")
			{
        		callback(false, []);
			}
		}
      
        var setResultSelecting = setNetworkSelect();
        if (setResultSelecting.result == "success")
		{
        	checkScanStatus();
		}else {
            callback(false, []);
        }
        function checkScanStatus() {
        	var selectInfo = getNetSelectInfo();
        	if(selectInfo == null){
    	        return;
    	    }
    	    var nwSelStat=selectInfo.nw_sel_stat;
    	    var nwListLen=selectInfo.nw_list_len;
    	    if(nwSelStat==SE_NW_SELECT_SUCCESS && nwListLen>0)
    	    {
    	    	 parseScanResult(selectInfo.m_netselect_contents);
    	    }else if(nwSelStat==SE_NW_SELECT_FAILURE ||(nwSelStat==SE_NW_SELECT_SUCCESS&&nwListLen==0))
    	    {
    	    	callback(false, []);
    	    }else if(nwSelStat== SE_NW_SELECTING)
    	    {
    	    	setTimeout(checkScanStatus, 2000);
    	    }else
    	    {
    	    	callback(false, []);
    		}
        }
        function setBearerM(net_select)
		{
        	var params = {"nw_sel_mode":SEL_MODE_MANUAL,"strBearerPreference":net_select};
        	result = "failed";
        	setBearerPreference(params, function(data) {
				if (data.result == "success") {
					result = "success";
				}else {
					result = "failed";
				} 
        	});
        	return result;
		}

		function parseScanResult(result) {
            var pattern = /([^,;]*),([^,]*),([^,]*),([^,]*),([^,;]*)/g;
			var listNetwork = [];
			var mts;
			
			while (mts = pattern.exec(result)) {
				if (mts != null) {
					listNetwork.push({
                        //strFullName: mts[2].replace(/\"/g,''),
                        strShortName: mts[2].replace(/\"/g,''),
                        strNumeric: mts[3].replace(/\D/g,''),
                        nRat: parseInt(mts[4],10),
                        nState: parseInt(mts[1],10),
                        nId: parseInt(mts[5],10),
                        radioEnabled: true
					});
				}
			}
			callback(true, listNetwork);
		}
	}
    
    var timerInfo = {
    	networkName :"",
		networkType : "",
		ip4PriDns:"",
		ip4SecDns:"",
		ip6PriDns:"",
		ip6SecDns:"",
		signalImg : "0",
		simStatus:"modem_init_complete",
		networkOperator : "",
		spn_display_flag : "1",
		plmn_display_flag : "1",
		spn_b1_flag : "1",
		spn_b2_flag : "1",
		spn_name_data : "",
		connectStatus : "ppp_disconnected",
		attachedDevices : [],
		curr_connected_devices : [],
        data_counter:{ 
        	uploadRate : 0,
    		downloadRate : 0,
    		totalSent : 0,
			totalReceived : 0,
			totalConnectedTime : 0,
			currentSent : 0,
			currentReceived : 0,
			currentConnectedTime : 0,
			monthlySent: 0,
			monthlyReceived: 0,
			monthlyConnectedTime: 0,
			month : ''
        },
	    newSmsReceived : false,
        smsReportReceived : true,
	    smsUnreadCount : "0",
	    isLoggedIn : undefined,
        limitVolumeEnable : false,
        limitVolumeType : '1',
	    limitVolumePercent : "100",
	    limitVolumeSize : "0",
        allowRoamingUpdate : "0",
        ap_station_enable: undefined,
		wifi_client_num:0
    };
    
    function getStatusInfo(){
        if (timerInfo.isLoggedIn === undefined) {
            var loginStatus = getLoginStatus();
            return {
                networkType:timerInfo.networkType,
                networkName:timerInfo.networkName,
        		ip4PriDns:timerInfo.ip4PriDns,
        		ip4SecDns:timerInfo.ip4SecDns,
        		ip6PriDns:timerInfo.ip6PriDns,
        		ip6SecDns:timerInfo.ip6SecDns,
                signalImg:timerInfo.signalImg,
                networkOperator:timerInfo.networkOperator,
                connectStatus:timerInfo.connectStatus,
                attachedDevices:timerInfo.curr_connected_devices,
                roamingStatus:timerInfo.roamingStatus,
                wifiStatus:timerInfo.wifiStatus,
                simStatus:timerInfo.simStatus,
                pinStatus:timerInfo.pinStatus,
                batteryCapacity:timerInfo.batteryCapacity,
                batteryStatus:timerInfo.batteryStatus,
                batteryLevel:timerInfo.batteryLevel,
                batteryPers:timerInfo.batteryPers,
                batteryTime:timerInfo.batteryTime,
                ssid:timerInfo.ssid,
                authMode:timerInfo.authMode,
                data_counter:timerInfo.data_counter,
                isLoggedIn:loginStatus.status == "loggedIn",
                newSmsReceived:timerInfo.newSmsReceived,
                smsReportReceived:timerInfo.smsReportReceived,
                smsUnreadCount:timerInfo.smsUnreadCount,
                limitVolumeEnable:timerInfo.limitVolumeEnable,
                limitVolumeType:timerInfo.limitVolumeType,
                limitVolumePercent:timerInfo.limitVolumePercent,
                limitVolumeSize:timerInfo.limitVolumeSize,
                connectWifiProfile:timerInfo.connectWifiProfile,
                connectWifiSSID:timerInfo.connectWifiSSID,
                connectWifiStatus:timerInfo.connectWifiStatus,
                multi_ssid_enable:timerInfo.multi_ssid_enable,
                spn_display_flag:timerInfo.spn_display_flag,
                plmn_display_flag:timerInfo.plmn_display_flag,
                spn_b1_flag:timerInfo.spn_b1_flag,
                spn_b2_flag:timerInfo.spn_b2_flag,
                spn_name_data:timerInfo.spn_name_data,
                roamMode: timerInfo.roamMode,
				connectionMode_t:timerInfo.connectionMode_t,
                current_upgrade_state:timerInfo.current_upgrade_state,
                is_mandatory:timerInfo.is_mandatory,
		        new_version_state:timerInfo.new_version_state,
                allowRoamingUpdate: timerInfo.allowRoamingUpdate,
                hplmn: timerInfo.hplmn,
                mdmMcc: timerInfo.mdmMcc,
                mdmMnc: timerInfo.mdmMnc,
				wifi_client_num:timerInfo.wifi_client_num
            };
        }

    	return {
    		networkType : timerInfo.networkType,
    		networkName:timerInfo.networkName,
    		ip4PriDns:timerInfo.ip4PriDns,
    		ip4SecDns:timerInfo.ip4SecDns,
    		ip6PriDns:timerInfo.ip6PriDns,
    		ip6SecDns:timerInfo.ip6SecDns,
    		signalImg : timerInfo.signalImg,
    		networkOperator : timerInfo.networkOperator,
    		connectStatus : timerInfo.connectStatus,
    		attachedDevices : timerInfo.curr_connected_devices,
    		roamingStatus : timerInfo.roamingStatus,
    		wifiStatus : timerInfo.wifiStatus,
    		simStatus : timerInfo.simStatus,
            pinStatus : timerInfo.pinStatus,
            batteryCapacity:timerInfo.batteryCapacity,
    		batteryStatus: timerInfo.batteryStatus,
    		batteryLevel: timerInfo.batteryLevel,
            batteryPers: timerInfo.batteryPers,
            batteryTime :timerInfo.batteryTime,
            ssid : timerInfo.ssid,
            authMode: timerInfo.authMode,
            data_counter:timerInfo.data_counter,
            isLoggedIn:timerInfo.isLoggedIn,
            newSmsReceived : timerInfo.newSmsReceived,
            smsReportReceived : timerInfo.smsReportReceived,
            smsUnreadCount : timerInfo.smsUnreadCount,
            limitVolumeEnable : timerInfo.limitVolumeEnable,
            limitVolumeType : timerInfo.limitVolumeType,
    	    limitVolumePercent : timerInfo.limitVolumePercent,
    	    limitVolumeSize : timerInfo.limitVolumeSize,
            connectWifiProfile:timerInfo.connectWifiProfile,
            connectWifiSSID:timerInfo.connectWifiSSID,
            connectWifiStatus:timerInfo.connectWifiStatus,
            multi_ssid_enable:timerInfo.multi_ssid_enable,
            spn_display_flag:timerInfo.spn_display_flag,
            plmn_display_flag:timerInfo.plmn_display_flag,
            spn_b1_flag:timerInfo.spn_b1_flag,
            spn_b2_flag:timerInfo.spn_b2_flag,
            spn_name_data:timerInfo.spn_name_data,
            roamMode: timerInfo.roamMode,
			connectionMode_t:timerInfo.connectionMode_t,
            current_upgrade_state:timerInfo.current_upgrade_state,
            is_mandatory:timerInfo.is_mandatory,
            new_version_state:timerInfo.new_version_state,
	        allowRoamingUpdate:timerInfo.allowRoamingUpdate,
            ap_station_enable: timerInfo.ap_station_enable,
	        hplmn: timerInfo.hplmn,
            mdmMcc: timerInfo.mdmMcc,
            mdmMnc: timerInfo.mdmMnc,
            wifi_client_num:timerInfo.wifi_client_num
    	};
    }    

	/**
	 * 获取联网及流量信息
	 * @method getConnectionInfo
	 */
    function getConnectionInfo(){
	  return doStuff(arguments, {}, prepare, deal, null, false);

       function prepare(params, isPost) {
           var requestParams = {};
           requestParams.goformId = "/goform/getWanInfo";
			requestParams.formdata = {};

            return requestParams;
        }

       function deal(data) {
            if (data) {
				var conn_status;
				var conn_roam;
				 if(data.wan_state == MACRO_PPP_CONNECTED){
					 conn_status = "ppp_connected";
				 }else if(data.wan_state == MACRO_PPP_CONNECTING){
					 conn_status = "ppp_connecting";
				 }else if(data.wan_state == MACRO_PPP_DISCONNECTING){
					 conn_status = "ppp_disconnecting";
				 }else{
					 conn_status = "ppp_disconnected";
				 }
				 
				 if(data.roam == MACRO_ROAM_ENABLE){
					 conn_roam = "on";
				 }else{
					 conn_roam = "off";
				 }
				
                var result = {
                    data_counter:{ 
						uploadRate : data.Speed_Ul,
						downloadRate : data.Speed_Dl,
						totalSent : 0,
						totalReceived : 0,
						totalConnectedTime : 0,
						currentSent : data.upload,
						currentReceived : data.download,
						currentConnectedTime : data.dur_time,
						monthlySent: 0,
						monthlyReceived: 0,
						monthlyConnectedTime: 0,
						month : ''
					},
					connectStatus:conn_status,
					limitVolumeEnable : false,
					limitVolumeType:"1",
					limitDataMonth:"0",
					limitTimeMonth:"0",
					connectWifiSSID :"",
					connectWifiStatus :"",
					roamState:conn_roam,
					wan_ip:data.wan_ip,
					wan_ip6:data.wan_ip6,
					network_name :data.network_name == "N/A" ||data.network_name == "NA" ?"": data.network_name,
					network_type:data.network_type,
					ip4_pri_dns:data.ip4_pri_dns || "",
					ip4_sec_dns:data.ip4_sec_dns || "",
					ip6_pri_dns:data.ip6_pri_dns || "",
					ip6_sec_dns:data.ip6_sec_dns || ""
                };
                return result;
            } else {
                return unknownErrorObject;
            }
	   }
    }

    /**
     * 清除流量信息
     * @method clearTrafficData
     */
    function clearTrafficData(){
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.isTest = isTest;
            requestParams.goformId = "RESET_DATA_COUNTER";
            requestParams.option = "curr_total_month";
            return requestParams;
        }

        function deal(data) {
            if (data.result == "success") {
                return {
                    result : true
                };
            } else {
                return {
                    result : false
                };
            }
        }
    }
    
    /**
     * 将未读短信变量从接收到未读短信设置成没有接收到
     * @method resetNewSmsReceivedVar
     * @example
     * timerInfo.newSmsReceived = false;
     */
    function resetNewSmsReceivedVar(){
    	timerInfo.newSmsReceived = false;
    }

    /**
     * 将短信发送报告变量从接收到设置成没有接收到
     * @method resetSmsReportReceivedVar
     * @example
     * timerInfo.smsReportReceived = false;
     */
    function resetSmsReportReceivedVar(){
    	timerInfo.smsReportReceived = false;
    }
    
    /**
     * 获取短信容量。
     * @method getSmsCapability
     */
    function getSmsCapability(){
    	return doStuff(arguments, {}, prepare, deal, null, true);

		function prepare(params, isPost) {
			var requestParams = {};
			requestParams.goformId = "/goform/getSMSStoreState";
			requestParams.formdata = {};
			return requestParams;
		}

		function deal(data) {
		    var totalCount = 0;
			var usedCount = 0;
		    if (data){
                totalCount = data.total_count;
				usedCount = data.used_count;
				newCount = data.sms_new_count;
				leftCount = data.left_count;
				sim_totalCount = data.sim_total_count;
				sim_usedCount = data.sim_used_count;
				sim_newCount = 0;
				sim_leftCount = 0;
		    }
		 
		   return {
				nvTotal: parseInt(totalCount,10),
				nvUsed: parseInt(usedCount,10),
				nvNew:parseInt(newCount,10),
				nvLeft:parseInt(leftCount,10),
				simTotal:parseInt(sim_totalCount,10),
				simUsed: parseInt(sim_usedCount,10),
				simNew:parseInt(sim_newCount,10),
				simLeft:parseInt(sim_leftCount,10)
		  }

		}
    }
	
    /**
     * set connect begain
     * @method setConnectBegain
     */
	
	function setConnectBegain(){
		return doStuff(arguments, {}, prepare, deal, null, true);

		function prepare(params, isPost) {
			var requestParams = {};
			requestParams.notCallback = true;
			requestParams.goformId = "/goform/setWanConnect";
			requestParams.formdata = {profile_id:getCurrentProfile().currentProfileID};
			return requestParams;
		}

		function deal(data) {
			var result = {};
			if (data&&data.error == API_RESULT_SUCCESS) {
				result.result = true;
			} else {
				result.result = false;
			}			
			return result;
		}
	}
    
    /**
     * 联网
     * @method connect
     */
    function connect() {
		var callback = arguments[1];
        var checkPoint = 0;
		
		var connect_result = setConnectBegain();
		
		if(connect_result.result){
			
			checkConnectStatus();
			
		}else{
			callback({result : false});
		}
		
		function checkConnectStatus() {
			
			var conn_state = getConnectionInfo();
			
			if(conn_state.connectStatus == "ppp_connecting")
    	    {
				setTimeout(checkConnectStatus, 1000);
				
    	    }else if(conn_state.connectStatus == "ppp_connected")
    	    {
    	   		callback({result : true});
				
    	    }else{
    	    	
				callback({result : false});
    		}
		}
	}

    /**
     * 断网
     * @method disconnect
     */
    function disconnect() {
		var callback = arguments[1];
        var checkPoint = 0;
		return doStuff(arguments, {}, prepare, deal, null, true);

		function prepare(params, isPost) {
			var requestParams = {};
			requestParams.goformId = "/goform/setWanDisconnect";
			return requestParams;
		}

		function deal(data) {
			var result= {};
			if (data&&data.error == API_RESULT_SUCCESS) {
				
				result.result = true;
               // checkPoint = new Date().getTime();
				//addCallback(checkDisconnectStatus);				
			} else {
				/*callback({
					result : false
				});*/
				
				result.result = false;
			}
			return result;
		}

		function checkDisconnectStatus(data) {
			
			if (data.ppp_status == "ppp_disconnecting") {
				timerInfo.connectStatus = "ppp_disconnecting";
			} else if (data.ppp_status == "ppp_disconnected") {
				removeCallback(checkDisconnectStatus);
				timerInfo.connectStatus = "ppp_disconnected";
				callback({
					result : true,
					status : timerInfo.connectStatus
				});
			} else if(new Date().getTime() - checkPoint < 1e4){
                timerInfo.connectStatus = "ppp_disconnecting";
			} else {
				removeCallback(checkDisconnectStatus);
				callback({
					result : false
				});
			}
		}
	}

    /**
     * 获取apn信息
     * @method getApnSettings
     * @return {Object} JSON
     * @example
      //返回结果格式
		{
	    	APNs : result.APN_config0 + "||" + result.APN_config1 + "||" + result.APN_config2 + "||" + result.APN_config3 + "||" + result.APN_config4 + "||" + result.APN_config5 + "||" + result.APN_config6 + "||" + result.APN_config7 + "||" + result.APN_config8 + "||" + result.APN_config9,
			ipv6APNs : result.ipv6_APN_config0 + "||" + result.ipv6_APN_config1 + "||" + result.ipv6_APN_config2 + "||" + result.ipv6_APN_config3 + "||" + result.ipv6_APN_config4 + "||" + result.ipv6_APN_config5 + "||" + result.ipv6_APN_config6 + "||" + result.ipv6_APN_config7 + "||" + result.ipv6_APN_config8 + "||" + result.ipv6_APN_config9,
			apnMode : result.apn_select,
			profileName :  result.m_profile_name || result.profile_name,
			wanDial : result.wan_dial,
			apnSelect : result.apn_select,
			pdpType : result.pdp_type,
			pdpSelect : result.pdp_select,
			pdpAddr : result.pdp_addr,
			index : result.index,
			currIndex : result.Current_index,
			autoApns : result.apn_auto_config,
			wanApn : result.wan_apn,
			authMode : result.ppp_auth_mode,
			username : result.ppp_username,
			password : result.ppp_passwd,
			dnsMode : result.dns_mode,
			dns1 : result.prefer_dns_manual,
			dns2 : result.standby_dns_manual,
			wanApnV6 : result.ipv6_wan_apn,
			authModeV6 : result.ipv6_ppp_auth_mode,
			usernameV6 : result.ipv6_ppp_username,
			passwordV6 : result.ipv6_ppp_passwd,
			dnsModeV6 : result.ipv6_dns_mode,
			dns1V6 : result.ipv6_prefer_dns_manual,
			dns2V6 : result.ipv6_standby_dns_manual
    	}
     * 
     */
    function getApnSettings() {
    	return doStuff(arguments, {}, prepare, deal, null, false);

		function prepare(params, isPost) {			
			var requestParams = {};
			requestParams.goformId = "/goform/getProfileList";
			requestParams.formdata = {};
			return requestParams;
		}

		function deal(data) {
			if (data.data_len > 0 ) {
				var result;
				var profileList = data.data;
				var defaultProfile = {};
				
				var str="";
				var strV6 = "";
				var strV4v6="";
				$.each(profileList,function(i,v){
				var v4_dns_mode = v.v4_dns_mode == 0 ? "auto" : "manual";
				var v6_dns_mode = v.v6_dns_mode == 0 ? "auto" : "manual";

					var protocol;
					switch(v.profile_protocol){
		                case 0:
		                    protocol="none";
		                    break;
		                case 1:
		                    protocol="pap";
		                    break;
		                case 2:
		                    protocol="chap";
		                    break;
		                case 3:
		                    protocol="pap&chap";
		                    break;
		                default:
		                    protocol="none";
		                    break;
		            }
		            var ip_type;
		            switch(v.ip_type){
		                case 0:
		                    ip_type="IP";
		                    break;
		                case 2:
		                    ip_type="IPv6";
		                    break;
		                case 3:
		                    ip_type="IPv4v6";
		                    break;
		                default:
		                    ip_type="IP";
		                    break;
		            }
					if (ip_type == "IP") {
						str+=v.profile_name + "($)"+ v.profile_apn +"($)manual($)"+ v.profile_number+"($)"+ protocol +"($)"+v.profile_username + "($)" + v.profile_password + "($)" + ip_type +"($)+($)+($)" + v4_dns_mode +"($)"+v.pri_v4_dns_addr +"($)"+ v.sec_v4_dns_addr +"($)($)||";	
					}else{
						strV4v6+=v.profile_name + "($)"+ v.profile_apn +"($)manual($)"+ v.profile_number+"($)"+ protocol +"($)"+v.profile_username + "($)" + v.profile_password + "($)" + ip_type +"($)+($)+($)"+ v4_dns_mode +"($)"+v.pri_v4_dns_addr +"($)"+ v.sec_v4_dns_addr +"($)" + v6_dns_mode +"($)"+v.pri_v6_dns_addr +"($)"+ v.sec_v6_dns_addr +"($)($)||";
					};
					if(v.profile_defualt == DEFUALT_PROFILE_VALUE){
						defaultProfile.profileName = v.profile_name;
						defaultProfile.wanDial = v.profile_number;
						defaultProfile.ip_type = ip_type;		
						defaultProfile.wan_apn = v.profile_apn;
						defaultProfile.authMode = v.protocol;
						defaultProfile.username = v.profile_username;
						defaultProfile.password = v.profile_password;						
						defaultProfile.pdpAddr = v.pri_v4_dns_addr;
						defaultProfile.index = v.profile_id;
						defaultProfile.dnsmode = v4_dns_mode;
						defaultProfile.dns1 = v.pri_v4_dns_addr;
						defaultProfile.dns2 = v.sec_v4_dns_addr;				
						defaultProfile.v6dnsmode = v6_dns_mode;
						defaultProfile.v6dns1 = v.pri_v6_dns_addr;
						defaultProfile.v6dns2 = v.sec_v6_dns_addr;						
					}
				})
				return result = {
					APNs : str+strV4v6,
					ipv6APNs:strV4v6,
					apnMode : "manual",
					profileName : defaultProfile.profileName,
					wanDial : defaultProfile.wanDial,
					apnSelect : defaultProfile.apn_select,
					pdpType : defaultProfile.ip_type == 'IP' ? 'IP' : defaultProfile.ip_type,
					pdpSelect : defaultProfile.pdp_select,
					pdpAddr : defaultProfile.pdp_addr,
					index : defaultProfile.profile_id,
					currIndex : defaultProfile.profile_id,
					autoApns : defaultProfile.apn_auto_config,
					autoApnsV6 : defaultProfile.ipv6_apn_auto_config,
					wanApn : defaultProfile.wan_apn,
					authMode : defaultProfile.authMode,
					username : defaultProfile.username,
					password : defaultProfile.password,
					dnsMode : defaultProfile.dnsmode,
					dns1 : defaultProfile.dns1,
					dns2 : defaultProfile.dns2,
					wanApnV6: defaultProfile.wan_apn,
			        authModeV6: defaultProfile.authMode,
			        usernameV6: defaultProfile.username,
			        passwordV6: defaultProfile.password,
			        dnsModeV6: defaultProfile.v6dnsmode,
			        dns1V6: defaultProfile.v6dns1,
			        dns2V6: defaultProfile.v6dns2
				};
			} else {
				return result = {};
			}
		}
    }
    /*
		获取profile列表
    */
    function getApnSettingsList() {
    	return doStuff(arguments, {}, prepare, deal, null, false);

		function prepare(params, isPost) {			
			var requestParams = {};
			requestParams.goformId = "/goform/getProfileList";
			requestParams.formdata = {};
			return requestParams;
		}
		function deal(data) {
			if (data.error == API_RESULT_SUCCESS) {
				return data.data;
			} else {
				return {};
			}
		}
	}
	/*
	 *获取当前ProfileID
	*/
	function getCurrentProfile(){
		return doStuff(arguments, {}, prepare, deal, null, false);
		function prepare(params, isPost){
			var requestParams = {};
			requestParams.goformId = "/goform/getCurrentProfile";
			requestParams.formdata = {};
			return requestParams;
		}
		function deal(data){
			if (data) {
                var result = {};
				var ip_type; 	
				var v4_dns_mode = data.v4_dns_mode == 0 ? "auto" : "manual";
				var v6_dns_mode = data.v6_dns_mode == 0 ? "auto" : "manual";
				
				if(data.ip_type == 2){
					ip_type = "IPv6";
				}else if(data.ip_type == 3){
					ip_type = "IPv4v6";
				}else{
					ip_type = "IP";
				}
                result.currentProfileID = data.profile_id; 
				result.profileName = data.profile_name;
				result.wanApn = data.profile_apn;
				result.wanApnV6 = data.profile_apn;
				result.pdpType = ip_type;
				result.dns_mode_v4 = v4_dns_mode;
				result.dnsPriAddrV4_manual = data.pri_v4_dns_addr;
				result.dnsSecAddrV4_manual = data.sec_v4_dns_addr;
				result.dns_mode_v6 = v6_dns_mode;
				result.dnsPriAddrV6_manual = data.pri_v6_dns_addr;
				result.dnsSecAddrV6_manual =  data.sec_v6_dns_addr;
				
                return result;
            } else {
                return unknownErrorObject;
            }
		}
	}
    /**
     * 根据profile name删除apn信息
     * @method deleteApn
     * @return {Object} JSON resultObject
     * @example
      //请求参数映射
		{
			goformId : "APN_PROC_EX",
			apn_action : "delete",
			apn_mode : "manual",
			index : params.index
		}
     */
    function deleteApn(){
    	return doStuff(arguments, {}, prepare, deal, null, true);
    	
    	function prepare(params, isPost) {
    		var requestParams={};
    		requestParams.formdata = {
				profile_id : params.index
    		};
    		requestParams.goformId = "/goform/setProfileDelete";
    		return requestParams;
		}

		function deal(data) {
			if (data.error == API_RESULT_SUCCESS) {
				return {
					result : true
				};
			} else {
				return {
					result : false
				};
			}
		}
    }

    /**
     * 设置默认APN
     * @method setDefaultApn
     * @return {Object} JSON resultObject
     * @example
     */
    function setDefaultApn(){
    	return doStuff(arguments, {}, prepare, deal, null, true);    	
    	function prepare(params, isPost) {
    		var requestParams={};
    		requestParams.formdata = {
            	profile_id : params.index
            }
    		requestParams.goformId = "/goform/setProfileDefault";
    		return requestParams;
		}

		function deal(data) {
			if (data.error == API_RESULT_SUCCESS) {
				return {
					result : true
				};
			} else {
				return {
					result : false
				};
			}
		}
    }

    /**
     * 新增APN
     * @method addOrEditApn
     * @return {Object} JSON resultObject
     */
    function addOrEditApn(){
    	return doStuff(arguments, {}, prepare, deal, null, true);
    	function prepare(params, isPost) {
    		var requestParams = {};
    		var ip_type;
    		var v4_dns_mode = params.dnsMode == "auto" ? 0 : 1;
			var v6_dns_mode = params.dnsModeV6 == "auto" ? 0: 1;
			var protocol;
			switch(params.authMode){
                case "none":
                    protocol=0;
                    break;
                case "pap":
                    protocol=1;
                    break;
                case "chap":
                    protocol=2;
                    break;
                case "pap&chap":
                    protocol=3;
                    break;
                default:
                    protocol=0;
                    break;
            }
    		switch(params.pdpType){
                case "IP":
                    ip_type=0;
                    break;
                case "IPv6":
                    ip_type=2;
                    break;
                case "IPv4v6":
                    ip_type=3;
                    break;
                default:
                    ip_type=0;
                    break;
         	   };
     	    if(params.dns2V6 == undefined || params.dns2V6 == null){
				params.dns2V6 = "";
			};
			if(params.dns2 == undefined || params.dns2 == null){
				params.dns2 = "";
			};
			requestParams.formdata = {};
    		if(config.USE_IPV6_INTERFACE){
    			 $.extend(requestParams.formdata,  {
					profile_name : params.profileName,
					profile_number : '*99#',
					ip_type: ip_type,//IP/IPv6/IPv4v6
					profile_apn : params.wanApn,
					profile_protocol : protocol,
					profile_username : params.username,
					profile_password : params.password,
					key:params.key,
					profile_id : params.profileID
    			});
    			if(ip_type == 0){
    				$.extend(requestParams.formdata, {
    					v4_dns_mode : v4_dns_mode,
    					pri_v4_dns_addr : params.dns1,
    					sec_v4_dns_addr : params.dns2,
						v6_dns_mode : 0,
    					pri_v6_dns_addr : "",
    					sec_v6_dns_addr : ""
    				});
    			}else if(ip_type == 2){
    				$.extend(requestParams.formdata, {
					v4_dns_mode : 0,
    					pri_v4_dns_addr : "",
    					sec_v4_dns_addr : "",
    					v6_dns_mode : v6_dns_mode,
    					pri_v6_dns_addr : params.dns1V6,
    					sec_v6_dns_addr : params.dns2V6
    				});
    			}else{//"IPv4v6"
    				$.extend(requestParams.formdata, {
    					v4_dns_mode : v4_dns_mode,
    					pri_v4_dns_addr : params.dns1,
    					sec_v4_dns_addr : params.dns2,
    					v6_dns_mode : v6_dns_mode,
    					pri_v6_dns_addr : params.dns1V6,
    					sec_v6_dns_addr : params.dns2V6
    				});
    			}
				
    		}else{
    			 $.extend(requestParams.formdata , {
					ip_type: params.pdpType,
					profile_name : params.profileName,
					profile_apn : params.wanApn,
					v4_dns_mode : v4_dns_mode,
					pri_v4_dns_addr : params.dns1,
					sec_v4_dns_addr : params.dns2,
					profile_protocol : params.authMode,
					profile_username : params.username,
					profile_password : params.password,
					profile_number : '*99#',
					profile_id : params.profileID,
					v6_dns_mode : 0,
					pri_v6_dns_addr : "",
					sec_v6_dns_addr : ""
				});
				
    		}
    		requestParams.goformId = "/goform/setProfileSave";
			return requestParams;
		}

		function deal(data) {
			if (data.error == API_RESULT_SUCCESS) {
				return {
					result : true
				};
			} else {
				return {
					result : false
				};
			}
		}
    }
	
    /**
     * 定时刷新获取的数据转换
	 * @attribute {Array} timerQueryString 
	 */
	 
	 var timerUpdateInitData={
			signalbar : "0",                                                                         
			network_type: "",                                                        
			network_provider: "--",   
			ip4_pri_dns:"",
			ip4_sec_dns:"",
			ip6_pri_dns:"",
			ip6_sec_dns:"",
			ppp_status:0,                                                                                     
			spn_display_flag:"",                                                                               
			plmn_display_flag:"",                                                                              
			spn_b1_flag:"0",                                                                                    
			spn_b2_flag:"0",                                                                                    
			spn_name_data:"",                                                                                  
			hplmn:"",                                                                                          
			hmnc:"",                                                                                           
			station_mac:"",                                                                                 
			modem_main_state:"modem_init_complete",                                                                               
			simcard_roam:"off",
			pin_status:"0",                                                                                     
			battery_pers:"0",                                                                                   
			battery_charging:"0",                                                                        
			battery_vol_percent:0,                                                                            
			realtime_tx_thrpt:0,//(uploadRate),                                                                
			realtime_rx_thrpt:0,//(downloadRate),                                                              
			realtime_tx_bytes:0,//currentsent,                                                                 
			realtime_rx_bytes:0,//currentReceived,                                                             
			realtime_time:0,//,currentConnection time,                                                         
			monthly_tx_bytes:0,//monthlySend,                                                                  
			monthly_rx_bytes:0,//monthlyReceive,                                                               
			monthly_time:0,//monthlyConnection Time,                                                           
			date_month:0,//moth,																											 
			SSID1:"",                                                                                          
			AuthMode:"",                                                                                       
     	    loginfo:"no",                                                                                 
			sms_received_flag:0,//get new sms int >0
			sts_received_flag:0,//get sms report,                                                              
			sms_dev_unread_num:0,//null,                                                                       
			sms_sim_unread_num:0,                                                                             
			sms_unread_num:0,                 																											 
			data_volume_limit_switch:"0",//need 0                                                        
			data_volume_limit_unit: "data",                                                                  
			data_volume_alert_percent:"0",                                                                      
			data_volume_limit_size:	"0",	
			RadioOff:"0",   //wifi status,
			EX_wifi_profile:"",                                                                                
			EX_SSID1:"",//wifi ssid,                                                                            
			sta_ip_status:"disconnect",                                                                     
			m_ssid_enable:"0",//multi ssid enable,                                                               
			roam_setting_option:"on",
			connectionMode_t:"manual_dial",
																											 
			new_version_state:"0",//"version_has_new_critical_software"/"version_has_new_optional_software/",  
			current_upgrade_state:"0",                                   
			is_mandatory:false,//是否强制OTA 升级,																											 
			upg_roam_switch:"0" ,
			wifi_client_num:0
		}
	/*******sim status change****/
	
	function getSimStatusStr(sim_state){
		var str_status;
		switch (sim_state){					
				case MACRO_UIM_APP_STATE_UNKNOWN_V01:
					str_status = "modem_sim_undetected";
					break;
				case MACRO_UIM_APP_STATE_PIN1_OR_UPIN_REQ_V01:
					str_status = "modem_waitpin";
					break;
				case MACRO_UIM_APP_STATE_PUK1_OR_PUK_REQ_V01:
					str_status = "modem_waitpuk";
					break;
				case MACRO_UIM_APP_STATE_READY_V01:
					str_status = "modem_init_complete";
					break;
				case MACRO_UIM_APP_STATE_DETECTED_V01:
					str_status = "modem_sim_destroy";
					break;
				case MACRO_UIM_APP_STATE_PERSON_CHECK_REQ_V01:
					str_status = "modem_imsi_waitnck";
					break;
				case MACRO_UIM_APP_STATE_ILLEGAL_V01:
					str_status = "modem_sim_destroy";
					break;
				case MACRO_SIM_CARD_INITING:
				    str_status = "modem_detected";
				default:
					str_status = "modem_sim_undetected";
					break;
			}
			
			return str_status;
	}
	 
	function getTimerUpdateData(params, successCallback, errorCallback, isPost) {
	
		asyncRequest({"goformId":"/goform/getImgInfo","formdata":{}}, dealImg, null, isPost);
	
		function dealImg(data){
		 	
			timerUpdateInitData.signalbar = data.signal;
			timerUpdateInitData.modem_main_state = getSimStatusStr(data.sim_state);
			
			if (data.pin_state == MACRO_UIM_PIN_STATE_ENABLED_NOT_VERIFIED ||data.pin_state == MACRO_UIM_PIN_STATE_ENABLED_VERIFIED || 
				data.pin_state == MACRO_UIM_PIN_STATE_BLOCKED){
				timerUpdateInitData.pin_status = "1";
			}else{
				timerUpdateInitData. pin_status = "0";
			}
			
			if(data.chg_state ==  MACRO_BATTERY_CHARGING){
		        timerUpdateInitData.battery_charging = "1";                                                                      
		        timerUpdateInitData.battery_vol_percent = 0;  
			}else{
				timerUpdateInitData.battery_charging = "0";
				timerUpdateInitData.battery_pers = data.bat_level;
			}
			timerUpdateInitData.battery_cap = data.bat_cap+"%";
		    timerUpdateInitData.sms_received_flag = data.sms_new_count;
			timerUpdateInitData.sts_received_flag = 0;
			timerUpdateInitData.sms_dev_unread_num = data.sms_new_count;
			timerUpdateInitData.sms_sim_unread_num = data.sms_new_count ;       			
			timerUpdateInitData.sms_unread_num = data.sms_new_count;
		}
		
		asyncRequest({"goformId":"/goform/getWanInfo","formdata":{}}, dealWan, null, isPost);
	
		function dealWan(data){
		
			if(data.wan_state == MACRO_PPP_CONNECTED){
				timerUpdateInitData.ppp_status = "ppp_connected";
			}else if(data.wan_state == MACRO_PPP_CONNECTING){
				timerUpdateInitData.ppp_status = "ppp_connecting";
			}else if(data.wan_state == MACRO_PPP_DISCONNECTING){
				timerUpdateInitData.ppp_status = "ppp_disconnecting";
			}else{
				timerUpdateInitData.ppp_status = "ppp_disconnected";
			}
					 
			if(data.roam == MACRO_ROAM_ENABLE){
				timerUpdateInitData.simcard_roam = "on";
			}else{
				timerUpdateInitData.simcard_roam = "off";
			}
			
			switch (data.network_type) {
				case MACRO_NETWORKTYPE_NO_SERVICE:
					timerUpdateInitData.network_type = "no_service";
					break;
				case MACRO_NETWORKTYPE_GSM:
					timerUpdateInitData.network_type = "GSM";
					break;
				case MACRO_NETWORKTYPE_GPRS:
					timerUpdateInitData.network_type = "GPRS";
					break;
				case MACRO_NETWORKTYPE_EDGE:
					timerUpdateInitData.network_type = "EDGE";
					break;
				case MACRO_NETWORKTYPE_UMTS:
					timerUpdateInitData.network_type = "UMTS";
					break;
				case MACRO_NETWORKTYPE_HSDPA:
					timerUpdateInitData.network_type = "HSDPA";
					break;
				case MACRO_NETWORKTYPE_HSUPA:
					timerUpdateInitData.network_type = "HSUPA";
					break;
				case MACRO_NETWORKTYPE_CDMA:
					timerUpdateInitData.network_type = "CDMA";
					break;
				case MACRO_NETWORKTYPE_LTE:
					timerUpdateInitData.network_type = "LTE";
					break;
				case MACRO_NETWORKTYPE_HSPA_PLUS:
					timerUpdateInitData.network_type = "HSPA+";
					break;
				case MACRO_NETWORKTYPE_DC_HSPA_PLUS:
					timerUpdateInitData.network_type = "DC-HSPA+";
					break;
				case MACRO_NETWORKTYPE_LTE_PLUS:
					timerUpdateInitData.network_type = "LTE+";
					break;
				case MACRO_NETWORKTYPE_EV_DO_A:
				case MACRO_NETWORKTYPE_EV_DO_B:
				case MACRO_NETWORKTYPE_EV_DO_C:
					timerUpdateInitData.network_type = "limited_service";
					break;
				default:
					timerUpdateInitData.network_type = "no_service";
			}
			timerUpdateInitData.network_provider = data.network_name == "NA"|| data.network_name == "N/A"?"": data.network_name;
			timerUpdateInitData.network_name = data.network_name == "NA"|| data.network_name == "N/A"?"": data.network_name;
		
			timerUpdateInitData.realtime_tx_thrpt = data.Speed_Ul;//(uploadRate),                                                                
			timerUpdateInitData.realtime_rx_thrpt = data.Speed_Dl;//(downloadRate),                                                              
			timerUpdateInitData.realtime_tx_bytes = data.upload;//currentsent,                                                                 
			timerUpdateInitData.realtime_rx_bytes = data.download;//currentReceived,                                                             
			timerUpdateInitData.realtime_time = data.dur_time;//,currentConnection time, 
			timerUpdateInitData.ip4_pri_dns = data.ip4_pri_dns;
			timerUpdateInitData.ip4_sec_dns = data.ip4_sec_dns;
			timerUpdateInitData.ip6_pri_dns = data.ip6_pri_dns;
			timerUpdateInitData.ip6_sec_dns = data.ip6_sec_dns;
		}
	
		var wlan_info = getWifiBasic();
	
		timerUpdateInitData.SSID1 = wlan_info.ssid;                                                                                          
		timerUpdateInitData.AuthMode = wlan_info.AuthMode;
		timerUpdateInitData.RadioOff= wlan_info.wifi_enable;
		
		timerUpdateInitData.wifi_client_num = wlan_info.curr_num;
	
		var connectiond_mode = getConnectionMode();
		timerUpdateInitData.connectionMode_t = connectiond_mode.connectionMode;
		timerUpdateInitData.roam_setting_option = connectiond_mode.isAllowedRoaming;
		
		var fota_state = getNewVersionState();
		timerUpdateInitData.new_version_state = fota_state.new_version_state;
		timerUpdateInitData.current_upgrade_state = fota_state.new_version_state; 
		
		
		asyncRequest({"goformId":"/goform/getLoginState","formdata":{}}, dealLogin, null, isPost);
		
		function dealLogin(data){
			 if(data && data.loginStatus == LOGIN_STATE_SUCCESS){
             	timerUpdateInitData.loginfo = "ok";
			 }else{
 				timerUpdateInitData.loginfo = "no";
             }
		}
		asyncRequest({"goformId":"/goform/getSMSReportPageInfo","formdata":{}}, dealReport, null, isPost);
		function dealReport(data){
			 if(data && data.curr_report_count > 0){
             	timerInfo.smsReportReceived = true;
			 }else{
 				timerInfo.smsReportReceived = false;
             }
		}
		
        successCallback(timerUpdateInitData);
	}
    
    /**
     * 定时刷新获取的参数列表
	 * @attribute {Array} timerQueryString 
	 */
    var timerQueryString = [ "modem_main_state", "pin_status","loginfo","new_version_state","current_upgrade_state","is_mandatory"];
    var loginTimerQueryString = ["sms_received_flag", "sts_received_flag", "signalbar","network_type", "network_provider","ip4_pri_dns","ip4_pri_dns","ip6_pri_dns","ip6_sec_dns",
        "ppp_status","EX_SSID1","sta_ip_status","EX_wifi_profile","m_ssid_enable", 'sms_unread_num', "RadioOff",
        "simcard_roam", "lan_ipaddr","station_mac", "battery_charging", "battery_vol_percent","battery_cap", "battery_pers","spn_display_flag","plmn_display_flag","spn_name_data","spn_b1_flag","spn_b2_flag",
	"realtime_tx_bytes","realtime_rx_bytes","realtime_time","realtime_tx_thrpt","realtime_rx_thrpt",
        "monthly_rx_bytes","monthly_tx_bytes","monthly_time","date_month","data_volume_limit_switch",
	"data_volume_limit_size","data_volume_alert_percent","data_volume_limit_unit","roam_setting_option","upg_roam_switch","hplmn","hmcc","hmnc"];

    /**
     * 定时刷新临时回调列表
	 * @attribute {Array} timerCallbackStack 
	 */
    var timerCallbackStack = [];

    /**
     * 定时刷新回调列表
	 * @attribute {Array} timerCallbacks 
	 */
	var timerCallbacks = [ timerUpdateStatus ];

	/**
	 * 定时刷新器。成功获取到数据以后将遍历回调列表
	 * @method timerUpdater 
	 */
    function timerUpdater() {
        if (!timerUpdaterEnable) return;
        var queryParams = checkTimerUpdaterParameters();
        getTimerUpdateData(queryParams, function (data) {
            for (var i = 0; i < timerCallbacks.length; i++) {
                if (typeof timerCallbacks[i] === "function") {
                    timerCallbacks[i](data);
                }
            }
            $.merge(timerCallbacks, timerCallbackStack);
            timerCallbackStack = [];
            setTimeout(function(){timerUpdater();}, 10000);
        }, function () {
        	timerUpdaterErrorCallback();
            setTimeout(function(){timerUpdater();}, 10000);
        }, true);
    }

    /**
     * 检查定时器参数，在未登录前不进行瞬时状态查询
     * @method checkTimerUpdaterParameters
     */
    function checkTimerUpdaterParameters() {
        var queryParams = {
            multi_data:1,
            isTest:isTest
        };
        if (window.location.hash && window.location.hash != '#login' && timerInfo.isLoggedIn) {
            queryParams.sms_received_flag_flag = 0;
            queryParams.sts_received_flag_flag = 0;
            if (loginTimerQueryString.length > 0 && _.indexOf(timerQueryString, loginTimerQueryString[0]) == -1) {
                $.each(loginTimerQueryString, function(i, n){
                    timerQueryString.push(n);
                });
            }
        } else {
            if (loginTimerQueryString.length > 0 && _.indexOf(timerQueryString, loginTimerQueryString[0]) != -1) {
                timerQueryString = _.without(timerQueryString, loginTimerQueryString);
            }
        }
        queryParams.cmd = timerQueryString.join(",");
        return queryParams;
    }

	/**
	 * 增加定时刷新参数及回调
	 * @method addTimerThings
	 * @param {Array || String} querys 查询key
	 * @param {Function} cb callback
	 */
	function addTimerThings(querys, cb) {
		if (_.isArray(querys)) {
			for ( var i = 0; i < querys.length; i++) {
				addQueryString(querys[i]);
			}
		} else {
			addQueryString(querys);
		}
		addCallback(cb);
	}

	/**
	 * 删除定时刷新参数及回调
	 * @method removeTimerThings
	 * @param {Array || String} querys 查询key
	 * @param {Function} cb
	 */
	function removeTimerThings(querys, cb) {
		if (_.isArray(querys)) {
			for ( var i = 0; i < querys.length; i++) {
				removeQueryString(querys[i]);
			}
		} else {
			removeQueryString(querys);
		}
		removeCallback(cb);
	}

	/**
	 * 增加定时刷新回调
	 * @method addCallback
	 * @param {Function} cb
	 */
	function addCallback(cb) {
		if (_.indexOf(timerCallbackStack, cb) == -1) {
			timerCallbackStack.push(cb);
		}
	}

	/**
	 * 删除定时刷新回调
	 * @method removeCallback
	 * @param {Function} cb
	 */
	function removeCallback(cb) {
		timerCallbacks = _.without(timerCallbacks, cb);
        if(timerCallbacks.length == 0){
            timerCallbacks.push(timerUpdateStatus);
        }
		return timerCallbackStack;
	}

	/**
	 * 增加定时刷新参数
	 * @method addQueryString
	 * @param {String} query 查询key
	 */
	function addQueryString(query) {
		if (_.indexOf(timerQueryString, query) == -1) {
			timerQueryString.push(query);
		}
	}

	/**
	 * 删除定时刷新回调
	 * @method removeQueryString
	 * @param {String} query
	 */
	function removeQueryString(query) {
		timerQueryString = _.without(timerQueryString, query);
		return timerQueryString;
	}
	
	/**
	 * 定时刷新默认状态更新回调函数
	 * @method timerUpdateStatus
	 * @param {Object} JSON data 定时刷新返回的结果集
	 */
    function timerUpdateStatus(data) {
		
        timerInfo.signalImg = typeof data.signalbar == 'undefined' ? '0' : data.signalbar;
        timerInfo.networkType = data.network_type ? data.network_type : '';
        var networkName = data.network_name ? data.network_name : '';
        timerInfo.ip4PriDns = data.ip4_pri_dns || "--";
        timerInfo.ip4SecDns = data.ip4_sec_dns || "--";
        timerInfo.ip6PriDns = data.ip6_pri_dns || "--";
        timerInfo.ip6SecDns = data.ip6_sec_dns || "--";
       
        var wanNetworkNameStr = "NA";
        switch (networkName) {
        case "CHINA UNICOM":
        case "CHN CU":
            wanNetworkNameStr = "CHINA UNICOM";
            break;
        case "":
            wanNetworkNameStr = "NA";
            break;
        default:
            wanNetworkNameStr = networkName;
        }
        timerInfo.networkName = wanNetworkNameStr;
        if (timerInfo.networkType.toLowerCase().indexOf("limited_service") != -1) {
            timerInfo.networkType = "limited_service";
        }
        timerInfo.networkOperator = data.network_provider ? data.network_provider : '--';
        timerInfo.connectStatus = typeof data.ppp_status == 'undefined'? 'ppp_disconnected' : data.ppp_status;
        timerInfo.spn_display_flag = data.spn_display_flag;
        timerInfo.plmn_display_flag = data.plmn_display_flag;
        timerInfo.spn_b1_flag = data.spn_b1_flag;
        timerInfo.spn_b2_flag = data.spn_b2_flag;
        timerInfo.spn_name_data = data.spn_name_data;
        timerInfo.hplmn = data.hplmn;
        timerInfo.mdmMcc = data.hmcc;
        timerInfo.mdmMnc = data.hmnc;
        var curr_connected_devices = (!data.station_mac || data.station_mac == "")? [] : data.station_mac.split(";");
//        for (var i = 0; i < curr_connected_devices.length; i++) {
//            var hostName = data.curr_connected_devices[i].hostName;
//            if (hostName == "") {
//                data.curr_connected_devices[i].hostName = data.curr_connected_devices[i].macAddress;
//            }
//            var timeConnected = data.curr_connected_devices[i].timeConnected;
//            if (timeConnected == "") {
//                data.curr_connected_devices[i].timeConnected = 0;
//            }
//        }
		timerInfo.wifi_client_num = data.wifi_client_num;
        timerInfo.curr_connected_devices = curr_connected_devices;
        timerInfo.roamingStatus = getRoamStatus(timerInfo.networkType, data.modem_main_state, data.simcard_roam);
        timerInfo.wifiStatus = data.RadioOff != "0";
        timerInfo.simStatus = data.modem_main_state;
        timerInfo.pinStatus = data.pin_status;
        //TODO 电池续航时间需要再讨论，下边是92的代码
        var needMinutes = 3 * 60 * 60;
        var batteryLevel = (data.battery_vol_percent && data.battery_vol_percent.length > 0) ? data.battery_vol_percent : 100;
        timerInfo.batteryCapacity = data.battery_cap;
        timerInfo.batteryPers = data.battery_pers;
        var remainMinutes = Math.round(needMinutes * (1 - batteryLevel / 100));
        timerInfo.batteryStatus = (typeof data.battery_charging == 'undefined') ? '0' : data.battery_charging;
        timerInfo.batteryLevel = batteryLevel;
        timerInfo.batteryTime = remainMinutes.toString();
        timerInfo.data_counter = {
    		uploadRate : data.realtime_tx_thrpt == '' ? 0 : data.realtime_tx_thrpt,
    		downloadRate : data.realtime_rx_thrpt == '' ? 0 : data.realtime_rx_thrpt,
    		/*totalSent : data.total_tx_bytes == '' ? 0 : data.total_tx_bytes,
			totalReceived : data.total_rx_bytes == '' ? 0 : data.total_rx_bytes,
			totalConnectedTime : data.total_time == '' ? 0 : data.total_time,*/
			currentSent : data.realtime_tx_bytes == '' ? 0 : data.realtime_tx_bytes,
			currentReceived : data.realtime_rx_bytes == '' ? 0 : data.realtime_rx_bytes,
			currentConnectedTime : data.realtime_time == '' ? 0 : data.realtime_time,
			monthlySent: data.monthly_tx_bytes == '' ? 0 : data.monthly_tx_bytes,
			monthlyReceived: data.monthly_rx_bytes == '' ? 0 : data.monthly_rx_bytes,
			monthlyConnectedTime: data.monthly_time == '' ? 0 : data.monthly_time,
			month : data.date_month == '' ? 1 : data.date_month
        };
        timerInfo.ssid = data.SSID1;
        timerInfo.authMode = data.AuthMode;
        if(!timerInfo.newSmsReceived){
        	timerInfo.newSmsReceived = data.sms_received_flag > 0;
        }
        if(!timerInfo.smsReportReceived){
        	timerInfo.smsReportReceived = !!data.sts_received_flag;
        }
        if (typeof data.sms_dev_unread_num != "undefined") {
            timerInfo.smsUnreadCount = config.SMS_UNREAD_NUM_INCLUDE_SIM ? parseInt(data.sms_dev_unread_num | 0, 10) + parseInt(data.sms_sim_unread_num | 0, 10) : parseInt(data.sms_dev_unread_num | 0, 10);
        } else {
            timerInfo.smsUnreadCount = parseInt(data.sms_unread_num | 0, 10)
        }
        if(data.data_volume_limit_switch == '1'){
        	timerInfo.limitVolumeEnable = true;
        	timerInfo.limitVolumeType = data.data_volume_limit_unit == 'data' ? '1' : '0';
        	timerInfo.limitVolumePercent = data.data_volume_alert_percent;
        	if(data.data_volume_limit_unit == 'data'){
        		var dataMonthLimit = data.data_volume_limit_size.split("_");
        		timerInfo.limitVolumeSize = dataMonthLimit[0] * dataMonthLimit[1] * 1024 * 1024;
        	} else {
        		timerInfo.limitVolumeSize = data.data_volume_limit_size * 60 * 60;
        	}
        } else {
        	timerInfo.limitVolumeEnable = false;
        	timerInfo.limitVolumeType = '1';
        	timerInfo.limitVolumePercent = '100';
        	timerInfo.limitVolumeSize = '0';
        }
        timerInfo.connectWifiProfile = data.EX_wifi_profile;
        timerInfo.connectWifiSSID = data.EX_SSID1;
        timerInfo.connectWifiStatus = data.sta_ip_status;
        timerInfo.multi_ssid_enable = data.m_ssid_enable;
        timerInfo.roamMode = data.roam_setting_option;
		timerInfo.connectionMode_t = data.connectionMode_t;
        // TODO OTA
        timerInfo.new_version_state = data.new_version_state == '1' || data.new_version_state == "version_has_new_critical_software" || data.new_version_state == "version_has_new_optional_software" || data.current_upgrade_state == 'upgrade_pack_redownload';
        timerInfo.current_upgrade_state = data.current_upgrade_state;
        if (timerInfo.current_upgrade_state == "downloading") {
            timerInfo.current_upgrade_state = "upgrading";
        } else if (timerInfo.current_upgrade_state == "verify_failed") {
            timerInfo.current_upgrade_state = "upgrade_pack_error";
        }
        // TODO OTA
        timerInfo.is_mandatory = data.is_mandatory == "1" || data.new_version_state == "version_has_new_critical_software";
	timerInfo.allowRoamingUpdate = data.upg_roam_switch;
    }

    function timerUpdaterErrorCallback(){
    	timerInfo.batteryStatus = '0';
    }
    /**
     * 获取漫游状态, 参考MF93
     * @method getRoamStatus
     */
    function getRoamStatus(networkType, modemState, simcardRoam) {
        if(("" == $.trim(networkType)) || "no_service" == networkType.toLowerCase() || "limited_service" == networkType.toLowerCase() || "modem_sim_undetected" == modemState ||"modem_waitpin" == modemState || "modem_waitpuk" == modemState){
            return false;
        }

       // if ("Internal" == simcardRoam || "International" == simcardRoam){
		   if(simcardRoam == "on"){
            return true;
        }else{
            return false;
        }
    }


	$(document).ready(function() {
		var queryParams = checkTimerUpdaterParameters();					   
	    getTimerUpdateData(queryParams, function (data) {
		    timerUpdateStatus(data) ;
            setTimeout(function(){timerUpdater();}, 1000);
        }, function () {
        	timerUpdaterErrorCallback();
            setTimeout(function(){timerUpdater();}, 1000);
        }, true);
		
		
        setTimeout(function () {
           timerUpdater();
        }, config.IS_TEST ? 1000: 0);
	});
    
	/**************************************************************************
     Description : set current network
	 Parameters :
	 [IN] : string   : strNetworkNumber : the network digital number MCCMNC.
	 [IN] : number   : nRat : the network connect technology: 0 = "2G", 2 = "3G".
	 [IN] : function : callback(bResult) : call back function, and the parameters list below:
	 [IN] : bool : bResult : true = succeed, false = failed.
	 return : bool : if the parameters is invalid, the function will return false, otherwise will return true.
	 comment: we need another parameter nRat, the value may be: 0 = '2G' or 2 = '3G'.
     @method setNetwork
	 **************************************************************************/
	function setNetwork(strNetworkNumber, nRat,nId, callback) {
        if(isTest) {
            setTimeout(function() {callback(true);}, 500);
            return;
        }
        var setResult = startNetworkRegister(nId);
        if (setResult == "success")
		{
                var flag;
                var counter = 0;
                var timer = setInterval(function(){
                    var obj = syncRequestForNetwork('m_netselect_result');//("manual_netsel_flag");
                    if(!obj){
                        callback(false);
                    }
                    if(obj.regist_state == SE_NW_REG_STAT_SUCCESS){
                        flag = "1";
                        window.clearInterval(timer);
                        callback(true);
                    } else if(obj.regist_state == SE_NW_REG_STAT_FAIL || obj.regist_state == 255){
                        flag = "0";
						window.clearInterval(timer);
                        callback(false);
                    }else if(counter < 120){
                        counter++;
                    }else{
						window.clearInterval(timer);
                        callback(false);
                    }
                },2000);
		}else {
			callback(false);
		}
        function startNetworkRegister(nId)
		{
        	var params = {"nId":nId};
        	result = "failed";
        	setNetworkRegister(params, function(data) {
				if (data.result == "success") {
					result = "success";
				}else {
					result = "failed";
				} 
        	});
        	return result;
		}

        function syncRequestForNetwork(params) {
            var result;
            $.ajax({
                url : "/goform/getNetworkRegisterResult",
                data : {
                    cmd : params
                },
                dataType : "json",
                async : false,
                cache : false,
                error : function() {
                    result = null;
                },
                success : function(data) {
                    result = data;
                }
            });
            return result;
        }

	}
	
	/**************************************************************************
	 Description : get current network information
	 Parameters :
	 [IN] : function :callback(bResult, vNetwork) : call back function, and the parameters list below:
	 [IN] : bool   : bResult     : true = succeed, false = failed.
	 [IN] : object : vNetwork : network information object, the object attribute list below:
	 type   :   name       : description
	 string : strFullName  : operator full name(the value is maybe ""),
	 such as 'china mobile'
	 string : strShortName : operator short name(the value is maybe ""),
	 such as 'china mobile'
	 string : strNumeric   : the digital number, such as '460'
	 number : nRat         : the network connect technology, 0 = '2G', 2 = '3G'.
	 string : strBearer   : the current bearer, maybe one of:
	    <empty>
	    GSM
	    GPRS
	    EDGE
	    WCDMA
	    HSDPA
	    HSUPA
	    HSPA
	    TD_SCDMA
	    HSPA+
	    EVDO Rev.0
	    EVDO Rev.A
	    EVDO Rev.B
	  if get current network information failed, the return value will be null.
	 return : void
     @method getCurrentNetwork
	 **************************************************************************/
	function getCurrentNetwork(callback) {
		asyncRequest("current_network",callback,function(data){
			 // the object of network information
			var vNetwork = {};
			vNetwork.strFullName = data.strFullName;
			vNetwork.strShortName = data.strShortName;
			vNetwork.strNumeric = data.strNumeric;
			vNetwork.nRat = Number(data.nRat);
			vNetwork.strBearer = data.strBearer;
			return [true,vNetwork];
		});	
	}

    /**
     * 保存一条电话本
     * @method savePhoneBook
     * @param {Object} JSON
     * @example
     * //请求参数映射
     * {
     *  location = 0;
     *  name = "张三";
     *  mobile_phone_number = "13500000015";
     *  home_phone_number = "012-12345678";
     *  office_phone_number = "012-87654321";
     *  mail = "mail@mail.com";
     * }
     * @return {Object} JSON
     */
    function savePhoneBook() {
        var callback = arguments[1];
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "/goform/addPhoneBook";
            var pb_location = parseInt(params.location);
            var pb_type = "local";
            switch (pb_location)
            {
            case PB_LOCATION_LOCAL:
            	pb_type = "local";
            	break;
            case PB_LOCATION_SIM:
            	pb_type = "sim";
            	break;
            default:
            	pb_type = "local";
            break;
            }
			requestParams.formdata = {
				"pb_type":pb_type,
				"pb_id":params.index,
				"pb_name":params.name,
				"phone_number": params.mobile_phone_number
			};
            if (pb_type == "local") {
            	if (!params.group)
				{
            		params.group = "common";
				}
            	var deviceData = {
            		"home_number":params.home_phone_number || "",
            		"office_number":params.office_phone_number || "",
            		"e_mail":params.mail || "",
            		"group":params.group
            	}
                $.extend(requestParams.formdata,deviceData);
            } 
            return requestParams;
        }

        function deal(data) {
        	if (data && data.error == API_RESULT_SUCCESS) {
        		data.result = "success";
        		addTimerThings("pbm_write_flag", checkSavePhoneBook);
        		return data;
        	} else {
        		return unknownErrorObject;
        	}
        }

        function checkSavePhoneBook(data){
            checkPbmWriteFlag(data, callback, checkSavePhoneBook);
        }
    }

    function checkPbmWriteFlag(data, callback, fn) {
        if (data.pbm_write_flag == "0") {
            removeTimerThings("pbm_write_flag", fn);
            //callback({result:"success"});
        } else if (data.pbm_write_flag == "6" || data.pbm_write_flag == "7" || data.pbm_write_flag == "8" || data.pbm_write_flag == "9"|| data.pbm_write_flag == "10"|| data.pbm_write_flag == "11"|| data.pbm_write_flag == "14") {
            removeTimerThings("pbm_write_flag", fn);
            //callback({result:"fail"});
        } else {
          //noting to do,continue waiting
        }
    }

    /**
     * 删除电话本
     * @method deletePhoneBooks
     * @param {Object} JSON
     * @example
     * //请求参数映射
     * {
     *  indexs:["1","2","3"]
     * }
     * @return {Object} JSON
     */
    function deletePhoneBooks() {
        var callback = arguments[1];
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "/goform/deletePhoneBook";
            requestParams.formdata = {
            	"pb_id":params.indexs.join(",")
            }
            return requestParams;
        }

        function deal(data) {
            if (data && data.error == API_RESULT_SUCCESS) {
        		data.result = "success";
        		addTimerThings("pbm_write_flag", checkDeletePhoneBooks);
        		return data;
        	} else {
        		return unknownErrorObject;
        	}
        }

        function checkDeletePhoneBooks(data){
            checkPbmWriteFlag(data, callback, checkDeletePhoneBooks);
        }
    }

    /**
     * 删除所有电话本数据
     * @method deleteAllPhoneBooks
     * @param {Object} JSON
     * @example
     * //请求参数映射
     * {
     *   location:0
     * }
     * @return {Object} JSON
     */
    function deleteAllPhoneBooks() {
        var callback = arguments[1];
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "/goform/deleteAllPhoneBooks";
            var pb_location = params.location;
            var pb_type = "all";
            switch (pb_location)
            {
            case PB_LOCATION_LOCAL:
            	pb_type = "local";
            	break;
            case PB_LOCATION_SIM:
            	pb_type = "sim";
            	break;
            case PB_LOCATION_ALL:
            	pb_type = "all";
            	break;
            default:
            	pb_type = "all";
            break;
            }
            requestParams.formdata = {
            	"pb_type":pb_type
            }
            return requestParams;
        }

        function deal(data) {
            if (data && data.error == API_RESULT_SUCCESS) {
        		data.result = "success";
        		addTimerThings("pbm_write_flag", checkDeleteAllPhoneBooks);
        		return data;
        	} else {
        		return unknownErrorObject;
        	}
        }

        function checkDeleteAllPhoneBooks(data){
            checkPbmWriteFlag(data, callback, checkDeleteAllPhoneBooks);
        }
    }

    /**
     * 按分组删除所有电话本数据
     * @method deleteAllPhoneBooksByGroup
     * @param {Object} JSON
     * @example
     * //请求参数映射
     * {
     *   del_group:'common'
     * }
     * @return {Object} JSON
     */
    function deleteAllPhoneBooksByGroup() {
        var callback = arguments[1];
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.isTest = isTest;
            requestParams.notCallback = true;
            requestParams.goformId = "PBM_CONTACT_DEL";
            requestParams.del_option = "delete_all_by_group";
            requestParams.del_all_location = 3;
            requestParams.del_group = params.group;
            return requestParams;
        }

        function deal(data) {
            if (data && data.error == API_RESULT_SUCCESS) {
                addTimerThings("pbm_write_flag", checkDeleteAllPhoneBooksByGroup);
            } else {
                callback(data);
            }
        }

        function checkDeleteAllPhoneBooksByGroup(data){
            checkPbmWriteFlag(data, callback, checkDeleteAllPhoneBooksByGroup);
        }
    }

    function setConnectionMode() {
    	return doStuff(arguments, {}, prepare, deal, null, true);

		function prepare(params, isPost) {
			var requestParams = {};
			var conn_mode;
			var auto_roam;
			if(params.connectionMode == "auto_dial"){
				conn_mode = CONNECTION_MODE_AUTO;
			}else{
				conn_mode = CONNECTION_MODE_MANUAL;
			}
			
			if( params.isAllowedRoaming =="on"){
				auto_roam = CONNECTION_IS_AUTO_ROAM_ENABLE;
			}else{
				auto_roam = CONNECTION_IS_AUTO_ROAM_DISABLE;
			}
			
			
			requestParams.goformId = "/goform/setWanConnectMode";
			requestParams.formdata = {wan_conn_mode : conn_mode,
                                      roam_auto_conn : auto_roam
			}
			return requestParams;
		}
		
		function deal(data) {
			var result = {};			
			if (data && (data.error == API_RESULT_SUCCESS)) {
				result.result = "success";
			}else {
                result.result = "fail";
			}
		
		  return result;
		}
    }


    function getConnectionMode() {
    	return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
        	var requestParams = {};
        	requestParams.goformId = "/goform/getWanConnectMode";
			requestParams.formdata = {};
        	return requestParams;
        }
        
        function deal(data) {
			var conn_mode;
			var auto_roam;
			if(data && data.wan_conn_mode == CONNECTION_MODE_AUTO){
				conn_mode = "auto_dial";
			}else{
				conn_mode = "manual_dial";
			}
			
			if(data && data.roam_auto_conn == CONNECTION_IS_AUTO_ROAM_DISABLE){
				auto_roam = "off";
			 }else{
				auto_roam = "on";
			 }
        	
			if (data) {
        		var result = {};
        		result.connectionMode = conn_mode;
                result.isAllowedRoaming = auto_roam;
        		return result;
        	} else {
        		return unknownErrorObject;
        	}
        }
    }

    function _getPhoneBooks(args, location) {
        if (args[0].data_per_page == 0) {
            return {"pbm_data":[]};
        }
        return doStuff(args, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
          /*  if (location == 2) {
                requestParams.cmd = "pbm_data_total";
            } else {
                requestParams.cmd = "pbm_data_info";
            }*/
            requestParams.goformId = "/goform/getPhoneBooklistInfo";
            var pb_location = parseInt(location);
            var pb_type = "all";
            switch (pb_location)
            {
            case PB_LOCATION_LOCAL:
            	pb_type = "local";
            	break;
            case PB_LOCATION_SIM:
            	pb_type = "sim";
            	break;
            case PB_LOCATION_ALL:
            	pb_type = "all";
            	break;
            default:
            	pb_type = "all";
            break;
            }
            requestParams.formdata = {
            	"pb_type":pb_type
            }
            return requestParams;
        }

        function deal(data) {
            if (data && data.data) {
                var books = [];
                $.each(data.data, function (i) {
                	/* "pb_id":pb_id,
                     "pb_name":name,
                     "phone_number":phone_number,
                     "home_number":home_number,
                     "office_number":office_number,
                     "e_mail":e_mail,
                     "group":group,*/
                var pb_type = data.data[i].pb_type;
                var pbm_location = 1;
                switch (pb_type)
				{
				case "sim":
					pbm_location = PB_LOCATION_SIM;
					break;
				case "local":
					pbm_location = PB_LOCATION_LOCAL;
					break;
				default:
					pbm_location = PB_LOCATION_LOCAL;
					break;
				}
                    books.push({
                        pbm_id:data.data[i].pb_id + "",
                        pbm_location:pbm_location,
                        pbm_number:data.data[i].phone_number,
                        pbm_anr:data.data[i].home_number,
                        pbm_anr1:data.data[i].office_number,
                        pbm_group:data.data[i].group,
                        pbm_name:data.data[i].pb_name,
                        pbm_email:data.data[i].e_mail
                    });
                });
                return {pbm_data:books};
            } else {
                return unknownErrorObject;
            }
        }
    }
    /**
     * 按分组获取设备侧电话本数据
     * @method getPhoneBooksByGroup
     * @return {Object} JSON
     */
    function getPhoneBooksByGroup() {
        if (arguments[0].data_per_page == 0) {
            return {"pbm_data":[]};
        }
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.isTest = isTest;
            requestParams.cmd = "pbm_data_total";
            requestParams.mem_store = 3;
            requestParams.pbm_group = params.group;
            requestParams.page = params.page;
            requestParams.data_per_page = params.data_per_page;
            requestParams.orderBy = params.orderBy;
            requestParams.isAsc = params.isAsc;
            return requestParams;
        }

        function deal(data) {
            if (data && data.pbm_data) {
                var books = [];
                $.each(data.pbm_data, function (i) {
                    books.push({
                        pbm_id:data.pbm_data[i].pbm_id,
                        pbm_location:data.pbm_data[i].pbm_location,
                        pbm_number:data.pbm_data[i].pbm_number,
                        pbm_anr:data.pbm_data[i].pbm_anr,
                        pbm_anr1:data.pbm_data[i].pbm_anr1,
                        pbm_group:data.pbm_data[i].pbm_group,
                        pbm_name:decodeMessage(data.pbm_data[i].pbm_name),
                        pbm_email:decodeMessage(data.pbm_data[i].pbm_email)
                    });
                });
                return {pbm_data:books};
            } else {
                return unknownErrorObject;
            }
        }
    }
    /**
     * 获取设备侧电话本数据
     * @method getDevicePhoneBooks
     * @return {Object} JSON
     */
    function getDevicePhoneBooks() {
        return _getPhoneBooks(arguments, 1);
    }

    /**
     * 获取SIM卡侧电话本数据
     * @method getSIMPhoneBooks
     * @return {Object} JSON
     */
    function getSIMPhoneBooks() {
        return _getPhoneBooks(arguments, 0);
    }

    /**
     * 获取电话本数据,包括SIM卡和设备侧
     * @method getPhoneBooks
     * @return {Object} JSON
     */
    function getPhoneBooks() {
        return _getPhoneBooks(arguments, 2);
    }

    function getPhoneBookReady(){
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            var requestParams = {};
			requestParams.formdata = {};
            requestParams.goformId = "/goform/getPhoneBookInitState";	
			
            return requestParams;
        }

        function deal(data) {
            if (data) {
            	return { "pb_init_state": 1, "error": 0 }
                return data;
            } else {
                return unknownErrorObject;
            }
        }
    }

    function getPhoneBookCapacity(args, isSIM) {
    	 //return {"pbm_sim_used_record_num":22,"pbm_sim_max_record_num":300,"pbm_sim_max_name_len":26,"pbm_sim_max_number_len":40}
        return doStuff(args, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "/goform/getPhoneBookInfo";	
            var pb_type = "sim";
            if (isSIM) {
            	pb_type = "sim";
            } else {
            	pb_type = "local";
            }
			requestParams.formdata = {
				"pb_type":pb_type
			}
            return requestParams;
        }

        function deal(data) {
            if (data) {
                return {
                		"pbm_sim_used_record_num":data.current_num,
                	   	"pbm_sim_max_record_num":data.totle_num,
                	   	"pbm_sim_max_name_len":data.name_length,
                	   	"pbm_sim_max_number_len":data.number_length
                	   	};
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 获取SIM卡侧电话本容量
     * @method getSIMPhoneBookCapacity
     * @return {Object} JSON
     * @example
      //请求参数映射
     {
         simPbmTotalCapacity:100,
         simPbmUsedCapacity:20,
         simType:?, //2G or 3G used to extend pbm
         maxNameLen:?,
         maxNumberLen:?
     }
     */
    function getSIMPhoneBookCapacity() {
        var data = getPhoneBookCapacity(arguments, true);
        return {
            simPbmTotalCapacity:parseInt(data.pbm_sim_max_record_num),
            simPbmUsedCapacity:parseInt(data.pbm_sim_used_record_num),
            simType:data.pbm_sim_type, //2G or 3G used to extend pbm
            maxNameLen:parseInt(data.pbm_sim_max_name_len),
            maxNumberLen:parseInt(data.pbm_sim_max_number_len)
        };
    }

    /**
     * 获取设备电话本容量
     * @method getDevicePhoneBookCapacity
     * @return {Object} JSON
     * @example
      //返回结果
     {
         pcPbmTotalCapacity:100，
         pcPbmUsedCapacity:30
     }
     */
    function getDevicePhoneBookCapacity() {
        var data = getPhoneBookCapacity(arguments, false);
        return {
            pcPbmTotalCapacity:parseInt(data.pbm_sim_max_record_num),
            pcPbmUsedCapacity:parseInt(data.pbm_sim_used_record_num)
        };
    }

    /**
     * 获取登录相关信息 --SIM Card status
     * @method getLoginData
     * @return {Object} JSON
     */
    function getLoginData(){
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "/goform/getSimcardInfo";//"modem_main_state,puknumber,pinnumber,psw_fail_num_str,login_lock_time";
			requestParams.formdata = {};
            return requestParams;
        }

        function deal(data) {
			var result = {};
            if (data) {
				var loginInfo = getLoginfailInfo();
                result.psw_fail_num_str = loginInfo.psw_fail_num_str;
                result.login_lock_time = loginInfo.login_lock_time;
				result.modem_main_state = getSimStatusStr(data.sim_state);
				if(result.modem_main_state == "modem_waitpuk"){
					result.pinnumber = 0;
					result.puknumber = data.pin_puk_times
				}else{
					result.pinnumber = data.pin_puk_times;
					result.puknumber = data.pin_puk_times;
				}
                return result;
            } else {
                return unknownErrorObject;
            }
        }
    }
	
	    /**
     * 获取登录相关信息 --login fails
     * @method getLoginData
     * @return {Object} JSON
     */
    function getLoginfailInfo(){
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "/goform/getLoginRemainInfo";//"modem_main_state,puknumber,pinnumber,psw_fail_num_str,login_lock_time";
			requestParams.formdata = {};
            return requestParams;
        }

        function deal(data) {
			var result = {};
            if (data && data.error == API_RESULT_SUCCESS) {
                result.psw_fail_num_str = data.loginCountRemain == '' ? config.MAX_LOGIN_COUNT : config.MAX_LOGIN_COUNT - data.loginCountRemain;
                result.login_lock_time = data.loginTimeRemain == '' ? '300' : data.loginTimeRemain;
                return result;
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 获取登录状态
     * @method login
     * @param {Object} JSON
     * @example
     * //返回结果格式
     *{
     *   password:"123456"
     *}
     * @return {Object} JSON
     */
    function login() {
        return doStuff(arguments, {}, prepare, deal, {errorType: 'badPassword'}, true);

        function prepare(params, isPost){
             var obj = {};
			 obj.formdata = {	            
				username:"admin",
	            password : /*config.PASSWORD_ENCODE ? Base64.encode(params.password) : */params.password
            };
			obj.goformId = "/goform/setLogin";
            return obj;
        }

        function deal(data){
            //in doc, notes:If the user is 'already logged in' at the device, it calls back as success.
            if(data && (parseInt(data.login_result) == LOGIN_STATE_SUCCESS)){
                timerInfo.isLoggedIn = true;
                return 	{result: true};
            }else{
                var loginError = {};
                switch(parseInt(data.login_result)){
                    case LOGIN_STATE_SOME_ONE_LOGINED:
                        loginError = {errorType : "duplicateUser"};
                        break;
                    case LOGIN_STATE_PASSWORD_WRONG:
                        loginError = {errorType : "badPassword"};
                        break;
                    case LOGIN_STATE_TIME_LIMIT:
                     loginError = {errorType : "time used out"};
                     break; 
                    default :
                        loginError = {errorType : "Login Fail"};
                        break;
                }
                timerInfo.isLoggedIn = false;
                return $.extend(unknownErrorObject, loginError);
            }
        }
    }

    /**
     * 获取登录状态
     * @method getLoginStatus
     * @return {Object} JSON
     * @example
     //返回结果格式
     {
        status = "loggedIn";
     }
     */
    function getLoginStatus() {
		
       /* if(timerInfo.isLoggedIn != undefined){
			alert("timer" +timerInfo.isLoggedIn)
            return doStuff(arguments, {
                status : timerInfo.isLoggedIn ? 'loggedIn' : 'loggedOut'
            });
        }else{*/
            var resultObject = {};
            if(!config.HAS_LOGIN){
                resultObject.status = 'loggedIn';
                resultObject.errorType = 'no_login';
                timerInfo.isLoggedIn = true;
            }
			
            return doStuff(arguments, resultObject, prepare, deal, null, true);
        //}

        function prepare(params, isPost){
            var requestParams  = {};
            requestParams.goformId = "/goform/getLoginState";
			requestParams.formdata = {};
            return requestParams;
        }

        function deal(data){
            if(data){
                var loginStatus = {};
                //it should be an enum rather than Boolean
                switch(data.loginStatus){
                    case LOGIN_STATE_SUCCESS:
                        loginStatus.status = "loggedIn";
                        break;
                    default:
                        loginStatus.status = "loggedOut";
                        break;
                }
				
                return loginStatus;
            }else{
                return $.extend(unknownErrorObject, {errorType : "LoginStatusError"});
            }
        }
    }

    /**
     * 验证PIN输入是否正确
     * @method enterPIN
     * @param {Object} JSON 参数对象
     * @example
      //请求参数映射
     {
        PinNumber = "1234";
     }
     * @return {Object} JSON
     */
    function enterPIN() {
        return doStuff(arguments, {}, prepare, deal,{}, true);

        function prepare(params, isPost){
            var obj = {};
            obj.goformId = "/goform/unlockPIN";
			obj.formdata = {pin:params.PinNumber};
            return obj;
        }

        function deal(data) {
            if (data && data.error == API_RESULT_SUCCESS) {
                return { result:true };
            } else {
                return { result:false};
            }
        }
    }

    /**
     * 根据PUK设置新的PIN
     * @method enterPUK
     * @param {Object} JSON 参数对象
     * @example
      //请求参数映射
     {
         PUKNumber = "12345678";
         PinNumber = "1234";
     }
     * @return {Object} JSON
     */
    function enterPUK() {
        return doStuff(arguments, {}, prepare, deal,{}, true);

        function prepare(params, isPost){
            var obj = {};
            obj.goformId = "/goform/unlockPUK";		
		    obj.formdata = {newpin:params.PinNumber,puk:params.PUKNumber};
            return obj;
        }

        function deal(data) {
            if (data && data.error == API_RESULT_SUCCESS) {
                return { result:true };
            } else {
                return { result:false};
            }
        }
    }
	
    /**
     * 获取新短消息
     * @method getNewSMS     
     */
    function getNewSMS() {		
		return doStuff(arguments, {}, prepare, deal, {}, true);

        function prepare(params, isPost) {
            var requestParams = {};
			requestParams.goformId = "/goform/getNewSMS";
			requestParams.formdata = {};
            return requestParams;
        }

		function deal(data) {
			if (data && data.data && data.data.length > 0) {
				var listMsgs = [];
				$.each(data.data, function(s_i, sp){            
					listMsgs.push({
						id : sp.sms_id,      
						number : sp.sms_number,
						content : sp.sms_content,
						time : timeToDisplay(sp.sms_time),
						isNew : true,
						groupId: "",
						tag : 1
					})
                });	
		        data = {"messages":listMsgs}		
			
				return {messages: parseMessages(data.messages) };				
			} else {
				return {messages: [] };
			}
		}
    }
	
    /**
     * 获取全部短消息
     * @method getSMSMessages
     * @example
      //请求参数映射
     	{
			cmd : "sms_page_data",
			page : params.page,
			data_per_page : params.smsCount,
			mem_store : params.nMessageStoreType,
			tags : params.tags,
			order_by : params.orderBy
		}
     */
    function getSMSMessages() {		
		return doStuff(arguments, {}, prepare, deal, {}, true);

        function prepare(params, isPost) {
            var requestParams = {};
			requestParams.goformId = "/goform/getSMSlist";
			requestParams.formdata = {"location": params.location};
            return requestParams;
        }

		function deal(data) {
			if (data && data.data && data.data.length > 0) {
				var listMsgs = [];
				$.each(data.data, function(s_i, sp){            
					listMsgs.push({
						id : sp.sms_id,      
						number : sp.sms_number,
						content : sp.sms_content,
						time : timeToDisplay(sp.sms_time),
						isNew : sp.isNew == 1 ? true :false,
						groupId: sp.groupId == -1? "" : sp.groupId,
						tag : sp.sms_tag
					})
                });	
		        data = {"messages":listMsgs}		
			
				return {messages: parseMessages(data.messages) };				
			} else {
				return {messages: [] };
			}
		}
    }
    
    function parseMessages(messages, isReport){
    	var result = [];
    	for(var i = 0 ; i < messages.length; i++){
            if(!config.SHOW_UN_COMPLETE_CONCAT_SMS && typeof messages[i].received_all_concat_sms != "undefined" && messages[i].received_all_concat_sms == '0'){
                continue;
            }
    		var oneMessage = {};			
    		oneMessage.id = messages[i].id;
    		oneMessage.number = messages[i].number;
    		oneMessage.content = messages[i].content;
    		oneMessage.time = messages[i].time;//transTime('20' + messages[i].date);//parseTime(messages[i].date);
    		oneMessage.isNew = messages[i].tag == "1";
			oneMessage.groupId = messages[i].groupId;
    		oneMessage.tag = messages[i].tag;
    		result.push(oneMessage);
    	}
        /*if (!config.SMS_DATABASE_SORT_SUPPORT) {
            var ids = [];
            var tmpResult = [];
            for (var i = result.length; i--;) {
                var n = result[i];
                var idx = $.inArray(n.id, ids);
                if (idx == -1) {
                    ids.push(n.id);
                    tmpResult.push(n);
                } else {
                    if (n.content.length > tmpResult[idx].content.length) {
                        tmpResult[idx] = n;
                    }
                }
            }
            return _.sortBy(tmpResult, function (n) {
                return 0 - n.id;
            });
        } else {*/
            return result;
       /* }*/
    }
    
    function decodeMessageContent(msgContent) {
    	return decodeMessage(escapeMessage(msgContent));//.replace(/"/g, "\\\"");
    }
    
    /**
     * 发送短消息
     * @method sendSMS
     */
    function sendSMS() {
    	var callback = arguments[1];
    	var errorCabllback = arguments[2] ? arguments[2] : callback;
    	var argument =[];
		argument.push(arguments[0]) 
    	return doStuff(argument, {}, prepare, deal, null, true);
    	    	
    	function prepare(params, isPost){
            var requestParams ={};
			requestParams.goformId = "/goform/sendSMS"; 
			requestParams.formdata = {
			"sms_number":params.number,
			"sms_content":params.message, //短信内容
			"sms_id":params.id,//-1表示新建后保存；否则，表示编辑后保存，要传递实际的ID
			"sms_time":getSystemTime()
			//"action_type":"new"
			}
			return requestParams;
        }

        function deal(data){
        	if(!data){
        		errorCabllback($.extend(unknownErrorObject, {errorType: "sendFail", errorText: "send_fail_try_again"}));
        		return;
        	}
        	if (data.error == API_RESULT_SUCCESS) {
        		startGetSendResult(callback, errorCabllback);
			} else {
				errorCabllback($.extend(unknownErrorObject, {errorType: "sendFail", errorText: "send_fail_try_again"}));
			}
		}
	}
	
	function startGetSendResult(callback, errorCabllback){
        interGetSendResult= setTimeout(function () {
                                getSmsStatusInfo({}, callback, errorCabllback);
                            }, 5000);
    }   
	
	function getSmsStatusInfo(obj, callback, errorCabllback){
    	asyncRequest({"goformId":"/goform/getSendSMSResult","formdata":{}}, function(data){
    		if(data){
    			var status = data.send_state;
    			if(status == "1" || status == "2"){
    				startGetSendResult(callback, errorCabllback);
    			}else if(status == "3"){    				
    				callback({result: "success"});
    			}else{
					errorCabllback($.extend(unknownErrorObject, {errorType: "sendFail", errorText: "send_fail_try_again"}));
				}
    		}else{
    			window.clearInterval(obj.timer);
				errorCabllback($.extend(unknownErrorObject, {errorType: obj.errorType, errorText: obj.errorText}));
    		}
    	}, function(data){
    		window.clearInterval(obj.timer);
			errorCabllback($.extend(unknownErrorObject, {errorType: obj.errorType, errorText: obj.errorText}));
    	}, false);
    }

	/**
	 * 保存草稿
	 * @method saveSMS
	 */
	function saveSMS() {
		var callback = arguments[1];
		var errorCabllback = arguments[2] ? arguments[2] : callback;
		var argument =[];
		argument.push(arguments[0]) 
		return doStuff(argument, {}, prepare, deal, null, true);

		function prepare(params, isPost){
			var requestParams ={};
			requestParams.goformId = "/goform/saveSMS"; 
			requestParams.formdata = {
			"sms_number":"["+ params.numbers.toString()+"]",
			"sms_content":params.message, //短信内容
			"sms_id":params.index,//-1表示新建后保存；否则，表示编辑后保存，要传递实际的ID
			"sms_time" : params.currentTimeString,
			"groupId":params.groupId //短信组编号
			}
			/*var obj = {				
				goformId : "SAVE_SMS",
				SMSMessage : escapeMessage(encodeMessage(params.message)), //短信内容
				SMSNumber : params.numbers.join(";") + ";",//短消息号码
				Index : params.index,//-1表示新建后保存；否则，表示编辑后保存，要传递实际的ID
				encode_type : getEncodeType(params.message).encodeType,
				sms_time : params.currentTimeString,
				draft_group_id : params.groupId //短信组编号
			};
			return obj;*/
		    return requestParams;
		}

		function deal(data){
			if(!data){
				errorCabllback($.extend(unknownErrorObject, {errorType: "saveFail", errorText: "save_fail"}));
				return;
			}
			if (data.error == API_RESULT_SUCCESS) {
                callback({result: "success"});
			} else {
				errorCabllback($.extend(unknownErrorObject, {errorType: "saveFail", errorText: "save_fail"}));
			}
		}
	}
    
    /**
	 * 删除选中的短消息
	 * 
	 * @method deleteMessage
	 */
    
    function deleteMessage() {
		var callback = arguments[1];
    	var errorCabllback = arguments[2] ? arguments[2] : callback;
        var argument =[];
		argument.push(arguments[0]) 
    	return doStuff(argument, {}, prepare, deal, null, true);
    	    	
    	function prepare(params, isPost){
    		var msgIds = "["+ params.ids.toString()+"]";

			var requestParams = {};  
			requestParams.goformId = "/goform/deleteSMS"; 
			requestParams.formdata = {
				sms_id : msgIds
			};            
            return requestParams;
        }

        function deal(data){
        	if(!data){
        		errorCabllback($.extend(unknownErrorObject, {errorType: "deleteFail", errorText: "delete_fail_try_again"}));
        		return;
        	}
        	if (data.error == API_RESULT_SUCCESS) {
                callback({result: "success"});
			} else {
				errorCabllback($.extend(unknownErrorObject, {errorType: "deleteFail", errorText: "delete_fail_try_again"}));
			}
		}
	}

    function getSMSReady(){
		/*
		/goform/ getSmsInitState
		0->未初始化完成；1->初始化完成;2->失败。		
"sms_cmd_status_result" 
1:initing,2,failed,3,success
*/
        if(config.smsIsReady){
            var callback = arguments[1];
            if(callback){
                return callback({"sms_cmd":"1","sms_cmd_status_result":"3"});
            }else{
                return {"sms_cmd":"1","sms_cmd_status_result":"3"};
            }
        } else {
            return doStuff(arguments, {}, prepare, deal, null, false);
        }

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "/goform/getSmsInitState"; 
			requestParams.formdata = {};
            return requestParams;
        }

        function deal(data) {			
            if (data) {
				var status_result = "";
				switch (data.state) {
				    case 0:
				        status_result = "1";
				    break;
				    case 1:
				        status_result = "3";
					break;
				    default:
					    status_result = "2";
					break;
				}
			    
                if(status_result == "3"){
                    config.smsIsReady = true;
                }
                return {"sms_cmd":"1","sms_cmd_status_result":status_result};
            } else {
                return unknownErrorObject;
            }
        }
    }
    /**
     * 新短信设置为已读
     * @method setSmsRead
     * @param {String} ids 以分号分隔的短信编号
     */
    function setSmsRead() {
		
		return doStuff(arguments, {}, prepare, deal, null, true);
    	
    	function prepare(params, isPost){
    		var msgIds = params.ids/*[0].join(";");
    		if(params.ids.length > 0){
    			msgIds += ";";
    		}*/
			msgIds ="["+ msgIds.toString()+"]";
			var requestParams = {};  
			requestParams.goformId = "/goform/setSMSRead"; 
			requestParams.formdata = {
				sms_id : msgIds
			};            
            return requestParams;
        }

        function deal(data){
        	if (data.error == API_RESULT_SUCCESS) {
        		return {result: true};
			} else {
				return {result: false};
			}
		}
	}
    
    /**
     * 获取短信发送报告列表
     * @method getSMSDeliveryReport
     */
    function getSMSDeliveryReport(){
		return doStuff(arguments, {}, prepare, deal, {}, true);

        function prepare(params, isPost) {
            var requestParams = {};
			requestParams.goformId = "/goform/getSMSReportlist";
			requestParams.formdata = {"pageNum": "1"};
            return requestParams;
        }

		function deal(data) {
			if (data && data.data && data.data.length > 0) {
				var listMsgs = [];
				$.each(data.data, function(s_i, sp){            
					listMsgs.push({
						id : sp.report_id,      
						number : sp.report_number,
						content : sp.report_content,
						time : sp.report_time
					})
                });	
		        data = {"messages":listMsgs}		
			
				return {messages: parseMessages(data.messages) };				
			} else {
				return {messages: [] };
			}
		}    
    }
	
     /**
     * 删除短信发送报
     * @method deleteSMSReport
     */
    function deleteSMSReport(){
		return doStuff(arguments, {}, prepare, deal, null, true);
    	    	
    	function prepare(params, isPost){
    	
			var requestParams = {};  
			requestParams.goformId = "/goform/deleteSMSReport"; 
			requestParams.formdata = {
				report_id : params.id
			};            
            return requestParams;
        }

        function deal(data){
            if(data && data.error == API_RESULT_SUCCESS){
                timerInfo.smsReportReceived = false;
                return {result: true};
            }else{
                return $.extend(unknownErrorObject, {errorType: "deleteReportError"});
            }
        }
    }
    /**
	 * 退出系统
	 * 
	 * @method logout
	 * @return {Object} JSON
	 */
    function logout() {

        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost){
            var obj = {};
			obj.formdata = $.extend({}, params);
            obj.goformId = "/goform/setLogout";
            return obj;
        }

        function deal(data){
            if(data && data.error == API_RESULT_SUCCESS){
                timerInfo.isLoggedIn = false;
                return {result: true};
            }else{
                return $.extend(unknownErrorObject, {errorType: "loggedOutError"});
            }
        }
    }

    /**
     * 获取PIN相关信息
     * @method changePassword
     * @param  {Object} JSON
     * @example
      //请求参数映射
     {
         oldPassword:"123456",
         newPassword:"234567"
     }
     * @return {Object} JSON
     */
    function changePassword() {

        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
			requestParams.formdata={
            	oldPassword : params.oldPassword/*  config.PASSWORD_ENCODE ? Base64.encode(params.oldPassword) :*/,
            	newPassword : params.newPassword/* config.PASSWORD_ENCODE ? Base64.encode(params.newPassword) : */
			}
            /*obj.goformId = "CHANGE_PASSWORD";
            obj.isTest = isTest;*/
            requestParams.goformId = "/goform/setPassword";
            return requestParams;
        }

        function deal(data) {

            if (data && data.error == API_RESULT_SUCCESS && data.set_psw_res==0) {
                return {
                    result : true
                };
            } else {
                return $.extend(unknownErrorObject, {
                    errorType : "badPassword"
                });
            }
        }
    }

    /**
     * 获取PIN相关信息
     * @method getPinData
     * @return {Object} JSON
     */
    function getPinData(){
        return doStuff(arguments, {}, prepare, deal, null, false);
		
        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "/goform/getSimcardInfo";//.cmd = "pinnumber,pin_status,puknumber";
            return requestParams;
        }

        function deal(data) {
	var result = {};
            if (data) {
				if (data.pin_state == MACRO_UIM_PIN_STATE_ENABLED_NOT_VERIFIED ||data.pin_state == MACRO_UIM_PIN_STATE_ENABLED_VERIFIED){
					result.pin_status = "1";
					result.pinnumber = data.pin_puk_times;
					result.puknumber = 0;
				}else if (data.pin_state == MACRO_UIM_PIN_STATE_BLOCKED){
					result.pin_status = "1";
					result.pinnumber = 0;
					result.puknumber = data.pin_puk_times;					
				}else{
					result.pin_status = "0";
					result.pinnumber = data.pin_puk_times;
					result.puknumber = 0;
				}
							
                return result;
           } else {
                return unknownErrorObject;
           }
        }
    }

    /**
     * 启用PIN
     * @method enablePin
     * @param  {Object} JSON
     * @example
      //请求参数映射
     {
        oldPin = "1234";
     }
     * @return {Object} JSON
     */
    function enablePin() {

        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var obj = {};
            obj.goformId = "/goform/switchPIN";
			obj.formdata = {oper_type:"enable",pin:params.oldPin};
            return obj;
        }

        function deal(data) {
            if (data && data.error == API_RESULT_SUCCESS) {
                return { result:true };
            } else {
                return { result:false};
            }
        }
    }

    /**
     * 禁用PIN
     * @method disablePin
     * @param  {Object} JSON
     * @example
      //请求参数映射
     {
         oldPin = "1234";
     }
     * @return {Object} JSON
     */
    function disablePin() {

        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var obj = {};
            obj.goformId = "/goform/switchPIN";
			obj.formdata = {oper_type:"disable",pin:params.oldPin};
            return obj;
        }

        function deal(data) {
            if (data && data.error == API_RESULT_SUCCESS) {
                return { result:true };
            } else {
                return { result:false};
            }
        }
    }

    /**
     * 修改PIN
     * @method changePin
     * @param  {Object} JSON
     * @example
      //请求参数映射
     {
         oldPin = "2345";
         newPin = "1234";
     }
     * @return {Object} JSON
     */
    function changePin() {

        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var obj = {};
            obj.goformId = "/goform/changePIN";
			obj.formdata = {oldpin:params.oldPin,newpin:params.newPin};
            return obj;
        }

        function deal(data) {
            if (data && data.error == API_RESULT_SUCCESS) {
                return { result:true };
            } else {
                return { result:false};
            }
        }
    }

    /**
     * 获取路由信息
     * @method getLanInfo  ----houailing
     */
    function getLanInfo() {
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            var requestParams = {};
           	requestParams.goformId = "/goform/getRouterInfo";
           	requestParams.formdata = {};
            return requestParams;
        }

        function deal(data) {
            if (data) {
                var result = {};
                var releaseTime = data.dhcp_release_time;
                result.ipAddress = data.a5_ip_addr;
                result.subnetMask = data.sub_net_mask;
                result.dhcpServer = data.enable_dhcp;// == "1"? "enable" : "disable";
                result.dhcpStart = data.dhcp_start_addr;
                result.dhcpEnd = data.dhcp_end_addr;
                result.hostName = data.host_name;
                result.dhcpLease = releaseTime.substring(0,releaseTime.length-1);
                return result;
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 设置路由信息
     * @method setLanInfo
     */
    function setLanInfo() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {}; 
            var info = getLanInfo();
            var lanDhcpType = params.dhcpServer == "1"? "SERVER" : "DISABLE";
            if(lanDhcpType != "SERVER") {
                params.dhcpStart = info.dhcpStart;
                params.dhcpEnd = info.dhcpEnd;
                params.dhcpLease = info.dhcpLease + "h";
            }
            requestParams.formdata = {
            	a5_ip_addr : params.ipAddress,
            	sub_net_mask : params.subnetMask,
            	host_name : params.hostName,
            	enable_dhcp : params.dhcpServer,
            	dhcp_start_addr : params.dhcpStart,
            	dhcp_end_addr : params.dhcpEnd,
            	dhcp_release_time : params.dhcpLease + "h",
                host_name: info.hostName
            }
            requestParams.goformId = "/goform/setRouterInfo";
            return requestParams;
        }

        function deal(data) {
        	var result = {};
            if (data && (data.error == API_RESULT_SUCCESS)) {
                result.result = "success";
            } else {
                result.result = "fail";
            }
            return result;
        }
    }

    /**
     * 获取短信设置参数
     * @method getSmsSetting
     */
    function getSmsSetting() {
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            var requestParams = {};
           	requestParams.goformId = "/goform/getSMSStoreState";
           	return requestParams;
        }

        function deal(data) {
            if (data) {
                var result = {};
                result.centerNumber = data.sms_center_num;
                result.memStroe = data.store_flag;
                result.deliveryReport = data.sms_is_report;
                result.totalCount = data.total_count;
                result.usedCount = data.used_count;
                switch(parseInt(data.sms_validity_period)){
	        		case 0:
	        		    result.validity = "twelve_hours";
	        		    break;
	        		case 1:
	        		    result.validity = "one_day";
	        			break;
	        		case 2:
	        		    result.validity = "one_week";
	        			break;
	        		case 3:
	        		    result.validity = "largest";
	        		    break;
	        		default:
	        			result.validity = "twelve_hours";
	        		    break;
                }
                return result;
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 设置短信参数
     * @method setSmsSetting
     */
    function setSmsSetting() {
       /* var callback = arguments[1];
        var errorCabllback = arguments[2] ? arguments[2] : callback;*/
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            var validityPeriod;
            switch(params.validity){
        		case "twelve_hours":
        		    validityPeriod = "0";
        		    break;
        		case "one_day":
        		    validityPeriod = "1";
        			break;
        		case "one_week":
        		    validityPeriod = "2";
        			break;
        		case "largest":
        		    validityPeriod = "3";
        		    break;
        		default:
        			validityPeriod = "0";
        		    break;
            }
            requestParams.goformId = "/goform/setSMSSetting";

            requestParams.formdata = {
           		sms_center_num : params.centerNumber,
           		store_flag : params.memStroe,
           		sms_is_report : params.deliveryReport,
           		sms_validity_period : validityPeriod
           	};
            return requestParams;
        }

        function deal(data) {
            var result = {};
            if (data && data.error == API_RESULT_SUCCESS) {
               result.result = "success";
            } else {
                result.result = "fail";
            }
            return result;
        }
    }

    /**
     * 恢复出厂设置
     * @method restoreFactorySettings
     * @return {Object} JSON
     */
    function restoreFactorySettings() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "/goform/setReset";
            return requestParams;
        }

        function deal(data) {
            var result = {};			
			if (data && (data.error == API_RESULT_SUCCESS)) {
				result.result = "success";
			}else {
                result.result = "fail";
			}
		
		  	return result;
        }
    }

    /**
     * 检测恢复出厂设置是否完成
     * @method checkRestoreStatus
     */
    function checkRestoreStatus(successCallback) {
        var requestParams = {};
        requestParams.isTest = isTest;
        requestParams.cmd = "restore_flag";
        requestParams.multi_data = 1;
        asyncRequest(requestParams, function (data) {
            if (data && data.restore_flag === "1") {
                successCallback();
            } else {
                setTimeout(function () {
                    checkRestoreStatus(successCallback);
                }, 5000);
            }
        }, function () {
            setTimeout(function () {
                checkRestoreStatus(successCallback);
            }, 5000);
        }, false);
    }

    /**
     * 获取wps相关信息
     * @method getWpsInfo
     */
    function getWpsInfo() {
		
 
	  return doStuff(arguments, {}, prepare, deal, null, false);

       function prepare(params, isPost) {
           var requestParams = {};
           requestParams.goformId = "/goform/getWlanInfo";
            return requestParams;
        }

       function deal(data) {
            if (data) {
			if(data.security_mode == 0) {
				AuthMode = "NONE";				               
            }
            else if(data.security_mode == 4){
                AuthMode = "WPAPSKWPA2PSK";
            }else{
				AuthMode = "WPA2PSK";
			}
               var result = {
                wpsFlag : data.wifi_state == 2 ? 1 : 0,           
                radioFlag : data.wifi_state == 0 ? 0 : 1  
                };
                return result;
            } else {
                return unknownErrorObject;
            }
	   }
    }

    /**
     * 开启wps
     * @method openWps
     */
    function openWps() {
		return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};           
            if(params.wpsType == 'PIN') {
				requestParams.goformId = "/goform/setWpsPin"; 
                requestParams.formdata = {
					wps_pin : params.wpsPin
				};
            }else{
				requestParams.goformId = "/goform/setWpsPbc"; 
                requestParams.formdata = {};
			}
            return requestParams;
        }

        function deal(data) {
			var result = {};			
			if (data && data.set_wps_res == 0 && (data.error == API_RESULT_SUCCESS)) {
				result.result = "success";
			}else {
                result.result = "fail";
			}					
		  return result;
        }
    }

    /**
     * 获取wifi 休眠信息
     * @method getSleepInfo
     */
    function getSleepMode() {
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "/goform/getPowerSaveSettings";
            requestParams.formdata = {};
            return requestParams;
        }

        function deal(data) {
            if (data) {
            	var result = {};
                result.sleepTime = data.sleep_time;
                switch(parseInt(data.wifi_pref)){
	        		case 0:
	        		    result.wifiRange = "short_mode";
	        		    break;
	        		case 1:
	        		    result.wifiRange = "medium_mode";
	        			break;
	        		case 2:
	        		    result.wifiRange = "long_mode";
	        			break;
	        		default:
	        			result.wifiRange = "short_mode";
	        		    break;
                }

                return result;
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 设置wifi休眠信息
     * @method
     */
    function setSleepMode() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "/goform/setPowerSaveTime";
			//switch(params.sleepMode)
            requestParams.formdata = {
            	sleep_time :parseInt(params.sleepMode)
            }
            return requestParams;
        }

        function deal(data) {
        	var result = {};
            if (data && (data.error == API_RESULT_SUCCESS)) {
                result.result = "success";
            } else {
                result.result = "fail";
            }
            return result;
        }
    }

    /**
     * 获取防火墙安全信息
     * @method getSysSecurity
     */
    function getSysSecurity() {
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.isTest = isTest;
            requestParams.cmd = "RemoteManagement,WANPingFilter";
            requestParams.multi_data = 1;
            return requestParams;
        }

        function deal(data) {
            if (data) {
                var result = {};
                result.remoteFlag = data.RemoteManagement == "1"? "1" : "0";
                result.pingFlag = data.WANPingFilter == "1"? "1" : "0";
                return result;
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 设置防火墙安全信息
     * @method setSysSecurity
     */
    function setSysSecurity() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.isTest = isTest;
            requestParams.goformId = "FW_SYS";
            requestParams.remoteManagementEnabled = params.remoteFlag;
            requestParams.pingFrmWANFilterEnabled = params.pingFlag;
            return requestParams;
        }

        function deal(data) {
            if (data) {
                return data;
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 获取端口转发信息
     * @method getPortForward
     */
    function getPortForward() {
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.isTest = isTest;
            requestParams.cmd = "PortForwardEnable,PortForwardRules_0,PortForwardRules_1,PortForwardRules_2,PortForwardRules_3,PortForwardRules_4,PortForwardRules_5,PortForwardRules_6,PortForwardRules_7,PortForwardRules_8,PortForwardRules_9";
            requestParams.multi_data = 1;
            return requestParams;
        }

        function deal(data) {
            if (data) {
                var result = {};
                result.portForwardEnable = data.PortForwardEnable;
                //from 93, refactory later
                var rules = [];
                if(data.PortForwardRules_0 != ""){
                    rules.push([0,data.PortForwardRules_0]);
                }
                if(data.PortForwardRules_1 != ""){
                    rules.push([1,data.PortForwardRules_1]);
                }
                if(data.PortForwardRules_2 != ""){
                    rules.push([2,data.PortForwardRules_2]);
                }
                if(data.PortForwardRules_3 != ""){
                    rules.push([3,data.PortForwardRules_3]);
                }
                if(data.PortForwardRules_4 != ""){
                    rules.push([4,data.PortForwardRules_4]);
                }
                if(data.PortForwardRules_5 != ""){
                    rules.push([5,data.PortForwardRules_5]);
                }
                if(data.PortForwardRules_6 != ""){
                    rules.push([6,data.PortForwardRules_6]);
                }
                if(data.PortForwardRules_7 != ""){
                    rules.push([7,data.PortForwardRules_7]);
                }
                if(data.PortForwardRules_8 != ""){
                    rules.push([8,data.PortForwardRules_8]);
                }
                if(data.PortForwardRules_9 != ""){
                    rules.push([9,data.PortForwardRules_9]);
                }
                result.portForwardRules = parsePortForwardRules(rules);
                return result;
            } else {
                return unknownErrorObject;
            }
        }

        //from 93, refactory later
        function parsePortForwardRules(data) {
            var rules = [];
            if(data && data.length > 0){
                for(var i = 0; i < data.length; i++){
                    var aRule = {};
                    var elements = data[i][1].split(",");
                    aRule.index = data[i][0];
                    aRule.ipAddress = elements[0];
                    aRule.portRange = elements[1] + ' - ' + elements[2];
                    aRule.protocol = transProtocol(elements[3]);
                    aRule.comment = elements[4];
                    rules.push(aRule);
                }
            }
            return rules;
        }
    }

    /**
     * 设置端口转发信息
     * @method setPortForward
     */
    function setPortForward() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.isTest = isTest;
            requestParams.goformId = "FW_FORWARD_ADD";
            requestParams.ipAddress = params.ipAddress;
            requestParams.portStart = params.portStart;
            requestParams.portEnd = params.portEnd;
            requestParams.protocol = params.protocol;
            requestParams.comment = params.comment;
            return requestParams;
        }

        function deal(data) {
            if (data) {
                return data;
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 删除端口转发规则
     * @method setPortForward
     */
    function deleteForwardRules() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.isTest = isTest;
            requestParams.goformId = "FW_FORWARD_DEL";
            requestParams.delete_id = params.indexs.join(';') + ";";
            return requestParams;
        }

        function deal(data) {
            if (data) {
                return data;
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 虚拟服务器设置
     * @method enableVirtualServer
     */
    function enableVirtualServer() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.isTest = isTest;
            requestParams.goformId = "VIRTUAL_SERVER";
            requestParams.PortForwardEnable = params.portForwardEnable;
            return requestParams;
        }

        function deal(data) {
            if (data) {
                return data;
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 获取快速设置需要的数据
     * @method getQuickSettingInfo
     */
    function getQuickSettingInfo() {
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.isTest = isTest;
            var wpask = config.PASSWORD_ENCODE ? ",WPAPSK1_encode" : ",WPAPSK1";
            requestParams.cmd = "pdp_type,ipv6_pdp_type,RadioOff,SSID1,HideSSID,AuthMode,WscModeOption,ppp_status,apn_index,ipv6_apn_index,ipv6_APN_index,m_profile_name,apn_mode" + wpask +
                ",APN_config0,APN_config1,APN_config2,APN_config3,APN_config4,APN_config5,APN_config6,APN_config7,APN_config8,APN_config9,APN_config10,APN_config11,APN_config12,APN_config13,APN_config14,APN_config15,APN_config16,APN_config17,APN_config18,APN_config19" +
                ",ipv6_APN_config0,ipv6_APN_config1,ipv6_APN_config2,ipv6_APN_config3,ipv6_APN_config4,ipv6_APN_config5,ipv6_APN_config6,ipv6_APN_config7,ipv6_APN_config8,ipv6_APN_config9,ipv6_APN_config10,ipv6_APN_config11,ipv6_APN_config12,ipv6_APN_config13,ipv6_APN_config14,ipv6_APN_config15,ipv6_APN_config16,ipv6_APN_config17,ipv6_APN_config18,ipv6_APN_config19";
            requestParams.multi_data = 1;
            return requestParams;
        }

        function deal(data) {
            if (data) {
                if(config.PASSWORD_ENCODE){
                    data.WPAPSK1 = Base64.decode(data.WPAPSK1_encode);
                }
                return data;
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 快速设置
     * @method getQuickSettingInfo
     */
    function setQuickSetting() {
        doStuffAndCheckServerIsOnline(arguments, prepare, deal);

        function prepare(params) {
            var requestParams = {
                isTest:isTest,
                goformId:"QUICK_SETUP",
                apn_mode:params.apnMode,
                Profile_Name:params.Profile_Name,
                APN_name:params.APN_name,
                ppp_auth_mode:params.ppp_auth_mode,
                ppp_username:params.ppp_username,
                ppp_passwd:params.ppp_passwd,
                SSID_name:params.SSID_name,
                SSID_Broadcast:params.SSID_Broadcast,
                Encryption_Mode_hid:params.Encryption_Mode_hid,
                security_shared_mode:params.security_shared_mode,
                WPA_PreShared_Key:config.PASSWORD_ENCODE ? Base64.encode(params.WPA_PreShared_Key) : (params.WPA_PreShared_Key),
                wep_default_key:params.wep_default_key,
                WPA_ENCRYPTION_hid:params.WPA_ENCRYPTION_hid
            };
            return requestParams;
        }

        function deal(data) {
            if (data) {
                return data;
            } else {
                return $.extend(unknownErrorObject, {errorType:"SetSetUpError"});
            }
        }

    }

    /**
     * 快速设置(支持IPv6)
     * @method setQuickSetting4IPv6
     */
    function setQuickSetting4IPv6() {
        doStuffAndCheckServerIsOnline(arguments, prepare, deal);

        function prepare(params) {
            var requestParams = {
                isTest:isTest,
                goformId:"QUICK_SETUP_EX",
                index:params.apn_index,
                pdp_type:params.pdp_type,
                apn_mode:params.apnMode,
                profile_name:params.profile_name,
                wan_apn:params.wan_apn,
                ppp_auth_mode:params.ppp_auth_mode,
                ppp_username:params.ppp_username,
                ppp_passwd:params.ppp_passwd,
                ipv6_wan_apn:params.ipv6_wan_apn,
                ipv6_ppp_auth_mode:params.ipv6_ppp_auth_mode,
                ipv6_ppp_username:params.ipv6_ppp_username,
                ipv6_ppp_passwd:params.ipv6_ppp_passwd,
                SSID_name:params.SSID_name,
                SSID_Broadcast:params.SSID_Broadcast,
                Encryption_Mode_hid:params.Encryption_Mode_hid,
                security_shared_mode:params.security_shared_mode,
                WPA_PreShared_Key:config.PASSWORD_ENCODE ? Base64.encode(params.WPA_PreShared_Key) : params.WPA_PreShared_Key,
                wep_default_key:params.wep_default_key,
                WPA_ENCRYPTION_hid:params.WPA_ENCRYPTION_hid
            }
            return requestParams;
        }

        function deal(data) {
            if (data) {
                return data;
            } else {
                return $.extend(unknownErrorObject, {errorType:"SetSetUpError"});
            }
        }
    }

    /**
     * 业务处理后，轮询检测服务器是否可以连接，可连接时执行回调函数
     * @method doStuffAndCheckServerIsOnline
     */
    function doStuffAndCheckServerIsOnline(arg, prepare, deal) {
        //server是否正常
        var isServerOnline = false;
        //callback是否执行
        var isCallbackExecuted = false;
        var params = prepare(arg[0]);
        var callback = arg[1];
        var successCallback = function (data) {
            isServerOnline = true;
            if (!isCallbackExecuted && callback) {
                callback(deal(data));
            }
            isCallbackExecuted = true;
        };
        var errorMethod = arg[2];
        var errorCallback = function () {
            isServerOnline = true;
            if (errorMethod) {
                errorMethod();
            }
        };

        asyncRequest(params, successCallback, errorCallback, true);

        addTimeout(function () {
            if (isServerOnline == false) {
                var timer = addInterval(function () {
                    if (isServerOnline == false) {
                        getLanguage({}, function (data) {
							window.clearInterval(timer);
                            successCallback({result:"success"});
                        });
                    }
                }, 1000);
            }
        }, 5000);
    }

    /**
     * 获取端口过滤信息
     * @method getIPFilterList  ------zhiwei.xu--12.9
     */
    function getIPFilterList(){
    	  return doStuff(arguments, {}, prepare, deal, null, false);

          function prepare(params, isPost) {
              var requestParams = {};
          	requestParams.goformId = "/goform/getIPFilterList";
			requestParams.formdata = {};
			
            return requestParams;
          }

          function deal(data) {
              if (data) 
              {
            	 for ( var i = 0; i < data.data.length; i++)
            	 {
            		data.data[i].ip_protocol = transfProtocol(data.data[i].ip_protocol);
            		data.data[i].ip_status = tranOption(data.data[i].ip_status);
            	 }
                  return data;
              } else {
                  return {};
              }
          }
          function transfProtocol(protocol){
          	var protocolVal = "TCP";
          	switch (protocol)
  			{
  			case 6:
  				protocolVal = "TCP";
  				break;
  			case 17:
  				protocolVal = "UDP";
  				break;
  			case 253:
  				protocolVal = "TCP_UDP";
  				break;
  			default:
  				protocolVal = "TCP";
  				break;
  			}
          	return protocolVal;
          }
          
          function tranOption(ipState)
  		{
          	ipStateVal = "off";
          	if(ipState == 1)
  			{
          		ipStateVal = "on";
  			}else{
  				ipStateVal = "off";
  			}
          	return ipStateVal;
  		}
    }
    function getPortFilter() {
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            var requestParams = {};
			requestParams.goformId = "/goform/getFirewallSwitch";
			requestParams.formdata = {};
            return requestParams;
        }
        function deal(data) {
            if (data) {
            	var result = getIPFilterList();
                data.portFilterRules = result.data;
                data.total_num = result.total_num;
                return data;
            } else {
                return {
	            		"firewall_status":0,
	            		"ipflt_status":0,
	            		"wan_ping_status":0,
	            		"total_num":0,
	            		"portFilterRules" :[{}]
            		};
            }
        }
       
    }

    /**
     * 设置端口过滤基本信息
     * @method setPortFilterBasic
     */
    function setPortFilterBasic() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "/goform/setFirewallSwitch";
            requestParams.formdata = params;
            return requestParams;
        }

        function deal(data) {
        	var result = {};
            if (data && (data.error == API_RESULT_SUCCESS)) {
                result.result = "success";
            } else {
                result.result = "fail";
            }
            return result;
        }

    }
    
    /**
     * 保存编辑的端口过滤信息
     * @method editIPFilter
     */
    function editIPFilter() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "/goform/editIPFilter";
            requestParams.formdata = params;
            return requestParams;
        }

        function deal(data) {
        	var result = {};
            if (data && (data.error == API_RESULT_SUCCESS)) {
                result.result = "success";
            } else {
                result.result = "fail";
            }
            return result;
        }

    }
    
    /**
     * 保存新端口过滤信息
     * @method addIPFilter
     */
    function addIPFilter() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "/goform/addIPFilter";
            requestParams.formdata = params;
            return requestParams;
        }

        function deal(data) {
        	var result = {};
            if (data && (data.error == API_RESULT_SUCCESS)) {
                result.result = "success";
            } else {
                result.result = "fail";
            }
            return result;
        }

    }


    /**
     * 删除端口过滤信息
     * @method deleteFilterRules
     */
    function deleteFilterRules() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
        	var requestParams = {};
        	requestParams.goformId = "/goform/deleteIPFilter";
        	requestParams.formdata = params;
        	return requestParams;
        }

        function deal(data) {
        	var result = {};
            if (data && (data.error == API_RESULT_SUCCESS)) {
                result.result = "success";
            } else {
                result.result = "fail";
            }
            return result;
        }
    }

/**
     * 获取设备基本信息
     * @method getDeviceInfo
     */
    function getDeviceInfo(){
    	return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "/goform/getSysteminfo";
            return requestParams;
        }

        function deal(data) {
            if (data) {
               /* var type_2g = ["GSM", "GPRS", "EDGE"];
                var type_3g = ["UMTS", "HSDPA", "HSUPA", "HSPA", "HSPA+", "DC-HSPA+"];
                var type_4g = ["LTE"];
                
                var networkType = timerInfo.networkType;
                if ($.inArray(networkType, type_2g) != -1 || $.inArray(networkType, type_3g) != -1 || $.inArray(networkType, type_4g) != -1) {
                    signal = data.rssi;
                } */
              // var connInfo = getConnectionInfo();
               //var ipAddress = getLanInfo().ipAddress || "--";
               //var profileInfo = getApnSettings();
                return {
                	ssid: "",
                    m_ssid: "",
                    m_max_access_num: 0,
                    multi_ssid_enable: "0",
                	macAddress: data.dev_mac || "--",                              	//mac
                	simSerialNumber: data.dev_msisdn || "--",                      	//msisdn
                	lanDomain: "",//data.LocalDomain,
                	imei: data.dev_imei || "--",									//Imei
                	web_version: data.soft_ver || "--",							//webui version
                	fw_version: data.firmware_ver || "--",							//fw version
                	hw_version: data.hard_ver || "--",								//hardware version
                	max_access_num: 0,
                    wifiRange: "",
                    imsi:"",
                    signal :  data.rssi,									//信号
                    modelName:data.model || "--"									//model name
                };
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 获取wifi覆盖范围
     * @method getWifiRange
     */
    function getWifiRange() {
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.isTest = isTest;
            requestParams.cmd = "wifi_coverage";
            return requestParams;
        }

        function deal(data) {
            if (data) {
                var result = {};
                result.wifiRangeMode = data.wifi_coverage;
                return result;
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 设置wifi覆盖范围
     * @method getWifiRange
     */
    function setWifiRange() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            var WifiRange;
            switch(params.wifiRangeMode){
        		case "short_mode":
        		    WifiRange = 0;
        		    break;
        		case "medium_mode":
        		    WifiRange = 1;
        			break;
        		case "long_mode":
        		    WifiRange = 2;
        			break;
        		default:
        			WifiRange = 0;
        		    break;
            }            
            requestParams.formdata = {
            	wifi_pref : WifiRange
            };
            requestParams.goformId = "/goform/setWifiPerformance";
            return requestParams;
        }

        function deal(data) {
        	var result = {};
            if (data && (data.error == API_RESULT_SUCCESS)) {
                result.result = "success";
            } else {
                result.result = "fail";
            }
            return result;
        }
    }

    /**
     *获取upnp信息
     * @method getUpnpSetting
     */
    function getUpnpSetting() {
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.isTest = isTest;
            requestParams.cmd = "upnpEnabled";
            requestParams.multi_data = 1;
            return requestParams;
        }

        function deal(data) {
            if (data) {
                var result = {};
                result.upnpSetting = data.upnpEnabled == "1"? "1" : "0";
                return result;
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     *设置upnp信息
     * @method setUpnpSetting
     */
    function setUpnpSetting() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "UPNP_SETTING";
            requestParams.isTest = isTest;
            requestParams.upnp_setting_option = params.upnpSetting;
            return requestParams;
        }

        function deal(data) {
            if (data) {
                return data;
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     *获取dmz信息
     * @method getUpnpSetting
     */
    function getDmzSetting() {
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "/goform/getDMZInfo";
			requestParams.formdata = {};
            return requestParams;
        }

        function deal(data) {
            if (data) {
                var result = {};
                result.dmzSetting = data.dmz_status == 1? "0": "1" ;
                result.ipAddress = data.dmz_ip;
                return result;
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     *设置dmz信息
     * @method setDmzSetting
     */
    function setDmzSetting() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
			var status_dmz = 0 ;
			if (params.dmzSetting == "1"){
				status_dmz = 2;
			}else{
				status_dmz =1;
			}
            requestParams.goformId = "/goform/setDMZInfo";			
			requestParams.formdata = {dmz_status:status_dmz,dmz_ip:params.ipAddress};

            return requestParams;
        }

        function deal(data) {
            if (data && data.error == API_RESULT_SUCCESS) {
                return {result:"success"};
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 获取端口映射规则
     * @method getPortMap
     */
    function getPortMap() {
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.isTest = isTest;
            requestParams.cmd = "PortMapEnable,PortMapRules_0,PortMapRules_1,PortMapRules_2,PortMapRules_3,PortMapRules_4,PortMapRules_5,PortMapRules_6,PortMapRules_7,PortMapRules_8,PortMapRules_9",
            requestParams.multi_data = 1;
            return requestParams;
        }

        function deal(data) {
            if (data) {
                var result = {};
                result.portMapEnable = data.PortMapEnable;
                //from 93, refactory later
                var rules = [];
                if(data.PortMapRules_0 != ""){
                    rules.push([0,data.PortMapRules_0]);
                }
                if(data.PortMapRules_1 != ""){
                    rules.push([1,data.PortMapRules_1]);
                }
                if(data.PortMapRules_2 != ""){
                    rules.push([2,data.PortMapRules_2]);
                }
                if(data.PortMapRules_3 != ""){
                    rules.push([3,data.PortMapRules_3]);
                }
                if(data.PortMapRules_4 != ""){
                    rules.push([4,data.PortMapRules_4]);
                }
                if(data.PortMapRules_5 != ""){
                    rules.push([5,data.PortMapRules_5]);
                }
                if(data.PortMapRules_6 != ""){
                    rules.push([6,data.PortMapRules_6]);
                }
                if(data.PortMapRules_7 != ""){
                    rules.push([7,data.PortMapRules_7]);
                }
                if(data.PortMapRules_8 != ""){
                    rules.push([8,data.PortMapRules_8]);
                }
                if(data.PortMapRules_9 != ""){
                    rules.push([9,data.PortMapRules_9]);
                }
                result.portMapRules = parsePortMapRules(rules);
                return result;
            } else {
                return unknownErrorObject;
            }
        }

        //from 93, refactory later
        function parsePortMapRules(data) {
            var rules = [];
            if(data && data.length > 0){
                for(var i = 0; i < data.length; i++){
                    var aRule = {};
                    var elements = data[i][1].split(",");
                    aRule.index = data[i][0];
                    aRule.sourcePort = elements[1];
                    aRule.destIpAddress = elements[0];
                    aRule.destPort = elements[2];
                    aRule.protocol = transProtocol(elements[3]);
                    aRule.comment = elements[4];
                    rules.push(aRule);
                }
            }
            return rules;
        }
    }

    /**
     * 设置端口映射信息
     * @method setPortMap
     */
    function setPortMap() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.isTest = isTest;
            requestParams.goformId = "ADD_PORT_MAP";
            requestParams.portMapEnabled = params.portMapEnable;
            requestParams.fromPort = params.sourcePort;
            requestParams.ip_address = params.destIpAddress;
            requestParams.toPort = params.destPort;
            requestParams.protocol = params.protocol;
            requestParams.comment = params.comment;
            return requestParams;
        }

        function deal(data) {
            if (data) {
                return data;
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 启用/禁用端口映射
     * @method enablePortMap
     */
    function enablePortMap() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.isTest = isTest;
            requestParams.goformId = "ADD_PORT_MAP";
            requestParams.portMapEnabled = params.portMapEnable;
            return requestParams;
        }

        function deal(data) {
            if (data) {
                return data;
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 删除端口映射信息
     * @method deleteMapRules
     */
    function deleteMapRules() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.isTest = isTest;
            requestParams.goformId = "DEL_PORT_MAP";
            requestParams.delete_id = params.indexs.join(';') + ";";
            return requestParams;
        }

        function deal(data) {
            if (data) {
                return data;
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 获取流量提醒数据
     * @method getTrafficAlertInfo
     */
    function getTrafficAlertInfo() {
    	return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
        	return {
        		isTest : isTest,
        		cmd : "data_volume_limit_switch,data_volume_limit_unit,data_volume_limit_size,data_volume_alert_percent",
        		multi_data : 1
            };
        }

        function deal(data) {
            if (data) {
            	var isData = data.data_volume_limit_unit == 'data';
            	var result = {
        			dataLimitChecked : data.data_volume_limit_switch,
        			dataLimitTypeChecked : isData ? '1' : '0',
					limitDataMonth : isData ? data.data_volume_limit_size : '0',
					alertDataReach : isData ? data.data_volume_alert_percent : '0',
					limitTimeMonth : isData ? '0' : data.data_volume_limit_size,
					alertTimeReach : isData ? '0' : data.data_volume_alert_percent

            	};
                return result;
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 设置流量提醒
     * @method setTrafficAlertInfo
     */
    function setTrafficAlertInfo(){
    	return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
        	var isData = params.dataLimitTypeChecked == '1';
        	var requestParams = {
    			isTest : isTest,
    			goformId : "DATA_LIMIT_SETTING",
    			data_volume_limit_switch: params.dataLimitChecked
        	};
        	if(params.dataLimitChecked == '1'){
        		requestParams.data_volume_limit_unit = isData ? 'data' : 'time';
				requestParams.data_volume_limit_size = isData ? params.limitDataMonth : params.limitTimeMonth;
				requestParams.data_volume_alert_percent = isData ? params.alertDataReach : params.alertTimeReach;
        	}
        	return requestParams;
        }

        function deal(data) {
            if (data) {
                return data;
            } else {
                return unknownErrorObject;
            }
        }
    }

	/**
	 * 发送USSD命令，获取响应
	 * @method getUSSDResponse
	 */
	function getUSSDResponse(){
		var callback = arguments[1];
		var argument =[];
        argument.push(arguments[0]) ;
		
		return doStuff(argument, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
			if(params.sendOrReply=="send"){
				return {
					goformId : "/goform/setUSSDSend",
					formdata:{ussd_content:params.strUSSDCommand,ussd_type:1},
					notCallback : true
				};
			}else if(params.sendOrReply=="reply"){
				return {
					goformId : "/goform/setUSSDSend",
					formdata:{ussd_content:params.strUSSDCommand,ussd_type:2},
					notCallback : true
				};
			}
        }

        function deal(data) {
        	if (data&&data.error == API_RESULT_SUCCESS) {
				callbackTemp=callback;
        		getResponse();
			} else {
				callback(false, "ussd_fail");
			}
        }

	}

	/**
	 * 获取响应
	 * @method getResponse
	 */
	function getResponse(){
		$.ajax({
			url : "/goform/getUSSDSendResult",
			data: {},
			cache: false,
			async: false,
			dataType: "json",
			success: function(result){
				
				var info = getStatusInfo();
				
				if((info.networkType == "no_service" )|| (info.networkType =="limited_service")){
					callbackTemp(false, "ussd_no_service");
				}else if (result.send_state == USSD_SEND_RESULT_SENDING) {
					setTimeout(getResponse, 1000);
				}else if(result.send_state == USSD_SEND_RESULT_COMPLETED){
					ussdType = result.ussd_type;
					var content ={};
							
					switch (ussdType){
						case USSD_RESULT_DONE:{
							if (result.ussd_content_len == API_RESULT_SUCCESS)
							{
								content.data = "";
								content.ussd_action = 0;
	                            callbackTemp(true, content);
			
							} else
							{
								content.data = result.ussd_content.replace(/\\n/g,"<br>");
								content.ussd_action = 1;
	                            callbackTemp(true, content);
							}
						}
						break;
					case USSD_RESULT_MORE:{
								content.data = result.ussd_content.replace(/\\n/g,"<br>");
								content.ussd_action = 1;
	                            callbackTemp(true, content);					
					    }
						break;
					case USSD_RESULT_ABORT:
					case USSD_RESULT_OTHER:
					case USSD_RESULT_NOSUP:
						callbackTemp(false, "ussd_unsupport");
						break;
					case USSD_RESULT_TIMEOUT:
						callbackTemp(false, "ussd_timeout");
						break;
				   default:
					    callbackTemp(false, "ussd_info_error");
						break;
				 }
				}else{
					callbackTemp(false, "ussd_fail");
				}							
			},
			error: function(){
				callbackTemp(false, "ussd_fail");
			}
		});
	}

	/**
	 * 发送USSD取消命令
	 * @method USSDReplyCancel
	 */
	function USSDReplyCancel(callback){
		$.ajax({
			url : "/goform/setUSSDEnd",
			data: {},
			cache: false,
			dataType: "json",
			success : function(data) {
				if (data.error == API_RESULT_SUCCESS) {
					callback(true);
				}else{
					callback(false);
				}
			}
		});

		/*function getCancelResponse(){
			$.ajax({
				url : "/goform/goform_get_cmd_process",
				data: {cmd : "ussd_write_flag"},
				cache: false,
				async: false,
				dataType: "json",
				success: function(result){
					if (result.ussd_write_flag == "15") {
						setTimeout(getCancelResponse, 1000);
					} else if (result.ussd_write_flag == "13") {
						callback(true);
					} else{
						callback(false);
					}
				},
				error: function(){
					callback(false);
				}
			});
		}*/
	}
    /**
     *获取STK信息
     * @method getSTKFlagInfo
     */
    function getSTKFlagInfo() {
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.isTest = isTest;
            requestParams.cmd = "stk_write_flag";
            return requestParams;
        }

        function deal(data) {
            if (data) {
                var result = {};
                result.stk_write_flag = data.stk_write_flag;
                return result;
            } else {
                return unknownErrorObject;
            }
        }
    }
	
    /**
     *获取STK信息
     * @method getSTKInfo
     */
    function getSTKInfo() {
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.isTest = isTest;
            requestParams.cmd = "stk";
            return requestParams;
        }

        function deal(data) {
            if (data) {
                var result = {};
                result.stk = data.stk;
                return result;
            } else {
                return unknownErrorObject;
            }
        }
    }	
	
    /**
     *获取STKmenu信息
     * @method getSTKMenuInfo
     */
    function getSTKMenuInfo() {
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.isTest = isTest;
            requestParams.cmd = "stk_menu";
            return requestParams;
        }

        function deal(data) {
            if (data) {
                var result = {};
                result.stk_menu = data.stk_menu;
                return result;
            } else {
                return unknownErrorObject;
            }
        }
    }	
	
    /**
     *设置stk信息
     * @method setSTKMenuInfo
     */
    function setSTKMenuInfo() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "STK_PROCESS";
            requestParams.isTest = isTest;
            requestParams.operator = params.operator;
			requestParams.item_no = params.item_no;
			requestParams.stk_content = params.stk_content;
			requestParams.stk_encode_type = params.stk_encode_type;			
            return requestParams;
        }

        function deal(data) {
            if (data) {
                return data;
            } else {
                return unknownErrorObject;
            }
        }
    }  
	
    /**
     * 网络解锁
     * @method unlockNetwork
     */
    function unlockNetwork(){
        var callback = arguments[1];
        //var checkPoint = 0;        
        var argument =[];
		argument.push(arguments[0]) 
    	return doStuff(argument, {}, prepare, deal, null, true);
		
        function prepare(params) {
            return {
                goformId:"/goform/unlockSIMLock",
				formdata:{sim_lock_state:simlockState,sim_lock_code:params.unlock_network_code}			
            };
        }

        function deal(data) {
            if (data  && data.error == API_RESULT_SUCCESS) {
              //  addCallback(checkUnlockNetworkStatus);
			  callback({result: "success"});
            } else {
                callback({result: 'fail'});
            }
        }

        /*function checkUnlockNetworkStatus() {
            if (checkPoint > 5) {
                removeCallback(checkUnlockNetworkStatus);
                callback({result: 'fail'});
            } else if (timerInfo.simStatus != 'modem_imsi_waitnck') {
                removeCallback(checkUnlockNetworkStatus);
                callback({result: 'success'});
            }
            checkPoint++;
        }*/
    }

    /**
     * 获取解锁次数
     * @method getNetworkUnlockTimes
     */
	 var simlockState = 0;  //globel to keep simlock current status
    function getNetworkUnlockTimes() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            return {
                goformId:"/goform/getSimcardInfo",
                formdata:{}
            };
        }

        function deal(data) {
			var info = getDeviceInfo();
			
            if (data) {
				var sim_time;
				if(data.sim_state == MACRO_UIM_APP_STATE_PERSON_CHECK_REQ_V01){
					sim_time = data.sim_lock_remain_time;
				}else{
					sim_time = 0;
				}				
				simlockState = data.sim_lock_state
				
                return {unlock_nck_time:sim_time,imei:info.imei};
            } else {
                return unknownErrorObject;
            }
        }
    }

	/**
     * 设置升级提醒信息
     * @method setUpdateInfoWarning
     */
	function setUpdateInfoWarning(){
		var callback = arguments[1];
        var argument =[];
		argument.push(arguments[0]) 
    	return doStuff(argument, {}, prepare, deal, null, true);

        function prepare(params) {
            return {
                isTest : isTest,
				goformId : "SET_UPGRADE_NOTICE",
                upgrade_notice_flag : params.upgrade_notice_flag,
				notCallback : true
            };
        }

        function deal(data) {
            if (data.result=="success") {
                callback(true);
            } else {
                callback(false);
            }
        }
	}

	/**
     * 获取升级提醒信息
     * @method getUpdateInfoWarning
     */
	function getUpdateInfoWarning(){
		return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            return {
                isTest:isTest,
                cmd:"upgrade_notice_flag"
            };
        }

        function deal(data) {
            if (data) {
                return data;
            } else {
                return unknownErrorObject;
            }
        }
	}

    /**
     * 获取AP Station基本设置
     * @method getAPStationBasic
     */
    function getAPStationBasic() {
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            return {
                isTest:isTest,
                multi_data:1,
                cmd:"wifi_sta_connection,ap_station_mode"
            };
        }

        function deal(data) {
            if (data) {
                return {
                    ap_station_enable:data.wifi_sta_connection,
                    ap_station_mode:data.ap_station_mode
                }
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 获取AP Station基本设置
     * @method setAPStationBasic
     */
    function setAPStationBasic() {
        var parameters = arguments[0];
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params) {
            return {
                isTest:isTest,
                goformId:"WIFI_STA_CONTROL",
                wifi_sta_connection:params.ap_station_enable,
                ap_station_mode:params.ap_station_mode
            };
        }

        function deal(data) {
            if (data && data.result == "success") {
                timerInfo.ap_station_enable = parameters.ap_station_enable == 1;
                return data;
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 刷新AP Station使能状态到缓存
     * @method refreshAPStationStatus
     * @returns {getAPStationBasic|*}
     */
    function refreshAPStationStatus() {
        return getAPStationBasic({}, function(data){
            timerInfo.ap_station_enable = data.ap_station_enable == 1;
        });
    }

    /**
     * 获取预置和保存的热点列表
     * @method getHotspotList
     */
    function getHotspotList() {
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            return {
                isTest:isTest,
                multi_data:1,
                cmd:"wifi_profile,wifi_profile1,wifi_profile2,wifi_profile3,wifi_profile4,wifi_profile5,wifi_profile_num"
            };
        }

        function deal(data) {
            if (data) {
                var wifiList = [];
                for (var i = 0; i <= 5; i++) {
                    var wifiStr = "";
                    if (i == 0) {
                        wifiStr = data.wifi_profile;
                    } else {
                        wifiStr = data["wifi_profile" + i];
                    }
                    var wifiArray = wifiStr.split(";");
                    for (var j = 0; j < wifiArray.length; j++) {
                        var item = wifiArray[j].split(",");
                        if (!item[0]) {
                            break;
                        }
                        var wifiJson = {
                            profileName:item[0],
                            fromProvider:item[1],
                            connectStatus:item[2],
                            signal:item[3],
                            ssid:item[4],
                            authMode:item[5],
                            encryptType:item[6],
                            password:item[7]=="0"?"":item[7],
                            keyID:item[8]
                        }
                        wifiList.push(wifiJson);
                    }
                }

                return { hotspotList:wifiList };

            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 搜索热点
     * @method searchHotspot
     */
    function searchHotspot() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params) {
            return {
                isTest:isTest,
                goformId:"WLAN_SET_STA_REFRESH"
            };
        }

        function deal(data) {
            if (data) {
                return data;
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 获取搜寻到的热点列表
     * @method getSearchHotspotList
     */
    function getSearchHotspotList() {
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            return {
                isTest:isTest,
                multi_data:1,
                cmd:"scan_finish,EX_APLIST,EX_APLIST1"
            }
        }

        function deal(data) {
            if (data) {
                if (data.scan_finish == "0") {
                    return { scan_finish:false, hotspotList:[] };
                }
                var wifiList = [];
                for (var i = 0; i <= 1; i++) {
                    var wifiStr;
                    if (i == 0) {
                        wifiStr = data.EX_APLIST;
                    } else {
                        wifiStr = data.EX_APLIST1;
                    }
                    var wifiArray = wifiStr.split(";");
                    for (var j = 0; j < wifiArray.length; j++) {
                        var item = wifiArray[j].split(",");
                        if (!item[0]) {
                            break;
                        }
                        var wifiJson = {
                            fromProvider:item[0],
                            connectStatus:item[1],
                            ssid:item[2],
                            signal:item[3],
                            channel:item[4],
                            authMode:item[5],
                            encryptType:item[6]
                        }
                        wifiList.push(wifiJson);
                    }
                }

                return {"scan_finish":"1","EX_APLIST":"0,0,fdsfdsfs,4,5,OPEN,NONE;0,1,hui_ui,3,5,WPAPSKWPA2PSK,CCMP;0,0,tct-test,3,5,WPAPSKWPA2PSK,TKIPCCMP;0,0,TCL-TCT,3,5,WPAPSKWPA2PSK,TKIPCCMP;0,0,TCL-mobile-test,3,5,WPAPSKWPA2PSK,TKIPCCMP;0,0,TCL Communication,3,5,WPAPSKWPA2PSK,TKIPCCMP;0,0,TCL Communication-O,3,5,OPEN,NONE;0,0,TCL_guest,3,5,WPAPSKWPA2PSK,TKIPCCMP;0,0,TCL-EXCOM,3,5,WPAPSKWPA2PSK,TKIPCCMP;0,0,tcl-gmpc,3,5,WPAPSKWPA2PSK,TKIPCCMP;0,0,Xiaomi_A5F3,3,5,WPAPSKWPA2PSK,CCMP;0,0,sasd,3,5,WPAPSKWPA2PSK,TKIPCCMP;0,0,tct-test,3,5,WPAPSKWPA2PSK,TKIPCCMP;","EX_APLIST1":""}//{scan_finish:true, hotspotList:wifiList };

            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 将热点信息组成字符串
     * @method creatHotspotString
     */
    function creatHotspotString(hotspot) {
        var item = [];
        item.push(hotspot.profileName);
        item.push(hotspot.fromProvider || "0");
        item.push(hotspot.connectStatus || "0");
        item.push(hotspot.signal);
        item.push(hotspot.ssid);
        item.push(hotspot.authMode);
        item.push(hotspot.encryptType);
        item.push(hotspot.password || "0");
        item.push(hotspot.keyID);
        return item.join(",");
    }

    /**
     * 保存热点
     * @method saveHotspot
     */
    function saveHotspot() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params) {
            var apList = params.apList;
            var action = "modify";
            if (params.profileName == "") {
                action = "add";
                var newName = ( jQuery.fn.jquery + Math.random() ).replace(/\D/g, "");
                params.profileName = newName;
                apList.push({
                    profileName:newName,
                    fromProvider:"0",
                    connectStatus:"0",
                    signal:params.signal,
                    ssid:params.ssid,
                    authMode:params.authMode,
                    encryptType:params.encryptType,
                    password:params.password || "0",
                    keyID:params.keyID
                });
            }

            var wifi = {"profile0":[], "profile1":[], "profile2":[], "profile3":[], "profile4":[], "profile5":[]};
            var activeHotspotStr = "";
            for (var i = 0; i < apList.length; i++) {
                var hotspotStr = "";
                if (params.profileName == apList[i].profileName) {
                    hotspotStr = creatHotspotString(params);
                    activeHotspotStr = hotspotStr;
                } else {
                    hotspotStr = creatHotspotString(apList[i]);
                }
                var index = parseInt(i / 5);
                wifi["profile" + index].push(hotspotStr);
            }

            return {
                isTest:isTest,
                goformId:"WIFI_SPOT_PROFILE_UPDATE",
                wifi_profile:wifi.profile0.join(";"),
                wifi_profile1:wifi.profile1.join(";"),
                wifi_profile2:wifi.profile2.join(";"),
                wifi_profile3:wifi.profile3.join(";"),
                wifi_profile4:wifi.profile4.join(";"),
                wifi_profile5:wifi.profile5.join(";"),
                wifi_profile_num:apList.length,
                wifi_update_profile:activeHotspotStr,
                action:action
            };
        }

        function deal(data) {
            if (data) {
                return data;
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 删除热点
     * @method deleteHotspot
     */
    function deleteHotspot() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params) {
            var apList = params.apList;
            var wifi = {"profile0":[], "profile1":[], "profile2":[], "profile3":[], "profile4":[], "profile5":[]};
            var foundDelete = false;
            var activeHotspotStr = "";
            for (var i = 0; i < apList.length; i++) {
                var hotspotStr = creatHotspotString(apList[i]);
                if (apList[i].profileName == params.profileName) {
                    foundDelete = true;
                    activeHotspotStr = hotspotStr;
                    continue;
                }
                var idIndex = i;
                if (foundDelete) {
                    idIndex = i - 1;
                }
                var index = parseInt(idIndex / 5);
                wifi["profile" + index].push(hotspotStr);
            }
            var num = foundDelete ? apList.length - 1 : apList.length;

            return {
                isTest:isTest,
                goformId:"WIFI_SPOT_PROFILE_UPDATE",
                wifi_profile:wifi.profile0.join(";"),
                wifi_profile1:wifi.profile1.join(";"),
                wifi_profile2:wifi.profile2.join(";"),
                wifi_profile3:wifi.profile3.join(";"),
                wifi_profile4:wifi.profile4.join(";"),
                wifi_profile5:wifi.profile5.join(";"),
                wifi_profile_num:num,
                wifi_update_profile:activeHotspotStr,
                action:"delete"
            };
        }

        function deal(data) {
            if (data) {
                return data;
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 链接热点
     * @method connectHotspot
     */
    function connectHotspot() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params) {
            return {
                isTest:isTest,
                goformId:"WLAN_SET_STA_CON",
                EX_SSID1:params.EX_SSID1,
                EX_AuthMode:params.EX_AuthMode,
                EX_EncrypType:params.EX_EncrypType,
                EX_DefaultKeyID:params.EX_DefaultKeyID,
                EX_WEPKEY:params.EX_WEPKEY,
                EX_WPAPSK1:params.EX_WPAPSK1,
                EX_wifi_profile:params.EX_wifi_profile
            };
        }

        function deal(data) {
            if (data && data.result == "success") {
                return data;
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 断开热点
     * @method disconnectHotspot
     */
    function disconnectHotspot() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params) {
            return {
                isTest:isTest,
                goformId:"WLAN_SET_STA_DISCON"
            };
        }

        function deal(data) {
            if (data && data.result == "success") {
                return data;
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 获取快速开机设置
     * @method getFastbootSetting
     */
    function getFastbootSetting() {
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params) {
            return {
                isTest:isTest,
                cmd:"mgmt_quicken_power_on"
            };
        }

        function deal(data) {
            return {fastbootEnabled: data.mgmt_quicken_power_on == '1' ? '1' : '0'};
        }
    }

    /**
     * 设置快速开机信息
     * @method setFastbootSetting
     */
    function setFastbootSetting() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params) {
            return {
                isTest:isTest,
                goformId:"MGMT_CONTROL_POWER_ON_SPEED",
                mgmt_quicken_power_on : params.fastbootEnabled
            };
        }

        function deal(data) {
            if (data && data.result == "success") {
                return data;
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 重启设备
     * @method restart
     */
    function restart() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            /*requestParams.isTest = isTest;
            requestParams.goformId = "REBOOT_DEVICE";*/

            requestParams.goformId = "/goform/setReboot";
            return requestParams;
        }

        function deal(data) {
            /*if (data) {
                return data;
            } else {
                return unknownErrorObject;
            }*/

            var result = {};			
			if (data && (data.error == API_RESULT_SUCCESS)) {
				result.result = "success";
			}else {
                result.result = "fail";
			}
		
		  	return result;
        }
    }
	
	    /**
     * 设置FOTA start 检测新版本信息
     * @method getPackSizeInfo
     * @return {Object} JSON 对象
     */
    function  setFOTACheckNewVersion() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "/goform/setFOTAStartCheckVersion";
			requestParams.formdata = {};
            return requestParams;
        }

        function deal(data) {
            if (data&&data.error == API_RESULT_SUCCESS) {
                return {result:true};
            } else {
                return {result:false};;
            }
        }
    }
	
	/**
     * 获取new version download状态
     * @method getPackSizeInfo
     * @return {Object} JSON 对象
     */
    function  getFOTADownloadState() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "/goform/getFOTADownloadState";
			requestParams.formdata = {};
            return requestParams;
        }

        function deal(data) {
            if (data) {
                return {download_state:data.state};
            } else {
                return unknownErrorObject;
            }
        }
    }
	
    /**
     * 触发下载文件
     * @method getPackSizeInfo
     * @return {Object} JSON 对象
     */
    function  setFOTAStartDownload() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "/goform/setFOTAStartDownload";
			requestParams.formdata = {};
            return requestParams;
        }

        function deal(data) {
            if (data&&data.error == API_RESULT_SUCCESS) {
                return {result:true};
            } else {
                return {result:false};
            }
        }
    }
    
	/**
     * 停止下载文件
     * @method getPackSizeInfo
     * @return {Object} JSON 对象
     */
    function  setFOTACancelDownload() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "/goform/setFOTACancelDownload";
			requestParams.formdata = {};
            return requestParams;
        }

        function deal(data) {
            if (data&&data.error == API_RESULT_SUCCESS) {
                return {result:true};
            } else {
                return {result:false};
            }
        }
    }
	
	/**
     * 获取FOTA操作时的电量
     * @method getPackSizeInfo
     * @return {Object} JSON 对象
     */
    function  getFOTABatteryState() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "/goform/getFOTABatteryState";
			requestParams.formdata = {};
            return requestParams;
        }

        function deal(data) {
            if (data&&data.batt_is_enough == FOTA_BATTERY_STATE_ENOUGH) {
                return true;
            } else {
                return false;
            }
        }
    }
	
	/**
     * 设置开始升级
     * @method getPackSizeInfo
     * @return {Object} JSON 对象
     */
    function  setFOTAStartUpdate() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "/goform/setFOTAStartUpdate";
			requestParams.formdata = {};
            return requestParams;
        }

        function deal(data) {
            if (data&&data.error == API_RESULT_SUCCESS) {
                return {result:true};
            } else {
                return {result:false};
            }
        }
    }
	
     /**
     * 获取OTA新版本信息
     * @method getNewVersionState
     * @return {Object} JSON 对象
     */
    function  getNewVersionState() {
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "/goform/getDeviceNewVersion";
			requestParams.formdata={};
            return requestParams;
        }

        function deal(data) {
            if (data) {
				var result = {};
				var downState = getFOTADownloadState();
				var netState = getConnectionInfo();
				
				if(netState.connectStatus != "ppp_connected"){
					result.hasNewVersion = false;
					result.new_version_state = 'network_unavailable';
					
					 return result;
				}
								
				if(data.is_new_version == VERSION_CHECKING){
					result.hasNewVersion = false;
					result.new_version_state = 'checking';
					
					return result;
				}
				
				if(data.is_new_version == VERSION_NEW_NO){
					result.hasNewVersion = false;
					result.new_version_state = "0";
					
					return result;
				}
				
				if(downState.download_state == FOTA_DOWNLOAD_STATE_DOWNLOADING){
					result.hasNewVersion = false;
					result.new_version_state = 'upgrading';
					
					fotaDownloadStatus = FOTA_DOWNLOAD_STATE_DOWNLOADING;
					
					return result;
				}
				
				if((downState.download_state == FOTA_DOWNLOAD_STATE_FREE)&&(fotaDownloadStatus == FOTA_DOWNLOAD_STATE_DOWNLOADING)){
					result.hasNewVersion = false;
					result.new_version_state = 'download_failed';
					
					fotaDownloadStatus = FOTA_DOWNLOAD_STATE_FREE;
					
					return result;
				}
				
				if(downState.download_state == FOTA_DOWNLOAD_STATE_COMPLETED){
					
					result.hasNewVersion = false;
					result.new_version_state = 'upgrade_prepare_install';
					
					return result;					
				}
				
				if((data.is_new_version == VERSION_NEW_YES)&&(downState.download_state == FOTA_DOWNLOAD_STATE_FREE)){
					result.hasNewVersion = true;
					result.new_version_state = "1";
					
					return result;
				}
				
				if((data.is_new_version != VERSION_NEW_YES)&&(data.is_new_version != VERSION_NEW_NO)){
					result.hasNewVersion = false;
					result.new_version_state = 'connect_server_failed';
					
					return result;					
				}
				
            } else {
                return unknownErrorObject;
            }
        }
    }


    /**
     * 获取OTA新版本信息
     * @method getPackSizeInfo
     * @return {Object} JSON 对象
     */
    function  getNewVersionInfo() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "/goform/getFOTAServerVersion";
			requestParams.formdata = {};
            return requestParams;
        }

        function deal(data) {
            if (data) {
                return {version:data.server_version};
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 获取OTA强制升级状态
     * @method getMandatory
     * @return {Object} JSON 对象
     */
    function  getMandatory() {
        return {"is_mandatory": false}
	 /* return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.isTest = isTest;
            if (config.UPGRADE_TYPE == "OTA") {
                requestParams.cmd = "is_mandatory";
            } else {
                requestParams.cmd = "new_version_state";
            }
            return requestParams;
        }

        function deal(data) {
            if (data) {
                if (config.UPGRADE_TYPE == "OTA") {
                    return {"is_mandatory": data.is_mandatory == "1"};
                } else {
                    return {"is_mandatory": data.new_version_state == "version_has_new_critical_software"};
                }
            } else {
                return unknownErrorObject;
            }
        }*/
    }

    /**
     * 获取OTA升级结果
     * @method getUpgradeResult
     * @return {Object} JSON 对象
     */
    function  getUpgradeResult() {
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.isTest = isTest;
            requestParams.cmd = "upgrade_result";
            return requestParams;
        }

        function deal(data) {
            if (data) {
                return data;
            } else {
                return unknownErrorObject;
            }
        }
    }
        /**
     * 获取OTA升级状态
     * @method getCurrentUpgradeState
     * @return {Object} JSON 对象
     */
    function  getCurrentUpgradeState() {
       /* return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.isTest = isTest;
            requestParams.cmd = "current_upgrade_state";
            return requestParams;
        }

        function deal(data) {
            if (data) {
                return data;
            } else {
                return unknownErrorObject;
            }
        }*/
		var data = getNewVersionState();		
		
		return {current_upgrade_state:data.new_version_state};
    }

    /**
     * 获取OTA下载状态
     * @method getPackSizeInfo
     * @return {Object} JSON 对象
     */
    function  getPackSizeInfo() { 
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "/goform/getFOTADownloadInfo";
			requestParams.formdata = {};
            return requestParams;
        }

        function deal(data) {
            if (data) {
                return data;
            } else {
                return unknownErrorObject;
            }
        }
    }

    /**
     * 获取OTA选择状态
     * @method getUserChoice
     * @return {Object} JSON 对象
     */
    function  getUserChoice() {
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.isTest = isTest;
            requestParams.cmd = "if_has_select";
            return requestParams;
        }

        function deal(data) {
            if (data) {
                return data;
            } else {
                return unknownErrorObject;
            }
        }
    }



    /**
     *用户选择是否进行升级和升级中取消
     * @method setUpgradeSelectOp
     
    function setUpgradeSelectOp() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "IF_UPGRADE";
            requestParams.isTest = isTest;
            requestParams.select_op = params.selectOp;
            return requestParams;
        }

        function deal(data) {
            if (data) {
                return data;
            } else {
                return unknownErrorObject;
            }
        }
    }*/
	
    function getOTAUpdateSetting() {
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.goformId = "/goform/getUpdateSettings";
			requestParams.formdata = {};
            return requestParams;
        }

        function deal(data) {
            if (data) {
				var checkTime;
				if(data.auto_check_cycle == FOTA_AUTO_UPDATE_THIRTYDAY){
					checkTime = 30;
				}else if(data.auto_check_cycle == FOTA_AUTO_UPDATE_SEVENDAY){
					checkTime = 7;
				}else if(data.auto_check_cycle == FOTA_AUTO_UPDATE_FIFTEENDAY){
					checkTime = 15;
				}else{
					checkTime = 0;
				}
                return {
                    "updateMode": data.auto_check_flag,
                    "updateIntervalDay": checkTime,
                    "allowRoamingUpdate": data.check_condtion
                };
            } else {
                return unknownErrorObject;
            }
        }
    }

    function setOTAUpdateSetting() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
			var checkTime;
			
			if(params.updateIntervalDay == 30){
				checkTime = FOTA_AUTO_UPDATE_THIRTYDAY;
			}else if(params.updateIntervalDay == 7){
				checkTime = FOTA_AUTO_UPDATE_SEVENDAY;
			}else if(params.updateIntervalDay == 15){
				checkTime = FOTA_AUTO_UPDATE_FIFTEENDAY;
			}else{
				checkTime = 0;
			}
			
            requestParams.goformId = "/goform/setUpdateSettings";
			requestParams.formdata= {auto_check_flag:params.updateMode,auto_check_cycle:checkTime,check_condtion:params.allowRoamingUpdate};

            return requestParams;
        }

        function deal(data) {
            if (data && data.error == API_RESULT_SUCCESS) {
                return {result:"success"};
            } else {
                return unknownErrorObject;
            }
        }
    }

    function clearUpdateResult(){
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.isTest = isTest;
            requestParams.goformId = "RESULT_RESTORE";
            return requestParams;
        }

        function deal(data) {
            if (data && data.result == "success") {
                return data;
            } else {
                return unknownErrorObject;
            }
        }
    }

    function getIMSIAndIMSIList() {
        return doStuff(arguments, {}, prepare, deal, null, false);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.isTest = isTest;
            requestParams.multi_data = 1;
            requestParams.cmd = "sim_imsi,sim_imsi_lists";
            return requestParams;
        }

        function deal(data) {
            if(data){
                return data;
            }
        }
    }
    function setIMSIToList(){
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.isTest = isTest;
            requestParams.goformId = "SAVE_SIM_IMSI_TO_LISTS";
            return requestParams;
        }

        function deal(data) {
            if (data && data.result == "success") {
                return data;
            } else {
                return unknownErrorObject;
            }
        }
    }
	
	function getIMSICheckFlag() {
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.formdata = {};
            requestParams.goformId = "/goform/getSIMChangeFlag";
            return requestParams;
        }

        function deal(data) {
           if(data && data.error == API_RESULT_SUCCESS){
	    		if(data.is_sim_change == USSD_NO_ACTIVE_SIMCARD){
                	return {result: true};
				}
				else{
					return {result: false};
				}
            }
        }
    }
    function setIMSICheckFlag(){
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.isTest = isTest;
            requestParams.goformId = "/goform/setActiveSIM";
            return requestParams;
        }

        function deal(data) {
            if (data && data.error == API_RESULT_SUCCESS) {
                return {result:"success"};
            } else {
               return {result:"failed"};
            }

        }
    }
	
	function setConnectCancel(){
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.formdata = {};
            requestParams.goformId = "/goform/setWanConnectCancel";
            return requestParams;
        }

        function deal(data) {
            if (data && data.error == API_RESULT_SUCCESS) {
                return {result:"success"};
            } else {
               return {result:"failed"};
            }

        }
	}
	
	function getOledSettings(){
    	return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
        	var requestParams = {};
        	requestParams.goformId = "/goform/getOledSettings";
			requestParams.formdata = {};
        	return requestParams;
        }
        
        function deal(data) {        	
			if (data) {
        		var result = {};
        		result.OledOuttimes = data.oled_out_times;
                result.isCharingOn = data.charging_is_on;
        		return result;
        	} else {
        		return unknownErrorObject;
        	}
        }
    }
	
	function setOledSettings(){
			
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.formdata = {"oled_out_times":params.OledOuttimes,"charging_is_on":params.isCharingOn};
            requestParams.goformId = "/goform/setOledSettings";
			
            return requestParams;
        }

        function deal(data) {
            if (data && data.error == API_RESULT_SUCCESS) {
                return {result:"success"};
            } else {
               return {result:"failed"};
            }

        }
	}

	function getLedSettings(){
    	return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
        	var requestParams = {};
        	requestParams.goformId = "/goform/getLEDSettings";
			requestParams.formdata = {};
        	return requestParams;
        }
        
        function deal(data) {    	
			if (data) {
        		var result = {};
        		result.showType = data.showType;
        		return result;
        	} else {
        		return unknownErrorObject;
        	}
        }
    }
	
	function setLedSettings(){
			
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
            requestParams.formdata = {"showType":params.showType};
            requestParams.goformId = "/goform/setLEDSettings";
            return requestParams;
        }

        function deal(data) {
            if (data && data.error == API_RESULT_SUCCESS) {
                return {result:"success"};
            } else {
               return {result:"failed"};
            }

        }
	}
	
	function getMacFilterSettings(){
    	return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
        	var requestParams = {};
        	requestParams.goformId = "/goform/getMACFilterInfo";
			requestParams.formdata = {};
        	return requestParams;
        }
        
        function deal(data) {        	
        	if (data) {
				
        	/*data = {"filter_policy":1,"MacAllowList":["42:23:8E:E9:67:54","42:23:8E:E9:67:56","","","","","","","",""],"MacDenyList":["","","","","","","","","",""],"error":0};*/
				
        		var result = {};
        		var allow_list = [];
        		var deny_list = [];
        						
        		result.filter_policy = data.filter_policy
				
        		for(var i = 0; i< 10; i++){
	        		if(data.MacAllowList[i] == "NA"){
	        			allow_list[i] = "";
	        		}else{
	        			allow_list[i] = data.MacAllowList[i];
	        		}
        		}

        		for(var i = 0; i< 10; i++){
	        		if(data.MacDenyList[i] == "NA"){
	        			deny_list[i] = "";
	        		}else{
	        			deny_list[i] = data.MacDenyList[i];
	        		}
        		}
		       	result.allow_addr0 = allow_list[0];	
        		result.allow_addr1 = allow_list[1];
        		result.allow_addr2 = allow_list[2];
        		result.allow_addr3 = allow_list[3];
        		result.allow_addr4 = allow_list[4];
        		result.allow_addr5 = allow_list[5];
        		result.allow_addr6 = allow_list[6];
        		result.allow_addr7 = allow_list[7];
        		result.allow_addr8 = allow_list[8];
        		result.allow_addr9 = allow_list[9];
					
        		result.deny_addr0 = deny_list[0];
        		result.deny_addr1 = deny_list[1];
        		result.deny_addr2 = deny_list[2];
        		result.deny_addr3 = deny_list[3];
        		result.deny_addr4 = deny_list[4];
        		result.deny_addr5 = deny_list[5];
        		result.deny_addr6 = deny_list[6];
        		result.deny_addr7 = deny_list[7];
        		result.deny_addr8 = deny_list[8];
        		result.deny_addr9 = deny_list[9];
				
        		return result;
        	} else {
        		return unknownErrorObject;
        	}
        }
    }
	
	function setMacFilterSettings(){
        return doStuff(arguments, {}, prepare, deal, null, true);

        function prepare(params, isPost) {
            var requestParams = {};
						
            requestParams.formdata = {	"filter_policy":params.filter_policy,
					"allow_addr0":params.allow_mac0,
					"allow_addr1":params.allow_mac1,
					"allow_addr2":params.allow_mac2,
					"allow_addr3":params.allow_mac3,
					"allow_addr4":params.allow_mac4,
					"allow_addr5":params.allow_mac5,
					"allow_addr6":params.allow_mac6,
					"allow_addr7":params.allow_mac7,
					"allow_addr8":params.allow_mac8,
					"allow_addr9":params.allow_mac9,				
					"deny_addr0":params.deny_mac0,
					"deny_addr1":params.deny_mac1,
					"deny_addr2":params.deny_mac2,
					"deny_addr3":params.deny_mac3,
					"deny_addr4":params.deny_mac4,
					"deny_addr5":params.deny_mac5,
					"deny_addr6":params.deny_mac6,
					"deny_addr7":params.deny_mac7,
					"deny_addr8":params.deny_mac8,
					"deny_addr9":params.deny_mac9
					};
            requestParams.goformId = "/goform/setMACFilterInfo";
			
            return requestParams;
        }

        function deal(data) {
            if (data && data.error == API_RESULT_SUCCESS) {
                return {result:"success"};
            } else {
               return {result:"failed"};
            }

        }
    }
	
    function heartBeatCheck(){
        $.ajax({
                type: "GET",
                url: "/heartBeat.asp?rand=" + Math.random()  
        });
    }

    return {
        getWifiBasic : getWifiBasic,//Test Done
        setWifiBasic : setWifiBasic,//Test Done
        setWifiSwitch:setWifiSwitch,//Test Done
        getSecurityInfo : getSecurityInfo,//Test Done
        setSecurityInfo : setSecurityInfo,//Test Done
        getCurrentlyAttachedDevicesInfo : getCurrentlyAttachedDevicesInfo,//Test Done
        getLanguage : getLanguage,//Test Done
        setLanguage : setLanguage,//Test Done
        getNetSelectInfo : getNetSelectInfo,//Test Done
        setBearerPreference : setBearerPreference,//Test Done
        scanForNetwork : scanForNetwork,//No Test
        getConnectionInfo : getConnectionInfo,//Test Done
        getStatusInfo : getStatusInfo,//Test Done
        connect : connect,//No Test
        disconnect : disconnect,//No Test
        setNetwork : setNetwork,//Test Done
        getCurrentNetwork : getCurrentNetwork,//Test Done
        savePhoneBook : savePhoneBook,//Test Done
        deletePhoneBooks :deletePhoneBooks,//Test Done
        deleteAllPhoneBooks:deleteAllPhoneBooks, //Test Done
        deleteAllPhoneBooksByGroup:deleteAllPhoneBooksByGroup,//Test Done
        getDevicePhoneBooks : getDevicePhoneBooks,//Test Done
        getSIMPhoneBooks : getSIMPhoneBooks,//Test Done
        getPhoneBooks : getPhoneBooks,//Test Done
        getPhoneBookReady: getPhoneBookReady,//Test Done
        getPhoneBooksByGroup: getPhoneBooksByGroup,//Test Done
        getConnectionMode: getConnectionMode,//Test Done
        setConnectionMode: setConnectionMode,//Test Done
        getApnSettings : getApnSettings,//Test Done
        getApnSettingsList : getApnSettingsList,
        getCurrentProfile : getCurrentProfile,
        deleteApn : deleteApn,//Test Done
        setDefaultApn : setDefaultApn,//Test Done
        addOrEditApn : addOrEditApn,//Test Done
        getSIMPhoneBookCapacity : getSIMPhoneBookCapacity,//Test Done
        getDevicePhoneBookCapacity : getDevicePhoneBookCapacity,//Test Done
        getLoginData:getLoginData,//Test Done
        login:login,//Test Done
        logout:logout,//Test Done
        getLoginStatus:getLoginStatus,//Test Done
        enterPIN:enterPIN,//Test Done
        enterPUK:enterPUK,//Test Done
        getSMSReady:getSMSReady,//Test Done
        getNewSMS: getNewSMS,
        getSMSMessages : getSMSMessages,//Test Done
        sendSMS : sendSMS,//Test Done
        saveSMS : saveSMS,//Test Done
        deleteMessage : deleteMessage,//Test Done
        setSmsRead : setSmsRead,//Test Done
        resetNewSmsReceivedVar : resetNewSmsReceivedVar,
        resetSmsReportReceivedVar : resetSmsReportReceivedVar,
        getSMSDeliveryReport : getSMSDeliveryReport,
        deleteSMSReport : deleteSMSReport,
        getSmsCapability : getSmsCapability,//Test Done
        changePassword : changePassword,//Test Done
        getPinData : getPinData,//Test Done
        enablePin : enablePin,//Test Done
        disablePin : disablePin,//Test Done
        changePin : changePin,//Test Done
        getLanInfo: getLanInfo,//Test Done
        setLanInfo: setLanInfo,//Test Done
        getSmsSetting: getSmsSetting,//Test Done
        setSmsSetting: setSmsSetting,//Test Done
        restoreFactorySettings : restoreFactorySettings,//Test Done
        checkRestoreStatus : checkRestoreStatus,//Test Done
        getWpsInfo: getWpsInfo,//Test Done
        openWps: openWps,//Test Done
        getSleepMode: getSleepMode,//Test Done
        setSleepMode: setSleepMode,//Test Done
        getSysSecurity: getSysSecurity,//Test Done
        setSysSecurity: setSysSecurity,//Test Done
        getPortForward: getPortForward,//Test Done
        setPortForward: setPortForward,//Test Done
        deleteForwardRules: deleteForwardRules,//Test Done
        enableVirtualServer: enableVirtualServer,//Test Done         
        getQuickSettingInfo:getQuickSettingInfo,//Test Done
        setQuickSetting:setQuickSetting,//Test Done
        setQuickSetting4IPv6:setQuickSetting4IPv6, //Test Done
        getPortFilter: getPortFilter,//Test Done
        setPortFilterBasic: setPortFilterBasic,//Test Done,
        editIPFilter:editIPFilter,
        addIPFilter:addIPFilter,
        deleteFilterRules: deleteFilterRules,//Test Done       
        getWifiRange: getWifiRange,//Test Done
        setWifiRange: setWifiRange,//Test Done
        getUpnpSetting: getUpnpSetting,//Test Done
        setUpnpSetting: setUpnpSetting,//Test Done
        getDmzSetting: getDmzSetting,//Test Done
        setDmzSetting: setDmzSetting,//Test Done
        getDeviceInfo: getDeviceInfo, //Test Done
        getPortMap: getPortMap,//Test Done
        setPortMap: setPortMap,//Test Done
        enablePortMap: enablePortMap,//Test Done
        deleteMapRules: deleteMapRules, //Test Done
        getTrafficAlertInfo : getTrafficAlertInfo,//Test Done
        setTrafficAlertInfo : setTrafficAlertInfo,//Test Done        
        getUSSDResponse : getUSSDResponse,//No Test
        USSDReplyCancel : USSDReplyCancel,//No Test
        getNetworkUnlockTimes:getNetworkUnlockTimes,//No Test
        unlockNetwork : unlockNetwork,//No Test
        setUpdateInfoWarning : setUpdateInfoWarning,//No Test
        getUpdateInfoWarning : getUpdateInfoWarning,//No Test
        getAPStationBasic:getAPStationBasic,//Test Done
        setAPStationBasic:setAPStationBasic,//Test Done
        refreshAPStationStatus: refreshAPStationStatus,
        getHotspotList:getHotspotList,//Test Done
        searchHotspot:searchHotspot,//No Test
        getSearchHotspotList:getSearchHotspotList,//Test Done
        saveHotspot:saveHotspot,
        deleteHotspot:deleteHotspot,
        connectHotspot:connectHotspot,
        disconnectHotspot:disconnectHotspot,
        getFastbootSetting: getFastbootSetting,//Test Done
        setFastbootSetting: setFastbootSetting, //Test Done
        restart: restart,
        clearTrafficData: clearTrafficData,
        getSTKFlagInfo: getSTKFlagInfo,
        getSTKMenuInfo: getSTKMenuInfo,
        setSTKMenuInfo: setSTKMenuInfo,
        getSTKInfo: getSTKInfo,
        getNewVersionState:getNewVersionState,
        getUpgradeResult:getUpgradeResult,
        getCurrentUpgradeState:getCurrentUpgradeState,
       // setUpgradeSelectOp:setUpgradeSelectOp,
        addTimerThings:addTimerThings,
        removeTimerThings:removeTimerThings,
        getPackSizeInfo:getPackSizeInfo,
        getNewVersionInfo:getNewVersionInfo,
        getMandatory:getMandatory,
        getUserChoice:getUserChoice,
        getOTAUpdateSetting:getOTAUpdateSetting,
        setOTAUpdateSetting:setOTAUpdateSetting,
        clearUpdateResult:clearUpdateResult,
        getIMSIAndIMSIList:getIMSIAndIMSIList,
        setIMSIToList:setIMSIToList,
        heartBeatCheck:heartBeatCheck,
        setFOTAStartUpdate:setFOTAStartUpdate,
        setFOTAStartDownload:setFOTAStartDownload,
        setFOTACancelDownload:setFOTACancelDownload,
        getFOTABatteryState:getFOTABatteryState,
        setFOTACheckNewVersion:setFOTACheckNewVersion,
        getIMSICheckFlag:getIMSICheckFlag,
        setIMSICheckFlag:setIMSICheckFlag,
        setConnectCancel:setConnectCancel,
        getOledSettings:getOledSettings,
        setOledSettings:setOledSettings,
        getLedSettings:getLedSettings,
        setLedSettings:setLedSettings,
        getMacFilterSettings:getMacFilterSettings,
        setMacFilterSettings:setMacFilterSettings
		
    };
});
