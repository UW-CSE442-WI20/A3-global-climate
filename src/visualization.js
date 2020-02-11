var testing_temp;


(function () {
  var margin = { top: 10, left: 10, right: 10, bottom: 10 },
      height = 600 - margin.top - margin.bottom,
      width  = 960 - margin.left - margin.right;

  // The svg
  var svg = d3.select("#map-root")
        .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right);

 // specify map and projection
  var projection = d3.geoNaturalEarth()
      .scale(width / 2 / Math.PI)
      .translate([width / 2, height / 2])
// create a geopath based on the chosen projection
  var path = d3.geoPath()
      .projection(projection);

// define data map (loaded in later) and color scale
  var data = d3.map();
  var colorScheme = d3.schemeReds[6];
  colorScheme.unshift("#eee")
  var colorScale = d3.scaleThreshold()
      .domain([1, 6, 11, 26, 101, 1001])
      .range(colorScheme);

  // Legend
  var g = svg.append("g")
      .attr("class", "legendThreshold")
      .attr("transform", "translate(20,20)");
  g.append("text")
      .attr("class", "caption")
      .attr("x", 0)
      .attr("y", -6)
      .text("Legend Title");
  var labels = ['0', '1-5', '6-10', '11-25', '26-100', '101-1000', '> 1000'];
  var legend = d3.legendColor()
      .labels(function (d) { return labels[d.i]; })
      .shapePadding(4)
      .scale(colorScale);
  svg.select(".legendThreshold")
      .call(legend);

  // Load external data and boot
  // geojson topology: http://enjalot.github.io/wwsd/data/world/world-110m.geojson
  d3.queue()
      .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
      .defer(d3.csv, "data/countries.csv", function(d) { 
        // console.log(d)
        data.set(d.code, +d.total); })
      .await(ready);

  function ready(error, topo) {
      if (error) throw error;

      // Draw the map
      svg.append("g")
          .attr("class", "countries")
          .selectAll("path")
          .data(topo.features)
          .enter().append("path")
              .attr("fill", function (d){
                  // Pull data for this country
                  d.total = data.get(d.id) || 0;
                  // Set the color
                  return colorScale(d.total);
              })
              .attr("d", path);
  }
})();

(function () {
  // set the dimensions and margins of the graph
  var margin = {top: 50, right: 50, bottom: 50, left: 50},
      height = 300 - margin.top - margin.bottom,
      width  = 960 - margin.left - margin.right;

  // append the svg object to the body of the page
  var svg = d3.select("#chart-root")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  // Read the data
  d3.csv("/data/TAVG-by-country/AGO-TAVG.csv",
    // When reading the csv, I must format variables:
    function(d){ 
      return {
        year : +d.year,
        yr1_temp : +d.yr1_temp, yr1_unc : +d.yr1_unc,
        yr5_temp : +d.yr5_temp, yr5_unc : +d.yr5_unc,
        yr10_temp : +d.yr10_temp, yr10_unc : +d.yr10_unc,
        yr20_temp : +d.yr20_temp, yr20_unc : +d.yr20_unc
      }
    },

    // Now I can use this dataset:
    function(data) {
      //var formatxAxis = d3.format('.0f');
      // console.log(data);
      // Add X axis --> it is a date format
      var x = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { 
          // console.log(parseInt(d.year.toString().replace(/\,/g,'')));
          // var a = d.year.toString();
          console.log(+d.year);
          return +d.year; }))
        .range([ 0, width ]);
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.format("d")))
        ;

      // Add Y axis
      var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return +d.yr1_temp; })])
        .range([ height, 0 ]);
      svg.append("g")
        .call(d3.axisLeft(y));

      // Add the line
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .defined((d) => d.yr1_temp != undefined)
          .x(function(d) { return x(+d.year) })
          .y(function(d) { return y(+d.yr1_temp) })
      )
    });
})();

(function () {
    var dataTime = d3.range(0, 10).map(function(d) {
        return new Date(1995 + d, 10, 3);
    });

    var sliderTime = d3
        .sliderBottom()
        .min(d3.min(dataTime))
        .max(d3.max(dataTime))
        .step(1000 * 60 * 60 * 24 * 365)
        .width(875)
        .tickFormat(d3.timeFormat('%Y'))
        .tickValues(dataTime)
        .default(new Date(1998, 10, 3))
    // .on('onchange', val => {
    //   d3.select('p#value-time').text(d3.timeFormat('%Y')(val));
    // });

    var gTime = d3
        .select('div#slider-time')
        .append('svg')
        .attr('width', 1000)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gTime.call(sliderTime);

    // d3.select('p#value-time').text(d3.timeFormat('%Y')(sliderTime.value()));
})();