function revealClouds(x, y, radius = 3) {
	visitedData[y][x] = 2;
	if (radius) {
		revealEdges(x, y, 1);
		if (radius > 1) {
			visitedData[y+1][x+1] = 2;
			visitedData[y+1][x-1] = 2;
			visitedData[y-1][x-1] = 2;
			visitedData[y-1][x+1] = 2;
			if (radius > 2) {
				revealEdges(x, y);
			}
		}
	}
}

function revealEdges(x, y, z = 2) {
	visitedData[y][x+z] = 2;
	visitedData[y+z][x] = 2;
	visitedData[y][x-z] = 2;
	visitedData[y-z][x] = 2;
}

function revealArea(x, y) {
	revealClouds(x-1, y-1);
	revealClouds(x+1, y-1);
	revealClouds(x-1, y+1);
	revealClouds(x+1, y+1);
	revealEdges(x, y);
}
