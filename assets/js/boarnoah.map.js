var map;
var loaded = false;
var inputBox;
var searchBox;

var markers;
var outputData;
var oSettings = {};

function Marker(e){
	var gMarker = e.gMarker ? e.gMarker : null;
	var key = e.key ? e.key : null;
	var lat = e.lat ? e.lat : null;
	var lng = e.lng ? e.lng : null;
	var addr = e.addr ? e.addr : null;
	var city = e.city ? e.city : null;
	var province = e.province ? e.province : null;
	var country = e.country ? e.country : null;
}

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
	
	markers = new Array();
	
	initSearchbar();
	initMarkerEvent();
	updateSettings();
	
	$('#refreshBtn').click(renderData);
	$('#dataForm').change(updateSettings);
	loaded = true;
}

//https://developers.google.com/maps/documentation/javascript/examples/places-searchbox
function initSearchbar(){
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

function initMarkerEvent(){
	map.addListener('click', function(e){
		var marker = new Marker({});
		
		var gMarker = new google.maps.Marker({
			position: e.latLng,
			map: map,
			parent: marker
		});

		gMarker.addListener('click', function(e){
			this.setMap(null);
			markers[this.parent.key] = null;
		});
		
		marker.gMarker = gMarker;
		marker.lat = gMarker.getPosition().lat();
		marker.lng = gMarker.getPosition().lng();
		markers.push(marker);
		marker.key = markers.length - 1;
		
		if(oSettings.needGeoCode)
			rgeocode(marker);
	});
}

// for when the user decides to enable geocoded details AFTER they marked points 
// on the map
function batchGeocode(){
	if(oSettings.needGeoCode == true){
		var delayTime = 200; //Google throttles at < 200ms 
		var delayIndex = 0;
		
		for(i = 0; i < markers.length; i++){
			var marker = markers[i];
			if(marker != null){
				var hasData = true;
				
				if(oSettings.oAddr && marker.addr == null)
					hasData = false;
				if(oSettings.oCity && marker.city == null)
					hasData = false;
				if(oSettings.oProvince && marker.province == null)
					hasData = false;				
				if(oSettings.oCountry && marker.country == null)
					hasData = false;
				
				// Only geocode if it hasn't already been done
				if(hasData == false){
					batchTimeOut(marker, (delayTime * delayIndex));
					delayIndex++;
				}
			}
		}
	}
}

function batchTimeOut(marker, delay){
	setTimeout(function(){
		rgeocode(marker);
	}, delay);
}

function updateSettings(){
	oSettings.format = $('input[name=formatType]:checked', '#formatForm').val();

	oSettings.oLat = $('#oLat').prop('checked');
	oSettings.oLong = $('#oLong').prop('checked');
	
	oSettings.oAddr = $('#oAddr').prop('checked');
	oSettings.oCity = $('#oCity').prop('checked');
	oSettings.oProvince = $('#oProvince').prop('checked');
	oSettings.oCountry = $('#oCountry').prop('checked');
	
	//Address info will require reverse geocoding on the lat/long data
	if(oSettings.oAddr || oSettings.oCity || oSettings.oProvince || oSettings.Country)
		oSettings.needGeoCode = true;
}

function rgeocode(marker){
	marker.hasData = true;
}

function renderData(){
	updateSettings();
	batchGeocode();
	if(oSettings.format == 'oJSON'){
		var oDataArray = new Array();
		
		for(i = 0; i < markers.length; i++){
			if(markers[i] != null){
				var node = {};
				var marker = markers[i];
				
				if(oSettings.oLat)
					node.Latitude = marker.lat;
				if(oSettings.oLong)
					node.Longitude = marker.lng;
				oDataArray.push(node);
			}
		}
		
		$('#outputBox').val(JSON.stringify(oDataArray, null, 2));
	}else if(oSettings.format == 'oCSV'){
		var oDataString = "";
		
		for(i = 0; i < markers.length; i++){
			if(markers[i] != null){
				var marker = markers[i];
				if(oSettings.oLat)
					oDataString += '\"' + marker.lat + '\", ';
				if(oSettings.oLong)
					oDataString += '\"' + marker.lng + '\"';
				
				oDataString += '\n';
			}
		}
		$('#outputBox').val(oDataString);
	}
}