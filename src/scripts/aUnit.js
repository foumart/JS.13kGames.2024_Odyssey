class Unit extends Tile {

	constructor(x, y, type) {
		super(x, y, type);
	}

	getColor() {
		return ["#000000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#ff00ff", "#ffff00"][this.type];
	}

	resize(offsetX, offsetY) {
		this._offsetX = offsetX;
		this._offsetY = offsetY;
		super.resize();
		//this.draw();
	}
	
	draw() {
		gameContext.beginPath();
		gameContext.fillStyle = this.getColor();
		gameContext.arc(
			offsetX/2 + (this.x - this._offsetX + 0.5) * this.width / boardScale / tween.transition,
			offsetY/2 + (this.y - this._offsetY + 0.5) * this.height / boardScale / tween.transition / tilt,
			this.width/2,
			0, 7
		);
		gameContext.fill();
		gameContext.closePath();
	}
}
