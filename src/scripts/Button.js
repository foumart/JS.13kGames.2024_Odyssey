class Button extends Tile {
	
	constructor(x, y, z) {
		super(x, y, z);
		this.btn = document.createElement("div");
		this.btn.x = x;
		this.btn.y = y;
		gameContainer.append(this.btn);
	}

	draw() {
		if (this.btn) this.btn.style = `width:${
			this.width
		}px;height:${
			this.height
		}px;top:${
			this.getY()
		}px;left:${
			this.getX()
		}px;${
			'cursor:pointer;pointer-events:auto'
		}`;
	}
}