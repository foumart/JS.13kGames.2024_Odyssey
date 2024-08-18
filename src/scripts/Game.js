// game vars
let gameLoop, step, islandGenerator;

async function gameInit(_stage) {
	stage = _stage;
	step = 0;
	
	let data = await getStageData(stage);
	//console.log(data);
	stageData = {
		size: data[0][0], x: data[0][2], y: data[0][3],
		map: data[0][6],// visited
		data: data[0][5],// relief
		ids: data[0][4]// isle ids
	}
	
	initBoard();
	gameStart();
}

function gameStart() {
	gameStop();
	gameLoop = setInterval(e => {
		// gameplay
		step ++;
		if (step == 1) {
			TweenFX.to(tween, 60, {transition: 1}, e => {
				// level zoomed in
			});
		}
		drawBoard();
		// level has actually ended
		if (state > 1) {
			gameStop();
			console.log("stage complete");
		}
	}, 17);
}

function gameStop() {
	clearInterval(gameLoop);
}

function getStageData(id) {
	return new Promise((resolve, reject) => {
		islandGenerator = new IslandGenerator(this, 40, 40, {
			type: 1,
			offset: 10
		}, resolve)
	});
}
