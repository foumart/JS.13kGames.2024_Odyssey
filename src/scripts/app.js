// All elements with IDs are global objects in js, but the closure compiler needs declared objects
// to work, so these will be removed by the gulp 'mangle' process afterwards..
const mainDiv = document.getElementById("mainDiv");
const uiDiv = document.getElementById("uiDiv");
const gameCanvas = document.getElementById("gameCanvas");
const gameContainer = document.getElementById("gameContainer");
const bgrCanvas = document.getElementById("bgrCanvas");
const gameContext = gameCanvas.getContext("2d");
const bgrContext = bgrCanvas.getContext("2d");

// global vars
const mobile = isTouchDevice();
const interactionDown = mobile ? "touchstart" : "mousedown";
const interactionUp = mobile ? "touchend" : "mouseup";
const interactionMove = mobile ? "touchmove" : "mousemove";
const interactionTap = mobile ? "touchstart" : "mousedown";
const rollOver = mobile ? 0 : "mouseover";
const rollOut = mobile ? 0 : "mouseout";
function isTouchDevice() {
	return navigator.userAgent.search('Mobile') > 0;
}

// toggle fullscreen mode
function toggleFullscreen(e) {
	if (!document.fullscreenElement) {
		document.documentElement.requestFullscreen();
	} else if (document.exitFullscreen) {
		document.exitFullscreen();
	}
}

// global sizes
let width;
let height;
let scale;
let portrait;// orientation
let screenOffsetX = 0;
let screenOffsetY = 0;

// game state, 0: menu, 1: in-game
let state = 0;

let tween = { mapZoom: 0, transitionZ: 0, transitionX: 0, transitionY: 0 };

// ui stuff
let controls, infoTab, dialog, title, titleText;
let actButton, upButton, leftButton, rightButton, downButton;
let playButton, fullscreenButton, soundButton, closeButton, playerButton, shipButton, crewButton;
let installButton, installPrompt = null;

// save the install prompt event
window.addEventListener("beforeinstallprompt", (event) => {
	event.preventDefault();
	installPrompt = event;

	tryToShowInstallButton();
	resizeUI(1);
});
// prevent long tap on mobile
document.oncontextmenu = function() {return false;};


// Game initialization
function init() {

	// resizing
	window.addEventListener("resize", () => resizeUI());

	// keyboard
	document.addEventListener("keydown", onKeyDown);

	// board zooming
	mainDiv.onwheel = onBoardZoom;

	gameInit();
	createUI();
	tryToShowInstallButton();
	resizeUI(1);
}

function initSound() {
	if (!audioContext) {
		SoundFXstart();
	}
}

function toggleSound(event) {
	if (event) {
		initSound();
		if (SoundFXvolume == 1) {
			SoundFXvolume = 0;
		} else {
			SoundFXvolume += SoundFXvolume || 0.25;
			SoundFXmute();
		}
	}

	soundButton.innerHTML = (
		!SoundFXvolume ? "&#215"
			: (
				SoundFXvolume == 1 ? "&#8901&#8901" :
				SoundFXvolume > 0.25 ? "&#8901&#8901" : ""
			) + "&#8901"
	) + "&#10919";
}

function setupUI() {
	width = window.innerWidth;
	height = window.innerHeight;
	scale = getScale();
}

function resizeUI(e) {
	setupUI();
	if (e-1) updateActionButton(e);
	if (e-1) updateInfoTab();
	// Set HTML positionings
	mainDiv.style.width = uiDiv.style.width = width + 'px';
	mainDiv.style.height = uiDiv.style.height = height + 'px';
	if (gameCanvas.width != width || gameCanvas.height != height) {
		gameDirty = 2;// changing the canvas size automatically clears it so we make sure to redraw
		gameCanvas.width = bgrCanvas.width = width;
		gameCanvas.height = bgrCanvas.height = height;
	}
	if (width > height) {
		// Landscape
		portrait = false;
		gameContainer.style.width = gameContainer.style.height = uiDiv.style.height = height + "px";
		gameContainer.style.left = "50%";
		screenOffsetX = (width - height)/2;
		screenOffsetY = 0;
		gameContainer.style.marginLeft = - height / 2 + "px";
		gameContainer.style.marginTop = gameContainer.style.top = 0;
	} else {
		// Portrait
		portrait = true;
		gameContainer.style.width = gameContainer.style.height = uiDiv.style.width = width + "px";
		gameContainer.style.top = "50%";
		screenOffsetX = 0;
		screenOffsetY = (height - width)/2;
		gameContainer.style.marginTop = - width / 2 + "px";
		gameContainer.style.marginLeft = gameContainer.style.left = 0;
	}

	// Resize the Dialog Menu
	updateStyleUI(dialog, (inDialog ? '' : 'display:none;') + `padding-top:2vmax;border-top:3vh solid #fff9;border-bottom:3vh solid #fff9;width:${portrait?width*.9:!state?width*.5:width*.42}px;top:50%;left:50%;transform:translateY(-${!state?128:portrait?60:34}%) translateX(-${portrait||!state?50:44}%)`, 64, 99);

	// Resize in-game UI elements
	if (upButton) {
		updateStyleUI(controls, `bottom:1vmin;width:${portrait?54:28}%`);
		updateStyleUI(actButton, `bottom:2vmax;right:2vmax;width:auto;padding:1vmin 2vmax;min-width:12vmax;min-height:9vmax`, 99, -1);
		upButton.style.fontSize =
		downButton.style.fontSize =
		leftButton.style.fontSize =
		rightButton.style.fontSize = 112 * scale + 'px';
		if (gamePlayer.overlay) offscreenBitmaps[gamePlayer.overlay-1].style = `margin-top:2vmax;border:1vmax solid #0000;border-radius:1vmax;background:#2266;position:relative;width:16vmin`;
	}

	gameContext.imageSmoothingEnabled = bgrContext.imageSmoothingEnabled = false;

	if (closeButton) updateStyleUI(closeButton, `position:relative;float:right;margin:1%;margin-left:0;background:#faac`, 68, 72);

	if (playerButton) {
		playerButton.innerHTML = addHealthbar(playerHealth, playerHealthMax);
		shipButton.innerHTML = addHealthbar(shipHealth, shipHealthMax);
		crewButton.innerHTML = addHealthbar(crewHealth, crewHealthMax);
		playerButton.prepend(offscreenBitmapsFlipped[0]);
		shipButton.prepend(offscreenBitmapsFlipped[4]);
		crewButton.prepend(offscreenBitmaps[8]);
		offscreenBitmapsFlipped[0].style = offscreenBitmapsFlipped[4].style = offscreenBitmaps[8].style = `border:1vmin solid #1160;border-radius:1vmin;background:#1166;position:relative;width:12vmin`;
		e = `padding:1vmax;position:relative;float:left;margin:1% 0 0 1%;border-radius:2vmin`;
		updateStyleUI(playerButton, e, 14, 9);
		updateStyleUI(shipButton, e, 14, 9);
		updateStyleUI(crewButton, e, 14, 9);
	}

	// Fullscreen button
	if (fullscreenButton) updateStyleUI(fullscreenButton, `position:relative;float:right;margin:1% 1% 1% 0`, 72, 72);
	// Sound button
	updateStyleUI(soundButton, `position:relative;float:right;margin:1% 1% 1% 0;`, 68, 72);
	updateStyleUI(infoTab, `padding:${state?'1vmax 1vmax 1vmin;line-height:6px;margin:2%':'2vmin;margin:1%'} 1%${playerButton?`;top:${playerButton.offsetHeight}px`:''}`, state ? 16 : 32, 1);

	// Install, Play and Title
	if (playButton) {
		if (installButton) updateStyleUI(installButton, `top:${portrait?82:84}%;left:50%;transform:translateX(-50%);width:${portrait?35:25}%`, portrait?80:65, portrait?112:90);
		updateStyleUI(playButton, `top:${(portrait?installButton?69:75:installButton?66:72)}%;left:50%;transform:translateX(-50%);width:${portrait?60:40}%;background:#4f8a`);
		title.innerHTML = getIcon(portrait ? 80*getSize() : 75*getSize());
		updateStyleUI(title, `filter:drop-shadow(0 1vh 0 #127);top:${portrait?58:54}%;left:50%;transform:translateY(-50%) translateX(-50%) scale(${(portrait?width:height)<600?1:(portrait?width:height)/600})`);
		titleText.innerHTML = `<div style="filter:drop-shadow(.2em .1em 0 #1267);text-shadow:#f74 .1em .05em;margin-top:-${112*scale}px;margin-left:${235*scale
			}px;font-size:${45*scale}px;color:#ff9"><i>The</i></div><div style="filter:drop-shadow(.15em .1em 0 #1267);text-shadow:#f74 .07em .03em;margin-top:-${95*scale}px;margin-left:${325*scale
			}px;font-size:${95*scale}px;color:#ff9"><i><u>Isle&#10556&#8202Hop</u></i></div><span style="filter:drop-shadow(.1em .05em 0 #1267);color:#efe;text-shadow:#1bc .06em .03em">O<b>dyssey</b></span>`;
		updateStyleUI(titleText, `top:50%;left:50%;transform:translateY(-${portrait?340:260}%) translateX(-50%) scale(${getSize(500)})`, 220);
	}
}

function switchState(event) {
	//console.log("switchState", state);
	inDialog = 0;
	gameDirty = 2;
	state ++;
	gameInit();
	createUI();
	tryToShowInstallButton();
	resizeUI(1);
}

function interactionStart(handler) {
	holding = true;
	handler();
	window.addEventListener(interactionUp, interactionEnd.bind(this));
}

function interactionEnd() {
	window.removeEventListener(interactionUp, interactionEnd.bind(this));
	holding = false;
}
