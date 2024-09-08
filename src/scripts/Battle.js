let dungeon,
	dungeonFloor,
	dungeonEnemy,
	dungeonFight;

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
		"You face " + dungeonEnemy + ". Will you?",
		dungeonBattle, "Fight",
		displayDialog, "Retreat"
	);
}

function dungeonBattle() {
	let enemyId = enemyTypes.indexOf(dungeonEnemy);
	// enemy hit
	prepareDialog(
		"Fighting " + dungeonEnemy,
		!enemyId || enemyId == 2 || enemyId > 8 ? dungeonEnemy + " attacks first!<br>" : "You face " + dungeonEnemy + ". Will you?",
		dungeonBattle, "Fight",
		displayDialog, "Retreat"
	);
}
