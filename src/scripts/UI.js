function getIcon(size) {
	return `<img src=ico.png height=${size} width=${size}>`;
}

function getScale() {
	return (height < width ? height : width) / 1000;
}

function getSize(limit = 600, strength = 3) {
	return (portrait ? width : height) < limit ? 1 : (strength + (portrait ? width : height) / (portrait ? 960 : 540)) / (strength+1);
}

function generateUIButton(div, code, handler, className = "css_icon css_space") {
	const button = document.createElement('div');
	button.innerHTML = code;
	if (handler) button.addEventListener(interactionTap, interactionStart.bind(this, handler));
	button.className = "css_button " + className;
	
	div.append(button);
	return button;
}

function addHealthbar(_health, _max, _char = '&#9608', _num = 12) {
	let str = '<br><br><br>';
	const _step = _max / _num;
	for (let i = 0; i < _num; i++) {
		if (i * _step < _health) {
			str += _char;
		} else {
			str += `<span style="color:red">${_char}</span>`;
		}
		if (i % 2) str += " ";
	}
	return str;
}

function updateStyleUI(element, _style, _size = 99, _space = 128) {
	element.style = `text-shadow:#0068 0 .6vmin;border-radius:3vmax;position:absolute;text-align:center;${_space?`line-height:${_space*scale}px;`:''}font-size:${_size*scale}px;` + _style;
}

function createUI() {
	uiDiv.innerHTML = '';
	gameCanvas.style.pointerEvents = bgrCanvas.style.pointerEvents = uiDiv.style.pointerEvents = "none";
	//gameCanvas.style.filter = "drop-shadow(0 1vh 0 #0002)";

	infoTab = generateUIButton(uiDiv, 'v{VERSION}', () => prepareDialog(0, "Game by Noncho Savov", () => displayDialog()));
	
	if (_debug) {
		fpsElement = document.createElement('div');
		uiDiv.appendChild(fpsElement);
		fpsElement.style.fontFamily = "Arial";
		fpsElement.style.fontSize = "16px";
		fpsElement.style.pointerEvents = "none";
	}

	if (!state) {
		title = generateUIButton(uiDiv, "", switchState, "");
		titleText = generateUIButton(uiDiv, "", switchState, "");
		bgrCanvas.style.opacity = .6;
	} else {
		actButton = generateUIButton(uiDiv, '?', e => action(6), "css_icon css_controls");

		controls = document.createElement('div');
		uiDiv.append(controls);

		closeButton = generateUIButton(uiDiv, '&#215', e => closeButtonClick());
		playerButton = generateUIButton(uiDiv, '', e => infoButtonClick(), "css_icon");
		shipButton = generateUIButton(uiDiv, '', e => infoButtonClick(1), "css_icon");
		crewButton = generateUIButton(uiDiv, '', e => infoButtonClick(2), "css_icon");
		bgrCanvas.style.opacity = 1;
	}

	dialog = generateUIButton(uiDiv, '');

	// Fullscreen and Sound buttons
	if (!_standalone) fullscreenButton = generateUIButton(uiDiv, '&#9114', toggleFullscreen);

	soundButton = generateUIButton(uiDiv, '', e => toggleSound());

	if (!state) {
		// Create Play Button
		playButton = generateUIButton(uiDiv, `PLAY`, switchState, 'css_icon');
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

function tryToShowInstallButton() {
	if (!state && installPrompt) {
		installButton = generateUIButton(uiDiv, `Install`, e => displayInstallPrompt(), 'css_icon');
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

function displayDialog() {
	inDialog = !inDialog;
	dialog.style.display = inDialog ? 'block' : 'none';
	gameContainer.style.display = inDialog ? 'none' : 'block';
	uiDiv.style.pointerEvents = inDialog ? 'auto' : 'none';
	/*gameContainer.style.pointerEvents = inDialog ? 'none' : 'auto';
	if (buttonScreen) {
		for (let _y = 0; _y < buttonScreen.length; _y ++) {
			for (let _x = 0; _x < buttonScreen[_y].length; _x ++) {
				buttonScreen[_y][_x].btn.style.pointerEvents = inDialog ? "none" : "auto";
			}
		}
	}*/
}

function prepareDialog(_label, _label2, _callback1, _btn1, _callback2, _btn2) {
	dialog.innerHTML = `<u>${_label?_label+'</u><br>':''}<b>${_label2}</b><br><button style="color:#f009;background:#fda">${_btn1||"Okay"}</button>`;
	if (_callback2) dialog.innerHTML += `<button style="color:#0a09">${_btn2||"Cancel"}</button>`;
	if (!inDialog) displayDialog();
	if (_callback2) dialog.children[dialog.children.length - 2].addEventListener(interactionTap, _callback1);
	dialog.lastChild.addEventListener(interactionTap, _callback2 ? _callback2 : _callback1);
}

function updateActionButton(e) {
	// ⚔️⚔ '&#9876' | ⛏ '&#9935' | ☸ '&#9784' | 🛠️🛠 &#128736 | ⚙️⚙ &#9881 | ⎚ &#9114 | ◯ | 〇 | 〇 &#12295 | ⬤
	// 🚢 &#128674 | 🛳 🛳️ | ⛵ &#9973 | 🛶 &#128758 | 🚤 | 🛥 &#128741 | 🛥️ | ⚓ &#9875 | 🔱 &#128305 |
	// 🪓 &#129683 | 🔧 &#128295 | 💎 &#128142 | ⚒️ | 💣 | 🌎 | ⚐ &#9872 | ⚑ &#9873 | ⚰ &#9904 | ⚱ &#9905 |
	// ♨ &#9832 | ⛓ &#9939 | ☄ &#9732 | ✖ &#10006 | × &#215 | 🗙 &#128473 | ✕ &#10005 | ❌ &#10060 | ⛝ &#9949 | ✕ &#x2715
	// █ &#9608" | ▀ &#9600" | ▄ &#9604 | ■ &#9632 | □ &#9633 | ▐ &#9616 | ⬞ &#11038 | ⬝ &#11037 | ❂ &#10050 |
	// ⌢ &#8994 | ᵔ &#7508 | ⤼ &#10556 | ට | 𝓠 &#120032 | 𝓞 | ⌓ ᗝ ◑ ❍ | Ѻ &#1146 | ▢ ⬯ | 𝕆 &Oopf; |
	// ⫝ &#10973 | ⥀ &#10560 | ⛀ | ⬭ | ⤽ | ⤸ | ⤺ &#10554 | 🜿 &#128831 | 𝅏▼▾ | ❫ &#10091 | ❩ ↜

	//unit = getUnit(playerX, playerY);

	if (
		gamePlayer.overlay >= UnitType.CASTLE &&
		gamePlayer.overlay < UnitType.WRECK
	) {
		//actButton.innerHTML = gamePlayer.origin>1 ? '&#9876' : '&#9881';
		actButton.innerHTML = `${gamePlayer.overlay==UnitType.TREE?'<div style="font-size:2em;color:#3f3">&#8202`</div><span style="font-size:2em;color:#c36">&#11044</span>':''}<div style='font-size:6vmin;position:relative;margin-top:-2vmax'>${gamePlayer.overlay==UnitType.TREE?'EAT':'ENTER'}</div>`;
		if (gamePlayer.overlay != UnitType.TREE) {
			actButton.prepend(offscreenBitmaps[gamePlayer.overlay-1]);
		}

	} else if (gamePlayer.overlay == UnitType.WRECK) {//GOLD WRECK
		gamePlayer.overlay = 0;
		//console.log(getUnit(playerX, playerY), getUnitId(playerX, playerY));
		removeUnit(playerX, playerY);
		
		gold += 50;
		//updateActionButton();
		action(6);
	} else {
		actButton.innerHTML = onFoot ? hasEvent ? 'E' : 'L' : hasEvent ? 'E' : 'S';
		//actButton.style.opacity = hasEvent ? 1 : .5;
	}

	resizeUI(e);
}

function updateInfoTab() {
	//if (infoTab) infoTab.innerHTML = `<br>Position: ${playerX}x${playerY}<br>${idsData[playerY][playerX] ? 'Exploring Island '+idsData[playerY][playerX] : 'Sailing'}`;
	//if (infoTab) {
		let _char = "&#9608";
		let _sp = "&#8202 ";//timeLeft <span style="font-size:8vmax;color:#0c0">&#119113</span><br>
		infoTab.innerHTML = `<span style="font-size:2vmax;vertical-align:top">⚙</span> ${
			_char.repeat(30)}<span style="color:#f00">${
			_char.repeat(1)}</span><div style="font-size:3em;bottom:-150%"><span style="color:gold;margin-right:1rem">&#9881;${
			gold}</span><span style="color:#8cf;margin-right:1rem">&#9737;${
			shipLeft}</span><span style="color:#9fb">&#9737;${
			moveLeft}</span></div>`

	//}
}

function debugBoard() {
	if (_debug) console.log(
		unitsData.map(arr => arr.map(num => (!num ? "0" + num.toString(16) : (num==7?"^":num>=1&&num<11?num<7?num<3?"█":"█":"█":num==11?"▀":" ") + num.toString(16)).toUpperCase())).join("\n")
	);
}

// debug visitedData
/*if (_debug) console.log(
	mapData.map((arr,y) => arr.map((num,x) => (x==playerX&&y==playerY? "  " : num.toString(16).length == 1 ? "0" + num.toString(16) : num.toString(16)).toUpperCase())).join("\n")
);*/

/*if (_debug) console.log(
	visitedData.map((arr,y) => arr.map((num,x) => (x==playerX&&y==playerY? "  " : num.toString(16).length == 1 ? "0" + num.toString(16) : num.toString(16)).toUpperCase())).join("\n")
);*/
