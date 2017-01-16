'use strict';

const roadDataAPI = {
	roadData: [],
	testData: [],

	readRoadData: function readRoadData(obj) {
		for (let item in obj) {
			if (!isNaN(+obj[item])) {
				obj[item] = +obj[item];
			} 
		}

		this.roadData.push(obj);
	},

	getRoadData: function getRoadData(northing) {
		let individualRoadData = [];

		for (let item of this.roadData) {
			if (item["Northing"] === northing) {
				individualRoadData.push(item);
			}
		}

		return individualRoadData;
	},

	getIndividualData: function getIndividualData(column) {
		const data = this.getRoadData(89374);
		let dataObj = {
			column,
			road: data[0]["Road"],
			startJunct: data[0]["StartJunction"],
			endJunct: data[0]["EndJunction"],
			columnData: [],
			years: []
		}

		for (let item of data) {
			dataObj.columnData = [...dataObj.columnData, item[column]];
			dataObj.years = [...dataObj.years, item["AADFYear"]];
		}

		return dataObj;
	}
}

const graphingAPI = {
	barchart: function barchart(dataObj) {
		const ctx = document.getElementById('graph-container');

		const myChart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: dataObj.years,
				datasets: [{
					label: dataObj.column,
					data: dataObj.columnData,
					backgroundColor: [],
					borderColor: [],
					borderWidth: 1
				}]
			}
		});	
	}
}

d3.csv('../data/devon.csv', (err, data) => {
	for (let item of data) {
		roadDataAPI.readRoadData(item);
	}

	console.log('Finished loading data');
	roadDataAPI.testData = roadDataAPI.getRoadData(89374);
	console.log(roadDataAPI.testData);

	graphingAPI.barchart(roadDataAPI.getIndividualData("Motorcycles"));
});


// Google Map
function initMap() {
	const center = {
		lat: 50.6943231532,
		lng: -3.50213953897
	};
	
	const map = new google.maps.Map(document.getElementById('map'), {
		center: center,
		zoom: 15,
		zoomControl: true,
		mapTypeControl: false,
		scaleControl: false,
		streetViewControl: false,
		rotateControl: false,
		fullscreenControl: false
	});

	const marker = new google.maps.Marker({
		position: center,
		map: map
	});
}


// var promise = new Promise((resolve, reject) => {
// 	d3.csv('../data/devon.csv',
// 		(data) => {
// 			for (let item of data) {
// 				roadDataAPI.readRoadData(item);
// 			}

// 			resolve("Finished loading data.");
// 		},
// 		(err) => {
// 			reject("Error loading data.");
// 			// console.err(err);
// 		}
// 	);
// });

// promise.then(
// 	(result) => {
// 		console.log(result);

// 		roadDataAPI.testData = roadDataAPI.getRoadData(89374);
// 		console.log(roadDataAPI.testData);
// 	},
// 	(err) => console.log(err)
// );