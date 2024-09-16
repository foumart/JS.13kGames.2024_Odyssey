class BoardTile extends BoardElement {
	
	constructor(x, y, type) {
		super();
		
		this.x = x;
		this.y = y;
		this.type = type;
	}

	getOffsetX() {
		return (portrait ? - screenOffsetX : screenOffsetX) - this.width*screenOut/2 -
			((this.width*screenWidth/2) - (this.width*screenWidth/2) / boardScale / boardZoom);
	}
	
	getOffsetY() {
		return (portrait ? screenOffsetY : -screenOffsetY) - this.height*screenOut/2 -
			((this.height*screenWidth/2) - (this.height*screenWidth/2) / boardScale / boardZoom);
	}

	getX() {
		return this.getOffsetX() + this.x * this.width + tween.transitionX * this.width;
	}

	getY() {
		return this.getOffsetY() + this.y * this.height + tween.transitionY * this.height;
	}

	update(type) {
		this.type = type;
		this.resize();
	}

	reset() {
		// Variables assigned from the corresponding game unit on previous move.
		// When performing next move all board elements are reset and new data is assigned.
		this.overlay = 0;
		this.origin = 0;
		this.visited = 0;
	}

	resize() {
		super.resize();
		this.draw();
	}

	draw() {
		let mirrored = [7,11,12,16].indexOf(this.type) > -1;
		bgrContext.drawImage(
			(mirrored ? offscreenBitmapsFlipped : offscreenBitmaps)[
				!state || this.visited ? (this.type || 0) + (mirrored ? 14 : 16) : 15
			],
			0, 0, tileWidth, tileWidth,
			this.getX(),
			this.getY(),
			this.width,
			this.width
		);
	}

	drawOverlay() {
		if (this.visited < 2) {
			gameContext.globalAlpha = this.visited || !state ? 0.5 : 1;
			let odd = this.realX % 2 && this.realY % 2 || this.realX % 2 == 0 && this.realY % 2 == 0;
			// use flipped cloud images every second tile
			gameContext.drawImage(
				odd ? offscreenBitmapsFlipped[15] : offscreenBitmaps[15], 0, 0, tileWidth+2, tileWidth+2,
				this.getX() - this.width/6,
				this.getY() - this.width/2,
				this.width + this.width/3,
				this.width + this.width/3
			);
			gameContext.globalAlpha = 1;
		}
	}
}
