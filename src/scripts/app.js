// All elements with IDs are global objects in js, but the closure compiler needs declared objects
// to work, so these will be removed by the gulp 'mangle' process afterwards..
const mainDiv = document.getElementById("mainDiv");
const uiDiv = document.getElementById("uiDiv");
const gameCanvas = document.getElementById("gameCanvas");
const gameContainer = document.getElementById("gameContainer");
const gameContext = gameCanvas.getContext("2d");

// global vars
const mobile = isTouchDevice();
const eventName = mobile ? "touchstart" : "click";
const rollOver = mobile ? 0 : "mouseover";
const rollOut = mobile ? 0 : "mouseout";
function isTouchDevice() {
	//return ("ontouchstart" in window && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
	return navigator.userAgent.search('Mobile') > 0;
}

// board zooming
mainDiv.onwheel = onBoardZoom;

// toggle fullscreen mode
function toggleFullscreen(e) {
	setTimeout(() => {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen();
		} else if (document.exitFullscreen) {
			document.exitFullscreen();
		}
	}, 99);
}

function onBoardZoom(event) {
	/*if (state) {
		if (event.deltaY < 0 && boardScale < 1) boardScale += 0.05;
		else if (event.deltaY > 0 && boardScale > 0.7) boardScale -= 0.05;
		dirty = 1;
		boardScale = +boardScale.toFixed(2);
		drawBoard();
	}*/
}

let portrait;// orientation
// global sizes
let width;
let height;
let scale;

// Example game initialization script:
function init() {
	window.addEventListener("resize", resizeUI, false);
	//document.addEventListener("keydown", onKeyDown);
	//createUI();

	uiDiv.style.backgroundColor = "rgba(255,0,0,0.3)";
	gameContainer.style.backgroundColor = "rgba(0,255,0,0.3)";

	resizeUI(1);
}

function getScale() {
	return (height < width ? height : width) / 1000;
}

function resizeUI(e) {
	width = window.innerWidth;
	height = window.innerHeight;
	scale = getScale();
	// Set HTML positionings
	mainDiv.style.width = uiDiv.style.width = width + 'px';
	mainDiv.style.height = uiDiv.style.height = height + 'px';

	if (width > height) {
		// Landscape
		portrait = false;
		gameCanvas.width = gameCanvas.height = height;
		gameContainer.style.width = gameContainer.style.height = uiDiv.style.height = height + "px";

		gameCanvas.style.left = gameContainer.style.left = "50%";
		gameCanvas.style.marginLeft = gameContainer.style.marginLeft = -(height/2)+"px";
		gameCanvas.style.marginTop = gameContainer.style.marginTop = gameCanvas.style.top = gameContainer.style.top = 0;
	} else {
		// Portrait
		portrait = true;
		gameCanvas.width = gameCanvas.height = width;
		gameContainer.style.width = gameContainer.style.height = uiDiv.style.width = width + "px";

		gameCanvas.style.top = gameContainer.style.top = "50%";
		gameCanvas.style.marginTop = gameContainer.style.marginTop = -(width/2)+"px";
		gameCanvas.style.marginLeft = gameContainer.style.marginLeft = gameCanvas.style.left = gameContainer.style.left = 0;
	}

	gameContext.imageSmoothingEnabled = false;
	gameContext.textAlign = "center";
	gameContext.strokeStyle = 'black';
    gameContext.lineWidth = 12 * getScale();
	gameContext.lineJoin = 'round';

	//if (game) drawBoard();

}