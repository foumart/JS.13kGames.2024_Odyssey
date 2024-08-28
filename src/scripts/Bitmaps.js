const unitWidth = 8;
const tileWidth = 6;
const offscreenBitmaps = [];

const offscreenPixelData = [
	// UNITS
	"5656622a2a3fff2b00c92606e2e2f0ffb08eda8763",// player
	"835426ff2525c6c6d4ffffffbf6812e3e3f1544434",// ship up
	"bf6812ff2525e3e3f1ffffff835426c6c6d4544434",// ship left
	"ff2525bf6812835426e3e3f1ffffffc6c6d4544434",// ship right
	
	"24a22c39be4300e9120d8537982943c52e51544434",// enemies
	"2965ff2658d7537de73a3a933c6be24343a0544434",
	"24a22c39be4300e9120d8537982943c52e51544434",
	"2965ff2658d7537de73a3a933c6be24343a0544434",
	"24a22c39be4300e9120d8537982943c52e51544434",

	"89899544444ec6c6d46b6b7ce1e1ee835426b25800",// castle
	"0d85375656623b3b460c6804898995c6c6d42b2b39",// shrine
	"0c680424a22c0d853700e91200ca10544434835426",// tree
	"b25800835426ffca3ae0a70ede8e27bf6812544434",// gold
	"adbaa8f4e5d50c680471806ba7734024a22c835426",// mount
	"adbaa8f4e5d50c680471806ba7734024a22c835426",//
	"adbaa8f4e5d50c680471806ba7734024a22c835426",//

	// TILES
	"3737d13a3adc3d3ddf4343de4d4de8",// 00 depths
	"3a3adc3d3ddf4343de4d4de8",// 01 water
	"4343de4d4de85c5cf07070ef",// 02 riff1
	"3d3ddf4343de4d4de87070ef8585f5",// 04 riff2
	"93791f2db22d3d963d4343de4d4de87070ef8585f5",// 04 riff3
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
	"2db22d3d963d2bc82b32db32ffb0693737d14343de7070ef",// 1E
	"00dc002db22d3d963d2bc82bffb0693737d14343de4d4de8"//  1F
];

const offscreenColorData = [
	// UNITS
	"@IRBI[dRQujS\`v_DPdZNzTfPQJB@RPB",// player pirate
	"@HR@X\\u@\`d^Fp\\qCX~a@@xADximA@OM@",// ship up
	"@AR@X\\E@cdf@^\\uDpsG^FGGIoIIExmm@",// ship left
	"@IP@@XlD@umeh^lttxfFRxxpXRR{@[[G",// ship right
	
	"@QA@HZJAQLQLHMHbp@Qd@HbD@ad@\`d@@",// enemy1
	"HA@@ZJ@@lS@Ddm@fpdtD@vf@@\`D@@@@@",//enemy2
	"@QA@HZJAQLQLHMHbp@Qd@HbD@ad@\`d@@",// enemy1
	"HA@@ZJ@@lS@Ddm@fpdtD@vf@@\`D@@@@@",//enemy2
	"@QA@HZJAQLQLHMHbp@Qd@HbD@ad@\`d@@",// enemy1

	"HZZTXm]QXe]QPIIB@b\\B\`mbSi~UaX~SD",//10 castle
	"@Q[D@uue\`jjZhVnP}]i~_Va}[eHA@A",//11 shrine
	"@QK@HlRAaeUJQmRKH[IA@@F@@KOC@X[@",//12 tree
	"@HB@@cQ@\`]LBhcsAPuMB@WQG@xz@@@@@",//13 gold
	"@QA@XRbCKUL[kai\\fotootots}e^X[XC",//14 mount
	"@QA@XRbCKUL[kai\\fotootots}e^X[XC",//15
	"@QA@XRbCKUL[kai\\fotootots}e^X[XC",//16

	// TILES
	"TlSbZL]IbTIkaSTZeb",// 00 depths
	"dKc[\\bK[Tb[YTc[\\Yd",// 01 water
	"RSQQRRRRTRQRSRQRRR",// 02 riff1
	"S[U[cc[[[kZZ\\L[S[S",// 03 riff2
	"mgmuslmmmqmglurmmm",// 04 riff3
	"RSRaRTlTSbQRSReRRd",// 05 shine
	"IRJZQK[SQZRRQJ[QR[",
	"IRJZQK[SQZRRQJ[QR[",
	"IRJZQK[SQZRRQJ[QR[",
	"IRJZQK[SQZRRQJ[QR[",

	"IKQIIIJaIIIYYQIIII",// 10 land
	"bRsRRqS]~RJbZqRRs",// 11 coasts
	"RRUjRRRbRRYbKvKvv",// 12 
	"NRU^RRwcR7QbNSS^RR",// 13
	"lwoYdKSIIIaQaIYJIL",// 14
	"\\~QYuIIjaIjIYiQIj",// ◱ 15
	"bRiRRkR\\iZJuIm~mv",// ◰ 16
	"MRR]bRMSbnYQwmKvm",// ◳ 17
	"whcnLIUISMLIUIaUYI",// ◲ 18
	"w\\nIUYjUIjMLUIi",// 19
	"m\\}IIjIKjQQujm~uv",// ] 1A 10
	"UTk Ri]bkMSunm~wv",// [ 1B 11
	"o\\mUaIUIYnRIwmUvn",// 1C 12
	"UYjMLuUIjnJkUIjMai",// ║ 1D 13
	"l\\lIIIaIYQjJjUun",// ═ 1E 14
	"nLuMRiUbj]Zunm~wv"// ⧈ 0F 15
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
				offscreenCtx.fillStyle = "#"+offscreenC.substr(6*(offscreenpx[j*l+i]-1), 6);
				offscreenCtx.fillRect(i, j, 1, 1);
			}
		}
	}

	offscreenBitmaps.push(offscreenCanvas);
}

