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

d3.csv('../data/devon.csv', (data) => {
	for (let item of data) {
		roadDataAPI.readRoadData(item);
	}

	console.log('Finished loading data');
	roadDataAPI.testData = roadDataAPI.getRoadData(89374);
	console.log(roadDataAPI.testData);
});


// var promise = new Promise((resolve, reject) => {
// 	d3.csv('../data/devon.csv', (data) => {
// 		for (let item of data) {
// 			roadDataAPI.readRoadData(item);
// 		}
// 	});

// 	resolve("Finished loading data.");
// 	reject("Error loading data.");
// });

// promise.then(
// 	(result) => {
// 		console.log(result);

// 		roadDataAPI.testData = roadDataAPI.getRoadData(89374);
// 		console.log(roadDataAPI.testData);
// 	},
// 	(err) => console.log(err)
// );