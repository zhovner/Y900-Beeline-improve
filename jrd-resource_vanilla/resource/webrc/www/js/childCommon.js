function isRightUrl(){
    if(top.defaultPage==null){
        location.href="index.html"
    }
}
isRightUrl()
$(function($){
    $(".jsTemplate").append("<div class=\"article-mask\"></div>").replaceTpl();
    page.pageInit();
	AIRBOX.slide.initClickItem();
   // page.setCurrentMenu(currentMenu);
})
