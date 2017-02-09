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
  "dojo/parser",
  "dojo/ready",
  "esri/symbols/SimpleFillSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/Color",
  //"dojo/domReady!"
], function (esriConfig, Map, Search, WMSLayer, FeatureLayer, FeatureTable, WMTSLayer, SpatialReference, Extent, Query, QueryTask, dom, on, domConstruct, arrayUtil, parser, ready, SimpleFillSymbol, SimpleLineSymbol, Color) {
    // TODO: general url-encoding of parameters.
    esriConfig.defaults.io.corsEnabledServers.push({
        host: "https://kortforsyningen.kms.dk",
        withCredentials: true
    });
    esriConfig.defaults.io.corsEnabledServers.push("https://gis.kolding.dk");
    esriConfig.defaults.io.corsEnabledServers.push("https://informigis.github.io");

    var sagUrl = "https://gis.kolding.dk/arcgis/rest/services/PublicAndreForvaltninger/Borger_Abonnement_test/FeatureServer/0";
    var borgerAbbUrl = "https://gis.kolding.dk/arcgis/rest/services/PublicAndreForvaltninger/Borger_Abonnement_test/FeatureServer/1";
    var temaSagUrl = "https://gis.kolding.dk/arcgis/rest/services/PublicAndreForvaltninger/Borger_Abonnement_test/FeatureServer/2";



    parser.parse();

    ready(function () {
        function addListener(element, eventHandlerFunction, eventType) {
            var htmlElement = document.getElementById(element);
            if (htmlElement.addEventListener) {
                htmlElement.addEventListener(eventType, eventHandlerFunction, false);
            } else if (htmlElement.attachEvent) {
                htmlElement.attachEvent("on" + eventType, eventHandlerFunction);
            }
        }

        var map = new Map("viewDiv", {
            basemap: "gray",
            container: "viewDiv",  // Reference to the scene div created in step 5
            zoom: 12,  // Sets the zoom level based on level of detail (LOD)
            center: [9.47, 55.5],  // Sets the center point of view in lon/lat
            logo: false,
            showAttribution: false
        });

        var myFeatureLayer = new FeatureLayer(sagUrl, {
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ["TITEL"],
            visible: true,
            id: "fLayer"
        });

        var selectionSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
            new Color([255, 0, 0, 0.35]), 1),
            new Color([255, 0, 0, 0.35]));
        myFeatureLayer.setSelectionSymbol(selectionSymbol);


        myFeatureLayer.on("click", function (evt) {
            var idProperty = myFeatureLayer.objectIdField;
            var feature, featureId, query;

            if (evt.graphic && evt.graphic.attributes && evt.graphic.attributes[idProperty]) {
                feature = evt.graphic,
                featureId = feature.attributes[idProperty];

                query = new Query();
                query.returnGeometry = false;
                query.objectIds = [featureId];
                query.where = "1=1";

                myFeatureLayer.selectFeatures(query, FeatureLayer.SELECTION_NEW);
            }
        });

        var myTable = new FeatureTable({
            map: map,
            featureLayer: myFeatureLayer,
            showGridMenu: false,
            hiddenFields: ["OBJECTID"],
            showFeatureCount: false,
            showAttachments: true,
            showColumnHeaderTooltips: false,
            zoomToSelection: false,
            showGridHeader: false,
            syncSelection: true
            //showRelatedRecords: true
        }, "myTableNode");

        function updatefeatureTable(featureSet) {
            var data = featureSet;
            if (!data) {
                data = [0];
            }
            myTable.filterRecordsByIds(data); 
        }

        function whenExtentChanges() {
            var queryIdsInView = new Query();
            queryIdsInView.geometry = map.extent;
            queryIdsInView.where = "1=1";
            var queryTaskIdsInView = new QueryTask(sagUrl);
            queryTaskIdsInView.executeForIds(queryIdsInView, updatefeatureTable);
        }

        var search = new Search({
            map: map
        }, "search");
        search.startup();
        myTable.startup();

        map.addLayer(myFeatureLayer);

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

            document.getElementById("featureTableContainer").style.display = "none";
            document.getElementById("showBorgerAbb").style.display = "none";
            document.getElementById("labelForShowBorgerAbb").style.display = "none";
            document.getElementById("borgerAbbSection").style.display = "block";
            
            
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


        addListener("deletePraj", deletePraj, "click");
        //on(document.getElementById("deletePraj"), "click", deletePraj);
        addListener("createPraj", createPraj, "click");
        //on(document.getElementById("createPraj"), "click", createPraj);
        addListener("updatePraj", updatePraj, "click");
        //        on(document.getElementById("createPraj"), "click", createPraj);
        on(map, "extent-change", whenExtentChanges);
    });
});