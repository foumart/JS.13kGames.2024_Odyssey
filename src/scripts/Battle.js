let dungeon,// an array of all the floors and their enemies in the dungeon
	dungeonStage,// current floor
	dungeonRoom,// current battle in the floor
	dungeonSiege,// are we atacking a castle currently
	dungeonEnemy,// current enemy fighting
	dungeonEnemyHealth,
	dungeonEnemyAttack,
	dungeonEnemyBitmap,
	dungeonEnemyHealthBar,// the enemy element span holding enemy health bar symbols
	dungeonEnemyUnit,// only for surface battles (yeah, we use dungeon battle screen for that too)
	dungeonFlee,// increases on unsuccessfull flee attempts to increase the chance to escape battle
	dungeonFighting,// bool if we are currently animating a fight
	battleIntro;// bool if we are preparing for battle, showing who will fight depending if sailing

function getEnemyName(_id) {
	if (dungeonSiege) return "Castle";
	return [
		"Bat", "Slime", "Wolf", "Imp", "Orc",
		"Wizard", "Troll", "Lich", "Dragon", "Balrog",
		"Squid", "Serpent", "Knight", "Crab"
	][_id > 13 ? _id - 20 : _id];
}

function getEnemyAttack(_id) {
	if (dungeonSiege) return 5;
	return [
		1, 2, 2, 1, 3,
		3, 6, 5, 12, 16,
		2, 5, 4, 3
	][_id > 13 ? _id - 20 : _id];
}

function getEnemyHP(_id) {
	if (dungeonSiege) return 30;
	return [
		6, 10, 12, 16, 24,
		20, 42, 32, 60, 90,
		24, 50, 32, 24
	][_id > 13 ? _id - 20 : _id];
}

function getDungeonStagesString(label = "") {
	let haveEnemies, notCleared, previousEmpty, dungeonStages = label + "Stages: ";
	dungeon.forEach((_nextStage, _index) => {
		haveEnemies = !_nextStage.every(x => x == -1);
		if (_index > 2 && haveEnemies) {
			notCleared = 1;
		}
		if (_index < 3 || !haveEnemies || previousEmpty) {
			// add current, cleared and rooms that are ahead
			dungeonStages += (!_index || previousEmpty) && haveEnemies ? ' &#128853' : ' &#974' + (haveEnemies ? 4 : 5);
		}
		previousEmpty = !haveEnemies;
	});
	if (dungeon.length > 3 && notCleared) {
		dungeonStages += ' &#8943';// add [⋯] at the end if there are unexplored dungeon rooms
	}
	return [dungeonStages, haveEnemies];
}

function displayDungeon(_dungeon) {
	_dungeon = getDungeonStagesString("<br>Dungeon<br>");
	prepareDialog(
		_dungeon[0],
		"",
		_dungeon[1] ? descendInDungeon : closeAllScreens, _dungeon[1] ? "Enter" : "Exit",
		_dungeon[1] ? closeAllScreens : 0, _dungeon[1] ? "Exit" : 0
	);
}

function descendInDungeon(event, _skip) {
	dungeonFlee = 0;
	dungeonStage = -1;
	dungeonRoom = -1;
	dungeon.forEach((_nextStage, _index) => {
		let haveEnemies = !_nextStage.every(x => x == -1);
		if (haveEnemies && dungeonStage < 0) {
			dungeonStage = _index + 1;
			dungeonRoom = _nextStage.findIndex(e => e > -1) + 1;
			dungeonEnemy = _nextStage[dungeonRoom-1];
			dungeonEnemyHealth = getEnemyHP(dungeonEnemy);
			dungeonEnemyAttack = getEnemyAttack(dungeonEnemy);
		}
	});

	if (_skip == 1) {
		dungeonBattle();
	} else {
		battleIntro = true;
		updateInfoTab();
		updateActionButton();
		prepareDialog(
			`<br>`,
			`You see a${dungeonEnemy==3||dungeonEnemy==4?"n":""} ${getEnemyName(dungeonEnemy)}<br>`,//a${dungeonEnemy==3?"n":""} // an imp, an orc, etc.
			dungeonBattle, "Fight",
			closeAllScreens, "Exit"
		);
		shipButton.style.opacity = .5;
	}

	dialog.firstChild.append(offscreenBitmaps[36 + dungeonEnemy]);
	fadeBackground();
}

function dungeonBattle() {
	if (inDialog) displayDialog();// hide dialog screen
	battleIntro = false;

	prepareBattleScreen(
		"<br>",
		getEnemyStatsString(),
		beginNewRound, "Attack",
		tryToFleeBattle, "Flee"
	);

	dungeonEnemyBitmap = addBitmapToScreen(
		battleScreen.firstChild,
		offscreenBitmapsFlipped[dungeonEnemy > 9 ? dungeonEnemy - 4 : 36 + dungeonEnemy],
		getEnemyName(dungeonEnemy),
		getEnemyHealthBar(),
		"scale(1.5)",
		() => infoButtonClick(dungeonEnemy + 3, dungeonEnemyHealth, dungeonEnemyAttack)
	);

	dungeonEnemyHealthBar = dungeonEnemyBitmap.lastChild;

	// TODO: battles with multiple enemies
	//addBitmapToScreen(battleScreen.firstChild, offscreenBitmaps[37 + dungeonEnemy], getEnemyName(dungeonEnemy), addHealthbar(10, 10), "scale(1.5)");
	//addBitmapToScreen(battleScreen.firstChild, offscreenBitmaps[38 + dungeonEnemy], getEnemyName(dungeonEnemy), addHealthbar(10, 10), "scale(1.5)");

	resizeUI();
	updateInfoTab();
	updateActionButton();
}

function getEnemyStatsString() {
	return `<br>HP: ${dungeonEnemyHealth} Attack: ${dungeonEnemyAttack}<br>`;
}

function getEnemyHealthBar() {
	return addHealthbar(dungeonEnemyHealth, getEnemyHP(dungeonEnemy));
}

function closeAllScreens() {
	battleIntro = false;
	fadeBackground(0);
	if (inBattle) displayBattleScreen();// close the battle screen
	if (inDialog) displayDialog();// close any visible dialogs
	resizeUI();
	updateInfoTab();
	dungeon = 0;
	updateActionButton();
	playerButton.style.opacity = 1;
	crewButton.style.opacity = 1;
	shipButton.style.opacity = 1;
}

function tryToFleeBattle() {
	if (dungeonFighting) return;
	let _level = inBattle == 1 ? dungeonStage + 1 : getEnemyName(dungeonEnemy).length - 3;
	let _enemy = dungeonEnemy > 9 ? dungeonEnemy - 9 : dungeonEnemy;
	if (Math.random() * _level > _enemy && dungeonFlee > -1) {
		// player will escape
		//console.log(1, Math.random() * _level , dungeonEnemy)
		if (Math.random() * _level < dungeonEnemy) {
			// player will however suffer a hit
			animateUnitHit(_enemy + 3, e => prepareDialog("Fled", "<br>Not after a hit.<br>", closeAllScreens));
		} else {
			prepareDialog("<br>Fled", "<br>", closeAllScreens);
		}
	} else {
		// player cannot escape
		//console.log(2, Math.random() * _level , dungeonEnemy)
		if (Math.random() * _level < _enemy && dungeonFlee < _level) {
			// player will receive a hit on top of that
			dungeonFlee ++;// TODO: fix fleeing in land and marine battles
			animateUnitHit(_enemy + 3, e => prepareDialog("Escaping...", "<br>Got hit trying.<br>", displayDialog));
		} else {
			dungeonFlee = -1;
			prepareDialog("<br>Cannot flee battle!", "<br>", displayDialog);
		}
	}
}

function beginNewRound() {
	if (dungeonFighting) return;
	disableBattleInteractions();
	if (inBattle == 4 || !onFoot) {
		// ship attacks
		animateUnitHit(1, e => {
			// enemy fight back
			if (dungeonEnemyHealth > 0) animateUnitHit(dungeonEnemy + 3, e => {
				enableBattleInteractions();
			}); else battleVictory();
		});
	} else {
		// hero attacks
		animateUnitHit(0, e => {
			// crew attacks
			if (dungeonEnemyHealth > 0) animateUnitHit(2, e => {
				// enemy fight back
				if (dungeonEnemyHealth > 0) animateUnitHit(dungeonEnemy + 3, e => {
					enableBattleInteractions();
				}); else battleVictory();
			}); else battleVictory();
		});
	}
}

function animateUnitHit(_id, _callback, _animationOnly) {
	let _unitBitmap = !_id ? playerBitmap : _id==1 ? shipBitmap : _id==2 ? crewBitmap : dungeonEnemyBitmap;
	tween.transitionZ = 1;
	TweenFX.to(tween, _animationOnly ? 9 : 3, {transitionZ: 1.2},
		e => {
			_unitBitmap.style.transform = `scale(${tween.transitionZ})`;
		},
		e => {
			TweenFX.to(tween, 9, {transitionZ: 1},
				e => {
					_unitBitmap.style.transform = `scale(${tween.transitionZ})`;
				},
				e => {
					if (!_animationOnly) {
						if (_id > 2) {
							if (inBattle == 4 || !onFoot) {
								// attacks the ship
								shipHealth -= dungeonEnemyAttack;
								checkShipHealth(_callback);
							} else if (Math.random() < .5 || crewHealth < dungeonEnemyAttack) {
								// attacks the hero
								playerHealth -= dungeonEnemyAttack;
								checkPlayerHealth(_callback);
							} else {
								// attacks the crew
								crewHealth -= dungeonEnemyAttack;
								checkCrewHealth(_callback);
							}
						} else {
							dungeonEnemyHealth -= getAttackDamage(_id);
							dungeonEnemyHealthBar.innerHTML = getEnemyHealthBar();
							battleScreen.children[2].innerHTML = getEnemyStatsString();
							animateDamage(battleScreen.children[0], _callback);
						}
	
						resizeUI();
					}
				}
			);
		}
	);
}

function animateDamage(_damagedUnit, _callback) {//TODO: aniamte bgr color? background: #adfb;
	disableBattleInteractions();
	tween.transitionZ = 1;
	TweenFX.to(tween, 3, {transitionZ: .9},
		e => {
			_damagedUnit.style.transform = `scale(${tween.transitionZ})`;
		},
		e => {
			TweenFX.to(tween, 3, {transitionZ: 1},
				e => {
					_damagedUnit.style.transform = `scale(${tween.transitionZ})`;
				},
				e => {
					enableBattleInteractions();
					if (_callback) _callback();
				}
			);
		}
	);
}

function enableBattleInteractions() {
	dungeonFighting = 0;
	actButton.style.opacity = 1;
}

function disableBattleInteractions() {
	dungeonFighting = 1;
	actButton.style.opacity = .5;
}

function checkShipHealth(_callback) {
	if (shipHealth < 1) {
		animateDamage(shipBitmap, () => {
			paused = true;
			prepareDialog("<br>Ship sunk!", "<br>Game Over<br>", quitGame);
		});
	} else {
		animateDamage(shipBitmap, _callback);
	}
}

function checkPlayerHealth(_callback) {
	if (playerHealth < 1) {
		animateDamage(playerBitmap, () => {
			paused = true;
			prepareDialog("<br>Hero fell!", "<br>Game Over<br>", quitGame);
		});
	} else {
		animateDamage(playerBitmap, _callback);
	}
}

function checkCrewHealth(_callback) {
	if (crewHealth < 0) {
		crewHealth = 0;
		crewButton.style.opacity = .5;
	}
	animateDamage(crewBitmap, _callback);
}

function battleVictory() {
	TweenFX.to(tween, 9, {transitionZ: 2},
		e => {
			dungeonEnemyBitmap.style.transform = `scale(${tween.transitionZ})`;
			dungeonEnemyBitmap.style.opacity = (2 - tween.transitionZ);
		},
		e => {
			enableBattleInteractions();
			enemiesKilled.push(dungeonEnemy);
			gainExperience(dungeonEnemy);
			SoundFXgetGold();
			if (inBattle==1) {
				dungeon[dungeonStage - 1][dungeonRoom - 1] = -1;// mark the enemy as destroyed
				let stageCleared = dungeonRoom == dungeon[dungeonStage - 1].length;
				let bonus = islandGenerator.rand(dungeonStage, getEnemyHP(dungeonEnemy)/2) * (stageCleared ? 2 : 1) + (stageCleared ? dungeonStage*9 : 0);
				gold += bonus;
				let lastStage = dungeonStage == dungeon.length && stageCleared;

				prepareBattleScreen(
					getSpan(stageCleared ? `<br>Stage ${dungeonStage} cleared!` : "<br>Victory!", "#fe8", "9vmin"),
					`<br>Found ${bonus} gold.<br>` + (lastStage ? "<br>Found Healing Potion.<br>" : ""),
					lastStage ? completeDungeon : stageCleared ? descendInDungeon : e => descendInDungeon(0, 1),
					lastStage ? "Complete" : stageCleared ? "Descend" : "Advance",
					lastStage ? 0 : closeAllScreens, "Exit"
				);
			} else {
				let bonus = islandGenerator.rand(9, getEnemyHP(dungeonEnemy)*2);
				
				if (dungeonEnemyUnit.type == UnitType.CASTLE) {
					// castle conquered
					bonus *= 3;
					castles.push([dungeonEnemyUnit.origin, dungeonEnemyUnit.x, dungeonEnemyUnit.y, 0]);
					dungeonEnemyUnit.origin = 1;
				} else {
					// regular surface unit destroyed
					removeUnit(dungeonEnemyUnit.x, dungeonEnemyUnit.y);
					unitsData[dungeonEnemyUnit.y][dungeonEnemyUnit.x] = 0;
					enemies.splice(enemies.indexOf(dungeonEnemyUnit), 1);
				}
				gold += bonus;
				
				prepareBattleScreen(
					getSpan("<br>Victory!", "#fe8", "9vmin"),
					`<br>Found ${bonus} gold.<br>`,
					closeAllScreens
				);
			}
		}
	);
}

function completeDungeon() {
	getUnit(playerX, playerY).origin = 1;
	closeAllScreens();
}

function gainExperience(_enemyId) {
	experience += getEnemyHP(_enemyId) / 2 | 0;
	if (
		playerLevel < 4 &&
		playerLevel == 1 && experience >= expLevels[playerLevel-1]
	) {
		gainLevel();
	}
}

function gainLevel() {
	playerLevel ++;
	playerAttack ++;
	playerHealth += 8;
	playerHealthMax += 8;
	updateInfoTab();
	prepareDialog(
		"<br>Hero level up!</br>",
		"Attack +1 &nbsp; HP: +8<br>"
	);
}

function prepareSurfaceBattle(_unit, _siege) {
	dungeonSiege = _siege;
	dungeonEnemyUnit = _unit;
	dungeonEnemy = _unit.type + 3;
	dungeonEnemyHealth = getEnemyHP(dungeonEnemy);
	dungeonEnemyAttack = getEnemyAttack(dungeonEnemy);
	battleIntro = true;

	updateInfoTab();
	updateActionButton();
	prepareDialog(
		dungeonSiege ? `Enemy Fort ${getSpan('&#9873', colors[dungeonEnemyUnit.origin])}<br>` : `<br>`,
		dungeonSiege ? `` : `<br>You see a${dungeonEnemy==3||dungeonEnemy==4?"n":""} ${getEnemyName(dungeonEnemy)}<br>`,
		dungeonBattle, dungeonSiege ? "Siege" : "Fight",
		closeAllScreens, "Run"
	);

	dialog.firstChild.append((dungeonEnemy-3 == UnitType.KNIGHT ? offscreenBitmapsFlipped : offscreenBitmaps)[_unit.type-1]);
	fadeBackground();
}
