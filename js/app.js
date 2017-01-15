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

	getRoadData: function getRoadData(road) {
		let individualRoadData = [];

		for (let item of this.roadData) {
			if (item["Northing"] === road) {
				individualRoadData.push(item);
			}
		}

		return individualRoadData;
	}
}

const graphingAPI = {
	barchart: function barchart(svg, x, y) {
		const data = roadDataAPI.testData;

		// x.domain(data.map((d) => d.))
	}
}

d3.csv('../data/devon.csv', (err, data) => {
	for (let item of data) {
		roadDataAPI.readRoadData(item);
	}

	console.log('Finished loading data');
	roadDataAPI.testData = roadDataAPI.getRoadData(89374);
	console.log(roadDataAPI.testData);
});


// Graphs
const margin = {
	top: 20,
	right: 20,
	bottom: 30,
	left: 40
};
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const x = d3.scaleBand()
	.range([0, width])
	.padding(0.1);
const y = d3.scaleLinear()
	.range([height, 0]);

const svg = d3.select("#graph-container").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");




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