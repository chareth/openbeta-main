function prepareMap(container_id, map_center=[36.1614211,-115.4500339]) {
    var mapboxUrl = "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidmlldGdvZXN3ZXN0IiwiYSI6ImNpbzljZnVwNTAzM2x2d2x6OTRpb3JjMmQifQ.rcxOnDEeY4McXKDamMLOlA";

    var attribution ='Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>';

    var outdoorsLayer = L.tileLayer(mapboxUrl, {
                                maxZoom: 22,
                                attribution: attribution,
                                id: 'mapbox.outdoors'
                            });

    var satelliteLayer = L.tileLayer(mapboxUrl, {
                                maxZoom: 22,
                                attribution: attribution,
                                id: 'mapbox.satellite'
                            });

    var osmLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                                maxZoom: 22,
                                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
                                id: 'mapbox.light'
                            });

    //TODO: add the ability to center map from script to support search
    var mymap = L.map(container_id, {
        center: map_center,
        zoom: 12,
        layers: [outdoorsLayer, satelliteLayer, osmLayer]});

    var tileLayers = {
        "Satellite": satelliteLayer,
        "Topo (3m resolution)": outdoorsLayer,
        "OpenStreetMap": osmLayer};

    L.control.layers(tileLayers).addTo(mymap);
    L.control.scale().addTo(mymap);

    var markerClusters = L.markerClusterGroup({ disableClusteringAtZoom: 18, spiderfyOnMaxZoom: false });
    mymap.addLayer(markerClusters);
    return {mapLayer: mymap, clustersLayer: markerClusters};
}


var geojsonMarkerOptions = {
    radius: 5,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8};

function queryOverpass(mapLayer, mapCenter, markerOpts=geojsonMarkerOptions) {
    var //bbString = formatBBox(),
        overpassQuery = encodeURIComponent('node(around:50000,36.14893,-115.42279)["sport"="climbing"] ;out body qt;'),
        overpassURL = "http://overpass-api.de/api/interpreter?data=[out:json];" + overpassQuery;
//        console.log("Bounding Box: " + bbString);
//        console.log("Overpass Query URL=" + overpassURL);
    $.ajax({
        url : overpassURL,
        type : 'GET',
        crossDomain : true,
        success : function (data) {
            makeMarkers(mapLayer, data, markerOpts);
        },
        error : function (request, status, errorThrown) {
            window.alert("Overpass Query failed with error: \n" + errorThrown);
        }
    });
}


function makeMarkers(map, data, markerOpts) {
    var allMarkers = [];
    for(var i = 0; i < data.elements.length; i++) {
        var pos, popupContent, popup, marker,
        e = data.elements[i];

        if ( e.type === 'node' ) {
            pos = new L.LatLng(e.lat, e.lon);
        } else {
            pos = new L.LatLng(e.center.lat, e.center.lon);
        }
        marker = L.circleMarker(pos, markerOpts);

        popupContent = _getPoiPopupHTML(e.tags, e.id);
        popup = L.popup().setContent( popupContent );
        marker.bindPopup(popup);
        allMarkers.push(marker);
    }
    map.addLayers(allMarkers);
}


function _getPoiPopupHTML(tags, id) {

    var row,
    link = document.createElement('a'),
    table = document.createElement('table'),
    div = document.createElement('div');

    link.href = 'http://www.openstreetmap.org/edit?editor=id&node=' + id;
    link.appendChild(document.createTextNode('Edit this entry in OpenStreetMap'));

    table.style.borderSpacing = '10px';
    table.style.borderCollapse = 'separate';

    for (var key in tags){

        row = table.insertRow(0);
        row.insertCell(0).appendChild(document.createTextNode(key));
        row.insertCell(1).appendChild(document.createTextNode(tags[key]));
    }

    div.appendChild(link);
    div.appendChild(table);

    return div;
}