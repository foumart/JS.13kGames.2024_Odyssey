class Button extends Tile {
	
	constructor(x, y, type) {
		super(x, y, type);
		this.btn = document.createElement("div");
		this.btn.x = x;
		this.btn.y = y;
		gameContainer.append(this.btn);
	}

	// No offsets for the buttons because they occupy a squared space in the center
	getOffsetX() {
		return 0;
	}

	getOffsetY() {
		return 0;
	}

	draw() {
		if (this.btn) {
			this.btn.style = (_debug?'border:1px dashed black;box-sizing:content-box;':'')+`width:${
				this.width
			}px;height:${
				this.height
			}px;top:${
				this.getY()
			}px;left:${
				this.getX()
			}px;${
				this.type ? 'cursor:pointer;pointer-events:auto' : ''
			}`;
		}
	}
}