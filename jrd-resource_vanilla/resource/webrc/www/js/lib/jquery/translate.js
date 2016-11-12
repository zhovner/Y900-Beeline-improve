(function ($) {
    $.fn.translate = function () {
    	var $this = $(this);
    	$this.each(function(){
    		var item = $(this);
    		var trans = item.attr("trans");
    		if(!!trans){
            	translateElement(this, trans);
    		}
    	});
    	
    	$this.find("*[trans]").each(function () {
    		if($(this).attr("id") == 'chosen-search-field-input'){
    			var val = $("#chosenUserSelect").val();
    			if(val && val.length > 0){
    				return;
    			}
    		}
            var trans = $(this).attr("trans");
            if (trans != "") {
            	translateElement(this, trans);
            }
        });

    	//翻译国家码
        $('*[transid]', $this).each(function () {
        	var ele = $(this);
            var transid = ele.attr('transid');
            if(ele.attr("name") == "channel"){
            	ele.find('option').each(function () {
            		var item = $(this);
            		if (item.val() != 0) {
            			var val = item.val().split("_");
            			item.html( val[1] + $.i18n.prop("frequency_channel_mhz_unit") + " " + $.i18n.prop(transid + '_' + val[0]) );
            		} else {
            			item.html( $.i18n.prop(transid + '_0') );
            		}
            	});
            }else{
            	ele.find('option').each(function () {
            		$(this).html($.i18n.prop(transid + '_' + $(this).attr('value')));
            	});
            }
        });

        function translateElement(ele, trans){
        	var word = $.i18n.prop(trans);
            var nodeName = ele.nodeName.toUpperCase();
            if (nodeName == 'INPUT' || nodeName == 'SELECT' || nodeName == 'TEXTAREA') {
                $(ele).val(word);
            } else if (nodeName == 'BUTTON') {
                $(ele).text(word);
            } else {
                $(ele).html(word);
            }
        }

        $('.content div.row-fluid', $this).each(function () {
            if ($(this).has('.required').length > 0) {
                $("label:first-child", $(this)).append("<i class='colorRed'>&nbsp;*</i>");
            } else {
                $("label:first-child", $(this)).append("<i class='colorRed' style='visibility: hidden;'>&nbsp;*</i>");
            }
        });
        $("input[value='Cancel'], input[value='Delete'], input[value='Back'], input[value='No'], input[value='Отмена'], input[value='Удалить'], input[value='Назад'], input[value='Нет']").css({"background":"#000"});
        return $this;
    };
})(jQuery);
