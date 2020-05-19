var scatter_plot_data
var sun_burst_data
var loaded=false
function handle_pageload(){
    if(loaded==false){
        get('http://127.0.0.1:5000/scat_pi_data',function(data,status){
            countries_list=data.countries;
            for(var i=0;i<countries_list.length;i++){
                country=countries_list[i];
                $("#country").append(new Option(country,country));
            }
            $("#country").append(new Option('United States','United States'));
            get_scatter_plot_data(countries_list[0],5);
            loaded=true;
        });
    }
    
}

function get_scatter_plot_data(country,decade){
    $("#loader")[0]['style'].visibility='visible'
    $("#main")[0]['style'].visibility='hidden'
    get('http://127.0.0.1:5000/scat_data?cname='+country+'&decade='+decade,function(data,status){
        $("#main")[0]['style'].visibility='visible'
        $("#loader")[0]['style'].visibility='hidden'
        scatter_plot_data=data;
        scatter_plot(scatter_plot_data);
        add_legends(scatter_plot_data['groups'])
        sun_burst_data=data['sun_burst'];
        plot_sun_burst(sun_burst_data);
    });
}

function on_scat_change(){
    country=$("#country")[0].value;
    decade=$("#decade")[0].value;
    get_scatter_plot_data(country,decade)
}

function scatter_plot(data){
    xmax=d3.max(data.x)
    xmin=d3.min(data.x)
    ymax=d3.max(data.y)
    ymin=d3.min(data.y)
    var width = 400  
    var height = 400;
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
      .attr("style","margin-top:2%")
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
			.attr("y", 430 )
			.attr("x", 305 )
			.attr("text-anchor", "end")
			.text("Principal Component1")
			.attr("stroke", "black");
    gdata=[];
    for(var i=0;i<data['x'].length;i++){
        gdata.push({'p1':data['x'][i],'p2':data['y'][i],'color':data['groups'][data['g'][i]],'group':data['g'][i]})
    }
    svg.selectAll(".dot")
      .data(gdata)
    .enter().append("circle")
      .attr("class", "point") 
      .attr("cx", function(d, i) { return xscale(d.p1) })
      .attr("cy", function(d) { 
        return yscale(d.p2) })
      .attr("r", 3.5)
      .style("fill", function(d) { return get_color(d.color);})
      .append("title")
          .text(d => `${d.group}`);
  
} 

function clear_graph(){
	d3.select("#graph1").selectAll("*").remove()
}


function get_color(i){
    colors=['red','indigo','blue','green','yellow','orange']
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

function plot_sun_burst(nodeData){
    
    // Variables
    var width = 400;
    var height = 400;
    var radius = Math.min(width, height) / 2;
    var color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, 8))
    d3.select("#graph2").selectAll("*").remove()
    // Create primary <g> element
    var g = d3.select('#graph2').append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('style','margin-top:5%')
        .append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

    // Data strucure
    var partition = d3.partition()
        .size([2 * Math.PI, radius]);

    // Find data root
    var root = d3.hierarchy(nodeData)
        .sum(function (d) { return d.size});

    // Size arcs
    partition(root);
    var arc = d3.arc()
        .startAngle(function (d) { return d.x0 })
        .endAngle(function (d) { return d.x1 })
        .innerRadius(function (d) { return d.y0 })
        .outerRadius(function (d) { return d.y1 });
    var format = d3.format(",d")
    // Put it all together
    g.selectAll('path')
        .data(root.descendants())
        .enter().append('path')
        .attr("display", function (d) { return d.depth ? null : "none"; })
        .attr("d", arc)
        .style('stroke', '#fff')
        .style("fill", function (d) { 
            if(d.data.name in scatter_plot_data['groups']){
                c1=get_color(scatter_plot_data['groups'][d.data.name]);
            }
            else
                c1=  color((d.children ? d : d.parent).data.name);
            return c1;
         })
        .append("title")
          .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("\n")}\n Total deaths: ${format(d.value)}`);
        
}

function add_legends(keys){
    d3.select("#legends").selectAll("*").remove()
    var svg = d3.select("#legends")
              .attr("height","100%")
    svg.append("text").attr("x", 50).attr("y", 60 ).text('Terrorist Organisation').style("font-size", "20px").attr("alignment-baseline","middle")
    var i=0;
    for(var k in keys){
        svg.append("circle").attr("cx",60).attr("cy",100+i*30).attr("r", 6).style("fill", get_color(keys[k]))
        svg.append("text").attr("x", 80).attr("y", 100+i*30).text(k).style("font-size", "15px").attr("alignment-baseline","middle")
        i+=1
    }
    svg.append("text").attr("x", 50).attr("y", 300 ).text('Hierarchy Levels').style("font-size", "20px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 60).attr("y", 340).text("Level 0: Terrorist Organisation ").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 60).attr("y", 370).text("Level 1: Target Type").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 60).attr("y", 400).text("Level 2: Target Sub Type").style("font-size", "15px").attr("alignment-baseline","middle")
}