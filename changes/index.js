var changes = [];

exports.registerChange = function (oldState, newState) {
	changes.push({ oldState: oldState, newState: newState });
};

exports.fetchAndClearChanges = function () {
	var result = changes;
	changes = [];
	return result;
};
