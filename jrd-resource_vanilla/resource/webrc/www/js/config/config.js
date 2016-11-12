/**
 * 参数配置
 * @module config
 * @class config
 */
define(function() {
	var config = {
        IS_TEST: zte_web_ui_is_test, //配置项在main.js顶部
        HAS_LOGIN:true,//是否有登录页面
		defaultRoute : '#login',
        LOGIN_SECURITY_SUPPORT: true, //是否支持登录安全
        MAX_LOGIN_COUNT: 5,//最大登录次数，密码输入错误次数到了以后会账户冻结一定时间
		THEME : 'mac',
		DEVICE: 'ufi/mf90',
        PASSWORD_ENCODE: false,//登录密码和WIFI密码是否加密
		HAS_MULTI_SSID: false,//多ssid功能
        HAS_WIFI: true,  //是否包含wifi功能
        HAS_BATTERY: true, //是否有电池
        SHOW_MAC_ADDRESS: true, //是否显示mac地址
        IPV6_SUPPORT: true, //是否支持ipv6
        USE_IPV6_INTERFACE:true,//使用IPV6相关新接口。使用方法，例如使用MF92时，设置为false。
        MAX_STATION_NUMBER: 32, //WIFI最大连接数
        NETWORK_UNLOCK_SUPPORT:true,//是否支持解锁
        WIFI_BAND_SUPPORT: false, //是否支持wifi频段设置
        WIFI_BANDWIDTH_SUPPORT: false, //是否支持频带宽度
        UPGRADE_TYPE:"FOTA",//取值有"NONE","OTA","FOTA","TWO_PORTION"
        ALREADY_NOTICE:false,//是否已经提醒，有在线升级信息
        HAS_OTA_NEW_VERSION:false,//是否有OTA升级的新版本
        ALREADY_OTA_NOTICE:false,//是否OTA升级提醒过
        AP_STATION_SUPPORT:true,//是否支持AP Station功能
        AP_STATION_LIST_LENGTH:10,
        HAS_PHONEBOOK:true,//是否有电话本功能
        HAS_SMS:true,//是否有短信功能
        SMS_DATABASE_SORT_SUPPORT: true,//短信是否支持DB排序
        SHOW_UN_COMPLETE_CONCAT_SMS: true,//级联短信未接收完是否显示相关级联短信
        SMS_UNREAD_NUM_INCLUDE_SIM: false,//未读短息数量是否包含SIM侧
        SD_CARD_SUPPORT: false,//是否支持SD卡
        WEBUI_TITLE: '4G Hostless Modem', //title配置, 具体参考各设备下的配置
        //modem_main_state的临时状态，一般需要界面轮询等待
        TEMPORARY_MODEM_MAIN_STATE:["modem_undetected", "modem_detected", "modem_sim_state", "modem_handover", "modem_imsi_lock", "modem_online", "modem_offline"],
        SHOW_APN_DNS:false,//APN设置页面是否显示DNS，不显示则dnsMode默认设置为auto
        SMS_FLAG:"",
        USSD_FLAG:"",
        CONTENT_MODIFIED:{
            modified:false,
            message:'leave_page_info',
            data:{},
            checkChangMethod:function () {
                return false;
            },
            callback:{ok:$.noop, no:function () {
                return true;
            }}//如果no返回true,页面则保持原状
        }, //当前页面内容是否已经修改

        resetContentModifyValue:function () {
            this.CONTENT_MODIFIED.checkChangMethod = function () {
                return false;
            };
            this.CONTENT_MODIFIED.modified = false;
            this.CONTENT_MODIFIED.message = 'leave_page_info';
            this.CONTENT_MODIFIED.callback = {ok:$.noop, no:function () {
                return true;
            }};//如果no返回true,页面则保持原状
            this.CONTENT_MODIFIED.data = {};
        },

        /**
         * 端口转发最大规则数
         * @attribute {Integer} portForwardMax
         */
        portForwardMax: 16,
        /**
         * 出厂设置默认APN的个数
         * @attribute {Integer} defaultApnSize
         */
        defaultApnSize:2,
        /**
         * 最大APN个数
         * @attribute {Integer} maxApnNumber
         */
        maxApnNumber: 10,
		NETWORK_MODES : [ {
			name : '802.11 b',
			value : '0'
		}, {
			name : '802.11 g',
			value : '1'
		}, {
			name : '802.11 b/g/n',
			value : '2'
		}, {
			name : 'auto',
			value : '3'
		} ],
		NETWORK_MODES_BAND : [  {
			name : '802.11 a',
			value : '4'
		}, {
			name : '802.11 a/c',
			value : '6'
		} ],
		
    	AUTH_MODES : [  {
        	name: 'NO ENCRYPTION',
        	value: 'OPEN'
        }, {
            name : 'WPA2(AES)-PSK',
            value : 'WPA2PSK'
        },{
        	name : 'WPA-PSK/WPA2-PSK',
        	value : 'WPAPSKWPA2PSK'
        } ],
        AUTH_MODES_ALL : [  {
            name: 'NO ENCRYPTION',
            value: 'OPEN'
        }, {
            name : 'SHARED',
            value : 'SHARED'
        }, {
            name : 'WPA-PSK',
            value : 'WPAPSK'
        }, {
            name : 'WPA2-PSK',
            value : 'WPA2PSK'
        }, {
            name : 'WPA-PSK/WPA2-PSK',
            value : 'WPAPSKWPA2PSK'
        } ],

        LANGUAGES: [ { 
        	name: 'Русский',
        	value: 'ru'
        }, {
            name: 'English',
            value: 'en'
        } ],
        
        AUTO_MODES: [ {
        	name: 'Automatic',
        	value: 'WCDMA_preferred'
        }, {
        	name: '3G Only',
        	value: 'Only_WCDMA'
        }, {
        	name: '2G Only',
        	value: 'Only_GSM'
        } ],
		APN_AUTH_MODES : [ {
			name : "NONE",
			value : "none"
		}, {
			name : "CHAP",
			value : "chap"
		}, {
			name : "PAP",
			value : "pap"
		} ],        
        SMS_VALIDITY: [ {
            name: '12 hours',
            value: 'twelve_hours'
        }, {
            name: 'A day',
            value: 'one_day'
        }, {
            name: 'A week',
            value: 'one_week'
        }, {
            name: 'The longest period',
            value: 'largest'
        }],
        SLEEP_MODES : [ {
            name : "Always on",
            value : "0"
        }, {
            name : "5 minutes",
            value : "1"
        }, {
            name : "10 minutes",
            value : "2"
        }, {
            name : "20 minutes",
            value : "3"
        }, {
            name : "30 minutes",
            value : "4"
        }, {
            name : "1 hour",
            value : "5"
        }, {
            name : "2 hours",
            value : "6"
        } ],

        FORWARD_PROTOCOL_MODES: [ {
            name : "TCP+UDP",
            value : "TCP&UDP"
        }, {
            name : "TCP",
            value : "TCP"
        }, {
            name : "UDP",
            value : "UDP"
        }],

        MAP_PROTOCOL_MODES: [ {
            name : "TCP+UDP",
            value : "TCP&UDP"
        }, {
            name : "TCP",
            value : "TCP"
        }, {
            name : "UDP",
            value : "UDP"
        }],

        FILTER_PROTOCOL_MODES: [ {
            name : "NONE",
            value : "None"
        }, {
            name : "TCP",
            value : "TCP"
        }, {
            name : "UDP",
            value : "UDP"
        }, {
            name : "ICMP",
            value : "ICMP"
        }, {
            name : "TCP/UDP",
            value : "TCP_UDP"
        }],  
        
        FILTER_RULE_STATE_MODES:[
         {
             name : "On",
             value : "on"
         }, {
             name : "Off",
             value : "off"
         }                     
        ],
		
        FILTER_MAC_POLICY: [ {
            name : "disable",
            value : "0"
        }, {
            name : "allow",
            value : "1"
        }, {
            name : "deny",
            value : "2"
        }],
		
        OLED_TIME_ITEM: [ {
            name : "never",
            value : "0"
        }, {
            name : "15 s",
            value : "1"
        }, {
            name : "20 s",
            value : "2"
        }, {
            name : "30 s",
            value : "3"
        }, {
            name : "1 min",
            value : "4"
        }, {
            name : "2 min",
            value : "5"
        }, {
            name : "5 min",
            value : "6"
        }, {
            name : "10 min",
            value : "7"
        }, {
            name : "30 min",
            value : "8"
        }],

    	/**
    	 * 数据库中全部的短消息
    	 * @attribute {Array} dbMsgs 
    	 */
    	dbMsgs : [],
    	/**
    	 * 经解析关联后的所有短消息
    	 * @attribute {Array} listMsgs 
    	 */
    	listMsgs : [],

    	/**
    	 * 当前聊天对象的手机号
    	 * @attribute {String} currentChatObject 
    	 */
    	currentChatObject: null,
    	/**
    	 * 短消息最大编号
    	 * @attribute {Integer} maxId 
    	 */
    	smsMaxId : 0,
    	/**
    	 *  电话本记录 
    	 * @attribute {Array} phonebook  
    	 * */
    	phonebook : [],
        /**
         *  缓存短信初始化状态
         * @attribute {Boolean} smsIsReady
         * */
        smsIsReady: false,
        /**
         * 国家码所述类型
         * @attribute {JSON} defaultApnSize
         * @example
         * 2412-2462   1
		 * 2467-2472   2
		 * 2312-2372   4
         */
        countryCodeType : {
        	world: 3,
        	mkkc: 3,
        	apld: 7,
        	etsic: 3,
        	fcca: 1
        },
        
        /**
         * 国家码与类型匹配表
         * @attribute {Map} countryCode
         */
        countryCode: {
            world: [ "AL", "DZ", "AR", "AM", "AU", "AT", "AZ", "BH", "BY",
                "BE", "BA", "BR", "BN", "BG", "CL", "CN", "CR", "HR", "CY",
                "CZ", "DK", "EC", "EG", "SV", "EE", "FI", "FR", "F2", "GE",
                "DE", "GR", "HN", "HK", "HU", "IS", "IN", "ID", "IR", "IE",
                "IL", "IT", "JM", "JO", "KZ", "KE", "KP", "KR", "KW", "LV",
                "LB", "LI", "LT", "LU", "MO", "MK", "MY", "MT", "MC", "MA",
                "NL", "AN", "NO", "OM", "PK", "PE", "PH", "PL", "PT", "QA",
                "RO", "SA", "CS", "SG", "SK", "SI", "ZA", "ES", "LK",
                "SE", "CH", "SY", "TH", "TT", "TN", "TR", "UA", "AE", "GB",
                "UY", "VN", "YE", "ZW" ],
            mkkc: [ "JP" ],
            apld: [],
            etsic: [ "BZ", "BO", "NZ", "VE" ],
            fcca: [ "CA", "CO", "DO", "GT", "MX", "PA", "PR", "TW", "US", "UZ" ]
        },
        countryCode_5g: {
            //88 countries of world【36 40 44 48】
            one: {
                codes: [ "AL", "AI", "AW", "AT", "BY", "BM", "BA", "BW", "IO", "BG",
                    "CV", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "GF", "PF",
                    "TF", "GI", "DE", "GR", "GP", "GG", "HU", "IS", "IE", "IT",
                    "KE", "LA", "LV", "LS", "LI", "LT", "LU", "MK", "MT", "IM",
                    "MQ", "MR", "MU", "YT", "MC", "ME", "MS", "NL", "AN", "NO",
                    "OM", "PL", "PT", "RE", "RO", "SM", "SN", "RS", "SK", "SI",
                    "ZA", "ES", "SE", "CH", "TC", "UG", "GB", "VG", "WF", "ZM",
                    "AF", "JO", "MA", "EH", "EU", "DZ", "IL", "MX", "PM", "TN",
                    "TR", "JP" ],
                channels: [36, 40, 44, 48]},
            //60 countrys of world【36 40 44 48 149 153 157 161 165】
            two: {
                codes: [ "AS", "AG", "AZ", "BR", "KH", "KY", "CO", "CR", "DM", "DO",
                    "EC", "GH", "GD", "HK", "KZ", "KI", "FM", "MZ", "NA", "NZ",
                    "NI", "NE", "PW", "PE", "PH", "PR", "VC", "TH", "TT", "UY",
                    "ZW", "AU", "BH", "BB", "CA", "CL", "CX", "EG", "SV", "GT",
                    "HT", "IN", "MY", "NF", "PA", "PG", "SG", "US", "VN" ],
                channels: [36, 40, 44, 48, 149, 153, 157, 161, 165]},
            //9 countrys of world【149 153 157 161】
            three: {
                codes: ["CU", "IR", "KR", "SY", "LB", "MW", "MO", "QA"],
                channels: [149, 153, 157, 161]},
            //12 countrys of world【149 153 157 161 165】
            four: {
                codes: [ "BD", "BF", "CN", "HN", "JM", "PK", "PY", "KN", "AR", "TW", "NG" ],
                channels: [149, 153, 157, 161, 165]},
            //1 country of world【36 40 44 48 149 153 157 161】
            five: {
                codes: [ "SA" ],
                channels: [36, 40, 44, 48, 149, 153, 157, 161]}
        },

        /**
         * 国家码与语言匹配表
         * @attribute {Map} countries
         */
        countries: {
            NONE: "NONE",
            AL: "SHQIPERI",
            DZ: "الجزائر",
            AR: "ARGENTIA",
            AM: "ՀԱՅԱՍՏԱՆ",
            AU: "AUSTRALIA",
            AT: "ÖSTERREICH",
            AZ: "AZƏRBAYCAN",
            BH: "البحرين",
            BY: "БЕЛАРУСЬ",
            BE: "BELGIË",
            BA: "БОСНА И ХЕРЦЕГОВИНА",
            BR: "BRASIL",
            BN: "BRUNEI DARUSSALAM",
            BG: "БЪЛГАРИЯ",
            CL: "CHILE",
            CN: "中国",
            CR: "COSTA RICA",
            HR: "HRVATSKA",
            CY: "ΚΎΠΡΟΣ",
            CZ: "ČESKÁ REPUBLIKA",
            DK: "DANMARK",
            EC: "ECUADOR",
            EG: "مصر",
            SV: "EL SALVADOR",
            EE: "EESTI",
            FI: "SUOMI",
            FR: "FRANCE",
            F2: "FRANCE RESERVES",
            GE: "საქართველო",
            DE: "DEUTSCHLAND",
            GR: "ΕΛΛΆΔΑ",
            HN: "HONDURAS",
            HK: "香港",
            HU: "MAGYARORSZÁG",
            IS: "ÍSLAND",
            IN: "INDIA",
            ID: "INDONESIA",
            IR: "ایران، جمهوری اسلامی",
            IE: "ÉIRE",
            IL: "إسرائيل",
            IT: "ITALIA",
            JM: "JAMAICA",
            JO: "الأردن",
            KZ: "КАЗАХСТАН",
            KE: "KENYA",
            KP: "조선민주주의인민공화국",
            KW: "الكويت",
            LV: "LATVIJA",
            LB: "لبنان",
            LI: "LIECHTENSTEIN",
            LT: "LIETUVA",
            LU: "LUXEMBOURG",
            MO: "澳門",
            MK: "МАКЕДОНИЈА",
            MY: "MALAYSIA",
            MT: "MALTA",
            MC: "MONACO",
            MA: "المغرب",
            NL: "NEDERLAND",
            AN: "NETHERLANDS ANTILLES",
            NO: "NORGE",
            OM: "سلطنة عمان",
            PK: "PAKISTAN",
            PE: "PERÚ",
            PH: "PHILIPPINES",
            PL: "POLSKA",
            PT: "PORTUGAL",
            QA: "قطر",
            RO: "ROMÂNIA",
            SA: "السعودية",
            CS: "Црна Гора",
            SG: "SINGAPORE",
            SK: "SLOVENSKÁ REPUBLIKA",
            SI: "SLOVENIJA",
            ZA: "SOUTH AFRICA",
            ES: "ESPAÑA",
            LK: "SRI LANKA",
            SE: "SVERIGE",
            CH: "SCHWEIZ",
            SY: "الجمهورية العربية السورية",
            TH: "ประเทศไทย",
            TT: "TRINIDAD AND TOBAGO",
            TN: "تونس",
            TR: "TÜRKİYE",
            UA: "Україна",
            AE: "الإمارات العربية المتحدة",
            GB: "UNITED KINGDOM",
            UY: "URUGUAY",
            VN: "VIỆT NAM",
            YE: "اليمن",
            ZW: "ZIMBABWE",
            JP: "日本",
            BZ: "BELIZE",
            BO: "BOLIVIA",
            NZ: "NEW ZEALAND",
            VE: "REPÚBLICA BOLIVARIANA DE VENEZUELA",
            CA: "CANADA",
            CO: "Российская Федерация",
            DO: "REPÚBLICA DOMINICANA",
            GT: "GUATEMALA",
            MX: "MEXICO",
            PA: "PANAMÁ",
            PR: "PUERTO RICO",
            TW: "台灣",
            US: "UNITED STATES",
            UZ: "O’zbekiston"
        },
        countries_5g: {
            NONE: "NONE",
            AL: "SHQIPERI",
            AI: "ANGUILLA",
            AW: "ARUBA",
            AT: "ÖSTERREICH",
            BY: "БЕЛАРУСЬ",
            BM: "BERMUDA",
            BA: "БОСНА И ХЕРЦЕГОВИНА",
            BW: "BOTSWANA",
            IO: "BRITISH INDIAN OCEAN TERRITORY",
            BG: "БЪЛГАРИЯ",
            CV: "CAPE VERDE",
            HR: "HRVATSKA",
            CY: "ΚΎΠΡΟΣ",
            CZ: "ČESKÁ REPUBLIKA",
            DK: "DANMARK",
            EE: "EESTI",
            FI: "SUOMI",
            FR: "FRANCE",
            GF: "GUYANE FRANÇAISE",
            PF: "POLYNÉSIE FRANÇAISE",
            TF: "Terres australes françaises",
            GI: "GIBRALTAR",
            DE: "DEUTSCHLAND",
            GR: "ΕΛΛΆΔΑ",
            GP: "GUADELOUPE",
            GG: "GUERNSEY",
            HU: "MAGYARORSZÁG",
            IS: "ÍSLAND",
            IE: "ÉIRE",
            IT: "ITALIA",
            KE: "KENYA",
            LV: "LATVIJA",
            LS: "LESOTHO",
            LI: "LIECHTENSTEIN",
            LT: "LIETUVA",
            LU: "LUXEMBOURG",
            MK: "МАКЕДОНИЈА",
            MT: "MALTA",
            IM: "MAN, ISLE OF",
            MQ: "MARTINIQUE",
            MR: "MAURITANIE",
            MU: "MAURITIUS",
            YT: "MAYOTTE",
            MC: "MONACO",
            ME: "Црна Гора",
            MS: "MONTSERRAT",
            NL: "NEDERLAND",
            AN: "NETHERLANDS ANTILLES",
            NO: "NORGE",
            OM: "سلطنة عمان",
            PL: "POLSKA",
            PT: "PORTUGAL",
            RE: "Réunion",
            RO: "ROMÂNIA",
            SM: "SAN MARINO",
            SN: "Sénégal",
            RS: "Србија",
            SK: "SLOVENSKÁ REPUBLIKA",
            SI: "SLOVENIJA",
            ZA: "SOUTH AFRICA",
            ES: "ESPAÑA",
            SE: "SVERIGE",
            CH: "SCHWEIZ",
            TC: "TURKS AND CAICOS ISLANDS",
            UG: "UGANDA",
            GB: "UNITED KINGDOM",
            VG: "VIRGIN ISLANDS, BRITISH",
            WF: "WALLIS ET FUTUNA",
            ZM: "ZAMBIA",
            AF: "افغانستان",
            JO: "الأردن",
            MA: "المغرب",
            EH: "الصحراء الغربية‎",
            EU: "EUROPEAN UNION",
            DZ: "الجزائر",
            IL: "إسرائيل",
            MX: "MEXICO",
            PM: "SAINT PIERRE ET MIQUELON",
            TN: "تونس",
            TR: "TÜRKİYE",
            JP: "日本",
            AS: "AMERICAN SAMOA",
            AG: "ANTIGUA AND BARBUDA",
            AZ: "AZƏRBAYCAN",
            BR: "BRASIL",
            KH: "CAMBODIA",
            KY: "CAYMAN ISLANDS",
            CO: "Российская Федерация",
            CR: "COSTA RICA",
            DM: "DOMINICA",
            DO: "REPÚBLICA DOMINICANA",
            EC: "ECUADOR",
            GH: "GHANA",
            GD: "GRENADA",
            HK: "香港",
            KZ: "КАЗАХСТАН",
            KI: "KIRIBATI",
            FM: "MICRONESIA, FEDERATED STATES OF",
            MZ: "MOÇAMBIQUE",
            NA: "NAMIBIA",
            NZ: "NEW ZEALAND",
            NI: "NICARAGUA",
            NE: "NIGER",
            PW: "PALAU",
            PE: "PERÚ",
            PH: "PHILIPPINES",
            PR: "PUERTO RICO",
            VC: "SAINT VINCENT AND THE GRENADINES",
            TH: "ประเทศไทย",
            TT: "TRINIDAD AND TOBAGO",
            UY: "URUGUAY",
            ZW: "ZIMBABWE",
            AU: "AUSTRALIA",
            BH: "البحرين",
            BB: "BARBADOS",
            CA: "CANADA",
            CL: "CHILE",
            CX: "CHRISTMAS ISLAND",
            EG: "مصر",
            SV: "EL SALVADOR",
            GT: "GUATEMALA",
            HT: "HAÏTI",
            IN: "INDIA",
            MY: "MALAYSIA",
            NF: "NORFOLK ISLAND",
            PA: "PANAMÁ",
            PG: "PAPUA NEW GUINEA",
            SG: "SINGAPORE",
            US: "UNITED STATES",
            VN: "VIỆT NAM",
            CU: "CUBA",
            IR: "ایران",
            KR: "한국",
            SY: "SYRIAN ARAB REPUBLIC",
            LB: "لبنان",
            MW: "MALAWI",
            MO: "澳門",
            QA: "قطر",
            BF: "BURKINA FASO",
            CN: "中国",
            HN: "HONDURAS",
            JM: "JAMAICA",
            PK: "PAKISTAN",
            PY: "PARAGUAY",
            KN: "SAINT KITTS AND NEVIS",
            AR: "ARGENTIA",
            TW: "台灣",
            NG: "NIGERIA",
            SA: "السعودية"
        }
	};

    require(['config/' + config.DEVICE + '/config'], function(otherConf) {
        $.extend(config, otherConf);
    });

	return config;
});