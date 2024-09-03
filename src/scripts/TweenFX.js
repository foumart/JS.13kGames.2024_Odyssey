class TweenFX {

	static to(_element, _duration, _object, _update, _callback) {
		const tweenedKeys = [];
		const tweenedStart = [];
		const tweenedEnd = [];

		Object.keys(_object).forEach(key => {
			tweenedKeys.push(key);
			tweenedStart.push(_element[key]);
			tweenedEnd.push(_object[key]);
		});

		let count = 0;
		const duration = _duration;
		const element = _element;

		const tween = e => {
			if (count < duration) {
				count ++;
				tweenedKeys.forEach((key, i) => {
					const eased = duration * Math.pow(count / duration, 1.675);
					if (tweenedStart[i] > tweenedEnd[i]) {
						element[key] = tweenedEnd[i] + (tweenedStart[i] - tweenedEnd[i]) / duration * (duration - eased);
					} else {
						element[key] = tweenedStart[i] - (tweenedStart[i] - tweenedEnd[i]) / duration * eased;
					}
				});
				if (_update != null) _update();
				requestAnimationFrame(tween);
			} else if (_callback) {
				requestAnimationFrame(_callback);
			}
		}

		if (_update != null) _update();
		requestAnimationFrame(tween);
	}
}

/*
duration * Math.pow(count / duration, 1.675);
duration * (1 - Math.pow(1 - count / duration, 1.675));
duration * .5 * (Math.sin((count / duration - .5) * Math.PI) + 1);
}*/
