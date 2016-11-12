var isCustomCss=false;
var sys_language= {
    en:'English',
    fr:'Français',
    it:'Italiano',
    sp:'Español'
}
var sys_custom_language = [];
var langChioce = ["ar","wr"];
var titleValue = "Alcatel";
var SD_CARD_SUPPORT = true;
config = (function()
    {
    /* modules settings -----------------------------------------------------  */
        //
        // Array containing information about modules to be displayed
        //
        // Each part stands for a module, with its unique ID and its status:
        //
        //      - the short name is the unique ID for each module
        //      - switch "isActive" to false to turn off the desired module
        //
	var modules = [ 
		{
            module:'connection',
            path:'connection/connectionStatus',
			className:'item blue item-connection',
			isActive: true
        } ,
        {
            module:'usage',
            path:'usage/usageHistory',
			className:'red item item-usage',
			isActive: true
			
        } ,
        {
            module:'sms',
            path:'sms/smsList',
			className:'pink item item-sms',
			isActive: true
        },
        {
            module:'settings',
            path:'settings/settings',
			className:'green item item-settings',
			isActive: true
        },
        {
            module:'sharing',
            path:'sharing/sharingSetting',
			className:'yellow item item-sharing',
			isActive: true
        },
        {
            module:'more',
            path:'more/more',
			className:'orange item item-more',
			isActive: true
        }
    ];
	
	var tempModules = [];
	$.each(modules,function(i,v){if(v.isActive == true){tempModules.push(modules[i]);}})
	modules = tempModules;
	
    return {
        modules: modules
    };
}());
    
