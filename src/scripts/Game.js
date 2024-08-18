let unit, player;

function createUnit(x, y) {
	unit = new Unit(x, y);
	return unit;
}

function createPlayer(x, y) {
	player = new Player(x, y);
	return player;
}

function action(direction) {
	switch (direction) {
		case 1: // Up
			// check collision
			if (isPassable(playerX, playerY-1)) {
				unitsData[playerY][playerX] = 0;
				playerY --;
				player.y --;
				if (playerY < jump) {
					playerY = boardWidth-1;
					boardPlayer.y += boardWidth-jump;
				}
				unitsData[playerY][playerX] = 1;
				//player.resize();
			}
			
			break;
		case 2: // Right
			// check collision
			if (isPassable(playerX+1, playerY)) {
				unitsData[playerY][playerX] = 0;
				playerX ++;
				boardPlayer.x ++;
				if (playerX > boardWidth-1) {
					playerX = jump;
					boardPlayer.x -= boardWidth-jump;
				}
				unitsData[playerY][playerX] = 1;
				//player.resize();
			}
			break;
		case 3: // Down
			// check collision
			if (isPassable(playerX, playerY+1)) {
				unitsData[playerY][playerX] = 0;
				playerY ++;
				boardPlayer.y ++;
				if (playerY > boardWidth-1) {
					playerY = jump;
					boardPlayer.y -= boardWidth-jump;
				}
				unitsData[playerY][playerX] = 1;
				//player.resize();
			}
			break;
		case 4: // Left
			// check collision
			if (isPassable(playerX-1, playerY)) {
				unitsData[playerY][playerX] = 0;
				playerX --;
				boardPlayer.x --;
				if (playerX < jump) {
					playerX = boardWidth-1;
					boardPlayer.x += boardWidth-jump;
				}
				unitsData[playerY][playerX] = 1;
				//player.resize();
			}
			break;
		case 5: // Center
			console.log("Ship");
			break;
		default: // Corners

			break;
	}
}