/*
 * META Doc
 * Documentation generator
 *
 * @author META Platform <www.meta-platform.com>
 * @license MIT
 */

Math.easeInOutQuad = function (t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t + b;
    t--;
    return -c/2 * (t*(t-2) - 1) + b;
};

Math.easeInOutSine = function (t, b, c, d) {
	return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
};

Math.easeInOutCubic = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t*t + b;
	t -= 2;
	return c/2*(t*t*t + 2) + b;
}

var scrollToElement = function(element, duration, offset, callback) {
    var start = document.body.scrollTop || document.documentElement.scrollTop,
        change = Math.max(0, element.offsetTop + offset) - start,
        currentTime = 0,
        increment = 20;
				
    var animateScroll = function(){
        currentTime += increment;
        var val = Math.easeInOutCubic(currentTime, start, change, duration);                        
        document.body.scrollTop = val; 
		document.documentElement.scrollTop = val;
        if(currentTime < duration) {
            setTimeout(animateScroll, increment);
        } else callback();
    };
	
    animateScroll();
};

/*
var headerShadow = function(){

	var headerEl = document.getElementById("header");

	var handle = function(){

		var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
		var shadowOpacity = Math.min(0.4, scrollTop / 200 * 0.4);
		var shadowSize = Math.min(12, scrollTop / 200 * 12);

		if(shadowOpacity !== lastOpacity){
			headerEl.style.boxShadow = '0px 2px ' + shadowSize + 'px rgba(0, 0, 0, ' + shadowOpacity + ')';
			lastOpacity = shadowOpacity;
		}

	};

	window.addEventListener("scroll", handle);
	handle();

};
*/

var scrollNav = function(){

	//Get items
	var items = document.querySelectorAll("nav#toc ul.current > li");
	var lastItem = null;

	//Parse and store anchors
	for(var i = 0; i < items.length; i++){
		var item = items.item(i);
		
		if(item.getAttribute("data-anchor")){
			item._anchorEl = document.getElementById(item.getAttribute("data-anchor"));

			if(item._anchorEl)
				item._anchorTop = item._anchorEl.parentElement.offsetTop;

		}

	}

	var handle = function(){

		var currentItem = null;
		var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;

		for(var i = 0; i < items.length; i++){

			if(scrollTop >= items.item(i)._anchorTop - 10)
				currentItem = items.item(i);

		}

		if(lastItem && lastItem != currentItem)
			lastItem.classList.remove("active");

		currentItem.classList.add("active");
		lastItem = currentItem;

	};

	window.addEventListener("scroll", handle);
	handle();

};

var scrollLink = function(){

	var navEl = document.getElementById("toc");

	var bindLink = function(linkEl){

		linkEl.addEventListener("click", function(ev){

			var href = linkEl.getAttribute('href');

			if (href.indexOf('#') >= 0) {

				var hash = href.indexOf('#');
				var targetAnchor = href.substr(hash + 1);

				var target = document.getElementById(targetAnchor);
				
				if(target){

					scrollToElement(target.parentElement, 1000, 0, function(){
						currentTop = document.body.scrollTop || document.documentElement.scrollTop;
						location.href = "#" + targetAnchor;
						document.body.scrollTop = currentTop;
						document.documentElement.scrollTop = currentTop;
					});

					if(navEl.classList.contains("opened"))
						navEl.classList.remove("opened");
					
					ev.preventDefault();

					return false;

				}

			}

		});

	};

	//Get links
	var links = document.querySelectorAll("nav#toc ul.current > li > a");

	for(var i = 0; i < links.length; i++)
		bindLink(links.item(i));

};

var headerNav = function(){

	var navEl    = document.getElementById("header-nav");
	var btnOpen  = document.getElementById("menu-open");
	var btnClose = document.getElementById("menu-close");

	btnOpen.addEventListener("click", function(){
		navEl.classList.add("opened");
	});

	btnClose.addEventListener("click", function(){
		navEl.classList.remove("opened");
	});

};

var tocNav = function(){

	var navEl = document.getElementById("toc");
	var btnEl = document.getElementById("toc-toggle");

	navEl.addEventListener("click", function(ev){
		ev.stopPropagation();
	});

	btnEl.addEventListener("click", function(){
		navEl.classList.toggle("opened");
	});

	document.body.addEventListener("click", function(){

		if(navEl.classList.contains("opened"))
			navEl.classList.remove("opened");

	});

};

window.addEventListener("load", function(){

	//headerShadow();
	scrollNav();
	scrollLink();
	headerNav();
	tocNav();

});