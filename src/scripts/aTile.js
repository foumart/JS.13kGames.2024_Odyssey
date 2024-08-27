class BoardTile extends GameElement {
	
	constructor(x, y, type) {
		super();
		
		this.x = x;
		this.y = y;
		this.type = type;
	}

	getOffsetX() {
		return (portrait ? - screenOffsetX : screenOffsetX) - this.width*screenOut/2 -
			((this.width*screenWidth/2) - (this.width*screenWidth/2) / boardScale / tween.transition);
	}
	
	getOffsetY() {
		return (portrait ? screenOffsetY : -screenOffsetY) - this.height*screenOut/2 -
			((this.height*screenWidth/2) - (this.height*screenWidth/2) / boardScale / tween.transition);
	}

	getX() {
		return this.getOffsetX() + this.x * this.width + tween.transitionX * this.width;
	}

	getY() {
		return this.getOffsetY() + this.y * this.height + tween.transitionY * this.height;
	}

	update(type, alpha) {
		this.type = type;
		this._alpha = alpha;
		this.resize();
	}

	resize() {
		super.resize();
		this.draw();
	}

	draw() {
		gameContext.globalAlpha = (screenOut - this._alpha) / screenOut;

		/*gameContext.fillStyle = this.getColor();
		gameContext.beginPath();
		gameContext.fillRect(
			this.getX(),
			this.getY(),
			this.width,
			this.height
		);
		gameContext.closePath();*/
		let C = [
			"4d4de84343deeb9753544434898995c6c6d4835426",// 00 water
			"4d4de87070ef4343de7070ef00c70000dc00ffd07f",// 02 riff1
			"4d4de88585f54343de7070ef898995c6c6d4835426",// 01 riff2
			"4d4de88585f54343de7070ef00ae00ffd07f00c700",// 03 riff3
			"4d4de84343de8585f54343de00ae0000c70000dc00",
			"4d4de84343de8585f54343de00ae0000c70000dc00",
			"4d4de84343de8585f54343de00ae0000c70000dc00",
			"4d4de84343de8585f54343de00ae0000c70000dc00",
			"4d4de84343de8585f54343de00ae0000c70000dc00",
			"4d4de84343de8585f54343de00ae0000c70000dc00",

			"00c70000dc0000ae007070ef898995c6c6d4835426",// 00 land
			"00c70000dc0000ae00ffd07f4d4de8ffd07f00c700",// 01 coasts
			"00c70000dc0000ae00ffd07f4d4de8ffd07f00c700",
			"ffd07f00ae0000c70000dc004343de7070ef00c700",// 03
			"4d4de87070ef00c70000dc0000ae00ffd07f7070ef",
			"4d4de87070ef00c70000dc0000ae00ffd07f00c700",// 05
			"00c70000dc00ffd07f00ae004d4de84343de00c700",
			"ffd07f00ae0000c70000dc004343de7070ef4d4de8",// 07
			"4d4de87070ef4343de00c70000dc0000ae00ffd07f",
			"4d4de87070ef4343de00c70000dc00ffd07f00ae00",// 09
			"4d4de87070ef00c70000dc0000ae00ffd07f4343de",// 0A
			"ffd07f00ae0000c7004343de00dc004d4de87070ef",// 0B
			"4d4de87070ef4343de00c70000dc0000ae00ffd07f",// 0C
			"ffd07f00c70000dc0000ae004d4de84d4de87070ef",// 0D
			"4d4de87070ef00ae0000c70000dc00ffd07f7070ef",
			"4d4de87070efffd07f4343de00ae0000c70000dc00"
		][this.type||0]
		let px=[]
		let P=[
				"IRJRQJRRQJRRQJRQRI",// water
				"IJIKIIIIJIKIJIIIIK",// riff1
				"IZIaaKIIIIIZKaaIII",// riff2
				"IZIaeKIIIfIZKagIII",// riff3
				"IRJZQK[SQZRRQJ[QR[",
				"IRJZQK[SQZRRQJ[QR[",
				"IRJZQK[SQZRRQJ[QR[",
				"IRJZQK[SQZRRQJ[QR[",
				"IRJZQK[SQZRRQJ[QR[",
				"IRJZQK[SQZRRQJ[QR[",

				"IJYIIIKQIIIQQYIIII",// 00 land
				"QIcIIlIJaJIcYYlIIa",// 01 coasts
				"IIJQIIIQIIKQY\\Kded",
				"Q[\\M[[Yc[Q[cNZZY[[",// 03
				"IJI[[[c[c[c[k[[[\\[",
				"IJI[[Ic[K[cKk[s[\\s",// 05
				"IQYQIYIIYIJ\\aak[[n",
				"Q[\\M[[Yc[Q[cNZZII",
				"IJIKddaldqdlgedgdd",
				"IJIKdIidLalL~dtfet",// 09
				"IJIc[I[[K[\\MkkNvvO",
				"Q[KL[MY]qY[KWkrvIt",
				"IJIKddaldqdlzffI",
				"QSLQbiaRJM\\JQRJYRJ",
				"IJIKd\\dldldlcscvNv",
				"IZIlvO{vNq~^jvMI[L"
			][this.type||0].replace(/./g,a=>{
			let z=a.charCodeAt()
			px.push(z&7)
			px.push((z>>3)&7)
		})
		let W=6
		let H=6
		for(let j=0;j<H;j++){
			for(let i=0;i<W;i++){
				if(px[j*W+i]){
					gameContext.fillStyle="#"+C.substr(6*(px[j*W+i]-1),6)
					gameContext.fillRect(this.getX() + i*this.width/6, this.getY() + j*this.width/6, this.width/6, this.width/6)
				}
			}
		}

		gameContext.globalAlpha = 1;
	}

	getColor() {
		return [
			"#0078d7", "#00cc00", "#00ff00",
			"#999900", "#66cc33", "#ccffcc", "#ddffdd", "#ffffff",
			"#0088ee", "#00aaee", "#00bbff", "#00ddff", "#00ffff"
		][this.type];
	}

}
