var scatter_plot_data
function handle_pageload(){
    get('http://127.0.0.1:5000/scat_data?cname=India&decade=3',function(data,status){
        scatter_plot_data=data;
        scatter_plot(scatter_plot_data)
      });
}

function scatter_plot(data){
    xmax=d3.max(data.x)
    xmin=d3.min(data.x)
    ymax=d3.max(data.y)
    ymin=d3.min(data.y)
    var width = 450  
    var height = 450;
    var xscale = d3.scaleLinear()
      .domain([xmin, xmax]) 
      .range([0, width]); 

    var yscale = d3.scaleLinear()
      .domain([ymin,ymax])  
      .range([height, 0]);  
    
      clear_graph();
    var svg = d3.select("#graph1").append("svg")
      .attr("width", width + 95)
      .attr("height", height + 65)
    .append("g")
      .attr("transform", "translate(50,10)");

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xscale)); 

    svg.append("g")
      .call(d3.axisLeft(yscale)); 
    
    svg.append("text")
     .attr("transform", "rotate(-90)")
		 .attr("y", -30)
		 .attr("x",-145)
		 .attr("text-anchor", "end")
		 .text("Principal Component 2")
		 .attr("stroke", "black")
		 
	svg.append("text")
			.attr("y", 480 )
			.attr("x", 305 )
			.attr("text-anchor", "end")
			.text("Principal Component1")
			.attr("stroke", "black");
    gdata=[];
    for(var i=0;i<data['x'].length;i++){
        gdata.push({'p1':data['x'][i],'p2':data['y'][i],'color':data['groups'][data['g'][i]]})
    }
    svg.selectAll(".dot")
      .data(gdata)
    .enter().append("circle")
      .attr("class", "point") 
      .attr("cx", function(d, i) { return xscale(d.p1) })
      .attr("cy", function(d) { 
        return yscale(d.p2) })
      .attr("r", 3.5)
      .style("fill", function(d) { return get_color(d.color);});
  
} 

function clear_graph(){
	d3.select("#graph1").selectAll("*").remove()
}


function get_color(i){
    colors=['red','green','blue','black','orange','violet','yellow']
    return colors[i]
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