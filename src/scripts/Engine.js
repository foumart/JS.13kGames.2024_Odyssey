// island generator game map constants and title map initialization
const seaSize = 44, seaOffset = 9, titleMapSize = 38;
let islandGenerator = new IslandGenerator(this);

// game loop vars
let gameLoop, step;
let fpsElement, frame, startTime = Date.now();// debug fps
let paused = false;

async function gameInit() {
	step = 0;
	frame = 0;
	
	let data = await getStageData(!state ? titleMapSize : seaSize, seaOffset);
	populateStageData(data);
	initVars();
	initBoard();
	gameStart();
}

function gameStart() {
	gameStop();
	doAnimationFrame();
}

function gameStop() {
	cancelAnimationFrame(gameLoop);
}

function doAnimationFrame(timeStamp) {
	if (state) {
		// gameplay
		step ++;
		if (step == 1) {
			gameContainer.style.display = "none";
			
			updateInfoTab();
			// initial level zoom in (level zoom is hooked to tween.transitionZ)
			tween.transitionZ = .3;
			TweenFX.to(tween, 6, {transitionZ: 0.5}, e => doFrameAnimationMove(1), e => {
				tween.transitionZ = 1;
				TweenFX.to(tween, 6, {transitionZ: 1.2}, e => doFrameAnimationMove(0, 1), e => {
					finalizeMove();
				}, 1);
			});
		} else if (step % 7 == 0) {
			gameDirty = 2;// only every seventh frame we update the units while idle
		}
		drawBoard();
		// level has actually ended
		if (state > 1) {
			gameStop();
			console.log("stage complete");
			return;
		}

		if (_debug) {
			var time = Date.now();
			frame++;
			if (time - startTime > 1000) {
				fpsElement.innerHTML = (frame / ((time - startTime) / 1000)).toFixed(1) + " " + width + "x" + height;
				startTime = time;
				frame = 0;
			}
		}
	} else if (gameDirty > 1) {
		// chose a central deep water tile to position the title screen map (somewhere between the islands)
		let waterId = 0, limit = 0;
		while(mapData[playerY+1][playerX] > waterId || mapData[playerY+2][playerX] > waterId) {
			playerX = islandGenerator.rand(9,boardWidth*.6);
			playerY = islandGenerator.rand(9,boardWidth*.6);
			limit ++;
			if (limit == 99) {
				waterId ++;
			}
		}

		// reveal clouds around the title and the play button
		for (waterId = 1; waterId < 6; waterId ++) {
			revealAroundUnit(playerX - 6 + waterId * 2, playerY);
			revealAroundUnit(playerX, playerY - 6 + waterId * 2);
		}

		drawBoard();
	}

	gameLoop = requestAnimationFrame(() => doAnimationFrame());
}


async function updateMap() {
	let data = await updateStageData();
	populateStageData(data);
	paused = false;
}

function populateStageData(data) {
	stageData = {
		size: data[0][0], x: data[0][2], y: data[0][3],
		visited: data[0][6],// visited
		relief: data[0][5],// relief
		ids: data[0][4],// isle ids
		islands: data.splice(1)
	}
}

function getStageData(_size, _offset) {
	return new Promise((resolve) => {
		islandGenerator.resolve = resolve;
		islandGenerator.initialize(_size, _size, {
			type: 1,
			offset: _offset,
			debug: _debug ? {feedback: true} : 0
		}, resolve);
	});
}

function updateStageData() {
	return new Promise((resolve) => {
		islandGenerator.resolve = resolve;
		islandGenerator.regenerate(
			playerX - screenSide - (portrait ? 0 : screenOut/2),
			playerY - screenSide - (portrait ? screenOut/2 : 0),
			playerX + screenWidth + (portrait ? 0 : screenOut),
			playerY + screenWidth + (portrait ? screenOut : 0)
		);
	});
}
