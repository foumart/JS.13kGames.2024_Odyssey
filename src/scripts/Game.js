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
				unitsData[playerY][playerX] = landing ? UnitType.SHIP : 0;
				playerY --;
				player.y --;
				if (playerY < jump) {
					playerY = boardWidth-1;
					boardPlayer.y += boardWidth-jump;
				}
			}
			finalizeMove();
			break;
		case 2: // Right
			// check collision
			boarding = playerX+1 == shipX && playerY == shipY && player.onFoot;
			landing = !player.onFoot && !isPassable(playerX+1, playerY);
			if (isPassable(playerX+1, playerY) || boarding || landing) {
				unitsData[playerY][playerX] = landing ? UnitType.SHIP : UnitType.EMPTY;
				playerX ++;
				boardPlayer.x ++;
				if (playerX > boardWidth-1) {
					playerX = jump;
					boardPlayer.x -= boardWidth-jump;
				}
			}
			finalizeMove();
			break;
		case 3: // Down
			// check collision
			boarding = playerX == shipX && playerY+1 == shipY && player.onFoot;
			landing = !player.onFoot && !isPassable(playerX, playerY+1);
			if (isPassable(playerX, playerY+1) || boarding || landing) {
				unitsData[playerY][playerX] = landing ? 2 : 0;
				playerY ++;
				boardPlayer.y ++;
				if (playerY > boardWidth-1) {
					playerY = jump;
					boardPlayer.y -= boardWidth-jump;
				}
			}
			finalizeMove();
			break;
		case 4: // Left
			// check collision
			boarding = playerX-1 == shipX && playerY == shipY && player.onFoot;
			landing = !player.onFoot && !isPassable(playerX-1, playerY);
			if (isPassable(playerX-1, playerY) || boarding || landing) {
				unitsData[playerY][playerX] = landing ? 2 : 0;
				playerX --;
				boardPlayer.x --;
				if (playerX < jump) {
					playerX = boardWidth-1;
					boardPlayer.x += boardWidth-jump;
				}
			}
			finalizeMove();
			break;
		case 5: // Center
			console.log("Ship");
			break;
		default: // Corners

			break;
	}
}


function finalizeMove() {
	if (boarding) {
		player.onFoot = false;
	} else if (landing) {
		player.onFoot = true;
	} else if (!player.onFoot) {
		shipX = playerX; shipY = playerY;
	}
	unitsData[playerY][playerX] = boarding || !player.onFoot ? UnitType.PLAYERSHIP : UnitType.PLAYER;
}

function isPassable(x, y) {
	if (player.onFoot) {
		return unitsData[y][x] < 2 && (mapData[y][x] == 1 || mapData[y][x] == 2)
	}
	return unitsData[y][x] < 2 && (!mapData[y][x] || mapData[y][x] == 8)
}
