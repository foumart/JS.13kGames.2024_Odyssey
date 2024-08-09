
let audioContext;
const SoundFXoscTypes = ["sawtooth", "square", "sine"];//"triangle", "sine"
let SoundFXvolume = 1;

function SoundFXplayTune(tone, len = 9, vol = 5, type = 1) {
	if (!tone || !audioContext) return;
	else playTune(tone, len / 99, len, vol / 9);
	function playTune(_tone, _len, _dur, _vol) {
		let currentTone, currentFrequency, AudioCtx = new AudioContext();
		setTimeout(AudioCtx.close.bind(AudioCtx), (_tone.length + _len) * 99);
		for(currentTone = 0; currentTone < _tone.length; currentTone ++) {
			if (_tone[currentTone = +currentTone] && _tone[currentTone] != " ") {
				let v, Oscillator = AudioCtx.createOscillator(), Gain = AudioCtx.createGain();
				Oscillator.connect(Gain);
				currentFrequency = _tone.charCodeAt(currentTone);
				Gain.gain.value = 0;
				Gain.connect(AudioCtx.destination);
				Oscillator.start(currentTone * _len);
				Oscillator.type = SoundFXoscTypes[type];
				Oscillator.frequency.value = 440 * Math.pow(1.06, -73 + currentFrequency);
				for (v = 0; v < _dur; v ++) {
					Gain.gain.setValueAtTime(
						(currentTone < _tone.length - 1 ? currentTone % (_tone.length / _dur | 0) < 6 ? _dur - (3 - (currentTone % _dur)) : _dur : _dur - v) / _dur * _vol * SoundFXvolume,
						currentTone * _len + _len / _dur * v
					);
				}

				Oscillator.stop(currentTone * _len + _len);
			}
		}
	}
}

function SoundFXplaySequence(start, incr, len = 6, j = '') {
	for (let i = 0; i < len; i++) {
		j += String.fromCharCode(start + i * incr);
	}
	return j;
}

// !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_abcdefghijklmnopqrstuvwxyz{|}~

function SoundFXstart() {
	audioContext = new AudioContext();
}

function SoundFXmute() {
	SoundFXplayTune("9NA", 3, 1, 2);
}

function SoundFXmoveStep() {
	SoundFXplayTune(`' *`, 4, 1);
}

function SoundFXdisabled() {
	SoundFXplayTune("- + )(", 2, 1);
}

function SoundFXhilight() {
	SoundFXplayTune("#(09", 3, 1);
	SoundFXplayTune(" AA  C", 3, 1, 2);
}

function SoundFXremoveHilight() {
	SoundFXplayTune("  DD  B", 3, 1, 2);
}

function soundFXdecline() {
	SoundFXplayTune("  CC B A", 3, 2, 2);
}

function soundFXraise() {
	SoundFXplayTune("  AA B C", 3, 2, 2);
}
