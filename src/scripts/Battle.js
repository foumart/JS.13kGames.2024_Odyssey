let dungeon,
	dungeonFloor,
	dungeonEnemy,
	dungeonEnemyHP,
	dungeonEnemyAttack,
	dungeonFight;

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

function descendInDungeon() {
	//tween.transitionZ = boardScale;
	//TweenFX.to(tween, 9, {transitionZ: 4}, e => doFrameAnimationMove(0, 1), e => { }, 1);

	dungeonFloor = -1;
	dungeon.forEach((_dungeon, _index) => {
		if (_dungeon.length && dungeonFloor < 0) {
			dungeonFloor = _index + 1;
			dungeonEnemy = _dungeon[0];
			dungeonEnemyHP = getEnemyHP(dungeonEnemy);
			dungeonEnemyAttack = getEnemyAttack(dungeonEnemy);
		}
	});

	prepareDialog(
		"Level " + dungeonFloor + "<br>",
		`You see a ${getEnemyName(dungeonEnemy)}<br>`,
		dungeonBattle, "Fight",
		displayDialog, "Exit"
	);

	dialog.firstChild.append(offscreenBitmaps[36 + dungeonEnemy]);
	
}

function dungeonBattle() {
	if (inDialog) displayDialog();// hide dialog screen

	prepareBattleScreen(
		"<br>",
		"<br>Enemies prepared for fight!<br>",
		battleItem, "Item",
		tryToFleeBattle, "Flee"
	);

	addBitmapToDialog(
		battleScreen.firstChild,
		offscreenBitmaps[36 + dungeonEnemy],
		getEnemyName(dungeonEnemy),
		addHealthbar(dungeonEnemyHP, getEnemyHP(dungeonEnemy)),
		"scale(1.5)",
		() => infoButtonClick(dungeonEnemy + 3, dungeonEnemyHP, dungeonEnemyAttack)
	);

	// TODO: battles with multiple enemies
	//addBitmapToDialog(battleScreen.firstChild, offscreenBitmaps[37 + dungeonEnemy], getEnemyName(dungeonEnemy), addHealthbar(10, 10), "scale(1.5)");
	//addBitmapToDialog(battleScreen.firstChild, offscreenBitmaps[38 + dungeonEnemy], getEnemyName(dungeonEnemy), addHealthbar(10, 10), "scale(1.5)");

	resizeUI();
	updateInfoTab();
	updateActionButton();
}

/*function battleAttack(id, hp, att) {
	infoButtonClick(id + 2, hp, att);
}*/

function battleItem() {
	
}

function tryToFleeBattle() {
	if (Math.random() * 9 > dungeonEnemy) {
		// player will escape
		if (Math.random() * 9 < dungeonEnemy) {
			// player will however suffer a hit
			enemyHit();
		}
	} else {
		// player cannot escape
		if (Math.random() * 9 < dungeonEnemy) {
			// player will receive a hit on top of that
			enemyHit();
		}
	}
}

function enemyHit() {
	
	
	if (Math.random() < .5) {


	} else {

	}
}

function enemyTurn() {
	
}
