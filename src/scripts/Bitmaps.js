const unitWidth = 8;
const tileWidth = 6;
const offscreenBitmaps = [];
const offscreenBitmapsFlipped = [];

const offscreenPixelData = [
	// UNITS
	"ff2b00c926062a2a3f565662da8763ffb08effffff",// player left
	"",// player right
	"864404452d15f77b00bf6812c6c6d4e3e3f1ffffff",// ship up
	"",// ship down
	"864404452d15f77b00bf6812c6c6d4e3e3f1ffffff",// ship left
	"",// ship right
	
	"2929883a3a934343a07057cc3778ff4ca0ff4cc6ff",// enemy 1 07 07 fish
	"c92606ff3d1700970b00b90d5aff0023d61e3a3a93",// enemy 2 08 08 serpent
	"ff2b00c926062a2a3f565662da8763ffb08effffff",// enemy 3 09 09 Knight
	"832c15452d15d1641caf4b31ff6c2bffa02fffffff",// enemy 4 10 0A Crab

	"864404f77b003338335c655f9d9da7d2d2e1ffffff",// castle 11 0B
	"32323200ca100d85375a605b899589a9b9a9ffffff",// shrine 12 0C
	"864404452d1512510d00ca1024a9210d853700e912",// tree 13 0D
	"712c0eb25800dd8700e4ae1efff115ffca3a",// gold pile 14 0E
	"b25800dd8700fff115292988ffca3a3a3a935c9e87",// gold wreck 15 0F
	"3355996688dd87a3eab0c3edc6deffe1f2ffffffff",// clouds ovelay 16

	// TILES
	"3737d13a3adc3d3ddf4343de4d4de8",// 00 depths
	"3a3adc3d3ddf4343de4d4de8",// 01 water
	"4343de4d4de85c5cf07070ef",// 02 riff1
	"93791f2db22d3d963d4343de4d4de87070ef8585f5",// 04 riff3
	"3d3ddf4343de4d4de87070ef8585f5",// 04 riff2
	"4343de4d4de87070ef8585f5c8c8f5",// 05 shine
	"4d4de84343de8585f54343de00ae0000c70000dc00",
	"4d4de84343de8585f54343de00ae0000c70000dc00",
	"4d4de84343de8585f54343de00ae0000c70000dc00",
	"4d4de84343de8585f54343de00ae0000c70000dc00",

	"2db22d3d963d2bc82b32db32",// 00 land
	"2e8b2e2db22d3d963d2bc82b32db32ffb0693737d14343de",// 11 coasts
	"2e8b2e2db22d3d963d2bc82b32db32ffb0693737d14343de",// 12
	"2e8b2e2db22d3d963d2bc82b32db32ffb0693737d14343de",// 13
	"2db22d3d963d2bc82b32db32ffb0694343de7070ef",// 14
	"2db22d3d963d2bc82b32db32ffb0693737d14343de7070ef",// 15
	"2e8b2e2db22d3d963d32db32ffb0693737d14343de4d4de8",// 16
	"2e8b2e2db22d3d963d32db32ffb0693737d14343de4d4de8",// 17
	"2db22d3d963d2bc82b32db32ffb0693737d14343de7070ef",// 18
	"2db22d3d963d2bc82b32db32ffb0693737d14d4de87070ef",// 19
	"2db22d3d963d2bc82b32db32ffb0693737d14343de4d4de8",// 1A
	"2e8b2e2db22d3d963d32db32ffb0693737d14343de7070ef",// 1B
	"2db22d3d963d2bc82b32db32ffb0693737d14343de4d4de8",// 1C
	"2db22d3d963d2bc82b32db32ffb0697070ef4343de4d4de8",// 1D
	"2e8b2e2db22d3d963d2bc82b32db32ffb0693737d14343de",// 1E
	"00dc002db22d3d963d2bc82bffb0693737d14343de4d4de8"//  1F
];

const offscreenColorData = [
	// UNITS
	"Xb[DSIRc\\w{YPvMBXmRKfkZVX\\cC@[XC",// player left
	"",// player right
	"@nc@pwt@x}Fpw|Gh~qE@PF@PacA@JL@",// ship up
	"",// ship down
	"@\\uE@\`~o@owuxenonH}FcPPhH\\\\Q@IIB",// ship left
	"",// ship right
	
	"hwE@~en@uwEbinPLXJZQHSK@PYQ@@P@@",// enemy1 fish
	"\`u{@YVqytulV\`{plJGfn@\`sux\\l{_cfG",// enemy2 serpent
	"@JQCPQJZXw{MhnT\\XeIae[RZX\\SC@[XC",// enemy3 knight
	"CC@Xu@@nllCebWWLPu\\A@lc@\`MlDKCZ^",// enemy4 crab

	"psscpw]pOw]\`vn\\@ctCXc^|Q_euQ^l",//10 castle
	"@kf@pwwA{nn\\wLyfnIqMwI|flat]SCcB",//11 shrine
	"@fuCp}g]p|l^Xfu^@s^C@@B@@@A@@@@@",//12 tree
	"@\`C@@se@Xn\\AHusBP^lAHbVA@HJ@@@@@",//13 gold pile
	"@PA@@ZU@HkJDoJka|kQwftptdF@ft@",//14 gold wreck
	"@YS@\`s]BPmlTX\\}^PQue\\JbZSAPCH@@@",//15 clouds overlay

	// TILES
	"TlSbZL]IbTIkaSTZeb",// 00 depths
	"dKc[\\bK[Tb[YTc[\\Yd",// 01 water
	"RSQQRRRRTRQRSRQRRR",// 02 riff1
	"mgmuslmmmqmglurmmm",// 04 riff3
	"S[U[cc[[[kZZ\\L[S[S",// 03 riff2
	"RSRaRTlTSbQRSReRRd",// 05 shine
	"IRJZQK[SQZRRQJ[QR[",
	"IRJZQK[SQZRRQJ[QR[",
	"IRJZQK[SQZRRQJ[QR[",
	"IRJZQK[SQZRRQJ[QR[",

	"IKQIIIJaIIIYYQIIII",// 10 land
	"bRsRRqS]~RJ~bZqRRs",// 11 coasts
	"RRUjRRRbRRYbKvKvv",// 12 
	"NRU^RRwcR7QbNSS^RR",// 13
	"lwoYdKSIIIaQaIYJIL",// 14
	"\\%~QYuIIjaIjIYiQIj",// ◱ 15
	"bRiRRkR\\iZJuIm~mv",// ◰ 16
	"MRR]bRMSbnYQwmKvm",// ◳ 17
	"w%cnLIUISMLIUIaUYI",// ◲ 18
	"w\\nI!UYjUIjML5UIi",// 19
	"m\\}IIjIKjQQujm~uv",// ] 1A 10
	"UTk#Ri]bkMSunm~wv",// [ 1B 11
	"o\\mUaIUIYnRIwmUvn",// 1C 12
	"UYjMLuUIjnJkUIjMai",// ║ 1D 13
	"ueuSZRjRbRKSYv^vw",// ═ 1E 14
	"nLuMRiUbj]Zunm~wv"// ⧈ 0F 15
];

for (let z,i,j,l,k = 0; k < offscreenPixelData.length; k++) {
	l = k < 16 ? unitWidth : tileWidth;
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
				offscreenCtx.fillStyle = "#"+offscreenC.substr(6*(offscreenpx[j*l+i]-1), 6) + (k==15?["cc","dd","bb","cc","ee","ff"][offscreenpx[j*l+i]-1]:"ff");
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

	offscreenBitmapsFlipped.push(flippedCanvas);

}

