/*  ContentFlow, version 1.0.2 
 *  (c) 2007 - 2010 Sebastian Kutsch
 *  <http://www.jacksasylum.eu/ContentFlow/>
 *
 *  ContentFlow is distributed under the terms of the MIT license.
 *  (see http://www.jacksasylum.eu/ContentFlow/LICENSE)
 *
 *--------------------------------------------------------------------------*/
/* 
 * ============================================================
 * Global configutaion and initilization object
 * ============================================================
 */
var ContentFlowGlobal = {
    Flows: new Array,    
    Browser: new (function () {
        this.Opera = window.opera ? true : false;
        this.IE = document.all && !this.Opera ? true : false;
        this.IE6 = this.IE && typeof(window.XMLHttpRequest) == "undefined" ? true : false;
        this.IE8 = this.IE && typeof(document.querySelectorAll) != "undefined" ? true : false;
        this.IE7 = this.IE && ! this.IE6 && !this.IE8 ? true : false;
        this.WebKit = /WebKit/i.test(navigator.userAgent) ? true : false, 
        this.iPhone = /iPhone|iPod/i.test(navigator.userAgent)? true : false;
        this.Chrome = /Chrome/i.test(navigator.userAgent) ? true : false;
        this.Safari = /Safari/i.test(navigator.userAgent) && !this.Chrome ? true : false;
        this.Konqueror = navigator.vendor == "KDE" ? true : false;
        this.Konqueror4 = this.Konqueror && /native code/.test(document.getElementsByClassName) ? true : false;
        this.Gecko = !this.WebKit && navigator.product == "Gecko" ? true : false;
        this.Gecko19 = this.Gecko && Array.reduce ? true : false;
    })(),

    init: function () {
        /* ========== ContentFlow auto initialization on document load ==========
         * thanks to Dean Edwards
         * http://dean.edwards.name/weblog/2005/02/order-of-events/
         */
        var CFG = this;

        /* for Mozilla, Opera 9, Safari */
        if (document.addEventListener) {
            /* for Safari */
            if (this.Browser.WebKit) {
                var _timer = setInterval(function() {
                    if (/loaded|complete/.test(document.readyState)) {
                        clearInterval(_timer);
                        CFG.onloadInit(); // call the onload handler
                    }
                }, 10);
            }
            else {
              document.addEventListener("DOMContentLoaded", CFG.onloadInit, false);
            }
        }
        else if (this.Browser.IE) {
            document.write("<script id=__ie_cf_onload defer src=javascript:void(0)><\/script>");
            var script = document.getElementById("__ie_cf_onload");
            script.onreadystatechange = function() {
                if (this.readyState == "complete") {
                    CFG.onloadInit(); // call the onload handler
                }
            };
        }

        /* for all other browsers */
        window.addEvent('load', CFG.onloadInit, false);

        /* ================================================================== */

    },

    onloadInit: function () {
        // quit if this function has already been called
        if (arguments.callee.done) return;
        // flag this function so we don't do the same thing twice
        arguments.callee.done = true;
        
        /* fix for mootools */
        if (window.Element && Element.implement && document.all && !window.opera) {
            for (var prop in window.CFElement.prototype) {
                if(!window.Element.prototype[prop]) {
                    var implement = {};
                    implement[prop] = window.CFElement.prototype[prop];
                    Element.implement(implement);
                }
            }
        }

        /* init all manualy created flows */
        for (var i=0; i< ContentFlowGlobal.Flows.length; i++) {
            ContentFlowGlobal.Flows[i].init(); 
        }

        /* init the rest */
        var divs = document.getElementsByTagName('div');
        DIVS: for (var i = 0; i < divs.length; i++) {
            if (divs[i].className.match(/\bContentFlow\b/)) {
                for (var j=0; j<ContentFlowGlobal.Flows.length; j++) {
                    if (divs[i] == ContentFlowGlobal.Flows[j].Container) continue DIVS;
                }
                var CF = new ContentFlow(divs[i],{}, false);
                CF.init();
            }
        }
    }

};

/* 
 * ============================================================
 * ContentFlowGUIElement
 * ============================================================
 */

var ContentFlowGUIElement = function (CFobj, element) {
    element.setDimensions = function () {
        this.dimensions = this.getDimensions();
        this.center = {x: this.dimensions.width/2, y:this.dimensions.height/2};
        this.position = this.findPos();
    };
    element.addObserver = function (eventName, method) {
        var m = this.eventMethod = method.bind(CFobj);
        this.observedEvent = eventName;
        this.addEvent(eventName, m, false);
    };
   
    element.Browser = ContentFlowGlobal.Browser;
    $CF(element).setDimensions();
    return element;
};


/* 
 * ============================================================
 * ContentFlowItem
 * ============================================================
 */
var ContentFlowItem  = function (CFobj, element, index) {
    this.CFobj = CFobj;
    this._activeElement = CFobj.conf.activeElement;
    this.pre = null;
    this.next = null;

    this.setIndex = function (index) {
        this.index = index;
        this.element.itemIndex = index;
    };
    this.getIndex = function () {
        return this.index;
    };

    /* create item object */
    this.element = $CF(element);
    this.item = element;
    if (typeof index != "undefined") this.setIndex(index);
    this.content = this.element.getChildrenByClassName('content')[0];
    this.caption = this.element.getChildrenByClassName('caption')[0];
    this.label = this.element.getChildrenByClassName('label')[0];    
    this.pageUrl =CFobj._getPageUrlByIndex(index);
};

ContentFlowItem.prototype = {
    
    Browser: ContentFlowGlobal.Browser,

    makeActive: function () {
        this.element.addClassName('active');			
        this.CFobj.conf.onMakeActive(this);
    },
    
    makeInactive: function () {
        this.element.removeClassName('active');	  
        this.CFobj.conf.onMakeInactive(this);
    },
	    
    makeInactivePre: function () {
        this.element.removeClassName('activePre');	  
        this.CFobj.conf.onMakeInactive(this);
    },
	    
    makeInactiveNext: function () {
        this.element.removeClassName('activeNext');	  
        this.CFobj.conf.onMakeInactive(this);
    },

    makeActivePre: function () {
        this.element.addClassName('activePre');
        this.CFobj.conf.onMakeActive(this);
    },
	
	makeActiveNext: function () {
        this.element.addClassName('activeNext');
        this.CFobj.conf.onMakeActive(this);
    }
 };

/*
 * ============================================================
 * ContentFlow
 * ============================================================
 */
var ContentFlow = function (container, config) {
    if (container) {
        ContentFlowGlobal.Flows.push(this);
        this.Container = container;
        this._userConf = config?config:{};
        this.conf = {};
    } else {
        throw ('ContentFlow ERROR: No flow container node or id given');
    }

};

ContentFlow.prototype = {
    _activeItem: 0,
    _currentPosition: 0,
    _targetPosition: 0,
    _stepLock: false,
    _millisecondsPerStep: 40,     
    Browser: ContentFlowGlobal.Browser,
    
    _defaultConf: { 
        /* pre conf */        
        activeElement: 'item', // item or content

        relativeItemPosition: "top left", // align top/above, bottom/below, left, right, center of position coordinate

        circularFlow: true,
        visibleItems: 1,
        startItem:  "0",
        scrollInFrom: "next",
        pageUrl:"",
        flowSpeedFactor: 1.0,
       
        /* ==================== actions ==================== */

        onInit: function () {},

        onMakeInactive: function (item) {},

        onMakeActive: function (item) {},

        onReachTarget: function(item) {},

        onMoveTo: function(item) {},

        /* ==================== calculations ==================== */

        calcStepWidth: function(diff) {
            var vI = this.conf.visibleItems;
            var items = this.items.length;
            items = items == 0 ? 1 : items;
            if (Math.abs(diff) > vI) {
                if (diff > 0) {
                    var stepwidth = diff - vI;
                } else {
                    var stepwidth = diff + vI;
                }
            } else if (vI >= this.items.length) {
                var stepwidth = diff / items;
            } else {
                var stepwidth = diff * ( vI / items);
            }
            return stepwidth;
        },
        calcCoordinates: function (item) {
            var x = item.relativePosition;
            return { x: -0.017 * Math.pow(x, 3) + 0.417 * x, y: -0.1 };
        },
        calcZIndex: function (item) {
            return -Math.abs(item.relativePositionNormed);
        }
    },

    /* ---------- end of defaultConf ---------- */

    
    /*
     * ==================== index helper methods ====================
     */

    /*
     * checks if index is within the index range of the this.items array
     * returns a value that is within this range
     */
    _checkIndex: function (index) {
        index = Math.max(index, 0);
        index = Math.min(index, this.itemsLastIndex);
        return index;
    },

    /*
     * sets the object property itemsLastIndex
     */
    _setLastIndex: function () {
        this.itemsLastIndex = this.items.length - 1;
    },

    /*
*/
    _getItemByIndex: function (index) {
        return this.items[this._checkIndex(index)];
    },

    _getItemByPosition: function (position) {
        return this._getItemByIndex(this._getIndexByPosition(position));
    },

    /* returns the position of an item-index relative to current position */
    _getPositionByIndex: function(index) {
        if (!this.conf.circularFlow) return this._checkIndex(index);
        var cI = this._getIndexByPosition(this._currentPosition);
        var dI = index - cI;
        if (Math.abs(dI) > dI+this.items.length)
            dI += this.items.length;
        else if (Math.abs(dI) > (Math.abs(dI-this.items.length)))
            dI -= this.items.length;

        return this._currentPosition + dI;

    },

    /* returns the index an item at position p would have */
    _getIndexByPosition: function (position) {
        if (position < 0) var mod = 0;
        else var mod = 1;

        var I = (Math.round(position) + mod) % this.items.length;
        if (I>0) I -= mod;
        else if(I<0) I += this.items.length - mod;
        else if(position<0) I = 0;
        else I = this.items.length - 1;

        return I;
    },

    _getIndexByKeyWord: function (keyword, relativeTo, check) {
        if (relativeTo)
            var index = relativeTo;
        else if (this._activeItem)
            var index = this._activeItem.index;
        else
            var index = 0;

        if (isNaN(keyword)) {
            switch (keyword) {
                case "first":
                case "start":
                    index = 0;
                    break;
                case "last":
                case "end":
                    index = this.itemsLastIndex;
                    break;
                case "middle":
                case "center":
                    index = Math.round(this.itemsLastIndex/2);
                    break;
                case "right":
                case "next":
                    index += 1;
                    break;
                case "left":
                case "pre":
                case "previous":
                    index -= 1;
                    break;
                case 'visible':
                case 'visiblePre':
                case 'visibleLeft':
                    index -= this.conf.visibleItems;
                    break;
                case 'visibleNext':
                case 'visibleRight':
                    index += this.conf.visibleItems;
                    break;
                default:
                    index = index;
            }
        }
        else {
            index = keyword;
        }
        if (check != false)
            index = this._checkIndex(index);
        
        return index;
    },

	_getIndexByPageUrl: function (url) {
		url = url.replace(/^.*#/, '');
        var pageMenu = url.split("/")[0];
        var pageIndex = 0;
		$.each(contentConfig,function(i,v){
			   if(v.module == pageMenu){
				   pageIndex = i;
			   }
		});
        
        return pageIndex;
    },
	
    _getPageUrlByIndex: function (index) {
		var url = "";
		var path = "";
		path = contentConfig[index].path;
		url = path +".html";
        
        return url;
    },

    /*
     * calls _init() if ContentFlow has not been initialized before
     * needed if ContentFlow is not automatically initialized on window.load
     */
    init: function () {
        if(this.isInit) return;
        this._init();
    },

    /*
     * parses configuration object and initializes configuration values
     */
    setConfig: function(config) {
        if (!config) return;
        var dC = this._defaultConf;
        for (var option in config) {
            if (dC[option] == "undefined" ) continue;
            switch (option) {
                case "scrollInFrom":
                case "startItem":
                    if (typeof(config[option]) == "number"  || typeof(config[option]) == "string") {
                        //this["_"+option] = config[option];
                        this.conf[option] = config[option];
                    }
                    break;
                default:
                    if (typeof(dC[option] == config[option])) {
                        //this["_"+option] = config[option];
                        if (typeof config[option] == "function") {
                            this.conf[option] = config[option].bind(this);
                        }
                        else {
                            this.conf[option] = config[option];
                        }
                    }
            }
        }
      
        if (this.items) {
            if (this.conf.visibleItems <  0)
                this.conf.visibleItems = Math.round(Math.sqrt(this.items.length));
            this.conf.visibleItems = Math.min(this.conf.visibleItems, this.items.length - 1);
        }

        if (this.conf.relativeItemPosition) {
            var calcRP = {
                x: {
                    left: function(size) { return -1 },
                    center: function(size) { return 0 },
                    right: function(size) { return 1 }
                },
                y: {
                    top: function(size) { return -1 },
                    center: function(size) { return 0 },
                    bottom: function(size) { return 1 }
                }
            };

            var iP = this.conf.relativeItemPosition;
            iP = iP.replace(/above/,"top").replace(/below/,"bottom");
            var x, y = null;
            x = iP.match(/left|right/);
            y = iP.match(/top|bottom/);
            c = iP.match(/center/);
            if (!x) {
                if (c) x = "center";
                else x = "center";
            }
            if (!y) {
                if (c) y = "center";
                else y = "top";
            }
            var calcX = calcRP.x[x];
            var calcY = calcRP.y[y];
            this.conf.calcRelativeItemPosition = function (item) {
                var x = calcX(item.size);
                var y = calcY(item.size);
                return {x: x, y: y};
            };
            this.conf.relativeItemPosition = null;
        }
    },

    getItem: function (index) {
        return this.items[this._checkIndex(Math.round(index))]; 
    },

    /*
     * returns the index number of the active item
     */
    getActiveItem: function() {
        return this._activeItem;
    },

    /*
     * returns the number of items the flow contains
     */
    getNumberOfItems: function () {
        return this.items.length;
    },

    /*
     * reinitializes sizes.
     * called on window.resize
     */
    resize: function () {
        this._initSizes();
        this._initStep();
    }, 

    /*
     * scrolls flow to item i
     */
    moveToPosition: function (p, holdPos) {
        if (!this.conf.circularFlow) p = this._checkIndex(p);
        this._targetPosition = p;
        this.conf.onMoveTo(this._getItemByPosition(p));
        this._initStep(false, holdPos);
    },
    moveToIndex: function (index) {
        this._targetPosition = Math.round(this._getPositionByIndex(this._getIndexByKeyWord(index, this._activeItem.index, !this.conf.circularFlow)));
        this.conf.onMoveTo(this._getItemByPosition(this._targetPosition));
        this._initStep();
    },

    /*
     * ==================== initialization ====================
     */
    

    /* -------------------- main init -------------------- */
    _init: function () {

        if (typeof(this.Container) == 'string') { // no node
            var container = document.getElementById(this.Container);
            if (container) {
                this.Container = container;
            } else {
                throw ('ContentFlow ERROR: No element with id \''+this.Container+'\' found!');
                return;
            }
        }
        
        /* ----------  reserve CSS namespace */

        $CF(this.Container).addClassName('ContentFlow');

        /* ---------- detect GUI elements */
        var flow = $CF(this.Container).getChildrenByClassName('flow')[0];
        if (!flow) {
            throw ('ContentFlow ERROR: No element with class\'flow\' found!');
            return;
        }
        this.Flow = new ContentFlowGUIElement(this, flow);

      
        /* ----------  init configuration */ 
        this.setConfig(this._defaultConf);
        this.setConfig(this._userConf);
        this._initSizes(); // ......


        /* ---------- init item lists ---------- */
        var items = this.Flow.getChildrenByClassName('item');
		var url = document.location.hash;

        this.items = new Array();
        for (var i=0; i<items.length; i++) {
            var item = this.items[i] = new ContentFlowItem(this, items[i], i);
            if (i > 0) { 
                item.pre = this.items[i-1];
                item.pre.next = item;
            }
        }
        this._setLastIndex();
        if (this.conf.circularFlow && this.items.length > 0) {
            var s = this.items[0];
            s.pre = this.items[this.items.length-1];
            s.pre.next = s;
        }

        /* ----------  init GUI */
        this._initGUI();

        /* ---------- init start parameters ---------- */
       

        this.conf.origVisibleItems = this.conf.visibleItems;
        if (this.conf.visibleItems < 0) {
            this.conf.visibleItems = Math.round(Math.sqrt(this.items.length));
        }
        this.conf.visibleItems = Math.min(this.conf.visibleItems, this.items.length - 1);

        this._targetPosition = this._getIndexByKeyWord(this._getIndexByPageUrl(url), 0);

        var index = this._getIndexByKeyWord(this.conf.scrollInFrom, this._targetPosition);
        switch (this.conf.scrollInFrom) {
            case "next":
            case "right":
                index -= 0.5;
                break;
            case "pre":
            case "previous":
            case "left":
                index += 0.5;
                break;
        } 
        this._currentPosition = index;
        

        /* ---------- wait till all images are loaded or 
         * grace time is up to show all and take the first step  
        */
        var now = new Date();
        var cf = this;
        var timer = window.setInterval (
            function() {              
				clearInterval(timer);
                 
				cf._activeItem = cf.getItem(cf._currentPosition);
				if (cf._activeItem) {
					cf._activeItem.makeActive();                       
					cf._activeItem.pre.makeActivePre();
					cf._activeItem.next.makeActiveNext();
					if(cf._targetPosition == contentConfig.length-1){
					   page.changePage(document.location.hash);
					}					
				}
				
				cf.Flow.style.visibility = "visible"; // show flow after images are loaded

				cf.resize();
				cf.conf.onInit();               
            }, 10
        );
        page.changePage(url);
        this.isInit = true;

    },
  
    _initGUI: function () {
        
        // resize
        //if (!this.Browser.iPhone) {
            var resize = this.resize.bind(this);
            window.addEvent('resize', resize, false);
        //}
        //else {
            //var g = this;
            //window.addEvent('resize', function () {
                //g._initSizes();
                //g._initStep();
            //} , false);
        //}        
    },

    /* ---------- init element sizes ---------- */ 
    _initSizes: function (x) {
        //if (this.Browser.Konqueror4 && x != true) {
            //var t = this;
            //window.setTimeout( function () { t._initSizes(true) }, 0);
            //return;
        //}

        if (!this._activeItem) return;

        var mFS = this._findBiggestItem();

        var pF = this.Flow.findPos();

        /* set height / width of flow */
       
			this.Flow.style.width =/*4* mFS.width.width + */"950px";
            this.Flow.style.height = mFS.height.height +(mFS.height.top - pF.top)+"px";  

           this.Flow.dimensions = this.Flow.getDimensions(); 
       
           this.Flow.center = {x: this.Flow.dimensions.width, y:mFS.height.height};
       

    },

    /* -------------------------------------------------------------------------------- */

    _findBiggestItem: function () {

        var currentItem = this._activeItem;

        var itemP = currentItem.pre;
        var itemN = currentItem.next;
        var mFS = maxFlowSize = {
            width: { width: 0, left: 0, height:0, top: 0, item: null, rI: 0 },
            height: { width: 0, left: 0, height:0, top: 0, item: null, rI: 0 }
        }


        var checkMax = function (item, rI) {
            var el = item.element;
            el.style.display = "block";
            var p = el.findPos();
            var h =  el.clientHeight;
            var w = el.clientWidth;
            if (h + p.top >= mFS.height.height + mFS.height.top) {
                mFS.height.height = h;
                mFS.height.top = p.top;
                mFS.height.item = item;
                mFS.height.rI = rI;
            }
            if (w + p.left >= mFS.width.width + mFS.width.left) {
                mFS.width.width = w;
                mFS.width.left = p.left;
                mFS.width.item = item;
                mFS.width.rI = rI;
            }
            el.style.display = "none";
        }

        var ocp = this._currentPosition;
        this._currentPosition = this.conf.visibleItems+1;

        // find the position with highest y-value
        for (var i=-this.conf.visibleItems; i <= this.conf.visibleItems; i++) {
            currentItem.element.style.display = "none";
            this._positionItem(currentItem, i);
            checkMax(currentItem, i);
        }

        // find the biggest item
        var index = mFS.height.rI;
        for (var i=0; i < this.items.length; i++) {
            var item = this.items[i];
            item.element.style.display = "none";
            this._positionItem(item, index);
            checkMax(item, index);
        }

        this._currentPosition = ocp;

        return mFS
    },

    /*
     * ==================== set global Caption ====================
     */
    _setGlobalCaption: function () {
        if (this.globalCaption) {
            this.globalCaption.innerHTML = '';
            if(this._activeItem && this._activeItem.caption)
                this.globalCaption.appendChild(this._activeItem.caption.cloneNode(true));
        }
    },

    /*
     * ==================== move items ====================
     */

    /*
     * intend to make a step 
     */
    _initStep: function (holdSlider, holdPos) {
        if (this.Slider) {
            if(holdSlider) {
                this.Slider.locked = true;
            } else {
                this.Slider.locked = false;
            }
        }
        this._holdPos = holdPos == true ? true : false;
        if (!this._stepLock) {
            this._stepLock = true;
            this._step();
        }
    },

    /*
     * make a step
     */
    _step: function () {

        var diff = this._targetPosition - this._currentPosition; 
        var absDiff = Math.abs(diff);
        if ( absDiff > 0.001) { // till activeItem is nearly at position 0

            this._currentPosition += this.conf.flowSpeedFactor * this.conf.calcStepWidth(diff, absDiff, this.items.length, this.conf.visibleItems);

            var AI = this.items[(this._getIndexByPosition(this._currentPosition))];
            
            if (AI && AI != this._activeItem) {
                if (this._activeItem) this._activeItem.makeInactive();
				if (this._activeItem.pre) this._activeItem.pre.makeInactivePre();
				if (this._activeItem.next) this._activeItem.next.makeInactiveNext();
                this._activeItem = AI;
				this._activeItemIndex = this._activeItem.index;
				this._activeItem.pre = this.items[(this._getIndexByPosition(this._activeItemIndex - 1))];
				this._activeItem.next = this.items[(this._getIndexByPosition(this._activeItemIndex + 1))];
				this._activeItem.pre.makeActivePre();    
				this._activeItem.next.makeActiveNext();    
                this._activeItem.makeActive(); 
				AIRBOX.slide.initClickItem();
				var currurl = document.location.hash; 
				currurl = currurl.replace(/^.*#/, ''); 
				if(this._getIndexByPageUrl(currurl) == this._getIndexByPageUrl(cf._activeItem.pageUrl)){
					if(currurl != cf._activeItem.pageUrl){
						page.changePage(currurl);
					}
				}else{
					page.changePage(cf._activeItem.pageUrl);
				}
				
                if (Math.abs(this._targetPosition - this._currentPosition) <= 0.5 ) this.conf.onReachTarget(this._activeItem);
            }
            
            this._positionItems();

            var st = this._step.bind(this);
            window.setTimeout(st,this._millisecondsPerStep);

        } else if (!this._holdPos) {
            if (this.Slider) this.Slider.locked = false;
            this._currentPosition = Math.round(this._currentPosition);

            this._positionItems();
            this._stepLock = false;
        } else {
            this._stepLock = false;
        }

        if (this.Slider && !this.Slider.locked) {
            this.Slider.setPosition(this._currentPosition);
        }
    },

/* ------------------------------------------------------------------------------------------------------ */
    
    /*
     * position items
     */
    _positionItems: function () {

        if (this._lastStart) {
            var item = this._lastStart;
            while (item) {
                item.element.style.display="none";
                item = item.next;
                if (item == this._lastStart) break;
                if (item && item.pre == this._lastEnd) break;
            }
        }
        else {
            this._lastStart = this._activeItem;
        }

        if (!this._activeItem) return;
        var currentItem = this._activeItem;
        var itemP = currentItem.pre;
        var itemN = currentItem.next;

        this._positionItem(currentItem, 0);
        for (var i=1; i <= this.conf.visibleItems && 2*i < this.items.length ; i++) {
            if (itemP) {
                this._positionItem(itemP, -i);
                this._lastStart = itemP;
                itemP = itemP.pre;
            }
            if (itemN) {
                this._positionItem(itemN, i);
                this._lastEnd = itemN;
                itemN = itemN.next;
            }
        }

    },

    _positionItem: function (item, relativeIndex) {

        var conf = this.conf;
      
        var els = item.element.style;
        //els.display =" none";
        //if (els.display != "none") return;

        /* Index and position relative to activeItem */
        var p = item.position = this._currentPosition + relativeIndex;
        var relativePosition = item.relativePosition = Math.round(p) - this._currentPosition;
        var relativePositionNormed = item.relativePositionNormed = conf.visibleItems > 0 ? relativePosition/conf.visibleItems : 0;

        var coords = item.coordinates = conf.calcCoordinates (item);
        var relItemPos = item.relativeItemPosition = conf.calcRelativeItemPosition(item);
        var zIndex = item.zIndex = conf.calcZIndex (item);      

        /* set position */
		var winW = document.documentElement.clientWidth && document.body.offsetWidth;
		$(window).resize(function(){
			 winW = document.documentElement.clientWidth && document.body.offsetWidth; 
			});
		//alert(winW);
		var widthValue; 
		if( winW > 480 && winW <= 950){
		   widthValue = (winW - 303) / 2;
		
		}else{
			  widthValue = 323;
			} 
		
        var pX =  this.Flow.center.x * coords.x  + widthValue;
        els.left = pX+"px";

        /* set z-index */
        els.zIndex = 32768 + Math.round(zIndex * this.items.length); // just for FF

        els.visibility = "visible";
        els.display = "block";
    }
};


/* ==================== extendig javascript/DOM objects ==================== */

/*
 *  adds bind method to Function class
 *  http://www.digital-web.com/articles/scope_in_javascript/
 */

if (!Function.bind) {
    Function.prototype.bind = function(obj) {
        var method = this;
        return function () {
            return method.apply(obj, arguments);
        };
    };
}


/*
 * extending Event object
 */
if (!Event) var Event = {};

if (!Event.stop) {
    Event.stop = function (event) {
        event.cancelBubble = true;
        if (event.preventDefault) event.preventDefault();
        if (event.stopPropagation) event.stopPropagation();
        return false;
    };
}

/*
 * extending Element object
 */
if (document.all && !window.opera) {
    window.$CF = function (el) {
        if (typeof el == "string") {
            return window.$CF(document.getElementById(el));
        }
        else {
            if (CFElement.prototype.extend && el && !el.extend) CFElement.prototype.extend(el);
        }
        return el;
    };
} else {
    window.$CF = function (el) {
        return el;
    };
}

if (!window.HTMLElement) {
    CFElement = {};
    CFElement.prototype = {};
    CFElement.prototype.extend = function (el) {
        for (var method in this) {
            if (!el[method]) el[method] = this[method];
        }
    };
}
else {
    CFElement = window.HTMLElement;
}


/*
 * Thanks to Peter-Paul Koch
 * http://www.quirksmode.org/js/findpos.html
 */
if (!CFElement.findPos) {
    CFElement.prototype.findPos = function() {
        var obj = this;
        var curleft = curtop = 0;
        try {
            if (obj.offsetParent) {
                curleft = obj.offsetLeft;
                curtop = obj.offsetTop;
                while (obj = obj.offsetParent) {
                    curleft += obj.offsetLeft;
                    curtop += obj.offsetTop;
                }
            }
        }
        catch (ex) {}
        return {left:curleft, top:curtop};
    };
}

if (!CFElement.getDimensions) {
    CFElement.prototype.getDimensions = function() {
		var winWidth = document.documentElement.clientWidth && document.body.offsetWidth;  
		$(window).resize(function(){
		 var winWidth = document.documentElement.clientWidth && document.body.offsetWidth;  
		});
		//alert(winWidth+"ab");
		if(winWidth > 480 && winWidth <= 1024){  
			pageWidth = winWidth - 180;
			}else{
				pageWidth = this.clientWidth; 
				}
		
        return {
				width: pageWidth,
				height: this.clientHeight
			};
    };
}

/*
 * checks if an element has the class className
 */
if (!CFElement.hasClassName) {
    CFElement.prototype.hasClassName = function(className) {
        return (new RegExp('\\b'+className+'\\b').test(this.className));
    };
}

/*
 * adds the class className to the element
 */ 
if (!CFElement.addClassName) {
    CFElement.prototype.addClassName = function(className) {
        if(!this.hasClassName(className)) {
           this.className += (this.className ? ' ':'') + className ;
        }
    };
}

/*
 * removes the class className from the element el
 */ 
if (!CFElement.removeClassName) {
    CFElement.prototype.removeClassName = function(className) {
        this.className = this.className.replace(new RegExp('\\b'+className+'\\b'), '').replace(/\s\s/g,' ');
    };
}

/*
 * removes or adds the class className from/to the element el
 * depending if the element has the class className or not.
 */
if (!CFElement.toggleClassName) {
    CFElement.prototype.toggleClassName = function(className) {
        if(this.hasClassName(className)) {
            this.removeClassName(className);
        } else {
            this.addClassName(className);
        }
    };
}

/*
 * returns all children of element el, which have the class className
 */
if (!CFElement.getChildrenByClassName) {
    CFElement.prototype.getChildrenByClassName = function(className) {
        var children = new Array();
        for (var i=0; i < this.childNodes.length; i++) {
            var c = this.childNodes[i];
            if (c.nodeType == 1 && $CF(c).hasClassName(className)) {
                children.push(c);
            }
        }
        return children;
    };
}

/*
 * Browser independent event handling method.
 * adds the eventListener  eventName to element el and attaches the function method to it.
 */
if (!CFElement.addEvent) {
    CFElement.prototype.addEvent = function(eventName, method, capture) {
        if (this.addEventListener)
            this.addEventListener(eventName, method, capture);
        else
            this.attachEvent('on'+eventName, method);
    };
}
   
/*
 * Browser independent event handling method.
 * removes the eventListener  eventName with the attached function method from element el.
 */
if (!CFElement.removeEvent) {
    CFElement.prototype.removeEvent = function(eventName, method, capture) {
        if (this.removeEventListener)
            this.removeEventListener(eventName, method, capture);
        else
            this.detachEvent('on'+eventName, method);
    };
}

/*
 * Browser independent event handling method.
 * adds the eventListener  eventName to element el and attaches the function method to it.
 */
if (!window.addEvent) {
    window.addEvent = function(eventName, method, capture) {
        if (this.addEventListener) {
            this.addEventListener(eventName, method, capture);
        } else {
            if (eventName != 'load' && eventName != 'resize')
                document.attachEvent('on'+eventName, method);
            else
                this.attachEvent('on'+eventName, method);
        }
    };
}
   
/*
 * Browser independent event handling method.
 * removes the eventListener  eventName with the attached function method from element el.
 */
if (!window.removeEvent) {
    window.removeEvent = function(eventName, method, capture) {
        if (this.removeEventListener) {
            this.removeEventListener(eventName, method, capture);
        } else {
            if (eventName != 'load' && eventName != 'resize')
                document.detachEvent('on'+eventName, method);
            else
                this.detachEvent('on'+eventName, method);
        }
    };
}

/* ==================== start it all up ==================== */
ContentFlowGlobal.init();

