class GameElement {

	constructor() {
		this.resize();
	}

	resize() {
		this.elementSize = portrait ? gameCanvas.width / screenWidth : gameCanvas.height / screenWidth;
		this.width = this.elementSize * boardScale * tween.transition;
		this.height = this.elementSize * boardScale * tilt * tween.transition;
	}

	getOffsetX() {
		return - ((this.width*screenWidth/2) - (this.width*screenWidth/2) / boardScale / tween.transition);
	}
	
	getOffsetY() {
		return - ((this.height*screenWidth/2) - (this.height*screenWidth/2) / boardScale / tween.transition);
	}
}
