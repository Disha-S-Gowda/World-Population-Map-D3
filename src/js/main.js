// Setting up the dimensions for the SVG container
var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
    viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

// Creating SVG element inside body
var svgCanvas = d3.select("body")
    .append("svg")
    .style("cursor", "move"); //Enabling cursor to move

svgCanvas.attr("viewBox", "50 10 " + viewportWidth + " " + viewportHeight)
    .attr("preserveAspectRatio", "xMinYMin");

// Adding a zoom behavior 
var zoomBehavior = d3.zoom()
    .on("zoom", function () {
        var transform = d3.zoomTransform(this);
        mapGroup.attr("transform", transform); 
    });

// Applying zoom behavior to SVG
svgCanvas.call(zoomBehavior);

// Creating group element to hold the map
var mapGroup = svgCanvas.append("g")
    .attr("class", "map-group");

// Loading the GeoJSON and population data 
d3.queue()
    .defer(d3.json, "src/data/50m.json") 
    .defer(d3.json, "src/data/population.json") 
    .await(function (error, worldData, populationData) {
        if (error) {
            console.error('Error loading data: ' + error); 
        } else {
            renderMap(worldData, populationData); 
        }
    });


function renderMap(worldData, populationData) {
    // Set up the geographical projection for the map (Mercator projection in this case)
    var geoProjection = d3.geoMercator()
        .scale(130) // This scales the map to fit within the SVG container
        .translate([viewportWidth / 2, viewportHeight / 1.5]); 

    
    var geoPath = d3.geoPath().projection(geoProjection);

    // Defining a color scale 
    var colorScale = d3.scaleThreshold()
        .domain([10000, 100000, 500000, 1000000, 5000000, 10000000, 50000000, 100000000, 500000000, 1500000000])
        .range(["#f7fcfd", "#e0ecf4", "#bfd3e6", "#9ebcda", "#8c96c6", "#8c6bb1", "#88419d", "#810f7c", "#4d004b"]);

    // Converting the TopoJSON data into GeoJSON features for each country
    var countryFeatures = topojson.feature(worldData, worldData.objects.countries).features;
    var populationDataMap = {};

    // Mapping the population data to each country based on its name
    populationData.forEach(function (record) {
        populationDataMap[record.country] = {
            total: +record.total, 
            females: +record.females, 
            males: +record.males 
        };
    });

    // Assign the population data to each country feature
    countryFeatures.forEach(function (feature) {
        feature.populationDetails = populationDataMap[feature.properties.name] || {}; // If no data, assign an empty object
    });

    // Appendding 'g' element to the map group and create a path for each country feature
    mapGroup.append("g")
        .selectAll("path")
        .data(countryFeatures) // Bind the GeoJSON features to the path elements
        .enter().append("path")
        .attr("name", function (feature) {
            return feature.properties.name; // Setting the 'name' attribute to the country's name
        })
        .attr("id", function (feature) {
            return feature.id; // Setting 'id' attribute to the country's ID
        })
        .attr("d", geoPath) 
        .style("fill", function (feature) {
            return feature.populationDetails && feature.populationDetails.total ? colorScale(feature.populationDetails.total) : undefined; // Color the country based on its population
        })
        .on('mouseover', function (event, feature) { //Showing Population Detail on mouseover
            d3.select(this)
                .style("stroke", "white") 
                .style("stroke-width", 1) 
                .style("cursor", "pointer"); 

            d3.select(".country")
                .text(feature.properties.name); // Display the country's name in a specified element

            d3.select(".females")
                .text(feature.populationDetails && feature.populationDetails.females ? "Female " + feature.populationDetails.females : "¯\\_(ツ)_/¯"); // Display female population or a shrug emoji if data is unavailable

            d3.select(".males")
                .text(feature.populationDetails && feature.populationDetails.males ? "Male " + feature.populationDetails.males : "¯\\_(ツ)_/¯"); // Display male population or a shrug emoji if data is unavailable

            d3.select('.details')
                .style('visibility', "visible"); 
        })
        .on('mouseout', function (event, feature) {
            d3.select(this)
                .style("stroke", null) // Removing  stroke on mouseout
                .style("stroke-width", 0.25); // Resetting the stroke width

            d3.select('.details')
                .style('visibility', "hidden"); // Hiding the details section on mouseout
        });
}
