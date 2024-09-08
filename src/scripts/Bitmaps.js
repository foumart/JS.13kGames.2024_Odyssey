const unitWidth = 8;
const tileWidth = 6;
const offscreenBitmaps = [];
const offscreenBitmapsFlipped = [];

const offscreenPixelData = [
	// UNITS
	"ff2b00c926062a2a3f565662da8763ffb08effffff",// 00 player left
	"",// player right (mirrored)
	"864404452d15f77b00bf6812c6c6d4e3e3f1ffffff",// 02 ship up
	"",// ship down (m)
	"864404452d15f77b00bf6812c6c6d4e3e3f1ffffff",// 04 ship left
	"",// ship right (m)
	
	"008c4600a55309498719548e2296e74dbafd4ddffd",// 06 enemy 1 - fish
	"c92606ff3d1700970b00b90d5aff0023d61e19548e",// 07 enemy 2 - serpent
	"ff2b00c926062a2a3f565662da8763ffb08effffff",// 08 enemy 3 - Knight
	"832c15452d15d1641caf4b31ff6c2bffa02fffffff",// 09 enemy 4 - Crab

	"864404f77b003338335c655f9d9da7d2d2e1ffffff",// 0A castle 11
	"32323200ca100d85375a605b899589a9b9a9ffffff",// 0B shrine 12
	"864404452d1512510d00ca1024a9210d853700e912",// 0C tree 13
	"712c0eb25800dd8700e4ae1efff115ffca3a",//       0D gold pile 14
	"b25800dd8700008c46fff115ffca3a09498719548e",// 0E gold wreck 15
	"09619f53a6ce79bfe0a9d5e8c3f3fee2ffffffffff",// 0F clouds ovelay 16

	// TILES
	"075992095f9d1066a4176fb0",// 10 depths
	"095f9d1066a4176fb01f76b5",// 11 water
	"176fb01f76b52d81bd4088bc",// 12 riff1
	"93791f2db22d3d963d1066a4176fb01f76b52d81bd4088bc",// 13 riff2

	"2db22d3d963d2bc82b32db32",// 14 land
	"2e8b2e2db22d3d963d2bc82b32db32ffb069075992176fb0",// 15 coasts
	"2e8b2e2db22d3d963d2bc82b32db32ffb069075992176fb0",// 16
	"",// 17 (m 15)
	"2db22d3d963d2bc82b32db32ffb069176fb04088bc",// 18
	"2e8b2e2db22d3d963d32db32ffb069075992176fb01f76b5",// 19
	"2db22d3d963d2bc82b32db32ffb069075992176fb04088bc",// 20
	"",// 21 (m 19)
	"",// 22 (m 20)
	"2db22d3d963d2bc82b32db32ffb0690759921f76b54088bc",// 23
	"2db22d3d963d2bc82b32db32ffb069075992176fb01f76b5",// 24
	"2e8b2e2db22d3d963d32db32ffb069075992176fb04088bc",// 25
	"",// 26 (m24)
	"2db22d3d963d2bc82b32db32ffb0694088bc176fb01f76b5",// 27
	"2e8b2e2db22d3d963d2bc82b32db32ffb069075992176fb0",// 28
	"2db22d3d963d2bc82b32db32ffb0691066a4176fb01f76b5",//  29

	// dungeon enemies
	"ff004d7e25534e48421d2b535f574f333e5f85807b",
	"ff004d7e25531d2b535f574f333e5f85807b",
	"ff004d4e48425f574f85807b",
	"ff004d4e48421d2b535f574f333e5f85807b",
	"ff004d7e25534e48421d2b535f574f333e5f85807b",
	"ff004d4e48425f574f333e5f85807b",
	"7e25534e48421d2b535f574f333e5f85807b",
	"ff004d4e48421d2b535f574f333e5f",
	"7e25534e48421d2b535f574f333e5f85807b",
	"ff004d4e48421d2b535f574f333e5f"
];

const offscreenColorData = [
	// UNITS
	"Xb[DSIRc\\w{YPvMBXmRKfkZVX\\cC@[XC",// player left
	"",
	"@nc@pwt@x}Fpw|Gh~qE@PF@PacA@JL@",// ship up
	"",
	"@\\uE@\`~o@owuxenonH}FcPPhH\\\\Q@IIB",// ship left
	"",
	
	"pwE@~JnDuwMflVDZacQctY\\D\`ca@@\`SA",// enemy1 fish
	"\`uC@YJuytulV\`{plJGfn@\`sux\\l{_cfG",// enemy2 serpent
	"@JQCPQJZXw{MhnT\\XeIae[RZX\\SC@[XC",// enemy3 knight
	"CC@Xu@@nllCebWWLPu\\A@lc@\`MlDKCZ^",// enemy4 crab

	"psscpw]pOw]\`vn\\@ctCXc^|Q_euQ^l",//10 castle
	"@kf@pwwA{nn\\wLyfnIqMwI|flat]SCcB",//11 shrine
	"@fuCp}g]p|l^Xfu^@s^C@@B@@@A@@@@@",//12 tree
	"@@@@@\`C@@se@Xn\\AHusBP^lAHbVA@HJ@",//13 gold pile
	"@PA@@bU@HlJFkJlq^lQ{w[[~x~vG@w~@",//14 gold wreck
	"@YS@\`s]BPmlTX\\}^PQue\\JbZSAPCH@@@",//15 clouds overlay

	// TILES
	"\\JZZSISJRJQ[RIZSRc",// 00 depths
	"SQcbSQ\\\\ZSccJZT\\JZ",// 01 water
	"RZJKRRRR\\JZRSIJbSQ",// 02 riff1
	"npl]zunl~yupl^zuol",// 03 riff3

	"IKQIIIJaIIIYYQIIII",// 04 land
	"bRsRRqS]~RJ~bZqRRs",// 05 coasts
	"RRUjRRRbRRYbKvKvv",// 06 
	"",// 07
	"lwoYdKSIIIaQaIYJIL",// 08
	"MRR]bRMSbnYQwmKvm",// ◳ 09
	"w%cnLIUISMLIUIaUYI",// ◲ 0A
	"",// ◰ 17
	"",// ◱ 18
	"w\\nI!UYjUIjML5UIi",// 19
	"m\\}IIjIKjQQujm~uv",// ] 1A 20
	"UTk#Ri]bkMSunm~wv",// [ 1B 21
	"",// 1C 22
	"UYjMLuUIjnJkUIjMai",// ║ 1D 23
	"ueuSZRjRbRKSYv^vw",// ═ 1E 24
	"nLuMRiUbj]Zunm~wv",// ⧈ 0F 25

	// dungeon enemies
	"@EEpPUpfQav\\_t\`me@hh@@@@@",
	"@hE@tD@jmmXMkYmmmEkmC@DD@",
	"\`@Dd@X\\cdYAd\\[dd\\dP\`PDCDC",
	"tf\`HLTedd]ERT[@tDCddFdP\`F",
	"@]ExHOEGmuxff_htWE\`f]hG_@",
	"@mE@HM@mkkmbcj]d\\EUSE\`Dd@",
	"@mE@mmEm[kELMDhTtmtvtBfT@",
	"RhdPkLLjdlTd\\@Bbd@@Pd\`dd@",
	"@mE@mmEm[kELMDhTtmtvtBfT@",
	"RhdPkLLjdlTd\\@Bbd@@Pd\`dd@"
];

for (let z,i,j,l,k = 0; k < offscreenPixelData.length; k++) {
	l = k < 16 || k > 35 ? unitWidth : tileWidth;
	const offscreenCanvas = document.createElement('canvas');
	offscreenCanvas.width = l;
	offscreenCanvas.height = l;
	const offscreenCtx = offscreenCanvas.getContext('2d');

	let offscreenC = offscreenPixelData[k];
	let offscreenpx = [];
	let offscreenD = offscreenColorData[k].replace(/./g,a=>{
		z = a.charCodeAt()
		offscreenpx.push(z&7)
		offscreenpx.push((z>>3)&7)
	});
	for(j = 0; j < l; j++) {
		for(i = 0; i < l; i++){
			if(offscreenpx[j*l+i]) {
				// make the cloud (k==15) sprite semi-transparent
				offscreenCtx.fillStyle = "#"+offscreenC.substr(6*(offscreenpx[j*l+i]-1), 6) + (k==15?["66","dd","bb","cc","ee","ff"][offscreenpx[j*l+i]-1]:"ff");
				offscreenCtx.fillRect(i, j, 1, 1);
			}
		}
	}

	offscreenBitmaps.push(offscreenCanvas);

	// Create flipped canvas
	const flippedCanvas = document.createElement('canvas');
	flippedCanvas.width = l;
	flippedCanvas.height = l;
	const flippedCtx = flippedCanvas.getContext('2d');

	flippedCtx.translate(l, 0);
	flippedCtx.scale(-1, 1);
	flippedCtx.drawImage(offscreenCanvas, 0, 0);
	//flippedCtx.restore();

	offscreenBitmapsFlipped.push(flippedCanvas);

	offscreenCanvas.style = flippedCanvas.style =
		`border:1vmin solid #1160;border-radius:1vmin;background:#1166;position:relative;width:12vmin`;
}

