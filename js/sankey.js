var marginSankey = {top: 10, right: 120, bottom: 60, left: 10},
    widthSankey = 350 - marginSankey.left - marginSankey.right,
    heightSankey = 250 - marginSankey.top - marginSankey.bottom;

var formatNumber = d3.format(",.0f"),
    format = function(d) { return formatNumber(d) + " TWh"; };

var sankeyData = {};

loadData();

function loadData() {

    d3.csv("data/sankeyData.csv", function (csv) {

        csv.forEach(function(d) {
            sankeyData[d.State] = {
                "nodes": [
                    {"node": 0, "name": "Households with Children: $" + d.Children},
                    {"node": 1, "name": "Working Households: $" + d.Working},
                    {"node": 2, "name": "Households with Seniors: $" + d.Seniors},
                    {"node": 3, "name": "Households with Non-elderly Disabled Individuals: $" + d.NonElderlyDisabled},
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

        var svgSankey = d3.select("#sankey").append("svg")
            .attr("width", widthSankey + marginSankey.left + marginSankey.right)
            .attr("height", heightSankey + marginSankey.top + marginSankey.bottom)
            .attr("class", "svgSankey")
            .append("g")
            .attr("transform", "translate(" + marginSankey.left + "," + marginSankey.top + ")");

        var sankey = d3.sankey()
            .nodeWidth(15)
            .nodePadding(10)
            .size([widthSankey, heightSankey]);

        var pathSankey = sankey.link();

        sankey
            .nodes(sankeyData["Alabama"].nodes)
            .links(sankeyData["Alabama"].links)
            .layout(32);

        var link = svgSankey.append("g").selectAll(".link")
            .data(sankeyData["Alabama"].links).enter()
            .append("path")
            .attr("class", "link")
            .attr("d", pathSankey)
            .style("stroke-width", function(d) { return Math.max(1, d.dy); })
            .sort(function(a, b) { return b.dy - a.dy; });

        link.append("title")
            .text(function(d) { return d.source.name + " → " + d.target.name + "\n" + format(d.value); });

        var node = svgSankey.append("g").selectAll(".node")
            .data(sankeyData["Alabama"].nodes).enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
            .call(d3.drag()
                .subject(function(d) { return d; })
                .on("start", function() { this.parentNode.appendChild(this); }));

        node.append("rect")
            .attr("height", function(d) { return d.dy; })
            .attr("width", sankey.nodeWidth())
            .style("fill", "#E34A33")
            .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
            .append("title")
            .text(function(d) { return d.name + "\n" + format(d.value); });

        node.append("text")
            .attr("x", -6)
            .attr("y", function(d) { return d.dy / 2; })
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .attr("transform", null)
            .attr('font-size', 12)
            .text(function(d) { return d.name; })
            .filter(function(d) { return d.x < widthSankey / 2; })
            .attr("x", 6 + sankey.nodeWidth())
            .attr("text-anchor", "start");

        document.getElementById("state-name").innerHTML = "Alabama - Average Monthly Benefit";
    });

}

function updateSankey(state, color) {

    d3.select(".svgSankey").remove();

    var svgSankey = d3.select("#sankey").append("svg")
        .attr("width", widthSankey + marginSankey.left + marginSankey.right)
        .attr("height", heightSankey + marginSankey.top + marginSankey.bottom)
        .attr("class", "svgSankey")
        .append("g")
        .attr("transform", "translate(" + marginSankey.left + "," + marginSankey.top + ")");

    var sankey = d3.sankey()
        .nodeWidth(15)
        .nodePadding(10)
        .size([widthSankey, heightSankey]);

    var pathSankey = sankey.link();

    sankey
        .nodes(sankeyData[state].nodes)
        .links(sankeyData[state].links)
        .layout(32);

    var link = svgSankey.append("g").selectAll(".link")
        .data(sankeyData[state].links).enter()
        .append("path")
        .attr("class", "link")
        .attr("d", pathSankey)
        .style("stroke-width", function(d) { return Math.max(1, d.dy); })
        .sort(function(a, b) { return b.dy - a.dy; });

    link.append("title")
        .text(function(d) { return d.source.name + " → " + d.target.name + "\n" + format(d.value); });

    var node = svgSankey.append("g").selectAll(".node")
        .data(sankeyData[state].nodes).enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .call(d3.drag()
            .subject(function(d) { return d; })
            .on("start", function() { this.parentNode.appendChild(this); })
            .on("drag", dragmove));

    node.append("rect")
        .attr("height", function(d) { return d.dy; })
        .attr("width", sankey.nodeWidth())
        .style("fill", color)
        .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
        .append("title")
        .text(function(d) { return d.name + "\n" + format(d.value); });

    node.append("text")
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .attr('font-size', 12)
        .text(function(d) { return d.name; })
        .filter(function(d) { return d.x < widthSankey / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");

    function dragmove(d) {
        d3.select(this).attr("transform", "translate(" + d.x + "," +
            (d.y = Math.max(0, Math.min(heightSankey - d.dy, d3.event.y))) + ")");
        sankey.relayout();
        link.attr("d", pathSankey);
    }
}