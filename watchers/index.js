var stateWatchers = require('./stateWatchers');
var selectorWatchers = require('./selectorWatchers');

exports.notify = function (changes) {
	for (var i = 0; i < changes.length; i += 1) {
		var oldState = changes[i].oldState;
		var newState = changes[i].newState;

		stateWatchers.notify(oldState, newState);
	}

	selectorWatchers.notify();
};

exports.watchSelector = function (globalState, selector, cb) {
	return selectorWatchers.watch(globalState, selector, cb);
};
