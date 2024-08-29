const
	screenWidth = 9,// must be odd number, so there will be a central tile where player will reside
	screenSide = 4,// must be even, screenWidth / 2 | 0
	screenOut = 6,// must be even, number of outside tiles total on both sides on a wider mobile screen (affects zooming)
	tilt = 1,
	jump = 3;// how many tiles to jump when wrapping from map sides

// board vars
let stageData,
	boardWidth,// map total width x height
	boardScale,
	unitsList,
	tileScreen,
	unitScreen,
	buttonScreen,
	visitedData,
	mapData,
	idsData,
	islesData,
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

	let x, y, unit, renderedScreenSize = screenWidth + screenOut;
	oddDirectionalArray = generateOddArray(renderedScreenSize);

	visitedData = stageData.visited.map(row => [...row]);// 2d array of 0 (empty) and 1 (occupied)
	mapData = visitedData.map(row => [...row]);// 2d array of concrete map data (TileType + coastal edges 11-25)
	idsData = stageData.ids.map(row => [...row]);// 2d array of 0 (water) 1-13 (isle ids)
	unitsData = islandGenerator.initArray();// 2d array of 0 (empty) - 1,2,3.. (unit ids)
	islesData = stageData.islands.splice(0);// start location and directions of consecutive generation
	unitsList = [];

	//if (_debug) islandGenerator.debugInfo();

	// determine tiles and create some random units
	for(y = 0; y < boardWidth; y++) {
		for(x = 0; x < boardWidth; x++) {
			// Update base land tiles (0: water, 1: land)
			if (mapData[y][x]) {

				// place trees and mountains if there is relief data on land
				if (stageData.relief[y][x] > 1) {
					unitsList.push(createUnit(x, y, stageData.relief[y][x] > 2 ? UnitType.MOUNT : UnitType.TREE));
					unitsData[y][x] = stageData.relief[y][x] > 2 ? UnitType.MOUNT : UnitType.TREE;
				}

				// walk through all islands to place castles and shrines
				islesData.forEach((data, index) => {
					if (x == data[0] && y == data[1]) {
						unit = createUnit(x, y, index < 6 ? UnitType.CASTLE : UnitType.SHRINE)
						unitsList.push(unit);
						unitsData[y][x] = index < 6 ? UnitType.CASTLE : UnitType.SHRINE;
						// set castle origin color flag (0:none, 1:red player, 2:blue neutral, 3: black enemy)
						unit.origin = index < 6 ? 2 + (index ? index % 3 : -1) : 0;
					}
				});

				if (mapData[y][x] == TileType.WATER) {// convert all initial tiles to land
					mapData[y][x] = TileType.LAND;
				}

				if (!visitedData[y-1][x] || idsData[y-1][x] != idsData[y][x]) {// ^
					mapData[y][x] = mapData[y][x] == TileType.LAND ? 14 : TileType.LAND;
				}

				if (!visitedData[y][x-1] || idsData[y][x-1] != idsData[y][x]) {// <
					mapData[y][x] = mapData[y][x] == TileType.LAND ? 13 : mapData[y][x] == 14 ? 18 : TileType.LAND;
				}

				if (!visitedData[y][x+1] || idsData[y][x+1] != idsData[y][x]) {// >
					mapData[y][x] = mapData[y][x] == TileType.LAND ? 11 :
					mapData[y][x] == 12 ? 16 :
					mapData[y][x] == 13 ? 23 :
					mapData[y][x] == 14 ? 15 :
					mapData[y][x] == 17 ? 21 :
					mapData[y][x] == 18 ? 19 :
					mapData[y][x] == 22 ? 25 :
					mapData[y][x] == 24 ? 20 : TileType.LAND;
				}

				if (!visitedData[y+1][x] || idsData[y+1][x] != idsData[y][x]) {// v
					mapData[y][x] = mapData[y][x] == TileType.LAND ? 12 :
					mapData[y][x] == 11 ? 16 :
					mapData[y][x] == 13 ? 17 :
					mapData[y][x] == 14 ? 24 :
					mapData[y][x] == 15 ? 20 :
					mapData[y][x] == 18 ? 22 :
					mapData[y][x] == 19 ? 25 :
					mapData[y][x] == 23 ? 21 : mapData[y][x];
				}

			} else {
				// convert depths to water based on the adjacent tiles and relief
				if (
					y && x && mapData[y-1][x-1] > TileType.WATER ||
					y < boardWidth-1 && x < boardWidth-1 && (mapData[y+1][x+1] || stageData.relief[y+1][x+1]) ||
					
					y && x < boardWidth-1 && mapData[y-1][x+1] > TileType.WATER ||
					y < boardWidth-1 && x && (mapData[y+1][x-1] || stageData.relief[y+1][x]) ||
					
					y && mapData[y-1][x] > TileType.WATER ||
					y>1 && mapData[y-2][x] > TileType.WATER ||
					y < boardWidth-1 && (mapData[y+1][x] || stageData.relief[y+1][x]) ||
					y < boardWidth-2 && mapData[y+2][x] ||
					x && mapData[y][x-1] > TileType.WATER ||
					x>1 && mapData[y][x-2] > TileType.WATER ||
					x < boardWidth-1 && (mapData[y][x+1] || stageData.relief[y][x+1]) ||
					x < boardWidth-2 && mapData[y][x+2]
				) {
					mapData[y][x] = TileType.WATER;
				}

				// convert water tiles to riffs based on relief data
				if (stageData.relief[y][x]) {
					mapData[y][x] = stageData.relief[y][x] == 1 ? TileType.RIFF1 : stageData.relief[y][x] > 2 ? TileType.RIFF3 : TileType.RIFF2;
				}
			}

			if (
				Math.random()<.1 && unitsList.length < 10 && x > 9 && x < boardWidth-9 && y > 9 && y < boardWidth-9 &&
				getUnitId(x-1, y) == -1 && getUnitId(x+1, y) == -1 && getUnitId(x, y-1) == -1 && getUnitId(x, y+1) == -1
			) {
				unitsList.push(createUnit(x, y, UnitType.GOLD));
				unitsData[y][x] = UnitType.GOLD;
			}
		}
	}

	// starting town position
	playerX = shipX = stageData.x;
	playerY = shipY = stageData.y;
	// setting player next to the town
	if (isPassable(playerX+1, playerY+1)) {
		playerX ++; playerY ++;
	} else if (isPassable(playerX-1, playerY+1)) {
		playerX --; playerY ++;
	} else if (isPassable(playerX, playerY+1)) {
		playerY ++;
	} else if (isPassable(playerX+1, playerY)) {
		playerX ++;
	} else if (isPassable(playerX-1, playerY)) {
		playerX --;
	} else if (isPassable(playerX, playerY-1)) {
		playerY --;
	}
	// setting the ship around on a water tile
	while (mapData[shipY][shipX] > 9) {
		if (Math.random() < .5) shipX ++;
		else shipY ++;
	}

	boardPlayer = createPlayer(playerX, playerY, UnitType.PLAYER);
	unitsList.push(boardPlayer);
	unitsData[playerY][playerX] = UnitType.PLAYER;

	boardShip = createShip(shipX, shipY, UnitType.SHIPLEFT);
	unitsList.push(boardShip);
	unitsData[shipY][shipX] = UnitType.SHIPLEFT;

	if (_debug) console.log(
		"map:\n"+mapData.map(arr => arr.map(num => (num.toString(16).length == 1 ? "0" + num.toString(16) : num.toString(16)).toUpperCase())).join("\n")
	);

	// data initialization completed

	gameContainer.innerHTML = "";

	// now preparing to render only what is visible inside the game window
	tileScreen = [];// 2d array (renderedScreenSize x renderedScreenSize)
	unitScreen = [];// 2d array
	buttonScreen = [];// 2d array

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

			if (state) {
				button = new BoardButton(x - screenOut/2, y - screenOut/2, determineDirection(x, y));
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
	if (!x && !y) return -1;
	return oddDirectionalArray[y][x];
}

function generateOddArray(size) {
	const array = islandGenerator.initArray(0, size);

	// Fill the directional regions around the center
	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
			if (i < j && i + j < size - 1) {
				array[i][j] = 1; // Top region
			} else if (i < j && i + j > size - 1) {
				array[i][j] = 2; // Right region
			} else if (i > j && i + j > size - 1) {
				array[i][j] = 3; // Bottom region
			} else if (i > j && i + j < size - 1) {
				array[i][j] = 4; // Left region
			}
		}
	}

	// Set the central tile to 5
	array[size/2|0][size/2|0] = 5;

	return array;
}

// Draw the board
function drawBoard() {
	//if (!tween.transitionX && !tween.transitionY) {
		gameContext.fillStyle = "#4848e3";
		gameContext.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
	//}

	//gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
	let _unit, _x, _y, _z,
		_ox = portrait ? screenSide : screenSide + screenOut/2,
		_oy = !portrait ? screenSide : screenSide + screenOut/2;

	// Update base tiles
	for(let y = 0; y < screenWidth + screenOut; y++) {
		for(let x = 0; x < screenWidth + screenOut; x++) {
			if (tileScreen[y]) {
				if (tileScreen[y][x]) {
					_x = x + playerX - _ox - (portrait?screenOut/2:0);
					_y = y + playerY - _oy - (!portrait?screenOut/2:0);
					_z = mapData[_y] && mapData[_y].length > _x ? mapData[_y][_x] : 0;
					tileScreen[y][x].update(_z);//
						//_z,
						//(x < screenOut/2 ? screenOut/2 - x : x >= screenWidth + screenOut/2 ? x - screenWidth + 1 - screenOut/2 : 0) +
						//(y < screenOut/2 ? screenOut/2 - y : y >= screenWidth + screenOut/2 ? y - screenWidth + 1 - screenOut/2 : 0)
					//)
				}
			}
		}
	}

	// Update units
	for(let y = 0; y < screenWidth + screenOut; y++) {
		for(let x = 0; x < screenWidth + screenOut; x++) {
			if (unitScreen[y]) {
				if (unitScreen[y][x]) {
					_x = x + playerX - _ox - (portrait?screenOut/2:0);
					_y = y + playerY - _oy - (!portrait?screenOut/2:0);
					_z = unitsData[_y] && unitsData[_y].length > _x ? unitsData[_y][_x] : 0;

					unitScreen[y][x].reset();

					if (_z) {
						if (_x == playerX && _y == playerY) {
							// make sure we draw the player underlay object
							unitScreen[y][x].overlay = player.overlay;
							unitScreen[y][x].selection = player.selection;
							unitScreen[y][x].origin = player.origin;
						} else if (_x == shipX && _y == shipY) {
							// set ship owner
							unitScreen[y][x].origin = ship.origin;
						} else {
							// set castle owner
							_unit = getUnit(_x, _y);
							if (_unit && _unit.origin) {
								unitScreen[y][x].origin = _unit.origin;
							}
						}
					}
	
					unitScreen[y][x].update(_z);//
						//_z,
						//(x < screenOut/2 ? screenOut/2 - x : x >= screenWidth + screenOut/2 ? x - screenWidth + 1 - screenOut/2 : 0) +
						//(y < screenOut/2 ? screenOut/2 - y : y >= screenWidth + screenOut/2 ? y - screenWidth + 1 - screenOut/2 : 0)
					//);
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
	return unitsList[getUnitId(x, y)];
}

function getUnitId(x, y) {
	let id = -1;
	unitsList.forEach((unit, index) => {
		if (unit.x == x && unit.y == y) {
			id = index;
		}
	});

	return id;
}
