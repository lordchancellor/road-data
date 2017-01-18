'use strict';

// Functionality for storing, accessing and manipulating the road data
const roadDataAPI = {
	roadData: [],

	readRoadData: function readRoadData(obj) {
		// Make sure that numbers are saved as numbers and not strings
		for (let item in obj) {
			if (!isNaN(+obj[item])) {
				obj[item] = +obj[item];
			}
		}

		// Set the data for the dropdowns
		pageSetupAPI.setUniqueRoads(obj["Road"]);
		pageSetupAPI.setAllRoads(obj);

		this.roadData.push(obj);
	},

	// Get the individual data items for a unique road section, based on the easting and northing
	getRoadData: function getRoadData(easting, northing) {
		let individualRoadData = [];

		for (let item of this.roadData) {
			if (item["Easting"] === easting && item["Northing"] === northing) {
				individualRoadData.push(item);
			}
		}

		return individualRoadData;
	},

	// Get a specific data object with data points used for graphing, based on the column (vehicle type), easting and northing
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

	// Get data to be displayed in the graph for a particular road section
	getDataObjects: function getDataObjects(easting, northing) {
		let dataPoints = [];
		const dataToDisplay = this.getDataToDisplay();

		for (let data of dataToDisplay) {
			dataPoints = [...dataPoints, roadDataAPI.getIndividualData(data, easting, northing)];
		}

		return dataPoints;
	}
};

// Functionality for generating and maintaining the ChartJS graphs in the page
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

		// Build the datasets object to be used by ChartJS
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

	// Destroy the existing canvas and create a new one to prevent bleed
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

// Functionality for generating and replacing the Google maps
const mappingAPI = {
	// Generate latitude and longitude from the OS easting and northings
	// Uses a library by Jonathan Stott - http://www.jstott.me.uk/jscoord/
	getGeoCoords: function getGeoCoords(easting, northing) {
		const os = new OSRef(easting, northing);
		let geoCoords = os.toLatLng(os);

		geoCoords.OSGB36ToWGS84();

		return geoCoords;
	},

	// Google maps' initMap function - does nothing if it does not receive an easting and northing (i.e. on page load)
	initMap: function initMap(easting = -1, northing = -1) {
		if (easting !== -1 && northing !== -1) {
			const center = this.getGeoCoords(easting, northing);

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
	},

	// Destroy and reinstate the map container element to remove maps between states of road selection
	destroyMap: function destroyMap() {
		const map = document.getElementById('map');

		// Remove the child nodes from the map (should only be one, but loop to be sure)
		while (map.hasChildNodes()) {
			map.removeChild(map.lastChild);
		}
	}
};

// Functionality for setting up the page, including populating data and setting listeners
const pageSetupAPI = {
	uniqueRoads: [],
	allRoads: [],

	// Sets an array of the individual roads
	setUniqueRoads: function setUniqueRoads(road) {
		if (this.uniqueRoads.indexOf(road) === -1) {
			this.uniqueRoads = [...this.uniqueRoads, road];
		}

		this.uniqueRoads.sort();
	},

	// Sets an array containing all unique road sections
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

	// Populates the road selection dropdown with unique roads
	populateUniqueRoadsSelect: function populateUniqueRoadsSelect() {
		let uniqueRoadSelect = document.getElementById('uniqueRoads');

		for (let road of this.uniqueRoads) {
			uniqueRoadSelect.appendChild(this.createOption(road));
		}
	},

	// Populates the road section select for each unique road
	populateRoadSectionSelect: function populateRoadSectionSelect(road) {
		let roadSectionSelect = document.getElementById('roadSection');

		this.clearOptions(roadSectionSelect);

		roadSectionSelect.appendChild(this.setDefaultOption());

		for (let roadSection of this.allRoads) {
			if (roadSection["Road"] === road) {
				// Exclude dead data with no start and end junction
				if (roadSection["StartJuntion"] !== 0 && roadSection["EndJunction"] !== 0) {
					let label = `${roadSection["StartJunction"]} to ${roadSection["EndJunction"]}`;
					roadSectionSelect.appendChild(this.createOption(label, roadSection["Easting"], roadSection["Northing"]));
				}
			}
		}
	},

	// Ensures that the road section select always has a default ('select a road section') option
	setDefaultOption: function setDefaultOption() {
		let defaultOption = document.createElement('option');

		defaultOption.setAttribute('value', 0);
		defaultOption.textContent = '-- Select a Road Section ---';

		return defaultOption;
	},

	// Clears road section options to prevent unwanted sections carrying through to other unique roads
	clearOptions: function clearOptions(select) {
		while (select.hasChildNodes()) {
			select.removeChild(select.lastChild);
		}
	},

	// Creates an option element with the relevent data, setting the easting and northing as data attributes for use elsewhere in the app
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

	// Sets listeners on the selects and checkboxes
	setListeners: function setListeners() {
		const uniqueRoadSelect = document.getElementById('uniqueRoads');
		const roadSectionSelect = document.getElementById('roadSection');
		const roadSectionContainer = document.getElementsByClassName('roadSectionSelect')[0];
		const dataControls = document.getElementsByClassName('dataControls')[0];
		const checkboxes = document.querySelectorAll('input');

		// Add and event listener to the unique roads dropdown so that it populates the sections on change
		uniqueRoadSelect.addEventListener('change', function() {
			roadSectionContainer.style.display = this.selectedIndex === 0 ? 'none' : 'block';

			// Reset the states of everything
			roadSectionContainer.selectedIndex = 0;				
			dataControls.style.display = 'none';
			roadDataAPI.resetCheckboxes();
			graphingAPI.replaceCanvas();
			mappingAPI.destroyMap();

			pageSetupAPI.populateRoadSectionSelect(this.value);
		});

		// Add an event listener to the sections so that a map and the graphs can be generated when a section is chosen
		roadSectionSelect.addEventListener('change', function() {
			if (this.selectedIndex !== 0) {
				const easting = parseInt(this.options[this.selectedIndex].getAttribute('data-easting'), 10);
				const northing = parseInt(this.options[this.selectedIndex].getAttribute('data-northing'), 10);

				// Cause the data toggles to be visible
				dataControls.style.display = 'block';

				// Initialise the map for the selected road section
				mappingAPI.initMap(easting, northing);

				// Generate the bar chart for the selected road section and chosen vehicles
				graphingAPI.barChart(roadDataAPI.getDataObjects(easting, northing));
			}
			else {
				// Reset states if the default option is selected
				dataControls.style.display = 'none';
				roadDataAPI.resetCheckboxes();
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

	// Initial page setup
	setupPage: function setupPage() {
		// Populate the dropdown of unique roads
		this.populateUniqueRoadsSelect();

		// Set the listeners
		this.setListeners();
	}
};

// Load the data from the CSV with a Promise to ensure that the app won't start without any data
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

		// Once the data is loaded, set up the page
		pageSetupAPI.setupPage();
	},
	(err) => console.log(err)
);

// Set the current year in the header copyright
(() => {
	document.getElementsByClassName('currentYear')[0].textContent = new Date().getFullYear();
})();