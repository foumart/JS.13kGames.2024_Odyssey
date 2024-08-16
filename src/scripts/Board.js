const
	screenWidth = 9,
	screenSide = 4,
	tilt = 1;

// board vars
let stageData,
	boardWidth,
	boardScale,
	units,
	field,
	mapData,
	unitsData,
	currentButtonX,
	currentButtonY,
	player,
	playerX,
	playerY;


function initBoard() {
	boardWidth = stageData.size;

	boardScale = portrait ? width > 600 ? 0.9 : 1 : height > 900 ? 0.8 : height > 600 ? 0.9 : 1;
	tween.transition = 0.01;

	mapData = [];
	unitsData = [];

	let x, y;

	/*for (y = 0; y < boardWidth; y++) {
		mapData.push([]);
		unitsData.push([]);
		for (x = 0; x < boardWidth; x++) {
			mapData[y].push(0);
			unitsData[y].push(0);
		}
	}*/
	mapData = stageData.map;
	unitsData = stageData.data;
	playerX = stageData.x;
	playerY = stageData.y;

	//extractData(stageData.map, mapData, 'f');
	//extractData(stageData.data, unitsData, '0');
	console.log(mapData);
	console.log(unitsData);
	createPlayer(playerX, playerY);

	gameContainer.innerHTML = "";

	field = [];// 2d array
	buttonsArr = [];// 2d array
	units = [];// list, units[getUnit(x, y)]

	let fieldArr, unitType, button, btnArr;
	for(y = 0; y < screenWidth; y++) {
		fieldArr = [];
		btnArr = [];
		for(x = 0; x < screenWidth; x++) {
			let _x = playerX - screenSide + x;
			let _y = playerY - screenSide + y;
			fieldArr.push(new Tile(_x, _y, mapData[_y][_x]));

			unitType = unitsData[_y][_x];
			if (unitType > 0) {
				units.push(new Unit(_x, _y, unitType));
			}

			if (state && x < screenWidth && y < screenWidth) {
				button = new Button(_x, _y);
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

	for(let y = 0; y < screenWidth; y++) {
		for(let x = 0; x < screenWidth; x++) {
			// Update base tiles
			field[y][x].resize();
			/*if (units[getUnit(playerX - screenSide + x, playerY - screenSide + y)]) {
				units[getUnit(playerX - screenSide + x, playerY - screenSide + y)].resize();
			}*/
		}
	}

	player.resize();

	if (buttonsArr) for (let y = 0; y < buttonsArr.length; y ++) {
		for (let x = 0; x < buttonsArr[y].length; x ++) {
			buttonsArr[y][x].resize();
		}
	}
}

