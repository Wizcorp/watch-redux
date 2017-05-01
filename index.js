var changes = require('./changes');
var watchers = require('./watchers');

var store;

exports.setup = function (_store) {
	store = _store;

	store.subscribe(function () {
		var changeList = changes.fetchAndClearChanges();
		watchers.notify(changeList);
	});

	return store;
};

exports.watch = function (selector, cb) {
	if (!store) {
		throw new Error('Please run .setup(store) before calling .watch()');
	}

	return watchers.watchSelector(store.getState(), selector, cb);
};
