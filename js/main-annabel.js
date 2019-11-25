var formatTime = d3.timeFormat("%Y");
var parseTime = d3.timeParse("%Y");
var colorScale = d3.scaleOrdinal(d3.schemeCategory20);

var grapharea, timeline, areachart;
var data_area = [],
    allData = [];

// loadData();

queue()
    .defer(d3.csv,"data/SNAPsummary.csv")
    .defer(d3.csv,"data/totalBudgetOnly.csv")
    .await(createVisualization);

// function loadData() {
//
//     d3.csv("data/SNAPsummary.csv", function (csv) {
//
//         csv.map(function (d) {
//             d.Year = parseTime(d.Year);
//             d.average_participation = +d.average_participation;
//             d.average_benefit = +d.average_benefit;
//             d.total_benefit = +d.total_benefit;
//             d.other_costs = +d.other_costs;
//             d.total_costs = +d.total_costs;
//         });
//
//         data_area = csv;
//
//         console.log(data_area);
//
//         createVisualization();
//
//     });
//
// }

function createVisualization(error, summaryData, budgetData) {

    if (error) { console.log(error); }

    data_area = summaryData;

    data_area.map(function(d) {
        d.Year = parseTime(d.Year);
        d.average_participation = +d.average_participation;
        d.average_benefit = +d.average_benefit;
        d.total_benefit = +d.total_benefit;
        d.other_costs = +d.other_costs;
        d.total_costs = +d.total_costs;
    });

    allData = budgetData;

    // Years to date objects
    allData.forEach(function(d){

        for (var column in d) {
            if (d.hasOwnProperty(column) && column != "Year") {
                d[column] = +d[column]
            } else if(d.hasOwnProperty(column) && column == "Year") {
                d[column] = parseTime(d[column].toString());
            }
        }
    });
    // Color scale for the stacked area chart
    colorScale.domain(d3.keys(allData[0]).filter(function(d){ return d != "Year"; }));

    console.log(data_area);

    grapharea = new AreaChart('graph-area', data_area);
    areachart = new StackedAreaChart('chart-area', allData);
    timeline = new Timeline('timeline-area', data_area);

}

function updateVisualization() {

    grapharea.updateVis();

}

function brushed() {

    var SelectionRange = [0,0];

    selectionRange = d3.brushSelection(d3.select('.brush').node());
    console.log(selectionRange);

    var selectionDomain = selectionRange.map(timeline.x.invert);
    console.log(selectionDomain);

    grapharea.timeScale.domain(selectionDomain);
    areachart.x.domain(selectionDomain);

    grapharea.wrangleData();
    areachart.wrangleData();

}