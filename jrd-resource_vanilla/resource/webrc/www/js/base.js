//---------------- global ---------------------------------------
/* API result */
var API_RESULT_SUCCESS = 0;
var API_RESULT_FAIL = 1;

/*login state*/
var LOGIN_STATE_SUCCESS = 5;
var LOGIN_STATE_LOGOUT = 0;
var LOGIN_STATE_PASSWORD_WRONG = 1;
var LOGIN_STATE_SOME_ONE_LOGINED = 2;
var LOGIN_STATE_TIME_LIMIT = 6;

var MACRO_INVALID_STR = "-11111";
/*SIM card state*/

var  MACRO_UIM_APP_STATE_UNKNOWN_V01 = 0; 
var  MACRO_UIM_APP_STATE_DETECTED_V01 = 1; 
var  MACRO_UIM_APP_STATE_PIN1_OR_UPIN_REQ_V01 = 2; 
var  MACRO_UIM_APP_STATE_PUK1_OR_PUK_REQ_V01 = 3; 
var  MACRO_UIM_APP_STATE_PERSON_CHECK_REQ_V01 = 4; 
var  MACRO_UIM_APP_STATE_PIN1_PERM_BLOCKED_V01 = 5; 
var  MACRO_UIM_APP_STATE_ILLEGAL_V01 = 6; 
var  MACRO_UIM_APP_STATE_READY_V01 = 7; 
var  MACRO_SIM_CARD_INITING  = 11; 

/*SIM card PIN state*/
var  MACRO_UIM_PIN_STATE_UNKNOWN = 0; 
var  MACRO_UIM_PIN_STATE_ENABLED_NOT_VERIFIED = 1; 
var  MACRO_UIM_PIN_STATE_ENABLED_VERIFIED = 2; 
var  MACRO_UIM_PIN_STATE_DISABLED = 3; 
var  MACRO_UIM_PIN_STATE_BLOCKED = 4; 
var  MACRO_UIM_PIN_STATE_PERMANENTLY_BLOCKED = 5; 


var SIMLOCK_PERSO_NONE_REQUIRED = -1;/*no sim lock/sim lock unlock*/
var SIMLOCK_PERSO_NET_PIN_REQUIRED = 0; /*nck*/ 
var SIMLOCK_PERSO_NETSUB_PIN_REQUIRED = 1; /*nsck*/
var SIMLOCK_PERSO_SP_PIN_REQUIRED = 2;   /*spck*/
var SIMLOCK_PERSO_CORP_PIN_REQUIRED = 3; /*cck*/
var SIMLOCK_PERSO_PH_FSIM_PIN_REQUIRED = 4; /*pck*/

var SIMLOCK_PERSO_NET_PUK_REQUIRED = 15;  /*rck*/
var SIMLOCK_PERSO_NETSUB_PUK_REQUIRED =16;
var SIMLOCK_PERSO_SP_PUK_REQUIRED = 17;   
var SIMLOCK_PERSO_CORP_PUK_REQUIRED = 18; 
var SIMLOCK_PERSO_PH_FSIM_PUK_REQUIRED = 19;
var SIMLOCK_PERSO_RCK_FORBID = 30;/*rck forbid*/

var  MACRO__API_ERROR      = 255;
var MACRO_SAVE_PIN_ENABLED = 1;
var MACRO_SAVE_PIN_DISABLED = 0;

/*auto connect even when roaming*/
var CONNECTION_IS_AUTO_ROAM_DISABLE=0;
var CONNECTION_IS_AUTO_ROAM_ENABLE=1;

/**connection mode **/
var CONNECTION_MODE_MANUAL = 0;
var CONNECTION_MODE_AUTO = 1;


/*wan status*/
var MACRO_PPP_DISCONNECTED  = 0;
var MACRO_PPP_CONNECTING    = 1;
var MACRO_PPP_CONNECTED     = 2;
var MACRO_PPP_DISCONNECTING = 3;



var PPP_DIAL_AUTO = 0;
var PPP_DIAL_MANUAL = 1;

/*network type*/
var MACRO_NETWORKTYPE_NO_SERVICE = 0;
var MACRO_NETWORKTYPE_GPRS = 1;
var MACRO_NETWORKTYPE_EDGE = 2;
var MACRO_NETWORKTYPE_HSDPA = 3;
var MACRO_NETWORKTYPE_HSUPA = 4;
var MACRO_NETWORKTYPE_UMTS = 5;
var MACRO_NETWORKTYPE_CDMA = 6;
var MACRO_NETWORKTYPE_EV_DO_A = 7;
var MACRO_NETWORKTYPE_EV_DO_B = 8;
var MACRO_NETWORKTYPE_GSM = 9;
var MACRO_NETWORKTYPE_EV_DO_C = 10;
var MACRO_NETWORKTYPE_LTE = 11;
var MACRO_NETWORKTYPE_HSPA_PLUS = 12;
var MACRO_NETWORKTYPE_DC_HSPA_PLUS  = 13;
var MACRO_NETWORKTYPE_LTE_PLUS  = 14;

/*roam*/
var MACRO_ROAM_DISABLE  = 1;
var MACRO_ROAM_ENABLE  = 0;

/*wlan status*/
var MACRO_WLAN_DISABLED = 0;
var MACRO_WLAN_ENABLED = 1;
var MACRO_WLAN_WPS    = 2;

/*signal level*/
var MACRO_EVDO_LEVEL_ZERO = 0;
var MACRO_EVDO_LEVEL_ONE = 1;
var MACRO_EVDO_LEVEL_TWO = 2;
var MACRO_EVDO_LEVEL_THREE = 3;
var MACRO_EVDO_LEVEL_FOUR = 4;
var MACRO_EVDO_LEVEL_FIVE = 5;  //less battery
var MACRO_EVDO_API_ERROR    = 255;

var MACRO_BATTERY_CHARGING = 0;
var MACRO_BATTERY_COMPLATE = 1;
var MACRO_BATTERY_NOCHARGE = 2;


/*sms status*/
var MACRO_SMS_DISENABLE = 0;
var MACRO_SMS_FULL = 1;
var MACRO_SMS_NOREAD = 2;
var MACRO_SMS_READ= 3;

var SMS_HANDLE_FORWARD = 0;
var SMS_HANDLE_REPLY = 1;
var SMS_HANDLE_READ = 2;
var SMS_HANDLE_DRAFT = 3;
var SMS_HANDLE_SENT = 4;
var SMS_HANDLE_NEW  = 5;

/*security*/
var SECRUTIY_TYPE_DISABLE = 0;
var SECRUTIY_TYPE_WEP = 1;
var SECRUTIY_TYPE_WPA_PSK = 2;
var SECRUTIY_TYPE_WPS2_PSK = 3;
var SECRUTIY_TYPE_WPA_MIXED = 4;

/* network mode*/
var NETWORK_AUTOMATIC = 28;
var NETWORK_GSM_ONLY  = 4;
var NETWORK_WCDMA_ONLY = 8;
var NETWORK_LTE_ONLY  = 16

/*Select network mode*/
var SELECT_MODE_AUTOMATIC = 0;
var SELECT_MODE_MANUAL    = 1;

/***ussd send result***/
var USSD_SEND_RESULT_NONE = 0;
var USSD_SEND_RESULT_SENDING = 1;
var USSD_SEND_RESULT_COMPLETED = 2;
var USSD_SEND_RESULT_ERROR = 3;

/**USSD result content type**/
var USSD_RESULT_DONE = 1;
var USSD_RESULT_MORE = 2;
var USSD_RESULT_ABORT = 3;
var USSD_RESULT_OTHER = 4;
var USSD_RESULT_NOSUP = 5;
var USSD_RESULT_TIMEOUT = 6;

/***updata FOTA check result ***/
var VERSION_CHECKING=0;
var VERSION_NEW_YES=1;
var VERSION_NEW_NO=2
var VERSION_NO_CONNECT=3;
var VERSION_NO_SERVICE=4;

/***fota download status***/
var FOTA_DOWNLOAD_STATE_FREE=0;
var FOTA_DOWNLOAD_STATE_DOWNLOADING=1;
var FOTA_DOWNLOAD_STATE_COMPLETED=2;

/***fota barrtery info ***/
var FOTA_BATTERY_STATE_ON_ENOUGH=0;
var FOTA_BATTERY_STATE_ENOUGH=1;

/***fota auto update span***/

var FOTA_AUTO_UPDATE_ONEDAY=0;
var FOTA_AUTO_UPDATE_SEVENDAY=1;
var FOTA_AUTO_UPDATE_FIFTEENDAY=2;
var FOTA_AUTO_UPDATE_THIRTYDAY=3;

/*****need ussd active sim card***/

var USSD_ACTIVE_SIMCARD = 0;
var USSD_NO_ACTIVE_SIMCARD = 1;

/*not support char*/
var MACRO_SUPPORT_CHAR_MIN = 32;
var MACRO_SUPPORT_CHAR_MAX = 127;
var MACRO_NOT_SUPPORT_CHAR_COMMA = 44;             //,
var MACRO_NOT_SUPPORT_CHAR_QUOTATION_MARK = 34;      //"
var MACRO_NOT_SUPPORT_CHAR_COLON = 58;          //:
var MACRO_NOT_SUPPORT_CHAR_SEMICOLON = 59;          //;
var MACRO_NOT_SUPPORT_BACKSLASH_MARK = 92;         //\
var MACRO_NOT_SUPPORT_CHAR_38 = 38;        //&
var MACRO_NOT_SUPPORT_CHAR_39 = 39;        //'
var MACRO_NOT_SUPPORT_CHAR_42 = 42;         //*
var MACRO_NOT_SUPPORT_CHAR_47 = 47;         ///
var MACRO_NOT_SUPPORT_CHAR_60 = 60;         //<
var MACRO_NOT_SUPPORT_CHAR_62 = 62;         //>
var MACRO_NOT_SUPPORT_CHAR_63 = 63;         //?
var MACRO_NOT_SUPPORT_CHAR_124 = 124;         //|

/*ssid*/
var MACRO_WLAN_SSID_NUMBER_START = 48;
var MACRO_WLAN_SSID_NUMBER_END = 57;
var MACRO_WLAN_SSID_UP_CHAR_START = 65;
var MACRO_WLAN_SSID_UP_CHAR_END = 90;
var MACRO_WLAN_SSID_LOW_CHAR_START = 97;
var MACRO_WLAN_SSID_LOW_CHAR_END = 122;
var MACRO_WLAN_SSID_CHAR_UNDERLINE = 95;
var MACRO_WLAN_SSID_CHAR_DASH = 45;
var MACRO_WLAN_SSID_CHAR_DOT = 46;
var MACRO_WLAN_SSID_CHAR_SPACE = 32;

/*sd card*/
var MACRO_SD_IS_EXIST = 1;
var MACRO_SD_NOT_EXIST = 0;
var MACRO_SD_USB_ONLY = 1;
var MACRO_SD_WEB_ONLY = 0;
var MACRO_SD_SHARE_ENABLE = 1;
var MACRO_SD_SHARE_DISABLE = 0;
var MACRO_SD_ALL = 0;
var MACRO_SD_PATH_DEFINE = 1;
var MACRO_SD_READ_WRITE = 1;
var MACRO_SD_READ_ONLY = 0;

var DEFUALT_PROFILE_VALUE=1;


//wlan Mode Ghz
var WLAN_MODE_2GHZ=0;
var WLAN_MODE_5GHZ=1;
var WLAN_MODE_2GHZ_5GHZ=2;


/**battery status**/

var MACRO_BATTERY_CHARGING = 0;
var MACRO_BATTERY_COMPLATE = 1;
var MACRO_BATTERY_NOCHARGE = 2;

/***network select network type***/
var SE_NW_TYPE_GSM = 4;
var SE_NW_TYPE_UMTS = 5;
var SE_NW_TYPE_LTE = 8;
var SE_NW_TYPE_TD_SCDMA = 9;

/***network select network state***/
var SE_NW_STATE_AVAILABLE = 1;
var SE_NW_STATE_CURRENT = 2;
var SE_NW_STATE_FORBIDDEN = 3;

/***network select mode***/
var SEL_MODE_AUTOMATIC = 0;
var SEL_MODE_MANUAL = 1;

/*searching state*/
var SE_NW_NONE_SELECT =0;
var SE_NW_SELECTING= 1;
var SE_NW_SELECT_SUCCESS = 2;
var SE_NW_SELECT_FAILURE =3;

var SE_NW_REG_STAT_FAIL = 0;
var SE_NW_REG_STAT_SUCCESS = 1;
var SE_NW_REG_STAT_REGISTRATING = 2;

/*phoneBook location*/
var PB_LOCATION_SIM = 0;
var PB_LOCATION_LOCAL = 1;
var PB_LOCATION_ALL = 2;

/*phoneBook init state*/
var PB_INIT_STATE_COMPLETED = 1;
var PB_INIT_STATE_NOT_INIT = 0;
var PB_INIT_STATE_FAILED = 6;

var intervalgetNetworkList = null;
var intervalgetNetworkRegisterResult=null;
var interGetSendResult=null;

/*profile init state*/
var PROFILE_OPERATE_NEW = 1;
var PROFILE_OPERATE_EDIT = 0;
var PROFILE_USER_LEN = 15;
var PROFILE_TYPE_USER_DEFINE = 1;
var PROFILE_TYPE_BUILD_IN = 0;

/**mac filter ****/

var MAC_FILTER_DISABLE = 0;
var MAC_FILTER_ALLOW = 1;
var MAC_FILTER_DENY = 2;

/*ip-port filter*/
var FIREWALL_SWTICH_ENABLE = 1;
var FIREWALL_SWTICH_DISABLED = 0;
var FIREWALL_IP_PORT_FILTER_ENABLE = 1;
var FIREWALL_IP_PORT_FILTER_DISABLED = 0;



var popUp={
    show:function(options){
        var defaults = {
            type:"alert",
            width:"auto",
            height:"auto",
            title:"",
            msg:"",
            time:2000
        };
        $("body").css({
            background:"#b3b3b3"
        })
        var opts = $.extend(defaults, options);
        if($("#popUpMask").css("display")=="none"){
            if(!(!($.browser.msie&&($.browser.version == "6.0")&&!$.support.style))){
                $("#popUpMask,#popUpWrap").css({
                    height:$("#wrap").height()
                });
            }
            $("#popUpMask,#popUpWrap").css({
                display: "block"
            });
            $("#popUpMask").show("slow").css({
                opacity:0.3
            });
        }
        if(opts.type=="confirm"){
            $("#okBtnWrap,#cancelBtnWrap,#popUpClose").css({"display":"inline-block"});
            $("#popUpClose").unbind("click").bind("click",function(){
                popUp.hide();
            })
        }else if(opts.type=="alert"){
            $("#okBtnWrap,#popUpClose").css({
                display:"inline-block"
            });
            $("#cancelBtnWrap").hide(0);
            $("#popUpClose").unbind().bind("click",function(){
                popUp.hide();
                if ($.isFunction(opts.callback)) {
                    opts.callback.apply();
                }
            })
        }else{
            $("#okBtnWrap,#cancelBtnWrap,#popUpClose").hide(0);
            if(opts.time!=-1){
                setTimeout(function(){
                    popUp.hide();
                },opts.time)
            }
        }
        $("#popUpTitle").html(opts.title);
        $("#popUpContent").html(opts.msg);
        $("#popUpBox").css({
            "top":($("#wrap").height()-50-$("#popUpBox").outerHeight())/2+"px"
        }).fadeIn(200);

        if ($.browser.msie) {
            if (($.browser.version == "6.0" || $.browser.version == "7.0")&& $("#popUpBtnWrap .btnWrap").size()==0){
                $("#popUpBtnWrap .btnNormal").css("border","none");
                $("#popUpBtnWrap .btnNormal").wrap("<div class='btnWrap'></div>");
            }
        }

        $("#btnPopUpOk").unbind("click").bind("click",function(){
            popUp.hide();
            if ($.isFunction(opts.callback)) {
                opts.callback.apply();
            }
        })

        $("#cancelBtnWrap").unbind("click").bind("click",function(){
            popUp.hide();
        })
    },

    hide:function(){
        $("#popUpMask,#popUpWrap").fadeOut(0);
        $("#popUpBox").fadeOut(200);
        $("body").css({
            background:"#fff"
        })
    },

    alert:function(msg,callback){
        var option={
            type:"alert",
            msg:msg,
            callback:callback
        }
        popUp.show(option);
    },
    confirm:function(msg,callback){
        var option={
            type:"confirm",
            msg:msg,
            callback:callback
        }
        popUp.show(option);
    },
    prompt:function(msg,time){
        var option={
            type:"msg",
            msg:msg,
            time:time
        }
        popUp.show(option);
    },
    showBox:function(title,content){
        var option={
            type:"openBox",
            msg:content,
            title:title
        }
        popUp.show(option);
    }

}

var page={
    changePage: function(url){
        var that=this;
        $(window).unbind('hashchange', that.initload);
        url = url.replace(/^.*#/, '');
        document.location.hash=url;
        $.ajax({
            type: "GET",
            url: url+"?rand=" + Math.random(),
            dataType: "html",
            beforeSend:function(){
                that.startLoading()
            },
            complete:function(){
                that.stopLoading()
            },
            success: function(data){
                $("#mainBox").html("").empty().html(data); 
                $(window).bind('hashchange', that.initload);
            }
        
        });
    },
    initload:function (){
        var url = document.location.hash;
        url = url.replace(/^.*#/, '');
        if(url!=""){
            page.changePage(url)
        }else{
            page.changePage("connection/connectionStatus.html"); 
        }
    },
    
    reloadMain:function(){
        var url=location.href;
        page.changePage(url)
    },
    
    ajaxlink:function (){
        $('.changePageLink').live('click', function() {
            var url = $(this).attr('href');
            url = url.replace(/^.*#/, '');
            page.changePage(url);
        });
    },

    setCurrentMenu:function (currentMenu){
        if(currentMenu!=null){
            $("#topMenu li").removeClass("current");
            $("#topMenu li").eq(currentMenu-1).addClass("current");
        }
    },
    
    startLoading:function (){
        if(!(!($.browser.msie&&($.browser.version == "6.0")&&!$.support.style))){
            $("#mask,#loading").css({
                height:$("#wrap").height()
            });
        }
        $("#mask,#loading").css({
            display: "block"
        });
        $("#mask").css({
            opacity:0.01
        })
        
    },
    
    stopLoading: function (){
        $("#mask,#loading").css("display","none");
    },
    pageInit: function (){
        $(".btnNormal:enabled").bind("mouseover",function(){
            $(this).addClass("hover");
        })
        $(".btnNormal:enabled").bind("mouseout",function(){
            $(this).removeClass("hover");
        })
        $("button,a").bind('focus',function(){
            if(this.blur){
                this.blur();
            };
        });
        if ($.browser.msie) {
            if ($.browser.version == "6.0" || $.browser.version == "7.0"){
                $("#mainBox .btnNormal").css("border","none");
                $("#mainBox .btnNormal").wrap("<div class='btnWrap'></div>");
            }
        }
        if(pageName!="networkRegist" && intervalgetNetworkRegisterResult != null){
            clearInterval(intervalgetNetworkRegisterResult);
            intervalgetNetworkRegisterResult=null;
        }
        
        if(pageName!="networkSelection" && intervalgetNetworkList!=null){
            clearTimeout(intervalgetNetworkList);
            intervalgetNetworkList=null;
        }
        
        if(pageName!="sendResult" && interGetSendResult != null){
            clearTimeout(interGetSendResult);
            interGetSendResult=null;
        }
    }
    
}

var indexPage={
    init: function(){
        listenLogout.flushed();
        $("#tpl").replaceTpl()
        var that=this;
        var $logoutBtn=$("#logoutBtn");
        document.title=titleValue;
        if(sys.isLogin(sessionId)){
            that.initNav();
            page.initload();
            listenLogout.init();
            $logoutBtn.removeBtnDisabled();
		simSwitchShow();
        }else{
            $logoutBtn.setBtnDisabled()
            page.changePage("login.html")
        }  
        
        page.pageInit()
        page.ajaxlink();
        that.refreshImgStatus();
        that.startRefreshImgStatus();
        $logoutBtn.bind("click",that.logout)
    },
    
    initNav : function(){
        var $nav=$("#topMenu");
        $nav.find(".parent").addClass("hasLogin"); 
        $("#topMenu li").hover(function(){
            $("#topMenu li").removeClass("current");
            $(this).find("dl").stop(true,true).show();
            $(this).addClass("hover");
        },function(){
            $(this).find("dl").stop(true,true).hide();
            $(this).removeClass("hover");
            page.setCurrentMenu(currentMenu);
        })
        $("#topMenu li").bind("touchstart",function(){
            $("#topMenu li").removeClass("current hover");
            $("#topMenu").find("dl").stop(true,true).hide();
            $(this).find("dl").stop(true,true).show();
            $(this).addClass("hover"); 
        }) 
 
        $("#topMenu").find(".parent").click(function(){
            $("#topMenu li").removeClass("current hover")
            $("#topMenu").find("dl").stop(true,true).hide();
            $(this).parents("li").addClass("hover");
            $(this).next("dl").stop(true, true).show();
        })
        
        $("#mainBox").bind("touchstart click",function(){
            $("#topMenu li").removeClass("current hover");
            $("#topMenu").find("dl").stop(true,true).hide();
            page.setCurrentMenu(currentMenu);
        })
        $nav.find(".subMenu").find("a").live("click",function(){
            var url = $(this).attr('href');
            url = url.replace(/^.*#/, '');
            if(url!=""){
                page.changePage(url)
            }
            $nav.find(".subMenu").hide();
            $("#topMenu li").addClass("current");
            $("#topMenu li").removeClass("hover");
        })
    },


    logout:function () {
        Logout(function (result) {
            if (result == API_RESULT_SUCCESS) {
                location.reload();
            }
        })
    },
    
    showSignalState:function(iLen){
        var $signalImg = $("#signalImg");
        var value = /^[0,1,2,3,4,5]$/;
        iLen=parseInt(iLen);
        iLen=value.test(iLen)?iLen:0;
        $signalImg.css("background-position","center -"+iLen*26+"px");

    },

    showWanState:function (iwanState){
        var $wanImg = $("#wanImg");
        var value = /^[0,2]$/;
        iwanState=parseInt(iwanState);
        iwanState=value.test(iwanState)?iwanState:0;
        $wanImg.css("background-position","center -"+iwanState*26+"px");
    },

    showSmsState:function(ismsState){
        var $smsImg = $("#smsImg");
        var value = /^[0,1,2,3]$/;
        ismsState=parseInt(ismsState);
        ismsState=value.test(ismsState)?ismsState:0;
        $smsImg.css("background-position","center -"+ismsState*26+"px");

    },

    showBatteryState:function(ibatteryState,ibatterylvl){
        var $batteryImg=$("#batteryImg");
        $batteryImg.removeClass("charging");
        switch(ibatteryState){
            case MACRO_BATTERY_CHARGING:
                $batteryImg.addClass('charging');
                break;
            case MACRO_BATTERY_COMPLATE:
                if(!$batteryImg.hasClass("level_4")){
                    $batteryImg.addClass("level_4");
                }
                break;
            default:
                var level="level_"+ibatterylvl;
                if(!$batteryImg.hasClass(level)){
                    $batteryImg.addClass(level);
                }
        }
    },

    showWlanState:function(iwlanState){
        var $wlanImg=$("#wlanImg");
        var value = /^[0,1,2]$/;
        iwlanState=parseInt(iwlanState);
        iwlanState=value.test(iwlanState)?iwlanState:0;
        $wlanImg.css("background-position","center -"+iwlanState*26+"px");

    },

    refreshImgStatus:function () {
        var that = this;
        async_getImgInfo(function (data) {
            if (data == null) return;
            var _imgInfo = data;
            that.showSignalState(_imgInfo.signal);
            that.showSmsState(_imgInfo.sms);
            that.showBatteryState(_imgInfo.chg_state,_imgInfo.bat_level);
            if(pageName=="connectionStatus" || pageName=="login"){
                showCardInfo(_imgInfo.sim_state,_imgInfo.pin_state)
            }
        });
        async_getWanInfo(function (data) {
            if (data == null) return;
            that.showWanState(data.wan_state);
            if (pageName == "login") {
                showCurrentInfo(data.wan_state, data.download, data.upload, data.dur_time,data.roam);
                showWanInfo(data.wan_ip, data.network_type, data.network_name, data.wan_state,data.usage,data.wan_ip6);
            }
            if (pageName == "connectionStatus") {
                showCurrentInfo(data.wan_state, data.download, data.upload, data.dur_time, data.roam);
                showWanInfo(data.wan_ip, data.network_type, data.network_name, data.wan_state,data.usage,data.wan_ip6);
                showWanBox(data.wan_state);
            }
        });
        async_getWlanSettingInfo(function (data) {
            if (data == null) return;
            that.showWlanState(data.wifi_state);
            if (pageName == "login" || pageName == "connectionStatus") {
                var wlanModeGhz=data.wlan_mode;
                var maxNum=wlanModeGhz==WLAN_MODE_5GHZ?data.max_numsta_5g:data.max_numsta;
                showWlanInfo(wlanModeGhz,data.wifi_state, data.ssid, data.ssid_5g, data.security_mode, data.curr_num, maxNum);
            }
        });
    },

    refreshImgInterval:null,
    startRefreshImgStatus:function () {
        var that = this;
        if (that.refreshImgInterval != null) {
            that.stopRefreshImgStatus();
        }
        that.refreshImgInterval=setInterval(function(){
            that.refreshImgStatus();
        },10000);
    },

    stopRefreshImgStatus:function (){
        var that=this;
        if(that.refreshImgInterval != null){
            clearInterval(that.refreshImgInterval);
            that.refreshImgInterval = null;
        }
    }   
}

$(function() {
    if ($.browser.msie) {
        if ($.browser.version == "6.0" || $.browser.version == "7.0"){
            $("#navigation .btnNormal").css("border","none");
            $("#navigation .btnNormal").wrap("<div class='btnWrap'></div>");
        }
    }
})

var pageName;

function showCurrentInfo(wanState, currentDownRate, currentUpRate, connectTime, wanRoam) {
    var wanConnectStateStr;
    var downRateStr = 0;
    var connectTimeStr = 0;
    var roamStr = "";

    switch (wanState) {
        case MACRO_PPP_CONNECTED:
            wanConnectStateStr = sys.getRes("ids_wan_connected");
            downRate = (currentUpRate / (1024 * 1024)).toFixed(1) + " Mbps/" + (currentDownRate / (1024 * 1024)).toFixed(1) + " Mbps";
            connectTimeStr = sys.getTimeDesc(connectTime);
            break;
        case MACRO_PPP_CONNECTING:
            wanConnectStateStr = sys.getRes("ids_wan_connecting");
            break;
        case MACRO_PPP_DISCONNECTING:
            wanConnectStateStr = sys.getRes("ids_wan_disconnecting");
            break;
        default:
            wanConnectStateStr = sys.getRes("ids_wan_disconnect");
            break;
    }

    switch (parseInt(wanRoam)) {
        case MACRO_ROAM_ENABLE:
            roamStr = sys.getRes("ids_sim_roaming_yes");
            break;
        case MACRO_ROAM_DISABLE:
            roamStr = sys.getRes("ids_sim_roaming_no");
            break;
        default:
            roamStr = "NA";
    }


    $("#spnWanConnectState").html(wanConnectStateStr);
    $("#spnDownRate").html(downRateStr);
    $("#spnConnectTime").html(connectTimeStr);
    $("#spnWanRoam").html(roamStr);

}

function showWlanInfo(wlanModeGhz,wlanState, wlanSsid,wlanSsid_5G, wlanSecurityType, wlanConnectNumber, wlanMaxUser) {
    var wlanStateStr;
    var wlanSsidStr = wlanSsid.replace(/\s/g,"&nbsp;");
    var wlanSsidStr_5g=wlanSsid_5G.replace(/\s/g,"&nbsp;");
    var wlanSecurityTypeStr;
    var wlanUserStr = wlanConnectNumber + "/" + wlanMaxUser;

    switch (parseInt(wlanState)) {
        case MACRO_WLAN_ENABLED:
            wlanStateStr = sys.getRes("ids_on");
            break;
        case MACRO_WLAN_DISABLED:
            wlanStateStr = sys.getRes("ids_off");
            break;
        case MACRO_WLAN_WPS:
            wlanStateStr = sys.getRes("ids_wps");
            break;
    }

    switch (wlanSecurityType) {
        case SECRUTIY_TYPE_DISABLE:
            wlanSecurityTypeStr = sys.getRes("ids_wifi_securityDisable");
            break;
        case SECRUTIY_TYPE_WEP:
            wlanSecurityTypeStr = sys.getRes("ids_wifi_wep");
            break;
        case SECRUTIY_TYPE_WPA_PSK:
            wlanSecurityTypeStr = sys.getRes("ids_wifi_wpa");
            break;
        case SECRUTIY_TYPE_WPS2_PSK:
            wlanSecurityTypeStr = sys.getRes("ids_wifi_wpa2");
            break;
        case SECRUTIY_TYPE_WPA_MIXED:
            wlanSecurityTypeStr = sys.getRes("ids_wifi_wpaWpa2Psk");
            break;
        default:
            wlanSecurityTypeStr = sys.getRes('ids_sim_unknown');
    }
    $("#trSsid_2g,#trSsid_5g").css("display","none");
    if(wlanModeGhz==WLAN_MODE_5GHZ){
        $("#trSsid_5g").css("display","");
    }else{
        $("#trSsid_2g").css("display","");
    }

    $("#spnWlanState").html(wlanStateStr);
    $("#spnWlanSecurity").html(wlanSecurityTypeStr);
    $("#spnWlanSsid").html(wlanSsidStr);
    $("#spnWlanSsid_5g").html(wlanSsidStr_5g);
    $("#spnWlanUser").html(wlanUserStr);
}

function showCardInfo(simState, pinState) {
    var simStateStr;

    switch (simState) {
        case MACRO_UIM_APP_STATE_UNKNOWN_V01:
            simStateStr = sys.getRes('ids_sim_noSimCard');
            break;
        case MACRO_UIM_APP_STATE_PIN1_OR_UPIN_REQ_V01:
            simStateStr = sys.getRes('ids_sim_pinRequired');
            break;
        case MACRO_UIM_APP_STATE_PUK1_OR_PUK_REQ_V01:
            simStateStr = sys.getRes('ids_sim_pukRequired');
            break;
        case MACRO_UIM_APP_STATE_READY_V01:
            simStateStr = sys.getRes('ids_sim_ready');
            break;
        case MACRO_UIM_APP_STATE_DETECTED_V01:
            simStateStr = sys.getRes('ids_sim_initializing');
            break;
        case MACRO_UIM_APP_STATE_PERSON_CHECK_REQ_V01:
            simStateStr = sys.getRes('ids_sim_locked');
            break;
        case MACRO_UIM_APP_STATE_ILLEGAL_V01:
            simStateStr = sys.getRes('ids_sim_invalidSimCard');
            break;
        default:
            simStateStr = sys.getRes('ids_sim_unknown');
    }

    $("#spnSimState").html(simStateStr);
}

function showWanInfo(wanIpAddr, networkType, networkName, wanState,wanUsage,wanIP6) {
    var wanIpaddrStr;
    var wanNetworkNameStr;
    var wanNetworkTypeStr;
    var wanIpV6AddrStr;
    var wanUsageStr=sys.covertNum(wanUsage==null?0:wanUsage);

    wanIpaddrStr = (wanState != MACRO_PPP_CONNECTED) ? "0.0.0.0" : sys.getIpAddr(wanIpAddr);
    wanIpV6AddrStr=(wanState != MACRO_PPP_CONNECTED) ? "0::0" : sys.getIpAddr(wanIP6);

    switch (networkName) {
        case "CHINA UNICOM":
        case "CHN CU":
            wanNetworkNameStr = sys.getRes('ids_network_operatorName');
            break;
        case "":
            wanNetworkNameStr = "NA";
            break;
        default:
            wanNetworkNameStr = networkName;
    }

    switch (networkType) {
        case MACRO_NETWORKTYPE_NO_SERVICE:
            wanNetworkTypeStr = sys.getRes("ids_network_noService");
            break;
        case MACRO_NETWORKTYPE_GSM:
            wanNetworkTypeStr = sys.getRes("ids_network_gsm");
            break;
        case MACRO_NETWORKTYPE_GPRS:
            wanNetworkTypeStr = sys.getRes("ids_network_gprs");
            break;
        case MACRO_NETWORKTYPE_EDGE:
            wanNetworkTypeStr = sys.getRes("ids_network_edge");
            break;
        case MACRO_NETWORKTYPE_UMTS:
            wanNetworkTypeStr = "UMTS";
            break;
        case MACRO_NETWORKTYPE_HSDPA:
            wanNetworkTypeStr = sys.getRes("ids_network_hsdpa");
            break;
        case MACRO_NETWORKTYPE_HSUPA:
            wanNetworkTypeStr = sys.getRes("ids_network_hsupa");
            break;
        case MACRO_NETWORKTYPE_CDMA:
            wanNetworkTypeStr = "CDMA";
            break;
        case MACRO_NETWORKTYPE_LTE:
            wanNetworkTypeStr = "LTE";
            break;
        case MACRO_NETWORKTYPE_HSPA_PLUS:
            wanNetworkTypeStr = "HSPA+";
            break;
        case MACRO_NETWORKTYPE_DC_HSPA_PLUS:
            wanNetworkTypeStr = "DC-HSPA+";
            break;
        case MACRO_NETWORKTYPE_EV_DO_A:
        case MACRO_NETWORKTYPE_EV_DO_B:
        case MACRO_NETWORKTYPE_EV_DO_C:
            wanNetworkTypeStr = "EV-DO";
            break;
        default:
            wanNetworkTypeStr = sys.getRes("ids_network_noService");
    }

    $("#spnWanIpAddr").html(wanIpaddrStr);
    $("#spnWanNetworkName").html(wanNetworkNameStr);
    $("#spnWanNetworkType").html(wanNetworkTypeStr);
    $("#spnWanUsage").html(wanUsageStr);
    $("#spnWanIpV6Addr").html(wanIpV6AddrStr);
}

function getSimCardState(simState, pinState) {
    var state;
    switch (simState) {
        case MACRO_UIM_APP_STATE_UNKNOWN_V01:
            state = "noCard";
            break;
        case MACRO_UIM_APP_STATE_PIN1_OR_UPIN_REQ_V01:
            state = "pinReq";
            break;
        case MACRO_UIM_APP_STATE_PUK1_OR_PUK_REQ_V01:
            state = "pukReq";
            break;
        case MACRO_UIM_APP_STATE_READY_V01:
            state = "normal";
            break;
        case MACRO_UIM_APP_STATE_DETECTED_V01:
            state = "simError";
            break;
        case MACRO_UIM_APP_STATE_PERSON_CHECK_REQ_V01:
            state = "simLock";
            break;
        case MACRO_UIM_APP_STATE_ILLEGAL_V01:
            state = "invalid";
            break;
        default:
            state = "noCard";
    }

    return state;

}

function formatHtmlStr(str) {
    var args = arguments, re = new RegExp("%([1-" + args.length + "])", "g");
    return String(str).replace(re, function ($1, $2) {
            return args[$2];
        }
    );
}

function simSwitchShow(){
	var deviceSlotMode = getDeviceSlotMode().device_slot_mode;
	if(deviceSlotMode==0 || deviceSlotMode==1){
		$("#ddSimSwich").css("display","");
	}else{
		$("#ddSimSwich").css("display","none");
	}
}
function initSimCard(callback){
     $.getData({
        async:true,
        url:"/goform/getSimcardInfo?rand=" + Math.random(),
        success:function(data) {
            if(data.sim_state == MACRO_SIM_CARD_INITING){
                setTimeout(function(){
                    initSimCard(callback);
                },2000);
            }else{
                callback();
            }
        }
    })
}

function pageInitSimCard(){
    page.startLoading();
    initSimCard(function(){
        $.getData({
            async:true,
            url:"/goform/getSimcardInfo?rand=" + Math.random(),
            success:function(data) {
                if(data.sim_state == MACRO_UIM_APP_STATE_READY_V01){
                    initProfileList(function(){
                        page.stopLoading();
                        page.reloadMain();
                    }) 
                }else{
                    page.stopLoading();
                    page.reloadMain();
                }
            }
        })
    });
}

function initProfileList(callback){
    $.getData({
        async:true,
        url:"/goform/getProfileList?rand=" + Math.random(),
        success:function(data) {
            if(data.state == 0){
                setTimeout(function(){
                    initProfileList(callback);
                },2000);
            }else{
                callback();
            }
        }
    })
}


var sys = {
    getRes:function (strId) {
        return resourceInfo[strId];
    },

    getIpAddr:function (IP) {
        if (IP == MACRO_INVALID_STR) {
            return "0.0.0.0";
        } else {
            return IP;
        }
    },

    isLogin:function (sessionId) {
        return (sessionId == 1 || sessionId == 0 || sessionId == 2) ? false : true;
    },
    alert:function (strId, callback) {
        var resMsg = resourceInfo[strId];
        /*
        alert((resMsg != null || resMsg != undefined) ? resMsg : strId);
        if (callback != null) callback();
        */
        popUp.alert(callback==null?(resMsg!=undefined?resMsg:strId):resMsg!=undefined?resMsg:strId,callback);
    },
    confirm:function (strId, callback) {
        var resMsg = resourceInfo[strId];
        popUp.confirm(callback==null?(resMsg!=undefined?resMsg:strId):resMsg!=undefined?resMsg:strId,callback);
    },
    prompt:function(strId,time){
        var resMsg = resourceInfo[strId];
        popUp.prompt(time==null?(resMsg!=undefined?resMsg:strId):resMsg!=undefined?resMsg:strId,time)
    },

    getTimeDesc:function (time_sec) {
        var that = this;
        var days = Math.floor(time_sec / 86400);
        var hours = Math.floor((time_sec - days * 86400) / 3600);
        var minutes = Math.floor((time_sec - days * 86400 - hours * 3600) / 60);
        var str = "";
        str += days + " " + ((days <= 1) ? that.getRes("ids_day") : that.getRes("ids_days")) + " ";
        str += hours + " " + ((hours <= 1) ? that.getRes('ids_hour') : that.getRes('ids_hours')) + " ";
        str += ((minutes < 10) ? "0" : "") + minutes + " " + ((minutes <= 1) ? that.getRes("ids_minute") : that.getRes("ids_minutes"));
        return str;
    },

    covertNum:function (number) {
       return number > (1024 * 1024 * 1024)?(number / (1024 * 1024 *1024)).toFixed(2) + " GB":(number > (1024 * 1024) ? (number / (1024 * 1024)).toFixed(2) + " MB" : (number / 1024).toFixed(2) + " KB");
    }
};

(function () {
    var cache = {};
    this.tmpl = function (template_id, data) {
        var fn = cache[template_id];
        this.get = function (dataid) {
            var id = dataid.split(":")[0];
            var res = data[id] ? (dataid.charAt(dataid.length - 1) == ":" ? data[id] + ':' : data[id]) : 'null';
            return res;
        }
        if (!fn) {
            var template = document.getElementById(template_id).innerHTML;
            fn = new Function("data", "var p=[]; p.push('" +
                template
                    .replace(/[\r\t\n]/g, " ")
                    .split("'").join("\\'")
                    .replace(/\${(.+?)}/g, "',this.get(\'$1\'),'")
                    .split("${").join("');")
                    .split("}").join("p.push('")
                + "');return p.join('');");
            cache[template_id] = fn;
        }
        return fn();
    };
})();

(function ($) {
    $.extend({
        postForm:function (options) {
            var defaults = {
                action:"",
                dataType:"json",
                error:function () {
                    sys.alert("ids_dlg_sys_request_error");
                }
            };
            var opts = $.extend(defaults, options);
            $.ajax({
                type:"post",
                url:opts.action + "?rand=" + Math.random(),
                data:opts.data || {some:"a"},
                async:false,
                cache:false,
                dataType:opts.dataType,
                success:function (data) {
                    opts.success(data);
                },
                error:function () {
                    opts.error()
                }
            });

        },

        getData:function (options) {
            var backdata = null;
            var defaults = {
                url:"",
                type:"post",
                data:"d=1",
                async:false,
                dataType:"json",
                success:function (data) {
                    backdata = data;
                }
            };
            var opts = $.extend(defaults, options);
            $.ajax({
                type:opts.type,
                async:opts.async,
                url:opts.url,
                data:opts.data,
                dataType:opts.dataType,
                success:function (data) {
                    opts.success(data)
                },
                error:function () {
                    backdata = null
                }
            });
            return backdata;
        }

    });

    $.fn.extend({
        findSelectRes:function (datas) {
            return this.each(function () {
                var option_HtmlStr = "";
                $.each(datas,function(index,val) {
                    option_HtmlStr += "<option value='" + index + "'>"+val + "</option>"
                });
                $(this).html(option_HtmlStr)
            });
        },
        setBtnDisabled:function(){
            return this.each(function(){
                $(this).attr("disabled",true).addClass("btnDisable").removeClass("hover");
                if ($.browser.msie) {
                    if ($.browser.version == "6.0" || $.browser.version == "7.0"){
                        $(this).parent(".btnWrap").addClass("disable");
                    }
                }
            })
        },
        removeBtnDisabled:function(){
            return this.each(function(){
                $(this).removeAttr("disabled").removeClass("btnDisable");
                if ($.browser.msie) {
                    if ($.browser.version == "6.0" || $.browser.version == "7.0"){
                        $(this).parent(".btnWrap").removeClass("disable");
                    }
                }
            })
        },

        setData:function(data){
            return this.each(function(){
                $(this).html(data[$(this).attr("id")]);
            })
        },

        replaceTpl:function(){
            return this.each(function(){
                $(this).replaceWith(tmpl($(this).attr("id"),resourceInfo));
            })
        },
        selectFocus:function () {
            return this.each(function () {
                $(this).val("").focus();
            })
        },
	showRule:function (ruleStr) {
            var ruleMsg=sys.getRes(ruleStr)
            return this.each(function () {
                var thisParent = $(this).parent("li");
                var ruleBox = thisParent.find(".rule");
                if (ruleBox.size() < 1) {
                    thisParent.append("<p class='rule'>" + ruleMsg + "</p>")
                } else {
                    thisParent.find(".rule").html(ruleMsg);
                }

                //$(this).selectFocus();
                $(this).addClass("errorIpt");
                $(this).bind("focusin",function(){
                    $(this).removeClass("errorIpt");
                    thisParent.find(".rule").remove();
                });
            });
        },
	showWarn:function (ruleStr) {
            var ruleMsg=sys.getRes(ruleStr)
            return this.each(function () {
                var ruleBox = $("#warning").find(".rule");
                if (ruleBox.size() < 1) {
                    $("#warning").addClass("rule").html(ruleMsg).css("display","");
                }
                $(this).addClass("errorIpt");
                $(this).bind("focusin",function(){
                    $(this).removeClass("errorIpt");
                    $("#warning").html("").removeClass("rule");
                });
            });
        }

    });
})(jQuery);
function getUrlPara(paraName) {
    var sUrl = location.href;
    var sReg = "(?:\\?|&){1}" + paraName + "=([^&]*)"
    var re = new RegExp(sReg, "gi");
    re.exec(sUrl);
    return RegExp.$1;
}

function check_password(str) {
    return /^[A-Za-z0-9\-\+\!\^\$\@\#\&\*]{4,16}$/.test(str);
}

function check_ssid(str) {
    return /^[A-Za-z0-9\.\s\-\_]+$/.test(str);
}

function check_profile_password(str) {
    return     !(/[\s'\"\\]/g.test(str))
}

function checkProfileName(name){
    return !(/[:;\,\"\\&%<>?\+]+/g.test(name));
}


function show_sms_time(sms_time) {
    var time_i = parseInt(sms_time);

    var time_base = new Date(1980, 0, 6, 0, 0, 0, 0);

    var time_space = time_base.getTime();

    var all_time_space = new Date(time_i * 1000 + time_space);

    var nowDateTime = new Date(parseInt((all_time_space.getTime())));

    var year = nowDateTime.getFullYear();
    var month = nowDateTime.getMonth() + 1;
    var day = nowDateTime.getDate();

    return year + "-" + month + "-" + day + " " + nowDateTime.toLocaleTimeString();

//return nowDateTime.toLocaleDateString() + " " + nowDateTime.toLocaleTimeString(); 
}
function show_SD_time(sms_time) {
    var time_i = parseInt(sms_time);

    //var time_base = new Date(1970,0,6,0,0,0,0);

    //var time_space = time_base.getTime(); 

    var all_time_space = new Date(time_i * 1000);

    var nowDateTime = new Date(parseInt((all_time_space.getTime())));

    var year = nowDateTime.getFullYear();
    var month = nowDateTime.getMonth() + 1;
    var day = nowDateTime.getDate();

    return year + "-" + month + "-" + day + " " + nowDateTime.toLocaleTimeString();

//return nowDateTime.toLocaleDateString() + " " + nowDateTime.toLocaleTimeString();	 
}

function isASCIIData(str) {
    if (str == null) {
        return true;
    }
    var i = 0;
    var char_i;
    var num_char_i;
    for (i = 0; i < str.length; i++) {
        char_i = str.charAt(i);
        num_char_i = char_i.charCodeAt();
        if (num_char_i > 255) {
            return false;
        }
    }
}

function isHexaDigit(digit) {
    var hexVals = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "a", "b", "c", "d", "e", "f");
    var len = hexVals.length;
    var i = 0;
    var ret = false;

    for (i = 0; i < len; i++) {
        if (digit == hexVals[i]) {
            break;
        }
    }

    if (i < len) {
        ret = true;
    }
    return ret;
}

function isHexaData(data) {
    var len = data.length;
    var i = 0;
    for (i = 0; i < len; i++) {
        if (isHexaDigit(data.charAt(i)) == false) {
            return false;
        }
    }
    return true;
}

function check_input_char(str) {
    var i;
    var char_i;
    var num_char_i;

    if (str == "") {
        return true;
    }

    for (i = 0; i < str.length; i++) {
        char_i = str.charAt(i);
        num_char_i = char_i.charCodeAt();
        if ((num_char_i > MACRO_SUPPORT_CHAR_MAX) || (num_char_i < MACRO_SUPPORT_CHAR_MIN)) {
            return false;
        }
        else if ((MACRO_NOT_SUPPORT_CHAR_QUOTATION_MARK == num_char_i)
            || (MACRO_NOT_SUPPORT_CHAR_COLON == num_char_i)
            || (MACRO_NOT_SUPPORT_CHAR_SEMICOLON == num_char_i)
            || (MACRO_NOT_SUPPORT_BACKSLASH_MARK == num_char_i)
            || (MACRO_NOT_SUPPORT_CHAR_38 == num_char_i)
            ) {
            return false;
        }
        else {
            continue;
        }
    }
    return true;
}

function is_wep_key(key, key_encrp) {
    var len = key.length;
    if (key_encrp == 0) {
        if (len != 5 && len != 10) {
            return false;
        }
    }

    if (key_encrp == 1) {
        if (len != 13 && len != 26) {
            return false;
        }


    }
    switch (len) {
        case 5:
        case 13:
            if (isASCIIData(key) == false) {
                return false;
            }
            break;
        case 10:
        case 26:
            if (isHexaData(key) == false) {
                return false;
            }
            break;
        default:
            return false;
    }
    return true;
}

function isNumber(str) {
    var i;
    if (str.length <= 0) {
        return false;
    }
    for (i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        if (c < 48 || c > 57) {
            return false;
        }
    }
    return true;
}

function IsSameSubnetAddrs(Ip1, Ip2, mask) {
    var addrParts1 = Ip1.split(".");
    var addrParts2 = Ip2.split(".");
    var maskParts = mask.split(".");
    for (i = 0; i < 4; i++) {
        if (((Number(addrParts1[i])) & (Number(maskParts[i]))) != ((Number(addrParts2[i])) & (Number(maskParts[i])))) {
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

function getLeftMostZeroBitPos(num) {
    var i = 0;
    var numArr = [128, 64, 32, 16, 8, 4, 2, 1];

    for (i = 0; i < numArr.length; i++)
        if ((num & numArr[i]) == 0)
            return i;

    return numArr.length;
}

function getRightMostOneBitPos(num) {
    var i = 0;
    var numArr = [1, 2, 4, 8, 16, 32, 64, 128];

    for (i = 0; i < numArr.length; i++)
        if (((num & numArr[i]) >> i) == 1)
            return (numArr.length - i - 1);

    return -1;
}

function isValidSubnetMask(mask) {
    var i = 0;
    var num = 0;
    var zeroBitPos = 0, oneBitPos = 0;
    var zeroBitExisted = false;

    if (mask == '0.0.0.0') {
        return false;
    }

    if (mask == '255.255.255.255') {
        return false;
    }

    var maskParts = mask.split('.');
    if (maskParts.length != 4) {
        return false;
    }

    for (i = 0; i < 4; i++) {
        if (isNaN(maskParts[i]) == true) {
            return false;
        }
        if (maskParts[i] == '') {
            return false;
        }
        if (maskParts[i].indexOf(' ') != -1) {
            return false;
        }

        if ((maskParts[i].indexOf('0') == 0) && (maskParts[i].length != 1)) {
            return false;
        }

        num = parseInt(maskParts[i]);
        if (num < 0 || num > 255) {
            return false;
        }
        if (zeroBitExisted == true && num != 0) {
            return false;
        }
        zeroBitPos = getLeftMostZeroBitPos(num);
        oneBitPos = getRightMostOneBitPos(num);
        if (zeroBitPos < oneBitPos) {
            return false;
        }
        if (zeroBitPos < 8) {
            zeroBitExisted = true;
        }
    }

    return true;
}

function isValidIpAddress(address) {
    var addrParts = address.split('.');
    if (addrParts.length != 4) {
        return false;
    }

    for (i = 0; i < 4; i++) {
        if (isNaN(addrParts[i]) == true) {
            return false;
        }

        if (addrParts[i] == '') {
            return false;
        }

        if (addrParts[i].indexOf(' ') != -1) {
            return false;
        }

        if ((addrParts[i].indexOf('0') == 0) && (addrParts[i].length != 1)) {
            return false;
        }
    }

    if ((addrParts[0] <= 0 || addrParts[0] == 127 || addrParts[0] > 223)
        || (addrParts[1] < 0 || addrParts[1] > 255)
        || (addrParts[2] < 0 || addrParts[2] > 255)
        || (addrParts[3] <= 0 || addrParts[3] >= 255)) {
        return false;
    }

    return true;
}
function inet_aton(a) {
    var n;

    n = a.split(/\./);
    if (n.length != 4) {
        return 0;
    }
    return ((n[0] << 24) | (n[1] << 16) | (n[2] << 8) | n[3]);
}

function inet_ntoa(n) {
    var a;

    a = (n >> 24) & 255;
    a += "."
    a += (n >> 16) & 255;
    a += "."
    a += (n >> 8) & 255;
    a += "."
    a += n & 255;

    return a;
}

function is_broadcast_or_network_address(Ip, Netmask) {
    var ip;
    var mask;
    var netaddr;
    var broadaddr;

    ip = inet_aton(Ip);
    mask = inet_aton(Netmask);
    netaddr = ip & mask;
    broadaddr = netaddr | ~mask;

    if (netaddr == ip || ip == broadaddr) {
        return false;
    }

    return true;
}

function check_host_name(name) {
    var doname = /^([\w-]+\.)+(home)$/;
    if (!doname.test(name)) {
        return false;
    }
    return true;
}

function check_input_dirname(str) {
    var i;
    var char_i;
    var num_char_i;

    if (str == "") {
        return true;
    }

    for (i = 0; i < str.length; i++) {
        char_i = str.charAt(i);
        num_char_i = char_i.charCodeAt();
        if ((MACRO_NOT_SUPPORT_CHAR_COMMA == num_char_i)
            || (MACRO_NOT_SUPPORT_CHAR_QUOTATION_MARK == num_char_i)
            || (MACRO_NOT_SUPPORT_CHAR_COLON == num_char_i)
            || (MACRO_NOT_SUPPORT_CHAR_SEMICOLON == num_char_i)
            || (MACRO_NOT_SUPPORT_BACKSLASH_MARK == num_char_i)
            || (MACRO_NOT_SUPPORT_CHAR_38 == num_char_i)
            || (MACRO_NOT_SUPPORT_CHAR_42 == num_char_i)
            || (MACRO_NOT_SUPPORT_CHAR_60 == num_char_i)
            || (MACRO_NOT_SUPPORT_CHAR_62 == num_char_i)
            || (MACRO_NOT_SUPPORT_CHAR_63 == num_char_i)
            || (MACRO_NOT_SUPPORT_CHAR_42 == num_char_i)
            || (MACRO_NOT_SUPPORT_CHAR_47 == num_char_i)
            || (MACRO_NOT_SUPPORT_CHAR_124 == num_char_i)
            ) {
            return false;
        } else {
            continue;
        }
    }
    return true;
}

var Vendor = (function () {

    function getLoginState(){
        var gData=null;
        gData = $.getData({
            url:"/goform/getLoginState?rand=" + Math.random()
        })
        return gData.loginStatus;
    }

    function Login(params, callback) {
        $.postForm({
            action:"/goform/setLogin",
            data:params,
            success:function (data) {
                callback(data);
            }
        })

    }

    function Logout(callback) {
        $.postForm({
            action:"/goform/setLogout",
            success:function (data) {
                callback(data.error);
            }
        })
    }

    function getLanguage() {
        var currentLanguage = "en";
        var data = $.getData({
            url:"/goform/getCurrentLanguage?rand=" + Math.random()
        })
        return currentLanguage = data.language;
    }

    function SetLanguage(strLanguageString, callback) {
        $.postForm({
            action:"/goform/setLanguage",
            data:{
                "language":strLanguageString
            },
            success:function (data) {
                callback(data.error);
            }
        })

    }

    function SetPassword(params, callback) {
        $.postForm({
            action:"/goform/setPassword",
            data:params,
            success:function (data) {
                callback(data);
            }
        })
    }


    function getWlanSettingInfo() {
        var gData = null;
        gData = $.getData({
            url:"/goform/getWlanInfo?rand=" + Math.random()
        });
        return gData;
    }

    function async_getWlanSettingInfo(callback) {
        $.getData({
            async:true,
            url:"/goform/getWlanInfo?rand=" + Math.random(),
            success:function (data) {
                callback(data)
            }
        })

    }


    function setWlanSettingInfo(params, callback) {
        $.postForm({
            action:"/goform/setWlanInfo",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }


    function getSimcardInfo() {
        var gData = null;
        gData = $.getData({
            url:"/goform/getSimcardInfo?rand=" + Math.random()
        });
        return gData;
    }


    function set_unlockPIN(params, callback) {
        $.postForm({
            action:"/goform/unlockPIN",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }

    function set_unlockPUK(params, callback) {
        $.postForm({
            action:"/goform/unlockPUK",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }

    function set_changePIN(params, callback) {
        $.postForm({
            action:"/goform/changePIN",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }

    //enable or disable
    function set_switchPIN(params, callback) {
        $.postForm({
            action:"/goform/switchPIN",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }

    function disablePIN(params, callback) {
        $.postForm({
            action:"/goform/switchPIN",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }
	
    function setUnlockSIMLock(params, callback) {
        $.postForm({
            action:"/goform/unlockSIMLock",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }

    function getSMSList(type,pageNum){
        var gData=null;
        gData = $.getData({
            data:"key="+type+"&pageNum=" + pageNum,
            url:"/goform/getSMSlist?rand=" + Math.random()
        });
        return {
            "list":gData.data
        }
    }



    function getSMSStoreState() {
        var gData = null;
        gData = $.getData({
            url:"/goform/getSMSStoreState?rand=" + Math.random()
        });
        return gData;
    }

    function getPageInfo(type){
        var gData = null;
        gData = $.getData({
            url:"/goform/getSMSPageInfo?key="+type+"&rand=" + Math.random()
        });
        return gData;
    }


    function getSingleSMS(sms_id) {
        var gData = null;
        gData = $.getData({
            url:"/goform/getSingleSMS?sms_id=" + sms_id + "&rand=" + Math.random()
        });
        return gData;
    }

    function deleteSMS(sms_id, callback) {
        $.postForm({
            action:"/goform/deleteSMS",
            data:{
                "sms_id":sms_id
            },
            success:function (data) {
                callback(data.error);
            }
        })
    }

    function sendSMS(params, callback) {
        $.postForm({
            action:"/goform/sendSMS",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }

    function saveSMS(params, callback) {
        $.postForm({
            action:"/goform/saveSMS",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }

    function setSMSSetting(params, callback) {
        $.postForm({
            action:"/goform/setSMSSetting",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }


    function async_getSendSMSResult(callback) {
        $.getData({
            async:true,
            url:"/goform/getSendSMSResult?rand=" + Math.random(),
            success:function (data) {
                callback(data.send_state)
            }
        })
    }

    function getNetworkSetting() {
        var gData = null;
        gData = $.getData({
            url:"/goform/getNetworkInfo?rand=" + Math.random()
        });
        return gData;
    }

    function setNetworkSetting(params, callback) {
        $.postForm({
            action:"/goform/setNetworkInfo",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }

    function setNetworkSelect(params, callback) {
        $.postForm({
            action:"/goform/setNetworkSelect",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }

    function getNetworkList() {
        var gData = null;
        gData = $.getData({
            url:"/goform/getNetworkList?rand=" + Math.random()
        });
        return gData;
    }

    function setNetworkRegister(params, callback) {
        $.postForm({
            action:"/goform/setNetworkRegister",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }

    function getNetworkRegisterResult() {
        var gData = null;
        gData = $.getData({
            url:"/goform/getNetworkRegisterResult?rand=" + Math.random()
        });
        return gData.regist_state;
    }

    function getWanInfo() {
        var gData = null;
        gData = $.getData({
            url:"/goform/getWanInfo?rand=" + Math.random()
        });
        return gData;
    }

    function async_getWanInfo(callback) {
        $.getData({
            async:true,
            url:"/goform/getWanInfo?rand=" + Math.random(),
            success:function (data) {
                callback(data)
            }
        })

    }


    function setWanConnect(params, callback) {
        $.postForm({
            action:"/goform/setWanConnect",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }

    function setWanDisconnect(callback) {
        $.postForm({
            action:"/goform/setWanDisconnect",
            success:function (data) {
                callback(data.error);
            }
        })
    }
    
    function setCancelWanConnect(callback){
        $.postForm({
            action:"/goform/setWanConnectCancel",
            success:function (data) {
                callback(data.error);
            }
        })
    }

    function getCurrentDialProfile() {
        var gData = null;
        gData = $.getData({
            url:"/goform/getCurrentProfile?rand=" + Math.random()
        });
        return gData.profile_id;
    }

    function getRouterSetting() {
        var gData = null;
        gData = $.getData({
            url:"/goform/getRouterInfo?rand=" + Math.random()
        });
        return gData;
    }

    function setRouterSetting(params, callback) {
        $.postForm({
            action:"/goform/setRouterSetting",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }


    function getSystInfo() {
        var gData = null;
        gData = $.getData({
            url:"/goform/getSysteminfo?rand=" + Math.random()
        });
        return gData;
    }

    function getImgInfo() {
        var gData = null;
        gData = $.getData({
            url:"/goform/getImgInfo?rand=" + Math.random()
        });
        return gData;
    }

    function async_getImgInfo(callback) {
        $.getData({
            async:true,
            url:"/goform/getImgInfo?rand=" + Math.random(),
            success:function (data) {
                callback(data)
            }
        })
    }

    function setWpsPin(params, callback) {
        $.postForm({
            action:"/goform/setWpsPin",
            data:params,
            success:function (data) {
                callback(data);
            }
        })
    }

    function setWpsPbc(callback) {
        $.postForm({
            action:"/goform/setWpsPbc",
            success:function (data) {
                callback(data);
            }
        })
    }

    function getWanConnectMode() {
        var gData = null;
        gData = $.getData({
            url:"/goform/getWanConnectMode?rand=" + Math.random()
        });
        return gData;
    }


    function setWanConnectMode(params, callback) {
        $.postForm({
            action:"/goform/setWanConnectMode",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }

    function getRouterInfo() {
        var gData = null;
        gData = $.getData({
            url:"/goform/getRouterInfo?rand=" + Math.random()
        });
        return gData;
    }


    function setRouterInfo(params, callback) {
        $.postForm({
            action:"/goform/setRouterInfo",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }

    function getUseHistory() {
        var gData = null;
        gData = $.getData({
            url:"/goform/getUseHistory?rand=" + Math.random()
        });
        return gData;
    }


    function setUseHistoryClear(params, callback) {
        $.postForm({
            action:"/goform/setUseHistoryClear",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }

    function getWlanClientInfo() {
        var gData = null;
        gData = $.getData({
            url:"/goform/getWlanClientInfo?rand=" + Math.random()
        });
        return gData.data;
    }

    function getProfileList() {
        var gData = null;
        gData = $.getData({
            url:"/goform/getProfileList?rand=" + Math.random()
        });
        return gData;
    }

    function getMACFilterInfo() {
        var gData = null;
        gData = $.getData({
            url:"/goform/getMACFilterInfo?rand=" + Math.random()
        });
        return gData;

    }

    function setMACFilterInfo(params, callback) {
        $.postForm({
            action:"/goform/setMACFilterInfo",
            data:params,
            success:function (data) {
                callback(data);
            }
        })
    }

    function setProfileSave(params, callback) {
        $.postForm({
            action:"/goform/setProfileSave",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }

    function setProfileDefault(params, callback) {
        $.postForm({
            action:"/goform/setProfileDefault",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }

    function setProfileDelete(params, callback) {
        $.postForm({
            action:"/goform/setProfileDelete",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }

    function setReboot(params, callback) {
        $.postForm({
            action:"/goform/setReboot",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }

    function setReset(params, callback) {
        $.postForm({
            action:"/goform/setReset",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }

    function setBackupSettings(params, callback) {
        $.postForm({
            action:"/goform/setBackupSettings",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }

    function getBackupSettings() {
        $("body").append("<iframe src='/cfgbak/configure.bin' style='display: none'></iframe>");
    }

    function setWifiSwitch(params,callback){
        $.postForm({
            action:"/goform/setWifiSwitch",
            data:params,
            success:function (data) {
                callback(data);
            }
        })
    }
	
	function getPortFwding() {
        var gData = null;
        gData = $.getData({
            url:"/goform/getPortFwding?rand=" + Math.random()
        });
        return gData;

    }
	
	function addPortFwding(params,callback){
        $.postForm({
            action:"/goform/addPortFwding",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }
	
	function deletePortFwding(params,callback){
        $.postForm({
            action:"/goform/deletePortFwding",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }
	
	function editPortFwding(params,callback){
        $.postForm({
            action:"/goform/editPortFwding",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }
	
	function getFirewallSwitch(){
		var gData = null;
        gData = $.getData({
            url:"/goform/getFirewallSwitch?rand=" + Math.random()
        });
        return gData;
	}
	
	function setFirewallSwitch(params,callback){
		 $.postForm({
            action:"/goform/setFirewallSwitch",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
	}
	
	function getIPFilterList(){
		var gData = null;
		gData = $.getData({
			url:"/goform/getIPFilterList?rand=" + Math.random()
		});
		return gData;
	}
	
	function addIPFilter(params,callback){
		$.postForm({
			action:"/goform/addIPFilter",
			data:params,
            success:function (data) {
                callback(data.error);
            }
		})
	}
	
	function editIPFilter(params,callback){
		$.postForm({
			action:"/goform/editIPFilter",
			data:params,
            success:function (data) {
                callback(data.error);
            }
		})
	}
	
	function deleteIPFilter(params,callback){
		$.postForm({
			action:"/goform/deleteIPFilter",
			data:params,
            success:function (data) {
                callback(data.error);
            }
		})
	}
	
	function getDMZInfo(){
		var gData = null;
		gData = $.getData({
			url:"/goform/getDMZInfo?rand=" + Math.random()
		});
		return gData;
	}
	
	function setDMZInfo(params,callback){
		$.postForm({
			action:"/goform/setDMZInfo",
			data:params,
            success:function (data) {
                callback(data.error);
            }
		})
	}
	
	function getUsbIP(){
		var gData = null;
		gData = $.getData({
			url:"/goform/getUsbIP?rand=" + Math.random()

		});
		return gData;
	}
	
    function getUSSDSendResult(callback) {
        var gData = null;
        gData = $.getData({
            url:"/goform/getUSSDSendResult?rand=" + Math.random()
        });
        return gData;
    }
    function async_getUSSDSendResult(callback) {
        $.getData({
            async:true,
            url:"/goform/getUSSDSendResult?rand=" + Math.random(),
            success:function (data) {
                callback(data)
            }
        })
    } 

    function setUSSDSend(params, callback){
        $.postForm({
            action:"/goform/setUSSDSend",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }
    
    function async_getUSSDEnd(callback){
        $.getData({
            async:true,
            url:"/goform/setUSSDEnd?rand=" + Math.random(),
            success:function (data) {
                callback(data)
            }
        })
    }

	function getDeviceCurrentSIM(){
		var gData = null;
        gData = $.getData({
            url:"/goform/getDeviceCurrentSIM"
        });
        return gData;
	}
	
	function setDeviceChangeSIM(params, callback){
		$.postForm({
            action:"/goform/setDeviceChangeSIM",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
	}
	
	function getDeviceSlotMode(){
		var gData = null;
		gData = $.getData({
            url:"/goform/getDeviceSlotMode"
        });
        return gData;
	}
	
	function getFOTADownloadState(){
        var gData = null;
        gData = $.getData({
            url:"/goform/getFOTADownloadState"
        });
        return gData.state;
    }
    
    function setFOTAStartCheckVersion(callback){
        $.postForm({
            action:"/goform/setFOTAStartCheckVersion",
            success:function (data) {
                callback(data.error);
            }
        })
    }

   function getFOTAServerVersion(){
        var gData = null;
        gData = $.getData({
            url:"/goform/getFOTAServerVersion"
        });
        return gData.server_version;
    }
	
    function getDeviceNewVersion(){
        var gData = null;
        gData = $.getData({
            url:"/goform/getDeviceNewVersion"
        });
        return gData.is_new_version;
    }


    function getFOTADownloadInfo(){
        var gData = null;
        gData = $.getData({
            url:"/goform/getFOTADownloadInfo"
        });
        return gData;
    }

    function setFOTAStartDownload(callback){
        $.postForm({
            action:"/goform/setFOTAStartDownload",
            success:function (data) {
                callback(data.error);
            }
        })
    }


    function setFOTACancelDownload(callback){
        $.postForm({
            action:"/goform/setFOTACancelDownload",
            success:function (data) {
                callback(data.error);
            }
        })
    }

    function getFOTABatteryState(){
        var gData = null;
        gData = $.getData({
            url:"/goform/getFOTABatteryState"
        });
        return gData.batt_is_enough;
    }
    function setFOTAStartUpdate(callback){
         $.postForm({
         action:"/goform/setFOTAStartUpdate",
         success:function (data) {
         callback(data.error);
         }
         })
    }
	
	function setQXDMStart(params, callback) {
        $.postForm({
            action:"/goform/startCatchLog",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }
	
	function setQXDMStop(params, callback) {
        $.postForm({
            action:"/goform/stopCatchLog",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }
	
    function getQXDMLoglocation(){
        var gData = null;
        gData = $.getData({
            url:"/goform/getLogConfig"
        });
        //return gData.log_location;
	if(gData == null){
          return 0;
	}else{
		  return gData.log_location;
	}
    }
	
	function setQXDMLoglocation(params, callback) {
        $.postForm({
            action:"/goform/saveLogConfig",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }
    function getQXDMStatus(){
        var gData = null;
        gData = $.getData({
            url:"/goform/getQXDMStatus"
        });
		
	if(gData == null){
          return 0;
		}else{
		  return gData.qxdm_status;
	   }
    }

	function setPanicSwitch(params, callback) {
        $.postForm({
            action:"/goform/setDebugMode",
            data:params,
            success:function (data) {
                callback(data.error);
            }
        })
    }
    function getPanicStatus(){
        var gData = null;
        gData = $.getData({
			data:"key=resume",
            url:"/goform/getDebugMode"
        });
		
	if(gData == null){
          return 0;
		}else{
		  return gData.resume;
	   }
    }
	
    return {
        getLoginState:getLoginState,
        Login:Login,
        Logout:Logout,
        getLanguage:getLanguage,
        SetLanguage:SetLanguage,
        SetPassword:SetPassword,
        getWlanSettingInfo:getWlanSettingInfo,
        async_getWlanSettingInfo:async_getWlanSettingInfo,
        setWlanSettingInfo:setWlanSettingInfo,
        getSimcardInfo:getSimcardInfo,
        set_unlockPIN:set_unlockPIN,
        set_unlockPUK:set_unlockPUK,
        set_changePIN:set_changePIN,
        set_switchPIN:set_switchPIN,
        disablePIN:disablePIN,
        setUnlockSIMLock:setUnlockSIMLock,
        getSMSList:getSMSList,
        getPageInfo:getPageInfo,
        getSMSStoreState:getSMSStoreState,
        getSingleSMS:getSingleSMS,
        deleteSMS:deleteSMS,
        sendSMS:sendSMS,
        saveSMS:saveSMS,
        setSMSSetting:setSMSSetting,
        async_getSendSMSResult:async_getSendSMSResult,
        getNetworkSetting:getNetworkSetting,
        setNetworkSetting:setNetworkSetting,
        setNetworkSelect:setNetworkSelect,
        getNetworkList:getNetworkList,
        setNetworkRegister:setNetworkRegister,
        getNetworkRegisterResult:getNetworkRegisterResult,
        getWanInfo:getWanInfo,
        async_getWanInfo:async_getWanInfo,
        setWanConnect:setWanConnect,
        setWanDisconnect:setWanDisconnect,
        setCancelWanConnect:setCancelWanConnect,
        getCurrentDialProfile:getCurrentDialProfile,
        getRouterSetting:getRouterSetting,
        setRouterSetting:setRouterSetting,
        getSystInfo:getSystInfo,
        getImgInfo:getImgInfo,
        async_getImgInfo:async_getImgInfo,
        setWpsPin:setWpsPin,
        setWpsPbc:setWpsPbc,
        getWanConnectMode:getWanConnectMode,
        setWanConnectMode:setWanConnectMode,
        getRouterInfo:getRouterInfo,
        setRouterInfo:setRouterInfo,
        getUseHistory:getUseHistory,
        setUseHistoryClear:setUseHistoryClear,
        getWlanClientInfo:getWlanClientInfo,
        getProfileList:getProfileList,
        getMACFilterInfo:getMACFilterInfo,
        setMACFilterInfo:setMACFilterInfo,
        setProfileSave:setProfileSave,
        setProfileDefault:setProfileDefault,
        setProfileDelete:setProfileDelete,
        setReboot:setReboot,
        setReset:setReset,
        setBackupSettings:setBackupSettings,
        getBackupSettings:getBackupSettings,
        setWifiSwitch:setWifiSwitch,
        getPortFwding:getPortFwding,
        addPortFwding:addPortFwding,
        deletePortFwding:deletePortFwding,
        editPortFwding:editPortFwding,
        getFirewallSwitch:getFirewallSwitch,
        setFirewallSwitch:setFirewallSwitch,
        getIPFilterList:getIPFilterList,
        addIPFilter:addIPFilter,
        editIPFilter:editIPFilter,
        deleteIPFilter:deleteIPFilter,
        getDMZInfo:getDMZInfo,
        setDMZInfo:setDMZInfo,
        getUsbIP:getUsbIP,
        getUSSDSendResult:getUSSDSendResult,
        async_getUSSDSendResult:async_getUSSDSendResult,
        setUSSDSend:setUSSDSend,
	async_getUSSDEnd:async_getUSSDEnd,
        getDeviceCurrentSIM:getDeviceCurrentSIM,
        setDeviceChangeSIM:setDeviceChangeSIM,
        getDeviceSlotMode:getDeviceSlotMode,
        getFOTADownloadState:getFOTADownloadState,
        getDeviceNewVersion:getDeviceNewVersion,
        getFOTADownloadInfo:getFOTADownloadInfo,
        setFOTAStartDownload:setFOTAStartDownload,
        setFOTACancelDownload:setFOTACancelDownload,
        getFOTABatteryState:getFOTABatteryState,
        setFOTAStartUpdate:setFOTAStartUpdate,
        setFOTAStartCheckVersion:setFOTAStartCheckVersion,
	setQXDMStart:setQXDMStart,
	setQXDMStop:setQXDMStop,
	getQXDMLoglocation:getQXDMLoglocation,
	setQXDMLoglocation:setQXDMLoglocation,
	getQXDMStatus:getQXDMStatus,
	setPanicSwitch:setPanicSwitch,
	getPanicStatus:getPanicStatus
		
    }


})();

$.extend(window, Vendor);
var sessionId = getLoginState();


