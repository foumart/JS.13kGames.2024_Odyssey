// game vars
let gameLoop;
const obj = [
	{
		size: 8, x: 4, y: 4,
		map: "000000000ff00ff00ff00ff000000000",
		data: "00000000000001"
	},
	{
		size: 8, x: 4, y: 4,
		map: "000000fff",
		data: "000f"
	}
];

function gameInit(_stage) {
	stage = _stage;
	step = 0;
	stageData = getStageData(stage);
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
	return obj[id];
}
