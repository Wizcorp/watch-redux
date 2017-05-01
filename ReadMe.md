# watch-redux

## This is...

A library that makes observing changes in a Redux store using selectors very easy, and efficient. It provides watching
for changes with full granularity.

Disclaimer: This library is still in its early stages and may still undergo some development, polish and see new APIs.

## Installation

```sh
npm install watch-redux --save
```

## Details

`watch-redux` is smart enough to avoid invoking your watcher callbacks when values didn't really change. The only
requirement is that you don't assign to your old state objects (a general Redux rule, and best enforced with a library
such as [deep-freeze](https://www.npmjs.com/package/deep-freeze)), but instead use the built-in APIs to create new
objects and arrays when mutations occur.

In essence, we replace the `Object.assign`-pattern followed by a diffing algorithm by a single `assign()` function,
which immediately registers the change.

## Usage

### Bootstrapping

```js
var createStore = require('redux').createStore;
var watchRedux = require('watch-redux');

var store = createStore(/* how you normally set up your Redux store */);
watchRedux.setup(store);
```

### Reducers

For the system to know what changed, you need to use specialized API that helps with the assignment of properties to
your objects. That means you cannot depend on functions like `Object.assign`. Doing a diff after reducing is rather
heavy, and we want to avoid this by design.

#### Assigning values to an object

When assigning a value using `assign(state, changes)`, all changes will be registered and cause relevant watchers to be
notified.

Example:

```js
var assign = require('watch-redux/reduce/assign');

function reduce(state, action) {
	// eg: state is { age: 30 }

	if (action.type === 'AGE_INC') {
		state = assign(state, {
			age: state.age + action.inc
		});
	}

	return state;
}

store.dispatch({ type: 'AGE_INC', inc: 1 });
```

#### Reducing a collection of objects

The following example shows how to run a single reducer on each property of an object, or each entry of an array. This
will call `assign` for you on those entries.

```js
var assign = require('watch-redux/reduce/assign');
var reduceAll = require('watch-redux/reduce/reduceAll');

function reduceUser(state, action) {
	if (action.type === 'AGE_INC' && action.id === state.id) {
		state = assign(state, {
			age: state.age + action.inc
		});
	}
}

function reduce(state, action) {
	// eg: state is { abc: { id: 'abc', age: 30 }, def: { id: 'def', age: 40 } }

	return reduceAll(state, action, reduceUser);
}

store.dispatch({ type: 'AGE_INC', id: 'def', inc: 1 });
```

### Watchers

To watch for changes, you must register a selector. Selectors in `watch-redux` are objects with 2 methods:

* `watch(state)` receives the global state and must return a key/value object. Its values will be observed, and its keys
  serve as labels for the `transform` method.
* `transform(states)` receives the result of the call to `watch`. Every time any of the objects being watched changes,
  the `transform` method will be invoked again. It may return anything you want, and it will be the value passed to the
  callback you register.

The moment you register your watcher, its callback will be *immediately* invoked with the current value. We found that
this is very useful when you are linking your state to your UI.

Example:

```js
var userNameSelector = {
	watch: function (state) {
		// states is { users: { id: { name: 'Bob' }, ... } }
		return {
			user: state.users[state.myUserId]
		};
	},
	transform: function (states) {
		return states.user.name;
	}
};

var watcher = watchRedux.watch(userNameSelector, function (name) {
	console.log('My name is now:', name);
});

watcher.destroy();
```

Once you have no longer need to watch the selector, you may call `.destroy()` on the watcher object returned by
`watchRedux.watch(...)`. Your watcher callback will never be invoked again.

### License

MIT
