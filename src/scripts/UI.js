const goldIcon = "&#164;";// currency sign

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
	if (_max < _num) _num = _max;
	const _step = _max / _num;
	for (let i = 0; i < _num; i++) {
		if (i * _step < _health) {
			str += _char;
		} else {
			str += getSpan(_char, "red");
		}
		if ((i+1) % (8-_step|0) == 0) str += _max > 19 ? " " : "";
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
			if (battleIntro || autoBattle) return; // disallow clicks when in the dungeon entrance (dialog is being used)
			prepareDialog(
				state ? inBattle==1 ? "<br>Dungeon floor " + dungeonStage : "Day: " + timePassed : "",
				"<br>" + (
					state
					? inBattle==1
						? getDungeonStagesString()[0]
						: getSpan("&#9881 Sail: " + moveLeft) + getSpan(`<br><br>${goldIcon} Gold: ${gold}`)
					: "<br>Game by Noncho Savov") + "<br>",
				displayDialog
			);
			if (!state) {
				let bitmap = offscreenBitmaps[38];
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
		//titlePng = generateUIButton(uiDiv, "", switchState, "");
		titleText = generateUIButton(uiDiv, "", switchState, "");
		bgrCanvas.style.opacity = .6;
	} else {
		hasTutorial = 1;
		actButton = generateUIButton(uiDiv, '?', e => action(), "css_icon");

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

	soundButton = generateUIButton(uiDiv, '');
	soundButton.addEventListener(interactionTap, toggleSound);

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

function addBitmapToScreen(_dialog, _bitmap, _name, _healthBar, _transform = "scale(1.5) translateY(-30%)", _callback = 0) {
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

function addLabelToDialog(_dialog, _label, _label2) {
	_dialog.innerHTML = `${_label ? getSpan(_label, 0, "6vmin", "line-height:9vmin") + '<br>' : ''}<b>${_label2}</b><br>`;
}

function prepareDialog(_label, _label2, _callback1, _btn1, _callback2, _btn2) {
	if (hardChoice) return;
	addLabelToDialog(dialog, _label, _label2);
	prepareDialogButtons(dialog, displayDialog, _callback1, _btn1, _callback2, _btn2);
	if (!inDialog) displayDialog();
}

function prepareBattleScreen(_label, _label2, _callback1, _btn1, _callback2, _btn2) {
	addLabelToDialog(battleScreen, _label, _label2);
	prepareDialogButtons(battleScreen, displayBattleScreen, _callback1, _btn1, _callback2, _btn2);
	if (!inBattle) {
		displayBattleScreen(
			dungeonEnemy == 10 || dungeonEnemy == 11 ? 4 :
			dungeonEnemy == 12 || dungeonEnemy == 13 ? 3 :
			dungeonSiege ? 2 : 1
		);
	}
}

function prepareDialogButtons(_dialog, close, callback1, btn1, callback2, _btn2) {
	let button1 = document.createElement('button');
	button1.style.color = '#f009';
	button1.style.background = '#fda';
	let span1 = document.createElement('span');
	span1.innerHTML = btn1 || 'Okay';
	button1.appendChild(span1);
	button1.addEventListener('click', callback1 || close);
	_dialog.appendChild(button1);
	
	if (callback2) {
		let button2 = document.createElement('button');
		button2.style.color = '#0a09';
		let span2 = document.createElement('span');
		span2.innerHTML = _btn2 || 'Exit';
		button2.appendChild(span2);
		button2.addEventListener('click', callback2);
		_dialog.appendChild(button2);
	}
}

function displayDialog() {
	inDialog = !inDialog;
	SoundFXui();
	dialog.style.display = inDialog ? 'block' : 'none';
	gameContainer.style.display = inDialog ? 'none' : 'block';
	uiDiv.style.pointerEvents = inDialog ? 'auto' : 'none';
	battleScreen.style.opacity = inDialog ? 0.5 : 1;
}

function displayBattleScreen(battleType) {
	inBattle = battleType || !inBattle;
	battleScreen.style.display = inBattle ? 'block' : 'none';
	gameContainer.style.display = inBattle ? 'none' : 'block';
	uiDiv.style.pointerEvents = inBattle ? 'auto' : 'none';
}

function fadeBackground(_clr = "#222b") {
	uiDiv.style.background = _clr;
}

/*function displayRumors(_rumors, _amount) {
	if (spendGold(_amount)) return;
	backFromDialog();
	prepareDialog("Rumors", _rumors);
}*/

function displayNoFunds() {
	backFromDialog();
	prepareDialog(0, "<br>Not enough gold<br><br>", () => action());
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
	// ᠅ &#6149; | ☒ &#9746 | ☑ ☐  | ⊡ &#8865 | ⚀ &#9856 | 🝕 &#128853 | ▣ &#9635 | "₪" "ϵ"
	// ꖜ &#42396 | |Ꙭ 🕀 ○ | ● &#183; | ◯ | 〇 &#12295 | ⬤ ⊗ | ❂ &#10050 | ☉ &#9737 | ☼ &#9788 | ¤ &#164

	//unit = getUnit(playerX, playerY);
	if (dungeon || inBattle || battleIntro) {
		actButton.innerHTML = "&#9876<br>" + getSpan("ATTACK", 0, "5vmin");
	} else
	if (
		gamePlayer.overlay == UnitType.CASTLE ||
		gamePlayer.overlay == UnitType.SHRINE ||
		gamePlayer.overlay == UnitType.TREE && (playerHealth < playerHealthMax || crewHealth < crewHealthMax)
	) {

		actButton.innerHTML = `${
			gamePlayer.overlay==UnitType.TREE?'<div style="font-size:14vmin;color:#3f3">&nbsp;`</div>'+getSpan('&#11044','#f80','14vmin'):''
		}<div style='font-size:6vmin;position:relative;margin:-1vmin 0'>${gamePlayer.overlay==UnitType.TREE?'HEAL':'ENTER'}</div>`;
		if (gamePlayer.overlay != UnitType.TREE) {
			actButton.prepend(offscreenBitmaps[gamePlayer.overlay-1]);
		}

	} else if (gamePlayer.overlay == UnitType.WRECK || gamePlayer.overlay == UnitType.GOLD) {
		gamePlayer.overlay = 0;
		removeUnit(playerX, playerY);
		SoundFXgetGold();
		gold += 50;
		backFromDialog();
	} else {
		actButton.innerHTML = hasTutorial ? "?" : '<b>@</b>';//'&#187';
	}

	resizeUI(event);
}

function updateInfoTab() {
	let _char = "&#9608";
	let _html;
	if (inBattle) {// dungeon, land, siege or marine battles
		_html = getSpan(
			inBattle==1
				? `Stage ${dungeonStage}, Room ${dungeonRoom}`
				: `${inBattle==4||!onFoot?"Naval":inBattle==2?"Siege":"Land"} Battle`,
			0, '3em', 'line-height:2vmin'
		);
	} else {
		_html = `${getSpan('&#9881', '#cef', '5vmin', 'vertical-align:bottom')} ${
			getSpan(_char.repeat(moveLeft), moveLeft > 9 ? '#68f' : '#fd6', 0, '')
		}&#9612${
			getSpan(_char.repeat(moveLimit - moveLeft), '#57f8')
		}<div style="font-size:3em;top:42%;left:16%">${
			getSpan(moveLeft, '#8ff')
		}</div>`
		//`<span style="font-size:2em">${timePassed}</span>`
	}
	_html += `<div style="font-size:3.5em;${inBattle?`left:${dungeon?50:40}vmin;margin:-1vmin`:'top:180%'}">${getSpan(goldIcon + gold, 'gold')}</div>`;
	infoTab.innerHTML = _html;
}

function backFromDialog() {
	if (inDialog) displayDialog();
	gameContainer.style.display = "block";
	updateActionButton();
	updateInfoTab();
}

function closeButtonClick(e) {
	if (playerHealth < 0 || shipHealth < 0 || autoBattle) return;
	prepareDialog("<br>Quit Game", "<br>Are you sure?<br>", quitGame, "Yes", displayDialog, "No");
}

function infoButtonClick(id = 0, _hp, _att) {
	if (paused || hardChoice || autoBattle) return;
	if (battleIntro) return; // disallow info clicks when in the dungeon entrance (because dialog is being used)
	prepareDialog(
		(id == 1 ? "Ship" : id == 2 ? "Crew" : !id ? "Hero" : getEnemyName(id == 12 ? 12 : id - 3)) + "<br>",
		(id < 3 ? "Level: " + (id == 1 ? shipLevel : id == 2 ? crewLevel : !id ? playerLevel : id == 12 ? 12 : id - 3) + " &nbsp; " : '') +
			"HP: " + (id == 1 ? shipHealth : id == 2 ? crewHealth : !id ? playerHealth : _hp) +
			"/" + (id == 1 ? shipHealthMax : id == 2 ? crewHealthMax : !id ? playerHealthMax : getEnemyHP(id == 12 ? 12 : id - 3)) +
			(id < 3 ? "" : " &nbsp; ") + `<br>${
				!id ? 'Exp: ' + experience + ` (${experience<expLevels[0]?expLevels[0]:experience<expLevels[1]?expLevels[1]:expLevels[2]}) &nbsp; ` : ''
			}Attack: ${getAttackDamage(id)}`,
		displayDialog
	);
	let bmp = id == 1 ? offscreenBitmapsFlipped[2] : id == 2 ? offscreenBitmaps[8] : !id ? offscreenBitmaps[0]
		: id == 12 ? offscreenBitmapsFlipped[5] : offscreenBitmaps[33 + id];

	bmp.style.margin = "1vmin";
	dialog.firstChild.append(bmp)
}

function checkCrewSailing() {
	if (crewHealth < 1) {
		resizeUI();
		prepareDialog("Revolt!", "<br>Crew demands:<br>", () => {
			if (gold < crewHealthMax * crewPaid) {
				completeGame("Fatal Mutiny");
				return;
			}
			spendGold(crewHealthMax * crewPaid);
			crewPaid ++;
			crewHealth = crewHealthMax/2|0;
			hardChoice = false;
			backFromDialog();
			startNewDay();
		}, "Pay " + goldIcon + crewHealthMax * crewPaid);
		hardChoice = true;
	}
}


/*function debugBoard() {
	if (_debug) console.log(
		unitsData.map(arr => arr.map(num => (!num ? "0" + num.toString(16) : (num==7?"^":num>=1&&num<11?num<7?num<3?"█":"█":"█":num==11?"▀":" ") + num.toString(16)).toUpperCase())).join("\n")
	);
}*/

// debug visitedData
/*if (_debug) console.log(
	mapData.map((arr,y) => arr.map((num,x) => (x==playerX&&y==playerY? "  " : num.toString(16).length == 1 ? "0" + num.toString(16) : num.toString(16)).toUpperCase())).join("\n")
);*/

/*if (_debug) console.log(
	visitedData.map((arr,y) => arr.map((num,x) => (x==playerX&&y==playerY? "  " : num.toString(16).length == 1 ? "0" + num.toString(16) : num.toString(16)).toUpperCase())).join("\n")
);*/

/*function getIcon(size) {
	return `<img src=ico.png height=${size} width=${size}>`;
}*/

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
