let unit,
	gamePlayer,
	gameShip,
	boarding,
	landing,
	holding,// is player holding a direction button for constant moving
	onFoot = true,
	inDialog,// is a dialog on screen
	hardChoice,//TODO: make some dialogs permanent
	hasTutorial;

const colors = ["#000", "red", "#fff", "aqua", "yellow", "magenta", "lime"];
const enemyTypes = ["Bat", "Rat", "Wolf", "Skeleton", "Zombie", "Orc", "Troll", "Wizard", "Lich", "Dragon", "Balrog"];
const shipPrices = [250,500,999];

let stage, turn, gold,
	moveLeft, moveLimit, timePassed,
	crewHealth, crewHealthMax, crewLevel, crewPaid,
	playerHealth, playerHealthMax, playerLevel,
	shipHealth, shipHealthMax, shipLevel;

// initialize vars for new game
function initVars() {
	stage = 1;
	turn = 0;
	gold = 5;
	moveLeft = 25; moveLimit = 25;// 35
	crewPaid = 2;// it's 2 initialy for optimization purposes
	timePassed = 1;
	// 2: 0-24; 3: 25-37-48; 4: 49-60; 6: 61-72
	playerHealth = 10; playerHealthMax = 20; playerLevel = 1;
	shipHealth = 38; shipHealthMax = 38; shipLevel = 1;// 38, 48, 60,  72
	crewHealth = 24; crewHealthMax = 24; crewLevel = 1;// 36, 48, 60, 
}

function createUnit(x, y, z) {
	unit = new Unit(x, y, z);
	return unit;
}

function action(direction, additionalParam) {
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
			_unit = getUnit(playerX, playerY);
			if (hasTutorial) {
				hasTutorial = 'Upgrade Ship at Castle ' + getSpan('&#9873', colors[1]) + '<br>Conquer Castles ';
				for (_unit = 2; _unit < colors.length; _unit++) {
					hasTutorial += " " + getSpan('&#9873', colors[_unit]);
				}
				prepareDialog("Ahoy Corsair !", hasTutorial);
			} else
			if (gamePlayer.overlay == UnitType.CASTLE) {
				let _hp = !additionalParam && !isPlayerDamaged();
				let _amount = playerHealthMax - playerHealth + crewHealthMax - crewHealth;
				let secondMenu = shipHealth < shipHealthMax || shipLevel < 4;
				prepareDialog(
					_hp ? "Inn" : "Shipyard",
					_hp ? "Rest?" : secondMenu ?
						shipHealth < shipHealthMax ? "Repair Ship damage" :
						shipLevel > 3 ? 'Ship maxed' :
						`Increase Ship HP by ${shipLevel == 2 ? 10 : 12} ?` : 'Come Again!',

					_hp ? e => {
						if (spendGold(_amount)) return;
						healPlayer(_amount);
						backFromDialog();
						action(6, isPlayerDamaged());
					} : shipLevel < 4 ? upgradeShip : displayDialog,
					_hp ? "Heal &#9737;" + _amount : shipLevel < 4 ? shipHealth < shipHealthMax ?
						"Repair &#9737;" + (shipHealthMax - shipHealth) * 5 :
						"Deal &#9737;" + shipPrices[shipLevel-1] : 0,

					_unit.rumors && !additionalParam ? () => action(6, 1) : secondMenu ? e => {
						_hp = (_unit.origin)*(crewHealthMax / 5 | 0);
						prepareDialog(
							"Tavern",
							'Hear the latest rumors?',
							() => displayRumors(_unit.rumors, _hp),
							"Ale &#9737;" + _hp,
							displayDialog, "Exit"
						);
					} : displayDialog,
					secondMenu ? "Next" : "Exit"
				);
			} else
			if (gamePlayer.overlay == UnitType.SHRINE) {
				dungeon = _unit.dungeon;
				let notCleared, dungeonStages = "Stages: ";
				//console.log(_unit.dungeon)
				dungeon.forEach((dungeon, index) => {
					if (index > 2 && dungeon.length) notCleared = 1;
					if (index < 3 || !dungeon.length) {
						dungeonStages += !index || !dungeon[index-1].length ? ' &#128853' : ' &#974' + (dungeon.length ? 4 : 5);
					}
				});
				if (dungeon.length > 3 && notCleared) dungeonStages += ' ⋯';

				prepareDialog(
					"Dungeon",
					dungeonStages,
					descendInDungeon, "Descend",
					displayDialog, "Exit"
				);
			} else
			if (gamePlayer.overlay == UnitType.TREE) {
				let _hp = healPlayer();
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

function doFrameAnimationMove(_zoom, _scale) {
	if (_zoom) {
		boardZoom = tween.transitionZ;
	}
	if (_scale) {
		boardScale = tween.transitionZ;
	}

	gameDirty = 2;// set on each turn to redraw the map
}

function finalizeMove(dir) {
	// move enemies
	enemies.forEach(enemy => {
		if (enemy.movingX || enemy.movingY) {
			unitsData[enemy.y][enemy.x] = enemy.overlay;
			if (enemy.movingX) {
				enemy.x += enemy.movingX;
				enemy.movingX = 0;
			}
			if (enemy.movingY) {
				enemy.y += enemy.movingY;
				enemy.movingY = 0;
			}
			enemy.overlay = unitsData[enemy.y][enemy.x];
			unitsData[enemy.y][enemy.x] = enemy.type;
		}
	});

	turn ++;
	tween.transitionZ = 0;
	gameDirty = 2;
	paused = false;
	if (holding && dir) {
		action(dir);
	} else {
		backFromDialog();
	}

	if (!onFoot && dir) {
		moveLeft -= 1;
		if (moveLeft < 1) {
			crewHealth -= shipHealthMax/9|0;
			moveLeft += shipHealthMax/6|0;
			if (crewHealth < 1) {
				resizeUI();
				if (gold < crewHealthMax*2) {
					prepareDialog("Fatal Crew Mutiny!", "Game Over", quitGame);
				} else {
					prepareDialog("Revolt!", "Crew demands:", () => {
						if (spendGold(crewHealthMax * crewPaid)) return;
						crewPaid ++;
						crewHealth = crewHealthMax/2;
						backFromDialog();
					}, "Pay &#9737;" + crewHealthMax * crewPaid);
				}
			}
		}
	}

	revealAroundUnit(playerX, playerY);

	//debugBoard();
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

function spendGold(_amount) {
	if (gold < _amount) {
		displayNoFunds();
		return 1;
	}
	gold -= _amount;
	return 0;
}

function isPlayerDamaged() {
	return playerHealth < playerHealthMax || crewHealth < crewHealthMax ? 0: 1;
}

function healPlayer(_hp = 9) {
	if (playerHealth < playerHealthMax) {
		playerHealth += _hp;
		if (playerHealth > playerHealthMax) {
			_hp -= playerHealthMax - playerHealth;
			playerHealth = playerHealthMax;
		} else _hp = 1;
	}
	if (crewHealth < crewHealthMax) {
		crewHealth += _hp;
		if (crewHealth > crewHealthMax) crewHealth = crewHealthMax;
		_hp = 0;
	}
	return _hp;
}

function backFromDialog() {
	if (inDialog) displayDialog();
	gameContainer.style.display = "block";//TODO: fix lag
	updateActionButton();
	updateInfoTab();
}

function upgradeShip() {
	if (shipHealth < shipHealthMax) {
		if (spendGold((shipHealthMax - shipHealth) * 5)) return;
		shipHealth += shipHealthMax - shipHealth;
	} else {
		if (spendGold(shipPrices[shipLevel-1])) return;
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
			"/" + (id == 1 ? shipHealthMax : id ? crewHealthMax : playerHealthMax) +
			"<br>Level: " + (id == 1 ? shipLevel : id ? crewLevel : playerLevel),
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
