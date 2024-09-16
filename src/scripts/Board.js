const
	screenWidth = 7,// must be odd number, so there will be a central tile where player will reside
	screenSide = 3,// must be screenWidth / 2 | 0
	screenOut = 16,// must be even, number of outside tiles total on both sides on a wider mobile screen (affects zooming)
	jump = 3;// how many tiles to jump when wrapping from map sides

// board vars
let stageData,
	boardWidth,// map total width x height
	boardScale,// board user zoom amount
	boardZoom,// board engine zoom amount
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
	oddDirectionalArray,// used for direction determination on touch interaction
	gameDirty, // should we redraw screen on next frame paint, 1: clears map + units; 2: clears only units
	touchX, touchY, touchZ;// are we trying to zoom the map
let boardPlayer,
	boardShip,
	enemies,
	castles,
	playerX,
	playerY,
	shipX,
	shipY,
	townX,
	townY;

function onBoardZoom(event) {
	if (state && !inBattle) {
		if (event.deltaY < 0 && boardScale < 2) boardScale += (boardScale < 1 ? 0.05 : 0.1);
		else if (event.deltaY > 0 && boardScale > 0.7) boardScale -= (boardScale < 1 ? 0.05 : 0.1);
		boardScale = +boardScale.toFixed(2);
		gameDirty = 2;
		drawBoard();
	}
}

function initBoard() {
	boardWidth = stageData.size;//defined in Game.js getStageData

	boardScale = 1;
	boardZoom = state ? 0 : 0.7;

	let x, y, unit, renderedScreenSize = screenWidth + screenOut;
	let t=0,
		e1=0,
		e2=0,
		e3=0,
		g1=0,
		g2=0,
		treasures = [];
	oddDirectionalArray = generateOddArray(renderedScreenSize);

	visitedData = stageData.visited.map(row => [...row]);// 2d array of 0 (empty) and 1 (occupied) - will be mutated
	mapData = visitedData.map(row => [...row]);// 2d array of concrete map data (TileType + coastal edges 11-25)
	idsData = stageData.ids.map(row => [...row]);// 2d array of 0 (water) 1-13 (isle ids)
	unitsData = islandGenerator.initArray();// 2d array of 0 (empty) - 1,2,3.. (unit ids)
	islesData = stageData.islands.splice(0);// start location and directions of consecutive generation (-1,0) left, (0,-1) up, etc.
	unitsList = [];
	enemies = [];
	castles = [];

	// determine tiles and create some random units
	for(y = 0; y < boardWidth; y++) {
		for(x = 0; x < boardWidth; x++) {
			// Update base land tiles (0: water, 1: land)
			if (mapData[y][x]) {

				// place trees if there is relief data on land
				if (stageData.relief[y][x] > 1) {
					t ++;
					unit = createUnit(x, y, UnitType.TREE);
					unit.apple = 1;
					unitsList.push(unit);
					unitsData[y][x] = UnitType.TREE;
					// if (stageData.relief[y][x] > 2) // can be used to place something special
				}

				// walk through all islands to place castles and shrines
				islesData.forEach((data, index) => {
					if (x == data[0] && y == data[1]) {
						unit = createUnit(x, y, index < 6 ? UnitType.CASTLE : UnitType.SHRINE);
						unitsList.push(unit);
						unitsData[y][x] = index < 6 ? UnitType.CASTLE : UnitType.SHRINE;
						// set castle origin color flag
						unit.origin = index < 6 ? 1 + index : 0;
						//unit.rumors = 1;

						// Add enemies to dungeons
						if (index >= 6) {
							unit.dungeon = [];
							// generate at least 3 floors per dungeon up to 9 floors for the last 7th dungeon
							for (let i = 0; i < index-3; i++) {
								let arr = [], rand, newEnemy;
								for (let j = 4; j < i+6; j++) {
									// add different enemies on each floor
									rand = 0;
									while (!rand || arr.length && newEnemy == arr[arr.length-1]) {
										rand = Math.random();
										newEnemy = islandGenerator.rand(i/2 + (j-3)*rand, i - 1);
										if (newEnemy > 8) newEnemy = 8;
									}
									arr.push(newEnemy);
								}
								// generate 1st floor boss
								if (!i) arr.push(islandGenerator.rand(index/2-2, index-6));
								// generate final floor boss
								if (i > 3) arr.push(i + 1);
								unit.dungeon.push(arr);
							}
						}
					}
				});

				if (mapData[y][x] == TileType.WATER) {// convert all initial tiles to land
					mapData[y][x] = TileType.LAND;
				}

				if (!visitedData[y-1][x] || idsData[y-1][x] != idsData[y][x]) {// ^
					mapData[y][x] = mapData[y][x] == TileType.LAND ? TileType.LAND+4 : TileType.LAND;
				}

				if (!visitedData[y][x-1] || idsData[y][x-1] != idsData[y][x]) {// <
					mapData[y][x] = mapData[y][x] == TileType.LAND ? TileType.LAND+3 : mapData[y][x] == TileType.LAND+4 ? TileType.LAND+6 : TileType.LAND;
				}

				if (!visitedData[y][x+1] || idsData[y][x+1] != idsData[y][x]) {// >
					mapData[y][x] = mapData[y][x] == TileType.LAND ? TileType.LAND+1 :
					mapData[y][x] == TileType.LAND+2 ? TileType.LAND+7 :
					mapData[y][x] == TileType.LAND+3 ? TileType.LAND+13 :
					mapData[y][x] == TileType.LAND+4 ? TileType.LAND+8 :
					mapData[y][x] == TileType.LAND+5 ? TileType.LAND+11 :
					mapData[y][x] == TileType.LAND+6 ? TileType.LAND+9 :
					mapData[y][x] == TileType.LAND+12 ? TileType.LAND+15 :
					mapData[y][x] == TileType.LAND+14 ? TileType.LAND+10 : TileType.LAND;
				}

				if (!visitedData[y+1][x] || idsData[y+1][x] != idsData[y][x]) {// v
					mapData[y][x] = mapData[y][x] == TileType.LAND ? TileType.LAND+2 :
					mapData[y][x] == TileType.LAND+1 ? TileType.LAND+7 :
					mapData[y][x] == TileType.LAND+3 ? TileType.LAND+5 :
					mapData[y][x] == TileType.LAND+4 ? TileType.LAND+14 :
					mapData[y][x] == TileType.LAND+8 ? TileType.LAND+10 :
					mapData[y][x] == TileType.LAND+6 ? TileType.LAND+12 :
					mapData[y][x] == TileType.LAND+9 ? TileType.LAND+15 :
					mapData[y][x] == TileType.LAND+13 ? TileType.LAND+11 : mapData[y][x];
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

				// convert water tiles to riffs based on relief data (stageData.relief[y][x] > 2 ? RIFF3)
				if (stageData.relief[y][x]) {
					mapData[y][x] = stageData.relief[y][x] == 1 ? TileType.RIFF1 : TileType.RIFF2;
				}
			}

			// obscure the stage in clouds, 00: full clouds, 01: partially visible, 02: no clouds
			if (y>1 && x) {
				obscureTile(x, y);
			}
		}
	}

	// starting town position
	townX = playerX = shipX = stageData.x;
	townY = playerY = shipY = stageData.y;
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
	while (
		mapData[shipY][shipX] > TileType.RIFF2 ||
		isWalkable(shipX-1, shipY) && isWalkable(shipX+1, shipY) && isWalkable(shipX, shipY-1) && isWalkable(shipX, shipY+1)
	) {
		if (Math.random() < .5) shipX ++;
		else shipY ++;
	}

	gamePlayer = createUnit(playerX, playerY, UnitType.PLAYER);
	unitsList.push(gamePlayer);
	unitsData[playerY][playerX] = UnitType.PLAYER;

	gameShip = createUnit(shipX, shipY, UnitType.SHIPRIGHT);
	unitsList.push(gameShip);
	unitsData[shipY][shipX] = UnitType.SHIPRIGHT;

	for(y = 0; y < boardWidth; y++) {
		for(x = 0; x < boardWidth; x++) {
			// generate enemies and items
			if (!unitsData[y][x]) {
				if (isWalkable(x, y)) {
					if (idsData[y][x] > 6 && idsData[y][x] < 13 && treasures.indexOf(-idsData[y][x]) == -1) {
						// place gold piles on isles 6-12
						treasures.push(-idsData[y][x]);
						unitsList.push(createUnit(x, y, UnitType.GOLD));
						unitsData[y][x] = UnitType.GOLD;
						//if (state) console.log("GOLD", x+"x"+y);
						g1 ++;
					} else
					if (mapData[y][x] > TileType.RIFF2 && idsData[y][x] > 1 && treasures.indexOf(idsData[y][x]) == -1) {
						// place knight (isles 2-6) or crab (isles 7-13)
						unit = createUnit(x, y, idsData[y][x] > 6 ? UnitType.CRAB : UnitType.KNIGHT);
						unit.origin = idsData[y][x];
						enemies.push(unit);
						treasures.push(idsData[y][x]);
						unitsList.push(unit);
						unitsData[y][x] = idsData[y][x] >= 6 ? UnitType.CRAB : UnitType.KNIGHT;
						//if (state) console.log(idsData[y][x] >= colors.length ? "CRAB" : "KNIGHT", x+"x"+y);
						e3 ++;
					}
				}
			}

			if (y > 13 && treasures.indexOf(-y) == -1) {
				let _x = 9;
				let _y = 9;
				while (
					mapData[_y][_x] > 2 ||
					unitsData[_y][_x] ||
					unitsData[_y][_x+1] || unitsData[_y][_x-1] ||
					unitsData[_y+1][_x] || unitsData[_y-1][_x] ||
					unitsData[_y+1][_x+1] || unitsData[_y-1][_x-1] ||
					unitsData[_y+1][_x-1] || unitsData[_y-1][_x+1] ||
					!isSailable(_x, _y, g2 < 9 || e2 < 9 ? TileType.RIFF2 : TileType.RIFF1)
				) {
					_x = islandGenerator.rand(9, 35);
					_y = islandGenerator.rand(9, 35);
				}

				unit = createUnit(_x, _y, g2 < 9 ? UnitType.WRECK : e1 < 9 ? UnitType.SERPENT : UnitType.SQUID)
				enemies.push(unit);
				treasures.push(-y);
				unitsList.push(unit);
				unitsData[_y][_x] = unit.type;
				//if (state) console.log(g2 < 9 ? "WRECK" : e1 < 9 ? "SERPENT" : "SQUID", _x+"x"+_y);
				if (g2 < 9) g2 ++; else if (e1 < 9) e1 ++; else e2 ++;
			}
		}
	}

	/*if (_debug) console.log(
		unitsList.length,
		"trees:"+t,
		"g1:"+g1,
		"g2:"+g2,
		"e1:"+e1,
		"e2:"+e2,
		"e3:"+e3
		//treasures
	);*/

	// data initialization completed

	gameContainer.innerHTML = "";

	// now preparing board elements to render only what is visible inside the game window
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
				button.btn.addEventListener(interactionDown, buttonDown);
				btnArr.push(button);
			}
		}
		buttonScreen.push(btnArr);
		tileScreen.push(tileArr);
		unitScreen.push(unitArr);
	}

	revealAroundUnit(playerX, playerY);
	//revealAroundUnit(shipX, shipY);
	//revealAroundUnit(townX, townY);
}

// obscure the stage in clouds, 00: full clouds, 01: partially visible, 02: no clouds
function obscureStage(x, y) {
	for(y = 0; y < boardWidth; y++) {
		for(x = 0; x < boardWidth; x++) {
			// Update base land tiles (0: water, 1: land)
			if (mapData[y][x]) {
				if (y>1 && x) {
					obscureTile(x, y);
				}
			}
		}
	}
}

function obscureTile(x, y) {
	if (timePassed < 13 && state) {
		visitedData[y-2][x] = idsData[y-2][x] > 1
			? timePassed == 1 && idsData[y-2][x] < 9
				? visitedData[y-2][x] ? Math.random() < .5 ? visitedData[y-2][x]-1 : 1 : Math.random() < .5 ? 1 : 2
				: 0
			: Math.random() >= timePassed/30 ? 2 : 1;
	} else if (visitedData[y-2][x] ) {
		visitedData[y-2][x] = 0;
	}
	//if (idsData[y-1][x-1] > 1 && timePassed>1) visitedData[y-1][x-1] = 0;
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
	// were we zooming the map by double touch?
	if (touchZ) {
		touchZ = false;
		return;
	}
	// determine clicks and swipes
	const target = /touch/.test(event.type) ? event.changedTouches[0] : event;

	// is it a swipe or click ?
	currentButtonX = Math.round((target.clientX - currentButtonX) / boardPlayer.width);
	currentButtonY = Math.round((target.clientY - currentButtonY) / boardPlayer.width);

	if (currentButtonX || currentButtonY) {
		//console.log("swipe: "+currentButtonX+"x"+currentButtonY);
		if (state) {
			if (Math.abs(currentButtonX) > Math.abs(currentButtonY)) {
				action(currentButtonX > 0 ? 4 : 2);
				return;
			} else if (Math.abs(currentButtonY) > Math.abs(currentButtonX)) {
				action(currentButtonY > 0 ? 1 : 3);
				return;
			}
		}
	}

	// clicked index (x/y)
	currentButtonX = target.target.x;
	currentButtonY = target.target.y;
	//console.log("clickButton: "+currentButtonX+"x"+currentButtonY);

	if (state) {
		let direction = determineDirection(currentButtonX, currentButtonY);
		action(direction);
	}
}

function determineDirection(x, y) {
	if (!x && !y) return -1;
	return oddDirectionalArray[y][x];
}

// assign direction values of the boardButtons
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
	// the game canvas context is cleared every 7 frames or each frame while moving (doAnimationFrame, gameDirty)
	// the map canvas context is cleared only when zooming or while moving
	let _unit, _x, _y, _data,
		_ox = portrait ? screenSide : screenSide + screenOut/2,
		_oy = !portrait ? screenSide : screenSide + screenOut/2;

	if (gameDirty) {
		// Update base tiles
		gameDirty --;
		if (gameDirty) {
			bgrContext.fillStyle = "#27b";
			bgrContext.fillRect(0, 0, bgrCanvas.width, bgrCanvas.height);
			for(let y = 0; y < screenWidth + screenOut; y++) {
				for(let x = 0; x < screenWidth + screenOut; x++) {
					if (tileScreen[y]) {
						if (tileScreen[y][x]) {
							_x = x + playerX - _ox - (portrait?screenOut/2:0);
							_y = y + playerY - _oy - (!portrait?screenOut/2:0);
							_data = mapData[_y] && mapData[_y].length > _x ? mapData[_y][_x] : 0;
							tileScreen[y][x].visited = 0;
							tileScreen[y][x].realX = _x;
							tileScreen[y][x].realY = _y;
							if (visitedData[_y] && visitedData[_y][_x]) tileScreen[y][x].visited = visitedData[_y][_x];
							tileScreen[y][x].update(_data);
						}
					}
				}
			}
		}
	}

	if (gameDirty) {
		gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
	}

	if (!gameDirty) return;// break here if we are still on the title screen or we dont have to draw units

	// Update units
	for(let y = 0; y < screenWidth + screenOut; y++) {
		let _player, shouldSkipDrawingUnit;
		for(let x = 0; x < screenWidth + screenOut; x++) {
			shouldSkipDrawingUnit = false;
			if (unitScreen[y]) {
				if (unitScreen[y][x]) {
					_x = x + playerX - _ox - (portrait?screenOut/2:0);
					_y = y + playerY - _oy - (!portrait?screenOut/2:0);
					_data = unitsData[_y] && unitsData[_y].length > _x ? unitsData[_y][_x] : 0;

					unitScreen[y][x].reset();

					// draw units
					if (state && _data) {
						if (_x == playerX && _y == playerY) {
							boardPlayer = unitScreen[y][x];
							if (!_player) {// drawing the player at the end of the row itteration to be drawn on top
								shouldSkipDrawingUnit = true;
								_player = _data;
							}
							boardPlayer.overlay = gamePlayer.overlay;
							boardPlayer.origin = UnitType.PLAYER;
						} else if (_x == shipX && _y == shipY) {
							boardShip = unitScreen[y][x];
							boardShip.origin = gameShip.origin;
						} else {
							_unit = getUnit(_x, _y);
							if (_unit) {
								unitScreen[y][x].overlay = _unit.overlay;
								unitScreen[y][x].movingX = _unit.movingX || 0;
								unitScreen[y][x].movingY = _unit.movingY || 0;
								unitScreen[y][x].origin = _unit.origin;
								unitScreen[y][x].apple = _unit.apple;
								unitScreen[y][x].dungeon = _unit.dungeon;
								//unitScreen[y][x].enemy = _unit.enemy;
								// some units are visible in the fog, others not
								shouldSkipDrawingUnit = visitedData[_y][_x] < (
									_unit.type > UnitType.SQUID &&
									_unit.type < UnitType.WRECK ? 1 : 2
								);
							}
						}
					}

					// update units
					if (state && !shouldSkipDrawingUnit) {
						unitScreen[y][x].update(_data);
					}

					// draw tile clouds
					tileScreen[y][x].drawOverlay();
				}
			}
		}
		if (_player) {
			boardPlayer.update(_player);
		}
	}

	if (gameDirty) {
		gameDirty = 0;
		if (buttonScreen && !paused) {
			buttonScreen.forEach(row => row.forEach(button => button.update(1, playerX - _ox, playerY - _oy)));
		}
	}
}

function removeUnit(x, y) {
	if (getUnit(x, y).overlay) {
		unitsData[y][x] = getUnit(x, y).overlay;
	}
	unitsList.splice(getUnitId(x, y), 1);
}

function getUnit(x, y) {
	return unitsList[getUnitId(x, y)];
}

function getUnitId(x, y) {
	return unitsList.reduce((id, u, i) => u.x == x && u.y == y && u != gamePlayer && u != gameShip ? i : id, -1);
}
