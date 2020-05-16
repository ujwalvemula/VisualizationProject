var Choropleth = function(params)
{
  self = this;
  self.container = params.container;
  self.data = params.data;

  var width = +800;
  var height = +600;
  var svg = d3.select(self.container).append("svg")
              .attr("width", width)
              .attr("height", height);

  var path = d3.geoPath();
  var projection = d3.geoMercator()
        .scale(100)
        .center([0,20])
        .translate([width / 2, height / 2]);

  self.data = JSON.parse(self.data);
  console.log(d3.keys(self.data[0])[0]);
  var data = d3.map();
  self.column0 = d3.keys(self.data[0])[0];
  self.column1 = d3.keys(self.data[0])[1];
  for (var i = 0; i < self.data.length; i++) {
    data.set(self.data[i][self.column1], +self.data[i][self.column0]);
  }

  var r = d3.max(data.values()) - d3.min(data.values()); //range
  var colorScale = d3.scaleThreshold()
              .domain([d3.min(data.values()), d3.min(data.values())+(0.05*r), d3.min(data.values())+(0.15*r), d3.min(data.values())+(0.3*r), d3.min(data.values())+(0.6*r), d3.max(data.values())])
              .range(["#c8c8c8"].concat(d3.schemeReds[6]));

  console.log(data);
  console.log(colorScale);
  // Load external data and boot
  d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    //.defer(d3.csv, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", function(d) { data.set(d.code, +d.pop); })
    .await(ready);

  function ready(error, topo) {

    let mouseOver = function(d) {
      d3.selectAll(".Country")
        .transition()
        .duration(200)
        .style("opacity", .5)
      d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 1)
        .style("stroke", "black")
    }

    let mouseLeave = function(d) {
      d3.selectAll(".Country")
        .transition()
        .duration(200)
        .style("opacity", .8)
      d3.select(this)
        .transition()
        .duration(200)
        .style("stroke", "transparent")
    }

    svg.append("g")
      .selectAll("path")
      .data(topo.features)
      .enter()
      .append("path")
        .attr("d", d3.geoPath()
          .projection(projection)
        )
        .attr("fill", function (d) {
          d.total = data.get(d.id) || 0;
          return colorScale(d.total);
        })
        .style("stroke", "transparent")
        .attr("class", function(d){ return "Country" } )
        .style("opacity", .8)
        .on("mouseover", mouseOver )
        .on("mouseleave", mouseLeave )
      }

}
