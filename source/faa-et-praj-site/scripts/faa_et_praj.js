﻿require([
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
    /*var wmsLayer = new WMSLayer('http://kortforsyningen.kms.dk/service?request=GetCapabilities&version=1.1.1&login=Kommune621&password=Qwertyu10&servicename=topo_skaermkort&service=WMS');
    var wmtsLayer = new WMTSLayer('http://kortforsyningen.kms.dk/?servicename=topo_skaermkort_daempet&client=arcGIS&request=GetCapabilities&service=WMTS&acceptversions=1.0.0&login=Kommune621&password=Qwertyu10', {
    });*/
    var featureLayer = new FeatureLayer("http://gis.kolding.dk/arcgis/rest/services/PublicPlanByg/Lokalplaner/MapServer/0");
    //map.addLayer(wmsLayer);
    //map.addLayer(featureLayer);
    var search = new Search({
        map: map
    }, "search");
    search.startup();

    function updateElementValue(elementId, value) {
        if (value) {
            document.getElementById(elementId).value = value;
        }
    }

    updateElementValue("name", QueryString.navn);
    updateElementValue("email", QueryString.email);
    updateElementValue("phone", QueryString.mobileNumber);

    if (QueryString.email && QueryString.mobileNumber) {
        document.getElementById("deletePraj").style.display = "block";
        updateElementValue("createPraj", "Gem ændringer");
    }

    function deletePraj(e) {
        console.log("Hello deletepraj!");
        // get ids
        var name = document.getElementById("name").value;
        var email = document.getElementById("email").value;
        var phone = document.getElementById("phone").value;


        // delete in database
    }

    function createPraj() {
        console.log("Hello createPraj!");
        // get data 
        var name = document.getElementById("name").value;
        var email = document.getElementById("email").value;
        var phone = document.getElementById("phone").value;
        // get [emner]
        var byggeri_og_bolig = document.getElementById("byggeri_og_bolig").checked;
        var erhverv_byggeri = document.getElementById("erhverv_byggeri").checked;
        var planer_og_strategier = document.getElementById("planer_og_strategier").checked;
        var veje_fortove_og_groenne_omraader = document.getElementById("veje_fortove_og_groenne_omraader").checked;
        var miljoe_natur_og_klima = document.getElementById("miljoe_natur_og_klima").checked;
            // get map extent
        var extent = map.extent;

        // Save to service
        // Error handling
        // Create URL
        var refUrl = window.location.protocol + "//" + window.location.host + location.pathname + "?navn=" + name + "&email=" + email + "&mobileNumber=" + phone;
        document.getElementById("prajLink").text = refUrl;
        document.getElementById("prajLink").href = refUrl;
        // Update message
        document.getElementById("userMessage").textContent = "Praj oprettet.";
    }

    function updatePraj() {

    }

    function addListener(element, eventHandlerFunction, eventType) {
        var deletePrajElement = document.getElementById(element);
        if (deletePrajElement.addEventListener) {
            deletePrajElement.addEventListener(eventType, eventHandlerFunction, false);
        } else if (deletePrajElement.attachEvent) {
            deletePrajElement.attachEvent("on" + eventType, eventHandlerFunction);
        }
    }

    addListener("deletePraj", deletePraj, "click");
    addListener("createPraj", createPraj, "click");
    //addEventListener(updatePraj.name, updatePraj, "click");

    /*var deletePrajElement = document.getElementById("deletePraj");
    deletePrajElement.addEventListener("click", deletePraj, false); */
});