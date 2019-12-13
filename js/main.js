/**
* Helpful resources:
*
* https://laracasts.com/discuss/channels/javascript/variable-outside-ajax-request
* https://medium.com/@maptastik/loading-external-geojson-a-nother-way-to-do-it-with-jquery-c72ae3b41c01
* https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript/37511463#37511463
**/

/*******************************************************************************
********************* Initialize variables *************************************
*******************************************************************************/

var new_html;

var database_php_script = "connect_sqlite.php"

var map = L.map('map_01',{
  zoomControl:false
}).setView([47.4979,19.0402], 10);
var markersGroup = L.layerGroup().addTo(map);
var dataGroup = L.layerGroup().addTo(map);
var dataArray = [];

var sideNav = document.getElementById("side-nav");
var sideNavOpen = true;

var dbColumnNames = ["Title","First_name","Last_name","Maiden_name","Gender","Birth_Place","Birth_Year","Mother","Address","x","y"];
var inputElementIds = ["title","firstname","lastname","maidenname","gender","birthplace","birthyear","mother","address"];
var popupElements = ["First_name","Last_name","Address","x","y"];

var geojsonFileNames = ["buda","individual_districts","international_ghetto_location","pest","study_area"];
var geojsonNames = ["Buda","Individual_Districts","International_Ghetto","Pest","Study_Area"]
var geojsonTypes = ["polygon","polygon","polygon","polygon","polygon"];
var geojsonLayerColors = ["#87CEFA","#EEE8AA","#90EE90","#DDA0DD","#F08080"];
var geojsonDict = {};

var legendTable = document.getElementById("legendTable")

var spinner = document.getElementById("spinner");

/*******************************************************************************
************************* Functions ********************************************
*******************************************************************************/

/*******************************************************************************
 * Normalizes strings to NFD Unicode normal form.
 * @param  {String} string    a string
 * @return {string}           mapped string
 */
function mapString(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

/*******************************************************************************
 * Adds legend elements to div
 * @param  {String} layerName name of the layer
 * @param  {String} color     desired color for the layer
 * @param  {String} type      geom type of the layer
 * @return {none}             null
 */
function createLegend(layerName,color,type) {

  // select the legend table and insert the variables in the table cells
  var row = legendTable.insertRow(-1)
  var rep = row.insertCell(0)
  var name = row.insertCell(1)
  var radio = row.insertCell(2)

  // set the innerHTML to the following html elements
  rep.innerHTML = "<div class="+type+" geom-rep style='background-color:"+color+"'></div>"
  name.innerHTML = layerName
  radio.innerHTML = "<input type='checkbox' name="+layerName+" value='true' onchange='changeVisibility(this.name)' checked>"
}


/*******************************************************************************
 * Change visibility for a given layer
 * @param  {String} layerName name of the layer
 * @return {none}             null
 */
function changeVisibility(layerName) {
  var layer = geojsonDict[layerName]["layer"];

  // if the layer is visible set the opacity to 0, else set the opacity to 1
  if (geojsonDict[layerName]["visible"] == true) {
    layer.setStyle({fillOpacity:0,opacity:0});
    geojsonDict[layerName]["visible"] = false;
  } else {
    layer.setStyle({fillOpacity:0.2,opacity:1.0});
    geojsonDict[layerName]["visible"] = true;
  }
}


/*******************************************************************************
 * function that makes an ajax call to a php script to retreive datasets,filling
 * an object with various parameters from the retreived dataset.
 * @return {none}             null
 */
function addGeojsonLayers() {

  // loop through each of the filenames (paths to the files)
  for (var i = 0; i < geojsonFileNames.length; i++) {
    // create the legend with the apporpriate attributes
    createLegend(geojsonNames[i],geojsonLayerColors[i],geojsonTypes[i])
    // make an ajax call to the dataset we are looking for
    $.ajax({
      dataype:"json",
      url:"data/"+geojsonFileNames[i]+".geojson",
      // this is set to false to include certain data within an object we will
      // use later
      async:false,
      success:function(data){
        // parse the retrieved data
        data_json = JSON.parse(data);
        // get a geoJSON object and set the colors
        var geojson = L.geoJSON(data_json,{
          color:geojsonLayerColors[i]
        });

        // add the geoJSON object to the dataGroup layerGroup object
        geojson.addTo(dataGroup);

        // fill a personal object with various info of file we are on
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

/*******************************************************************************
 * slides an element left by so many pixels and then back to if cliked on again.
 * @param  {String} elementID   id of the element
 * @param  {String} slideAmount amount of pixels to move left by
 * @return {none}               null
 */
function slideOutLeft(elementID,slideAmount){
  if (sideNavOpen == true){
    $(elementID).animate({left:slideAmount});
    sideNavOpen = false;
  } else {
    $(elementID).animate({left:"0px"});
    sideNavOpen = true;
  }
}

/*******************************************************************************
 * A function used to create a JSON structured object which is in turn used to
 * make an Ajax call to a php script to retreive certain datasets based on a
 * series of query inputs.
 * @param  {String} elementID   id of the element
 * @param  {String} slideAmount amount of pixels to move left by
 * @return {none}               null
 */
function getNames(){
  // reveal the spinner html element
  spinner.style.display ="inline-block";

  function fillColumnDictionary (elementIds,columnNames) {
    var data = {};
    data["columnNames"] = []
    for (var i = 0 ; i < elementIds.length; i++) {
      var element = document.getElementById(elementIds[i]).value;

      if (element !== "") {
        if (elementIds[i] == "birthyear") {
          data[columnNames[i]] = {"value":element,"conditional":document.getElementById("birthyear_conditional").value};
          data["columnNames"].push(columnNames[i]);
        } else {
          element = element.toLowerCase(mapString(element));
          data[columnNames[i]] = {"value":element,"conditional":"="};
          data["columnNames"].push(columnNames[i]);
        }
      }
    }
    return data
  }

  var data = fillColumnDictionary(inputElementIds,dbColumnNames)
  // check to see if the column names list is greater than 0, if not break out
  // of the function
  if(data["columnNames"].length ==0){
    spinner.style.display ="none";
    return null
  }

  console.log(data);

    $.ajax({
      type:"post",
      url:"php/"+ database_php_script,
      data:data,
      success: function(html){
        console.log("success")
        // console.log(typeof new_html)
        console.log(html)
        new_html = JSON.parse(html);
        // $('#personInfo').html(new_html[0]["first_name"]);
        createTable()
        spinner.style.display ="none";
      }
    });
}

/*******************************************************************************
 * A function designed to create table and popup elements for a webmap.
 * It makes use of several nested functions to iterate and manipulate over a
 * queried dataset.
 * @return {none}               null
 */
function createTable(){

  // ** Begin of nested functions **********************************************

  function resetTable(tableElement) {
    for (var i = tableElement.rows.length-1;i >0; i--){
      table.deleteRow(i);
    }
  }

  function createResultsDict(dbResult,columnNames,iteration) {
    var resultsDict = {}
    for(var j=0; j < columnNames.length; j++){
      if (columnNames[j] === "x" || columnNames[j] === "y"){
        resultsDict[columnNames[j]] = parseFloat(dbResult[iteration][columnNames[j]]).toFixed(8);
      }else{
        resultsDict[columnNames[j]] = dbResult[iteration][columnNames[j]];
      }
    }
    return resultsDict;
  }

  function createCells(tableElement,rowPosition,resultsDict,columnNames){
    var row = tableElement.insertRow(rowPosition+1);

    for (var i = 0; i < columnNames.length; i++){
      var cell = row.insertCell(i);
      cell.innerHTML = resultsDict[columnNames[i]];
    }
  }

  function createPopupContent(columnNames,resultsDict) {

    var popupContent_add = "</tr><tr>";
    for (var i = 0; i < columnNames.length; i++) {
      popupContent_add += "<td>"+resultsDict[columnNames[i]]+"</td>";
    }
    popupContent_add += "</tr>";

    return popupContent_add;
  }
  // *** End of nested functions ***********************************************

  var table = document.getElementById("table");
  var tempResultsList = [];

  resetTable(table);
  markersGroup.clearLayers()

  for (var temp_i = 0 ; temp_i < new_html.length; temp_i ++){
    tempResultsList.push(createResultsDict(new_html,dbColumnNames,temp_i));
  }

  for(var main_i = 0;main_i < new_html.length;main_i++){

    var resultsDict = createResultsDict(new_html,dbColumnNames,main_i)

    createCells(table,main_i,resultsDict,dbColumnNames)

    if(resultsDict["x"] !== "NaN"){

      var popupContent = "<table> <tr>";
      for (var pop_i = 0; pop_i < popupElements.length; pop_i++) {
        popupContent += "<td>"+popupElements[pop_i]+"</td>";
      }

      popupContent += createPopupContent(popupElements,resultsDict);

      for (var check_i = 0; check_i < tempResultsList.length; check_i++) {

        if(resultsDict["x"] == tempResultsList[check_i]["x"] && resultsDict["y"] == tempResultsList[check_i]["y"] && resultsDict["ID"] != tempResultsList[check_i]["ID"]) {
          popupContent += createPopupContent(popupElements,tempResultsList[check_i])
        }
      }

      popupContent += "</table>"

      var popup = L.popup({
        maxWidth:500
      }).setContent(popupContent)

      var marker = L.marker([resultsDict["y"],resultsDict["x"]])
      marker.bindPopup(popup).openPopup();
      marker.addTo(markersGroup);
    }
  }
}

var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

addGeojsonLayers();

L.control.zoom({
  position:"topright"
}).addTo(map);
