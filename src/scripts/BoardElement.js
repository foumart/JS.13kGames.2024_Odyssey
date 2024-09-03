class BoardElement {

	constructor() {
		this.resize();
	}

	resize() {
		this.elementSize = portrait ? gameCanvas.width / screenWidth : gameCanvas.height / screenWidth;
		this.width = this.elementSize * boardScale * tween.zoom;
		this.height = this.elementSize * boardScale * tilt * tween.zoom;
	}

}
