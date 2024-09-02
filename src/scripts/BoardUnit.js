class BoardUnit extends BoardTile {

	constructor(x, y, type) {
		super(x, y, type);
	}

	shouldAnimate() {
		return this.type == 1 && onFoot ||
			this.type > UnitType.PLAYER && this.type < UnitType.ENEMY1 && !onFoot;
	}

	isEnemyMovingX() {
		return this.type == UnitType.ENEMY2 || this.type == UnitType.ENEMY3 ? this.movingX : 0;
	}

	isEnemyMovingY() {
		return this.type == UnitType.ENEMY1 || this.type == UnitType.ENEMY3 ? this.movingY : 0;
	}

	getX(reverse) {
		return (reverse ? this.width * tween.transitionX : 0) + this.width/2 + super.getX()
			- (this.shouldAnimate() ? tween.transitionX * this.width : 0)
			- (this.isEnemyMovingX() * ((tween.transitionZ || Math.abs(tween.transitionX) || Math.abs(tween.transitionY))-1) * this.width);
	}

	getY(reverse) {
		return (reverse ? this.height * tween.transitionY : 0) + this.height/2 + super.getY()
			- (this.shouldAnimate() ? tween.transitionY * this.height : 0)
			- (this.isEnemyMovingY() * ((tween.transitionZ || Math.abs(tween.transitionX) || Math.abs(tween.transitionY))-1) * this.height);
	}

	reset() {
		super.reset();
		this.movingX = 0;
		this.movingY = 0;
	}

	draw() {
		if (this.type) {
			//gameContext.globalAlpha = (screenOut - this._alpha) / screenOut;

			let _offsets = [2,2,2,3,1,4];
			let _offsetX = this == boardPlayer && !this.overlay
				? _offsets[unitsData[playerY][playerX]-1]
				: this == boardShip ? _offsets[unitsData[shipY][shipX]-1] : 1;

			let _offsetY = this == boardPlayer && !this.overlay
				|| this == boardShip ? 3 : 4;

			// draw the object beneath this unit
			if (this.overlay) {
				this.drawImage(this.overlay, true);
				_offsetX += tileWidth * tween.transitionX;
				_offsetY -= tileWidth * tween.transitionY;
			}

			// draw a wide colored rectangle behind unit as a selection
			if (this.selection) {
				gameContext.fillStyle = colors[this.selection-1];
				this.fillRect(-2, -3, unitWidth+2, unitWidth-2);
			}

			// draw animated colored flag
			if (this.origin && (this.type > UnitType.PLAYER && this.type < UnitType.ENEMY1) || this.type == UnitType.CASTLE || this.overlay == UnitType.CASTLE) {
				// draw flag base
				gameContext.fillStyle = "#864404";
				this.fillRect(_offsetX, _offsetY, 1, 2);
				// animate flag
				gameContext.fillStyle = colors[this.origin||1];
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

	drawImage(_type, reverse) {
		gameContext.drawImage(
			offscreenBitmaps[_type-1], 0, 0, unitWidth, unitWidth,
			this.getX(reverse) - this.width/2 - this.width/tileWidth * (_type == UnitType.ENEMY2 && ((step+this.y*9)/50|0)%2 ? 2 : 1),
			this.getY(reverse) - this.height - this.width/tileWidth * (_type > UnitType.SHIPRIGHT ? _type==UnitType.ENEMY1 || _type==UnitType.WRECK ? ((step+this.y*9)/70|0)%2 ? 0 : -1 : 2 : 1),
			this.width/tileWidth*unitWidth,
			this.width/tileWidth*unitWidth
		);
	}
}
