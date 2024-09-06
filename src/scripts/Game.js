let unit,
	gamePlayer,
	gameShip,
	boarding,
	landing,
	holding,
	onFoot = true,
	inDialog,
	hasEvent,
	hasTutorial;
const colors = [, "red", ,"aqua", "yellow", "magenta"];

let stage, turn, gold,
	//shipLeft, shipLimit,
	moveLeft, moveLimit,
	timeLeft, timeLimit,
	crewHealth, crewHealthMax, crewLevel,
	playerHealth, playerHealthMax, playerLevel,
	shipHealth, shipHealthMax, shipLevel;

// initialize vars for new game
function initVars() {
	stage = 1;
	turn = 0;
	gold = 1000;
	//shipLeft = 40, shipLimit = 40;
	moveLeft = 24, moveLimit = 24;
	timeLeft = 13, timeLimit = 99,
	// 2: 0-24; 3: 25-37-48; 4: 49-60; 6: 61-72
	playerHealth = 20, playerHealthMax = 20, playerLevel = 1,
	shipHealth = 22, shipHealthMax = 38, shipLevel = 1,// 38, 48, 60,  72
	crewHealth = 24, crewHealthMax = 24, crewLevel = 1;// 36, 48, 60, 
}

function createUnit(x, y, z) {
	unit = new Unit(x, y, z);
	return unit;
}

function action(direction) {
	if (paused) return;
	let _unit;
	switch (direction) {
		case 1: // Up
			// check collision
			boarding = playerX == shipX && playerY-1 == shipY && onFoot;
			landing = !onFoot && !isPassable(playerX, playerY-1, TileType.LAND);
			if (isPassable(playerX, playerY-1) || boarding || landing) {
				_unit = getUnit(playerX, playerY-1);
				if (_unit && _unit.type == 10 && _unit.origin > 1) {
					console.log("break",_unit);
					//infoTab.innerHTML = `<br>Opponent "${colors[_unit.origin-2]}"'s castle is ahead.`;
					//prepareCastleSiegeDialog(_unit.origin);
					prepareDialog(`<br>Opponent "${colors[_unit.origin-2]}"'s Castle`, "will you", quitGame, "Attack", displayDialog, "Retreat");
					return;
				}
				unitsData[playerY][playerX] = landing ? UnitType.SHIPLEFT : gamePlayer.overlay;
				playerY --;
				gamePlayer.y --;
				if (!onFoot && !landing) gameShip.y --;
				if (playerY < jump) {// TODO: fix wrapping
					playerY = boardWidth-1;
					gamePlayer.y += boardWidth-jump;
				}
				tween.transitionY = -1;
				TweenFX.to(tween, 6, {transitionY: 0}, e => doFrameAnimationMove(), e => finalizeMove(1));
				prepareToMove(1);
			}

			break;
		case 2: // Right
			// check collision
			boarding = playerX+1 == shipX && playerY == shipY && onFoot;
			landing = !onFoot && !isPassable(playerX+1, playerY, TileType.LAND);
			if (isPassable(playerX+1, playerY) || boarding || landing) {
				_unit = getUnit(playerX+1, playerY);
				if (_unit && _unit.type == 10 && _unit.origin > 1) {
					prepareDialog(`<br>Opponent "${colors[_unit.origin-2]}"'s Castle`, "will you", quitGame, "Attack", displayDialog, "Retreat");
					return;
				}
				unitsData[playerY][playerX] = landing ? UnitType.SHIPUP : gamePlayer.overlay;
				playerX ++;
				gamePlayer.x ++;
				if (!onFoot && !landing) gameShip.x ++;
				if (playerX > boardWidth-1) {
					playerX = jump;
					gamePlayer.x -= boardWidth-jump;
				}
				tween.transitionX = 1;
				TweenFX.to(tween, 6, {transitionX: 0}, e => doFrameAnimationMove(), e => finalizeMove(2));
				prepareToMove(2);
			}

			break;
		case 3: // Down
			// check collision
			boarding = playerX == shipX && playerY+1 == shipY && onFoot;
			landing = !onFoot && !isPassable(playerX, playerY+1, TileType.LAND);
			if (isPassable(playerX, playerY+1) || boarding || landing) {
				_unit = getUnit(playerX, playerY+1);
				if (_unit && _unit.type == 10 && _unit.origin > 1) {
					prepareDialog(`<br>Opponent "${colors[_unit.origin-2]}"'s Castle`, "will you", quitGame, "Attack", displayDialog, "Retreat");
					return;
				}
				unitsData[playerY][playerX] = landing ? UnitType.SHIPRIGHT : gamePlayer.overlay;
				playerY ++;
				gamePlayer.y ++;
				if (!onFoot && !landing) gameShip.y ++;
				if (playerY > boardWidth-1) {
					playerY = jump;
					gamePlayer.y -= boardWidth-jump;
				}
				tween.transitionY = 1;
				TweenFX.to(tween, 6, {transitionY: 0}, e => doFrameAnimationMove(), e => finalizeMove(3));
				prepareToMove(3);
			}

			break;
		case 4: // Left
			// check collision
			boarding = playerX-1 == shipX && playerY == shipY && onFoot;
			landing = !onFoot && !isPassable(playerX-1, playerY, TileType.LAND);
			if (isPassable(playerX-1, playerY) || boarding || landing) {
				_unit = getUnit(playerX-1, playerY);
				if (_unit && _unit.type == 10 && _unit.origin > 1) {
					prepareDialog(`<br>Opponent "${colors[_unit.origin-2]}"'s Castle`, "will you", quitGame, "Attack", displayDialog, "Retreat");
					return;
				}
				unitsData[playerY][playerX] = landing ? UnitType.SHIPDOWN : gamePlayer.overlay;
				playerX --;
				gamePlayer.x --;
				if (!onFoot && !landing) gameShip.x --;
				if (playerX < jump) {
					playerX = boardWidth-1;
					gamePlayer.x += boardWidth-jump;
				}
				tween.transitionX = -1;
				TweenFX.to(tween, 6, {transitionX: 0}, e => doFrameAnimationMove(), e => finalizeMove(4));
				prepareToMove(4);
			}

			break;
		case 5: // Center
			gamePlayer.selection = gamePlayer.selection ? 0 : 1;

			break;
		case 6: // Action
			if (hasTutorial) {
				hasTutorial = 'Upgrade Ship at Castle ' + getSpan('&#9873', colors[1]) + '<br>Conquer Castles ';
				for (_unit = 2; _unit < colors.length; _unit++) {
					hasTutorial += " " + getSpan('&#9873', colors[_unit]);
				}
				prepareDialog("Ahoy Corsair !", hasTutorial, displayDialog);
			} else
			if (gamePlayer.overlay == UnitType.CASTLE) {
				prepareDialog(
					"Capitol",
					shipHealth < shipHealthMax ? "Repair Ship damage" :
					shipLevel > 3 ? 'Ship maxed' :
					`Increase Ship HP by ${shipLevel == 2 ? 10 : 12} !`,
					shipLevel < 4 ? upgradeShip : displayDialog,
					shipLevel < 4 ? shipHealth < shipHealthMax ?
						-(shipHealthMax - shipHealth) * 5 + " Repair" :
						-[100,250,500][shipLevel-1] + " Upgrade" : 0,
					displayDialog, "Exit"
				);
			} else
			if (gamePlayer.overlay == UnitType.SHRINE) {
				prepareDialog(
					"Dungeon",
					"Will you ?",
					quitGame, "Journey",
					displayDialog, "Exit"
				);
			} else
			if (gamePlayer.overlay == UnitType.TREE) {
				let _hp = 10;
				if (playerHealth < playerHealthMax) {
					playerHealth += _hp;
					if (playerHealth > playerHealthMax) {
						_hp -= playerHealthMax - playerHealth;
						playerHealth = playerHealthMax;
					} else _hp = 0;
				}
				if (crewHealth < crewHealthMax) {
					crewHealth += _hp;
					if (crewHealth > crewHealthMax) crewHealth = crewHealthMax;
					_hp = 0;
				}
				if (!_hp) getUnit(playerX, playerY).apple = 0;
				updateActionButton();
			} else
			if (gamePlayer.overlay == UnitType.GOLD) {
				prepareDialog("Gold Ore", "Will you ?", quitGame, "Mine", displayDialog, "Exit");
			} else {
				// PASS
				if (inDialog) displayDialog();// hide the dialog
				//infoTab.innerHTML = `<br>${onFoot ? 'Dug, nothing? pass' : 'Fish, nothing? pass'}`;
				tween.transitionZ = 1;
				TweenFX.to(tween, 6, {transitionZ: 0}, e => doFrameAnimationMove(), e => finalizeMove(0));
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
	hasTutorial = 0;// disable tutorial presented as "?" at the beginning
	gameDirty = 2;
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

	// change character/ship appearance as player moves
	unitsData[playerY][playerX] = boarding || !onFoot
		? dir % 2 ? (dir-1 ? UnitType.SHIPUP : UnitType.SHIPDOWN) : dir == 2 ? UnitType.SHIPRIGHT : UnitType.SHIPLEFT
		: dir == 2 ? UnitType.PLAYERRIGHT : UnitType.PLAYER;

	performEnemyMoves();
}

function doFrameAnimationMove() {
	boardZoom = tween.mapZoom;
	gameDirty = 2;// set on each turn to redraw the map
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

	turn ++;
	gameDirty = 2;
	paused = false;
	if (holding && dir) {
		action(dir);
	} else {
		backFromDialog();
	}

	if (!onFoot && dir) {
		moveLeft -= 1;
	}

	revealAroundUnit(playerX, playerY);

	//debugBoard();
}

function backFromDialog() {
	if (inDialog) displayDialog();
	gameContainer.style.display = "block";//TODO: fix lag
	updateActionButton();
	updateInfoTab();
}

function performEnemyMoves() {
	paused = true;
	gameContainer.style.display = "none";
	// move enemies
	enemies.forEach(enemy => {
		if (((enemy.type == UnitType.ENEMY3 || enemy.type == UnitType.ENEMY4) && isWalkable(enemy.x + 1, enemy.y, 99) ||
				enemy.type == UnitType.ENEMY2 && mapData[enemy.y][enemy.x+1]<TileType.LAND && islandGenerator.rand(0,1)
			) && islandGenerator.rand(0, enemy.x < playerX ? 1 : 3)) {
				enemy.movingX = 1; enemy.movingY = 0;
		} else if ((
				(enemy.type == UnitType.ENEMY3 || enemy.type == UnitType.ENEMY4) && isWalkable(enemy.x - 1, enemy.y, 99) ||
				enemy.type == UnitType.ENEMY2 && mapData[enemy.y][enemy.x-1]<TileType.LAND && islandGenerator.rand(0,1)
			) && islandGenerator.rand(0, enemy.x > playerX ? 1 : 3)) {
				enemy.movingX = -1; enemy.movingY = 0;
		} else if ((
				(enemy.type == UnitType.ENEMY3 || enemy.type == UnitType.ENEMY4) && isWalkable(enemy.x, enemy.y + 1, 5) && islandGenerator.rand(0,1)
			) && islandGenerator.rand(0, enemy.y < playerY ? 1 : 3)) {
				enemy.movingY = 1; enemy.movingX = 0;
		} else if ((
				(enemy.type == UnitType.ENEMY3 || enemy.type == UnitType.ENEMY4) && isWalkable(enemy.x, enemy.y - 1, 99) ||
				enemy.type == UnitType.ENEMY1 && mapData[enemy.y-1][enemy.x]<TileType.LAND && islandGenerator.rand(0,1)
			) && islandGenerator.rand(0, enemy.y > playerY ? 1 : 3)) {
				enemy.movingY = -1; enemy.movingX = 0;
		}
	});
}

function upgradeShip() {
	if (shipHealth < shipHealthMax) {
		gold -= (shipHealthMax - shipHealth) * 5;
		shipHealth += shipHealthMax - shipHealth;
		
	} else {
		gold -= [100,250,500][shipLevel-1];
		shipLevel ++;
		shipHealthMax = shipHealth += shipLevel == 3 ? 10 : 12;
	}
	
	backFromDialog();
	resizeUI();
	infoButtonClick(1);
}

function upgradeCrew() {
	crewLevel ++;
	crewHealth += crewLevel < 3 ? 12 : 10;
	backFromDialog();
}

function closeButtonClick(e) {
	prepareDialog("Close", "You sure?", quitGame, "Yes", displayDialog, "No");
}


function infoButtonClick(id) {
	prepareDialog(
		"<br>",// + (id == 1 ? "Ship" : id ? "Crew" : "Corsair"),
		(id == 1 ? "Ship" : id ? "Crew" : "Corsair") + " HP: " + (id == 1 ? shipHealth : id ? crewHealth : playerHealth) +
			"/" + (id == 1 ? shipHealthMax : id ? crewHealthMax : playerHealthMax),
		displayDialog
	);
	dialog.firstChild.append(id == 1 ? offscreenBitmapsFlipped[2] : id ? offscreenBitmapsFlipped[8] : offscreenBitmaps[0]);
	//dialog.firstChild.firstChild.style.marginTop = "2vmin";
	dialog.firstChild.lastChild.style.transform = "scale(1.5) translateY(-30%)";
}

function quitGame() {
	state = -1;
	switchState();
}

function isWalkable(x, y, mapId = UnitType.CASTLE) {
	// check if current unit tile is player or empty, or walkable item as gold, tree, etc.
	// also check if current map tile is land
	return (unitsData[y][x] < UnitType.SHIPUP || unitsData[y][x] >= mapId) &&
			(mapData[y][x] >= TileType.LAND);
}

function isSailable(x, y, tileId = TileType.RIFF2) {
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
