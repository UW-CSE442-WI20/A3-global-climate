// select the svg and save width and height
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// specify map and projection
var projection = d3.geoMercator()
    .scale(100)
    .center([0,20])
    .translate([width / 2, height / 2]);

// create a geopath based on the chosen projection
var path = d3.geoPath().projection(projection);

// define data map (loaded in later) and color scale
var data = d3.map();
var colorScale = d3.scaleThreshold()
    .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
    .range(d3.schemeBlues[7]);

// Load external data and boot
d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    .defer(d3.csv, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv",            function(d) { data.set(d.code, +d.pop); }) // store mapping from Country Code -> Population
    .await(ready);

// topo is the geoJSON data
function ready(error, topo) {

  // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(topo.features) //set the data to be the world features
    .enter()
    .append("path")
        // use path to draw each country (based on specified features)
        .attr("d", path)
        // set the color of each country (d.id is country code)
        .attr("fill", function (d) {
            d.total = data.get(d.id) || 0;
            return colorScale(d.total);
        });
    }