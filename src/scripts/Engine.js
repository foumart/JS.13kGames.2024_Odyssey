// island generator game map constants and title map initialization
const seaSize = 44, seaOffset = 9;
let islandGenerator = new IslandGenerator(this);

// game loop vars
let gameLoop, step, fpsElement, frame, startTime = Date.now();
let paused = false;

async function gameInit() {
	step = 0;
	frame = 0;
	
	let data = await getStageData(!state ? 38 : seaSize, seaOffset);
	populateStageData(data);

	initBoard();
	gameStart();
}

function gameStart() {
	cancelAnimationFrame(tween.id);
	doAnimationFrame();

	if (state) debugBoard();
}

function gameStop() {
	clearInterval(gameLoop);
}

function doAnimationFrame(timeStamp) {
	if (state) {
		// gameplay
		step ++;
		if (step == 1) {
			gameContainer.style.display = "none";
			// initial level zoomed in
			TweenFX.to(tween, 6, {transition: 1}, e => doFrameAnimationMove(), e => {
				gameContainer.style.display = "block";//TODO: fix lag
				action(6);
			});
		} else if (step % 7 == 0) {
			gameDirty = 2;// only every seventh frame we update the units while idle
		}
		drawBoard();
		// level has actually ended
		if (state > 1) {
			gameStop();
			console.log("stage complete");
		}

		if (_debug) {
			if (!fpsElement) {
				fpsElement = document.createElement('div');
				uiDiv.appendChild(fpsElement);
				fpsElement.style.fontFamily = "Arial";
				fpsElement.style.fontSize = "16px";
				fpsElement.style.pointerEvents = "none";
			}
			var time = Date.now();
			frame++;
			if (time - startTime > 1000) {
				fpsElement.innerHTML = (frame / ((time - startTime) / 1000)).toFixed(1);
				startTime = time;
				frame = 0;
			}
		}
	} else if (gameDirty > 1) {
		// chose a deep water tile to center the title screen map in between the islands
		let waterId = 0, limit = 0;
		while(mapData[playerY+1][playerX] > waterId || mapData[playerY+2][playerX] > waterId) {
			playerX = islandGenerator.rand(9,boardWidth*.6);
			playerY = islandGenerator.rand(9,boardWidth*.6);
			limit ++;
			if (limit == 99) {
				waterId ++;
			}
		}

		drawBoard();

		if (_debug) console.log(
			mapData.map((arr,y) => arr.map((num,x) => (x==playerX&&y==playerY? "  " : num.toString(16).length == 1 ? "0" + num.toString(16) : num.toString(16)).toUpperCase())).join("\n")
		);
	}

	tween.id = requestAnimationFrame(() => doAnimationFrame());
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
	return new Promise((resolve, reject) => {
		islandGenerator.resolve = resolve;
		islandGenerator.initialize(_size, _size, {
			type: 1,
			offset: _offset,
			debug: _debug ? {feedback: true} : 0
		}, resolve);
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
