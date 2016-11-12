define(['knockout',
    'underscore',
    'jquery'
    , 'service'
    , 'config/config'],
    function (ko, _, $, service, config) {
        var displayMenuWhenLogout = false;
        var menuVM;
        var menu = [];

        require(['config/' + config.DEVICE + '/menu'], function(otherMenu) {
            menu = otherMenu;
        });

        //Menu vm
        function MenuVM() {
            var self = this;

            var isLoggedIn = getIsLoggedin();
            self.loggedIn = ko.observable(isLoggedIn);

            self.showMenu = ko.observable(isLoggedIn || displayMenuWhenLogout);

            var mainMenu = _.filter(menu, function (item) {
                return (item.level == '1' && ((item.requireLogin && self.loggedIn()) || !item.requireLogin) && item.hash != "#login");
            });

            self.mainMenu = ko.observableArray(mainMenu);
            self.secondMenu = ko.observableArray([]);
            self.thirdMenu = ko.observableArray(getCurrentThirdMenu());
		
			var autoConnMode = service.getConnectionMode();
			var autoConnRoam = autoConnMode.isAllowedRoaming;
			self.isAutoConnect2 = ko.observable(autoConnMode.connectionMode);
            self.currentMenu = ko.observable();
            self.currentTrans = ko.observable(window.location.hash.substring(1));
           
            var meun_single = ["device_messages", "mybalance", "device","balance"];
			
            self.menuClickHandler = function (hash) {
                if (hash == "#home") {
                    window.location.hash = hash;
                } else {
                    var third = getCurrentThirdMenu(hash)[0];
                    config.SMS_FLAG = "";
                    var current_menu_show = third.hash.substring(1);
                    $("#currentStatus").attr("trans", "subsection_menu"/*third.hash.substring(1)*/);			
                    if ($.inArray(third.hash.substring(1), meun_single) == -1) {
		    	$(".menu_current").css("display","none");
		    	$("#" + third.hash.substring(1)).css("display","");
                    } 					
                  
                    $("#thirdMenu").translate();
                    window.location.hash = third.hash;
                    $('li.menu-two-level.smslist').die('click').live('click', function() {
                        if(window.location.hash == "#device_messages") {
                               $("select.chzn-select-deselect").val("").trigger("liszt:updated");
                                config.currentChatObject = null;
                                $(".smslist-btns", "#smslist-main").removeClass('smsListFloatButs');
                                $("#smsChatRoom").hide()
                                $("#smslist-main").show();
                        }
                    });
                }
            }
            self.thirdMenuClickHandler = function (hash) {
                $("#currentStatus").attr("trans", "subsection_menu"/*hash.substring(1)*/);
                $("#thirdMenu").translate();

                if ($.inArray(hash.substring(1), meun_single) == -1) {
                    $(".menu_current").css("display","none");
                    $("#" + hash.substring(1) ).css("display","");
            	}
                window.location.hash = hash;
            }

            self.changeMenu = function (data) {
                var secondMenu = getSubMenu(data);
                if (secondMenu.length == 0) {
                    $("#container").addClass("fixContainerWidth");
                }
                else {
                    $("#container").removeClass("fixContainerWidth");
                }

                self.secondMenu(secondMenu);
                return true;
            };

            function getSubMenu(data) {
                return _.filter(menu, function (item) {
                    return ((item.parent && item.parent == data.hash) && ((item.requireLogin && self.loggedIn()) || !item.requireLogin));
                });
            }
        }

        function refreshMenu() {
            var currentHash = window.location.hash;
            var rootItem = _.find(menu, function (item) {
                return item.hash == currentHash;
            });

            while (rootItem.parent) {
                rootItem = _.find(menu, function (item) {
                    return item.hash == rootItem.parent;
                });
            }
            if (!rootItem.parent) {
                $("#list-nav li").removeClass("active");
                var mid = rootItem.hash.substring(1, rootItem.hash.length);
                $("#list-nav li[mid=" + mid + "]").addClass("active");
            }

            menuVM.changeMenu(rootItem);
            $("#menu_link").translate();
        }

        function activeSubMenu() {
            var currentHash = window.location.hash;
            var rootItem = _.find(menu, function (item) {
                return item.hash == currentHash;
            });
            if (rootItem.level == 1) {
                renderSubMenu("two", rootItem);
            }
            if (rootItem.level == 2) {
                renderSubMenu("three", rootItem);
                //forward/backward support
                triggerMenuClick(rootItem.hash, rootItem.level);

            }
            if (rootItem.level == 3) {
                //forward/backward support
                triggerMenuClick(rootItem.parent, rootItem.level);
                $(".menu-three-level").removeClass("active");
                $(".menu-three-level." + rootItem.hash.substring(1)).addClass("active");

            }
        }

        function renderSubMenu(level, baseItem) {
            var levelItem = _.find(menu, function (item) {
                return item.parent == baseItem.hash && item.path == baseItem.path;
            });
            $(".menu-" + level + "-level").removeClass("active");
            if (levelItem) {
                if (level == "two") {
                    renderSubMenu("three", levelItem);
                    //forward/backward support
                    triggerMenuClick(levelItem.hash, level);
                }
                $(".menu-" + level + "-level." + levelItem.hash.substring(1)).addClass("active");
            }
        }

        /**
         * not using live binding for performance consideration
         * @method triggerMenuClick
         * @param {String} hash
         */
        function triggerMenuClick(hash, level) {
            $obj = $(".menu-two-level." + hash.substring(1));
            var levelArr = ['3', 'three', '2', 'two'];
            if (_.indexOf(levelArr, level) != -1 && $obj.hasClass('active')) {
                return;
            }

            $obj.siblings().removeClass('active');
            $obj.addClass('active');

            $obj.siblings().not('.menu-two-level').slideUp();
            $obj.next().has('ul li').slideDown();

            menuVM.thirdMenu(getCurrentThirdMenu());
            $("#currentStatus").attr("trans","subsection_menu"/*location.hash.substring(1)*/);
            $("#thirdMenu").translate();

            var meun_single = ["device_messages", "mybalance", "device","balance"];
			
            if ($.inArray(location.hash.substring(1), meun_single) == -1) {
                $(".menu_current").css("display","none");
                $("#" + location.hash.substring(1)).css("display","");
            } 
        }

        function buildMenu() {
            var firstMenu = getCurrentFirstMenu();
            var hash = firstMenu.hash.substring(1)
            menuVM.currentMenu($.i18n.prop(hash));
            menuVM.currentTrans(hash);
        }

        function getCurrentFirstMenu() {
            var currentHash = window.location.hash;
            var currentItem = _.find(menu, function (item) {
                return item.hash == currentHash;
            });
            if (currentItem.level == 1) {
                return  currentItem;
            }
            if (currentItem.level == 2) {
                return  _.find(menu, function (item) {
                    return item.hash == currentItem.parent;
                });
            }
            if (currentItem.level == 3) {
                var secondItem = _.find(menu, function (item) {
                    return item.hash == currentItem.parent;
                });
                return _.find(menu, function (item) {
                    return item.hash == secondItem.parent;
                });
            }
            return  currentItem;
        }

        function getCurrentThirdMenu(h) {
            var currentHash = window.location.hash;
            if (h) {
                currentHash = h;
            }
            if (currentHash == "#home" || currentHash == "#login") {
                return [];
            }
            var currentItem = _.find(menu, function (item) {
                return item.hash == currentHash;
            });
            var thirdItem = [];
            if (currentItem) {
                if (currentItem.level == "1") {
                    currentItem = _.find(menu, function (item) {
                        return item.parent == currentItem.hash;
                    });
                    thirdItem = _.filter(menu, function (item) {
                        return item.parent == currentItem.hash;
                    });
                }else if (currentItem.level == "2") {
                    thirdItem = _.filter(menu, function (item) {
                        return item.parent == currentItem.hash;
                    });
                } else if (currentItem.level == "3") {
                    thirdItem = _.filter(menu, function (item) {
                        return item.parent == currentItem.parent;
                    });
                }
            }
            return thirdItem;
        }

        function init() {
            menuVM = new MenuVM();
            //ko.applyBindings(menuVM, $('#nav')[0]);
            ko.applyBindings(menuVM, $('#menu_link')[0]);
            ko.applyBindings(menuVM, $('#top_menu_link')[0]);
            calcMainMenuWidth(menuVM.mainMenu().length);
            ko.applyBindings(menuVM, $('#left')[0]);
            ko.applyBindings(menuVM, $('#thirdMenu')[0]);
        }

        function findMenu(hashVal) {
            hashVal = hashVal || window.location.hash;
            var loggedIn = getIsLoggedin();
            return _.filter(menu, function (item) {
                return (hashVal == item.hash && ((item.requireLogin && loggedIn) || !item.requireLogin));
            });
        }

        function rebuild() {
            var loggedIn = getIsLoggedin();
            var firstMenu = _.filter(menu, function (item) {
                return (item.level == '1' && ((item.requireLogin && loggedIn) || !item.requireLogin) && item.hash != "#login");
            });
            menuVM.mainMenu(firstMenu);
            menuVM.loggedIn(loggedIn);

            calcMainMenuWidth(menuVM.mainMenu().length);
            menuVM.showMenu(loggedIn || displayMenuWhenLogout);
            $("#nav").translate();
        }

        function calcMainMenuWidth(mainMenuLength) {
            var mainMenuWidth = 100 / mainMenuLength;
            $('ul#list-nav li').each(function () {
                $(this).css('width', mainMenuWidth + '%');
            });
        }

        function getIsLoggedin() {
            var loginStatus = service.getLoginStatus();
            return (loginStatus.status == "loggedIn");
        }

        /**
         * 判断目录中是否配置了相应的模块路径
         * @method checkIsMenuExist
         * @param {String} path 文件路径
         */
        function checkIsMenuExist(path) {
            for (var i = 0; i < menu.length; i++) {
                if (menu[i].path == path) {
                    return true;
                }
            }
            return false;
        }

        function getMainMenu(){
            var loginStatus = service.getLoginStatus();
            var loggedIn = (loginStatus.status == "loggedIn");

            return  _.filter(menu, function (item) {
                return (item.level == '1' && ((item.requireLogin && loggedIn) || !item.requireLogin) && item.hash != "#login");
            });
        }

        return {
            init:init,
            getMainMenu:getMainMenu,
            buildMenu: buildMenu,
            refreshMenu:refreshMenu,
            findMenu:findMenu,
            activeSubMenu:activeSubMenu,
            rebuild:rebuild,
            checkIsMenuExist:checkIsMenuExist
        };
    });
