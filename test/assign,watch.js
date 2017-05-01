var test = require('tape');
var redux = require('redux');
var watchRedux = require('..');
var assign = require('../reduce/assign');
// var reduceAll = require('../reduce/reduceAll');

test('assign(), watch()', function (t) {
	var initialState = {
		foo: 0,
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
	var watcher = watchRedux.watch({
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

			t.equal(output, 0);
		} else if (dispatchCount === 1) {
			// trigger after dispatch 1

			t.equal(output, 1);
		} else if (dispatchCount === 2) {
			// trigger after dispatch 2

			t.equal(output, 3);
		} else {
			t.fail('dispatchCount === ' + dispatchCount);
		}
	});

	// this non-change should not cause our watcher to trigger
	dispatchCount += 1;
	store.dispatch({
		type: 'INC_FOO',
		amount: 1
	});

	// this change should cause our watcher to trigger
	dispatchCount += 1;
	store.dispatch({
		type: 'INC_FOO',
		amount: 2
	});

	watcher.destroy(); // more dispatches should not invoke our watcher callback anymore

	dispatchCount += 1;
	store.dispatch({
		type: 'INC_FOO',
		amount: 2
	});

	t.end();
});
