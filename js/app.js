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
    getRoadData: function getRoadData(northing) {
        var individualRoadData = [];
        for (var _i = 0, _a = this.roadData; _i < _a.length; _i++) {
            var item = _a[_i];
            if (item["Northing"] === northing) {
                individualRoadData.push(item);
            }
        }
        return individualRoadData;
    },
    getIndividualData: function getIndividualData(column, northing) {
        var data = this.getRoadData(northing);
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
    getNorthing: function getNorthing(label) {
        console.log(label);
        label = label.split(' to ');
        for (var _i = 0, _a = pageSetupAPI.allRoads; _i < _a.length; _i++) {
            var road = _a[_i];
            if (road["StartJunction"] === label[0] && road["EndJunction"] === label[1]) {
                return road["Northing"];
            }
        }
        console.log('Could not find Northing');
    }
};
var graphingAPI = {
    barchart: function barchart(dataObj) {
        var data = {};
        if (arguments.length > 1) {
            data = this.groupedBar(arguments);
        }
        else {
            data = {
                labels: dataObj.years,
                datasets: [{
                        label: dataObj.column,
                        data: dataObj.columnData,
                        backgroundColor: '#E53935',
                        borderColor: [],
                        borderWidth: 1
                    }]
            };
        }
        var ctx = document.getElementById('graph-container');
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: data
        });
    },
    groupedBar: function groupedBar(group) {
        var colors = ['#E53935', '#5E35B1', '#1E88E5', '#00897B', '#43A047', '#FFB300'];
        var i = 0;
        var dataObj = {
            labels: group[0].years,
            datasets: []
        };
        for (var _i = 0, group_1 = group; _i < group_1.length; _i++) {
            var item = group_1[_i];
            dataObj.datasets = dataObj.datasets.concat([{
                    label: item.column,
                    data: item.columnData,
                    backgroundColor: colors[i],
                    borderColor: [],
                    borderWidth: 1
                }]);
            i++;
        }
        return dataObj;
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
                roadSectionSelect.appendChild(this.createOption(label));
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
    createOption: function createOption(label) {
        var option = document.createElement('option');
        option.setAttribute('value', label);
        option.textContent = label;
        return option;
    },
    setSelectListeners: function setSelectListeners() {
        var uniqueRoadSelect = document.getElementById('uniqueRoads');
        var roadSectionSelect = document.getElementById('roadSection');
        var roadSectionContainer = document.getElementsByClassName('roadSectionSelect')[0];
        uniqueRoadSelect.addEventListener('change', function () {
            roadSectionContainer.style.display = this.selectedIndex === 0 ? 'none' : 'block';
            pageSetupAPI.populateRoadSectionSelect(this.value);
        });
        roadSectionSelect.addEventListener('change', function () {
            if (this.selectedIndex !== 0) {
                var northing = roadDataAPI.getNorthing(this.value);
                console.log(northing);
                graphingAPI.barchart(roadDataAPI.getIndividualData("Motorcycles", northing), roadDataAPI.getIndividualData("PedalCycles", northing));
            }
        });
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
    // graphingAPI.barchart(roadDataAPI.getIndividualData("Motorcycles"), roadDataAPI.getIndividualData("PedalCycles"));
    // graphingAPI.barchart(roadDataAPI.getIndividualData("Motorcycles"));
}, function (err) { return console.log(err); });
// Google Map
function initMap() {
    var center = {
        lat: 50.6943231532,
        lng: -3.50213953897
    };
    // const center = {
    // 	lat: 50.69376666612421,
    // 	lng: -3.500945871444607
    // };
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
// d3.csv('../data/devon.csv', (err, data) => {
// 	if (err) {
// 		console.err('There was an error');
// 	}
// 	else {
// 		console.log('Data loaded ok!');
// 	}
// 	for (let item of data) {
// 		roadDataAPI.readRoadData(item);
// 	}
// 	console.log('Finished loading data');
// 	roadDataAPI.testData = roadDataAPI.getRoadData(89374);
// 	console.log(roadDataAPI.testData);
// 	graphingAPI.barchart(roadDataAPI.getIndividualData("Motorcycles"));
// });
