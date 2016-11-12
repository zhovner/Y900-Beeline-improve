	/*sms write util*/
	var currListType = getUrlPara("list");
	var doAction = getUrlPara("doAction");
	var sendInfo = {
		numberArr: [],
		total: 0,
		currentNum: "",
		currentCount: -1,
		errorNum: [],
		successNum: []
	}
	
	function initSendInfo() {
		sendInfo = {
			numberArr: [],
			total: 0,
			currentCount: -1,
			errorNum: [],
			successNum: []
		}
	}
	
	
	function doActionFun(doAction) {
		switch (doAction) {
			case "reply":
				doReply();
				break;
			case "forward":
				doForward();
				break;
			case "edit":
				doEdit();
				break;
			default:
				doWrite();
		}
	}	
	
	var GSM_7BIT_NUM = 128;

	var arrayGSM_7DefaultTable = [
		0x0040, 0x00A3, 0x0024, 0x00A5, 0x00E8, 0x00E9, 0x00F9, 0x00EC, 0x00F2, 0x00C7, 0x000A, 0x00D8, 0x00F8, 0x000D, 0x00C5, 0x00E5,
		0x0394, 0x005F, 0x03A6, 0x0393, 0x039B, 0x03A9, 0x03A0, 0x03A8, 0x03A3, 0x0398, 0x039E, 0x001B, 0x00C6, 0x00E6, 0x00DF, 0x00C9,
		0x0020, 0x0021, 0x0022, 0x0023, 0x00A4, 0x0025, 0x0026, 0x0027, 0x0028, 0x0029, 0x002A, 0x002B, 0x002C, 0x002D, 0x002E, 0x002F,
		0x0030, 0x0031, 0x0032, 0x0033, 0x0034, 0x0035, 0x0036, 0x0037, 0x0038, 0x0039, 0x003A, 0x003B, 0x003C, 0x003D, 0x003E, 0x003F,
		0x00A1, 0x0041, 0x0042, 0x0043, 0x0044, 0x0045, 0x0046, 0x0047, 0x0048, 0x0049, 0x004A, 0x004B, 0x004C, 0x004D, 0x004E, 0x004F,
		0x0050, 0x0051, 0x0052, 0x0053, 0x0054, 0x0055, 0x0056, 0x0057, 0x0058, 0x0059, 0x005A, 0x00C4, 0x00D6, 0x00D1, 0x00DC, 0x00A7,
		0x00BF, 0x0061, 0x0062, 0x0063, 0x0064, 0x0065, 0x0066, 0x0067, 0x0068, 0x0069, 0x006A, 0x006B, 0x006C, 0x006D, 0x006E, 0x006F,
		0x0070, 0x0071, 0x0072, 0x0073, 0x0074, 0x0075, 0x0076, 0x0077, 0x0078, 0x0079, 0x007A, 0x00E4, 0x00F6, 0x00F1, 0x00FC, 0x00E0
	];
	
	var arrayGSM_7ExtTable = [
		0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF,
		0xFFFF, 0xFFFF, 0x000A, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF,
		0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0x005E, 0xFFFF, 0xFFFF, 0xFFFF,
		0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF,
		0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF,
		0x007B, 0x007D, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0x005C,
		0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF,
		0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0x005B, 0x007E, 0x005D, 0xFFFF,
		0x007C, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF,
		0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF,
		0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF,
		0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF,
		0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0x20AC, 0xFFFF, 0xFFFF,
		0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF,
		0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF,
		0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF
	];
	function get7ExtNum(str) {
		var i;
		var j;
		var char_i;
		var num_char_i;
		var num7Ext = 0;
		for (i = 0; i < str.length; i++) {
			char_i = str.charAt(i);
			num_char_i = char_i.charCodeAt();
			for (j = 0; j < GSM_7BIT_NUM; j++) {
				if (num_char_i == arrayGSM_7ExtTable[j]) {
					num7Ext++;
				}
			}
		}
		return num7Ext;
	}
	
	function ucs2_number_check(str) {
		var i;
		var char_i;
		var num_char_i;
	
		var j;
		var flag;
		var ucs2_num_temp = 0;
	
		if (str.length == 0) {
			return 0;
		}
		for (i = 0; i < str.length; i++) {
			flag = 0;
			char_i = str.charAt(i);
			num_char_i = char_i.charCodeAt();
			for (j = 0; j < GSM_7BIT_NUM; j++) {
				if ((num_char_i == arrayGSM_7DefaultTable[j]) || (num_char_i == arrayGSM_7ExtTable[j])) {
					flag = 1;
					break;
				}
			}
			if (0 == flag) {
				ucs2_num_temp++;
			}
		}
		return ucs2_num_temp;
	}
	
	function isUcs2(str) {
			return ucs2_number_check(str) > 0 ? true : false;
	}
		
	function doReply() {	
		$("#phoneNumbers").val(smsNumber);
		$("#messageContent").val(smsContent.HTMLDecode()).focus();
	}

	function doForward() {
		if (leftCount == 0) {
			sys.alert("ids_sms_smsFull");
		}
		$("#btnSave,#btnSent").css("display", "");
		$("#chosen-search-field-input").focus();
		$("#messageContent").val(smsContent).focus();
	}
	
	function doEdit() {
		$("#btnSave,#btnSent").css("display", "")
		$("#phoneNumbers").val(smsNumber);
		$("#messageContent").val(smsContent.HTMLDecode()).focus();
	}
	
	function doWrite() {
		if (leftCount == 0) {
			sys.alert("ids_sms_smsFull");
		}
		$("#btnBack").next(".smsMargin").remove();
		$("#btnBack").parent(".btnWrap").next(".smsMargin").remove();
		$("#btnBack").parent(".btnWrap").remove();
		$("#btnBack").css("display", "none");
		$("#phoneNumbers").val("").focus();
		$("#messageContent").val("");
		$("#btnSave,#btnSent").css("display", "")
	}

	function showNumCount() {

		if(doAction == "new"|| doAction == "forward"){
			numbersArr = syncSelectAndChosen($("select#chosenUserSelect"), $('.search-choice', '#chosenUserSelect_chzn'));
		}else if(doAction == "reply"){				   
			numbersArr = smsNumber;
		}
		var numCount = numbersArr.length;
		G_numCounts = numCount;
		$("#currentNumCount").html(numCount);
	}

	function startQueueEvent(type,currContactId,draftId,smsCont,refurbishBack) {
		showNumCount();
		initSendInfo();
		var $inputNumbers = $("#phoneNumbers");
		var inputNumbers = "";
		$.each(numbersArr, function (i, e) {
						inputNumbers += e+ ";";
					});
		var messageContent = $("#messageContent").val();   
		var errorNum = [];
		var reg = /^((?!;{2,}).)+$/
		if(type == "save" &&  messageContent == "" && draftId){
			SDK.SMS.DeleteSMS(2,currContactId,draftId);
			return;
		}
		
		if(type == "repeat"){
			sendEvent("null",draftId,smsCont,refurbishBack);
		}
		
		if (inputNumbers != "") {
			if(type == "save" && messageContent == ""){
				return;
			}
			if (!reg.test(inputNumbers) || /^;/.test(inputNumbers)) {
				sys.alert("ids_sms_mobileNumRule");
				return;
			} else {
				errorNum = $.grep(numbersArr, function(n, i) {
					return !(/^\+?[0-9]{1,20}$/.test(n))
				})
				if (errorNum.length > 0) {
					sys.alert("ids_sms_mobileNumRule");
					return;
				}
			}
			if (numbersArr.length * G_SmsCounts > 30) {
				sys.alert("ids_sms_numberWarning");
				return;
			}
			if (!checkCount(true)) {
				sys.alert("ids_sms_smsFull");
				return;
			}
			if(counts>10){
				sys.alert("ids_sms_numberWarning");
				return;
	        }
			sendInfo.numberArr = numbersArr;
			sendInfo.total = numbersArr.length;
			if (type == "send") {
				if(messageContent == ""){
					sys.confirm("ids_sms_emptyMessageWarn",function(){sendEvent("");});
				}else{
					sendEvent("");
				}
			} else if (type == "save" && messageContent != "") {
				saveEvent("");
			}	
		} else {
			if (type == "send") {
				sys.alert("ids_sms_inputNum");
				return;
			}
		}
	}
	
	function getPhoneNumArray(PhoneNumStr) {
		var arrayPhoneNum = PhoneNumStr.split(";");
		return arrayPhoneNum;
	}
	
	function sendEvent(number,smsId,smsCont,refurbishBack) {		
		var smsContent = $("#messageContent").val();
		var smsTime = getSystemTime();
		var arrayPhoneNum = numbersArr;		
		sys.prompt('<div id="showResultDiv">' + sys.getRes("ids_sms_sendingPrompt") +'</div>', -1);
		listenLogout.stop();   
		if(refurbishBack && refurbishBack != null){
				var result = SDK.SMS.SendSMS(smsId, smsCont, arrayPhoneNum, smsTime);
			}else{
				result = SDK.SMS.SendSMS(SMS_SEND_SAVE_NEW, smsContent, arrayPhoneNum, smsTime);
			}
		if (result == API_RESULT_SUCCESS) {
			startGetSendResult(refurbishBack);
		} else {
			sys.alert("ids_sms_sendFail", function() {
				if(doAction == "new"|| doAction == "forward"){
					page.changePage("sms/smsList.html")
				}else{
					page.reloadMain();
				}
			})
		}   	
	}
	
	function saveEvent(number) {
		var smsContent = $("#messageContent").val();
		var smsTime = getSystemTime();
		var arrayPhoneNum = numbersArr;
		if (arrayPhoneNum.length>0) {
			//page.startLoading();
			var result = SDK.SMS.SaveSMS(SMS_SEND_SAVE_NEW, smsContent, arrayPhoneNum, smsTime);
			if (result == API_RESULT_SUCCESS) {
				sys.alert("ids_sms_saveDraftSuccess", function() {
					page.changePage("sms/smsList.html")
				})
			} else {
				sys.alert("ids_sms_saveDraftFailed", function() {
					page.changePage("sms/smsList.html")
				})
			}
		}
	}
	
	function startGetSendResult(refurbishBack) {
		
		if(refurbishBack && refurbishBack != null){
			interGetSendResult = setTimeout(function(){
			showResult(refurbishBack)}, 5000);
			}else{
				 interGetSendResult = setTimeout("showResult()", 5000);
				}
		
	}
	
	function showResult(refurbishBack) {
		var $showResultDiv = $("#showResultDiv");
		var $showResultDivLen = $showResultDiv.length;
		if ($showResultDivLen < 1) {
			return;
		}
		SDK.requestJsonRpcAsync("GetSendSMSResult", null, "6.7", function(data) {
			if (data != null && !data.hasOwnProperty("error")) {
				data = data.SendStatus;
				if (data == 1) {
						startGetSendResult(refurbishBack);
						  
				}
				if (data == 2) {
						sys.alert("ids_success", function() {
							if(refurbishBack && refurbishBack != null){
								AIRBOX.smsRead.initRead();
							}else{
								if(doAction == "new"|| doAction == "forward"){
									page.changePage("sms/smsList.html")
								}else{
									page.reloadMain();
								}						
							}
						})					
				}
				if (data == 3) {
					
					sys.alert("ids_sms_messageSending", function() {
						if(refurbishBack && refurbishBack != null){
						AIRBOX.smsRead.initRead();
						}else{							 
							if(doAction == "new"|| doAction == "forward"){
								page.changePage("sms/smsList.html")
							}else{
								page.reloadMain();
							}
						}
					})
				}
				if(data == 0 || data == 5) {
					
						sys.alert("ids_sms_sendFail", function() {
						if(refurbishBack && refurbishBack != null){
						AIRBOX.smsRead.initRead();
						}else{							 
							if(doAction == "new"|| doAction == "forward"){
								page.changePage("sms/smsList.html")
							}else{
								page.reloadMain();
							}
						}
					})
				}
			} else {
				callback(); // sendSms SMS failed
			}
		});
	}
	
	
	function listenCharCount() {		
		var msgInput = $("#messageContent");
	        var msgInputDom = msgInput[0];
	        var strValue = msgInput.val();
			var contentLength = strValue.length;
			var contentNum = 0;
			var smsCounts;
			var MaxLength = SMS_7BIT_MAX_SIZE;
			if (isUcs2(strValue)) {
				MaxLength = SMS_UCS2_MAX_SIZE;
				contentNum = contentLength;
				smsCounts = getSmsCountStr(contentLength, "ucs2");
			} else {
				contentNum = parseInt(contentLength + get7ExtNum(strValue));
				smsCounts = getSmsCountStr(contentNum, "7bit");
			}
			$("#smsCharCount").html(smsCounts);	
		
	        /*if (contentLength > MaxLength) {
	            var scrollTop = msgInputDom.scrollTop;
	            var insertPos = getInsertPos(msgInputDom);
	            var moreLen = contentLength - MaxLength;
	            var insertPart = strValue.substr(insertPos - moreLen > 0 ? insertPos - moreLen : 0, moreLen);
	            var reversed = insertPart.split('').reverse();
	            var checkMore = 0;
	            var cutNum = 0;
	            for (var i = 0; i < reversed.length; i++) {
	                checkMore++;              
	                if (checkMore >= moreLen) {
	                    cutNum = i + 1;
	                    break;
	                }
	            }
	            var iInsertToStartLength = insertPos - cutNum;
	            msgInputDom.value = strValue.substr(0, iInsertToStartLength) + strValue.substr(insertPos);
	            if(msgInputDom.value.length > MaxLength){
	                msgInputDom.value = msgInputDom.value.substr(0, MaxLength);
	            }
	            setInsertPos(msgInputDom, iInsertToStartLength);
	            msgInputDom.scrollTop = scrollTop;
	        }*/
	
	        var textLength = 0;
	        var newValue = $(msgInputDom).val();
			var $inputCount = $("#smsCharCount"); 
			if (counts>10) {
	            $inputCount.addClass("colorRed");           
	        } else {
	            $inputCount.removeClass("colorRed");            
	        }		
	}
	
	function getInsertPos(textbox) {
		var iPos = 0;
		if (textbox.selectionStart || textbox.selectionStart == "0") {
			iPos = textbox.selectionStart;
		} else if (document.selection) {
			textbox.focus();
			var range = document.selection.createRange();
			var rangeCopy = range.duplicate();
			rangeCopy.moveToElementText(textbox);
			while (range.compareEndPoints("StartToStart", rangeCopy) > 0) {
				range.moveStart("character", -1);
				iPos++;
			}
		}
		return iPos;
	}
	
	function setInsertPos(textbox, iPos) {
		textbox.focus();
		if (textbox.selectionStart || textbox.selectionStart == "0") {
			textbox.selectionStart = iPos;
			textbox.selectionEnd = iPos;
		} else if (document.selection) {
			var range = textbox.createTextRange();
			range.moveStart("character", iPos);
			range.collapse(true);
			range.select();
		}
	}
	
	function checkCount(isFirst) {
		if (currListType != "draft" && leftCount == 0) {
			return false;
		}
		var oldCount = 0;
		var newCount;
		var content = $("#messageContent").val();
		var isUCS2;
		if (isUcs2(content)) {
			isUCS2 = true;
		} else {
			isUCS2 = false;
		}
		if (currListType == "draft") {
			if (isUcs2(smsContent)) {
				oldCount = smsContent.length / (smsContent.length <= 70 ? 70 : 67);
			} else {
				oldCount = parseInt(smsContent.length + get7ExtNum(smsContent)) / (parseInt(smsContent.length + get7ExtNum(smsContent)) <= 160 ? 160 : 153);
			}
		}
		oldCount = Math.ceil(oldCount);
		if (isUCS2) {
			newCount = content.length / (content.length <= 70 ? 70 : 67) + newSmsCount;
		} else {
			newCount = parseInt(content.length + get7ExtNum(content)) / (parseInt(content.length + get7ExtNum(content)) <= 160 ? 160 : 153) + newSmsCount;
		}
	
	
		newCount = Math.ceil(newCount)
		var addCount = newCount - oldCount;
		if (!isFirst) {
			newSmsCount = addCount;
		}
		if (leftCount - addCount >= 0) {
			return true
		} else {
			return false;
		}
	}
	
	function getSmsCountStr(strLen, type) {
		var leftLen;
		var singleStrNumA, singleStrNumB;
		var isUcs2 = type === "ucs2";
		var totalNum;
		singleStrNumA = isUcs2 ? 70 : 160;
		singleStrNumB = isUcs2 ? 67 : 153;
	
		function isShowNumWarn(numLen, smsLen) {
			if (parseInt(numLen) * parseInt(smsLen) > 30) {
				$("#phoneNumbers").showRule("ids_sms_numberWarning");
			} else {
				$("#phoneNumbers").removeClass("errorIpt").parent().find(".rule").remove();
			}
		}
		if (strLen <= singleStrNumA) {
			G_SmsCounts = 1;
			$("#totalNumCount").html("5");
			isShowNumWarn(G_numCounts, G_SmsCounts)
			return (singleStrNumA - strLen) + "/(1)";
		} else if (strLen > singleStrNumA) {
			counts = Math.ceil(strLen / singleStrNumB);
			G_SmsCounts = counts;
			leftLen = strLen % singleStrNumB;
			leftLen = leftLen == 0 ? "0" : singleStrNumB - leftLen;
			totalNum = counts > 10 ? 3 : Math.floor(30 / counts);
			isShowNumWarn(G_numCounts, G_SmsCounts);
			$("#totalNumCount").html(totalNum);		
			return leftLen + "/(" + counts + ")";
		}
	}	
	function _initContactSelect(){
		var select = $("#chosenUserList .chzn-select-deselect");
		select.empty();
		var options = []//contactMsg;
		var tmp = [];
		var opts = "";
		$.each(options, function (i, e) {
			opts += "<option value='" + e.ContactId + "'>" + e.PhoneNumber[0] + "</option>";
		});
		
		select.append(opts);
		select.chosen({max_selected_options: 3, search_contains: true, width: '260px'});
	   //$("#chosenUserSelect").val(selectedNumber);
	   //$("#chosen-search-field-input").focus();
	   //$("#chosenUserSelect").trigger("liszt:updated");
	}
	
	function syncSelectAndChosen(select, choices){
		var choicesNums = getSelectValFromChosen(choices);
		select.val(choicesNums);
		return choicesNums;
	}
	
	function getSelectValFromChosen(choices){
		var choicesNums = [];
		$.each(choices, function(i,n){
			var arr = $(n).text().split('/');
			choicesNums.push(arr[arr.length - 1]);
		});
		return choicesNums;
	}
