const keysHeld = [];
function onKeyDown(event) {
	console.log(event.keyCode);

	/*if (event.keyCode == 71) {// G toggle grid
		grid = !grid;
	} else*/
	
	if (event.keyCode == 77) {// M change Sound
		toggleSound(1);
	} else
	
	/*if (event.keyCode == 78) {// N toggle animateWater
		animateWater = !animateWater;
	} else*/

	if (event.keyCode == 82 && state) {// R reset stage
		//cleanOrResetStage();
		console.log("cleanOrResetStage");
	} else

	if (event.keyCode == 27) { // esc
		console.log("ESC");
	} else

	if (event.keyCode == 13 || event.keyCode == 32) {
		console.log("ENTER SPACE");
	} else

	if (event.keyCode == 38 || event.keyCode == 87) { // up
		if (!state) {
			console.log("Menu up");
		} else {
			action(1);
		}
	} else

	if (event.keyCode == 40 || event.keyCode == 83) { // down
		if (!state) {
			console.log("Menu down");
		} else {
			action(3);
		}
	} else

	if (event.keyCode == 37 || event.keyCode == 65) { // left
		if (!state) {
			console.log("Menu left");
		} else {
			action(4);
		}
	} else

	if (event.keyCode == 39 || event.keyCode == 68) { // right
		if (!state) {
			console.log("Menu right");
		} else {
			action(2);
		}
	}
}

/*function onKeyUp(event) {
	//touchEndHandler();
}*/
