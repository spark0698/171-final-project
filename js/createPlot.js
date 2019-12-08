function createPlot(data) {

    width = 400
    height = 400

    margins = {top: 40, bottom: 40, left: 40, right: 40}

    plotSVG = d3.select("#plot-area").append('svg')
        .attr('width', width)
        .attr('height', height)


    circlesGroup = plotSVG.append('g')
        .attr('transform', 'translate(40, 40)')



    xScale = d3.scaleLinear()
        .domain([50, 85])
        .range([0, 350])

    yScale = d3.scaleLinear()
        .domain([10, 55])
        .range([350, 0])

    xAxis = d3.axisBottom().scale(xScale)
    yAxis = d3.axisLeft().scale(yScale)

    rScale = d3.scaleLinear()
        .domain([6, 23])
        .range([3, 10])

    plotSVG.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", "translate(200, 40)")
        .call(yAxis);

    plotSVG.append("g")
        .attr("class", "axis y-axis")
        .attr("transform", "translate(40, 200)" )
        .call(xAxis);

    circlesGroup.selectAll('circle')
        .data(data).enter()
        .append('circle')
        .attr('class', 'plot-circle')
        .attr('id', function(d){
            console.log(d.State.trim())
            return d.State.trim() +'circle'
        })
        .attr('cx', function(d){return xScale(d.Children)})
        .attr('cy', function(d){return yScale(d.ElderlyDisabilities)})
        .attr('r', function(d){return rScale(d.Total)})
        .attr('fill',  function(d){

            if (d.State =='National Average') {
                return 'red'
            }
            else {
                return 'gray'
            }

        })
        .attr('opacity', 0.5)
        .on('mouseover', function(d){

            plotSVG.append('rect')
                .attr('fill', 'gray')
                .attr('x', xScale(d.Children)-20)
                .attr('y', yScale(d.ElderlyDisabilities))
                .attr('height', 20)
                .attr('width', 100)
                .attr('class', 'tip-rect')
                .attr('opacity', 0.8)

            plotSVG.append('text')
                .text(d.State)
                .attr('x', xScale(d.Children)+30)
                .attr('y', yScale(d.ElderlyDisabilities)+15)
                .attr('fill', 'white')
                .attr('font-size', 10)
                .attr('text-anchor', 'middle')
                .attr('class', 'hello')

            d3.select("#"+d.State.trim()+'circle').attr('opacity', 1)
                .attr('stroke', 'black')
        })
            .on('mouseout', function(d){
            d3.select('.hello').remove()
            d3.select('.tip-rect').remove()
            d3.select("#"+d.State.trim()+'circle').attr('opacity', 0.5)
                .attr('stroke', 'none')

    })

    plotSVG.append("text")
        .attr("transform", "translate(200,35)")
        .attr("class", "plot-axis-label")
        .text("% Households with Elderly or Disabled");

    plotSVG.append("text")
        .attr("transform", "translate(20, 200)")
        .attr("class", "plot-axis-label y-label")
        .text("% Households with Children ");
}