class Player extends Unit {
	
	constructor(x, y, type) {
		super(x, y, type);
		this.overlay = UnitType.EMPTY;
		this.origin = 1;
	}

}
