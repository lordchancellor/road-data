'use strict';
var roadDataAPI = {
    roadData: [],
    testData: [],
    readRoadData: function readRoadData(obj) {
        for (var item in obj) {
            if (!isNaN(+obj[item])) {
                obj[item] = +obj[item];
            }
        }
        pageSetupAPI.setUniqueRoads(obj["Road"]);
        pageSetupAPI.setAllRoads(obj);
        this.roadData.push(obj);
    },
    getRoadData: function getRoadData(easting, northing) {
        var individualRoadData = [];
        for (var _i = 0, _a = this.roadData; _i < _a.length; _i++) {
            var item = _a[_i];
            if (item["Easting"] === easting && item["Northing"] === northing) {
                individualRoadData.push(item);
            }
        }
        return individualRoadData;
    },
    getIndividualData: function getIndividualData(column, easting, northing) {
        var data = this.getRoadData(easting, northing);
        var dataObj = {
            column: column,
            road: data[0]["Road"],
            startJunct: data[0]["StartJunction"],
            endJunct: data[0]["EndJunction"],
            columnData: [],
            years: []
        };
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var item = data_1[_i];
            dataObj.columnData = dataObj.columnData.concat([item[column]]);
            dataObj.years = dataObj.years.concat([item["AADFYear"]]);
        }
        return dataObj;
    },
    // Get an array of IDs from all checked checkboxes
    getDataToDisplay: function getDataToDisplay() {
        var checkboxes = document.querySelectorAll('input');
        var checked = [];
        for (var _i = 0, checkboxes_1 = checkboxes; _i < checkboxes_1.length; _i++) {
            var checkbox = checkboxes_1[_i];
            if (checkbox.checked) {
                checked = checked.concat([checkbox.id]);
            }
        }
        return checked;
    },
    // Reset all checkboxes to unchecked
    resetCheckboxes: function resetCheckboxes() {
        var checkboxes = document.querySelectorAll('input');
        for (var _i = 0, checkboxes_2 = checkboxes; _i < checkboxes_2.length; _i++) {
            var checkbox = checkboxes_2[_i];
            checkbox.checked = false;
        }
    },
    getDataObjects: function getDataObjects(easting, northing) {
        var dataPoints = [];
        var dataToDisplay = this.getDataToDisplay();
        for (var _i = 0, dataToDisplay_1 = dataToDisplay; _i < dataToDisplay_1.length; _i++) {
            var data = dataToDisplay_1[_i];
            dataPoints = dataPoints.concat([roadDataAPI.getIndividualData(data, easting, northing)]);
        }
        console.log(dataPoints);
        return dataPoints;
    }
};
var graphingAPI = {
    barChart: function barChart(dataObj) {
        // Destroy the existing canvas and create a new one to prevent bleed
        this.replaceCanvas();
        var colors = ['#E53935', '#5E35B1', '#1E88E5', '#00897B', '#43A047', '#FFB300'];
        var data = {
            labels: dataObj[0].years,
            datasets: []
        };
        var i = 0;
        for (var _i = 0, dataObj_1 = dataObj; _i < dataObj_1.length; _i++) {
            var item = dataObj_1[_i];
            data.datasets = data.datasets.concat([{
                    label: item.column,
                    data: item.columnData,
                    backgroundColor: colors[i],
                    borderColor: [],
                    borderWidth: 1
                }]);
            i++;
        }
        var ctx = document.getElementById('graph');
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: data
        });
    },
    replaceCanvas: function replaceCanvas() {
        var container = document.getElementById('canvasContainer');
        var canvas = document.createElement('canvas');
        // Remove the child nodes from the canvasContainer (should only be one, but loop to be sure)
        while (container.hasChildNodes()) {
            container.removeChild(container.lastChild);
        }
        canvas.setAttribute('id', 'graph');
        container.appendChild(canvas);
    }
};
var mappingAPI = {
    getGeoCoords: function getGeoCoords(easting, northing) {
        var os = new OSRef(easting, northing);
        var geoCoords = os.toLatLng(os);
        geoCoords.OSGB36ToWGS84();
        return geoCoords;
    },
    initMap: function initMap(easting, northing) {
        if (easting === void 0) { easting = -1; }
        if (northing === void 0) { northing = -1; }
        console.log('initMap called - ', easting, northing);
        if (easting !== -1 && northing !== -1) {
            var center = this.getGeoCoords(easting, northing);
            console.log(center);
            var map = new google.maps.Map(document.getElementById('map'), {
                center: center,
                zoom: 15,
                zoomControl: true,
                mapTypeControl: false,
                scaleControl: false,
                streetViewControl: false,
                rotateControl: false,
                fullscreenControl: false
            });
            var marker = new google.maps.Marker({
                position: center,
                map: map
            });
        }
    }
};
var pageSetupAPI = {
    uniqueRoads: [],
    allRoads: [],
    setUniqueRoads: function setUniqueRoads(road) {
        if (this.uniqueRoads.indexOf(road) === -1) {
            this.uniqueRoads = this.uniqueRoads.concat([road]);
        }
        this.uniqueRoads.sort();
    },
    setAllRoads: function setAllRoads(roadObj) {
        if (roadObj["AADFYear"] === 2000) {
            this.allRoads = this.allRoads.concat([{
                    "Road": roadObj["Road"],
                    "StartJunction": roadObj["StartJunction"],
                    "EndJunction": roadObj["EndJunction"],
                    "Easting": roadObj["Easting"],
                    "Northing": roadObj["Northing"]
                }]);
        }
        this.allRoads.sort();
    },
    populateUniqueRoadsSelect: function populateUniqueRoadsSelect() {
        var uniqueRoadSelect = document.getElementById('uniqueRoads');
        for (var _i = 0, _a = this.uniqueRoads; _i < _a.length; _i++) {
            var road = _a[_i];
            uniqueRoadSelect.appendChild(this.createOption(road));
        }
    },
    populateRoadSectionSelect: function populateRoadSectionSelect(road) {
        var roadSectionSelect = document.getElementById('roadSection');
        this.clearOptions(roadSectionSelect);
        roadSectionSelect.appendChild(this.setDefaultOption());
        for (var _i = 0, _a = this.allRoads; _i < _a.length; _i++) {
            var roadSection = _a[_i];
            if (roadSection["Road"] === road) {
                var label = roadSection["StartJunction"] + " to " + roadSection["EndJunction"];
                roadSectionSelect.appendChild(this.createOption(label, roadSection["Easting"], roadSection["Northing"]));
            }
        }
    },
    setDefaultOption: function setDefaultOption() {
        var defaultOption = document.createElement('option');
        defaultOption.setAttribute('value', 0);
        defaultOption.textContent = '-- Select a Road Section ---';
        return defaultOption;
    },
    clearOptions: function clearOptions(select) {
        while (select.hasChildNodes()) {
            select.removeChild(select.lastChild);
        }
    },
    createOption: function createOption(label, easting, northing) {
        if (easting === void 0) { easting = -1; }
        if (northing === void 0) { northing = -1; }
        var option = document.createElement('option');
        option.setAttribute('value', label);
        if (easting !== -1 && northing !== -1) {
            option.setAttribute('data-easting', easting);
            option.setAttribute('data-northing', northing);
        }
        option.textContent = label;
        return option;
    },
    setSelectListeners: function setSelectListeners() {
        var uniqueRoadSelect = document.getElementById('uniqueRoads');
        var roadSectionSelect = document.getElementById('roadSection');
        var roadSectionContainer = document.getElementsByClassName('roadSectionSelect')[0];
        var dataControls = document.getElementsByClassName('dataControls')[0];
        var checkboxes = document.querySelectorAll('input');
        // Add and event listener to the unique roads dropdown so that it populates the sections on change
        uniqueRoadSelect.addEventListener('change', function () {
            if (this.selectedIndex !== 0) {
                roadSectionContainer.style.display = 'block';
            }
            else {
                // Reset the states of everything
                roadSectionContainer.style.display = 'none';
                roadSectionContainer.selectedIndex = 0;
                dataControls.style.display = 'none';
            }
            roadSectionContainer.style.display = this.selectedIndex === 0 ? 'none' : 'block';
            pageSetupAPI.populateRoadSectionSelect(this.value);
        });
        // Add an event listener to the sections so that a map and the graphs can be generated when a section is chosen
        roadSectionSelect.addEventListener('change', function () {
            if (this.selectedIndex !== 0) {
                var easting = parseInt(this.options[this.selectedIndex].getAttribute('data-easting'), 10);
                var northing = parseInt(this.options[this.selectedIndex].getAttribute('data-northing'), 10);
                // Cause the data toggles to be visible
                dataControls.style.display = 'block';
                console.log(easting, northing);
                mappingAPI.initMap(easting, northing);
                graphingAPI.barChart(roadDataAPI.getDataObjects(easting, northing));
            }
            else {
                dataControls.style.display = 'none';
            }
        });
        // Add event listeners to the checkboxes to trigger a change in the data when toggled
        for (var _i = 0, checkboxes_3 = checkboxes; _i < checkboxes_3.length; _i++) {
            var checkbox = checkboxes_3[_i];
            checkbox.addEventListener('click', function () {
                graphingAPI.barChart(roadDataAPI.getDataObjects(parseInt(roadSectionSelect.options[roadSectionSelect.selectedIndex].getAttribute('data-easting'), 10), parseInt(roadSectionSelect.options[roadSectionSelect.selectedIndex].getAttribute('data-northing'), 10)));
            });
        }
    },
    setupPage: function setupPage() {
        console.log('Setting select');
        this.populateUniqueRoadsSelect();
        console.log('Unique Roads');
        console.log(this.uniqueRoads);
        console.log('All Roads');
        console.log('Length ' + this.allRoads.length);
        console.log(this.allRoads[0]);
        this.setSelectListeners();
    }
};
var promise = new Promise(function (resolve, reject) {
    d3.csv('../data/devon.csv', function (err, data) {
        if (err) {
            reject('Error loading data.');
            console.err(err);
        }
        for (var _i = 0, data_2 = data; _i < data_2.length; _i++) {
            var item = data_2[_i];
            roadDataAPI.readRoadData(item);
        }
        resolve('Finished loading data');
    });
});
promise.then(function (result) {
    console.log(result);
    pageSetupAPI.setupPage();
    roadDataAPI.testData = roadDataAPI.getRoadData(89374);
    console.log(roadDataAPI.testData);
}, function (err) { return console.log(err); });
// Set the current year in the header copyright
(function () {
    document.getElementsByClassName('currentYear')[0].textContent = new Date().getFullYear();
})();
