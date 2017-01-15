const roadDataAPI = {
	roadData: [],

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

	console.log('Finished reading data');
});

let testData = roadDataAPI.getRoadData(89374);
console.log(testData);