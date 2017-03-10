var test = require('tape');
var redux = require('redux');
var watchRedux = require('..');
var reduceAll = require('../reduce/reduceAll');

test('reduceAll(), watch()', function (t) {
	var initialState = {
		a: 'hello',
		b: 'world'
	};

	function reduce(state, action) {
		switch (action.type) {
		case 'UPPER':
			state = reduceAll(state, action, function (str) {
				return str.toUpperCase();
			});
			break;
		}
		return state;
	}

	var store = watchRedux.setup(redux.createStore(reduce, initialState));
	var dispatchCount = 0;

	// watchers trigger immediately
	watchRedux.watch({
		watch: function (state) {
			return {
				root: state
			};
		},
		transform: function (states) {
			return states.root;
		}
	}, function (output) {
		if (dispatchCount === 0) {
			// initial trigger

			t.deepEqual(output, {
				a: 'hello',
				b: 'world'
			});
		} else if (dispatchCount === 1) {
			// trigger after dispatch 1

			t.deepEqual(output, {
				a: 'HELLO',
				b: 'WORLD'
			});
			t.end();
		} else {
			t.fail('dispatchCount === ' + dispatchCount);
		}
	});

	// this non-change should not cause our watcher to trigger
	dispatchCount += 1;
	store.dispatch({ type: 'UPPER' });
});
