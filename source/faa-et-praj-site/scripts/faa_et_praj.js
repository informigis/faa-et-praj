require([
  "esri/config",
  "esri/map",
  "esri/dijit/Search",
  "esri/layers/WMSLayer",
  "esri/layers/FeatureLayer",
  "esri/layers/WMTSLayer",
  "dojo/domReady!"
], function (esriConfig, Map, Search, WMSLayer, FeatureLayer, WMTSLayer) {
    esriConfig.defaults.io.corsEnabledServers.push({
        host: "http://kortforsyningen.kms.dk",
        withCredentials: true
    });
    esriConfig.defaults.io.corsEnabledServers.push("http://gis.kolding.dk");
    //esriConfig.defaults.io.corsEnabledServers.push("http://localhost:37831");

    //http://localhost:37831

    var map = new Map("viewDiv", {
        basemap: "gray",
        container: "viewDiv",  // Reference to the scene div created in step 5
        zoom: 12,  // Sets the zoom level based on level of detail (LOD)
        center: [9.47, 55.5]  // Sets the center point of view in lon/lat
    });
    var wmsLayer = new WMSLayer('http://kortforsyningen.kms.dk/service?request=GetCapabilities&version=1.1.1&login=Kommune621&password=Qwertyu10&servicename=topo_skaermkort&service=WMS');
    var wmtsLayer = new WMTSLayer('http://kortforsyningen.kms.dk/?servicename=topo_skaermkort_daempet&client=arcGIS&request=GetCapabilities&service=WMTS&acceptversions=1.0.0&login=Kommune621&password=Qwertyu10', {
    });
    var featureLayer = new FeatureLayer("http://gis.kolding.dk/arcgis/rest/services/PublicPlanByg/Lokalplaner/MapServer/0");
    //map.addLayer(wmsLayer);
    //map.addLayer(featureLayer);
    var search = new Search({
        map: map
    }, "search");
    search.startup();
});