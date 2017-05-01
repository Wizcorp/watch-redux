// state watchers listen for changes on any object or array somewhere in the global state

var watchers = new Map();

exports.notify = function (oldState, newState) {
	var cbs = watchers.get(oldState);

	if (cbs) {
		watchers.delete(oldState);

		if (newState === null) {
			throw new TypeError('State watcher no longer points at object or array, found: null');
		}

		if (typeof newState !== 'object') {
			throw new TypeError('State watcher no longer points at object or array, found: ' + typeof newState);
		}

		watchers.set(newState, cbs);

		for (var i = 0; i < cbs.length; i += 1) {
			cbs[i](newState, oldState);
		}
	}
};


exports.watchReference = function (state, cb) {
	if (state === null) {
		// special case, because typeof null is 'object'
		throw new TypeError('State watchers can only refer to objects or arrays, found: null');
	}

	if (typeof state !== 'object') {
		throw new TypeError('State watchers can only refer to objects or arrays, found: ' + typeof state);
	}

	if (typeof cb !== 'function') {
		throw new TypeError('State watcher callback is not a function, found: ' + typeof cb);
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


exports.unwatchReference = function (state, cb) {
	var cbs = watchers.get(state);
	if (cbs) {
		var index = cbs.indexOf(cb);
		if (index !== -1) {
			cbs.splice(index, 1);

			if (cbs.length === 0) {
				watchers.delete(state);
			}
		}
	}
};
