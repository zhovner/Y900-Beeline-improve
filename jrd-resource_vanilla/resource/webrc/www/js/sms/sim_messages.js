/**
 * Sim卡短信列表
 * @module sim_messages
 * @class sim_messages
 */
define(['jquery', 'knockout', 'config/config', 'service' ],
    function($, ko, config, service) {
		var simMsgListTmpl = null;
		/**
		 * 每页记录条数
		 * 现在9x15平台不能够设置每页数据个数，默认为10个。目前此变量不能够修改
		 * @attribute {Integer} perPage
		 */
		var perPage = 200;
		
		/**
		 * 获取短信分页记录
		 * @method getSMSMessages
		 */
        function getSMSMessages() {
    		return service.getSMSMessages({location:0
    		}, function(data) {		
                tryToDisableCheckAll($("#simMsgList-checkAll"), data.messages.length);
    			dealPhoneBooks(data.messages);
    		}, function(data) {
				dealPhoneBooks([]);
    		});
    	}
        
        choseSimUsersDeleteSelectClickHandler = function(){
            //tryToDisableCheckAll($("#smslist-checkAll", "#smsListForm"), $(".smslist-item", "#smslist_container").length);
            $("#simMsgList-checkAll").removeAttr('checked');
            $("#checkbox-all").trigger('click');
        }
        /**
		 * 短信显示联系人名字，并将结果显示在UI
		 * @method dealPhoneBooks
		 * @param {Array} messages 短信息
		 */
        function dealPhoneBooks(messages){
        	$.each(messages, function(j, n){
				n.itemId = getLast8Number(n.number);
        		for(var i = 0; i < config.phonebook.length; i++){
        			var person = config.phonebook[i];
        			if(n.itemId == getLast8Number(person.pbm_number)){
        				n.name = person.pbm_name;
        				break;
        			}
        		}
        	});
        	renderSimMessageList(messages);
        }
        
        /**
		 * 将短信显示结果显示在UI
		 * @method renderSimMessageList
		 * @param {Array} messages 短信息
		 */
        function renderSimMessageList(messages){
        	if(simMsgListTmpl == null){
        		simMsgListTmpl = $.template("simMsgListTmpl", $("#simMsgListTmpl"));
        	}
        	$("#simMsgList_container").html($.tmpl("simMsgListTmpl", {data: messages}));
			/*$("#simMsgList_container .smslist-item-msg pre").each(function(){
				var $this = $(this);
				if($this.height() > 60) {
					$this.addClass("cursor-pointer");
				}
			});*/
			hideLoading();
        }
        
        /**
    	 * 初始化电话本信息
    	 * @method initPhoneBooks
		 * @param {Function} cb 回调函数
    	 */
        function initPhoneBooks(cb) {
            service.getPhoneBooks({
                page : 0,
                data_per_page : 2000,
                orderBy : "name",
                isAsc : true
    		}, function(books){
    			if ($.isArray(books.pbm_data) && books.pbm_data.length > 0) {
    				config.phonebook = books.pbm_data;
    			} else {
    				config.phonebook = [];
    			}
    			cb();
    		}, function(){
                errorOverlay();
            });
        }
        
    	/**
    	 * SmsMessagesVM
    	 * @class SmsMessagesVM
    	 */
        function SmsMessagesVM() {
            var self = this;
            start();
        }

		/**
		 * 短信删除事件处理
		 * @event deleteSmsMsgClickHandler
		 */
		deleteSelectedSimMsgClickHandler = function(){
			var checkbox = $("input[name=msgId]:checked", "#simMsgList_container");
			var msgIds = [];
			for(var i = 0; i < checkbox.length; i++){
				msgIds.push($(checkbox[i]).val());
			}
			if(msgIds.length == 0){
                showAlert("no_data_selected");
				return false;
			}
			showConfirm("confirm_data_delete", function() {
                showLoading('deleting');
				service.deleteMessage({
					ids: msgIds
				}, function(data){
					removeChecked("simMsgList-checkAll");
                    disableBtn($("#simMsgList-delete"));
					var idsForDelete = "";
					checkbox.each(function(i, n){
						idsForDelete += ".simMsgList-item-class-" + $(n).val() + ",";
					});
					if(idsForDelete.length > 0){
						$(idsForDelete.substring(0, idsForDelete.length - 1)).hide().remove();
					}
                    tryToDisableCheckAll($("#simMsgList-checkAll"), $(".smslist-item","#simMsgList_container").length);
					successOverlay();
				}, function(error){
					errorOverlay(error.errorText);
				});
			});
		}
		/**
		 * 将被checked的条目添加到self.checkedItem中，用于在滚动还原checkbox
		 * @event checkboxClickHandler
		 */
		function checkboxClickHandler() {
			if(getSelectedItemSize() == 0){
				disableBtn($("#simMsgList-delete"));
			} else {
				enableBtn($("#simMsgList-delete"));
			}
		}

		/**
		 * 获取已选择的条目
		 * @method getSelectedItemSize
		 * @return {Array}
		 */
		function getSelectedItemSize(){
			return $("input:checkbox:checked", '#simMsgList_container').length;
		}
        
    	/**
    	 * 模块开始，检查电话本及短信状态并加装页码数据
    	 * @method start
    	 */
        function start(){
            showLoading('operating');
            var getSMSReady = function () {
                service.getSMSReady({}, function (data) {
                    if (data.sms_cmd_status_result == "2") {
                        hideLoading();
                        showAlert("sms_init_fail");
                    } else if (data.sms_cmd_status_result == "1") {
                        addTimeout(function () {
                            getSMSReady();
                        }, 1000);
                    } else {
                        if (!config.HAS_PHONEBOOK) {
                            initSMSList(config.HAS_PHONEBOOK);
                        } else {
                            getPhoneBookReady();
                        }
                    }
                });
            };

            var getPhoneBookReady = function () {
                service.getPhoneBookReady({}, function (data) {      					
					if (data.pb_init_state == PB_INIT_STATE_NOT_INIT) {
                        addTimeout(function () {
                            getPhoneBookReady();
                        }, 1000);
                    } else if (data.pb_init_state == PB_INIT_STATE_COMPLETED){
                        initSMSList(config.HAS_PHONEBOOK);
                    }else {
                    	initSMSList(false);
					}
					
                });
            };

            var initSMSList = function (isPbmInitOK) {
                if (isPbmInitOK) {
                    initPhoneBooks(function () {
                        getSMSMessages();
                    });
                } else {
                    config.phonebook = [];
                    getSMSMessages();
                }
            };
            getSMSReady();
        }
        
    	/**
    	 * 页面事件绑定
    	 * @method initEventBind
    	 */
        function initEventBind(){
        	$("pre.msgContent", "#simMsgTableContainer").die().live("click", function(){
        		var $this = $(this);
    			$('pre.msgContent.showFullHeight', '#simMsgTableContainer').not($this).removeClass('showFullHeight').animate({'max-height': '20px'});
    			$this.addClass('showFullHeight').animate({'max-height': ($('span', $this).height() + 10) + 'px'});
        	});
			$("#simMsgList_container p.checkbox, #simMsgListForm #simMsgList-checkAll").die().live("click", function(){
				checkboxClickHandler();
			});
			$(".smslist-item-msg", "#simMsgList_container").die().live("click", function(){
				var $this = $(this);
				$('.smslist-item-msg.showFullHeight', '#simMsgList_container').not($this).removeClass('showFullHeight').animate({'max-height': '60px'});
				var preHeight = $('pre', $this).height();
				$this.addClass('showFullHeight').animate({'max-height': (preHeight > 60 ? preHeight : 60) + 'px'});
			});
        }
        
    	/**
    	 * 模块初始化开始
    	 * @method init
    	 */
        function init() {
            $("#dropdownMain").show();
            
            var container = $('#container');
            ko.cleanNode(container[0]);
            var vm = new SmsMessagesVM();
            ko.applyBindings(vm, container[0]);
            initEventBind();
        }

        return {
            init : init
        };
    }
);
