class BoardUnit extends BoardTile {

	constructor(x, y, type) {
		super(x, y, type);
	}

	shouldAnimate() {
		return this.type < UnitType.SHIPUP && onFoot ||
			this.type > UnitType.PLAYER && this.type < UnitType.SQUID && !onFoot;
	}

	isEnemyMovingX() {
		return (this.type > UnitType.SQUID && this.type < UnitType.CASTLE ? this.movingX : 0) * this.width *
			((tween.transitionZ || Math.abs(tween.transitionX) || Math.abs(tween.transitionY))-1);
	}

	isEnemyMovingY() {
		return (this.type > UnitType.SERPENT && this.type < UnitType.CASTLE ? this.movingY : 0) * this.width *
			((tween.transitionZ || Math.abs(tween.transitionX) || Math.abs(tween.transitionY))-1);
	}

	getX(reverse, enemy) {
		return (reverse ? this.width * tween.transitionX : 0) + this.width/2 + super.getX()
			- (this.shouldAnimate() ? tween.transitionX * this.width : 0)
			- (enemy ? 0 : this.isEnemyMovingX());
	}

	getY(reverse, enemy) {
		return (reverse ? this.height * tween.transitionY : 0) + this.height/2 + super.getY()
			- (this.shouldAnimate() ? tween.transitionY * this.height : 0)
			- (enemy ? 0 : this.isEnemyMovingY());
	}

	reset() {
		super.reset();
		this.movingX = 0;
		this.movingY = 0;
	}

	draw() {
		if (this.type) {
			let _offsets = [2,2,2,3,4,1];
			let _offsetX = this == boardPlayer && !this.overlay
				? _offsets[unitsData[playerY][playerX]-1]
				: this == boardShip ? _offsets[unitsData[shipY][shipX]-1] : 1;

			let _offsetY = this == boardPlayer && !this.overlay || this == boardShip ? 3 : 4;

			// draw the object beneath this unit
			if (this.overlay) {
				this.drawImage(this.overlay, this == boardPlayer || this == boardShip, this.movingX || this.movingY);
				_offsetX += this != boardPlayer && this != boardShip ? 0 : tileWidth * tween.transitionX;
				_offsetY -= this != boardPlayer && this != boardShip ? 0 : tileWidth * tween.transitionY;
			}

			// draw animated colored flag
			if (this.origin && (
					this.type == UnitType.SHRINE ||
					this.type > UnitType.PLAYERRIGHT &&
					this.type < UnitType.SQUID
				) || this.type == UnitType.CASTLE || this.overlay == UnitType.CASTLE
			) {
				// draw flag base
				gameContext.fillStyle = "#840";
				this.fillRect(_offsetX, _offsetY, 1, 2);
				// animate flag
				gameContext.fillStyle = colors[this.origin||1];
				this.fillRect(_offsetX, _offsetY + 1, (2 + (step / 7 | 0) % 2));
				this.fillRect(_offsetX + 1, _offsetY + .1, (1 + (step / 5 | 0) % 2));
			}

			this.drawImage(this.type);

			// draw apple on trees
			if (this.type == UnitType.TREE && this.apple) {
				gameContext.fillStyle = "#f92";
				this.fillRect(_offsetX+2, _offsetY - 4, 2, 2);
				gameContext.fillStyle = "#fe6";
				this.fillRect(_offsetX+2, _offsetY - 4, 1, 1);
			}

			// draw shine on gold
			if (
				(this.type == UnitType.GOLD || this.type == UnitType.WRECK) &&
				(step / 9 | 0) % 6
			) {
				gameContext.fillStyle = "#fff" + (3 + ((step / 9 | 0) % 6));
				this.fillRect(_offsetX , _offsetY + 9 - this.type, 3, 1);
				this.fillRect(_offsetX  + 1, _offsetY + 10 - this.type, 1, 3);
			}
		}
	}

	fillRect(_x = 1, _y = 1, _w = 1, _h = 1) {
		gameContext.fillRect(
			this.getX(0, this.movingX) - this.width/2 + this.width/tileWidth*_x,
			this.getY(0, this.movingY) - this.height - this.width/tileWidth*_y,
			this.width/tileWidth*_w,
			this.width/tileWidth*_h
		);
	}

	drawImage(_type, underlay, enemy) {
		gameContext.drawImage(
			(
				this.type == UnitType.PLAYERRIGHT ||
				this.type == UnitType.SHIPRIGHT ||
				this.type == UnitType.SHIPDOWN
			) && !underlay ? offscreenBitmapsFlipped[_type-2] : offscreenBitmaps[_type-1],

			0, 0, unitWidth, unitWidth,
			this.getX(underlay, enemy) - this.width/2 - this.width/tileWidth * (
				(_type == UnitType.SERPENT || _type == UnitType.CRAB) && ((step + this.y * 9) / 50 | 0) % 2
					? 2 : 1
			),
			this.getY(underlay, enemy) - this.height - this.width/tileWidth * (
				_type == UnitType.SQUID || _type == UnitType.WRECK
					? ((step + this.y * 9) / 70 | 0) % 2 ? 0 : -1
					: _type > UnitType.CRAB ? 2 : 1
			),
			this.width/tileWidth*unitWidth,
			this.width/tileWidth*unitWidth
		);
	}
}
