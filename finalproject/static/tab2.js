var country_data;
var country;
function handle_pageload(){
	get('http://127.0.0.1:5000/country_data',function(data,status){
    country_data=data.country_data;  
	populate_data()
	
  });
}
function get_dashboard_data(key){
	//Plotting Kills in year 
	country=key
	deaths_data=country_data[key]['kills'];
	data_x=Object.keys(deaths_data).map(Number);
	data_y=Object.values(deaths_data);
	make_line_plot(data_x,data_y,1)
	
	/*//Plotting Incidents in an year
	events_data=country_data[key]['events'];
	data_x=Object.keys(events_data).map(Number);
	data_y=Object.values(events_data);
	make_line_plot(data_x,data_y,2)*/

	get('http://127.0.0.1:5000/dashboard_data?cname='+key,function(data,status){
		military_expenditure=data.metric_data.mil_exp;
		data_x=Object.keys(military_expenditure);
		data_y=Object.values(military_expenditure);
		make_line_plot(data_x,data_y,3)

		imports=data.metric_data.imports;
		data_x=Object.keys(imports);
		data_y=Object.values(imports);
		make_line_plot(data_x,data_y,2)
		add_reg_under_threat(data.state_data,data.city_data,data.attacks)
		updateMap()
  });
}

function add_reg_under_threat(states,cities,attacks){
	$("#states").empty()
	$("#cities").empty()
	$("#attacks").empty()
	for(var i=0 ;i<states.length;i++  ){
		$("#states").append('<li>'+states[i][0]+'</li>')
	}
	for(var i=0 ;i<cities.length;i++  ){
		$("#cities").append('<li>'+cities[i][0]+'</li>')
	}
	for(var i=0 ;i<attacks.length;i++  ){
		$("#attacks").append('<li>'+attacks[i][1]+' '+attacks[i][0]+'s</li>')
	}
}

function clear_graph(gid){
	d3.select("#graph"+gid).selectAll("*").remove()
}

function populate_data(){
	var table=$("#dashboard-table-body tr").remove();
	var sortable = [];
	for (var country in country_data) {
		sortable.push([country, country_data[country]['total_kills']]);
	}
	sortable.sort(function(a, b) {
		return b[1] - a[1];
	});
	
	for(var i in sortable ){
		key=sortable[i][0]
		var trow='<tr onclick=\"get_dashboard_data( \''+ key +'\'  )\"><td>'+key+'</td><td>'+country_data[key]['total_events']+'</td><td>'
					+country_data[key]['total_kills']+'</td><td>'
					+country_data[key]['hdi_rank']+'</td></tr>'
		var table=$("#dashboard-table-body")
		table.append(trow)
	}
}
function plot_graphs(){

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
function myFunction() {
	var input, filter, table, tr, td, i, txtValue;
	input = document.getElementById("myInput");
	filter = input.value.toUpperCase();
	table = document.getElementById("myTable");
	tr = table.getElementsByTagName("tr");
	for (i = 0; i < tr.length; i++) {
	  td = tr[i].getElementsByTagName("td")[0];
	  if (td) {
		txtValue = td.textContent || td.innerText;
		if (txtValue.toUpperCase().indexOf(filter) > -1) {
		  tr[i].style.display = "";
		} else {
		  tr[i].style.display = "none";
		}
	  }       
	}
  }

function make_line_plot(x_data,y_data,gid){
	var width = 150 ; 
    var height = 150;
	//for the xscale using linear scale
	//var xScale =d3.scaleBand().domain(x_data).range([0,width])
    var xScale = d3.scaleLinear().domain([d3.min(x_data),d3.max(x_data)]).range([0, width]); 
    var yScale = d3.scaleLinear()
      .domain([0,d3.max(y_data)])  
      .range([height, 0]);  

    
    // for the plotting curve 
    var line = d3.line()
      .x(function(d, i) { return xScale(x_data[i]); }) 
      .y(function(d) { return yScale(d); }) 
      .curve(d3.curveMonotoneX)

      clear_graph(gid);

    var svg = d3.select("#graph"+gid).append("svg")
      .attr("width", width + 10)
      .attr("height", height + 6)
    .append("g")
      .attr("transform", "translate(5,1)");

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale)); 

    svg.append("g")
      .call(d3.axisLeft(yScale)); 

    svg.append("path")
      .datum(data_y)  
      .attr("class", "path")  
	  .attr("d", line)


    svg.selectAll(".dot")
      .data(data_y)
    .enter().append("circle")
      .attr("class", "point") 
      .attr("cx", function(d, i) { return xScale(i) })
      .attr("cy", function(d) { 
        return yScale(d) })
      .attr("r", 1);
	
	  var tooltip = d3.select("body")
		.append("div")
		.style("position", "absolute")
		.style("z-index", "10")
		.style("visibility", "hidden")
		.style("background", "#fff")
		.text("a simple tooltip");
	  
	  svg.append("rect")
	  .attr("class", "overlay")
	  .attr("width", width)
	  .attr("height", height)
	  .on("mouseover", function(d) { 
		x=Math.round(xScale.invert(d3.mouse(this)[0]));
		if(typeof(x_data[0])!='number')
			x=x.toString()	
		i=x_data.indexOf(x);
		y=y_data[i];
		tooltip.text('x:'+x+' y:'+y);
		return tooltip.style("visibility", "visible");
	  })
	  .on("mousemove", function(d) { 
		x=Math.round(xScale.invert(d3.mouse(this)[0]));
		if(typeof(x_data[0])!='number')
			x=x.toString()	
		i=x_data.indexOf(x);
		y=y_data[i];
		tooltip.text('x:'+x+' y:'+y);
			return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
	   })
	  .on("mouseout", function(d) { 
		return tooltip.style("visibility", "hidden");
	   });
	   
}

function updateMap(){
	var newYearValue = 2010;
	$.post("http://127.0.0.1:5000/", {'data': 'choropleth-'.concat(newYearValue.toString())}, function(data_infunc){
	  mapData = JSON.parse(data_infunc);
	  $( ".deathMap" ).empty();
	  new Choropleth({
		container: document.querySelector('.deathMap'),
		data: mapData.choroplethData,
		height:250,
		width:500,
		scale:250,
		country:country,
		center:[country_data[country]['longitude'],country_data[country]['latitude']]
	   });
	});
  }