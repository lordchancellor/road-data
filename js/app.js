var roadData = [];

function readRoadData(obj) {
	for (let item in obj) {
		if (!isNaN(+obj[item])) {
			obj[item] = +obj[item];
		} 
	}

	roadData.push(obj);
}

d3.csv('../data/devon.csv', (data) => {
	for (var i = 0; i < data.length; i++) {
		readRoadData(data[i]);
	}

	console.log('Finished reading data');
});

