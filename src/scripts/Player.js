class Player extends Unit {
	
	constructor(x, y, type) {
		super(x, y, type);
		this.onFoot = true;
		this.overlay = UnitType.EMPTY;
		//this.boarding = false;
		//this.landing = false;
	}

}
