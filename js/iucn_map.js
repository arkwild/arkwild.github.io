document.addEventListener('DOMContentLoaded', function() {

    if (window.iucnSpeciesId === "None") {
        hideIUCNMap();
        return;
    }

    var map, layersAlpha, rdbLayer;
    var speciesID = window.iucnSpeciesId;
    console.log("speciesID: ", speciesID);
    var startExtent;
    var startExtent = null;

    function icunError(error) {
    console.log("Error in calling spatial data service", error);
    }

    dojo.require("esri.map");
    dojo.require("esri.tasks.query");
    dojo.require("dijit.form.Button");
    dojo.require("dijit.form.TextBox");
    dojo.require("dijit.TooltipDialog");
    dojo.require("esri.geometry");
    dojo.require("esri.graphic");
    dojo.addOnLoad(init);

    function init() {

        startExtent = new esri.geometry.Extent(-14000000, -10000000, 14000000, 14000000, new esri.SpatialReference({
            wkid: 102100
        })); //create the initial map extent
        map = new esri.Map("iucn-region-map", {
            extent: startExtent
        }); //instantiate the map control


        //ESRI basemap
        var baseMapLayer = new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer");
        map.addLayer(baseMapLayer);
        map.disableScrollWheel();
        map.setBackgroundColor("#7AADCD");

        query();

    }

    function query() {

        var token = window.iucnSpatialApiToken;

        var layerDefinitions = [];
        layersAlpha = 0.80;
        var imageParameters = new esri.layers.ImageParameters();
        //image parameters for the layer
        imageParameters.layerIds = [0];
        //layer filter for species range data
        imageParameters.layerOption = esri.layers.ImageParameters.LAYER_OPTION_SHOW;
        rdbLayer = new esri.layers.ArcGISDynamicMapServiceLayer((window.mapService || '/photoark/esri') + "?token=" + token, {
            "imageParameters": imageParameters,
            opacity: layersAlpha
        });
        layerDefinitions[0] = "ID_NO=" + speciesID;
        //set the initial definition expression
        rdbLayer.setLayerDefinitions(layerDefinitions);
        console.log("rdbLayer", rdbLayer);
        //create renderer

        var layerDrawingOptions = [];
        var layerDrawingOption = new esri.layers.LayerDrawingOptions();
        //layerDrawingOption.renderer = simplerenderer;
        layerDrawingOptions[0] = layerDrawingOption;
        rdbLayer.setLayerDrawingOptions(layerDrawingOptions);
        // add layer to map
        map.addLayer(rdbLayer);
        zoomToSpeciesRange(speciesID, token);

        // function to do the ZOOMING
        function zoomToSpeciesRange(taxonID) {

            var queryURL = (window.mapService || '/photoark/esri') + '/0?token=' + token;
            var queryTask = new esri.tasks.QueryTask(queryURL);

            dojo.connect(queryTask, "onComplete", function(result) {
                console.log("Result: ", result);
                if (result === null || result.features === null || result.features.length === 0) {
                    hideIUCNMap();
                    return;
                } else {
                    $("#pk-fallback-map").css("visibility", "visible");
                }
                var resultExtent = null;
                var myFeatureExtent = esri.graphicsExtent(result.features);
                map.setExtent(myFeatureExtent.expand(1.2), true); //you can adjust the zoom level delta here
            });

            var query = new esri.tasks.Query();
            query.returnGeometry = true;
            query.maxAllowableOffset = 10000;
            query.outFields = [];
            query.where = "ID_NO = " + taxonID;

            queryTask.execute(query);
        }
    }

    function hideIUCNMap() {
        $("#iucn-region-map").hide();
        // var geoRange = $("#iucn-geo-range-text");
        // if ($(geoRange).length < 0) {
        //     $("#iucn-geo-range-text").parent().hide();
        // }
        var text_data = $("#pk-fallback-map .ng-text-overlay");
        if ($(text_data).length) {
            $("#pk-fallback-map").removeClass("ng-width-full").addClass("species-info-container w-container");
            $(text_data).removeClass("ng-text-overlay");
            $(text_data).find("label").removeClass().addClass("bold-label").css('color', 'black');
            $(text_data).find("p").css('color', 'black');
            $("#pk-fallback-map").hide();
        }
    }

    //asynchronous callback function with the results for the species binomial
    function showResults(results) {
        if (results.features.length > 0) {
            var featureAttributes = results.features[0].attributes; //get the attributes of any features returned
            title.innerHTML = "Showing data for: <i>" + featureAttributes["BINOMIAL"] + " (Web Mercator projection)</i>"; //set the text in the UI
        } else {
            title.innerHTML = "No species found";
        }
    }

    $("#map-locate-toggle").click(function() {
        map.setExtent(startExtent, false);
    });

});