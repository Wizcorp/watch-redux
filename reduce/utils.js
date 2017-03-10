exports.shallowArrayCopy = function (src) {
	return src.slice();
};

exports.shallowObjectCopy = function (src) {
	var trg = {};
	var keys = Object.keys(src);
	for (var i = 0; i < keys.length; i += 1) {
		var key = keys[i];
		trg[key] = src[key];
	}
	return trg;
};
