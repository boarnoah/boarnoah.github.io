var map;
var inputBox;
var searchBox;

$(document).ready(function() {
	//Load Google Maps Lib (use non key version when testing locally)
	//$.getScript("https://maps.googleapis.com/maps/api/js?libraries=places", loadMap);
	$.getScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyB_496l4Wjx48HpP-OyK3oRAtTsNXBS-_4&libraries=places", loadMap);
});

function loadMap(){
	//alert("knock knock mother truckers");
	map = new google.maps.Map(document.getElementById('mapDiv'), {
		center: {lat: 0, lng: 0},
		zoom: 2
	});
	
	initSearchbar();
}

function initSearchbar(){
	//https://developers.google.com/maps/documentation/javascript/examples/places-searchbox
	//Create the search box and link it to the UI element.
	inputBox = document.getElementById('pac-input');
	searchBox = new google.maps.places.SearchBox(inputBox);
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(inputBox);
	
	// Bias the SearchBox results towards current map's viewport.
	map.addListener('bounds_changed', function() {
		searchBox.setBounds(map.getBounds());
	});
	
	searchBox.addListener('places_changed', function() {
		var places = searchBox.getPlaces();

		if (places.length == 0) {
		  return;
		}
		
		// For each place, get the icon, name and location.
		var bounds = new google.maps.LatLngBounds();
		
		places.forEach(function(place) {
		  if (place.geometry.viewport) {
			// Only geocodes have viewport.
			bounds.union(place.geometry.viewport);
		  } else {
			bounds.extend(place.geometry.location);
		  }
		});
		
		map.fitBounds(bounds);
	});
}