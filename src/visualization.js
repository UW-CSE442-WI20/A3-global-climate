// ***************************
// **     CHOROPLETH        **
// ***************************
function choropleth() {
    var margin = { top: 10, left: 10, right: 10, bottom: 10 },
        height = 600 - margin.top - margin.bottom,
        width = 960 - margin.left - margin.right;

    // The svg
    var svg = d3.select("#map-root")
        .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right);

    var tooltip = d3.select('body')
        .append("div")
        .attr("class", "tooltip");

    //-36.3 to 30.3
    // Set color scale
    var colorScale = d3.scaleLinear().domain([-36.3, 0, 30.3]).range(['#2c7fb8', 'white', '#de2d26']);

    // Use color scale and undefined color to get color based on value
    function getColor(val) {
        if (val == undefined || val == "") {
            return "black"
        } else {
            return colorScale(val);
        }
    }

    // specify map and projection
    var projection = d3.geoNaturalEarth()
        .scale(width / 2 / Math.PI)
        .translate([width / 2, height / 2])
    // create a geopath based on the chosen projection
    var path = d3.geoPath()
        .projection(projection);

    // define data map (loaded in later) and color scale
    var data = d3.map();

    // Legend
    var g = svg.append("g")
        .attr("class", "legendThreshold")
        .attr("transform", "translate(20,20)");
    g.append("text")
        .attr("class", "caption")
        .attr("x", 0)
        .attr("y", -6)
        .text("Temperature Celsius");
    var legend = d3.legendColor()
        .cells(8)
        .shapeHeight(20)
        .shapePadding(0)
        .scale(colorScale);
    svg.select(".legendThreshold")
        .call(legend);

    const geoData = require("./data/world-110m.geojson")
    const tavgData = require("./data/TAVG-all.csv")

    // Load external data and boot
    // geojson topology: http://enjalot.github.io/wwsd/data/world/world-110m.geojson
    d3.queue()
        .defer(d3.json, geoData)
        .defer(d3.csv, tavgData, function (d) {
            if (!data.has(d.code)) {
                data.set(d.code, new Object());
            }
            var dict = data.get(d.code);
            dict.name = d.name;
            dict[d.year] = d["yr1_temp"]
        })
        .await(ready);

    function ready(error, topo) {
        if (error) throw error;

        // Draw the map
        svg.append("g")
            .attr("class", "countries")
            .selectAll("path")
            .data(topo.features)
            .enter().append("path")
                .attr("id", "country-path")
                .attr("fill", function (d) {
                    // Pull data for this country
                    d.years = data.get(d.id);
                    if (!d.years) {
                        d.years = {};
                    }
                    d.cur_year = 2000;
                    // Set the color
                    return getColor(d.years[d.cur_year]);
                })
                .attr("d", path)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseout", mouseout);
    }

    // show tooltip and highlight country
    function mouseover(d) {
        tooltip
            .style("display", "inline")
            .text("Country: " + d.id + ", Temp: " + d.years[d.cur_year]);
        d3.select(this)
            .style("opacity", .5)
    }

    //update location to follow cursor
    function mousemove() {
        tooltip
            .style("left", (d3.event.pageX - 20) + "px")
            .style("top", (d3.event.pageY - 12) + "px");
    }

    //un-highlight country and hide tooltip
    function mouseout() {
        tooltip.style("display", "none");
        d3.select(this)
            .style("opacity", 1)
    }

    // Change the year
    function changeYear(year) {
        d3.selectAll("path#country-path")
            .attr("fill", (d) => {
                d.cur_year = year;
                console.log(d);
                return getColor(d.years[year]);
            })
    }

    return {
        changeYear: changeYear
    }
}

var map = choropleth();


// **************************
// **     LINE CHART       **
// **************************
(function () {
    // set the dimensions and margins of the graph
    var margin = { top: 50, right: 50, bottom: 50, left: 50 },
        height = 300 - margin.top - margin.bottom,
        width = 960 - margin.left - margin.right;

    // append the svg object to the body of the page
    var svg = d3.select("#chart-root")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    //Read the data
    d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/3_TwoNumOrdered_comma.csv",

        // When reading the csv, I must format variables:
        function (d) {
            return { date: d3.timeParse("%Y-%m-%d")(d.date), value: d.value }
        },

        // Now I can use this dataset:
        function (data) {

            // Add X axis --> it is a date format
            var x = d3.scaleTime()
                .domain(d3.extent(data, function (d) { return d.date; }))
                .range([0, width]);
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));

            // Add Y axis
            var y = d3.scaleLinear()
                .domain([0, d3.max(data, function (d) { return +d.value; })])
                .range([height, 0]);
            svg.append("g")
                .call(d3.axisLeft(y));

            // Add the line
            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function (d) { return x(d.date) })
                    .y(function (d) { return y(d.value) })
                )
        });
})();


// **************************
// ** SLIDER AND DROPDOWN  **
// **************************
(function () {

    var current = new Date(1744, 10, 3);;
    var target = new Date(2013, 10, 3);
    var playButton = d3.select("#play-button");

    var dataTime = d3.range(0, 270).map(function(d) {
        return new Date(1744 + d, 10, 3);
    });

    var sliderTime = d3
        .sliderBottom()
        .min(d3.min(dataTime))
        .max(d3.max(dataTime))
        .step(1000 * 60 * 60 * 24 * 365)
        .width(765)
        .tickFormat(d3.timeFormat('%Y'))
        .default(new Date(1860, 10, 3))
        .on('onchange', val => {
            current = val;
             d3.select('p#value-time').text("Year: "+d3.timeFormat('%Y')(val));
             map.changeYear(d3.timeFormat('%Y')(val));
        });

    var gTime = d3
        .select('div#slider-time')
        .append('svg')
        .attr('width', 1000)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gTime.call(sliderTime);

    playButton.on("click", function() {
        var button = d3.select(this);
        if (button.text() == "Pause") {
            clearInterval(timer);
            button.text("Play");
        } else {
            timer = setInterval(step, 100);
            button.text("Pause");
        }
    });

    function step(){
        current = sliderTime.value().setFullYear(sliderTime.value().getFullYear() + 1);
        sliderTime.value(current);
        if(sliderTime.value().getTime() > target.getTime()){
            clearInterval(timer);
            playButton.text("Play");
        }
    }

    d3.select('p#value-time').text("Year: "+d3.timeFormat('%Y')(sliderTime.value())).attr("align", "center");
}) ();
