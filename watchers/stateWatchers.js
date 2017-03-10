// state watchers listen for changes on any object or array somewhere in the global state

var watchers = new Map();


exports.notify = function (oldState, newState) {
	var cbs = watchers.get(oldState);
	if (cbs) {
		watchers.delete(oldState);
		watchers.set(newState, cbs);

		for (var i = 0; i < cbs.length; i += 1) {
			cbs[i](newState, oldState);
		}
	}
};


exports.watchReference = function (state, cb) {
	if (!state || typeof state !== 'object') {
		throw new TypeError('Object watchers can only refer to objects or arrays, found: ' + typeof state);
	}

	if (typeof cb !== 'function') {
		throw new TypeError('Watcher callback is not a function, found: ' + typeof cb);
	}

	var cbs = watchers.get(state);
	if (cbs) {
		cbs.push(cb);
	} else {
		cbs = [cb];
		watchers.set(state, cbs);
	}

	// immediately invoke

	cb(state, undefined);
};
