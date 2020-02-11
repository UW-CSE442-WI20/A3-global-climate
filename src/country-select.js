//generate dropdown menu
const ccodeData = require('./data/country_codes.csv')
d3.csv(ccodeData, function(data) {
    var selector = d3.select("select")
        .attr("id", "country-dropdown")
        .selectAll("option")
        .data(data)
        .enter().append("option")
        .text(function(d) { return d.name; })
        .attr("value", function (d, i) {
            return i;
	});
})
