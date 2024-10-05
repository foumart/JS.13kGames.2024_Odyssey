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
		"<u>Ahoy Corsair!</u>",
		getSpan("<br><br style='line-height:2vmin'>Welcome to <i>Isle-Hop</i> Odyssey!<br><br><br style='line-height:6px'>Help Captain Redbrand &nbsp; &nbsp;&nbsp;,") +
		getSpan("<br><br>&#8202;his Ship &nbsp; </b><b>&nbsp; &#8202;, and its Crew &nbsp; &nbsp; &nbsp;</b><br><br style='line-height:5vmin'><b>defeat <b>Balron</b> &nbsp; &nbsp; &nbsp;</b><b>The Dread!<br><br style='line-height:12px'>", 0, "5.5vmin", "line-height:3.5vmin"),
		displayDialog, "Skip",
		e => {
			prepareDialog(
				"",
				"<br>Balron is a lethal foe, lurking<br><br>on level 9 of the deepest<br><br>dungeon on a remote island.<br><br><br style='line-height:1vmin'>Your own isle lies at the<br><br>center of this Isle-Hop Sea.<br><br style='line-height:2vmin'>",
				displayDialog, "Skip",
				e => {
					let str = '<br>You control the Red Castle ' + getSpan('&#9873', colors[1]) + '<br><br>on your starting island. There<br><br>you can upgrade your Ship.<br><br style="line-height:5vmin">Conquer Forts&#8202;';
					for (let i = 2; i < 6; i++) {
						str += "&#8202;" + getSpan('&#9873', colors[i]);
					}
					str += " to hire<br><br>more Crew on nearby islands.<br><br style='line-height:2vmin'>";
					prepareDialog("", str,
						displayDialog, "Skip",
						e => {
							prepareDialog("", getSpan("<br>But beware! The Balron grows<br><br>stronger each day. In 13 days,<br><br>he will become invulnerable,<br><br>and no Hero will be able to<br><br>stop his conquest...<br><br style='line-height:3vmin'>"),
								displayDialog, "Skip",
								e => {
									prepareDialog("", getSpan("<br><u>Combat overview</u>:<br><br>&#8226; on land you fight with both<br><br>the Captain and the Crew.<br><br>&#8226; at sea, you fight with your<br><br>Ship in naval battles.<br><br style='line-height:3vmin'>"),
										displayDialog, "Skip",
										e => {
											prepareDialog("", getSpan("<br>Keep an eye on your Sail Points<br><br>bar &#9881 and ensure your Crew<br><br>rests well at the Castle Inns, or<br><br>you will face costly outbreaks<br><br>that will slow you down.<br><br style='line-height:3vmin'>"),
												showTutorialText, "Repeat",
												displayDialog,
												"Got it"
											);
										},
										"Next"
									);
								},
								"Next"
							);
						},
						"Next"
					);
				},
				"Next"
			);
		},
		"Next",
	);

	let bmpCaptain = cloneCanvas(offscreenBitmaps[0]);
	bmpCaptain.style.width = "6vmin";
	bmpCaptain.style.height = "6vmin";
	bmpCaptain.style.margin = "-1vmin 0 0 -8.5vmin";
	dialog.children[1].children[0].append(bmpCaptain);

	let bmpShip = cloneCanvas(offscreenBitmaps[4]);
	bmpShip.style.width = "6vmin";
	bmpShip.style.height = "6vmin";
	bmpShip.style.margin = "-0.5vmin 0 0 -3vmin";
	dialog.children[1].children[1].append(bmpShip);

	let bmpCrew = cloneCanvas(offscreenBitmaps[8]);
	bmpCrew.style.width = "6vmin";
	bmpCrew.style.height = "6vmin";
	bmpCrew.style.margin = "-1vmin 0 0 -8vmin";
	dialog.children[2].append(bmpCrew);

	let bmpBalron = cloneCanvas(offscreenBitmaps[UnitType.BALROG + 16]);
	bmpBalron.style.width = "6vmin";
	bmpBalron.style.height = "6vmin";
	bmpBalron.style.margin = "-1vmin 0 0 -8vmin";
	dialog.children[5].append(bmpBalron);
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
