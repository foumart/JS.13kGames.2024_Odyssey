class Button extends Tile {
	
	constructor(x, y, type) {
		super(x, y, type);
		this.btn = document.createElement("div");
		this.btn.x = x;
		this.btn.y = y;
		gameContainer.append(this.btn);
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
			}px;${
				this.type ? 'cursor:pointer;pointer-events:auto' : ''
			}`;
		}
	}
}