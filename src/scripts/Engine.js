// island generator game map constants and title map initialization
const seaSize = 44, seaOffset = 9;
let islandGenerator = new IslandGenerator(this);

// game loop vars
let gameLoop, step;
let fpsElement, frame, startTime = Date.now();// debug fps
let paused = false;

async function gameInit() {
	step = 0;
	frame = 0;
	
	let data = await getStageData(seaSize, seaOffset);
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

function showTutorialText() {
	prepareDialog(
		"Ahoy Corsair!",
		getSpan("<br><br style='line-height:8px'>In Odyssey, you control the<br><br>Captain, his Ship and its Crew.<br>", 0, "5.5vmin", "line-height:3.5vmin") +
		getSpan("<br><br>On land, you fight with your units,<br><br>while at sea, you battle<br><br>with your Ship.<br>", 0, "5vmin", "line-height:3vmin"),
		e => {
			hasTutorial = '<br>Upgrade your Ship at Castle ' + getSpan('&#9873', colors[1]) + '<br><br>Conquer Forts ';
			for (let i = 2; i < 6; i++) {
				hasTutorial += " " + getSpan('&#9873', colors[i]);
			}
			hasTutorial += " for recruits";
			prepareDialog("", getSpan(hasTutorial + "<br><br><br><u style='font-size:6vmin'>Your mission</u>:<br><br><br style='line-height:4px'>Defeat <b style='font-size:6vmin'>Balrog</b> - a lethal foe lurking<br><br>on level 9 in the deepest Dungeon.<br><br><br style='line-height:9px'><b style='font-size:6vmin;line-height:5vmin'>You have 13 days to do that!</b>", 0, "5vmin", "line-height:3vmin"));
		},
		"Next",
	);
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
					TweenFX.to(tween, 6, {transitionZ: 1}, e => doFrameAnimationMove(0, 1), e => {
						finalizeMove();
						showTutorialText();
					}, 1);
				}, 1);
			});
		} else if (step % 7 == 0) {
			gameDirty = 2;// only every seventh frame we update the units while idle
		}
		drawBoard();
		// level has actually ended
		/*if (state > 1) {
			gameStop();
			console.log("stage complete");
			return;
		}*/

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
		// chose a central water tile to position the title screen map (somewhere between the islands)
		let waterId = 2;
		while(mapData[playerY][playerX] > waterId || mapData[playerY+1][playerX] > waterId) {
			playerX = islandGenerator.rand(9,boardWidth*.6);
			playerY = islandGenerator.rand(9,boardWidth*.6);
		}

		// reveal clouds around the title and the play button
		for (let waterId = 1; waterId < 6; waterId ++) {
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
