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
  "esri/graphic",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/InfoTemplate",
  "esri/geometry/Polygon"
  //"dojo/domReady!"
], function (esriConfig, Map, Search, WMSLayer, FeatureLayer, FeatureTable, WMTSLayer, SpatialReference, Extent, Query, QueryTask, dom, on, domConstruct, arrayUtil, parser, ready, SimpleFillSymbol, SimpleLineSymbol, Color, Graphic, SimpleMarkerSymbol, InfoTemplate, Polygon) {
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

        var borgerAbbFeatureLayer = new FeatureLayer(borgerAbbUrl, {

        });

        var sagFeatureLayer = new FeatureLayer(sagUrl, {
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ["TITEL"],
            visible: true,
            id: "fLayer"
        });

        var temaSagLayer = new FeatureLayer(temaSagUrl);

        var selectionSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
            new Color([255, 0, 0, 0.35]), 1),
            new Color([255, 0, 0, 0.35]));
        sagFeatureLayer.setSelectionSymbol(selectionSymbol);


        sagFeatureLayer.on("click", function (evt) {
            var idProperty = sagFeatureLayer.objectIdField;
            var feature, featureId, query;

            if (evt.graphic && evt.graphic.attributes && evt.graphic.attributes[idProperty]) {
                feature = evt.graphic,
                featureId = feature.attributes[idProperty];

                query = new Query();
                query.returnGeometry = false;
                query.objectIds = [featureId];
                query.where = "1=1";

                sagFeatureLayer.selectFeatures(query, FeatureLayer.SELECTION_NEW);
            }
        });

        var myTable = new FeatureTable({
            map: map,
            featureLayer: sagFeatureLayer,
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

        map.addLayer(sagFeatureLayer);

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

        function setUserMessage(message) {
            if (message) {
                document.getElementById("userMessage").textContent = message;
            }
        }

        function succesResult(data) {
            console.info(data);
        }

        function failureResult(data) {
            console.error(data);
        }

        function createRelatedInDbWithGlobalId(data) {
            var globalId = data.features[0].attributes.GlobalID;
            
            var graphic1 = new Graphic(null, null, { "HOVEDKATEGORI": 1, "AKTIV": 1, "BOGERABBID": globalId }, null);
            var graphic2 = new Graphic(null, null, { "HOVEDKATEGORI": 2, "AKTIV": 1, "BOGERABBID": globalId }, null);
            var graphic3 = new Graphic(null, null, { "HOVEDKATEGORI": 3, "AKTIV": 1, "BOGERABBID": globalId }, null);
            var graphic4 = new Graphic(null, null, { "HOVEDKATEGORI": 4, "AKTIV": 1, "BOGERABBID": globalId }, null);
            var graphic5 = new Graphic(null, null, { "HOVEDKATEGORI": 6, "AKTIV": 1, "BOGERABBID": globalId }, null);

            var relatedTable = [graphic1, graphic2, graphic3, graphic4, graphic5];
            temaSagLayer.applyEdits(relatedTable, null, null, succesResult, failureResult);
            setUserMessage("Praj oprettet.");
        }

        function createRelatedInDb(featureEditResults) {
            var featureEditResult = featureEditResults[0];
            var queryTask = new QueryTask(borgerAbbUrl);
            var query = new Query();
            query.objectIds = [featureEditResult.objectId];
            query.outFields = ["GlobalID"];
            queryTask.execute(query, createRelatedInDbWithGlobalId);

        }

        function createPrajInDb(geometry, email, navn, telefonnummer) {
            var polygon = Polygon.fromExtent(geometry);
            var graphic = new Graphic(polygon, null, { "E_MAIL": email, "NAVN": navn, "TELEFONUMMER": telefonnummer }, null);
            var praj = [graphic];
            borgerAbbFeatureLayer.applyEdits(praj, null, null, createRelatedInDb);

        }

        function deleteRelatedInDbWithGlobalId2(data) {
            var graphics = [];
            for (var id = 0; id < data; id++) {
                graphics.push(new Graphic(null, null, { "OBJECTID": id }));
            }

            temaSagLayer.applyEdits(null, null, graphics, function() { console.info("relatedDeleted") });

        }

        function deleteRelatedInDbWithGlobalId(data)
        {
            var globalId = data.features[0].attributes.GlobalID;
            var queryTask = new QueryTask(temaSagUrl);
            var query = new Query();
            query.where = "GlobalID=" + globalId;
            queryTask.executeForIds(query, deleteRelatedInDbWithGlobalId2);
        }



        function deletePrajInDb(objectId) {
            var queryTask = new QueryTask(borgerAbbUrl);
            var query = new Query();
            query.objectIds = [objectId];
            query.outFields = ["GlobalID"];
            queryTask.execute(query, deleteRelatedInDbWithGlobalId);


            var polygon = Polygon.fromExtent(map.extent);
            var graphic = new Graphic(polygon, null, { "OBJECTID": objectId }, null);
            var praj = [graphic];
            borgerAbbFeatureLayer.applyEdits(null, null, praj, function() { setUserMessage("Praj slettet.") });
        }

        function updatePrajInDb(geometry, email, navn, telefonnummer, objectId) {
            // just create a new and delete the old (for now at least). 
            //var polygon = Polygon.fromExtent(geometry);
            //var graphic = new Graphic(polygon, null, { "OBJECTID": globalId, "E_MAIL": email, "NAVN": navn, "TELEFONUMMER": telefonnummer, "AFSLUTDATO": "null" }, null);
            //var praj = [graphic];
            //borgerAbbFeatureLayer.applyEdits(null, praj, null, setUserMessage("Praj opdateret."));
            createPrajInDb(geometry, email, navn, telefonnummer);
            deletePrajInDb(objectId);
        }

        function deletePraj() {
            console.log("Hello deletepraj!");

            var globalId = document.getElementById("globalId").value;
            deletePrajInDb(globalId);
            // get ids
            var name = document.getElementById("name").value;
            var email = document.getElementById("email").value;
            var phone = document.getElementById("phone").value;

            setUserMessage("Praj slettet.");

            // delete in database
        }

        function createPraj() {
            console.log("Hello createPraj!");
            // get data 
            var name = document.getElementById("name").value;
            var email = document.getElementById("email").value;
            var phone = document.getElementById("phone").value;
/*            var byggeri_og_bolig = document.getElementById("byggeri_og_bolig").checked;
            var erhverv_byggeri = document.getElementById("erhverv_byggeri").checked;
            var planer_og_strategier = document.getElementById("planer_og_strategier").checked;
            var veje_fortove_og_groenne_omraader = document.getElementById("veje_fortove_og_groenne_omraader").checked;
            var miljoe_natur_og_klima = document.getElementById("miljoe_natur_og_klima").checked;*/
            // get map extent
            var extent = map.extent;
            var xmin = extent.xmin;
            var ymin = extent.ymin;
            var xmax = extent.xmax;
            var ymax = extent.ymax;
            var spatialRefWkid = extent.spatialReference.wkid;

            createPrajInDb(map.extent, email, name, phone);
            // Save to service
            // Error handling
            // Create URL
            /*var tema = "&byggeri_og_bolig=" + byggeri_og_bolig + "&erhverv_byggeri=" + erhverv_byggeri + "&planer_og_strategier=" + planer_og_strategier + "&veje_fortove_og_groenne_omraader=" + veje_fortove_og_groenne_omraader + "&miljoe_natur_og_klima=" + miljoe_natur_og_klima;*/
            var spatrefUrl = "&xmin=" + xmin + "&ymin=" + ymin + "&xmax=" + xmax + "&ymax=" + ymax + "&spatialRefWkid=" + spatialRefWkid;
            var searchPartOfUrl = "?navn=" + name + "&email=" + email + "&mobileNumber=" + phone /*+ tema*/;
            var locationPathname = location.pathname;
            if (QueryString.parentContainer) {
                locationPathname = QueryString.parentContainer;
            }
            var refUrl = window.location.protocol + "//" + window.location.host + locationPathname + searchPartOfUrl + spatrefUrl;
            document.getElementById("prajLink").text = refUrl;
            document.getElementById("prajLink").href = refUrl;
            // Update message
            setUserMessage("Praj oprettet.");
        }

        function updatePraj() {
            var name = document.getElementById("name").value;
            var email = document.getElementById("email").value;
            var phone = document.getElementById("phone").value;

            var objectId = document.getElementById("globalId").value;
            updatePrajInDb(map.extent, email, name, phone, objectId);
            setUserMessage("Praj opdateret.");
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