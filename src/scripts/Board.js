const
	screenWidth = 9,// must be odd number, so there will be a central tile where player will reside
	screenSide = 4,// must be even, screenWidth / 2 | 0
	screenOffset = 8,// must be even, how many total outside tiles to draw on both sides on the wider mobile screen [3(9)3]
	tilt = 1,
	jump = 3;// how many tiles to jump when wrapping from map sides

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
	screenButtons,
	touchX, touchY, touchZ;//


function initBoard() {
	boardWidth = stageData.size;

	boardScale = 1;
	tween.transition = 0.01;

	oddDirectionalArray = generateOddArray();

	mapData = [];
	unitsData = [];
	idsData = [];

	let x, y;

	mapData = stageData.map;
	idsData = stageData.ids;
	//unitsData = stageData.data;

	for(let y = 0; y < boardWidth; y++) {
		for(let x = 0; x < boardWidth; x++) {
			// Update base tiles
			if (mapData[y][x] == 1) {
				if (stageData.data[y][x] > 1) {
					mapData[y][x] = stageData.data[y][x];
				}
			} else if (stageData.data[y][x]) {
				mapData[y][x] = 7 + stageData.data[y][x];
			}
			/*if (units[getUnit(x, y)]) {
			}*/
		}
	}

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
		// itterating screen tiles - a 9x9 (+screenOffset) window inside the 50x50 map
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
	button.addEventListener(interactionDown, buttonDown);
}

function buttonDown(event) {
	const target = /touch/.test(event.type) ? event.changedTouches[0] : event;
	currentButtonX = target.clientX;
	currentButtonY = target.clientY;
	touchZ = false;
	//console.log("buttonDown", target, currentButtonX, currentButtonY);
	window.addEventListener(interactionUp, clickButton);
	window.addEventListener(interactionMove, moveButton);
}

function moveButton(event) {
	if (/touch/.test(event.type)) {
		let touches = event.touches;
		//[{pageX:event.touches[0].pageX,pageY:event.touches[0].pageY},{pageX:width/2,pageY:height*0.75}];// simulate

		touchZ = touches.length > 1;
		if (touchZ) {
			let offX = touches[1].pageX > touches[0].pageX ? touches[1].pageX - touches[0].pageX : touches[0].pageX - touches[1].pageX;
			let offY = touches[1].pageY > touches[0].pageY ? touches[1].pageY - touches[0].pageY : touches[0].pageY - touches[1].pageY;
			if (portrait) {
				onBoardZoom({deltaY: touchY - offY});
			} else {
				onBoardZoom({deltaY: touchX - offX});
			}
			touchX = offX;
			touchY = offY;
		}
	}
}

function clickButton(event) {
	window.removeEventListener(interactionUp, clickButton);
	window.removeEventListener(interactionMove, moveButton);
	// determine clicks and swipes
	const target = /touch/.test(event.type) ? event.changedTouches[0] : event;

	// is it a swipe or click ?
	currentButtonX = Math.round((target.clientX - currentButtonX) / player.width);
	currentButtonY = Math.round((target.clientY - currentButtonY) / player.width);
	if (currentButtonX || currentButtonY) {
		//console.log("swipe: "+currentButtonX+"x"+currentButtonY);
		if (state == 1) {
			if (Math.abs(currentButtonX) > Math.abs(currentButtonY)) {
				action(currentButtonX > 0 ? 4 : 2);
				return;
			} else if (Math.abs(currentButtonY) > Math.abs(currentButtonX)) {
				action(currentButtonY > 0 ? 1 : 3);
				return;
			}
		}
	}

	// were we zooming the map by double touch?
	if (touchZ) {

	} else {
		// clicked index (x/y)
		currentButtonX = target.target.x;
		currentButtonY = target.target.y;
		//console.log("clickButton: "+currentButtonX+"x"+currentButtonY);

		if (state == 1) {
			let direction = determineDirection(currentButtonX, currentButtonY);
			action(direction);
		}
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
			console.log("Ship");
			break;
		default: // Corners

			break;
	}
}

function determineDirection(x, y) {
	return oddDirectionalArray[y][x];
}

function generateOddArray() {
	// Initialize the 2D array with all elements as 0
	const array = islandGenerator.initArray(0, screenWidth);
	// Array.from({ length: n }, () => Array(n).fill(0));

	// Fill the directional regions around the center
	for (let i = 0; i < screenWidth; i++) {
		for (let j = 0; j < screenWidth; j++) {
			if (i === screenSide && j === screenSide) {
				array[i][j] = 5; // Center element
			} else if (i < j && i + j < screenWidth - 1) {
				array[i][j] = 1; // Top region
			} else if (i < j && i + j > screenWidth - 1) {
				array[i][j] = 2; // Right region
			} else if (i > j && i + j > screenWidth - 1) {
				array[i][j] = 3; // Bottom region
			} else if (i > j && i + j < screenWidth - 1) {
				array[i][j] = 4; // Left region
			}
		}
	}

	return array;
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
	gameContext.fillStyle = "#0078d7";
	gameContext.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
	//gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
	let _x, _y, _z,
		_ox = portrait ? screenSide : screenSide + screenOffset/2,
		_oy = !portrait ? screenSide : screenSide + screenOffset/2;

	for(let y = 0; y < screenWidth + screenOffset; y++) {
		for(let x = 0; x < screenWidth + screenOffset; x++) {
			// Update base tiles
			if (tileField[y]) {
				if (tileField[y][x]) {
					_x = x + playerX - _ox - (portrait?screenOffset/2:0);
					_y = y + playerY - _oy - (!portrait?screenOffset/2:0);
					_z = mapData[_y] && mapData[_y].length > _x ? mapData[_y][_x] : 0;
					tileField[y][x].update(
						_z,
						playerX - _ox,
						playerY - _oy,
						(x < screenOffset/2 ? screenOffset/2 - x : x >= screenWidth + screenOffset/2 ? x - screenWidth + 1 - screenOffset/2 : 0) +
						(y < screenOffset/2 ? screenOffset/2 - y : y >= screenWidth + screenOffset/2 ? y - screenWidth + 1 - screenOffset/2 : 0)
					)
				}
			}

			/*let unit = units[getUnit(x + playerX - screenSide, y + playerY - screenSide)];
			if (unit) {
				unit.resize(playerX - screenSide, playerY - screenSide);
			}*/
		}
	}

	let tileWidth = player.resize(playerX - screenSide, playerY - screenSide);

	if (screenButtons) {
		for (_y = 0; _y < screenButtons.length; _y ++) {
			for (_x = 0; _x < screenButtons[_y].length; _x ++) {
				screenButtons[_y][_x].update(1, playerX - _ox, playerY - _oy);
			}
		}
	}
}

