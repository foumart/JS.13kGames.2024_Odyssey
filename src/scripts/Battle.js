let dungeon,// an array of all the floors and their enemies in the dungeon
	dungeonStage,// current floor
	dungeonRoom,// current battle in the floor
	dungeonEnemy,// current enemy fighting
	dungeonEnemyHealth,
	dungeonEnemyAttack,
	dungeonEnemyBitmap,
	dungeonEnemyHealthBar,// the enemy element span holding enemy health bar symbols
	dungeonFlee,// increases on unsuccessfull flee attempts to increase the chance to escape battle
	dungeonFighting;// bool if we are currently animating a fight

function getEnemyName(_id) {
	return [
		"Bat", "Slime", "Wolf", "Goblin", "Imp",
		"Orc", "Wizard", "Troll", "Lich", "Dragon", "Balrog"
	][_id > 9 ? _id - 20 : _id];
}

function getEnemyAttack(_id) {
	return [
		1, 2, 2, 2, 1,
		3, 3, 6, 5, 12, 16
	][_id > 9 ? _id - 20 : _id];
}

function getEnemyHP(_id) {
	return [
		6, 10, 12, 16, 16,
		24, 20, 42, 32, 60, 90
	][_id > 9 ? _id - 20 : _id];
}

function getSurfaceEnemyName(_id) {
	return ["Squid", "Serpent", "Knight", "Crab"][_id];
}

function getDungeonStagesString(label = "") {
	let haveEnemies, notCleared, previousEmpty, dungeonStages = label + "Stages: ";
	dungeon.forEach((_nextStage, _index) => {console.log(_index, _nextStage, _nextStage.length);
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
		dungeonStages += ' &#8943';// add ⋯ after stages if there are unexplored dungeon rooms
	}
	return [dungeonStages, haveEnemies];
}

function displayDungeon(_dungeon) {
	_dungeon = getDungeonStagesString("<br>Dungeon<br>");
	prepareDialog(
		_dungeon[0],
		"",
		_dungeon[1] ? descendInDungeon : displayDialog, _dungeon[1] ? "Descend" : "Exit",
		_dungeon[1] ? displayDialog : 0, _dungeon[1] ? "Exit" : 0
	);
}

function nextRoomInDungeon() {

}

function descendInDungeon(_skip) {
	//tween.transitionZ = boardScale;
	//TweenFX.to(tween, 9, {transitionZ: 4}, e => doFrameAnimationMove(0, 1), e => { }, 1);
	dungeonFlee = 0;
	dungeonStage = -1;
	dungeonRoom = -1;
	dungeon.forEach((_nextStage, _index) => {// TODO: fix dungeon stage advancing
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
		updateInfoTab();
		prepareDialog(
			`<br>`,//Stage ${dungeonStage}, Room ${dungeonRoom}
			`<br>Stage ${dungeonStage}: you see a${dungeonEnemy==3?"n":""} ${getEnemyName(dungeonEnemy)}<br>`,
			dungeonBattle, "Fight",
			closeAllScreens, "Exit"
		);
	}

	dialog.firstChild.append(offscreenBitmaps[36 + dungeonEnemy]);
	uiDiv.style.background = "#2228";
}

function dungeonBattle() {
	if (inDialog) displayDialog();// hide dialog screen

	prepareBattleScreen(
		"<br>",
		"<br>Enemy is prepared for a fight!<br>",
		beginNewRound, "Attack",
		tryToFleeBattle, "Flee"
	);

	dungeonEnemyBitmap = addBitmapToScreen(
		battleScreen.firstChild,
		offscreenBitmapsFlipped[36 + dungeonEnemy],
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

function getEnemyHealthBar() {
	return addHealthbar(dungeonEnemyHealth, getEnemyHP(dungeonEnemy));
}

function closeAllScreens() {
	uiDiv.style.background = "0";
	if (inBattle) displayBattleScreen();// close the battle screen
	if (inDialog) displayDialog();// close any visible dialogs
	resizeUI();
	updateInfoTab();
	updateActionButton();
}

function tryToFleeBattle() {
	if (dungeonFighting) return;
	let _level = dungeonStage + 1;
	if (Math.random() * _level > dungeonEnemy && dungeonFlee > -1) {
		// player will escape
		//console.log(1, Math.random() * _level , dungeonEnemy)
		if (Math.random() * _level < dungeonEnemy) {
			// player will however suffer a hit
			animateUnitHit(dungeonEnemy + 3, e => prepareDialog("Fled", "<br>Not after an enemy hit.<br>", closeAllScreens));
		} else {
			prepareDialog("<br>Fled", "<br>", closeAllScreens);
		}
	} else {
		// player cannot escape
		//console.log(2, Math.random() * _level , dungeonEnemy)
		if (Math.random() * _level < dungeonEnemy && dungeonFlee < _level) {
			// player will receive a hit on top of that
			dungeonFlee ++;
			animateUnitHit(dungeonEnemy + 3, e => prepareDialog("Escaping...", "<br>The enemy hits you while trying.<br>", displayDialog));
		} else {
			dungeonFlee = -1;
			prepareDialog("<br>Cannot flee battle!", "<br>", displayDialog);
		}
	}
}

function animateUnitHit(_id, _callback) {
	let _unitBitmap = !_id ? playerBitmap : _id==1 ? shipBitmap : _id==2 ? crewBitmap : dungeonEnemyBitmap;
	tween.transitionZ = 1;
	TweenFX.to(tween, 3, {transitionZ: 1.2},
		e => {
			_unitBitmap.style.transform = `scale(${tween.transitionZ})`;
		},
		e => {
			TweenFX.to(tween, 9, {transitionZ: 1},
				e => {
					_unitBitmap.style.transform = `scale(${tween.transitionZ})`;
				},
				e => {
					if (_id > 2) {
						if (Math.random() < .5) {
							// atacks the hero
							playerHealth -= dungeonEnemyAttack;
						} else {
							// atacks the crew
							crewHealth -= dungeonEnemyAttack;
						}
					} else {
						dungeonEnemyHealth -= getAttackDamage(_id);
						dungeonEnemyHealthBar.innerHTML = getEnemyHealthBar();
					}

					resizeUI();

					_callback();
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

function beginNewRound() {
	if (dungeonFighting) return;
	disableBattleInteractions();
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


function battleVictory() {
	TweenFX.to(tween, 9, {transitionZ: 2},
		e => {
			dungeonEnemyBitmap.style.transform = `scale(${tween.transitionZ})`;
			dungeonEnemyBitmap.style.opacity = (2 - tween.transitionZ);
		},
		e => {
			enableBattleInteractions();

			enemiesKilled.push(dungeonEnemy)
			dungeon[dungeonStage - 1][dungeonRoom - 1] = -1;// mark the enemy as destroyed
			let stageCleared = dungeonRoom == dungeon[dungeonStage - 1].length;
			let bonus = islandGenerator.rand(dungeonStage, getEnemyHP(dungeonEnemy)/2) * (stageCleared ? 2 : 1) + (stageCleared ? dungeonStage*9 : 0);
			gold += bonus;
			let lastStage = dungeonStage == dungeon.length && stageCleared;

			prepareBattleScreen(
				getSpan(stageCleared ? `<br>Stage ${dungeonStage} cleared!` : "<br>Victory!", "#fe8", "9vmin"),
				`<br>Found ${bonus} gold.<br>` + (lastStage ? "<br>Found Healing Potion.<br>" : ""),
				lastStage ? completeDungeon : stageCleared ? descendInDungeon : e => descendInDungeon(1),
				lastStage ? "Complete" : stageCleared ? "Descend" : "Advance",
				lastStage ? 0 : closeAllScreens, "Exit"
			);
		}
	);
}

function completeDungeon() {
	console.log(getUnit(playerX, playerY));
	getUnit(playerX, playerY).origin = 1;
	closeAllScreens();
}

/*function clearDungeonStage() {
	prepareDialog(
		`Stage ${dungeonStage} cleared!`,
		"",
		descendInDungeon, "Descend",
		closeAllScreens, "Exit"
	);
}*/