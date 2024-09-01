class BoardElement {

	constructor() {
		this.resize();
	}

	resize() {
		this.elementSize = portrait ? gameCanvas.width / screenWidth : gameCanvas.height / screenWidth;
		this.width = this.elementSize * boardScale * tween.transition;
		this.height = this.elementSize * boardScale * tilt * tween.transition;
	}

}
