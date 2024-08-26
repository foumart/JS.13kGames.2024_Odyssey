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
		return this.getOffsetX() + this.x * this.width;
	}

	getY() {
		return this.getOffsetY() + this.y * this.height;
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
			"4d4de84343deeb9753544434898995c6c6d4835426",
			"4d4de84343deeb9753544434898995c6c6d4835426",
			"4d4de84343deeb9753544434898995c6c6d4835426",
			"4d4de84343deeb9753544434898995c6c6d4835426",
			"4d4de84343deeb9753544434898995c6c6d4835426",
			"4d4de84343deeb9753544434898995c6c6d4835426",
			"4d4de84343deeb9753544434898995c6c6d4835426",
			"4d4de84343deeb9753544434898995c6c6d4835426",
			"4d4de84343deeb9753544434898995c6c6d4835426",
			"4d4de84343deeb9753544434898995c6c6d4835426",
			"4d4de84343deeb9753544434898995c6c6d4835426",
			"4d4de84343deeb9753544434898995c6c6d4835426"
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
				"IRJRQJRRQJRRQJRQRI",
				"IRJRQJRRQJRRQJRQRI",
				"IRJRQJRRQJRRQJRQRI",
				"IRJRQJRRQJRRQJRQRI",
				"IRJRQJRRQJRRQJRQRI",
				"IRJRQJRRQJRRQJRQRI",
				"IRJRQJRRQJRRQJRQRI",
				"IRJRQJRRQJRRQJRQRI",
				"IRJRQJRRQJRRQJRQRI",
				"IRJRQJRRQJRRQJRQRI",
				"IRJRQJRRQJRRQJRQRI",
				"IRJRQJRRQJRRQJRQRI"
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
