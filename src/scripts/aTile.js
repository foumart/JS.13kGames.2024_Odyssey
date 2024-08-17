class Tile extends GameElement {
	
	constructor(x, y, type) {
		super();
		
		this.x = x;
		this.y = y;
		this.type = type;
	}

	getOffsetX() {
		return (portrait ? - offsetX/2 : offsetX/2) - this.width*screenOffset/2 + super.getOffsetX();
	}
	
	getOffsetY() {
		return (portrait ? offsetY/2 : -offsetY/2) - this.height*screenOffset/2 + super.getOffsetY();
	}

	getX() {
		return this.getOffsetX() + this.x * this.width;
	}

	getY() {
		return this.getOffsetY() + this.y * this.height;
	}

	update(type, offsetX, offsetY) {
		this._offsetX = offsetX;// used by units
		this._offsetY = offsetY;
		this.type = type;
		this.resize();
	}

	resize() {
		super.resize();
		this.draw();
	}

	draw() {
		gameContext.fillStyle = this.getColor();
		gameContext.beginPath();
		gameContext.fillRect(
			this.getX(),
			this.getY(),
			this.width,
			this.height
		);
		gameContext.closePath();
	}

	getColor() {
		return ["#0078d7", "#00cc00", "#000099", "#999900", "#990099", "#009999", "#990000"][this.type];
	}

}
