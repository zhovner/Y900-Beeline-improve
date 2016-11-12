/**
 * 联网设置模块
 * @module dial_setting
 * @class dial_setting
 */
define([ 'jquery', 'knockout', 'config/config', 'service', 'underscore' ],

    function($, ko, config, service, _) {

        /**
         * 联网设置view model
         * @class DialVM
         */
        function HelpVM() {
            var currentLan = service.getLanguage();
            var self = this;
            self.currentLan = ko.observable(currentLan.Language);
            if(self.currentLan() == "ru"){
                $("#lanRu").show();
                $("#lanEn").hide();
            }else{
                $("#lanEn").show();
                $("#lanRu").hide();
            }

        }

        /**
         * 联网设置初始化
         * @method init
         */
        function init() {
            var container = $('#container');
            ko.cleanNode(container[0]);
            var vm = new HelpVM();
            ko.applyBindings(vm, container[0]);

        }

        return {
            init: init
        };
    });