class TweenFX {

	static to(_element, _duration, _object, _update, _callback, _timeout = 16.7) {
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
					const eased = duration * .5 * (Math.sin((count / duration - .5) * Math.PI) + 1);
					if (tweenedStart[i] > tweenedEnd[i]) {
						element[key] = tweenedEnd[i] + (tweenedStart[i] - tweenedEnd[i]) / duration * (duration - eased);
					} else {
						element[key] = tweenedStart[i] - (tweenedStart[i] - tweenedEnd[i]) / duration * eased;
					}
				});
				if (_update) _update();
				setTimeout(tween, _timeout);
			} else if (_callback) {
				_callback();
			}
		}

		if (_update != null) _update();
		setTimeout(tween, _timeout);
	}
}

/*
duration * Math.pow(count / duration, 1.675);
duration * (1 - Math.pow(1 - count / duration, 1.675));
duration * .5 * (Math.sin((count / duration - .5) * Math.PI) + 1);
}*/
