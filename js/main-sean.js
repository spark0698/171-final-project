

// --> CREATE SVG DRAWING AREA

var width = 1000,
    height = 600;

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

    if (rank === "participate") {
        var colorScale = d3.scaleQuantile()
            .domain(dataArray)
            .range(["#fef0d9", "#fdcc8a", "#fc8d59", "#e34a33", "#b30000"]);
    } else if (rank === "benefit") {
        var colorScale = d3.scaleQuantile()
            .domain(dataArray)
            .range(["#edf8fb", "#b2e2e2", "#66c2a4", "#2ca25f", "#006d2c"]);
    } else {
        var colorScale = d3.scaleQuantile()
            .domain(dataArray)
            .range(["#feebe2", "#fbb4b9", "#f768a1", "#c51b8a", "#7a0177"]);
    }

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

        selection.enter()
            .append("path")
            .merge(selection)
            .transition()
            .duration(550)
            .style("stroke", "#fff")
            .style("stroke-width", "1")
            .style("fill", function (d) {
                return colorScale(d.properties.value);
            })
            .attr("d", path);
    })
}