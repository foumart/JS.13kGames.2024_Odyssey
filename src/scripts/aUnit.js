class BoardUnit extends BoardTile {

	constructor(x, y, type) {
		super(x, y, type);
	}

	shouldAnimate() {
		return this.type == 1 && player.onFoot || this.type > 1 && this.type < 5 && !player.onFoot;
	}

	getX() {
		return this.width/2 + super.getX() - (this.shouldAnimate() ? tween.transitionX * this.width : 0);
	}

	getY() {
		return this.width/2 + super.getY() - (this.shouldAnimate() ? tween.transitionY * this.height : 0);
	}
	
	draw() {
		if (this.type) {
			gameContext.globalAlpha = (screenOut - this._alpha) / screenOut;

			/*gameContext.beginPath();
			gameContext.fillStyle = this.getColor();
			gameContext.arc(
				this.getX(),
				this.getY(),
				this.width/2,
				0, 7
			);
			gameContext.fill();
			gameContext.closePath();
			gameContext.fillStyle = "#000000";
			gameContext.font = `${20 * boardScale * tween.transition}px Arial`;
			gameContext.fillText(
				this.type,
				this.getX(),
				this.getY()+5
			);*/

			let C = [
				"5656622a2a3fff2b00c92606e2e2f0f39c76cb7a2a",
				"835426c6c6d4a4a4b4898995b25800544434bf6812",
				"835426a4a4b4c6c6d4898995544434b25800bf6812",
				"835426c6c6d4a4a4b4898995bf6812b25800544434",
				
				"24a22c39be4300e9120d8537982943c52e51544434",
				"2965ff2658d7537de73a3a933c6be24343a0544434",
				"24a22c39be4300e9120d8537982943c52e51544434",
				"2965ff2658d7537de73a3a933c6be24343a0544434",
				"24a22c39be4300e9120d8537982943c52e51544434",

				"6b6b7ca4a4b444444e898995c6c6d4835426b25800",
				"565662c6c6d4898995565662835426b25800544434",
				"0c680424a22c0d853700e91200ca10544434835426",//tree
				"b25800835426ffca3ae0a70ede8e27bf6812544434",//gold
				"adbaa8f4e5d50c680471806ba7734024a22c835426"//mount
			][this.type-1]
			let px=[]
			let P=[
					"@IRBH[dRPujS@v_DPdZNzTgPQJB@RPB",// player pirate
					"@HB@XbSC@HD@XbUCSK\\Z@pA@HiOA@IM@",// ship up
					"@A@@P[A@[SC@ZRY@RaQC\`EE~I~~AHII@",// ship left
					"@@H@@HRC@PSR@J[ZPKL[uxxDHuuI@IIA",// ship right
					
					"@QA@HZJAQLQLHMHbp@Qd@HbD@ad@\`d@@",// enemy1
					"HA@@ZJ@@lS@Ddm@fpdtD@vf@@\`D@@@@@",//enemy2
					"@QA@HZJAQLQLHMHbp@Qd@HbD@ad@\`d@@",// enemy1
					"HA@@ZJ@@lS@Ddm@fpdtD@vf@@\`D@@@@@",//enemy2
					"@QA@HZJAQLQLHMHbp@Qd@HbD@ad@\`d@@",// enemy1

					"HZZ\\HmUZHjQ\\@SdC@aQCHmKZi~]Lh~]A",//10 castle
					"@@I@@RSC@[YAPJIZXKIKPJIZXKIK@@@@",//11 shrine
					"@QK@HlRAaeUJQmRKH[IA@@F@@KOC@X[@",//12 tree
					"@HB@@cQ@\`]LBhcsAPuMB@WQG@xz@@@@@",//13 gold
					"@QA@XRbCKUL[kai\\fotootots}e^X[XC"//14 mount
				][this.type-1].replace(/./g,a=>{
				let z=a.charCodeAt()
				px.push(z&7)
				px.push((z>>3)&7)
			})
			let W=8
			let H=8
			for(let j=0;j<H;j++){
				for(let i=0;i<W;i++){
					if(px[j*W+i]){
						gameContext.fillStyle="#"+C.substr(6*(px[j*W+i]-1),6)
						gameContext.fillRect(this.getX() - this.width/2 - this.width/6 + i*this.width/6, this.getY() - this.height + j*this.width/6, this.width/6, this.width/6)
					}
				}
			}

			gameContext.globalAlpha = 1;
		}
	}

	getColor() {
		return ["#00cc00", "#ff3300", "#ff6600", "#ff9900", "#ffff00", "#ff00ff", "#ff00ff", "#ff00ff"][this.type];
	}
}
