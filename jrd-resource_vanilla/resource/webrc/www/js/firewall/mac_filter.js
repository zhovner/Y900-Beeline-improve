/**
 * @module upnp setting
 * @class upnp setting
 */
define([ 'jquery', 'knockout', 'config/config', 'service', 'underscore' ],

function($, ko, config, service, _) {

    var macfilterPolicy = _.map(config.FILTER_MAC_POLICY, function(item) {
        return new Option(item.name, item.value);
    });

    /**
     * system MAC filter setting VM
     * @class macFilterSettingVM
     */
    function macFilterSettingVM() {
        var self = this;
		
        var macSettings = service.getMacFilterSettings();
		
        self.policys = ko.observableArray(macfilterPolicy);
		
        self.selectedPolicy = ko.observable(macSettings.filter_policy);
        self.allow_mac0 = ko.observable(macSettings.allow_addr0);
        self.allow_mac1 = ko.observable(macSettings.allow_addr1);
        self.allow_mac2 = ko.observable(macSettings.allow_addr2);
        self.allow_mac3 = ko.observable(macSettings.allow_addr3);
        self.allow_mac4 = ko.observable(macSettings.allow_addr4);
        self.allow_mac5 = ko.observable(macSettings.allow_addr5);
        self.allow_mac6 = ko.observable(macSettings.allow_addr6);
        self.allow_mac7 = ko.observable(macSettings.allow_addr7);
        self.allow_mac8 = ko.observable(macSettings.allow_addr8);
        self.allow_mac9 = ko.observable(macSettings.allow_addr9);
		
        self.deny_mac0 = ko.observable(macSettings.deny_addr0);
        self.deny_mac1 = ko.observable(macSettings.deny_addr1);
        self.deny_mac2 = ko.observable(macSettings.deny_addr2);
        self.deny_mac3 = ko.observable(macSettings.deny_addr3);
        self.deny_mac4 = ko.observable(macSettings.deny_addr4);
        self.deny_mac5 = ko.observable(macSettings.deny_addr5);
        self.deny_mac6 = ko.observable(macSettings.deny_addr6);
        self.deny_mac7 = ko.observable(macSettings.deny_addr7);
        self.deny_mac8 = ko.observable(macSettings.deny_addr8);
        self.deny_mac9 = ko.observable(macSettings.deny_addr9);		
				
        self.save = function() {
            showLoading('operating');
            var params = {};
            params.filter_policy = self.selectedPolicy();
            params.allow_mac0 = self.allow_mac0();
            params.allow_mac1 = self.allow_mac1();
            params.allow_mac2 = self.allow_mac2();
            params.allow_mac3 = self.allow_mac3();
            params.allow_mac4 = self.allow_mac4();
            params.allow_mac5 = self.allow_mac5();
            params.allow_mac6 = self.allow_mac6();
            params.allow_mac7 = self.allow_mac7();
            params.allow_mac8 = self.allow_mac8();
            params.allow_mac9 = self.allow_mac9();				
            params.deny_mac0 = self.deny_mac0();
            params.deny_mac1 = self.deny_mac1();
            params.deny_mac2 = self.deny_mac2();
            params.deny_mac3 = self.deny_mac3();
            params.deny_mac4 = self.deny_mac4();
            params.deny_mac5 = self.deny_mac5();
            params.deny_mac6 = self.deny_mac6();
            params.deny_mac7 = self.deny_mac7();
            params.deny_mac8 = self.deny_mac8();
            params.deny_mac9 = self.deny_mac9();
           
            service.setMacFilterSettings(params, function(result) {
                if (result.result == "success") {
                    successOverlay();
                } else {
                    errorOverlay();
                }
            });
			
        };
		
        self.policyChangeHandler = function (){
		
                if (self.selectedPolicy() == MAC_FILTER_DISABLE){
                    $("input[name='txtMacAddress']").attr("disabled", true);
                }else if(self.selectedPolicy() == MAC_FILTER_ALLOW){
                    $("#allowList").css("display","");
                    $("#denyList").css("display","none");				
                    $("input[name='txtMacAddress']").attr("disabled", false);
                }else{
                    $("#allowList").css("display","none");
                    $("#denyList").css("display","");
                    $("input[name='txtMacAddress']").attr("disabled", false);
                }
            }
    }


    /**
     * 初始化macFilterSettingVM model
     * @method init
     */
	function init() {
        $("#dropdownMain").show();
        
		var container = $('#container');
		ko.cleanNode(container[0]);
		var vm = new macFilterSettingVM();
		ko.applyBindings(vm, container[0]);
        $('#macFilterForm').validate({
            submitHandler : function() {
                vm.save();
            },
            rules: {
                txtMacAddress: {
                    filter_optional: false,
                    mac_check: true
                }
            },
            errorPlacement: function(error, element) {
                if(element.attr("name") == "txtMacAddress") {
                    error.insertAfter("#macExamLabel");
                }
                else
                    error.insertAfter("#macExamLabel");
            }
        });
	}
    $.validator.addMethod("filter_optional", function (value, element, param) {
        var result = _.any(['name == txtMacAddress'],
            function(item) {
                return $(item+':visible').length > 0 && $(item).val() != '';
            }
        );

        return result;
    });

	return {
		init : init
	};
});