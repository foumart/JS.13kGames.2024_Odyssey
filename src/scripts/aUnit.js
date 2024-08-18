class BoardUnit extends BoardTile {

	constructor(x, y, type) {
		super(x, y, type);
	}

	getX() {
		return this.width/2 + super.getX();
	}

	getY() {
		return this.width/2 + super.getY();
	}
	
	draw() {
		if (this.type) {
			gameContext.beginPath();
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
			);
		}
	}

	getColor() {
		return ["#00cc00", "#ff3300", "#ff6600", "#ff9900", "#ffff00", "#ff00ff", "#ff00ff", "#ff00ff"][this.type];
	}
}
