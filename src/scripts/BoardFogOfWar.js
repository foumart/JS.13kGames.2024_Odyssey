function revealClouds(x, y) {
	visitedData[y][x] += 2;
	revealEdges(x, y, 1);
}

function revealEdges(x, y, z = 2) {
	if (!visitedData[y][x+z]) visitedData[y][x+z] = 1;
	if (!visitedData[y+z][x]) visitedData[y+z][x] = 1;
	if (!visitedData[y][x-z]) visitedData[y][x-z] = 1;
	if (!visitedData[y-z][x]) visitedData[y-z][x] = 1;
}

function revealArea(x, y) {
	revealClouds(x, y);
	revealClouds(x-1, y);
	revealClouds(x+1, y);
	revealClouds(x, y-1);
	revealClouds(x, y+1);
	revealClouds(x-1, y-1);
	revealClouds(x+1, y+1);
	revealClouds(x+1, y-1);
	revealClouds(x-1, y+1);
}

function revealAround(x, y) {
	revealArea(x, y);
	revealArea(x-1, y);
	revealArea(x+1, y);
	revealArea(x, y-1);
	revealArea(x, y+1);
	revealArea(x-1, y-1);
	revealArea(x+1, y+1);
	revealArea(x+1, y-1);
	revealArea(x-1, y+1);
	revealArea(x-2, y);
	revealArea(x+2, y);
	revealArea(x, y-2);
	revealArea(x, y+2);
}
