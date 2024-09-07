class Unit {
	
	constructor(x, y, type) {
		this.x = x;
		this.y = y;
		this.type = type;
		this.overlay = UnitType.EMPTY;

		this.origin = 0;// flag color
		this.transitionX = 0;
		this.transitionY = 0;
		this.selection = 0;// only for player (player marked with green contour)
		//this.apple = 0;
		//this.enemy = 0;
		//this.dungeon = 0;
	}
	
}
