// selector watches listen for multiple state changes as an atomic unit

var stateWatchers = require('./stateWatchers');

var selectorWatchers = [];


function SelectorWatcher(globalState, selector, cb) {
	this.selector = selector;
	this.cb = cb;
	this.shouldNotify = false;
	this.states = selector.watch(globalState);
	this.lastTransformedValue = undefined;

	var stateNames = Object.keys(this.states);
	for (var i = 0; i < stateNames.length; i += 1) {
		var name = stateNames[i];
		var state = this.states[name];

		if (!state || typeof state !== 'object') {
			throw new TypeError('Selector can only watch reference types');
		}

		this._watchReference(name, state);
	}
}

SelectorWatcher.prototype._watchReference = function (name, state) {
	var that = this;

	stateWatchers.watchReference(state, function (newState) {
		that.states[name] = newState;
		that.shouldNotify = true;
	});
};


SelectorWatcher.prototype.notify = function () {
	if (this.shouldNotify) {
		this.shouldNotify = false;
		var transformedValue = this.selector.transform(this.states);

		if (transformedValue !== this.lastTransformedValue) {
			this.lastTransformedValue = transformedValue;
			this.cb(transformedValue);
		}
	}
};


exports.watch = function (globalState, selector, cb) {
	var watcher = new SelectorWatcher(globalState, selector, cb);

	selectorWatchers.push(watcher);

	watcher.notify();
};


exports.notify = function () {
	for (var i = 0; i < selectorWatchers.length; i += 1) {
		selectorWatchers[i].notify();
	}
};
