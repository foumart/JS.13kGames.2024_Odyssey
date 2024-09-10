const goldIcon = "&#10022;";//&#10022;

function getIcon(size) {
	return `<img src=ico.png height=${size} width=${size}>`;
}

function getScale() {
	return (height < width ? height : width) / 1000;
}

function getSize(limit = 600, strength = 3) {
	return (portrait ? width : height) < limit ? 1 : (strength + (portrait ? width : height) / (portrait ? 960 : 540)) / (strength+1);
}

function getSpan(_txt, _clr, _fontSize, _style) {
	return `<span style='${_clr ? 'color:' + _clr : ''}${_fontSize ? ';font-size:' + _fontSize : ''}${_style ? ';' + _style : ''}'>${_txt}</span>`;
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
		if ((i+1) % (8-_step|0) == 0) str += _max > 23 ? " " : "";
	}
	return str;
}

function updateStyleUI(element, _style, _size = 99, _space = 128) {
	element.style = `text-shadow:#0068 0 .6vmin;border-radius:5vmin;position:absolute;text-align:center;${_space?`line-height:${_space*scale}px;`:''}font-size:${_size*scale}px;` + _style;
}

function createUI() {
	uiDiv.innerHTML = '';
	gameCanvas.style.pointerEvents = bgrCanvas.style.pointerEvents = uiDiv.style.pointerEvents = "none";
	//gameCanvas.style.filter = "drop-shadow(0 1vh 0 #0002)";

	infoTab = generateUIButton(uiDiv, 'v{VERSION}',
		() => {
			prepareDialog(
				state ? inBattle ? "<br>Dungeon floor " + dungeonFloor : "Day: " + timePassed : "",
				"<br>" + (
					state
					? inBattle
						? getDungeonStagesString()
						: getSpan("&#9881 Sail points left: " + moveLeft) + getSpan(`<br><br>${goldIcon} Gold: ${gold}`)
					: "<br>Game by Noncho Savov") + "<br>",
				displayDialog
			);
			if (!state) {
				let bitmap = offscreenBitmaps[37];
				dialog.firstChild.prepend(bitmap);
				bitmap.style.marginTop = "4vmin";
			}
		}
	);
	
	if (_debug) {
		fpsElement = document.createElement('div');
		uiDiv.appendChild(fpsElement);
		fpsElement.style.fontFamily = "Arial";
		fpsElement.style.fontSize = "16px";
		fpsElement.style.pointerEvents = "none";
	}

	if (!state) {
		titlePng = generateUIButton(uiDiv, "", switchState, "");
		titleText = generateUIButton(uiDiv, "", switchState, "");
		bgrCanvas.style.opacity = .6;
	} else {
		hasTutorial = 1;
		actButton = generateUIButton(uiDiv, '', e => action(6, isPlayerDamaged()), "css_icon css_controls");

		controls = document.createElement('div');
		uiDiv.append(controls);

		closeButton = generateUIButton(uiDiv, '&#215', e => closeButtonClick());
		playerButton = generateUIButton(uiDiv, '', e => infoButtonClick(), "css_icon");
		shipButton = generateUIButton(uiDiv, '', e => infoButtonClick(1), "css_icon");
		crewButton = generateUIButton(uiDiv, '', e => infoButtonClick(2), "css_icon");
		bgrCanvas.style.opacity = 1;
	}

	battleScreen = generateUIButton(uiDiv, '');

	dialog = generateUIButton(uiDiv, '');

	// Fullscreen and Sound buttons
	//if (!_standalone) fullscreenButton = generateUIButton(uiDiv, '&#9114', toggleFullscreen);

	soundButton = generateUIButton(uiDiv, '', toggleSound);

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

	setupSoundButton();//just update the button, sound initialization needs to happen with user input
	resizeUI();
}

function addBitmapToDialog(_dialog, _bitmap, _name, _healthBar, _transform = "scale(1.5) translateY(-30%)", _callback = 0) {
	let bitmapContainer = document.createElement("div");
	bitmapContainer.style.position = "relative";
	bitmapContainer.style.fontSize = "2vmin";
	bitmapContainer.style.lineHeight = "0";
	if (_name) bitmapContainer.innerHTML = `<div style="margin-top:5vmin;font-size:3em;position:relative">${_name}</div>`;
	_dialog.prepend(bitmapContainer);
	_dialog.style.display = "inline-flex";
	_bitmap.style.margin = _healthBar ? '8vmin' : '13vmin 0 0';
	bitmapContainer.append(_bitmap);
	if (_callback) bitmapContainer.addEventListener(interactionTap, _callback);

	if (_healthBar) {
		const healthBarElement = document.createElement("span");
		healthBarElement.innerHTML = _healthBar;
		bitmapContainer.appendChild(healthBarElement);
	}

	if (_transform) _bitmap.style.transform = _transform;
	return bitmapContainer;
}

/*function enemyClicked(e) {
	console.log(e, dungeonEnemy);
}*/

function addLabelToDialog(_dialog, _label, _label2) {
	_dialog.innerHTML = `${_label?'<span style="font-size:6vmin;line-height:9vmin">'+_label+'</span><br>':''}<b>${_label2}</b><br>`;
}

function prepareDialog(_label, _label2, _callback1, _btn1, _callback2, _btn2) {
	if (inDialog && hardChoice) return;
	addLabelToDialog(dialog, _label, _label2);
	prepareDialogButtons(dialog, displayDialog, _callback1, _btn1, _callback2, _btn2);
	if (!inDialog) displayDialog();
}

function prepareBattleScreen(_label, _label2, _callback1, _btn1, _callback2, _btn2) {
	addLabelToDialog(battleScreen, _label, _label2);
	prepareDialogButtons(battleScreen, displayBattleScreen, _callback1, _btn1, _callback2, _btn2);
	if (!inBattle) displayBattleScreen();
}

function prepareDialogButtons(_dialog, _close, _callback1, _btn1, _callback2, _btn2) {
	_dialog.innerHTML += `<button style="color:#f009;background:#fda">${_btn1||"Okay"}</button>`;
	if (_callback2) _dialog.innerHTML += `<button style="color:#0a09">${_btn2||"Cancel"}</button>`;
	if (_callback2) _dialog.children[_dialog.children.length - 2].addEventListener(interactionTap, _callback1 || _close);
	_dialog.lastChild.addEventListener(interactionTap, _callback2 ? _callback2 : _callback1 || _close);
}

function displayDialog() {
	inDialog = !inDialog;
	dialog.style.display = inDialog ? 'block' : 'none';
	gameContainer.style.display = inDialog ? 'none' : 'block';
	uiDiv.style.pointerEvents = inDialog ? 'auto' : 'none';
	battleScreen.style.opacity = inDialog ? 0.5 : 1;
}

function displayBattleScreen() {
	inBattle = !inBattle;
	battleScreen.style.display = inBattle ? 'block' : 'none';
	gameContainer.style.display = inBattle ? 'none' : 'block';
	uiDiv.style.pointerEvents = inBattle ? 'auto' : 'none';
	uiDiv.style.background = inBattle ? "#222b" : "0";
}

function displayRumors(_rumors, _amount) {
	if (spendGold(_amount)) return;
	backFromDialog();
	prepareDialog("Rumors", _rumors);
}

function displayNoFunds() {
	backFromDialog();
	prepareDialog(0, "<br>Not enough gold<br><br>", () => action(6));
}

function updateActionButton(event) {
	// ⚔️⚔ '&#9876' | ⛏ '&#9935' | ☸ '&#9784' | 🛠️🛠 &#128736 | ⚙️⚙ &#9881 | ⎚ &#9114 |
	// 🚢 &#128674 | 🛳 🛳️ | ⛵ &#9973 | 🛶 &#128758 | 🚤 | 🛥 &#128741 | 🛥️ | ⚓ &#9875 | 🔱 &#128305 |
	// 🪓 &#129683 | 🔧 &#128295 | 💎 &#128142 | ⚒️ | 💣 | 🌎 | ⚐ &#9872 | ⚑ &#9873 | ⚰ &#9904 | ⚱ &#9905 |
	// ♨ &#9832 | ⛓ &#9939 | ☄ &#9732 | ✖ &#10006 | × &#215 | 🗙 &#128473 | ✕ &#10005 | ❌ &#10060 | ⛝ &#9949 | ✕ &#x2715
	// █ &#9608 | ▀ &#9600 | ▄ &#9604 | ■ &#9632 | □ &#9633 | ▐ &#9616 | ▌ &#9612 | ⬞ &#11038 | ⬝ &#11037 | ◦ ∘
	// ⌢ &#8994 | ᵔ &#7508 | ⤼ &#10556 | ට | 𝓠 &#120032 | 𝓞 | ⌓ ᗝ ◑ ❍ | Ѻ &#1146 | ▢ ⬯ | 𝕆 &Oopf; |
	// ⫝ &#10973 | ⥀ &#10560 | ⛀ ⛃ | ⬭ &#11053; | ⬬ &#11052 | ⤽ | ⤸ | ⤺ &#10554 | 🜿 &#128831 | 𝅏▼▾ | ❫ &#10091 |
	// ❩ ↜ 🗓 ⚿ ⍰ ◫ ⊞ ⊟ ⍞ ⍄ ⛋ ⏍⌻❏❑⧠❐⍈  ✠  ✡  ✢  ✣  ✤  ✥  ✦&#10022  ✧  ✰  ✱  ✲  ✳  ✴  ✵  ✶  ✷  ✸
	// ᠅ &#6149; | ☒ &#9746 | ☑ ☐  | ⊡ &#8865 | ⚀ &#9856 | 🝕 &#128853 | ▣ &#9635 | 
	// ꖜ &#42396 | |Ꙭ 🕀 ○ | ● &#183; | ◯ | 〇 &#12295 | ⬤ ⊗ | ❂ &#10050 | ☉ &#9737 | ☼ &#9788

	//unit = getUnit(playerX, playerY);

	if (
		gamePlayer.overlay == UnitType.CASTLE ||
		gamePlayer.overlay == UnitType.SHRINE ||
		gamePlayer.overlay == UnitType.TREE
	) {
		//actButton.innerHTML = gamePlayer.origin>1 ? '&#9876' : '&#9881'; //getSpan('&#11044', '#fc6', 0, 'position:absolute;margin-left:-99%')
		actButton.innerHTML = `${
			gamePlayer.overlay==UnitType.TREE?'<div style="font-size:14vmin;color:#3f3">&nbsp;`</div>'+getSpan('&#11044','#f80','14vmin'):''
		}<div style='font-size:6vmin;position:relative;margin-top:-2vmin'>${gamePlayer.overlay==UnitType.TREE?'HEAL':'ENTER'}</div>`;
		if (gamePlayer.overlay != UnitType.TREE) {
			actButton.prepend(offscreenBitmaps[gamePlayer.overlay-1]);
		}

	} else if (gamePlayer.overlay == UnitType.WRECK || gamePlayer.overlay == UnitType.GOLD) {
		gamePlayer.overlay = 0;
		removeUnit(playerX, playerY);

		gold += 50;
		backFromDialog();
	} else {
		actButton.innerHTML = inBattle ? "&#9876<br>" + getSpan("ATTACK", 0, "5vmin") : hasTutorial ? "?" :
			onFoot ? '&#10003' : 'S';

		//actButton.style.opacity = hasEvent ? 1 : .5;
	}

	resizeUI(event);
}

function updateInfoTab() {
	let _char = "&#9608";
	if (inBattle) {
		infoTab.innerHTML = getSpan("Dungeon Floor 1 Battle!", 0, '3em', 'line-height:2vmin');
	} else {
		infoTab.innerHTML = `${getSpan('&#9881', '#cef', '5vmin', 'vertical-align:bottom')} ${
			getSpan(_char.repeat(moveLeft), moveLeft > 9 ? '#68f' : '#fd6', 0, '')
		}&#9612${
			getSpan(_char.repeat(moveLimit - moveLeft), '#57f8')
		}<div style="font-size:3em;top:42%;left:16%">${
			getSpan(moveLeft, '#8ff')
		}</div><div style="font-size:4em;top:180%">${
			getSpan(goldIcon + gold, 'gold')
		}</div>`;
	}
}

function debugBoard() {
	/*if (_debug) console.log(
		unitsData.map(arr => arr.map(num => (!num ? "0" + num.toString(16) : (num==7?"^":num>=1&&num<11?num<7?num<3?"█":"█":"█":num==11?"▀":" ") + num.toString(16)).toUpperCase())).join("\n")
	);*/
}

// debug visitedData
/*if (_debug) console.log(
	mapData.map((arr,y) => arr.map((num,x) => (x==playerX&&y==playerY? "  " : num.toString(16).length == 1 ? "0" + num.toString(16) : num.toString(16)).toUpperCase())).join("\n")
);*/

/*if (_debug) console.log(
	visitedData.map((arr,y) => arr.map((num,x) => (x==playerX&&y==playerY? "  " : num.toString(16).length == 1 ? "0" + num.toString(16) : num.toString(16)).toUpperCase())).join("\n")
);*/


/*function tryToShowInstallButton() {
	if (!state && installPrompt) {
		installButton = generateUIButton(uiDiv, `Install`, e => displayInstallPrompt(), 'css_icon');
	}
}*/

/*async function displayInstallPrompt() {
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
}*/
