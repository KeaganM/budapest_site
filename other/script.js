var myData = null

d3.csv("data.csv").then(function(data){
  myData=data
  myDataIsReady()
});

// function myDataIsReady() {
//   var perrow = 3
//   html = "<table><tr>";
//
//   for (var i=0; i<myData.length;i++) {
//     html += "<td>" + data[i] + "</td>";
//
//     var next = i+1
//     if (next%perrow ==0 && next!=data.length) {
//       html +="</tr><tr>";
//     }
//   }
//   html +="</tr></table>";
//
//   document.getElementById("container").innerHTML = html;
// });

function myDataIsReady() {
  for (var i=0;i<myData.length;i++){
    console.log(myData[i]["Name"])
  }
};
