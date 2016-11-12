/**
 * setting--device seeting--USSD module
 * 
 * @module ussd
 * @class ussd
 */
define([ 'jquery', 'service', 'knockout','config/config'], function($, service, ko,config) {
	
	var initUSSD=true;
	var timeOutFlag=0;//计时
	var reply_flag=false;//是否已经得到回复
	var USSDLocation = {SEND:0, REPLY:1};
	var callbackTemp;
	var ussd_action=1;//初始化为成功获得返回消息
	var interval=0;

    /**
     * @class USSDInformationViewModel
     * @constructor
     */
	function USSDInformationViewModel() {
		var self = this;
		self.ussd_action=ko.observable(ussd_action);
		self.USSDLocation=ko.observable(USSDLocation.SEND);
		self.USSDReply=ko.observable("");
		self.USSDSend=ko.observable("");
        self.currentCart =ko.observable("My_balance");
        self.currentCart2 =ko.observable("My_balance");
        //$("#currentCart").text($.i18n.prop("Initial_balance_activation"));
        $("#myBalance").show();
        self.subMenuClickHandler = function(subMenu){
            $("#USSD_reply_div").hide();
            $("#buttonFlag input[type=button]").show();
            $("#buttonFlag input[type=text]").show();
            $("#secret_code,#subscriber_phone").show();
            self.USSDSend("");
              if(subMenu == "balance"){
                  $("#top,#money,#number,#myBalance").hide();
                 $("#balance").show();
                  self.currentCart($.i18n.prop("Initial_balance_activation"));
                  self.currentCart2("Initial_balance_activation");
                  $(".menu_current").css("display","none");
                  $("#initbalance").css("display","");
              }else if(subMenu == "top"){
                  $("#money,#balance,#number,#myBalance").hide();
                 $("#top").show();
                  self.currentCart($.i18n.prop("Top_Up"));
                  self.currentCart2("Top_Up");
                  $(".menu_current").css("display","none");
                  $("#topup").css("display","");
              }else if(subMenu == "money"){
                  $("#balance,#top,#number,#myBalance").hide();
                  $("#money").show();
                  self.currentCart($.i18n.prop("Give_me_money"));
                  self.currentCart2("Give_me_money");				  
                  $(".menu_current").css("display","none");
                  $("#money_menu").css("display","");				  
              }else if(subMenu == "number"){
                  $("#balance,#top,#money,#myBalance").hide();
                  $("#number").show();
                  self.currentCart($.i18n.prop("My_number"));
                  self.currentCart2("My_number");
                  $(".menu_current").css("display","none");
                  $("#mynumber").css("display","");
              } else{
                  $("#balance,#top,#number,#money").hide();
                  $("#myBalance").show();
                  self.currentCart($.i18n.prop("My_balance"));
                  self.currentCart2("My_balance");
                  $(".menu_current").css("display","none");
                  $("#balanceCheck").css("display","");
              }
        }
		
		/**
		 * 发送USSD命令
		 * @method sendToNet
		 */
		self.sendToNet = function(item){
            var status = service.getStatusInfo();
            if (checkConnectedStatusAndConnecting(status.connectStatus)){
                showAlert('connectedPro','','170px');
                return;
            }
            var netType = service.getNetSelectInfo();
            if(checkNetType(netType.net_select)){
                showAlert('4GOnlyPro','','175px');
                return;
            }
			timeOutFlag=0;
			window.clearInterval(interval);
			var command = self.USSDSend();
            if(item && item == '*101*1111#'){
                command =  '*101*1111#';
            }else if(item && item == "secretCode"){
                var reg = /^\d+$/.test(command);
                if(!reg){
                    showAlert("number");
                    return;
                }
                command = "*103*" + self.USSDSend() + "#" ;
            }else if(item && item == "phoneNumber"){
                var reg = /^(\+\d+|\d+)$/.test(command);
                if(!reg){
                    showAlert("number");
                    return;
                }
                command = "*143*" + self.USSDSend() + "#" ;
            }else if(item && item == "*110*10#"){
                command = "*110*10#" ;
            }else if(item && item == "*102#"){
                command = "*102#" ;
            }
			if (('string' != typeof (command)) || ('' == command)) {
				showAlert("ussd_error_input");
				return;
			}
			
			showLoading('operating');
			
			var params = {};
                params.operator = "ussd_send";
                params.strUSSDCommand = command;
				params.sendOrReply = "send";
			
			service.getUSSDResponse(params, function(result, content){
				hideLoading();				
				if(result){
					resetUSSD();
					self.USSDLocation(USSDLocation.REPLY);
					self.ussd_action(content.ussd_action);
					$("#USSD_Content").html(content.data);
                 //   $("#USSD_Content").height($("#USSD_Content")[0].scrollHeight);
					reply_flag=false;
					timeOutFlag=0;
				//	interval=addInterval(timeOutVerify,1000);
                    $("#USSD_reply_div").show();
                    $("#buttonFlag input[type=button]").hide();
                    $("#buttonFlag input[type=text]").hide();
                    $("#secret_code,#subscriber_phone").hide();
				}else{
					showAlert(content);
				}
			});
		};
		
		/**
		 * 回复USSD消息
		 * @method replyToNet
		 */
		self.replyToNet = function(){
			timeOutFlag=0;
			window.clearInterval(interval);
			var command = self.USSDReply();
			if (('string' != typeof (command)) || ('' == command)) {
				showAlert("ussd_error_input");
				return;
			}
			
			showLoading('operating');
			
			var params = {};
                params.operator = "ussd_reply";
                params.strUSSDCommand = command;
				params.sendOrReply = "reply";
			
			service.getUSSDResponse(params, function(result, content){
				hideLoading();
				if(result){
					self.ussd_action(content.ussd_action);
					$("#USSD_Content").html(content.data);
              //      $("#USSD_Content").height($("#USSD_Content")[0].scrollHeight);
					reply_flag=false;
					resetUSSD();
					timeOutFlag=0;
					//interval=addInterval(timeOutVerify,1000);
				}else{
					showAlert(content);
				}	
			});
		};
		
		/**
		 * 取消回复USSD消息
		 * @method noReplyCancel
		 */
		self.noReplyCancel = function(){
			timeOutFlag=0;
			reply_flag=true;
			window.clearInterval(interval);
			service.USSDReplyCancel(function(result){
				if(result){
					resetUSSD();
					self.USSDLocation(USSDLocation.SEND);
				}else{
					showAlert("ussd_fail");
				}
			});
            $("#buttonFlag input[type=button]").show();
            $("#buttonFlag input[type=text]").show();
            $("#secret_code,#subscriber_phone").show();
		};
		
		/**
		 * 判断是否响应超时
		 * @method timeOutVerify
		 */
		function timeOutVerify(){
			if(!reply_flag){
				if(timeOutFlag<29){
					timeOutFlag++;
				}else{
					reply_flag=true;
					window.clearInterval(interval);
					showAlert("ussd_operation_timeout");
					self.USSDReply("");
					self.USSDSend("");
					self.USSDLocation(USSDLocation.SEND);
					timeOutFlag=0;
				}
			}else{
				reply_flag=true;
				window.clearInterval(interval);
				timeOutFlag=0;
			}
		};
		
		cancelUSSD = function(){
			service.USSDReplyCancel(function(result){
			});
		};
		
		/**
		 * 重置USSD输入命令
		 * @method resetUSSD
		 */
		resetUSSD = function(){
			self.USSDReply("");
			self.USSDSend("");
		};		
		
		//如果首次进入USSD菜单，先发送USSD取消命令，进行初始化
		if(initUSSD){
			cancelUSSD();
			initUSSD=false;
		}
        if(config.USSD_FLAG.length > 0){
            config.USSD_FLAG = "";
            self.sendToNet('*101*1111#');
            self.currentCart("Initial_balance_activation");
            self.currentCart2("Initial_balance_activation");
            $("#top,#money,#number,#myBalance").hide();
            $("#balance").show();
        }

	}

    /**
     * 初始化
     * @method init
     */
	function init() {
        $("#dropdownMain").show();
        
		var container = $('#container')[0];
		ko.cleanNode(container);
		var vm = new USSDInformationViewModel();
		ko.applyBindings(vm, container);
			 $("#secretCode,#subscriberPhone").die().live("drop", function(){
                 return false;
            }).live("contextmenu", function () {
                    return false;
                });
	}	
	
	return {
		init : init
	};
});