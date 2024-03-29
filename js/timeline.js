
/*
 * Timeline - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the  
 */

Timeline = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;

    // No data wrangling, no update sequence
    this.displayData = this.data;

    this.initVis();
}

console.log('hello');

/*
 * Initialize area chart with brushing component
 */

Timeline.prototype.initVis = function(){
	var vis = this; // read about the this

	vis.margin = {top: 0, right: 0, bottom: 30, left: 30};

	vis.width = 550 - vis.margin.left - vis.margin.right,
    vis.height = 40 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
	vis.svg = d3.select("#" + vis.parentElement).append("svg")
	    .attr("width", vis.width + vis.margin.left + vis.margin.right)
	    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


	// Scales and axes
    console.log(d3.extent(vis.displayData, function(d) { return d.Year; }));
    vis.x = d3.scaleTime()
        .range([0, vis.width])
        .domain(d3.extent(vis.displayData, function(d) { return d.Year; }));

    // vis.y = d3.scaleLinear()
    //     .range([vis.height, 0])
    //     .domain([0, d3.max(vis.displayData, function(d) { return d.Expenditures; })]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    // Draw area by using the path generator
    vis.svg.append("rect")
        .attr("fill", "#ccc")
        .attr("height", 10)
        .attr('width', vis.width);



  // TO-DO: Initialize brush component
  var brush = d3.brushX()
    .extent([[0,0], [vis.width, vis.height]])
    .on('brush', brushed)

  // TO-DO: Append brush component here

  vis.svg.append("g")
      .attr("class", "x brush")
      .call(brush)
    .selectAll("rect")
      .attr("y", -6)
      .attr("height", vis.height + 7)
    



  vis.svg.append("g")
      .attr("class", "x-axis axis")
      .attr("transform", "translate(0," + vis.height + ")")
      .call(vis.xAxis);
}

