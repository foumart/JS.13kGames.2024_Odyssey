const
	screenWidth = 9,// must be odd number, so there will be a central tile where player will reside
	screenSide = 4,// must be even, screenWidth / 2 | 0
	screenOut = 8,// must be even, how many total outside tiles to draw on both sides on the wider mobile screen [3(9)3]
	tilt = 1,
	jump = 3;// how many tiles to jump when wrapping from map sides

// board vars
let stageData,
	boardWidth,
	boardScale,
	unitsList,
	tileScreen,
	unitScreen,
	buttonScreen,
	mapData,
	idsData,
	unitsData,
	currentButtonX,
	currentButtonY,
	oddDirectionalArray,
	touchX, touchY, touchZ;
let boardPlayer,
	boardShip,
	playerX,
	playerY,
	shipX,
	shipY;


function initBoard() {
	boardWidth = stageData.size;//defined in Game.js getStageData

	boardScale = 1;
	tween.transition = 0.01;

	oddDirectionalArray = generateOddArray();

	let x, y, renderedScreenSize = screenWidth + screenOut;

	mapData = stageData.visited;// 2d array of 0 (empty) and 1 (occupied)
	idsData = stageData.ids;// 2d array of 0 (water) 1-13 (isle ids)
	unitsData = islandGenerator.initArray();// 2d array of 0 (empty) - 1,2,3.. (unit ids)
	unitsList = [];

	// starting town position
	playerX = shipX = stageData.x;
	playerY = shipY = stageData.y;
	// setting player next to the town
	if (mapData[playerY+1][playerX]) {
		playerY ++;
	} else if (mapData[playerY][playerX+1]) {
		playerX ++;
	} else if (mapData[playerY][playerX-1]) {
		playerX --;
	} else if (mapData[playerY-1][playerX]) {
		playerY --;
	}
	// setting the ship around on a water tile
	while (mapData[shipY][shipX]) {
		if (Math.random() < .5) shipX ++;
		else shipY ++;
	}

	boardPlayer = createPlayer(playerX, playerY, UnitType.PLAYER);
	unitsList.push(boardPlayer);
	unitsData[playerY][playerX] = UnitType.PLAYER;

	boardShip = createShip(shipX, shipY, UnitType.SHIPUP);
	unitsList.push(boardShip);
	unitsData[shipY][shipX] = UnitType.SHIPUP;


	// combine data and relief into tile ids and create some random units
	for(y = 0; y < boardWidth; y++) {
		for(x = 0; x < boardWidth; x++) {
			// Update base tiles
			if (mapData[y][x] == 1) {
				if (stageData.relief[y][x] > 1) {
					mapData[y][x] = TileType.FOREST;//stageData.relief[y][x];
				}
			} else if (stageData.relief[y][x]) {
				mapData[y][x] = TileType.TILE8;// + stageData.relief[y][x];
			}

			if (Math.random()<.05 && unitsList.length < 10 && x > 9 && x < boardWidth-9 && y > 9 && y < boardWidth-9) {
				unitsList.push(createUnit(x, y, UnitType.ENEMY1));
				unitsData[y][x] = UnitType.ENEMY1;
			}
		}
	}

	//console.log(mapData);
	//console.log(unitsData);
	//console.log(unitsList);
	// data initialization completed

	gameContainer.innerHTML = "";

	// now preparing to render only what is visible inside the game window
	tileScreen = [];// 2d array (renderedScreenSize x renderedScreenSize)
	unitScreen = [];// 2d array (renderedScreenSize x renderedScreenSize)
	buttonScreen = [];// 2d array (renderedScreenSize x renderedScreenSize)

	let tileArr, unitArr, btnArr, tileType, unitType, button;
	for(y = 0; y < renderedScreenSize; y++) {
		tileArr = [];
		btnArr = [];
		unitArr = [];
		// itterating screen tiles - a 9x9 (screenWidth+screenOut) window inside the 40x40 (boardWidth) map
		for(x = 0; x < renderedScreenSize; x++) {
			// get the screen tiles actual position on the larger map
			let _x = playerX - screenSide + x;
			let _y = playerY - screenSide + y;
			tileType = mapData[_y][_x];
			tileArr.push(new BoardTile(x, y, tileType));
			unitType = unitsData[_y][_x];
			unitArr.push(new BoardUnit(x, y, unitType));

			if (state && x < screenWidth && y < screenWidth) {
				button = new BoardButton(x, y, determineDirection(x, y));
				addButtonListeners(button.btn);
				btnArr.push(button);
			}
		}
		buttonScreen.push(btnArr);
		tileScreen.push(tileArr);
		unitScreen.push(unitArr);
	}
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
	currentButtonX = Math.round((target.clientX - currentButtonX) / boardPlayer.width);
	currentButtonY = Math.round((target.clientY - currentButtonY) / boardPlayer.width);
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

// Draw the board
function drawBoard() {
	gameContext.fillStyle = "#4d4de8";
	gameContext.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
	//gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
	let _x, _y, _z,
		_ox = portrait ? screenSide : screenSide + screenOut/2,
		_oy = !portrait ? screenSide : screenSide + screenOut/2;

	for(let y = 0; y < screenWidth + screenOut; y++) {
		for(let x = 0; x < screenWidth + screenOut; x++) {
			// Update base tiles
			if (tileScreen[y]) {
				if (tileScreen[y][x]) {
					_x = x + playerX - _ox - (portrait?screenOut/2:0);
					_y = y + playerY - _oy - (!portrait?screenOut/2:0);
					_z = mapData[_y] && mapData[_y].length > _x ? mapData[_y][_x] : 0;
					tileScreen[y][x].update(
						_z,
						(x < screenOut/2 ? screenOut/2 - x : x >= screenWidth + screenOut/2 ? x - screenWidth + 1 - screenOut/2 : 0) +
						(y < screenOut/2 ? screenOut/2 - y : y >= screenWidth + screenOut/2 ? y - screenWidth + 1 - screenOut/2 : 0)
					)
					//if (unitScreen[y][x]) unitScreen[y][x].update();
				}
			}
		}
	}

	for(let y = 0; y < screenWidth + screenOut; y++) {
		for(let x = 0; x < screenWidth + screenOut; x++) {
			if (unitScreen[y]) {
				if (unitScreen[y][x]) {
					_x = x + playerX - _ox - (portrait?screenOut/2:0);
					_y = y + playerY - _oy - (!portrait?screenOut/2:0);
					_z = unitsData[_y] && unitsData[_y].length > _x ? unitsData[_y][_x] : 0;
					unitScreen[y][x].update(
						_z,
						(x < screenOut/2 ? screenOut/2 - x : x >= screenWidth + screenOut/2 ? x - screenWidth + 1 - screenOut/2 : 0) +
						(y < screenOut/2 ? screenOut/2 - y : y >= screenWidth + screenOut/2 ? y - screenWidth + 1 - screenOut/2 : 0)
					)
				}
			}
		}
	}

	if (buttonScreen) {
		for (_y = 0; _y < buttonScreen.length; _y ++) {
			for (_x = 0; _x < buttonScreen[_y].length; _x ++) {
				buttonScreen[_y][_x].update(1, playerX - _ox, playerY - _oy);
			}
		}
	}
}

function getUnit(x, y) {
	let id = -1;
	unitsList.forEach((unit, index) => {
		if (unit.x == x && unit.y == y) {
			id = index;
		}
	});

	return id;
}
