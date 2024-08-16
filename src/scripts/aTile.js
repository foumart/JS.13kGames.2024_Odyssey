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
		return this.getOffsetX() + (this.x - playerX + screenSide) * this.width;
	}

	getY() {
		return this.getOffsetY() + (this.y - playerY + screenSide) * this.height;
	}

	resize() {
		super.resize();
		this.draw();
	}

	draw() {
		gameContext.fillStyle = this.getColor();
		gameContext.fillRect(
			this.getX(),
			this.getY(),
			this.width,
			this.height
		);
	}

	getColor() {
		return ["#0033cc", "#00cc00", "#0000ff", "#ffff00", "#ff00ff", "#ff00ff"][this.type];
	}

}
