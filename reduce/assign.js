var shallowArrayCopy = require('./utils').shallowArrayCopy;
var shallowObjectCopy = require('./utils').shallowObjectCopy;
var registerChange = require('../changes').registerChange;


function assignToArray(oldState, changes) {
	var newState = shallowArrayCopy(oldState);
	var hasChanged = false;

	for (var key in changes) {
		if (changes.hasOwnProperty(key)) {
			var index = parseInt(key, 10);
			var value = changes[key];

			if (newState[index] !== value) {
				if (value === undefined) {
					newState[index] = undefined;
				} else {
					newState[index] = value;
				}

				hasChanged = true;
			}
		}
	}

	if (hasChanged) {
		// we may have trailing undefined values, which would make .length misrepresent the content

		while (newState[newState.length - 1] === undefined) {
			newState.pop();
		}

		registerChange(oldState, newState);
		return newState;
	}

	return oldState;
}


function assignToObject(oldState, changes) {
	var newState = shallowObjectCopy(oldState);
	var hasChanged = false;

	for (var key in changes) {
		if (changes.hasOwnProperty(key)) {
			var value = changes[key];

			if (newState[key] !== value) {
				if (value === undefined) {
					delete newState[key];
				} else {
					newState[key] = value;
				}

				hasChanged = true;
			}
		}
	}

	if (hasChanged) {
		registerChange(oldState, newState);
		return newState;
	}

	return oldState;
}


module.exports = function assign(state, changes) {
	if (!state || typeof state !== 'object') {
		throw new TypeError('You can only assign to arrays and objects');
	}

	if (!changes || typeof changes !== 'object') {
		throw new TypeError('You can only assign a change object');
	}

	return Array.isArray(state) ?
		assignToArray(state, changes) :
		assignToObject(state, changes);
};
