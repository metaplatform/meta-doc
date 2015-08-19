/*
 * META Doc
 * Documentation generator
 *
 * @author META Platform <www.meta-platform.com>
 * @license MIT
 */

var headerShadow = function(){

	var headerEl = document.getElementById("header");

	var handle = function(){

		var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
		var shadowOpacity = Math.min(0.4, scrollTop / 200 * 0.4);
		var shadowSize = Math.min(12, scrollTop / 200 * 12);

		headerEl.style.boxShadow = '0px 2px ' + shadowSize + 'px rgba(0, 0, 0, ' + shadowOpacity + ')';

	};

	window.addEventListener("scroll", handle);
	handle();

};

window.addEventListener("load", function(){

	headerShadow();

});