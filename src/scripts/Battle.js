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
		"Orc", "Troll", "Wizard", "Lich", "Dragon", "Balrog"
	][_id > 9 ? _id - 20 : _id];
}

function getEnemyAttack(_id) {
	return [
		1, 2, 2, 2, 1,
		3, 5, 6, 9, 12, 16
	][_id > 9 ? _id - 20 : _id];
}

function getEnemyHP(_id) {
	return [
		5, 10, 12, 16, 16,
		24, 32, 28, 42, 60, 90
	][_id > 9 ? _id - 20 : _id];
}

function getSurfaceEnemyName(_id) {
	return ["Squid", "Serpent", "Knight", "Crab"][_id];
}

function getDungeonStagesString(label = "") {
	let notCleared, dungeonStages = label + "Stages: ";
	dungeon.forEach((dungeon, index) => {//console.log(index, dungeon, dungeon.length);
		if (index > 2 && dungeon.length) notCleared = 1;
		if (index < 3 || !dungeon.length) {
			dungeonStages += !index || !dungeon.length ? ' &#128853' : ' &#974' + (dungeon.length ? 4 : 5);
		}
	});
	if (dungeon.length > 3 && notCleared) dungeonStages += ' &#8943';
	return dungeonStages;
}

function displayDungeon() {
	prepareDialog(
		getDungeonStagesString("<br>Dungeon<br>"),
		"",
		descendInDungeon, "Descend",
		displayDialog, "Exit"
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
	dungeon.forEach((_dungeon, _index) => {// TODO: fix dungeon stage advancing
		if (_dungeon.length && dungeonStage < 0) {
			dungeonStage = _index + 1;
			_dungeon.forEach((_enemy, _enemyIndex) => {
				if (_enemy > -1 && dungeonRoom == -1) dungeonRoom = _enemyIndex + 1;
			});
			dungeonEnemy = _dungeon[dungeonRoom-1];
			dungeonEnemyHealth = getEnemyHP(dungeonEnemy);
			dungeonEnemyAttack = getEnemyAttack(dungeonEnemy);
		}
	});

	if (_skip) {
		dungeonBattle();
	} else {
		prepareDialog(
			`Stage ${dungeonStage}, Room ${dungeonRoom}<br>`,
			`You see a${dungeonEnemy==3?"n":""} ${getEnemyName(dungeonEnemy)}<br>`,
			dungeonBattle, "Fight",
			displayDialog, "Exit"
		);
	}

	dialog.firstChild.append(offscreenBitmaps[36 + dungeonEnemy]);
	uiDiv.style.background = "#222b";
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
	displayBattleScreen();// close the battle screen
	if (inDialog) displayDialog();// close any visible dialogs
	resizeUI();
	updateInfoTab();
	updateActionButton();
}

function tryToFleeBattle() {
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
			console.log(dungeon, dungeonStage);

			enemiesKilled.push(dungeonEnemy)
			dungeon[dungeonStage - 1][dungeonRoom - 1] = -1;// mark the enemy as destroyed
			let stageCleared = dungeonRoom == dungeon[dungeonStage - 1].length;
			let bonus = islandGenerator.rand(1, getEnemyHP(dungeonEnemy)/2) * (stageCleared ? 2 : 1);
			gold += bonus;

			prepareBattleScreen(
				stageCleared ? `<br>Stage ${dungeonStage} cleared!` : "<br>Victory!",
				`<br>Found ${bonus} gold.<br>`,
				
				stageCleared ? descendInDungeon : e => descendInDungeon(1),
				stageCleared ? "Descend" : "Advance",
				closeAllScreens, "Exit"
			);
		}
	);
}

/*function clearDungeonStage() {
	prepareDialog(
		`Stage ${dungeonStage} cleared!`,
		"",
		descendInDungeon, "Descend",
		closeAllScreens, "Exit"
	);
}*/