class BoardUnit extends BoardTile {

	constructor(x, y, type) {
		super(x, y, type);
		this.colors = ["lime","red","gold","white","magenta"];
	}

	shouldAnimate() {
		return this.type == 1 && onFoot ||
			this.type > 1 && this.type < 5 && !onFoot;
			//this.type == UnitType.CASTLE;
	}

	getX() {
		return this.width/2 + super.getX() - (this.shouldAnimate() ? tween.transitionX * this.width : 0);
	}

	getY() {
		return this.width/2 + super.getY() - (this.shouldAnimate() ? tween.transitionY * this.height : 0);
	}
	
	draw() {
		if (this.type) {
			//gameContext.globalAlpha = (screenOut - this._alpha) / screenOut;

			if (this.overlay) {
				this.drawImage(this.overlay);
			}

			// draw a wide colored rectangle behind unit as a selection
			if (this.selection) {
				gameContext.fillStyle = this.colors[this.selection-1];
				gameContext.fillRect(
					this.getX() - this.width/2 - this.width/tileWidth*2,
					this.getY() - this.height - this.width/tileWidth,
					this.width/tileWidth*(unitWidth+2),
					this.width/tileWidth*(unitWidth+2)
				);
			}

			// draw animated colored flag
			if (this.origin && this.type>1 || this.overlay) {
				gameContext.fillStyle = "#835426";
				gameContext.fillRect(
					this.getX() - this.width/2 + this.width/tileWidth,
					this.getY() - this.height - this.width/tileWidth*2,
					this.width/tileWidth,
					this.width/tileWidth*2
				);
				gameContext.fillStyle = this.colors[this.origin];
				gameContext.fillRect(
					this.getX() - this.width/2 + this.width/tileWidth,
					this.getY() - this.height - this.width/tileWidth*3,
					this.width/tileWidth*(2 + (step / 7 | 0) % 2),
					this.width/tileWidth
				);
				gameContext.fillRect(
					this.getX() - this.width/2 + this.width/tileWidth*2,
					this.getY() - this.height - this.width/tileWidth*2,
					this.width/tileWidth*(1 + (step / 5 | 0) % 2),
					this.width/tileWidth
				);
			}

			this.drawImage(this.type);

			//gameContext.globalAlpha = 1;
		}
	}

	drawImage(_type) {
		gameContext.drawImage(
			offscreenBitmaps[_type-1], 0, 0, unitWidth, unitWidth,
			this.getX() - this.width/2 - this.width/tileWidth,
			this.getY() - this.height,
			this.width/tileWidth*unitWidth,
			this.width/tileWidth*unitWidth
		);
	}
}
