var formatTime = d3.timeFormat("%Y");
var parseTime = d3.timeParse("%Y");
var bisectDate = d3.bisector(function (d){ return d.fiscal_year }).left;

var margin = {top: 30, right: 50, bottom: 50, left: 50};

var width = 700 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var timeScale = d3.scaleTime()
    .domain(d3.extent(function(d) { return d.fiscal_year; }))
    .range([0, width]);

var yScale = d3.scaleLinear()
    .domain(d3.extent(function(d) { return d.average_participation; }))
    .range([height, 0]);

var xAxis = d3.axisBottom()
    .scale(timeScale)
    .tickFormat(d3.timeFormat("%Y"));

var yAxis = d3.axisLeft()
    .scale(yScale);

svg.append("g")
    .attr("class", "axis x-axis")
    .attr("transform", "translate(0, " + height + ")")
    .call(xAxis);

svg.append("g")
    .attr("class", "axis y-axis")
    .call(yAxis);

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

        data = csv;

        console.log(data);

        updateVisualization();

    });

}

function updateVisualization() {

    var filter = d3.select("#filter").property("value");
    var filter_name = d3.select("#filter option:checked").text();
    var first_year = document.getElementById("first-year").value;
    var last_year = document.getElementById("last-year").value;

    if (first_year != "" && last_year != "") {
        filtered_data = data.filter(function(d){
            return (formatTime(d.fiscal_year) >= first_year && formatTime(d.fiscal_year) <= last_year);
        })
    } else {
        filtered_data = data;
    }

    console.log(filtered_data);

    timeScale.domain(d3.extent(filtered_data, function(d) { return d.fiscal_year; }));
    yScale.domain(d3.extent(filtered_data, function(d) { return d[filter]; }));

    var area = d3.area()
        .x(function(d) { return timeScale(d.fiscal_year); })
        .y0(height)
        .y1(function(d) { return yScale(d[filter]); });

    var path = svg.selectAll(".area")
        .data(filtered_data);

    // var path = svg.append("path")
    //     .datum(filtered_data)
    //     .attr("class", "area")
    //     .transition()
    //     .duration(300)
    //     .attr("d", area);

    path.enter()
        .append("path")
        .attr("class", "area")
        .merge(path)
        .transition()
        .delay(200)
        .attr("d", area(filtered_data));

    svg.selectAll(".x-axis")
        .transition()
        .duration(200)
        .attr("transform", "translate(0, " + height + ")")
        .call(xAxis);

    svg.selectAll(".y-axis")
        .transition()
        .duration(200)
        .call(yAxis);

    var text = svg.selectAll(".text")
        .data(filtered_data);

    text.enter()
        .append("text")
        .attr("class","axis-label")
        .merge(text)
        .transition()
        .duration(200)
        .attr("x", -40)
        .attr("y", -20)
        .attr("dy", "1em")
        .text("Thousands");
    // .text(function(d) {
    //     if (filter == "average_participation") {
    //         return "Thousands";
    //     } else if (filter == "average_benefit") {
    //         return "Dollars";
    //     } else {
    //         return "Millions of Dollars";
    //     }
    // });

    svg.append("text")
        .attr("transform", "translate(" + (width + 10) + "," + height + ")")
        .attr("class", "axis-label")
        .text("Date");

    svg.append("rect")
        .attr("class", "mask")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", function(){ focus.style("display", null) })
        .on("mouseout", function(){ focus.style("display", "none") })
        .on("mousemove", mousemove);

    var focus = svg.append("g")
        .style("display", "none")
        .attr("class", "focus");

    focus.append("line")
        .attr("class", "x")
        .style("stroke-width", 2)
        .style("stroke", "gray");

    focus.append("text")
        .attr("class", "y-data")
        .data(data)
        .attr("font-size", 16)
        .attr("x", 9)
        .attr("y", -15);

    focus.append("text")
        .attr("class", "fiscal_year")
        .data(data)
        .attr("x", 9)
        .attr("y", 0)
        .attr("font-size", 12);

    function mousemove() {
        var x0 = timeScale.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;

        focus.select("line.x")
            .attr("y1", 0)
            .attr("y2", height - yScale(d[filter]))
            .attr("transform", "translate(" + timeScale(d.fiscal_year) +
                "," + yScale(d[filter]) + ")");

        focus.select("text.y-data")
            .text(d[filter].toLocaleString())
            .attr("transform", "translate(" + timeScale(d.fiscal_year) +
                "," + yScale(d[filter]) + ")");

        focus.select("text.fiscal_year")
            .text(formatTime(d.fiscal_year))
            .attr("transform", "translate(" + timeScale(d.fiscal_year) +
                "," + yScale(d[filter]) + ")");
    }

    svg.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", yScale(100000))
        .attr("y2", yScale(100000))
        .style("stroke-width", 1.5)
        .style("stroke-dasharray", ("8, 5"))
        .style("stroke", "red");

    d3.selectAll(".area").exit().remove();
    // d3.selectAll(".axis-label").exit().remove();

}