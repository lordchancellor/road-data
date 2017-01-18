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

		pageSetupAPI.setUniqueRoads(obj["Road"]);
		pageSetupAPI.setAllRoads(obj);

		this.roadData.push(obj);
	},

	getRoadData: function getRoadData(easting, northing) {
		let individualRoadData = [];

		for (let item of this.roadData) {
			if (item["Easting"] === easting && item["Northing"] === northing) {
				individualRoadData.push(item);
			}
		}

		return individualRoadData;
	},

	getIndividualData: function getIndividualData(column, easting, northing) {
		const data = this.getRoadData(easting, northing);
		let dataObj = {
			column,
			road: data[0]["Road"],
			startJunct: data[0]["StartJunction"],
			endJunct: data[0]["EndJunction"],
			columnData: [],
			years: []
		};

		for (let item of data) {
			dataObj.columnData = [...dataObj.columnData, item[column]];
			dataObj.years = [...dataObj.years, item["AADFYear"]];
		}

		return dataObj;
	},

	// Get an array of IDs from all checked checkboxes
	getDataToDisplay: function getDataToDisplay() {
		const checkboxes = document.querySelectorAll('input');
		let checked = [];

		for (let checkbox of checkboxes) {
			if (checkbox.checked) {
				checked = [...checked, checkbox.id];
			}
		}

		return checked;
	},

	// Reset all checkboxes to unchecked
	resetCheckboxes: function resetCheckboxes() {
		const checkboxes = document.querySelectorAll('input');

		for (let checkbox of checkboxes) {
			checkbox.checked = false;
		}
	},

	getDataObjects: function getDataObjects(easting, northing) {
		let dataPoints = [];
		const dataToDisplay = this.getDataToDisplay();

		for (let data of dataToDisplay) {
			dataPoints = [...dataPoints, roadDataAPI.getIndividualData(data, easting, northing)];
		}

		console.log(dataPoints);

		return dataPoints;
	}
};

const graphingAPI = {
	barChart: function barChart(dataObj) {
		// Destroy the existing canvas and create a new one to prevent bleed
		this.replaceCanvas();
		
		const colors = ['#E53935', '#5E35B1', '#1E88E5', '#00897B', '#43A047', '#FFB300'];
		let data = {
			labels: dataObj[0].years,
			datasets: []
		};
		let i = 0;

		for (let item of dataObj) {
			data.datasets = [...data.datasets, {
				label: item.column,
				data: item.columnData,
				backgroundColor: colors[i],
				borderColor: [],
				borderWidth: 1
			}];

			i++;
		}

		const ctx = document.getElementById('graph');

		const myChart = new Chart(ctx, {
			type: 'bar',
			data: data
		});
	},

	replaceCanvas: function replaceCanvas() {
		const container = document.getElementById('canvasContainer');
		let canvas = document.createElement('canvas');

		// Remove the child nodes from the canvasContainer (should only be one, but loop to be sure)
		while (container.hasChildNodes()) {
			container.removeChild(container.lastChild);
		}

		canvas.setAttribute('id', 'graph');

		container.appendChild(canvas);
	}
};

const mappingAPI = {
	getGeoCoords: function getGeoCoords(easting, northing) {
		const os = new OSRef(easting, northing);
		let geoCoords = os.toLatLng(os);

		geoCoords.OSGB36ToWGS84();

		return geoCoords;
	},

	initMap: function initMap(easting = -1, northing = -1) {
		console.log('initMap called - ', easting, northing);

		if (easting !== -1 && northing !== -1) {
			const center = this.getGeoCoords(easting, northing);
			console.log(center);

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
	}

};

const pageSetupAPI = {
	uniqueRoads: [],
	allRoads: [],

	setUniqueRoads: function setUniqueRoads(road) {
		if (this.uniqueRoads.indexOf(road) === -1) {
			this.uniqueRoads = [...this.uniqueRoads, road];
		}

		this.uniqueRoads.sort();
	},

	setAllRoads: function setAllRoads(roadObj) {
		if (roadObj["AADFYear"] === 2000) {
			this.allRoads = [...this.allRoads, {
				"Road": roadObj["Road"],
				"StartJunction": roadObj["StartJunction"],
				"EndJunction": roadObj["EndJunction"],
				"Easting": roadObj["Easting"],
				"Northing": roadObj["Northing"]
			}];
		}

		this.allRoads.sort();
	},

	populateUniqueRoadsSelect: function populateUniqueRoadsSelect() {
		let uniqueRoadSelect = document.getElementById('uniqueRoads');

		for (let road of this.uniqueRoads) {
			uniqueRoadSelect.appendChild(this.createOption(road));
		}
	},

	populateRoadSectionSelect: function populateRoadSectionSelect(road) {
		let roadSectionSelect = document.getElementById('roadSection');

		this.clearOptions(roadSectionSelect);

		roadSectionSelect.appendChild(this.setDefaultOption());

		for (let roadSection of this.allRoads) {
			if (roadSection["Road"] === road) {
				let label = `${roadSection["StartJunction"]} to ${roadSection["EndJunction"]}`;
				roadSectionSelect.appendChild(this.createOption(label, roadSection["Easting"], roadSection["Northing"]));
			}
		}
	},

	setDefaultOption: function setDefaultOption() {
		let defaultOption = document.createElement('option');

		defaultOption.setAttribute('value', 0);
		defaultOption.textContent = '-- Select a Road Section ---';

		return defaultOption;
	},

	clearOptions: function clearOptions(select) {
		while (select.hasChildNodes()) {
			select.removeChild(select.lastChild);
		}
	},

	createOption: function createOption(label, easting = -1, northing = -1) {
		let option = document.createElement('option');

		option.setAttribute('value', label);

		if (easting !== -1 && northing !== -1) {
			option.setAttribute('data-easting', easting);
			option.setAttribute('data-northing', northing);
		}

		option.textContent = label;

		return option;
	},

	setSelectListeners: function setSelectListeners() {
		const uniqueRoadSelect = document.getElementById('uniqueRoads');
		const roadSectionSelect = document.getElementById('roadSection');
		const roadSectionContainer = document.getElementsByClassName('roadSectionSelect')[0];
		const dataControls = document.getElementsByClassName('dataControls')[0];
		const checkboxes = document.querySelectorAll('input');

		// Add and event listener to the unique roads dropdown so that it populates the sections on change
		uniqueRoadSelect.addEventListener('change', function() {
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
		roadSectionSelect.addEventListener('change', function() {
			if (this.selectedIndex !== 0) {
				const easting = parseInt(this.options[this.selectedIndex].getAttribute('data-easting'), 10);
				const northing = parseInt(this.options[this.selectedIndex].getAttribute('data-northing'), 10);

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
		for (let checkbox of checkboxes) {
			checkbox.addEventListener('click', () => {
				graphingAPI.barChart(roadDataAPI.getDataObjects(
					parseInt(roadSectionSelect.options[roadSectionSelect.selectedIndex].getAttribute('data-easting'), 10),
					parseInt(roadSectionSelect.options[roadSectionSelect.selectedIndex].getAttribute('data-northing'), 10)
				));
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

let promise = new Promise((resolve, reject) => {
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

		pageSetupAPI.setupPage();

		roadDataAPI.testData = roadDataAPI.getRoadData(89374);
		console.log(roadDataAPI.testData);
	},
	(err) => console.log(err)
);

// Set the current year in the header copyright
(() => {
	document.getElementsByClassName('currentYear')[0].textContent = new Date().getFullYear();
})();