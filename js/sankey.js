var marginSankey = {top: 1, right: 1, bottom: 6, left: 1},
    widthSankey = 500 - marginSankey.left - marginSankey.right,
    heightSankey = 500 - marginSankey.top - marginSankey.bottom;

var formatNumber = d3.format(",.0f"),
    format = function(d) { return formatNumber(d) + " TWh"; },
    color = d3.scaleOrdinal(d3.schemeCategory20);

var svgSankey = d3.select("#sankey").append("svg")
    .attr("width", widthSankey + marginSankey.left + marginSankey.right)
    .attr("height", heightSankey + marginSankey.top + marginSankey.bottom)
    .append("g")
    .attr("transform", "translate(" + marginSankey.left + "," + marginSankey.top + ")");

var sankey = d3.sankey()
    .nodeWidth(15)
    .nodePadding(10)
    .size([widthSankey, heightSankey]);

var pathSankey = sankey.link();

var sankeyData = {};

loadData();

function loadData() {

    d3.csv("data/sankeyData.csv", function (csv) {

        csv.forEach(function(d) {
            sankeyData[d.State] = {
                "nodes": [
                    {"node": 0, "name": "Households with Children"},
                    {"node": 1, "name": "Working Households"},
                    {"node": 2, "name": "Households with Seniors"},
                    {"node": 3, "name": "Households with Non-elderly Disabled Individuals"},
                    {"node": 4, "name": "All Households"}
                ],
                "links": [
                    {"source": 0, "target": 4, "value": d.Children},
                    {"source": 1, "target": 4, "value": d.Working},
                    {"source": 2, "target": 4, "value": d.Seniors},
                    {"source": 3, "target": 4, "value": d.NonElderlyDisabled}
                ],
            }
        });

        console.log(sankeyData);
    });

    updateSankey("Maine");

}

function updateSankey(state) {

    // var state = document.getElementById("sankey-selection").value;
    console.log(state);

    sankey
        .nodes(sankeyData[state].nodes)
        .links(sankeyData[state].links)
        .layout(32);

    // var link = svgSankey.append("g").selectAll(".link")
    //     .data(sankeyData[state].links);

    var link = svgSankey.append("g").selectAll(".link")
        .data(sankeyData[state].links).enter()
        .append("path")
        .attr("class", "link")
        // .merge(link)
        // .transition()
        .attr("d", pathSankey)
        .style("stroke-width", function(d) { return Math.max(1, d.dy); })
        .sort(function(a, b) { return b.dy - a.dy; });

    link.append("title")
        .text(function(d) { return d.source.name + " → " + d.target.name + "\n" + format(d.value); });

    // var node = svgSankey.append("g").selectAll(".node")
    //     .data(sankeyData[state].nodes);

    var node = svgSankey.append("g").selectAll(".node")
        .data(sankeyData[state].nodes).enter()
        .append("g")
        .attr("class", "node")
        // .merge(node)
        // .transition()
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .call(d3.drag()
            .subject(function(d) { return d; })
            .on("start", function() { this.parentNode.appendChild(this); })
            .on("drag", dragmove));

    node.append("rect")
        .attr("height", function(d) { return d.dy; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
        .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
        .append("title")
        .text(function(d) { return d.name + "\n" + format(d.value); });

    node.append("text")
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { return d.name; })
        .filter(function(d) { return d.x < widthSankey / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");

    // link.exit().remove();
    // node.exit().remove();

    function dragmove(d) {
        d3.select(this).attr("transform", "translate(" + d.x + "," +
            (d.y = Math.max(0, Math.min(heightSankey - d.dy, d3.event.y))) + ")");
        sankey.relayout();
        link.attr("d", pathSankey);
    }
}