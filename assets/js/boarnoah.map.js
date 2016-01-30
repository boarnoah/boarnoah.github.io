var map;

$(document).ready(function() {
	//Load Google Maps Lib
	//$.getScript("https://maps.googleapis.com/maps/api/js", loadMap);
	$.getScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyB_496l4Wjx48HpP-OyK3oRAtTsNXBS-_4", loadMap);
});

function loadMap(){
	//alert("knock knock mother truckers");
	map = new google.maps.Map(document.getElementById('mapDiv'), {
		center: {lat: 0, lng: 0},
		zoom: 2
	});
}

