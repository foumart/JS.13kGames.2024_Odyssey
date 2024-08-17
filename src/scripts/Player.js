class Player extends Unit {
	
	constructor(x, y) {
		super(x, y, 6);
	}

	draw() {
		super.draw();
		gameContext.fillStyle = "#333";
		gameContext.beginPath();
		gameContext.fillRect(
			2 + offsetX/2 + (this.x - this._offsetX +.5) * this.width / boardScale / tween.transition,
			-5 + offsetY/2 + (this.y - this._offsetY +.5) * this.height / boardScale / tween.transition,
			10 * boardScale * tween.transition, 10 * boardScale * tween.transition
		);
		gameContext.fillRect(
			-12 + offsetX/2 + (this.x - this._offsetX +.5) * this.width / boardScale / tween.transition,
			-5 + offsetY/2 + (this.y - this._offsetY +.5) * this.height / boardScale / tween.transition,
			10 * boardScale * tween.transition, 10 * boardScale * tween.transition
		);
		gameContext.closePath();
	}
	
}
