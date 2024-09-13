const keysHeld = [];
function onKeyDown(event) {
	//console.log(event.keyCode);

	/*if (event.keyCode == 49) {
		SoundFXui();
	} else
	if (event.keyCode == 50) {
		SoundFXgetGold();
	} else
	if (event.keyCode == 51) {
		SoundFXmoveStep();
	} else
	if (event.keyCode == 52) {
		SoundFXmoveSail();
	} else
	if (event.keyCode == 53) {
		SoundFXdisabled();
	} else
	if (event.keyCode == 54) {
		SoundFXhilight();
	} else
	if (event.keyCode == 55) {
		debugBoard();
	} else*/

	/*if (event.keyCode == 55) {// summon dungeon
		unitsList.forEach(_unit => {
			if (_unit.dungeon && !dungeon) {
				dungeon = _unit.dungeon
			}
		})
		
		displayDungeon();
	}*/


	
	if (event.keyCode == 77) {// M change Sound
		toggleSound();
	} else

	/*if (event.keyCode == 27) { // esc
		console.log("ESC");
	} else*/

	if (event.keyCode == 13 || event.keyCode == 32) {
		if (!state) {
			switchState();
		} else {
			action();
		}
	} else

	if (event.keyCode == 38 || event.keyCode == 87) { // up
		action(1);
	} else

	if (event.keyCode == 40 || event.keyCode == 83) { // down
		action(3);
	} else

	if (event.keyCode == 37 || event.keyCode == 65) { // left
		action(4);
	} else

	if (event.keyCode == 39 || event.keyCode == 68) { // right
		action(2);
	}

	holding = false;
}

/*function onKeyUp(event) {
	//touchEndHandler();
}*/
