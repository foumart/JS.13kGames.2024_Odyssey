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
	let notCleared, dungeonStages = "Stages: ";
	dungeon.forEach((dungeon, index) => {
		if (index > 2 && dungeon.length) notCleared = 1;
		if (index < 3 || !dungeon.length) {
			dungeonStages += !index || !dungeon[index-1].length ? ' &#128853' : ' &#974' + (dungeon.length ? 4 : 5);
		}
	});
	if (dungeon.length > 3 && notCleared) dungeonStages += ' &#8943';

	prepareDialog(
		"Dungeon",
		dungeonStages,
		descendInDungeon, "Descend",
		displayDialog, "Exit"
	);
}

function descendInDungeon() {
	//prepareDialog("Close", "You sure?", quitGame, "Yes", displayDialog, "No");
	//prepareDialog("Floor", "You sure?", quitGame, "Yes", displayDialog, "No");
	// TODO ...
	dungeonFloor = -1;
	dungeon.forEach((_dungeon, _index) => {
		if (_dungeon.length && dungeonFloor < 0) {
			dungeonFloor = _index + 1;
			dungeonEnemy = _dungeon[0];
		}
	});

	prepareDialog(
		"Level " + dungeonFloor,
		"You see " + getEnemyName(dungeonEnemy),
		dungeonBattle, "Fight",
		displayDialog, "Run"
	);
}

function dungeonBattle() {
	// enemy hit
	/*prepareDialog(
		"Fighting " + dungeonEnemy,
		!dungeonEnemy || dungeonEnemy == 2 || dungeonEnemy > 8 ? dungeonEnemy + " attacks first!<br>" : "You face " + dungeonEnemy + ". Will you?",
		dungeonBattle, "Fight",
		displayDialog, "Retreat"
	);*/

	//if (gamePlayer.overlay) offscreenBitmaps[gamePlayer.overlay-1].style = `margin:1vmax 0;border:2vmin solid #0000;border-radius:1vmax;background:#2266;position:relative;width:16vmin`;
	//actButton.prepend(offscreenBitmaps[gamePlayer.overlay-1]);

	prepareDialog(
		"<br>",//getEnemyName(dungeonEnemy),//"Fighting " + dungeonEnemy,
		"<br>",
		dungeonBattle, "Attack",
		displayDialog, "Item"
	);

	addBitmapToDialog(offscreenBitmaps[36 + dungeonEnemy]);
	addBitmapToDialog(offscreenBitmaps[37 + dungeonEnemy]);
	addBitmapToDialog(offscreenBitmaps[38 + dungeonEnemy]);

	//dialog.firstChild.innerHTML = addHealthbar(playerHealth, playerHealthMax);
	//addBitmapToDialog(offscreenBitmaps[36 + dungeonEnemy]);
	//addHealthbar(playerHealth, playerHealthMax);

	//dialog.firstChild.append(id == 1 ? offscreenBitmapsFlipped[2] : id ? offscreenBitmapsFlipped[8] : offscreenBitmaps[0]);
	//dialog.firstChild.firstChild.style.marginTop = "2vmin";
	//dialog.firstChild.lastChild.style.transform = "scale(1.5) translateY(-30%)";
}

function enemyTurn() {
//!dungeonEnemy || dungeonEnemy == 2 || dungeonEnemy > 8 ? dungeonEnemy + " attacks first!<br>" : "You face " + dungeonEnemy + ". Will you?",
		
}
