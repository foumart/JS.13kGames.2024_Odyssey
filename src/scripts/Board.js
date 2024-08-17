const
	screenWidth = 9,
	screenSide = 4,
	screenOffset = 8,// how many outside tiles total to draw on both sides on the mobile screen
	tilt = 1,
	jump = 2;

// board vars
let stageData,
	boardWidth,
	boardScale,
	units,
	tileField,
	mapData,
	unitsData,
	currentButtonX,
	currentButtonY,
	player,
	playerX,
	playerY,
	screenButtons;


function initBoard() {
	boardWidth = stageData.size;

	boardScale = 1;//portrait ? width > 600 ? 0.9 : 1 : height > 900 ? 0.8 : height > 600 ? 0.9 : 1;
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

	console.log(mapData);
	console.log(unitsData);
	createPlayer(playerX, playerY);

	gameContainer.innerHTML = "";

	tileField = [];// 2d array
	screenButtons = [];// 2d array
	units = [];// list, units[getUnit(x, y)]

	let fieldArr, tileType, unitType, button, btnArr;
	for(y = 0; y < screenWidth+screenOffset; y++) {
		fieldArr = [];
		btnArr = [];
		// itterating screen tiles - a 9x9 (11x11) window inside the 50x50 map
		for(x = 0; x < screenWidth+screenOffset; x++) {
			// get the screen tiles actual position on the larger map
			let _x = playerX - screenSide + x;
			let _y = playerY - screenSide + y;
			tileType = mapData[_y][_x];
			fieldArr.push(new Tile(x, y, tileType));

			if (state && x < screenWidth && y < screenWidth) {
				button = new Button(x, y, determineDirection(x, y));
				addButtonListeners(button.btn);
				btnArr.push(button);
			}
		}
		screenButtons.push(btnArr);
		tileField.push(fieldArr);
	}

	/*for(y = 0; y < boardWidth; y++) {
		for(x = 0; x < boardWidth; x++) {
			unitType = unitsData[y][x];
			if (unitType > 0) {
				units.push(new Unit(x, y, unitType));
			}
		}
	}*/
}

function addButtonListeners(button) {
	button.addEventListener(mobile ? eventName : "mousedown", buttonDown);
}

function buttonDown(event) {
	const target = /touch/.test(event.type) ? event.changedTouches[0] : event;
	currentButtonX = target.clientX;
	currentButtonY = target.clientY;
	console.log("buttonDown", target, currentButtonX, currentButtonY);
	window.addEventListener(mobile ? "touchend" : eventName, clickButton);
	//target.target.removeEventListener(eventIn, buttonDown);
	//window.addEventListener(eventRelease, clickButton);
}

function clickButton(event) {
	window.removeEventListener(mobile ? "touchend" : eventName, clickButton);
	// determine clicks and swipes
	const target = /touch/.test(event.type) ? event.changedTouches[0] : event;

	// is it a swipe or click ?
	currentButtonX = Math.round((target.clientX - currentButtonX) / player.width);
	currentButtonY = Math.round((target.clientY - currentButtonY) / player.width);

	// clicked index (x/y)
	currentButtonX = target.target.x;
	currentButtonY = target.target.y;
	console.log("clickButton: "+currentButtonX+"x"+currentButtonY);

	if (state == 1) {
		let direction = determineDirection(currentButtonX, currentButtonY);
		action(direction);
	}
}

function action(direction) {
	switch (direction) {
		case 1: // Up
			playerY --;
			player.y --;
			if (playerY < jump) {
				playerY = boardWidth-1;
				player.y += boardWidth-jump;
			}
			player.resize(playerX - screenSide, playerY - screenSide);
			break;
		case 2: // Right
			playerX ++;
			player.x ++;
			if (playerX > boardWidth-1) {
				playerX = jump;
				player.x -= boardWidth-jump;
			}
			player.resize(playerX - screenSide, playerY - screenSide);
			break;
		case 3: // Down
			playerY ++;
			player.y ++;
			if (playerY > boardWidth-1) {
				playerY = jump;
				player.y -= boardWidth-jump;
			}
			player.resize(playerX - screenSide, playerY - screenSide);
			break;
		case 4: // Left
			playerX --;
			player.x --;
			if (playerX < jump) {
				playerX = boardWidth-1;
				player.x += boardWidth-jump;
			}
			player.resize(playerX - screenSide, playerY - screenSide);
			break;
		case 5: // Center
			console.log("GG");
			break;
		default: // Corners

			break;
	}
}

function determineDirection(x, y) {
    let arr = [
		[0, 1, 1, 1, 1, 1, 1, 1, 0],
		[4, 0, 1, 1, 1, 1, 1, 0, 2],
		[4, 4, 0, 1, 1, 1, 0, 2, 2],
		[4, 4, 4, 0, 1, 0, 2, 2, 2],
		[4, 4, 4, 4, 5, 2, 2, 2, 2],
		[4, 4, 4, 0, 3, 0, 2, 2, 2],
		[4, 4, 0, 3, 3, 3, 0, 2, 2],
		[4, 0, 3, 3, 3, 3, 3, 0, 2],
		[0, 3, 3, 3, 3, 3, 3, 3, 0]
	];

    return arr[y][x];
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
	//gameContext.fillStyle = "#0078d7";
	//gameContext.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
	gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
	let _x, _y;
	for(let y = 0; y < screenWidth + screenOffset; y++) {
		for(let x = 0; x < screenWidth + screenOffset; x++) {
			// Update base tiles
			if (tileField[y]) {
				if (tileField[y][x]) {
					_x = x + playerX - (portrait ? screenSide : screenSide + screenOffset/2);
					_y = y + playerY - (portrait ? screenSide + screenOffset/2 : screenSide);
					if (mapData[_y]) {
						if (mapData[_y].length > _x) {
							tileField[y][x].update(mapData[_y][_x], playerX - screenSide, playerY - screenSide);
						}
					}
				}
			}
			
			/*let unit = units[getUnit(x + playerX - screenSide, y + playerY - screenSide)];
			if (unit) {
				unit.resize(playerX - screenSide, playerY - screenSide);
			}*/
		}
	}

	let tileWidth = player.resize(playerX - screenSide, playerY - screenSide);

	if (screenButtons) for (_y = 0; _y < screenButtons.length; _y ++) {
		for (_x = 0; _x < screenButtons[_y].length; _x ++) {
			screenButtons[_y][_x].resize();
		}
	}

	gameContext.fillStyle = "#0078d7";
	gameContext.globalAlpha = 0.4;
	gameContext.beginPath();

	for (let i = 0; i < screenOffset/2; i ++) {
		if (portrait) {
			gameContext.fillRect(0, 0, gameCanvas.width, (gameCanvas.height - width) / 2 - i*tileWidth);
			gameContext.fillRect(0, width + (gameCanvas.height - width)/2 + i*tileWidth, gameCanvas.width, (gameCanvas.height - width) / 2 - i*tileWidth);
		} else {
			gameContext.fillRect(0, 0, (gameCanvas.width - height) / 2 - i*tileWidth, gameCanvas.width);
			gameContext.fillRect(height + (gameCanvas.width - height)/2 + i*tileWidth, 0, (gameCanvas.width - height) / 2 - i*tileWidth, gameCanvas.width);
		}
	}
	gameContext.closePath();
	gameContext.globalAlpha = 1;
}

