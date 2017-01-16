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
		let data = {};
		
		if (arguments.length > 1) {
			data = this.groupedBar(arguments);
		}
		else {
			data = {
				labels: dataObj.years,
				datasets: [{
					label: dataObj.column,
					data: dataObj.columnData,
					backgroundColor: 'steelblue',
					borderColor: [],
					borderWidth: 1
				}]
			};
		}

		const ctx = document.getElementById('graph-container');

		const myChart = new Chart(ctx, {
			type: 'bar',
			data: data
		});	
	},

	groupedBar: function groupedBar(group) {
		const colors = ['#E53935', '#5E35B1', '#1E88E5', '#00897B', '#43A047', '#FFB300'];
		let i = 0;

		let dataObj = {
			labels: group[0].years,
			datasets: []
		}

		for (let item of group) {
			dataObj.datasets = [...dataObj.datasets, {
				label: item.column,
				data: item.columnData,
				backgroundColor: colors[i],
				borderColor: [],
				borderWidth: 1
			}];

			i++;
		}

		return dataObj;
	}
}

var promise = new Promise((resolve, reject) => {
	d3.csv('../data/devon.csv', (err, data) => {
		if (err) {
			reject('Error loading data.');
			console.err(err);
		}

		for (let item of data) {
			roadDataAPI.readRoadData(item);
		}

		resolve('Finished loading data');
	});
});

promise.then(
	(result) => {
		console.log(result);

		roadDataAPI.testData = roadDataAPI.getRoadData(89374);
		console.log(roadDataAPI.testData);

		graphingAPI.barchart(roadDataAPI.getIndividualData("Motorcycles"), roadDataAPI.getIndividualData("PedalCycles"), roadDataAPI.getIndividualData("BusCoaches"));
		// graphingAPI.barchart(roadDataAPI.getIndividualData("Motorcycles"));
	},
	(err) => console.log(err)
);


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

