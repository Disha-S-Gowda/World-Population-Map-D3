# World Population Visualization Project

This project visualizes world population data on a map using D3.js, TopoJSON, and GeoJSON.

# D3.js Interactive World Map with Population Data

This project creates an interactive world map using D3.js, displaying population data by country. The map uses GeoJSON data from Natural Earth, which is converted to a lighter TopoJSON format. Population data is retrieved from `api.population.io`.

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

3. Create a `src` folder, then add your `50m.json`, `population.json`, and `map.js` files inside the `src` directory.

## Step 5: Create the Interactive Map with D3.js

1. In the map.js file, implement the following:
   
    - Set up the SVG container and configure zoom behavior.
    - Load and process the TopoJSON and population data.
    - Implement a color scale for population data.
    - Draw the map with country boundaries and color coding based on population.
    - Add interactivity, such as tooltips or hover effects to display population details.
    
2. Open `index.html` in a browser to view your interactive world map.


