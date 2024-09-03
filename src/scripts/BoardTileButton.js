class BoardButton extends BoardTile {
	
	constructor(x, y, type) {
		super(x, y, type);
		this.btn = document.createElement("div");
		//this.btn.className = "css_uibtn";
		this.btn.x = x + screenOut/2;
		this.btn.y = y + screenOut/2;
		gameContainer.append(this.btn);
	}

	getOffsetX() {
		return - ((this.width*screenWidth/2) - (this.width*screenWidth/2) / boardScale / tween.zoom)
	}
	
	getOffsetY() {
		return - ((this.height*screenWidth/2) - (this.height*screenWidth/2) / boardScale / tween.zoom)
	}

	draw() {
		if (this.btn) {
			this.btn.style = (_debug&&false?'opacity:1;border:1px dashed rgba(255,255,255,0.5);box-sizing:content-box;':'')+`width:${
				this.width
			}px;height:${
				this.height
			}px;top:${
				this.getY()
			}px;left:${
				this.getX()
			}px;cursor:pointer;pointer-events:auto`;
		}
	}
}