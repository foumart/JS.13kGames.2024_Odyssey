let dungeon,
	dungeonFloor,
	dungeonEnemy,
	dungeonFight;

function getEnemyName(_id) {
	return [
		"Bat", "Slime", "Wolf", "Goblin", "Imp",
		"Orc", "Troll", "Wizard", "Lich", "Dragon", "Balrog"
	][_id > 9 ? _id - 20 : _id];
}

function getSurfaceEnemyName(_id) {
	return ["Squid", "Serpent", "Knight", "Crab"][_id];
}

function displayDungeon() {
	let notCleared, dungeonStages = "Dungeon<br>Stages: ";
	dungeon.forEach((dungeon, index) => {
		if (index > 2 && dungeon.length) notCleared = 1;
		if (index < 3 || !dungeon.length) {
			dungeonStages += !index || !dungeon[index-1].length ? ' &#128853' : ' &#974' + (dungeon.length ? 4 : 5);
		}
	});
	if (dungeon.length > 3 && notCleared) dungeonStages += ' &#8943';

	prepareDialog(
		dungeonStages,
		"",
		descendInDungeon, "Descend",
		displayDialog, "Exit"
	);
}

function descendInDungeon() {
	dungeonFloor = -1;
	dungeon.forEach((_dungeon, _index) => {
		if (_dungeon.length && dungeonFloor < 0) {
			dungeonFloor = _index + 1;
			dungeonEnemy = _dungeon[0];
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
	inBattle = true;
	if (inDialog) displayDialog();// hide dialog screen

	prepareBattleScreen(
		"<br>",
		"<br>Slime hits Corsair for 2dmg<br>",
		dungeonBattle, "Attack",
		displayDialog, "Flee"
	);

	addBitmapToDialog(battleScreen.firstChild, offscreenBitmaps[36 + dungeonEnemy], getEnemyName(dungeonEnemy), addHealthbar(10, 10), "scale(1.5)");
	addBitmapToDialog(battleScreen.firstChild, offscreenBitmaps[37 + dungeonEnemy], getEnemyName(dungeonEnemy), addHealthbar(10, 10), "scale(1.5)");
	addBitmapToDialog(battleScreen.firstChild, offscreenBitmaps[38 + dungeonEnemy], getEnemyName(dungeonEnemy), addHealthbar(10, 10), "scale(1.5)");

	resizeUI();
	updateInfoTab();
}

function enemyTurn() {
//!dungeonEnemy || dungeonEnemy == 2 || dungeonEnemy > 8 ? dungeonEnemy + " attacks first!<br>" : "You face " + dungeonEnemy + ". Will you?",
		
}
