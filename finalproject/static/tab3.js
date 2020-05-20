
function handle_pageload(){
  get('http://127.0.0.1:5000/pll_cord_data',function(data,status){
    plot_parallel_coordinates(data);
    add_legends(data.countries)
  });
   
}

function add_legends(keys){
  d3.select("#legends").selectAll("*").remove()
  var svg = d3.select("#legends")
            .attr("height","100%")
  var color=d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, keys.length))
  
  svg.append("text").attr("x", 40).attr("y", 60 ).text('Countries').style("font-size", "20px").attr("alignment-baseline","middle")
  var i=0
  for(i=0; i< keys.length;i++){
      svg.append("circle").attr("cx",50).attr("cy",100+i*10).attr("r", 6).style("fill", color(keys[i]))
      svg.append("text").attr("x", 70).attr("y", 100+i*10).text(keys[i]).style("font-size", "15px").attr("alignment-baseline","middle")
      i+=1
  }
  
  ["year","hdi","nincidents", "imports","nkills" ,"mil_exp"]
  svg.append("text").attr("x", 40).attr("y", 130+i*10 ).text('Parallel Coordinates').style("font-size", "20px").attr("alignment-baseline","middle")
  svg.append("text").attr("x", 40).attr("y", 150+i*10).text("year : Year ").style("font-size", "15px").attr("alignment-baseline","middle")
  svg.append("text").attr("x", 40).attr("y", 170+i*10).text("hdi : Human Development Index ").style("font-size", "15px").attr("alignment-baseline","middle")
  svg.append("text").attr("x", 40).attr("y", 190+i*10).text("nincidents : Number of Terrorist Activities").style("font-size", "15px").attr("alignment-baseline","middle")
  svg.append("text").attr("x", 40).attr("y", 210+i*10).text("imports : Military Imports Of Nation").style("font-size", "15px").attr("alignment-baseline","middle")
  svg.append("text").attr("x", 40).attr("y", 230+i*10).text("nkills :Number of Deaths").style("font-size", "15px").attr("alignment-baseline","middle")
  svg.append("text").attr("x", 40).attr("y", 250+i*10).text("mil_exp : % Military Expenditure of GDP").style("font-size", "15px").attr("alignment-baseline","middle")

}

function plot_parallel_coordinates(parallel_data){ 
  //plotting parallel Coordinates
  
  data=parallel_data['parallel_data']
  var color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, parallel_data.countries.length))
  var top= 30;
  var right= 50;
  var bottom= 10;
  var left= 50;
    width = 850;
    height = 460;
  var svg = d3.select("#graph1")
  .append("svg")
    .attr("width", width + left + right)
    .attr("height", height + top + bottom)
  .append("g")
    .attr("transform",
          "translate(" + left + "," + top + ")");
  // features of the parallel coordinates
  features = ["year","hdi","nincidents", "imports","nkills" ,"mil_exp"]
    
    var y = {}
    k=0
	//picking linear scale  for each feature
    for (i in features) {
      name = features[i];
      y[name] = d3.scaleLinear()
        .domain( [parallel_data.min[k],parallel_data.max[k]] ) 
        .range([height, 0]);
      k++;
    }

    x = d3.scalePoint()
      .range([0, width])
      .domain(features);
    
    svg.selectAll("myPath")
      .data(data)
      .enter()
      .append("path")
        .attr("class", function (d) { return "line " + d.country } ) 
        .attr("d",  function(d) {
			return d3.line()(features.map(function(p) { return [x(p), y[p](d[p])]; }));
		})
        .style("fill", "none" )
        .style("stroke", function(d){ return( color(d.country))} )
        .style("opacity", 0.5)
        .on("mouseover", function(d){

		  selected_country = d.country

		  d3.selectAll(".line")
			.transition().duration(180)
			.style("stroke", "lightgrey")
			.style("opacity", "0.2")
		  d3.selectAll("." + selected_country)
			.transition().duration(180)
			.style("stroke", color(selected_country))
			.style("opacity", "1")
		})
        .on("mouseleave", function(d){
		  d3.selectAll(".line")
			.transition().duration(180).delay(900)
			.style("stroke", function(d){ return( color(d.country))} )
			.style("opacity", "1")
		} )

    svg.selectAll("myAxis")
      .data(features).enter()
      .append("g")
      .attr("class", "axis")
      .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
      .each(function(d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d])); })
      .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; })
        .style("fill", "black")

}


function post(url,data,afunc){
  $.post(url,
	  data,
	  function(data,status){
		afunc(data,status);
  });
		
}
function get(url,afunc){
 	$.get(url, function(data, status){
    afunc(data,status)
 	  });
}

