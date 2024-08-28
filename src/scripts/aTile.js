class BoardTile extends GameElement {
	
	constructor(x, y, type) {
		super();
		
		this.x = x;
		this.y = y;
		this.type = type;
	}

	getOffsetX() {
		return (portrait ? - screenOffsetX : screenOffsetX) - this.width*screenOut/2 -
			((this.width*screenWidth/2) - (this.width*screenWidth/2) / boardScale / tween.transition);
	}
	
	getOffsetY() {
		return (portrait ? screenOffsetY : -screenOffsetY) - this.height*screenOut/2 -
			((this.height*screenWidth/2) - (this.height*screenWidth/2) / boardScale / tween.transition);
	}

	getX() {
		return this.getOffsetX() + this.x * this.width + tween.transitionX * this.width;
	}

	getY() {
		return this.getOffsetY() + this.y * this.height + tween.transitionY * this.height;
	}

	update(type, alpha) {
		this.type = type;
		this._alpha = alpha;
		this.resize();
	}

	resize() {
		super.resize();
		this.draw();
	}

	draw() {
		gameContext.globalAlpha = (screenOut - this._alpha) / screenOut;

		gameContext.drawImage(
			offscreenBitmaps[(this.type || 0) + 16], 0, 0, tileWidth, tileWidth,
			this.getX(),
			this.getY(),
			this.width,
			this.width
		);

		gameContext.globalAlpha = 1;
	}
}
