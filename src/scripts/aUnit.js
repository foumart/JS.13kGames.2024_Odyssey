class BoardUnit extends BoardTile {

	constructor(x, y, type) {
		super(x, y, type);
		this.colors = ["lime","red","yellow","white","magenta"];
	}

	shouldAnimate() {
		return this.type == 1 && onFoot ||
			this.type > UnitType.PLAYER && this.type < UnitType.ENEMY1 && !onFoot;
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
			let _offsets = [2,2,2,3,1,4];
			let _offsetX = this.player
				? _offsets[unitsData[playerY][playerX]]
				: this.ship ? _offsets[unitsData[shipY][shipX]] : 1;

			let _offsetY = this.player || this.ship ? 3 : 4;

			// draw a wide colored rectangle behind unit as a selection
			if (this.selection) {
				gameContext.fillStyle = this.colors[this.selection-1];
				this.fillRect(-2, -3, unitWidth+2, unitWidth-2);
			}

			// draw animated colored flag
			if (this.origin && this.type>1 || this.overlay) {
				// draw flag base
				gameContext.fillStyle = "#835426";
				this.fillRect(_offsetX, _offsetY, 1, 2);
				// animate flag
				gameContext.fillStyle = this.colors[this.origin];
				this.fillRect(_offsetX, _offsetY + 1, (2 + (step / 7 | 0) % 2));
				this.fillRect(_offsetX + 1, _offsetY, (1 + (step / 5 | 0) % 2));
			}

			this.drawImage(this.type);

			//gameContext.globalAlpha = 1;
		}
	}

	fillRect(_x = 1, _y = 1, _w = 1, _h = 1) {
		gameContext.fillRect(
			this.getX() - this.width/2 + this.width/tileWidth*_x,
			this.getY() - this.height - this.width/tileWidth*_y,
			this.width/tileWidth*_w,
			this.width/tileWidth*_h
		);
	}

	drawImage(_type) {
		gameContext.drawImage(
			offscreenBitmaps[_type-1], 0, 0, unitWidth, unitWidth,
			this.getX() - this.width/2 - this.width/tileWidth,
			this.getY() - this.height - this.width/tileWidth * (this.type > 9 ? 2 : 1),
			this.width/tileWidth*unitWidth,
			this.width/tileWidth*unitWidth
		);
	}
}
