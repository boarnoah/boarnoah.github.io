var map;
var geocoder;
var inputBox;
var searchBox;

var markers = new Array();
var outputData;
var oSettings = {};

function Marker(e){
	var e = e ? e : null;
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
	map = new google.maps.Map(document.getElementById('mapDiv'), {
		center: {lat: 0, lng: 0},
		zoom: 2
	});
	geocoder = new google.maps.Geocoder;
	
	initSearchbar();
	initMarkerEvent();
	updateSettings();
	
	$('#dataForm').change(function(){
		updateSettings();
		
		if(oSettings.needGeoCode){
			batchGeocode();
		}else{
			renderData();
		}
	});
	$('#formatForm input[name=formatType]').change(function(){
		updateSettings();
		renderData();
	});
	
	$('#downloadBtn').click($.b_debounce(function(){
		updateSettings();
		downloadData();
	}, 500, true));
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
			updateSettings();
			renderData();
		});
		
		marker.gMarker = gMarker;
		marker.lat = gMarker.getPosition().lat();
		marker.lng = gMarker.getPosition().lng();
		markers.push(marker);
		marker.key = markers.length - 1;
		
		if(oSettings.needGeoCode){
			renderData(); //To add point, rerendered when geocode data comes in
			rgeocode(marker, 3, function(e){
				if(e.sucess){
					updateSettings();
					renderData();
				}
			});
		}else{
			updateSettings();
			renderData();
		}
	});
}

// for when the user decides to enable geocoded details AFTER they marked points >.<
function batchGeocode(callback){
	var geocodeNum = 0;
	for(i = 0; i < markers.length; i++){
		if(markers[i] != null && markers[i].addr == null){
			batchSingleRequest(i, geocodeNum, callback);
			geocodeNum++;
		}
	}
	
	renderData(); //Render for when all points are already geocoded (else its rendered as par to async code)
}
function batchSingleRequest(i, geocodeNum, callback){
	console.log("BATCHING: " + i);
	setTimeout(function(){
		rgeocode(markers[i], 3, function(e){
			console.log(i + "CB " + e.sucess);
			if(e.sucess){
				updateSettings();
				renderData();
			}else{
				console.log("STAT" + e.status);
			}
		});
	}, (geocodeNum * 500));
}

function updateSettings(){
	oSettings.format = $('input[name=formatType]:checked', '#formatForm').val();

	oSettings.oLat = $('#oLat').prop('checked');
	oSettings.oLong = $('#oLong').prop('checked');
	
	oSettings.oAddr = $('#oAddr').prop('checked');
	
	//Address info will require reverse geocoding on the lat/long data
	if(oSettings.oAddr === true)
		oSettings.needGeoCode = true;
	else
		oSettings.needGeoCode = false;
}

function rgeocode(marker, retry, callback){
	callback = callback ? callback : function(){};
	geocoder.geocode({'location' : marker.gMarker.getPosition()}, function(results, status){
		if(status === google.maps.GeocoderStatus.OK){
			//Format + store address, only really care if a detailed address exists
			marker.raw = results;
			if(results[0])
				marker.addr = results[0].formatted_address;
			
			callback({sucess : true});
		}else if(status === google.maps.GeocoderStatus.ZERO_RESULTS){
			marker.raw = results;
			marker.addr = "no address";
			callback({sucess : true});
		}else if(status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT){
			if(retry > 0){
				retry--;
				setTimeout(function(){
					rgeocode(marker, retry, callback);
				}, (1000 * (3 - retry))); //Exponential Backoff
			}else{
				callback({sucess : false, status: "OVER_QUERY_LIMIT"});
			}
		}else{
			callback({sucess : false, status: "OTHER"});
		}
	});
}

function renderData(){
	var formattedData = createData(oSettings.format);
	$('#outputBox').val(formattedData);
}

function createData(format){
	var formattedData = "";
	if(format === "oJSON"){
		var oDataArray = new Array();
		
		for(i = 0; i < markers.length; i++){
			if(markers[i] != null){
				var node = {};
				var marker = markers[i];
				
				if(oSettings.oLat)
					node.Latitude = marker.lat;
				if(oSettings.oLong)
					node.Longitude = marker.lng;
				if(oSettings.oAddr)
					node.Address = marker.addr;
				oDataArray.push(node);
			}
		}
		
		formattedData = JSON.stringify(oDataArray, null, 2);
	}else if(format === "oCSV"){
		
		for(i = 0; i < markers.length; i++){
			if(markers[i] != null){
				var marker = markers[i];
				if(oSettings.oLat)
					formattedData += '\"' + marker.lat + '\"';
				if(oSettings.oLong)
					formattedData += ', \"' + marker.lng + '\"';
				if(oSettings.oAddr)
					formattedData += ', \"' + marker.addr + '\"';
				
				formattedData += '\n';
			}
		}
	}
	
	return formattedData;
}

function downloadData(){
	var formattedData = createData(oSettings.format);
	var downloadElement = document.createElement('a');
	
	var mimeType = "text/plain";
	var extension = ".txt";
	
	if(oSettings.format === "oJSON"){
		mimeType = "application/json";
		extension = ".json";
	}else if(oSettings.format === "oCSV"){
		mimeType = "text/csv";
		extension = ".csv";
	}
	
	downloadElement.setAttribute("href", ("data:" + mimeType + ",")
									+ encodeURIComponent(formattedData));
	downloadElement.setAttribute("download", ("boarnoah_map_" + Date.now() + extension));
	downloadElement.setAttribute("target", "_blank");
	document.body.appendChild(downloadElement);//The click won't fire till its added to the DOM
	downloadElement.click();
	document.body.removeChild(downloadElement);
}
