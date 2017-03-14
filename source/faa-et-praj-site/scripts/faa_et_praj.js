﻿require([
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
            container: "viewDiv",  
            zoom: 12,  
            center: [9.47, 55.5],  
            logo: false,
            showAttribution: false
        });

        var borgerAbbFeatureLayer = new FeatureLayer(borgerAbbUrl, {});

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
        updateElementValue("objectId", QueryString.objectId);

        if (QueryString.email && QueryString.mobileNumber) {
            document.getElementById("deletePraj").style.display = "block";
            document.getElementById("updatePraj").style.display = "block";
            document.getElementById("createPraj").style.display = "none";

            document.getElementById("featureTableContainer").style.display = "none";
            document.getElementById("showBorgerAbb").style.display = "none";
            document.getElementById("labelForShowBorgerAbb").style.display = "none";
            document.getElementById("borgerAbbSection").style.display = "block";

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
            var relatedTable = [];
            if (document.getElementById("byggeri_og_bolig").checked) {
                relatedTable.push(new Graphic(null, null, { "KATEGORI": 1, "AKTIV": 1, "BOGERABBID": globalId }, null));
            }
            if (document.getElementById("erhverv_byggeri").checked) {
                relatedTable.push(new Graphic(null, null, { "KATEGORI": 2, "AKTIV": 1, "BOGERABBID": globalId }, null));
            }
            if (document.getElementById("planer_og_strategier").checked) {
                relatedTable.push(new Graphic(null, null, { "KATEGORI": 3, "AKTIV": 1, "BOGERABBID": globalId }, null));
            }
            if (document.getElementById("veje_fortove_og_groenne_omraader").checked) {
                relatedTable.push(new Graphic(null, null, { "KATEGORI": 4, "AKTIV": 1, "BOGERABBID": globalId }, null));
            }
            if (document.getElementById("miljoe_natur_og_klima").checked) {
                relatedTable.push(new Graphic(null, null, { "KATEGORI": 6, "AKTIV": 1, "BOGERABBID": globalId }, null));
            }

            if (relatedTable.length === 0) {
                setUserMessage("Der skal vælges mindst een kategori.");
                return;
            }

            temaSagLayer.applyEdits(relatedTable, null, null, succesResult, failureResult);
            setUserMessage("Praj oprettet.");
        }

        function convertObjectId2GlobalId(objectId, layerUrl, callback) { //returns a FeatureSet (sjeesh).
            var queryTask = new QueryTask(layerUrl);
            var query = new Query();
            query.objectIds = [objectId];
            query.outFields = ["GlobalID"];
            queryTask.execute(query, callback);
        }

        function convertGlobalId2ObjectId(globalId, layerUrl, callback) { //returns an array with one (or zero) objectId.
            var queryTask = new QueryTask(layerUrl);
            var query = new Query();
            query.where = "'GlobalId' = " + globalId + "'";
            queryTask.executeForIds(query, callback);
        }

        function createRelatedInDb(featureEditResults) {
            var featureEditResult = featureEditResults[0];
            var queryTask = new QueryTask(borgerAbbUrl);
            var query = new Query();
            query.objectIds = [featureEditResult.objectId];
            query.outFields = ["GlobalID"];
            queryTask.execute(query, createRelatedInDbWithGlobalId);

            // Hack: 
            document.getElementById("prajLink").href = document.getElementById("prajLink").href + "&objectId=" + featureEditResult.objectId;
        }

        function createPrajInDb(geometry, email, navn, telefonnummer, callback) {
            var polygon = Polygon.fromExtent(geometry);
            var graphic = new Graphic(polygon, null, { "E_MAIL": email, "NAVN": navn, "TELEFONUMMER": telefonnummer }, null);
            var praj = [graphic];
            borgerAbbFeatureLayer.applyEdits(praj, null, null, callback, function (data) { console.error(data); console.error("NOT_Deleted") });

        }

        function deleteRelatedInDbWithGlobalId2(data) {
            var graphics = [];
            for (var id = 0; id < data; id++) {
                graphics.push(new Graphic(null, null, { "OBJECTID": id }));
            }

            temaSagLayer.applyEdits(null, null, graphics, function (data) { console.info(data); console.info("relatedDeleted") }, function (data) { console.error(data); console.error("related_NOT_Deleted") });
        }

        function deleteRelatedInDbWithGlobalId(data)
        {
            var globalId = data.features[0].attributes.GlobalID;
            var queryTask = new QueryTask(temaSagUrl);
            var query = new Query();
            query.where = "GlobalID='" + globalId + "'";
            queryTask.executeForIds(query, deleteRelatedInDbWithGlobalId2);
        }

        function deletePrajInDb(objectId, callback) {
            var queryTask = new QueryTask(borgerAbbUrl);
            var query = new Query();
            query.objectIds = [objectId];
            query.outFields = ["GlobalID"];
            queryTask.execute(query, callback);


            var polygon = Polygon.fromExtent(map.extent);
            var graphic = new Graphic(polygon, null, { "OBJECTID": objectId }, null);
            var praj = [graphic];
            borgerAbbFeatureLayer.applyEdits(null, null, praj, function() { setUserMessage("Praj slettet.") });
        }

        function updatePrajInDb(geometry, email, navn, telefonnummer, objectId, callback) {
            // just create a new and delete the old (for now at least). 
            createPrajInDb(geometry, email, navn, telefonnummer, callback);
            deletePrajInDb(objectId, deleteRelatedInDbWithGlobalId);
        }

        function deletePraj() {
            var objectId = parseInt(document.getElementById("objectId").value);
            deletePrajInDb(objectId, deleteRelatedInDbWithGlobalId);

            setUserMessage("Praj slettet.");
        }

        function createPraj() {
            // get data 
            var name = document.getElementById("name").value;
            var email = document.getElementById("email").value;
            var phone = document.getElementById("phone").value;
            // get map extent
            var extent = map.extent;
            var xmin = extent.xmin;
            var ymin = extent.ymin;
            var xmax = extent.xmax;
            var ymax = extent.ymax;
            var spatialRefWkid = extent.spatialReference.wkid;

            createPrajInDb(map.extent, email, name, phone, createRelatedInDb);
            var spatrefUrl = "&xmin=" + xmin + "&ymin=" + ymin + "&xmax=" + xmax + "&ymax=" + ymax + "&spatialRefWkid=" + spatialRefWkid;
            var searchPartOfUrl = "?navn=" + name + "&email=" + email + "&mobileNumber=" + phone;
            var locationPathname = location.pathname;
            if (QueryString.parentContainer) {
                locationPathname = QueryString.parentContainer;
            }
            var refUrl = window.location.protocol + "//" + window.location.host + locationPathname + searchPartOfUrl + spatrefUrl;
            document.getElementById("prajLink").text = "Lav om på dit praj ved at klikke her.";
            document.getElementById("prajLink").href = encodeURI(refUrl);
            // Update message
            setUserMessage("Praj oprettet.");
        }

        function updatePraj() {
            var name = document.getElementById("name").value;
            var email = document.getElementById("email").value;
            var phone = document.getElementById("phone").value;

            var objectId = parseInt(document.getElementById("objectId").value);

            updatePrajInDb(map.extent, email, name, phone, objectId, createRelatedInDb);
            setUserMessage("Praj opdateret.");
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