define(function() {
    var config = {
        IPV6_SUPPORT: true,
        SHOW_APN_DNS:true,//APN设置页面是否显示DNS，不显示则dnsMode默认设置为auto
        WIFI_BAND_SUPPORT: true,
        WIFI_BANDWIDTH_SUPPORT: true,
        AP_STATION_SUPPORT: true,
        SHOW_MAC_ADDRESS: true, //是否显示mac地址
        PASSWORD_ENCODE: false,//登录密码和WIFI密码是否加密
		UPGRADE_TYPE:"FOTA",//取值有"NONE","OTA","FOTA","TWO_PORTION"
        WIFI_SWITCH_SUPPORT: true,
        WEBUI_TITLE: '4G Mobile Hotspot',
        AUTO_MODES: [ {
            name: 'Automatic',
            value: 'NETWORK_auto'
        }, {
            name: '4G Only',
            value: 'Only_LTE'
        }, {
            name: '3G Only',
            value: 'Only_WCDMA'
        }, {
            name: '2G Only',
            value: 'Only_GSM'
        }],
		NETWORK_MODES : [ {
            name : 'auto',
            value : '3'
        }, {
			name : '802.11 b',
			value : '0'
		}, {
			name : '802.11 g',
			value : '1'
		}, {
			name : '802.11 b/g/n',
			value : '2'
		} ],
		NETWORK_MODES_BAND : [  {
			name : '802.11 a',
			value : '4'
		}, {
			name : '802.11 a/c',
			value : '6'
		} ],

        /**
         * 国家码与类型匹配表
         * @attribute {Map} countryCode
         */
        countryCode: {
            world: ["JP", "GB", "DE", "CZ", "IL", "RU", "SG", "IN", "CN", "MY", "KR" ],//13
            mkkc: [],//13
            apld: [],//13
            etsic: [],//13
            fcca: [ "US", "CA", "MX", "TW" ]//11
        },
        countryCode_5g: {
            //88 countries of world【36 40 44 48】
            one: {
                codes: [ "JP", "GB", "DE", "CZ", "IL" ],
                channels: [36, 40, 44, 48]},
            //60 countrys of world【36 40 44 48 149 153 157 161 165】
            two: {
                codes: [ "SG", "IN" ],
                channels: [36, 40, 44, 48, 149, 153, 157, 161, 165]},
            //9 countrys of world【149 153 157 161】
            three: {
                codes: [ "TW", "RU" ],
                channels: [149, 153, 157, 161]},
            //12 countrys of world【149 153 157 161 165】
            four: {
                codes: [ "CN", "MY" ],
                channels: [149, 153, 157, 161, 165]},
            //1 country of world【36 40 44 48 149 153 157 161】
            five: {
                codes: [ "US", "CA", "MX", "KR" ],
                channels: [36, 40, 44, 48, 149, 153, 157, 161]}
        },

        /**
         * 国家码与语言匹配表
         * @attribute {Map} countries
         */
        countries: {            
            CN: "中国",//CHINA    
			US: "UNITED STATES",//UNITED STATES             
			JP: "日本",//JAPAN            
            CA: "CANADA",//CANADA          
            MX: "MEXICO",//MEXICO   
            DE: "DEUTSCHLAND",//GERMANY  
			GB: "UNITED KINGDOM",//UNITED KINGDOM        
            IN: "INDIA",//INDIA           
            IL: "إسرائيل",//ISRAEL 
			KR: "한국",//KOREA, REPUBLIC OF
			MY: "MALAYSIA",//MALAYSIA			
			RU: "Российская Федерация",//RUSSIAN FEDERATION
            SG: "SINGAPORE",//SINGAPORE                    
            TW: "台灣",//TAIWAN, PROVINCE OF CHINA
            CZ: "ČESKÁ REPUBLIKA"//?THE CZECH REPUBLIC           
        },
        countries_5g: {
            CN: "中国",//CHINA    
			US: "UNITED STATES",//UNITED STATES             
			JP: "日本",//JAPAN            
            CA: "CANADA",//CANADA          
            MX: "MEXICO",//MEXICO   
            DE: "DEUTSCHLAND",//GERMANY  
			GB: "UNITED KINGDOM",//UNITED KINGDOM        
            IN: "INDIA",//INDIA           
            IL: "إسرائيل",//ISRAEL 
			KR: "한국",//KOREA, REPUBLIC OF
			MY: "MALAYSIA",//MALAYSIA
			RU: "Российская Федерация",//RUSSIAN FEDERATION
            SG: "SINGAPORE",//SINGAPORE                    
            TW: "台灣",//TAIWAN, PROVINCE OF CHINA
            CZ: "ČESKÁ REPUBLIKA"//?THE CZECH REPUBLIC     
        }
    };

    return config;
});
