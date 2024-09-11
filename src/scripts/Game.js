let unit,
	gamePlayer,
	gameShip,
	boarding,
	landing,
	onFoot = true,// player starts on foot
	holding,// is player holding a direction button for constant moving
	inDialog,// is a dialog on screen
	inBattle,// is player in battle
	hardChoice,// make a dialog permanent non skippable
	hasTutorial;

const colors = ["#000", "red", "#fff", "aqua", "yellow", "magenta"];
const shipPrices = [250,500,1e3];

let stage, turn, gold,
	moveLeft, moveLimit, timePassed,
	crewHealth, crewHealthMax, crewLevel, crewPaid,
	playerHealth, playerHealthMax, playerLevel,
	shipHealth, shipHealthMax, shipLevel,
	playerBitmap, shipBitmap, crewBitmap;

let enemiesKilled;

// initialize vars for new game
function initVars() {
	stage = 1;
	turn = 0;
	gold = 5;
	moveLeft = 24; moveLimit = 24;// 35
	crewPaid = 2;// it's 2 initialy for optimization purposes
	timePassed = 1;
	// 2: 0-24; 3: 25-37-48; 4: 49-60; 6: 61-72
	playerHealth = 20; playerHealthMax = 20; playerLevel = 1;
	shipHealth = 38; shipHealthMax = 38; shipLevel = 1;// 38, 48, 60,  72
	crewHealth = 24; crewHealthMax = 24; crewLevel = 1;// 36, 48, 60, 

	enemiesKilled = [];
}

function createUnit(x, y, z) {
	unit = new Unit(x, y, z);
	return unit;
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
		SoundFXmoveSail();
	} else if (landing) {
		onFoot = true;
		SoundFXmoveStep();
	} else if (!onFoot) {
		shipX = playerX; shipY = playerY;
		SoundFXmoveSail();
	} else {
		SoundFXmoveStep();
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
			crewHealth -= shipHealthMax/9;
			moveLeft += 13;//moveLimit/2;
			checkCrewSailing();
		}
	}

	revealAroundUnit(playerX, playerY);

	debugBoard();
}

function performEnemyMoves() {
	paused = true;
	gameContainer.style.display = "none";
	// move enemies
	enemies.forEach(enemy => { // RIGHT
		if (islandGenerator.rand(0,1)) {
			if (((enemy.type == UnitType.KNIGHT || enemy.type == UnitType.CRAB) && isWalkable(enemy.x + 1, enemy.y, 1) ||
					enemy.type == UnitType.SERPENT && isSailable(enemy.x + 1, enemy.y, TileType.WATER, 1)
				) && islandGenerator.rand(0, enemy.x > playerX ? 1 : 3)) {
					enemy.movingX = 1; enemy.movingY = 0;
			} else if (( // LEFT
					(enemy.type == UnitType.KNIGHT || enemy.type == UnitType.CRAB) && isWalkable(enemy.x - 1, enemy.y, 1) ||
					enemy.type == UnitType.SERPENT && isSailable(enemy.x - 1, enemy.y, TileType.WATER, 1)
				) && islandGenerator.rand(0, enemy.x < playerX ? 1 : 3)) {
					enemy.movingX = -1; enemy.movingY = 0;
			} else if (( // DOWN
					(enemy.type == UnitType.KNIGHT || enemy.type == UnitType.CRAB) && isWalkable(enemy.x, enemy.y + 1, 1)
				) && islandGenerator.rand(0, enemy.y > playerY ? 1 : 3)) {
					enemy.movingY = 1; enemy.movingX = 0;
			} else if (( // UP
					(enemy.type == UnitType.KNIGHT || enemy.type == UnitType.CRAB) && isWalkable(enemy.x, enemy.y - 1, 1)
				) && islandGenerator.rand(0, enemy.y < playerY ? 1 : 3)) {
					enemy.movingY = -1; enemy.movingX = 0;
			}
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

function getAttackDamage(id) {
	return (id == 1 ? 1 + shipLevel * 2 : id == 2 ? crewLevel : !id
		? playerLevel + 1
		: getEnemyAttack(id - 3)
	);
}

function quitGame() {
	state = -1;
	switchState();
}

function isWalkable(x, y, enemy) {
	// check if current unit tile is occupied or empty, or walkable item as gold, tree, etc.
	// also check if current map tile is land
	return (
		!unitsData[y][x] ||
		(unitsData[y][x] < UnitType.SHIPUP || unitsData[y][x] > UnitType.SHIPRIGHT && unitsData[y][x] < UnitType.CASTLE) && !enemy ||
		(unitsData[y][x] > UnitType.CRAB && unitsData[y][x] < UnitType.BAT)
	) && mapData[y][x] > TileType.RIFF2;
}

function isSailable(x, y, tileId = TileType.RIFF2, enemy = false) {
	// check if current unit tile is player or empty, or walkable item as gold wreck.
	// also check if current map tile is at least water tileId (depth)
	return (
		unitsData[y][x] && enemy ||
		unitsData[y][x] < UnitType.SHIPUP ||
		unitsData[y][x] == UnitType.WRECK
	) && mapData[y][x] < tileId;
}

// only used for player
function isPassable(x, y, tileId = TileType.RIFF2) {
	if (onFoot) {
		return isWalkable(x, y);
	}
	return isSailable(x, y, tileId);
}
