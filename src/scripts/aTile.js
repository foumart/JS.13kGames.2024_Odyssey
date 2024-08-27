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
			"4d4de84343deeb9753544434898995c6c6d4835426",
			"2db22d32db323d963d7070ef898995c6c6d4835426",
			"2db22d32db323d963d7070ef898995c6c6d4835426",
			"2db22d32db323d963d7070ef898995c6c6d4835426",
			"4d4de88585f54343de7070ef898995c6c6d4835426",
			"4d4de87070ef4343de7070ef898995c6c6d4835426",
			"2db22d32db323d963d7070ef898995c6c6d4835426",
			"2db22d32db323d963d7070ef898995c6c6d4835426",
			"4d4de88585f54343de7070ef898995c6c6d4835426",// 08 riff1
			"4d4de87070ef4343de7070ef2db22d32db3293791f",// 09 riff2
			"4d4de88585f54343de7070ef3d963d93791f2db22d",// 10 riff3
			"2db22d32db323d963d93791f4d4de893791f2db22d",// 01 coasts
			"2db22d32db323d963d93791f4d4de893791f2db22d",
			"93791f3d963d2db22d32db324343de7070ef2db22d",// 03
			"4d4de87070ef2db22d32db323d963d93791f7070ef",
			"4d4de87070ef2db22d32db323d963d93791f2db22d",// 05
			"2db22d32db3293791f3d963d4d4de84343de2db22d",
			"93791f3d963d2db22d32db324343de7070ef4d4de8",
			"4d4de87070ef4343de2db22d32db323d963d93791f",
			"4d4de87070ef4343de2db22d32db3293791f3d963d",// 09 coasts
			"4d4de87070ef2db22d32db323d963d93791f4343de",
			"93791f3d963d2db22d4343de32db324d4de87070ef",
			"4d4de87070ef4343de2db22d32db323d963d93791f",
			"93791f2db22d32db323d963d4d4de84d4de87070ef",
			"4d4de87070ef3d963d2db22d32db3293791f7070ef",
			"4d4de87070ef93791f4343de3d963d2db22d32db32"
		][this.type||0]
		let px=[]
		let P=[
				"IRJRQJRRQJRRQJRQRI",
				"IJYIIIKQIIIQQYIIII",
				"IJYIIIKQIIIQQYIIII",
				"IJYIIIKQIIIQQYIIII",
				"IZIaaKIIIIIZKaaIII",
				"IJIKIIIIJIKIJIIIIK",
				"IJYIIIKQIIIQQYIIII",
				"IJYIIIKQIIIQQYIIII",
				"IZIaaKIIIIIZKaaIII",// riff1
				"IJIKIIIIJIKIJIIIIK",// riff2
				"IZIaeKIIIfIZKagIII",// riff3
				"QIcIIlIJaJIcYYlIIa",// 01 coasts
				"IIJQIIIQIIKQY\\Kded",
				"Q[\\M[[Yc[Q[cNZZY[[",// 03
				"IJI[[[c[c[c[k[[[\\[",
				"IJI[[Ic[K[cKk[s[\\s",// 05
				"IQYQIYIIYIJ\\aak[[n",
				"Q[\\M[[Yc[Q[cNZZII",
				"IJIKddaldqdlgedgdd",
				"IJIKdIidLalL~dtfet",// 09 coasts
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
