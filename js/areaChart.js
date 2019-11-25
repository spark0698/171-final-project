/*
 * AreaChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the area chart
 * @param _data						-- the dataset 'household characteristics'
 */

AreaChart = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.filtered_data = [];

    this.initVis();
}

AreaChart.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 30, right: 100, bottom: 50, left: 50};
    vis.width = 650 - vis.margin.left - vis.margin.right;
    vis.height = 550 - vis.margin.top - vis.margin.bottom;
    vis.bisectDate = d3.bisector(function (d){ return d.Year }).left;

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.timeScale = d3.scaleTime()
        .domain(d3.extent(vis.data, function(d) { return d.Year; }))
        .range([0, vis.width-20]);

    vis.yScale = d3.scaleLinear()
        // .domain(d3.extent(function(d) { return d.average_participation; }))
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.timeScale)
        .tickFormat(d3.timeFormat("%Y"));

    vis.yAxis = d3.axisLeft()
        .scale(vis.yScale);

    vis.svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", "translate(0, " + vis.height + ")")
        .call(vis.xAxis);

    vis.svg.append("g")
        .attr("class", "axis y-axis")
        .call(vis.yAxis);

    vis.svg.append("text")
        .attr("transform", "translate(-45, -10)")
        .attr("class", "axis-label y-label")
        .text("Thousands");

    vis.svg.append("text")
        .attr("transform", "translate(" + (vis.width + 10) + "," + vis.height + ")")
        .attr("class", "axis-label")
        .text("Date");

    vis.svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height);

    vis.svg.append('text').attr('fill', 'black')
        .attr('id', 'tooltip-graph')
        .attr('x', 50)
        .attr('y', 30);

    vis.wrangleData();

}

AreaChart.prototype.wrangleData = function(){
    var vis = this;

    vis.filtered_data = vis.data;

    console.log(vis.filtered_data);

    vis.updateVis();

    console.log("test");

}

AreaChart.prototype.updateVis = function(){
    var vis = this;

    vis.filter = d3.select("#filter").property("value");
    vis.filter_name = d3.select("#filter option:checked").text();

    // vis.timeScale.domain(d3.extent(vis.filtered_data, function(d) { return d.Year; }));
    vis.yScale.domain(d3.extent(vis.filtered_data, function(d) { return d[vis.filter]; }));

    vis.area = d3.area()
        .x(function(d) { return vis.timeScale(d.Year); })
        .y0(vis.height)
        .y1(function(d) { return vis.yScale(d[vis.filter]); });

    vis.path = vis.svg.selectAll(".area")
        .data(vis.filtered_data);

    vis.path.enter()
        .append("path")
        .attr("class", "area")
        .merge(vis.path)
        .transition()
        .attr("d", vis.area(vis.filtered_data));

    vis.svg.selectAll(".x-axis")
        .transition()
        .duration(100)
        .attr("transform", "translate(0, " + vis.height + ")")
        .call(vis.xAxis);

    vis.svg.selectAll(".y-axis")
        .transition()
        .duration(100)
        .call(vis.yAxis);

    d3.selectAll(".y-label")
        .text(function(d) {
            if (vis.filter == "average_benefit") {
                return "Dollars";
            } else if (vis.filter == "average_participation") {
                return "Thousands";
            } else {
                return "Millions of Dollars";
            }
        });

    vis.svg.append("rect")
        .attr("class", "mask")
        .attr("width", vis.width)
        .attr("height", vis.height)
        .style("fill", "none")
        .style("pointer-events", "all");
        // .on('mouseover', function(d){
        //     d3.select('#tooltip-graph').text(vis.filter_name + ": " + d[vis.filter])
        // })
        // .on('mouseout', function(d){
        //     d3.select('#tooltip-graph').text('')
        // });

    vis.focus = vis.svg.append("g")
        .style("display", "none")
        .attr("class", "focus");

    vis.focus.append("line")
        .attr("class", "x")
        .style("stroke-width", 2)
        .style("stroke", "gray");

    vis.focus.append("text")
        .attr("class", "y-data")
        .data(data_area)
        .attr("font-size", 16)
        .attr("x", 9)
        .attr("y", -15);

    vis.focus.append("text")
        .attr("class", "Year")
        .data(data_area)
        .attr("x", 9)
        .attr("y", 0)
        .attr("font-size", 12);

    vis.svg.append("line")
        .attr("x1", 0)
        .attr("x2", vis.width)
        .attr("y1", vis.yScale(100000))
        .attr("y2", vis.yScale(100000))
        .style("stroke-width", 1.5)
        .style("stroke-dasharray", ("8, 5"))
        .style("stroke", "red");

    // vis.svg.append("rect")
    //     .attr("class", "mask")
    //     .attr("width", vis.width)
    //     .attr("height", vis.height)
    //     .style("fill", "none")
    //     .style("pointer-events", "all")
    //     .on("mouseover", function(){ vis.focus.style("display", null) })
    //     .on("mouseout", function(){ vis.focus.style("display", "none") })
    //     .on("mousemove", vis.mouseMove());


        // .on("mouseover", function(){ vis.focus.style("display", null) })
        // .on("mouseout", function(){ vis.focus.style("display", "none") })
        // .on("mousemove", vis.mouseMove());

    vis.path.exit().remove();

}

// AreaChart.prototype.mouseMove = function(){
//     var vis = this;
//
//     var x0 = vis.timeScale.invert(d3.mouse(this)[0]),
//         i = vis.bisectDate(vis.filtered_data, x0, 1),
//         d0 = vis.filtered_data[i - 1],
//         d1 = vis.filtered_data[i],
//         d = x0 - d0.date > d1.date - x0 ? d1 : d0;
//
//     focus.select("line.x")
//         .attr("y1", 0)
//         .attr("y2", vis.height - vis.yScale(d[vis.filter]))
//         .attr("transform", "translate(" + vis.timeScale(d.Year) +
//             "," + vis.yScale(d[vis.filter]) + ")");
//
//     focus.select("text.y-data")
//         .text(d[vis.filter].toLocaleString())
//         .attr("transform", "translate(" + vis.timeScale(d.Year) +
//             "," + vis.yScale(d[vis.filter]) + ")")
//         .attr("fill", "black");
//
//     focus.select("text.Year")
//         .text(formatTime(d.Year))
//         .attr("transform", "translate(" + vis.timeScale(d.Year) +
//             "," + vis.yScale(d[vis.filter]) + ")")
//         .attr("fill", "black");
// }