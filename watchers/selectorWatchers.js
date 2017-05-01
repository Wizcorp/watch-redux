// selector watches listen for multiple state changes as an atomic unit

var stateWatchers = require('./stateWatchers');

var selectorWatchers = [];


function SelectorWatcher(globalState, selector, cb) {
	this.selector = selector;
	this.cb = cb;
	this.shouldNotify = false;
	this.states = selector.watch(globalState);
	this.stateNames = Object.keys(this.states);
	this.lastTransformedValue = undefined;
	this.onNotify = {};   // name: callback

	for (var i = 0; i < this.stateNames.length; i += 1) {
		var name = this.stateNames[i];
		var state = this.states[name];

		this._watchReference(name, state);
	}
}

SelectorWatcher.prototype._watchReference = function (name, state) {
	if (!state || typeof state !== 'object') {
		throw new TypeError('Selector can only watch reference types');
	}

	var that = this;

	function onNotify(newState) {
		that.states[name] = newState;
		that.shouldNotify = true;
	}

	stateWatchers.watchReference(state, onNotify);
	this.onNotify[name] = onNotify;
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


SelectorWatcher.prototype.destroy = function () {
	for (var i = 0; i < this.stateNames.length; i += 1) {
		var name = this.stateNames[i];
		var state = this.states[name];

		stateWatchers.unwatchReference(state, this.onNotify[name]);
	}

	this.selector = undefined;
	this.cb = undefined;
	this.states = undefined;
	this.stateNames = undefined;
	this.lastTransformedValue = undefined;
	this.onNotify = undefined;
};


exports.watch = function (globalState, selector, cb) {
	var watcher = new SelectorWatcher(globalState, selector, cb);

	selectorWatchers.push(watcher);

	watcher.notify();

	return watcher;
};


exports.notify = function () {
	for (var i = 0; i < selectorWatchers.length; i += 1) {
		selectorWatchers[i].notify();
	}
};
