require([
  "esri/config",
  "esri/map",
  "esri/dijit/Search",
  "esri/layers/WMSLayer",
  "esri/layers/FeatureLayer",
  "esri/dijit/FeatureTable",
  "esri/layers/WMTSLayer",
  "esri/SpatialReference",
  "esri/geometry/Extent",
  "esri/tasks/query",
  "esri/tasks/QueryTask",
  "dojo/dom",
  "dojo/on",
  "dojo/dom-construct",
  "dojo/_base/array",
  "dojo/domReady!"
], function (esriConfig, Map, Search, WMSLayer, FeatureLayer, FeatureTable, WMTSLayer, SpatialReference, Extent, Query, QueryTask, dom, on, domConstruct, arrayUtil) {
    // TODO: general url-encoding of parameters.
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
    var sag = new FeatureLayer("http://gis.kolding.dk/arcgis/rest/services/PublicAndreForvaltninger/Borger_Abonnement_test/FeatureServer/0");
    var borger_abonnement = new FeatureLayer("http://gis.kolding.dk/arcgis/rest/services/PublicAndreForvaltninger/Borger_Abonnement_test/FeatureServer/1");
    var temaBorgerAbonnement = new FeatureTable("http://gis.kolding.dk/arcgis/rest/services/PublicAndreForvaltninger/Borger_Abonnement_test/FeatureServer/2");
    var temaSag = new FeatureTable("http://gis.kolding.dk/arcgis/rest/services/PublicAndreForvaltninger/Borger_Abonnement_test/FeatureServer/2");

    //map.addLayer(wmsLayer);
    //map.addLayer(featureLayer);
    var search = new Search({
        map: map
    }, "search");
    search.startup();



    function getSelectedMainCategoriesAsSubtypes() {
        var byggeri_og_bolig = document.getElementById("byggeri_og_bolig").checked;
        var erhverv_byggeri = document.getElementById("erhverv_byggeri").checked;
        var planer_og_strategier = document.getElementById("planer_og_strategier").checked;
        var veje_fortove_og_groenne_omraader = document.getElementById("veje_fortove_og_groenne_omraader").checked;
        var miljoe_natur_og_klima = document.getElementById("miljoe_natur_og_klima").checked;

        var mainCategories = [
            { subtypeId: 1, selected: byggeri_og_bolig },
            { subtypeId: 2, selected: planer_og_strategier },
            { subtypeId: 3, selected: miljoe_natur_og_klima },
            { subtypeId: 4, selected: veje_fortove_og_groenne_omraader },
            { subtypeId: 6, selected: erhverv_byggeri }];
        return mainCategories;
    }

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
        document.getElementById("updatePraj").style.display = "block";
        document.getElementById("createPraj").style.display = "none";
        //updateElementValue("createPraj", "Gem ændringer");
        document.getElementById("byggeri_og_bolig").checked = (QueryString.byggeri_og_bolig === "true");
        document.getElementById("erhverv_byggeri").checked = (QueryString.erhverv_byggeri === "true");
        document.getElementById("planer_og_strategier").checked = (QueryString.planer_og_strategier === "true");
        document.getElementById("veje_fortove_og_groenne_omraader").checked = (QueryString.veje_fortove_og_groenne_omraader === "true");
        document.getElementById("miljoe_natur_og_klima").checked = (QueryString.miljoe_natur_og_klima === "true");
        var extent1 = Extent(parseFloat(QueryString.xmin), parseFloat(QueryString.ymin), parseFloat(QueryString.xmax), parseFloat(QueryString.ymax), new SpatialReference(parseInt(QueryString.spatialRefWkid)));
        map.setExtent(extent1);
    }

    function deletePraj(e) {
        console.log("Hello deletepraj!");
        // get ids
        var name = document.getElementById("name").value;
        var email = document.getElementById("email").value;
        var phone = document.getElementById("phone").value;

        document.getElementById("userMessage").textContent = "Praj slettet.";

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
        var xmin = extent.xmin;
        var ymin = extent.ymin;
        var xmax = extent.xmax;
        var ymax = extent.ymax;
        var spatialRefWkid = extent.spatialReference.wkid;

        // Save to service
        // Error handling
        // Create URL
        var tema = "&byggeri_og_bolig=" + byggeri_og_bolig + "&erhverv_byggeri=" + erhverv_byggeri + "&planer_og_strategier=" + planer_og_strategier + "&veje_fortove_og_groenne_omraader=" + veje_fortove_og_groenne_omraader + "&miljoe_natur_og_klima=" + miljoe_natur_og_klima;
        var spatrefUrl = "&xmin=" + xmin + "&ymin=" + ymin + "&xmax=" + xmax + "&ymax=" + ymax + "&spatialRefWkid=" + spatialRefWkid;
        var searchPartOfUrl = "?navn=" + name + "&email=" + email + "&mobileNumber=" + phone + tema;
        var locationPathname = location.pathname;
        if (QueryString.parentContainer) {
            locationPathname = QueryString.parentContainer;
        }
        var refUrl = window.location.protocol + "//" + window.location.host + locationPathname + searchPartOfUrl + spatrefUrl;
        document.getElementById("prajLink").text = refUrl;
        document.getElementById("prajLink").href = refUrl;
        // Update message
        document.getElementById("userMessage").textContent = "Praj oprettet.";
    }

    function updatePraj() {
        createPraj();
        document.getElementById("userMessage").textContent = "Praj opdateret.";
        // update in database.
    }

    var queryTask = new QueryTask("http://gis.kolding.dk/arcgis/rest/services/PublicAndreForvaltninger/Borger_Abonnement_test/MapServer/0");

    var query = new Query();
    query.returnGeometry = false;
    query.outFields = ["TITEL"];
    query.geometry = map.extent;
    query.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;

    function showResults(results) {
        var resultItems = [];
        var resultCount = results.features.length;
        for (var i = 0; i < resultCount; i++) {
            var featureAttributes = results.features[i].attributes;
            for (var attr in featureAttributes) {
                resultItems.push("<b>" + attr + ":</b>  " + featureAttributes[attr] + "<br>");
            }
            resultItems.push("<br>");
        }
        dom.byId("info").innerHTML = resultItems.join("");
    }

    function execute() {
        query.where = "1=1";
        query.geometry = map.extent;
        queryTask.execute(query, showResults);
    }

    function getPlans() {
        console.info("Getting plans...");
        // get main categories
        var mainCategories = getSelectedMainCategoriesAsSubtypes();
        console.log(mainCategories);
        // get search geometry


        // search (set time, show "Titel")

        // include main catogories from user i search

        // getResults

        // present results





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
    addListener("updatePraj", updatePraj, "click");
    //addListener("getPlans", getPlans, "click");
    addListener("getPlans", execute, "click");
    //on(dom.byId("getPlans"), "click", execute);
});