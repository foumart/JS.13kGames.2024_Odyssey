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

			/*if (this.overlay) {
				this.drawImage(this.overlay);
			}*/
			//console.log(unitsList, getUnit(playerX, playerY));

			this.drawImage(this.type);

			gameContext.globalAlpha = 1;
		}
	}

	drawImage(_type) {
		gameContext.drawImage(
			offscreenBitmaps[_type-1], 0, 0, unitWidth, unitWidth,
			this.getX() - this.width/2 - this.width/tileWidth,
			this.getY() - this.height,// - (_type == UnitType.TREE && this.x%2==0 ? this.width/tileWidth : 0),
			this.width/tileWidth*unitWidth,
			this.width/tileWidth*unitWidth
		);
	}
}
