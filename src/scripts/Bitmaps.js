const unitWidth = 8;
const tileWidth = 6;
const offscreenBitmaps = [];

const offscreenPixelData = [
	// UNITS
	"5656622a2a3fff2b00c92606e2e2f0ffb08eda8763",
	"835426ff2525c6c6d4ffffffbf6812e3e3f1544434",//ship up
	"bf6812ff2525e3e3f1ffffff835426c6c6d4544434",//ship left
	"ff2525bf6812835426e3e3f1ffffffc6c6d4544434",//ship right
	
	"24a22c39be4300e9120d8537982943c52e51544434",
	"2965ff2658d7537de73a3a933c6be24343a0544434",
	"24a22c39be4300e9120d8537982943c52e51544434",
	"2965ff2658d7537de73a3a933c6be24343a0544434",
	"24a22c39be4300e9120d8537982943c52e51544434",

	"89899544444ec6c6d46b6b7ce1e1ee835426b25800",//castle
	"0d85375656623b3b460c6804898995c6c6d42b2b39",//shrine
	"0c680424a22c0d853700e91200ca10544434835426",//tree
	"b25800835426ffca3ae0a70ede8e27bf6812544434",//gold
	"adbaa8f4e5d50c680471806ba7734024a22c835426",//mount
	"adbaa8f4e5d50c680471806ba7734024a22c835426",//
	"adbaa8f4e5d50c680471806ba7734024a22c835426",//

	// TILES
	"4d4de84343de",// 00 water
	"3737d13a3adc4d4de84343de",// 01 depths
	"4d4de87070ef4343de",// 02 riff1
	"4d4de88585f54343de7070ef",// 03 riff2
	"4d4de88585f54343de7070ef3d963d93791f2db22d",// 04 riff3
	"4d4de87070ef4343de8585f5c8c8f5",// 05 shine
	"4d4de84343de8585f54343de00ae0000c70000dc00",
	"4d4de84343de8585f54343de00ae0000c70000dc00",
	"4d4de84343de8585f54343de00ae0000c70000dc00",
	"4d4de84343de8585f54343de00ae0000c70000dc00",

	"2db22d3d963d32db32",// 00 land
	"2db22d32db323d963dffd07f2e8b2effb0693737d14343de",// 11 coasts
	"2db22d32db322e8b2e3d963dffb069ffd07f4343de3737d1",// 12
	"ffd07f2e8b2e2db22d32db32ffb0693d963d3737d14343de",// 13
	"3737d14343de3d963d7070efffb0692db22d32db322e8b2e",// 14
	"3737d14343de4d4de83d963d2db22d2e8b2e32db32ffb069",// 15
	"2db22d32db322e8b2effb0693d963d3737d14343de4d4de8",// 16
	"ffb0692e8b2e2db22d3d963d32db323737d14343de4d4de8",// 17
	"4343de3737d12e8b2e32db322db22dffb0693d963dffd07f",// 18
	"4d4de83737d132db323d963dffb0692db22d2e8b2e7070ef",// 19
	"32db32ffb0693d963d4343de2db22d2e8b2e3737d14d4de8",// 1A
	"ffb0693d963d32db322db22d7070ef2e8b2e3737d14343de",// 1B
	"4343deffb0692db22d32db323d963d2e8b2e3737d14d4de8",// 1C
	"ffb0693d963d32db322db22dffd07f7070ef3737d14d4de8",// 1D
	"00dc00ffd07f00c700ffb06900ad007070ef3737d14343de",// 1E
	"3737d1ffb06900ad0000dc0000c7004343de4d4de84343de"//  1F
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
	"IRJRQJRRQJRRQJRQRI",// water
	"QcJbbTdIZSIdbTTQ\\J",// depths
	"IJIKIIIIJIKIJIIIIK",// riff1
	"IZIaaKIIIIIZKaaIII",// riff2
	"IZIaeKIIIfIZKagIII",// riff3
	"IJIcILlLJaKIJIeIId",// shine
	"IRJZQK[SQZRRQJ[QR[",
	"IRJZQK[SQZRRQJ[QR[",
	"IRJZQK[SQZRRQJ[QR[",
	"IRJZQK[SQZRRQJ[QR[",

	"IKQIIIJYIIIYYQIIII",// 10 land
	"QIcIIuIj~JYYisIIe",// 11 coasts
	"IIJQIIIQIIcQ\\m\\nu",// 12 
	"Q[\\u[[of[pZcU^^q[[",// 13
	"IRIcI]~\`~v~v^vvvwv",// 14
	"IIZltQ}ePm}emmo",// ◱ 15
	"QIcIIeIjckYtdd~vv",// ◰ 16
	"Q[[ak[Q\\kNbZwIIvv",// ◳ 17
	"Qcermm~m}plm^mlmm",// ◲ 18
	"QcJjvT}^oevlusevn",// 19
	"QYbmmSmiV^]zRRg",// ] 1A 10
	"QcLMdNQ\\JqbyOI",// [ 1B 11
	"Qcbj[[r[cWn^yRRP",// 1C 12
	"QcJeTqQdJNblQ\\l]dJ",// ║ 1D 13
	"QYL[K[K[K]e]TtT",// ═ 1E 14
	"QcJbmTjeSZ]JQRqNI~"// ⧈ 0F 15
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

