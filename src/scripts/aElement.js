class GameElement {

	constructor() {
		this.resize();
	}

	resize() {
		this.elementSize = gameCanvas.width / screenWidth;
		this.width = this.elementSize * boardScale * tween.transition;
		this.height = this.elementSize * boardScale * tilt * tween.transition;
	}
}
