var country_data;
function handle_pageload(){
	get('http://127.0.0.1:5000/country_data',function(data,status){
    country_data=data.country_data;  
	populate_data()
	
  });
}
function get_dashboard_data(key){
	//Plotting Kills in year 
	
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
		military_expenditure=data.mil_exp;
		data_x=Object.keys(military_expenditure);
		data_y=Object.values(military_expenditure);
		make_line_plot(data_x,data_y,3)

		imports=data.imports;
		data_x=Object.keys(imports);
		data_y=Object.values(imports);
		make_line_plot(data_x,data_y,2)
  });
}
function clear_graph(gid){
	d3.select("#graph"+gid).selectAll("*").remove()
}

function populate_data(){
	var table=$("#dashboard-table-body tr").remove();
	for(var key in country_data ){
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
	var xScale =d3.scaleBand()
		.domain(x_data)
		.range([0,width])
    //var xScale = d3.scaleLinear().domain([d3.min(x_data),d3.max(x_data)]).range([0, width]); 
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
      .attr("d", line);  

    svg.selectAll(".dot")
      .data(data_y)
    .enter().append("circle")
      .attr("class", "point") 
      .attr("cx", function(d, i) { return xScale(i) })
      .attr("cy", function(d) { 
        return yScale(d) })
      .attr("r", 1);
    
    svg.append("g")
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -35)
      .attr("x",-105)
      .attr("text-anchor", "end")
      .text("Distortions")
      .attr("stroke", "black");

    svg.append("text")
      .attr("y", 480 )
      .attr("x", 305 )
      .attr("text-anchor", "end")
      .text('Number of clusters')
      .attr("stroke", "black");	
}