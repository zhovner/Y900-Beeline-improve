var WLAN_STATUS_OFF = 0;
var WLAN_STATUS_ON = 1;
var WLAN_STATUS_WPS = 2;

var WLAN_WLAN_MODE_2G = 0;
var WLAN_WLAN_MODE_5G = 1;
var WLAN_WLAN_MODE_2G_5G = 2;

var WLAN_BROADCAST_ENABLE = 0;
var WLAN_BROADCAST_DISABLE = 1;

var WLAN_SECURITY_DISABLE = 0;
var WLAN_SECURITY_WEP = 1;
var WLAN_SECURITY_WPA = 2;
var WLAN_SECURITY_WPA2 = 3;
var WLAN_SECURITY_WPA_WPA2 = 4;

var WLAN_WPA_TYPE_TKIP = 0;
var WLAN_WPA_TYPE_AES = 1;
var WLAN_WPA_TYPE_AUTO = 2;

var WLAN_WEP_TYPE_OPEN = 0;
var WLAN_WEP_TYPE_SHARE = 1;

var WLAN_APISOLATION_DISABLE = 0;
var WLAN_APISOLATION_ENABLE = 1;

var WLAN_WMODE_802B = 0;
var WLAN_WMODE_802BG = 1;
var WLAN_WMODE_802BGN = 2;
var WLAN_WMODE_802AUTO = 3;
var WLAN_WMODE_802A = 4;
var WLAN_WMODE_802AN = 5;
var WLAN_WMODE_802AC = 6;


var countryArray=[
    ["CN", 13, "CHINA","CN"],
    ["US", 11, "UNITED STATES","US"],
    ["JP", 13, "JAPAN","JP"],
    ["CA", 11, "CANADA","US"],
    ["MX", 11, "MEXICO","US"],
    ["DE", 13, "GERMANY","JP"],
    ["GB", 13, "UNITED KINGDOM","JP"],
    ["IN", 13, "INDIA","SG"],
    ["IL", 13, "ISRAEL","JP"],
    ["KR", 13, "KOREA, REPUBLIC OF","US"],
    ["MY", 13, "MALAYSIA","MY"],
    ["RU", 13, "RUSSIAN FEDERATION","JP"],
    ["SG", 13, "SINGAPORE","SG"],
    ["TW", 11, "TAIWAN, PROVINCE OF CHINA","TW"],
    ["CZ", 13, "THE CZECH REPUBLIC","JP"]
    //["OTHER", 13, "ids_country_wlan_other","EU"]
]
var country5gChannelObj={
    "CN": [36,40,44,48,149,153,157,161,165],
    "US": [36,40,44,48,149,153,157,161],//US,CA,MX,KR,
    "SG": [36,40,44,48,149,153,157,161,165],//SG,IN
    "MY": [149,153,157,161,165],//MY
    "TW": [149,153,157,161],
    "JP": [36,40,44,48]//JP,GB,DE,EU,AF
}
