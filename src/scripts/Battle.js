let dungeon,
	dungeonFloor,
	dungeonEnemy,
	dungeonFight;

function getEnemyName(_id) {
	return [
		"Squid", "Serpent", "Knight", "Crab",
		"Bat", "Rat", "Wolf", "Skeleton", "Zombie",
		"Orc", "Troll", "Wizard", "Lich", "Dragon", "Balrog"
	][_id];
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
		"Floor -" + dungeonFloor,
		"You see " + getEnemyName(dungeonEnemy) + ". Will you?",
		dungeonBattle, "Fight",
		displayDialog, "Retreat"
	);
}

function dungeonBattle() {
	// enemy hit
	prepareDialog(
		"Fighting " + dungeonEnemy,
		!dungeonEnemy || dungeonEnemy == 2 || dungeonEnemy > 8 ? dungeonEnemy + " attacks first!<br>" : "You face " + dungeonEnemy + ". Will you?",
		dungeonBattle, "Fight",
		displayDialog, "Retreat"
	);
}
