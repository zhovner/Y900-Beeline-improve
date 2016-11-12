/**
 * @module css
 * @class css
 */
define(['knockout', 'jquery', 'config/config'], function(ko, $, config) {
    /**
     * ThemeViewModel
     * @class ThemeViewModel
     */
    function ThemeViewModel() {
        var self = this;
        self.currentTheme = ko.observable(config.THEME);
        self.themeHref = ko.computed(function() {
            $('#loadingImg').attr('src', 'css/' + self.currentTheme() + '/loading.gif');
            return "css/" + self.currentTheme() + "/css.css";
        });

        /**
         * 主题切换事件处理
         * @event themeClickHandler
         */
        self.themeClickHandler = function(data, event, css) {
            this.currentTheme(css);
        };
    }

    /**
     * 初始化ThemeViewModel并绑定
     * @method init
     */
    function init() {
        ko.applyBindings(new ThemeViewModel(), $('#themeSection')[0]);
    }

    return {
        init: init
    };
});
