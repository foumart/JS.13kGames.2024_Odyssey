let unit,
	gamePlayer,
	gameShip,
	boarding,
	landing,
	holding,
	onFoot = true,
	inDialog = false,
	hasEvent = false;
const colors = ["lime","red","aqua","white","magenta"];

let stage = 1;
let turn = 0;
let gold = 100;
let shipLeft = 99;
let moveLeft = 99;
let timeLeft = 13;
let crewHealth = 20, crewHealthMax = 20,
	playerHealth = 15, playerHealthMax = 20,
	shipHealth = 30, shipHealthMax = 30;

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
				let _unit = getUnit(playerX, playerY-1);
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
				let _unit = getUnit(playerX+1, playerY);
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
				let _unit = getUnit(playerX, playerY+1);
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
				let _unit = getUnit(playerX-1, playerY);
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
			if (!turn) {
				prepareDialog("Ahoy Corsair !", "Castle: Boost Ship Towns: Hire Crew Shrines: Earn Gold", displayDialog);
			} else
			if (gamePlayer.overlay == UnitType.CASTLE) {
				prepareDialog("Capitol", "Increase ship HP", quitGame, "&#9737 500", displayDialog, "Exit");
			} else if (gamePlayer.overlay == UnitType.SHINE) {
				prepareDialog("Shrine", "Will you ?", quitGame, "Meditate", displayDialog, "Exit");
			} else if (gamePlayer.overlay == UnitType.TREE) {
				let applePoints = 10;
				if (playerHealth < playerHealthMax - applePoints) {
					playerHealth += applePoints;
					// reduce apples on tile
				} else if (playerHealth < playerHealthMax) {
					playerHealth = playerHealthMax;
					// eating only part ?
				}
				updateActionButton();
			} else if (gamePlayer.overlay == UnitType.GOLD) {
				prepareDialog("Gold Ore", "Will you ?", quitGame, "Mine", displayDialog, "Exit");
			} else {
				// PASS
				if (inDialog) displayDialog();// hide the dialog
				//infoTab.innerHTML = `<br>${onFoot ? 'Dug, nothing? pass' : 'Fish, nothing? pass'}`;
				tween.transitionU = 1;
				TweenFX.to(tween, 6, {transitionU: 0}, e => doFrameAnimationMove(), e => finalizeMove(0));
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
		gameContainer.style.display = "block";//TODO: fix lag
		updateActionButton();
		updateInfoTab();
	}

	revealAround(playerX, playerY);
	if (!onFoot) {
		revealAround(playerX-1, playerY);
		revealAround(playerX+1, playerY);
		revealAround(playerX, playerY-1);
		revealAround(playerX, playerY+1);
	}

	//debugBoard();
}

function updateInfoTab() {
	//if (infoTab) infoTab.innerHTML = `<br>Position: ${playerX}x${playerY}<br>${idsData[playerY][playerX] ? 'Exploring Island '+idsData[playerY][playerX] : 'Sailing'}`;
	//if (infoTab) {
		let _char = "&#9608 ";
		let _sp = "  ";
		infoTab.innerHTML = `${_sp.repeat(timeLeft)}<span style="font-size:8vmax;color:#0c0">&#119113</span><br>${_char.repeat(17)}<span style="color:#ccc">${
			_char.repeat(12)}</span><div style="font-size:4vmax;color:gold"><br><br><br><br>${stage}&#10091 &#9737 ${gold}</div>`

	//}
}

function debugBoard() {
	if (_debug) console.log(
		unitsData.map(arr => arr.map(num => (!num ? "0" + num.toString(16) : (num==7?"^":num>=1&&num<11?num<7?num<3?"█":"█":"█":num==11?"▀":" ") + num.toString(16)).toUpperCase())).join("\n")
	);
}

function performEnemyMoves() {
	paused = true;
	gameContainer.style.display = "none";
	// move enemies
	enemies.forEach(enemy => {
		if (((enemy.type == UnitType.ENEMY3 || enemy.type == UnitType.ENEMY4) && isWalkable(enemy.x + 1, enemy.y, 99) ||
				enemy.type == UnitType.ENEMY2 && mapData[enemy.y][enemy.x+1]<TileType.SHINE && islandGenerator.rand(0,1)
			) && islandGenerator.rand(0, enemy.x < playerX ? 1 : 3)) {
				enemy.movingX = 1; enemy.movingY = 0;
		} else if ((
				(enemy.type == UnitType.ENEMY3 || enemy.type == UnitType.ENEMY4) && isWalkable(enemy.x - 1, enemy.y, 99) ||
				enemy.type == UnitType.ENEMY2 && mapData[enemy.y][enemy.x-1]<TileType.SHINE && islandGenerator.rand(0,1)
			) && islandGenerator.rand(0, enemy.x > playerX ? 1 : 3)) {
				enemy.movingX = -1; enemy.movingY = 0;
		} else if ((
				(enemy.type == UnitType.ENEMY3 || enemy.type == UnitType.ENEMY4) && isWalkable(enemy.x, enemy.y + 1, 5) && islandGenerator.rand(0,1)
			) && islandGenerator.rand(0, enemy.y < playerY ? 1 : 3)) {
				enemy.movingY = 1; enemy.movingX = 0;
		} else if ((
				(enemy.type == UnitType.ENEMY3 || enemy.type == UnitType.ENEMY4) && isWalkable(enemy.x, enemy.y - 1, 99) ||
				enemy.type == UnitType.ENEMY1 && mapData[enemy.y-1][enemy.x]<TileType.SHINE && islandGenerator.rand(0,1)
			) && islandGenerator.rand(0, enemy.y > playerY ? 1 : 3)) {
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

function prepareDialog(_label, _label2, _callback1, _btn1, _callback2, _btn2) {
	dialog.innerHTML = `<u>${_label?_label+'</u><br>':''}<b>${_label2}</b><br><button style="color:#f009;background-color:#fda">${_btn1||"Okay"}</button>`;
	if (_callback2) dialog.innerHTML += `<button style="color:#0a09">${_btn2||"Cancel"}</button>`;
	if (!inDialog) displayDialog();
	if (_callback2) dialog.children[dialog.children.length - 2].addEventListener(interactionTap, _callback1);
	dialog.lastChild.addEventListener(interactionTap, _callback2 ? _callback2 : _callback1);
}

function closeButtonClick(e) {
	prepareDialog("Close", "You sure?", quitGame, "Yes", displayDialog, "No");
}


function infoButtonClick(e) {console.log(e)
	prepareDialog("Info", "You sure?", quitGame, "Yes", displayDialog, "No");
}

function quitGame() {
	state = -1;
	switchState();
}


function updateActionButton() {
	// ⚔️⚔ '&#9876' | ⛏ '&#9935' | ☸ '&#9784' | 🛠️🛠 &#128736 | ⚙️⚙ &#9881 | ⎚ &#9114 | ◯ | 〇 | 〇 &#12295 |
	// 🚢 &#128674 | 🛳 🛳️ | ⛵ &#9973 | 🛶 &#128758 | 🚤 | 🛥 &#128741 | 🛥️ | ⚓ &#9875 | 🔱 &#128305 |
	// 🪓 &#129683 | 🔧 &#128295 | 💎 &#128142 | ⚒️ | 💣 | 🌎 | ⚐ &#9872 | ⚑ &#9873 | ⚰ &#9904 | ⚱ &#9905 |
	// ♨ &#9832 | ⛓ &#9939 | ☄ &#9732 | ✖ &#10006 | × &#215 | 🗙 &#128473 | ✕ &#10005 | ❌ &#10060 | ⛝ &#9949 | ✕ &#x2715
	// █ &#9608" | ▀ &#9600" | ▄ &#9604 | ■ &#9632 | □ &#9633 | ▐ &#9616 | ⬞ &#11038 | ⬝ &#11037 | ❂ &#10050 |
	// ⌢ &#8994 | ᵔ &#7508 | ⤼ &#10556 | ට | 𝓠 &#120032 | 𝓞 | ⌓ ᗝ ◑ ❍ | Ѻ &#1146 | ▢ ⬯ | 𝕆 &Oopf; |
	// ⫝ &#10973 | ⥀ &#10560 | ⛀ | ⬭ | ⤽ | ⤸ | ⤺ &#10554 | 🜿 &#128831 | 𝅏▼▾ | ❫ &#10091 | ❩

	//unit = getUnit(playerX, playerY);

	if (
		gamePlayer.overlay >= UnitType.CASTLE &&
		gamePlayer.overlay < UnitType.WRECK
	) {
		//actButton.innerHTML = gamePlayer.origin>1 ? '&#9876' : '&#9881';
		actButton.innerHTML = `${gamePlayer.overlay==UnitType.TREE?'&#243':''}<div style='font-size:6vmin;position:relative;margin-top:-2vmax'>${gamePlayer.overlay==UnitType.TREE?'EAT':'ENTER'}</div>`;
		if (gamePlayer.overlay==UnitType.TREE) {
			
		} else {
			actButton.prepend(offscreenBitmaps[gamePlayer.overlay-1]);
		}
		
		offscreenBitmaps[gamePlayer.overlay-1].style = `margin-top:2vmax;border:1vmax solid #0000;border-radius:1vmax;background:#2266;position:relative;width:${(controls.offsetWidth*.4)}px`;
		
	} else if (gamePlayer.overlay == UnitType.WRECK) {//GOLD WRECK
		gamePlayer.overlay = 0;
		//console.log(getUnit(playerX, playerY), getUnitId(playerX, playerY));
		removeUnit(playerX, playerY);
		
		gold += 50;
		//updateActionButton();
		action(6);
	} else {
		actButton.innerHTML = onFoot ? hasEvent ? 'E' : 'L' : hasEvent ? 'E' : 'S';
		//actButton.style.opacity = hasEvent ? 1 : .5;
	}
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
