

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

    d3.csv("data/29SNAPcurrPP-11.csv", function (data) {
        data.forEach(function (d) {
            d.aug_18 = d.aug_18.replace(/\,/g, '');
            d.aug_18 = +d.aug_18;
            d.jul_19 = d.jul_19.replace(/\,/g, '');
            d.jul_19 = +d.jul_19;
            d.aug_19 = d.aug_19.replace(/\,/g, '');
            d.aug_19 = +d.aug_19;
        });

        dataSet = data;

        updateViz();

    });
}

function updateViz(data) {
    console.log("yup")
    var rank = d3.select("#rank").property("value");

    var dataArray = [];

    for (var d = 0; d < dataSet.length; d++) {
        dataArray.push(dataSet[d][rank])
    }

    var colorScale = d3.scaleQuantile()
        .domain(dataArray)
        .range(["#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404", "#662506"]);

    d3.json("data/states.json", function (json) {
        for (var i = 0; i < dataSet.length; i++) {
            for (var j = 0; j < json.features.length; j++) {
                if (dataSet[i].state === json.features[j].properties.NAME) {
                    json.features[j].properties.value = dataSet[i][rank];
                    console.log(dataSet[i][rank])
                    break;
                }
            }
        }

        svg_map.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("stroke", "#fff")
            .style("stroke-width", "1")
            .style("fill", function (d) {
                console.log(d.properties.NAME);
                console.log(d.properties.value);
                return colorScale(d.properties.value);
            });
    })
}