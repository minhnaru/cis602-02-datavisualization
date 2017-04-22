function getTotals(refugees) {
	var sum = refugees.map(function(object) {
		return Object.keys(object).reduce(function (sum, key) {
			return sum + (key !== 'Year' && object[key]);
		}, 0);
	});
	return sum;
}

var dataset = getTotals(refugees);

var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
var d = document.querySelector("#barchart");

s.setAttribute("width", 600);
s.setAttribute("height", 400);

d.appendChild(s);

function makeElt(svg, name, attrs) {
    var element = document.createElementNS("http://www.w3.org/2000/svg", name);
    if (attrs === undefined) attrs = {};
    for (var key in attrs) {
        element.setAttributeNS(null, key, attrs[key]);
    }
    svg.appendChild(element);
}

function makeLabel(svg, fontSize, x, y, text) {
    var label = document.createElementNS("http://www.w3.org/2000/svg", "text");

    label.setAttributeNS(null, "font-size", fontSize);
    label.setAttributeNS(null, "x", x);
    label.setAttributeNS(null, "y", y);

    var textNode = document.createTextNode(text);
    label.appendChild(textNode);
    svg.appendChild(label);
}

dataset.forEach(function(d, i) {
    var barHeight = d / 1000,
        barWidth = 12;
    // draw bars
    var bar = makeElt(s, "rect", {
        "x": i * barWidth + 40,
        "y": 400 - barHeight - 40,
        "width": barWidth,
        "height": barHeight,
        "id": "id-" + refugees[i]['Year'],
        "fill": "red"
    });
    // add label for years
    if (i == 0 || i == refugees.length - 1) {
        var label = makeLabel(s, 12, i * barWidth + 40, 400 - 24, refugees[i]['Year']);
    }
    if (i == Math.round(refugees.length / 2)) {
        var label = makeLabel(s, 12, i * barWidth + 40, 400 - 24, 'Year');
    }
    // add labels for refugees numbers
    var minRefs = 20000,
        maxRefs = 200000;
    if (minRefs * i == 0 || minRefs * i == maxRefs) {
        var refsNum = makeLabel(s, 12, 0, 400 - 40 - (minRefs / 1000 * i), minRefs * i);
    }
    if (minRefs * i == (maxRefs / 2)) {
        var refsNum = makeLabel(s, 12, 0, 400 - 40 - (minRefs / 1000 * i), "# Refs.");
    }
});

function highlightYear(year) {
	var bar = document.getElementById("id-" + year);
    // reset barchart
    refugees.map(function(object) {
	    var bar = document.getElementById("id-" + object['Year']);
		bar.setAttribute("fill", "red");
    });
    // highlight bar
	bar.setAttribute("fill", "blue");
}

