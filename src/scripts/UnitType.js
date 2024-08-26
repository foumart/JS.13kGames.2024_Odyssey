class UnitType {
	static get EMPTY() {
		return 0;
	}
	static get PLAYER() {
		return 1;
	}
	static get SHIPUP() {
		return 2;
	}
	static get SHIPLEFT() {
		return 3;
	}
	static get SHIPRIGHT() {
		return 4;
	}
	static get ENEMY1() {
		return 5;
	}
	static get ENEMY2() {
		return 6;
	}
	static get ENEMY3() {
		return 7;
	}
	static get ENEMY4() {
		return 8;
	}
	static get ENEMY5() {
		return 9;
	}

	/*static get class(){
		return [Grunt, Jumpship, Tank, Hunter, Drone, Raptor, Dreadnought, Commandunit, Obstacle, Destructable];
	}*/
	/*static getClass(id){
		if(!id) return this.class;
		return this.class[id-1];
	}*/

	/*static get names(){
		return ["Grunt", "Jumpship", "Tank", "Hunter", "Drone", "Raptor", "Dreadnought", "Commandunit", "Obstacle", "Destructable"];
	}*/
	/*static getUnitName(id){
		if(!id) return this.names;
		return this.names[id-1];
	}*/

	// default unit stats
	// these could be overriden in StageData
	// individually for each unit, example: {x:2, y:2, class:Jumpship, health:6, damage:5}
	/*static get health(){
		return [, 5, 4, 3, 2, 3, 5, 5, 1, 1];
	}*/
	/*static getUnitHealth(id){
		return this.health[id-1];
	}*/
	
	/*static get damage(){
		return [1, 2, 2, 2, 1, 2, 2, 0, 0, 0];
	}*/
	/*static getUnitDamage(id){
		return this.damage[id-1];
	}*/

	/*static get ranged(){
		return [true, false, true, true, true, true, false, false, undefined, undefined];
	}*/
	/*static isUnitRanged(id){
		return this.ranged[id-1];
	}*/

	static get enemy(){
		return [false, false, false, false, true, true, true, true, true, true];
	}
	static isUnitEnemy(id){
		return this.enemy[id-1];
	}

	/*static get playerRange(){
		for(let i = 0; i < this.enemy.length; i++){
			if(this.enemy[i]) return i;
		}
	}*/
}