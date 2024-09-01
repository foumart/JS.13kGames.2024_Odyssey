let unit,
	gamePlayer,
	gameShip,
	boarding,
	landing,
	holding,
	onFoot = true,
	inDialog = false,
	hasEvent = false;

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
				unitsData[playerY][playerX] = landing ? UnitType.SHIPRIGHT : gamePlayer.overlay;
				playerY --;
				gamePlayer.y --;
				if (!onFoot && !landing) gameShip.y --;
				if (playerY < jump) {// TODO: fix wrapping
					playerY = boardWidth-1;
					gamePlayer.y += boardWidth-jump;
				}
				tween.transitionY = -1;
				TweenFX.to(tween, 6, {transitionY: 0}, null, e => finalizeMove(1));
				prepareToMove(1);
			}

			break;
		case 2: // Right
			// check collision
			boarding = playerX+1 == shipX && playerY == shipY && onFoot;
			landing = !onFoot && !isPassable(playerX+1, playerY, TileType.LAND);
			if (isPassable(playerX+1, playerY) || boarding || landing) {
				unitsData[playerY][playerX] = landing ? UnitType.SHIPUP : gamePlayer.overlay;
				playerX ++;
				gamePlayer.x ++;
				if (!onFoot && !landing) gameShip.x ++;
				if (playerX > boardWidth-1) {
					playerX = jump;
					gamePlayer.x -= boardWidth-jump;
				}
				tween.transitionX = 1;
				TweenFX.to(tween, 6, {transitionX: 0}, null, e => finalizeMove(2));
				prepareToMove(2);
			}

			break;
		case 3: // Down
			// check collision
			boarding = playerX == shipX && playerY+1 == shipY && onFoot;
			landing = !onFoot && !isPassable(playerX, playerY+1, TileType.LAND);
			if (isPassable(playerX, playerY+1) || boarding || landing) {
				unitsData[playerY][playerX] = landing ? UnitType.SHIPLEFT : gamePlayer.overlay;
				playerY ++;
				gamePlayer.y ++;
				if (!onFoot && !landing) gameShip.y ++;
				if (playerY > boardWidth-1) {
					playerY = jump;
					gamePlayer.y -= boardWidth-jump;
				}
				tween.transitionY = 1;
				TweenFX.to(tween, 6, {transitionY: 0}, null, e => finalizeMove(3));
				prepareToMove(3);
			}

			break;
		case 4: // Left
			// check collision
			boarding = playerX-1 == shipX && playerY == shipY && onFoot;
			landing = !onFoot && !isPassable(playerX-1, playerY, TileType.LAND);
			if (isPassable(playerX-1, playerY) || boarding || landing) {
				unitsData[playerY][playerX] = landing ? UnitType.SHIPDOWN : gamePlayer.overlay;
				playerX --;
				gamePlayer.x --;
				if (!onFoot && !landing) gameShip.x --;
				if (playerX < jump) {
					playerX = boardWidth-1;
					gamePlayer.x += boardWidth-jump;
				}
				tween.transitionX = -1;
				TweenFX.to(tween, 6, {transitionX: 0}, null, e => finalizeMove(4));
				prepareToMove(4);
			}

			break;
		case 5: // Center
			gamePlayer.selection = gamePlayer.selection ? 0 : 1;

			break;
		case 6: // Action
			if (gamePlayer.overlay == 10) {
				infoTab.innerHTML = `<br>You see a Castle`;
				displayDialog();
			} else if (gamePlayer.overlay == 11) {
				infoTab.innerHTML = `<br>You see a Shrine`;
			} else if (gamePlayer.overlay == 12) {
				infoTab.innerHTML = `<br>You see a tree`;
			} else if (gamePlayer.overlay == 13) {
				infoTab.innerHTML = `<br>You see a gold pile`;
			} else {
				// PASS
				if (inDialog) displayDialog();// hide the dialog
				infoTab.innerHTML = `<br>${onFoot ? 'Dug, nothing? pass' : 'Fish, nothing? pass'}`;
				tween.transitionZ = 1;
				TweenFX.to(tween, 6, {transitionZ: 0}, null, e => finalizeMove(0));
				performEnemyMoves();
			}

			break;
		default: // Corners
			console.log("Default action:", direction);
			break;
	}
}

function prepareToMove(dir) {
	if (inDialog) displayDialog();// hide the dialog
	gamePlayer.overlay = unitsData[playerY][playerX];
	if (boarding) {
		onFoot = false;
		gameShip.origin = 1;
		gamePlayer.overlay = UnitType.EMPTY;
	} else if (landing) {
		onFoot = true;
	} else if (!onFoot) {
		shipX = playerX; shipY = playerY;
	}

	// change ship appearance as player moves
	unitsData[playerY][playerX] = boarding || !onFoot
		? dir % 2 ? (dir-1 ? UnitType.SHIPUP : UnitType.SHIPDOWN) : dir == 2 ? UnitType.SHIPLEFT : UnitType.SHIPRIGHT
		: UnitType.PLAYER;

	performEnemyMoves();
}

function finalizeMove(dir) {
	// move enemies
	enemies.forEach(enemy => {
		if (enemy.movingX) {
			unitsData[enemy.y][enemy.x] = enemy.overlay;
			enemy.x += enemy.movingX;
			enemy.movingX = 0;
			enemy.overlay = unitsData[enemy.y][enemy.x];
			unitsData[enemy.y][enemy.x] = enemy.type;
		}
		if (enemy.movingY) {
			unitsData[enemy.y][enemy.x] = enemy.overlay;
			enemy.y += enemy.movingY;
			enemy.movingY = 0;
			enemy.overlay = unitsData[enemy.y][enemy.x];
			unitsData[enemy.y][enemy.x] = enemy.type;
		}
	});

	if (_debug) console.log(
		unitsData.map(arr => arr.map(num => (!num ? "0" + num.toString(16) : (num>=1&&num<=6||num==8||num==9?"█":" ") + num.toString(16)).toUpperCase())).join("\n")
	);

	infoTab.innerHTML = `<br>Position: ${playerX}x${playerY}<br>${idsData[playerY][playerX] ? 'Exploring Island '+idsData[playerY][playerX] : 'Sailing'}`;
	
	paused = false;
	gameContainer.style.display = "block";
	updateActionButton();
	if (holding && dir) {
		action(dir);
	}
}

function performEnemyMoves() {
	paused = true;
	gameContainer.style.display = "none";
	// move enemies
	enemies.forEach(enemy => {
		if ((enemy.type == UnitType.ENEMY3 && isWalkable(enemy.x + 1, enemy.y) ||
				enemy.type == UnitType.ENEMY2 && mapData[enemy.y][enemy.x+1]<TileType.SHINE && islandGenerator.rand(0,1)
			) && islandGenerator.rand(0, enemy.x > playerX ? 1 : 3)) {
				//enemy.overlay = unitsData[enemy.y][enemy.x+1];
				enemy.movingX = 1; enemy.movingY = 0;
		} else if ((
				enemy.type == UnitType.ENEMY3 && isWalkable(enemy.x - 1, enemy.y) ||
				enemy.type == UnitType.ENEMY2 && mapData[enemy.y][enemy.x-1]<TileType.SHINE && islandGenerator.rand(0,1)
			) && islandGenerator.rand(0, enemy.x < playerX ? 1 : 3)) {
				//enemy.overlay = unitsData[enemy.y][enemy.x-1];
				enemy.movingX = -1; enemy.movingY = 0;
		} else if ((
				enemy.type == UnitType.ENEMY3 && isWalkable(enemy.x, enemy.y + 1) ||
				enemy.type == UnitType.ENEMY1 && mapData[enemy.y+1][enemy.x]<TileType.SHINE && islandGenerator.rand(0,1)
			) && islandGenerator.rand(0, enemy.y > playerY ? 1 : 3)) {
				//enemy.overlay = unitsData[enemy.y+1][enemy.x];
				enemy.movingY = 1; enemy.movingX = 0;
		} else if ((
				enemy.type == UnitType.ENEMY3 && isWalkable(enemy.x, enemy.y - 1) ||
				enemy.type == UnitType.ENEMY1 && mapData[enemy.y-1][enemy.x]<TileType.SHINE && islandGenerator.rand(0,1)
			) && islandGenerator.rand(0, enemy.y < playerY ? 1 : 3)) {
				//enemy.overlay = unitsData[enemy.y-1][enemy.x];
				enemy.movingY = -1; enemy.movingX = 0;
		}
	});
}

function displayDialog() {
	inDialog = !inDialog;
	dialog.style.display = inDialog ? 'block' : 'none';
	gameContainer.style.display = inDialog ? 'none' : 'block';
	uiDiv.style.pointerEvents = inDialog ? 'auto' : 'none';
	/*gameContainer.style.pointerEvents = inDialog ? 'none' : 'auto';
	if (buttonScreen) {
		for (let _y = 0; _y < buttonScreen.length; _y ++) {
			for (let _x = 0; _x < buttonScreen[_y].length; _x ++) {
				buttonScreen[_y][_x].btn.style.pointerEvents = inDialog ? "none" : "auto";
			}
		}
	}*/
}

function updateActionButton() {
	// ⚔️⚔ '&#9876' | ⛏ '&#9935' | ☸ '&#9784' | 🛠️🛠 &#128736 | ⚙️⚙ &#9881 | ⎚ &#9114 | ◯ | 〇 | 〇 &#12295 |
	// 🚢 &#128674 | 🛳 🛳️ | ⛵ &#9973 | 🛶 &#128758 | 🚤 | 🛥 &#128741 | 🛥️ | ⚓ &#9875 | 🔱 &#128305 |
	// 🪓 &#129683 | 🔧 &#128295 | 💎 &#128142 | ⚒️ | 💣 | 🌎 | ⚐ &#9872 | ⚑ &#9873 | ⚰ &#9904 | ⚱ &#9905 |
	// ♨ &#9832 | ⛓ &#9939 | ☄ &#9732

	//unit = getUnit(playerX, playerY);

	if (gamePlayer.overlay == 10) {//CASTLE
		actButton.innerHTML = gamePlayer.origin>1 ? '&#9876' : '&#9881';
	} else if (gamePlayer.overlay == 11) {//SHRINE
		actButton.innerHTML = "&#128736";
	} else if (gamePlayer.overlay == 12) {//TREE
		actButton.innerHTML = "&#129683";
	} else if (gamePlayer.overlay == 13) {//GOLD
		actButton.innerHTML = "&#128142";
	} else {
		actButton.innerHTML = onFoot ? hasEvent ? '&#9832' : '&#9935' : hasEvent ? '&#9832' : '&#9784';
		//actButton.style.opacity = hasEvent ? 1 : .5;
	}
}

function isWalkable(x, y) {
	// check if current unit tile is player or empty, or walkable item as gold, tree, etc.
	// also check if current map tile is land
	return (unitsData[y][x] < UnitType.SHIPUP || unitsData[y][x] >= UnitType.CASTLE) &&
			(mapData[y][x] >= TileType.LAND);
}

function isSailable(x, y, tileId = 3) {
	// check if current unit tile is player or empty, or walkable item as gold wreck.
	// also check if current map tile is at least water tileId (depth)
	return (unitsData[y][x] < UnitType.SHIPUP || unitsData[y][x] == UnitType.WRECK) &&
		mapData[y][x] < tileId;
}

function isPassable(x, y, tileId = TileType.RIFF2) {
	if (onFoot) {
		return isWalkable(x, y);
	}
	return isSailable(x, y, tileId);
}
