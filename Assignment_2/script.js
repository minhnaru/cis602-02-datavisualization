/* ------------------------- General ------------------------- */
/* Sum all values */
function getTotals(refugees) {
	var sum = refugees.map(function(object) {
		return Object.keys(object).reduce(function (sum, key) {
			return sum + (key !== 'Year' && object[key]);
		}, 0);
	});
	return sum;
}

var dataset = getTotals(refugees);

/* Add Total object to array */
var getValues = function(refugees) {
    refugees.map(function(object, i) {
        object["Total"] = dataset[i];
    });
    return refugees;
}

/* Overall SVG Container */
var margin = {top:40, right:40, bottom:40, left:40},
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom,
    data = getValues(refugees);
    xTitle = "Year",
    yTitle = "Number of Refugees",
    fontSize = 15,
    fontFamily = "sans-serif";

var x = d3.scaleBand().rangeRound([0, width], .1).padding(.1);
    y = d3.scaleLinear().range([height, 0]);

/* Set domain for x and y scale function */
x.domain(data.map(function(d) { return d["Year"]; }));
y.domain([0, d3.max(data, function(d) { return d["Total"]; }) * 1.2 ]);

/* tickValue for every 5 years */
var tickgap = x.domain().filter(function(d, i) { return !(i % 5); });

/* Create X-axis and Y-axis */
var xAxis = d3.axisBottom(x)
            .tickValues(tickgap);

var yAxis = d3.axisLeft(y)
            .ticks(10)
            .tickFormat(d3.formatPrefix(".0", 1e3));

/* Axis title */
function makeAxisTitle(chart, attrs) {
    var title = chart.append("text").text(attrs.title);
    if (attrs === undefined) attrs = {};
    for (var key in attrs) {
        title.attr(key, attrs[key]);
    }
    return chart;
}

var countries = Object.keys(refugees[0]).filter(function(k) {
    return k != "Year" && k != "Total";
});
/* ----------------------- End General ----------------------- */

/* ------------------------- Bar Chart ------------------------- */
/* Create SVG Container & Group Element */
var chart = d3.select("#barchart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left * 1.5 + "," + margin.top / 1.5 + ")");

/* Append x and y axis */
chart.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)

chart.append("g")
    .call(yAxis)

/* Add bars to the chart */
chart.selectAll("bar")
    .data(data)
    .enter().append("rect")
    .attr("x", function(d) { return x(d["Year"]); })
    .attr("y", function(d) { return y(d["Total"]); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return height - y(d["Total"]); })
    .attr("fill", "#ef695d");

var AxisTx = makeAxisTitle(chart, {
    "transform": 'translate(' + (width / 2) + ', ' + (height + margin.top) + ')',
    "text-anchor": "middle",
    "font-size": fontSize,
    "font-family": fontFamily,
    "title": xTitle
});

var AxisTy = makeAxisTitle(chart, {
    "transform": 'translate(' + -margin.left + ', ' + (height / 2) + ')rotate(-90)',
    "text-anchor": "middle",
    "font-size": fontSize,
    "font-family": fontFamily,
    "title": yTitle
});
/* ----------------------- End Bar Chart ----------------------- */

/* ------------------------- Stacked Bar Chart ------------------------- */
var color = d3.scaleOrdinal(d3.schemeCategory10);

/* Create SVG Container & Group Element */
var chart = d3.select("#stacked")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left * 1.5 + "," + margin.top / 1.5 + ")");

/* Append x and y axis */
chart.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)

chart.append("g")
    .call(yAxis)

/* Add bars to the chart */
chart.append("g")
    .selectAll("g")
    .data(d3.stack().keys(countries)(data))
    .enter().append("g")
        .attr("fill", function(d) { return color(d.key); })
    .selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
        .attr("x", function(d) { return x(d.data["Year"]); })
        .attr("y", function(d) { return y(d[1]); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })

var AxisTx = makeAxisTitle(chart, {
    "transform": 'translate(' + (width / 2) + ', ' + (height + margin.top) + ')',
    "text-anchor": "middle",
    "font-size": fontSize,
    "font-family": fontFamily,
    "title": xTitle
});

var AxisTy = makeAxisTitle(chart, {
    "transform": 'translate(' + -margin.left + ', ' + (height / 2) + ')rotate(-90)',
    "text-anchor": "middle",
    "font-size": fontSize,
    "font-family": fontFamily,
    "title": yTitle
});

/* Legend indicate the relationship between regions and colors */
var square = 8,
    legendFontSize = 12,
    legendFontFamily = "sans-serif";

var legend = chart.append("g")
                    .attr("class", "legend")
                    .selectAll("g")
                    .data(countries)
                    .enter().append("g")
                        .attr("class", function(d) { return d; })
                        .attr("transform", function(d, i) { return "translate(0," + (i * (square + 1) * 2) + ")"; });

/* Legend countries name */
legend.append("text")
        .attr("font-size", legendFontSize)
        .attr("font-family", legendFontFamily)
        .attr("text-anchor", "end")
        .attr("x", width - (square * 1.4))
        .attr("y", square * 1.1)
        .text(function(d) { return d; });

/* Legend color square */
legend.append("rect")
        .attr("x", width)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", color);
/* ----------------------- End Stacked Bar Chart ----------------------- */

/* ------------------------- Line Chart ------------------------- */
/* Re-write the y axis to match with maximum value */
y.domain([0, d3.max(data, function(d) { return d["Total"]; }) / 1.2]);

d3.select("#linechart select")
    .selectAll("option").data(countries)
    .enter().append("option")
    .attr("value", function(d) { return d; })
    .text(function(d) { return d; });

/* Create SVG Container & Group Element */
var chart = d3.select("#linechart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left * 1.5 + "," + margin.top / 1.5 + ")");

/* Add line to chart */
var line = d3.line()
            .x(function(d) { return x(d["Year"]); })
            .y(function(d) { return y(d[countries[0]]); });

var path = chart.append("path")
                .datum(data)
                .attr("fill", "none")   
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("d", line);     

console.log(data);

/* Append x and y axis */
chart.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)

chart.append("g")
    .call(yAxis)

var AxisTx = makeAxisTitle(chart, {
    "transform": 'translate(' + (width / 2) + ', ' + (height + margin.top) + ')',
    "text-anchor": "middle",
    "font-size": fontSize,
    "font-family": fontFamily,
    "title": xTitle
});

var AxisTy = makeAxisTitle(chart, {
    "transform": 'translate(' + -margin.left + ', ' + (height / 2) + ')rotate(-90)',
    "text-anchor": "middle",
    "font-size": fontSize,
    "font-family": fontFamily,
    "title": yTitle
});

/* Update line chart function */
var updateLineChart = function(region) {
    var chart = d3.select("#linechart");
    var line = d3.line()
                .x(function(d) { return x(d["Year"]); })
                .y(function(d) { return y(d[region]); });
    chart.select("path")
        .transition()
        .duration(600)
        .attr("d", line);
}
/* ----------------------- End Line Chart ----------------------- */