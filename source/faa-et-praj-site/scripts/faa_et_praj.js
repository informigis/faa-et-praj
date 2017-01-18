require([
  "esri/map",
  "esri/dijit/Search",
  "dojo/domReady!"
], function (Map, Search) {
    var map = new Map("viewDiv", {
        basemap: "gray",
        container: "viewDiv",  // Reference to the scene div created in step 5
        zoom: 12,  // Sets the zoom level based on level of detail (LOD)
        center: [9.47, 55.5]  // Sets the center point of view in lon/lat
    });
    var search = new Search({
        map: map
    }, "search");
    search.startup();
});