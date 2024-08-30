// All elements with IDs are global objects in js, but the closure compiler needs declared objects
// to work, so these will be removed by the gulp 'mangle' process afterwards..
const mainDiv = document.getElementById("mainDiv");
const uiDiv = document.getElementById("uiDiv");
const gameCanvas = document.getElementById("gameCanvas");
const gameContainer = document.getElementById("gameContainer");
const gameContext = gameCanvas.getContext("2d");

// global vars
const mobile = isTouchDevice();
const interactionDown = mobile ? "touchstart" : "mousedown";
const interactionUp = mobile ? "touchend" : "mouseup";
const interactionMove = mobile ? "touchmove" : "mousemove";
const interactionTap = mobile ? "touchstart" : "click";
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
		if (event.deltaY < 0 && boardScale < 1.8) boardScale += (boardScale < 1 ? 0.05 : 0.1);
		else if (event.deltaY > 0 && boardScale > 1 - screenOut/(12+screenOut*.8)) boardScale -= (boardScale < 1 ? 0.05 : 0.1);
		boardScale = +boardScale.toFixed(2);
		drawBoard();
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

let tween = { transition: 0, transitionX: 0, transitionY: 0 };

// ui stuff
let controls, actButton, infoTab, dialog, upButton, leftButton, rightButton, downButton;
let title, titleText, playButton, fullscreenButton, soundButton;


// Game initialization
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

	// Resize in-game UI elements
	if (upButton) {
		updateStyleUI(dialog, (inDialog ? '' : 'display:none;') + 'border-radius:2rem;background-color:rgba(255,255,255,0.2)');
		updateStyleUI(controls, `bottom:0;width:${portrait?54:28}%`);
		updateStyleUI(actButton, `position:absolute;bottom:${30*scale}px;right:${30*scale}px;width:${controls.offsetWidth*0.6}px;height:${controls.offsetHeight*0.7}px;min-width:${controls.offsetHeight*0.7}px;`, 99, -1);
		upButton.style.fontSize =
		downButton.style.fontSize =
		leftButton.style.fontSize =
		rightButton.style.fontSize = 112 * scale + 'px';
		actButton.style.fontSize = 212 * scale + 'px';
	}

	gameContext.imageSmoothingEnabled = false;
	gameContext.textAlign = "center";
	gameContext.strokeStyle = 'black';
    gameContext.lineWidth = 12 * getScale();
	gameContext.lineJoin = 'round';

	// Fullscreen button
	updateStyleUI(fullscreenButton, `float:right`);
	// Sound button
	updateStyleUI(soundButton, `float:right;border-bottom-left-radius:2rem;margin-right:3px`);
	// Play and Settings buttons
	if (playButton) {
		updateStyleUI(playButton, `position:absolute;top:75%;left:50%;transform:translateX(-50%);width:50%;border-radius:2rem`);
		updateStyleUI(title, `position:absolute;top:50%;left:50%;transform:translateY(-50%) translateX(-50%) scale(${(portrait?width:height)<600?1:(portrait?width:height)/600})`, 240, 280);
		titleText.innerHTML = `<span style="color:orange;position:absolute;">&#8202◍</span><span style="position:absolute;">&#8202&#9784</span><span style="color:gold">〇dyssey${portrait?'&#8202':' &nbsp'}</span>`;
		titleText.style = `width:100%;margin-top:-${portrait?85:70}%`;
	}
}

function updateStyleUI(element, _style, _size = 99, _space = 128) {//element.style = _style;return;
	element.style = `${_space?`line-height:${_space*scale}px;`:''}font-size:${_size*scale}px;` + _style;
	console.log(_space,scale);
}

function switchState(event) {
	console.log("switchState", event);
	state = 1;
	gameInit();
	createUI();
	resizeUI(1);
}

function getIcon(size) {
	return `<img src=ico.svg height=${size} width=${size}>`;
}

function createUI() {
	uiDiv.innerHTML = '';
	gameCanvas.style.pointerEvents = uiDiv.style.pointerEvents = "none";

	if (!state) {
		title = generateUIButton(uiDiv, `${getIcon(932)}`, switchState);
		titleText = document.createElement('div');
		title.append(titleText);
	} else {
		infoTab = document.createElement('div');
		infoTab.innerHTML = "<br>Welcome Corsair!";
		uiDiv.append(infoTab);

		actButton = generateUIButton(uiDiv, '&#9935', e => action(6), "css_controls");

		controls = document.createElement('div');
		uiDiv.append(controls);

		dialog = document.createElement('div');
		uiDiv.append(dialog);
		dialog.innerHTML = `<br> Castle <button onclick="alert('Button clicked!')">Click Me</button>`;
	}

	// Fullscreen and Sound buttons
	fullscreenButton = generateUIButton(uiDiv, '&#9974', toggleFullscreen);
	soundButton = generateUIButton(uiDiv, '', toggleSound);

	if (!state) {
		// Create Play Button
		playButton = generateUIButton(uiDiv, `Play`, switchState);
	} else {
		upButton = generateUIButton(controls, '&#9650', e => action(1), "css_controls");    // ^
		leftButton = generateUIButton(controls, '&#9664', e => action(4), "css_controls");  // <
		rightButton = generateUIButton(controls, '&#9654', e => action(2), "css_controls"); // >
		downButton = generateUIButton(controls, '&#9660', e => action(3), "css_controls");  // v

		upButton.style = "margin:2% auto 0";
		leftButton.style = "float:left;margin:2%";
		rightButton.style = "float:right;margin:2%";
		downButton.style = "margin:2% auto";
	}

	toggleSound();
	resizeUI();
}

function generateUIButton(div, code, handler, className = "css_space") {
	const button = document.createElement('div');
	button.innerHTML = code;
	button.addEventListener(interactionTap, handler.bind(this));
	button.className = "css_button css_icon " + className;
	
	div.append(button);
	return button;
}
