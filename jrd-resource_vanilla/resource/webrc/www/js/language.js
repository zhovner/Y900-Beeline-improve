/**
 * @module language
 * @class language
 */
define(['knockout',
    'service',
    'jquery',
    'config/config',
    'underscore'],
    function(ko, service, $, config, _) {

        /**
         * 根据语言项加载语言资源并翻译页面上的body部分
         * @method setLocalization
         * @param {String} locale 语言项:zh-cn
         */
        function setLocalization(locale){
            $.i18n.properties({
                name:'Messages',
                path:'resource/',
                mode:'map',
                cache: true,
                language:locale,
                callback: function() {
                    jQuery.validator.messages = $.i18n.map;
                    document.title = $.i18n.prop("main_header");
                    $('body').translate();
                }
            });
        }

        /**
         * LanguageVM
         * @class LanguageVM
         */
        function LanguageVM() {
            var self = this;
            var currentLan = getLanguage();
            var languages = _.map(config.LANGUAGES, function(item) {
                return new Option(item.name, item.value);
            });

            document.title = config.WEBUI_TITLE;
            if($('#webui_title')[0]) {
                $('#webui_title').html(config.WEBUI_TITLE);
            }

            self.languages = ko.observableArray(languages);
            self.currentLan = ko.observable(currentLan.Language);
            $("#lanDiv").html(currentLan.Language == "ru" ? "Русский" : "English");
            if(currentLan.Language == "ru"){
                $("#titleImg").attr("src","images/logo_ru.png");
	            $("#mode").width("auto");
            }else{
                $("#titleImg").attr("src","images/logo_en.png");
                $("#mode").width("177");
		   }

            /**
             * 语言切换事件处理
             * @event langChangeHandler
             */

            self.langChangeHandler = function(data, event) {
                if(data == "ru"){
                    $("#titleImg").attr("src","images/logo_ru.png");
					$("#mode").width("auto");
                    $("#lanRu").show();
                    $("#lanEn").hide();
                }else{
                    $("#titleImg").attr("src","images/logo_en.png");	
					$("#mode").width("177");
                    $("#lanEn").show();
                    $("#lanRu").hide();
                }
                clearValidateMsg();
                self.currentLan(data);
                service.setLanguage({Language: self.currentLan()}, function() {
                    setLocalization(self.currentLan());
                });
            };

            //init language
            setLocalization(self.currentLan());
        }

        /**
         * 获取语言项
         * @method getLanguage
         */
        function getLanguage() {
            return service.getLanguage();
        }

        /**
         * 初始化语言VM并绑定
         * @method init
         */
        function init() {
            ko.applyBindings(new LanguageVM(), $('#language')[0]);
        }

        return {
            init: init
        };
    });
