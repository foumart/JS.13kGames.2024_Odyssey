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

function onBoardZoom(event) {
	if (state) {
		if (event.deltaY < 0 && boardScale < 1.8) boardScale += (boardScale < 1 ? 0.05 : 0.1);
		else if (event.deltaY > 0 && boardScale > 2 - screenOut/(12+screenOut*.8) - screenWidth/9) boardScale -= (boardScale < 1 ? 0.05 : 0.1);
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

let tween = { transition: 0, transitionZ: 0, transitionX: 0, transitionY: 0 };

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

function tryToShowInstallButton() {
	if (!state && installPrompt) {
		installButton = generateUIButton(uiDiv, `Install`, e => displayInstallPrompt(), 'css_icon css_install');
	}
}

async function displayInstallPrompt() {
	if (!installPrompt) {
		return;
	}
	await installPrompt.prompt()
		.then(results => {console.log(results)
			if (results.outcome == "accepted") {
				hideInstallButton();
			}
		})
		.catch(error => {
			hideInstallButton();
		});
};

function hideInstallButton() {
	installButton.display = "none";
	installPrompt = null;
}


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
		updateStyleUI(dialog, (inDialog ? '' : 'display:none;') + `width:${portrait?width*.9:width*.46}px;top:50%;left:50%;transform:translateY(-${portrait?60:40}%) translateX(-${portrait?50:43}%)`, 99, portrait?128:99);
		updateStyleUI(controls, `bottom:0;width:${portrait?54:28}%`);
		updateStyleUI(actButton, `bottom:${30*scale}px;right:${30*scale}px;width:${controls.offsetWidth*0.6}px;height:${controls.offsetHeight*0.7}px;min-width:${controls.offsetHeight*0.7}px;`, 99, -1);
		upButton.style.fontSize =
		downButton.style.fontSize =
		leftButton.style.fontSize =
		rightButton.style.fontSize = 112 * scale + 'px';
		actButton.style.fontSize = 200 * scale + 'px';
	}

	gameContext.imageSmoothingEnabled = false;
	//gameContext.textAlign = "center";
	//gameContext.strokeStyle = 'black';
	//gameContext.lineWidth = 12 * getScale();
	//gameContext.lineJoin = 'round';

	if (closeButton) updateStyleUI(closeButton, `position:relative;float:right;margin:1%;margin-left:0;background:#faac`, 64);

	if (playerButton) {
		playerButton.innerHTML = addHealthbar(playerHealth);
		shipButton.innerHTML = addHealthbar(shipHealth);
		crewButton.innerHTML = addHealthbar(crewHealth);
		playerButton.prepend(offscreenBitmaps[1]);
		shipButton.prepend(offscreenBitmaps[5]);
		crewButton.prepend(offscreenBitmaps[8]);
		offscreenBitmaps[1].style = offscreenBitmaps[5].style = offscreenBitmaps[8].style = `position:relative;width:${(width/16)}px;min-width:48px;min-height:48px`;
		updateStyleUI(playerButton, `padding:${(portrait?height:width)/99}px;position:relative;float:left;margin:1%;margin-right:0;border-radius:0`, 28, 32);
		updateStyleUI(shipButton, `padding:${(portrait?height:width)/99}px;position:relative;float:left;margin:1%;margin-right:0;border-radius:0`, 28, 32);
		updateStyleUI(crewButton, `padding:${(portrait?height:width)/99}px;position:relative;float:left;margin:1%;margin-right:0;border-radius:0`, 28, 32);
	}

	// Fullscreen button
	if (fullscreenButton) updateStyleUI(fullscreenButton, `position:relative;float:right;margin:1%;margin-left:0`);
	// Sound button
	updateStyleUI(soundButton, `position:relative;float:right;margin:1%;margin-left:0`, 64, 99);
	
	// Install, Play and Title
	if (playButton) {
		if (installButton) updateStyleUI(installButton, `top:${portrait?82:84}%;left:50%;transform:translateX(-50%);width:40%`, 80, portrait?112:99);
		updateStyleUI(playButton, `top:${(portrait?installButton?70:75:installButton?68:72)}%;left:50%;transform:translateX(-50%);width:50%`);
		title.innerHTML = getIcon(portrait ? 112 : 99);
		updateStyleUI(title, `filter:drop-shadow(0 1vh 0 #23b);top:${portrait?58:54}%;left:50%;transform:translateY(-50%) translateX(-50%) scale(${(portrait?width:height)<600?1:(portrait?width:height)/600})`);
		titleText.innerHTML = `<div style="text-shadow:#23b9 .03em 0;color:#238;font-size:${440*scale}px;margin-top:-${20*scale};margin-left:${336*scale}">&#9784</div><div style="text-shadow:#23b .03em 0;color:#49e;margin-top:-${20*scale}px;margin-left:${310*scale}px;font-size:${440*scale}px">&#9784</div><div style="filter:drop-shadow(.08em 0 0 #239);text-shadow:#f71 .1em 0;margin-top:-${90*scale}px;margin-left:${320*scale}px;font-size:${99*scale}px;color:#ffc"><i><b>Isle-Hop</b></i></div><span style="filter:drop-shadow(.05em 0 0 #239);position:relative;text-shadow:#f80 .05em 0"><b>Odyssey</b></span>`;
		updateStyleUI(titleText, `font-family:system-ui;top:50%;left:50%;transform:translateY(-${portrait?460:270}%) translateX(-50%) scale(${(portrait?width:height)<700?1:(portrait?width:height)/700})`, 220);
	}
}

function addHealthbar(_health, _char = '&#9604') {
	return `<br>${_char.repeat(_health/16|0)}<span style="color:red">${_char.repeat(6-(_health/16|0))}</span>`;
}

function updateStyleUI(element, _style, _size = 99, _space = 128) {
	element.style = `text-shadow:#0068 0 .1rem;border-radius:1rem;position:absolute;text-align:center;${_space?`line-height:${_space*scale}px;`:''}font-size:${_size*scale}px;` + _style;
}

function switchState(event) {
	console.log("switchState", state);
	state ++;
	gameInit();
	createUI();
	tryToShowInstallButton();
	resizeUI(1);
}

function getIcon(size) {
	return `<img src=ico.png height=${size} width=${size}>`;
}

function createUI() {
	uiDiv.innerHTML = '';
	gameCanvas.style.pointerEvents = uiDiv.style.pointerEvents = "none";

	if (!state) {
		title = generateUIButton(uiDiv, "", switchState, "");
		titleText = generateUIButton(uiDiv, "", switchState, "");
		gameCanvas.style.opacity = .7;
	} else {
		infoTab = document.createElement('div');
		infoTab.innerHTML = "<br>Welcome Corsair!";
		uiDiv.append(infoTab);

		actButton = generateUIButton(uiDiv, '&#9935', e => action(6), "css_icon css_controls");

		controls = document.createElement('div');
		uiDiv.append(controls);

		dialog = generateUIButton(uiDiv, '');

		closeButton = generateUIButton(uiDiv, '&#x2715', e => closeButtonClick());
		playerButton = generateUIButton(uiDiv, '', e => closeButtonClick(), "css_icon css_button");
		shipButton = generateUIButton(uiDiv, '', e => closeButtonClick(), "css_icon css_button");
		crewButton = generateUIButton(uiDiv, '', e => closeButtonClick(), "css_icon css_button");
		gameCanvas.style.opacity = 1;
	}

	// Fullscreen and Sound buttons
	if (!_standalone) fullscreenButton = generateUIButton(uiDiv, '&#9974', toggleFullscreen);

	soundButton = generateUIButton(uiDiv, '', e => toggleSound());

	if (!state) {
		// Create Play Button
		playButton = generateUIButton(uiDiv, `Play`, switchState, 'css_icon css_play');
		
	} else {
		upButton = generateUIButton(controls, '&#9650', e => action(1), "css_icon css_controls");    // ^
		leftButton = generateUIButton(controls, '&#9664', e => action(4), "css_icon css_controls");  // <
		rightButton = generateUIButton(controls, '&#9654', e => action(2), "css_icon css_controls"); // >
		downButton = generateUIButton(controls, '&#9660', e => action(3), "css_icon css_controls");  // v

		upButton.style = "margin:2% auto 0";
		leftButton.style = "float:left;margin:2%";
		rightButton.style = "float:right;margin:2%";
		downButton.style = "margin:2% auto;overflow:hidden";
	}

	toggleSound();
	resizeUI();
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

function generateUIButton(div, code, handler, className = "css_icon css_space") {
	const button = document.createElement('div');
	button.innerHTML = code;
	if (handler) button.addEventListener(interactionTap, interactionStart.bind(this, handler));
	button.className = "css_button " + className;
	
	div.append(button);
	return button;
}
