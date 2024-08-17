class Button extends Tile {
	
	constructor(x, y, type) {
		super(x, y, type);
		this.btn = document.createElement("div");
		this.btn.x = x;
		this.btn.y = y;
		gameContainer.append(this.btn);
	}

	getOffsetX() {
		return GameElement.prototype.getOffsetX.call(this);
	}
	
	getOffsetY() {
		return GameElement.prototype.getOffsetY.call(this);
	}

	draw() {
		if (this.btn) {
			this.btn.style = (_debug?'border:1px dashed black;box-sizing:content-box;':'')+`width:${
				this.width
			}px;height:${
				this.height
			}px;top:${
				this.getY()// + (this.height * screenWidth/2) - (this.height * screenWidth/2) * boardScale * tween.transition
			}px;left:${
				this.getX()// + (this.width * screenWidth/2) - (this.width * screenWidth/2) * boardScale * tween.transition
			}px;${
				this.type ? 'cursor:pointer;pointer-events:auto' : ''
			}`;
		}
	}
}