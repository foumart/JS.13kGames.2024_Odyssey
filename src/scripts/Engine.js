// island generator constants
const seaSize = 44,
	seaOffset = 9;

let islandGenerator;

// game loop vars
let gameLoop, step, fps, frame, startTime = Date.now();
let paused = false;

async function gameInit() {
	step = 0;
	frame = 0;
	
	let data = await getStageData();
	populateStageData(data);

	initBoard();
	gameStart();
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

function gameStart() {
	gameStop();
	gameLoop = setInterval(e => {
		if (state) {
			// gameplay
			step ++;
			if (step == 1) {
				gameContainer.style.display = "none";
				TweenFX.to(tween, 6, {transition: 1}, null, e => {
					gameContainer.style.display = "block";
					action(6);
					// level zoomed in
				});
			}
			drawBoard();
			// level has actually ended
			if (state > 1) {
				gameStop();
				console.log("stage complete");
			}

			if (_debug) {
				if (!fps) {
					fps = document.createElement('div');
					uiDiv.appendChild(fps);
					fps.style.fontFamily = "Arial";
					fps.style.fontSize = "16px";
					fps.style.pointerEvents = "none";
				}
				var time = Date.now();
				frame++;
				if (time - startTime > 1000) {
					fps.innerHTML = (frame / ((time - startTime) / 1000)).toFixed(1);
					startTime = time;
					frame = 0;
				}
			}
		} else {
			// chose a deep water tile to center the title screen map
			while(mapData[playerY+1][playerX]||mapData[playerY+2][playerX]) {
				playerX = islandGenerator.rand(9,boardWidth*.8);
				playerY = islandGenerator.rand(9,boardWidth*.8);
			}

			drawBoard();
		}
	}, 17);

	debugBoard();
}

function gameStop() {
	clearInterval(gameLoop);
}

function getStageData() {
	return new Promise((resolve, reject) => {
		islandGenerator = new IslandGenerator(this, state?seaSize:38, state?seaSize:38, {
			type: 1,
			offset: state?seaOffset:6,
			debug: _debug ? {feedback: true} : 0
		}, resolve)
	});
}

function updateStageData() {
	return new Promise((resolve, reject) => {
		islandGenerator.resolve = resolve;
		islandGenerator.regenerate(
			playerX - screenSide - (portrait ? 0 : screenOut/2),
			playerY - screenSide - (portrait ? screenOut/2 : 0),
			playerX + screenWidth + (portrait ? 0 : screenOut),
			playerY + screenWidth + (portrait ? screenOut : 0)
		);
	});
}
