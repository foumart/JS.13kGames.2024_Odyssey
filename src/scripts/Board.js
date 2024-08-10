// board vars
let stageData,
	boardWidth,
	boardScale,
	buttonsArr,
	units,
	field,
	mapData,
	unitsData,
	currentButtonX,
	currentButtonY,
	tilt,
	player;

// Used for map data compression
// TODO: should use binary => hex, ex: "A8030600" instead of "9580033c000c"
let pairs = [
	[0, 0],// 0
	[0, 1],// 1
	[0, 2],// 2
	[0, 3],// 3
	[1, 0],// 4
	[1, 1],// 5
	[1, 2],// 6
	[1, 3],// 7
	[2, 0],// 8
	[2, 1],// 9
	[2, 2],// 10 A
	[2, 3],// 11 B
	[3, 0],// 12 C
	[3, 1],// 13 D
	[3, 2],// 14 E
	[3, 3]//  15 F
];

function initBoard() {

	boardWidth = stageData.size;

	boardScale = portrait ? width > 600 ? 0.9 : 1 : height > 900 ? 0.8 : height > 600 ? 0.9 : 1;
	tilt = 1;
	tween.transition = 0.01;

	mapData = [];
	unitsData = [];

	let x, y;

	for (y = 0; y < boardWidth; y++) {
		mapData.push([]);
		unitsData.push([]);
		for (x = 0; x < boardWidth; x++) {
			mapData[y].push(0);
			unitsData[y].push(0);
		}
	}

	extractData(stageData.map, mapData, 'f');
	extractData(stageData.data, unitsData, '0');
	//console.log(mapData);
	//console.log(unitsData);
	createPlayer(stageData.x, stageData.y);

	gameContainer.innerHTML = "";

	field = [];// 2d array
	buttonsArr = [];// 2d array
	units = [];// list, units[getUnit(x, y)]

	let fieldArr, unitType, button, btnArr;
	for(y = 0; y < boardWidth; y++) {
		fieldArr = [];
		btnArr = [];
		for(x = 0; x < boardWidth; x++) {
			fieldArr.push(new Tile(x, y, mapData[y][x]));

			unitType = unitsData[y][x];
			if (unitType > 0) {
				units.push(new Unit(x, y, unitType));
			}

			if (state && x && y && x < boardWidth-1 && y < boardWidth-1) {
				button = new Button(x, y);
				addButtonListeners(button.btn);
				btnArr.push(button);
			}
		}
		buttonsArr.push(btnArr);
		field.push(fieldArr);
	}
}

function addButtonListeners(button) {
	if (mobile) {
		button.addEventListener(eventName, rollButton);
	} else {
		button.addEventListener("mousedown", rollButton);
	}
}

function rollButton(event) {
	const target = /touch/.test(event.type) ? event.changedTouches[0] : event;
	currentButtonX = target.clientX;
	currentButtonY = target.clientY;
	console.log("rollButton", target, currentButtonX, currentButtonY);

	if (mobile) {
		window.addEventListener("touchend", clickButton);
	} else {
		window.addEventListener(eventName, clickButton);
	}
}

function clickButton(event) {
	// determine clicks and swipes
	const target = /touch/.test(event.type) ? event.changedTouches[0] : event;

	// is it a swipe or click ?
	currentButtonX = Math.round((target.clientX - currentButtonX) / player.width);
	currentButtonY = Math.round((target.clientY - currentButtonY) / player.width);
	console.log("swipe("+currentButtonX + "x" + currentButtonY+")");

	// clicked index (x/y)
	currentButtonX = ((target.x-offsetX/2)/player.width|0);
	currentButtonY = ((target.y-offsetY/2)/player.width|0);
	console.log("clickButton: "+currentButtonX+"x"+currentButtonY);

	if (mobile) {
		window.removeEventListener("touchend", clickButton);
	} else {
		window.removeEventListener(eventName, clickButton);
	}
}

function extractData(map, data, empty) {
	map = map.split('');
	// fill up the ommitted data// Adding tiles on each side of the map in order to have space for coasts
	let totalMapLength = Math.ceil(boardWidth * boardWidth / 2);
	for (let i = map.length; i < totalMapLength; i ++) {
		map.push(empty);
	}

	map.forEach((element, index) => {
		const tileData = pairs[parseInt(element, 16)];
		const y = (index * 2) / boardWidth | 0;
		const x = index * 2 % boardWidth;
		data[y][x] = tileData[0];
		if (x < boardWidth) data[y][x + 1] = tileData[1];
		else if (y < boardWidth) data[y + 1][1] = tileData[1];
	});
}

function extractHex(map, data) {
	map.forEach((element, index) => {
		if (element != ' ') data[index / boardWidth | 0][index % boardWidth] = parseInt(element, 16);
	});
}

function createPlayer(x, y) {
	player = new Player(x, y);
}

/*function isPassable(x, y) {
	return mapData[y][x] < 2 && unitsData[y][x] < 3;
}

function isMoveable(x, y) {
	return mapData[y][x] < 2 && unitsData[y][x] < 1;
}*/

function getUnit(x, y) {
	let id = -1;
	units.forEach((unit, index) => {
		if (unit.x == x && unit.y == y) {
			id = index;
		}
	});

	return id;
}

// Draw the board
function drawBoard() {
	gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

	for(let y = 0; y < boardWidth; y++) {
		for(let x = 0; x < boardWidth; x++) {
			// Update base tiles
			field[y][x].resize();
			if (units[getUnit(x, y)]) {
				units[getUnit(x, y)].resize();
			}
		}
	}

	player.resize();

	if (buttonsArr) for (let y = 0; y < buttonsArr.length; y ++) {
		for (let x = 0; x < buttonsArr[y].length; x ++) {
			buttonsArr[y][x].resize();
		}
	}
}

