//jquery stuff
$(document).ready(function() {
	//Mobile menu init
	$('#sidebar nav ul').mobileMenu({'topOptionText': 'Menu', 'prependTo': '#sidebar nav'});

	//Copy alt's to title (for hover text), ty stackoverflow
	$('img').each( function() {
	var o = $(this);
	if( ! o.attr('title') && o.attr('alt') ) o.attr('title', o.attr('alt') );
	});
	
	hideDropDown();
});

//Hides the submenu and adds hover dropdown to it
function hideDropDown(){
	$('#projectDropDownList:visible').slideUp(1);
	
	//Add hover dropdown functionality
	$('#projectDropDown').hover(
		function(){
			$('#projectDropDownList:hidden').slideDown();
		},
		function(){
			$('#projectDropDownList:visible').slideUp();
		}
	);
}

//Utilities
//Debounce out of underscore.js ty  https://davidwalsh.name/javascript-debounce-function
$.b_debounce = function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};