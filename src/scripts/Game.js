let unit, player, ship;
let boarding, landing;

function createUnit(x, y) {
	unit = new Unit(x, y);
	return unit;
}

function createPlayer(x, y) {
	player = new Player(x, y);
	return player;
}

function createShip(x, y) {
	ship = new Ship(x, y);
	return ship;
}

function action(direction) {
	switch (direction) {
		case 1: // Up
			// check collision
			boarding = playerX == shipX && playerY-1 == shipY && player.onFoot;
			landing = !player.onFoot && !isPassable(playerX, playerY-1);
			if (isPassable(playerX, playerY-1) || boarding || landing) {
				unitsData[playerY][playerX] = landing ? UnitType.SHIPRIGHT : UnitType.EMPTY;
				playerY --;
				player.y --;
				if (playerY < jump) {
					playerY = boardWidth-1;
					boardPlayer.y += boardWidth-jump;
				}
			}
			finalizeMove(1);
			break;
		case 2: // Right
			// check collision
			boarding = playerX+1 == shipX && playerY == shipY && player.onFoot;
			landing = !player.onFoot && !isPassable(playerX+1, playerY);
			if (isPassable(playerX+1, playerY) || boarding || landing) {
				unitsData[playerY][playerX] = landing ? UnitType.SHIPUP : UnitType.EMPTY;
				playerX ++;
				boardPlayer.x ++;
				if (playerX > boardWidth-1) {
					playerX = jump;
					boardPlayer.x -= boardWidth-jump;
				}
			}
			finalizeMove(2);
			break;
		case 3: // Down
			// check collision
			boarding = playerX == shipX && playerY+1 == shipY && player.onFoot;
			landing = !player.onFoot && !isPassable(playerX, playerY+1);
			if (isPassable(playerX, playerY+1) || boarding || landing) {
				unitsData[playerY][playerX] = landing ? UnitType.SHIPRIGHT : UnitType.EMPTY;
				playerY ++;
				boardPlayer.y ++;
				if (playerY > boardWidth-1) {
					playerY = jump;
					boardPlayer.y -= boardWidth-jump;
				}
			}
			finalizeMove(3);
			break;
		case 4: // Left
			// check collision
			boarding = playerX-1 == shipX && playerY == shipY && player.onFoot;
			landing = !player.onFoot && !isPassable(playerX-1, playerY);
			if (isPassable(playerX-1, playerY) || boarding || landing) {
				unitsData[playerY][playerX] = landing ? UnitType.SHIPUP : UnitType.EMPTY;
				playerX --;
				boardPlayer.x --;
				if (playerX < jump) {
					playerX = boardWidth-1;
					boardPlayer.x += boardWidth-jump;
				}
			}
			finalizeMove(4);
			break;
		case 5: // Center
			console.log("Ship");
			break;
		case 6: // Action
			console.log("Action");
			break;
		default: // Corners

			break;
	}
}


function finalizeMove(dir) {
	if (boarding) {
		player.onFoot = false;
	} else if (landing) {
		player.onFoot = true;
	} else if (!player.onFoot) {
		shipX = playerX; shipY = playerY;
	}
	unitsData[playerY][playerX] = boarding || !player.onFoot
		? dir % 2 ? UnitType.SHIPUP : dir == 2 ? UnitType.SHIPLEFT : UnitType.SHIPRIGHT
		: UnitType.PLAYER;

	infoTab.innerHTML = `<br>Position: ${playerX}x${playerY}<br>${idsData[playerY][playerX] ? 'Exploring Island '+idsData[playerY][playerX] : 'Sailing'}`;
}

function isPassable(x, y) {
	if (player.onFoot) {
		return unitsData[y][x] < 2 && (mapData[y][x] == 1 || mapData[y][x] == 2)
	}
	return unitsData[y][x] < 2 && (!mapData[y][x] || mapData[y][x] == 8)
}
