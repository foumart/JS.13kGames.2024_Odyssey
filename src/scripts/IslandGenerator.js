class IslandGenerator {
	constructor(_this, width, height, details, resolve) {
		this.main = _this;
		this.type = details.type;
		this.debug = details.debug;
		this.startX = details.startX || 0;
		this.startY = details.startY || 0;
		this.resolve = resolve;
		this.destroyed = false;
		this.offset = 3;
		this.startTime = performance.now();
		this.map = [];

		this.generateIslands(width, height);
	}

	destroy() {
		this.islands = null;
		this.destroyed = true;
	}

	generateIslands(width, height) {
		this.width = width;
		this.height = height;
		
		this.map = this.initArray();
		
		this.posX = this.startX;
		this.posY = this.startY;

		this.relief = this.initArray();

		this.visited = this.initArray();
		this.visited.forEach((row, indexY) => {
			row.forEach((cell, indexX) => {
				this.visited[indexY][indexX] = indexX < 1 || indexY < 1 ||
					indexY >= this.visited.length - 1 || indexX >= this.visited[indexY].length - 1 ? 1 : 0;
			});
		});

		this.islands = [];

		this.id = 0;
		this.choseNextStartLocation();
		this.updateRelief(this.posX, this.posY);
		this.visited[this.posY][this.posX] = 1;
		this.map[this.posY][this.posX] = 1;
		this.islands.push([]);
		this.advanceWithSpace(this.randomizedExpand.bind(this));
	}

	choseNextStartLocation() {
		let attempt = 0;
		while (
			this.checkAjacentIslands(this.startX, this.startY, 3 - (attempt/33|0)) &&
			attempt < 99
		) {
			this.startY = this.rand(this.offset*2, this.height-this.offset*2);
			this.startX = this.rand(this.offset*2, this.width-this.offset*2);
			attempt ++;
			if (attempt == 99) {
				console.warn("start location "+this.startX+"x"+this.startY);
				//if (this.debug.visible) this.debug.highlight(this.posX, this.posY, 4);
			}
		};
		if (this.debug && attempt==99) console.warn("choseNextStartLocation", attempt);

		// add riffs and relief data
		this.updateRelief(this.startX+2, this.startY+2, 5);
		this.updateRelief(this.startX+2, this.startY-2, 5);
		this.updateRelief(this.startX-2, this.startY+2, 5);
		this.updateRelief(this.startX-2, this.startY-2, 5);
		this.updateRelief(this.startX+3, this.startY, 5);
		this.updateRelief(this.startX-3, this.startY, 5);
		this.updateRelief(this.startX, this.startY+3, 5);
		this.updateRelief(this.startX, this.startY-3, 5);

		this.randomizeNextIsland();
	}

	updateRelief(posX, posY, type = 1, inner = -1) {
		// map level topology
		if (posX < 1 || posX > this.width-1 || posY < 1 || posY > this.height-1) return;
		if (inner) this.relief[posY][posX] ++;
		if (this.debug && this.debug.visible) {
			if (this.debug.feedback) {
				type = this.debug.highlight(posX, posY, type);
				type.children[1].innerHTML = inner > 0 ? inner.toString(16).toUpperCase() : this.relief[posY][posX];
			} else {
				type = this.debug.highlight(posX, posY, type == 5 ? 3 : type);
				type.children[1].innerHTML = inner > 0 ? inner.toString(16).toUpperCase() : "";
			}
		}
	}

	checkAjacentIslands(posX, posY, num = 3) {
		if (posX < this.offset || posX >= this.width - this.offset || posY < this.offset || posY >= this.height - this.offset) {
			return true;
		}
		//if (posX == this.startX && posY == this.startY && !this.i && !this.n) return false;

		const abs = Math.abs;

		let directions = [];
		for (let dy = -num; dy <= num; dy++) {
			for (let dx = -num; dx <= num; dx++) {
				if (
					(abs(dy) <= 1 && abs(dx) <= 1) || 
					(abs(dy) === abs(dx) && abs(dy) < num) || 
					dy === 0 || 
					dx === 0 || 
					(abs(dy) === num && abs(dx) === 1) || 
					(abs(dy) === 1 && abs(dx) === num)
				) {
					directions.push([dy, dx]);
				}
			}
		}
		
		let check = directions.some(([dy, dx]) => {
			const y = posY + dy;
			const x = posX + dx;

			if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
				return true;
			}

			if (!this.relief[y][x]) {
				// mark that a water tile was checked
				this.updateRelief(x,  y, 3, 0);
			}
			return (this.relief[y][x] && num == 3 || this.map[y][x] && this.map[y][x] != this.id);

		}) || this.visited[posY][posX] ||
			this.map[posY+1][posX] && this.map[posY+1][posX] != this.id ||
			this.map[posY-1][posX] && this.map[posY-1][posX] != this.id ||
			this.map[posY][posX+1] && this.map[posY][posX+1] != this.id ||
			this.map[posY][posX-1] && this.map[posY][posX-1] != this.id;

		return check;
	}

	randomizeNextIsland() {
		this.id ++;
		this.i = 0;
		this.n = 0;
		this.islands.push(
			this.id == 1
				? [this.width, this.height, this.posX, this.posY, this.map, this.relief, this.visited]
				: [this.startX, this.startY, 1]
		);
		this.depth = this.rand(2 + this.id/9, 3 + this.id/9);
		this.amounts = this.rand(3 + this.id/9, 3 + this.id/6);
		this.posX = this.startX;
		this.posY = this.startY;

		if (this.debug && this.debug.feedback) console.log("new #"+this.id+" island will be at " + this.startX+"x"+this.startY, "depth:"+this.depth, "n:"+this.amounts)
	}

	advanceWithSpace(callback, passInteraction) {
		if (this.destroyed) return;
		this.callback = callback;

		// cursor highlight in yellow when generating an isle or orange when chosing new isles
		if (this.debug && this.debug.visible) this.debug.highlight(this.posX, this.posY, this.n>0||this.i>0 ? this.n==this.amounts-1||this.i==this.depth-1 ? 10 : 7 : 0);

		if (!this.debug || this.debug.instant || !this.debug.visible || passInteraction && this.debug.serrial) {
			callback();
		} else {
			const randomizePromise = new Promise(
				(resolve, reject) => {
					this.callback = resolve;
					document.addEventListener("keypress", this.keyPressListener);
				}
			);
	
			randomizePromise.then(() => {
				callback();
			});
		}
	}

	keyPressListener(evt) {
		if (evt.key == "?") {
			window.app.islandGenerator.debugInfo();
		} else {
			window.app.islandGenerator.advanceGeneration(window.app.islandGenerator.callback);
		}
	}

	debugInfo() {
		console.log(
			"map:\n"+this.map.map(arr => arr.map(num => num.toString(16).toUpperCase())).join("\n"),
			"\n\nrelief:\n"+this.relief.join("\n"), "\n\nvisited:\n"+this.visited.join("\n")
		);
	}

	randomizedExpand() {
		if (this.debug && this.debug.visible) this.debug.highlight(this.posX, this.posY, 1);// previous highlight in green
		let dirX = 0;
		let dirY = 0;
		let attempt = 0;
		while(
			(
				this.posX + dirX < 3 || this.posX + dirX > this.width-3 ||
				this.posY + dirY < 3 || this.posY + dirY > this.height-3 ||
				this.visited[this.posY + dirY][this.posX + dirX] ||
				this.checkAjacentIslands(this.posX + dirX, this.posY + dirY, 3 - (attempt/66|0))// adjacent island adjustment
			) && attempt < 99
		) {
			dirX = Math.random();
			if (dirX < .4) {
				dirX = dirX < .2 ? -1 : 1;
				dirY = 0;
			}
			else {
				dirY = dirX > .7 ? -1 : 1;
				dirX = 0;
			}
			attempt ++;
			if (attempt == 99) {
				this.i = this.depth;
				this.n = this.amounts;
				break;
			}
		};
		if (this.debug && this.debug.feedback) console[attempt<99?"log":"warn"]("randomizedExpand", attempt);
		//if (attempt < 99) {
			this.posX += dirX;
			this.posY += dirY;
			//console.log("randomizedExpand", this.posX, this.posY, "x:"+dirX, "y:"+dirY, this.depth+"("+this.i+")", this.amounts+"("+this.n+")");
			this.visited[this.posY][this.posX] = 1;// switch if tile placed: 0 / 1
			this.map[this.posY][this.posX] = this.id;// will have to determine tile type as well
		//}

		this.islands[this.id].push([dirX, dirY]);

		this.i += 1;
		if (this.i >= this.depth) {
			this.n ++;
			this.i = 0;
			// add violet circle riffs at the end of each n itteration and circle green at the last tile of the island (key)
			this.updateRelief(this.posX, this.posY, this.n >= this.amounts ? 7 : 9);
			if (this.n >= this.amounts) {
				// hilight isle id with squared yellow shape (town)
				this.updateRelief(this.startX, this.startY, 0, this.id);
				if (this.id == 13) {
					// all islands generation done
					this.resolve(this.islands);
				} else {
					this.advanceWithSpace(
						()=> {
							this.choseNextStartLocation();
							this.advanceWithSpace(this.randomizedExpand.bind(this));
						}, true
					);
				}
				return;
			}
			
			this.posX = this.startX;
			this.posY = this.startY;
		} else {
			// increment and update the green relief data on each island tile we visit (adding land tiles)
			this.updateRelief(this.posX, this.posY, 1);
		}

		this.advanceWithSpace(this.randomizedExpand.bind(this), true);
	}

	advanceGeneration(callback) {
		document.removeEventListener("keypress", this.keyPressListener);
		callback();
	}

	initArray(value = 0) {
		return new Array(this.height).fill().map(() => new Array(this.width).fill(value));
	}

	rand(min, max) {
		return (min + Math.random() * (1 + max - min)) | 0;
	}
}