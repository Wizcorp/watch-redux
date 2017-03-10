var assign = require('./assign');


function reduceAllObjectProperties(state, action, reduce) {
	var changes = {};

	for (var key in state) {
		if (state.hasOwnProperty(key)) {
			changes[key] = reduce(state[key], action);
		}
	}

	return changes;
}

function reduceAllArrayEntries(state, action, reduce) {
	var changes = {};

	for (var i = 0; i < state.length; i += 1) {
		changes[i] = reduce(state[i], action);
	}

	return changes;
}


module.exports = function reduceAll(state, action, reduce) {
	if (!state || typeof state !== 'object') {
		throw new TypeError('You can only reduceAll arrays and objects');
	}

	if (typeof reduce !== 'function') {
		throw new TypeError('Reducer passed to reduceAll is not a function, found:' + typeof reduce);
	}

	var changes = Array.isArray(state) ?
		reduceAllArrayEntries(state, action, reduce) :
		reduceAllObjectProperties(state, action, reduce);

	return assign(state, changes);
};
