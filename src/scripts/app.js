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

function onBoardZoom(event) {
	if (state) {
		if (event.deltaY < 0 && boardScale < 3) boardScale += 0.05;
		else if (event.deltaY > 0 && boardScale > 0.7) boardScale -= 0.05;
		boardScale = +boardScale.toFixed(2);
		drawBoard();
	}
}

// global sizes
let width;
let height;
let scale;
let portrait;// orientation
let offsetX = 0;
let offsetY = 0;

// game state, 0: menu, 1: in-game
let state = 0;
let stage = 0;

let tween = { transition: 0 };

// ui stuff
let controls, upButton, leftButton, rightButton, downButton;
let title, playButton, fullscreenButton, soundButton;


// Example game initialization script:
function init() {
	// resizing
	window.addEventListener("resize", () => {
		resizeUI();
	});

	// keyboard
	document.addEventListener("keydown", onKeyDown);

	// board zooming
	mainDiv.onwheel = onBoardZoom;

	createUI();
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

	if (!SoundFXvolume) {
		soundButton.innerHTML = "&nbsp&#215&#10919";
	} else {
		soundButton.innerHTML = (SoundFXvolume == 1 ? "&#8901&#8901&#8901" : SoundFXvolume > 0.25 ? "&nbsp&#8901&#8901" : "&nbsp&nbsp&#8901") + "&#10919";
	}
}

function setupUI() {
	width = window.innerWidth;
	height = window.innerHeight;
	scale = getScale();
}

function getScale() {
	return (height < width ? height : width) / 1000;
}

function resizeUI(e) {
	setupUI();
	// Set HTML positionings
	mainDiv.style.width = uiDiv.style.width = width + 'px';
	mainDiv.style.height = uiDiv.style.height = height + 'px';
	gameCanvas.width = width;
	gameCanvas.height = height;
	if (width > height) {
		// Landscape
		portrait = false;
		
		gameContainer.style.width = gameContainer.style.height = uiDiv.style.height = height + "px";
		gameContainer.style.left = "50%";
		offsetX = width - height;
		offsetY = 0;
		gameContainer.style.marginLeft = - height / 2 + "px";
		gameContainer.style.marginTop = gameContainer.style.top = 0;
	} else {
		// Portrait
		portrait = true;
		gameContainer.style.width = gameContainer.style.height = uiDiv.style.width = width + "px";
		gameContainer.style.top = "50%";

		offsetX = 0;
		offsetY = height - width;
		gameContainer.style.marginTop = - width / 2 + "px";
		gameContainer.style.marginLeft = gameContainer.style.left = 0;
	}

	// Resize in-game UI elements
	if (upButton) {
		controls.style = portrait ? "bottom:0;width:50%" : "bottom:0;width:30%";
		upButton.style.fontSize =
		downButton.style.fontSize =
		leftButton.style.fontSize =
		rightButton.style.fontSize = 112 * scale + 'px';
	}

	gameContext.imageSmoothingEnabled = false;
	gameContext.textAlign = "center";
	gameContext.strokeStyle = 'black';
    gameContext.lineWidth = 12 * getScale();
	gameContext.lineJoin = 'round';

	//if (game) drawBoard();

	// Fullscreen button
	updateStyleUI(fullscreenButton, `float:right`);
	// Sound button
	updateStyleUI(soundButton, `float:right;border-bottom-left-radius:1rem;margin-right:3px`);
	// Play and Settings buttons
	if (playButton) {
		updateStyleUI(playButton, `position:absolute;top:65%;left:50%;transform:translateX(-50%);width:50%;border-radius:1rem`);
		updateStyleUI(title, `position:absolute;top:25%;left:50%;transform:translateX(-50%)`);
	}
}

function updateStyleUI(element, style) {
	element.style = `line-height:${99*scale}px;font-size:${72*scale}px;`+style;
}

function switchState(event) {
	console.log("switchState", event);
	state = 1;
	gameInit(stage);
	createUI();
	resizeUI(1);
}

function getIcon(size) {
	return `<img src=ico.svg height=${size * scale} width=${size * scale}>`;
}

function createUI() {
	uiDiv.innerHTML = '';
	uiDiv.style = "pointer-events:none";

	if (!state) {
		title = generateUIButton(uiDiv, `${getIcon(320)}`, switchState);
	} else {
		controls = document.createElement('div');
		uiDiv.append(controls);
	}

	// Fullscreen and Sound buttons
	fullscreenButton = generateUIButton(uiDiv, '&#9974', toggleFullscreen, "css_space");
	soundButton = generateUIButton(uiDiv, '', toggleSound, "css_space");

	if (!state) {
		// Create Play Button
		playButton = generateUIButton(uiDiv, `Play`, switchState, "css_space");
	} else {
		upButton = generateUIButton(controls, '&#9650', e => action(1), "css_controls");   // ^
		leftButton = generateUIButton(controls, '&#9664', e => action(4), "css_controls"); // <
		rightButton = generateUIButton(controls, '&#9654', e => action(2), "css_controls"); // >
		downButton = generateUIButton(controls, '&#9660', e => action(3), "css_controls");  // v

		upButton.style = "margin:2% auto 0";
		leftButton.style = "float:left;margin:2%";
		rightButton.style = "float:right;margin:2%";
		downButton.style = "margin:2% auto";
	}

	toggleSound();
}

function generateUIButton(div, code, handler, className) {
	const button = document.createElement('div');
	button.innerHTML = code;
	button.addEventListener(eventName, handler.bind(this));
	button.className = "css_button css_icon " + className;
	
	div.append(button);
	return button;
}
