// Set Options range and colors
var labels = ["Mag: 0-1", "Mag: 1-2", "Mag: 2-3", "Mag: 3-4", "Mag: 4-5", "Mag: 5+"];
var optColors = ["green", "lightgreen", "gold", "orange", "orangered", "crimson"];

// Load in geojson data
//var geoData = "static/data/1.geojson";
var boundary = "static/data/PB2002_boundaries.json";
var plates = "static/data/PB2002_plates.json";

var geoData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

//Set Color based on Magnitude of EQ
function setColor(magnitude) {
    var ind = 5;
    for (i = 0; i < optColors.length; i++){ if (magnitude<i+1) {ind = i; break;} }   
    return optColors[Math.min(5,ind)];
    };

// Set the legend
function createLegend(getMap){
    //Create HTML place holder for legend
    var info = L.control({ position: "bottomright" })
    info.onAdd = function(){
        var div = L.DomUtil.create("div","legend");
        return div;
        };
    info.addTo(getMap);

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
        
  var earthquakes = createCircles(response.features);

  // Adding tile layers
  var streetLevel = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
      });
    
  var pirates = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.pirates",
    accessToken: API_KEY
  });

  var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  // Create a baseMaps object to hold the lightmap layer
  var baseMaps = {
    "Street Level" : streetLevel,
    "Pirates": pirates,
    "Outdoors" : outdoors,
    "Satellite" : satellite
   };

  //Get style for boundary
  var myStyle = {
    "color": "orange",
    "weight": 5,
    "opacity": 0.5
  };

  //Add Boundary lines
  var myBoundary = L.geoJSON([],{style:myStyle});

  d3.json(boundary, function(data) {
    myBoundary.addData(data.features);
  });  


  // Create an overlayMaps object to hold the bikeStations layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Boundary" : myBoundary
  };

  // Create the map object with options
  var myMap = L.map("map", {
    center: [41.2565, -95.9345],
    zoom: 4,
    layers: [streetLevel, earthquakes, myBoundary]
  });

  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

// Display legend
  createLegend(myMap); 

});