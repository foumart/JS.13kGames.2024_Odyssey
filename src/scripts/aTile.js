class Tile extends GameElement {
	
	constructor(x, y, type) {
		super();
		
		this.x = x;
		this.y = y;
		this.type = type;
	}

	getOffsetX() {
		return (gameCanvas.width - gameCanvas.width * boardScale * tween.transition) / 2;
	}
	
	getOffsetY() {
		return (gameCanvas.height - gameCanvas.height * boardScale * tween.transition) / 2;
	}

	getX() {
		return this.getOffsetX() + this.x * this.width;
	}

	getY() {
		return this.getOffsetY() + this.y * this.height;
	}

	update(type) {
		this.type = type;
		this.resize();
	}

	resize() {
		super.resize();
		this.draw();
	}

	draw() {
		gameContext.fillStyle = this.getColor();
		gameContext.beginPath();
		gameContext.fillRect(
			this.getX(),
			this.getY(),
			this.width,
			this.height
		);
		gameContext.closePath();
	}

	getColor() {
		return ["#0033cc", "#009900", "#000099", "#999900", "#990099", "#009999", "#990000"][this.type];
	}

}
