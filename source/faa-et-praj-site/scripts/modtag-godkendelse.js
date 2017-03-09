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

    var borgerAbbUrl = "https://gis.kolding.dk/arcgis/rest/services/PublicAndreForvaltninger/Borger_Abonnement_test/FeatureServer/1";



    var borgerAbbFeatureLayer = new FeatureLayer(borgerAbbUrl, {});

    var globalId = QueryString.globalId;

    function error() {
        document.getElementById("tilmelding-fejlet").style.display = "block";
    }

    function setEmailverificationStatus(results) {
        var objectId = results[0];
        var verified = 1;
        var graphic = new Graphic(null, null, { "OBJECTID": objectId, "TELEFONUMMER": verified }, null);
        var praj = [graphic];
        borgerAbbFeatureLayer.applyEdits(null, praj, null, function (data) { console.log(data); document.getElementById("tilmelding-godkendt").style.display = "block" }, function (data) { console.error(data); error() });
    }

    function getObjectIdFromGlobalId(globalId, callback) {
        if (!globalId) {
            error();
            return;
        }
        var queryTask = new QueryTask(borgerAbbUrl);
        var query = new Query();
        query.where = "GlobalID='" + globalId + "'";
        queryTask.executeForIds(query, callback);
    }

    getObjectIdFromGlobalId(globalId, setEmailverificationStatus);
});