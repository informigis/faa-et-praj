require([
    "esri/config",
    "esri/layers/FeatureLayer",
    "esri/tasks/QueryTask",
    "esri/tasks/query",
    "esri/graphic",
    "dojo/domReady!"
], function (esriConfig, FeatureLayer, QueryTask, Query, Graphic) {
    esriConfig.defaults.io.corsEnabledServers.push("https://gis.kolding.dk");
    esriConfig.defaults.io.corsEnabledServers.push("https://informigis.github.io");

    var ingenGlobalIdFejlmeddelelse = "Der opstod en fejl ved godkendelsen af email-adressen. Kontakt Kolding Kommune";
    var borgerAbbUrl = "https://gis.kolding.dk/arcgis/rest/services/PublicAndreForvaltninger/Borger_Abonnement_test/FeatureServer/1";

    var borgerAbbFeatureLayer = new FeatureLayer(borgerAbbUrl, {});

    var globalId = QueryString.globalId;

    if (!globalId) {
        alert(ingenGlobalIdFejlmeddelelse);
    }

    function setEmailverificationStatus(results) {
        var objectId = results[0];

        var graphic = new Graphic(null, null, { "OBJECTID": objectId, "TELEFONUMMER": 5 }, null);
        var praj = [graphic];
        borgerAbbFeatureLayer.applyEdits(null, praj, null, function (data) { console.log(data); console.log("success.") }, function (data) { console.error(data); console.error("NOT_Deleted") });
    }

    function getObjectIdFromGlobalId(globalId, callback) {
        var queryTask = new QueryTask(borgerAbbUrl);
        var query = new Query();
        query.where = "GlobalID='" + globalId + "'";
        queryTask.executeForIds(query, callback);
    }

    getObjectIdFromGlobalId(globalId, setEmailverificationStatus);
});