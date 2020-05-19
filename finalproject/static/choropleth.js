var Choropleth = function(params)
{
  self = this;
  self.container = params.container;
  self.data = params.data;
  var tooltip = d3.select("div.tooltip");
  var width = params.width;
  var height = params.height;
  var svg = d3.select(self.container).append("svg")
              .attr("width", width)
              .attr("height", height);

  var path = d3.geoPath();
  var projection = d3.geoMercator()
        .scale(params.scale)
        .center(params.center)
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
		if(params.country!=undefined){
			return;
		}
      d3.selectAll(".Country")
        .transition()
        .duration(200)
        .style("opacity", .5)
      d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 1)
        .style("stroke", "black")
	  tooltip.style("hidden", false).html(d.properties.name);
    }

    let mouseLeave = function(d) {
		if(params.country!=undefined){
			return;
		}
      d3.selectAll(".Country")
        .transition()
        .duration(200)
        .style("opacity", .8)
      d3.select(this)
        .transition()
        .duration(200)
        .style("stroke", "transparent")
	   tooltip.classed("hidden", true);
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
        .style("stroke",function(d){ 
				if(d.properties.name==params.country)
					return "black"
				else 
					return "transparent"})
        .attr("class", function(d){ return "Country" } )
        .style("opacity",function(d){ 
				if(params.country!=undefined){
					if(d.properties.name==params.country)
						return 1
					else
						return 0.6
				}
				else
					return .8
		})
        .on("mouseover", mouseOver )
        .on("mouseleave", mouseLeave )
		.on("mouseout", mouseLeave )
		.append("title")
          .text(d => `${d.properties.name}\n Total Death Count ${d.total}  `)
	
   }

}
