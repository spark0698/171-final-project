/*
 * LineChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the area chart
 * @param _data						-- the dataset 'household characteristics'
 */

LineChart = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.filtered_data = [];

    this.initVis();
}

LineChart.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 20, right: 120, bottom: 60, left: 50};
    vis.width = 550 - vis.margin.left - vis.margin.right;
    vis.height = 300 - vis.margin.top - vis.margin.bottom;
    vis.bisectDate = d3.bisector(function (d){ return d.Year }).left;
    vis.formatTime = d3.timeFormat("%Y");

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
        .attr("transform", "translate(" + (vis.width - 35) + "," + (vis.height + 35) + ")")
        .attr("class", "axis-label")
        .text("Date");

    vis.svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height);

    vis.svg.append('text')
        .attr("id", "tooltip-line1")
        .attr('x', 30)
        .attr('y', 30);

    vis.svg.append('text')
        .attr("id", "tooltip-line2")
        .attr('x', 30)
        .attr('y', 45);

    vis.wrangleData();

}

LineChart.prototype.wrangleData = function(){
    var vis = this;

    vis.filtered_data = vis.data;

    vis.updateVis();

}

LineChart.prototype.updateVis = function(){
    var vis = this;

    vis.filter = d3.select("#filter").property("value");
    vis.filter_name = d3.select("#filter option:checked").text();

    // vis.timeScale.domain(d3.extent(vis.filtered_data, function(d) { return d.Year; }));
    vis.yScale.domain(d3.extent(vis.filtered_data, function(d) { return d[vis.filter]; }));

    vis.line = d3.line()
        .x(function(d) { return vis.timeScale(d.Year); })
        .y(function(d) { return vis.yScale(d[vis.filter]); })
        .curve(d3.curveLinear);

    vis.path = vis.svg.selectAll(".line")
        .data(vis.filtered_data);

    vis.path.enter()
        .append("path")
        .attr("class", "line")
        .merge(vis.path)
        .transition()
        .attr("d", vis.line(vis.filtered_data))
        .attr("stroke", function(d) {
            if (vis.filter == "average_participation") {
                return "rgba(141, 177, 203, 0.56)";
            } else if (vis.filter == "average_benefit" || vis.filter == "total_benefit") {
                return "rgba(72,203,137,0.56)";
            } else {
                return "rgba(237,129,156,0.56)";
            }
        });

    if (vis.filter_name == "Cost vs Benefit") {
        vis.line2 = d3.line()
            .x(function(d) { return vis.timeScale(d.Year); })
            .y(function(d) { return vis.yScale(d["total_benefit"]); })
            .curve(d3.curveLinear);

        vis.svg.append("path")
            .attr("class", "line")
            .attr("d", vis.line2(vis.filtered_data))
            .attr("stroke", "rgba(72,203,137,0.56)");

        vis.svg.append("circle")
            .attr("class", "circle")
            .data(vis.filtered_data)
            .on('mouseover', function(d) {
                d3.select("#tooltip-line1")
                    .text("Year: " + vis.formatTime(d.Year));
                d3.select("#tooltip-line2")
                    .text("Total Costs: " + d[vis.filter].toFixed());
            })
            .on('mouseout', function(d){
                d3.select('#tooltip-line1').text('');
                d3.select('#tooltip-line2').text('')
            })
            .attr("r", 3)
            .attr("fill", "rgba(68,165,103,0.71)")
            .attr("cx", function(d) { return vis.timeScale(d.Year); })
            .attr("cy", function(d) { return vis.yScale(d["total_benefit"]); });
    }

    vis.circles = vis.svg.selectAll(".circle")
        .data(vis.filtered_data);

    vis.circles.enter()
        .append("circle")
        .attr("class", "circle")
        .on('mouseover', function(d) {
            d3.select("#tooltip-line1")
                .text("Year: " + vis.formatTime(d.Year));
            d3.select("#tooltip-line2")
                .text(function(i) {if (vis.filter_name == "Cost vs Benefit") {
                    return "Total Benefit: " + d[vis.filter].toFixed();
                } else {
                    return vis.filter_name + ": " + d[vis.filter].toFixed();
                }
            })
        })
        .on('mouseout', function(d){
            d3.select('#tooltip-line1').text('');
            d3.select('#tooltip-line2').text('')
        })
        .merge(vis.circles)
        .transition()
        .attr("r", 3)
        .attr("fill", function(d) {
            if (vis.filter == "average_participation") {
                return "rgba(104,139,165,0.7)";
            } else if (vis.filter == "average_benefit" || vis.filter == "total_benefit") {
                return "rgba(68,165,103,0.71)";
            } else {
                return "rgba(196,104,124,0.7)";
            }})
        .attr("cx", function(d) { return vis.timeScale(d.Year); })
        .attr("cy", function(d) { return vis.yScale(d[vis.filter]); });

    // if (vis.filter_name == "Cost vs Benefit") {
    //     vis.line2 = d3.line()
    //         .x(function(d) { return vis.timeScale(d.Year); })
    //         .y(function(d) { return vis.yScale(d.total_costs); })
    //         .curve(d3.curveLinear);
    //
    //     vis.path2 = vis.svg.selectAll(".line")
    //         .data(vis.filtered_data);
    //
    //     vis.path2.enter()
    //         .append("path")
    //         .attr("class", "line")
    //         .merge(vis.path2)
    //         .transition()
    //         .attr("d", vis.line2(vis.filtered_data))
    //         .attr("stroke", "rgba(237,129,156,0.56)");
    // }

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

    vis.path.exit().remove();
    vis.circles.exit().remove();

    d3.select('#chart-line-explanation')
        .html(chooseExplanation(vis.filter))

}