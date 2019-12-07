

// --> CREATE SVG DRAWING AREA

var width = 1000,
    height = 450;

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var lowColor = '#f9f9f9';
var highColor = '#bc2a66';

var projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2])
    .scale([1000]);

var path = d3.geoPath(projection);

var svg_map = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

var dataSet;

loadMap();

function loadMap() {

    d3.csv("data/households-participation-benefits.csv", function (data) {
        data.forEach(function (d) {
            d.households = d.households.replace(/\,/g, '');
            d.households = +d.households;
            d.participate = d.participate.replace(/\,/g, '');
            d.participate = +d.participate;
            d.benefit = d.benefit.replace(/\,/g, '');
            d.benefit = +d.benefit;
        });

        dataSet = data;

        updateViz();

    });
}

function updateViz(data) {
    var rank = d3.select("#rank").property("value");

    var dataArray = [];

    for (var d = 0; d < dataSet.length; d++) {
        dataArray.push(dataSet[d][rank]);
    }

    var colorScale = d3.scaleQuantile()
        .range(["#fef0d9", "#fdcc8a", "#fc8d59", "#e34a33", "#b30000"])
        .domain(dataArray);

    d3.json("data/states.json", function (json) {
        for (var i = 0; i < dataSet.length; i++) {
            for (var j = 0; j < json.features.length; j++) {
                if (dataSet[i].state === json.features[j].properties.NAME) {
                    json.features[j].properties.value = dataSet[i][rank];
                    break;
                }
            }
        }

        var selection = svg_map.selectAll("path")
            .data(json.features);

        // tooltip
        var tool_tip = d3.tip()
            .attr("class", "d3-tip")
            .offset([-8, 0])
            .html(function(d) {
                var total = d.properties.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                if (d.properties.NAME === "North Carolina") {
                    return "North Carolina Data Unavailable"
                }
                if (rank === "participate") {
                    return d.properties.NAME +
                        "<br>" + total + " people"
                } else if (rank === "households") {
                    return d.properties.NAME +
                        "<br>" + total + " households"
                } else {
                    return d.properties.NAME +
                        "<br>$" + total
                }
            });

        svg_map.call(tool_tip);

        // draw map
        selection.enter()
            .append("path")
            .merge(selection)
            .on("mouseover", tool_tip.show)
            .on("mouseout", tool_tip.hide)
            .on("click", function(d) {
                updateSankey(d.properties["NAME"])
            })
            .transition()
            .duration(1000)
            .style("stroke", "#fff")
            .style("stroke-width", "1")
            .style("fill", function (d) {
                return colorScale(d.properties.value);
            })
            .attr("d", path);

        // legend
        d3.select(".column").remove();
        column("Scale", colorScale);

        function column(title, scale) {
            var legend = d3.legendColor()
                .labelFormat(d3.format(",.0f"))
                .cells(10)
                .scale(scale);

            var div = d3.select("#key").append("div")
                .attr("class", "column");

            div.append("h4").text(title);

            var svg = div.append("svg");

            svg.append("g")
                .attr("class", "legendQuant")
                .attr("transform", "translate(20,20)");

            svg.select(".legendQuant")
                .call(legend);
        };
    })
}