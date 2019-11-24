var formatTime = d3.timeFormat("%Y");
var parseTime = d3.timeParse("%Y");
var bisectDate = d3.bisector(function (d){ return d.fiscal_year }).left;

var margin_area = {top: 30, right: 100, bottom: 50, left: 50};

var width_area = 700 - margin_area.left - margin_area.right,
    height_area = 700 - margin_area.top - margin_area.bottom;

var svg_area = d3.select("#graph-area").append("svg")
    .attr("width", width_area + margin_area.left + margin_area.right)
    .attr("height", height_area + margin_area.top + margin_area.bottom)
    .append("g")
    .attr("transform", "translate(" + margin_area.left + "," + margin_area.top + ")");

var timeScale_area = d3.scaleTime()
    .domain(d3.extent(function(d) { return d.fiscal_year; }))
    .range([0, width_area]);

var yScale_area = d3.scaleLinear()
    .domain(d3.extent(function(d) { return d.average_participation; }))
    .range([height_area, 0]);

var xAxis_area = d3.axisBottom()
    .scale(timeScale_area)
    .tickFormat(d3.timeFormat("%Y"));

var yAxis_area = d3.axisLeft()
    .scale(yScale_area);

svg_area.append("g")
    .attr("class", "axis x-axis")
    .attr("transform", "translate(0, " + height_area + ")")
    .call(xAxis_area);

svg_area.append("g")
    .attr("class", "axis y-axis")
    .call(yAxis_area);

svg_area.append("text")
    .attr("transform", "translate(-45, -10)")
    .attr("class", "axis-label y-label")
    .text("Thousands");

svg_area.append("text")
    .attr("transform", "translate(" + (width_area + 10) + "," + height_area + ")")
    .attr("class", "axis-label")
    .text("Date");

loadData();

function loadData() {

    d3.csv("data/SNAPsummary.csv", function (csv) {

        csv.map(function (d) {
            d.fiscal_year = parseTime(d.fiscal_year);
            d.average_participation = +d.average_participation;
            d.average_benefit = +d.average_benefit;
            d.total_benefit = +d.total_benefit;
            d.other_costs = +d.other_costs;
            d.total_costs = +d.total_costs;
        });

        data_area = csv;

        console.log(data_area);

        updateVisualization();

    });

}

function updateVisualization() {

    var filter = d3.select("#filter").property("value");
    var filter_name = d3.select("#filter option:checked").text();
    var first_year = document.getElementById("first-year").value;
    var last_year = document.getElementById("last-year").value;

    if (first_year != "" && last_year != "") {
        filtered_data = data_area.filter(function(d){
            return (formatTime(d.fiscal_year) >= first_year && formatTime(d.fiscal_year) <= last_year);
        })
    } else {
        filtered_data = data_area;
    }

    console.log(filtered_data);

    timeScale_area.domain(d3.extent(filtered_data, function(d) { return d.fiscal_year; }));
    yScale_area.domain(d3.extent(filtered_data, function(d) { return d[filter]; }));

    var area = d3.area()
        .x(function(d) { return timeScale_area(d.fiscal_year); })
        .y0(height_area)
        .y1(function(d) { return yScale_area(d[filter]); });

    var path = svg_area.selectAll(".area")
        .data(filtered_data);

    path.enter()
        .append("path")
        .attr("class", "area")
        .merge(path)
        .transition()
        .delay(200)
        .attr("d", area(filtered_data));

    svg_area.selectAll(".x-axis")
        .transition()
        .duration(100)
        .attr("transform", "translate(0, " + height_area + ")")
        .call(xAxis_area);

    svg_area.selectAll(".y-axis")
        .transition()
        .duration(100)
        .call(yAxis_area);

    d3.selectAll(".y-label")
        .text(function(d) {
            if (filter == "average_benefit") {
                return "Dollars";
            } else if (filter == "average_participation") {
                return "Thousands";
            } else {
                return "Millions of Dollars";
            }
        });

    // text.enter()
    //     .append("text")
    //     .attr("class","axis-label")
    //     .merge(text)
    //     .transition()
    //     .duration(200)
    //     .attr("x", -40)
    //     .attr("y", -20)
    //     .attr("dy", "1em")
    //     .text("Thousands");

    svg_area.append("rect")
        .attr("class", "mask")
        .attr("width", width_area)
        .attr("height", height_area)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", function(){ focus.style("display", null) })
        .on("mouseout", function(){ focus.style("display", "none") })
        .on("mousemove", mousemove);

    var focus = svg_area.append("g")
        .style("display", "none")
        .attr("class", "focus");

    focus.append("line")
        .attr("class", "x")
        .style("stroke-width", 2)
        .style("stroke", "gray");

    focus.append("text")
        .attr("class", "y-data")
        .data(data_area)
        .attr("font-size", 16)
        .attr("x", 9)
        .attr("y", -15);

    focus.append("text")
        .attr("class", "fiscal_year")
        .data(data_area)
        .attr("x", 9)
        .attr("y", 0)
        .attr("font-size", 12);

    function mousemove() {
        var x0 = timeScale_area.invert(d3.mouse(this)[0]),
            i = bisectDate(filtered_data, x0, 1),
            d0 = filtered_data[i - 1],
            d1 = filtered_data[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;

        focus.select("line.x")
            .attr("y1", 0)
            .attr("y2", height_area - yScale_area(d[filter]))
            .attr("transform", "translate(" + timeScale_area(d.fiscal_year) +
                "," + yScale_area(d[filter]) + ")");

        focus.select("text.y-data")
            .text(d[filter].toLocaleString())
            .attr("transform", "translate(" + timeScale_area(d.fiscal_year) +
                "," + yScale_area(d[filter]) + ")")
            .attr("fill", "black");

        focus.select("text.fiscal_year")
            .text(formatTime(d.fiscal_year))
            .attr("transform", "translate(" + timeScale_area(d.fiscal_year) +
                "," + yScale_area(d[filter]) + ")")
            .attr("fill", "black");
    }

    svg_area.append("line")
        .attr("x1", 0)
        .attr("x2", width_area)
        .attr("y1", yScale_area(100000))
        .attr("y2", yScale_area(100000))
        .style("stroke-width", 1.5)
        .style("stroke-dasharray", ("8, 5"))
        .style("stroke", "red");

    path.exit().remove();
    // d3.selectAll(".axis-label").exit().remove();

}