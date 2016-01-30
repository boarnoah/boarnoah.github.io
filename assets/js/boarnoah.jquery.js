$(document).ready(function() {
  //Mobile menu init
  $('#sidebar nav ul').mobileMenu({'topOptionText': 'Menu', 'prependTo': '#sidebar nav'});
  
  //Copy alt's to title (for hover text), ty stackoverflow
  $('img').each( function() {
    var o = $(this);
    if( ! o.attr('title') && o.attr('alt') ) o.attr('title', o.attr('alt') );
  });
});