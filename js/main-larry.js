// /* main JS file */
//
// // Will be used to the save the loaded JSON data
// var allData = [];
//
// // Date parser to convert strings to date objects
// var parseDate = d3.timeParse("%Y");
//
// // Set ordinal color scale
// var colorScale = d3.scaleOrdinal(d3.schemeCategory20);
//
// // Variables for the visualization instances
// var areachart, timeline;
//
// // Start application by loading the data
// loadData();
//
// function loadData() {
//     d3.csv("data/totalBudgetOnly.csv", function(error, budgetData){
//         if(!error){
//             allData = budgetData;
//
//
//             // Years to date objects
//             allData.forEach(function(d){
//
//                 for (var column in d) {
//                     if (d.hasOwnProperty(column) && column != "Year") {
//                         d[column] = +d[column]
//                     } else if(d.hasOwnProperty(column) && column == "Year") {
//                         d[column] = parseDate(d[column].toString());
//                     }
//                 }
//             });
//             // Color scale for the stacked area chart
//             colorScale.domain(d3.keys(allData[0]).filter(function(d){ return d != "Year"; }))
//
//
//             createVis();
//         }
//         else {
//         	console.log('error')
//         }
//     });
// }
//
//
// function createVis() {
//
// 	// TO-DO: Instantiate visualization objects here
// 	areachart = new StackedAreaChart('chart-area', allData)
//     // timeline = new Timeline('timeline-area', allData)
//
// }
//
//
// // function brushed() {
// //
// //     var SelectionRange = [0,0]
// //
// //     selectionRange = d3.brushSelection(d3.select('.brush').node())
// //     console.log(selectionRange)
// //
// //     var selectionDomain = selectionRange.map(timeline.x.invert)
// //     areachart.x.domain(selectionDomain)
// //
// //     areachart.wrangleData()
// //
// // }
