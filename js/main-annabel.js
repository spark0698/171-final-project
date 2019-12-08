var formatTime = d3.timeFormat("%Y");
var parseTime = d3.timeParse("%Y");
var colorScale = d3.scaleOrdinal(d3.schemeCategory20);

var linechart, timeline, areachart;
var lineData = [],
    allData = [],
    percentData;

// loadData();

queue()
    .defer(d3.csv,"data/SNAPsummary.csv")
    .defer(d3.csv,"data/totalBudgetOnly.csv")
    .defer(d3.csv, "data/statesPercentages.csv")
    .await(createVisualization);

function createVisualization(error, summaryData, budgetData, statesPercentageData) {

    if (error) { console.log(error); }

    lineData = summaryData;

    lineData.map(function(d) {
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

    percentData = statesPercentageData;

    percentData.forEach(function(d){

    for (var column in d) {
            if (d.hasOwnProperty(column) && column != "State") {
                d[column] = +d[column]
            }
        }
    });


    // Color scale for the stacked area chart
    colorScale.domain(d3.keys(allData[0]).filter(function(d){ return d != "Year"; }));

    // console.log(lineData);

    linechart = new LineChart('chart-line', lineData);
    areachart = new StackedAreaChart('stacked', allData);
    timeline = new Timeline('timeline-area', lineData);

    createPlot(percentData)

}

function updateVisualization() {

    linechart.updateVis();

}

function brushed() {

    var SelectionRange = [0,0];

    selectionRange = d3.brushSelection(d3.select('.brush').node());
    // console.log(selectionRange);

    var selectionDomain = selectionRange.map(timeline.x.invert);
    // console.log(selectionDomain);

    linechart.timeScale.domain(selectionDomain);
    areachart.x.domain(selectionDomain);

    linechart.wrangleData();
    areachart.wrangleData();

}