let unit,
	boardPlayer,
	boardShip,
	boarding,
	landing,
	onFoot = true;

function createUnit(x, y, z) {
	unit = new Unit(x, y, z);
	return unit;
}

function action(direction) {
	if (paused) return;
	switch (direction) {
		case 1: // Up
			// check collision
			boarding = playerX == shipX && playerY-1 == shipY && onFoot;
			landing = !onFoot && !isPassable(playerX, playerY-1, TileType.LAND);
			if (isPassable(playerX, playerY-1) || boarding || landing) {
				unitsData[playerY][playerX] = landing ? UnitType.SHIPRIGHT : boardPlayer.overlay;
				playerY --;
				boardPlayer.y --;
				if (!onFoot && !landing) boardShip.y --;
				if (playerY < jump) {// TODO: fix wrapping
					playerY = boardWidth-1;
					boardPlayer.y += boardWidth-jump;
				}
				tween.transitionY = -1;
				TweenFX.to(tween, 6, {transitionY: 0}, null, finalizeMove.bind(this));
				prepareToMove(1);
			}

			break;
		case 2: // Right
			// check collision
			boarding = playerX+1 == shipX && playerY == shipY && onFoot;
			landing = !onFoot && !isPassable(playerX+1, playerY, TileType.LAND);
			if (isPassable(playerX+1, playerY) || boarding || landing) {
				unitsData[playerY][playerX] = landing ? UnitType.SHIPUP : boardPlayer.overlay;
				playerX ++;
				boardPlayer.x ++;
				if (!onFoot && !landing) boardShip.x ++;
				if (playerX > boardWidth-1) {
					playerX = jump;
					boardPlayer.x -= boardWidth-jump;
				}
				tween.transitionX = 1;
				TweenFX.to(tween, 6, {transitionX: 0}, null, finalizeMove.bind(this));
				prepareToMove(2);
			}

			break;
		case 3: // Down
			// check collision
			boarding = playerX == shipX && playerY+1 == shipY && onFoot;
			landing = !onFoot && !isPassable(playerX, playerY+1, TileType.LAND);
			if (isPassable(playerX, playerY+1) || boarding || landing) {
				unitsData[playerY][playerX] = landing ? UnitType.SHIPLEFT : boardPlayer.overlay;
				playerY ++;
				boardPlayer.y ++;
				if (!onFoot && !landing) boardShip.y ++;
				if (playerY > boardWidth-1) {
					playerY = jump;
					boardPlayer.y -= boardWidth-jump;
				}
				tween.transitionY = 1;
				TweenFX.to(tween, 6, {transitionY: 0}, null, finalizeMove.bind(this));
				prepareToMove(3);
			}

			break;
		case 4: // Left
			// check collision
			boarding = playerX-1 == shipX && playerY == shipY && onFoot;
			landing = !onFoot && !isPassable(playerX-1, playerY, TileType.LAND);
			if (isPassable(playerX-1, playerY) || boarding || landing) {
				unitsData[playerY][playerX] = landing ? UnitType.SHIPDOWN : boardPlayer.overlay;
				playerX --;
				boardPlayer.x --;
				if (!onFoot && !landing) boardShip.x --;
				if (playerX < jump) {
					playerX = boardWidth-1;
					boardPlayer.x += boardWidth-jump;
				}
				tween.transitionX = -1;
				TweenFX.to(tween, 6, {transitionX: 0}, null, finalizeMove.bind(this));
				prepareToMove(4);
			}

			break;
		case 5: // Center
			boardPlayer.selection = boardPlayer.selection ? 0 : 1;

			break;
		case 6: // Action
			//console.log("Action");
			paused = true;
			updateMap();
			break;
		default: // Corners
			console.log("Default action:", direction);
			break;
	}
}

function finalizeMove() {
	paused = false;
	//console.log(getUnit(playerX, playerY), idsData[playerY][playerX]);
}


function prepareToMove(dir) {
	paused = true;
	boardPlayer.overlay = unitsData[playerY][playerX];
	if (boarding) {
		onFoot = false;
		boardShip.origin = 1;
		boardPlayer.overlay = UnitType.EMPTY;
	} else if (landing) {
		onFoot = true;
	} else if (!onFoot) {
		shipX = playerX; shipY = playerY;
	}

	unitsData[playerY][playerX] = boarding || !onFoot
		? dir % 2 ? (dir-1 ? UnitType.SHIPUP : UnitType.SHIPDOWN) : dir == 2 ? UnitType.SHIPLEFT : UnitType.SHIPRIGHT
		: UnitType.PLAYER;

	infoTab.innerHTML = `<br>Position: ${playerX}x${playerY}<br>${idsData[playerY][playerX] ? 'Exploring Island '+idsData[playerY][playerX] : 'Sailing'}`;
}

function isPassable(x, y, tileId = TileType.RIFF2) {
	if (onFoot) {
		return (unitsData[y][x] < UnitType.SHIPUP || unitsData[y][x] >= UnitType.CASTLE) &&
			(mapData[y][x] >= TileType.LAND)
	}
	return (unitsData[y][x] < UnitType.SHIPUP || unitsData[y][x] == UnitType.GOLD) &&
		mapData[y][x] < tileId
}
