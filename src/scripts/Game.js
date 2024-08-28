let unit, player, ship;
let boarding, landing;

function createUnit(x, y, z) {
	unit = new Unit(x, y, z);
	return unit;
}

function createPlayer(x, y, z) {
	player = new Player(x, y, z);
	return player;
}

function createShip(x, y, z) {
	ship = new Ship(x, y, z);
	return ship;
}

function action(direction) {
	if (paused) return;
	switch (direction) {
		case 1: // Up
			// check collision
			boarding = playerX == shipX && playerY-1 == shipY && player.onFoot;
			landing = !player.onFoot && !isPassable(playerX, playerY-1, TileType.LAND);
			if (isPassable(playerX, playerY-1) || boarding || landing) {
				unitsData[playerY][playerX] = landing ? UnitType.SHIPRIGHT : player.overlay;
				playerY --;
				player.y --;
				if (playerY < jump) {// TODO: fix wrapping
					playerY = boardWidth-1;
					boardPlayer.y += boardWidth-jump;
				}
				tween.transitionY = -1;
				TweenFX.to(tween, 6, {transitionY: 0}, e => { paused = false; });
				finalizeMove(1);
			}

			break;
		case 2: // Right
			// check collision
			boarding = playerX+1 == shipX && playerY == shipY && player.onFoot;
			landing = !player.onFoot && !isPassable(playerX+1, playerY, TileType.LAND);
			if (isPassable(playerX+1, playerY) || boarding || landing) {
				unitsData[playerY][playerX] = landing ? UnitType.SHIPUP : player.overlay;
				playerX ++;
				boardPlayer.x ++;
				if (playerX > boardWidth-1) {
					playerX = jump;
					boardPlayer.x -= boardWidth-jump;
				}
				tween.transitionX = 1;
				TweenFX.to(tween, 6, {transitionX: 0}, e => { paused = false; });
				finalizeMove(2);
			}

			break;
		case 3: // Down
			// check collision
			boarding = playerX == shipX && playerY+1 == shipY && player.onFoot;
			landing = !player.onFoot && !isPassable(playerX, playerY+1, TileType.LAND);
			if (isPassable(playerX, playerY+1) || boarding || landing) {
				unitsData[playerY][playerX] = landing ? UnitType.SHIPLEFT : player.overlay;
				playerY ++;
				boardPlayer.y ++;
				if (playerY > boardWidth-1) {
					playerY = jump;
					boardPlayer.y -= boardWidth-jump;
				}
				tween.transitionY = 1;
				TweenFX.to(tween, 6, {transitionY: 0}, e => { paused = false; });
				finalizeMove(3);
			}

			break;
		case 4: // Left
			// check collision
			boarding = playerX-1 == shipX && playerY == shipY && player.onFoot;
			landing = !player.onFoot && !isPassable(playerX-1, playerY, TileType.LAND);
			if (isPassable(playerX-1, playerY) || boarding || landing) {
				unitsData[playerY][playerX] = landing ? UnitType.SHIPUP : player.overlay;
				playerX --;
				boardPlayer.x --;
				if (playerX < jump) {
					playerX = boardWidth-1;
					boardPlayer.x += boardWidth-jump;
				}
				tween.transitionX = -1;
				TweenFX.to(tween, 6, {transitionX: 0}, e => { paused = false; });
				finalizeMove(4);
			}

			break;
		case 5: // Center
			console.log("Ship");
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


function finalizeMove(dir) {
	paused = true;
	player.overlay = unitsData[playerY][playerX];
	if (boarding) {
		player.onFoot = false;
		player.overlay = UnitType.EMPTY;
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

function isPassable(x, y, tileId = TileType.RIFF2) {
	if (player.onFoot) {
		return (unitsData[y][x] < UnitType.SHIPUP || unitsData[y][x] >= UnitType.CASTLE) &&
			(mapData[y][x] >= TileType.LAND)
	}
	return (unitsData[y][x] < UnitType.SHIPUP || unitsData[y][x] == UnitType.GOLD) &&
		mapData[y][x] < tileId
}
