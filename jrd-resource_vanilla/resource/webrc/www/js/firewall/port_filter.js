/**
 * @module prot_filter
 * @class prot_filter
 */
define([ 'jquery', 'knockout', 'config/config', 'service', 'underscore' ],

function($, ko, config, service, _) {

    var dhcpIp = "";
    var subMask = "";
    var dhcpServer = "";
    var dhcpStart = "";
    var dhcpEnd = "";
    var firewall_status = FIREWALL_SWTICH_DISABLED;
	var wan_ping_status = 1;
    var protocolModes = [];
    var editRuleId = -1;
    var usbIP = "192.168.1.1";//getUsbIP().ipaddr;
    
    var protocolTmp = _.map(config.FILTER_PROTOCOL_MODES, function(item) {
    	if(item.name != "NONE" && item.name != "ICMP"){
    		protocolModes.push(new Option(item.name, item.value));
    	}
    });
    var ruleStateModes =_.map(config.FILTER_RULE_STATE_MODES, function(item) {
    	return	new Option(item.name, item.value);
    });

   
    
    var columnsTmpl = [
        { headerTextTrans:"lan_ip_address", rowText:"lan_ip", width:"15%" },
        { headerTextTrans:"lan_port", rowText:"lan_port", width:"12%", display: config.IPV6_SUPPORT },
        { headerTextTrans:"wan_ip_address_flt", rowText:"wan_ip", width:"15%"},
        { headerTextTrans:"wan_port", rowText:"wan_port", width:"12%"},
        { headerTextTrans:"protocol", rowText:"ip_protocol", width:"12%", needTrans: true},
        { headerTextTrans:"net_status", rowText:"ip_status", width:"12%", needTrans: true},
        { headerTextTrans:"option", rowText: "list_id",width:"22%",needTrans: true,columnType : "custome"}
    ];
    
    function bindOptionShow(){
    	return '<input type="button" name="filterGrp" id="filterDisable" data-bind="checked: portFilterEnable" value="0"/>';
    }

    /**
     * prot_filter VM
     * @class PortFilterVM
     */
	function PortFilterVM() {
        var self = this;
        var info = getPortFilter();
        var lanInfo = getLanInfo();
        dhcpServer =  lanInfo.dhcpServer;
        dhcpStart = lanInfo.dhcpStart;
        dhcpEnd = lanInfo.dhcpEnd;
        dhcpIp = lanInfo.ipAddress;
        subMask = lanInfo.subnetMask;
        
        firewall_status = info.firewall_status;
		wan_ping_status = info.wan_ping_status;
    	
        self.portFilterEnable = ko.observable(info.ipflt_status);
        self.oriPortFilterEnable = ko.observable(info.ipflt_status);
        
        self.actionMode = ko.observable("nil");
       

        self.lan_ip = ko.observable('');
        self.lan_port = ko.observable('');
        self.wan_ip = ko.observable('');
        self.wan_port = ko.observable('');
        self.ip_protocols = ko.observableArray(protocolModes);
        self.ip_protocol = ko.observable('TCP');
        self.ruleSwitchModes = ko.observableArray(ruleStateModes);
        self.ip_status = ko.observable('off');

        self.rules = ko.observableArray(info.portFilterRules);
        self.rulesSize = ko.observable(info.portFilterRules.length);
        self.rulesMaxSize = ko.observable(config.portForwardMax);

        self.gridTemplate = new ko.simpleGrid.viewModel({
            data:self.rules(),
            idName:"index",
            columns:columnsTmpl,
            tmplType:'list',
            pageSize: 20,
            EditClickHandler : function(idVal){
            	self.EditClickHandler(idVal);
            },
            DeleteClickHandler : function(idVal){
            	self.DeleteClickHandler(idVal);
            }
        });

        /**
         * 编辑
         * @method EditClickHandler
         */
    	self.EditClickHandler = function(idVal){
    		editRuleId = idVal ;
    		self.actionMode("edit");
    		var editRule = {};
    		var rules = self.rules();
    		for ( var i = 0; i <  rules.length; i++)
			{
				if(idVal ==  rules[i].list_id)
				{
					editRule = rules[i];
					break;
				}
			}
    		if(editRule)
    		{
    			 self.lan_ip(editRule.lan_ip);
                 self.lan_port(editRule.lan_port);
                 self.wan_ip(editRule.wan_ip);
                 self.wan_port(editRule.wan_port);
                 self.ip_protocol(editRule.ip_protocol);
                 self.ip_status(editRule.ip_status);
    		}
    	}
    	
    	
    	 /**
         * 删除规则
         * @method DeleteClickHandler
         */
    	self.DeleteClickHandler = function(idVal){
    		  showConfirm("confirm_data_delete", function () {
                  showLoading('deleting');
                  var params = {};
                  params.ip_id = idVal;
                  service.deleteFilterRules(params, self.callback);
              });
    	}
        
        
        /**
         * 设定,新增,删除回调函数
         * @method callback
         */
        self.callback = function(result) {
            if (result.result == "success") {
                self.clear();
                init(self);
                successOverlay();
                self.actionMode("nil");
            } else {
                errorOverlay();
            }
        };
        /**
         * 取消操作
         * @event cancel
         */
        self.cancel = function(){
        	self.clear();
        	self.actionMode("nil");
        }
        
        /**
         * 添加新规则
         * @event addFilterRules
         */
        self.addFilterRules = function() {
        	self.clear();
        	self.actionMode("add");
        };

        /**
         * 清空添加规则输入
         * @method clear
         */
        self.clear = function() {
        	  self.lan_ip('');
              self.lan_port('');
              self.wan_ip('');
              self.wan_port('');
              self.ip_protocol('TCP');
              self.ip_status('off');
              clearValidateMsg();
        };

        /**
         * 设定过滤基本信息
         * @method enableVirtualServer
         */
        self.setPortFilterBasic = function() {
            showLoading('operating');
            var params = {};
            params.ipflt_status = self.portFilterEnable();
            params.firewall_status = FIREWALL_SWTICH_ENABLE;//firewall_status;
            params.wan_ping_status = wan_ping_status;
            
            service.setPortFilterBasic(params, self.callback);
        };

        /**
         * 保存规则
         * @method save
         */
        self.save = function() {
            if(self.rules().length > config.portForwardMax) {
                showAlert({msg: "rules_max", params: config.portForwardMax});
                return;
            }

            if(self.checkExist()) {
                showAlert("rule_exist");
                return;
            }
            showLoading('operating');
            var params = {};
            params.lan_ip = self.lan_ip();
			params.lan_port = self.lan_port();
			params.wan_ip = self.wan_ip();
			params.wan_port = self.wan_port();
			params.ip_protocol = transProtocolNum(self.ip_protocol());
			params.ip_status = tranStateToNum(self.ip_status());
			
			if("edit" == self.actionMode()){
				 params.ip_id = editRuleId;
				 service.editIPFilter(params, self.callback);
			}else{
				 service.addIPFilter(params, self.callback);
			}
			
			
			function transProtocolNum(protocol)
			{
	          	var protocolVal = 6;;
	          	switch (protocol)
	  			{
	  			case "TCP":
	  				protocolVal = 6;
	  				break;
	  			case "UDP":
	  				protocolVal = 17;
	  				break;
	  			case "TCP_UDP":
	  				protocolVal = 253;
	  				break;
	  			default:
	  				protocolVal = 6;
	  				break;
	  			}
	          	return protocolVal;
			}
		          
		    function tranStateToNum(ipState)
		  	{
	          	ipStateVal = 0;
	          	if(ipState == "on")
	  			{
	          		ipStateVal = 1;
	  			}else{
	  				ipStateVal = 0;
	  			}
	          	return ipStateVal;
		  	}
			
        };

        /**
         * 检查新增规则是否已经存在
         * @method checkExist
         */
        self.checkExist = function() {
            var newRule = {
            	lan_ip: self.lan_ip(),
            	lan_port: parseInt(self.lan_port()),
            	wan_ip: self.wan_ip(),
            	wan_port: parseInt(self.wan_port()),
            	ip_status: self.ip_status(),
                ip_protocol: self.ip_protocol()
            };
           
            var oldRule;
            var rules = self.rules();
            for(var i = 0; i < rules.length; i++) {
                oldRule = {
                	lan_ip: rules[i].lan_ip,
                	lan_port: rules[i].lan_port,
                	wan_ip: rules[i].wan_ip,
                	wan_port: rules[i].wan_port,
                	ip_status: rules[i].ip_status,
                	ip_protocol: rules[i].ip_protocol
                };

                if(_.isEqual(newRule, oldRule)) {
                    return true;
                }
            }
            return false;
        };
    }

    /**
     * 获取port filter信息
     * @method getPortFilter
     */
    function getPortFilter() {
		var port_filter={};
		port_filter =  service.getPortFilter();
		return port_filter;
    }

    function getLanInfo() {
        return service.getLanInfo();
    }

  /*  function Op_AND_4Byte(v1, v2) {
        var i;
        var var1 = [];
        var var2 = [];
        var result = '0x';

        for (i = 2, j = 0; i < 10; i += 2, j++) {
            var1[j] = '0x' + v1.substring(i, i + 2);
            var2[j] = '0x' + v2.substring(i, i + 2);
        }

        for (i = 0; i < 4; i++) {
            result = result + hex(var1[i] & var2[i]);
        }

        return result - 0;
    }*/
    
    /**
     * 初始化port filter view model
     * @method init
     */
	function init(viewModel) {
        $("#dropdownMain").show();
        
        var vm;
        if(viewModel) {
            vm = viewModel;
            vm.actionMode("nil");
            var info = getPortFilter();
            vm.portFilterEnable(info.ipflt_status);
            vm.oriPortFilterEnable(info.ipflt_status);
            vm.rules(info.portFilterRules);
            vm.gridTemplate.data(info.portFilterRules);
            vm.rulesSize(info.portFilterRules.length);
            refreshTableHeight();
            $('.notes-content').translate();
            return;
        }

		vm = new PortFilterVM();
        var container = $('#container');
        ko.cleanNode(container[0]);
		ko.applyBindings(vm, container[0]);

        fixTableHeight();

        $('#filterBasicForm').validate({
            submitHandler : function() {
                vm.setPortFilterBasic();
            }
        });

        $('#portFilterListForm').validate({
            submitHandler : function() {
                vm.addFilterRules();
            }
        });

        $('#portFilterForm').validate({
            submitHandler : function() {
                vm.save();
            },
            rules: {
              
            	txtLanIpAddress: {
            		required: true,
                    ip_check: true,
                    sourceRoutIPCheck: true
                },
                txtWanIpAddress: {
                	required: true,
                    ip_check: true
                },
                txtLanPort: {
                	required: true,
                    digits: true,
                    range: [0, 65535]
                },
                txtWanPort: {
                	required: true,
                    digits: true,
                    range: [0, 65535]
                }
            }
           
           
        });
	}

   
    $.validator.addMethod("sourceRoutIPCheck", function (value, element, param) {
        if(value == ""){
            return false;
        }
        if(!IsSameSubnetAddrs(value, dhcpIp, subMask) && value != usbIP){
        	return false;
        }
        if (!isSameSubnetAvailableIp(value, dhcpIp) && value != usbIP) {
        	return false;
        }
        return true;
    });
    
    function isSameSubnetAddrs(ip1, ip2, mask){
        var addrParts1 = ip1.split(".");
        var addrParts2 = ip2.split(".");
        var maskParts = mask.split(".");
        for (var i = 0; i < 4; i++) {
            if (((Number(addrParts1[i])) & (Number(maskParts[i]))) != ((Number(addrParts2[i])) & (Number(maskParts[i])))){
                return false;
            }
        }
        return true;
    }
    
    function isSameSubnetAvailableIp(startIp, homeIp){
    	var S = startIp.split(".");
    	var H = homeIp.split(".");
    	
    	if(parseInt(S[3]) > (parseInt(H[3])+10) || parseInt(S[3]) < parseInt(H[3])){
    		return true;
    	}else{
    		return false;
    	}
    }

   /* function checkStartEndIp(sourceip, startip, endip) {
        var i1 = startip.indexOf('.');
        var i2 = startip.indexOf('.', (i1 + 1));
        var i3 = startip.indexOf('.', (i2 + 1));
        var sip = hex(startip.substring(0, i1)) + hex(startip.substring((i1 + 1), i2)) + hex(startip.substring((i2 + 1), i3)) + hex(startip.substring((i3 + 1), startip.length));
        var sip = '0x' + sip;

        i1 = endip.indexOf('.');
        i2 = endip.indexOf('.', (i1 + 1));
        i3 = endip.indexOf('.', (i2 + 1));
        var eip = hex(endip.substring(0, i1)) + hex(endip.substring((i1 + 1), i2)) + hex(endip.substring((i2 + 1), i3)) + hex(endip.substring((i3 + 1), endip.length));
        var eip = '0x' + eip;

        i1 = sourceip.indexOf('.');
        i2 = sourceip.indexOf('.', (i1 + 1));
        i3 = sourceip.indexOf('.', (i2 + 1));
        var lan_ipaddr = hex(sourceip.substring(0, i1)) + hex(sourceip.substring((i1 + 1), i2)) + hex(sourceip.substring((i2 + 1), i3)) + hex(sourceip.substring((i3 + 1), sourceip.length));
        var lan_ipaddr = '0x' + lan_ipaddr;

        if (parseInt(lan_ipaddr) >= parseInt(sip) && parseInt(lan_ipaddr) <= parseInt(eip)) {
            return true;
        }
        return false;
    }*/

  /*  function checkSubMask(sourceip, dhcpIp, subMask) {
        var i1 = sourceip.indexOf('.');
        var i2 = sourceip.indexOf('.', (i1 + 1));
        var i3 = sourceip.indexOf('.', (i2 + 1));
        var lan_ipaddr = hex(sourceip.substring(0, i1)) + hex(sourceip.substring((i1 + 1), i2)) + hex(sourceip.substring((i2 + 1), i3)) + hex(sourceip.substring((i3 + 1), sourceip.length));
        var lan_ipaddr = '0x' + lan_ipaddr;

        i1 = dhcpIp.indexOf('.');
        i2 = dhcpIp.indexOf('.', (i1 + 1));
        i3 = dhcpIp.indexOf('.', (i2 + 1));
        var  dhcpIp = hex(dhcpIp.substring(0, i1)) + hex(dhcpIp.substring((i1 + 1), i2)) + hex(dhcpIp.substring((i2 + 1), i3)) + hex(dhcpIp.substring((i3 + 1), dhcpIp.length));
        var dhcpIp = '0x' + dhcpIp;

        i1 = subMask.indexOf('.');
        i2 = subMask.indexOf('.', (i1 + 1));
        i3 = subMask.indexOf('.', (i2 + 1));
        var subMask = hex(subMask.substring(0, i1)) + hex(subMask.substring((i1 + 1), i2)) + hex(subMask.substring((i2 + 1), i3)) + hex(subMask.substring((i3 + 1), subMask.length));
        var subMask = '0x' + subMask;

        if (Op_AND_4Byte(lan_ipaddr, subMask) != Op_AND_4Byte(dhcpIp, subMask)) {
            return false;
        }

        //if (parseInt(lan_ipaddr) > (parseInt(dhcpIp) & parseInt(subMask))) {
        //    return true;
        //}
        return true;
    }*/
    
    
 
    

  /*  function hex(val) {
        var h = (val - 0).toString(16);
        if (h.length == 1) h = '0' + h;
        return h.toUpperCase();
    }*/

	return {
		init : init
	};
});