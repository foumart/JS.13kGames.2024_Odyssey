// Progressive Web App service worker initialization script - feel free to remove if you are not going to build a PWA.

// Set debug to true if you want to see logs about caching / fetching of resources and other output.
let _debug;

// Progressive web apps can work only with secure connections.
const _online = location.protocol.substring(0, 5) === "https";

// Service worker detection and installation script:
if ("serviceWorker" in navigator && _online) {
	navigator.serviceWorker.getRegistrations().then(registrations => {
		let isRegistered;
		for (let i = 0; i < registrations.length; i++) {
			if (window.location.href.indexOf(registrations[i].scope) > -1) isRegistered = true;
		}
		if (isRegistered) {
			if (_debug) console.log("ServiceWorker already registered");
		} else {
			if (_debug) {
				navigator.serviceWorker.register("service_worker.js").then(() => {
					console.log("ServiceWorker registered successfully");
				}).catch(() => {
					console.log("ServiceWorker registration failed");
					pwaInit();
				});
			} else {
				navigator.serviceWorker.register("service_worker.js").catch(() => {
					pwaInit();
				});
			}
		}
	}).catch(() => {
		if (_debug) console.log("ServiceWorker bypassed locally");
		pwaInit();
	});
	navigator.serviceWorker.ready.then(() => {
		if (_debug) console.log('ServiceWorker is now active');
		pwaInit();
	});
} else {
	if (_debug) {
		if (location.protocol.substring(0, 5) != "https") {
			console.log("ServiceWorker is disabled on localhost");
		} else {
			console.log("ServiceWorker not found in navigator");
		}
	}

	window.addEventListener("load", pwaInit);
}

// Record if the game is being run as a PWA in its own window, separate from the browser.
let _standalone;

function pwaInit() {
	// if matching, we are running in browser; alternatives: (display-mode: standalone)
	_standalone = !window.matchMedia('(display-mode: browser)').matches;
	// we continue in app.js
	init();
}
