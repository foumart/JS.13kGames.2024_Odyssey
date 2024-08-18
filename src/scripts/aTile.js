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
		gameContext.fillStyle = this.getColor();
		gameContext.globalAlpha = (screenOut - this._alpha) / screenOut;
		gameContext.beginPath();
		gameContext.fillRect(
			this.getX(),
			this.getY(),
			this.width,
			this.height
		);
		gameContext.closePath();
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
