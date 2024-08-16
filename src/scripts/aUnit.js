class Unit extends Tile {

	constructor(x, y, type) {
		super(x, y, type);
	}

	getColor() {
		return ["#000000", "#008800", "#000088", "#888800", "#880088", "#ff00ff", "#ffff00"][this.type];
	}
}
