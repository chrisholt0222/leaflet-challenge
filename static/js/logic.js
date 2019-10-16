// Set Options range and colors
var labels = ["Mag: 0-1", "Mag: 1-2", "Mag: 2-3", "Mag: 3-4", "Mag: 4-5", "Mag: 5+"];
var optColors = ["green", "lightgreen", "gold", "orange", "orangered", "crimson"];

// Creating map object
var myMap = L.map("map", {
    center: [41.2565, -95.9345],
    zoom: 4
  });
  
// Adding tile layer
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  }).addTo(myMap);

// Load in geojson data
//var geoData = "static/data/1.geojson";

var geoData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
  
var geojson;

//Set Color based on Magnitude of EQ
function setColor(magnitude) {
    var ind = 5;
    for (i = 0; i < optColors.length; i++){ if (magnitude<i+1) {ind = i; break;} }   
    return optColors[Math.min(5,ind)];
    };

// Set the legend
function createLegend(){
    //Create HTML place holder for legend
    var info = L.control({ position: "bottomright" })
    info.onAdd = function(){
        var div = L.DomUtil.create("div","legend");
        return div;
        };
    info.addTo(myMap);

    // Create Legend table
    var setHtml = "<div>Legend</div>";    
    for (i = 0; i < labels.length; i++){
        setHtml += "<div style = \"background-color: " + optColors[i] + "\">" + labels[i] + "</div> ";    
        };
    document.querySelector(".legend").innerHTML = [setHtml].join();
    };

//Set the size, color, location of EQ circle 
function createCircles(earthquakeData) {
    var EQ = L.geoJson(earthquakeData,{
        pointToLayer: function (feature, latlng) {
            var mag = feature.properties.mag
            var options = {
                radius: mag * mag / 1.25,
                fillColor: setColor(mag),
                color: "black",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.6
            };
            
          return L.circleMarker(latlng, options)
            .bindPopup("<p>" + "Location: " + feature.properties.place +
            "<br> Date/Time: " + new Date (feature.properties.time) +
            "<br> Magnitude: " + feature.properties.mag + "</p>");
        }
      });
    return EQ
};
// Grab data with d3
d3.json(geoData, function(response) {
    // Display legend
    createLegend();    
    
    createCircles(response.features).addTo(myMap);

    
});
