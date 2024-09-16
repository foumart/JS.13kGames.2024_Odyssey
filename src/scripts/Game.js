let unit,
	gamePlayer,
	gameShip,
	boarding,
	landing,
	onFoot = true,// player starts on foot
	holding,// is player holding a direction button for constant moving
	inDialog,// is a dialog on screen
	inBattle,// is player in battle, battle types: 1:dungeon, 2:land, 3:sea
	hardChoice,// make a dialog permanent non skippable
	hasTutorial,// displays initial info with the "?" button
	autoBattle;// allows automatic battles

const colors = [, "red", "#fff", "#0ff", "#ff0", "#f0f", "#0f0"];
const shipPrices = [300,600,1200];
const crewPrices = [250,500,1e3];

let turn, gold,
	moveLeft, moveLimit, timePassed,
	crewAttack, crewHealth, crewHealthMax, crewLevel, crewPaid,
	playerAttack, playerHealth, playerHealthMax, playerLevel,
	shipAttack, shipHealth, shipHealthMax, shipLevel,
	playerBitmap, shipBitmap, crewBitmap;

let enemiesKilled;
let experience;
let expLevels = [200,500,1e3];

// initialize vars for new game
function initVars() {
	onFoot = true;
	turn = 0;
	gold = 50;
	moveLeft = 24; moveLimit = 24;
	crewPaid = 2;// it's 2 initialy for optimization purposes
	timePassed = 1;
	// 2: 0-24; 3: 25-37-48; 4: 49-60; 6: 61-72
	playerAttack = 2; playerHealth = 20; playerHealthMax = 20; playerLevel = 1;
	shipAttack = 4; shipHealth = 38; shipHealthMax = 38; shipLevel = 1;// 38, 48, 60,  72
	crewAttack = 1; crewHealth = 24; crewHealthMax = 24; crewLevel = 1;// 36, 48, 60,
	experience = 0;

	enemiesKilled = [];
}

function createUnit(x, y, z) {
	unit = new Unit(x, y, z);
	return unit;
}

function prepareToMove(dir) {
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

	// damage ship if sailing through shallow riffs
	if (!onFoot && mapData[playerY][playerX] == 3) {
		shipHealth -= 5;
		checkShipHealth();
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
			enemy.overlay = unitsData[enemy.y][enemy.x];// TODO: fix animation movement glitches
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

	if (!onFoot && dir && !boarding) {
		moveLeft -= 1;
		if (moveLeft < 1) {
			// Final Boss coming for you
			if (timePassed == 13) {
				finalBattle(2);
			} else {
				crewHealth -= shipHealthMax / 3 | 0;
				moveLeft += moveLimit / 2 | 0;
			}
		}
		resizeUI();
	}

	checkCrewSailing();

	revealAroundUnit(playerX, playerY);

	//debugBoard();
}

function performEnemyMoves() {
	paused = true;
	gameContainer.style.display = "none";
	// move enemies
	enemies.forEach(enemy => { // RIGHT
		if (islandGenerator.rand(0,1)) {
			if (((enemy.type == UnitType.KNIGHT || enemy.type == UnitType.CRAB) && isWalkable(enemy.x + 1, enemy.y, enemy.type)
					|| enemy.type == UnitType.SERPENT && isSailable(enemy.x + 1, enemy.y, TileType.RIFF1, 1)
				) && islandGenerator.rand(0, enemy.x > playerX ? 1 : enemy.type == UnitType.KNIGHT ? 9 : 3)) {
					enemy.movingX = 1; enemy.movingY = 0;
			} else if (( // LEFT
					(enemy.type == UnitType.KNIGHT || enemy.type == UnitType.CRAB) && isWalkable(enemy.x - 1, enemy.y, enemy.type)
					|| enemy.type == UnitType.SERPENT && isSailable(enemy.x - 1, enemy.y, TileType.RIFF1, 1)
				) && islandGenerator.rand(0, enemy.x < playerX ? 1 : enemy.type == UnitType.KNIGHT ? 9 : 3)) {
					enemy.movingX = -1; enemy.movingY = 0;
			} else if (( // DOWN
					(enemy.type == UnitType.KNIGHT || enemy.type == UnitType.CRAB) && isWalkable(enemy.x, enemy.y + 1, enemy.type)
				) && islandGenerator.rand(0, enemy.y > playerY ? 1 : enemy.type == UnitType.KNIGHT ? 9 : 3)) {
					enemy.movingY = 1; enemy.movingX = 0;
			} else if (( // UP
					(enemy.type == UnitType.KNIGHT || enemy.type == UnitType.CRAB) && isWalkable(enemy.x, enemy.y - 1, enemy.type)
				) && islandGenerator.rand(0, enemy.y < playerY ? 1 : enemy.type == UnitType.KNIGHT ? 9 : 3)) {
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

function healPlayer(_hp = 9) {
	if (playerHealth < playerHealthMax) {
		playerHealth += _hp;
		_hp = 0;
		if (playerHealth > playerHealthMax) {
			_hp += playerHealth - playerHealthMax;
			playerHealth = playerHealthMax;
		}
	}
	if (crewHealth < crewHealthMax && _hp) {
		crewHealth += _hp;
		if (crewHealth > crewHealthMax) crewHealth = crewHealthMax;
	}
}

function getAttackDamage(id) {
	return (id == 1 ? shipAttack : id == 2 ? crewAttack : !id ? playerAttack : getEnemyAttack(id == 12 ? 12 : id - 3));
}

function quitGame() {
	closeAllScreens();
	state = -1;
	switchState();
}

function isWalkable(x, y, enemyType) {
	// check if current unit tile is occupied or empty, or walkable item as gold, tree, etc.
	// also check if current map tile is land
	return (
		!unitsData[y][x] ||
		(unitsData[y][x] < UnitType.SHIPUP || unitsData[y][x] > UnitType.SHIPRIGHT && unitsData[y][x] < UnitType.CASTLE) && !enemyType ||
		(unitsData[y][x] > UnitType.CRAB && unitsData[y][x] < UnitType.BAT)
	) && mapData[y][x] > TileType.RIFF2;
}

function isSailable(x, y, tileId = TileType.RIFF2, enemy = false) {
	// check if current unit tile is player or empty, or takable item as gold wreck.
	// also check if current map tile is water (tileId)
	return (
		!(unitsData[y][x] && enemy) ||
		(unitsData[y][x] < UnitType.SHIPUP || unitsData[y][x] == UnitType.WRECK) && !enemy
	) && mapData[y][x] <= tileId;
}

// only used for player
function isPassable(x, y, tileId = TileType.RIFF2) {
	if (onFoot) {
		return isWalkable(x, y);
	}
	return isSailable(x, y, tileId);
}
