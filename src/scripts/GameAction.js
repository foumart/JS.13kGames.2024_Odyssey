function action(direction) {
	if (paused) return;//hardChoice
	if (inBattle && !direction) {
		// Attack button clicked
		beginNewRound();
		return;
	}
	let _unit;
	switch (direction) {
		case 1: // Up
			// check collision
			if (inDialog) return;
			boarding = playerX == shipX && playerY-1 == shipY && onFoot;
			landing = !onFoot && !isPassable(playerX, playerY-1, TileType.LAND);
			if (isPassable(playerX, playerY-1) || boarding || landing) {
				_unit = getUnit(playerX, playerY-1);
				if (_unit && _unit.type == UnitType.CASTLE && _unit.origin > 1) {
					prepareSurfaceBattle(_unit, 1);
					return;
				}
				if (_unit && _unit.type > UnitType.SHIPRIGHT && _unit.type < UnitType.CASTLE) {
					prepareSurfaceBattle(_unit);
					return;
				}
				unitsData[playerY][playerX] = landing ? UnitType.SHIPLEFT : gamePlayer.overlay;
				playerY --;
				gamePlayer.y --;
				if (!onFoot && !landing) gameShip.y --;
				if (playerY < jump) {// TODO: fix wrapping or make the map constrained
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
			if (inDialog) return;
			boarding = playerX+1 == shipX && playerY == shipY && onFoot;
			landing = !onFoot && !isPassable(playerX+1, playerY, TileType.LAND);
			if (isPassable(playerX+1, playerY) || boarding || landing) {
				_unit = getUnit(playerX+1, playerY);
				if (_unit && _unit.type == UnitType.CASTLE && _unit.origin > 1) {
					prepareSurfaceBattle(_unit, 1);
					return;
				}
				if (_unit && _unit.type > UnitType.SHIPRIGHT && _unit.type < UnitType.CASTLE) {
					prepareSurfaceBattle(_unit);
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
			if (inDialog) return;
			boarding = playerX == shipX && playerY+1 == shipY && onFoot;
			landing = !onFoot && !isPassable(playerX, playerY+1, TileType.LAND);
			if (isPassable(playerX, playerY+1) || boarding || landing) {
				_unit = getUnit(playerX, playerY+1);
				if (_unit && _unit.type == UnitType.CASTLE && _unit.origin > 1) {
					prepareSurfaceBattle(_unit, 1);
					return;
				}
				if (_unit && _unit.type > UnitType.SHIPRIGHT && _unit.type < UnitType.CASTLE) {
					prepareSurfaceBattle(_unit);
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
			if (inDialog) return;
			boarding = playerX-1 == shipX && playerY == shipY && onFoot;
			landing = !onFoot && !isPassable(playerX-1, playerY, TileType.LAND);
			if (isPassable(playerX-1, playerY) || boarding || landing) {
				_unit = getUnit(playerX-1, playerY);
				if (_unit && _unit.type == UnitType.CASTLE && _unit.origin > 1) {
					prepareSurfaceBattle(_unit, 1);
					return;
				}
                if (_unit && _unit.type > UnitType.SHIPRIGHT && _unit.type < UnitType.CASTLE) {
					prepareSurfaceBattle(_unit);
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

		default: // Action
			_unit = getUnit(playerX, playerY);
			if (hasTutorial) {
				hasTutorial = '<br>Upgrade Ship at Castle ' + getSpan('&#9873', colors[1]) + '<br><br>Conquer Castles ';
				for (_unit = 2; _unit < colors.length; _unit++) {
					hasTutorial += " " + getSpan('&#9873', colors[_unit]);
				}
				prepareDialog("", hasTutorial + "<br>");
			} else
			if (gamePlayer.overlay == UnitType.CASTLE) {
				let _hplost = playerHealthMax - playerHealth + crewHealthMax - crewHealth;
				let _rest = _hplost || moveLeft < moveLimit;
				let _shiplost = shipHealthMax - shipHealth;
				let _shipmenu = _shiplost || shipLevel < 4;
				let _amount = _shipmenu
					? _shiplost * 2
					: 1 + (playerHealthMax - playerHealth + crewHealthMax - crewHealth + moveLimit - moveLeft) / 2 | 0;
				
				prepareDialog(
					_rest ? "Inn" : "Shipyard",
					_rest ? "Restore Crew HP<br>Refresh Ship movement<br>" + getSpan("<br><u>Advances time by 1 day</u>!<br>", "#ffd") : _shipmenu ?
						_shiplost ? "<br>Repair Ship damage<br><br>" :
						shipLevel > 3 ? '<br>Ship maxed<br>' :
						`<br>Upgrade Ship HP+${shipLevel == 2 ? 10 : 12}?<br><br>` : '',

					_rest ? e => {
						if (spendGold(_amount)) return;
						healPlayer(_hplost);
						backFromDialog();
						moveLeft = moveLimit;
						timePassed ++;
						updateInfoTab();
						fadeBackground();
						prepareDialog("Day " + timePassed, "<br>", closeAllScreens);
						//action();
					} : shipLevel < 4 ? upgradeShip : displayDialog,
					_rest ? "Rest " + goldIcon + _amount : shipLevel < 4 ? shipHealth < shipHealthMax ?
						"Repair " + goldIcon + _shiplost * 2 :
						"Deal " + goldIcon + shipPrices[shipLevel-1] : 0,

					displayDialog, "Exit"
					/*_unit.rumors && !additionalParam ? () => action(0, 1) : _shipmenu ? e => {
						_hp = (_unit.origin)*(crewHealthMax / 5 | 0);
						prepareDialog(
							"Tavern",
							'<br>Hear the latest rumors?<br><br>',
							() => displayRumors(_unit.rumors, _hp),
							"Ale " + goldIcon + _hp,
							displayDialog, "Exit"
						);
					} : displayDialog,
					_shipmenu ? "Next" : "Exit"*/
				);
			} else
			if (gamePlayer.overlay == UnitType.SHRINE) {

				dungeon = _unit.dungeon;
				displayDungeon();

			} else
			if (gamePlayer.overlay == UnitType.TREE && (playerHealth < playerHealthMax || crewHealth < crewHealthMax)) {
				healPlayer();
				getUnit(playerX, playerY).apple = 0;
				updateActionButton();
			} else {
				// PASS action
				if (inDialog) displayDialog();// hide the dialog
				tween.transitionZ = 1;
				TweenFX.to(tween, 6, {transitionZ: 0}, e => doFrameAnimationMove(), e => finalizeMove(0));
				performEnemyMoves();
			}

		break;
	}
}