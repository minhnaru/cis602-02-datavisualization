function extractJobsPct(jobData, year, occCode, number) {
    var res = jobData.filter(
	function(d) { return ((year == null || d.year == year) &&
			      (occCode == null || d.occ_code == occCode)); });
    res = res.sort(function(a,b) {
	return d3.descending(+a.jobs_1000,+b.jobs_1000);
    });
    if (number) {
	return res.slice(0,number);
    } else {
	return res;
    }
}

var barW = 500,
    barH = 300,
    barMargin = {top: 20, bottom: 120, left: 100, right: 20},
    barX = d3.scaleBand().padding(0.1),
    barY = d3.scaleLinear(),
    barXAxis = null,
    jobCode = "15-0000";

function createBars(divId, jobData, year, occCode) {
    var svg = d3.select(divId).append("svg")
		.attr("width", barW+barMargin.left+barMargin.right)
		.attr("height", barH+barMargin.top+barMargin.bottom)
		.append("g")
		.attr("class", "main")
		.attr("transform",
		      "translate(" + barMargin.left + "," + barMargin.top + ")")

    var csData = extractJobsPct(jobData, year, occCode, 18);

    barX.range([0,barW])
	.domain(csData.map(function(d) { return d.area_title; }));
    barY.range([barH,0])
	.domain([0,d3.max(extractJobsPct(jobData, null, occCode),
			  function(d) { return +d.jobs_1000; })]);

    svg.selectAll("rect")
    	.data(csData)
		.enter().append("rect")
		.attr("class", "bar")
		.attr("x", function(d) { return barX(d.area_title); })
		.attr("y", function(d) { return barY(+d.jobs_1000); })
		.attr("width", barX.bandwidth())
		.attr("height", function(d) { return barH - barY(+d.jobs_1000); })

    var barXAxis = d3.axisBottom(barX);

    svg.append("g")
		.attr("transform", "translate(0," + barH +")")
		.attr("class", "x axis")
		.call(barXAxis)

    var barYAxis = d3.axisLeft(barY);

    svg.append("g")
		.attr("class", "y axis")
		.call(barYAxis)

    svg.append("g")
		.attr("transform", "translate(-30," + (barH/2) + ") rotate(-90)")
		.append("text")
		.style("text-anchor", "middle")
		.text("Jobs Per 1000")

    svg.append("text")
		.attr("x", barW/2)
		.attr("y", barH + 115)
		.text("State")
}

function updateBars(divId, jobData, year, occCode) {
    // write code to update the bar chart created to the specified year
    // you should use two transitions, one to update the bar values
    // and the other to reorder the bars
    // Make sure to transition the axes, too!

    var csData = extractJobsPct(jobData, year, occCode, 18);

    var svg1 = d3.select(divId).select("svg").select("g").selectAll("rect")
    	.data(csData, function(d) { return d.area_title; });
    
    barX.range([0, barW])
		.domain(csData.map(function(d) { return d.area_title; }));

   	svg1.enter().append("rect")
   		.attr("x", function(d) { return barX(d.area_title); })
   		.attr("y", function(d) { return barY(+d.jobs_1000); })
   		.attr("width", barX.bandwidth())
   		.attr("height", function(d) { return barH - barY(+d.jobs_1000); })
   		.style("opacity", 0)
   		.merge(svg1)
	   		.transition()
	   		.duration(1500)
	   		.delay(3000)
   			.style("opacity", 1)
   			.style("fill", "#f26f6f")

    svg1.transition().duration(1500)
	    	.attr("y", function(d) { return barY(+d.jobs_1000); })
			.attr("height", function(d) { return barH - barY(+d.jobs_1000); })
			.style("fill", "#f26f6f")
		.transition().duration(1500)
			.attr("x", function(d) { return barX(d.area_title); })

	svg1.exit()
		.transition().duration(1500)
    		.style("opacity", 0)
    		.remove()

    var svg2 = d3.select(divId);

	barXAxis = d3.axisBottom(barX);

	svg2.select(".x.axis")
        .transition()
        .duration(1500)
        .delay(1500)
            .call(barXAxis)

}

function getStateRankings(jobData, occCode) {
    // TODO: compute the state rankings for the given occCode

    var results = {};

    var resCode = jobData.filter(function(d) { 
    	return (occCode == null || d.occ_code == occCode);
    });

    resCode.forEach(function(d) {
    		// filter by state
	    	var resState = jobData.filter(function(e) {
	    		return (e.area_title == d.area_title);
	    	});
	    	// sort total employee in descending order
	    	resState = resState.sort(function(a, b) {
	    		return d3.descending(+a.tot_emp, +b.tot_emp);
	    	});
	    	// find the ranking based on index
	    	var ranking = resState.map(function(g) {
	    		return g.occ_code;
	    	}).indexOf(d.occ_code);
	    	results[d.area_title] = ranking;
    	});

    return results;
    
    // TODO: remove this statically encoded solution that only works for code "15-0000"
    // return {"Alabama":16,"Alaska":18,"Arizona":12,"Arkansas":15,"California":10,"Colorado":9,"Connecticut":14,"Delaware":10,"District of Columbia":4,"Florida":15,"Georgia":11,"Hawaii":17,"Idaho":14,"Illinois":10,"Indiana":15,"Iowa":14,"Kansas":14,"Kentucky":15,"Louisiana":17,"Maine":15,"Maryland":8,"Massachusetts":9,"Michigan":15,"Minnesota":11,"Mississippi":17,"Missouri":13,"Montana":16,"Nebraska":12,"Nevada":16,"New Hampshire":13,"New Jersey":10,"New Mexico":16,"New York":15,"North Carolina":13,"North Dakota":14,"Ohio":13,"Oklahoma":15,"Oregon":13,"Pennsylvania":14,"Rhode Island":13,"South Carolina":16,"South Dakota":14,"Tennessee":15,"Texas":12,"Utah":11,"Vermont":14,"Virginia":7,"Washington":9,"West Virginia":16,"Wisconsin":13,"Wyoming":19}
}

function linkedLineChart(jobData, stateTitle) {

	// get the data from state
	var lineRes = [];

	var resData = jobData.filter(function(d) {
		return (stateTitle == null || d.area_title == stateTitle);
	});

	resData = resData.filter(function(d) {
		return (jobCode == null || d.occ_code == jobCode);
	});

	lineRes = resData.map(function(d) {
		return {"year": d.year, "tot_emp": d.tot_emp};
	});

	return lineRes;

}

function createBrushedVis(divId, usMap, jobData, year) {
	var jobLineData = jobData;
    var jobData = jobData.filter(
		function(d) { return (+d.year == year); }
	);
    
    var width = 600,
		height = 400;

    var svg = d3.select(divId).append("svg")
		.attr("width", width)
		.attr("height", height);

    var projection = d3.geoAlbersUsa()
		.fitExtent([[0,0],[width,height]], usMap);

    var path = d3.geoPath()
		.projection(projection);

    var rankings = getStateRankings(jobData, jobCode);
    var color = d3.scaleSequential(d3.interpolateViridis).domain([22,0]);
    
    svg.append("g")
		.selectAll("path")
		.data(usMap.features)
		.enter().append("path")
		.attr("d", path)
		.attr("fill",
		      function(d) { return color(rankings[d.properties.name]); })
		.attr("class", "state-boundary")
		.classed("highlight", false)
		.on("click", stateMouseClick)
    
    var bWidth = 400,
		bHeight = 400,
		midX = 200;
    
    var allJobs = d3.nest()
		.key(function(d) { return d["occ_code"]; })
		.key(function(d) { return d["occ_title"]; })
		.rollup(function(v) {
		    return v.reduce(function(s,d) {
			if (!+d.tot_emp) { return s; } return s + +d.tot_emp; },0); })
		.entries(jobData)
		.sort(function(a,b) { return d3.descending(+a.values[0].value, +b.values[0].value); })
    
    var barSvg = d3.select(divId).append("svg")
		.attr("width", bWidth)
		.attr("height", bHeight)
		.style("vertical-align", "bottom")
    
    var y = d3.scaleBand().padding(0.1).range([0,bHeight]).domain(allJobs.map(function(d) { return d.values[0].key; }));
    var x = d3.scaleLinear().range([0,bWidth-midX]).domain([0,d3.max(allJobs, function(d) { return d.values[0].value; })]);
    
    var bars = barSvg.selectAll(".bar").data(allJobs)
		.enter().append("g")
		.attr("transform",
		      function(d) { return "translate(0," + y(d.values[0].key) + ")";})
		.attr("class", "bar")
    
    function jobMouseEnter(d) {
	// TODO: add code here

		var selectedBar = d3.select(this);
		jobCode = selectedBar.datum().key;

		var rankings = getStateRankings(jobData, jobCode);
    	
    	d3.selectAll("rect").classed("highlight", false);
    	selectedBar.classed("highlight", true);

    	d3.select(".lineC").attr("display", "none");

    	svg.selectAll("g").remove();

	    svg.append("g")
			.selectAll("path")
			.data(usMap.features)
			.enter().append("path")
			.attr("d", path)
			.attr("fill",
			      function(d) { return color(rankings[d.properties.name]); })
			.attr("class", "state-boundary")
			.classed("highlight", false)
			.on("click", stateMouseClick)

    }

    function stateMouseClick() {

    	var selectedState = d3.select(this);
    	var stateTitle = selectedState.datum().properties.name;

    	var lnData = linkedLineChart(jobLineData, stateTitle);

    	d3.selectAll("path").classed("highlight", false);
    	selectedState.classed("highlight", true);

    	d3.select(".lineC").attr("display", "inline-block");

		lineY.domain([ d3.min(lnData, function(d) { return +d["tot_emp"]; }) / 1.05, d3.max(lnData, function(d) { return +d["tot_emp"]; }) * 1.05 ]);

		var line = d3.line()
			.x(function(d) { return lineX(d["year"]); })
			.y(function(d) { return lineY(d["tot_emp"]); });

    	lineSvg.select("path")
			.datum(lnData)
			.transition()
			.duration(500)
				.attr("d", line);

		var lineYAxis = d3.axisLeft(lineY).tickFormat(d3.formatPrefix(".1", 1e3));

	    lineSvg.select(".yA")
	    	.transition()
			.duration(500)
			.call(lineYAxis)

    }
    
    bars.append("rect")
		.attr("x", midX)
		.attr("y", 0)
		.attr("width", function(d) { return x(d.values[0].value); })
		.attr("height", y.bandwidth())
		.classed("highlight", function(d) { return d.key == jobCode; })
		.on("mouseover", jobMouseEnter)

    bars.append("text")
    	.attr("x", midX - 4)
    	.attr("y", 12)
    	.style("text-anchor", "end")
    	.text(function(d) { var label = d.values[0].key.slice(0,-12);
			    if (label.length > 33) {
				label = label.slice(0,30) + "...";
			    }
			    return label; });

    // create line chart
    var lnData = linkedLineChart(jobLineData, "Florida");

	var lineW = 500,
    	lineH = 250,
    	lineMargin = {top: 10, bottom: 60, left: 100, right: 20},
		lineX = d3.scaleBand().rangeRound([0, lineW], .1).padding(5),
    	lineY = d3.scaleLinear().range([lineH, 0]);

	var lineSvg = d3.select(divId).append("svg")
		.attr("width", lineW+lineMargin.left+lineMargin.right)
		.attr("height", lineH+lineMargin.top+lineMargin.bottom)
		.append("g")
		.attr("class", "lineC")
		.attr("display", "none")
		.attr("transform", "translate(" + lineMargin.left + "," + lineMargin.top + ")");

	lineX.domain(lnData.map(function(d) { return d["year"]; }));
	lineY.domain([ d3.min(lnData, function(d) { return +d["tot_emp"]; }) / 1.05, d3.max(lnData, function(d) { return +d["tot_emp"]; }) * 1.05 ]);

	var line = d3.line()
		.x(function(d) { return lineX(d["year"]); })
		.y(function(d) { return lineY(d["tot_emp"]); });

	lineSvg.append("path")
		.datum(lnData)
		.attr("fill", "none")   
		.attr("stroke", "#f26f6f")
		.attr("stroke-width", 1.5)
		.attr("d", line);

	var lineXAxis = d3.axisBottom(lineX);

	var lineYAxis = d3.axisLeft(lineY).tickFormat(d3.formatPrefix(".1", 1e3));

	lineSvg.append("g")
		.attr("transform", "translate(0," + lineH +")")
		.attr("class", "xA")
		.call(lineXAxis)

    lineSvg.append("g")
		.attr("class", "yA")
		.call(lineYAxis)

    lineSvg.append("g")
		.attr("transform", "translate(-30," + (lineH/2) + ") rotate(-90)")
		.append("text")
		.attr("y", -30)
		.style("text-anchor", "middle")
		.text("Total Employees")

    lineSvg.append("text")
		.attr("x", lineW/2)
		.attr("y", lineH + 45)
		.text("Year")

}

function processData(errors, usMap, jobsData) {
    console.log("Errors", errors)
    createBars("#bars", jobsData, 2012, "15-0000");
    updateBars("#bars", jobsData, 2016, "15-0000");

    createBrushedVis("#brushed", usMap, jobsData, 2016);
}

d3.queue()
    .defer(d3.json, "https://cdn.rawgit.com/dakoop/69d42ee809c9e7985a2ff7ac77720656/raw/6707c376cfcd68a71f59f60c3f4569277f20b7cf/us-states.json")
    .defer(d3.csv, "https://cdn.rawgit.com/dakoop/69d42ee809c9e7985a2ff7ac77720656/raw/6707c376cfcd68a71f59f60c3f4569277f20b7cf/occupations.csv")
    .await(processData);