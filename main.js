// https://laracasts.com/discuss/channels/javascript/variable-outside-ajax-request
// https://medium.com/@maptastik/loading-external-geojson-a-nother-way-to-do-it-with-jquery-c72ae3b41c01

var new_html;

var map = L.map('map_01',{
  zoomControl:false
}).setView([47.4979,19.0402], 10);
var markersGroup = L.layerGroup().addTo(map);
var dataGroup = L.layerGroup().addTo(map);
var dataArray = [];

var sideNav = document.getElementById("side-nav");
var sideNavOpen = true;

var dbColumnNames = ["First_name","Last_name","title_maiden_name","Gender","Birth_Place","Birth_Year","Mother","Address"];
var inputElementIds = ["firstname","lastname","maidenname","gender","birthplace","birthyear","mother","address"];

// all of this could be wrapped up in a few different objects
var geojsonFileNames = ["buda","individual_districts","international_ghetto_location","pest","study_area"];
var geojsonNames = ["Buda","Individual_Districts","International_Ghetto","Pest","Study_Area"]
var geojsonTypes = ["polygon","polygon","polygon","polygon","polygon"];
var geojsonLayerColors = ["#87CEFA","#EEE8AA","#90EE90","#DDA0DD","#F08080"];

var geojsonDict = {};

var legendTable = document.getElementById("legendTable")



function createLegend(layerName,color,type) {
  var type;
  switch(type) {
    case "polygon":
    type = "polygon";
    break;
    case "polyline":
    type = "polyline";
    break;
    case "point":
    type = "point";
    break;
  }

  var row = legendTable.insertRow(-1)
  var rep = row.insertCell(0)
  var name = row.insertCell(1)
  var radio = row.insertCell(2)

  rep.innerHTML = "<div class="+type+" geom-rep style='background-color:"+color+"'></div>"
  name.innerHTML = layerName
  radio.innerHTML = "<input type='checkbox' name="+layerName+" value='true' onchange='changeVisibility(this.name)' checked>"
}

function changeVisibility(layerName) {
  var layer = geojsonDict[layerName]["layer"];

  if (geojsonDict[layerName]["visible"] == true) {
    layer.setStyle({fillOpacity:0,opacity:0});
    geojsonDict[layerName]["visible"] = false;
  } else {
    layer.setStyle({fillOpacity:0.2,opacity:1.0});
    geojsonDict[layerName]["visible"] = true;
  }
}



function addGeojsonLayers() {

  function fixCoordinates(coordinates){
    var coordinatesFixed = [];

    for (var j = 0; j < coordinates.length; j++) {
      coordinatesFixed.push([coordinates[j][1],coordinates[j][0]]);
    }
    return coordinatesFixed
  }


  for (var i = 0; i < geojsonFileNames.length; i++) {
    createLegend(geojsonNames[i],geojsonLayerColors[i],geojsonTypes[i])
    $.ajax({
      dataype:"json",
      url:"data/"+geojsonFileNames[i]+".geojson",
      async:false,
      success:function(data){
        data_json = JSON.parse(data);

        // var coordinates = data_json["features"][0]["geometry"]["coordinates"][0][0];
        // var coordinatesFixed = fixCoordinates(coordinates)

        var geojson = L.geoJSON(data_json,{
          color:geojsonLayerColors[i]
        });

        geojson.addTo(dataGroup);
        // var polygon = L.polygon(coordinatesFixed,{
        //   color:geojsonLayerColors[outerCount],
        // });
        //
        // polygon.addTo(dataGroup);

        // geojsonDict[geojsonNames[outerCount]]["layer"] = geojson
        //
        // console.log(geojsonDict[geojsonNames[outerCount]]["layer"])

        geojsonDict[geojsonNames[i]] = {
          "filename":geojsonFileNames[i],
          "type":geojsonTypes[i],
          "color":geojsonLayerColors[i],
          "layer":dataGroup.getLayers()[i],
          "visible":true
        };
      }
    });
  }
}

function slideOutLeft(){
  if (sideNavOpen == true){
    $("#side-nav").animate({left:"-638px"});
    sideNavOpen = false;
  } else {
    $("#side-nav").animate({left:"0px"});
    sideNavOpen = true;
  }
  // sideNav.classList.add("animated","slideOutLeft");
  // document.getElementById("sideNavButtonOuter").style.display = "block";

}

var spinner = document.getElementById("spinner");
function getNames(){
  spinner.style.display ="inline-block";

  var data = {};
  data["columnNames"] = []
  for (var i = 0 ; i < dbColumnNames.length; i++) {
    var element = document.getElementById(inputElementIds[i]).value;
    if (element !== "") {
      data[dbColumnNames[i]] = element;
      data["columnNames"].push(dbColumnNames[i]);
    }
  }

  // data["columnNames"] = dbColumnNames;



  console.log(data)

  if(data["columnNames"].length ==0){
    spinner.style.display ="none";
    return null
  }

    $.ajax({
      type:"post",
      url:"php/connect.php",
      data:data,
      success: function(html){
        console.log("success")
        console.log(typeof new_html)
        console.log(html)
        new_html = JSON.parse(html);
        // $('#personInfo').html(new_html[0]["first_name"]);
        createTable()
        spinner.style.display ="none";
      }
    })
}

// need to break this up
function createTable(){
  var table = document.getElementById("table");

  for (var i = table.rows.length-1;i >0; i--){
    table.deleteRow(i);
  }

  markersGroup.clearLayers()

  for(var i =0;i < new_html.length ;i++){

    var x = parseFloat(new_html[i]["x"]).toFixed(3);
    var y = parseFloat(new_html[i]["y"]).toFixed(3);
    var lastname = new_html[i]["Last_name"];
    var firstname = new_html[i]["First_name"];
    var address = new_html[i]["Address"];
    var birthplace = new_html[i]["Birth_Place"]
    var birthyear = new_html[i]["Birth_Year"]

    var row  = table.insertRow(i+1);
    var firstnameCell = row.insertCell(0);
    var lastnameCell = row.insertCell(1);
    var birthplaceCell = row.insertCell(2);
    var birthyearCell = row.insertCell(3);
    var addressCell = row.insertCell(4);
    var xCell = row.insertCell(5);
    var yCell = row.insertCell(6);


    firstnameCell.innerHTML = firstname;
    lastnameCell.innerHTML = lastname;
    xCell.innerHTML = x;
    yCell.innerHTML = y;
    birthplaceCell.innerHTML = birthplace;
    birthyearCell.innerHTML = birthyear;
    addressCell.innerHTML = address;

    console.log("x is:" + x)
    console.log(typeof x)
    if(x !== "NaN"){

      var popupContent = `<table>
        <tr>
        <td>last_name</td>
        <td>first_name</td>
        <td>birth place</td>
        <td>birth year</td>
        <td>address</td>
        <td>x</td>
        <td>y</td>

        </tr>
        <tr>
        <td>`+lastname+`</td>
        <td>`+firstname+`</td>
        <td>`+birthplace+`</td>
        <td>`+birthyear+`</td>
        <td>`+address+`</td>
        <td>`+x+`</td>
        <td>`+y+`</td>
        </tr>`



      for (var j=0; j< new_html.length; j++){
        var x_j = parseFloat(new_html[j]["x"]).toFixed(3);
        var y_j = parseFloat(new_html[j]["y"]).toFixed(3);
        var firstname_j = new_html[j]["First_name"];
        var lastname_j = new_html[j]["Last_name"];
        var address_j = new_html[i]["Address"];
        var birthplace_j = new_html[i]["Birth_Place"];
        var birthyear_j = new_html[i]["Birth_Year"];

        if (x == x_j && y == y_j && firstname !== firstname_j){

            popupContent += `
            <tr>
            <td>`+lastname_j+`</td>
            <td>`+firstname_j+`</td>
            <td>`+birthplace_j+`</td>
            <td>`+birthyear_j+`</td>
            <td>`+address_j+`</td>
            <td>`+x_j+`</td>
            <td>`+y_j+`</td>
            </tr>`
        }
      }

      popupContent += "</table>"

      var popup = L.popup({
        maxWidth:500
      }).setContent(popupContent)

      var marker = L.marker([y,x])
      marker.bindPopup(popup).openPopup();
      marker.addTo(markersGroup);

    }

  }
}


var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);



addGeojsonLayers();


// var overlayMaps={
//   "data":dataGroup
// }
//
// var baseLayers = {
//   "OpenStreetMap":osm
// }
// L.control.layers(baseLayers,overlayMaps).addTo(map);

L.control.zoom({
  position:"topright"
}).addTo(map);
