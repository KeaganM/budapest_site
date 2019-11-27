require(["esri/Map",
 "esri/views/MapView",
 "esri/layers/FeatureLayer",
 "esri/widgets/Expand",
"esri/widgets/BasemapGallery",
"esri/request"],
 function(Map, MapView,FeatureLayer,Expand,BasemapGallery,esriRequest) {

  var featureLayer = new FeatureLayer({
    url:"https://services9.arcgis.com/6UFiRNGaGhS09LMr/arcgis/rest/services/final_geocoded_dataset_23sep2019/FeatureServer"
  });

  var map = new Map({
    basemap: "dark-gray",
    layers: [featureLayer]
  });

  var view = new MapView({
    container: "viewDiv", // Reference to the DOM node that will contain the view
    map: map, // References the map object created in step 3
    center:[19.04,47.49],
    zoom:10,

  });

  var basemapGallery = new BasemapGallery({
    view:view,
    container: document.createElement("div")
  });

  var bgExpand = new Expand({
    view:view,
    content:basemapGallery
  });

  view.ui.add(bgExpand,"top-right");
  view.ui.move("zoom","top-right");

  var template = {
    title: "{Address}",
    content: [
      {
        type: "fields",
        fieldInfos: [
          {
            fieldName: "X", // The field whose values you want to format
            label: "X"
          },
          {
            fieldName: "Y", // The field whose values you want to format
            label: "Y"
          }
        ]
      }
    ]
  };

  featureLayer.popupTemplate = template


  populateAttributesTable();

  //populate the attribute of a given layer
  function populateAttributesTable(e) {

      //alert("calling attribute table for Layer " + e.target.layerid);
       let queryurl = "https://services9.arcgis.com/6UFiRNGaGhS09LMr/arcgis/rest/services/final_geocoded_dataset_23sep2019/FeatureServer/0";
       let queryOptions = {
              responseType: "json",
              query:
              {
                   f: "json",
                   where:"1=1",
                   returnCountOnly: false,
                   outFields: "*",
                   resultRecordCount: "1000"
              }
         }

      esriRequest(queryurl, queryOptions).then(response => {
          console.log("The response is: ", response);
          let tableWrapper = document.getElementById("tableWrapper");
          let table = document.createElement("table");
          table.id = "dataTable";
          table.className = "table table-striped table-hover";
          //tableWrapper.appendChild(table); //appends the table to tableWrapper
          let header = document.createElement("thead");
          table.appendChild(header);
          let tableRowHeader = document.createElement("tr");
          header.appendChild(tableRowHeader);

          for (let i = 0; i < 5; i++) {
              let headTable = document.createElement("th");
              headTable.innerHTML = response.data.fields[i].alias;
              tableRowHeader.appendChild(headTable);
          }

          let headTableOptions = document.createElement("th");
          headTableOptions.innerHTML = "Options";
          tableRowHeader.appendChild(headTableOptions);

          let tableBody = document.createElement("tbody");
          table.appendChild(tableBody);

          for (let j = 0; j < response.data.features.length; j++)
             {
                  let feature = response.data.features[j];
                  let tableRowBody = document.createElement("tr");
              tableBody.appendChild(tableRowBody);
                  for (let i = 0; i < 5; i++)
                  {
                       let field = response.data.fields[i];
                     let divTable =
                                   document.createElement("td");
                        divTable.innerHTML =
                                   feature.attributes[field.name];
                  tableRowBody.appendChild(divTable);
              }

              let footerTD = document.createElement("td");
              tableRowBody.appendChild(footerTD);
              let editModal = document.createElement("a");
              editModal.setAttribute("href", "#editModal");
              editModal.className = "edit";
              editModal.setAttribute("data-toggle", "modal");
              footerTD.appendChild(editModal);
              let editModalIcon = document.createElement("i");
              editModalIcon.className = "material-icons";
              editModalIcon.setAttribute("data-toggle", "tooltip");
              editModalIcon.setAttribute("title", "Edit");
              editModalIcon.innerHTML = "&#xE254;";
              editModal.appendChild(editModalIcon);
              let deleteModal = document.createElement("a");
              deleteModal.setAttribute("href", "#deleteModal");
              deleteModal.className = "delete";
              deleteModal.setAttribute("data-toggle", "modal");
              footerTD.appendChild(deleteModal);
              let deleteModalIcon = document.createElement("i");
              deleteModalIcon.className = "material-icons";
              deleteModalIcon.setAttribute("data-toggle", "tooltip");
              deleteModalIcon.setAttribute("title", "Delete");
              deleteModalIcon.innerHTML = "&#xE872;";
              deleteModal.appendChild(deleteModalIcon);
             }

          tableWrapper.appendChild(table);

          require(["https://cdn.datatables.net/1.10.19/js/jquery.dataTables.js"], function () {

              $(document).ready(function () {
              $('#dataTable').DataTable();
              $('.dataTables_length').addClass('bs-select');
              // Activate tooltip
              $('[data-toggle="tooltip"]').tooltip();

              // Select/Deselect checkboxes
              var checkbox = $('table tbody input[type="checkbox"]');
                  $("#selectAll").click(function () {
                      if (this.checked) {
                          checkbox.each(function () {
                              this.checked = true;
                          });
                      } else {
                          checkbox.each(function () {
                              this.checked = false;
                          });
                      }
                  });
                  checkbox.click(function () {
                      if (!this.checked) {
                          $("#selectAll").prop("checked", false);
                      }
                  });

              });

          });

      });
  };


});
