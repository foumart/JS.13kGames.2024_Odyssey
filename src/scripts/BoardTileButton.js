class BoardButton extends BoardTile {
	
	constructor(x, y, type) {
		super(x, y, type);
		this.btn = document.createElement("div");
		this.btn.x = x + screenOut/2;
		this.btn.y = y + screenOut/2;
		gameContainer.append(this.btn);
	}

	getOffsetX() {
		return - ((this.width*screenWidth/2) - (this.width*screenWidth/2) / boardScale / boardZoom)
	}
	
	getOffsetY() {
		return - ((this.height*screenWidth/2) - (this.height*screenWidth/2) / boardScale / boardZoom)
	}

	draw() {
		if (this.btn) {
			this.btn.style = `width:${
				this.width
			}px;height:${
				this.height
			}px;top:${
				this.getY()
			}px;left:${
				this.getX()
			}px;pointer-events:auto`;
		}
	}
}