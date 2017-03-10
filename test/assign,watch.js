var test = require('tape');
var redux = require('redux');
var watchRedux = require('..');
var assign = require('../reduce/assign');
// var reduceAll = require('../reduce/reduceAll');

test('assign(), watch()', function (t) {
	var initialState = {
		foo: 1,
		bar: 'hello world'
	};

	function reduce(state, action) {
		if (action.type === 'INC_FOO') {
			state = assign(state, {
				foo: state.foo + action.amount
			});
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
			return states.root.foo;
		}
	}, function (output) {
		if (dispatchCount === 0) {
			// initial trigger

			t.equal(output, 1);
		} else if (dispatchCount === 2) {
			// trigger after dispatch 2

			t.equal(output, 2);
			t.end();
		} else {
			t.fail('dispatchCount === ' + dispatchCount);
		}
	});

	// this non-change should not cause our watcher to trigger
	dispatchCount += 1;
	store.dispatch({
		type: 'INC_FOO',
		amount: 0
	});

	// this change should cause our watcher to trigger
	dispatchCount += 1;
	store.dispatch({
		type: 'INC_FOO',
		amount: 1
	});
});
