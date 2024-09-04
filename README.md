# World Population Visualization Project

This project visualizes world population data on a map using D3.js, TopoJSON, and GeoJSON.

# D3.js Interactive World Map with Population Data

This project creates an interactive world map using D3.js, displaying population data by country. The map uses GeoJSON data from Natural Earth, which is converted to a lighter TopoJSON format. Population data is retrieved from `api.population.io`.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step 1: Download GeoJSON Data from Natural Earth](#step-1-download-geojson-data-from-natural-earth)
3. [Step 2: Convert GeoJSON to TopoJSON](#step-2-convert-geojson-to-topojson)
4. [Step 3: Download Population Data from api.population.io](#step-3-download-population-data-from-apipopulationio)
5. [Step 4: Set Up the Project](#step-4-set-up-the-project)
6. [Step 5: Create the Interactive Map with D3.js](#step-5-create-the-interactive-map-with-d3js)
7. [Conclusion](#conclusion)

## Prerequisites

- Basic knowledge of JavaScript and D3.js.
- Node.js installed on your machine for using npm packages.
- Familiarity with GitHub for version control.

## Step 1: Download GeoJSON Data from Natural Earth

1. Visit [Natural Earth](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/).
2. Download the `50m Cultural Vectors` dataset, which includes GeoJSON data for countries.
3. Unzip the downloaded file to your project directory.

## Step 2: Convert GeoJSON to TopoJSON

1. Install `topojson` CLI tools globally using npm:

    ```bash
    npm install -g topojson
    ```

2. Convert the downloaded GeoJSON data to a lighter TopoJSON format:

    ```bash
    topojson -o 50m.json --simplify-proportion 0.5 -- countries.geojson
    ```

   This command simplifies the GeoJSON file, making it more suitable for web use.

## Step 3: Download Population Data from api.population.io

1. Visit [api.population.io](http://api.population.io) to access global population data.
2. Download the relevant population data in JSON format and save it to the `src/data` directory in your project.

## Step 4: Set Up the Project

1. Create a new project directory and initialize a Git repository:

    ```bash
    mkdir d3-world-map
    cd d3-world-map
    git init
    ```

2. Create a basic `index.html` file and set up your project structure:

    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>World Population Map</title>
        <script src="https://d3js.org/d3.v6.min.js"></script>
        <script src="https://unpkg.com/topojson@3"></script>
        <style>
            .details {
                visibility: hidden;
            }
        </style>
    </head>
    <body>
        <div class="details">
            <p class="country"></p>
            <p class="females"></p>
            <p class="males"></p>
        </div>
        <script src="src/map.js"></script>
    </body>
    </html>
    ```

3. Create a `src` folder, then add your `50m.json`, `population.json`, and `map.js` files inside the `src` directory.

## Step 5: Create the Interactive Map with D3.js

1. Implement the D3.js code to create an interactive map in `map.js`:

    ```javascript
    // Set up the dimensions for the SVG container
    var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    var svgCanvas = d3.select("body")
        .append("svg")
        .style("cursor", "move");

    svgCanvas.attr("viewBox", "50 10 " + viewportWidth + " " + viewportHeight)
        .attr("preserveAspectRatio", "xMinYMin");

    var zoomBehavior = d3.zoom()
        .on("zoom", function () {
            var transform = d3.zoomTransform(this);
            mapGroup.attr("transform", transform);
        });

    svgCanvas.call(zoomBehavior);

    var mapGroup = svgCanvas.append("g")
        .attr("class", "map-group");

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
        var geoProjection = d3.geoMercator()
            .scale(130)
            .translate([viewportWidth / 2, viewportHeight / 1.5]);

        var geoPath = d3.geoPath().projection(geoProjection);

        var colorScale = d3.scaleThreshold()
            .domain([10000, 100000, 500000, 1000000, 5000000, 10000000, 50000000, 100000000, 500000000, 1500000000])
            .range(["#f7fcfd", "#e0ecf4", "#bfd3e6", "#9ebcda", "#8c96c6", "#8c6bb1", "#88419d", "#810f7c", "#4d004b"]);

        var countryFeatures = topojson.feature(worldData, worldData.objects.countries).features;
        var populationDataMap = {};

        populationData.forEach(function (record) {
            populationDataMap[record.country] = {
                total: +record.total,
                females: +record.females,
                males: +record.males
            };
        });

        countryFeatures.forEach(function (feature) {
            feature.populationDetails = populationDataMap[feature.properties.name] || {};
        });

        mapGroup.append("g")
            .selectAll("path")
            .data(countryFeatures)
            .enter().append("path")
            .attr("name", function (feature) {
                return feature.properties.name;
            })
            .attr("id", function (feature) {
                return feature.id;
            })
            .attr("d", geoPath)
            .style("fill", function (feature) {
                return feature.populationDetails && feature.populationDetails.total ? colorScale(feature.populationDetails.total) : undefined;
            })
            .on('mouseover', function (event, feature) {
                d3.select(this)
                    .style("stroke", "white")
                    .style("stroke-width", 1)
                    .style("cursor", "pointer");

                d3.select(".country")
                    .text(feature.properties.name);

                d3.select(".females")
                    .text(feature.populationDetails && feature.populationDetails.females ? "Female " + feature.populationDetails.females : "¯\\_(ツ)_/¯");

                d3.select(".males")
                    .text(feature.populationDetails && feature.populationDetails.males ? "Male " + feature.populationDetails.males : "¯\\_(ツ)_/¯");

                d3.select('.details')
                    .style('visibility', "visible");
            })
            .on('mouseout', function (event, feature) {
                d3.select(this)
                    .style("stroke", null)
                    .style("stroke-width", 0.25);

                d3.select('.details')
                    .style('visibility', "hidden");
            });
    }
    ```

2. Open `index.html` in a browser to view your interactive world map.


