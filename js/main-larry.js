/* main JS file */

// Will be used to the save the loaded JSON data
var allData = [];

// Date parser to convert strings to date objects
var parseDate = d3.timeParse("%Y");

// Set ordinal color scale
var colorScale = d3.scaleOrdinal(d3.schemeCategory20);

// Variables for the visualization instances
var areachart, timeline;

// Load years for selection

var lowerBound = document.getElementById('year-lower')
var upperBound = document.getElementById('year-upper')

for (i=1961;  i<2018;i++) {
	console.log(i)

	var year1 = i
	var year2 = i+1

	var option1 = document.createElement('option')
	var option2 = document.createElement('option')

	option1.text = year1.toString()
	option2.text = year2.toString()

	option1.value = year1
	option2.value = year2

	lowerBound.add(option1)
	upperBound.add(option2)

}
 


// Start application by loading the data
loadData();

function loadData() {
    d3.csv("data/totalBudgetOnly.csv", function(error, budgetData){
        if(!error){
            allData = budgetData;
            

            // Convert Pence Sterling (GBX) to USD and years to date objects
            allData.forEach(function(d){

                for (var column in d) {
                    if (d.hasOwnProperty(column) && column != "Year") {
                        d[column] = +d[column]
                    } else if(d.hasOwnProperty(column) && column == "Year") {
                        d[column] = parseDate(d[column].toString());
                    }
                }
            });

            
            // allData.years.forEach(function(d){
            //     d.Expenditures = parseFloat(d.Expenditures) * 1.481105 / 100;
            //     d.Year = parseDate(d.Year.toString());
            // });

            // Update color scale (all column headers except "Year")
            // We will use the color scale later for the stacked area chart
         
            colorScale.domain(d3.keys(allData[0]).filter(function(d){ return d != "Year"; }))


            createVis();
        }
        else {
        	console.log('error')
        }
    });
}

console.log('hello')

function createVis() {

	// TO-DO: Instantiate visualization objects here
	areachart = new StackedAreaChart('chart-area', allData)
    // timeline = new Timeline('timeline', allData.years)

}