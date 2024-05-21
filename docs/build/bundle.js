
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
	'use strict';

	/** @returns {void} */
	function noop() {}

	/**
	 * @template T
	 * @template S
	 * @param {T} tar
	 * @param {S} src
	 * @returns {T & S}
	 */
	function assign(tar, src) {
		// @ts-ignore
		for (const k in src) tar[k] = src[k];
		return /** @type {T & S} */ (tar);
	}

	/** @returns {void} */
	function add_location(element, file, line, column, char) {
		element.__svelte_meta = {
			loc: { file, line, column, char }
		};
	}

	function run(fn) {
		return fn();
	}

	function blank_object() {
		return Object.create(null);
	}

	/**
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function run_all(fns) {
		fns.forEach(run);
	}

	/**
	 * @param {any} thing
	 * @returns {thing is Function}
	 */
	function is_function(thing) {
		return typeof thing === 'function';
	}

	/** @returns {boolean} */
	function safe_not_equal(a, b) {
		return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
	}

	let src_url_equal_anchor;

	/**
	 * @param {string} element_src
	 * @param {string} url
	 * @returns {boolean}
	 */
	function src_url_equal(element_src, url) {
		if (element_src === url) return true;
		if (!src_url_equal_anchor) {
			src_url_equal_anchor = document.createElement('a');
		}
		// This is actually faster than doing URL(..).href
		src_url_equal_anchor.href = url;
		return element_src === src_url_equal_anchor.href;
	}

	/** @returns {boolean} */
	function is_empty(obj) {
		return Object.keys(obj).length === 0;
	}

	/** @returns {void} */
	function validate_store(store, name) {
		if (store != null && typeof store.subscribe !== 'function') {
			throw new Error(`'${name}' is not a store with a 'subscribe' method`);
		}
	}

	function subscribe(store, ...callbacks) {
		if (store == null) {
			for (const callback of callbacks) {
				callback(undefined);
			}
			return noop;
		}
		const unsub = store.subscribe(...callbacks);
		return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
	}

	/** @returns {void} */
	function component_subscribe(component, store, callback) {
		component.$$.on_destroy.push(subscribe(store, callback));
	}

	function set_store_value(store, ret, value) {
		store.set(value);
		return ret;
	}

	function action_destroyer(action_result) {
		return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
	}

	/** @type {typeof globalThis} */
	const globals =
		typeof window !== 'undefined'
			? window
			: typeof globalThis !== 'undefined'
			? globalThis
			: // @ts-ignore Node typings have this
			  global;

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append(target, node) {
		target.appendChild(node);
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert(target, node, anchor) {
		target.insertBefore(node, anchor || null);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach(node) {
		if (node.parentNode) {
			node.parentNode.removeChild(node);
		}
	}

	/**
	 * @returns {void} */
	function destroy_each(iterations, detaching) {
		for (let i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detaching);
		}
	}

	/**
	 * @template {keyof HTMLElementTagNameMap} K
	 * @param {K} name
	 * @returns {HTMLElementTagNameMap[K]}
	 */
	function element(name) {
		return document.createElement(name);
	}

	/**
	 * @param {string} data
	 * @returns {Text}
	 */
	function text(data) {
		return document.createTextNode(data);
	}

	/**
	 * @returns {Text} */
	function space() {
		return text(' ');
	}

	/**
	 * @returns {Text} */
	function empty() {
		return text('');
	}

	/**
	 * @param {EventTarget} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @returns {() => void}
	 */
	function listen(node, event, handler, options) {
		node.addEventListener(event, handler, options);
		return () => node.removeEventListener(event, handler, options);
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
	}

	/**
	 * @param {Element} element
	 * @returns {ChildNode[]}
	 */
	function children(element) {
		return Array.from(element.childNodes);
	}

	/**
	 * @returns {void} */
	function set_style(node, key, value, important) {
		if (value == null) {
			node.style.removeProperty(key);
		} else {
			node.style.setProperty(key, value, important ? 'important' : '');
		}
	}

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @param {{ bubbles?: boolean, cancelable?: boolean }} [options]
	 * @returns {CustomEvent<T>}
	 */
	function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
		return new CustomEvent(type, { detail, bubbles, cancelable });
	}

	/**
	 * @typedef {Node & {
	 * 	claim_order?: number;
	 * 	hydrate_init?: true;
	 * 	actual_end_child?: NodeEx;
	 * 	childNodes: NodeListOf<NodeEx>;
	 * }} NodeEx
	 */

	/** @typedef {ChildNode & NodeEx} ChildNodeEx */

	/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

	/**
	 * @typedef {ChildNodeEx[] & {
	 * 	claim_info?: {
	 * 		last_index: number;
	 * 		total_claimed: number;
	 * 	};
	 * }} ChildNodeArray
	 */

	let current_component;

	/** @returns {void} */
	function set_current_component(component) {
		current_component = component;
	}

	function get_current_component() {
		if (!current_component) throw new Error('Function called outside component initialization');
		return current_component;
	}

	/**
	 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
	 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
	 * it can be called from an external module).
	 *
	 * If a function is returned _synchronously_ from `onMount`, it will be called when the component is unmounted.
	 *
	 * `onMount` does not run inside a [server-side component](https://svelte.dev/docs#run-time-server-side-component-api).
	 *
	 * https://svelte.dev/docs/svelte#onmount
	 * @template T
	 * @param {() => import('./private.js').NotFunction<T> | Promise<import('./private.js').NotFunction<T>> | (() => any)} fn
	 * @returns {void}
	 */
	function onMount(fn) {
		get_current_component().$$.on_mount.push(fn);
	}

	/**
	 * Schedules a callback to run immediately after the component has been updated.
	 *
	 * The first time the callback runs will be after the initial `onMount`
	 *
	 * https://svelte.dev/docs/svelte#afterupdate
	 * @param {() => any} fn
	 * @returns {void}
	 */
	function afterUpdate(fn) {
		get_current_component().$$.after_update.push(fn);
	}

	/**
	 * Schedules a callback to run immediately before the component is unmounted.
	 *
	 * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
	 * only one that runs inside a server-side component.
	 *
	 * https://svelte.dev/docs/svelte#ondestroy
	 * @param {() => any} fn
	 * @returns {void}
	 */
	function onDestroy(fn) {
		get_current_component().$$.on_destroy.push(fn);
	}

	/**
	 * Creates an event dispatcher that can be used to dispatch [component events](https://svelte.dev/docs#template-syntax-component-directives-on-eventname).
	 * Event dispatchers are functions that can take two arguments: `name` and `detail`.
	 *
	 * Component events created with `createEventDispatcher` create a
	 * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
	 * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
	 * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
	 * property and can contain any type of data.
	 *
	 * The event dispatcher can be typed to narrow the allowed event names and the type of the `detail` argument:
	 * ```ts
	 * const dispatch = createEventDispatcher<{
	 *  loaded: never; // does not take a detail argument
	 *  change: string; // takes a detail argument of type string, which is required
	 *  optional: number | null; // takes an optional detail argument of type number
	 * }>();
	 * ```
	 *
	 * https://svelte.dev/docs/svelte#createeventdispatcher
	 * @template {Record<string, any>} [EventMap=any]
	 * @returns {import('./public.js').EventDispatcher<EventMap>}
	 */
	function createEventDispatcher() {
		const component = get_current_component();
		return (type, detail, { cancelable = false } = {}) => {
			const callbacks = component.$$.callbacks[type];
			if (callbacks) {
				// TODO are there situations where events could be dispatched
				// in a server (non-DOM) environment?
				const event = custom_event(/** @type {string} */ (type), detail, { cancelable });
				callbacks.slice().forEach((fn) => {
					fn.call(component, event);
				});
				return !event.defaultPrevented;
			}
			return true;
		};
	}

	// TODO figure out if we still want to support
	// shorthand events, or if we want to implement
	// a real bubbling mechanism
	/**
	 * @param component
	 * @param event
	 * @returns {void}
	 */
	function bubble(component, event) {
		const callbacks = component.$$.callbacks[event.type];
		if (callbacks) {
			// @ts-ignore
			callbacks.slice().forEach((fn) => fn.call(this, event));
		}
	}

	const dirty_components = [];
	const binding_callbacks = [];

	let render_callbacks = [];

	const flush_callbacks = [];

	const resolved_promise = /* @__PURE__ */ Promise.resolve();

	let update_scheduled = false;

	/** @returns {void} */
	function schedule_update() {
		if (!update_scheduled) {
			update_scheduled = true;
			resolved_promise.then(flush);
		}
	}

	/** @returns {Promise<void>} */
	function tick() {
		schedule_update();
		return resolved_promise;
	}

	/** @returns {void} */
	function add_render_callback(fn) {
		render_callbacks.push(fn);
	}

	// flush() calls callbacks in this order:
	// 1. All beforeUpdate callbacks, in order: parents before children
	// 2. All bind:this callbacks, in reverse order: children before parents.
	// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
	//    for afterUpdates called during the initial onMount, which are called in
	//    reverse order: children before parents.
	// Since callbacks might update component values, which could trigger another
	// call to flush(), the following steps guard against this:
	// 1. During beforeUpdate, any updated components will be added to the
	//    dirty_components array and will cause a reentrant call to flush(). Because
	//    the flush index is kept outside the function, the reentrant call will pick
	//    up where the earlier call left off and go through all dirty components. The
	//    current_component value is saved and restored so that the reentrant call will
	//    not interfere with the "parent" flush() call.
	// 2. bind:this callbacks cannot trigger new flush() calls.
	// 3. During afterUpdate, any updated components will NOT have their afterUpdate
	//    callback called a second time; the seen_callbacks set, outside the flush()
	//    function, guarantees this behavior.
	const seen_callbacks = new Set();

	let flushidx = 0; // Do *not* move this inside the flush() function

	/** @returns {void} */
	function flush() {
		// Do not reenter flush while dirty components are updated, as this can
		// result in an infinite loop. Instead, let the inner flush handle it.
		// Reentrancy is ok afterwards for bindings etc.
		if (flushidx !== 0) {
			return;
		}
		const saved_component = current_component;
		do {
			// first, call beforeUpdate functions
			// and update components
			try {
				while (flushidx < dirty_components.length) {
					const component = dirty_components[flushidx];
					flushidx++;
					set_current_component(component);
					update(component.$$);
				}
			} catch (e) {
				// reset dirty state to not end up in a deadlocked state and then rethrow
				dirty_components.length = 0;
				flushidx = 0;
				throw e;
			}
			set_current_component(null);
			dirty_components.length = 0;
			flushidx = 0;
			while (binding_callbacks.length) binding_callbacks.pop()();
			// then, once components are updated, call
			// afterUpdate functions. This may cause
			// subsequent updates...
			for (let i = 0; i < render_callbacks.length; i += 1) {
				const callback = render_callbacks[i];
				if (!seen_callbacks.has(callback)) {
					// ...so guard against infinite loops
					seen_callbacks.add(callback);
					callback();
				}
			}
			render_callbacks.length = 0;
		} while (dirty_components.length);
		while (flush_callbacks.length) {
			flush_callbacks.pop()();
		}
		update_scheduled = false;
		seen_callbacks.clear();
		set_current_component(saved_component);
	}

	/** @returns {void} */
	function update($$) {
		if ($$.fragment !== null) {
			$$.update();
			run_all($$.before_update);
			const dirty = $$.dirty;
			$$.dirty = [-1];
			$$.fragment && $$.fragment.p($$.ctx, dirty);
			$$.after_update.forEach(add_render_callback);
		}
	}

	/**
	 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function flush_render_callbacks(fns) {
		const filtered = [];
		const targets = [];
		render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
		targets.forEach((c) => c());
		render_callbacks = filtered;
	}

	const outroing = new Set();

	/**
	 * @type {Outro}
	 */
	let outros;

	/**
	 * @returns {void} */
	function group_outros() {
		outros = {
			r: 0,
			c: [],
			p: outros // parent group
		};
	}

	/**
	 * @returns {void} */
	function check_outros() {
		if (!outros.r) {
			run_all(outros.c);
		}
		outros = outros.p;
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} [local]
	 * @returns {void}
	 */
	function transition_in(block, local) {
		if (block && block.i) {
			outroing.delete(block);
			block.i(local);
		}
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} local
	 * @param {0 | 1} [detach]
	 * @param {() => void} [callback]
	 * @returns {void}
	 */
	function transition_out(block, local, detach, callback) {
		if (block && block.o) {
			if (outroing.has(block)) return;
			outroing.add(block);
			outros.c.push(() => {
				outroing.delete(block);
				if (callback) {
					if (detach) block.d(1);
					callback();
				}
			});
			block.o(local);
		} else if (callback) {
			callback();
		}
	}

	/** @typedef {1} INTRO */
	/** @typedef {0} OUTRO */
	/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
	/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

	/**
	 * @typedef {Object} Outro
	 * @property {number} r
	 * @property {Function[]} c
	 * @property {Object} p
	 */

	/**
	 * @typedef {Object} PendingProgram
	 * @property {number} start
	 * @property {INTRO|OUTRO} b
	 * @property {Outro} [group]
	 */

	/**
	 * @typedef {Object} Program
	 * @property {number} a
	 * @property {INTRO|OUTRO} b
	 * @property {1|-1} d
	 * @property {number} duration
	 * @property {number} start
	 * @property {number} end
	 * @property {Outro} [group]
	 */

	// general each functions:

	function ensure_array_like(array_like_or_iterator) {
		return array_like_or_iterator?.length !== undefined
			? array_like_or_iterator
			: Array.from(array_like_or_iterator);
	}

	/** @returns {{}} */
	function get_spread_update(levels, updates) {
		const update = {};
		const to_null_out = {};
		const accounted_for = { $$scope: 1 };
		let i = levels.length;
		while (i--) {
			const o = levels[i];
			const n = updates[i];
			if (n) {
				for (const key in o) {
					if (!(key in n)) to_null_out[key] = 1;
				}
				for (const key in n) {
					if (!accounted_for[key]) {
						update[key] = n[key];
						accounted_for[key] = 1;
					}
				}
				levels[i] = n;
			} else {
				for (const key in o) {
					accounted_for[key] = 1;
				}
			}
		}
		for (const key in to_null_out) {
			if (!(key in update)) update[key] = undefined;
		}
		return update;
	}

	function get_spread_object(spread_props) {
		return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
	}

	/** @returns {void} */
	function create_component(block) {
		block && block.c();
	}

	/** @returns {void} */
	function mount_component(component, target, anchor) {
		const { fragment, after_update } = component.$$;
		fragment && fragment.m(target, anchor);
		// onMount happens before the initial afterUpdate
		add_render_callback(() => {
			const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
			// if the component was destroyed immediately
			// it will update the `$$.on_destroy` reference to `null`.
			// the destructured on_destroy may still reference to the old array
			if (component.$$.on_destroy) {
				component.$$.on_destroy.push(...new_on_destroy);
			} else {
				// Edge case - component was destroyed immediately,
				// most likely as a result of a binding initialising
				run_all(new_on_destroy);
			}
			component.$$.on_mount = [];
		});
		after_update.forEach(add_render_callback);
	}

	/** @returns {void} */
	function destroy_component(component, detaching) {
		const $$ = component.$$;
		if ($$.fragment !== null) {
			flush_render_callbacks($$.after_update);
			run_all($$.on_destroy);
			$$.fragment && $$.fragment.d(detaching);
			// TODO null out other refs, including component.$$ (but need to
			// preserve final state?)
			$$.on_destroy = $$.fragment = null;
			$$.ctx = [];
		}
	}

	/** @returns {void} */
	function make_dirty(component, i) {
		if (component.$$.dirty[0] === -1) {
			dirty_components.push(component);
			schedule_update();
			component.$$.dirty.fill(0);
		}
		component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
	}

	// TODO: Document the other params
	/**
	 * @param {SvelteComponent} component
	 * @param {import('./public.js').ComponentConstructorOptions} options
	 *
	 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
	 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
	 * This will be the `add_css` function from the compiled component.
	 *
	 * @returns {void}
	 */
	function init(
		component,
		options,
		instance,
		create_fragment,
		not_equal,
		props,
		append_styles = null,
		dirty = [-1]
	) {
		const parent_component = current_component;
		set_current_component(component);
		/** @type {import('./private.js').T$$} */
		const $$ = (component.$$ = {
			fragment: null,
			ctx: [],
			// state
			props,
			update: noop,
			not_equal,
			bound: blank_object(),
			// lifecycle
			on_mount: [],
			on_destroy: [],
			on_disconnect: [],
			before_update: [],
			after_update: [],
			context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
			// everything else
			callbacks: blank_object(),
			dirty,
			skip_bound: false,
			root: options.target || parent_component.$$.root
		});
		append_styles && append_styles($$.root);
		let ready = false;
		$$.ctx = instance
			? instance(component, options.props || {}, (i, ret, ...rest) => {
					const value = rest.length ? rest[0] : ret;
					if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
						if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
						if (ready) make_dirty(component, i);
					}
					return ret;
			  })
			: [];
		$$.update();
		ready = true;
		run_all($$.before_update);
		// `false` as a special case of no DOM component
		$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
		if (options.target) {
			if (options.hydrate) {
				// TODO: what is the correct type here?
				// @ts-expect-error
				const nodes = children(options.target);
				$$.fragment && $$.fragment.l(nodes);
				nodes.forEach(detach);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.c();
			}
			if (options.intro) transition_in(component.$$.fragment);
			mount_component(component, options.target, options.anchor);
			flush();
		}
		set_current_component(parent_component);
	}

	/**
	 * Base class for Svelte components. Used when dev=false.
	 *
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 */
	class SvelteComponent {
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$ = undefined;
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$set = undefined;

		/** @returns {void} */
		$destroy() {
			destroy_component(this, 1);
			this.$destroy = noop;
		}

		/**
		 * @template {Extract<keyof Events, string>} K
		 * @param {K} type
		 * @param {((e: Events[K]) => void) | null | undefined} callback
		 * @returns {() => void}
		 */
		$on(type, callback) {
			if (!is_function(callback)) {
				return noop;
			}
			const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
			callbacks.push(callback);
			return () => {
				const index = callbacks.indexOf(callback);
				if (index !== -1) callbacks.splice(index, 1);
			};
		}

		/**
		 * @param {Partial<Props>} props
		 * @returns {void}
		 */
		$set(props) {
			if (this.$$set && !is_empty(props)) {
				this.$$.skip_bound = true;
				this.$$set(props);
				this.$$.skip_bound = false;
			}
		}
	}

	/**
	 * @typedef {Object} CustomElementPropDefinition
	 * @property {string} [attribute]
	 * @property {boolean} [reflect]
	 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
	 */

	// generated during release, do not modify

	/**
	 * The current version, as set in package.json.
	 *
	 * https://svelte.dev/docs/svelte-compiler#svelte-version
	 * @type {string}
	 */
	const VERSION = '4.2.17';
	const PUBLIC_VERSION = '4';

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @returns {void}
	 */
	function dispatch_dev(type, detail) {
		document.dispatchEvent(custom_event(type, { version: VERSION, ...detail }, { bubbles: true }));
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append_dev(target, node) {
		dispatch_dev('SvelteDOMInsert', { target, node });
		append(target, node);
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert_dev(target, node, anchor) {
		dispatch_dev('SvelteDOMInsert', { target, node, anchor });
		insert(target, node, anchor);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach_dev(node) {
		dispatch_dev('SvelteDOMRemove', { node });
		detach(node);
	}

	/**
	 * @param {Node} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @param {boolean} [has_prevent_default]
	 * @param {boolean} [has_stop_propagation]
	 * @param {boolean} [has_stop_immediate_propagation]
	 * @returns {() => void}
	 */
	function listen_dev(
		node,
		event,
		handler,
		options,
		has_prevent_default,
		has_stop_propagation,
		has_stop_immediate_propagation
	) {
		const modifiers =
			options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
		if (has_prevent_default) modifiers.push('preventDefault');
		if (has_stop_propagation) modifiers.push('stopPropagation');
		if (has_stop_immediate_propagation) modifiers.push('stopImmediatePropagation');
		dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
		const dispose = listen(node, event, handler, options);
		return () => {
			dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
			dispose();
		};
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr_dev(node, attribute, value) {
		attr(node, attribute, value);
		if (value == null) dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
		else dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
	}

	/**
	 * @param {Text} text
	 * @param {unknown} data
	 * @returns {void}
	 */
	function set_data_dev(text, data) {
		data = '' + data;
		if (text.data === data) return;
		dispatch_dev('SvelteDOMSetData', { node: text, data });
		text.data = /** @type {string} */ (data);
	}

	function ensure_array_like_dev(arg) {
		if (
			typeof arg !== 'string' &&
			!(arg && typeof arg === 'object' && 'length' in arg) &&
			!(typeof Symbol === 'function' && arg && Symbol.iterator in arg)
		) {
			throw new Error('{#each} only works with iterable values.');
		}
		return ensure_array_like(arg);
	}

	/**
	 * @returns {void} */
	function validate_slots(name, slot, keys) {
		for (const slot_key of Object.keys(slot)) {
			if (!~keys.indexOf(slot_key)) {
				console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
			}
		}
	}

	function construct_svelte_component_dev(component, props) {
		const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
		try {
			const instance = new component(props);
			if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
				throw new Error(error_message);
			}
			return instance;
		} catch (err) {
			const { message } = err;
			if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
				throw new Error(error_message);
			} else {
				throw err;
			}
		}
	}

	/**
	 * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
	 *
	 * Can be used to create strongly typed Svelte components.
	 *
	 * #### Example:
	 *
	 * You have component library on npm called `component-library`, from which
	 * you export a component called `MyComponent`. For Svelte+TypeScript users,
	 * you want to provide typings. Therefore you create a `index.d.ts`:
	 * ```ts
	 * import { SvelteComponent } from "svelte";
	 * export class MyComponent extends SvelteComponent<{foo: string}> {}
	 * ```
	 * Typing this makes it possible for IDEs like VS Code with the Svelte extension
	 * to provide intellisense and to use the component like this in a Svelte file
	 * with TypeScript:
	 * ```svelte
	 * <script lang="ts">
	 * 	import { MyComponent } from "component-library";
	 * </script>
	 * <MyComponent foo={'bar'} />
	 * ```
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 * @template {Record<string, any>} [Slots=any]
	 * @extends {SvelteComponent<Props, Events>}
	 */
	class SvelteComponentDev extends SvelteComponent {
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Props}
		 */
		$$prop_def;
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Events}
		 */
		$$events_def;
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Slots}
		 */
		$$slot_def;

		/** @param {import('./public.js').ComponentConstructorOptions<Props>} options */
		constructor(options) {
			if (!options || (!options.target && !options.$$inline)) {
				throw new Error("'target' is a required option");
			}
			super();
		}

		/** @returns {void} */
		$destroy() {
			super.$destroy();
			this.$destroy = () => {
				console.warn('Component was already destroyed'); // eslint-disable-line no-console
			};
		}

		/** @returns {void} */
		$capture_state() {}

		/** @returns {void} */
		$inject_state() {}
	}

	if (typeof window !== 'undefined')
		// @ts-ignore
		(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

	const subscriber_queue = [];

	/**
	 * Creates a `Readable` store that allows reading by subscription.
	 *
	 * https://svelte.dev/docs/svelte-store#readable
	 * @template T
	 * @param {T} [value] initial value
	 * @param {import('./public.js').StartStopNotifier<T>} [start]
	 * @returns {import('./public.js').Readable<T>}
	 */
	function readable(value, start) {
		return {
			subscribe: writable(value, start).subscribe
		};
	}

	/**
	 * Create a `Writable` store that allows both updating and reading by subscription.
	 *
	 * https://svelte.dev/docs/svelte-store#writable
	 * @template T
	 * @param {T} [value] initial value
	 * @param {import('./public.js').StartStopNotifier<T>} [start]
	 * @returns {import('./public.js').Writable<T>}
	 */
	function writable(value, start = noop) {
		/** @type {import('./public.js').Unsubscriber} */
		let stop;
		/** @type {Set<import('./private.js').SubscribeInvalidateTuple<T>>} */
		const subscribers = new Set();
		/** @param {T} new_value
		 * @returns {void}
		 */
		function set(new_value) {
			if (safe_not_equal(value, new_value)) {
				value = new_value;
				if (stop) {
					// store is ready
					const run_queue = !subscriber_queue.length;
					for (const subscriber of subscribers) {
						subscriber[1]();
						subscriber_queue.push(subscriber, value);
					}
					if (run_queue) {
						for (let i = 0; i < subscriber_queue.length; i += 2) {
							subscriber_queue[i][0](subscriber_queue[i + 1]);
						}
						subscriber_queue.length = 0;
					}
				}
			}
		}

		/**
		 * @param {import('./public.js').Updater<T>} fn
		 * @returns {void}
		 */
		function update(fn) {
			set(fn(value));
		}

		/**
		 * @param {import('./public.js').Subscriber<T>} run
		 * @param {import('./private.js').Invalidator<T>} [invalidate]
		 * @returns {import('./public.js').Unsubscriber}
		 */
		function subscribe(run, invalidate = noop) {
			/** @type {import('./private.js').SubscribeInvalidateTuple<T>} */
			const subscriber = [run, invalidate];
			subscribers.add(subscriber);
			if (subscribers.size === 1) {
				stop = start(set, update) || noop;
			}
			run(value);
			return () => {
				subscribers.delete(subscriber);
				if (subscribers.size === 0 && stop) {
					stop();
					stop = null;
				}
			};
		}
		return { set, update, subscribe };
	}

	/**
	 * Derived value store by synchronizing one or more readable stores and
	 * applying an aggregation function over its input values.
	 *
	 * https://svelte.dev/docs/svelte-store#derived
	 * @template {import('./private.js').Stores} S
	 * @template T
	 * @overload
	 * @param {S} stores - input stores
	 * @param {(values: import('./private.js').StoresValues<S>, set: (value: T) => void, update: (fn: import('./public.js').Updater<T>) => void) => import('./public.js').Unsubscriber | void} fn - function callback that aggregates the values
	 * @param {T} [initial_value] - initial value
	 * @returns {import('./public.js').Readable<T>}
	 */

	/**
	 * Derived value store by synchronizing one or more readable stores and
	 * applying an aggregation function over its input values.
	 *
	 * https://svelte.dev/docs/svelte-store#derived
	 * @template {import('./private.js').Stores} S
	 * @template T
	 * @overload
	 * @param {S} stores - input stores
	 * @param {(values: import('./private.js').StoresValues<S>) => T} fn - function callback that aggregates the values
	 * @param {T} [initial_value] - initial value
	 * @returns {import('./public.js').Readable<T>}
	 */

	/**
	 * @template {import('./private.js').Stores} S
	 * @template T
	 * @param {S} stores
	 * @param {Function} fn
	 * @param {T} [initial_value]
	 * @returns {import('./public.js').Readable<T>}
	 */
	function derived(stores, fn, initial_value) {
		const single = !Array.isArray(stores);
		/** @type {Array<import('./public.js').Readable<any>>} */
		const stores_array = single ? [stores] : stores;
		if (!stores_array.every(Boolean)) {
			throw new Error('derived() expects stores as input, got a falsy value');
		}
		const auto = fn.length < 2;
		return readable(initial_value, (set, update) => {
			let started = false;
			const values = [];
			let pending = 0;
			let cleanup = noop;
			const sync = () => {
				if (pending) {
					return;
				}
				cleanup();
				const result = fn(single ? values[0] : values, set, update);
				if (auto) {
					set(result);
				} else {
					cleanup = is_function(result) ? result : noop;
				}
			};
			const unsubscribers = stores_array.map((store, i) =>
				subscribe(
					store,
					(value) => {
						values[i] = value;
						pending &= ~(1 << i);
						if (started) {
							sync();
						}
					},
					() => {
						pending |= 1 << i;
					}
				)
			);
			started = true;
			sync();
			return function stop() {
				run_all(unsubscribers);
				cleanup();
				// We need to set this to false because callbacks can still happen despite having unsubscribed:
				// Callbacks might already be placed in the queue which doesn't know it should no longer
				// invoke this derived store.
				started = false;
			};
		});
	}

	const questions = writable([]);
	const responses = writable([]);
	const current = writable(0);
	const citations = readable(
	  [
	    {
	      "id": "AlpertRaffia1982",
	      "text": "Alpert, Marc, and Howard Raiffa. <a href=\"https://www.cambridge.org/core/books/judgment-under-uncertainty/progress-report-on-the-training-of-probability-assessors/31260BD808E5E66745DB3E426BCDD3B0\">\"A Progress Report on the Training of Probability Assessors.\"</a> In <a href=\"http://www.amazon.com/gp/product/0521284147/\"><i>Judgment Under Uncertainty: Heuristics and Biases</i></a>, edited by Daniel Kahneman, Paul Slovic, and Amos Tversky, 294-305. Cambridge University Press, 1982. <a href=\"http://dx.doi.org/10.1017/CBO9780511809477.022\">http://dx.doi.org/10.1017/CBO9780511809477.022</a>."
	    },
	    {
	      "id": "Gill2005",
	      "text": "Gill, C. J. <a href=\"http://www.ncbi.nlm.nih.gov/pmc/articles/PMC557240/pdf/bmj33001080.pdf\">\"Why Clinicians Are Natural Bayesians.\"</a> <i>BMJ</i> 330, no. 7499 (May 7, 2005): 1080-1083. doi:10.1136/bmj.330.7499.1080."
	    },
	    {
	      "id": "GunzelmannGluck2004",
	      "text": "Gunzelmann, G., and K.A. Gluck. <a href=\"http://act-r.psy.cmu.edu/papers/710/gunzelmann_gluck-2004.pdf\">\"Knowledge Tracing for Complex Training Applications: Beyond Bayesian Mastery Estimates\"</a> In <i>Proceedings of the Thirteenth Conference on Behavior Representation in Modeling and Simulation</i>, 383-384. Orlando, FL: Simulation Interoperability Standards Organization, 2004."
	    },
	    {
	      "id": "Hubbard2010",
	      "text": "Hubbard, Douglas W. <a href=\"http://www.amazon.com/gp/product/0470539399/\"><!--http://www.jpmeloche.com/crr/ebooksclub.org__How_to_Measure_Anything__Finding_the_Value_of_Intangibles_in_Business__Second_Edition.pdf--><i>How to Measure Anything Finding the Value of Intangibles in Business</i></a>. 2ed. Wiley, 2010."
	    },
	    {
	      "id": "Jeffery2002",
	      "text": "Jeffery, Richard. <a href=\"http://www.princeton.edu/~bayesway/Book*.pdf\"><i>Subjective Probability: The Real Thing</i></a>. Cambridge University Press, 2002."
	    },
	    {
	      "id": "Kahneman2011",
	      "text": "Kahneman, Daniel. <a href=\"http://www.nytimes.com/2011/10/23/magazine/dont-blink-the-hazards-of-confidence.html\">\"Don't Blink! The Hazards of Confidence.\"</a> <i>The New York Times</i>, October 19, 2011, sec. Magazine."
	    },
	    {
	      "id": "KassinFong1999",
	      "text": "Kassin, Saul M., and Christina T. Fong. <a href=\"http://web.williams.edu/Psychology/Faculty/Kassin/files/kassin_fong_1999.pdf\">\"'I'm Innocent!': Effects of Training on Judgments of Truth and Deception in the Interrogation Room.\"</a> <i>Law and Human Behavior</i> 23, no. 5 (October 1, 1999): 499-516. doi:10.1023/A:1022330011811."
	    },
	    {
	      "id": "Knight1921",
	      "text": "Knight, Frank H. (Frank Hyneman). <a href=\"http://www.amazon.com/gp/product/1602060053/\"><!--http://www.econlib.org/library/Knight/knRUP.html--><i>Risk, Uncertainty and Profit</i></a>. Boston, New York, Houghton Mifflin Company, 1921."
	    },
	    {
	      "id": "LichtensteinFischhoff1978",
	      "text": "Lichtenstein, Sarah, and Baruch Fischhoff. <a href=\"http://www.dtic.mil/dtic/tr/fulltext/u2/a069703.pdf\"><i>Training for Calibration</i></a>, November 1978."
	    },
	    {
	      "id": "LichtensteinEtAl1982",
	      "text": "Lichtenstein, Sarah, Baruch Fischhoff, and Lawrence D. Phillips. <a href=\"http://www.dtic.mil/dtic/tr/fulltext/u2/a101986.pdf\">\"Calibration of Probabilities: The State of the Art to 1980.\"</a> In <a href=\"http://www.amazon.com/gp/product/0521284147/\"><i>Judgment Under Uncertainty: Heuristics and Biases</i></a>, edited by Daniel Kahneman, Paul Slovic, and Amos Tversky, 306-334. Cambridge, UK: Cambridge University Press, 1982."
	    },
	    {
	      "id": "LindeyEtAl1979",
	      "text": "Lindley, D. V., A. Tversky, and R. V. Brown. <a href=\"citations/Lindly_et_al-On_the_Reconciliation_of_Probability_Assessments.pdf\">\"On the Reconciliation of Probability Assessments.\"</a> <i>Journal of the Royal Statistical Society. Series A (General)</i> 142, no. 2 (January 1, 1979): 146-180. doi:10.2307/2345078."
	    },
	    {
	      "id": "Marx2013",
	      "text": "Marx, Vivien.  <a href=\"http://www.nature.com/nmeth/journal/v10/n7/full/nmeth.2530.html\">\"Data Visualization: Ambiguity as a Fellow Traveler.\"</a> <i>Nature Methods</i> 10, no. 7 (July 2013): 613-615. doi:10.1038/nmeth.2530."
	    },
	    {
	      "id": "McIntyre2007",
	      "text": "McIntyre, M.E. <a href=\"http://www.atm.damtp.cam.ac.uk/mcintyre/mcintyre-thinking-probabilistically.pdf\">\"On Thinking Probabilistically.\"</a> In <i>Extreme Events (Proc. 15th 'Aha Huliko'a Workshop)</i>, 153-161. U. of Hawaii: SOEST, 2007."
	    },
	    {
	      "id": "Oskamp1965",
	      "text": "Oskamp, Stuart. <a href=\"citations/Oskamp-Overconfidence_in_Case_Study_Judgements.pdf\">\"Overconfidence in Case-study Judgments.\"</a> <i>Journal of Consulting Psychology</i> 29, no. 3 (1965): 261-265. doi:10.1037/h0022125."
	    },
	    {
	      "id": "Plous1993",
	      "text": "Plous, Scott. <a href=\"http://www.amazon.com/gp/product/0070504776/\"><i>The Psychology of Judgment and Decision Making</i></a>. New York: McGraw-Hill, 1993."
	    },
	    {
	      "id": "RadzevickMoore2009",
	      "text": "Radzevick, Joseph R., and Don A. Moore. <a href=\"http://www.gsb.stanford.edu/sites/default/files/documents/ob_01_09_moore.pdf\">\"Competing to Be Certain (but Wrong): Social Pressure and Overprecision in Judgment.\"</a> <i>Academy of Management Proceedings</i> 2009, no. 1 (August 1, 2009): 1-6. doi:10.5465/AMBPP.2009.44246308."
	    },
	    {
	      "id": "Silver2012",
	      "text": "Silver, Nate. <a href=\"http://www.amazon.com/gp/product/159420411X/\"><i>The Signal and the Noise: Why So Many Predictions Fail - but Some Don't</i></a>. 1ed. Penguin Press HC, The, 2012."
	    },
	    {
	      "id": "Wilson1994",
	      "text": "Wilson, Alyson G. <a href=\"http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.71.4909&rep=rep1&type=pdf\">\"Cognitive Factors Affecting Subjective Probability Assessment,\"</a> 1994."
	    },
	  ]
	);

	/* src/Question.svelte generated by Svelte v4.2.17 */
	const file$7 = "src/Question.svelte";

	function create_fragment$9(ctx) {
		let div5;
		let div4;
		let h5;
		let t0_value = /*question*/ ctx[0].text + "";
		let t0;
		let t1;
		let div3;
		let div0;
		let t2_value = /*question*/ ctx[0].o1.name + "";
		let t2;
		let t3;
		let div1;
		let button0;
		let t5;
		let button1;
		let t7;
		let button2;
		let t9;
		let button3;
		let t11;
		let button4;
		let t13;
		let button5;
		let t15;
		let button6;
		let t17;
		let button7;
		let t19;
		let button8;
		let t21;
		let button9;
		let t23;
		let div2;
		let t24_value = /*question*/ ctx[0].o2.name + "";
		let t24;
		let mounted;
		let dispose;

		const block = {
			c: function create() {
				div5 = element("div");
				div4 = element("div");
				h5 = element("h5");
				t0 = text(t0_value);
				t1 = space();
				div3 = element("div");
				div0 = element("div");
				t2 = text(t2_value);
				t3 = space();
				div1 = element("div");
				button0 = element("button");
				button0.textContent = "95%";
				t5 = space();
				button1 = element("button");
				button1.textContent = "85%";
				t7 = space();
				button2 = element("button");
				button2.textContent = "75%";
				t9 = space();
				button3 = element("button");
				button3.textContent = "65%";
				t11 = space();
				button4 = element("button");
				button4.textContent = "55%";
				t13 = space();
				button5 = element("button");
				button5.textContent = "55%";
				t15 = space();
				button6 = element("button");
				button6.textContent = "65%";
				t17 = space();
				button7 = element("button");
				button7.textContent = "75%";
				t19 = space();
				button8 = element("button");
				button8.textContent = "85%";
				t21 = space();
				button9 = element("button");
				button9.textContent = "95%";
				t23 = space();
				div2 = element("div");
				t24 = text(t24_value);
				attr_dev(h5, "class", "card-title text-center p-4");
				add_location(h5, file$7, 19, 4, 358);
				attr_dev(div0, "class", "p-2 d-inline-block text-right");
				set_style(div0, "width", "12rem");
				add_location(div0, file$7, 21, 6, 457);
				add_location(button0, file$7, 25, 8, 650);
				add_location(button1, file$7, 26, 8, 746);
				add_location(button2, file$7, 27, 8, 842);
				add_location(button3, file$7, 28, 8, 938);
				add_location(button4, file$7, 29, 8, 1034);
				add_location(button5, file$7, 30, 8, 1130);
				add_location(button6, file$7, 31, 8, 1226);
				add_location(button7, file$7, 32, 8, 1322);
				add_location(button8, file$7, 33, 8, 1418);
				add_location(button9, file$7, 34, 8, 1514);
				attr_dev(div1, "class", "align-items-center justify-content-center d-inline-block");
				add_location(div1, file$7, 24, 6, 571);
				attr_dev(div2, "class", "p-2 d-inline-block text-left");
				set_style(div2, "width", "12rem");
				add_location(div2, file$7, 36, 6, 1621);
				attr_dev(div3, "class", "card-text pb-3");
				add_location(div3, file$7, 20, 4, 422);
				attr_dev(div4, "class", "card-body text-center");
				add_location(div4, file$7, 18, 2, 318);
				attr_dev(div5, "class", "card");
				add_location(div5, file$7, 17, 0, 297);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div5, anchor);
				append_dev(div5, div4);
				append_dev(div4, h5);
				append_dev(h5, t0);
				append_dev(div4, t1);
				append_dev(div4, div3);
				append_dev(div3, div0);
				append_dev(div0, t2);
				append_dev(div3, t3);
				append_dev(div3, div1);
				append_dev(div1, button0);
				append_dev(div1, t5);
				append_dev(div1, button1);
				append_dev(div1, t7);
				append_dev(div1, button2);
				append_dev(div1, t9);
				append_dev(div1, button3);
				append_dev(div1, t11);
				append_dev(div1, button4);
				append_dev(div1, t13);
				append_dev(div1, button5);
				append_dev(div1, t15);
				append_dev(div1, button6);
				append_dev(div1, t17);
				append_dev(div1, button7);
				append_dev(div1, t19);
				append_dev(div1, button8);
				append_dev(div1, t21);
				append_dev(div1, button9);
				append_dev(div3, t23);
				append_dev(div3, div2);
				append_dev(div2, t24);

				if (!mounted) {
					dispose = [
						listen_dev(
							button0,
							"click",
							function () {
								if (is_function(/*handleClick*/ ctx[1](/*question*/ ctx[0].fact, /*question*/ ctx[0].k1, 95, false))) /*handleClick*/ ctx[1](/*question*/ ctx[0].fact, /*question*/ ctx[0].k1, 95, false).apply(this, arguments);
							},
							{ once: true },
							false,
							false,
							false
						),
						listen_dev(
							button1,
							"click",
							function () {
								if (is_function(/*handleClick*/ ctx[1](/*question*/ ctx[0].fact, /*question*/ ctx[0].k1, 85, false))) /*handleClick*/ ctx[1](/*question*/ ctx[0].fact, /*question*/ ctx[0].k1, 85, false).apply(this, arguments);
							},
							{ once: true },
							false,
							false,
							false
						),
						listen_dev(
							button2,
							"click",
							function () {
								if (is_function(/*handleClick*/ ctx[1](/*question*/ ctx[0].fact, /*question*/ ctx[0].k1, 75, false))) /*handleClick*/ ctx[1](/*question*/ ctx[0].fact, /*question*/ ctx[0].k1, 75, false).apply(this, arguments);
							},
							{ once: true },
							false,
							false,
							false
						),
						listen_dev(
							button3,
							"click",
							function () {
								if (is_function(/*handleClick*/ ctx[1](/*question*/ ctx[0].fact, /*question*/ ctx[0].k1, 65, false))) /*handleClick*/ ctx[1](/*question*/ ctx[0].fact, /*question*/ ctx[0].k1, 65, false).apply(this, arguments);
							},
							{ once: true },
							false,
							false,
							false
						),
						listen_dev(
							button4,
							"click",
							function () {
								if (is_function(/*handleClick*/ ctx[1](/*question*/ ctx[0].fact, /*question*/ ctx[0].k1, 55, false))) /*handleClick*/ ctx[1](/*question*/ ctx[0].fact, /*question*/ ctx[0].k1, 55, false).apply(this, arguments);
							},
							{ once: true },
							false,
							false,
							false
						),
						listen_dev(
							button5,
							"click",
							function () {
								if (is_function(/*handleClick*/ ctx[1](/*question*/ ctx[0].fact, /*question*/ ctx[0].k2, 55, false))) /*handleClick*/ ctx[1](/*question*/ ctx[0].fact, /*question*/ ctx[0].k2, 55, false).apply(this, arguments);
							},
							{ once: true },
							false,
							false,
							false
						),
						listen_dev(
							button6,
							"click",
							function () {
								if (is_function(/*handleClick*/ ctx[1](/*question*/ ctx[0].fact, /*question*/ ctx[0].k2, 65, false))) /*handleClick*/ ctx[1](/*question*/ ctx[0].fact, /*question*/ ctx[0].k2, 65, false).apply(this, arguments);
							},
							{ once: true },
							false,
							false,
							false
						),
						listen_dev(
							button7,
							"click",
							function () {
								if (is_function(/*handleClick*/ ctx[1](/*question*/ ctx[0].fact, /*question*/ ctx[0].k2, 75, false))) /*handleClick*/ ctx[1](/*question*/ ctx[0].fact, /*question*/ ctx[0].k2, 75, false).apply(this, arguments);
							},
							{ once: true },
							false,
							false,
							false
						),
						listen_dev(
							button8,
							"click",
							function () {
								if (is_function(/*handleClick*/ ctx[1](/*question*/ ctx[0].fact, /*question*/ ctx[0].k2, 85, false))) /*handleClick*/ ctx[1](/*question*/ ctx[0].fact, /*question*/ ctx[0].k2, 85, false).apply(this, arguments);
							},
							{ once: true },
							false,
							false,
							false
						),
						listen_dev(
							button9,
							"click",
							function () {
								if (is_function(/*handleClick*/ ctx[1](/*question*/ ctx[0].fact, /*question*/ ctx[0].k2, 95, false))) /*handleClick*/ ctx[1](/*question*/ ctx[0].fact, /*question*/ ctx[0].k2, 95, false).apply(this, arguments);
							},
							{ once: true },
							false,
							false,
							false
						)
					];

					mounted = true;
				}
			},
			p: function update(new_ctx, [dirty]) {
				ctx = new_ctx;
				if (dirty & /*question*/ 1 && t0_value !== (t0_value = /*question*/ ctx[0].text + "")) set_data_dev(t0, t0_value);
				if (dirty & /*question*/ 1 && t2_value !== (t2_value = /*question*/ ctx[0].o1.name + "")) set_data_dev(t2, t2_value);
				if (dirty & /*question*/ 1 && t24_value !== (t24_value = /*question*/ ctx[0].o2.name + "")) set_data_dev(t24, t24_value);
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div5);
				}

				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$9.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$9($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Question', slots, []);
		let { question } = $$props;
		const dispatch = createEventDispatcher();

		const handleClick = (fact, answer, confidence, hinted) => {
			dispatch('answer', { fact, answer, confidence, hinted });
		};

		$$self.$$.on_mount.push(function () {
			if (question === undefined && !('question' in $$props || $$self.$$.bound[$$self.$$.props['question']])) {
				console.warn("<Question> was created without expected prop 'question'");
			}
		});

		const writable_props = ['question'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Question> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('question' in $$props) $$invalidate(0, question = $$props.question);
		};

		$$self.$capture_state = () => ({
			createEventDispatcher,
			question,
			dispatch,
			handleClick
		});

		$$self.$inject_state = $$props => {
			if ('question' in $$props) $$invalidate(0, question = $$props.question);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [question, handleClick];
	}

	class Question extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$9, create_fragment$9, safe_not_equal, { question: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Question",
				options,
				id: create_fragment$9.name
			});
		}

		get question() {
			throw new Error("<Question>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set question(value) {
			throw new Error("<Question>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/Feedback.svelte generated by Svelte v4.2.17 */

	const { Object: Object_1$2 } = globals;
	const file$6 = "src/Feedback.svelte";

	// (11:4) {:else}
	function create_else_block$1(ctx) {
		let h6;

		const block = {
			c: function create() {
				h6 = element("h6");
				h6.textContent = "incorrect";
				attr_dev(h6, "class", "card-subtitle mb-2 text-warning");
				add_location(h6, file$6, 11, 6, 299);
			},
			m: function mount(target, anchor) {
				insert_dev(target, h6, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(h6);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block$1.name,
			type: "else",
			source: "(11:4) {:else}",
			ctx
		});

		return block;
	}

	// (9:4) {#if response.correct}
	function create_if_block$2(ctx) {
		let h6;

		const block = {
			c: function create() {
				h6 = element("h6");
				h6.textContent = "correct";
				attr_dev(h6, "class", "card-subtitle mb-2 text-primary");
				add_location(h6, file$6, 9, 8, 224);
			},
			m: function mount(target, anchor) {
				insert_dev(target, h6, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(h6);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$2.name,
			type: "if",
			source: "(9:4) {#if response.correct}",
			ctx
		});

		return block;
	}

	function create_fragment$8(ctx) {
		let div1;
		let div0;
		let h6;
		let t1;
		let t2;
		let p0;
		let t3_value = /*question*/ ctx[0].options[Object.keys(/*question*/ ctx[0].options)[0]].name + "";
		let t3;
		let t4;
		let t5_value = /*question*/ ctx[0].options[Object.keys(/*question*/ ctx[0].options)[0]].text + "";
		let t5;
		let t6;
		let p1;
		let t7_value = /*question*/ ctx[0].options[Object.keys(/*question*/ ctx[0].options)[1]].name + "";
		let t7;
		let t8;
		let t9_value = /*question*/ ctx[0].options[Object.keys(/*question*/ ctx[0].options)[1]].text + "";
		let t9;

		function select_block_type(ctx, dirty) {
			if (/*response*/ ctx[1].correct) return create_if_block$2;
			return create_else_block$1;
		}

		let current_block_type = select_block_type(ctx);
		let if_block = current_block_type(ctx);

		const block = {
			c: function create() {
				div1 = element("div");
				div0 = element("div");
				h6 = element("h6");
				h6.textContent = "Last question";
				t1 = space();
				if_block.c();
				t2 = space();
				p0 = element("p");
				t3 = text(t3_value);
				t4 = text(": ");
				t5 = text(t5_value);
				t6 = space();
				p1 = element("p");
				t7 = text(t7_value);
				t8 = text(": ");
				t9 = text(t9_value);
				attr_dev(h6, "class", "card-title");
				add_location(h6, file$6, 7, 4, 147);
				attr_dev(p0, "class", "card-text");
				add_location(p0, file$6, 14, 4, 373);
				attr_dev(p1, "class", "card-text");
				add_location(p1, file$6, 15, 4, 519);
				attr_dev(div0, "class", "card-body text-center");
				add_location(div0, file$6, 6, 2, 107);
				attr_dev(div1, "class", "card");
				set_style(div1, "width", "30rem");
				add_location(div1, file$6, 5, 0, 64);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div1, anchor);
				append_dev(div1, div0);
				append_dev(div0, h6);
				append_dev(div0, t1);
				if_block.m(div0, null);
				append_dev(div0, t2);
				append_dev(div0, p0);
				append_dev(p0, t3);
				append_dev(p0, t4);
				append_dev(p0, t5);
				append_dev(div0, t6);
				append_dev(div0, p1);
				append_dev(p1, t7);
				append_dev(p1, t8);
				append_dev(p1, t9);
			},
			p: function update(ctx, [dirty]) {
				if (current_block_type !== (current_block_type = select_block_type(ctx))) {
					if_block.d(1);
					if_block = current_block_type(ctx);

					if (if_block) {
						if_block.c();
						if_block.m(div0, t2);
					}
				}

				if (dirty & /*question*/ 1 && t3_value !== (t3_value = /*question*/ ctx[0].options[Object.keys(/*question*/ ctx[0].options)[0]].name + "")) set_data_dev(t3, t3_value);
				if (dirty & /*question*/ 1 && t5_value !== (t5_value = /*question*/ ctx[0].options[Object.keys(/*question*/ ctx[0].options)[0]].text + "")) set_data_dev(t5, t5_value);
				if (dirty & /*question*/ 1 && t7_value !== (t7_value = /*question*/ ctx[0].options[Object.keys(/*question*/ ctx[0].options)[1]].name + "")) set_data_dev(t7, t7_value);
				if (dirty & /*question*/ 1 && t9_value !== (t9_value = /*question*/ ctx[0].options[Object.keys(/*question*/ ctx[0].options)[1]].text + "")) set_data_dev(t9, t9_value);
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div1);
				}

				if_block.d();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$8.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$8($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Feedback', slots, []);
		let { question } = $$props;
		let { response } = $$props;

		$$self.$$.on_mount.push(function () {
			if (question === undefined && !('question' in $$props || $$self.$$.bound[$$self.$$.props['question']])) {
				console.warn("<Feedback> was created without expected prop 'question'");
			}

			if (response === undefined && !('response' in $$props || $$self.$$.bound[$$self.$$.props['response']])) {
				console.warn("<Feedback> was created without expected prop 'response'");
			}
		});

		const writable_props = ['question', 'response'];

		Object_1$2.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Feedback> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('question' in $$props) $$invalidate(0, question = $$props.question);
			if ('response' in $$props) $$invalidate(1, response = $$props.response);
		};

		$$self.$capture_state = () => ({ question, response });

		$$self.$inject_state = $$props => {
			if ('question' in $$props) $$invalidate(0, question = $$props.question);
			if ('response' in $$props) $$invalidate(1, response = $$props.response);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [question, response];
	}

	class Feedback extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$8, create_fragment$8, safe_not_equal, { question: 0, response: 1 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Feedback",
				options,
				id: create_fragment$8.name
			});
		}

		get question() {
			throw new Error("<Feedback>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set question(value) {
			throw new Error("<Feedback>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get response() {
			throw new Error("<Feedback>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set response(value) {
			throw new Error("<Feedback>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/NavBar.svelte generated by Svelte v4.2.17 */
	const file$5 = "src/NavBar.svelte";

	function create_fragment$7(ctx) {
		let nav;
		let a0;
		let t1;
		let div1;
		let div0;
		let a1;

		const block = {
			c: function create() {
				nav = element("nav");
				a0 = element("a");
				a0.textContent = "An Educated Guess";
				t1 = space();
				div1 = element("div");
				div0 = element("div");
				a1 = element("a");
				a1.textContent = "About";
				attr_dev(a0, "class", "navbar-brand p-3");
				attr_dev(a0, "href", "#/");
				add_location(a0, file$5, 2, 2, 61);
				attr_dev(a1, "class", "nav-item nav-link active");
				attr_dev(a1, "href", "#/about");
				add_location(a1, file$5, 5, 6, 221);
				attr_dev(div0, "class", "navbar-nav");
				add_location(div0, file$5, 4, 4, 190);
				attr_dev(div1, "class", "collapse navbar-collapse");
				attr_dev(div1, "id", "navbarNavAltMarkup");
				add_location(div1, file$5, 3, 2, 123);
				attr_dev(nav, "class", "navbar navbar-expand navbar-light bg-light");
				add_location(nav, file$5, 1, 0, 1);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, nav, anchor);
				append_dev(nav, a0);
				append_dev(nav, t1);
				append_dev(nav, div1);
				append_dev(div1, div0);
				append_dev(div0, a1);
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(nav);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$7.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$7($$self, $$props) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('NavBar', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NavBar> was created with unknown prop '${key}'`);
		});

		return [];
	}

	class NavBar extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "NavBar",
				options,
				id: create_fragment$7.name
			});
		}
	}

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	var highchartsMore = {exports: {}};

	highchartsMore.exports;

	(function (module) {
		!/**
		 * Highcharts JS v11.4.1 (2024-04-04)
		 *
		 * (c) 2009-2024 Torstein Honsi
		 *
		 * License: www.highcharts.com/license
		 */function(t){module.exports?(t.default=t,module.exports=t):t("undefined"!=typeof Highcharts?Highcharts:void 0);}(function(t){var e=t?t._modules:{};function i(t,e,i,s){t.hasOwnProperty(e)||(t[e]=s.apply(null,i),"function"==typeof CustomEvent&&window.dispatchEvent(new CustomEvent("HighchartsModuleLoaded",{detail:{path:e,module:t[e]}})));}i(e,"Extensions/Pane/PaneComposition.js",[e["Core/Utilities.js"]],function(t){let{addEvent:e,correctFloat:i,defined:s,pick:o}=t;function a(t){let e;let i=this;return t&&i.pane.forEach(s=>{r(t.chartX-i.plotLeft,t.chartY-i.plotTop,s.center)&&(e=s);}),e}function r(t,e,o,a,r){let n=!0,l=o[0],h=o[1];if(s(a)&&s(r)){let s=Math.atan2(i(e-h,8),i(t-l,8));r!==a&&(n=a>r?s>=a&&s<=Math.PI||s<=r&&s>=-Math.PI:s>=a&&s<=i(r,8));}return Math.sqrt(Math.pow(t-l,2)+Math.pow(e-h,2))<=Math.ceil(o[2]/2)&&n}function n(t){this.polar&&(t.options.inverted&&([t.x,t.y]=[t.y,t.x]),t.isInsidePlot=this.pane.some(e=>r(t.x,t.y,e.center,e.axis&&e.axis.normalizedStartAngleRad,e.axis&&e.axis.normalizedEndAngleRad)));}function l(t){let e=this.chart;t.hoverPoint&&t.hoverPoint.plotX&&t.hoverPoint.plotY&&e.hoverPane&&!r(t.hoverPoint.plotX,t.hoverPoint.plotY,e.hoverPane.center)&&(t.hoverPoint=void 0);}function h(t){let e=this.chart;e.polar?(e.hoverPane=e.getHoverPane(t),t.filter=function(i){return i.visible&&!(!t.shared&&i.directTouch)&&o(i.options.enableMouseTracking,!0)&&(!e.hoverPane||i.xAxis.pane===e.hoverPane)}):e.hoverPane=void 0;}return {compose:function(t,i){let s=t.prototype;s.getHoverPane||(s.collectionsWithUpdate.push("pane"),s.getHoverPane=a,e(t,"afterIsInsidePlot",n),e(i,"afterGetHoverData",l),e(i,"beforeGetHoverData",h));}}}),i(e,"Extensions/Pane/PaneDefaults.js",[],function(){return {pane:{center:["50%","50%"],size:"85%",innerSize:"0%",startAngle:0},background:{shape:"circle",borderWidth:1,borderColor:"#cccccc",backgroundColor:{linearGradient:{x1:0,y1:0,x2:0,y2:1},stops:[[0,"#ffffff"],[1,"#e6e6e6"]]},from:-Number.MAX_VALUE,innerRadius:0,to:Number.MAX_VALUE,outerRadius:"105%"}}}),i(e,"Extensions/Pane/Pane.js",[e["Series/CenteredUtilities.js"],e["Extensions/Pane/PaneComposition.js"],e["Extensions/Pane/PaneDefaults.js"],e["Core/Utilities.js"]],function(t,e,i,s){let{extend:o,merge:a,splat:r}=s;class n{constructor(t,e){this.coll="pane",this.init(t,e);}init(t,e){this.chart=e,this.background=[],e.pane.push(this),this.setOptions(t);}setOptions(t){this.options=t=a(i.pane,this.chart.angular?{background:{}}:void 0,t);}render(){let t=this.options,e=this.chart.renderer;this.group||(this.group=e.g("pane-group").attr({zIndex:t.zIndex||0}).add()),this.updateCenter();let s=this.options.background;if(s){let t=Math.max((s=r(s)).length,this.background.length||0);for(let e=0;e<t;e++)s[e]&&this.axis?this.renderBackground(a(i.background,s[e]),e):this.background[e]&&(this.background[e]=this.background[e].destroy(),this.background.splice(e,1));}}renderBackground(t,e){let i={class:"highcharts-pane "+(t.className||"")},s="animate";this.chart.styledMode||o(i,{fill:t.backgroundColor,stroke:t.borderColor,"stroke-width":t.borderWidth}),this.background[e]||(this.background[e]=this.chart.renderer.path().add(this.group),s="attr"),this.background[e][s]({d:this.axis.getPlotBandPath(t.from,t.to,t)}).attr(i);}updateCenter(e){this.center=(e||this.axis||{}).center=t.getCenter.call(this);}update(t,e){a(!0,this.options,t),this.setOptions(this.options),this.render(),this.chart.axes.forEach(function(t){t.pane===this&&(t.pane=null,t.update({},e));},this);}}return n.compose=e.compose,n}),i(e,"Series/AreaRange/AreaRangePoint.js",[e["Core/Series/SeriesRegistry.js"],e["Core/Utilities.js"]],function(t,e){let{area:{prototype:{pointClass:i,pointClass:{prototype:s}}}}=t.seriesTypes,{defined:o,isNumber:a}=e;return class extends i{setState(){let t=this.state,e=this.series,i=e.chart.polar;o(this.plotHigh)||(this.plotHigh=e.yAxis.toPixels(this.high,!0)),o(this.plotLow)||(this.plotLow=this.plotY=e.yAxis.toPixels(this.low,!0)),e.lowerStateMarkerGraphic=e.stateMarkerGraphic,e.stateMarkerGraphic=e.upperStateMarkerGraphic,this.graphic=this.graphics&&this.graphics[1],this.plotY=this.plotHigh,i&&a(this.plotHighX)&&(this.plotX=this.plotHighX),s.setState.apply(this,arguments),this.state=t,this.plotY=this.plotLow,this.graphic=this.graphics&&this.graphics[0],i&&a(this.plotLowX)&&(this.plotX=this.plotLowX),e.upperStateMarkerGraphic=e.stateMarkerGraphic,e.stateMarkerGraphic=e.lowerStateMarkerGraphic,e.lowerStateMarkerGraphic=void 0;let r=e.modifyMarkerSettings();s.setState.apply(this,arguments),e.restoreMarkerSettings(r);}haloPath(){let t=this.series.chart.polar,e=[];return this.plotY=this.plotLow,t&&a(this.plotLowX)&&(this.plotX=this.plotLowX),this.isInside&&(e=s.haloPath.apply(this,arguments)),this.plotY=this.plotHigh,t&&a(this.plotHighX)&&(this.plotX=this.plotHighX),this.isTopInside&&(e=e.concat(s.haloPath.apply(this,arguments))),e}isValid(){return a(this.low)&&a(this.high)}}}),i(e,"Series/AreaRange/AreaRangeSeries.js",[e["Series/AreaRange/AreaRangePoint.js"],e["Core/Globals.js"],e["Core/Series/SeriesRegistry.js"],e["Core/Utilities.js"]],function(t,e,i,s){let{noop:o}=e,{area:a,area:{prototype:r},column:{prototype:n}}=i.seriesTypes,{addEvent:l,defined:h,extend:p,isArray:d,isNumber:c,pick:u,merge:g}=s;class f extends a{toYData(t){return [t.low,t.high]}highToXY(t){let e=this.chart,i=this.xAxis.postTranslate(t.rectPlotX||0,this.yAxis.len-(t.plotHigh||0));t.plotHighX=i.x-e.plotLeft,t.plotHigh=i.y-e.plotTop,t.plotLowX=t.plotX;}getGraphPath(t){let e=[],i=[],s=r.getGraphPath,o=this.options,a=this.chart.polar,n=a&&!1!==o.connectEnds,l=o.connectNulls,h,p,d,c=o.step;for(h=(t=t||this.points).length;h--;){p=t[h];let s=a?{plotX:p.rectPlotX,plotY:p.yBottom,doCurve:!1}:{plotX:p.plotX,plotY:p.plotY,doCurve:!1};p.isNull||n||l||t[h+1]&&!t[h+1].isNull||i.push(s),d={polarPlotY:p.polarPlotY,rectPlotX:p.rectPlotX,yBottom:p.yBottom,plotX:u(p.plotHighX,p.plotX),plotY:p.plotHigh,isNull:p.isNull},i.push(d),e.push(d),p.isNull||n||l||t[h-1]&&!t[h-1].isNull||i.push(s);}let g=s.call(this,t);c&&(!0===c&&(c="left"),o.step=({left:"right",center:"center",right:"left"})[c]);let f=s.call(this,e),b=s.call(this,i);o.step=c;let m=[].concat(g,f);return !this.chart.polar&&b[0]&&"M"===b[0][0]&&(b[0]=["L",b[0][1],b[0][2]]),this.graphPath=m,this.areaPath=g.concat(b),m.isArea=!0,m.xMap=g.xMap,this.areaPath.xMap=g.xMap,m}drawDataLabels(){let t,e,i,s,o;let a=this.points,n=a.length,l=[],h=this.options.dataLabels,c=this.chart.inverted;if(h){if(d(h)?(s=h[0]||{enabled:!1},o=h[1]||{enabled:!1}):((s=p({},h)).x=h.xHigh,s.y=h.yHigh,(o=p({},h)).x=h.xLow,o.y=h.yLow),s.enabled||this.hasDataLabels?.()){for(t=n;t--;)if(e=a[t]){let{plotHigh:o=0,plotLow:a=0}=e;i=s.inside?o<a:o>a,e.y=e.high,e._plotY=e.plotY,e.plotY=o,l[t]=e.dataLabel,e.dataLabel=e.dataLabelUpper,e.below=i,c?s.align||(s.align=i?"right":"left"):s.verticalAlign||(s.verticalAlign=i?"top":"bottom");}for(this.options.dataLabels=s,r.drawDataLabels&&r.drawDataLabels.apply(this,arguments),t=n;t--;)(e=a[t])&&(e.dataLabelUpper=e.dataLabel,e.dataLabel=l[t],delete e.dataLabels,e.y=e.low,e.plotY=e._plotY);}if(o.enabled||this.hasDataLabels?.()){for(t=n;t--;)if(e=a[t]){let{plotHigh:t=0,plotLow:s=0}=e;i=o.inside?t<s:t>s,e.below=!i,c?o.align||(o.align=i?"left":"right"):o.verticalAlign||(o.verticalAlign=i?"bottom":"top");}this.options.dataLabels=o,r.drawDataLabels&&r.drawDataLabels.apply(this,arguments);}if(s.enabled)for(t=n;t--;)(e=a[t])&&(e.dataLabels=[e.dataLabelUpper,e.dataLabel].filter(function(t){return !!t}));this.options.dataLabels=h;}}alignDataLabel(){n.alignDataLabel.apply(this,arguments);}modifyMarkerSettings(){let t={marker:this.options.marker,symbol:this.symbol};if(this.options.lowMarker){let{options:{marker:t,lowMarker:e}}=this;this.options.marker=g(t,e),e.symbol&&(this.symbol=e.symbol);}return t}restoreMarkerSettings(t){this.options.marker=t.marker,this.symbol=t.symbol;}drawPoints(){let t,e;let i=this.points.length,s=this.modifyMarkerSettings();for(r.drawPoints.apply(this,arguments),this.restoreMarkerSettings(s),t=0;t<i;)(e=this.points[t]).graphics=e.graphics||[],e.origProps={plotY:e.plotY,plotX:e.plotX,isInside:e.isInside,negative:e.negative,zone:e.zone,y:e.y},(e.graphic||e.graphics[0])&&(e.graphics[0]=e.graphic),e.graphic=e.graphics[1],e.plotY=e.plotHigh,h(e.plotHighX)&&(e.plotX=e.plotHighX),e.y=u(e.high,e.origProps.y),e.negative=e.y<(this.options.threshold||0),this.zones.length&&(e.zone=e.getZone()),this.chart.polar||(e.isInside=e.isTopInside=void 0!==e.plotY&&e.plotY>=0&&e.plotY<=this.yAxis.len&&e.plotX>=0&&e.plotX<=this.xAxis.len),t++;for(r.drawPoints.apply(this,arguments),t=0;t<i;)(e=this.points[t]).graphics=e.graphics||[],(e.graphic||e.graphics[1])&&(e.graphics[1]=e.graphic),e.graphic=e.graphics[0],e.origProps&&(p(e,e.origProps),delete e.origProps),t++;}hasMarkerChanged(t,e){let i=t.lowMarker,s=e.lowMarker||{};return i&&(!1===i.enabled||s.symbol!==i.symbol||s.height!==i.height||s.width!==i.width)||super.hasMarkerChanged(t,e)}}return f.defaultOptions=g(a.defaultOptions,{lineWidth:1,threshold:null,tooltip:{pointFormat:'<span style="color:{series.color}">●</span> {series.name}: <b>{point.low}</b> - <b>{point.high}</b><br/>'},trackByArea:!0,dataLabels:{align:void 0,verticalAlign:void 0,xLow:0,xHigh:0,yLow:0,yHigh:0}}),l(f,"afterTranslate",function(){"low,high"===this.pointArrayMap.join(",")&&this.points.forEach(t=>{let e=t.high,i=t.plotY;t.isNull?t.plotY=void 0:(t.plotLow=i,t.plotHigh=c(e)?this.yAxis.translate(this.dataModify?this.dataModify.modifyValue(e):e,!1,!0,void 0,!0):void 0,this.dataModify&&(t.yBottom=t.plotHigh));});},{order:0}),l(f,"afterTranslate",function(){this.points.forEach(t=>{if(this.chart.polar)this.highToXY(t),t.plotLow=t.plotY,t.tooltipPos=[((t.plotHighX||0)+(t.plotLowX||0))/2,((t.plotHigh||0)+(t.plotLow||0))/2];else {let e=t.pos(!1,t.plotLow),i=t.pos(!1,t.plotHigh);e&&i&&(e[0]=(e[0]+i[0])/2,e[1]=(e[1]+i[1])/2),t.tooltipPos=e;}});},{order:3}),p(f.prototype,{deferTranslatePolar:!0,pointArrayMap:["low","high"],pointClass:t,pointValKey:"low",setStackedPoints:o}),i.registerSeriesType("arearange",f),f}),i(e,"Series/AreaSplineRange/AreaSplineRangeSeries.js",[e["Series/AreaRange/AreaRangeSeries.js"],e["Core/Series/SeriesRegistry.js"],e["Core/Utilities.js"]],function(t,e,i){let{spline:{prototype:s}}=e.seriesTypes,{merge:o,extend:a}=i;class r extends t{}return r.defaultOptions=o(t.defaultOptions),a(r.prototype,{getPointSpline:s.getPointSpline}),e.registerSeriesType("areasplinerange",r),r}),i(e,"Series/BoxPlot/BoxPlotSeriesDefaults.js",[],function(){return {threshold:null,tooltip:{pointFormat:'<span style="color:{point.color}">●</span> <b>{series.name}</b><br/>Maximum: {point.high}<br/>Upper quartile: {point.q3}<br/>Median: {point.median}<br/>Lower quartile: {point.q1}<br/>Minimum: {point.low}<br/>'},whiskerLength:"50%",fillColor:"#ffffff",lineWidth:1,medianWidth:2,whiskerWidth:2}}),i(e,"Series/BoxPlot/BoxPlotSeries.js",[e["Series/BoxPlot/BoxPlotSeriesDefaults.js"],e["Series/Column/ColumnSeries.js"],e["Core/Globals.js"],e["Core/Series/SeriesRegistry.js"],e["Core/Utilities.js"]],function(t,e,i,s,o){let{noop:a}=i,{extend:r,merge:n,pick:l}=o;class h extends e{pointAttribs(){return {}}translate(){let t=this.yAxis,e=this.pointArrayMap;super.translate.apply(this),this.points.forEach(function(i){e.forEach(function(e){null!==i[e]&&(i[e+"Plot"]=t.translate(i[e],0,1,0,1));}),i.plotHigh=i.highPlot;});}drawPoints(){let t=this.points,e=this.options,i=this.chart,s=i.renderer,o=!1!==this.doQuartiles,a=this.options.whiskerLength,r,n,h,p,d,c,u,g=0,f,b,m,y,x,P,S;for(let M of t){let t=(b=M.graphic)?"animate":"attr",L=M.shapeArgs,k={},v={},C={},w={},A=M.color||this.color;if(void 0!==M.plotY){let N;m=Math.round(L.width),x=(y=Math.floor(L.x))+m,P=Math.round(m/2),r=Math.floor(o?M.q1Plot:M.lowPlot),n=Math.floor(o?M.q3Plot:M.lowPlot),h=Math.floor(M.highPlot),p=Math.floor(M.lowPlot),b||(M.graphic=b=s.g("point").add(this.group),M.stem=s.path().addClass("highcharts-boxplot-stem").add(b),a&&(M.whiskers=s.path().addClass("highcharts-boxplot-whisker").add(b)),o&&(M.box=s.path(f).addClass("highcharts-boxplot-box").add(b)),M.medianShape=s.path(c).addClass("highcharts-boxplot-median").add(b)),i.styledMode||(v.stroke=M.stemColor||e.stemColor||A,v["stroke-width"]=l(M.stemWidth,e.stemWidth,e.lineWidth),v.dashstyle=M.stemDashStyle||e.stemDashStyle||e.dashStyle,M.stem.attr(v),a&&(C.stroke=M.whiskerColor||e.whiskerColor||A,C["stroke-width"]=l(M.whiskerWidth,e.whiskerWidth,e.lineWidth),C.dashstyle=M.whiskerDashStyle||e.whiskerDashStyle||e.dashStyle,M.whiskers.attr(C)),o&&(k.fill=M.fillColor||e.fillColor||A,k.stroke=e.lineColor||A,k["stroke-width"]=e.lineWidth||0,k.dashstyle=M.boxDashStyle||e.boxDashStyle||e.dashStyle,M.box.attr(k)),w.stroke=M.medianColor||e.medianColor||A,w["stroke-width"]=l(M.medianWidth,e.medianWidth,e.lineWidth),w.dashstyle=M.medianDashStyle||e.medianDashStyle||e.dashStyle,M.medianShape.attr(w)),N=[["M",g=y+P+(u=M.stem.strokeWidth()%2/2),n],["L",g,h],["M",g,r],["L",g,p]],M.stem[t]({d:N}),o&&(r=Math.floor(r)+(u=M.box.strokeWidth()%2/2),n=Math.floor(n)+u,y+=u,x+=u,N=[["M",y,n],["L",y,r],["L",x,r],["L",x,n],["L",y,n],["Z"]],M.box[t]({d:N})),a&&(h+=u=M.whiskers.strokeWidth()%2/2,p+=u,N=[["M",g-(S=/%$/.test(a)?P*parseFloat(a)/100:a/2),h],["L",g+S,h],["M",g-S,p],["L",g+S,p]],M.whiskers[t]({d:N})),N=[["M",y,d=Math.round(M.medianPlot)+(u=M.medianShape.strokeWidth()%2/2)],["L",x,d]],M.medianShape[t]({d:N});}}}toYData(t){return [t.low,t.q1,t.median,t.q3,t.high]}}return h.defaultOptions=n(e.defaultOptions,t),r(h.prototype,{pointArrayMap:["low","q1","median","q3","high"],pointValKey:"high",drawDataLabels:a,setStackedPoints:a}),s.registerSeriesType("boxplot",h),h}),i(e,"Series/Bubble/BubbleLegendDefaults.js",[],function(){return {borderColor:void 0,borderWidth:2,className:void 0,color:void 0,connectorClassName:void 0,connectorColor:void 0,connectorDistance:60,connectorWidth:1,enabled:!1,labels:{className:void 0,allowOverlap:!1,format:"",formatter:void 0,align:"right",style:{fontSize:"0.9em",color:"#000000"},x:0,y:0},maxSize:60,minSize:10,legendIndex:0,ranges:{value:void 0,borderColor:void 0,color:void 0,connectorColor:void 0},sizeBy:"area",sizeByAbsoluteValue:!1,zIndex:1,zThreshold:0}}),i(e,"Series/Bubble/BubbleLegendItem.js",[e["Core/Color/Color.js"],e["Core/Templating.js"],e["Core/Globals.js"],e["Core/Utilities.js"]],function(t,e,i,s){let{parse:o}=t,{noop:a}=i,{arrayMax:r,arrayMin:n,isNumber:l,merge:h,pick:p,stableSort:d}=s;return class{constructor(t,e){this.setState=a,this.init(t,e);}init(t,e){this.options=t,this.visible=!0,this.chart=e.chart,this.legend=e;}addToLegend(t){t.splice(this.options.legendIndex,0,this);}drawLegendSymbol(t){let e;let i=p(t.options.itemDistance,20),s=this.legendItem||{},o=this.options,a=o.ranges,r=o.connectorDistance;if(!a||!a.length||!l(a[0].value)){t.options.bubbleLegend.autoRanges=!0;return}d(a,function(t,e){return e.value-t.value}),this.ranges=a,this.setOptions(),this.render();let n=this.getMaxLabelSize(),h=this.ranges[0].radius,c=2*h;e=(e=r-h+n.width)>0?e:0,this.maxLabel=n,this.movementX="left"===o.labels.align?e:0,s.labelWidth=c+e+i,s.labelHeight=c+n.height/2;}setOptions(){let t=this.ranges,e=this.options,i=this.chart.series[e.seriesIndex],s=this.legend.baseline,a={zIndex:e.zIndex,"stroke-width":e.borderWidth},r={zIndex:e.zIndex,"stroke-width":e.connectorWidth},n={align:this.legend.options.rtl||"left"===e.labels.align?"right":"left",zIndex:e.zIndex},l=i.options.marker.fillOpacity,d=this.chart.styledMode;t.forEach(function(c,u){d||(a.stroke=p(c.borderColor,e.borderColor,i.color),a.fill=p(c.color,e.color,1!==l?o(i.color).setOpacity(l).get("rgba"):i.color),r.stroke=p(c.connectorColor,e.connectorColor,i.color)),t[u].radius=this.getRangeRadius(c.value),t[u]=h(t[u],{center:t[0].radius-t[u].radius+s}),d||h(!0,t[u],{bubbleAttribs:h(a),connectorAttribs:h(r),labelAttribs:n});},this);}getRangeRadius(t){let e=this.options,i=this.options.seriesIndex,s=this.chart.series[i],o=e.ranges[0].value,a=e.ranges[e.ranges.length-1].value,r=e.minSize,n=e.maxSize;return s.getRadius.call(this,a,o,r,n,t)}render(){let t=this.legendItem||{},e=this.chart.renderer,i=this.options.zThreshold;for(let s of(this.symbols||(this.symbols={connectors:[],bubbleItems:[],labels:[]}),t.symbol=e.g("bubble-legend"),t.label=e.g("bubble-legend-item").css(this.legend.itemStyle||{}),t.symbol.translateX=0,t.symbol.translateY=0,t.symbol.add(t.label),t.label.add(t.group),this.ranges))s.value>=i&&this.renderRange(s);this.hideOverlappingLabels();}renderRange(t){let e=this.ranges[0],i=this.legend,s=this.options,o=s.labels,a=this.chart,r=a.series[s.seriesIndex],n=a.renderer,l=this.symbols,h=l.labels,p=t.center,d=Math.abs(t.radius),c=s.connectorDistance||0,u=o.align,g=i.options.rtl,f=s.borderWidth,b=s.connectorWidth,m=e.radius||0,y=p-d-f/2+b/2,x=(y%1?1:.5)-(b%2?0:.5),P=n.styledMode,S=g||"left"===u?-c:c;"center"===u&&(S=0,s.connectorDistance=0,t.labelAttribs.align="center"),l.bubbleItems.push(n.circle(m,p+x,d).attr(P?{}:t.bubbleAttribs).addClass((P?"highcharts-color-"+r.colorIndex+" ":"")+"highcharts-bubble-legend-symbol "+(s.className||"")).add(this.legendItem.symbol)),l.connectors.push(n.path(n.crispLine([["M",m,y],["L",m+S,y]],s.connectorWidth)).attr(P?{}:t.connectorAttribs).addClass((P?"highcharts-color-"+this.options.seriesIndex+" ":"")+"highcharts-bubble-legend-connectors "+(s.connectorClassName||"")).add(this.legendItem.symbol));let M=n.text(this.formatLabel(t)).attr(P?{}:t.labelAttribs).css(P?{}:o.style).addClass("highcharts-bubble-legend-labels "+(s.labels.className||"")).add(this.legendItem.symbol),L={x:m+S+s.labels.x,y:y+s.labels.y+.4*M.getBBox().height};M.attr(L),h.push(M),M.placed=!0,M.alignAttr=L;}getMaxLabelSize(){let t,e;return this.symbols.labels.forEach(function(i){e=i.getBBox(!0),t=t?e.width>t.width?e:t:e;}),t||{}}formatLabel(t){let i=this.options,s=i.labels.formatter,o=i.labels.format,{numberFormatter:a}=this.chart;return o?e.format(o,t):s?s.call(t):a(t.value,1)}hideOverlappingLabels(){let t=this.chart,e=this.options.labels.allowOverlap,i=this.symbols;!e&&i&&(t.hideOverlappingLabels(i.labels),i.labels.forEach(function(t,e){t.newOpacity?t.newOpacity!==t.oldOpacity&&i.connectors[e].show():i.connectors[e].hide();}));}getRanges(){let t=this.legend.bubbleLegend,e=t.chart.series,i=t.options.ranges,s,o,a=Number.MAX_VALUE,d=-Number.MAX_VALUE;return e.forEach(function(t){t.isBubble&&!t.ignoreSeries&&(o=t.zData.filter(l)).length&&(a=p(t.options.zMin,Math.min(a,Math.max(n(o),!1===t.options.displayNegative?t.options.zThreshold:-Number.MAX_VALUE))),d=p(t.options.zMax,Math.max(d,r(o))));}),s=a===d?[{value:d}]:[{value:a},{value:(a+d)/2},{value:d,autoRanges:!0}],i.length&&i[0].radius&&s.reverse(),s.forEach(function(t,e){i&&i[e]&&(s[e]=h(i[e],t));}),s}predictBubbleSizes(){let t=this.chart,e=t.legend.options,i=e.floating,s="horizontal"===e.layout,o=s?t.legend.lastLineHeight:0,a=t.plotSizeX,r=t.plotSizeY,n=t.series[this.options.seriesIndex],l=n.getPxExtremes(),h=Math.ceil(l.minPxSize),p=Math.ceil(l.maxPxSize),d,c=n.options.maxSize;return i||!/%$/.test(c)?d=p:(d=(Math.min(r,a)+o)*(c=parseFloat(c))/100/(c/100+1),(s&&r-d>=a||!s&&a-d>=r)&&(d=p)),[h,Math.ceil(d)]}updateRanges(t,e){let i=this.legend.options.bubbleLegend;i.minSize=t,i.maxSize=e,i.ranges=this.getRanges();}correctSizes(){let t=this.legend,e=this.chart.series[this.options.seriesIndex].getPxExtremes();Math.abs(Math.ceil(e.maxPxSize)-this.options.maxSize)>1&&(this.updateRanges(this.options.minSize,e.maxPxSize),t.render());}}}),i(e,"Series/Bubble/BubbleLegendComposition.js",[e["Series/Bubble/BubbleLegendDefaults.js"],e["Series/Bubble/BubbleLegendItem.js"],e["Core/Defaults.js"],e["Core/Globals.js"],e["Core/Utilities.js"]],function(t,e,i,s,o){let{setOptions:a}=i,{composed:r}=s,{addEvent:n,objectEach:l,pushUnique:h,wrap:p}=o;function d(t,e,i){let s,o,a;let r=this.legend,n=c(this)>=0;r&&r.options.enabled&&r.bubbleLegend&&r.options.bubbleLegend.autoRanges&&n?(s=r.bubbleLegend.options,o=r.bubbleLegend.predictBubbleSizes(),r.bubbleLegend.updateRanges(o[0],o[1]),s.placed||(r.group.placed=!1,r.allItems.forEach(t=>{(a=t.legendItem||{}).group&&(a.group.translateY=void 0);})),r.render(),s.placed||(this.getMargins(),this.axes.forEach(function(t){t.visible&&t.render(),s.placed||(t.setScale(),t.updateNames(),l(t.ticks,function(t){t.isNew=!0,t.isNewLabel=!0;}));}),this.getMargins()),s.placed=!0,t.call(this,e,i),r.bubbleLegend.correctSizes(),b(r,u(r))):(t.call(this,e,i),r&&r.options.enabled&&r.bubbleLegend&&(r.render(),b(r,u(r))));}function c(t){let e=t.series,i=0;for(;i<e.length;){if(e[i]&&e[i].isBubble&&e[i].visible&&e[i].zData.length)return i;i++;}return -1}function u(t){let e=t.allItems,i=[],s=e.length,o,a,r,n=0,l=0;for(n=0;n<s;n++)if(a=e[n].legendItem||{},r=(e[n+1]||{}).legendItem||{},a.labelHeight&&(e[n].itemHeight=a.labelHeight),e[n]===e[s-1]||a.y!==r.y){for(i.push({height:0}),o=i[i.length-1];l<=n;l++)e[l].itemHeight>o.height&&(o.height=e[l].itemHeight);o.step=n;}return i}function g(t){let i=this.bubbleLegend,s=this.options,o=s.bubbleLegend,a=c(this.chart);i&&i.ranges&&i.ranges.length&&(o.ranges.length&&(o.autoRanges=!!o.ranges[0].autoRanges),this.destroyItem(i)),a>=0&&s.enabled&&o.enabled&&(o.seriesIndex=a,this.bubbleLegend=new e(o,this),this.bubbleLegend.addToLegend(t.allItems));}function f(t){let e;if(t.defaultPrevented)return !1;let i=this.chart,s=this.visible,o=this.chart.legend;o&&o.bubbleLegend&&(this.visible=!s,this.ignoreSeries=s,e=c(i)>=0,o.bubbleLegend.visible!==e&&(o.update({bubbleLegend:{enabled:e}}),o.bubbleLegend.visible=e),this.visible=s);}function b(t,e){let i=t.allItems,s=t.options.rtl,o,a,r,n,l=0;i.forEach((t,i)=>{(n=t.legendItem||{}).group&&(o=n.group.translateX||0,a=n.y||0,((r=t.movementX)||s&&t.ranges)&&(r=s?o-t.options.maxSize/2:o+r,n.group.attr({translateX:r})),i>e[l].step&&l++,n.group.attr({translateY:Math.round(a+e[l].height/2)}),n.y=a+e[l].height/2);});}return {compose:function(e,i,s){h(r,"Series.BubbleLegend")&&(a({legend:{bubbleLegend:t}}),p(e.prototype,"drawChartBox",d),n(i,"afterGetAllItems",g),n(s,"legendItemClick",f));}}}),i(e,"Series/Bubble/BubblePoint.js",[e["Core/Series/Point.js"],e["Core/Series/SeriesRegistry.js"],e["Core/Utilities.js"]],function(t,e,i){let{seriesTypes:{scatter:{prototype:{pointClass:s}}}}=e,{extend:o}=i;class a extends s{haloPath(e){return t.prototype.haloPath.call(this,0===e?0:(this.marker&&this.marker.radius||0)+e)}}return o(a.prototype,{ttBelow:!1}),a}),i(e,"Series/Bubble/BubbleSeries.js",[e["Series/Bubble/BubbleLegendComposition.js"],e["Series/Bubble/BubblePoint.js"],e["Core/Color/Color.js"],e["Core/Globals.js"],e["Core/Series/SeriesRegistry.js"],e["Core/Utilities.js"]],function(t,e,i,s,o,a){let{parse:r}=i,{composed:n,noop:l}=s,{series:h,seriesTypes:{column:{prototype:p},scatter:d}}=o,{addEvent:c,arrayMax:u,arrayMin:g,clamp:f,extend:b,isNumber:m,merge:y,pick:x,pushUnique:P}=a;function S(){let t=this.len,{coll:e,isXAxis:i,min:s}=this,o=i?"xData":"yData",a=(this.max||0)-(s||0),r=0,n=t,l=t/a,h;("xAxis"===e||"yAxis"===e)&&(this.series.forEach(t=>{if(t.bubblePadding&&t.reserveSpace()){this.allowZoomOutside=!0,h=!0;let e=t[o];if(i&&((t.onPoint||t).getRadii(0,0,t),t.onPoint&&(t.radii=t.onPoint.radii)),a>0){let i=e.length;for(;i--;)if(m(e[i])&&this.dataMin<=e[i]&&e[i]<=this.max){let o=t.radii&&t.radii[i]||0;r=Math.min((e[i]-s)*l-o,r),n=Math.max((e[i]-s)*l+o,n);}}}}),h&&a>0&&!this.logarithmic&&(n-=t,l*=(t+Math.max(0,r)-Math.min(n,t))/t,[["min","userMin",r],["max","userMax",n]].forEach(t=>{void 0===x(this.options[t[0]],this[t[1]])&&(this[t[0]]+=t[2]/l);})));}class M extends d{static compose(e,i,s,o){t.compose(i,s,o),P(n,"Series.Bubble")&&c(e,"foundExtremes",S);}animate(t){!t&&this.points.length<this.options.animationLimit&&this.points.forEach(function(t){let{graphic:e}=t;e&&e.width&&(this.hasRendered||e.attr({x:t.plotX,y:t.plotY,width:1,height:1}),e.animate(this.markerAttribs(t),this.options.animation));},this);}getRadii(){let t=this.zData,e=this.yData,i=[],s,o,a,r=this.chart.bubbleZExtremes,{minPxSize:n,maxPxSize:l}=this.getPxExtremes();if(!r){let t,e=Number.MAX_VALUE,i=-Number.MAX_VALUE;this.chart.series.forEach(s=>{if(s.bubblePadding&&s.reserveSpace()){let o=(s.onPoint||s).getZExtremes();o&&(e=Math.min(x(e,o.zMin),o.zMin),i=Math.max(x(i,o.zMax),o.zMax),t=!0);}}),t?(r={zMin:e,zMax:i},this.chart.bubbleZExtremes=r):r={zMin:0,zMax:0};}for(o=0,s=t.length;o<s;o++)a=t[o],i.push(this.getRadius(r.zMin,r.zMax,n,l,a,e&&e[o]));this.radii=i;}getRadius(t,e,i,s,o,a){let r=this.options,n="width"!==r.sizeBy,l=r.zThreshold,h=e-t,p=.5;if(null===a||null===o)return null;if(m(o)){if(r.sizeByAbsoluteValue&&(o=Math.abs(o-l),e=h=Math.max(e-l,Math.abs(t-l)),t=0),o<t)return i/2-1;h>0&&(p=(o-t)/h);}return n&&p>=0&&(p=Math.sqrt(p)),Math.ceil(i+p*(s-i))/2}hasData(){return !!this.processedXData.length}pointAttribs(t,e){let i=this.options.marker.fillOpacity,s=h.prototype.pointAttribs.call(this,t,e);return 1!==i&&(s.fill=r(s.fill).setOpacity(i).get("rgba")),s}translate(){super.translate.call(this),this.getRadii(),this.translateBubble();}translateBubble(){let{data:t,options:e,radii:i}=this,{minPxSize:s}=this.getPxExtremes(),o=t.length;for(;o--;){let a=t[o],r=i?i[o]:0;"z"===this.zoneAxis&&(a.negative=(a.z||0)<(e.zThreshold||0)),m(r)&&r>=s/2?(a.marker=b(a.marker,{radius:r,width:2*r,height:2*r}),a.dlBox={x:a.plotX-r,y:a.plotY-r,width:2*r,height:2*r}):(a.shapeArgs=a.plotY=a.dlBox=void 0,a.isInside=!1);}}getPxExtremes(){let t=Math.min(this.chart.plotWidth,this.chart.plotHeight),e=e=>{let i;return "string"==typeof e&&(i=/%$/.test(e),e=parseInt(e,10)),i?t*e/100:e},i=e(x(this.options.minSize,8)),s=Math.max(e(x(this.options.maxSize,"20%")),i);return {minPxSize:i,maxPxSize:s}}getZExtremes(){let t=this.options,e=(this.zData||[]).filter(m);if(e.length){let i=x(t.zMin,f(g(e),!1===t.displayNegative?t.zThreshold||0:-Number.MAX_VALUE,Number.MAX_VALUE)),s=x(t.zMax,u(e));if(m(i)&&m(s))return {zMin:i,zMax:s}}}}return M.defaultOptions=y(d.defaultOptions,{dataLabels:{formatter:function(){let{numberFormatter:t}=this.series.chart,{z:e}=this.point;return m(e)?t(e,-1):""},inside:!0,verticalAlign:"middle"},animationLimit:250,marker:{lineColor:null,lineWidth:1,fillOpacity:.5,radius:null,states:{hover:{radiusPlus:0}},symbol:"circle"},minSize:8,maxSize:"20%",softThreshold:!1,states:{hover:{halo:{size:5}}},tooltip:{pointFormat:"({point.x}, {point.y}), Size: {point.z}"},turboThreshold:0,zThreshold:0,zoneAxis:"z"}),b(M.prototype,{alignDataLabel:p.alignDataLabel,applyZones:l,bubblePadding:!0,isBubble:!0,pointArrayMap:["y","z"],pointClass:e,parallelArrays:["x","y","z"],trackerGroups:["group","dataLabelsGroup"],specialGroup:"group",zoneAxis:"z"}),c(M,"updatedData",t=>{delete t.target.chart.bubbleZExtremes;}),c(M,"remove",t=>{delete t.target.chart.bubbleZExtremes;}),o.registerSeriesType("bubble",M),M}),i(e,"Series/ColumnRange/ColumnRangePoint.js",[e["Core/Series/SeriesRegistry.js"],e["Core/Utilities.js"]],function(t,e){let{seriesTypes:{column:{prototype:{pointClass:{prototype:i}}},arearange:{prototype:{pointClass:s}}}}=t,{extend:o,isNumber:a}=e;class r extends s{isValid(){return a(this.low)}}return o(r.prototype,{setState:i.setState}),r}),i(e,"Series/ColumnRange/ColumnRangeSeries.js",[e["Series/ColumnRange/ColumnRangePoint.js"],e["Core/Globals.js"],e["Core/Series/SeriesRegistry.js"],e["Core/Utilities.js"]],function(t,e,i,s){let{noop:o}=e,{seriesTypes:{arearange:a,column:r,column:{prototype:n}}}=i,{addEvent:l,clamp:h,extend:p,isNumber:d,merge:c,pick:u}=s;class g extends a{setOptions(){return c(!0,arguments[0],{stacking:void 0}),a.prototype.setOptions.apply(this,arguments)}translate(){return n.translate.apply(this)}pointAttribs(){return n.pointAttribs.apply(this,arguments)}translate3dPoints(){return n.translate3dPoints.apply(this,arguments)}translate3dShapes(){return n.translate3dShapes.apply(this,arguments)}afterColumnTranslate(){let t,e,i,s;let o=this.yAxis,a=this.xAxis,r=a.startAngleRad,n=this.chart,l=this.xAxis.isRadial,p=Math.max(n.chartWidth,n.chartHeight)+999;this.points.forEach(g=>{let f=g.shapeArgs||{},b=this.options.minPointLength,m=g.plotY,y=o.translate(g.high,0,1,0,1);if(d(y)&&d(m)){if(g.plotHigh=h(y,-p,p),g.plotLow=h(m,-p,p),s=g.plotHigh,Math.abs(t=u(g.rectPlotY,g.plotY)-g.plotHigh)<b?(e=b-t,t+=e,s-=e/2):t<0&&(t*=-1,s-=t),l&&this.polar)i=g.barX+r,g.shapeType="arc",g.shapeArgs=this.polar.arc(s+t,s,i,i+g.pointWidth);else {f.height=t,f.y=s;let{x:e=0,width:i=0}=f;g.shapeArgs=c(g.shapeArgs,this.crispCol(e,s,i,t)),g.tooltipPos=n.inverted?[o.len+o.pos-n.plotLeft-s-t/2,a.len+a.pos-n.plotTop-e-i/2,t]:[a.left-n.plotLeft+e+i/2,o.pos-n.plotTop+s+t/2,t];}}});}}return g.defaultOptions=c(r.defaultOptions,a.defaultOptions,{borderRadius:{where:"all"},pointRange:null,legendSymbol:"rectangle",marker:null,states:{hover:{halo:!1}}}),l(g,"afterColumnTranslate",function(){g.prototype.afterColumnTranslate.apply(this);},{order:5}),p(g.prototype,{directTouch:!0,pointClass:t,trackerGroups:["group","dataLabelsGroup"],adjustForMissingColumns:n.adjustForMissingColumns,animate:n.animate,crispCol:n.crispCol,drawGraph:o,drawPoints:n.drawPoints,getSymbol:o,drawTracker:n.drawTracker,getColumnMetrics:n.getColumnMetrics}),i.registerSeriesType("columnrange",g),g}),i(e,"Series/ColumnPyramid/ColumnPyramidSeriesDefaults.js",[],function(){return {}}),i(e,"Series/ColumnPyramid/ColumnPyramidSeries.js",[e["Series/ColumnPyramid/ColumnPyramidSeriesDefaults.js"],e["Core/Series/SeriesRegistry.js"],e["Core/Utilities.js"]],function(t,e,i){let{column:s}=e.seriesTypes,{clamp:o,merge:a,pick:r}=i;class n extends s{translate(){let t=this.chart,e=this.options,i=this.dense=this.closestPointRange*this.xAxis.transA<2,s=this.borderWidth=r(e.borderWidth,i?0:1),a=this.yAxis,n=e.threshold,l=r(e.minPointLength,5),h=this.getColumnMetrics(),p=h.width,d=this.pointXOffset=h.offset,c=this.translatedThreshold=a.getThreshold(n),u=this.barW=Math.max(p,1+2*s);for(let i of(t.inverted&&(c-=.5),e.pointPadding&&(u=Math.ceil(u)),super.translate(),this.points)){let s=r(i.yBottom,c),g=999+Math.abs(s),f=o(i.plotY,-g,a.len+g),b=u/2,m=Math.min(f,s),y=Math.max(f,s)-m,x=i.plotX+d,P,S,M,L,k,v,C,w,A,N,T;e.centerInCategory&&(x=this.adjustForMissingColumns(x,p,i,h)),i.barX=x,i.pointWidth=p,i.tooltipPos=t.inverted?[a.len+a.pos-t.plotLeft-f,this.xAxis.len-x-b,y]:[x+b,f+a.pos-t.plotTop,y],P=n+(i.total||i.y),"percent"===e.stacking&&(P=n+(i.y<0)?-100:100);let X=a.toPixels(P,!0);M=(S=t.plotHeight-X-(t.plotHeight-c))?b*(m-X)/S:0,L=S?b*(m+y-X)/S:0,v=x-M+b,C=x+M+b,w=x+L+b,A=x-L+b,N=m-l,T=m+y,i.y<0&&(N=m,T=m+y+l),t.inverted&&(k=a.width-m,S=X-(a.width-c),M=b*(X-k)/S,L=b*(X-(k-y))/S,C=(v=x+b+M)-2*M,w=x-L+b,A=x+L+b,N=m,T=m+y-l,i.y<0&&(T=m+y+l)),i.shapeType="path",i.shapeArgs={x:v,y:N,width:C-v,height:y,d:[["M",v,N],["L",C,N],["L",w,T],["L",A,T],["Z"]]};}}}return n.defaultOptions=a(s.defaultOptions,t),e.registerSeriesType("columnpyramid",n),n}),i(e,"Series/ErrorBar/ErrorBarSeriesDefaults.js",[],function(){return {color:"#000000",grouping:!1,linkedTo:":previous",tooltip:{pointFormat:'<span style="color:{point.color}">●</span> {series.name}: <b>{point.low}</b> - <b>{point.high}</b><br/>'},whiskerWidth:null}}),i(e,"Series/ErrorBar/ErrorBarSeries.js",[e["Series/BoxPlot/BoxPlotSeries.js"],e["Series/Column/ColumnSeries.js"],e["Series/ErrorBar/ErrorBarSeriesDefaults.js"],e["Core/Series/SeriesRegistry.js"],e["Core/Utilities.js"]],function(t,e,i,s,o){let{arearange:a}=s.seriesTypes,{addEvent:r,merge:n,extend:l}=o;class h extends t{getColumnMetrics(){return this.linkedParent&&this.linkedParent.columnMetrics||e.prototype.getColumnMetrics.call(this)}drawDataLabels(){let t=this.pointValKey;if(a)for(let e of(a.prototype.drawDataLabels.call(this),this.points))e.y=e[t];}toYData(t){return [t.low,t.high]}}return h.defaultOptions=n(t.defaultOptions,i),r(h,"afterTranslate",function(){for(let t of this.points)t.plotLow=t.plotY;},{order:0}),l(h.prototype,{pointArrayMap:["low","high"],pointValKey:"high",doQuartiles:!1}),s.registerSeriesType("errorbar",h),h}),i(e,"Series/Gauge/GaugePoint.js",[e["Core/Series/SeriesRegistry.js"]],function(t){let{series:{prototype:{pointClass:e}}}=t;return class extends e{setState(t){this.state=t;}}}),i(e,"Series/Gauge/GaugeSeries.js",[e["Series/Gauge/GaugePoint.js"],e["Core/Globals.js"],e["Core/Series/SeriesRegistry.js"],e["Core/Utilities.js"]],function(t,e,i,s){let{noop:o}=e,{series:a,seriesTypes:{column:r}}=i,{clamp:n,isNumber:l,extend:h,merge:p,pick:d,pInt:c,defined:u}=s;class g extends a{translate(){let t=this.yAxis,e=this.options,i=t.center;this.generatePoints(),this.points.forEach(s=>{let o=p(e.dial,s.dial),a=c(o.radius)*i[2]/200,r=c(o.baseLength)*a/100,h=c(o.rearLength)*a/100,d=o.baseWidth,g=o.topWidth,f=e.overshoot,b=t.startAngleRad+t.translate(s.y,void 0,void 0,void 0,!0);(l(f)||!1===e.wrap)&&(f=l(f)?f/180*Math.PI:0,b=n(b,t.startAngleRad-f,t.endAngleRad+f)),b=180*b/Math.PI,s.shapeType="path";let m=o.path||[["M",-h,-d/2],["L",r,-d/2],["L",a,-g/2],["L",a,g/2],["L",r,d/2],["L",-h,d/2],["Z"]];s.shapeArgs={d:m,translateX:i[0],translateY:i[1],rotation:b},s.plotX=i[0],s.plotY=i[1],u(s.y)&&t.max-t.min&&(s.percentage=(s.y-t.min)/(t.max-t.min)*100);});}drawPoints(){let t=this,e=t.chart,i=t.yAxis.center,s=t.pivot,o=t.options,a=o.pivot,r=e.renderer;t.points.forEach(i=>{let s=i.graphic,a=i.shapeArgs,n=a.d,l=p(o.dial,i.dial);s?(s.animate(a),a.d=n):i.graphic=r[i.shapeType](a).addClass("highcharts-dial").add(t.group),e.styledMode||i.graphic[s?"animate":"attr"]({stroke:l.borderColor,"stroke-width":l.borderWidth,fill:l.backgroundColor});}),s?s.animate({translateX:i[0],translateY:i[1]}):a&&(t.pivot=r.circle(0,0,a.radius).attr({zIndex:2}).addClass("highcharts-pivot").translate(i[0],i[1]).add(t.group),e.styledMode||t.pivot.attr({fill:a.backgroundColor,stroke:a.borderColor,"stroke-width":a.borderWidth}));}animate(t){let e=this;t||e.points.forEach(t=>{let i=t.graphic;i&&(i.attr({rotation:180*e.yAxis.startAngleRad/Math.PI}),i.animate({rotation:t.shapeArgs.rotation},e.options.animation));});}render(){this.group=this.plotGroup("group","series",this.visible?"inherit":"hidden",this.options.zIndex,this.chart.seriesGroup),a.prototype.render.call(this),this.group.clip(this.chart.clipRect);}setData(t,e){a.prototype.setData.call(this,t,!1),this.processData(),this.generatePoints(),d(e,!0)&&this.chart.redraw();}hasData(){return !!this.points.length}}return g.defaultOptions=p(a.defaultOptions,{dataLabels:{borderColor:"#cccccc",borderRadius:3,borderWidth:1,crop:!1,defer:!1,enabled:!0,verticalAlign:"top",y:15,zIndex:2},dial:{backgroundColor:"#000000",baseLength:"70%",baseWidth:3,borderColor:"#cccccc",borderWidth:0,radius:"80%",rearLength:"10%",topWidth:1},pivot:{radius:5,borderWidth:0,borderColor:"#cccccc",backgroundColor:"#000000"},tooltip:{headerFormat:""},showInLegend:!1}),h(g.prototype,{angular:!0,directTouch:!0,drawGraph:o,drawTracker:r.prototype.drawTracker,fixedBox:!0,forceDL:!0,noSharedTooltip:!0,pointClass:t,trackerGroups:["group","dataLabelsGroup"]}),i.registerSeriesType("gauge",g),g}),i(e,"Series/DragNodesComposition.js",[e["Core/Globals.js"],e["Core/Utilities.js"]],function(t,e){let{composed:i}=t,{addEvent:s,pushUnique:o}=e;function a(){let t,e,i;let o=this;o.container&&(t=s(o.container,"mousedown",t=>{let a=o.hoverPoint;a&&a.series&&a.series.hasDraggableNodes&&a.series.options.draggable&&(a.series.onMouseDown(a,t),e=s(o.container,"mousemove",t=>a&&a.series&&a.series.onMouseMove(a,t)),i=s(o.container.ownerDocument,"mouseup",t=>(e(),i(),a&&a.series&&a.series.onMouseUp(a,t))));})),s(o,"destroy",function(){t();});}return {compose:function(t){o(i,"DragNodes")&&s(t,"load",a);},onMouseDown:function(t,e){let i=this.chart.pointer?.normalize(e)||e;t.fixedPosition={chartX:i.chartX,chartY:i.chartY,plotX:t.plotX,plotY:t.plotY},t.inDragMode=!0;},onMouseMove:function(t,e){if(t.fixedPosition&&t.inDragMode){let i,s;let o=this.chart,a=o.pointer?.normalize(e)||e,r=t.fixedPosition.chartX-a.chartX,n=t.fixedPosition.chartY-a.chartY,l=o.graphLayoutsLookup;(Math.abs(r)>5||Math.abs(n)>5)&&(i=t.fixedPosition.plotX-r,s=t.fixedPosition.plotY-n,o.isInsidePlot(i,s)&&(t.plotX=i,t.plotY=s,t.hasDragged=!0,this.redrawHalo(t),l.forEach(t=>{t.restartSimulation();})));}},onMouseUp:function(t){t.fixedPosition&&(t.hasDragged&&(this.layout.enableSimulation?this.layout.start():this.chart.redraw()),t.inDragMode=t.hasDragged=!1,this.options.fixedDraggable||delete t.fixedPosition);},redrawHalo:function(t){t&&this.halo&&this.halo.attr({d:t.haloPath(this.options.states.hover.halo.size)});}}}),i(e,"Series/GraphLayoutComposition.js",[e["Core/Animation/AnimationUtilities.js"],e["Core/Globals.js"],e["Core/Utilities.js"]],function(t,e,i){let{setAnimation:s}=t,{composed:o}=e,{addEvent:a,pushUnique:r}=i;function n(){this.graphLayoutsLookup&&(this.graphLayoutsLookup.forEach(t=>{t.updateSimulation();}),this.redraw());}function l(){this.graphLayoutsLookup&&(this.graphLayoutsLookup.forEach(t=>{t.updateSimulation(!1);}),this.redraw());}function h(){this.graphLayoutsLookup&&this.graphLayoutsLookup.forEach(t=>{t.stop();});}function p(){let t,e=!1,i=i=>{i.maxIterations--&&isFinite(i.temperature)&&!i.isStable()&&!i.enableSimulation&&(i.beforeStep&&i.beforeStep(),i.step(),t=!1,e=!0);};if(this.graphLayoutsLookup){for(s(!1,this),this.graphLayoutsLookup.forEach(t=>t.start());!t;)t=!0,this.graphLayoutsLookup.forEach(i);e&&this.series.forEach(t=>{t&&t.layout&&t.render();});}}return {compose:function(t){r(o,"GraphLayout")&&(a(t,"afterPrint",n),a(t,"beforePrint",l),a(t,"predraw",h),a(t,"render",p));},integrations:{},layouts:{}}}),i(e,"Series/PackedBubble/PackedBubblePoint.js",[e["Core/Chart/Chart.js"],e["Core/Series/Point.js"],e["Core/Series/SeriesRegistry.js"]],function(t,e,i){let{seriesTypes:{bubble:{prototype:{pointClass:s}}}}=i;return class extends s{destroy(){return this.series.layout&&this.series.layout.removeElementFromCollection(this,this.series.layout.nodes),e.prototype.destroy.apply(this,arguments)}firePointEvent(){let t=this.series.options;if(this.isParentNode&&t.parentNode){let i=t.allowPointSelect;t.allowPointSelect=t.parentNode.allowPointSelect,e.prototype.firePointEvent.apply(this,arguments),t.allowPointSelect=i;}else e.prototype.firePointEvent.apply(this,arguments);}select(){let i=this.series.chart;this.isParentNode?(i.getSelectedPoints=i.getSelectedParentNodes,e.prototype.select.apply(this,arguments),i.getSelectedPoints=t.prototype.getSelectedPoints):e.prototype.select.apply(this,arguments);}}}),i(e,"Series/PackedBubble/PackedBubbleSeriesDefaults.js",[e["Core/Utilities.js"]],function(t){let{isNumber:e}=t;return {minSize:"10%",maxSize:"50%",sizeBy:"area",zoneAxis:"y",crisp:!1,tooltip:{pointFormat:"Value: {point.value}"},draggable:!0,useSimulation:!0,parentNode:{allowPointSelect:!1},dataLabels:{formatter:function(){let{numberFormatter:t}=this.series.chart,{value:i}=this.point;return e(i)?t(i,-1):""},parentNodeFormatter:function(){return this.name},parentNodeTextPath:{enabled:!0},padding:0,style:{transition:"opacity 2000ms"}},layoutAlgorithm:{initialPositions:"circle",initialPositionRadius:20,bubblePadding:5,parentNodeLimit:!1,seriesInteraction:!0,dragBetweenSeries:!1,parentNodeOptions:{maxIterations:400,gravitationalConstant:.03,maxSpeed:50,initialPositionRadius:100,seriesInteraction:!0,marker:{fillColor:null,fillOpacity:1,lineWidth:null,lineColor:null,symbol:"circle"}},enableSimulation:!0,type:"packedbubble",integration:"packedbubble",maxIterations:1e3,splitSeries:!1,maxSpeed:5,gravitationalConstant:.01,friction:-.981}}}),i(e,"Series/Networkgraph/VerletIntegration.js",[],function(){return {attractive:function(t,e,i){let s=t.getMass(),o=-i.x*e*this.diffTemperature,a=-i.y*e*this.diffTemperature;t.fromNode.fixedPosition||(t.fromNode.plotX-=o*s.fromNode/t.fromNode.degree,t.fromNode.plotY-=a*s.fromNode/t.fromNode.degree),t.toNode.fixedPosition||(t.toNode.plotX+=o*s.toNode/t.toNode.degree,t.toNode.plotY+=a*s.toNode/t.toNode.degree);},attractiveForceFunction:function(t,e){return (e-t)/t},barycenter:function(){let t=this.options.gravitationalConstant||0,e=(this.barycenter.xFactor-(this.box.left+this.box.width)/2)*t,i=(this.barycenter.yFactor-(this.box.top+this.box.height)/2)*t;this.nodes.forEach(function(t){t.fixedPosition||(t.plotX-=e/t.mass/t.degree,t.plotY-=i/t.mass/t.degree);});},getK:function(t){return Math.pow(t.box.width*t.box.height/t.nodes.length,.5)},integrate:function(t,e){let i=-t.options.friction,s=t.options.maxSpeed,o=e.prevX,a=e.prevY,r=(e.plotX+e.dispX-o)*i,n=(e.plotY+e.dispY-a)*i,l=Math.abs,h=l(r)/(r||1),p=l(n)/(n||1),d=h*Math.min(s,Math.abs(r)),c=p*Math.min(s,Math.abs(n));e.prevX=e.plotX+e.dispX,e.prevY=e.plotY+e.dispY,e.plotX+=d,e.plotY+=c,e.temperature=t.vectorLength({x:d,y:c});},repulsive:function(t,e,i){let s=e*this.diffTemperature/t.mass/t.degree;t.fixedPosition||(t.plotX+=i.x*s,t.plotY+=i.y*s);},repulsiveForceFunction:function(t,e){return (e-t)/t*(e>t?1:0)}}}),i(e,"Series/PackedBubble/PackedBubbleIntegration.js",[e["Core/Globals.js"],e["Series/Networkgraph/VerletIntegration.js"]],function(t,e){let{noop:i}=t;return {barycenter:function(){let t,e;let i=this.options.gravitationalConstant,s=this.box,o=this.nodes;for(let a of o)this.options.splitSeries&&!a.isParentNode?(t=a.series.parentNode.plotX,e=a.series.parentNode.plotY):(t=s.width/2,e=s.height/2),a.fixedPosition||(a.plotX-=(a.plotX-t)*i/(a.mass*Math.sqrt(o.length)),a.plotY-=(a.plotY-e)*i/(a.mass*Math.sqrt(o.length)));},getK:i,integrate:e.integrate,repulsive:function(t,e,i,s){let o=e*this.diffTemperature/t.mass/t.degree,a=i.x*o,r=i.y*o;t.fixedPosition||(t.plotX+=a,t.plotY+=r),s.fixedPosition||(s.plotX-=a,s.plotY-=r);},repulsiveForceFunction:function(t,e,i,s){return Math.min(t,(i.marker.radius+s.marker.radius)/2)}}}),i(e,"Series/Networkgraph/EulerIntegration.js",[],function(){return {attractive:function(t,e,i,s){let o=t.getMass(),a=i.x/s*e,r=i.y/s*e;t.fromNode.fixedPosition||(t.fromNode.dispX-=a*o.fromNode/t.fromNode.degree,t.fromNode.dispY-=r*o.fromNode/t.fromNode.degree),t.toNode.fixedPosition||(t.toNode.dispX+=a*o.toNode/t.toNode.degree,t.toNode.dispY+=r*o.toNode/t.toNode.degree);},attractiveForceFunction:function(t,e){return t*t/e},barycenter:function(){let t=this.options.gravitationalConstant,e=this.barycenter.xFactor,i=this.barycenter.yFactor;this.nodes.forEach(function(s){if(!s.fixedPosition){let o=s.getDegree(),a=o*(1+o/2);s.dispX+=(e-s.plotX)*t*a/s.degree,s.dispY+=(i-s.plotY)*t*a/s.degree;}});},getK:function(t){return Math.pow(t.box.width*t.box.height/t.nodes.length,.3)},integrate:function(t,e){e.dispX+=e.dispX*t.options.friction,e.dispY+=e.dispY*t.options.friction;let i=e.temperature=t.vectorLength({x:e.dispX,y:e.dispY});0!==i&&(e.plotX+=e.dispX/i*Math.min(Math.abs(e.dispX),t.temperature),e.plotY+=e.dispY/i*Math.min(Math.abs(e.dispY),t.temperature));},repulsive:function(t,e,i,s){t.dispX+=i.x/s*e/t.degree,t.dispY+=i.y/s*e/t.degree;},repulsiveForceFunction:function(t,e){return e*e/t}}}),i(e,"Series/Networkgraph/QuadTreeNode.js",[],function(){class t{constructor(t){this.body=!1,this.isEmpty=!1,this.isInternal=!1,this.nodes=[],this.box=t,this.boxSize=Math.min(t.width,t.height);}divideBox(){let e=this.box.width/2,i=this.box.height/2;this.nodes[0]=new t({left:this.box.left,top:this.box.top,width:e,height:i}),this.nodes[1]=new t({left:this.box.left+e,top:this.box.top,width:e,height:i}),this.nodes[2]=new t({left:this.box.left+e,top:this.box.top+i,width:e,height:i}),this.nodes[3]=new t({left:this.box.left,top:this.box.top+i,width:e,height:i});}getBoxPosition(t){let e=t.plotX<this.box.left+this.box.width/2,i=t.plotY<this.box.top+this.box.height/2;return e?i?0:3:i?1:2}insert(e,i){let s;this.isInternal?this.nodes[this.getBoxPosition(e)].insert(e,i-1):(this.isEmpty=!1,this.body?i?(this.isInternal=!0,this.divideBox(),!0!==this.body&&(this.nodes[this.getBoxPosition(this.body)].insert(this.body,i-1),this.body=!0),this.nodes[this.getBoxPosition(e)].insert(e,i-1)):((s=new t({top:e.plotX||NaN,left:e.plotY||NaN,width:.1,height:.1})).body=e,s.isInternal=!1,this.nodes.push(s)):(this.isInternal=!1,this.body=e));}updateMassAndCenter(){let t=0,e=0,i=0;if(this.isInternal){for(let s of this.nodes)s.isEmpty||(t+=s.mass,e+=s.plotX*s.mass,i+=s.plotY*s.mass);e/=t,i/=t;}else this.body&&(t=this.body.mass,e=this.body.plotX,i=this.body.plotY);this.mass=t,this.plotX=e,this.plotY=i;}}return t}),i(e,"Series/Networkgraph/QuadTree.js",[e["Series/Networkgraph/QuadTreeNode.js"]],function(t){return class{constructor(e,i,s,o){this.box={left:e,top:i,width:s,height:o},this.maxDepth=25,this.root=new t(this.box),this.root.isInternal=!0,this.root.isRoot=!0,this.root.divideBox();}calculateMassAndCenter(){this.visitNodeRecursive(null,null,function(t){t.updateMassAndCenter();});}insertNodes(t){for(let e of t)this.root.insert(e,this.maxDepth);}visitNodeRecursive(t,e,i){let s;if(t||(t=this.root),t===this.root&&e&&(s=e(t)),!1!==s){for(let o of t.nodes){if(o.isInternal){if(e&&(s=e(o)),!1===s)continue;this.visitNodeRecursive(o,e,i);}else o.body&&e&&e(o.body);i&&i(o);}t===this.root&&i&&i(t);}}}}),i(e,"Series/Networkgraph/ReingoldFruchtermanLayout.js",[e["Series/Networkgraph/EulerIntegration.js"],e["Core/Globals.js"],e["Series/GraphLayoutComposition.js"],e["Series/Networkgraph/QuadTree.js"],e["Core/Utilities.js"],e["Series/Networkgraph/VerletIntegration.js"]],function(t,e,i,s,o,a){let{win:r}=e,{clamp:n,defined:l,isFunction:h,fireEvent:p,pick:d}=o;class c{constructor(){this.box={},this.currentStep=0,this.initialRendering=!0,this.links=[],this.nodes=[],this.series=[],this.simulation=!1;}static compose(e){i.compose(e),i.integrations.euler=t,i.integrations.verlet=a,i.layouts["reingold-fruchterman"]=c;}init(t){this.options=t,this.nodes=[],this.links=[],this.series=[],this.box={x:0,y:0,width:0,height:0},this.setInitialRendering(!0),this.integration=i.integrations[t.integration],this.enableSimulation=t.enableSimulation,this.attractiveForce=d(t.attractiveForce,this.integration.attractiveForceFunction),this.repulsiveForce=d(t.repulsiveForce,this.integration.repulsiveForceFunction),this.approximation=t.approximation;}updateSimulation(t){this.enableSimulation=d(t,this.options.enableSimulation);}start(){let t=this.series,e=this.options;this.currentStep=0,this.forces=t[0]&&t[0].forces||[],this.chart=t[0]&&t[0].chart,this.initialRendering&&(this.initPositions(),t.forEach(function(t){t.finishedAnimating=!0,t.render();})),this.setK(),this.resetSimulation(e),this.enableSimulation&&this.step();}step(){let t=this.series;for(let t of(this.currentStep++,"barnes-hut"===this.approximation&&(this.createQuadTree(),this.quadTree.calculateMassAndCenter()),this.forces||[]))this[t+"Forces"](this.temperature);if(this.applyLimits(),this.temperature=this.coolDown(this.startTemperature,this.diffTemperature,this.currentStep),this.prevSystemTemperature=this.systemTemperature,this.systemTemperature=this.getSystemTemperature(),this.enableSimulation){for(let e of t)e.chart&&e.render();this.maxIterations--&&isFinite(this.temperature)&&!this.isStable()?(this.simulation&&r.cancelAnimationFrame(this.simulation),this.simulation=r.requestAnimationFrame(()=>this.step())):(this.simulation=!1,this.series.forEach(t=>{p(t,"afterSimulation");}));}}stop(){this.simulation&&r.cancelAnimationFrame(this.simulation);}setArea(t,e,i,s){this.box={left:t,top:e,width:i,height:s};}setK(){this.k=this.options.linkLength||this.integration.getK(this);}addElementsToCollection(t,e){for(let i of t)-1===e.indexOf(i)&&e.push(i);}removeElementFromCollection(t,e){let i=e.indexOf(t);-1!==i&&e.splice(i,1);}clear(){this.nodes.length=0,this.links.length=0,this.series.length=0,this.resetSimulation();}resetSimulation(){this.forcedStop=!1,this.systemTemperature=0,this.setMaxIterations(),this.setTemperature(),this.setDiffTemperature();}restartSimulation(){this.simulation?this.resetSimulation():(this.setInitialRendering(!1),this.enableSimulation?this.start():this.setMaxIterations(1),this.chart&&this.chart.redraw(),this.setInitialRendering(!0));}setMaxIterations(t){this.maxIterations=d(t,this.options.maxIterations);}setTemperature(){this.temperature=this.startTemperature=Math.sqrt(this.nodes.length);}setDiffTemperature(){this.diffTemperature=this.startTemperature/(this.options.maxIterations+1);}setInitialRendering(t){this.initialRendering=t;}createQuadTree(){this.quadTree=new s(this.box.left,this.box.top,this.box.width,this.box.height),this.quadTree.insertNodes(this.nodes);}initPositions(){let t=this.options.initialPositions;if(h(t))for(let e of(t.call(this),this.nodes))l(e.prevX)||(e.prevX=e.plotX),l(e.prevY)||(e.prevY=e.plotY),e.dispX=0,e.dispY=0;else "circle"===t?this.setCircularPositions():this.setRandomPositions();}setCircularPositions(){let t;let e=this.box,i=this.nodes,s=2*Math.PI/(i.length+1),o=i.filter(function(t){return 0===t.linksTo.length}),a={},r=this.options.initialPositionRadius,n=t=>{for(let e of t.linksFrom||[])a[e.toNode.id]||(a[e.toNode.id]=!0,l.push(e.toNode),n(e.toNode));},l=[];for(let t of o)l.push(t),n(t);if(l.length)for(let t of i)-1===l.indexOf(t)&&l.push(t);else l=i;for(let i=0,o=l.length;i<o;++i)(t=l[i]).plotX=t.prevX=d(t.plotX,e.width/2+r*Math.cos(i*s)),t.plotY=t.prevY=d(t.plotY,e.height/2+r*Math.sin(i*s)),t.dispX=0,t.dispY=0;}setRandomPositions(){let t;let e=this.box,i=this.nodes,s=i.length+1,o=t=>{let e=t*t/Math.PI;return e-Math.floor(e)};for(let a=0,r=i.length;a<r;++a)(t=i[a]).plotX=t.prevX=d(t.plotX,e.width*o(a)),t.plotY=t.prevY=d(t.plotY,e.height*o(s+a)),t.dispX=0,t.dispY=0;}force(t,...e){this.integration[t].apply(this,e);}barycenterForces(){this.getBarycenter(),this.force("barycenter");}getBarycenter(){let t=0,e=0,i=0;for(let s of this.nodes)e+=s.plotX*s.mass,i+=s.plotY*s.mass,t+=s.mass;return this.barycenter={x:e,y:i,xFactor:e/t,yFactor:i/t},this.barycenter}barnesHutApproximation(t,e){let i,s;let o=this.getDistXY(t,e),a=this.vectorLength(o);return t!==e&&0!==a&&(e.isInternal?e.boxSize/a<this.options.theta&&0!==a?(s=this.repulsiveForce(a,this.k),this.force("repulsive",t,s*e.mass,o,a),i=!1):i=!0:(s=this.repulsiveForce(a,this.k),this.force("repulsive",t,s*e.mass,o,a))),i}repulsiveForces(){if("barnes-hut"===this.approximation)for(let t of this.nodes)this.quadTree.visitNodeRecursive(null,e=>this.barnesHutApproximation(t,e));else {let t,e,i;for(let s of this.nodes)for(let o of this.nodes)s===o||s.fixedPosition||(i=this.getDistXY(s,o),0!==(e=this.vectorLength(i))&&(t=this.repulsiveForce(e,this.k),this.force("repulsive",s,t*o.mass,i,e)));}}attractiveForces(){let t,e,i;for(let s of this.links)s.fromNode&&s.toNode&&(t=this.getDistXY(s.fromNode,s.toNode),0!==(e=this.vectorLength(t))&&(i=this.attractiveForce(e,this.k),this.force("attractive",s,i,t,e)));}applyLimits(){for(let t of this.nodes){if(t.fixedPosition)return;this.integration.integrate(this,t),this.applyLimitBox(t,this.box),t.dispX=0,t.dispY=0;}}applyLimitBox(t,e){let i=t.radius;t.plotX=n(t.plotX,e.left+i,e.width-i),t.plotY=n(t.plotY,e.top+i,e.height-i);}coolDown(t,e,i){return t-e*i}isStable(){return 1e-5>Math.abs(this.systemTemperature-this.prevSystemTemperature)||this.temperature<=0}getSystemTemperature(){let t=0;for(let e of this.nodes)t+=e.temperature;return t}vectorLength(t){return Math.sqrt(t.x*t.x+t.y*t.y)}getDistR(t,e){let i=this.getDistXY(t,e);return this.vectorLength(i)}getDistXY(t,e){let i=t.plotX-e.plotX,s=t.plotY-e.plotY;return {x:i,y:s,absX:Math.abs(i),absY:Math.abs(s)}}}return c}),i(e,"Series/PackedBubble/PackedBubbleLayout.js",[e["Series/GraphLayoutComposition.js"],e["Series/PackedBubble/PackedBubbleIntegration.js"],e["Series/Networkgraph/ReingoldFruchtermanLayout.js"],e["Core/Utilities.js"]],function(t,e,i,s){let{addEvent:o,pick:a}=s;function r(){let t=this.series,e=[];return t.forEach(t=>{t.parentNode&&t.parentNode.selected&&e.push(t.parentNode);}),e}function n(){this.allDataPoints&&delete this.allDataPoints;}class l extends i{constructor(){super(...arguments),this.index=NaN,this.nodes=[],this.series=[];}static compose(s){i.compose(s),t.integrations.packedbubble=e,t.layouts.packedbubble=l;let a=s.prototype;a.getSelectedParentNodes||(o(s,"beforeRedraw",n),a.getSelectedParentNodes=r);}beforeStep(){this.options.marker&&this.series.forEach(t=>{t&&t.calculateParentRadius();});}isStable(){let t=Math.abs(this.prevSystemTemperature-this.systemTemperature);return 1>Math.abs(10*this.systemTemperature/Math.sqrt(this.nodes.length))&&t<1e-5||this.temperature<=0}setCircularPositions(){let t=this.box,e=this.nodes,i=2*Math.PI/(e.length+1),s=this.options.initialPositionRadius,o,r,n=0;for(let l of e)this.options.splitSeries&&!l.isParentNode?(o=l.series.parentNode.plotX,r=l.series.parentNode.plotY):(o=t.width/2,r=t.height/2),l.plotX=l.prevX=a(l.plotX,o+s*Math.cos(l.index||n*i)),l.plotY=l.prevY=a(l.plotY,r+s*Math.sin(l.index||n*i)),l.dispX=0,l.dispY=0,n++;}repulsiveForces(){let t,e,i;let s=this,o=s.options.bubblePadding;s.nodes.forEach(a=>{a.degree=a.mass,a.neighbours=0,s.nodes.forEach(r=>{t=0,a!==r&&!a.fixedPosition&&(s.options.seriesInteraction||a.series===r.series)&&(i=s.getDistXY(a,r),(e=s.vectorLength(i)-(a.marker.radius+r.marker.radius+o))<0&&(a.degree+=.01,a.neighbours++,t=s.repulsiveForce(-e/Math.sqrt(a.neighbours),s.k,a,r)),s.force("repulsive",a,t*r.mass,i,r,e));});});}applyLimitBox(t,e){let i,s;this.options.splitSeries&&!t.isParentNode&&this.options.parentNodeLimit&&(i=this.getDistXY(t,t.series.parentNode),(s=t.series.parentNodeRadius-t.marker.radius-this.vectorLength(i))<0&&s>-2*t.marker.radius&&(t.plotX-=.01*i.x,t.plotY-=.01*i.y)),super.applyLimitBox(t,e);}}return t.layouts.packedbubble=l,l}),i(e,"Series/SimulationSeriesUtilities.js",[e["Core/Utilities.js"],e["Core/Animation/AnimationUtilities.js"]],function(t,e){let{merge:i,syncTimeout:s}=t,{animObject:o}=e;return {initDataLabels:function(){let t=this.options.dataLabels;if(!this.dataLabelsGroup){let e=this.initDataLabelsGroup();return !this.chart.styledMode&&t?.style&&e.css(t.style),e.attr({opacity:0}),this.visible&&e.show(),e}return this.dataLabelsGroup.attr(i({opacity:1},this.getPlotBox("data-labels"))),this.dataLabelsGroup},initDataLabelsDefer:function(){let t=this.options.dataLabels;t?.defer&&this.options.layoutAlgorithm?.enableSimulation?s(()=>{this.deferDataLabels=!1;},t?o(t.animation).defer:0):this.deferDataLabels=!1;}}}),i(e,"Series/PackedBubble/PackedBubbleSeries.js",[e["Core/Color/Color.js"],e["Series/DragNodesComposition.js"],e["Series/GraphLayoutComposition.js"],e["Core/Globals.js"],e["Series/PackedBubble/PackedBubblePoint.js"],e["Series/PackedBubble/PackedBubbleSeriesDefaults.js"],e["Series/PackedBubble/PackedBubbleLayout.js"],e["Core/Series/SeriesRegistry.js"],e["Series/SimulationSeriesUtilities.js"],e["Core/Utilities.js"]],function(t,e,i,s,o,a,r,n,l,h){let{parse:p}=t,{noop:d}=s,{series:{prototype:c},seriesTypes:{bubble:u}}=n,{initDataLabels:g,initDataLabelsDefer:f}=l,{addEvent:b,clamp:m,defined:y,extend:x,fireEvent:P,isArray:S,isNumber:M,merge:L,pick:k}=h;class v extends u{constructor(){super(...arguments),this.parentNodeMass=0,this.deferDataLabels=!0;}static compose(t,i,s,o){u.compose(t,i,s,o),e.compose(i),r.compose(i);}accumulateAllPoints(){let t;let e=this.chart,i=[];for(let s of e.series)if(s.is("packedbubble")&&s.reserveSpace()){t=s.yData||[];for(let e=0;e<t.length;e++)i.push([null,null,t[e],s.index,e,{id:e,marker:{radius:0}}]);}return i}addLayout(){let t=this.options.layoutAlgorithm=this.options.layoutAlgorithm||{},e=t.type||"packedbubble",s=this.chart.options.chart,o=this.chart.graphLayoutsStorage,a=this.chart.graphLayoutsLookup,r;o||(this.chart.graphLayoutsStorage=o={},this.chart.graphLayoutsLookup=a=[]),(r=o[e])||(t.enableSimulation=y(s.forExport)?!s.forExport:t.enableSimulation,o[e]=r=new i.layouts[e],r.init(t),a.splice(r.index,0,r)),this.layout=r,this.points.forEach(t=>{t.mass=2,t.degree=1,t.collisionNmb=1;}),r.setArea(0,0,this.chart.plotWidth,this.chart.plotHeight),r.addElementsToCollection([this],r.series),r.addElementsToCollection(this.points,r.nodes);}addSeriesLayout(){let t=this.options.layoutAlgorithm=this.options.layoutAlgorithm||{},e=t.type||"packedbubble",s=this.chart.graphLayoutsStorage,o=this.chart.graphLayoutsLookup,a=L(t,t.parentNodeOptions,{enableSimulation:this.layout.options.enableSimulation}),r=s[e+"-series"];r||(s[e+"-series"]=r=new i.layouts[e],r.init(a),o.splice(r.index,0,r)),this.parentNodeLayout=r,this.createParentNodes();}calculateParentRadius(){let t=this.seriesBox();this.parentNodeRadius=m(Math.sqrt(2*this.parentNodeMass/Math.PI)+20,20,t?Math.max(Math.sqrt(Math.pow(t.width,2)+Math.pow(t.height,2))/2+20,20):Math.sqrt(2*this.parentNodeMass/Math.PI)+20),this.parentNode&&(this.parentNode.marker.radius=this.parentNode.radius=this.parentNodeRadius);}calculateZExtremes(){let t=this.chart.series,e=this.options.zMin,i=this.options.zMax,s=1/0,o=-1/0;return e&&i?[e,i]:(t.forEach(t=>{t.yData.forEach(t=>{y(t)&&(t>o&&(o=t),t<s&&(s=t));});}),[e=k(e,s),i=k(i,o)])}checkOverlap(t,e){let i=t[0]-e[0],s=t[1]-e[1];return Math.sqrt(i*i+s*s)-Math.abs(t[2]+e[2])<-.001}createParentNodes(){let t=this.pointClass,e=this.chart,i=this.parentNodeLayout,s=this.layout.options,o,a=this.parentNode,r={radius:this.parentNodeRadius,lineColor:this.color,fillColor:p(this.color).brighten(.4).get()};s.parentNodeOptions&&(r=L(s.parentNodeOptions.marker||{},r)),this.parentNodeMass=0,this.points.forEach(t=>{this.parentNodeMass+=Math.PI*Math.pow(t.marker.radius,2);}),this.calculateParentRadius(),i.nodes.forEach(t=>{t.seriesIndex===this.index&&(o=!0);}),i.setArea(0,0,e.plotWidth,e.plotHeight),o||(a||(a=new t(this,{mass:this.parentNodeRadius/2,marker:r,dataLabels:{inside:!1},states:{normal:{marker:r},hover:{marker:r}},dataLabelOnNull:!0,degree:this.parentNodeRadius,isParentNode:!0,seriesIndex:this.index})),this.parentNode&&(a.plotX=this.parentNode.plotX,a.plotY=this.parentNode.plotY),this.parentNode=a,i.addElementsToCollection([this],i.series),i.addElementsToCollection([a],i.nodes));}deferLayout(){let t=this.options.layoutAlgorithm;this.visible&&(this.addLayout(),t.splitSeries&&this.addSeriesLayout());}destroy(){this.chart.graphLayoutsLookup&&this.chart.graphLayoutsLookup.forEach(t=>{t.removeElementFromCollection(this,t.series);},this),this.parentNode&&this.parentNodeLayout&&(this.parentNodeLayout.removeElementFromCollection(this.parentNode,this.parentNodeLayout.nodes),this.parentNode.dataLabel&&(this.parentNode.dataLabel=this.parentNode.dataLabel.destroy())),c.destroy.apply(this,arguments);}drawDataLabels(){!this.deferDataLabels&&(c.drawDataLabels.call(this,this.points),this.parentNode&&(this.parentNode.formatPrefix="parentNode",c.drawDataLabels.call(this,[this.parentNode])));}drawGraph(){if(!this.layout||!this.layout.options.splitSeries)return;let t=this.chart,e=this.layout.options.parentNodeOptions.marker,i={fill:e.fillColor||p(this.color).brighten(.4).get(),opacity:e.fillOpacity,stroke:e.lineColor||this.color,"stroke-width":k(e.lineWidth,this.options.lineWidth)},s={};this.parentNodesGroup=this.plotGroup("parentNodesGroup","parentNode",this.visible?"inherit":"hidden",.1,t.seriesGroup),this.group?.attr({zIndex:2}),this.calculateParentRadius(),this.parentNode&&y(this.parentNode.plotX)&&y(this.parentNode.plotY)&&y(this.parentNodeRadius)&&(s=L({x:this.parentNode.plotX-this.parentNodeRadius,y:this.parentNode.plotY-this.parentNodeRadius,width:2*this.parentNodeRadius,height:2*this.parentNodeRadius},i),this.parentNode.graphic||(this.graph=this.parentNode.graphic=t.renderer.symbol(i.symbol).add(this.parentNodesGroup)),this.parentNode.graphic.attr(s));}drawTracker(){let t;let e=this.parentNode;super.drawTracker(),e&&(t=S(e.dataLabels)?e.dataLabels:e.dataLabel?[e.dataLabel]:[],e.graphic&&(e.graphic.element.point=e),t.forEach(t=>{(t.div||t.element).point=e;}));}getPointRadius(){let t,e,i,s;let o=this.chart,a=o.plotWidth,r=o.plotHeight,n=this.options,l=n.useSimulation,h=Math.min(a,r),p={},d=[],c=o.allDataPoints||[],u=c.length;["minSize","maxSize"].forEach(t=>{let e=parseInt(n[t],10),i=/%$/.test(n[t]);p[t]=i?h*e/100:e*Math.sqrt(u);}),o.minRadius=t=p.minSize/Math.sqrt(u),o.maxRadius=e=p.maxSize/Math.sqrt(u);let g=l?this.calculateZExtremes():[t,e];c.forEach((o,a)=>{i=l?m(o[2],g[0],g[1]):o[2],0===(s=this.getRadius(g[0],g[1],t,e,i))&&(s=null),c[a][2]=s,d.push(s);}),this.radii=d;}init(){return c.init.apply(this,arguments),f.call(this),this.eventsToUnbind.push(b(this,"updatedData",function(){this.chart.series.forEach(t=>{t.type===this.type&&(t.isDirty=!0);},this);})),this}onMouseUp(t){if(t.fixedPosition&&!t.removed){let i;let s=this.layout,o=this.parentNodeLayout;o&&s.options.dragBetweenSeries&&o.nodes.forEach(e=>{t&&t.marker&&e!==t.series.parentNode&&(i=s.getDistXY(t,e),s.vectorLength(i)-e.marker.radius-t.marker.radius<0&&(e.series.addPoint(L(t.options,{plotX:t.plotX,plotY:t.plotY}),!1),s.removeElementFromCollection(t,s.nodes),t.remove()));}),e.onMouseUp.apply(this,arguments);}}placeBubbles(t){let e=this.checkOverlap,i=this.positionBubble,s=[],o=1,a=0,r=0,n,l=[],h,p=t.sort((t,e)=>e[2]-t[2]);if(p.length){if(s.push([[0,0,p[0][2],p[0][3],p[0][4]]]),p.length>1)for(s.push([[0,0-p[1][2]-p[0][2],p[1][2],p[1][3],p[1][4]]]),h=2;h<p.length;h++)p[h][2]=p[h][2]||1,e(n=i(s[o][a],s[o-1][r],p[h]),s[o][0])?(s.push([]),r=0,s[o+1].push(i(s[o][a],s[o][0],p[h])),o++,a=0):o>1&&s[o-1][r+1]&&e(n,s[o-1][r+1])?(r++,s[o].push(i(s[o][a],s[o-1][r],p[h])),a++):(a++,s[o].push(n));this.chart.stages=s,this.chart.rawPositions=[].concat.apply([],s),this.resizeRadius(),l=this.chart.rawPositions;}return l}pointAttribs(t,e){let i=this.options,s=t&&t.isParentNode,o=i.marker;s&&i.layoutAlgorithm&&i.layoutAlgorithm.parentNodeOptions&&(o=i.layoutAlgorithm.parentNodeOptions.marker);let a=o.fillOpacity,r=c.pointAttribs.call(this,t,e);return 1!==a&&(r["fill-opacity"]=a),r}positionBubble(t,e,i){let s=Math.pow,o=(0, Math.sqrt)(s(t[0]-e[0],2)+s(t[1]-e[1],2)),a=(0, Math.acos)((s(o,2)+s(i[2]+e[2],2)-s(i[2]+t[2],2))/(2*(i[2]+e[2])*o)),r=(0, Math.asin)((0, Math.abs)(t[0]-e[0])/o),n=(t[1]-e[1]<0?0:Math.PI)+a+r*((t[0]-e[0])*(t[1]-e[1])<0?1:-1);return [e[0]+(e[2]+i[2])*Math.sin(n),e[1]-(e[2]+i[2])*Math.cos(n),i[2],i[3],i[4]]}render(){let t=[];c.render.apply(this,arguments),!this.options.dataLabels.allowOverlap&&(this.data.forEach(e=>{S(e.dataLabels)&&e.dataLabels.forEach(e=>{t.push(e);});}),this.options.useSimulation&&this.chart.hideOverlappingLabels(t));}resizeRadius(){let t,e,i,s,o;let a=this.chart,r=a.rawPositions,n=Math.min,l=Math.max,h=a.plotLeft,p=a.plotTop,d=a.plotHeight,c=a.plotWidth;for(let a of(t=i=Number.POSITIVE_INFINITY,e=s=Number.NEGATIVE_INFINITY,r))o=a[2],t=n(t,a[0]-o),e=l(e,a[0]+o),i=n(i,a[1]-o),s=l(s,a[1]+o);let u=[e-t,s-i],g=[(c-h)/u[0],(d-p)/u[1]],f=n.apply([],g);if(Math.abs(f-1)>1e-10){for(let t of r)t[2]*=f;this.placeBubbles(r);}else a.diffY=d/2+p-i-(s-i)/2,a.diffX=c/2+h-t-(e-t)/2;}seriesBox(){let t;let e=this.chart,i=this.data,s=Math.max,o=Math.min,a=[e.plotLeft,e.plotLeft+e.plotWidth,e.plotTop,e.plotTop+e.plotHeight];return i.forEach(e=>{y(e.plotX)&&y(e.plotY)&&e.marker.radius&&(t=e.marker.radius,a[0]=o(a[0],e.plotX-t),a[1]=s(a[1],e.plotX+t),a[2]=o(a[2],e.plotY-t),a[3]=s(a[3],e.plotY+t));}),M(a.width/a.height)?a:null}setVisible(){let t=this;c.setVisible.apply(t,arguments),t.parentNodeLayout&&t.graph?t.visible?(t.graph.show(),t.parentNode.dataLabel&&t.parentNode.dataLabel.show()):(t.graph.hide(),t.parentNodeLayout.removeElementFromCollection(t.parentNode,t.parentNodeLayout.nodes),t.parentNode.dataLabel&&t.parentNode.dataLabel.hide()):t.layout&&(t.visible?t.layout.addElementsToCollection(t.points,t.layout.nodes):t.points.forEach(e=>{t.layout.removeElementFromCollection(e,t.layout.nodes);}));}translate(){let t,e,i;let s=this.chart,o=this.data,a=this.index,r=this.options.useSimulation;for(let n of(this.processedXData=this.xData,this.generatePoints(),y(s.allDataPoints)||(s.allDataPoints=this.accumulateAllPoints(),this.getPointRadius()),r?i=s.allDataPoints:(i=this.placeBubbles(s.allDataPoints),this.options.draggable=!1),i))n[3]===a&&(t=o[n[4]],e=k(n[2],void 0),r||(t.plotX=n[0]-s.plotLeft+s.diffX,t.plotY=n[1]-s.plotTop+s.diffY),M(e)&&(t.marker=x(t.marker,{radius:e,width:2*e,height:2*e}),t.radius=e));r&&this.deferLayout(),P(this,"afterTranslate");}}return v.defaultOptions=L(u.defaultOptions,a),x(v.prototype,{pointClass:o,axisTypes:[],directTouch:!0,forces:["barycenter","repulsive"],hasDraggableNodes:!0,invertible:!1,isCartesian:!1,noSharedTooltip:!0,pointArrayMap:["value"],pointValKey:"value",requireSorting:!1,trackerGroups:["group","dataLabelsGroup","parentNodesGroup"],initDataLabels:g,alignDataLabel:c.alignDataLabel,indexateNodes:d,onMouseDown:e.onMouseDown,onMouseMove:e.onMouseMove,redrawHalo:e.redrawHalo,searchPoint:d}),n.registerSeriesType("packedbubble",v),v}),i(e,"Series/Polygon/PolygonSeriesDefaults.js",[],function(){return {marker:{enabled:!1,states:{hover:{enabled:!1}}},stickyTracking:!1,tooltip:{followPointer:!0,pointFormat:""},trackByArea:!0,legendSymbol:"rectangle"}}),i(e,"Series/Polygon/PolygonSeries.js",[e["Core/Globals.js"],e["Series/Polygon/PolygonSeriesDefaults.js"],e["Core/Series/SeriesRegistry.js"],e["Core/Utilities.js"]],function(t,e,i,s){let{noop:o}=t,{area:a,line:r,scatter:n}=i.seriesTypes,{extend:l,merge:h}=s;class p extends n{getGraphPath(){let t=r.prototype.getGraphPath.call(this),e=t.length+1;for(;e--;)(e===t.length||"M"===t[e][0])&&e>0&&t.splice(e,0,["Z"]);return this.areaPath=t,t}drawGraph(){this.options.fillColor=this.color,a.prototype.drawGraph.call(this);}}return p.defaultOptions=h(n.defaultOptions,e),l(p.prototype,{type:"polygon",drawTracker:r.prototype.drawTracker,setStackedPoints:o}),i.registerSeriesType("polygon",p),p}),i(e,"Core/Axis/RadialAxis.js",[e["Core/Defaults.js"],e["Core/Globals.js"],e["Core/Utilities.js"]],function(t,e,i){var s;let{defaultOptions:o}=t,{composed:a,noop:r}=e,{addEvent:n,correctFloat:l,defined:h,extend:p,fireEvent:d,isObject:c,merge:u,pick:g,pushUnique:f,relativeLength:b,wrap:m}=i;return function(t){let e={gridLineWidth:1,labels:{align:void 0,x:0,y:void 0,style:{textOverflow:"none"}},maxPadding:0,minPadding:0,showLastLabel:!1,tickLength:0},i={endOnTick:!1,gridLineWidth:0,labels:{align:"center",distance:-25,x:0,y:void 0},lineWidth:1,minorGridLineWidth:0,minorTickInterval:"auto",minorTickLength:10,minorTickPosition:"inside",minorTickWidth:1,startOnTick:!1,tickLength:10,tickPixelInterval:100,tickPosition:"inside",tickWidth:2,title:{rotation:0,text:""},zIndex:2},s={gridLineInterpolation:"circle",gridLineWidth:1,labels:{align:"right",x:-3,y:-2},showLastLabel:!1,title:{x:4,text:null,rotation:90}};function y(){this.autoConnect=this.isCircular&&void 0===g(this.userMax,this.options.max)&&l(this.endAngleRad-this.startAngleRad)===l(2*Math.PI),!this.isCircular&&this.chart.inverted&&this.max++,this.autoConnect&&(this.max+=this.categories&&1||this.pointRange||this.closestPointRange||0);}function x(){return ()=>{if(this.isRadial&&this.tickPositions&&this.options.labels&&!0!==this.options.labels.allowOverlap)return this.tickPositions.map(t=>this.ticks[t]&&this.ticks[t].label).filter(t=>!!t)}}function P(){return r}function S(t,e,i){let s=this.pane.center,o=t.value,a,r,n;return this.isCircular?(h(o)?t.point&&(t.point.shapeArgs||{}).start&&(o=this.chart.inverted?this.translate(t.point.rectPlotY,!0):t.point.x):(r=t.chartX||0,n=t.chartY||0,o=this.translate(Math.atan2(n-i,r-e)-this.startAngleRad,!0)),r=(a=this.getPosition(o)).x,n=a.y):(h(o)||(r=t.chartX,n=t.chartY),h(r)&&h(n)&&(i=s[1]+this.chart.plotTop,o=this.translate(Math.min(Math.sqrt(Math.pow(r-e,2)+Math.pow(n-i,2)),s[2]/2)-s[3]/2,!0))),[o,r||0,n||0]}function M(t,e,i){let s=this.pane.center,o=this.chart,a=this.left||0,r=this.top||0,n,l=g(e,s[2]/2-this.offset),h;return void 0===i&&(i=this.horiz?0:this.center&&-this.center[3]/2),i&&(l+=i),this.isCircular||void 0!==e?((h=this.chart.renderer.symbols.arc(a+s[0],r+s[1],l,l,{start:this.startAngleRad,end:this.endAngleRad,open:!0,innerR:0})).xBounds=[a+s[0]],h.yBounds=[r+s[1]-l]):(n=this.postTranslate(this.angleRad,l),h=[["M",this.center[0]+o.plotLeft,this.center[1]+o.plotTop],["L",n.x,n.y]]),h}function L(){this.constructor.prototype.getOffset.call(this),this.chart.axisOffset[this.side]=0;}function k(t,e,i){let s=this.chart,o=t=>{if("string"==typeof t){let e=parseInt(t,10);return d.test(t)&&(e=e*n/100),e}return t},a=this.center,r=this.startAngleRad,n=a[2]/2,l=Math.min(this.offset,0),h=this.left||0,p=this.top||0,d=/%$/,c=this.isCircular,u,f,b,m,y,x,P=g(o(i.outerRadius),n),S=o(i.innerRadius),M=g(o(i.thickness),10);if("polygon"===this.options.gridLineInterpolation)x=this.getPlotLinePath({value:t}).concat(this.getPlotLinePath({value:e,reverse:!0}));else {t=Math.max(t,this.min),e=Math.min(e,this.max);let o=this.translate(t),n=this.translate(e);c||(P=o||0,S=n||0),"circle"!==i.shape&&c?(u=r+(o||0),f=r+(n||0)):(u=-Math.PI/2,f=1.5*Math.PI,y=!0),P-=l,M-=l,x=s.renderer.symbols.arc(h+a[0],p+a[1],P,P,{start:Math.min(u,f),end:Math.max(u,f),innerR:g(S,P-M),open:y}),c&&(b=(f+u)/2,m=h+a[0]+a[2]/2*Math.cos(b),x.xBounds=b>-Math.PI/2&&b<Math.PI/2?[m,s.plotWidth]:[0,m],x.yBounds=[p+a[1]+a[2]/2*Math.sin(b)],x.yBounds[0]+=b>-Math.PI&&b<0||b>Math.PI?-10:10);}return x}function v(t){let e=this.pane.center,i=this.chart,s=i.inverted,o=t.reverse,a=this.pane.options.background?this.pane.options.background[0]||this.pane.options.background:{},r=a.innerRadius||"0%",n=a.outerRadius||"100%",l=e[0]+i.plotLeft,h=e[1]+i.plotTop,p=this.height,d=t.isCrosshair,c=e[3]/2,u=t.value,g,f,m,y,x,P,S,M,L,k=this.getPosition(u),v=k.x,C=k.y;if(d&&(u=(M=this.getCrosshairPosition(t,l,h))[0],v=M[1],C=M[2]),this.isCircular)f=Math.sqrt(Math.pow(v-l,2)+Math.pow(C-h,2)),m="string"==typeof r?b(r,1):r/f,y="string"==typeof n?b(n,1):n/f,e&&c&&(m<(g=c/f)&&(m=g),y<g&&(y=g)),L=[["M",l+m*(v-l),h-m*(h-C)],["L",v-(1-y)*(v-l),C+(1-y)*(h-C)]];else if((u=this.translate(u))&&(u<0||u>p)&&(u=0),"circle"===this.options.gridLineInterpolation)L=this.getLinePath(0,u,c);else if(L=[],i[s?"yAxis":"xAxis"].forEach(t=>{t.pane===this.pane&&(x=t);}),x){S=x.tickPositions,x.autoConnect&&(S=S.concat([S[0]])),o&&(S=S.slice().reverse()),u&&(u+=c);for(let t=0;t<S.length;t++)P=x.getPosition(S[t],u),L.push(t?["L",P.x,P.y]:["M",P.x,P.y]);}return L}function C(t,e){let i=this.translate(t);return this.postTranslate(this.isCircular?i:this.angleRad,g(this.isCircular?e:i<0?0:i,this.center[2]/2)-this.offset)}function w(){let t=this.center,e=this.chart,i=this.options.title;return {x:e.plotLeft+t[0]+(i.x||0),y:e.plotTop+t[1]-({high:.5,middle:.25,low:0})[i.align]*t[2]+(i.y||0)}}function A(t){t.beforeSetTickPositions=y,t.createLabelCollector=x,t.getCrosshairPosition=S,t.getLinePath=M,t.getOffset=L,t.getPlotBandPath=k,t.getPlotLinePath=v,t.getPosition=C,t.getTitlePosition=w,t.postTranslate=D,t.setAxisSize=B,t.setAxisTranslation=z,t.setOptions=O;}function N(){let t=this.chart,e=this.options,i=t.angular&&this.isXAxis,s=this.pane,o=s&&s.options;if(!i&&s&&(t.angular||t.polar)){let t=2*Math.PI,i=(g(o.startAngle,0)-90)*Math.PI/180,s=(g(o.endAngle,g(o.startAngle,0)+360)-90)*Math.PI/180;this.angleRad=(e.angle||0)*Math.PI/180,this.startAngleRad=i,this.endAngleRad=s,this.offset=e.offset||0;let a=(i%t+t)%t,r=(s%t+t)%t;a>Math.PI&&(a-=t),r>Math.PI&&(r-=t),this.normalizedStartAngleRad=a,this.normalizedEndAngleRad=r;}}function T(t){this.isRadial&&(t.align=void 0,t.preventDefault());}function X(){if(this.chart&&this.chart.labelCollectors){let t=this.labelCollector?this.chart.labelCollectors.indexOf(this.labelCollector):-1;t>=0&&this.chart.labelCollectors.splice(t,1);}}function Y(t){let e;let i=this.chart,s=i.angular,o=i.polar,a=this.isXAxis,n=this.coll,l=t.userOptions.pane||0,h=this.pane=i.pane&&i.pane[l];if("colorAxis"===n){this.isRadial=!1;return}s?(s&&a?(this.isHidden=!0,this.createLabelCollector=P,this.getOffset=r,this.redraw=E,this.render=E,this.setScale=r,this.setCategories=r,this.setTitle=r):A(this),e=!a):o&&(A(this),e=this.horiz),s||o?(this.isRadial=!0,this.labelCollector||(this.labelCollector=this.createLabelCollector()),this.labelCollector&&i.labelCollectors.push(this.labelCollector)):this.isRadial=!1,h&&e&&(h.axis=this),this.isCircular=e;}function R(){this.isRadial&&this.beforeSetTickPositions();}function I(t){let e=this.label;if(!e)return;let i=this.axis,s=e.getBBox(),o=i.options.labels,a=(i.translate(this.pos)+i.startAngleRad+Math.PI/2)/Math.PI*180%360,r=Math.round(a),n=h(o.y)?0:-(.3*s.height),l=o.y,p,d=20,c=o.align,u="end",f=r<0?r+360:r,m=f,y=0,x=0;i.isRadial&&(p=i.getPosition(this.pos,i.center[2]/2+b(g(o.distance,-25),i.center[2]/2,-i.center[2]/2)),"auto"===o.rotation?e.attr({rotation:a}):h(l)||(l=i.chart.renderer.fontMetrics(e).b-s.height/2),h(c)||(i.isCircular?(s.width>i.len*i.tickInterval/(i.max-i.min)&&(d=0),c=a>d&&a<180-d?"left":a>180+d&&a<360-d?"right":"center"):c="center",e.attr({align:c})),"auto"===c&&2===i.tickPositions.length&&i.isCircular&&(f>90&&f<180?f=180-f:f>270&&f<=360&&(f=540-f),m>180&&m<=360&&(m=360-m),(i.pane.options.startAngle===r||i.pane.options.startAngle===r+360||i.pane.options.startAngle===r-360)&&(u="start"),c=r>=-90&&r<=90||r>=-360&&r<=-270||r>=270&&r<=360?"start"===u?"right":"left":"start"===u?"left":"right",m>70&&m<110&&(c="center"),f<15||f>=180&&f<195?y=.3*s.height:f>=15&&f<=35?y="start"===u?0:.75*s.height:f>=195&&f<=215?y="start"===u?.75*s.height:0:f>35&&f<=90?y="start"===u?-(.25*s.height):s.height:f>215&&f<=270&&(y="start"===u?s.height:-(.25*s.height)),m<15?x="start"===u?-(.15*s.height):.15*s.height:m>165&&m<=180&&(x="start"===u?.15*s.height:-(.15*s.height)),e.attr({align:c}),e.translate(x,y+n)),t.pos.x=p.x+(o.x||0),t.pos.y=p.y+(l||0));}function j(t){this.axis.getPosition&&p(t.pos,this.axis.getPosition(this.pos));}function D(t,e){let i=this.chart,s=this.center;return t=this.startAngleRad+t,{x:i.plotLeft+s[0]+Math.cos(t)*e,y:i.plotTop+s[1]+Math.sin(t)*e}}function E(){this.isDirty=!1;}function B(){let t,e;this.constructor.prototype.setAxisSize.call(this),this.isRadial&&(this.pane.updateCenter(this),t=this.center=this.pane.center.slice(),this.isCircular?this.sector=this.endAngleRad-this.startAngleRad:(e=this.postTranslate(this.angleRad,t[3]/2),t[0]=e.x-this.chart.plotLeft,t[1]=e.y-this.chart.plotTop),this.len=this.width=this.height=(t[2]-t[3])*g(this.sector,1)/2);}function z(){this.constructor.prototype.setAxisTranslation.call(this),this.center&&(this.isCircular?this.transA=(this.endAngleRad-this.startAngleRad)/(this.max-this.min||1):this.transA=(this.center[2]-this.center[3])/2/(this.max-this.min||1),this.isXAxis?this.minPixelPadding=this.transA*this.minPointOffset:this.minPixelPadding=0);}function O(t){let{coll:a}=this,{angular:r,inverted:n,polar:l}=this.chart,h={};r?this.isXAxis||(h=u(o.yAxis,i)):l&&(h=this.horiz?u(o.xAxis,e):u("xAxis"===a?o.xAxis:o.yAxis,s)),n&&"yAxis"===a&&(h.stackLabels=c(o.yAxis,!0)?o.yAxis.stackLabels:{},h.reversedStacks=!0);let p=this.options=u(h,t);p.plotBands||(p.plotBands=[]),d(this,"afterSetOptions");}function W(t,e,i,s,o,a,r){let n;let l=this.axis;return l.isRadial?["M",e,i,"L",(n=l.getPosition(this.pos,l.center[2]/2+s)).x,n.y]:t.call(this,e,i,s,o,a,r)}t.compose=function(t,e){return f(a,"Axis.Radial")&&(n(t,"afterInit",N),n(t,"autoLabelAlign",T),n(t,"destroy",X),n(t,"init",Y),n(t,"initialAxisTranslation",R),n(e,"afterGetLabelPosition",I),n(e,"afterGetPosition",j),m(e.prototype,"getMarkPath",W)),t};}(s||(s={})),s}),i(e,"Series/PolarComposition.js",[e["Core/Animation/AnimationUtilities.js"],e["Core/Globals.js"],e["Core/Series/Series.js"],e["Extensions/Pane/Pane.js"],e["Core/Axis/RadialAxis.js"],e["Core/Utilities.js"]],function(t,e,i,s,o,a){let{animObject:r}=t,{composed:n}=e,{addEvent:l,defined:h,find:p,isNumber:d,merge:c,pick:u,pushUnique:g,relativeLength:f,splat:b,uniqueKey:m,wrap:y}=a;function x(){(this.pane||[]).forEach(t=>{t.render();});}function P(t){let e=t.args[0].xAxis,i=t.args[0].yAxis,s=t.args[0].chart;e&&i&&("polygon"===i.gridLineInterpolation?(e.startOnTick=!0,e.endOnTick=!0):"polygon"===e.gridLineInterpolation&&s.inverted&&(i.startOnTick=!0,i.endOnTick=!0));}function S(){this.pane||(this.pane=[]),this.options.pane=b(this.options.pane),this.options.pane.forEach(t=>{new s(t,this);},this);}function M(t){let e=t.args.marker,i=this.chart.xAxis[0],s=this.chart.yAxis[0],o=this.chart.inverted,a=o?s:i,r=o?i:s;if(this.chart.polar){t.preventDefault();let i=(e.attr?e.attr("start"):e.start)-a.startAngleRad,s=e.attr?e.attr("r"):e.r,o=(e.attr?e.attr("end"):e.end)-a.startAngleRad,n=e.attr?e.attr("innerR"):e.innerR;t.result.x=i+a.pos,t.result.width=o-i,t.result.y=r.len+r.pos-s,t.result.height=s-n;}}function L(t){let e=this.chart;if(e.polar&&e.hoverPane&&e.hoverPane.axis){t.preventDefault();let i=e.hoverPane.center,s=e.mouseDownX||0,o=e.mouseDownY||0,a=t.args.chartY,r=t.args.chartX,n=2*Math.PI,l=e.hoverPane.axis.startAngleRad,h=e.hoverPane.axis.endAngleRad,p=e.inverted?e.xAxis[0]:e.yAxis[0],d={},c="arc";if(d.x=i[0]+e.plotLeft,d.y=i[1]+e.plotTop,this.zoomHor){let t=l>0?h-l:Math.abs(l)+Math.abs(h),u=Math.atan2(o-e.plotTop-i[1],s-e.plotLeft-i[0])-l,g=Math.atan2(a-e.plotTop-i[1],r-e.plotLeft-i[0])-l;d.r=i[2]/2,d.innerR=i[3]/2,u<=0&&(u+=n),g<=0&&(g+=n),g<u&&(g=[u,u=g][0]),t<n&&l+g>h+(n-t)/2&&(g=u,u=l<=0?l:0);let f=d.start=Math.max(u+l,l),b=d.end=Math.min(g+l,h);if("polygon"===p.options.gridLineInterpolation){let t=e.hoverPane.axis,s=f-t.startAngleRad+t.pos,o=p.getPlotLinePath({value:p.max}),a=t.toValue(s),r=t.toValue(s+(b-f));if(a<t.getExtremes().min){let{min:e,max:i}=t.getExtremes();a=i-(e-a);}if(r<t.getExtremes().min){let{min:e,max:i}=t.getExtremes();r=i-(e-r);}r<a&&(r=[a,a=r][0]),(o=w(o,a,r,t)).push(["L",i[0]+e.plotLeft,e.plotTop+i[1]]),d.d=o,c="path";}}if(this.zoomVert){let t=e.inverted?e.xAxis[0]:e.yAxis[0],n=Math.sqrt(Math.pow(s-e.plotLeft-i[0],2)+Math.pow(o-e.plotTop-i[1],2)),p=Math.sqrt(Math.pow(r-e.plotLeft-i[0],2)+Math.pow(a-e.plotTop-i[1],2));if(p<n&&(n=[p,p=n][0]),p>i[2]/2&&(p=i[2]/2),n<i[3]/2&&(n=i[3]/2),this.zoomHor||(d.start=l,d.end=h),d.r=p,d.innerR=n,"polygon"===t.options.gridLineInterpolation){let e=t.toValue(t.len+t.pos-n),i=t.toValue(t.len+t.pos-p),s=t.getPlotLinePath({value:i}).concat(t.getPlotLinePath({value:e,reverse:!0}));d.d=s,c="path";}}if(this.zoomHor&&this.zoomVert&&"polygon"===p.options.gridLineInterpolation){let t=e.hoverPane.axis,i=d.start||0,s=d.end||0,o=i-t.startAngleRad+t.pos,a=t.toValue(o),r=t.toValue(o+(s-i));if(d.d instanceof Array){let t=d.d.slice(0,d.d.length/2),i=d.d.slice(d.d.length/2,d.d.length);i=[...i].reverse();let s=e.hoverPane.axis;t=w(t,a,r,s),(i=w(i,a,r,s))&&(i[0][0]="L"),i=[...i].reverse(),d.d=t.concat(i),c="path";}}t.attrs=d,t.shapeType=c;}}function k(){let t=this.chart;t.polar&&(this.polar=new E(this),t.inverted&&(this.isRadialSeries=!0,this.is("column")&&(this.isRadialBar=!0)));}function v(){if(this.chart.polar&&this.xAxis){let{xAxis:t,yAxis:i}=this,s=this.chart;this.kdByAngle=s.tooltip&&s.tooltip.shared,this.kdByAngle||s.inverted?this.searchPoint=C:this.options.findNearestPointBy="xy";let o=this.points,a=o.length;for(;a--;)this.is("column")||this.is("columnrange")||this.polar.toXY(o[a]),s.hasParallelCoordinates||this.yAxis.reversed||(u(o[a].y,Number.MIN_VALUE)<i.min||o[a].x<t.min||o[a].x>t.max?(o[a].isNull=!0,o[a].plotY=NaN):o[a].isNull=o[a].isValid&&!o[a].isValid());this.hasClipCircleSetter||(this.hasClipCircleSetter=!!this.eventsToUnbind.push(l(this,"afterRender",function(){let t;s.polar&&!1!==this.options.clip&&(t=this.yAxis.pane.center,this.clipCircle?this.clipCircle.animate({x:t[0],y:t[1],r:t[2]/2,innerR:t[3]/2}):this.clipCircle=function(t,e,i,s,o){let a=m(),r=t.createElement("clipPath").attr({id:a}).add(t.defs),n=o?t.arc(e,i,s,o,0,2*Math.PI).add(r):t.circle(e,i,s).add(r);return n.id=a,n.clipPath=r,n}(s.renderer,t[0],t[1],t[2]/2,t[3]/2),this.group.clip(this.clipCircle),this.setClip=e.noop);})));}}function C(t){let e=this.chart,i=this.xAxis,s=this.yAxis,o=i.pane&&i.pane.center,a=t.chartX-(o&&o[0]||0)-e.plotLeft,r=t.chartY-(o&&o[1]||0)-e.plotTop,n=e.inverted?{clientX:t.chartX-s.pos,plotY:t.chartY-i.pos}:{clientX:180+-180/Math.PI*Math.atan2(a,r)};return this.searchKDTree(n)}function w(t,e,i,s){let o=s.tickInterval,a=s.tickPositions,r=p(a,t=>t>=i),n=p([...a].reverse(),t=>t<=e);return h(r)||(r=a[a.length-1]),h(n)||(n=a[0],r+=o,t[0][0]="L",t.unshift(t[t.length-3])),(t=t.slice(a.indexOf(n),a.indexOf(r)+1))[0][0]="M",t}function A(t,e){return p(this.pane||[],t=>t.options.id===e)||t.call(this,e)}function N(t,e,s,o,a,r){let n,l,h;let p=this.chart,d=u(o.inside,!!this.options.stacking);if(p.polar){if(n=e.rectPlotX/Math.PI*180,p.inverted)this.forceDL=p.isInsidePlot(e.plotX,e.plotY),d&&e.shapeArgs?(l=e.shapeArgs,a=c(a,{x:(h=this.yAxis.postTranslate(((l.start||0)+(l.end||0))/2-this.xAxis.startAngleRad,e.barX+e.pointWidth/2)).x-p.plotLeft,y:h.y-p.plotTop})):e.tooltipPos&&(a=c(a,{x:e.tooltipPos[0],y:e.tooltipPos[1]})),o.align=u(o.align,"center"),o.verticalAlign=u(o.verticalAlign,"middle");else {var g;let t,e;null===(g=o).align&&(t=n>20&&n<160?"left":n>200&&n<340?"right":"center",g.align=t),null===g.verticalAlign&&(e=n<45||n>315?"bottom":n>135&&n<225?"top":"middle",g.verticalAlign=e),o=g;}i.prototype.alignDataLabel.call(this,e,s,o,a,r),this.isRadialBar&&e.shapeArgs&&e.shapeArgs.start===e.shapeArgs.end?s.hide():s.show();}else t.call(this,e,s,o,a,r);}function T(){let t=this.options,e=t.stacking,i=this.chart,s=this.xAxis,o=this.yAxis,r=o.reversed,n=o.center,l=s.startAngleRad,p=s.endAngleRad-l,c=t.threshold,u=0,g,b,m,y,x,P=0,S=0,M,L,k,v,C,w,A,N;if(s.isRadial)for(m=(g=this.points).length,y=o.translate(o.min),x=o.translate(o.max),c=t.threshold||0,i.inverted&&d(c)&&h(u=o.translate(c))&&(u<0?u=0:u>p&&(u=p),this.translatedThreshold=u+l);m--;){if(w=(b=g[m]).barX,L=b.x,k=b.y,b.shapeType="arc",i.inverted){b.plotY=o.translate(k),e&&o.stacking?(C=o.stacking.stacks[(k<0?"-":"")+this.stackKey],this.visible&&C&&C[L]&&!b.isNull&&(v=C[L].points[this.getStackIndicator(void 0,L,this.index).key],P=o.translate(v[0]),S=o.translate(v[1]),h(P)&&(P=a.clamp(P,0,p)))):(P=u,S=b.plotY),P>S&&(S=[P,P=S][0]),r?S>y?S=y:P<x?P=x:(P>y||S<x)&&(P=S=p):P<y?P=y:S>x?S=x:(S<y||P>x)&&(P=S=0),o.min>o.max&&(P=S=r?p:0),P+=l,S+=l,n&&(b.barX=w+=n[3]/2),A=Math.max(w,0),N=Math.max(w+b.pointWidth,0);let i=t.borderRadius,s=f(("object"==typeof i?i.radius:i)||0,N-A);b.shapeArgs={x:n[0],y:n[1],r:N,innerR:A,start:P,end:S,borderRadius:s},b.opacity=P===S?0:void 0,b.plotY=(h(this.translatedThreshold)&&(P<this.translatedThreshold?P:S))-l;}else P=w+l,b.shapeArgs=this.polar.arc(b.yBottom,b.plotY,P,P+b.pointWidth),b.shapeArgs.borderRadius=0;this.polar.toXY(b),i.inverted?(M=o.postTranslate(b.rectPlotY,w+b.pointWidth/2),b.tooltipPos=[M.x-i.plotLeft,M.y-i.plotTop]):b.tooltipPos=[b.plotX,b.plotY],n&&(b.ttBelow=b.plotY>n[1]);}}function X(t,e){let i,s;let o=this;if(this.chart.polar){e=e||this.points;for(let t=0;t<e.length;t++)if(!e[t].isNull){i=t;break}!1!==this.options.connectEnds&&void 0!==i&&(this.connectEnds=!0,e.splice(e.length,0,e[i]),s=!0),e.forEach(t=>{void 0===t.polarPlotY&&o.polar.toXY(t);});}let a=t.apply(this,[].slice.call(arguments,1));return s&&e.pop(),a}function Y(t,e){let i=this.chart,s={xAxis:[],yAxis:[]};return i.polar?i.axes.forEach(t=>{if("colorAxis"===t.coll)return;let o=t.isXAxis,a=t.center,r=e.chartX-a[0]-i.plotLeft,n=e.chartY-a[1]-i.plotTop;s[o?"xAxis":"yAxis"].push({axis:t,value:t.translate(o?Math.PI-Math.atan2(r,n):Math.sqrt(Math.pow(r,2)+Math.pow(n,2)),!0)});}):s=t.call(this,e),s}function R(t,e){this.chart.polar||t.call(this,e);}function I(t,i){let s=this,o=this.chart,a=this.group,n=this.markerGroup,l=this.xAxis&&this.xAxis.center,h=o.plotLeft,p=o.plotTop,d=this.options.animation,c,g,f,b,m,y;o.polar?s.isRadialBar?i||(s.startAngleRad=u(s.translatedThreshold,s.xAxis.startAngleRad),e.seriesTypes.pie.prototype.animate.call(s,i)):(d=r(d),s.is("column")?i||(g=l[3]/2,s.points.forEach(t=>{f=t.graphic,m=(b=t.shapeArgs)&&b.r,y=b&&b.innerR,f&&b&&(f.attr({r:g,innerR:g}),f.animate({r:m,innerR:y},s.options.animation));})):i?(c={translateX:l[0]+h,translateY:l[1]+p,scaleX:.001,scaleY:.001},a.attr(c),n&&n.attr(c)):(c={translateX:h,translateY:p,scaleX:1,scaleY:1},a.animate(c,d),n&&n.animate(c,d))):t.call(this,i);}function j(t,e,i,s){let o,a;if(this.chart.polar){if(s){let t=(a=function t(e,i,s,o){let a,r,n,l,h,p;let d=o?1:0,c=(a=i>=0&&i<=e.length-1?i:i<0?e.length-1+i:0)-1<0?e.length-(1+d):a-1,u=a+1>e.length-1?d:a+1,g=e[c],f=e[u],b=g.plotX,m=g.plotY,y=f.plotX,x=f.plotY,P=e[a].plotX,S=e[a].plotY;r=(1.5*P+b)/2.5,n=(1.5*S+m)/2.5,l=(1.5*P+y)/2.5,h=(1.5*S+x)/2.5;let M=Math.sqrt(Math.pow(r-P,2)+Math.pow(n-S,2)),L=Math.sqrt(Math.pow(l-P,2)+Math.pow(h-S,2)),k=Math.atan2(n-S,r-P);p=Math.PI/2+(k+Math.atan2(h-S,l-P))/2,Math.abs(k-p)>Math.PI/2&&(p-=Math.PI),r=P+Math.cos(p)*M,n=S+Math.sin(p)*M;let v={rightContX:l=P+Math.cos(Math.PI+p)*L,rightContY:h=S+Math.sin(Math.PI+p)*L,leftContX:r,leftContY:n,plotX:P,plotY:S};return s&&(v.prevPointCont=t(e,c,!1,o)),v}(e,s,!0,this.connectEnds)).prevPointCont&&a.prevPointCont.rightContX,i=a.prevPointCont&&a.prevPointCont.rightContY;o=["C",d(t)?t:a.plotX,d(i)?i:a.plotY,d(a.leftContX)?a.leftContX:a.plotX,d(a.leftContY)?a.leftContY:a.plotY,a.plotX,a.plotY];}else o=["M",i.plotX,i.plotY];}else o=t.call(this,e,i,s);return o}function D(t,e,i=this.plotY){if(!this.destroyed){let{plotX:s,series:o}=this,{chart:a}=o;return a.polar&&d(s)&&d(i)?[s+(e?a.plotLeft:0),i+(e?a.plotTop:0)]:t.call(this,e,i)}}class E{static compose(t,e,i,a,r,h,p,d,c,u){if(s.compose(e,i),o.compose(t,r),g(n,"Polar")){let t=e.prototype,s=h.prototype,o=i.prototype,r=a.prototype;if(l(e,"afterDrawChartBox",x),l(e,"getAxes",S),l(e,"init",P),y(t,"get",A),y(o,"getCoordinates",Y),y(o,"pinch",R),l(i,"getSelectionMarkerAttrs",L),l(i,"getSelectionBox",M),l(a,"afterInit",k),l(a,"afterTranslate",v,{order:2}),l(a,"afterColumnTranslate",T,{order:4}),y(r,"animate",I),y(s,"pos",D),d){let t=d.prototype;y(t,"alignDataLabel",N),y(t,"animate",I);}if(c&&y(c.prototype,"getGraphPath",X),u){let t=u.prototype;y(t,"getPointSpline",j),p&&(p.prototype.getPointSpline=t.getPointSpline);}}}constructor(t){this.series=t;}arc(t,e,i,s){let o=this.series,a=o.xAxis.center,r=o.yAxis.len,n=a[3]/2,l=r-e+n,h=r-u(t,r)+n;return o.yAxis.reversed&&(l<0&&(l=n),h<0&&(h=n)),{x:a[0],y:a[1],r:l,innerR:h,start:i,end:s}}toXY(t){let e=this.series,i=e.chart,s=e.xAxis,o=e.yAxis,a=t.plotX,r=i.inverted,n=t.y,l=t.plotY,h=r?a:o.len-l,p;if(r&&e&&!e.isRadialBar&&(t.plotY=l=d(n)?o.translate(n):0),t.rectPlotX=a,t.rectPlotY=l,o.center&&(h+=o.center[3]/2),d(l)){let e=r?o.postTranslate(l,h):s.postTranslate(a,h);t.plotX=t.polarPlotX=e.x-i.plotLeft,t.plotY=t.polarPlotY=e.y-i.plotTop;}e.kdByAngle?((p=(a/Math.PI*180+s.pane.options.startAngle)%360)<0&&(p+=360),t.clientX=p):t.clientX=t.plotX;}}return E}),i(e,"Core/Axis/WaterfallAxis.js",[e["Core/Globals.js"],e["Core/Axis/Stacking/StackItem.js"],e["Core/Utilities.js"]],function(t,e,i){var s;let{composed:o}=t,{addEvent:a,objectEach:r,pushUnique:n}=i;return function(t){function i(){let t=this.waterfall.stacks;t&&(t.changed=!1,delete t.alreadyChanged);}function s(){let t=this.options.stackLabels;t&&t.enabled&&this.waterfall.stacks&&this.waterfall.renderStackTotals();}function l(){this.waterfall||(this.waterfall=new p(this));}function h(){let t=this.axes;for(let e of this.series)if(e.options.stacking){for(let e of t)e.isXAxis||(e.waterfall.stacks.changed=!0);break}}t.compose=function(t,e){n(o,"Axis.Waterfall")&&(a(t,"init",l),a(t,"afterBuildStacks",i),a(t,"afterRender",s),a(e,"beforeRedraw",h));};class p{constructor(t){this.axis=t,this.stacks={changed:!1};}renderStackTotals(){let t=this.axis,i=t.waterfall.stacks,s=t.stacking&&t.stacking.stackTotalGroup,o=new e(t,t.options.stackLabels||{},!1,0,void 0);this.dummyStackItem=o,s&&r(i,t=>{r(t,(t,i)=>{o.total=t.stackTotal,o.x=+i,t.label&&(o.label=t.label),e.prototype.render.call(o,s),t.label=o.label,delete o.label;});}),o.total=null;}}t.Composition=p;}(s||(s={})),s}),i(e,"Series/Waterfall/WaterfallPoint.js",[e["Series/Column/ColumnSeries.js"],e["Core/Series/Point.js"],e["Core/Utilities.js"]],function(t,e,i){let{isNumber:s}=i;class o extends t.prototype.pointClass{getClassName(){let t=e.prototype.getClassName.call(this);return this.isSum?t+=" highcharts-sum":this.isIntermediateSum&&(t+=" highcharts-intermediate-sum"),t}isValid(){return s(this.y)||this.isSum||!!this.isIntermediateSum}}return o}),i(e,"Series/Waterfall/WaterfallSeriesDefaults.js",[],function(){return {dataLabels:{inside:!0},lineWidth:1,lineColor:"#333333",dashStyle:"Dot",borderColor:"#333333",states:{hover:{lineWidthPlus:0}}}}),i(e,"Series/Waterfall/WaterfallSeries.js",[e["Core/Series/SeriesRegistry.js"],e["Core/Utilities.js"],e["Core/Axis/WaterfallAxis.js"],e["Series/Waterfall/WaterfallPoint.js"],e["Series/Waterfall/WaterfallSeriesDefaults.js"]],function(t,e,i,s,o){let{column:a,line:r}=t.seriesTypes,{addEvent:n,arrayMax:l,arrayMin:h,correctFloat:p,extend:d,isNumber:c,merge:u,objectEach:g,pick:f}=e;function b(t,e){return Object.hasOwnProperty.call(t,e)}class m extends a{generatePoints(){a.prototype.generatePoints.apply(this);for(let t=0,e=this.points.length;t<e;t++){let e=this.points[t],i=this.processedYData[t];c(i)&&(e.isIntermediateSum||e.isSum)&&(e.y=p(i));}}processData(t){let e,i,s,o,a,r;let n=this.options,l=this.yData,h=n.data,d=l.length,c=n.threshold||0;s=i=o=a=0;for(let t=0;t<d;t++)r=l[t],e=h&&h[t]?h[t]:{},"sum"===r||e.isSum?l[t]=p(s):"intermediateSum"===r||e.isIntermediateSum?(l[t]=p(i),i=0):(s+=r,i+=r),o=Math.min(s,o),a=Math.max(s,a);super.processData.call(this,t),n.stacking||(this.dataMin=o+c,this.dataMax=a);}toYData(t){return t.isSum?"sum":t.isIntermediateSum?"intermediateSum":t.y}updateParallelArrays(t,e){super.updateParallelArrays.call(this,t,e),("sum"===this.yData[0]||"intermediateSum"===this.yData[0])&&(this.yData[0]=null);}pointAttribs(t,e){let i=this.options.upColor;i&&!t.options.color&&c(t.y)&&(t.color=t.y>0?i:void 0);let s=a.prototype.pointAttribs.call(this,t,e);return delete s.dashstyle,s}getGraphPath(){return [["M",0,0]]}getCrispPath(){let t=this.data.filter(t=>c(t.y)),e=this.yAxis,i=t.length,s=Math.round(this.graph.strokeWidth())%2/2,o=Math.round(this.borderWidth)%2/2,a=this.xAxis.reversed,r=this.yAxis.reversed,n=this.options.stacking,l=[];for(let h=1;h<i;h++){if(!(this.options.connectNulls||c(this.data[t[h].index-1].y)))continue;let i=t[h].box,p=t[h-1],d=p.y||0,u=t[h-1].box;if(!i||!u)continue;let g=e.waterfall.stacks[this.stackKey],f=d>0?-u.height:0;if(g&&u&&i){let t;let d=g[h-1];if(n){let i=d.connectorThreshold;t=Math.round(e.translate(i,!1,!0,!1,!0)+(r?f:0))-s;}else t=u.y+p.minPointLengthOffset+o-s;l.push(["M",(u.x||0)+(a?0:u.width||0),t],["L",(i.x||0)+(a&&i.width||0),t]);}if(u&&l.length&&(!n&&d<0&&!r||d>0&&r)){let t=l[l.length-2];t&&"number"==typeof t[2]&&(t[2]+=u.height||0);let e=l[l.length-1];e&&"number"==typeof e[2]&&(e[2]+=u.height||0);}}return l}drawGraph(){r.prototype.drawGraph.call(this),this.graph&&this.graph.attr({d:this.getCrispPath()});}setStackedPoints(t){let e=this.options,i=t.waterfall?.stacks,s=e.threshold||0,o=this.stackKey,a=this.xData,r=a.length,n=s,l=n,h,p=0,d=0,c=0,u,g,f,b,m,y,x,P,S=(t,e,i,s)=>{if(h){if(u)for(;i<u;i++)h.stackState[i]+=s;else h.stackState[0]=t,u=h.stackState.length;h.stackState.push(h.stackState[u-1]+e);}};if(t.stacking&&i&&this.reserveSpace()){P=i.changed,(x=i.alreadyChanged)&&0>x.indexOf(o)&&(P=!0),i[o]||(i[o]={});let t=i[o];if(t)for(let i=0;i<r;i++)(!t[y=a[i]]||P)&&(t[y]={negTotal:0,posTotal:0,stackTotal:0,threshold:0,stateIndex:0,stackState:[],label:P&&t[y]?t[y].label:void 0}),h=t[y],(m=this.yData[i])>=0?h.posTotal+=m:h.negTotal+=m,b=e.data[i],g=h.absolutePos=h.posTotal,f=h.absoluteNeg=h.negTotal,h.stackTotal=g+f,u=h.stackState.length,b&&b.isIntermediateSum?(S(c,d,0,c),c=d,d=s,n^=l,l^=n,n^=l):b&&b.isSum?(S(s,p,u,0),n=s):(S(n,m,0,p),b&&(p+=m,d+=m)),h.stateIndex++,h.threshold=n,n+=h.stackTotal;i.changed=!1,i.alreadyChanged||(i.alreadyChanged=[]),i.alreadyChanged.push(o);}}getExtremes(){let t,e,i;let s=this.options.stacking;return s?(t=this.yAxis.waterfall.stacks,e=this.stackedYNeg=[],i=this.stackedYPos=[],"overlap"===s?g(t[this.stackKey],function(t){e.push(h(t.stackState)),i.push(l(t.stackState));}):g(t[this.stackKey],function(t){e.push(t.negTotal+t.threshold),i.push(t.posTotal+t.threshold);}),{dataMin:h(e),dataMax:l(i)}):{dataMin:this.dataMin,dataMax:this.dataMax}}}return m.defaultOptions=u(a.defaultOptions,o),m.compose=i.compose,d(m.prototype,{pointValKey:"y",showLine:!0,pointClass:s}),n(m,"afterColumnTranslate",function(){let{options:t,points:e,yAxis:i}=this,s=f(t.minPointLength,5),o=s/2,a=t.threshold||0,r=t.stacking,n=i.waterfall.stacks[this.stackKey],l=a,h=a,p,g,m,y;for(let t=0;t<e.length;t++){let f=e[t],x=this.processedYData[t],P=d({x:0,y:0,width:0,height:0},f.shapeArgs||{});f.box=P;let S=[0,x],M=f.y||0;if(r){if(n){let e=n[t];"overlap"===r?(g=e.stackState[e.stateIndex--],p=M>=0?g:g-M,b(e,"absolutePos")&&delete e.absolutePos,b(e,"absoluteNeg")&&delete e.absoluteNeg):(M>=0?(g=e.threshold+e.posTotal,e.posTotal-=M,p=g):(g=e.threshold+e.negTotal,e.negTotal-=M,p=g-M),!e.posTotal&&c(e.absolutePos)&&b(e,"absolutePos")&&(e.posTotal=e.absolutePos,delete e.absolutePos),!e.negTotal&&c(e.absoluteNeg)&&b(e,"absoluteNeg")&&(e.negTotal=e.absoluteNeg,delete e.absoluteNeg)),f.isSum||(e.connectorThreshold=e.threshold+e.stackTotal),i.reversed?(m=M>=0?p-M:p+M,y=p):(m=p,y=p-M),f.below=m<=a,P.y=i.translate(m,!1,!0,!1,!0),P.height=Math.abs(P.y-i.translate(y,!1,!0,!1,!0));let s=i.waterfall.dummyStackItem;s&&(s.x=t,s.label=n[t].label,s.setOffset(this.pointXOffset||0,this.barW||0,this.stackedYNeg[t],this.stackedYPos[t],void 0,this.xAxis));}}else p=Math.max(h,h+M)+S[0],P.y=i.translate(p,!1,!0,!1,!0),f.isSum?(P.y=i.translate(S[1],!1,!0,!1,!0),P.height=Math.min(i.translate(S[0],!1,!0,!1,!0),i.len)-P.y,f.below=S[1]<=a):f.isIntermediateSum?(M>=0?(m=S[1]+l,y=l):(m=l,y=S[1]+l),i.reversed&&(m^=y,y^=m,m^=y),P.y=i.translate(m,!1,!0,!1,!0),P.height=Math.abs(P.y-Math.min(i.translate(y,!1,!0,!1,!0),i.len)),l+=S[1],f.below=m<=a):(P.height=x>0?i.translate(h,!1,!0,!1,!0)-P.y:i.translate(h,!1,!0,!1,!0)-i.translate(h-x,!1,!0,!1,!0),h+=x,f.below=h<a),P.height<0&&(P.y+=P.height,P.height*=-1);f.plotY=P.y=Math.round(P.y||0)-this.borderWidth%2/2,P.height=Math.max(Math.round(P.height||0),.001),f.yBottom=P.y+P.height,P.height<=s&&!f.isNull?(P.height=s,P.y-=o,f.plotY=P.y,M<0?f.minPointLengthOffset=-o:f.minPointLengthOffset=o):(f.isNull&&(P.width=0),f.minPointLengthOffset=0);let L=f.plotY+(f.negative?P.height:0);f.below&&(f.plotY+=P.height),f.tooltipPos&&(this.chart.inverted?f.tooltipPos[0]=i.len-L:f.tooltipPos[1]=L),f.isInside=this.isPointInside(f),u(!0,f.shapeArgs,P);}},{order:2}),t.registerSeriesType("waterfall",m),m}),i(e,"masters/highcharts-more.src.js",[e["Core/Globals.js"],e["Core/Series/SeriesRegistry.js"],e["Extensions/Pane/Pane.js"],e["Series/Bubble/BubbleSeries.js"],e["Series/PackedBubble/PackedBubbleSeries.js"],e["Series/PolarComposition.js"],e["Series/Waterfall/WaterfallSeries.js"]],function(t,e,i,s,o,a,r){return s.compose(t.Axis,t.Chart,t.Legend,t.Series),o.compose(t.Axis,t.Chart,t.Legend,t.Series),i.compose(t.Chart,t.Pointer),a.compose(t.Axis,t.Chart,t.Pointer,t.Series,t.Tick,t.Point,e.seriesTypes.areasplinerange,e.seriesTypes.column,e.seriesTypes.line,e.seriesTypes.spline),r.compose(t.Axis,t.Chart),t});}); 
	} (highchartsMore));

	var highchartsMoreExports = highchartsMore.exports;
	var more = /*@__PURE__*/getDefaultExportFromCjs(highchartsMoreExports);

	var data$1 = {exports: {}};

	data$1.exports;

	(function (module) {
		!/**
		 * Highcharts JS v11.4.1 (2024-04-04)
		 *
		 * Data module
		 *
		 * (c) 2012-2024 Torstein Honsi
		 *
		 * License: www.highcharts.com/license
		 */function(e){module.exports?(e.default=e,module.exports=e):e("undefined"!=typeof Highcharts?Highcharts:void 0);}(function(e){var t=e?e._modules:{};function s(e,t,s,r){e.hasOwnProperty(t)||(e[t]=r.apply(null,s),"function"==typeof CustomEvent&&window.dispatchEvent(new CustomEvent("HighchartsModuleLoaded",{detail:{path:t,module:e[t]}})));}s(t,"Core/HttpUtilities.js",[t["Core/Globals.js"],t["Core/Utilities.js"]],function(e,t){let{win:s}=e,{discardElement:r,objectEach:i}=t,a={ajax:function(e){let t={json:"application/json",xml:"application/xml",text:"text/plain",octet:"application/octet-stream"},s=new XMLHttpRequest;function r(t,s){e.error&&e.error(t,s);}if(!e.url)return !1;s.open((e.type||"get").toUpperCase(),e.url,!0),e.headers&&e.headers["Content-Type"]||s.setRequestHeader("Content-Type",t[e.dataType||"json"]||t.text),i(e.headers,function(e,t){s.setRequestHeader(t,e);}),e.responseType&&(s.responseType=e.responseType),s.onreadystatechange=function(){let t;if(4===s.readyState){if(200===s.status){if("blob"!==e.responseType&&(t=s.responseText,"json"===e.dataType))try{t=JSON.parse(t);}catch(e){if(e instanceof Error)return r(s,e)}return e.success&&e.success(t,s)}r(s,s.responseText);}},e.data&&"string"!=typeof e.data&&(e.data=JSON.stringify(e.data)),s.send(e.data);},getJSON:function(e,t){a.ajax({url:e,success:t,dataType:"json",headers:{"Content-Type":"text/plain"}});},post:function(e,t,a){let n=new s.FormData;i(t,function(e,t){n.append(t,e);}),n.append("b64","true");let{filename:o,type:l}=t;return s.fetch(e,{method:"POST",body:n,...a}).then(e=>{e.ok&&e.text().then(e=>{let t=document.createElement("a");t.href=`data:${l};base64,${e}`,t.download=o,t.click(),r(t);});})}};return a}),s(t,"Extensions/Data.js",[t["Core/Chart/Chart.js"],t["Core/Defaults.js"],t["Core/Globals.js"],t["Core/HttpUtilities.js"],t["Core/Series/Point.js"],t["Core/Series/SeriesRegistry.js"],t["Core/Utilities.js"]],function(e,t,s,r,i,a,n){let{getOptions:o}=t,{doc:l}=s,{ajax:u}=r,{seriesTypes:h}=a,{addEvent:d,defined:m,extend:c,fireEvent:p,isNumber:f,merge:g,objectEach:C,pick:x,splat:y}=n;function T(e){return !!(e&&(e.rowsURL||e.csvURL||e.columnsURL))}class v{static data(e,t={},s){return new v(e,t,s)}static rowsToColumns(e){let t,s,r,i,a;if(e)for(t=0,a=[],s=e.length;t<s;t++)for(r=0,i=e[t].length;r<i;r++)a[r]||(a[r]=[]),a[r][t]=e[t][r];return a}constructor(e,t={},s){this.rowsToColumns=v.rowsToColumns,this.dateFormats={"YYYY/mm/dd":{regex:/^([0-9]{4})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{1,2})$/,parser:function(e){return e?Date.UTC(+e[1],e[2]-1,+e[3]):NaN}},"dd/mm/YYYY":{regex:/^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{4})$/,parser:function(e){return e?Date.UTC(+e[3],e[2]-1,+e[1]):NaN},alternative:"mm/dd/YYYY"},"mm/dd/YYYY":{regex:/^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{4})$/,parser:function(e){return e?Date.UTC(+e[3],e[1]-1,+e[2]):NaN}},"dd/mm/YY":{regex:/^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{2})$/,parser:function(e){if(!e)return NaN;let t=new Date,s=+e[3];return s>t.getFullYear()-2e3?s+=1900:s+=2e3,Date.UTC(s,e[2]-1,+e[1])},alternative:"mm/dd/YY"},"mm/dd/YY":{regex:/^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{2})$/,parser:function(e){return e?Date.UTC(+e[3]+2e3,e[1]-1,+e[2]):NaN}}},this.chart=s,this.chartOptions=t,this.options=e,this.rawColumns=[],this.init(e,t,s);}init(e,t,s){let r=e.decimalPoint,i;t&&(this.chartOptions=t),s&&(this.chart=s),"."!==r&&","!==r&&(r=void 0),this.options=e,this.columns=e.columns||this.rowsToColumns(e.rows)||[],this.firstRowAsNames=x(e.firstRowAsNames,this.firstRowAsNames,!0),this.decimalRegex=r&&RegExp("^(-?[0-9]+)"+r+"([0-9]+)$"),void 0!==this.liveDataTimeout&&clearTimeout(this.liveDataTimeout),this.rawColumns=[],this.columns.length&&(this.dataFound(),i=!T(e)),i||(i=this.fetchLiveData()),i||(i=!!this.parseCSV().length),i||(i=!!this.parseTable().length),i||(i=this.parseGoogleSpreadsheet()),!i&&e.afterComplete&&e.afterComplete();}getColumnDistribution(){let e=this.chartOptions,t=this.options,s=[],r=function(e){return (h[e||"line"].prototype.pointArrayMap||[0]).length},i=function(e){return h[e||"line"].prototype.pointArrayMap},a=e&&e.chart&&e.chart.type,n=[],o=[],l=t&&t.seriesMapping||e&&e.series&&e.series.map(function(){return {x:0}})||[],u=0,d;(e&&e.series||[]).forEach(e=>{n.push(r(e.type||a));}),l.forEach(e=>{s.push(e.x||0);}),0===s.length&&s.push(0),l.forEach(t=>{let s=new R,l=n[u]||r(a),h=(e&&e.series||[])[u]||{},c=i(h.type||a),p=c||["y"];for((m(t.x)||h.isCartesian||!c)&&s.addColumnReader(t.x,"x"),C(t,function(e,t){"x"!==t&&s.addColumnReader(e,t);}),d=0;d<l;d++)s.hasReader(p[d])||s.addColumnReader(void 0,p[d]);o.push(s),u++;});let c=i(a);void 0===c&&(c=["y"]),this.valueCount={global:r(a),xColumns:s,individual:n,seriesBuilders:o,globalPointArrayMap:c};}dataFound(){this.options.switchRowsAndColumns&&(this.columns=this.rowsToColumns(this.columns)),this.getColumnDistribution(),this.parseTypes(),!1!==this.parsed()&&this.complete();}parseCSV(e){let t=this,s=this.columns=[],r=e||this.options,i=void 0!==r.startColumn&&r.startColumn?r.startColumn:0,a=r.endColumn||Number.MAX_VALUE,n=[],o={",":0,";":0,"	":0},l=r.csv,u=void 0!==r.startRow&&r.startRow?r.startRow:0,h=r.endRow||Number.MAX_VALUE,d,m,c=0;if(l&&r.beforeParse&&(l=r.beforeParse.call(this,l)),l){if(m=l.replace(/\r\n/g,"\n").replace(/\r/g,"\n").split(r.lineDelimiter||"\n"),(!u||u<0)&&(u=0),(!h||h>=m.length)&&(h=m.length-1),r.itemDelimiter)d=r.itemDelimiter;else {let e,s,i;d=null,e=0,s=0,i=!1,m.some(function(t,r){let i=!1,a,n,l,u="";if(r>13)return !0;for(let r=0;r<t.length;r++){if(a=t[r],n=t[r+1],l=t[r-1],"#"===a)return;if('"'===a){if(i){if('"'!==l&&'"'!==n){for(;" "===n&&r<t.length;)n=t[++r];void 0!==o[n]&&o[n]++,i=!1;}}else i=!0;}else void 0!==o[a]?(isNaN(Date.parse(u=u.trim()))?(isNaN(u)||!isFinite(u))&&o[a]++:o[a]++,u=""):u+=a;","===a&&s++,"."===a&&e++;}}),o[";"]>o[","]?i=";":(o[","],o[";"],i=","),r.decimalPoint||(e>s?r.decimalPoint=".":r.decimalPoint=",",t.decimalRegex=RegExp("^(-?[0-9]+)"+r.decimalPoint+"([0-9]+)$")),d=i;}let e=0;for(c=u;c<=h;c++)"#"===m[c][0]?e++:function(e,t,o,l){let u=0,h="",m="",c="",p="",f=0,g=0;function C(t){h=e[t],m=e[t-1],c=e[t+1];}function x(e){n.length<g+1&&n.push([e]),n[g][n[g].length-1]!==e&&n[g].push(e);}function y(){if(i>f||f>a){++f,p="";return}r.columnTypes||(!isNaN(parseFloat(p))&&isFinite(p)?(p=parseFloat(p),x("number")):isNaN(Date.parse(p))?x("string"):(p=p.replace(/\//g,"-"),x("date"))),s.length<g+1&&s.push([]),s[g][t]=p,p="",++g,++f;}if(e.trim().length&&"#"!==e.trim()[0]){for(;u<e.length;u++)if(C(u),'"'===h)for(C(++u);u<e.length&&('"'!==h||'"'===m||'"'===c);)('"'!==h||'"'===h&&'"'!==m)&&(p+=h),C(++u);else h===d?y():p+=h;y();}}(m[c],c-u-e);(!r.columnTypes||0===r.columnTypes.length)&&n.length&&n[0].length&&"date"===n[0][1]&&!r.dateFormat&&(r.dateFormat=function(e,s){let i="YYYY/mm/dd",a=[],n=[],o,l=[],u,h=0,d=!1,m;for((!s||s>e.length)&&(s=e.length);h<s;h++)if(void 0!==e[h]&&e[h]&&e[h].length)for(m=0,o=e[h].trim().replace(/\//g," ").replace(/\-/g," ").replace(/\./g," ").split(" "),l=["","",""];m<o.length;m++)m<l.length&&(o[m]=parseInt(o[m],10),o[m]&&(n[m]=!n[m]||n[m]<o[m]?o[m]:n[m],void 0!==a[m]?a[m]!==o[m]&&(a[m]=!1):a[m]=o[m],o[m]>31?o[m]<100?l[m]="YY":l[m]="YYYY":o[m]>12&&o[m]<=31?(l[m]="dd",d=!0):l[m].length||(l[m]="mm")));if(d){for(m=0;m<a.length;m++)!1!==a[m]?n[m]>12&&"YY"!==l[m]&&"YYYY"!==l[m]&&(l[m]="YY"):n[m]>12&&"mm"===l[m]&&(l[m]="dd");return (3===l.length&&"dd"===l[1]&&"dd"===l[2]&&(l[2]="YY"),u=l.join("/"),(r.dateFormats||t.dateFormats)[u])?u:(p("deduceDateFailed"),i)}return i}(s[0])),this.dataFound();}return s}parseTable(){let e=this.options,t=this.columns||[],s=e.startRow||0,r=e.endRow||Number.MAX_VALUE,i=e.startColumn||0,a=e.endColumn||Number.MAX_VALUE;if(e.table){let n=e.table;"string"==typeof n&&(n=l.getElementById(n)),[].forEach.call(n.getElementsByTagName("tr"),(e,n)=>{n>=s&&n<=r&&[].forEach.call(e.children,(e,r)=>{let o=t[r-i],l=1;if(("TD"===e.tagName||"TH"===e.tagName)&&r>=i&&r<=a)for(t[r-i]||(t[r-i]=[]),t[r-i][n-s]=e.innerHTML;n-s>=l&&void 0===o[n-s-l];)o[n-s-l]=null,l++;});}),this.dataFound();}return t}fetchLiveData(){let e=this,t=this.chart,s=this.options,r=s.enablePolling,i=g(s),a=0,n=1e3*(s.dataRefreshRate||2);return !!T(s)&&(n<1e3&&(n=1e3),delete s.csvURL,delete s.rowsURL,delete s.columnsURL,function o(l){function h(i,h,d){if(!i||!/^(http|\/|\.\/|\.\.\/)/.test(i))return i&&s.error&&s.error("Invalid URL"),!1;function m(){r&&t.liveDataURL===i&&(e.liveDataTimeout=setTimeout(o,n));}return l&&(clearTimeout(e.liveDataTimeout),t.liveDataURL=i),u({url:i,dataType:d||"json",success:function(e){t&&t.series&&h(e),m();},error:function(e,t){return ++a<3&&m(),s.error&&s.error(t,e)}}),!0}h(i.csvURL,function(e){t.update({data:{csv:e}});},"text")||h(i.rowsURL,function(e){t.update({data:{rows:e}});})||h(i.columnsURL,function(e){t.update({data:{columns:e}});});}(!0),T(s))}parseGoogleSpreadsheet(){let e=this,t=this.options,s=t.googleSpreadsheetKey,r=this.chart,i=Math.max(1e3*(t.dataRefreshRate||2),4e3),a=()=>{if(t.googleSpreadsheetRange)return t.googleSpreadsheetRange;let e="ABCDEFGHIJKLMNOPQRSTUVWXYZ",s=(e.charAt(t.startColumn||0)||"A")+((t.startRow||0)+1),r=e.charAt(x(t.endColumn,-1))||"ZZ";return m(t.endRow)&&(r+=t.endRow+1),`${s}:${r}`};return s&&(delete t.googleSpreadsheetKey,function r(n){u({url:["https://sheets.googleapis.com/v4/spreadsheets",s,"values",a(),"?alt=json&majorDimension=COLUMNS&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING&key="+t.googleAPIKey].join("/"),dataType:"json",success:function(s){n(s),t.enablePolling&&(e.liveDataTimeout=setTimeout(function(){r(n);},i));},error:function(e,s){return t.error&&t.error(s,e)}});}(function(t){let s=t.values;if(!s||0===s.length)return !1;let i=s.reduce((e,t)=>Math.max(e,t.length),0);s.forEach(e=>{for(let t=0;t<i;t++)void 0===e[t]&&(e[t]=null);}),r&&r.series?r.update({data:{columns:s}}):(e.columns=s,e.dataFound());})),!1}trim(e,t){return "string"==typeof e&&(e=e.replace(/^\s+|\s+$/g,""),t&&/^-?[0-9\s]+$/.test(e)&&(e=e.replace(/\s/g,"")),this.decimalRegex&&(e=e.replace(this.decimalRegex,"$1.$2"))),e}parseTypes(){let e=this.columns||[],t=e.length;for(;t--;)this.parseColumn(e[t],t);}parseColumn(e,t){let s=this.rawColumns,r=this.columns,i=this.firstRowAsNames,a=-1!==this.valueCount.xColumns.indexOf(t),n=[],o=this.chartOptions,l=(this.options.columnTypes||[])[t],u=a&&o&&o.xAxis&&"category"===y(o.xAxis)[0].type||"string"===l,h=m(e.name),d=e.length,c,p,g,C,x,T,v;for(s[t]||(s[t]=[]);d--;)c=n[d]||e[d],g=this.trim(c),p=parseFloat(C=this.trim(c,!0)),void 0===s[t][d]&&(s[t][d]=g),u||0===d&&i&&!h?e[d]=""+g:+C===p?(e[d]=p,p>31536e6&&"float"!==l?e.isDatetime=!0:e.isNumeric=!0,void 0!==e[d+1]&&(v=p>e[d+1])):(g&&g.length&&(x=this.parseDate(c)),a&&f(x)&&"float"!==l?(n[d]=c,e[d]=x,e.isDatetime=!0,void 0!==e[d+1]&&((T=x>e[d+1])!==v&&void 0!==v&&(this.alternativeFormat?(this.dateFormat=this.alternativeFormat,d=e.length,this.alternativeFormat=this.dateFormats[this.dateFormat].alternative):e.unsorted=!0),v=T)):(e[d]=""===g?null:g,0!==d&&(e.isDatetime||e.isNumeric)&&(e.mixed=!0)));if(a&&e.mixed&&(r[t]=s[t]),a&&v&&this.options.sort)for(t=0;t<r.length;t++)r[t].reverse(),i&&r[t].unshift(r[t].pop());}parseDate(e){let t=this.options.parseDate,s,r,i,a=this.options.dateFormat||this.dateFormat,n;if(t)s=t(e);else if("string"==typeof e){if(a)(i=this.dateFormats[a])||(i=this.dateFormats["YYYY/mm/dd"]),(n=e.match(i.regex))&&(s=i.parser(n));else for(r in this.dateFormats)if(i=this.dateFormats[r],n=e.match(i.regex)){this.dateFormat=a=r,this.alternativeFormat=i.alternative,s=i.parser(n);break}!n&&(e.match(/:.+(GMT|UTC|[Z+-])/)&&(e=e.replace(/\s*(?:GMT|UTC)?([+-])(\d\d)(\d\d)$/,"$1$2:$3").replace(/(?:\s+|GMT|UTC)([+-])/,"$1").replace(/(\d)\s*(?:GMT|UTC|Z)$/,"$1+00:00")),"object"==typeof(n=Date.parse(e))&&null!==n&&n.getTime?s=n.getTime()-6e4*n.getTimezoneOffset():f(n)&&(s=n-6e4*new Date(n).getTimezoneOffset()));}return s}getData(){if(this.columns)return this.rowsToColumns(this.columns).slice(1)}parsed(){if(this.options.parsed)return this.options.parsed.call(this,this.columns)}complete(){let e,t,s,r,i,a,n,o,l,u,h,d;let c=this.columns,p=this.options,f=[];if(c.length,p.complete||p.afterComplete){if(this.firstRowAsNames)for(r=0;r<c.length;r++){let e=c[r];m(e.name)||(e.name=x(e.shift(),"").toString());}for(n=0,t=[],u=function(e,t){let s,r,i;let a=[],n=[];for(r=0;r<e;r+=1)a.push(!0);for(s=0;s<t.length;s+=1)for(r=0,i=t[s].getReferencedColumnIndexes();r<i.length;r+=1)a[i[r]]=!1;for(r=0;r<a.length;r+=1)a[r]&&n.push(r);return n}(c.length,this.valueCount.seriesBuilders);n<this.valueCount.seriesBuilders.length;n++)(l=this.valueCount.seriesBuilders[n]).populateColumns(u)&&f.push(l);for(;u.length>0;){for((l=new R).addColumnReader(0,"x"),-1!==(d=u.indexOf(0))&&u.splice(d,1),r=0;r<this.valueCount.global;r++)l.addColumnReader(void 0,this.valueCount.globalPointArrayMap[r]);l.populateColumns(u)&&f.push(l);}if(f.length>0&&f[0].readers.length>0&&void 0!==(h=c[f[0].readers[0].columnIndex])&&(h.isDatetime?e="datetime":h.isNumeric||(e="category")),"category"===e)for(n=0;n<f.length;n++)for(a=0,l=f[n];a<l.readers.length;a++)"x"===l.readers[a].configName&&(l.readers[a].configName="name");for(n=0;n<f.length;n++){for(i=0,l=f[n],s=[];i<c[0].length;i++)s[i]=l.read(c,i);t[n]={data:s},l.name&&(t[n].name=l.name),"category"===e&&(t[n].turboThreshold=0);}o={series:t},e&&(o.xAxis={type:e},"category"===e&&(o.xAxis.uniqueNames=!1)),p.complete&&p.complete(o),p.afterComplete&&p.afterComplete(o);}}update(e,t){let s=this.chart,r=s.options;e&&(e.afterComplete=function(e){e&&(e.xAxis&&s.xAxis[0]&&e.xAxis.type===s.xAxis[0].options.type&&delete e.xAxis,s.update(e,t,!0));},g(!0,r.data,e),r.data&&r.data.googleSpreadsheetKey&&!e.columns&&delete r.data.columns,this.init(r.data));}}d(e,"init",function(e){let t=this,s=e.args[1],r=o().data,i=e.args[0]||{};if((r||i&&i.data)&&!t.hasDataDef){t.hasDataDef=!0;let a=g(r,i.data);t.data=new v(c(a,{afterComplete:function(e){let r,a;if(Object.hasOwnProperty.call(i,"series")){if("object"==typeof i.series)for(r=Math.max(i.series.length,e&&e.series?e.series.length:0);r--;)a=i.series[r]||{},i.series[r]=g(a,e&&e.series?e.series[r]:{});else delete i.series;}i=g(e,i),t.init(i,s);}}),i,t),e.preventDefault();}});class R{constructor(){this.readers=[],this.pointIsArray=!0;}populateColumns(e){let t=!0;return this.readers.forEach(t=>{void 0===t.columnIndex&&(t.columnIndex=e.shift());}),this.readers.forEach(e=>{void 0===e.columnIndex&&(t=!1);}),t}read(e,t){let s=this.pointIsArray,r=s?[]:{};if(this.readers.forEach(a=>{let n=e[a.columnIndex][t];s?r.push(n):a.configName.indexOf(".")>0?i.prototype.setNestedProperty(r,n,a.configName):r[a.configName]=n;}),void 0===this.name&&this.readers.length>=2){let t=[];this.readers.forEach(function(e){("x"===e.configName||"name"===e.configName||"y"===e.configName)&&void 0!==e.columnIndex&&t.push(e.columnIndex);}),t.length>=2&&(t.shift(),t.sort(function(e,t){return e-t})),this.name=e[x(t.shift(),0)].name;}return r}addColumnReader(e,t){this.readers.push({columnIndex:e,configName:t}),"x"===t||"y"===t||void 0===t||(this.pointIsArray=!1);}getReferencedColumnIndexes(){let e,t;let s=[];for(e=0;e<this.readers.length;e+=1)void 0!==(t=this.readers[e]).columnIndex&&s.push(t.columnIndex);return s}hasReader(e){let t;for(t=0;t<this.readers.length;t+=1)if(this.readers[t].configName===e)return !0}}return v}),s(t,"masters/modules/data.src.js",[t["Core/Globals.js"],t["Core/HttpUtilities.js"],t["Extensions/Data.js"]],function(e,t,s){return e.Data=e.Data||s,e.HttpUtilities=e.HttpUtilities||t,e.ajax=e.HttpUtilities.ajax,e.data=e.Data.data,e.getJSON=e.HttpUtilities.getJSON,e.post=e.HttpUtilities.post,e});}); 
	} (data$1));

	var dataExports = data$1.exports;
	var data = /*@__PURE__*/getDefaultExportFromCjs(dataExports);

	var highcharts = {exports: {}};

	highcharts.exports;

	(function (module) {
		!/**
		 * Highcharts JS v11.4.1 (2024-04-04)
		 *
		 * (c) 2009-2024 Torstein Honsi
		 *
		 * License: www.highcharts.com/license
		 */function(t,e){module.exports?(e.default=e,module.exports=t&&t.document?e(t):e):(t.Highcharts&&t.Highcharts.error(16,!0),t.Highcharts=e(t));}("undefined"!=typeof window?window:commonjsGlobal,function(t){var e={};function i(e,i,s,r){e.hasOwnProperty(i)||(e[i]=r.apply(null,s),"function"==typeof CustomEvent&&t.dispatchEvent(new CustomEvent("HighchartsModuleLoaded",{detail:{path:i,module:e[i]}})));}return i(e,"Core/Globals.js",[],function(){var e,i;return (i=e||(e={})).SVG_NS="http://www.w3.org/2000/svg",i.product="Highcharts",i.version="11.4.1",i.win=void 0!==t?t:{},i.doc=i.win.document,i.svg=i.doc&&i.doc.createElementNS&&!!i.doc.createElementNS(i.SVG_NS,"svg").createSVGRect,i.userAgent=i.win.navigator&&i.win.navigator.userAgent||"",i.isChrome=-1!==i.userAgent.indexOf("Chrome"),i.isFirefox=-1!==i.userAgent.indexOf("Firefox"),i.isMS=/(edge|msie|trident)/i.test(i.userAgent)&&!i.win.opera,i.isSafari=!i.isChrome&&-1!==i.userAgent.indexOf("Safari"),i.isTouchDevice=/(Mobile|Android|Windows Phone)/.test(i.userAgent),i.isWebKit=-1!==i.userAgent.indexOf("AppleWebKit"),i.deg2rad=2*Math.PI/360,i.hasBidiBug=i.isFirefox&&4>parseInt(i.userAgent.split("Firefox/")[1],10),i.marginNames=["plotTop","marginRight","marginBottom","plotLeft"],i.noop=function(){},i.supportsPassiveEvents=function(){let t=!1;if(!i.isMS){let e=Object.defineProperty({},"passive",{get:function(){t=!0;}});i.win.addEventListener&&i.win.removeEventListener&&(i.win.addEventListener("testPassive",i.noop,e),i.win.removeEventListener("testPassive",i.noop,e));}return t}(),i.charts=[],i.composed=[],i.dateFormats={},i.seriesTypes={},i.symbolSizes={},i.chartCount=0,e}),i(e,"Core/Utilities.js",[e["Core/Globals.js"]],function(t){let e;let{charts:i,doc:s,win:r}=t;function o(e,i,s,a){let n=i?"Highcharts error":"Highcharts warning";32===e&&(e=`${n}: Deprecated member`);let h=p(e),l=h?`${n} #${e}: www.highcharts.com/errors/${e}/`:e.toString();if(void 0!==a){let t="";h&&(l+="?"),k(a,function(e,i){t+=`
 - ${i}: ${e}`,h&&(l+=encodeURI(i)+"="+encodeURI(e));}),l+=t;}M(t,"displayError",{chart:s,code:e,message:l,params:a},function(){if(i)throw Error(l);r.console&&-1===o.messages.indexOf(l)&&console.warn(l);}),o.messages.push(l);}function a(t,e){return parseInt(t,e||10)}function n(t){return "string"==typeof t}function h(t){let e=Object.prototype.toString.call(t);return "[object Array]"===e||"[object Array Iterator]"===e}function l(t,e){return !!t&&"object"==typeof t&&(!e||!h(t))}function d(t){return l(t)&&"number"==typeof t.nodeType}function c(t){let e=t&&t.constructor;return !!(l(t,!0)&&!d(t)&&e&&e.name&&"Object"!==e.name)}function p(t){return "number"==typeof t&&!isNaN(t)&&t<1/0&&t>-1/0}function u(t){return null!=t}function g(t,e,i){let s;let r=n(e)&&!u(i),o=(e,i)=>{u(e)?t.setAttribute(i,e):r?(s=t.getAttribute(i))||"class"!==i||(s=t.getAttribute(i+"Name")):t.removeAttribute(i);};return n(e)?o(i,e):k(e,o),s}function f(t){return h(t)?t:[t]}function m(t,e){let i;for(i in t||(t={}),e)t[i]=e[i];return t}function x(){let t=arguments,e=t.length;for(let i=0;i<e;i++){let e=t[i];if(null!=e)return e}}function y(t,e){m(t.style,e);}function b(t){return Math.pow(10,Math.floor(Math.log(t)/Math.LN10))}function v(t,e){return t>1e14?t:parseFloat(t.toPrecision(e||14))}(o||(o={})).messages=[],Math.easeInOutSine=function(t){return -.5*(Math.cos(Math.PI*t)-1)};let S=Array.prototype.find?function(t,e){return t.find(e)}:function(t,e){let i;let s=t.length;for(i=0;i<s;i++)if(e(t[i],i))return t[i]};function k(t,e,i){for(let s in t)Object.hasOwnProperty.call(t,s)&&e.call(i||t[s],t[s],s,t);}function C(t,e,i){function s(e,i){let s=t.removeEventListener;s&&s.call(t,e,i,!1);}function r(i){let r,o;t.nodeName&&(e?(r={})[e]=!0:r=i,k(r,function(t,e){if(i[e])for(o=i[e].length;o--;)s(e,i[e][o].fn);}));}let o="function"==typeof t&&t.prototype||t;if(Object.hasOwnProperty.call(o,"hcEvents")){let t=o.hcEvents;if(e){let o=t[e]||[];i?(t[e]=o.filter(function(t){return i!==t.fn}),s(e,i)):(r(t),t[e]=[]);}else r(t),delete o.hcEvents;}}function M(e,i,r,o){if(r=r||{},s.createEvent&&(e.dispatchEvent||e.fireEvent&&e!==t)){let t=s.createEvent("Events");t.initEvent(i,!0,!0),r=m(t,r),e.dispatchEvent?e.dispatchEvent(r):e.fireEvent(i,r);}else if(e.hcEvents){r.target||m(r,{preventDefault:function(){r.defaultPrevented=!0;},target:e,type:i});let t=[],s=e,o=!1;for(;s.hcEvents;)Object.hasOwnProperty.call(s,"hcEvents")&&s.hcEvents[i]&&(t.length&&(o=!0),t.unshift.apply(t,s.hcEvents[i])),s=Object.getPrototypeOf(s);o&&t.sort((t,e)=>t.order-e.order),t.forEach(t=>{!1===t.fn.call(e,r)&&r.preventDefault();});}o&&!r.defaultPrevented&&o.call(e,r);}k({map:"map",each:"forEach",grep:"filter",reduce:"reduce",some:"some"},function(e,i){t[i]=function(t){return o(32,!1,void 0,{[`Highcharts.${i}`]:`use Array.${e}`}),Array.prototype[e].apply(t,[].slice.call(arguments,1))};});let w=function(){let t=Math.random().toString(36).substring(2,9)+"-",i=0;return function(){return "highcharts-"+(e?"":t)+i++}}();return r.jQuery&&(r.jQuery.fn.highcharts=function(){let e=[].slice.call(arguments);if(this[0])return e[0]?(new t[n(e[0])?e.shift():"Chart"](this[0],e[0],e[1]),this):i[g(this[0],"data-highcharts-chart")]}),{addEvent:function(e,i,s,r={}){let o="function"==typeof e&&e.prototype||e;Object.hasOwnProperty.call(o,"hcEvents")||(o.hcEvents={});let a=o.hcEvents;t.Point&&e instanceof t.Point&&e.series&&e.series.chart&&(e.series.chart.runTrackerClick=!0);let n=e.addEventListener;n&&n.call(e,i,s,!!t.supportsPassiveEvents&&{passive:void 0===r.passive?-1!==i.indexOf("touch"):r.passive,capture:!1}),a[i]||(a[i]=[]);let h={fn:s,order:"number"==typeof r.order?r.order:1/0};return a[i].push(h),a[i].sort((t,e)=>t.order-e.order),function(){C(e,i,s);}},arrayMax:function(t){let e=t.length,i=t[0];for(;e--;)t[e]>i&&(i=t[e]);return i},arrayMin:function(t){let e=t.length,i=t[0];for(;e--;)t[e]<i&&(i=t[e]);return i},attr:g,clamp:function(t,e,i){return t>e?t<i?t:i:e},clearTimeout:function(t){u(t)&&clearTimeout(t);},correctFloat:v,createElement:function(t,e,i,r,o){let a=s.createElement(t);return e&&m(a,e),o&&y(a,{padding:"0",border:"none",margin:"0"}),i&&y(a,i),r&&r.appendChild(a),a},css:y,defined:u,destroyObjectProperties:function(t,e,i){k(t,function(s,r){s!==e&&s?.destroy&&s.destroy(),(s?.destroy||!i)&&delete t[r];});},diffObjects:function(t,e,i,s){let r={};return function t(e,r,o,a){let n=i?r:e;k(e,function(i,d){if(!a&&s&&s.indexOf(d)>-1&&r[d]){i=f(i),o[d]=[];for(let e=0;e<Math.max(i.length,r[d].length);e++)r[d][e]&&(void 0===i[e]?o[d][e]=r[d][e]:(o[d][e]={},t(i[e],r[d][e],o[d][e],a+1)));}else l(i,!0)&&!i.nodeType?(o[d]=h(i)?[]:{},t(i,r[d]||{},o[d],a+1),0!==Object.keys(o[d]).length||"colorAxis"===d&&0===a||delete o[d]):(e[d]!==r[d]||d in e&&!(d in r))&&"__proto__"!==d&&"constructor"!==d&&(o[d]=n[d]);});}(t,e,r,0),r},discardElement:function(t){t&&t.parentElement&&t.parentElement.removeChild(t);},erase:function(t,e){let i=t.length;for(;i--;)if(t[i]===e){t.splice(i,1);break}},error:o,extend:m,extendClass:function(t,e){let i=function(){};return i.prototype=new t,m(i.prototype,e),i},find:S,fireEvent:M,getClosestDistance:function(t,e){let i,r,o;let a=!e;return t.forEach(t=>{if(t.length>1)for(o=t.length-1;o>0;o--)(r=t[o]-t[o-1])<0&&!a?(e?.(),e=void 0):r&&(void 0===i||r<i)&&(i=r);}),i},getMagnitude:b,getNestedProperty:function(t,e){let i=t.split(".");for(;i.length&&u(e);){let t=i.shift();if(void 0===t||"__proto__"===t)return;if("this"===t){let t;return l(e)&&(t=e["@this"]),t??e}let s=e[t];if(!u(s)||"function"==typeof s||"number"==typeof s.nodeType||s===r)return;e=s;}return e},getStyle:function t(e,i,s){let o;if("width"===i){let i=Math.min(e.offsetWidth,e.scrollWidth),s=e.getBoundingClientRect&&e.getBoundingClientRect().width;return s<i&&s>=i-1&&(i=Math.floor(s)),Math.max(0,i-(t(e,"padding-left",!0)||0)-(t(e,"padding-right",!0)||0))}if("height"===i)return Math.max(0,Math.min(e.offsetHeight,e.scrollHeight)-(t(e,"padding-top",!0)||0)-(t(e,"padding-bottom",!0)||0));let n=r.getComputedStyle(e,void 0);return n&&(o=n.getPropertyValue(i),x(s,"opacity"!==i)&&(o=a(o))),o},inArray:function(t,e,i){return o(32,!1,void 0,{"Highcharts.inArray":"use Array.indexOf"}),e.indexOf(t,i)},insertItem:function(t,e){let i;let s=t.options.index,r=e.length;for(i=t.options.isInternal?r:0;i<r+1;i++)if(!e[i]||p(s)&&s<x(e[i].options.index,e[i]._i)||e[i].options.isInternal){e.splice(i,0,t);break}return i},isArray:h,isClass:c,isDOMElement:d,isFunction:function(t){return "function"==typeof t},isNumber:p,isObject:l,isString:n,keys:function(t){return o(32,!1,void 0,{"Highcharts.keys":"use Object.keys"}),Object.keys(t)},merge:function(){let t,e=arguments,i={},s=function(t,e){return "object"!=typeof t&&(t={}),k(e,function(i,r){"__proto__"!==r&&"constructor"!==r&&(!l(i,!0)||c(i)||d(i)?t[r]=e[r]:t[r]=s(t[r]||{},i));}),t};!0===e[0]&&(i=e[1],e=Array.prototype.slice.call(e,2));let r=e.length;for(t=0;t<r;t++)i=s(i,e[t]);return i},normalizeTickInterval:function(t,e,i,s,r){let o,a=t;i=x(i,b(t));let n=t/i;for(!e&&(e=r?[1,1.2,1.5,2,2.5,3,4,5,6,8,10]:[1,2,2.5,5,10],!1===s&&(1===i?e=e.filter(function(t){return t%1==0}):i<=.1&&(e=[1/i]))),o=0;o<e.length&&(a=e[o],(!r||!(a*i>=t))&&(r||!(n<=(e[o]+(e[o+1]||e[o]))/2)));o++);return v(a*i,-Math.round(Math.log(.001)/Math.LN10))},objectEach:k,offset:function(t){let e=s.documentElement,i=t.parentElement||t.parentNode?t.getBoundingClientRect():{top:0,left:0,width:0,height:0};return {top:i.top+(r.pageYOffset||e.scrollTop)-(e.clientTop||0),left:i.left+(r.pageXOffset||e.scrollLeft)-(e.clientLeft||0),width:i.width,height:i.height}},pad:function(t,e,i){return Array((e||2)+1-String(t).replace("-","").length).join(i||"0")+t},pick:x,pInt:a,pushUnique:function(t,e){return 0>t.indexOf(e)&&!!t.push(e)},relativeLength:function(t,e,i){return /%$/.test(t)?e*parseFloat(t)/100+(i||0):parseFloat(t)},removeEvent:C,replaceNested:function(t,...e){let i,s;do for(s of(i=t,e))t=t.replace(s[0],s[1]);while(t!==i);return t},splat:f,stableSort:function(t,e){let i,s;let r=t.length;for(s=0;s<r;s++)t[s].safeI=s;for(t.sort(function(t,s){return 0===(i=e(t,s))?t.safeI-s.safeI:i}),s=0;s<r;s++)delete t[s].safeI;},syncTimeout:function(t,e,i){return e>0?setTimeout(t,e,i):(t.call(0,i),-1)},timeUnits:{millisecond:1,second:1e3,minute:6e4,hour:36e5,day:864e5,week:6048e5,month:24192e5,year:314496e5},uniqueKey:w,useSerialIds:function(t){return e=x(t,e)},wrap:function(t,e,i){let s=t[e];t[e]=function(){let t=arguments,e=this;return i.apply(this,[function(){return s.apply(e,arguments.length?arguments:t)}].concat([].slice.call(arguments)))};}}}),i(e,"Core/Chart/ChartDefaults.js",[],function(){return {alignThresholds:!1,panning:{enabled:!1,type:"x"},styledMode:!1,borderRadius:0,colorCount:10,allowMutatingData:!0,ignoreHiddenSeries:!0,spacing:[10,10,15,10],resetZoomButton:{theme:{},position:{}},reflow:!0,type:"line",zooming:{singleTouch:!1,resetButton:{theme:{zIndex:6},position:{align:"right",x:-10,y:10}}},width:null,height:null,borderColor:"#334eff",backgroundColor:"#ffffff",plotBorderColor:"#cccccc"}}),i(e,"Core/Color/Palettes.js",[],function(){return {colors:["#2caffe","#544fc5","#00e272","#fe6a35","#6b8abc","#d568fb","#2ee0ca","#fa4b42","#feb56a","#91e8e1"]}}),i(e,"Core/Time.js",[e["Core/Globals.js"],e["Core/Utilities.js"]],function(t,e){let{win:i}=t,{defined:s,error:r,extend:o,isNumber:a,isObject:n,merge:h,objectEach:l,pad:d,pick:c,splat:p,timeUnits:u}=e,g=t.isSafari&&i.Intl&&i.Intl.DateTimeFormat.prototype.formatRange,f=t.isSafari&&i.Intl&&!i.Intl.DateTimeFormat.prototype.formatRange;class m{constructor(t){this.options={},this.useUTC=!1,this.variableTimezone=!1,this.Date=i.Date,this.getTimezoneOffset=this.timezoneOffsetFunction(),this.update(t);}get(t,e){if(this.variableTimezone||this.timezoneOffset){let i=e.getTime(),s=i-this.getTimezoneOffset(e);e.setTime(s);let r=e["getUTC"+t]();return e.setTime(i),r}return this.useUTC?e["getUTC"+t]():e["get"+t]()}set(t,e,i){if(this.variableTimezone||this.timezoneOffset){if("Milliseconds"===t||"Seconds"===t||"Minutes"===t&&this.getTimezoneOffset(e)%36e5==0)return e["setUTC"+t](i);let s=this.getTimezoneOffset(e),r=e.getTime()-s;e.setTime(r),e["setUTC"+t](i);let o=this.getTimezoneOffset(e);return r=e.getTime()+o,e.setTime(r)}return this.useUTC||g&&"FullYear"===t?e["setUTC"+t](i):e["set"+t](i)}update(t={}){let e=c(t.useUTC,!0);this.options=t=h(!0,this.options,t),this.Date=t.Date||i.Date||Date,this.useUTC=e,this.timezoneOffset=e&&t.timezoneOffset||void 0,this.getTimezoneOffset=this.timezoneOffsetFunction(),this.variableTimezone=e&&!!(t.getTimezoneOffset||t.timezone);}makeTime(t,e,i,s,r,o){let a,n,h;return this.useUTC?(a=this.Date.UTC.apply(0,arguments),n=this.getTimezoneOffset(a),a+=n,n!==(h=this.getTimezoneOffset(a))?a+=h-n:n-36e5!==this.getTimezoneOffset(a-36e5)||f||(a-=36e5)):a=new this.Date(t,e,c(i,1),c(s,0),c(r,0),c(o,0)).getTime(),a}timezoneOffsetFunction(){let t=this,e=this.options,i=e.getTimezoneOffset;return this.useUTC?e.timezone?t=>{try{let i=`shortOffset,${e.timezone||""}`,[s,r,o,n,h=0]=(m.formatCache[i]=m.formatCache[i]||Intl.DateTimeFormat("en",{timeZone:e.timezone,timeZoneName:"shortOffset"})).format(t).split(/(GMT|:)/).map(Number),l=-(36e5*(o+h/60));if(a(l))return l}catch(t){r(34);}return 0}:this.useUTC&&i?t=>6e4*i(t.valueOf()):()=>6e4*(t.timezoneOffset||0):t=>6e4*new Date(t.toString()).getTimezoneOffset()}dateFormat(e,i,r){if(!s(i)||isNaN(i))return t.defaultOptions.lang&&t.defaultOptions.lang.invalidDate||"";e=c(e,"%Y-%m-%d %H:%M:%S");let a=this,n=new this.Date(i),h=this.get("Hours",n),p=this.get("Day",n),u=this.get("Date",n),g=this.get("Month",n),f=this.get("FullYear",n),m=t.defaultOptions.lang,x=m&&m.weekdays,y=m&&m.shortWeekdays;return l(o({a:y?y[p]:x[p].substr(0,3),A:x[p],d:d(u),e:d(u,2," "),w:p,b:m.shortMonths[g],B:m.months[g],m:d(g+1),o:g+1,y:f.toString().substr(2,2),Y:f,H:d(h),k:h,I:d(h%12||12),l:h%12||12,M:d(this.get("Minutes",n)),p:h<12?"AM":"PM",P:h<12?"am":"pm",S:d(this.get("Seconds",n)),L:d(Math.floor(i%1e3),3)},t.dateFormats),function(t,s){for(;-1!==e.indexOf("%"+s);)e=e.replace("%"+s,"function"==typeof t?t.call(a,i):t);}),r?e.substr(0,1).toUpperCase()+e.substr(1):e}resolveDTLFormat(t){return n(t,!0)?t:{main:(t=p(t))[0],from:t[1],to:t[2]}}getTimeTicks(t,e,i,r){let a,n,h,l;let d=this,p=d.Date,g=[],f={},m=new p(e),x=t.unitRange,y=t.count||1;if(r=c(r,1),s(e)){d.set("Milliseconds",m,x>=u.second?0:y*Math.floor(d.get("Milliseconds",m)/y)),x>=u.second&&d.set("Seconds",m,x>=u.minute?0:y*Math.floor(d.get("Seconds",m)/y)),x>=u.minute&&d.set("Minutes",m,x>=u.hour?0:y*Math.floor(d.get("Minutes",m)/y)),x>=u.hour&&d.set("Hours",m,x>=u.day?0:y*Math.floor(d.get("Hours",m)/y)),x>=u.day&&d.set("Date",m,x>=u.month?1:Math.max(1,y*Math.floor(d.get("Date",m)/y))),x>=u.month&&(d.set("Month",m,x>=u.year?0:y*Math.floor(d.get("Month",m)/y)),n=d.get("FullYear",m)),x>=u.year&&(n-=n%y,d.set("FullYear",m,n)),x===u.week&&(l=d.get("Day",m),d.set("Date",m,d.get("Date",m)-l+r+(l<r?-7:0))),n=d.get("FullYear",m);let t=d.get("Month",m),o=d.get("Date",m),c=d.get("Hours",m);e=m.getTime(),(d.variableTimezone||!d.useUTC)&&s(i)&&(h=i-e>4*u.month||d.getTimezoneOffset(e)!==d.getTimezoneOffset(i));let p=m.getTime();for(a=1;p<i;)g.push(p),x===u.year?p=d.makeTime(n+a*y,0):x===u.month?p=d.makeTime(n,t+a*y):h&&(x===u.day||x===u.week)?p=d.makeTime(n,t,o+a*y*(x===u.day?1:7)):h&&x===u.hour&&y>1?p=d.makeTime(n,t,o,c+a*y):p+=x*y,a++;g.push(p),x<=u.hour&&g.length<1e4&&g.forEach(function(t){t%18e5==0&&"000000000"===d.dateFormat("%H%M%S%L",t)&&(f[t]="day");});}return g.info=o(t,{higherRanks:f,totalRange:x*y}),g}getDateFormat(t,e,i,s){let r=this.dateFormat("%m-%d %H:%M:%S.%L",e),o="01-01 00:00:00.000",a={millisecond:15,second:12,minute:9,hour:6,day:3},n="millisecond",h=n;for(n in u){if(t===u.week&&+this.dateFormat("%w",e)===i&&r.substr(6)===o.substr(6)){n="week";break}if(u[n]>t){n=h;break}if(a[n]&&r.substr(a[n])!==o.substr(a[n]))break;"week"!==n&&(h=n);}return this.resolveDTLFormat(s[n]).main}}return m.formatCache={},m}),i(e,"Core/Defaults.js",[e["Core/Chart/ChartDefaults.js"],e["Core/Globals.js"],e["Core/Color/Palettes.js"],e["Core/Time.js"],e["Core/Utilities.js"]],function(t,e,i,s,r){let{isTouchDevice:o,svg:a}=e,{merge:n}=r,h={colors:i.colors,symbols:["circle","diamond","square","triangle","triangle-down"],lang:{loading:"Loading...",months:["January","February","March","April","May","June","July","August","September","October","November","December"],shortMonths:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],weekdays:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],decimalPoint:".",numericSymbols:["k","M","G","T","P","E"],resetZoom:"Reset zoom",resetZoomTitle:"Reset zoom level 1:1",thousandsSep:" "},global:{},time:{Date:void 0,getTimezoneOffset:void 0,timezone:void 0,timezoneOffset:0,useUTC:!0},chart:t,title:{style:{color:"#333333",fontWeight:"bold"},text:"Chart title",align:"center",margin:15,widthAdjust:-44},subtitle:{style:{color:"#666666",fontSize:"0.8em"},text:"",align:"center",widthAdjust:-44},caption:{margin:15,style:{color:"#666666",fontSize:"0.8em"},text:"",align:"left",verticalAlign:"bottom"},plotOptions:{},legend:{enabled:!0,align:"center",alignColumns:!0,className:"highcharts-no-tooltip",layout:"horizontal",itemMarginBottom:2,itemMarginTop:2,labelFormatter:function(){return this.name},borderColor:"#999999",borderRadius:0,navigation:{style:{fontSize:"0.8em"},activeColor:"#0022ff",inactiveColor:"#cccccc"},itemStyle:{color:"#333333",cursor:"pointer",fontSize:"0.8em",textDecoration:"none",textOverflow:"ellipsis"},itemHoverStyle:{color:"#000000"},itemHiddenStyle:{color:"#666666",textDecoration:"line-through"},shadow:!1,itemCheckboxStyle:{position:"absolute",width:"13px",height:"13px"},squareSymbol:!0,symbolPadding:5,verticalAlign:"bottom",x:0,y:0,title:{style:{fontSize:"0.8em",fontWeight:"bold"}}},loading:{labelStyle:{fontWeight:"bold",position:"relative",top:"45%"},style:{position:"absolute",backgroundColor:"#ffffff",opacity:.5,textAlign:"center"}},tooltip:{enabled:!0,animation:a,borderRadius:3,dateTimeLabelFormats:{millisecond:"%A, %e %b, %H:%M:%S.%L",second:"%A, %e %b, %H:%M:%S",minute:"%A, %e %b, %H:%M",hour:"%A, %e %b, %H:%M",day:"%A, %e %b %Y",week:"Week from %A, %e %b %Y",month:"%B %Y",year:"%Y"},footerFormat:"",headerShape:"callout",hideDelay:500,padding:8,shape:"callout",shared:!1,snap:o?25:10,headerFormat:'<span style="font-size: 0.8em">{point.key}</span><br/>',pointFormat:'<span style="color:{point.color}">●</span> {series.name}: <b>{point.y}</b><br/>',backgroundColor:"#ffffff",borderWidth:void 0,shadow:!0,stickOnContact:!1,style:{color:"#333333",cursor:"default",fontSize:"0.8em"},useHTML:!1},credits:{enabled:!0,href:"https://www.highcharts.com?credits",position:{align:"right",x:-10,verticalAlign:"bottom",y:-5},style:{cursor:"pointer",color:"#999999",fontSize:"0.6em"},text:"Highcharts.com"}};h.chart.styledMode=!1;let l=new s(h.time);return {defaultOptions:h,defaultTime:l,getOptions:function(){return h},setOptions:function(t){return n(!0,h,t),(t.time||t.global)&&(e.time?e.time.update(n(h.global,h.time,t.global,t.time)):e.time=l),h}}}),i(e,"Core/Color/Color.js",[e["Core/Globals.js"],e["Core/Utilities.js"]],function(t,e){let{isNumber:i,merge:s,pInt:r}=e;class o{static parse(t){return t?new o(t):o.None}constructor(e){let i,s,r,a;this.rgba=[NaN,NaN,NaN,NaN],this.input=e;let n=t.Color;if(n&&n!==o)return new n(e);if("object"==typeof e&&void 0!==e.stops)this.stops=e.stops.map(t=>new o(t[1]));else if("string"==typeof e){if(this.input=e=o.names[e.toLowerCase()]||e,"#"===e.charAt(0)){let t=e.length,i=parseInt(e.substr(1),16);7===t?s=[(16711680&i)>>16,(65280&i)>>8,255&i,1]:4===t&&(s=[(3840&i)>>4|(3840&i)>>8,(240&i)>>4|240&i,(15&i)<<4|15&i,1]);}if(!s)for(r=o.parsers.length;r--&&!s;)(i=(a=o.parsers[r]).regex.exec(e))&&(s=a.parse(i));}s&&(this.rgba=s);}get(t){let e=this.input,r=this.rgba;if("object"==typeof e&&void 0!==this.stops){let i=s(e);return i.stops=[].slice.call(i.stops),this.stops.forEach((e,s)=>{i.stops[s]=[i.stops[s][0],e.get(t)];}),i}return r&&i(r[0])?"rgb"!==t&&(t||1!==r[3])?"a"===t?`${r[3]}`:"rgba("+r.join(",")+")":"rgb("+r[0]+","+r[1]+","+r[2]+")":e}brighten(t){let e=this.rgba;if(this.stops)this.stops.forEach(function(e){e.brighten(t);});else if(i(t)&&0!==t)for(let i=0;i<3;i++)e[i]+=r(255*t),e[i]<0&&(e[i]=0),e[i]>255&&(e[i]=255);return this}setOpacity(t){return this.rgba[3]=t,this}tweenTo(t,e){let s=this.rgba,r=t.rgba;if(!i(s[0])||!i(r[0]))return t.input||"none";let o=1!==r[3]||1!==s[3];return (o?"rgba(":"rgb(")+Math.round(r[0]+(s[0]-r[0])*(1-e))+","+Math.round(r[1]+(s[1]-r[1])*(1-e))+","+Math.round(r[2]+(s[2]-r[2])*(1-e))+(o?","+(r[3]+(s[3]-r[3])*(1-e)):"")+")"}}return o.names={white:"#ffffff",black:"#000000"},o.parsers=[{regex:/rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]?(?:\.[0-9]+)?)\s*\)/,parse:function(t){return [r(t[1]),r(t[2]),r(t[3]),parseFloat(t[4],10)]}},{regex:/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/,parse:function(t){return [r(t[1]),r(t[2]),r(t[3]),1]}}],o.None=new o(""),o}),i(e,"Core/Animation/Fx.js",[e["Core/Color/Color.js"],e["Core/Globals.js"],e["Core/Utilities.js"]],function(t,e,i){let{parse:s}=t,{win:r}=e,{isNumber:o,objectEach:a}=i;class n{constructor(t,e,i){this.pos=NaN,this.options=e,this.elem=t,this.prop=i;}dSetter(){let t=this.paths,e=t&&t[0],i=t&&t[1],s=this.now||0,r=[];if(1!==s&&e&&i){if(e.length===i.length&&s<1)for(let t=0;t<i.length;t++){let a=e[t],n=i[t],h=[];for(let t=0;t<n.length;t++){let e=a[t],i=n[t];o(e)&&o(i)&&!("A"===n[0]&&(4===t||5===t))?h[t]=e+s*(i-e):h[t]=i;}r.push(h);}else r=i;}else r=this.toD||[];this.elem.attr("d",r,void 0,!0);}update(){let t=this.elem,e=this.prop,i=this.now,s=this.options.step;this[e+"Setter"]?this[e+"Setter"]():t.attr?t.element&&t.attr(e,i,null,!0):t.style[e]=i+this.unit,s&&s.call(t,i,this);}run(t,e,i){let s=this,o=s.options,a=function(t){return !a.stopped&&s.step(t)},h=r.requestAnimationFrame||function(t){setTimeout(t,13);},l=function(){for(let t=0;t<n.timers.length;t++)n.timers[t]()||n.timers.splice(t--,1);n.timers.length&&h(l);};t!==e||this.elem["forceAnimate:"+this.prop]?(this.startTime=+new Date,this.start=t,this.end=e,this.unit=i,this.now=this.start,this.pos=0,a.elem=this.elem,a.prop=this.prop,a()&&1===n.timers.push(a)&&h(l)):(delete o.curAnim[this.prop],o.complete&&0===Object.keys(o.curAnim).length&&o.complete.call(this.elem));}step(t){let e,i;let s=+new Date,r=this.options,o=this.elem,n=r.complete,h=r.duration,l=r.curAnim;return o.attr&&!o.element?e=!1:t||s>=h+this.startTime?(this.now=this.end,this.pos=1,this.update(),l[this.prop]=!0,i=!0,a(l,function(t){!0!==t&&(i=!1);}),i&&n&&n.call(o),e=!1):(this.pos=r.easing((s-this.startTime)/h),this.now=this.start+(this.end-this.start)*this.pos,this.update(),e=!0),e}initPath(t,e,i){let s=t.startX,r=t.endX,a=i.slice(),n=t.isArea,h=n?2:1,l,d,c,p,u=e&&e.slice();if(!u)return [a,a];function g(t,e){for(;t.length<d;){let i=t[0],s=e[d-t.length];if(s&&"M"===i[0]&&("C"===s[0]?t[0]=["C",i[1],i[2],i[1],i[2],i[1],i[2]]:t[0]=["L",i[1],i[2]]),t.unshift(i),n){let e=t.pop();t.push(t[t.length-1],e);}}}function f(t){for(;t.length<d;){let e=t[Math.floor(t.length/h)-1].slice();if("C"===e[0]&&(e[1]=e[5],e[2]=e[6]),n){let i=t[Math.floor(t.length/h)].slice();t.splice(t.length/2,0,e,i);}else t.push(e);}}if(s&&r&&r.length){for(c=0;c<s.length;c++){if(s[c]===r[0]){l=c;break}if(s[0]===r[r.length-s.length+c]){l=c,p=!0;break}if(s[s.length-1]===r[r.length-s.length+c]){l=s.length-c;break}}void 0===l&&(u=[]);}return u.length&&o(l)&&(d=a.length+l*h,p?(g(u,a),f(a)):(g(a,u),f(u))),[u,a]}fillSetter(){n.prototype.strokeSetter.apply(this,arguments);}strokeSetter(){this.elem.attr(this.prop,s(this.start).tweenTo(s(this.end),this.pos),void 0,!0);}}return n.timers=[],n}),i(e,"Core/Animation/AnimationUtilities.js",[e["Core/Animation/Fx.js"],e["Core/Utilities.js"]],function(t,e){let{defined:i,getStyle:s,isArray:r,isNumber:o,isObject:a,merge:n,objectEach:h,pick:l}=e;function d(t){return a(t)?n({duration:500,defer:0},t):{duration:t?500:0,defer:0}}function c(e,i){let s=t.timers.length;for(;s--;)t.timers[s].elem!==e||i&&i!==t.timers[s].prop||(t.timers[s].stopped=!0);}return {animate:function(e,i,l){let d,p="",u,g,f;a(l)||(f=arguments,l={duration:f[2],easing:f[3],complete:f[4]}),o(l.duration)||(l.duration=400),l.easing="function"==typeof l.easing?l.easing:Math[l.easing]||Math.easeInOutSine,l.curAnim=n(i),h(i,function(o,a){c(e,a),g=new t(e,l,a),u=void 0,"d"===a&&r(i.d)?(g.paths=g.initPath(e,e.pathArray,i.d),g.toD=i.d,d=0,u=1):e.attr?d=e.attr(a):(d=parseFloat(s(e,a))||0,"opacity"!==a&&(p="px")),u||(u=o),"string"==typeof u&&u.match("px")&&(u=u.replace(/px/g,"")),g.run(d,u,p);});},animObject:d,getDeferredAnimation:function(t,e,s){let r=d(e),o=s?[s]:t.series,n=0,h=0;return o.forEach(t=>{let s=d(t.options.animation);n=a(e)&&i(e.defer)?r.defer:Math.max(n,s.duration+s.defer),h=Math.min(r.duration,s.duration);}),t.renderer.forExport&&(n=0),{defer:Math.max(0,n-h),duration:Math.min(n,h)}},setAnimation:function(t,e){e.renderer.globalAnimation=l(t,e.options.chart.animation,!0);},stop:c}}),i(e,"Core/Renderer/HTML/AST.js",[e["Core/Globals.js"],e["Core/Utilities.js"]],function(t,e){let{SVG_NS:i,win:s}=t,{attr:r,createElement:o,css:a,error:n,isFunction:h,isString:l,objectEach:d,splat:c}=e,{trustedTypes:p}=s,u=p&&h(p.createPolicy)&&p.createPolicy("highcharts",{createHTML:t=>t}),g=u?u.createHTML(""):"",f=function(){try{return !!new DOMParser().parseFromString(g,"text/html")}catch(t){return !1}}();class m{static filterUserAttributes(t){return d(t,(e,i)=>{let s=!0;-1===m.allowedAttributes.indexOf(i)&&(s=!1),-1!==["background","dynsrc","href","lowsrc","src"].indexOf(i)&&(s=l(e)&&m.allowedReferences.some(t=>0===e.indexOf(t))),s||(n(33,!1,void 0,{"Invalid attribute in config":`${i}`}),delete t[i]),l(e)&&t[i]&&(t[i]=e.replace(/</g,"&lt;"));}),t}static parseStyle(t){return t.split(";").reduce((t,e)=>{let i=e.split(":").map(t=>t.trim()),s=i.shift();return s&&i.length&&(t[s.replace(/-([a-z])/g,t=>t[1].toUpperCase())]=i.join(":")),t},{})}static setElementHTML(t,e){t.innerHTML=m.emptyHTML,e&&new m(e).addToDOM(t);}constructor(t){this.nodes="string"==typeof t?this.parseMarkup(t):t;}addToDOM(e){return function e(s,o){let h;return c(s).forEach(function(s){let l;let c=s.tagName,p=s.textContent?t.doc.createTextNode(s.textContent):void 0,u=m.bypassHTMLFiltering;if(c){if("#text"===c)l=p;else if(-1!==m.allowedTags.indexOf(c)||u){let n="svg"===c?i:o.namespaceURI||i,h=t.doc.createElementNS(n,c),g=s.attributes||{};d(s,function(t,e){"tagName"!==e&&"attributes"!==e&&"children"!==e&&"style"!==e&&"textContent"!==e&&(g[e]=t);}),r(h,u?g:m.filterUserAttributes(g)),s.style&&a(h,s.style),p&&h.appendChild(p),e(s.children||[],h),l=h;}else n(33,!1,void 0,{"Invalid tagName in config":c});}l&&o.appendChild(l),h=l;}),h}(this.nodes,e)}parseMarkup(t){let e;let i=[];if(t=t.trim().replace(/ style=(["'])/g," data-style=$1"),f)e=new DOMParser().parseFromString(u?u.createHTML(t):t,"text/html");else {let i=o("div");i.innerHTML=t,e={body:i};}let s=(t,e)=>{let i=t.nodeName.toLowerCase(),r={tagName:i};"#text"===i&&(r.textContent=t.textContent||"");let o=t.attributes;if(o){let t={};[].forEach.call(o,e=>{"data-style"===e.name?r.style=m.parseStyle(e.value):t[e.name]=e.value;}),r.attributes=t;}if(t.childNodes.length){let e=[];[].forEach.call(t.childNodes,t=>{s(t,e);}),e.length&&(r.children=e);}e.push(r);};return [].forEach.call(e.body.childNodes,t=>s(t,i)),i}}return m.allowedAttributes=["alt","aria-controls","aria-describedby","aria-expanded","aria-haspopup","aria-hidden","aria-label","aria-labelledby","aria-live","aria-pressed","aria-readonly","aria-roledescription","aria-selected","class","clip-path","color","colspan","cx","cy","d","dx","dy","disabled","fill","filterUnits","flood-color","flood-opacity","height","href","id","in","markerHeight","markerWidth","offset","opacity","orient","padding","paddingLeft","paddingRight","patternUnits","r","refX","refY","role","scope","slope","src","startOffset","stdDeviation","stroke","stroke-linecap","stroke-width","style","tableValues","result","rowspan","summary","target","tabindex","text-align","text-anchor","textAnchor","textLength","title","type","valign","width","x","x1","x2","xlink:href","y","y1","y2","zIndex"],m.allowedReferences=["https://","http://","mailto:","/","../","./","#"],m.allowedTags=["a","abbr","b","br","button","caption","circle","clipPath","code","dd","defs","div","dl","dt","em","feComponentTransfer","feDropShadow","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feOffset","feMerge","feMergeNode","filter","h1","h2","h3","h4","h5","h6","hr","i","img","li","linearGradient","marker","ol","p","path","pattern","pre","rect","small","span","stop","strong","style","sub","sup","svg","table","text","textPath","thead","title","tbody","tspan","td","th","tr","u","ul","#text"],m.emptyHTML=g,m.bypassHTMLFiltering=!1,m}),i(e,"Core/Templating.js",[e["Core/Defaults.js"],e["Core/Utilities.js"]],function(t,e){let{defaultOptions:i,defaultTime:s}=t,{extend:r,getNestedProperty:o,isArray:a,isNumber:n,isObject:h,pick:l,pInt:d}=e,c={add:(t,e)=>t+e,divide:(t,e)=>0!==e?t/e:"",eq:(t,e)=>t==e,each:function(t){let e=arguments[arguments.length-1];return !!a(t)&&t.map((i,s)=>p(e.body,r(h(i)?i:{"@this":i},{"@index":s,"@first":0===s,"@last":s===t.length-1}))).join("")},ge:(t,e)=>t>=e,gt:(t,e)=>t>e,if:t=>!!t,le:(t,e)=>t<=e,lt:(t,e)=>t<e,multiply:(t,e)=>t*e,ne:(t,e)=>t!=e,subtract:(t,e)=>t-e,unless:t=>!t};function p(t="",e,r){let a=/\{([a-zA-Z0-9\:\.\,;\-\/<>%_@"'= #\(\)]+)\}/g,n=/\(([a-zA-Z0-9\:\.\,;\-\/<>%_@"'= ]+)\)/g,h=[],d=/f$/,g=/\.([0-9])/,f=i.lang,m=r&&r.time||s,x=r&&r.numberFormatter||u,y=(t="")=>{let i;return "true"===t||"false"!==t&&((i=Number(t)).toString()===t?i:o(t,e))},b,v,S=0,k;for(;null!==(b=a.exec(t));){let i=n.exec(b[1]);i&&(b=i,k=!0),v&&v.isBlock||(v={ctx:e,expression:b[1],find:b[0],isBlock:"#"===b[1].charAt(0),start:b.index,startInner:b.index+b[0].length,length:b[0].length});let s=b[1].split(" ")[0].replace("#","");c[s]&&(v.isBlock&&s===v.fn&&S++,v.fn||(v.fn=s));let r="else"===b[1];if(v.isBlock&&v.fn&&(b[1]===`/${v.fn}`||r)){if(S)!r&&S--;else {let e=v.startInner,i=t.substr(e,b.index-e);void 0===v.body?(v.body=i,v.startInner=b.index+b[0].length):v.elseBody=i,v.find+=i+b[0],r||(h.push(v),v=void 0);}}else v.isBlock||h.push(v);if(i&&!v?.isBlock)break}return h.forEach(i=>{let s,r;let{body:o,elseBody:a,expression:n,fn:h}=i;if(h){let t=[i],l=n.split(" ");for(r=c[h].length;r--;)t.unshift(y(l[r+1]));s=c[h].apply(e,t),i.isBlock&&"boolean"==typeof s&&(s=p(s?o:a,e));}else {let t=n.split(":");if(s=y(t.shift()||""),t.length&&"number"==typeof s){let e=t.join(":");if(d.test(e)){let t=parseInt((e.match(g)||["","-1"])[1],10);null!==s&&(s=x(s,t,f.decimalPoint,e.indexOf(",")>-1?f.thousandsSep:""));}else s=m.dateFormat(e,s);}}t=t.replace(i.find,l(s,""));}),k?p(t,e,r):t}function u(t,e,s,r){let o,a;t=+t||0,e=+e;let h=i.lang,c=(t.toString().split(".")[1]||"").split("e")[0].length,p=t.toString().split("e"),u=e;-1===e?e=Math.min(c,20):n(e)?e&&p[1]&&p[1]<0&&((a=e+ +p[1])>=0?(p[0]=(+p[0]).toExponential(a).split("e")[0],e=a):(p[0]=p[0].split(".")[0]||0,t=e<20?(p[0]*Math.pow(10,p[1])).toFixed(e):0,p[1]=0)):e=2;let g=(Math.abs(p[1]?p[0]:t)+Math.pow(10,-Math.max(e,c)-1)).toFixed(e),f=String(d(g)),m=f.length>3?f.length%3:0;return s=l(s,h.decimalPoint),r=l(r,h.thousandsSep),o=(t<0?"-":"")+(m?f.substr(0,m)+r:""),0>+p[1]&&!u?o="0":o+=f.substr(m).replace(/(\d{3})(?=\d)/g,"$1"+r),e&&(o+=s+g.slice(-e)),p[1]&&0!=+o&&(o+="e"+p[1]),o}return {dateFormat:function(t,e,i){return s.dateFormat(t,e,i)},format:p,helpers:c,numberFormat:u}}),i(e,"Core/Renderer/RendererRegistry.js",[e["Core/Globals.js"]],function(t){var e,i;let s;return (i=e||(e={})).rendererTypes={},i.getRendererType=function(t=s){return i.rendererTypes[t]||i.rendererTypes[s]},i.registerRendererType=function(e,r,o){i.rendererTypes[e]=r,(!s||o)&&(s=e,t.Renderer=r);},e}),i(e,"Core/Renderer/RendererUtilities.js",[e["Core/Utilities.js"]],function(t){var e;let{clamp:i,pick:s,pushUnique:r,stableSort:o}=t;return (e||(e={})).distribute=function t(e,a,n){let h=e,l=h.reducedLen||a,d=(t,e)=>t.target-e.target,c=[],p=e.length,u=[],g=c.push,f,m,x,y=!0,b,v,S=0,k;for(f=p;f--;)S+=e[f].size;if(S>l){for(o(e,(t,e)=>(e.rank||0)-(t.rank||0)),x=(k=e[0].rank===e[e.length-1].rank)?p/2:-1,m=k?x:p-1;x&&S>l;)b=e[f=Math.floor(m)],r(u,f)&&(S-=b.size),m+=x,k&&m>=e.length&&(x/=2,m=x);u.sort((t,e)=>e-t).forEach(t=>g.apply(c,e.splice(t,1)));}for(o(e,d),e=e.map(t=>({size:t.size,targets:[t.target],align:s(t.align,.5)}));y;){for(f=e.length;f--;)b=e[f],v=(Math.min.apply(0,b.targets)+Math.max.apply(0,b.targets))/2,b.pos=i(v-b.size*b.align,0,a-b.size);for(f=e.length,y=!1;f--;)f>0&&e[f-1].pos+e[f-1].size>e[f].pos&&(e[f-1].size+=e[f].size,e[f-1].targets=e[f-1].targets.concat(e[f].targets),e[f-1].align=.5,e[f-1].pos+e[f-1].size>a&&(e[f-1].pos=a-e[f-1].size),e.splice(f,1),y=!0);}return g.apply(h,c),f=0,e.some(e=>{let i=0;return (e.targets||[]).some(()=>(h[f].pos=e.pos+i,void 0!==n&&Math.abs(h[f].pos-h[f].target)>n)?(h.slice(0,f+1).forEach(t=>delete t.pos),h.reducedLen=(h.reducedLen||a)-.1*a,h.reducedLen>.1*a&&t(h,a,n),!0):(i+=h[f].size,f++,!1))}),o(h,d),h},e}),i(e,"Core/Renderer/SVG/SVGElement.js",[e["Core/Animation/AnimationUtilities.js"],e["Core/Color/Color.js"],e["Core/Globals.js"],e["Core/Utilities.js"]],function(t,e,i,s){let{animate:r,animObject:o,stop:a}=t,{deg2rad:n,doc:h,svg:l,SVG_NS:d,win:c}=i,{addEvent:p,attr:u,createElement:g,css:f,defined:m,erase:x,extend:y,fireEvent:b,isArray:v,isFunction:S,isObject:k,isString:C,merge:M,objectEach:w,pick:T,pInt:A,replaceNested:P,syncTimeout:L,uniqueKey:O}=s;class D{_defaultGetter(t){let e=T(this[t+"Value"],this[t],this.element?this.element.getAttribute(t):null,0);return /^[\-0-9\.]+$/.test(e)&&(e=parseFloat(e)),e}_defaultSetter(t,e,i){i.setAttribute(e,t);}add(t){let e;let i=this.renderer,s=this.element;return t&&(this.parentGroup=t),void 0!==this.textStr&&"text"===this.element.nodeName&&i.buildText(this),this.added=!0,(!t||t.handleZ||this.zIndex)&&(e=this.zIndexSetter()),e||(t?t.element:i.box).appendChild(s),this.onAdd&&this.onAdd(),this}addClass(t,e){let i=e?"":this.attr("class")||"";return (t=(t||"").split(/ /g).reduce(function(t,e){return -1===i.indexOf(e)&&t.push(e),t},i?[i]:[]).join(" "))!==i&&this.attr("class",t),this}afterSetters(){this.doTransform&&(this.updateTransform(),this.doTransform=!1);}align(t,e,i,s=!0){let r,o,a,n,h;let l={},d=this.renderer,c=d.alignedObjects;t?(this.alignOptions=t,this.alignByTranslate=e,(!i||C(i))&&(this.alignTo=a=i||"renderer",x(c,this),c.push(this),i=void 0)):(t=this.alignOptions,e=this.alignByTranslate,a=this.alignTo),i=T(i,d[a],d);let p=t.align,u=t.verticalAlign;return r=(i.x||0)+(t.x||0),o=(i.y||0)+(t.y||0),"right"===p?n=1:"center"===p&&(n=2),n&&(r+=(i.width-(t.width||0))/n),l[e?"translateX":"x"]=Math.round(r),"bottom"===u?h=1:"middle"===u&&(h=2),h&&(o+=(i.height-(t.height||0))/h),l[e?"translateY":"y"]=Math.round(o),s&&(this[this.placed?"animate":"attr"](l),this.placed=!0),this.alignAttr=l,this}alignSetter(t){let e={left:"start",center:"middle",right:"end"};e[t]&&(this.alignValue=t,this.element.setAttribute("text-anchor",e[t]));}animate(t,e,i){let s=o(T(e,this.renderer.globalAnimation,!0)),a=s.defer;return h.hidden&&(s.duration=0),0!==s.duration?(i&&(s.complete=i),L(()=>{this.element&&r(this,t,s);},a)):(this.attr(t,void 0,i||s.complete),w(t,function(t,e){s.step&&s.step.call(this,t,{prop:e,pos:1,elem:this});},this)),this}applyTextOutline(t){let e=this.element;-1!==t.indexOf("contrast")&&(t=t.replace(/contrast/g,this.renderer.getContrast(e.style.fill)));let s=t.split(" "),r=s[s.length-1],o=s[0];if(o&&"none"!==o&&i.svg){this.fakeTS=!0,o=o.replace(/(^[\d\.]+)(.*?)$/g,function(t,e,i){return 2*Number(e)+i}),this.removeTextOutline();let t=h.createElementNS(d,"tspan");u(t,{class:"highcharts-text-outline",fill:r,stroke:r,"stroke-width":o,"stroke-linejoin":"round"});let i=e.querySelector("textPath")||e;[].forEach.call(i.childNodes,e=>{let i=e.cloneNode(!0);i.removeAttribute&&["fill","stroke","stroke-width","stroke"].forEach(t=>i.removeAttribute(t)),t.appendChild(i);});let s=0;[].forEach.call(i.querySelectorAll("text tspan"),t=>{s+=Number(t.getAttribute("dy"));});let a=h.createElementNS(d,"tspan");a.textContent="​",u(a,{x:Number(e.getAttribute("x")),dy:-s}),t.appendChild(a),i.insertBefore(t,i.firstChild);}}attr(t,e,i,s){let r=this.element,o=D.symbolCustomAttribs,n,h,l=this,d;return "string"==typeof t&&void 0!==e&&(n=t,(t={})[n]=e),"string"==typeof t?l=(this[t+"Getter"]||this._defaultGetter).call(this,t,r):(w(t,function(e,i){d=!1,s||a(this,i),this.symbolName&&-1!==o.indexOf(i)&&(h||(this.symbolAttr(t),h=!0),d=!0),this.rotation&&("x"===i||"y"===i)&&(this.doTransform=!0),d||(this[i+"Setter"]||this._defaultSetter).call(this,e,i,r);},this),this.afterSetters()),i&&i.call(this),l}clip(t){if(t&&!t.clipPath){let e=O()+"-",i=this.renderer.createElement("clipPath").attr({id:e}).add(this.renderer.defs);y(t,{clipPath:i,id:e,count:0}),t.add(i);}return this.attr("clip-path",t?`url(${this.renderer.url}#${t.id})`:"none")}crisp(t,e){let i=Math.round(e=e||t.strokeWidth||0)%2/2;return t.x=Math.floor(t.x||this.x||0)+i,t.y=Math.floor(t.y||this.y||0)+i,t.width=Math.floor((t.width||this.width||0)-2*i),t.height=Math.floor((t.height||this.height||0)-2*i),m(t.strokeWidth)&&(t.strokeWidth=e),t}complexColor(t,i,s){let r=this.renderer,o,a,n,h,l,d,c,p,u,g,f=[],x;b(this.renderer,"complexColor",{args:arguments},function(){if(t.radialGradient?a="radialGradient":t.linearGradient&&(a="linearGradient"),a){if(n=t[a],l=r.gradients,d=t.stops,u=s.radialReference,v(n)&&(t[a]=n={x1:n[0],y1:n[1],x2:n[2],y2:n[3],gradientUnits:"userSpaceOnUse"}),"radialGradient"===a&&u&&!m(n.gradientUnits)&&(h=n,n=M(n,r.getRadialAttr(u,h),{gradientUnits:"userSpaceOnUse"})),w(n,function(t,e){"id"!==e&&f.push(e,t);}),w(d,function(t){f.push(t);}),l[f=f.join(",")])g=l[f].attr("id");else {n.id=g=O();let t=l[f]=r.createElement(a).attr(n).add(r.defs);t.radAttr=h,t.stops=[],d.forEach(function(i){0===i[1].indexOf("rgba")?(c=(o=e.parse(i[1])).get("rgb"),p=o.get("a")):(c=i[1],p=1);let s=r.createElement("stop").attr({offset:i[0],"stop-color":c,"stop-opacity":p}).add(t);t.stops.push(s);});}x="url("+r.url+"#"+g+")",s.setAttribute(i,x),s.gradient=f,t.toString=function(){return x};}});}css(t){let e=this.styles,i={},s=this.element,r,o=!e;if(e&&w(t,function(t,s){e&&e[s]!==t&&(i[s]=t,o=!0);}),o){e&&(t=y(e,i)),null===t.width||"auto"===t.width?delete this.textWidth:"text"===s.nodeName.toLowerCase()&&t.width&&(r=this.textWidth=A(t.width)),y(this.styles,t),r&&!l&&this.renderer.forExport&&delete t.width;let o=M(t);s.namespaceURI===this.SVG_NS&&(["textOutline","textOverflow","width"].forEach(t=>o&&delete o[t]),o.color&&(o.fill=o.color)),f(s,o);}return this.added&&("text"===this.element.nodeName&&this.renderer.buildText(this),t.textOutline&&this.applyTextOutline(t.textOutline)),this}dashstyleSetter(t){let e,i=this["stroke-width"];if("inherit"===i&&(i=1),t=t&&t.toLowerCase()){let s=t.replace("shortdashdotdot","3,1,1,1,1,1,").replace("shortdashdot","3,1,1,1").replace("shortdot","1,1,").replace("shortdash","3,1,").replace("longdash","8,3,").replace(/dot/g,"1,3,").replace("dash","4,3,").replace(/,$/,"").split(",");for(e=s.length;e--;)s[e]=""+A(s[e])*T(i,NaN);t=s.join(",").replace(/NaN/g,"none"),this.element.setAttribute("stroke-dasharray",t);}}destroy(){let t=this,e=t.element||{},i=t.renderer,s=e.ownerSVGElement,r="SPAN"===e.nodeName&&t.parentGroup||void 0,o,n;if(e.onclick=e.onmouseout=e.onmouseover=e.onmousemove=e.point=null,a(t),t.clipPath&&s){let e=t.clipPath;[].forEach.call(s.querySelectorAll("[clip-path],[CLIP-PATH]"),function(t){t.getAttribute("clip-path").indexOf(e.element.id)>-1&&t.removeAttribute("clip-path");}),t.clipPath=e.destroy();}if(t.connector=t.connector?.destroy(),t.stops){for(n=0;n<t.stops.length;n++)t.stops[n].destroy();t.stops.length=0,t.stops=void 0;}for(t.safeRemoveChild(e);r&&r.div&&0===r.div.childNodes.length;)o=r.parentGroup,t.safeRemoveChild(r.div),delete r.div,r=o;t.alignTo&&x(i.alignedObjects,t),w(t,function(e,i){t[i]&&t[i].parentGroup===t&&t[i].destroy&&t[i].destroy(),delete t[i];});}dSetter(t,e,i){v(t)&&("string"==typeof t[0]&&(t=this.renderer.pathToSegments(t)),this.pathArray=t,t=t.reduce((t,e,i)=>e&&e.join?(i?t+" ":"")+e.join(" "):(e||"").toString(),"")),/(NaN| {2}|^$)/.test(t)&&(t="M 0 0"),this[e]!==t&&(i.setAttribute(e,t),this[e]=t);}fillSetter(t,e,i){"string"==typeof t?i.setAttribute(e,t):t&&this.complexColor(t,e,i);}hrefSetter(t,e,i){i.setAttributeNS("http://www.w3.org/1999/xlink",e,t);}getBBox(t,e){let i,s,r,o;let{alignValue:a,element:n,renderer:h,styles:l,textStr:d}=this,{cache:c,cacheKeys:p}=h,u=n.namespaceURI===this.SVG_NS,g=T(e,this.rotation,0),x=h.styledMode?n&&D.prototype.getStyle.call(n,"font-size"):l.fontSize;if(m(d)&&(-1===(o=d.toString()).indexOf("<")&&(o=o.replace(/[0-9]/g,"0")),o+=["",h.rootFontSize,x,g,this.textWidth,a,l.textOverflow,l.fontWeight].join(",")),o&&!t&&(i=c[o]),!i){if(u||h.forExport){try{r=this.fakeTS&&function(t){let e=n.querySelector(".highcharts-text-outline");e&&f(e,{display:t});},S(r)&&r("none"),i=n.getBBox?y({},n.getBBox()):{width:n.offsetWidth,height:n.offsetHeight,x:0,y:0},S(r)&&r("");}catch(t){}(!i||i.width<0)&&(i={x:0,y:0,width:0,height:0});}else i=this.htmlGetBBox();s=i.height,u&&(i.height=s=({"11px,17":14,"13px,20":16})[`${x||""},${Math.round(s)}`]||s),g&&(i=this.getRotatedBox(i,g));}if(o&&(""===d||i.height>0)){for(;p.length>250;)delete c[p.shift()];c[o]||p.push(o),c[o]=i;}return i}getRotatedBox(t,e){let{x:i,y:s,width:r,height:o}=t,{alignValue:a,translateY:h,rotationOriginX:l=0,rotationOriginY:d=0}=this,c={right:1,center:.5}[a||0]||0,p=Number(this.element.getAttribute("y")||0)-(h?0:s),u=e*n,g=(e-90)*n,f=Math.cos(u),m=Math.sin(u),x=r*f,y=r*m,b=Math.cos(g),v=Math.sin(g),[[S,k],[C,M]]=[l,d].map(t=>[t-t*f,t*m]),w=i+c*(r-x)+S+M+p*b,T=w+x,A=T-o*b,P=A-x,L=s+p-c*y-k+C+p*v,O=L+y,D=O-o*v,E=D-y,I=Math.min(w,T,A,P),j=Math.min(L,O,D,E),B=Math.max(w,T,A,P)-I,R=Math.max(L,O,D,E)-j;return {x:I,y:j,width:B,height:R}}getStyle(t){return c.getComputedStyle(this.element||this,"").getPropertyValue(t)}hasClass(t){return -1!==(""+this.attr("class")).split(" ").indexOf(t)}hide(){return this.attr({visibility:"hidden"})}htmlGetBBox(){return {height:0,width:0,x:0,y:0}}constructor(t,e){this.onEvents={},this.opacity=1,this.SVG_NS=d,this.element="span"===e||"body"===e?g(e):h.createElementNS(this.SVG_NS,e),this.renderer=t,this.styles={},b(this,"afterInit");}on(t,e){let{onEvents:i}=this;return i[t]&&i[t](),i[t]=p(this.element,t,e),this}opacitySetter(t,e,i){let s=Number(Number(t).toFixed(3));this.opacity=s,i.setAttribute(e,s);}removeClass(t){return this.attr("class",(""+this.attr("class")).replace(C(t)?RegExp(`(^| )${t}( |$)`):t," ").replace(/ +/g," ").trim())}removeTextOutline(){let t=this.element.querySelector("tspan.highcharts-text-outline");t&&this.safeRemoveChild(t);}safeRemoveChild(t){let e=t.parentNode;e&&e.removeChild(t);}setRadialReference(t){let e=this.element.gradient&&this.renderer.gradients[this.element.gradient];return this.element.radialReference=t,e&&e.radAttr&&e.animate(this.renderer.getRadialAttr(t,e.radAttr)),this}setTextPath(t,e){e=M(!0,{enabled:!0,attributes:{dy:-5,startOffset:"50%",textAnchor:"middle"}},e);let i=this.renderer.url,s=this.text||this,r=s.textPath,{attributes:o,enabled:a}=e;if(t=t||r&&r.path,r&&r.undo(),t&&a){let e=p(s,"afterModifyTree",e=>{if(t&&a){let r=t.attr("id");r||t.attr("id",r=O());let a={x:0,y:0};m(o.dx)&&(a.dx=o.dx,delete o.dx),m(o.dy)&&(a.dy=o.dy,delete o.dy),s.attr(a),this.attr({transform:""}),this.box&&(this.box=this.box.destroy());let n=e.nodes.slice(0);e.nodes.length=0,e.nodes[0]={tagName:"textPath",attributes:y(o,{"text-anchor":o.textAnchor,href:`${i}#${r}`}),children:n};}});s.textPath={path:t,undo:e};}else s.attr({dx:0,dy:0}),delete s.textPath;return this.added&&(s.textCache="",this.renderer.buildText(s)),this}shadow(t){let{renderer:e}=this,i=M(this.parentGroup?.rotation===90?{offsetX:-1,offsetY:-1}:{},k(t)?t:{}),s=e.shadowDefinition(i);return this.attr({filter:t?`url(${e.url}#${s})`:"none"})}show(t=!0){return this.attr({visibility:t?"inherit":"visible"})}"stroke-widthSetter"(t,e,i){this[e]=t,i.setAttribute(e,t);}strokeWidth(){if(!this.renderer.styledMode)return this["stroke-width"]||0;let t=this.getStyle("stroke-width"),e=0,i;return /px$/.test(t)?e=A(t):""!==t&&(u(i=h.createElementNS(d,"rect"),{width:t,"stroke-width":0}),this.element.parentNode.appendChild(i),e=i.getBBox().width,i.parentNode.removeChild(i)),e}symbolAttr(t){let e=this;D.symbolCustomAttribs.forEach(function(i){e[i]=T(t[i],e[i]);}),e.attr({d:e.renderer.symbols[e.symbolName](e.x,e.y,e.width,e.height,e)});}textSetter(t){t!==this.textStr&&(delete this.textPxLength,this.textStr=t,this.added&&this.renderer.buildText(this));}titleSetter(t){let e=this.element,i=e.getElementsByTagName("title")[0]||h.createElementNS(this.SVG_NS,"title");e.insertBefore?e.insertBefore(i,e.firstChild):e.appendChild(i),i.textContent=P(T(t,""),[/<[^>]*>/g,""]).replace(/&lt;/g,"<").replace(/&gt;/g,">");}toFront(){let t=this.element;return t.parentNode.appendChild(t),this}translate(t,e){return this.attr({translateX:t,translateY:e})}updateTransform(t="transform"){let{element:e,matrix:i,rotation:s=0,rotationOriginX:r,rotationOriginY:o,scaleX:a,scaleY:n,translateX:h=0,translateY:l=0}=this,d=["translate("+h+","+l+")"];m(i)&&d.push("matrix("+i.join(",")+")"),s&&(d.push("rotate("+s+" "+T(r,e.getAttribute("x"),0)+" "+T(o,e.getAttribute("y")||0)+")"),this.text?.element.tagName==="SPAN"&&this.text.attr({rotation:s,rotationOriginX:(r||0)-this.padding,rotationOriginY:(o||0)-this.padding})),(m(a)||m(n))&&d.push("scale("+T(a,1)+" "+T(n,1)+")"),d.length&&!(this.text||this).textPath&&e.setAttribute(t,d.join(" "));}visibilitySetter(t,e,i){"inherit"===t?i.removeAttribute(e):this[e]!==t&&i.setAttribute(e,t),this[e]=t;}xGetter(t){return "circle"===this.element.nodeName&&("x"===t?t="cx":"y"===t&&(t="cy")),this._defaultGetter(t)}zIndexSetter(t,e){let i=this.renderer,s=this.parentGroup,r=(s||i).element||i.box,o=this.element,a=r===i.box,n,h,l,d=!1,c,p=this.added,u;if(m(t)?(o.setAttribute("data-z-index",t),t=+t,this[e]===t&&(p=!1)):m(this[e])&&o.removeAttribute("data-z-index"),this[e]=t,p){for((t=this.zIndex)&&s&&(s.handleZ=!0),u=(n=r.childNodes).length-1;u>=0&&!d;u--)c=!m(l=(h=n[u]).getAttribute("data-z-index")),h!==o&&(t<0&&c&&!a&&!u?(r.insertBefore(o,n[u]),d=!0):(A(l)<=t||c&&(!m(t)||t>=0))&&(r.insertBefore(o,n[u+1]),d=!0));d||(r.insertBefore(o,n[a?3:0]),d=!0);}return d}}return D.symbolCustomAttribs=["anchorX","anchorY","clockwise","end","height","innerR","r","start","width","x","y"],D.prototype.strokeSetter=D.prototype.fillSetter,D.prototype.yGetter=D.prototype.xGetter,D.prototype.matrixSetter=D.prototype.rotationOriginXSetter=D.prototype.rotationOriginYSetter=D.prototype.rotationSetter=D.prototype.scaleXSetter=D.prototype.scaleYSetter=D.prototype.translateXSetter=D.prototype.translateYSetter=D.prototype.verticalAlignSetter=function(t,e){this[e]=t,this.doTransform=!0;},D}),i(e,"Core/Renderer/SVG/SVGLabel.js",[e["Core/Renderer/SVG/SVGElement.js"],e["Core/Utilities.js"]],function(t,e){let{defined:i,extend:s,isNumber:r,merge:o,pick:a,removeEvent:n}=e;class h extends t{constructor(t,e,i,s,r,o,a,n,l,d){let c;super(t,"g"),this.paddingLeftSetter=this.paddingSetter,this.paddingRightSetter=this.paddingSetter,this.textStr=e,this.x=i,this.y=s,this.anchorX=o,this.anchorY=a,this.baseline=l,this.className=d,this.addClass("button"===d?"highcharts-no-tooltip":"highcharts-label"),d&&this.addClass("highcharts-"+d),this.text=t.text(void 0,0,0,n).attr({zIndex:1}),"string"==typeof r&&((c=/^url\((.*?)\)$/.test(r))||this.renderer.symbols[r])&&(this.symbolKey=r),this.bBox=h.emptyBBox,this.padding=3,this.baselineOffset=0,this.needsBox=t.styledMode||c,this.deferredAttr={},this.alignFactor=0;}alignSetter(t){let e={left:0,center:.5,right:1}[t];e!==this.alignFactor&&(this.alignFactor=e,this.bBox&&r(this.xSetting)&&this.attr({x:this.xSetting}));}anchorXSetter(t,e){this.anchorX=t,this.boxAttr(e,Math.round(t)-this.getCrispAdjust()-this.xSetting);}anchorYSetter(t,e){this.anchorY=t,this.boxAttr(e,t-this.ySetting);}boxAttr(t,e){this.box?this.box.attr(t,e):this.deferredAttr[t]=e;}css(e){if(e){let t={};e=o(e),h.textProps.forEach(i=>{void 0!==e[i]&&(t[i]=e[i],delete e[i]);}),this.text.css(t),"fontSize"in t||"fontWeight"in t?this.updateTextPadding():("width"in t||"textOverflow"in t)&&this.updateBoxSize();}return t.prototype.css.call(this,e)}destroy(){n(this.element,"mouseenter"),n(this.element,"mouseleave"),this.text&&this.text.destroy(),this.box&&(this.box=this.box.destroy()),t.prototype.destroy.call(this);}fillSetter(t,e){t&&(this.needsBox=!0),this.fill=t,this.boxAttr(e,t);}getBBox(t,e){this.textStr&&0===this.bBox.width&&0===this.bBox.height&&this.updateBoxSize();let{padding:i,height:s=0,translateX:r=0,translateY:o=0,width:n=0}=this,h=a(this.paddingLeft,i),l=e??(this.rotation||0),d={width:n,height:s,x:r+this.bBox.x-h,y:o+this.bBox.y-i+this.baselineOffset};return l&&(d=this.getRotatedBox(d,l)),d}getCrispAdjust(){return this.renderer.styledMode&&this.box?this.box.strokeWidth()%2/2:(this["stroke-width"]?parseInt(this["stroke-width"],10):0)%2/2}heightSetter(t){this.heightSetting=t;}onAdd(){this.text.add(this),this.attr({text:a(this.textStr,""),x:this.x||0,y:this.y||0}),this.box&&i(this.anchorX)&&this.attr({anchorX:this.anchorX,anchorY:this.anchorY});}paddingSetter(t,e){r(t)?t!==this[e]&&(this[e]=t,this.updateTextPadding()):this[e]=void 0;}rSetter(t,e){this.boxAttr(e,t);}strokeSetter(t,e){this.stroke=t,this.boxAttr(e,t);}"stroke-widthSetter"(t,e){t&&(this.needsBox=!0),this["stroke-width"]=t,this.boxAttr(e,t);}"text-alignSetter"(t){this.textAlign=t;}textSetter(t){void 0!==t&&this.text.attr({text:t}),this.updateTextPadding();}updateBoxSize(){let t;let e=this.text,o={},a=this.padding,n=this.bBox=(!r(this.widthSetting)||!r(this.heightSetting)||this.textAlign)&&i(e.textStr)?e.getBBox(void 0,0):h.emptyBBox;this.width=this.getPaddedWidth(),this.height=(this.heightSetting||n.height||0)+2*a;let l=this.renderer.fontMetrics(e);if(this.baselineOffset=a+Math.min((this.text.firstLineMetrics||l).b,n.height||1/0),this.heightSetting&&(this.baselineOffset+=(this.heightSetting-l.h)/2),this.needsBox&&!e.textPath){if(!this.box){let t=this.box=this.symbolKey?this.renderer.symbol(this.symbolKey):this.renderer.rect();t.addClass(("button"===this.className?"":"highcharts-label-box")+(this.className?" highcharts-"+this.className+"-box":"")),t.add(this);}t=this.getCrispAdjust(),o.x=t,o.y=(this.baseline?-this.baselineOffset:0)+t,o.width=Math.round(this.width),o.height=Math.round(this.height),this.box.attr(s(o,this.deferredAttr)),this.deferredAttr={};}}updateTextPadding(){let t=this.text;if(!t.textPath){this.updateBoxSize();let e=this.baseline?0:this.baselineOffset,s=a(this.paddingLeft,this.padding);i(this.widthSetting)&&this.bBox&&("center"===this.textAlign||"right"===this.textAlign)&&(s+=({center:.5,right:1})[this.textAlign]*(this.widthSetting-this.bBox.width)),(s!==t.x||e!==t.y)&&(t.attr("x",s),t.hasBoxWidthChanged&&(this.bBox=t.getBBox(!0)),void 0!==e&&t.attr("y",e)),t.x=s,t.y=e;}}widthSetter(t){this.widthSetting=r(t)?t:void 0;}getPaddedWidth(){let t=this.padding,e=a(this.paddingLeft,t),i=a(this.paddingRight,t);return (this.widthSetting||this.bBox.width||0)+e+i}xSetter(t){this.x=t,this.alignFactor&&(t-=this.alignFactor*this.getPaddedWidth(),this["forceAnimate:x"]=!0),this.xSetting=Math.round(t),this.attr("translateX",this.xSetting);}ySetter(t){this.ySetting=this.y=Math.round(t),this.attr("translateY",this.ySetting);}}return h.emptyBBox={width:0,height:0,x:0,y:0},h.textProps=["color","direction","fontFamily","fontSize","fontStyle","fontWeight","lineHeight","textAlign","textDecoration","textOutline","textOverflow","whiteSpace","width"],h}),i(e,"Core/Renderer/SVG/Symbols.js",[e["Core/Utilities.js"]],function(t){let{defined:e,isNumber:i,pick:s}=t;function r(t,i,r,o,a){let n=[];if(a){let h=a.start||0,l=s(a.r,r),d=s(a.r,o||r),c=.001>Math.abs((a.end||0)-h-2*Math.PI),p=(a.end||0)-.001,u=a.innerR,g=s(a.open,c),f=Math.cos(h),m=Math.sin(h),x=Math.cos(p),y=Math.sin(p),b=s(a.longArc,p-h-Math.PI<.001?0:1),v=["A",l,d,0,b,s(a.clockwise,1),t+l*x,i+d*y];v.params={start:h,end:p,cx:t,cy:i},n.push(["M",t+l*f,i+d*m],v),e(u)&&((v=["A",u,u,0,b,e(a.clockwise)?1-a.clockwise:0,t+u*f,i+u*m]).params={start:p,end:h,cx:t,cy:i},n.push(g?["M",t+u*x,i+u*y]:["L",t+u*x,i+u*y],v)),g||n.push(["Z"]);}return n}function o(t,e,i,s,r){return r&&r.r?a(t,e,i,s,r):[["M",t,e],["L",t+i,e],["L",t+i,e+s],["L",t,e+s],["Z"]]}function a(t,e,i,s,r){let o=r?.r||0;return [["M",t+o,e],["L",t+i-o,e],["A",o,o,0,0,1,t+i,e+o],["L",t+i,e+s-o],["A",o,o,0,0,1,t+i-o,e+s],["L",t+o,e+s],["A",o,o,0,0,1,t,e+s-o],["L",t,e+o],["A",o,o,0,0,1,t+o,e],["Z"]]}return {arc:r,callout:function(t,e,s,r,o){let n=Math.min(o&&o.r||0,s,r),h=n+6,l=o&&o.anchorX,d=o&&o.anchorY||0,c=a(t,e,s,r,{r:n});if(!i(l)||l<s&&l>0&&d<r&&d>0)return c;if(t+l>s-h){if(d>e+h&&d<e+r-h)c.splice(3,1,["L",t+s,d-6],["L",t+s+6,d],["L",t+s,d+6],["L",t+s,e+r-n]);else if(l<s){let i=d<e+h,o=i?e:e+r;c.splice(i?2:5,0,["L",l,d],["L",t+s-n,o]);}else c.splice(3,1,["L",t+s,r/2],["L",l,d],["L",t+s,r/2],["L",t+s,e+r-n]);}else if(t+l<h){if(d>e+h&&d<e+r-h)c.splice(7,1,["L",t,d+6],["L",t-6,d],["L",t,d-6],["L",t,e+n]);else if(l>0){let i=d<e+h,s=i?e:e+r;c.splice(i?1:6,0,["L",l,d],["L",t+n,s]);}else c.splice(7,1,["L",t,r/2],["L",l,d],["L",t,r/2],["L",t,e+n]);}else d>r&&l<s-h?c.splice(5,1,["L",l+6,e+r],["L",l,e+r+6],["L",l-6,e+r],["L",t+n,e+r]):d<0&&l>h&&c.splice(1,1,["L",l-6,e],["L",l,e-6],["L",l+6,e],["L",s-n,e]);return c},circle:function(t,e,i,s){return r(t+i/2,e+s/2,i/2,s/2,{start:.5*Math.PI,end:2.5*Math.PI,open:!1})},diamond:function(t,e,i,s){return [["M",t+i/2,e],["L",t+i,e+s/2],["L",t+i/2,e+s],["L",t,e+s/2],["Z"]]},rect:o,roundedRect:a,square:o,triangle:function(t,e,i,s){return [["M",t+i/2,e],["L",t+i,e+s],["L",t,e+s],["Z"]]},"triangle-down":function(t,e,i,s){return [["M",t,e],["L",t+i,e],["L",t+i/2,e+s],["Z"]]}}}),i(e,"Core/Renderer/SVG/TextBuilder.js",[e["Core/Renderer/HTML/AST.js"],e["Core/Globals.js"],e["Core/Utilities.js"]],function(t,e,i){let{doc:s,SVG_NS:r,win:o}=e,{attr:a,extend:n,fireEvent:h,isString:l,objectEach:d,pick:c}=i;return class{constructor(t){let e=t.styles;this.renderer=t.renderer,this.svgElement=t,this.width=t.textWidth,this.textLineHeight=e&&e.lineHeight,this.textOutline=e&&e.textOutline,this.ellipsis=!!(e&&"ellipsis"===e.textOverflow),this.noWrap=!!(e&&"nowrap"===e.whiteSpace);}buildSVG(){let e=this.svgElement,i=e.element,r=e.renderer,o=c(e.textStr,"").toString(),a=-1!==o.indexOf("<"),n=i.childNodes,h=!e.added&&r.box,d=[o,this.ellipsis,this.noWrap,this.textLineHeight,this.textOutline,e.getStyle("font-size"),this.width].join(",");if(d!==e.textCache){e.textCache=d,delete e.actualWidth;for(let t=n.length;t--;)i.removeChild(n[t]);if(a||this.ellipsis||this.width||e.textPath||-1!==o.indexOf(" ")&&(!this.noWrap||/<br.*?>/g.test(o))){if(""!==o){h&&h.appendChild(i);let s=new t(o);this.modifyTree(s.nodes),s.addToDOM(i),this.modifyDOM(),this.ellipsis&&-1!==(i.textContent||"").indexOf("…")&&e.attr("title",this.unescapeEntities(e.textStr||"",["&lt;","&gt;"])),h&&h.removeChild(i);}}else i.appendChild(s.createTextNode(this.unescapeEntities(o)));l(this.textOutline)&&e.applyTextOutline&&e.applyTextOutline(this.textOutline);}}modifyDOM(){let t;let e=this.svgElement,i=a(e.element,"x");for(e.firstLineMetrics=void 0;t=e.element.firstChild;)if(/^[\s\u200B]*$/.test(t.textContent||" "))e.element.removeChild(t);else break;[].forEach.call(e.element.querySelectorAll("tspan.highcharts-br"),(t,s)=>{t.nextSibling&&t.previousSibling&&(0===s&&1===t.previousSibling.nodeType&&(e.firstLineMetrics=e.renderer.fontMetrics(t.previousSibling)),a(t,{dy:this.getLineHeight(t.nextSibling),x:i}));});let n=this.width||0;if(!n)return;let h=(t,o)=>{let h=t.textContent||"",l=h.replace(/([^\^])-/g,"$1- ").split(" "),d=!this.noWrap&&(l.length>1||e.element.childNodes.length>1),c=this.getLineHeight(o),p=0,u=e.actualWidth;if(this.ellipsis)h&&this.truncate(t,h,void 0,0,Math.max(0,n-.8*c),(t,e)=>t.substring(0,e)+"…");else if(d){let h=[],d=[];for(;o.firstChild&&o.firstChild!==t;)d.push(o.firstChild),o.removeChild(o.firstChild);for(;l.length;)l.length&&!this.noWrap&&p>0&&(h.push(t.textContent||""),t.textContent=l.join(" ").replace(/- /g,"-")),this.truncate(t,void 0,l,0===p&&u||0,n,(t,e)=>l.slice(0,e).join(" ").replace(/- /g,"-")),u=e.actualWidth,p++;d.forEach(e=>{o.insertBefore(e,t);}),h.forEach(e=>{o.insertBefore(s.createTextNode(e),t);let n=s.createElementNS(r,"tspan");n.textContent="​",a(n,{dy:c,x:i}),o.insertBefore(n,t);});}},l=t=>{[].slice.call(t.childNodes).forEach(i=>{i.nodeType===o.Node.TEXT_NODE?h(i,t):(-1!==i.className.baseVal.indexOf("highcharts-br")&&(e.actualWidth=0),l(i));});};l(e.element);}getLineHeight(t){let e=t.nodeType===o.Node.TEXT_NODE?t.parentElement:t;return this.textLineHeight?parseInt(this.textLineHeight.toString(),10):this.renderer.fontMetrics(e||this.svgElement.element).h}modifyTree(t){let e=(i,s)=>{let{attributes:r={},children:o,style:a={},tagName:h}=i,l=this.renderer.styledMode;if("b"===h||"strong"===h?l?r.class="highcharts-strong":a.fontWeight="bold":("i"===h||"em"===h)&&(l?r.class="highcharts-emphasized":a.fontStyle="italic"),a&&a.color&&(a.fill=a.color),"br"===h){r.class="highcharts-br",i.textContent="​";let e=t[s+1];e&&e.textContent&&(e.textContent=e.textContent.replace(/^ +/gm,""));}else "a"===h&&o&&o.some(t=>"#text"===t.tagName)&&(i.children=[{children:o,tagName:"tspan"}]);"#text"!==h&&"a"!==h&&(i.tagName="tspan"),n(i,{attributes:r,style:a}),o&&o.filter(t=>"#text"!==t.tagName).forEach(e);};t.forEach(e),h(this.svgElement,"afterModifyTree",{nodes:t});}truncate(t,e,i,s,r,o){let a,n;let h=this.svgElement,{rotation:l}=h,d=[],c=i?1:0,p=(e||i||"").length,u=p,g=function(e,r){let o=r||e,a=t.parentNode;if(a&&void 0===d[o]&&a.getSubStringLength)try{d[o]=s+a.getSubStringLength(0,i?o+1:o);}catch(t){}return d[o]};if(h.rotation=0,s+(n=g(t.textContent.length))>r){for(;c<=p;)u=Math.ceil((c+p)/2),i&&(a=o(i,u)),n=g(u,a&&a.length-1),c===p?c=p+1:n>r?p=u-1:c=u;0===p?t.textContent="":e&&p===e.length-1||(t.textContent=a||o(e||i,u));}i&&i.splice(0,u),h.actualWidth=n,h.rotation=l;}unescapeEntities(t,e){return d(this.renderer.escapes,function(i,s){e&&-1!==e.indexOf(i)||(t=t.toString().replace(RegExp(i,"g"),s));}),t}}}),i(e,"Core/Renderer/SVG/SVGRenderer.js",[e["Core/Renderer/HTML/AST.js"],e["Core/Color/Color.js"],e["Core/Globals.js"],e["Core/Renderer/RendererRegistry.js"],e["Core/Renderer/SVG/SVGElement.js"],e["Core/Renderer/SVG/SVGLabel.js"],e["Core/Renderer/SVG/Symbols.js"],e["Core/Renderer/SVG/TextBuilder.js"],e["Core/Utilities.js"]],function(t,e,i,s,r,o,a,n,h){let l;let{charts:d,deg2rad:c,doc:p,isFirefox:u,isMS:g,isWebKit:f,noop:m,SVG_NS:x,symbolSizes:y,win:b}=i,{addEvent:v,attr:S,createElement:k,css:C,defined:M,destroyObjectProperties:w,extend:T,isArray:A,isNumber:P,isObject:L,isString:O,merge:D,pick:E,pInt:I,replaceNested:j,uniqueKey:B}=h;class R{constructor(t,e,i,s,r,o,a){let n,h;let l=this.createElement("svg").attr({version:"1.1",class:"highcharts-root"}),d=l.element;a||l.css(this.getStyle(s||{})),t.appendChild(d),S(t,"dir","ltr"),-1===t.innerHTML.indexOf("xmlns")&&S(d,"xmlns",this.SVG_NS),this.box=d,this.boxWrapper=l,this.alignedObjects=[],this.url=this.getReferenceURL(),this.createElement("desc").add().element.appendChild(p.createTextNode("Created with Highcharts 11.4.1")),this.defs=this.createElement("defs").add(),this.allowHTML=o,this.forExport=r,this.styledMode=a,this.gradients={},this.cache={},this.cacheKeys=[],this.imgCount=0,this.rootFontSize=l.getStyle("font-size"),this.setSize(e,i,!1),u&&t.getBoundingClientRect&&((n=function(){C(t,{left:0,top:0}),h=t.getBoundingClientRect(),C(t,{left:Math.ceil(h.left)-h.left+"px",top:Math.ceil(h.top)-h.top+"px"});})(),this.unSubPixelFix=v(b,"resize",n));}definition(e){return new t([e]).addToDOM(this.defs.element)}getReferenceURL(){if((u||f)&&p.getElementsByTagName("base").length){if(!M(l)){let e=B(),i=new t([{tagName:"svg",attributes:{width:8,height:8},children:[{tagName:"defs",children:[{tagName:"clipPath",attributes:{id:e},children:[{tagName:"rect",attributes:{width:4,height:4}}]}]},{tagName:"rect",attributes:{id:"hitme",width:8,height:8,"clip-path":`url(#${e})`,fill:"rgba(0,0,0,0.001)"}}]}]).addToDOM(p.body);C(i,{position:"fixed",top:0,left:0,zIndex:9e5});let s=p.elementFromPoint(6,6);l="hitme"===(s&&s.id),p.body.removeChild(i);}if(l)return j(b.location.href.split("#")[0],[/<[^>]*>/g,""],[/([\('\)])/g,"\\$1"],[/ /g,"%20"])}return ""}getStyle(t){return this.style=T({fontFamily:"Helvetica, Arial, sans-serif",fontSize:"1rem"},t),this.style}setStyle(t){this.boxWrapper.css(this.getStyle(t));}isHidden(){return !this.boxWrapper.getBBox().width}destroy(){let t=this.defs;return this.box=null,this.boxWrapper=this.boxWrapper.destroy(),w(this.gradients||{}),this.gradients=null,this.defs=t.destroy(),this.unSubPixelFix&&this.unSubPixelFix(),this.alignedObjects=null,null}createElement(t){return new this.Element(this,t)}getRadialAttr(t,e){return {cx:t[0]-t[2]/2+(e.cx||0)*t[2],cy:t[1]-t[2]/2+(e.cy||0)*t[2],r:(e.r||0)*t[2]}}shadowDefinition(t){let e=[`highcharts-drop-shadow-${this.chartIndex}`,...Object.keys(t).map(e=>`${e}-${t[e]}`)].join("-").toLowerCase().replace(/[^a-z0-9\-]/g,""),i=D({color:"#000000",offsetX:1,offsetY:1,opacity:.15,width:5},t);return this.defs.element.querySelector(`#${e}`)||this.definition({tagName:"filter",attributes:{id:e,filterUnits:i.filterUnits},children:[{tagName:"feDropShadow",attributes:{dx:i.offsetX,dy:i.offsetY,"flood-color":i.color,"flood-opacity":Math.min(5*i.opacity,1),stdDeviation:i.width/2}}]}),e}buildText(t){new n(t).buildSVG();}getContrast(t){let i=e.parse(t).rgba.map(t=>{let e=t/255;return e<=.03928?e/12.92:Math.pow((e+.055)/1.055,2.4)}),s=.2126*i[0]+.7152*i[1]+.0722*i[2];return 1.05/(s+.05)>(s+.05)/.05?"#FFFFFF":"#000000"}button(e,i,s,r,o={},a,n,h,l,d){let c,p,u;let f=this.label(e,i,s,l,void 0,void 0,d,void 0,"button"),m=this.styledMode,x=o.states||{},y=0;o=D(o),delete o.states;let b=D({color:"#333333",cursor:"pointer",fontSize:"0.8em",fontWeight:"normal"},o.style);delete o.style;let S=t.filterUserAttributes(o);return f.attr(D({padding:8,r:2},S)),m||(S=D({fill:"#f7f7f7",stroke:"#cccccc","stroke-width":1},S),c=(a=D(S,{fill:"#e6e6e6"},t.filterUserAttributes(a||x.hover||{}))).style,delete a.style,p=(n=D(S,{fill:"#e6e9ff",style:{color:"#000000",fontWeight:"bold"}},t.filterUserAttributes(n||x.select||{}))).style,delete n.style,u=(h=D(S,{style:{color:"#cccccc"}},t.filterUserAttributes(h||x.disabled||{}))).style,delete h.style),v(f.element,g?"mouseover":"mouseenter",function(){3!==y&&f.setState(1);}),v(f.element,g?"mouseout":"mouseleave",function(){3!==y&&f.setState(y);}),f.setState=function(t){if(1!==t&&(f.state=y=t),f.removeClass(/highcharts-button-(normal|hover|pressed|disabled)/).addClass("highcharts-button-"+["normal","hover","pressed","disabled"][t||0]),!m){f.attr([S,a,n,h][t||0]);let e=[b,c,p,u][t||0];L(e)&&f.css(e);}},!m&&(f.attr(S).css(T({cursor:"default"},b)),d&&f.text.css({pointerEvents:"none"})),f.on("touchstart",t=>t.stopPropagation()).on("click",function(t){3!==y&&r.call(f,t);})}crispLine(t,e,i="round"){let s=t[0],r=t[1];return M(s[1])&&s[1]===r[1]&&(s[1]=r[1]=Math[i](s[1])-e%2/2),M(s[2])&&s[2]===r[2]&&(s[2]=r[2]=Math[i](s[2])+e%2/2),t}path(t){let e=this.styledMode?{}:{fill:"none"};return A(t)?e.d=t:L(t)&&T(e,t),this.createElement("path").attr(e)}circle(t,e,i){let s=L(t)?t:void 0===t?{}:{x:t,y:e,r:i},r=this.createElement("circle");return r.xSetter=r.ySetter=function(t,e,i){i.setAttribute("c"+e,t);},r.attr(s)}arc(t,e,i,s,r,o){let a;L(t)?(e=(a=t).y,i=a.r,s=a.innerR,r=a.start,o=a.end,t=a.x):a={innerR:s,start:r,end:o};let n=this.symbol("arc",t,e,i,i,a);return n.r=i,n}rect(t,e,i,s,r,o){let a=L(t)?t:void 0===t?{}:{x:t,y:e,r,width:Math.max(i||0,0),height:Math.max(s||0,0)},n=this.createElement("rect");return this.styledMode||(void 0!==o&&(a["stroke-width"]=o,T(a,n.crisp(a))),a.fill="none"),n.rSetter=function(t,e,i){n.r=t,S(i,{rx:t,ry:t});},n.rGetter=function(){return n.r||0},n.attr(a)}roundedRect(t){return this.symbol("roundedRect").attr(t)}setSize(t,e,i){this.width=t,this.height=e,this.boxWrapper.animate({width:t,height:e},{step:function(){this.attr({viewBox:"0 0 "+this.attr("width")+" "+this.attr("height")});},duration:E(i,!0)?void 0:0}),this.alignElements();}g(t){let e=this.createElement("g");return t?e.attr({class:"highcharts-"+t}):e}image(t,e,i,s,r,o){let a={preserveAspectRatio:"none"};P(e)&&(a.x=e),P(i)&&(a.y=i),P(s)&&(a.width=s),P(r)&&(a.height=r);let n=this.createElement("image").attr(a),h=function(e){n.attr({href:t}),o.call(n,e);};if(o){n.attr({href:"data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="});let e=new b.Image;v(e,"load",h),e.src=t,e.complete&&h({});}else n.attr({href:t});return n}symbol(t,e,i,s,r,o){let a,n,h,l;let c=this,u=/^url\((.*?)\)$/,g=u.test(t),f=!g&&(this.symbols[t]?t:"circle"),m=f&&this.symbols[f];if(m)"number"==typeof e&&(n=m.call(this.symbols,Math.round(e||0),Math.round(i||0),s||0,r||0,o)),a=this.path(n),c.styledMode||a.attr("fill","none"),T(a,{symbolName:f||void 0,x:e,y:i,width:s,height:r}),o&&T(a,o);else if(g){h=t.match(u)[1];let s=a=this.image(h);s.imgwidth=E(o&&o.width,y[h]&&y[h].width),s.imgheight=E(o&&o.height,y[h]&&y[h].height),l=t=>t.attr({width:t.width,height:t.height}),["width","height"].forEach(t=>{s[`${t}Setter`]=function(t,e){this[e]=t;let{alignByTranslate:i,element:s,width:r,height:a,imgwidth:n,imgheight:h}=this,l="width"===e?n:h,d=1;o&&"within"===o.backgroundSize&&r&&a&&n&&h?(d=Math.min(r/n,a/h),S(s,{width:Math.round(n*d),height:Math.round(h*d)})):s&&l&&s.setAttribute(e,l),!i&&n&&h&&this.translate(((r||0)-n*d)/2,((a||0)-h*d)/2);};}),M(e)&&s.attr({x:e,y:i}),s.isImg=!0,M(s.imgwidth)&&M(s.imgheight)?l(s):(s.attr({width:0,height:0}),k("img",{onload:function(){let t=d[c.chartIndex];0===this.width&&(C(this,{position:"absolute",top:"-999em"}),p.body.appendChild(this)),y[h]={width:this.width,height:this.height},s.imgwidth=this.width,s.imgheight=this.height,s.element&&l(s),this.parentNode&&this.parentNode.removeChild(this),c.imgCount--,c.imgCount||!t||t.hasLoaded||t.onload();},src:h}),this.imgCount++);}return a}clipRect(t,e,i,s){return this.rect(t,e,i,s,0)}text(t,e,i,s){let r={};if(s&&(this.allowHTML||!this.forExport))return this.html(t,e,i);r.x=Math.round(e||0),i&&(r.y=Math.round(i)),M(t)&&(r.text=t);let o=this.createElement("text").attr(r);return s&&(!this.forExport||this.allowHTML)||(o.xSetter=function(t,e,i){let s=i.getElementsByTagName("tspan"),r=i.getAttribute(e);for(let i=0,o;i<s.length;i++)(o=s[i]).getAttribute(e)===r&&o.setAttribute(e,t);i.setAttribute(e,t);}),o}fontMetrics(t){let e=I(r.prototype.getStyle.call(t,"font-size")||0),i=e<24?e+3:Math.round(1.2*e),s=Math.round(.8*i);return {h:i,b:s,f:e}}rotCorr(t,e,i){let s=t;return e&&i&&(s=Math.max(s*Math.cos(e*c),4)),{x:-t/3*Math.sin(e*c),y:s}}pathToSegments(t){let e=[],i=[],s={A:8,C:7,H:2,L:3,M:3,Q:5,S:5,T:3,V:2};for(let r=0;r<t.length;r++)O(i[0])&&P(t[r])&&i.length===s[i[0].toUpperCase()]&&t.splice(r,0,i[0].replace("M","L").replace("m","l")),"string"==typeof t[r]&&(i.length&&e.push(i.slice(0)),i.length=0),i.push(t[r]);return e.push(i.slice(0)),e}label(t,e,i,s,r,a,n,h,l){return new o(this,t,e,i,s,r,a,n,h,l)}alignElements(){this.alignedObjects.forEach(t=>t.align());}}return T(R.prototype,{Element:r,SVG_NS:x,escapes:{"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"},symbols:a,draw:m}),s.registerRendererType("svg",R,!0),R}),i(e,"Core/Renderer/HTML/HTMLElement.js",[e["Core/Renderer/HTML/AST.js"],e["Core/Globals.js"],e["Core/Renderer/SVG/SVGElement.js"],e["Core/Utilities.js"]],function(t,e,i,s){let{composed:r}=e,{attr:o,css:a,createElement:n,defined:h,extend:l,pInt:d,pushUnique:c}=s;function p(t,e,s){let r=this.div?.style||s.style;i.prototype[`${e}Setter`].call(this,t,e,s),r&&(r[e]=t);}let u=(t,e)=>{if(!t.div){let s=o(t.element,"class"),r=t.css,a=n("div",s?{className:s}:void 0,{position:"absolute",left:`${t.translateX||0}px`,top:`${t.translateY||0}px`,...t.styles,display:t.display,opacity:t.opacity,visibility:t.visibility},t.parentGroup?.div||e);t.classSetter=(t,e,i)=>{i.setAttribute("class",t),a.className=t;},t.translateXSetter=t.translateYSetter=(e,i)=>{t[i]=e,a.style["translateX"===i?"left":"top"]=`${e}px`,t.doTransform=!0;},t.opacitySetter=t.visibilitySetter=p,t.css=e=>(r.call(t,e),e.cursor&&(a.style.cursor=e.cursor),e.pointerEvents&&(a.style.pointerEvents=e.pointerEvents),t),t.on=function(){return i.prototype.on.apply({element:a,onEvents:t.onEvents},arguments),t},t.div=a;}return t.div};class g extends i{static compose(t){c(r,this.compose)&&(t.prototype.html=function(t,e,i){return new g(this,"span").attr({text:t,x:Math.round(e),y:Math.round(i)})});}constructor(t,e){super(t,e),this.css({position:"absolute",...t.styledMode?{}:{fontFamily:t.style.fontFamily,fontSize:t.style.fontSize}}),this.element.style.whiteSpace="nowrap";}getSpanCorrection(t,e,i){this.xCorr=-t*i,this.yCorr=-e;}css(t){let e;let{element:i}=this,s="SPAN"===i.tagName&&t&&"width"in t,r=s&&t.width;return s&&(delete t.width,this.textWidth=d(r)||void 0,e=!0),t?.textOverflow==="ellipsis"&&(t.whiteSpace="nowrap",t.overflow="hidden"),l(this.styles,t),a(i,t),e&&this.updateTransform(),this}htmlGetBBox(){let{element:t}=this;return {x:t.offsetLeft,y:t.offsetTop,width:t.offsetWidth,height:t.offsetHeight}}updateTransform(){if(!this.added){this.alignOnAdd=!0;return}let{element:t,renderer:e,rotation:i,rotationOriginX:s,rotationOriginY:r,styles:o,textAlign:n="left",textWidth:l,translateX:d=0,translateY:c=0,x:p=0,y:u=0}=this,g=o.whiteSpace;if(a(t,{marginLeft:`${d}px`,marginTop:`${c}px`}),"SPAN"===t.tagName){let o=[i,n,t.innerHTML,l,this.textAlign].join(","),d=-(this.parentGroup?.padding*1)||0,c,f=!1;if(l!==this.oldTextWidth){let e=this.textPxLength?this.textPxLength:(a(t,{width:"",whiteSpace:g||"nowrap"}),t.offsetWidth),s=l||0;(s>this.oldTextWidth||e>s)&&(/[ \-]/.test(t.textContent||t.innerText)||"ellipsis"===t.style.textOverflow)&&(a(t,{width:e>s||i?l+"px":"auto",display:"block",whiteSpace:g||"normal"}),this.oldTextWidth=l,f=!0);}this.hasBoxWidthChanged=f,o!==this.cTT&&(c=e.fontMetrics(t).b,h(i)&&(i!==(this.oldRotation||0)||n!==this.oldAlign)&&this.setSpanRotation(i,d,d),this.getSpanCorrection(!h(i)&&this.textPxLength||t.offsetWidth,c,{left:0,center:.5,right:1}[n]));let{xCorr:m=0,yCorr:x=0}=this,y=(s??p)-m-p-d,b=(r??u)-x-u-d;a(t,{left:`${p+m}px`,top:`${u+x}px`,transformOrigin:`${y}px ${b}px`}),this.cTT=o,this.oldRotation=i,this.oldAlign=n;}}setSpanRotation(t,e,i){a(this.element,{transform:`rotate(${t}deg)`,transformOrigin:`${e}% ${i}px`});}add(t){let e;let i=this.renderer.box.parentNode,s=[];if(this.parentGroup=t,t&&!(e=t.div)){let r=t;for(;r;)s.push(r),r=r.parentGroup;for(let t of s.reverse())e=u(t,i);}return (e||i).appendChild(this.element),this.added=!0,this.alignOnAdd&&this.updateTransform(),this}textSetter(e){e!==this.textStr&&(delete this.bBox,delete this.oldTextWidth,t.setElementHTML(this.element,e??""),this.textStr=e,this.doTransform=!0);}alignSetter(t){this.alignValue=this.textAlign=t,this.doTransform=!0;}xSetter(t,e){this[e]=t,this.doTransform=!0;}}let f=g.prototype;return f.visibilitySetter=f.opacitySetter=p,f.ySetter=f.rotationSetter=f.rotationOriginXSetter=f.rotationOriginYSetter=f.xSetter,g}),i(e,"Core/Axis/AxisDefaults.js",[],function(){var t,e;return (e=t||(t={})).xAxis={alignTicks:!0,allowDecimals:void 0,panningEnabled:!0,zIndex:2,zoomEnabled:!0,dateTimeLabelFormats:{millisecond:{main:"%H:%M:%S.%L",range:!1},second:{main:"%H:%M:%S",range:!1},minute:{main:"%H:%M",range:!1},hour:{main:"%H:%M",range:!1},day:{main:"%e %b"},week:{main:"%e %b"},month:{main:"%b '%y"},year:{main:"%Y"}},endOnTick:!1,gridLineDashStyle:"Solid",gridZIndex:1,labels:{autoRotationLimit:80,distance:15,enabled:!0,indentation:10,overflow:"justify",padding:5,reserveSpace:void 0,rotation:void 0,staggerLines:0,step:0,useHTML:!1,zIndex:7,style:{color:"#333333",cursor:"default",fontSize:"0.8em"}},maxPadding:.01,minorGridLineDashStyle:"Solid",minorTickLength:2,minorTickPosition:"outside",minorTicksPerMajor:5,minPadding:.01,offset:void 0,reversed:void 0,reversedStacks:!1,showEmpty:!0,showFirstLabel:!0,showLastLabel:!0,startOfWeek:1,startOnTick:!1,tickLength:10,tickPixelInterval:100,tickmarkPlacement:"between",tickPosition:"outside",title:{align:"middle",useHTML:!1,x:0,y:0,style:{color:"#666666",fontSize:"0.8em"}},type:"linear",uniqueNames:!0,visible:!0,minorGridLineColor:"#f2f2f2",minorGridLineWidth:1,minorTickColor:"#999999",lineColor:"#333333",lineWidth:1,gridLineColor:"#e6e6e6",gridLineWidth:void 0,tickColor:"#333333"},e.yAxis={reversedStacks:!0,endOnTick:!0,maxPadding:.05,minPadding:.05,tickPixelInterval:72,showLastLabel:!0,labels:{x:void 0},startOnTick:!0,title:{text:"Values"},stackLabels:{animation:{},allowOverlap:!1,enabled:!1,crop:!0,overflow:"justify",formatter:function(){let{numberFormatter:t}=this.axis.chart;return t(this.total||0,-1)},style:{color:"#000000",fontSize:"0.7em",fontWeight:"bold",textOutline:"1px contrast"}},gridLineWidth:1,lineWidth:0},t}),i(e,"Core/Foundation.js",[e["Core/Utilities.js"]],function(t){var e;let{addEvent:i,isFunction:s,objectEach:r,removeEvent:o}=t;return (e||(e={})).registerEventOptions=function(t,e){t.eventOptions=t.eventOptions||{},r(e.events,function(e,r){t.eventOptions[r]!==e&&(t.eventOptions[r]&&(o(t,r,t.eventOptions[r]),delete t.eventOptions[r]),s(e)&&(t.eventOptions[r]=e,i(t,r,e,{order:0})));});},e}),i(e,"Core/Axis/Tick.js",[e["Core/Templating.js"],e["Core/Globals.js"],e["Core/Utilities.js"]],function(t,e,i){let{deg2rad:s}=e,{clamp:r,correctFloat:o,defined:a,destroyObjectProperties:n,extend:h,fireEvent:l,isNumber:d,merge:c,objectEach:p,pick:u}=i;return class{constructor(t,e,i,s,r){this.isNew=!0,this.isNewLabel=!0,this.axis=t,this.pos=e,this.type=i||"",this.parameters=r||{},this.tickmarkOffset=this.parameters.tickmarkOffset,this.options=this.parameters.options,l(this,"init"),i||s||this.addLabel();}addLabel(){let e=this,i=e.axis,s=i.options,r=i.chart,n=i.categories,c=i.logarithmic,p=i.names,g=e.pos,f=u(e.options&&e.options.labels,s.labels),m=i.tickPositions,x=g===m[0],y=g===m[m.length-1],b=(!f.step||1===f.step)&&1===i.tickInterval,v=m.info,S=e.label,k,C,M,w=this.parameters.category||(n?u(n[g],p[g],g):g);c&&d(w)&&(w=o(c.lin2log(w))),i.dateTime&&(v?k=(C=r.time.resolveDTLFormat(s.dateTimeLabelFormats[!s.grid&&v.higherRanks[g]||v.unitName])).main:d(w)&&(k=i.dateTime.getXDateFormat(w,s.dateTimeLabelFormats||{}))),e.isFirst=x,e.isLast=y;let T={axis:i,chart:r,dateTimeLabelFormat:k,isFirst:x,isLast:y,pos:g,tick:e,tickPositionInfo:v,value:w};l(this,"labelFormat",T);let A=e=>f.formatter?f.formatter.call(e,e):f.format?(e.text=i.defaultLabelFormatter.call(e),t.format(f.format,e,r)):i.defaultLabelFormatter.call(e),P=A.call(T,T),L=C&&C.list;L?e.shortenLabel=function(){for(M=0;M<L.length;M++)if(h(T,{dateTimeLabelFormat:L[M]}),S.attr({text:A.call(T,T)}),S.getBBox().width<i.getSlotWidth(e)-2*f.padding)return;S.attr({text:""});}:e.shortenLabel=void 0,b&&i._addedPlotLB&&e.moveLabel(P,f),a(S)||e.movedLabel?S&&S.textStr!==P&&!b&&(!S.textWidth||f.style.width||S.styles.width||S.css({width:null}),S.attr({text:P}),S.textPxLength=S.getBBox().width):(e.label=S=e.createLabel(P,f),e.rotation=0);}createLabel(t,e,i){let s=this.axis,r=s.chart,o=a(t)&&e.enabled?r.renderer.text(t,i?.x,i?.y,e.useHTML).add(s.labelGroup):void 0;return o&&(r.styledMode||o.css(c(e.style)),o.textPxLength=o.getBBox().width),o}destroy(){n(this,this.axis);}getPosition(t,e,i,s){let a=this.axis,n=a.chart,h=s&&n.oldChartHeight||n.chartHeight,d={x:t?o(a.translate(e+i,void 0,void 0,s)+a.transB):a.left+a.offset+(a.opposite?(s&&n.oldChartWidth||n.chartWidth)-a.right-a.left:0),y:t?h-a.bottom+a.offset-(a.opposite?a.height:0):o(h-a.translate(e+i,void 0,void 0,s)-a.transB)};return d.y=r(d.y,-1e5,1e5),l(this,"afterGetPosition",{pos:d}),d}getLabelPosition(t,e,i,r,o,n,h,d){let c,p;let g=this.axis,f=g.transA,m=g.isLinked&&g.linkedParent?g.linkedParent.reversed:g.reversed,x=g.staggerLines,y=g.tickRotCorr||{x:0,y:0},b=r||g.reserveSpaceDefault?0:-g.labelOffset*("center"===g.labelAlign?.5:1),v=o.distance,S={};return c=0===g.side?i.rotation?-v:-i.getBBox().height:2===g.side?y.y+v:Math.cos(i.rotation*s)*(y.y-i.getBBox(!1,0).height/2),a(o.y)&&(c=0===g.side&&g.horiz?o.y+c:o.y),t=t+u(o.x,[0,1,0,-1][g.side]*v)+b+y.x-(n&&r?n*f*(m?-1:1):0),e=e+c-(n&&!r?n*f*(m?1:-1):0),x&&(p=h/(d||1)%x,g.opposite&&(p=x-p-1),e+=g.labelOffset/x*p),S.x=t,S.y=Math.round(e),l(this,"afterGetLabelPosition",{pos:S,tickmarkOffset:n,index:h}),S}getLabelSize(){return this.label?this.label.getBBox()[this.axis.horiz?"height":"width"]:0}getMarkPath(t,e,i,s,r,o){return o.crispLine([["M",t,e],["L",t+(r?0:-i),e+(r?i:0)]],s)}handleOverflow(t){let e=this.axis,i=e.options.labels,r=t.x,o=e.chart.chartWidth,a=e.chart.spacing,n=u(e.labelLeft,Math.min(e.pos,a[3])),h=u(e.labelRight,Math.max(e.isRadial?0:e.pos+e.len,o-a[1])),l=this.label,d=this.rotation,c={left:0,center:.5,right:1}[e.labelAlign||l.attr("align")],p=l.getBBox().width,g=e.getSlotWidth(this),f={},m=g,x=1,y,b,v;d||"justify"!==i.overflow?d<0&&r-c*p<n?v=Math.round(r/Math.cos(d*s)-n):d>0&&r+c*p>h&&(v=Math.round((o-r)/Math.cos(d*s))):(y=r-c*p,b=r+(1-c)*p,y<n?m=t.x+m*(1-c)-n:b>h&&(m=h-t.x+m*c,x=-1),(m=Math.min(g,m))<g&&"center"===e.labelAlign&&(t.x+=x*(g-m-c*(g-Math.min(p,m)))),(p>m||e.autoRotation&&(l.styles||{}).width)&&(v=m)),v&&(this.shortenLabel?this.shortenLabel():(f.width=Math.floor(v)+"px",(i.style||{}).textOverflow||(f.textOverflow="ellipsis"),l.css(f)));}moveLabel(t,e){let i=this,s=i.label,r=i.axis,o=!1,a;s&&s.textStr===t?(i.movedLabel=s,o=!0,delete i.label):p(r.ticks,function(e){o||e.isNew||e===i||!e.label||e.label.textStr!==t||(i.movedLabel=e.label,o=!0,e.labelPos=i.movedLabel.xy,delete e.label);}),!o&&(i.labelPos||s)&&(a=i.labelPos||s.xy,i.movedLabel=i.createLabel(t,e,a),i.movedLabel&&i.movedLabel.attr({opacity:0}));}render(t,e,i){let s=this.axis,r=s.horiz,a=this.pos,n=u(this.tickmarkOffset,s.tickmarkOffset),h=this.getPosition(r,a,n,e),d=h.x,c=h.y,p=s.pos,g=p+s.len,f=r&&d===g||!r&&c===p?-1:1,m=r?d:c;!s.chart.polar&&this.isNew&&(o(m)<p||m>g)&&(i=0);let x=u(i,this.label&&this.label.newOpacity,1);i=u(i,1),this.isActive=!0,this.renderGridLine(e,i,f),this.renderMark(h,i,f),this.renderLabel(h,e,x,t),this.isNew=!1,l(this,"afterRender");}renderGridLine(t,e,i){let s=this.axis,r=s.options,o={},a=this.pos,n=this.type,h=u(this.tickmarkOffset,s.tickmarkOffset),l=s.chart.renderer,d=this.gridLine,c,p=r.gridLineWidth,g=r.gridLineColor,f=r.gridLineDashStyle;"minor"===this.type&&(p=r.minorGridLineWidth,g=r.minorGridLineColor,f=r.minorGridLineDashStyle),d||(s.chart.styledMode||(o.stroke=g,o["stroke-width"]=p||0,o.dashstyle=f),n||(o.zIndex=1),t&&(e=0),this.gridLine=d=l.path().attr(o).addClass("highcharts-"+(n?n+"-":"")+"grid-line").add(s.gridGroup)),d&&(c=s.getPlotLinePath({value:a+h,lineWidth:d.strokeWidth()*i,force:"pass",old:t,acrossPanes:!1}))&&d[t||this.isNew?"attr":"animate"]({d:c,opacity:e});}renderMark(t,e,i){let s=this.axis,r=s.options,o=s.chart.renderer,a=this.type,n=s.tickSize(a?a+"Tick":"tick"),h=t.x,l=t.y,d=u(r["minor"!==a?"tickWidth":"minorTickWidth"],!a&&s.isXAxis?1:0),c=r["minor"!==a?"tickColor":"minorTickColor"],p=this.mark,g=!p;n&&(s.opposite&&(n[0]=-n[0]),p||(this.mark=p=o.path().addClass("highcharts-"+(a?a+"-":"")+"tick").add(s.axisGroup),s.chart.styledMode||p.attr({stroke:c,"stroke-width":d})),p[g?"attr":"animate"]({d:this.getMarkPath(h,l,n[0],p.strokeWidth()*i,s.horiz,o),opacity:e}));}renderLabel(t,e,i,s){let r=this.axis,o=r.horiz,a=r.options,n=this.label,h=a.labels,l=h.step,c=u(this.tickmarkOffset,r.tickmarkOffset),p=t.x,g=t.y,f=!0;n&&d(p)&&(n.xy=t=this.getLabelPosition(p,g,n,o,h,c,s,l),(!this.isFirst||this.isLast||a.showFirstLabel)&&(!this.isLast||this.isFirst||a.showLastLabel)?!o||h.step||h.rotation||e||0===i||this.handleOverflow(t):f=!1,l&&s%l&&(f=!1),f&&d(t.y)?(t.opacity=i,n[this.isNewLabel?"attr":"animate"](t).show(!0),this.isNewLabel=!1):(n.hide(),this.isNewLabel=!0));}replaceMovedLabel(){let t=this.label,e=this.axis;t&&!this.isNew&&(t.animate({opacity:0},void 0,t.destroy),delete this.label),e.isDirty=!0,this.label=this.movedLabel,delete this.movedLabel;}}}),i(e,"Core/Axis/Axis.js",[e["Core/Animation/AnimationUtilities.js"],e["Core/Axis/AxisDefaults.js"],e["Core/Color/Color.js"],e["Core/Defaults.js"],e["Core/Foundation.js"],e["Core/Globals.js"],e["Core/Axis/Tick.js"],e["Core/Utilities.js"]],function(t,e,i,s,r,o,a,n){let{animObject:h}=t,{xAxis:l,yAxis:d}=e,{defaultOptions:c}=s,{registerEventOptions:p}=r,{deg2rad:u}=o,{arrayMax:g,arrayMin:f,clamp:m,correctFloat:x,defined:y,destroyObjectProperties:b,erase:v,error:S,extend:k,fireEvent:C,getClosestDistance:M,insertItem:w,isArray:T,isNumber:A,isString:P,merge:L,normalizeTickInterval:O,objectEach:D,pick:E,relativeLength:I,removeEvent:j,splat:B,syncTimeout:R}=n,z=(t,e)=>O(e,void 0,void 0,E(t.options.allowDecimals,e<.5||void 0!==t.tickAmount),!!t.tickAmount);k(c,{xAxis:l,yAxis:L(l,d)});class N{constructor(t,e,i){this.init(t,e,i);}init(t,e,i=this.coll){let s="xAxis"===i,r=this.isZAxis||(t.inverted?!s:s);this.chart=t,this.horiz=r,this.isXAxis=s,this.coll=i,C(this,"init",{userOptions:e}),this.opposite=E(e.opposite,this.opposite),this.side=E(e.side,this.side,r?this.opposite?0:2:this.opposite?1:3),this.setOptions(e);let o=this.options,a=o.labels,n=o.type;this.userOptions=e,this.minPixelPadding=0,this.reversed=E(o.reversed,this.reversed),this.visible=o.visible,this.zoomEnabled=o.zoomEnabled,this.hasNames="category"===n||!0===o.categories,this.categories=T(o.categories)&&o.categories||(this.hasNames?[]:void 0),this.names||(this.names=[],this.names.keys={}),this.plotLinesAndBandsGroups={},this.positiveValuesOnly=!!this.logarithmic,this.isLinked=y(o.linkedTo),this.ticks={},this.labelEdge=[],this.minorTicks={},this.plotLinesAndBands=[],this.alternateBands={},this.len=0,this.minRange=this.userMinRange=o.minRange||o.maxZoom,this.range=o.range,this.offset=o.offset||0,this.max=void 0,this.min=void 0;let h=E(o.crosshair,B(t.options.tooltip.crosshairs)[s?0:1]);this.crosshair=!0===h?{}:h,-1===t.axes.indexOf(this)&&(s?t.axes.splice(t.xAxis.length,0,this):t.axes.push(this),w(this,t[this.coll])),t.orderItems(this.coll),this.series=this.series||[],t.inverted&&!this.isZAxis&&s&&!y(this.reversed)&&(this.reversed=!0),this.labelRotation=A(a.rotation)?a.rotation:void 0,p(this,o),C(this,"afterInit");}setOptions(t){let e=this.horiz?{labels:{autoRotation:[-45]},margin:15}:{title:{rotation:90*this.side}};this.options=L(e,c[this.coll],t),C(this,"afterSetOptions",{userOptions:t});}defaultLabelFormatter(){let t=this.axis,{numberFormatter:e}=this.chart,i=A(this.value)?this.value:NaN,s=t.chart.time,r=t.categories,o=this.dateTimeLabelFormat,a=c.lang,n=a.numericSymbols,h=a.numericSymbolMagnitude||1e3,l=t.logarithmic?Math.abs(i):t.tickInterval,d=n&&n.length,p,u;if(r)u=`${this.value}`;else if(o)u=s.dateFormat(o,i);else if(d&&n&&l>=1e3)for(;d--&&void 0===u;)l>=(p=Math.pow(h,d+1))&&10*i%p==0&&null!==n[d]&&0!==i&&(u=e(i/p,-1)+n[d]);return void 0===u&&(u=Math.abs(i)>=1e4?e(i,-1):e(i,-1,void 0,"")),u}getSeriesExtremes(){let t;let e=this;C(this,"getSeriesExtremes",null,function(){e.hasVisibleSeries=!1,e.dataMin=e.dataMax=e.threshold=void 0,e.softThreshold=!e.isXAxis,e.series.forEach(i=>{if(i.reserveSpace()){let s=i.options,r,o=s.threshold,a,n;if(e.hasVisibleSeries=!0,e.positiveValuesOnly&&0>=(o||0)&&(o=void 0),e.isXAxis)(r=i.xData)&&r.length&&(r=e.logarithmic?r.filter(t=>t>0):r,a=(t=i.getXExtremes(r)).min,n=t.max,A(a)||a instanceof Date||(r=r.filter(A),a=(t=i.getXExtremes(r)).min,n=t.max),r.length&&(e.dataMin=Math.min(E(e.dataMin,a),a),e.dataMax=Math.max(E(e.dataMax,n),n)));else {let t=i.applyExtremes();A(t.dataMin)&&(a=t.dataMin,e.dataMin=Math.min(E(e.dataMin,a),a)),A(t.dataMax)&&(n=t.dataMax,e.dataMax=Math.max(E(e.dataMax,n),n)),y(o)&&(e.threshold=o),(!s.softThreshold||e.positiveValuesOnly)&&(e.softThreshold=!1);}}});}),C(this,"afterGetSeriesExtremes");}translate(t,e,i,s,r,o){let a=this.linkedParent||this,n=s&&a.old?a.old.min:a.min;if(!A(n))return NaN;let h=a.minPixelPadding,l=(a.isOrdinal||a.brokenAxis?.hasBreaks||a.logarithmic&&r)&&a.lin2val,d=1,c=0,p=s&&a.old?a.old.transA:a.transA,u=0;if(p||(p=a.transA),i&&(d*=-1,c=a.len),a.reversed&&(d*=-1,c-=d*(a.sector||a.len)),e)u=(t=t*d+c-h)/p+n,l&&(u=a.lin2val(u));else {l&&(t=a.val2lin(t));let e=d*(t-n)*p;u=(a.isRadial?e:x(e))+c+d*h+(A(o)?p*o:0);}return u}toPixels(t,e){return this.translate(t,!1,!this.horiz,void 0,!0)+(e?0:this.pos)}toValue(t,e){return this.translate(t-(e?0:this.pos),!0,!this.horiz,void 0,!0)}getPlotLinePath(t){let e=this,i=e.chart,s=e.left,r=e.top,o=t.old,a=t.value,n=t.lineWidth,h=o&&i.oldChartHeight||i.chartHeight,l=o&&i.oldChartWidth||i.chartWidth,d=e.transB,c=t.translatedValue,p=t.force,u,g,f,x,y;function b(t,e,i){return "pass"!==p&&(t<e||t>i)&&(p?t=m(t,e,i):y=!0),t}let v={value:a,lineWidth:n,old:o,force:p,acrossPanes:t.acrossPanes,translatedValue:c};return C(this,"getPlotLinePath",v,function(t){u=f=Math.round((c=m(c=E(c,e.translate(a,void 0,void 0,o)),-1e5,1e5))+d),g=x=Math.round(h-c-d),A(c)?e.horiz?(g=r,x=h-e.bottom+(i.scrollablePixelsY||0),u=f=b(u,s,s+e.width)):(u=s,f=l-e.right+(i.scrollablePixelsX||0),g=x=b(g,r,r+e.height)):(y=!0,p=!1),t.path=y&&!p?void 0:i.renderer.crispLine([["M",u,g],["L",f,x]],n||1);}),v.path}getLinearTickPositions(t,e,i){let s,r,o;let a=x(Math.floor(e/t)*t),n=x(Math.ceil(i/t)*t),h=[];if(x(a+t)===a&&(o=20),this.single)return [e];for(s=a;s<=n&&(h.push(s),(s=x(s+t,o))!==r);)r=s;return h}getMinorTickInterval(){let{minorTicks:t,minorTickInterval:e}=this.options;return !0===t?E(e,"auto"):!1!==t?e:void 0}getMinorTickPositions(){let t=this.options,e=this.tickPositions,i=this.minorTickInterval,s=this.pointRangePadding||0,r=(this.min||0)-s,o=(this.max||0)+s,a=o-r,n=[],h;if(a&&a/i<this.len/3){let s=this.logarithmic;if(s)this.paddedTicks.forEach(function(t,e,r){e&&n.push.apply(n,s.getLogTickPositions(i,r[e-1],r[e],!0));});else if(this.dateTime&&"auto"===this.getMinorTickInterval())n=n.concat(this.getTimeTicks(this.dateTime.normalizeTimeTickInterval(i),r,o,t.startOfWeek));else for(h=r+(e[0]-r)%i;h<=o&&h!==n[0];h+=i)n.push(h);}return 0!==n.length&&this.trimTicks(n),n}adjustForMinRange(){let t=this.options,e=this.logarithmic,{max:i,min:s,minRange:r}=this,o,a,n,h;this.isXAxis&&void 0===r&&!e&&(r=y(t.min)||y(t.max)||y(t.floor)||y(t.ceiling)?null:Math.min(5*(M(this.series.map(t=>(t.xIncrement?t.xData?.slice(0,2):t.xData)||[]))||0),this.dataMax-this.dataMin)),A(i)&&A(s)&&A(r)&&i-s<r&&(a=this.dataMax-this.dataMin>=r,o=(r-i+s)/2,n=[s-o,E(t.min,s-o)],a&&(n[2]=e?e.log2lin(this.dataMin):this.dataMin),h=[(s=g(n))+r,E(t.max,s+r)],a&&(h[2]=e?e.log2lin(this.dataMax):this.dataMax),(i=f(h))-s<r&&(n[0]=i-r,n[1]=E(t.min,i-r),s=g(n))),this.minRange=r,this.min=s,this.max=i;}getClosest(){let t,e;if(this.categories)e=1;else {let i=[];this.series.forEach(function(t){let s=t.closestPointRange;t.xData?.length===1?i.push(t.xData[0]):!t.noSharedTooltip&&y(s)&&t.reserveSpace()&&(e=y(e)?Math.min(e,s):s);}),i.length&&(i.sort((t,e)=>t-e),t=M([i]));}return t&&e?Math.min(t,e):t||e}nameToX(t){let e=T(this.options.categories),i=e?this.categories:this.names,s=t.options.x,r;return t.series.requireSorting=!1,y(s)||(s=this.options.uniqueNames&&i?e?i.indexOf(t.name):E(i.keys[t.name],-1):t.series.autoIncrement()),-1===s?!e&&i&&(r=i.length):r=s,void 0!==r?(this.names[r]=t.name,this.names.keys[t.name]=r):t.x&&(r=t.x),r}updateNames(){let t=this,e=this.names;e.length>0&&(Object.keys(e.keys).forEach(function(t){delete e.keys[t];}),e.length=0,this.minRange=this.userMinRange,(this.series||[]).forEach(e=>{e.xIncrement=null,(!e.points||e.isDirtyData)&&(t.max=Math.max(t.max,e.xData.length-1),e.processData(),e.generatePoints()),e.data.forEach(function(i,s){let r;i?.options&&void 0!==i.name&&void 0!==(r=t.nameToX(i))&&r!==i.x&&(i.x=r,e.xData[s]=r);});}));}setAxisTranslation(){let t=this,e=t.max-t.min,i=t.linkedParent,s=!!t.categories,r=t.isXAxis,o=t.axisPointRange||0,a,n=0,h=0,l,d=t.transA;(r||s||o)&&(a=t.getClosest(),i?(n=i.minPointOffset,h=i.pointRangePadding):t.series.forEach(function(e){let i=s?1:r?E(e.options.pointRange,a,0):t.axisPointRange||0,l=e.options.pointPlacement;if(o=Math.max(o,i),!t.single||s){let t=e.is("xrange")?!r:r;n=Math.max(n,t&&P(l)?0:i/2),h=Math.max(h,t&&"on"===l?0:i);}}),l=t.ordinal&&t.ordinal.slope&&a?t.ordinal.slope/a:1,t.minPointOffset=n*=l,t.pointRangePadding=h*=l,t.pointRange=Math.min(o,t.single&&s?1:e),r&&a&&(t.closestPointRange=a)),t.translationSlope=t.transA=d=t.staticScale||t.len/(e+h||1),t.transB=t.horiz?t.left:t.bottom,t.minPixelPadding=d*n,C(this,"afterSetAxisTranslation");}minFromRange(){let{max:t,min:e}=this;return A(t)&&A(e)&&t-e||void 0}setTickInterval(t){let{categories:e,chart:i,dataMax:s,dataMin:r,dateTime:o,isXAxis:a,logarithmic:n,options:h,softThreshold:l}=this,d=A(this.threshold)?this.threshold:void 0,c=this.minRange||0,{ceiling:p,floor:u,linkedTo:g,softMax:f,softMin:m}=h,b=A(g)&&i[this.coll]?.[g],v=h.tickPixelInterval,k=h.maxPadding,M=h.minPadding,w=0,T,P=A(h.tickInterval)&&h.tickInterval>=0?h.tickInterval:void 0,L,O,D,I;if(o||e||b||this.getTickAmount(),D=E(this.userMin,h.min),I=E(this.userMax,h.max),b?(this.linkedParent=b,T=b.getExtremes(),this.min=E(T.min,T.dataMin),this.max=E(T.max,T.dataMax),h.type!==b.options.type&&S(11,!0,i)):(l&&y(d)&&A(s)&&A(r)&&(r>=d?(L=d,M=0):s<=d&&(O=d,k=0)),this.min=E(D,L,r),this.max=E(I,O,s)),A(this.max)&&A(this.min)&&(n&&(this.positiveValuesOnly&&!t&&0>=Math.min(this.min,E(r,this.min))&&S(10,!0,i),this.min=x(n.log2lin(this.min),16),this.max=x(n.log2lin(this.max),16)),this.range&&A(r)&&(this.userMin=this.min=D=Math.max(r,this.minFromRange()||0),this.userMax=I=this.max,this.range=void 0)),C(this,"foundExtremes"),this.adjustForMinRange(),A(this.min)&&A(this.max)){if(!A(this.userMin)&&A(m)&&m<this.min&&(this.min=D=m),!A(this.userMax)&&A(f)&&f>this.max&&(this.max=I=f),e||this.axisPointRange||this.stacking?.usePercentage||b||!(w=this.max-this.min)||(!y(D)&&M&&(this.min-=w*M),y(I)||!k||(this.max+=w*k)),!A(this.userMin)&&A(u)&&(this.min=Math.max(this.min,u)),!A(this.userMax)&&A(p)&&(this.max=Math.min(this.max,p)),l&&A(r)&&A(s)){let t=d||0;!y(D)&&this.min<t&&r>=t?this.min=h.minRange?Math.min(t,this.max-c):t:!y(I)&&this.max>t&&s<=t&&(this.max=h.minRange?Math.max(t,this.min+c):t);}!i.polar&&this.min>this.max&&(y(h.min)?this.max=this.min:y(h.max)&&(this.min=this.max)),w=this.max-this.min;}if(this.min!==this.max&&A(this.min)&&A(this.max)?b&&!P&&v===b.options.tickPixelInterval?this.tickInterval=P=b.tickInterval:this.tickInterval=E(P,this.tickAmount?w/Math.max(this.tickAmount-1,1):void 0,e?1:w*v/Math.max(this.len,v)):this.tickInterval=1,a&&!t){let t=this.min!==this.old?.min||this.max!==this.old?.max;this.series.forEach(function(e){e.forceCrop=e.forceCropping?.(),e.processData(t);}),C(this,"postProcessData",{hasExtremesChanged:t});}this.setAxisTranslation(),C(this,"initialAxisTranslation"),this.pointRange&&!P&&(this.tickInterval=Math.max(this.pointRange,this.tickInterval));let j=E(h.minTickInterval,o&&!this.series.some(t=>t.noSharedTooltip)?this.closestPointRange:0);!P&&this.tickInterval<j&&(this.tickInterval=j),o||n||P||(this.tickInterval=z(this,this.tickInterval)),this.tickAmount||(this.tickInterval=this.unsquish()),this.setTickPositions();}setTickPositions(){let t=this.options,e=t.tickPositions,i=t.tickPositioner,s=this.getMinorTickInterval(),r=!this.isPanning,o=r&&t.startOnTick,a=r&&t.endOnTick,n=[],h;if(this.tickmarkOffset=this.categories&&"between"===t.tickmarkPlacement&&1===this.tickInterval?.5:0,this.minorTickInterval="auto"===s&&this.tickInterval?this.tickInterval/t.minorTicksPerMajor:s,this.single=this.min===this.max&&y(this.min)&&!this.tickAmount&&(this.min%1==0||!1!==t.allowDecimals),e)n=e.slice();else if(A(this.min)&&A(this.max)){if(!this.ordinal?.positions&&(this.max-this.min)/this.tickInterval>Math.max(2*this.len,200))n=[this.min,this.max],S(19,!1,this.chart);else if(this.dateTime)n=this.getTimeTicks(this.dateTime.normalizeTimeTickInterval(this.tickInterval,t.units),this.min,this.max,t.startOfWeek,this.ordinal?.positions,this.closestPointRange,!0);else if(this.logarithmic)n=this.logarithmic.getLogTickPositions(this.tickInterval,this.min,this.max);else {let t=this.tickInterval,e=t;for(;e<=2*t;)if(n=this.getLinearTickPositions(this.tickInterval,this.min,this.max),this.tickAmount&&n.length>this.tickAmount)this.tickInterval=z(this,e*=1.1);else break}n.length>this.len&&(n=[n[0],n[n.length-1]])[0]===n[1]&&(n.length=1),i&&(this.tickPositions=n,(h=i.apply(this,[this.min,this.max]))&&(n=h));}this.tickPositions=n,this.paddedTicks=n.slice(0),this.trimTicks(n,o,a),!this.isLinked&&A(this.min)&&A(this.max)&&(this.single&&n.length<2&&!this.categories&&!this.series.some(t=>t.is("heatmap")&&"between"===t.options.pointPlacement)&&(this.min-=.5,this.max+=.5),e||h||this.adjustTickAmount()),C(this,"afterSetTickPositions");}trimTicks(t,e,i){let s=t[0],r=t[t.length-1],o=!this.isOrdinal&&this.minPointOffset||0;if(C(this,"trimTicks"),!this.isLinked){if(e&&s!==-1/0)this.min=s;else for(;this.min-o>t[0];)t.shift();if(i)this.max=r;else for(;this.max+o<t[t.length-1];)t.pop();0===t.length&&y(s)&&!this.options.tickPositions&&t.push((r+s)/2);}}alignToOthers(){let t;let e=this,i=e.chart,s=[this],r=e.options,o=i.options.chart,a="yAxis"===this.coll&&o.alignThresholds,n=[];if(e.thresholdAlignment=void 0,(!1!==o.alignTicks&&r.alignTicks||a)&&!1!==r.startOnTick&&!1!==r.endOnTick&&!e.logarithmic){let r=t=>{let{horiz:e,options:i}=t;return [e?i.left:i.top,i.width,i.height,i.pane].join(",")},o=r(this);i[this.coll].forEach(function(i){let{series:a}=i;a.length&&a.some(t=>t.visible)&&i!==e&&r(i)===o&&(t=!0,s.push(i));});}if(t&&a){s.forEach(t=>{let i=t.getThresholdAlignment(e);A(i)&&n.push(i);});let t=n.length>1?n.reduce((t,e)=>t+=e,0)/n.length:void 0;s.forEach(e=>{e.thresholdAlignment=t;});}return t}getThresholdAlignment(t){if((!A(this.dataMin)||this!==t&&this.series.some(t=>t.isDirty||t.isDirtyData))&&this.getSeriesExtremes(),A(this.threshold)){let t=m((this.threshold-(this.dataMin||0))/((this.dataMax||0)-(this.dataMin||0)),0,1);return this.options.reversed&&(t=1-t),t}}getTickAmount(){let t=this.options,e=t.tickPixelInterval,i=t.tickAmount;y(t.tickInterval)||i||!(this.len<e)||this.isRadial||this.logarithmic||!t.startOnTick||!t.endOnTick||(i=2),!i&&this.alignToOthers()&&(i=Math.ceil(this.len/e)+1),i<4&&(this.finalTickAmt=i,i=5),this.tickAmount=i;}adjustTickAmount(){let t=this,{finalTickAmt:e,max:i,min:s,options:r,tickPositions:o,tickAmount:a,thresholdAlignment:n}=t,h=o?.length,l=E(t.threshold,t.softThreshold?0:null),d,c,p=t.tickInterval,u,g=()=>o.push(x(o[o.length-1]+p)),f=()=>o.unshift(x(o[0]-p));if(A(n)&&(u=n<.5?Math.ceil(n*(a-1)):Math.floor(n*(a-1)),r.reversed&&(u=a-1-u)),t.hasData()&&A(s)&&A(i)){let n=()=>{t.transA*=(h-1)/(a-1),t.min=r.startOnTick?o[0]:Math.min(s,o[0]),t.max=r.endOnTick?o[o.length-1]:Math.max(i,o[o.length-1]);};if(A(u)&&A(t.threshold)){for(;o[u]!==l||o.length!==a||o[0]>s||o[o.length-1]<i;){for(o.length=0,o.push(t.threshold);o.length<a;)void 0===o[u]||o[u]>t.threshold?f():g();if(p>8*t.tickInterval)break;p*=2;}n();}else if(h<a){for(;o.length<a;)o.length%2||s===l?g():f();n();}if(y(e)){for(c=d=o.length;c--;)(3===e&&c%2==1||e<=2&&c>0&&c<d-1)&&o.splice(c,1);t.finalTickAmt=void 0;}}}setScale(){let{coll:t,stacking:e}=this,i=!1,s=!1;this.series.forEach(t=>{i=i||t.isDirtyData||t.isDirty,s=s||t.xAxis&&t.xAxis.isDirty||!1;}),this.setAxisSize();let r=this.len!==(this.old&&this.old.len);r||i||s||this.isLinked||this.forceRedraw||this.userMin!==(this.old&&this.old.userMin)||this.userMax!==(this.old&&this.old.userMax)||this.alignToOthers()?(e&&"yAxis"===t&&e.buildStacks(),this.forceRedraw=!1,this.userMinRange||(this.minRange=void 0),this.getSeriesExtremes(),this.setTickInterval(),e&&"xAxis"===t&&e.buildStacks(),this.isDirty||(this.isDirty=r||this.min!==this.old?.min||this.max!==this.old?.max)):e&&e.cleanStacks(),i&&delete this.allExtremes,C(this,"afterSetScale");}setExtremes(t,e,i=!0,s,r){this.series.forEach(t=>{delete t.kdTree;}),C(this,"setExtremes",r=k(r,{min:t,max:e}),t=>{this.userMin=t.min,this.userMax=t.max,this.eventArgs=t,i&&this.chart.redraw(s);});}setAxisSize(){let t=this.chart,e=this.options,i=e.offsets||[0,0,0,0],s=this.horiz,r=this.width=Math.round(I(E(e.width,t.plotWidth-i[3]+i[1]),t.plotWidth)),o=this.height=Math.round(I(E(e.height,t.plotHeight-i[0]+i[2]),t.plotHeight)),a=this.top=Math.round(I(E(e.top,t.plotTop+i[0]),t.plotHeight,t.plotTop)),n=this.left=Math.round(I(E(e.left,t.plotLeft+i[3]),t.plotWidth,t.plotLeft));this.bottom=t.chartHeight-o-a,this.right=t.chartWidth-r-n,this.len=Math.max(s?r:o,0),this.pos=s?n:a;}getExtremes(){let t=this.logarithmic;return {min:t?x(t.lin2log(this.min)):this.min,max:t?x(t.lin2log(this.max)):this.max,dataMin:this.dataMin,dataMax:this.dataMax,userMin:this.userMin,userMax:this.userMax}}getThreshold(t){let e=this.logarithmic,i=e?e.lin2log(this.min):this.min,s=e?e.lin2log(this.max):this.max;return null===t||t===-1/0?t=i:t===1/0?t=s:i>t?t=i:s<t&&(t=s),this.translate(t,0,1,0,1)}autoLabelAlign(t){let e=(E(t,0)-90*this.side+720)%360,i={align:"center"};return C(this,"autoLabelAlign",i,function(t){e>15&&e<165?t.align="right":e>195&&e<345&&(t.align="left");}),i.align}tickSize(t){let e=this.options,i=E(e["tick"===t?"tickWidth":"minorTickWidth"],"tick"===t&&this.isXAxis&&!this.categories?1:0),s=e["tick"===t?"tickLength":"minorTickLength"],r;i&&s&&("inside"===e[t+"Position"]&&(s=-s),r=[s,i]);let o={tickSize:r};return C(this,"afterTickSize",o),o.tickSize}labelMetrics(){let t=this.chart.renderer,e=this.ticks,i=e[Object.keys(e)[0]]||{};return this.chart.renderer.fontMetrics(i.label||i.movedLabel||t.box)}unsquish(){let t=this.options.labels,e=this.horiz,i=this.tickInterval,s=this.len/(((this.categories?1:0)+this.max-this.min)/i),r=t.rotation,o=this.labelMetrics().h,a=Math.max(this.max-this.min,0),n=function(t){let e=t/(s||1);return (e=e>1?Math.ceil(e):1)*i>a&&t!==1/0&&s!==1/0&&a&&(e=Math.ceil(a/i)),x(e*i)},h=i,l,d=Number.MAX_VALUE,c;if(e){if(!t.staggerLines&&(A(r)?c=[r]:s<t.autoRotationLimit&&(c=t.autoRotation)),c){let t,e;for(let i of c)(i===r||i&&i>=-90&&i<=90)&&(e=(t=n(Math.abs(o/Math.sin(u*i))))+Math.abs(i/360))<d&&(d=e,l=i,h=t);}}else h=n(.75*o);return this.autoRotation=c,this.labelRotation=E(l,A(r)?r:0),t.step?i:h}getSlotWidth(t){let e=this.chart,i=this.horiz,s=this.options.labels,r=Math.max(this.tickPositions.length-(this.categories?0:1),1),o=e.margin[3];if(t&&A(t.slotWidth))return t.slotWidth;if(i&&s.step<2)return s.rotation?0:(this.staggerLines||1)*this.len/r;if(!i){let t=s.style.width;if(void 0!==t)return parseInt(String(t),10);if(o)return o-e.spacing[3]}return .33*e.chartWidth}renderUnsquish(){let t=this.chart,e=t.renderer,i=this.tickPositions,s=this.ticks,r=this.options.labels,o=r.style,a=this.horiz,n=this.getSlotWidth(),h=Math.max(1,Math.round(n-2*r.padding)),l={},d=this.labelMetrics(),c=o.textOverflow,p,u,g=0,f,m;if(P(r.rotation)||(l.rotation=r.rotation||0),i.forEach(function(t){let e=s[t];e.movedLabel&&e.replaceMovedLabel(),e&&e.label&&e.label.textPxLength>g&&(g=e.label.textPxLength);}),this.maxLabelLength=g,this.autoRotation)g>h&&g>d.h?l.rotation=this.labelRotation:this.labelRotation=0;else if(n&&(p=h,!c))for(u="clip",m=i.length;!a&&m--;)(f=s[i[m]].label)&&("ellipsis"===f.styles.textOverflow?f.css({textOverflow:"clip"}):f.textPxLength>n&&f.css({width:n+"px"}),f.getBBox().height>this.len/i.length-(d.h-d.f)&&(f.specificTextOverflow="ellipsis"));l.rotation&&(p=g>.5*t.chartHeight?.33*t.chartHeight:g,c||(u="ellipsis")),this.labelAlign=r.align||this.autoLabelAlign(this.labelRotation),this.labelAlign&&(l.align=this.labelAlign),i.forEach(function(t){let e=s[t],i=e&&e.label,r=o.width,a={};i&&(i.attr(l),e.shortenLabel?e.shortenLabel():p&&!r&&"nowrap"!==o.whiteSpace&&(p<i.textPxLength||"SPAN"===i.element.tagName)?(a.width=p+"px",c||(a.textOverflow=i.specificTextOverflow||u),i.css(a)):!i.styles.width||a.width||r||i.css({width:null}),delete i.specificTextOverflow,e.rotation=l.rotation);},this),this.tickRotCorr=e.rotCorr(d.b,this.labelRotation||0,0!==this.side);}hasData(){return this.series.some(function(t){return t.hasData()})||this.options.showEmpty&&y(this.min)&&y(this.max)}addTitle(t){let e;let i=this.chart.renderer,s=this.horiz,r=this.opposite,o=this.options.title,a=this.chart.styledMode;this.axisTitle||((e=o.textAlign)||(e=(s?{low:"left",middle:"center",high:"right"}:{low:r?"right":"left",middle:"center",high:r?"left":"right"})[o.align]),this.axisTitle=i.text(o.text||"",0,0,o.useHTML).attr({zIndex:7,rotation:o.rotation||0,align:e}).addClass("highcharts-axis-title"),a||this.axisTitle.css(L(o.style)),this.axisTitle.add(this.axisGroup),this.axisTitle.isNew=!0),a||o.style.width||this.isRadial||this.axisTitle.css({width:this.len+"px"}),this.axisTitle[t?"show":"hide"](t);}generateTick(t){let e=this.ticks;e[t]?e[t].addLabel():e[t]=new a(this,t);}createGroups(){let{axisParent:t,chart:e,coll:i,options:s}=this,r=e.renderer,o=(e,o,a)=>r.g(e).attr({zIndex:a}).addClass(`highcharts-${i.toLowerCase()}${o} `+(this.isRadial?`highcharts-radial-axis${o} `:"")+(s.className||"")).add(t);this.axisGroup||(this.gridGroup=o("grid","-grid",s.gridZIndex),this.axisGroup=o("axis","",s.zIndex),this.labelGroup=o("axis-labels","-labels",s.labels.zIndex));}getOffset(){let t=this,{chart:e,horiz:i,options:s,side:r,ticks:o,tickPositions:a,coll:n}=t,h=e.inverted&&!t.isZAxis?[1,0,3,2][r]:r,l=t.hasData(),d=s.title,c=s.labels,p=A(s.crossing),u=e.axisOffset,g=e.clipOffset,f=[-1,1,1,-1][r],m,x=0,b,v=0,S=0,k,M;if(t.showAxis=m=l||s.showEmpty,t.staggerLines=t.horiz&&c.staggerLines||void 0,t.createGroups(),l||t.isLinked?(a.forEach(function(e){t.generateTick(e);}),t.renderUnsquish(),t.reserveSpaceDefault=0===r||2===r||({1:"left",3:"right"})[r]===t.labelAlign,E(c.reserveSpace,!p&&null,"center"===t.labelAlign||null,t.reserveSpaceDefault)&&a.forEach(function(t){S=Math.max(o[t].getLabelSize(),S);}),t.staggerLines&&(S*=t.staggerLines),t.labelOffset=S*(t.opposite?-1:1)):D(o,function(t,e){t.destroy(),delete o[e];}),d?.text&&!1!==d.enabled&&(t.addTitle(m),m&&!p&&!1!==d.reserveSpace&&(t.titleOffset=x=t.axisTitle.getBBox()[i?"height":"width"],v=y(b=d.offset)?0:E(d.margin,i?5:10))),t.renderLine(),t.offset=f*E(s.offset,u[r]?u[r]+(s.margin||0):0),t.tickRotCorr=t.tickRotCorr||{x:0,y:0},M=0===r?-t.labelMetrics().h:2===r?t.tickRotCorr.y:0,k=Math.abs(S)+v,S&&(k-=M,k+=f*(i?E(c.y,t.tickRotCorr.y+f*c.distance):E(c.x,f*c.distance))),t.axisTitleMargin=E(b,k),t.getMaxLabelDimensions&&(t.maxLabelDimensions=t.getMaxLabelDimensions(o,a)),"colorAxis"!==n){let e=this.tickSize("tick");u[r]=Math.max(u[r],(t.axisTitleMargin||0)+x+f*t.offset,k,a&&a.length&&e?e[0]+f*t.offset:0);let i=!t.axisLine||s.offset?0:2*Math.floor(t.axisLine.strokeWidth()/2);g[h]=Math.max(g[h],i);}C(this,"afterGetOffset");}getLinePath(t){let e=this.chart,i=this.opposite,s=this.offset,r=this.horiz,o=this.left+(i?this.width:0)+s,a=e.chartHeight-this.bottom-(i?this.height:0)+s;return i&&(t*=-1),e.renderer.crispLine([["M",r?this.left:o,r?a:this.top],["L",r?e.chartWidth-this.right:o,r?a:e.chartHeight-this.bottom]],t)}renderLine(){this.axisLine||(this.axisLine=this.chart.renderer.path().addClass("highcharts-axis-line").add(this.axisGroup),this.chart.styledMode||this.axisLine.attr({stroke:this.options.lineColor,"stroke-width":this.options.lineWidth,zIndex:7}));}getTitlePosition(t){let e=this.horiz,i=this.left,s=this.top,r=this.len,o=this.options.title,a=e?i:s,n=this.opposite,h=this.offset,l=o.x,d=o.y,c=this.chart.renderer.fontMetrics(t),p=t?Math.max(t.getBBox(!1,0).height-c.h-1,0):0,u={low:a+(e?0:r),middle:a+r/2,high:a+(e?r:0)}[o.align],g=(e?s+this.height:i)+(e?1:-1)*(n?-1:1)*(this.axisTitleMargin||0)+[-p,p,c.f,-p][this.side],f={x:e?u+l:g+(n?this.width:0)+h+l,y:e?g+d-(n?this.height:0)+h:u+d};return C(this,"afterGetTitlePosition",{titlePosition:f}),f}renderMinorTick(t,e){let i=this.minorTicks;i[t]||(i[t]=new a(this,t,"minor")),e&&i[t].isNew&&i[t].render(null,!0),i[t].render(null,!1,1);}renderTick(t,e,i){let s=this.isLinked,r=this.ticks;(!s||t>=this.min&&t<=this.max||this.grid&&this.grid.isColumn)&&(r[t]||(r[t]=new a(this,t)),i&&r[t].isNew&&r[t].render(e,!0,-1),r[t].render(e));}render(){let t,e;let i=this,s=i.chart,r=i.logarithmic,n=s.renderer,l=i.options,d=i.isLinked,c=i.tickPositions,p=i.axisTitle,u=i.ticks,g=i.minorTicks,f=i.alternateBands,m=l.stackLabels,x=l.alternateGridColor,y=l.crossing,b=i.tickmarkOffset,v=i.axisLine,S=i.showAxis,k=h(n.globalAnimation);if(i.labelEdge.length=0,i.overlap=!1,[u,g,f].forEach(function(t){D(t,function(t){t.isActive=!1;});}),A(y)){let t=this.isXAxis?s.yAxis[0]:s.xAxis[0],e=[1,-1,-1,1][this.side];if(t){let s=t.toPixels(y,!0);i.horiz&&(s=t.len-s),i.offset=e*s;}}if(i.hasData()||d){let n=i.chart.hasRendered&&i.old&&A(i.old.min);i.minorTickInterval&&!i.categories&&i.getMinorTickPositions().forEach(function(t){i.renderMinorTick(t,n);}),c.length&&(c.forEach(function(t,e){i.renderTick(t,e,n);}),b&&(0===i.min||i.single)&&(u[-1]||(u[-1]=new a(i,-1,null,!0)),u[-1].render(-1))),x&&c.forEach(function(a,n){e=void 0!==c[n+1]?c[n+1]+b:i.max-b,n%2==0&&a<i.max&&e<=i.max+(s.polar?-b:b)&&(f[a]||(f[a]=new o.PlotLineOrBand(i,{})),t=a+b,f[a].options={from:r?r.lin2log(t):t,to:r?r.lin2log(e):e,color:x,className:"highcharts-alternate-grid"},f[a].render(),f[a].isActive=!0);}),i._addedPlotLB||(i._addedPlotLB=!0,(l.plotLines||[]).concat(l.plotBands||[]).forEach(function(t){i.addPlotBandOrLine(t);}));}[u,g,f].forEach(function(t){let e=[],i=k.duration;D(t,function(t,i){t.isActive||(t.render(i,!1,0),t.isActive=!1,e.push(i));}),R(function(){let i=e.length;for(;i--;)t[e[i]]&&!t[e[i]].isActive&&(t[e[i]].destroy(),delete t[e[i]]);},t!==f&&s.hasRendered&&i?i:0);}),v&&(v[v.isPlaced?"animate":"attr"]({d:this.getLinePath(v.strokeWidth())}),v.isPlaced=!0,v[S?"show":"hide"](S)),p&&S&&(p[p.isNew?"attr":"animate"](i.getTitlePosition(p)),p.isNew=!1),m&&m.enabled&&i.stacking&&i.stacking.renderStackTotals(),i.old={len:i.len,max:i.max,min:i.min,transA:i.transA,userMax:i.userMax,userMin:i.userMin},i.isDirty=!1,C(this,"afterRender");}redraw(){this.visible&&(this.render(),this.plotLinesAndBands.forEach(function(t){t.render();})),this.series.forEach(function(t){t.isDirty=!0;});}getKeepProps(){return this.keepProps||N.keepProps}destroy(t){let e=this,i=e.plotLinesAndBands,s=this.eventOptions;if(C(this,"destroy",{keepEvents:t}),t||j(e),[e.ticks,e.minorTicks,e.alternateBands].forEach(function(t){b(t);}),i){let t=i.length;for(;t--;)i[t].destroy();}for(let t in ["axisLine","axisTitle","axisGroup","gridGroup","labelGroup","cross","scrollbar"].forEach(function(t){e[t]&&(e[t]=e[t].destroy());}),e.plotLinesAndBandsGroups)e.plotLinesAndBandsGroups[t]=e.plotLinesAndBandsGroups[t].destroy();D(e,function(t,i){-1===e.getKeepProps().indexOf(i)&&delete e[i];}),this.eventOptions=s;}drawCrosshair(t,e){let s=this.crosshair,r=E(s&&s.snap,!0),o=this.chart,a,n,h,l=this.cross,d;if(C(this,"drawCrosshair",{e:t,point:e}),t||(t=this.cross&&this.cross.e),s&&!1!==(y(e)||!r)){if(r?y(e)&&(n=E("colorAxis"!==this.coll?e.crosshairPos:null,this.isXAxis?e.plotX:this.len-e.plotY)):n=t&&(this.horiz?t.chartX-this.pos:this.len-t.chartY+this.pos),y(n)&&(d={value:e&&(this.isXAxis?e.x:E(e.stackY,e.y)),translatedValue:n},o.polar&&k(d,{isCrosshair:!0,chartX:t&&t.chartX,chartY:t&&t.chartY,point:e}),a=this.getPlotLinePath(d)||null),!y(a)){this.hideCrosshair();return}h=this.categories&&!this.isRadial,l||(this.cross=l=o.renderer.path().addClass("highcharts-crosshair highcharts-crosshair-"+(h?"category ":"thin ")+(s.className||"")).attr({zIndex:E(s.zIndex,2)}).add(),!o.styledMode&&(l.attr({stroke:s.color||(h?i.parse("#ccd3ff").setOpacity(.25).get():"#cccccc"),"stroke-width":E(s.width,1)}).css({"pointer-events":"none"}),s.dashStyle&&l.attr({dashstyle:s.dashStyle}))),l.show().attr({d:a}),h&&!s.width&&l.attr({"stroke-width":this.transA}),this.cross.e=t;}else this.hideCrosshair();C(this,"afterDrawCrosshair",{e:t,point:e});}hideCrosshair(){this.cross&&this.cross.hide(),C(this,"afterHideCrosshair");}update(t,e){let i=this.chart;t=L(this.userOptions,t),this.destroy(!0),this.init(i,t),i.isDirtyBox=!0,E(e,!0)&&i.redraw();}remove(t){let e=this.chart,i=this.coll,s=this.series,r=s.length;for(;r--;)s[r]&&s[r].remove(!1);v(e.axes,this),v(e[i]||[],this),e.orderItems(i),this.destroy(),e.isDirtyBox=!0,E(t,!0)&&e.redraw();}setTitle(t,e){this.update({title:t},e);}setCategories(t,e){this.update({categories:t},e);}}return N.keepProps=["coll","extKey","hcEvents","names","series","userMax","userMin"],N}),i(e,"Core/Axis/DateTimeAxis.js",[e["Core/Utilities.js"]],function(t){var e;let{addEvent:i,getMagnitude:s,normalizeTickInterval:r,timeUnits:o}=t;return function(t){function e(){return this.chart.time.getTimeTicks.apply(this.chart.time,arguments)}function a(){if("datetime"!==this.options.type){this.dateTime=void 0;return}this.dateTime||(this.dateTime=new n(this));}t.compose=function(t){return t.keepProps.includes("dateTime")||(t.keepProps.push("dateTime"),t.prototype.getTimeTicks=e,i(t,"afterSetOptions",a)),t};class n{constructor(t){this.axis=t;}normalizeTimeTickInterval(t,e){let i=e||[["millisecond",[1,2,5,10,20,25,50,100,200,500]],["second",[1,2,5,10,15,30]],["minute",[1,2,5,10,15,30]],["hour",[1,2,3,4,6,8,12]],["day",[1,2]],["week",[1,2]],["month",[1,2,3,4,6]],["year",null]],a=i[i.length-1],n=o[a[0]],h=a[1],l;for(l=0;l<i.length&&(n=o[(a=i[l])[0]],h=a[1],!i[l+1]||!(t<=(n*h[h.length-1]+o[i[l+1][0]])/2));l++);n===o.year&&t<5*n&&(h=[1,2,5]);let d=r(t/n,h,"year"===a[0]?Math.max(s(t/n),1):1);return {unitRange:n,count:d,unitName:a[0]}}getXDateFormat(t,e){let{axis:i}=this,s=i.chart.time;return i.closestPointRange?s.getDateFormat(i.closestPointRange,t,i.options.startOfWeek,e)||s.resolveDTLFormat(e.year).main:s.resolveDTLFormat(e.day).main}}t.Additions=n;}(e||(e={})),e}),i(e,"Core/Axis/LogarithmicAxis.js",[e["Core/Utilities.js"]],function(t){var e;let{addEvent:i,normalizeTickInterval:s,pick:r}=t;return function(t){function e(t){let e=t.userOptions,i=this.logarithmic;"logarithmic"!==e.type?this.logarithmic=void 0:i||(i=this.logarithmic=new a(this));}function o(){let t=this.logarithmic;t&&(this.lin2val=function(e){return t.lin2log(e)},this.val2lin=function(e){return t.log2lin(e)});}t.compose=function(t){return t.keepProps.includes("logarithmic")||(t.keepProps.push("logarithmic"),i(t,"init",e),i(t,"afterInit",o)),t};class a{constructor(t){this.axis=t;}getLogTickPositions(t,e,i,o){let a=this.axis,n=a.len,h=a.options,l=[];if(o||(this.minorAutoInterval=void 0),t>=.5)t=Math.round(t),l=a.getLinearTickPositions(t,e,i);else if(t>=.08){let s,r,a,n,h,d,c;let p=Math.floor(e);for(s=t>.3?[1,2,4]:t>.15?[1,2,4,6,8]:[1,2,3,4,5,6,7,8,9],r=p;r<i+1&&!c;r++)for(a=0,n=s.length;a<n&&!c;a++)(h=this.log2lin(this.lin2log(r)*s[a]))>e&&(!o||d<=i)&&void 0!==d&&l.push(d),d>i&&(c=!0),d=h;}else {let d=this.lin2log(e),c=this.lin2log(i),p=o?a.getMinorTickInterval():h.tickInterval,u=h.tickPixelInterval/(o?5:1),g=o?n/a.tickPositions.length:n;t=s(t=r("auto"===p?null:p,this.minorAutoInterval,(c-d)*u/(g||1))),l=a.getLinearTickPositions(t,d,c).map(this.log2lin),o||(this.minorAutoInterval=t/5);}return o||(a.tickInterval=t),l}lin2log(t){return Math.pow(10,t)}log2lin(t){return Math.log(t)/Math.LN10}}t.Additions=a;}(e||(e={})),e}),i(e,"Core/Axis/PlotLineOrBand/PlotLineOrBandAxis.js",[e["Core/Utilities.js"]],function(t){var e;let{erase:i,extend:s,isNumber:r}=t;return function(t){let e;function o(t){return this.addPlotBandOrLine(t,"plotBands")}function a(t,i){let s=this.userOptions,r=new e(this,t);if(this.visible&&(r=r.render()),r){if(this._addedPlotLB||(this._addedPlotLB=!0,(s.plotLines||[]).concat(s.plotBands||[]).forEach(t=>{this.addPlotBandOrLine(t);})),i){let e=s[i]||[];e.push(t),s[i]=e;}this.plotLinesAndBands.push(r);}return r}function n(t){return this.addPlotBandOrLine(t,"plotLines")}function h(t,e,i){i=i||this.options;let s=this.getPlotLinePath({value:e,force:!0,acrossPanes:i.acrossPanes}),o=[],a=this.horiz,n=!r(this.min)||!r(this.max)||t<this.min&&e<this.min||t>this.max&&e>this.max,h=this.getPlotLinePath({value:t,force:!0,acrossPanes:i.acrossPanes}),l,d=1,c;if(h&&s)for(n&&(c=h.toString()===s.toString(),d=0),l=0;l<h.length;l+=2){let t=h[l],e=h[l+1],i=s[l],r=s[l+1];("M"===t[0]||"L"===t[0])&&("M"===e[0]||"L"===e[0])&&("M"===i[0]||"L"===i[0])&&("M"===r[0]||"L"===r[0])&&(a&&i[1]===t[1]?(i[1]+=d,r[1]+=d):a||i[2]!==t[2]||(i[2]+=d,r[2]+=d),o.push(["M",t[1],t[2]],["L",e[1],e[2]],["L",r[1],r[2]],["L",i[1],i[2]],["Z"])),o.isFlat=c;}return o}function l(t){this.removePlotBandOrLine(t);}function d(t){let e=this.plotLinesAndBands,s=this.options,r=this.userOptions;if(e){let o=e.length;for(;o--;)e[o].id===t&&e[o].destroy();[s.plotLines||[],r.plotLines||[],s.plotBands||[],r.plotBands||[]].forEach(function(e){for(o=e.length;o--;)(e[o]||{}).id===t&&i(e,e[o]);});}}function c(t){this.removePlotBandOrLine(t);}t.compose=function(t,i){let r=i.prototype;return r.addPlotBand||(e=t,s(r,{addPlotBand:o,addPlotLine:n,addPlotBandOrLine:a,getPlotBandPath:h,removePlotBand:l,removePlotLine:c,removePlotBandOrLine:d})),i};}(e||(e={})),e}),i(e,"Core/Axis/PlotLineOrBand/PlotLineOrBand.js",[e["Core/Axis/PlotLineOrBand/PlotLineOrBandAxis.js"],e["Core/Utilities.js"]],function(t,e){let{arrayMax:i,arrayMin:s,defined:r,destroyObjectProperties:o,erase:a,fireEvent:n,merge:h,objectEach:l,pick:d}=e;class c{static compose(e){return t.compose(c,e)}constructor(t,e){this.axis=t,this.options=e,this.id=e.id;}render(){n(this,"render");let{axis:t,options:e}=this,{horiz:i,logarithmic:s}=t,{color:o,events:a,zIndex:c=0}=e,p={},u=t.chart.renderer,g=e.to,f=e.from,m=e.value,x=e.borderWidth,y=e.label,{label:b,svgElem:v}=this,S=[],k,C=r(f)&&r(g),M=r(m),w=!v,T={class:"highcharts-plot-"+(C?"band ":"line ")+(e.className||"")},A=C?"bands":"lines";if(!t.chart.styledMode&&(M?(T.stroke=o||"#999999",T["stroke-width"]=d(e.width,1),e.dashStyle&&(T.dashstyle=e.dashStyle)):C&&(T.fill=o||"#e6e9ff",x&&(T.stroke=e.borderColor,T["stroke-width"]=x))),p.zIndex=c,A+="-"+c,(k=t.plotLinesAndBandsGroups[A])||(t.plotLinesAndBandsGroups[A]=k=u.g("plot-"+A).attr(p).add()),v||(this.svgElem=v=u.path().attr(T).add(k)),r(m))S=t.getPlotLinePath({value:s?.log2lin(m)??m,lineWidth:v.strokeWidth(),acrossPanes:e.acrossPanes});else {if(!(r(f)&&r(g)))return;S=t.getPlotBandPath(s?.log2lin(f)??f,s?.log2lin(g)??g,e);}return !this.eventsAdded&&a&&(l(a,(t,e)=>{v?.on(e,t=>{a[e].apply(this,[t]);});}),this.eventsAdded=!0),(w||!v.d)&&S?.length?v.attr({d:S}):v&&(S?(v.show(),v.animate({d:S})):v.d&&(v.hide(),b&&(this.label=b=b.destroy()))),y&&(r(y.text)||r(y.formatter))&&S?.length&&t.width>0&&t.height>0&&!S.isFlat?(y=h({align:i&&C?"center":void 0,x:i?!C&&4:10,verticalAlign:!i&&C?"middle":void 0,y:i?C?16:10:C?6:-4,rotation:i&&!C?90:0},y),this.renderLabel(y,S,C,c)):b&&b.hide(),this}renderLabel(t,e,r,o){let a=this.axis,n=a.chart.renderer,l=this.label;l||(this.label=l=n.text(this.getLabelText(t),0,0,t.useHTML).attr({align:t.textAlign||t.align,rotation:t.rotation,class:"highcharts-plot-"+(r?"band":"line")+"-label "+(t.className||""),zIndex:o}),a.chart.styledMode||l.css(h({fontSize:"0.8em",textOverflow:"ellipsis"},t.style)),l.add());let d=e.xBounds||[e[0][1],e[1][1],r?e[2][1]:e[0][1]],c=e.yBounds||[e[0][2],e[1][2],r?e[2][2]:e[0][2]],p=s(d),u=s(c);if(l.align(t,!1,{x:p,y:u,width:i(d)-p,height:i(c)-u}),!l.alignValue||"left"===l.alignValue){let e=t.clip?a.width:a.chart.chartWidth;l.css({width:(90===l.rotation?a.height-(l.alignAttr.y-a.top):e-(l.alignAttr.x-a.left))+"px"});}l.show(!0);}getLabelText(t){return r(t.formatter)?t.formatter.call(this):t.text}destroy(){a(this.axis.plotLinesAndBands,this),delete this.axis,o(this);}}return c}),i(e,"Core/Tooltip.js",[e["Core/Templating.js"],e["Core/Globals.js"],e["Core/Renderer/RendererUtilities.js"],e["Core/Renderer/RendererRegistry.js"],e["Core/Utilities.js"]],function(t,e,i,s,r){var o;let{format:a}=t,{composed:n,doc:h,isSafari:l}=e,{distribute:d}=i,{addEvent:c,clamp:p,css:u,discardElement:g,extend:f,fireEvent:m,isArray:x,isNumber:y,isString:b,merge:v,pick:S,pushUnique:k,splat:C,syncTimeout:M}=r;class w{constructor(t,e,i){this.allowShared=!0,this.crosshairs=[],this.distance=0,this.isHidden=!0,this.isSticky=!1,this.now={},this.options={},this.outside=!1,this.chart=t,this.init(t,e),this.pointer=i;}bodyFormatter(t){return t.map(function(t){let e=t.series.tooltipOptions;return (e[(t.point.formatPrefix||"point")+"Formatter"]||t.point.tooltipFormatter).call(t.point,e[(t.point.formatPrefix||"point")+"Format"]||"")})}cleanSplit(t){this.chart.series.forEach(function(e){let i=e&&e.tt;i&&(!i.isActive||t?e.tt=i.destroy():i.isActive=!1);});}defaultFormatter(t){let e;let i=this.points||C(this);return (e=(e=[t.tooltipFooterHeaderFormatter(i[0])]).concat(t.bodyFormatter(i))).push(t.tooltipFooterHeaderFormatter(i[0],!0)),e}destroy(){this.label&&(this.label=this.label.destroy()),this.split&&(this.cleanSplit(!0),this.tt&&(this.tt=this.tt.destroy())),this.renderer&&(this.renderer=this.renderer.destroy(),g(this.container)),r.clearTimeout(this.hideTimer),r.clearTimeout(this.tooltipTimeout);}getAnchor(t,e){let i;let{chart:s,pointer:r}=this,o=s.inverted,a=s.plotTop,n=s.plotLeft;if((t=C(t))[0].series&&t[0].series.yAxis&&!t[0].series.yAxis.options.reversedStacks&&(t=t.slice().reverse()),this.followPointer&&e)void 0===e.chartX&&(e=r.normalize(e)),i=[e.chartX-n,e.chartY-a];else if(t[0].tooltipPos)i=t[0].tooltipPos;else {let s=0,r=0;t.forEach(function(t){let e=t.pos(!0);e&&(s+=e[0],r+=e[1]);}),s/=t.length,r/=t.length,this.shared&&t.length>1&&e&&(o?s=e.chartX:r=e.chartY),i=[s-n,r-a];}return i.map(Math.round)}getClassName(t,e,i){let s=this.options,r=t.series,o=r.options;return [s.className,"highcharts-label",i&&"highcharts-tooltip-header",e?"highcharts-tooltip-box":"highcharts-tooltip",!i&&"highcharts-color-"+S(t.colorIndex,r.colorIndex),o&&o.className].filter(b).join(" ")}getLabel(){let t=this,i=this.chart.styledMode,r=this.options,o=this.split&&this.allowShared,a=this.container,n=this.chart.renderer;if(this.label){let t=!this.label.hasClass("highcharts-label");(!o&&t||o&&!t)&&this.destroy();}if(!this.label){if(this.outside){let t=this.chart.options.chart.style,i=s.getRendererType();this.container=a=e.doc.createElement("div"),a.className="highcharts-tooltip-container",u(a,{position:"absolute",top:"1px",pointerEvents:"none",zIndex:Math.max(this.options.style.zIndex||0,(t&&t.zIndex||0)+3)}),this.renderer=n=new i(a,0,0,t,void 0,void 0,n.styledMode);}if(o?this.label=n.g("tooltip"):(this.label=n.label("",0,0,r.shape,void 0,void 0,r.useHTML,void 0,"tooltip").attr({padding:r.padding,r:r.borderRadius}),i||this.label.attr({fill:r.backgroundColor,"stroke-width":r.borderWidth||0}).css(r.style).css({pointerEvents:r.style.pointerEvents||(this.shouldStickOnContact()?"auto":"none")})),t.outside){let e=this.label,{xSetter:i,ySetter:s}=e;e.xSetter=function(s){i.call(e,t.distance),a&&(a.style.left=s+"px");},e.ySetter=function(i){s.call(e,t.distance),a&&(a.style.top=i+"px");};}this.label.attr({zIndex:8}).shadow(r.shadow).add();}return a&&!a.parentElement&&e.doc.body.appendChild(a),this.label}getPlayingField(){let{body:t,documentElement:e}=h,{chart:i,distance:s,outside:r}=this;return {width:r?Math.max(t.scrollWidth,e.scrollWidth,t.offsetWidth,e.offsetWidth,e.clientWidth)-2*s:i.chartWidth,height:r?Math.max(t.scrollHeight,e.scrollHeight,t.offsetHeight,e.offsetHeight,e.clientHeight):i.chartHeight}}getPosition(t,e,i){let{distance:s,chart:r,outside:o,pointer:a}=this,{inverted:n,plotLeft:h,plotTop:l,polar:d}=r,{plotX:c=0,plotY:p=0}=i,u={},g=n&&i.h||0,{height:f,width:m}=this.getPlayingField(),x=a.getChartPosition(),y=t=>t*x.scaleX,b=t=>t*x.scaleY,v=i=>{let a="x"===i;return [i,a?m:f,a?t:e].concat(o?[a?y(t):b(e),a?x.left-s+y(c+h):x.top-s+b(p+l),0,a?m:f]:[a?t:e,a?c+h:p+l,a?h:l,a?h+r.plotWidth:l+r.plotHeight])},k=v("y"),C=v("x"),M,w=!!i.negative;!d&&r.hoverSeries?.yAxis?.reversed&&(w=!w);let T=!this.followPointer&&S(i.ttBelow,!d&&!n===w),A=function(t,e,i,r,a,n,h){let l=o?"y"===t?b(s):y(s):s,d=(i-r)/2,c=r<a-s,p=a+s+r<e,f=a-l-i+d,m=a+l-d;if(T&&p)u[t]=m;else if(!T&&c)u[t]=f;else if(c)u[t]=Math.min(h-r,f-g<0?f:f-g);else {if(!p)return !1;u[t]=Math.max(n,m+g+i>e?m:m+g);}},P=function(t,e,i,r,o){if(o<s||o>e-s)return !1;o<i/2?u[t]=1:o>e-r/2?u[t]=e-r-2:u[t]=o-i/2;},L=function(t){[k,C]=[C,k],M=t;},O=()=>{!1!==A.apply(0,k)?!1!==P.apply(0,C)||M||(L(!0),O()):M?u.x=u.y=0:(L(!0),O());};return (n&&!d||this.len>1)&&L(),O(),u}hide(t){let e=this;r.clearTimeout(this.hideTimer),t=S(t,this.options.hideDelay),this.isHidden||(this.hideTimer=M(function(){let i=e.getLabel();e.getLabel().animate({opacity:0},{duration:t?150:t,complete:()=>{i.hide(),e.container&&e.container.remove();}}),e.isHidden=!0;},t));}init(t,e){this.chart=t,this.options=e,this.crosshairs=[],this.now={x:0,y:0},this.isHidden=!0,this.split=e.split&&!t.inverted&&!t.polar,this.shared=e.shared||this.split,this.outside=S(e.outside,!!(t.scrollablePixelsX||t.scrollablePixelsY));}shouldStickOnContact(t){return !!(!this.followPointer&&this.options.stickOnContact&&(!t||this.pointer.inClass(t.target,"highcharts-tooltip")))}move(t,e,i,s){let o=this,a=o.now,n=!1!==o.options.animation&&!o.isHidden&&(Math.abs(t-a.x)>1||Math.abs(e-a.y)>1),h=o.followPointer||o.len>1;f(a,{x:n?(2*a.x+t)/3:t,y:n?(a.y+e)/2:e,anchorX:h?void 0:n?(2*a.anchorX+i)/3:i,anchorY:h?void 0:n?(a.anchorY+s)/2:s}),o.getLabel().attr(a),o.drawTracker(),n&&(r.clearTimeout(this.tooltipTimeout),this.tooltipTimeout=setTimeout(function(){o&&o.move(t,e,i,s);},32));}refresh(t,e){let{chart:i,options:s,pointer:o,shared:n}=this,h=C(t),l=h[0],d=[],c=s.format,p=s.formatter||this.defaultFormatter,u=i.styledMode,g={};if(!s.enabled||!l.series)return;r.clearTimeout(this.hideTimer),this.allowShared=!(!x(t)&&t.series&&t.series.noSharedTooltip),this.followPointer=!this.split&&l.series.tooltipOptions.followPointer;let f=this.getAnchor(t,e),y=f[0],v=f[1];n&&this.allowShared?(o.applyInactiveState(h),h.forEach(function(t){t.setState("hover"),d.push(t.getLabelConfig());}),(g=l.getLabelConfig()).points=d):g=l.getLabelConfig(),this.len=d.length;let k=b(c)?a(c,g,i):p.call(g,this),M=l.series;if(this.distance=S(M.tooltipOptions.distance,16),!1===k)this.hide();else {if(this.split&&this.allowShared)this.renderSplit(k,h);else {let t=y,r=v;if(e&&o.isDirectTouch&&(t=e.chartX-i.plotLeft,r=e.chartY-i.plotTop),i.polar||!1===M.options.clip||h.some(e=>o.isDirectTouch||e.series.shouldShowTooltip(t,r))){let t=this.getLabel();(!s.style.width||u)&&t.css({width:(this.outside?this.getPlayingField():i.spacingBox).width+"px"}),t.attr({text:k&&k.join?k.join(""):k}),t.addClass(this.getClassName(l),!0),u||t.attr({stroke:s.borderColor||l.color||M.color||"#666666"}),this.updatePosition({plotX:y,plotY:v,negative:l.negative,ttBelow:l.ttBelow,h:f[2]||0});}else {this.hide();return}}this.isHidden&&this.label&&this.label.attr({opacity:1}).show(),this.isHidden=!1;}m(this,"refresh");}renderSplit(t,e){let i=this,{chart:s,chart:{chartWidth:r,chartHeight:o,plotHeight:a,plotLeft:n,plotTop:c,scrollablePixelsY:u=0,scrollablePixelsX:g,styledMode:m},distance:x,options:y,options:{positioner:v},pointer:k}=i,{scrollLeft:C=0,scrollTop:M=0}=s.scrollablePlotArea?.scrollingContainer||{},w=i.outside&&"number"!=typeof g?h.documentElement.getBoundingClientRect():{left:C,right:C+r,top:M,bottom:M+o},T=i.getLabel(),A=this.renderer||s.renderer,P=!!(s.xAxis[0]&&s.xAxis[0].opposite),{left:L,top:O}=k.getChartPosition(),D=c+M,E=0,I=a-u;function j(t,e,s,r,o=!0){let a,n;return s?(a=P?0:I,n=p(t-r/2,w.left,w.right-r-(i.outside?L:0))):(a=e-D,n=p(n=o?t-r-x:t+x,o?n:w.left,w.right)),{x:n,y:a}}b(t)&&(t=[!1,t]);let B=t.slice(0,e.length+1).reduce(function(t,s,r){if(!1!==s&&""!==s){let o=e[r-1]||{isHeader:!0,plotX:e[0].plotX,plotY:a,series:{}},h=o.isHeader,l=h?i:o.series,d=l.tt=function(t,e,s){let r=t,{isHeader:o,series:a}=e;if(!r){let t={padding:y.padding,r:y.borderRadius};m||(t.fill=y.backgroundColor,t["stroke-width"]=y.borderWidth??1),r=A.label("",0,0,y[o?"headerShape":"shape"],void 0,void 0,y.useHTML).addClass(i.getClassName(e,!0,o)).attr(t).add(T);}return r.isActive=!0,r.attr({text:s}),m||r.css(y.style).attr({stroke:y.borderColor||e.color||a.color||"#333333"}),r}(l.tt,o,s.toString()),u=d.getBBox(),g=u.width+d.strokeWidth();h&&(E=u.height,I+=E,P&&(D-=E));let{anchorX:f,anchorY:b}=function(t){let e,i;let{isHeader:s,plotX:r=0,plotY:o=0,series:h}=t;if(s)e=Math.max(n+r,n),i=c+a/2;else {let{xAxis:t,yAxis:s}=h;e=t.pos+p(r,-x,t.len+x),h.shouldShowTooltip(0,s.pos-c+o,{ignoreX:!0})&&(i=s.pos+o);}return {anchorX:e=p(e,w.left-x,w.right+x),anchorY:i}}(o);if("number"==typeof b){let e=u.height+1,s=v?v.call(i,g,e,o):j(f,b,h,g);t.push({align:v?0:void 0,anchorX:f,anchorY:b,boxWidth:g,point:o,rank:S(s.rank,h?1:0),size:e,target:s.y,tt:d,x:s.x});}else d.isActive=!1;}return t},[]);!v&&B.some(t=>{let{outside:e}=i,s=(e?L:0)+t.anchorX;return s<w.left&&s+t.boxWidth<w.right||s<L-w.left+t.boxWidth&&w.right-s>s})&&(B=B.map(t=>{let{x:e,y:i}=j(t.anchorX,t.anchorY,t.point.isHeader,t.boxWidth,!1);return f(t,{target:i,x:e})})),i.cleanSplit(),d(B,I);let R={left:L,right:L};B.forEach(function(t){let{x:e,boxWidth:s,isHeader:r}=t;!r&&(i.outside&&L+e<R.left&&(R.left=L+e),!r&&i.outside&&R.left+s>R.right&&(R.right=L+e));}),B.forEach(function(t){let{x:e,anchorX:s,anchorY:r,pos:o,point:{isHeader:a}}=t,n={visibility:void 0===o?"hidden":"inherit",x:e,y:(o||0)+D,anchorX:s,anchorY:r};if(i.outside&&e<s){let t=L-R.left;t>0&&(a||(n.x=e+t,n.anchorX=s+t),a&&(n.x=(R.right-R.left)/2,n.anchorX=s+t));}t.tt.attr(n);});let{container:z,outside:N,renderer:W}=i;if(N&&z&&W){let{width:t,height:e,x:i,y:s}=T.getBBox();W.setSize(t+i,e+s,!1),z.style.left=R.left+"px",z.style.top=O+"px";}l&&T.attr({opacity:1===T.opacity?.999:1});}drawTracker(){if(!this.shouldStickOnContact()){this.tracker&&(this.tracker=this.tracker.destroy());return}let t=this.chart,e=this.label,i=this.shared?t.hoverPoints:t.hoverPoint;if(!e||!i)return;let s={x:0,y:0,width:0,height:0},r=this.getAnchor(i),o=e.getBBox();r[0]+=t.plotLeft-(e.translateX||0),r[1]+=t.plotTop-(e.translateY||0),s.x=Math.min(0,r[0]),s.y=Math.min(0,r[1]),s.width=r[0]<0?Math.max(Math.abs(r[0]),o.width-r[0]):Math.max(Math.abs(r[0]),o.width),s.height=r[1]<0?Math.max(Math.abs(r[1]),o.height-Math.abs(r[1])):Math.max(Math.abs(r[1]),o.height),this.tracker?this.tracker.attr(s):(this.tracker=e.renderer.rect(s).addClass("highcharts-tracker").add(e),t.styledMode||this.tracker.attr({fill:"rgba(0,0,0,0)"}));}styledModeFormat(t){return t.replace('style="font-size: 0.8em"','class="highcharts-header"').replace(/style="color:{(point|series)\.color}"/g,'class="highcharts-color-{$1.colorIndex} {series.options.className} {point.options.className}"')}tooltipFooterHeaderFormatter(t,e){let i=t.series,s=i.tooltipOptions,r=i.xAxis,o=r&&r.dateTime,n={isFooter:e,labelConfig:t},h=s.xDateFormat,l=s[e?"footerFormat":"headerFormat"];return m(this,"headerFormatter",n,function(e){o&&!h&&y(t.key)&&(h=o.getXDateFormat(t.key,s.dateTimeLabelFormats)),o&&h&&(t.point&&t.point.tooltipDateKeys||["key"]).forEach(function(t){l=l.replace("{point."+t+"}","{point."+t+":"+h+"}");}),i.chart.styledMode&&(l=this.styledModeFormat(l)),e.text=a(l,{point:t,series:i},this.chart);}),n.text}update(t){this.destroy(),this.init(this.chart,v(!0,this.options,t));}updatePosition(t){let{chart:e,container:i,distance:s,options:r,pointer:o,renderer:a}=this,{height:n=0,width:h=0}=this.getLabel(),{left:l,top:d,scaleX:c,scaleY:p}=o.getChartPosition(),g=(r.positioner||this.getPosition).call(this,h,n,t),f=(t.plotX||0)+e.plotLeft,m=(t.plotY||0)+e.plotTop,x;a&&i&&(r.positioner&&(g.x+=l-s,g.y+=d-s),x=(r.borderWidth||0)+2*s+2,a.setSize(h+x,n+x,!1),(1!==c||1!==p)&&(u(i,{transform:`scale(${c}, ${p})`}),f*=c,m*=p),f+=l-g.x,m+=d-g.y),this.move(Math.round(g.x),Math.round(g.y||0),f,m);}}return (o=w||(w={})).compose=function(t){k(n,"Core.Tooltip")&&c(t,"afterInit",function(){let t=this.chart;t.options.tooltip&&(t.tooltip=new o(t,t.options.tooltip,this));});},w}),i(e,"Core/Series/Point.js",[e["Core/Renderer/HTML/AST.js"],e["Core/Animation/AnimationUtilities.js"],e["Core/Defaults.js"],e["Core/Templating.js"],e["Core/Utilities.js"]],function(t,e,i,s,r){let{animObject:o}=e,{defaultOptions:a}=i,{format:n}=s,{addEvent:h,erase:l,extend:d,fireEvent:c,getNestedProperty:p,isArray:u,isFunction:g,isNumber:f,isObject:m,merge:x,pick:y,syncTimeout:b,removeEvent:v,uniqueKey:S}=r;class k{animateBeforeDestroy(){let t=this,e={x:t.startXPos,opacity:0},i=t.getGraphicalProps();i.singular.forEach(function(i){t[i]=t[i].animate("dataLabel"===i?{x:t[i].startXPos,y:t[i].startYPos,opacity:0}:e);}),i.plural.forEach(function(e){t[e].forEach(function(e){e.element&&e.animate(d({x:t.startXPos},e.startYPos?{x:e.startXPos,y:e.startYPos}:{}));});});}applyOptions(t,e){let i=this.series,s=i.options.pointValKey||i.pointValKey;return d(this,t=k.prototype.optionsToObject.call(this,t)),this.options=this.options?d(this.options,t):t,t.group&&delete this.group,t.dataLabels&&delete this.dataLabels,s&&(this.y=k.prototype.getNestedProperty.call(this,s)),this.selected&&(this.state="select"),"name"in this&&void 0===e&&i.xAxis&&i.xAxis.hasNames&&(this.x=i.xAxis.nameToX(this)),void 0===this.x&&i?void 0===e?this.x=i.autoIncrement():this.x=e:f(t.x)&&i.options.relativeXValue&&(this.x=i.autoIncrement(t.x)),this.isNull=this.isValid&&!this.isValid(),this.formatPrefix=this.isNull?"null":"point",this}destroy(){if(!this.destroyed){let t=this,e=t.series,i=e.chart,s=e.options.dataSorting,r=i.hoverPoints,a=o(t.series.chart.renderer.globalAnimation),n=()=>{for(let e in (t.graphic||t.graphics||t.dataLabel||t.dataLabels)&&(v(t),t.destroyElements()),t)delete t[e];};t.legendItem&&i.legend.destroyItem(t),r&&(t.setState(),l(r,t),r.length||(i.hoverPoints=null)),t===i.hoverPoint&&t.onMouseOut(),s&&s.enabled?(this.animateBeforeDestroy(),b(n,a.duration)):n(),i.pointCount--;}this.destroyed=!0;}destroyElements(t){let e=this,i=e.getGraphicalProps(t);i.singular.forEach(function(t){e[t]=e[t].destroy();}),i.plural.forEach(function(t){e[t].forEach(function(t){t&&t.element&&t.destroy();}),delete e[t];});}firePointEvent(t,e,i){let s=this,r=this.series.options;s.manageEvent(t),"click"===t&&r.allowPointSelect&&(i=function(t){!s.destroyed&&s.select&&s.select(null,t.ctrlKey||t.metaKey||t.shiftKey);}),c(s,t,e,i);}getClassName(){return "highcharts-point"+(this.selected?" highcharts-point-select":"")+(this.negative?" highcharts-negative":"")+(this.isNull?" highcharts-null-point":"")+(void 0!==this.colorIndex?" highcharts-color-"+this.colorIndex:"")+(this.options.className?" "+this.options.className:"")+(this.zone&&this.zone.className?" "+this.zone.className.replace("highcharts-negative",""):"")}getGraphicalProps(t){let e,i;let s=this,r=[],o={singular:[],plural:[]};for((t=t||{graphic:1,dataLabel:1}).graphic&&r.push("graphic","connector"),t.dataLabel&&r.push("dataLabel","dataLabelPath","dataLabelUpper"),i=r.length;i--;)s[e=r[i]]&&o.singular.push(e);return ["graphic","dataLabel"].forEach(function(e){let i=e+"s";t[e]&&s[i]&&o.plural.push(i);}),o}getLabelConfig(){return {x:this.category,y:this.y,color:this.color,colorIndex:this.colorIndex,key:this.name||this.category,series:this.series,point:this,percentage:this.percentage,total:this.total||this.stackTotal}}getNestedProperty(t){return t?0===t.indexOf("custom.")?p(t,this.options):this[t]:void 0}getZone(){let t=this.series,e=t.zones,i=t.zoneAxis||"y",s,r=0;for(s=e[0];this[i]>=s.value;)s=e[++r];return this.nonZonedColor||(this.nonZonedColor=this.color),s&&s.color&&!this.options.color?this.color=s.color:this.color=this.nonZonedColor,s}hasNewShapeType(){return (this.graphic&&(this.graphic.symbolName||this.graphic.element.nodeName))!==this.shapeType}constructor(t,e,i){this.formatPrefix="point",this.visible=!0,this.series=t,this.applyOptions(e,i),this.id??(this.id=S()),this.resolveColor(),t.chart.pointCount++,c(this,"afterInit");}isValid(){return (f(this.x)||this.x instanceof Date)&&f(this.y)}optionsToObject(t){let e=this.series,i=e.options.keys,s=i||e.pointArrayMap||["y"],r=s.length,o={},a,n=0,h=0;if(f(t)||null===t)o[s[0]]=t;else if(u(t))for(!i&&t.length>r&&("string"==(a=typeof t[0])?o.name=t[0]:"number"===a&&(o.x=t[0]),n++);h<r;)i&&void 0===t[n]||(s[h].indexOf(".")>0?k.prototype.setNestedProperty(o,t[n],s[h]):o[s[h]]=t[n]),n++,h++;else "object"==typeof t&&(o=t,t.dataLabels&&(e.hasDataLabels=()=>!0),t.marker&&(e._hasPointMarkers=!0));return o}pos(t,e=this.plotY){if(!this.destroyed){let{plotX:i,series:s}=this,{chart:r,xAxis:o,yAxis:a}=s,n=0,h=0;if(f(i)&&f(e))return t&&(n=o?o.pos:r.plotLeft,h=a?a.pos:r.plotTop),r.inverted&&o&&a?[a.len-e+h,o.len-i+n]:[i+n,e+h]}}resolveColor(){let t=this.series,e=t.chart.options.chart,i=t.chart.styledMode,s,r,o=e.colorCount,a;delete this.nonZonedColor,t.options.colorByPoint?(i||(s=(r=t.options.colors||t.chart.options.colors)[t.colorCounter],o=r.length),a=t.colorCounter,t.colorCounter++,t.colorCounter===o&&(t.colorCounter=0)):(i||(s=t.color),a=t.colorIndex),this.colorIndex=y(this.options.colorIndex,a),this.color=y(this.options.color,s);}setNestedProperty(t,e,i){return i.split(".").reduce(function(t,i,s,r){let o=r.length-1===s;return t[i]=o?e:m(t[i],!0)?t[i]:{},t[i]},t),t}shouldDraw(){return !this.isNull}tooltipFormatter(t){let e=this.series,i=e.tooltipOptions,s=y(i.valueDecimals,""),r=i.valuePrefix||"",o=i.valueSuffix||"";return e.chart.styledMode&&(t=e.chart.tooltip.styledModeFormat(t)),(e.pointArrayMap||["y"]).forEach(function(e){e="{point."+e,(r||o)&&(t=t.replace(RegExp(e+"}","g"),r+e+"}"+o)),t=t.replace(RegExp(e+"}","g"),e+":,."+s+"f}");}),n(t,{point:this,series:this.series},e.chart)}update(t,e,i,s){let r;let o=this,a=o.series,n=o.graphic,h=a.chart,l=a.options;function d(){o.applyOptions(t);let s=n&&o.hasMockGraphic,d=null===o.y?!s:s;n&&d&&(o.graphic=n.destroy(),delete o.hasMockGraphic),m(t,!0)&&(n&&n.element&&t&&t.marker&&void 0!==t.marker.symbol&&(o.graphic=n.destroy()),t?.dataLabels&&o.dataLabel&&(o.dataLabel=o.dataLabel.destroy())),r=o.index,a.updateParallelArrays(o,r),l.data[r]=m(l.data[r],!0)||m(t,!0)?o.options:y(t,l.data[r]),a.isDirty=a.isDirtyData=!0,!a.fixedBox&&a.hasCartesianSeries&&(h.isDirtyBox=!0),"point"===l.legendType&&(h.isDirtyLegend=!0),e&&h.redraw(i);}e=y(e,!0),!1===s?d():o.firePointEvent("update",{options:t},d);}remove(t,e){this.series.removePoint(this.series.data.indexOf(this),t,e);}select(t,e){let i=this,s=i.series,r=s.chart;t=y(t,!i.selected),this.selectedStaging=t,i.firePointEvent(t?"select":"unselect",{accumulate:e},function(){i.selected=i.options.selected=t,s.options.data[s.data.indexOf(i)]=i.options,i.setState(t&&"select"),e||r.getSelectedPoints().forEach(function(t){let e=t.series;t.selected&&t!==i&&(t.selected=t.options.selected=!1,e.options.data[e.data.indexOf(t)]=t.options,t.setState(r.hoverPoints&&e.options.inactiveOtherPoints?"inactive":""),t.firePointEvent("unselect"));});}),delete this.selectedStaging;}onMouseOver(t){let{inverted:e,pointer:i}=this.series.chart;i&&(t=t?i.normalize(t):i.getChartCoordinatesFromPoint(this,e),i.runPointActions(t,this));}onMouseOut(){let t=this.series.chart;this.firePointEvent("mouseOut"),this.series.options.inactiveOtherPoints||(t.hoverPoints||[]).forEach(function(t){t.setState();}),t.hoverPoints=t.hoverPoint=null;}manageEvent(t){let e=x(this.series.options.point,this.options),i=e.events?.[t];g(i)&&(!this.hcEvents?.[t]||this.hcEvents?.[t]?.map(t=>t.fn).indexOf(i)===-1)?(h(this,t,i),this.hasImportedEvents=!0):this.hasImportedEvents&&!i&&this.hcEvents?.[t]&&(v(this,t),delete this.hcEvents[t],Object.keys(this.hcEvents)||(this.hasImportedEvents=!1));}setState(e,i){let s=this.series,r=this.state,o=s.options.states[e||"normal"]||{},n=a.plotOptions[s.type].marker&&s.options.marker,h=n&&!1===n.enabled,l=n&&n.states&&n.states[e||"normal"]||{},p=!1===l.enabled,u=this.marker||{},g=s.chart,m=n&&s.markerAttribs,x=s.halo,b,v,S,k=s.stateMarkerGraphic,C;if((e=e||"")===this.state&&!i||this.selected&&"select"!==e||!1===o.enabled||e&&(p||h&&!1===l.enabled)||e&&u.states&&u.states[e]&&!1===u.states[e].enabled)return;if(this.state=e,m&&(b=s.markerAttribs(this,e)),this.graphic&&!this.hasMockGraphic){if(r&&this.graphic.removeClass("highcharts-point-"+r),e&&this.graphic.addClass("highcharts-point-"+e),!g.styledMode){v=s.pointAttribs(this,e),S=y(g.options.chart.animation,o.animation);let t=v.opacity;s.options.inactiveOtherPoints&&f(t)&&(this.dataLabels||[]).forEach(function(e){e&&!e.hasClass("highcharts-data-label-hidden")&&(e.animate({opacity:t},S),e.connector&&e.connector.animate({opacity:t},S));}),this.graphic.animate(v,S);}b&&this.graphic.animate(b,y(g.options.chart.animation,l.animation,n.animation)),k&&k.hide();}else e&&l&&(C=u.symbol||s.symbol,k&&k.currentSymbol!==C&&(k=k.destroy()),b&&(k?k[i?"animate":"attr"]({x:b.x,y:b.y}):C&&(s.stateMarkerGraphic=k=g.renderer.symbol(C,b.x,b.y,b.width,b.height).add(s.markerGroup),k.currentSymbol=C)),!g.styledMode&&k&&"inactive"!==this.state&&k.attr(s.pointAttribs(this,e))),k&&(k[e&&this.isInside?"show":"hide"](),k.element.point=this,k.addClass(this.getClassName(),!0));let M=o.halo,w=this.graphic||k,T=w&&w.visibility||"inherit";M&&M.size&&w&&"hidden"!==T&&!this.isCluster?(x||(s.halo=x=g.renderer.path().add(w.parentGroup)),x.show()[i?"animate":"attr"]({d:this.haloPath(M.size)}),x.attr({class:"highcharts-halo highcharts-color-"+y(this.colorIndex,s.colorIndex)+(this.className?" "+this.className:""),visibility:T,zIndex:-1}),x.point=this,g.styledMode||x.attr(d({fill:this.color||s.color,"fill-opacity":M.opacity},t.filterUserAttributes(M.attributes||{})))):x&&x.point&&x.point.haloPath&&x.animate({d:x.point.haloPath(0)},null,x.hide),c(this,"afterSetState",{state:e});}haloPath(t){let e=this.pos();return e?this.series.chart.renderer.symbols.circle(Math.floor(e[0])-t,e[1]-t,2*t,2*t):[]}}return k}),i(e,"Core/Pointer.js",[e["Core/Color/Color.js"],e["Core/Globals.js"],e["Core/Utilities.js"]],function(t,e,i){var s;let{parse:r}=t,{charts:o,composed:a,isTouchDevice:n}=e,{addEvent:h,attr:l,css:d,extend:c,find:p,fireEvent:u,isNumber:g,isObject:f,objectEach:m,offset:x,pick:y,pushUnique:b,splat:v}=i;class S{applyInactiveState(t){let e=[],i;(t||[]).forEach(function(t){i=t.series,e.push(i),i.linkedParent&&e.push(i.linkedParent),i.linkedSeries&&(e=e.concat(i.linkedSeries)),i.navigatorSeries&&e.push(i.navigatorSeries);}),this.chart.series.forEach(function(t){-1===e.indexOf(t)?t.setState("inactive",!0):t.options.inactiveOtherPoints&&t.setAllPointsToState("inactive");});}destroy(){let t=this;this.eventsToUnbind.forEach(t=>t()),this.eventsToUnbind=[],!e.chartCount&&(S.unbindDocumentMouseUp&&(S.unbindDocumentMouseUp=S.unbindDocumentMouseUp()),S.unbindDocumentTouchEnd&&(S.unbindDocumentTouchEnd=S.unbindDocumentTouchEnd())),clearInterval(t.tooltipTimeout),m(t,function(e,i){t[i]=void 0;});}getSelectionMarkerAttrs(t,e){let i={args:{chartX:t,chartY:e},attrs:{},shapeType:"rect"};return u(this,"getSelectionMarkerAttrs",i,i=>{let s;let{chart:r,zoomHor:o,zoomVert:a}=this,{mouseDownX:n=0,mouseDownY:h=0}=r,l=i.attrs;l.x=r.plotLeft,l.y=r.plotTop,l.width=o?1:r.plotWidth,l.height=a?1:r.plotHeight,o&&(s=t-n,l.width=Math.max(1,Math.abs(s)),l.x=(s>0?0:s)+n),a&&(s=e-h,l.height=Math.max(1,Math.abs(s)),l.y=(s>0?0:s)+h);}),i}drag(t){let{chart:e}=this,{mouseDownX:i=0,mouseDownY:s=0}=e,{panning:o,panKey:a,selectionMarkerFill:n}=e.options.chart,h=e.plotLeft,l=e.plotTop,d=e.plotWidth,c=e.plotHeight,p=f(o)?o.enabled:o,u=a&&t[`${a}Key`],g=t.chartX,m=t.chartY,x,y=this.selectionMarker;if((!y||!y.touch)&&(g<h?g=h:g>h+d&&(g=h+d),m<l?m=l:m>l+c&&(m=l+c),this.hasDragged=Math.sqrt(Math.pow(i-g,2)+Math.pow(s-m,2)),this.hasDragged>10)){x=e.isInsidePlot(i-h,s-l,{visiblePlotOnly:!0});let{shapeType:a,attrs:d}=this.getSelectionMarkerAttrs(g,m);(e.hasCartesianSeries||e.mapView)&&this.hasZoom&&x&&!u&&!y&&(this.selectionMarker=y=e.renderer[a](),y.attr({class:"highcharts-selection-marker",zIndex:7}).add(),e.styledMode||y.attr({fill:n||r("#334eff").setOpacity(.25).get()})),y&&y.attr(d),x&&!y&&p&&e.pan(t,o);}}dragStart(t){let e=this.chart;e.mouseIsDown=t.type,e.cancelClick=!1,e.mouseDownX=t.chartX,e.mouseDownY=t.chartY;}getSelectionBox(t){let e={args:{marker:t},result:t.getBBox()};return u(this,"getSelectionBox",e),e.result}drop(t){let e;let{chart:i,selectionMarker:s}=this;for(let t of i.axes)t.isPanning&&(t.isPanning=!1,(t.options.startOnTick||t.options.endOnTick||t.series.some(t=>t.boosted))&&(t.forceRedraw=!0,t.setExtremes(t.userMin,t.userMax,!1),e=!0));if(e&&i.redraw(),s&&t){if(this.hasDragged){let e=this.getSelectionBox(s);i.transform({axes:i.axes.filter(t=>t.zoomEnabled&&("xAxis"===t.coll&&this.zoomX||"yAxis"===t.coll&&this.zoomY)),selection:{originalEvent:t,xAxis:[],yAxis:[],...e},from:e});}g(i.index)&&(this.selectionMarker=s.destroy());}i&&g(i.index)&&(d(i.container,{cursor:i._cursor}),i.cancelClick=this.hasDragged>10,i.mouseIsDown=!1,this.hasDragged=0,this.pinchDown=[]);}findNearestKDPoint(t,e,i){let s;return t.forEach(function(t){let r=!(t.noSharedTooltip&&e)&&0>t.options.findNearestPointBy.indexOf("y"),o=t.searchPoint(i,r);f(o,!0)&&o.series&&(!f(s,!0)||function(t,i){let s=t.distX-i.distX,r=t.dist-i.dist,o=i.series.group?.zIndex-t.series.group?.zIndex;return 0!==s&&e?s:0!==r?r:0!==o?o:t.series.index>i.series.index?-1:1}(s,o)>0)&&(s=o);}),s}getChartCoordinatesFromPoint(t,e){let{xAxis:i,yAxis:s}=t.series,r=t.shapeArgs;if(i&&s){let o=t.clientX??t.plotX??0,a=t.plotY||0;return t.isNode&&r&&g(r.x)&&g(r.y)&&(o=r.x,a=r.y),e?{chartX:s.len+s.pos-a,chartY:i.len+i.pos-o}:{chartX:o+i.pos,chartY:a+s.pos}}if(r&&r.x&&r.y)return {chartX:r.x,chartY:r.y}}getChartPosition(){if(this.chartPosition)return this.chartPosition;let{container:t}=this.chart,e=x(t);this.chartPosition={left:e.left,top:e.top,scaleX:1,scaleY:1};let{offsetHeight:i,offsetWidth:s}=t;return s>2&&i>2&&(this.chartPosition.scaleX=e.width/s,this.chartPosition.scaleY=e.height/i),this.chartPosition}getCoordinates(t){let e={xAxis:[],yAxis:[]};for(let i of this.chart.axes)e[i.isXAxis?"xAxis":"yAxis"].push({axis:i,value:i.toValue(t[i.horiz?"chartX":"chartY"])});return e}getHoverData(t,e,i,s,r,o){let a=[],n=function(t){return t.visible&&!(!r&&t.directTouch)&&y(t.options.enableMouseTracking,!0)},h=e,l,d={chartX:o?o.chartX:void 0,chartY:o?o.chartY:void 0,shared:r};u(this,"beforeGetHoverData",d),l=h&&!h.stickyTracking?[h]:i.filter(t=>t.stickyTracking&&(d.filter||n)(t));let c=s&&t||!o?t:this.findNearestKDPoint(l,r,o);return h=c&&c.series,c&&(r&&!h.noSharedTooltip?(l=i.filter(function(t){return d.filter?d.filter(t):n(t)&&!t.noSharedTooltip})).forEach(function(t){let e=p(t.points,function(t){return t.x===c.x&&!t.isNull});f(e)&&(t.boosted&&t.boost&&(e=t.boost.getPoint(e)),a.push(e));}):a.push(c)),u(this,"afterGetHoverData",d={hoverPoint:c}),{hoverPoint:d.hoverPoint,hoverSeries:h,hoverPoints:a}}getPointFromEvent(t){let e=t.target,i;for(;e&&!i;)i=e.point,e=e.parentNode;return i}onTrackerMouseOut(t){let e=this.chart,i=t.relatedTarget,s=e.hoverSeries;this.isDirectTouch=!1,!s||!i||s.stickyTracking||this.inClass(i,"highcharts-tooltip")||this.inClass(i,"highcharts-series-"+s.index)&&this.inClass(i,"highcharts-tracker")||s.onMouseOut();}inClass(t,e){let i=t,s;for(;i;){if(s=l(i,"class")){if(-1!==s.indexOf(e))return !0;if(-1!==s.indexOf("highcharts-container"))return !1}i=i.parentElement;}}constructor(t,e){this.hasDragged=0,this.pointerCaptureEventsToUnbind=[],this.eventsToUnbind=[],this.options=e,this.chart=t,this.runChartClick=!!e.chart.events?.click,this.pinchDown=[],this.setDOMEvents(),u(this,"afterInit");}normalize(t,e){let i=t.touches,s=i?i.length?i.item(0):y(i.changedTouches,t.changedTouches)[0]:t;e||(e=this.getChartPosition());let r=s.pageX-e.left,o=s.pageY-e.top;return c(t,{chartX:Math.round(r/=e.scaleX),chartY:Math.round(o/=e.scaleY)})}onContainerClick(t){let e=this.chart,i=e.hoverPoint,s=this.normalize(t),r=e.plotLeft,o=e.plotTop;!e.cancelClick&&(i&&this.inClass(s.target,"highcharts-tracker")?(u(i.series,"click",c(s,{point:i})),e.hoverPoint&&i.firePointEvent("click",s)):(c(s,this.getCoordinates(s)),e.isInsidePlot(s.chartX-r,s.chartY-o,{visiblePlotOnly:!0})&&u(e,"click",s)));}onContainerMouseDown(t){let i=(1&(t.buttons||t.button))==1;t=this.normalize(t),e.isFirefox&&0!==t.button&&this.onContainerMouseMove(t),(void 0===t.button||i)&&(this.zoomOption(t),i&&t.preventDefault?.(),this.dragStart(t));}onContainerMouseLeave(t){let{pointer:e}=o[y(S.hoverChartIndex,-1)]||{};t=this.normalize(t),this.onContainerMouseMove(t),e&&t.relatedTarget&&!this.inClass(t.relatedTarget,"highcharts-tooltip")&&(e.reset(),e.chartPosition=void 0);}onContainerMouseEnter(){delete this.chartPosition;}onContainerMouseMove(t){let e=this.chart,i=e.tooltip,s=this.normalize(t);this.setHoverChartIndex(t),("mousedown"===e.mouseIsDown||this.touchSelect(s))&&this.drag(s),!e.openMenu&&(this.inClass(s.target,"highcharts-tracker")||e.isInsidePlot(s.chartX-e.plotLeft,s.chartY-e.plotTop,{visiblePlotOnly:!0}))&&!(i&&i.shouldStickOnContact(s))&&(this.inClass(s.target,"highcharts-no-tooltip")?this.reset(!1,0):this.runPointActions(s));}onDocumentTouchEnd(t){this.onDocumentMouseUp(t);}onContainerTouchMove(t){this.touchSelect(t)?this.onContainerMouseMove(t):this.touch(t);}onContainerTouchStart(t){this.touchSelect(t)?this.onContainerMouseDown(t):(this.zoomOption(t),this.touch(t,!0));}onDocumentMouseMove(t){let e=this.chart,i=e.tooltip,s=this.chartPosition,r=this.normalize(t,s);!s||e.isInsidePlot(r.chartX-e.plotLeft,r.chartY-e.plotTop,{visiblePlotOnly:!0})||i&&i.shouldStickOnContact(r)||this.inClass(r.target,"highcharts-tracker")||this.reset();}onDocumentMouseUp(t){o[y(S.hoverChartIndex,-1)]?.pointer?.drop(t);}pinch(t){let e=this,{chart:i,hasZoom:s,lastTouches:r}=e,o=[].map.call(t.touches||[],t=>e.normalize(t)),a=o.length,n=1===a&&(e.inClass(t.target,"highcharts-tracker")&&i.runTrackerClick||e.runChartClick),h=i.tooltip,l=1===a&&y(h?.options.followTouchMove,!0);a>1?e.initiated=!0:l&&(e.initiated=!1),s&&e.initiated&&!n&&!1!==t.cancelable&&t.preventDefault(),"touchstart"===t.type?(e.pinchDown=o,e.res=!0):l?this.runPointActions(e.normalize(t)):r&&(u(i,"touchpan",{originalEvent:t,touches:o},()=>{let e=t=>{let e=t[0],i=t[1]||e;return {x:e.chartX,y:e.chartY,width:i.chartX-e.chartX,height:i.chartY-e.chartY}};i.transform({axes:i.axes.filter(t=>t.zoomEnabled&&(this.zoomHor&&t.horiz||this.zoomVert&&!t.horiz)),to:e(o),from:e(r),trigger:t.type});}),e.res&&(e.res=!1,this.reset(!1,0))),e.lastTouches=o;}reset(t,e){let i=this.chart,s=i.hoverSeries,r=i.hoverPoint,o=i.hoverPoints,a=i.tooltip,n=a&&a.shared?o:r;t&&n&&v(n).forEach(function(e){e.series.isCartesian&&void 0===e.plotX&&(t=!1);}),t?a&&n&&v(n).length&&(a.refresh(n),a.shared&&o?o.forEach(function(t){t.setState(t.state,!0),t.series.isCartesian&&(t.series.xAxis.crosshair&&t.series.xAxis.drawCrosshair(null,t),t.series.yAxis.crosshair&&t.series.yAxis.drawCrosshair(null,t));}):r&&(r.setState(r.state,!0),i.axes.forEach(function(t){t.crosshair&&r.series[t.coll]===t&&t.drawCrosshair(null,r);}))):(r&&r.onMouseOut(),o&&o.forEach(function(t){t.setState();}),s&&s.onMouseOut(),a&&a.hide(e),this.unDocMouseMove&&(this.unDocMouseMove=this.unDocMouseMove()),i.axes.forEach(function(t){t.hideCrosshair();}),i.hoverPoints=i.hoverPoint=void 0);}runPointActions(t,e,i){let s=this.chart,r=s.series,a=s.tooltip&&s.tooltip.options.enabled?s.tooltip:void 0,n=!!a&&a.shared,l=e||s.hoverPoint,d=l&&l.series||s.hoverSeries,c=(!t||"touchmove"!==t.type)&&(!!e||d&&d.directTouch&&this.isDirectTouch),u=this.getHoverData(l,d,r,c,n,t);l=u.hoverPoint,d=u.hoverSeries;let g=u.hoverPoints,f=d&&d.tooltipOptions.followPointer&&!d.tooltipOptions.split,m=n&&d&&!d.noSharedTooltip;if(l&&(i||l!==s.hoverPoint||a&&a.isHidden)){if((s.hoverPoints||[]).forEach(function(t){-1===g.indexOf(t)&&t.setState();}),s.hoverSeries!==d&&d.onMouseOver(),this.applyInactiveState(g),(g||[]).forEach(function(t){t.setState("hover");}),s.hoverPoint&&s.hoverPoint.firePointEvent("mouseOut"),!l.series)return;s.hoverPoints=g,s.hoverPoint=l,l.firePointEvent("mouseOver",void 0,()=>{a&&l&&a.refresh(m?g:l,t);});}else if(f&&a&&!a.isHidden){let e=a.getAnchor([{}],t);s.isInsidePlot(e[0],e[1],{visiblePlotOnly:!0})&&a.updatePosition({plotX:e[0],plotY:e[1]});}this.unDocMouseMove||(this.unDocMouseMove=h(s.container.ownerDocument,"mousemove",t=>o[S.hoverChartIndex??-1]?.pointer?.onDocumentMouseMove(t)),this.eventsToUnbind.push(this.unDocMouseMove)),s.axes.forEach(function(e){let i;let r=y((e.crosshair||{}).snap,!0);!r||(i=s.hoverPoint)&&i.series[e.coll]===e||(i=p(g,t=>t.series&&t.series[e.coll]===e)),i||!r?e.drawCrosshair(t,i):e.hideCrosshair();});}setDOMEvents(){let t=this.chart.container,e=t.ownerDocument;t.onmousedown=this.onContainerMouseDown.bind(this),t.onmousemove=this.onContainerMouseMove.bind(this),t.onclick=this.onContainerClick.bind(this),this.eventsToUnbind.push(h(t,"mouseenter",this.onContainerMouseEnter.bind(this)),h(t,"mouseleave",this.onContainerMouseLeave.bind(this))),S.unbindDocumentMouseUp||(S.unbindDocumentMouseUp=h(e,"mouseup",this.onDocumentMouseUp.bind(this)));let i=this.chart.renderTo.parentElement;for(;i&&"BODY"!==i.tagName;)this.eventsToUnbind.push(h(i,"scroll",()=>{delete this.chartPosition;})),i=i.parentElement;this.eventsToUnbind.push(h(t,"touchstart",this.onContainerTouchStart.bind(this),{passive:!1}),h(t,"touchmove",this.onContainerTouchMove.bind(this),{passive:!1})),S.unbindDocumentTouchEnd||(S.unbindDocumentTouchEnd=h(e,"touchend",this.onDocumentTouchEnd.bind(this),{passive:!1})),this.setPointerCapture(),h(this.chart,"redraw",this.setPointerCapture.bind(this));}setPointerCapture(){if(!n)return;let t=this.pointerCaptureEventsToUnbind,e=this.chart,i=e.container,s=y(e.options.tooltip?.followTouchMove,!0)&&e.series.some(t=>t.options.findNearestPointBy.indexOf("y")>-1);!this.hasPointerCapture&&s?(t.push(h(i,"pointerdown",t=>{t.target?.hasPointerCapture(t.pointerId)&&t.target?.releasePointerCapture(t.pointerId);}),h(i,"pointermove",t=>{e.pointer?.getPointFromEvent(t)?.onMouseOver(t);})),e.styledMode||d(i,{"touch-action":"none"}),i.className+=" highcharts-no-touch-action",this.hasPointerCapture=!0):this.hasPointerCapture&&!s&&(t.forEach(t=>t()),t.length=0,e.styledMode||d(i,{"touch-action":y(e.options.chart.style?.["touch-action"],"manipulation")}),i.className=i.className.replace(" highcharts-no-touch-action",""),this.hasPointerCapture=!1);}setHoverChartIndex(t){let i=this.chart,s=e.charts[y(S.hoverChartIndex,-1)];s&&s!==i&&s.pointer?.onContainerMouseLeave(t||{relatedTarget:i.container}),s&&s.mouseIsDown||(S.hoverChartIndex=i.index);}touch(t,e){let i;let{chart:s,pinchDown:r=[]}=this;this.setHoverChartIndex(),1===t.touches.length?(t=this.normalize(t),s.isInsidePlot(t.chartX-s.plotLeft,t.chartY-s.plotTop,{visiblePlotOnly:!0})&&!s.openMenu?(e&&this.runPointActions(t),"touchmove"===t.type&&(i=!!r[0]&&Math.pow(r[0].chartX-t.chartX,2)+Math.pow(r[0].chartY-t.chartY,2)>=16),y(i,!0)&&this.pinch(t)):e&&this.reset()):2===t.touches.length&&this.pinch(t);}touchSelect(t){return !!(this.chart.zooming.singleTouch&&t.touches&&1===t.touches.length)}zoomOption(t){let e=this.chart,i=e.inverted,s=e.zooming.type||"",r,o;/touch/.test(t.type)&&(s=y(e.zooming.pinchType,s)),this.zoomX=r=/x/.test(s),this.zoomY=o=/y/.test(s),this.zoomHor=r&&!i||o&&i,this.zoomVert=o&&!i||r&&i,this.hasZoom=r||o;}}return (s=S||(S={})).compose=function(t){b(a,"Core.Pointer")&&h(t,"beforeRender",function(){this.pointer=new s(this,this.options);});},S}),i(e,"Core/Legend/Legend.js",[e["Core/Animation/AnimationUtilities.js"],e["Core/Templating.js"],e["Core/Globals.js"],e["Core/Series/Point.js"],e["Core/Renderer/RendererUtilities.js"],e["Core/Utilities.js"]],function(t,e,i,s,r,o){var a;let{animObject:n,setAnimation:h}=t,{format:l}=e,{composed:d,marginNames:c}=i,{distribute:p}=r,{addEvent:u,createElement:g,css:f,defined:m,discardElement:x,find:y,fireEvent:b,isNumber:v,merge:S,pick:k,pushUnique:C,relativeLength:M,stableSort:w,syncTimeout:T}=o;class A{constructor(t,e){this.allItems=[],this.initialItemY=0,this.itemHeight=0,this.itemMarginBottom=0,this.itemMarginTop=0,this.itemX=0,this.itemY=0,this.lastItemY=0,this.lastLineHeight=0,this.legendHeight=0,this.legendWidth=0,this.maxItemWidth=0,this.maxLegendWidth=0,this.offsetWidth=0,this.padding=0,this.pages=[],this.symbolHeight=0,this.symbolWidth=0,this.titleHeight=0,this.totalItemWidth=0,this.widthOption=0,this.chart=t,this.setOptions(e),e.enabled&&(this.render(),u(this.chart,"endResize",function(){this.legend.positionCheckboxes();})),u(this.chart,"render",()=>{this.options.enabled&&this.proximate&&(this.proximatePositions(),this.positionItems());});}setOptions(t){let e=k(t.padding,8);this.options=t,this.chart.styledMode||(this.itemStyle=t.itemStyle,this.itemHiddenStyle=S(this.itemStyle,t.itemHiddenStyle)),this.itemMarginTop=t.itemMarginTop,this.itemMarginBottom=t.itemMarginBottom,this.padding=e,this.initialItemY=e-5,this.symbolWidth=k(t.symbolWidth,16),this.pages=[],this.proximate="proximate"===t.layout&&!this.chart.inverted,this.baseline=void 0;}update(t,e){let i=this.chart;this.setOptions(S(!0,this.options,t)),this.destroy(),i.isDirtyLegend=i.isDirtyBox=!0,k(e,!0)&&i.redraw(),b(this,"afterUpdate",{redraw:e});}colorizeItem(t,e){let{area:i,group:s,label:r,line:o,symbol:a}=t.legendItem||{};if(s?.[e?"removeClass":"addClass"]("highcharts-legend-item-hidden"),!this.chart.styledMode){let{itemHiddenStyle:s={}}=this,n=s.color,{fillColor:h,fillOpacity:l,lineColor:d,marker:c}=t.options,p=t=>(!e&&(t.fill&&(t.fill=n),t.stroke&&(t.stroke=n)),t);r?.css(S(e?this.itemStyle:s)),o?.attr(p({stroke:d||t.color})),a&&a.attr(p(c&&a.isMarker?t.pointAttribs():{fill:t.color})),i?.attr(p({fill:h||t.color,"fill-opacity":h?1:l??.75}));}b(this,"afterColorizeItem",{item:t,visible:e});}positionItems(){this.allItems.forEach(this.positionItem,this),this.chart.isResizing||this.positionCheckboxes();}positionItem(t){let{group:e,x:i=0,y:s=0}=t.legendItem||{},r=this.options,o=r.symbolPadding,a=!r.rtl,n=t.checkbox;if(e&&e.element){let r={translateX:a?i:this.legendWidth-i-2*o-4,translateY:s};e[m(e.translateY)?"animate":"attr"](r,void 0,()=>{b(this,"afterPositionItem",{item:t});});}n&&(n.x=i,n.y=s);}destroyItem(t){let e=t.checkbox,i=t.legendItem||{};for(let t of ["group","label","line","symbol"])i[t]&&(i[t]=i[t].destroy());e&&x(e),t.legendItem=void 0;}destroy(){for(let t of this.getAllItems())this.destroyItem(t);for(let t of ["clipRect","up","down","pager","nav","box","title","group"])this[t]&&(this[t]=this[t].destroy());this.display=null;}positionCheckboxes(){let t;let e=this.group&&this.group.alignAttr,i=this.clipHeight||this.legendHeight,s=this.titleHeight;e&&(t=e.translateY,this.allItems.forEach(function(r){let o;let a=r.checkbox;a&&(o=t+s+a.y+(this.scrollOffset||0)+3,f(a,{left:e.translateX+r.checkboxOffset+a.x-20+"px",top:o+"px",display:this.proximate||o>t-6&&o<t+i-6?"":"none"}));},this));}renderTitle(){let t=this.options,e=this.padding,i=t.title,s,r=0;i.text&&(this.title||(this.title=this.chart.renderer.label(i.text,e-3,e-4,void 0,void 0,void 0,t.useHTML,void 0,"legend-title").attr({zIndex:1}),this.chart.styledMode||this.title.css(i.style),this.title.add(this.group)),i.width||this.title.css({width:this.maxLegendWidth+"px"}),r=(s=this.title.getBBox()).height,this.offsetWidth=s.width,this.contentGroup.attr({translateY:r})),this.titleHeight=r;}setText(t){let e=this.options;t.legendItem.label.attr({text:e.labelFormat?l(e.labelFormat,t,this.chart):e.labelFormatter.call(t)});}renderItem(t){let e=t.legendItem=t.legendItem||{},i=this.chart,s=i.renderer,r=this.options,o="horizontal"===r.layout,a=this.symbolWidth,n=r.symbolPadding||0,h=this.itemStyle,l=this.itemHiddenStyle,d=o?k(r.itemDistance,20):0,c=!r.rtl,p=!t.series,u=!p&&t.series.drawLegendSymbol?t.series:t,g=u.options,f=!!this.createCheckboxForItem&&g&&g.showCheckbox,m=r.useHTML,x=t.options.className,y=e.label,b=a+n+d+(f?20:0);!y&&(e.group=s.g("legend-item").addClass("highcharts-"+u.type+"-series highcharts-color-"+t.colorIndex+(x?" "+x:"")+(p?" highcharts-series-"+t.index:"")).attr({zIndex:1}).add(this.scrollGroup),e.label=y=s.text("",c?a+n:-n,this.baseline||0,m),i.styledMode||y.css(S(t.visible?h:l)),y.attr({align:c?"left":"right",zIndex:2}).add(e.group),!this.baseline&&(this.fontMetrics=s.fontMetrics(y),this.baseline=this.fontMetrics.f+3+this.itemMarginTop,y.attr("y",this.baseline),this.symbolHeight=k(r.symbolHeight,this.fontMetrics.f),r.squareSymbol&&(this.symbolWidth=k(r.symbolWidth,Math.max(this.symbolHeight,16)),b=this.symbolWidth+n+d+(f?20:0),c&&y.attr("x",this.symbolWidth+n))),u.drawLegendSymbol(this,t),this.setItemEvents&&this.setItemEvents(t,y,m)),f&&!t.checkbox&&this.createCheckboxForItem&&this.createCheckboxForItem(t),this.colorizeItem(t,t.visible),(i.styledMode||!h.width)&&y.css({width:(r.itemWidth||this.widthOption||i.spacingBox.width)-b+"px"}),this.setText(t);let v=y.getBBox(),C=this.fontMetrics&&this.fontMetrics.h||0;t.itemWidth=t.checkboxOffset=r.itemWidth||e.labelWidth||v.width+b,this.maxItemWidth=Math.max(this.maxItemWidth,t.itemWidth),this.totalItemWidth+=t.itemWidth,this.itemHeight=t.itemHeight=Math.round(e.labelHeight||(v.height>1.5*C?v.height:C));}layoutItem(t){let e=this.options,i=this.padding,s="horizontal"===e.layout,r=t.itemHeight,o=this.itemMarginBottom,a=this.itemMarginTop,n=s?k(e.itemDistance,20):0,h=this.maxLegendWidth,l=e.alignColumns&&this.totalItemWidth>h?this.maxItemWidth:t.itemWidth,d=t.legendItem||{};s&&this.itemX-i+l>h&&(this.itemX=i,this.lastLineHeight&&(this.itemY+=a+this.lastLineHeight+o),this.lastLineHeight=0),this.lastItemY=a+this.itemY+o,this.lastLineHeight=Math.max(r,this.lastLineHeight),d.x=this.itemX,d.y=this.itemY,s?this.itemX+=l:(this.itemY+=a+r+o,this.lastLineHeight=r),this.offsetWidth=this.widthOption||Math.max((s?this.itemX-i-(t.checkbox?0:n):l)+i,this.offsetWidth);}getAllItems(){let t=[];return this.chart.series.forEach(function(e){let i=e&&e.options;e&&k(i.showInLegend,!m(i.linkedTo)&&void 0,!0)&&(t=t.concat((e.legendItem||{}).labels||("point"===i.legendType?e.data:e)));}),b(this,"afterGetAllItems",{allItems:t}),t}getAlignment(){let t=this.options;return this.proximate?t.align.charAt(0)+"tv":t.floating?"":t.align.charAt(0)+t.verticalAlign.charAt(0)+t.layout.charAt(0)}adjustMargins(t,e){let i=this.chart,s=this.options,r=this.getAlignment();r&&[/(lth|ct|rth)/,/(rtv|rm|rbv)/,/(rbh|cb|lbh)/,/(lbv|lm|ltv)/].forEach(function(o,a){o.test(r)&&!m(t[a])&&(i[c[a]]=Math.max(i[c[a]],i.legend[(a+1)%2?"legendHeight":"legendWidth"]+[1,-1,-1,1][a]*s[a%2?"x":"y"]+k(s.margin,12)+e[a]+(i.titleOffset[a]||0)));});}proximatePositions(){let t;let e=this.chart,i=[],s="left"===this.options.align;for(let r of(this.allItems.forEach(function(t){let r,o,a=s,n,h;t.yAxis&&(t.xAxis.options.reversed&&(a=!a),t.points&&(r=y(a?t.points:t.points.slice(0).reverse(),function(t){return v(t.plotY)})),o=this.itemMarginTop+t.legendItem.label.getBBox().height+this.itemMarginBottom,h=t.yAxis.top-e.plotTop,n=t.visible?(r?r.plotY:t.yAxis.height)+(h-.3*o):h+t.yAxis.height,i.push({target:n,size:o,item:t}));},this),p(i,e.plotHeight)))t=r.item.legendItem||{},v(r.pos)&&(t.y=e.plotTop-e.spacing[0]+r.pos);}render(){let t=this.chart,e=t.renderer,i=this.options,s=this.padding,r=this.getAllItems(),o,a,n,h=this.group,l,d=this.box;this.itemX=s,this.itemY=this.initialItemY,this.offsetWidth=0,this.lastItemY=0,this.widthOption=M(i.width,t.spacingBox.width-s),l=t.spacingBox.width-2*s-i.x,["rm","lm"].indexOf(this.getAlignment().substring(0,2))>-1&&(l/=2),this.maxLegendWidth=this.widthOption||l,h||(this.group=h=e.g("legend").addClass(i.className||"").attr({zIndex:7}).add(),this.contentGroup=e.g().attr({zIndex:1}).add(h),this.scrollGroup=e.g().add(this.contentGroup)),this.renderTitle(),w(r,(t,e)=>(t.options&&t.options.legendIndex||0)-(e.options&&e.options.legendIndex||0)),i.reversed&&r.reverse(),this.allItems=r,this.display=o=!!r.length,this.lastLineHeight=0,this.maxItemWidth=0,this.totalItemWidth=0,this.itemHeight=0,r.forEach(this.renderItem,this),r.forEach(this.layoutItem,this),a=(this.widthOption||this.offsetWidth)+s,n=this.lastItemY+this.lastLineHeight+this.titleHeight,n=this.handleOverflow(n)+s,d||(this.box=d=e.rect().addClass("highcharts-legend-box").attr({r:i.borderRadius}).add(h)),t.styledMode||d.attr({stroke:i.borderColor,"stroke-width":i.borderWidth||0,fill:i.backgroundColor||"none"}).shadow(i.shadow),a>0&&n>0&&d[d.placed?"animate":"attr"](d.crisp.call({},{x:0,y:0,width:a,height:n},d.strokeWidth())),h[o?"show":"hide"](),t.styledMode&&"none"===h.getStyle("display")&&(a=n=0),this.legendWidth=a,this.legendHeight=n,o&&this.align(),this.proximate||this.positionItems(),b(this,"afterRender");}align(t=this.chart.spacingBox){let e=this.chart,i=this.options,s=t.y;/(lth|ct|rth)/.test(this.getAlignment())&&e.titleOffset[0]>0?s+=e.titleOffset[0]:/(lbh|cb|rbh)/.test(this.getAlignment())&&e.titleOffset[2]>0&&(s-=e.titleOffset[2]),s!==t.y&&(t=S(t,{y:s})),e.hasRendered||(this.group.placed=!1),this.group.align(S(i,{width:this.legendWidth,height:this.legendHeight,verticalAlign:this.proximate?"top":i.verticalAlign}),!0,t);}handleOverflow(t){let e=this,i=this.chart,s=i.renderer,r=this.options,o=r.y,a="top"===r.verticalAlign,n=this.padding,h=r.maxHeight,l=r.navigation,d=k(l.animation,!0),c=l.arrowSize||12,p=this.pages,u=this.allItems,g=function(t){"number"==typeof t?S.attr({height:t}):S&&(e.clipRect=S.destroy(),e.contentGroup.clip()),e.contentGroup.div&&(e.contentGroup.div.style.clip=t?"rect("+n+"px,9999px,"+(n+t)+"px,0)":"auto");},f=function(t){return e[t]=s.circle(0,0,1.3*c).translate(c/2,c/2).add(v),i.styledMode||e[t].attr("fill","rgba(0,0,0,0.0001)"),e[t]},m,x,y,b=i.spacingBox.height+(a?-o:o)-n,v=this.nav,S=this.clipRect;return "horizontal"!==r.layout||"middle"===r.verticalAlign||r.floating||(b/=2),h&&(b=Math.min(b,h)),p.length=0,t&&b>0&&t>b&&!1!==l.enabled?(this.clipHeight=m=Math.max(b-20-this.titleHeight-n,0),this.currentPage=k(this.currentPage,1),this.fullHeight=t,u.forEach((t,e)=>{let i=(y=t.legendItem||{}).y||0,s=Math.round(y.label.getBBox().height),r=p.length;(!r||i-p[r-1]>m&&(x||i)!==p[r-1])&&(p.push(x||i),r++),y.pageIx=r-1,x&&((u[e-1].legendItem||{}).pageIx=r-1),e===u.length-1&&i+s-p[r-1]>m&&i>p[r-1]&&(p.push(i),y.pageIx=r),i!==x&&(x=i);}),S||(S=e.clipRect=s.clipRect(0,n-2,9999,0),e.contentGroup.clip(S)),g(m),v||(this.nav=v=s.g().attr({zIndex:1}).add(this.group),this.up=s.symbol("triangle",0,0,c,c).add(v),f("upTracker").on("click",function(){e.scroll(-1,d);}),this.pager=s.text("",15,10).addClass("highcharts-legend-navigation"),!i.styledMode&&l.style&&this.pager.css(l.style),this.pager.add(v),this.down=s.symbol("triangle-down",0,0,c,c).add(v),f("downTracker").on("click",function(){e.scroll(1,d);})),e.scroll(0),t=b):v&&(g(),this.nav=v.destroy(),this.scrollGroup.attr({translateY:1}),this.clipHeight=0),t}scroll(t,e){let i=this.chart,s=this.pages,r=s.length,o=this.clipHeight,a=this.options.navigation,l=this.pager,d=this.padding,c=this.currentPage+t;c>r&&(c=r),c>0&&(void 0!==e&&h(e,i),this.nav.attr({translateX:d,translateY:o+this.padding+7+this.titleHeight,visibility:"inherit"}),[this.up,this.upTracker].forEach(function(t){t.attr({class:1===c?"highcharts-legend-nav-inactive":"highcharts-legend-nav-active"});}),l.attr({text:c+"/"+r}),[this.down,this.downTracker].forEach(function(t){t.attr({x:18+this.pager.getBBox().width,class:c===r?"highcharts-legend-nav-inactive":"highcharts-legend-nav-active"});},this),i.styledMode||(this.up.attr({fill:1===c?a.inactiveColor:a.activeColor}),this.upTracker.css({cursor:1===c?"default":"pointer"}),this.down.attr({fill:c===r?a.inactiveColor:a.activeColor}),this.downTracker.css({cursor:c===r?"default":"pointer"})),this.scrollOffset=-s[c-1]+this.initialItemY,this.scrollGroup.animate({translateY:this.scrollOffset}),this.currentPage=c,this.positionCheckboxes(),T(()=>{b(this,"afterScroll",{currentPage:c});},n(k(e,i.renderer.globalAnimation,!0)).duration));}setItemEvents(t,e,i){let r=this,o=t.legendItem||{},a=r.chart.renderer.boxWrapper,n=t instanceof s,h="highcharts-legend-"+(n?"point":"series")+"-active",l=r.chart.styledMode,d=i?[e,o.symbol]:[o.group],c=e=>{r.allItems.forEach(i=>{t!==i&&[i].concat(i.linkedSeries||[]).forEach(t=>{t.setState(e,!n);});});};for(let i of d)i&&i.on("mouseover",function(){t.visible&&c("inactive"),t.setState("hover"),t.visible&&a.addClass(h),l||e.css(r.options.itemHoverStyle);}).on("mouseout",function(){r.chart.styledMode||e.css(S(t.visible?r.itemStyle:r.itemHiddenStyle)),c(""),a.removeClass(h),t.setState();}).on("click",function(e){let i="legendItemClick",s=function(){t.setVisible&&t.setVisible(),c(t.visible?"inactive":"");};a.removeClass(h),e={browserEvent:e},t.firePointEvent?t.firePointEvent(i,e,s):b(t,i,e,s);});}createCheckboxForItem(t){t.checkbox=g("input",{type:"checkbox",className:"highcharts-legend-checkbox",checked:t.selected,defaultChecked:t.selected},this.options.itemCheckboxStyle,this.chart.container),u(t.checkbox,"click",function(e){let i=e.target;b(t.series||t,"checkboxClick",{checked:i.checked,item:t},function(){t.select();});});}}return (a=A||(A={})).compose=function(t){C(d,"Core.Legend")&&u(t,"beforeMargins",function(){this.legend=new a(this,this.options.legend);});},A}),i(e,"Core/Legend/LegendSymbol.js",[e["Core/Utilities.js"]],function(t){var e;let{extend:i,merge:s,pick:r}=t;return function(t){function e(t,e,o){let a=this.legendItem=this.legendItem||{},{chart:n,options:h}=this,{baseline:l=0,symbolWidth:d,symbolHeight:c}=t,p=this.symbol||"circle",u=c/2,g=n.renderer,f=a.group,m=l-Math.round(c*(o?.4:.3)),x={},y,b=h.marker,v=0;if(n.styledMode||(x["stroke-width"]=Math.min(h.lineWidth||0,24),h.dashStyle?x.dashstyle=h.dashStyle:"square"===h.linecap||(x["stroke-linecap"]="round")),a.line=g.path().addClass("highcharts-graph").attr(x).add(f),o&&(a.area=g.path().addClass("highcharts-area").add(f)),x["stroke-linecap"]&&(v=Math.min(a.line.strokeWidth(),d)/2),d){let t=[["M",v,m],["L",d-v,m]];a.line.attr({d:t}),a.area?.attr({d:[...t,["L",d-v,l],["L",v,l]]});}if(b&&!1!==b.enabled&&d){let t=Math.min(r(b.radius,u),u);0===p.indexOf("url")&&(b=s(b,{width:c,height:c}),t=0),a.symbol=y=g.symbol(p,d/2-t,m-t,2*t,2*t,i({context:"legend"},b)).addClass("highcharts-point").add(f),y.isMarker=!0;}}t.areaMarker=function(t,i){e.call(this,t,i,!0);},t.lineMarker=e,t.rectangle=function(t,e){let i=e.legendItem||{},s=t.options,o=t.symbolHeight,a=s.squareSymbol,n=a?o:t.symbolWidth;i.symbol=this.chart.renderer.rect(a?(t.symbolWidth-o)/2:0,t.baseline-o+1,n,o,r(t.options.symbolRadius,o/2)).addClass("highcharts-point").attr({zIndex:3}).add(i.group);};}(e||(e={})),e}),i(e,"Core/Series/SeriesDefaults.js",[],function(){return {lineWidth:2,allowPointSelect:!1,crisp:!0,showCheckbox:!1,animation:{duration:1e3},enableMouseTracking:!0,events:{},marker:{enabledThreshold:2,lineColor:"#ffffff",lineWidth:0,radius:4,states:{normal:{animation:!0},hover:{animation:{duration:150},enabled:!0,radiusPlus:2,lineWidthPlus:1},select:{fillColor:"#cccccc",lineColor:"#000000",lineWidth:2}}},point:{events:{}},dataLabels:{animation:{},align:"center",borderWidth:0,defer:!0,formatter:function(){let{numberFormatter:t}=this.series.chart;return "number"!=typeof this.y?"":t(this.y,-1)},padding:5,style:{fontSize:"0.7em",fontWeight:"bold",color:"contrast",textOutline:"1px contrast"},verticalAlign:"bottom",x:0,y:0},cropThreshold:300,opacity:1,pointRange:0,softThreshold:!0,states:{normal:{animation:!0},hover:{animation:{duration:150},lineWidthPlus:1,marker:{},halo:{size:10,opacity:.25}},select:{animation:{duration:0}},inactive:{animation:{duration:150},opacity:.2}},stickyTracking:!0,turboThreshold:1e3,findNearestPointBy:"x"}}),i(e,"Core/Series/SeriesRegistry.js",[e["Core/Globals.js"],e["Core/Defaults.js"],e["Core/Series/Point.js"],e["Core/Utilities.js"]],function(t,e,i,s){var r;let{defaultOptions:o}=e,{extend:a,extendClass:n,merge:h}=s;return function(e){function s(t,s){let r=o.plotOptions||{},a=s.defaultOptions,n=s.prototype;return n.type=t,n.pointClass||(n.pointClass=i),!e.seriesTypes[t]&&(a&&(r[t]=a),e.seriesTypes[t]=s,!0)}e.seriesTypes=t.seriesTypes,e.registerSeriesType=s,e.seriesType=function(t,r,l,d,c){let p=o.plotOptions||{};if(r=r||"",p[t]=h(p[r],l),delete e.seriesTypes[t],s(t,n(e.seriesTypes[r]||function(){},d)),e.seriesTypes[t].prototype.type=t,c){class s extends i{}a(s.prototype,c),e.seriesTypes[t].prototype.pointClass=s;}return e.seriesTypes[t]};}(r||(r={})),r}),i(e,"Core/Series/Series.js",[e["Core/Animation/AnimationUtilities.js"],e["Core/Defaults.js"],e["Core/Foundation.js"],e["Core/Globals.js"],e["Core/Legend/LegendSymbol.js"],e["Core/Series/Point.js"],e["Core/Series/SeriesDefaults.js"],e["Core/Series/SeriesRegistry.js"],e["Core/Renderer/SVG/SVGElement.js"],e["Core/Utilities.js"]],function(t,e,i,s,r,o,a,n,h,l){let{animObject:d,setAnimation:c}=t,{defaultOptions:p}=e,{registerEventOptions:u}=i,{svg:g,win:f}=s,{seriesTypes:m}=n,{arrayMax:x,arrayMin:y,clamp:b,correctFloat:v,defined:S,destroyObjectProperties:k,diffObjects:C,erase:M,error:w,extend:T,find:A,fireEvent:P,getClosestDistance:L,getNestedProperty:O,insertItem:D,isArray:E,isNumber:I,isString:j,merge:B,objectEach:R,pick:z,removeEvent:N,splat:W,syncTimeout:G}=l;class H{constructor(){this.zoneAxis="y";}init(t,e){let i;P(this,"init",{options:e});let s=this,r=t.series;this.eventsToUnbind=[],s.chart=t,s.options=s.setOptions(e);let o=s.options,a=!1!==o.visible;s.linkedSeries=[],s.bindAxes(),T(s,{name:o.name,state:"",visible:a,selected:!0===o.selected}),u(this,o);let n=o.events;(n&&n.click||o.point&&o.point.events&&o.point.events.click||o.allowPointSelect)&&(t.runTrackerClick=!0),s.getColor(),s.getSymbol(),s.parallelArrays.forEach(function(t){s[t+"Data"]||(s[t+"Data"]=[]);}),s.isCartesian&&(t.hasCartesianSeries=!0),r.length&&(i=r[r.length-1]),s._i=z(i&&i._i,-1)+1,s.opacity=s.options.opacity,t.orderItems("series",D(this,r)),o.dataSorting&&o.dataSorting.enabled?s.setDataSortingOptions():s.points||s.data||s.setData(o.data,!1),P(this,"afterInit");}is(t){return m[t]&&this instanceof m[t]}bindAxes(){let t;let e=this,i=e.options,s=e.chart;P(this,"bindAxes",null,function(){(e.axisTypes||[]).forEach(function(r){(s[r]||[]).forEach(function(s){t=s.options,(z(i[r],0)===s.index||void 0!==i[r]&&i[r]===t.id)&&(D(e,s.series),e[r]=s,s.isDirty=!0);}),e[r]||e.optionalAxis===r||w(18,!0,s);});}),P(this,"afterBindAxes");}updateParallelArrays(t,e,i){let s=t.series,r=I(e)?function(i){let r="y"===i&&s.toYData?s.toYData(t):t[i];s[i+"Data"][e]=r;}:function(t){Array.prototype[e].apply(s[t+"Data"],i);};s.parallelArrays.forEach(r);}hasData(){return this.visible&&void 0!==this.dataMax&&void 0!==this.dataMin||this.visible&&this.yData&&this.yData.length>0}hasMarkerChanged(t,e){let i=t.marker,s=e.marker||{};return i&&(s.enabled&&!i.enabled||s.symbol!==i.symbol||s.height!==i.height||s.width!==i.width)}autoIncrement(t){let e=this.options,i=e.pointIntervalUnit,s=e.relativeXValue,r=this.chart.time,o=this.xIncrement,a,n;return (o=z(o,e.pointStart,0),this.pointInterval=n=z(this.pointInterval,e.pointInterval,1),s&&I(t)&&(n*=t),i&&(a=new r.Date(o),"day"===i?r.set("Date",a,r.get("Date",a)+n):"month"===i?r.set("Month",a,r.get("Month",a)+n):"year"===i&&r.set("FullYear",a,r.get("FullYear",a)+n),n=a.getTime()-o),s&&I(t))?o+n:(this.xIncrement=o+n,o)}setDataSortingOptions(){let t=this.options;T(this,{requireSorting:!1,sorted:!1,enabledDataSorting:!0,allowDG:!1}),S(t.pointRange)||(t.pointRange=1);}setOptions(t){let e;let i=this.chart,s=i.options.plotOptions,r=i.userOptions||{},o=B(t),a=i.styledMode,n={plotOptions:s,userOptions:o};P(this,"setOptions",n);let h=n.plotOptions[this.type],l=r.plotOptions||{},d=l.series||{},c=p.plotOptions[this.type]||{},u=l[this.type]||{};this.userOptions=n.userOptions;let g=B(h,s.series,u,o);this.tooltipOptions=B(p.tooltip,p.plotOptions.series?.tooltip,c?.tooltip,i.userOptions.tooltip,l.series?.tooltip,u.tooltip,o.tooltip),this.stickyTracking=z(o.stickyTracking,u.stickyTracking,d.stickyTracking,!!this.tooltipOptions.shared&&!this.noSharedTooltip||g.stickyTracking),null===h.marker&&delete g.marker,this.zoneAxis=g.zoneAxis||"y";let f=this.zones=(g.zones||[]).map(t=>({...t}));return (g.negativeColor||g.negativeFillColor)&&!g.zones&&(e={value:g[this.zoneAxis+"Threshold"]||g.threshold||0,className:"highcharts-negative"},a||(e.color=g.negativeColor,e.fillColor=g.negativeFillColor),f.push(e)),f.length&&S(f[f.length-1].value)&&f.push(a?{}:{color:this.color,fillColor:this.fillColor}),P(this,"afterSetOptions",{options:g}),g}getName(){return z(this.options.name,"Series "+(this.index+1))}getCyclic(t,e,i){let s,r;let o=this.chart,a=`${t}Index`,n=`${t}Counter`,h=i?.length||o.options.chart.colorCount;!e&&(S(r=z("color"===t?this.options.colorIndex:void 0,this[a]))?s=r:(o.series.length||(o[n]=0),s=o[n]%h,o[n]+=1),i&&(e=i[s])),void 0!==s&&(this[a]=s),this[t]=e;}getColor(){this.chart.styledMode?this.getCyclic("color"):this.options.colorByPoint?this.color="#cccccc":this.getCyclic("color",this.options.color||p.plotOptions[this.type].color,this.chart.options.colors);}getPointsCollection(){return (this.hasGroupedData?this.points:this.data)||[]}getSymbol(){let t=this.options.marker;this.getCyclic("symbol",t.symbol,this.chart.options.symbols);}findPointIndex(t,e){let i,s,r;let a=t.id,n=t.x,h=this.points,l=this.options.dataSorting;if(a){let t=this.chart.get(a);t instanceof o&&(i=t);}else if(this.linkedParent||this.enabledDataSorting||this.options.relativeXValue){let e=e=>!e.touched&&e.index===t.index;if(l&&l.matchByName?e=e=>!e.touched&&e.name===t.name:this.options.relativeXValue&&(e=e=>!e.touched&&e.options.x===t.x),!(i=A(h,e)))return}return i&&void 0!==(r=i&&i.index)&&(s=!0),void 0===r&&I(n)&&(r=this.xData.indexOf(n,e)),-1!==r&&void 0!==r&&this.cropped&&(r=r>=this.cropStart?r-this.cropStart:r),!s&&I(r)&&h[r]&&h[r].touched&&(r=void 0),r}updateData(t,e){let i=this.options,s=i.dataSorting,r=this.points,o=[],a=this.requireSorting,n=t.length===r.length,h,l,d,c,p=!0;if(this.xIncrement=null,t.forEach(function(t,e){let l;let d=S(t)&&this.pointClass.prototype.optionsToObject.call({series:this},t)||{},p=d.x;d.id||I(p)?(-1===(l=this.findPointIndex(d,c))||void 0===l?o.push(t):r[l]&&t!==i.data[l]?(r[l].update(t,!1,null,!1),r[l].touched=!0,a&&(c=l+1)):r[l]&&(r[l].touched=!0),(!n||e!==l||s&&s.enabled||this.hasDerivedData)&&(h=!0)):o.push(t);},this),h)for(l=r.length;l--;)(d=r[l])&&!d.touched&&d.remove&&d.remove(!1,e);else !n||s&&s.enabled?p=!1:(t.forEach(function(t,e){t===r[e].y||r[e].destroyed||r[e].update(t,!1,null,!1);}),o.length=0);return r.forEach(function(t){t&&(t.touched=!1);}),!!p&&(o.forEach(function(t){this.addPoint(t,!1,null,null,!1);},this),null===this.xIncrement&&this.xData&&this.xData.length&&(this.xIncrement=x(this.xData),this.autoIncrement()),!0)}setData(t,e=!0,i,s){let r=this,o=r.points,a=o&&o.length||0,n=r.options,h=r.chart,l=n.dataSorting,d=r.xAxis,c=n.turboThreshold,p=this.xData,u=this.yData,g=r.pointArrayMap,f=g&&g.length,m=n.keys,x,y,b,v=0,S=1,k=null,C;h.options.chart.allowMutatingData||(n.data&&delete r.options.data,r.userOptions.data&&delete r.userOptions.data,C=B(!0,t));let M=(t=C||t||[]).length;if(l&&l.enabled&&(t=this.sortData(t)),h.options.chart.allowMutatingData&&!1!==s&&M&&a&&!r.cropped&&!r.hasGroupedData&&r.visible&&!r.boosted&&(b=this.updateData(t,i)),!b){if(r.xIncrement=null,r.colorCounter=0,this.parallelArrays.forEach(function(t){r[t+"Data"].length=0;}),c&&M>c){if(I(k=r.getFirstValidPoint(t)))for(x=0;x<M;x++)p[x]=this.autoIncrement(),u[x]=t[x];else if(E(k)){if(f){if(k.length===f)for(x=0;x<M;x++)p[x]=this.autoIncrement(),u[x]=t[x];else for(x=0;x<M;x++)y=t[x],p[x]=y[0],u[x]=y.slice(1,f+1);}else if(m&&(v=m.indexOf("x"),S=m.indexOf("y"),v=v>=0?v:0,S=S>=0?S:1),1===k.length&&(S=0),v===S)for(x=0;x<M;x++)p[x]=this.autoIncrement(),u[x]=t[x][S];else for(x=0;x<M;x++)y=t[x],p[x]=y[v],u[x]=y[S];}else w(12,!1,h);}else for(x=0;x<M;x++)y={series:r},r.pointClass.prototype.applyOptions.apply(y,[t[x]]),r.updateParallelArrays(y,x);for(u&&j(u[0])&&w(14,!0,h),r.data=[],r.options.data=r.userOptions.data=t,x=a;x--;)o[x]?.destroy();d&&(d.minRange=d.userMinRange),r.isDirty=h.isDirtyBox=!0,r.isDirtyData=!!o,i=!1;}"point"===n.legendType&&(this.processData(),this.generatePoints()),e&&h.redraw(i);}sortData(t){let e=this,i=e.options.dataSorting.sortKey||"y",s=function(t,e){return S(e)&&t.pointClass.prototype.optionsToObject.call({series:t},e)||{}};return t.forEach(function(i,r){t[r]=s(e,i),t[r].index=r;},this),t.concat().sort((t,e)=>{let s=O(i,t),r=O(i,e);return r<s?-1:r>s?1:0}).forEach(function(t,e){t.x=e;},this),e.linkedSeries&&e.linkedSeries.forEach(function(e){let i=e.options,r=i.data;i.dataSorting&&i.dataSorting.enabled||!r||(r.forEach(function(i,o){r[o]=s(e,i),t[o]&&(r[o].x=t[o].x,r[o].index=o);}),e.setData(r,!1));}),t}getProcessedData(t){let e=this,i=e.xAxis,s=e.options,r=s.cropThreshold,o=t||e.getExtremesFromAll||s.getExtremesFromAll,a=i?.logarithmic,n=e.isCartesian,h,l,d=0,c,p,u,g=e.xData,f=e.yData,m=!1,x=g.length;i&&(p=(c=i.getExtremes()).min,u=c.max,m=!!(i.categories&&!i.names.length)),n&&e.sorted&&!o&&(!r||x>r||e.forceCrop)&&(g[x-1]<p||g[0]>u?(g=[],f=[]):e.yData&&(g[0]<p||g[x-1]>u)&&(g=(h=this.cropData(e.xData,e.yData,p,u)).xData,f=h.yData,d=h.start,l=!0));let y=L([a?g.map(a.log2lin):g],()=>e.requireSorting&&!m&&w(15,!1,e.chart));return {xData:g,yData:f,cropped:l,cropStart:d,closestPointRange:y}}processData(t){let e=this.xAxis;if(this.isCartesian&&!this.isDirty&&!e.isDirty&&!this.yAxis.isDirty&&!t)return !1;let i=this.getProcessedData();this.cropped=i.cropped,this.cropStart=i.cropStart,this.processedXData=i.xData,this.processedYData=i.yData,this.closestPointRange=this.basePointRange=i.closestPointRange,P(this,"afterProcessData");}cropData(t,e,i,s){let r=t.length,o,a,n=0,h=r;for(o=0;o<r;o++)if(t[o]>=i){n=Math.max(0,o-1);break}for(a=o;a<r;a++)if(t[a]>s){h=a+1;break}return {xData:t.slice(n,h),yData:e.slice(n,h),start:n,end:h}}generatePoints(){let t=this.options,e=this.processedData||t.data,i=this.processedXData,s=this.processedYData,r=this.pointClass,o=i.length,a=this.cropStart||0,n=this.hasGroupedData,h=t.keys,l=[],d=t.dataGrouping&&t.dataGrouping.groupAll?a:0,c,p,u,g,f=this.data;if(!f&&!n){let t=[];t.length=e.length,f=this.data=t;}for(h&&n&&(this.options.keys=!1),g=0;g<o;g++)p=a+g,n?((u=new r(this,[i[g]].concat(W(s[g])))).dataGroup=this.groupMap[d+g],u.dataGroup.options&&(u.options=u.dataGroup.options,T(u,u.dataGroup.options),delete u.dataLabels)):(u=f[p])||void 0===e[p]||(f[p]=u=new r(this,e[p],i[g])),u&&(u.index=n?d+g:p,l[g]=u);if(this.options.keys=h,f&&(o!==(c=f.length)||n))for(g=0;g<c;g++)g!==a||n||(g+=o),f[g]&&(f[g].destroyElements(),f[g].plotX=void 0);this.data=f,this.points=l,P(this,"afterGeneratePoints");}getXExtremes(t){return {min:y(t),max:x(t)}}getExtremes(t,e){let i=this.xAxis,s=this.yAxis,r=this.processedXData||this.xData,o=[],a=this.requireSorting&&!this.is("column")?1:0,n=!!s&&s.positiveValuesOnly,h,l,d,c,p,u,g,f=0,m=0,b=0,v=(t=t||this.stackedYData||this.processedYData||[]).length;for(i&&(f=(h=i.getExtremes()).min,m=h.max),u=0;u<v;u++)if(c=r[u],l=(I(p=t[u])||E(p))&&((I(p)?p>0:p.length)||!n),d=e||this.getExtremesFromAll||this.options.getExtremesFromAll||this.cropped||!i||(r[u+a]||c)>=f&&(r[u-a]||c)<=m,l&&d){if(g=p.length)for(;g--;)I(p[g])&&(o[b++]=p[g]);else o[b++]=p;}let S={activeYData:o,dataMin:y(o),dataMax:x(o)};return P(this,"afterGetExtremes",{dataExtremes:S}),S}applyExtremes(){let t=this.getExtremes();return this.dataMin=t.dataMin,this.dataMax=t.dataMax,t}getFirstValidPoint(t){let e=t.length,i=0,s=null;for(;null===s&&i<e;)s=t[i],i++;return s}translate(){this.processedXData||this.processData(),this.generatePoints();let t=this.options,e=t.stacking,i=this.xAxis,s=i.categories,r=this.enabledDataSorting,o=this.yAxis,a=this.points,n=a.length,h=this.pointPlacementToXValue(),l=!!h,d=t.threshold,c=t.startFromThreshold?d:0,p,u,g,f,m=Number.MAX_VALUE;function x(t){return b(t,-1e5,1e5)}for(p=0;p<n;p++){let t;let n=a[p],y=n.x,b,k,C=n.y,M=n.low,w=e&&o.stacking?.stacks[(this.negStacks&&C<(c?0:d)?"-":"")+this.stackKey];u=i.translate(y,!1,!1,!1,!0,h),n.plotX=I(u)?v(x(u)):void 0,e&&this.visible&&w&&w[y]&&(f=this.getStackIndicator(f,y,this.index),!n.isNull&&f.key&&(k=(b=w[y]).points[f.key]),b&&E(k)&&(M=k[0],C=k[1],M===c&&f.key===w[y].base&&(M=z(I(d)?d:o.min)),o.positiveValuesOnly&&S(M)&&M<=0&&(M=void 0),n.total=n.stackTotal=z(b.total),n.percentage=S(n.y)&&b.total?n.y/b.total*100:void 0,n.stackY=C,this.irregularWidths||b.setOffset(this.pointXOffset||0,this.barW||0,void 0,void 0,void 0,this.xAxis))),n.yBottom=S(M)?x(o.translate(M,!1,!0,!1,!0)):void 0,this.dataModify&&(C=this.dataModify.modifyValue(C,p)),I(C)&&void 0!==n.plotX&&(t=I(t=o.translate(C,!1,!0,!1,!0))?x(t):void 0),n.plotY=t,n.isInside=this.isPointInside(n),n.clientX=l?v(i.translate(y,!1,!1,!1,!0,h)):u,n.negative=(n.y||0)<(d||0),n.category=z(s&&s[n.x],n.x),n.isNull||!1===n.visible||(void 0!==g&&(m=Math.min(m,Math.abs(u-g))),g=u),n.zone=this.zones.length?n.getZone():void 0,!n.graphic&&this.group&&r&&(n.isNew=!0);}this.closestPointRangePx=m,P(this,"afterTranslate");}getValidPoints(t,e,i){let s=this.chart;return (t||this.points||[]).filter(function(t){let{plotX:r,plotY:o}=t;return !!((i||!t.isNull&&I(o))&&(!e||s.isInsidePlot(r,o,{inverted:s.inverted})))&&!1!==t.visible})}getClipBox(){let{chart:t,xAxis:e,yAxis:i}=this,{x:s,y:r,width:o,height:a}=B(t.clipBox);return e&&e.len!==t.plotSizeX&&(o=e.len),i&&i.len!==t.plotSizeY&&(a=i.len),t.inverted&&!this.invertible&&([o,a]=[a,o]),{x:s,y:r,width:o,height:a}}getSharedClipKey(){return this.sharedClipKey=(this.options.xAxis||0)+","+(this.options.yAxis||0),this.sharedClipKey}setClip(){let{chart:t,group:e,markerGroup:i}=this,s=t.sharedClips,r=t.renderer,o=this.getClipBox(),a=this.getSharedClipKey(),n=s[a];n?n.animate(o):s[a]=n=r.clipRect(o),e&&e.clip(!1===this.options.clip?void 0:n),i&&i.clip();}animate(t){let{chart:e,group:i,markerGroup:s}=this,r=e.inverted,o=d(this.options.animation),a=[this.getSharedClipKey(),o.duration,o.easing,o.defer].join(","),n=e.sharedClips[a],h=e.sharedClips[a+"m"];if(t&&i){let t=this.getClipBox();if(n)n.attr("height",t.height);else {t.width=0,r&&(t.x=e.plotHeight),n=e.renderer.clipRect(t),e.sharedClips[a]=n;let i={x:-99,y:-99,width:r?e.plotWidth+199:99,height:r?99:e.plotHeight+199};h=e.renderer.clipRect(i),e.sharedClips[a+"m"]=h;}i.clip(n),s?.clip(h);}else if(n&&!n.hasClass("highcharts-animating")){let t=this.getClipBox(),i=o.step;(s?.element.childNodes.length||e.series.length>1)&&(o.step=function(t,e){i&&i.apply(e,arguments),"width"===e.prop&&h?.element&&h.attr(r?"height":"width",t+99);}),n.addClass("highcharts-animating").animate(t,o);}}afterAnimate(){this.setClip(),R(this.chart.sharedClips,(t,e,i)=>{t&&!this.chart.container.querySelector(`[clip-path="url(#${t.id})"]`)&&(t.destroy(),delete i[e]);}),this.finishedAnimating=!0,P(this,"afterAnimate");}drawPoints(t=this.points){let e,i,s,r,o,a,n;let h=this.chart,l=h.styledMode,{colorAxis:d,options:c}=this,p=c.marker,u=this[this.specialGroup||"markerGroup"],g=this.xAxis,f=z(p.enabled,!g||!!g.isRadial||null,this.closestPointRangePx>=p.enabledThreshold*p.radius);if(!1!==p.enabled||this._hasPointMarkers)for(e=0;e<t.length;e++)if(r=(s=(i=t[e]).graphic)?"animate":"attr",o=i.marker||{},a=!!i.marker,(f&&void 0===o.enabled||o.enabled)&&!i.isNull&&!1!==i.visible){let t=z(o.symbol,this.symbol,"rect");n=this.markerAttribs(i,i.selected&&"select"),this.enabledDataSorting&&(i.startXPos=g.reversed?-(n.width||0):g.width);let e=!1!==i.isInside;if(!s&&e&&((n.width||0)>0||i.hasImage)&&(i.graphic=s=h.renderer.symbol(t,n.x,n.y,n.width,n.height,a?o:p).add(u),this.enabledDataSorting&&h.hasRendered&&(s.attr({x:i.startXPos}),r="animate")),s&&"animate"===r&&s[e?"show":"hide"](e).animate(n),s){let t=this.pointAttribs(i,l||!i.selected?void 0:"select");l?d&&s.css({fill:t.fill}):s[r](t);}s&&s.addClass(i.getClassName(),!0);}else s&&(i.graphic=s.destroy());}markerAttribs(t,e){let i=this.options,s=i.marker,r=t.marker||{},o=r.symbol||s.symbol,a={},n,h,l=z(r.radius,s&&s.radius);e&&(n=s.states[e],l=z((h=r.states&&r.states[e])&&h.radius,n&&n.radius,l&&l+(n&&n.radiusPlus||0))),t.hasImage=o&&0===o.indexOf("url"),t.hasImage&&(l=0);let d=t.pos();return I(l)&&d&&(a.x=d[0]-l,a.y=d[1]-l,i.crisp&&(a.x=Math.floor(a.x))),l&&(a.width=a.height=2*l),a}pointAttribs(t,e){let i=this.options.marker,s=t&&t.options,r=s&&s.marker||{},o=s&&s.color,a=t&&t.color,n=t&&t.zone&&t.zone.color,h,l,d=this.color,c,p,u=z(r.lineWidth,i.lineWidth),g=1;return d=o||n||a||d,c=r.fillColor||i.fillColor||d,p=r.lineColor||i.lineColor||d,e=e||"normal",h=i.states[e]||{},u=z((l=r.states&&r.states[e]||{}).lineWidth,h.lineWidth,u+z(l.lineWidthPlus,h.lineWidthPlus,0)),c=l.fillColor||h.fillColor||c,{stroke:p=l.lineColor||h.lineColor||p,"stroke-width":u,fill:c,opacity:g=z(l.opacity,h.opacity,g)}}destroy(t){let e,i,s;let r=this,o=r.chart,a=/AppleWebKit\/533/.test(f.navigator.userAgent),n=r.data||[];for(P(r,"destroy",{keepEventsForUpdate:t}),this.removeEvents(t),(r.axisTypes||[]).forEach(function(t){(s=r[t])&&s.series&&(M(s.series,r),s.isDirty=s.forceRedraw=!0);}),r.legendItem&&r.chart.legend.destroyItem(r),e=n.length;e--;)(i=n[e])&&i.destroy&&i.destroy();for(let t of r.zones)k(t,void 0,!0);l.clearTimeout(r.animationTimeout),R(r,function(t,e){t instanceof h&&!t.survive&&t[a&&"group"===e?"hide":"destroy"]();}),o.hoverSeries===r&&(o.hoverSeries=void 0),M(o.series,r),o.orderItems("series"),R(r,function(e,i){t&&"hcEvents"===i||delete r[i];});}applyZones(){let{area:t,chart:e,graph:i,zones:s,points:r,xAxis:o,yAxis:a,zoneAxis:n}=this,{inverted:h,renderer:l}=e,d=this[`${n}Axis`],{isXAxis:c,len:p=0}=d||{},u=(i?.strokeWidth()||0)/2+1,g=(t,e=0,i=0)=>{h&&(i=p-i);let{translated:s=0,lineClip:r}=t,o=i-s;r?.push(["L",e,Math.abs(o)<u?i-u*(o<=0?-1:1):s]);};if(s.length&&(i||t)&&d&&I(d.min)){let e=d.getExtremes().max,u=t=>{t.forEach((e,i)=>{("M"===e[0]||"L"===e[0])&&(t[i]=[e[0],c?p-e[1]:e[1],c?e[2]:p-e[2]]);});};if(s.forEach(t=>{t.lineClip=[],t.translated=b(d.toPixels(z(t.value,e),!0)||0,0,p);}),i&&!this.showLine&&i.hide(),t&&t.hide(),"y"===n&&r.length<o.len)for(let t of r){let{plotX:e,plotY:i,zone:r}=t,o=r&&s[s.indexOf(r)-1];r&&g(r,e,i),o&&g(o,e,i);}let f=[],m=d.toPixels(d.getExtremes().min,!0);s.forEach(e=>{let s=e.lineClip||[],r=Math.round(e.translated||0);o.reversed&&s.reverse();let{clip:n,simpleClip:d}=e,p=0,g=0,x=o.len,y=a.len;c?(p=r,x=m):(g=r,y=m);let b=[["M",p,g],["L",x,g],["L",x,y],["L",p,y],["Z"]],v=[b[0],...s,b[1],b[2],...f,b[3],b[4]];f=s.reverse(),m=r,h&&(u(v),t&&u(b)),n?(n.animate({d:v}),d?.animate({d:b})):(n=e.clip=l.path(v),t&&(d=e.simpleClip=l.path(b))),i&&e.graph?.clip(n),t&&e.area?.clip(d);});}else this.visible&&(i&&i.show(),t&&t.show());}plotGroup(t,e,i,s,r){let o=this[t],a=!o,n={visibility:i,zIndex:s||.1};return S(this.opacity)&&!this.chart.styledMode&&"inactive"!==this.state&&(n.opacity=this.opacity),o||(this[t]=o=this.chart.renderer.g().add(r)),o.addClass("highcharts-"+e+" highcharts-series-"+this.index+" highcharts-"+this.type+"-series "+(S(this.colorIndex)?"highcharts-color-"+this.colorIndex+" ":"")+(this.options.className||"")+(o.hasClass("highcharts-tracker")?" highcharts-tracker":""),!0),o.attr(n)[a?"attr":"animate"](this.getPlotBox(e)),o}getPlotBox(t){let e=this.xAxis,i=this.yAxis,s=this.chart,r=s.inverted&&!s.polar&&e&&this.invertible&&"series"===t;return s.inverted&&(e=i,i=this.xAxis),{translateX:e?e.left:s.plotLeft,translateY:i?i.top:s.plotTop,rotation:r?90:0,rotationOriginX:r?(e.len-i.len)/2:0,rotationOriginY:r?(e.len+i.len)/2:0,scaleX:r?-1:1,scaleY:1}}removeEvents(t){let{eventsToUnbind:e}=this;t||N(this),e.length&&(e.forEach(t=>{t();}),e.length=0);}render(){let t=this,{chart:e,options:i,hasRendered:s}=t,r=d(i.animation),o=t.visible?"inherit":"hidden",a=i.zIndex,n=e.seriesGroup,h=t.finishedAnimating?0:r.duration;P(this,"render"),t.plotGroup("group","series",o,a,n),t.markerGroup=t.plotGroup("markerGroup","markers",o,a,n),!1!==i.clip&&t.setClip(),h&&t.animate?.(!0),t.drawGraph&&(t.drawGraph(),t.applyZones()),t.visible&&t.drawPoints(),t.drawDataLabels?.(),t.redrawPoints?.(),i.enableMouseTracking&&t.drawTracker?.(),h&&t.animate?.(),s||(h&&r.defer&&(h+=r.defer),t.animationTimeout=G(()=>{t.afterAnimate();},h||0)),t.isDirty=!1,t.hasRendered=!0,P(t,"afterRender");}redraw(){let t=this.isDirty||this.isDirtyData;this.translate(),this.render(),t&&delete this.kdTree;}reserveSpace(){return this.visible||!this.chart.options.chart.ignoreHiddenSeries}searchPoint(t,e){let{xAxis:i,yAxis:s}=this,r=this.chart.inverted;return this.searchKDTree({clientX:r?i.len-t.chartY+i.pos:t.chartX-i.pos,plotY:r?s.len-t.chartX+s.pos:t.chartY-s.pos},e,t)}buildKDTree(t){this.buildingKdTree=!0;let e=this,i=e.options.findNearestPointBy.indexOf("y")>-1?2:1;delete e.kdTree,G(function(){e.kdTree=function t(i,s,r){let o,a;let n=i?.length;if(n)return o=e.kdAxisArray[s%r],i.sort((t,e)=>(t[o]||0)-(e[o]||0)),{point:i[a=Math.floor(n/2)],left:t(i.slice(0,a),s+1,r),right:t(i.slice(a+1),s+1,r)}}(e.getValidPoints(void 0,!e.directTouch),i,i),e.buildingKdTree=!1;},e.options.kdNow||t?.type==="touchstart"?0:1);}searchKDTree(t,e,i){let s=this,[r,o]=this.kdAxisArray,a=e?"distX":"dist",n=(s.options.findNearestPointBy||"").indexOf("y")>-1?2:1,h=!!s.isBubble;if(this.kdTree||this.buildingKdTree||this.buildKDTree(i),this.kdTree)return function t(e,i,n,l){let d=i.point,c=s.kdAxisArray[n%l],p,u,g=d;!function(t,e){let i=t[r],s=e[r],a=S(i)&&S(s)?i-s:null,n=t[o],l=e[o],d=S(n)&&S(l)?n-l:0,c=h&&e.marker?.radius||0;e.dist=Math.sqrt((a&&a*a||0)+d*d)-c,e.distX=S(a)?Math.abs(a)-c:Number.MAX_VALUE;}(e,d);let f=(e[c]||0)-(d[c]||0)+(h&&d.marker?.radius||0),m=f<0?"left":"right",x=f<0?"right":"left";return i[m]&&(g=(p=t(e,i[m],n+1,l))[a]<g[a]?p:d),i[x]&&Math.sqrt(f*f)<g[a]&&(g=(u=t(e,i[x],n+1,l))[a]<g[a]?u:g),g}(t,this.kdTree,n,n)}pointPlacementToXValue(){let{options:t,xAxis:e}=this,i=t.pointPlacement;return "between"===i&&(i=e.reversed?-.5:.5),I(i)?i*(t.pointRange||e.pointRange):0}isPointInside(t){let{chart:e,xAxis:i,yAxis:s}=this,{plotX:r=-1,plotY:o=-1}=t;return o>=0&&o<=(s?s.len:e.plotHeight)&&r>=0&&r<=(i?i.len:e.plotWidth)}drawTracker(){let t=this,e=t.options,i=e.trackByArea,s=[].concat((i?t.areaPath:t.graphPath)||[]),r=t.chart,o=r.pointer,a=r.renderer,n=r.options.tooltip?.snap||0,h=()=>{e.enableMouseTracking&&r.hoverSeries!==t&&t.onMouseOver();},l="rgba(192,192,192,"+(g?1e-4:.002)+")",d=t.tracker;d?d.attr({d:s}):t.graph&&(t.tracker=d=a.path(s).attr({visibility:t.visible?"inherit":"hidden",zIndex:2}).addClass(i?"highcharts-tracker-area":"highcharts-tracker-line").add(t.group),r.styledMode||d.attr({"stroke-linecap":"round","stroke-linejoin":"round",stroke:l,fill:i?l:"none","stroke-width":t.graph.strokeWidth()+(i?0:2*n)}),[t.tracker,t.markerGroup,t.dataLabelsGroup].forEach(t=>{t&&(t.addClass("highcharts-tracker").on("mouseover",h).on("mouseout",t=>{o?.onTrackerMouseOut(t);}),e.cursor&&!r.styledMode&&t.css({cursor:e.cursor}),t.on("touchstart",h));})),P(this,"afterDrawTracker");}addPoint(t,e,i,s,r){let o,a;let n=this.options,h=this.data,l=this.chart,d=this.xAxis,c=d&&d.hasNames&&d.names,p=n.data,u=this.xData;e=z(e,!0);let g={series:this};this.pointClass.prototype.applyOptions.apply(g,[t]);let f=g.x;if(a=u.length,this.requireSorting&&f<u[a-1])for(o=!0;a&&u[a-1]>f;)a--;this.updateParallelArrays(g,"splice",[a,0,0]),this.updateParallelArrays(g,a),c&&g.name&&(c[f]=g.name),p.splice(a,0,t),(o||this.processedData)&&(this.data.splice(a,0,null),this.processData()),"point"===n.legendType&&this.generatePoints(),i&&(h[0]&&h[0].remove?h[0].remove(!1):(h.shift(),this.updateParallelArrays(g,"shift"),p.shift())),!1!==r&&P(this,"addPoint",{point:g}),this.isDirty=!0,this.isDirtyData=!0,e&&l.redraw(s);}removePoint(t,e,i){let s=this,r=s.data,o=r[t],a=s.points,n=s.chart,h=function(){a&&a.length===r.length&&a.splice(t,1),r.splice(t,1),s.options.data.splice(t,1),s.updateParallelArrays(o||{series:s},"splice",[t,1]),o&&o.destroy(),s.isDirty=!0,s.isDirtyData=!0,e&&n.redraw();};c(i,n),e=z(e,!0),o?o.firePointEvent("remove",null,h):h();}remove(t,e,i,s){let r=this,o=r.chart;function a(){r.destroy(s),o.isDirtyLegend=o.isDirtyBox=!0,o.linkSeries(s),z(t,!0)&&o.redraw(e);}!1!==i?P(r,"remove",null,a):a();}update(t,e){P(this,"update",{options:t=C(t,this.userOptions)});let i=this,s=i.chart,r=i.userOptions,o=i.initialType||i.type,a=s.options.plotOptions,n=m[o].prototype,h=i.finishedAnimating&&{animation:!1},l={},d,c,p=["colorIndex","eventOptions","navigatorSeries","symbolIndex","baseSeries"],u=t.type||r.type||s.options.chart.type,g=!(this.hasDerivedData||u&&u!==this.type||void 0!==t.pointStart||void 0!==t.pointInterval||void 0!==t.relativeXValue||t.joinBy||t.mapData||["dataGrouping","pointStart","pointInterval","pointIntervalUnit","keys"].some(t=>i.hasOptionChanged(t)));u=u||o,g&&(p.push("data","isDirtyData","isDirtyCanvas","points","processedData","processedXData","processedYData","xIncrement","cropped","_hasPointMarkers","hasDataLabels","nodes","layout","level","mapMap","mapData","minY","maxY","minX","maxX","transformGroups"),!1!==t.visible&&p.push("area","graph"),i.parallelArrays.forEach(function(t){p.push(t+"Data");}),t.data&&(t.dataSorting&&T(i.options.dataSorting,t.dataSorting),this.setData(t.data,!1))),t=B(r,{index:void 0===r.index?i.index:r.index,pointStart:a?.series?.pointStart??r.pointStart??i.xData?.[0]},!g&&{data:i.options.data},t,h),g&&t.data&&(t.data=i.options.data),(p=["group","markerGroup","dataLabelsGroup","transformGroup"].concat(p)).forEach(function(t){p[t]=i[t],delete i[t];});let f=!1;if(m[u]){if(f=u!==i.type,i.remove(!1,!1,!1,!0),f){if(s.propFromSeries(),Object.setPrototypeOf)Object.setPrototypeOf(i,m[u].prototype);else {let t=Object.hasOwnProperty.call(i,"hcEvents")&&i.hcEvents;for(c in n)i[c]=void 0;T(i,m[u].prototype),t?i.hcEvents=t:delete i.hcEvents;}}}else w(17,!0,s,{missingModuleFor:u});if(p.forEach(function(t){i[t]=p[t];}),i.init(s,t),g&&this.points)for(let t of(!1===(d=i.options).visible?(l.graphic=1,l.dataLabel=1):(this.hasMarkerChanged(d,r)&&(l.graphic=1),i.hasDataLabels?.()||(l.dataLabel=1)),this.points))t&&t.series&&(t.resolveColor(),Object.keys(l).length&&t.destroyElements(l),!1===d.showInLegend&&t.legendItem&&s.legend.destroyItem(t));i.initialType=o,s.linkSeries(),s.setSortedData(),f&&i.linkedSeries.length&&(i.isDirtyData=!0),P(this,"afterUpdate"),z(e,!0)&&s.redraw(!!g&&void 0);}setName(t){this.name=this.options.name=this.userOptions.name=t,this.chart.isDirtyLegend=!0;}hasOptionChanged(t){let e=this.chart,i=this.options[t],s=e.options.plotOptions,r=this.userOptions[t],o=z(s?.[this.type]?.[t],s?.series?.[t]);return r&&!S(o)?i!==r:i!==z(o,i)}onMouseOver(){let t=this.chart,e=t.hoverSeries,i=t.pointer;i?.setHoverChartIndex(),e&&e!==this&&e.onMouseOut(),this.options.events.mouseOver&&P(this,"mouseOver"),this.setState("hover"),t.hoverSeries=this;}onMouseOut(){let t=this.options,e=this.chart,i=e.tooltip,s=e.hoverPoint;e.hoverSeries=null,s&&s.onMouseOut(),this&&t.events.mouseOut&&P(this,"mouseOut"),i&&!this.stickyTracking&&(!i.shared||this.noSharedTooltip)&&i.hide(),e.series.forEach(function(t){t.setState("",!0);});}setState(t,e){let i=this,s=i.options,r=i.graph,o=s.inactiveOtherPoints,a=s.states,n=z(a[t||"normal"]&&a[t||"normal"].animation,i.chart.options.chart.animation),h=s.lineWidth,l=s.opacity;if(t=t||"",i.state!==t&&([i.group,i.markerGroup,i.dataLabelsGroup].forEach(function(e){e&&(i.state&&e.removeClass("highcharts-series-"+i.state),t&&e.addClass("highcharts-series-"+t));}),i.state=t,!i.chart.styledMode)){if(a[t]&&!1===a[t].enabled)return;if(t&&(h=a[t].lineWidth||h+(a[t].lineWidthPlus||0),l=z(a[t].opacity,l)),r&&!r.dashstyle&&I(h))for(let t of [r,...this.zones.map(t=>t.graph)])t?.animate({"stroke-width":h},n);o||[i.group,i.markerGroup,i.dataLabelsGroup,i.labelBySeries].forEach(function(t){t&&t.animate({opacity:l},n);});}e&&o&&i.points&&i.setAllPointsToState(t||void 0);}setAllPointsToState(t){this.points.forEach(function(e){e.setState&&e.setState(t);});}setVisible(t,e){let i=this,s=i.chart,r=s.options.chart.ignoreHiddenSeries,o=i.visible;i.visible=t=i.options.visible=i.userOptions.visible=void 0===t?!o:t;let a=t?"show":"hide";["group","dataLabelsGroup","markerGroup","tracker","tt"].forEach(t=>{i[t]?.[a]();}),(s.hoverSeries===i||s.hoverPoint?.series===i)&&i.onMouseOut(),i.legendItem&&s.legend.colorizeItem(i,t),i.isDirty=!0,i.options.stacking&&s.series.forEach(t=>{t.options.stacking&&t.visible&&(t.isDirty=!0);}),i.linkedSeries.forEach(e=>{e.setVisible(t,!1);}),r&&(s.isDirtyBox=!0),P(i,a),!1!==e&&s.redraw();}show(){this.setVisible(!0);}hide(){this.setVisible(!1);}select(t){this.selected=t=this.options.selected=void 0===t?!this.selected:t,this.checkbox&&(this.checkbox.checked=t),P(this,t?"select":"unselect");}shouldShowTooltip(t,e,i={}){return i.series=this,i.visiblePlotOnly=!0,this.chart.isInsidePlot(t,e,i)}drawLegendSymbol(t,e){r[this.options.legendSymbol||"rectangle"]?.call(this,t,e);}}return H.defaultOptions=a,H.types=n.seriesTypes,H.registerType=n.registerSeriesType,T(H.prototype,{axisTypes:["xAxis","yAxis"],coll:"series",colorCounter:0,directTouch:!1,invertible:!0,isCartesian:!0,kdAxisArray:["clientX","plotY"],parallelArrays:["x","y"],pointClass:o,requireSorting:!0,sorted:!0}),n.series=H,H}),i(e,"Core/Chart/Chart.js",[e["Core/Animation/AnimationUtilities.js"],e["Core/Axis/Axis.js"],e["Core/Defaults.js"],e["Core/Templating.js"],e["Core/Foundation.js"],e["Core/Globals.js"],e["Core/Renderer/RendererRegistry.js"],e["Core/Series/Series.js"],e["Core/Series/SeriesRegistry.js"],e["Core/Renderer/SVG/SVGRenderer.js"],e["Core/Time.js"],e["Core/Utilities.js"],e["Core/Renderer/HTML/AST.js"],e["Core/Axis/Tick.js"]],function(t,e,i,s,r,o,a,n,h,l,d,c,p,u){let{animate:g,animObject:f,setAnimation:m}=t,{defaultOptions:x,defaultTime:y}=i,{numberFormat:b}=s,{registerEventOptions:v}=r,{charts:S,doc:k,marginNames:C,svg:M,win:w}=o,{seriesTypes:T}=h,{addEvent:A,attr:P,createElement:L,css:O,defined:D,diffObjects:E,discardElement:I,erase:j,error:B,extend:R,find:z,fireEvent:N,getStyle:W,isArray:G,isNumber:H,isObject:X,isString:F,merge:Y,objectEach:U,pick:V,pInt:$,relativeLength:Z,removeEvent:_,splat:q,syncTimeout:K,uniqueKey:J}=c;class Q{static chart(t,e,i){return new Q(t,e,i)}constructor(t,e,i){this.sharedClips={};let s=[...arguments];(F(t)||t.nodeName)&&(this.renderTo=s.shift()),this.init(s[0],s[1]);}setZoomOptions(){let t=this.options.chart,e=t.zooming;this.zooming={...e,type:V(t.zoomType,e.type),key:V(t.zoomKey,e.key),pinchType:V(t.pinchType,e.pinchType),singleTouch:V(t.zoomBySingleTouch,e.singleTouch,!1),resetButton:Y(e.resetButton,t.resetZoomButton)};}init(t,e){N(this,"init",{args:arguments},function(){let i=Y(x,t),s=i.chart;this.userOptions=R({},t),this.margin=[],this.spacing=[],this.labelCollectors=[],this.callback=e,this.isResizing=0,this.options=i,this.axes=[],this.series=[],this.time=t.time&&Object.keys(t.time).length?new d(t.time):o.time,this.numberFormatter=s.numberFormatter||b,this.styledMode=s.styledMode,this.hasCartesianSeries=s.showAxes,this.index=S.length,S.push(this),o.chartCount++,v(this,s),this.xAxis=[],this.yAxis=[],this.pointCount=this.colorCounter=this.symbolCounter=0,this.setZoomOptions(),N(this,"afterInit"),this.firstRender();});}initSeries(t){let e=this.options.chart,i=t.type||e.type,s=T[i];s||B(17,!0,this,{missingModuleFor:i});let r=new s;return "function"==typeof r.init&&r.init(this,t),r}setSortedData(){this.getSeriesOrderByLinks().forEach(function(t){t.points||t.data||!t.enabledDataSorting||t.setData(t.options.data,!1);});}getSeriesOrderByLinks(){return this.series.concat().sort(function(t,e){return t.linkedSeries.length||e.linkedSeries.length?e.linkedSeries.length-t.linkedSeries.length:0})}orderItems(t,e=0){let i=this[t],s=this.options[t]=q(this.options[t]).slice(),r=this.userOptions[t]=this.userOptions[t]?q(this.userOptions[t]).slice():[];if(this.hasRendered&&(s.splice(e),r.splice(e)),i)for(let t=e,o=i.length;t<o;++t){let e=i[t];e&&(e.index=t,e instanceof n&&(e.name=e.getName()),e.options.isInternal||(s[t]=e.options,r[t]=e.userOptions));}}isInsidePlot(t,e,i={}){let{inverted:s,plotBox:r,plotLeft:o,plotTop:a,scrollablePlotBox:n}=this,{scrollLeft:h=0,scrollTop:l=0}=i.visiblePlotOnly&&this.scrollablePlotArea?.scrollingContainer||{},d=i.series,c=i.visiblePlotOnly&&n||r,p=i.inverted?e:t,u=i.inverted?t:e,g={x:p,y:u,isInsidePlot:!0,options:i};if(!i.ignoreX){let t=d&&(s&&!this.polar?d.yAxis:d.xAxis)||{pos:o,len:1/0},e=i.paneCoordinates?t.pos+p:o+p;e>=Math.max(h+o,t.pos)&&e<=Math.min(h+o+c.width,t.pos+t.len)||(g.isInsidePlot=!1);}if(!i.ignoreY&&g.isInsidePlot){let t=!s&&i.axis&&!i.axis.isXAxis&&i.axis||d&&(s?d.xAxis:d.yAxis)||{pos:a,len:1/0},e=i.paneCoordinates?t.pos+u:a+u;e>=Math.max(l+a,t.pos)&&e<=Math.min(l+a+c.height,t.pos+t.len)||(g.isInsidePlot=!1);}return N(this,"afterIsInsidePlot",g),g.isInsidePlot}redraw(t){N(this,"beforeRedraw");let e=this.hasCartesianSeries?this.axes:this.colorAxis||[],i=this.series,s=this.pointer,r=this.legend,o=this.userOptions.legend,a=this.renderer,n=a.isHidden(),h=[],l,d,c,p=this.isDirtyBox,u=this.isDirtyLegend,g;for(a.rootFontSize=a.boxWrapper.getStyle("font-size"),this.setResponsive&&this.setResponsive(!1),m(!!this.hasRendered&&t,this),n&&this.temporaryDisplay(),this.layOutTitles(!1),c=i.length;c--;)if(((g=i[c]).options.stacking||g.options.centerInCategory)&&(d=!0,g.isDirty)){l=!0;break}if(l)for(c=i.length;c--;)(g=i[c]).options.stacking&&(g.isDirty=!0);i.forEach(function(t){t.isDirty&&("point"===t.options.legendType?("function"==typeof t.updateTotals&&t.updateTotals(),u=!0):o&&(o.labelFormatter||o.labelFormat)&&(u=!0)),t.isDirtyData&&N(t,"updatedData");}),u&&r&&r.options.enabled&&(r.render(),this.isDirtyLegend=!1),d&&this.getStacks(),e.forEach(function(t){t.updateNames(),t.setScale();}),this.getMargins(),e.forEach(function(t){t.isDirty&&(p=!0);}),e.forEach(function(t){let e=t.min+","+t.max;t.extKey!==e&&(t.extKey=e,h.push(function(){N(t,"afterSetExtremes",R(t.eventArgs,t.getExtremes())),delete t.eventArgs;})),(p||d)&&t.redraw();}),p&&this.drawChartBox(),N(this,"predraw"),i.forEach(function(t){(p||t.isDirty)&&t.visible&&t.redraw(),t.isDirtyData=!1;}),s&&s.reset(!0),a.draw(),N(this,"redraw"),N(this,"render"),n&&this.temporaryDisplay(!0),h.forEach(function(t){t.call();});}get(t){let e=this.series;function i(e){return e.id===t||e.options&&e.options.id===t}let s=z(this.axes,i)||z(this.series,i);for(let t=0;!s&&t<e.length;t++)s=z(e[t].points||[],i);return s}getAxes(){let t=this.userOptions;for(let i of(N(this,"getAxes"),["xAxis","yAxis"]))for(let s of t[i]=q(t[i]||{}))new e(this,s,i);N(this,"afterGetAxes");}getSelectedPoints(){return this.series.reduce((t,e)=>(e.getPointsCollection().forEach(e=>{V(e.selectedStaging,e.selected)&&t.push(e);}),t),[])}getSelectedSeries(){return this.series.filter(function(t){return t.selected})}setTitle(t,e,i){this.applyDescription("title",t),this.applyDescription("subtitle",e),this.applyDescription("caption",void 0),this.layOutTitles(i);}applyDescription(t,e){let i=this,s=this.options[t]=Y(this.options[t],e),r=this[t];r&&e&&(this[t]=r=r.destroy()),s&&!r&&((r=this.renderer.text(s.text,0,0,s.useHTML).attr({align:s.align,class:"highcharts-"+t,zIndex:s.zIndex||4}).add()).update=function(e,s){i.applyDescription(t,e),i.layOutTitles(s);},this.styledMode||r.css(R("title"===t?{fontSize:this.options.isStock?"1em":"1.2em"}:{},s.style)),this[t]=r);}layOutTitles(t=!0){let e=[0,0,0],i=this.renderer,s=this.spacingBox;["title","subtitle","caption"].forEach(function(t){let r=this[t],o=this.options[t],a=o.verticalAlign||"top",n="title"===t?"top"===a?-3:0:"top"===a?e[0]+2:0;if(r){r.css({width:(o.width||s.width+(o.widthAdjust||0))+"px"});let t=i.fontMetrics(r).b,h=Math.round(r.getBBox(o.useHTML).height);r.align(R({y:"bottom"===a?t:n+t,height:h},o),!1,"spacingBox"),o.floating||("top"===a?e[0]=Math.ceil(e[0]+h):"bottom"===a&&(e[2]=Math.ceil(e[2]+h)));}},this),e[0]&&"top"===(this.options.title.verticalAlign||"top")&&(e[0]+=this.options.title.margin),e[2]&&"bottom"===this.options.caption.verticalAlign&&(e[2]+=this.options.caption.margin);let r=!this.titleOffset||this.titleOffset.join(",")!==e.join(",");this.titleOffset=e,N(this,"afterLayOutTitles"),!this.isDirtyBox&&r&&(this.isDirtyBox=this.isDirtyLegend=r,this.hasRendered&&t&&this.isDirtyBox&&this.redraw());}getContainerBox(){return {width:W(this.renderTo,"width",!0)||0,height:W(this.renderTo,"height",!0)||0}}getChartSize(){let t=this.options.chart,e=t.width,i=t.height,s=this.getContainerBox();this.chartWidth=Math.max(0,e||s.width||600),this.chartHeight=Math.max(0,Z(i,this.chartWidth)||(s.height>1?s.height:400)),this.containerBox=s;}temporaryDisplay(t){let e=this.renderTo,i;if(t)for(;e&&e.style;)e.hcOrigStyle&&(O(e,e.hcOrigStyle),delete e.hcOrigStyle),e.hcOrigDetached&&(k.body.removeChild(e),e.hcOrigDetached=!1),e=e.parentNode;else for(;e&&e.style&&(k.body.contains(e)||e.parentNode||(e.hcOrigDetached=!0,k.body.appendChild(e)),("none"===W(e,"display",!1)||e.hcOricDetached)&&(e.hcOrigStyle={display:e.style.display,height:e.style.height,overflow:e.style.overflow},i={display:"block",overflow:"hidden"},e!==this.renderTo&&(i.height=0),O(e,i),e.offsetWidth||e.style.setProperty("display","block","important")),(e=e.parentNode)!==k.body););}setClassName(t){this.container.className="highcharts-container "+(t||"");}getContainer(){let t=this.options,e=t.chart,i="data-highcharts-chart",s=J(),r,o=this.renderTo;o||(this.renderTo=o=e.renderTo),F(o)&&(this.renderTo=o=k.getElementById(o)),o||B(13,!0,this);let n=$(P(o,i));H(n)&&S[n]&&S[n].hasRendered&&S[n].destroy(),P(o,i,this.index),o.innerHTML=p.emptyHTML,e.skipClone||o.offsetWidth||this.temporaryDisplay(),this.getChartSize();let h=this.chartHeight,d=this.chartWidth;O(o,{overflow:"hidden"}),this.styledMode||(r=R({position:"relative",overflow:"hidden",width:d+"px",height:h+"px",textAlign:"left",lineHeight:"normal",zIndex:0,"-webkit-tap-highlight-color":"rgba(0,0,0,0)",userSelect:"none","touch-action":"manipulation",outline:"none"},e.style||{}));let c=L("div",{id:s},r,o);this.container=c,this.getChartSize(),d===this.chartWidth||(d=this.chartWidth,this.styledMode||O(c,{width:V(e.style?.width,d+"px")})),this.containerBox=this.getContainerBox(),this._cursor=c.style.cursor;let u=e.renderer||!M?a.getRendererType(e.renderer):l;if(this.renderer=new u(c,d,h,void 0,e.forExport,t.exporting&&t.exporting.allowHTML,this.styledMode),m(void 0,this),this.setClassName(e.className),this.styledMode)for(let e in t.defs)this.renderer.definition(t.defs[e]);else this.renderer.setStyle(e.style);this.renderer.chartIndex=this.index,N(this,"afterGetContainer");}getMargins(t){let{spacing:e,margin:i,titleOffset:s}=this;this.resetMargins(),s[0]&&!D(i[0])&&(this.plotTop=Math.max(this.plotTop,s[0]+e[0])),s[2]&&!D(i[2])&&(this.marginBottom=Math.max(this.marginBottom,s[2]+e[2])),this.legend&&this.legend.display&&this.legend.adjustMargins(i,e),N(this,"getMargins"),t||this.getAxisMargins();}getAxisMargins(){let t=this,e=t.axisOffset=[0,0,0,0],i=t.colorAxis,s=t.margin,r=function(t){t.forEach(function(t){t.visible&&t.getOffset();});};t.hasCartesianSeries?r(t.axes):i&&i.length&&r(i),C.forEach(function(i,r){D(s[r])||(t[i]+=e[r]);}),t.setChartSize();}getOptions(){return E(this.userOptions,x)}reflow(t){let e=this,i=e.containerBox,s=e.getContainerBox();delete e.pointer?.chartPosition,!e.isPrinting&&!e.isResizing&&i&&s.width&&((s.width!==i.width||s.height!==i.height)&&(c.clearTimeout(e.reflowTimeout),e.reflowTimeout=K(function(){e.container&&e.setSize(void 0,void 0,!1);},t?100:0)),e.containerBox=s);}setReflow(){let t=this,e=e=>{t.options?.chart.reflow&&t.hasLoaded&&t.reflow(e);};if("function"==typeof ResizeObserver)new ResizeObserver(e).observe(t.renderTo);else {let t=A(w,"resize",e);A(this,"destroy",t);}}setSize(t,e,i){let s=this,r=s.renderer;s.isResizing+=1,m(i,s);let o=r.globalAnimation;s.oldChartHeight=s.chartHeight,s.oldChartWidth=s.chartWidth,void 0!==t&&(s.options.chart.width=t),void 0!==e&&(s.options.chart.height=e),s.getChartSize();let{chartWidth:a,chartHeight:n,scrollablePixelsX:h=0,scrollablePixelsY:l=0}=s;(s.isDirtyBox||a!==s.oldChartWidth||n!==s.oldChartHeight)&&(s.styledMode||(o?g:O)(s.container,{width:`${a+h}px`,height:`${n+l}px`},o),s.setChartSize(!0),r.setSize(a,n,o),s.axes.forEach(function(t){t.isDirty=!0,t.setScale();}),s.isDirtyLegend=!0,s.isDirtyBox=!0,s.layOutTitles(),s.getMargins(),s.redraw(o),s.oldChartHeight=void 0,N(s,"resize"),setTimeout(()=>{s&&N(s,"endResize");},f(o).duration)),s.isResizing-=1;}setChartSize(t){let e,i,s,r;let o=this.inverted,a=this.renderer,n=this.chartWidth,h=this.chartHeight,l=this.options.chart,d=this.spacing,c=this.clipOffset;this.plotLeft=e=Math.round(this.plotLeft),this.plotTop=i=Math.round(this.plotTop),this.plotWidth=s=Math.max(0,Math.round(n-e-this.marginRight)),this.plotHeight=r=Math.max(0,Math.round(h-i-this.marginBottom)),this.plotSizeX=o?r:s,this.plotSizeY=o?s:r,this.plotBorderWidth=l.plotBorderWidth||0,this.spacingBox=a.spacingBox={x:d[3],y:d[0],width:n-d[3]-d[1],height:h-d[0]-d[2]},this.plotBox=a.plotBox={x:e,y:i,width:s,height:r};let p=2*Math.floor(this.plotBorderWidth/2),u=Math.ceil(Math.max(p,c[3])/2),g=Math.ceil(Math.max(p,c[0])/2);this.clipBox={x:u,y:g,width:Math.floor(this.plotSizeX-Math.max(p,c[1])/2-u),height:Math.max(0,Math.floor(this.plotSizeY-Math.max(p,c[2])/2-g))},t||(this.axes.forEach(function(t){t.setAxisSize(),t.setAxisTranslation();}),a.alignElements()),N(this,"afterSetChartSize",{skipAxes:t});}resetMargins(){N(this,"resetMargins");let t=this,e=t.options.chart;["margin","spacing"].forEach(function(i){let s=e[i],r=X(s)?s:[s,s,s,s];["Top","Right","Bottom","Left"].forEach(function(s,o){t[i][o]=V(e[i+s],r[o]);});}),C.forEach(function(e,i){t[e]=V(t.margin[i],t.spacing[i]);}),t.axisOffset=[0,0,0,0],t.clipOffset=[0,0,0,0];}drawChartBox(){let t=this.options.chart,e=this.renderer,i=this.chartWidth,s=this.chartHeight,r=this.styledMode,o=this.plotBGImage,a=t.backgroundColor,n=t.plotBackgroundColor,h=t.plotBackgroundImage,l=this.plotLeft,d=this.plotTop,c=this.plotWidth,p=this.plotHeight,u=this.plotBox,g=this.clipRect,f=this.clipBox,m=this.chartBackground,x=this.plotBackground,y=this.plotBorder,b,v,S,k="animate";m||(this.chartBackground=m=e.rect().addClass("highcharts-background").add(),k="attr"),r?b=v=m.strokeWidth():(v=(b=t.borderWidth||0)+(t.shadow?8:0),S={fill:a||"none"},(b||m["stroke-width"])&&(S.stroke=t.borderColor,S["stroke-width"]=b),m.attr(S).shadow(t.shadow)),m[k]({x:v/2,y:v/2,width:i-v-b%2,height:s-v-b%2,r:t.borderRadius}),k="animate",x||(k="attr",this.plotBackground=x=e.rect().addClass("highcharts-plot-background").add()),x[k](u),!r&&(x.attr({fill:n||"none"}).shadow(t.plotShadow),h&&(o?(h!==o.attr("href")&&o.attr("href",h),o.animate(u)):this.plotBGImage=e.image(h,l,d,c,p).add())),g?g.animate({width:f.width,height:f.height}):this.clipRect=e.clipRect(f),k="animate",y||(k="attr",this.plotBorder=y=e.rect().addClass("highcharts-plot-border").attr({zIndex:1}).add()),r||y.attr({stroke:t.plotBorderColor,"stroke-width":t.plotBorderWidth||0,fill:"none"}),y[k](y.crisp({x:l,y:d,width:c,height:p},-y.strokeWidth())),this.isDirtyBox=!1,N(this,"afterDrawChartBox");}propFromSeries(){let t,e,i;let s=this,r=s.options.chart,o=s.options.series;["inverted","angular","polar"].forEach(function(a){for(e=T[r.type],i=r[a]||e&&e.prototype[a],t=o&&o.length;!i&&t--;)(e=T[o[t].type])&&e.prototype[a]&&(i=!0);s[a]=i;});}linkSeries(t){let e=this,i=e.series;i.forEach(function(t){t.linkedSeries.length=0;}),i.forEach(function(t){let{linkedTo:i}=t.options;if(F(i)){let s;(s=":previous"===i?e.series[t.index-1]:e.get(i))&&s.linkedParent!==t&&(s.linkedSeries.push(t),t.linkedParent=s,s.enabledDataSorting&&t.setDataSortingOptions(),t.visible=V(t.options.visible,s.options.visible,t.visible));}}),N(this,"afterLinkSeries",{isUpdating:t});}renderSeries(){this.series.forEach(function(t){t.translate(),t.render();});}render(){let t=this.axes,e=this.colorAxis,i=this.renderer,s=this.options.chart.axisLayoutRuns||2,r=t=>{t.forEach(t=>{t.visible&&t.render();});},o=0,a=!0,n,h=0;for(let e of(this.setTitle(),N(this,"beforeMargins"),this.getStacks?.(),this.getMargins(!0),this.setChartSize(),t)){let{options:t}=e,{labels:i}=t;if(e.horiz&&e.visible&&i.enabled&&e.series.length&&"colorAxis"!==e.coll&&!this.polar){o=t.tickLength,e.createGroups();let s=new u(e,0,"",!0),r=s.createLabel("x",i);if(s.destroy(),r&&V(i.reserveSpace,!H(t.crossing))&&(o=r.getBBox().height+i.distance+Math.max(t.offset||0,0)),o){r?.destroy();break}}}for(this.plotHeight=Math.max(this.plotHeight-o,0);(a||n||s>1)&&h<s;){let e=this.plotWidth,i=this.plotHeight;for(let e of t)0===h?e.setScale():(e.horiz&&a||!e.horiz&&n)&&e.setTickInterval(!0);0===h?this.getAxisMargins():this.getMargins(),a=e/this.plotWidth>(h?1:1.1),n=i/this.plotHeight>(h?1:1.05),h++;}this.drawChartBox(),this.hasCartesianSeries?r(t):e&&e.length&&r(e),this.seriesGroup||(this.seriesGroup=i.g("series-group").attr({zIndex:3}).shadow(this.options.chart.seriesGroupShadow).add()),this.renderSeries(),this.addCredits(),this.setResponsive&&this.setResponsive(),this.hasRendered=!0;}addCredits(t){let e=this,i=Y(!0,this.options.credits,t);i.enabled&&!this.credits&&(this.credits=this.renderer.text(i.text+(this.mapCredits||""),0,0).addClass("highcharts-credits").on("click",function(){i.href&&(w.location.href=i.href);}).attr({align:i.position.align,zIndex:8}),e.styledMode||this.credits.css(i.style),this.credits.add().align(i.position),this.credits.update=function(t){e.credits=e.credits.destroy(),e.addCredits(t);});}destroy(){let t;let e=this,i=e.axes,s=e.series,r=e.container,a=r&&r.parentNode;for(N(e,"destroy"),e.renderer.forExport?j(S,e):S[e.index]=void 0,o.chartCount--,e.renderTo.removeAttribute("data-highcharts-chart"),_(e),t=i.length;t--;)i[t]=i[t].destroy();for(this.scroller&&this.scroller.destroy&&this.scroller.destroy(),t=s.length;t--;)s[t]=s[t].destroy();["title","subtitle","chartBackground","plotBackground","plotBGImage","plotBorder","seriesGroup","clipRect","credits","pointer","rangeSelector","legend","resetZoomButton","tooltip","renderer"].forEach(function(t){let i=e[t];i&&i.destroy&&(e[t]=i.destroy());}),r&&(r.innerHTML=p.emptyHTML,_(r),a&&I(r)),U(e,function(t,i){delete e[i];});}firstRender(){let t=this,e=t.options;t.getContainer(),t.resetMargins(),t.setChartSize(),t.propFromSeries(),t.getAxes();let i=G(e.series)?e.series:[];e.series=[],i.forEach(function(e){t.initSeries(e);}),t.linkSeries(),t.setSortedData(),N(t,"beforeRender"),t.render(),t.pointer?.getChartPosition(),t.renderer.imgCount||t.hasLoaded||t.onload(),t.temporaryDisplay(!0);}onload(){this.callbacks.concat([this.callback]).forEach(function(t){t&&void 0!==this.index&&t.apply(this,[this]);},this),N(this,"load"),N(this,"render"),D(this.index)&&this.setReflow(),this.warnIfA11yModuleNotLoaded(),this.hasLoaded=!0;}warnIfA11yModuleNotLoaded(){let{options:t,title:e}=this;!t||this.accessibility||(this.renderer.boxWrapper.attr({role:"img","aria-label":(e&&e.element.textContent||"").replace(/</g,"&lt;")}),t.accessibility&&!1===t.accessibility.enabled||B('Highcharts warning: Consider including the "accessibility.js" module to make your chart more usable for people with disabilities. Set the "accessibility.enabled" option to false to remove this warning. See https://www.highcharts.com/docs/accessibility/accessibility-module.',!1,this));}addSeries(t,e,i){let s;let r=this;return t&&(e=V(e,!0),N(r,"addSeries",{options:t},function(){s=r.initSeries(t),r.isDirtyLegend=!0,r.linkSeries(),s.enabledDataSorting&&s.setData(t.data,!1),N(r,"afterAddSeries",{series:s}),e&&r.redraw(i);})),s}addAxis(t,e,i,s){return this.createAxis(e?"xAxis":"yAxis",{axis:t,redraw:i,animation:s})}addColorAxis(t,e,i){return this.createAxis("colorAxis",{axis:t,redraw:e,animation:i})}createAxis(t,i){let s=new e(this,i.axis,t);return V(i.redraw,!0)&&this.redraw(i.animation),s}showLoading(t){let e=this,i=e.options,s=i.loading,r=function(){o&&O(o,{left:e.plotLeft+"px",top:e.plotTop+"px",width:e.plotWidth+"px",height:e.plotHeight+"px"});},o=e.loadingDiv,a=e.loadingSpan;o||(e.loadingDiv=o=L("div",{className:"highcharts-loading highcharts-loading-hidden"},null,e.container)),a||(e.loadingSpan=a=L("span",{className:"highcharts-loading-inner"},null,o),A(e,"redraw",r)),o.className="highcharts-loading",p.setElementHTML(a,V(t,i.lang.loading,"")),e.styledMode||(O(o,R(s.style,{zIndex:10})),O(a,s.labelStyle),e.loadingShown||(O(o,{opacity:0,display:""}),g(o,{opacity:s.style.opacity||.5},{duration:s.showDuration||0}))),e.loadingShown=!0,r();}hideLoading(){let t=this.options,e=this.loadingDiv;e&&(e.className="highcharts-loading highcharts-loading-hidden",this.styledMode||g(e,{opacity:0},{duration:t.loading.hideDuration||100,complete:function(){O(e,{display:"none"});}})),this.loadingShown=!1;}update(t,e,i,s){let r,o,a;let n=this,h={credits:"addCredits",title:"setTitle",subtitle:"setSubtitle",caption:"setCaption"},l=t.isResponsiveOptions,c=[];N(n,"update",{options:t}),l||n.setResponsive(!1,!0),t=E(t,n.options),n.userOptions=Y(n.userOptions,t);let p=t.chart;p&&(Y(!0,n.options.chart,p),this.setZoomOptions(),"className"in p&&n.setClassName(p.className),("inverted"in p||"polar"in p||"type"in p)&&(n.propFromSeries(),r=!0),"alignTicks"in p&&(r=!0),"events"in p&&v(this,p),U(p,function(t,e){-1!==n.propsRequireUpdateSeries.indexOf("chart."+e)&&(o=!0),-1!==n.propsRequireDirtyBox.indexOf(e)&&(n.isDirtyBox=!0),-1===n.propsRequireReflow.indexOf(e)||(n.isDirtyBox=!0,l||(a=!0));}),!n.styledMode&&p.style&&n.renderer.setStyle(n.options.chart.style||{})),!n.styledMode&&t.colors&&(this.options.colors=t.colors),t.time&&(this.time===y&&(this.time=new d(t.time)),Y(!0,n.options.time,t.time)),U(t,function(e,i){n[i]&&"function"==typeof n[i].update?n[i].update(e,!1):"function"==typeof n[h[i]]?n[h[i]](e):"colors"!==i&&-1===n.collectionsWithUpdate.indexOf(i)&&Y(!0,n.options[i],t[i]),"chart"!==i&&-1!==n.propsRequireUpdateSeries.indexOf(i)&&(o=!0);}),this.collectionsWithUpdate.forEach(function(e){t[e]&&(q(t[e]).forEach(function(t,s){let r;let o=D(t.id);o&&(r=n.get(t.id)),!r&&n[e]&&(r=n[e][V(t.index,s)])&&(o&&D(r.options.id)||r.options.isInternal)&&(r=void 0),r&&r.coll===e&&(r.update(t,!1),i&&(r.touched=!0)),!r&&i&&n.collectionsWithInit[e]&&(n.collectionsWithInit[e][0].apply(n,[t].concat(n.collectionsWithInit[e][1]||[]).concat([!1])).touched=!0);}),i&&n[e].forEach(function(t){t.touched||t.options.isInternal?delete t.touched:c.push(t);}));}),c.forEach(function(t){t.chart&&t.remove&&t.remove(!1);}),r&&n.axes.forEach(function(t){t.update({},!1);}),o&&n.getSeriesOrderByLinks().forEach(function(t){t.chart&&t.update({},!1);},this);let u=p&&p.width,g=p&&(F(p.height)?Z(p.height,u||n.chartWidth):p.height);a||H(u)&&u!==n.chartWidth||H(g)&&g!==n.chartHeight?n.setSize(u,g,s):V(e,!0)&&n.redraw(s),N(n,"afterUpdate",{options:t,redraw:e,animation:s});}setSubtitle(t,e){this.applyDescription("subtitle",t),this.layOutTitles(e);}setCaption(t,e){this.applyDescription("caption",t),this.layOutTitles(e);}showResetZoom(){let t=this,e=x.lang,i=t.zooming.resetButton,s=i.theme,r="chart"===i.relativeTo||"spacingBox"===i.relativeTo?null:"plotBox";function o(){t.zoomOut();}N(this,"beforeShowResetZoom",null,function(){t.resetZoomButton=t.renderer.button(e.resetZoom,null,null,o,s).attr({align:i.position.align,title:e.resetZoomTitle}).addClass("highcharts-reset-zoom").add().align(i.position,!1,r);}),N(this,"afterShowResetZoom");}zoomOut(){N(this,"selection",{resetSelection:!0},()=>this.transform({reset:!0,trigger:"zoom"}));}pan(t,e){let i=this,s="object"==typeof e?e:{enabled:e,type:"x"},r=s.type,o=r&&i[({x:"xAxis",xy:"axes",y:"yAxis"})[r]].filter(t=>t.options.panningEnabled&&!t.options.isInternal),a=i.options.chart;a?.panning&&(a.panning=s),N(this,"pan",{originalEvent:t},()=>{i.transform({axes:o,event:t,to:{x:t.chartX-(i.mouseDownX||0),y:t.chartY-(i.mouseDownY||0)},trigger:"pan"}),O(i.container,{cursor:"move"});});}transform(t){let{axes:e=this.axes,event:i,from:s={},reset:r,selection:o,to:a={},trigger:n}=t,{inverted:h}=this,l=!1,d;for(let t of(this.hoverPoints?.forEach(t=>t.setState()),e)){let{horiz:e,len:c,minPointOffset:p=0,options:u,reversed:g}=t,f=e?"width":"height",m=e?"x":"y",x=a[f]||t.len,y=s[f]||t.len,b=10>Math.abs(x)?1:x/y,v=(s[m]||0)+y/2-t.pos,S=v-((a[m]??t.pos)+x/2-t.pos)/b,k=g&&!h||!g&&h?-1:1;if(!r&&(v<0||v>t.len))continue;let C=t.toValue(S,!0)+(o?0:p*k),M=t.toValue(S+c/b,!0)-(o?0:p*k||0),w=t.allExtremes;if(C>M&&([C,M]=[M,C]),1===b&&!r&&"yAxis"===t.coll&&!w){for(let e of t.series){let t=e.getExtremes(e.getProcessedData(!0).yData,!0);w??(w={dataMin:Number.MAX_VALUE,dataMax:-Number.MAX_VALUE}),H(t.dataMin)&&H(t.dataMax)&&(w.dataMin=Math.min(t.dataMin,w.dataMin),w.dataMax=Math.max(t.dataMax,w.dataMax));}t.allExtremes=w;}let{dataMin:T,dataMax:A,min:P,max:L}=R(t.getExtremes(),w||{}),O=T??u.min,E=A??u.max,I=M-C,j=t.categories?0:Math.min(I,E-O),B=O-j*(D(u.min)?0:u.minPadding),z=E+j*(D(u.max)?0:u.maxPadding),N=t.allowZoomOutside||1===b||"zoom"!==n&&b>1,W=Math.min(u.min??B,B,N?P:B),G=Math.max(u.max??z,z,N?L:z);(!t.isOrdinal||1!==b||r)&&(C<W&&(C=W,b>=1&&(M=C+I)),M>G&&(M=G,b>=1&&(C=M-I)),(r||t.series.length&&(C!==P||M!==L)&&C>=W&&M<=G)&&(o?o[t.coll].push({axis:t,min:C,max:M}):(t.isPanning="zoom"!==n,t.setExtremes(r?void 0:C,r?void 0:M,!1,!1,{move:S,trigger:n,scale:b}),!r&&(C>W||M<G)&&"mousewheel"!==n&&(d=!0)),l=!0),i&&(this[e?"mouseDownX":"mouseDownY"]=i[e?"chartX":"chartY"]));}return l&&(o?N(this,"selection",o,()=>{delete t.selection,t.trigger="zoom",this.transform(t);}):(d&&!this.resetZoomButton?this.showResetZoom():!d&&this.resetZoomButton&&(this.resetZoomButton=this.resetZoomButton.destroy()),this.redraw("zoom"===n&&(this.options.chart.animation??this.pointCount<100)))),l}}return R(Q.prototype,{callbacks:[],collectionsWithInit:{xAxis:[Q.prototype.addAxis,[!0]],yAxis:[Q.prototype.addAxis,[!1]],series:[Q.prototype.addSeries]},collectionsWithUpdate:["xAxis","yAxis","series"],propsRequireDirtyBox:["backgroundColor","borderColor","borderWidth","borderRadius","plotBackgroundColor","plotBackgroundImage","plotBorderColor","plotBorderWidth","plotShadow","shadow"],propsRequireReflow:["margin","marginTop","marginRight","marginBottom","marginLeft","spacing","spacingTop","spacingRight","spacingBottom","spacingLeft"],propsRequireUpdateSeries:["chart.inverted","chart.polar","chart.ignoreHiddenSeries","chart.type","colors","plotOptions","time","tooltip"]}),Q}),i(e,"Extensions/ScrollablePlotArea.js",[e["Core/Animation/AnimationUtilities.js"],e["Core/Globals.js"],e["Core/Renderer/RendererRegistry.js"],e["Core/Utilities.js"]],function(t,e,i,s){let{stop:r}=t,{composed:o}=e,{addEvent:a,createElement:n,css:h,defined:l,merge:d,pushUnique:c}=s;function p(){let t=this.scrollablePlotArea;(this.scrollablePixelsX||this.scrollablePixelsY)&&!t&&(this.scrollablePlotArea=t=new g(this)),t?.applyFixed();}function u(){this.chart.scrollablePlotArea&&(this.chart.scrollablePlotArea.isDirty=!0);}class g{static compose(t,e,i){c(o,this.compose)&&(a(t,"afterInit",u),a(e,"afterSetChartSize",t=>this.afterSetSize(t.target,t)),a(e,"render",p),a(i,"show",u));}static afterSetSize(t,e){let i,s,r;let{minWidth:o,minHeight:a}=t.options.chart.scrollablePlotArea||{},{clipBox:n,plotBox:h,inverted:c,renderer:p}=t;if(!p.forExport&&(o?(t.scrollablePixelsX=i=Math.max(0,o-t.chartWidth),i&&(t.scrollablePlotBox=d(t.plotBox),h.width=t.plotWidth+=i,n[c?"height":"width"]+=i,r=!0)):a&&(t.scrollablePixelsY=s=Math.max(0,a-t.chartHeight),l(s)&&(t.scrollablePlotBox=d(t.plotBox),h.height=t.plotHeight+=s,n[c?"width":"height"]+=s,r=!1)),l(r)&&!e.skipAxes))for(let e of t.axes)e.horiz===r&&(e.setAxisSize(),e.setAxisTranslation());}constructor(t){let e;let s=t.options.chart,r=i.getRendererType(),o=s.scrollablePlotArea||{},l=this.moveFixedElements.bind(this),d={WebkitOverflowScrolling:"touch",overflowX:"hidden",overflowY:"hidden"};t.scrollablePixelsX&&(d.overflowX="auto"),t.scrollablePixelsY&&(d.overflowY="auto"),this.chart=t;let c=this.parentDiv=n("div",{className:"highcharts-scrolling-parent"},{position:"relative"},t.renderTo),p=this.scrollingContainer=n("div",{className:"highcharts-scrolling"},d,c),u=this.innerContainer=n("div",{className:"highcharts-inner-container"},void 0,p),g=this.fixedDiv=n("div",{className:"highcharts-fixed"},{position:"absolute",overflow:"hidden",pointerEvents:"none",zIndex:(s.style?.zIndex||0)+2,top:0},void 0,!0),f=this.fixedRenderer=new r(g,t.chartWidth,t.chartHeight,s.style);this.mask=f.path().attr({fill:s.backgroundColor||"#fff","fill-opacity":o.opacity??.85,zIndex:-1}).addClass("highcharts-scrollable-mask").add(),p.parentNode.insertBefore(g,p),h(t.renderTo,{overflow:"visible"}),a(t,"afterShowResetZoom",l),a(t,"afterApplyDrilldown",l),a(t,"afterLayOutTitles",l),a(p,"scroll",()=>{let{pointer:i,hoverPoint:s}=t;i&&(delete i.chartPosition,s&&(e=s),i.runPointActions(void 0,e,!0));}),u.appendChild(t.container);}applyFixed(){let{chart:t,fixedRenderer:e,isDirty:i,scrollingContainer:s}=this,{axisOffset:o,chartWidth:a,chartHeight:n,container:d,plotHeight:c,plotLeft:p,plotTop:u,plotWidth:g,scrollablePixelsX:f=0,scrollablePixelsY:m=0}=t,{scrollPositionX:x=0,scrollPositionY:y=0}=t.options.chart.scrollablePlotArea||{},b=a+f,v=n+m;e.setSize(a,n),(i??!0)&&(this.isDirty=!1,this.moveFixedElements()),r(t.container),h(d,{width:`${b}px`,height:`${v}px`}),t.renderer.boxWrapper.attr({width:b,height:v,viewBox:[0,0,b,v].join(" ")}),t.chartBackground?.attr({width:b,height:v}),h(s,{width:`${a}px`,height:`${n}px`}),l(i)||(s.scrollLeft=f*x,s.scrollTop=m*y);let S=u-o[0]-1,k=p-o[3]-1,C=u+c+o[2]+1,M=p+g+o[1]+1,w=p+g-f,T=u+c-m,A=[["M",0,0]];f?A=[["M",0,S],["L",p-1,S],["L",p-1,C],["L",0,C],["Z"],["M",w,S],["L",a,S],["L",a,C],["L",w,C],["Z"]]:m&&(A=[["M",k,0],["L",k,u-1],["L",M,u-1],["L",M,0],["Z"],["M",k,T],["L",k,n],["L",M,n],["L",M,T],["Z"]]),"adjustHeight"!==t.redrawTrigger&&this.mask.attr({d:A});}moveFixedElements(){let t;let{container:e,inverted:i,scrollablePixelsX:s,scrollablePixelsY:r}=this.chart,o=this.fixedRenderer,a=[".highcharts-breadcrumbs-group",".highcharts-contextbutton",".highcharts-caption",".highcharts-credits",".highcharts-legend",".highcharts-legend-checkbox",".highcharts-navigator-series",".highcharts-navigator-xaxis",".highcharts-navigator-yaxis",".highcharts-navigator",".highcharts-reset-zoom",".highcharts-drillup-button",".highcharts-scrollbar",".highcharts-subtitle",".highcharts-title"];for(let n of(s&&!i?t=".highcharts-yaxis":s&&i?t=".highcharts-xaxis":r&&!i?t=".highcharts-xaxis":r&&i&&(t=".highcharts-yaxis"),t&&a.push(`${t}:not(.highcharts-radial-axis)`,`${t}-labels:not(.highcharts-radial-axis-labels)`),a))[].forEach.call(e.querySelectorAll(n),t=>{(t.namespaceURI===o.SVG_NS?o.box:o.box.parentNode).appendChild(t),t.style.pointerEvents="auto";});}}return g}),i(e,"Core/Axis/Stacking/StackItem.js",[e["Core/Templating.js"],e["Core/Series/SeriesRegistry.js"],e["Core/Utilities.js"]],function(t,e,i){let{format:s}=t,{series:r}=e,{destroyObjectProperties:o,fireEvent:a,isNumber:n,pick:h}=i;return class{constructor(t,e,i,s,r){let o=t.chart.inverted,a=t.reversed;this.axis=t;let n=this.isNegative=!!i!=!!a;this.options=e=e||{},this.x=s,this.total=null,this.cumulative=null,this.points={},this.hasValidPoints=!1,this.stack=r,this.leftCliff=0,this.rightCliff=0,this.alignOptions={align:e.align||(o?n?"left":"right":"center"),verticalAlign:e.verticalAlign||(o?"middle":n?"bottom":"top"),y:e.y,x:e.x},this.textAlign=e.textAlign||(o?n?"right":"left":"center");}destroy(){o(this,this.axis);}render(t){let e=this.axis.chart,i=this.options,r=i.format,o=r?s(r,this,e):i.formatter.call(this);if(this.label)this.label.attr({text:o,visibility:"hidden"});else {this.label=e.renderer.label(o,null,void 0,i.shape,void 0,void 0,i.useHTML,!1,"stack-labels");let s={r:i.borderRadius||0,text:o,padding:h(i.padding,5),visibility:"hidden"};e.styledMode||(s.fill=i.backgroundColor,s.stroke=i.borderColor,s["stroke-width"]=i.borderWidth,this.label.css(i.style||{})),this.label.attr(s),this.label.added||this.label.add(t);}this.label.labelrank=e.plotSizeY,a(this,"afterRender");}setOffset(t,e,i,s,o,l){let{alignOptions:d,axis:c,label:p,options:u,textAlign:g}=this,f=c.chart,m=this.getStackBox({xOffset:t,width:e,boxBottom:i,boxTop:s,defaultX:o,xAxis:l}),{verticalAlign:x}=d;if(p&&m){let t=p.getBBox(void 0,0),e=p.padding,i="justify"===h(u.overflow,"justify"),s;d.x=u.x||0,d.y=u.y||0;let{x:o,y:a}=this.adjustStackPosition({labelBox:t,verticalAlign:x,textAlign:g});m.x-=o,m.y-=a,p.align(d,!1,m),(s=f.isInsidePlot(p.alignAttr.x+d.x+o,p.alignAttr.y+d.y+a))||(i=!1),i&&r.prototype.justifyDataLabel.call(c,p,d,p.alignAttr,t,m),p.attr({x:p.alignAttr.x,y:p.alignAttr.y,rotation:u.rotation,rotationOriginX:t.width*({left:0,center:.5,right:1})[u.textAlign||"center"],rotationOriginY:t.height/2}),h(!i&&u.crop,!0)&&(s=n(p.x)&&n(p.y)&&f.isInsidePlot(p.x-e+(p.width||0),p.y)&&f.isInsidePlot(p.x+e,p.y)),p[s?"show":"hide"]();}a(this,"afterSetOffset",{xOffset:t,width:e});}adjustStackPosition({labelBox:t,verticalAlign:e,textAlign:i}){let s={bottom:0,middle:1,top:2,right:1,center:0,left:-1},r=s[e],o=s[i];return {x:t.width/2+t.width/2*o,y:t.height/2*r}}getStackBox(t){let e=this.axis,i=e.chart,{boxTop:s,defaultX:r,xOffset:o,width:a,boxBottom:l}=t,d=e.stacking.usePercentage?100:h(s,this.total,0),c=e.toPixels(d),p=t.xAxis||i.xAxis[0],u=h(r,p.translate(this.x))+o,g=Math.abs(c-e.toPixels(l||n(e.min)&&e.logarithmic&&e.logarithmic.lin2log(e.min)||0)),f=i.inverted,m=this.isNegative;return f?{x:(m?c:c-g)-i.plotLeft,y:p.height-u-a,width:g,height:a}:{x:u+p.transB-i.plotLeft,y:(m?c-g:c)-i.plotTop,width:a,height:g}}}}),i(e,"Core/Axis/Stacking/StackingAxis.js",[e["Core/Animation/AnimationUtilities.js"],e["Core/Axis/Axis.js"],e["Core/Series/SeriesRegistry.js"],e["Core/Axis/Stacking/StackItem.js"],e["Core/Utilities.js"]],function(t,e,i,s,r){var o;let{getDeferredAnimation:a}=t,{series:{prototype:n}}=i,{addEvent:h,correctFloat:l,defined:d,destroyObjectProperties:c,fireEvent:p,isArray:u,isNumber:g,objectEach:f,pick:m}=r;function x(){let t=this.inverted;this.axes.forEach(t=>{t.stacking&&t.stacking.stacks&&t.hasVisibleSeries&&(t.stacking.oldStacks=t.stacking.stacks);}),this.series.forEach(e=>{let i=e.xAxis&&e.xAxis.options||{};e.options.stacking&&e.reserveSpace()&&(e.stackKey=[e.type,m(e.options.stack,""),t?i.top:i.left,t?i.height:i.width].join(","));});}function y(){let t=this.stacking;if(t){let e=t.stacks;f(e,(t,i)=>{c(t),delete e[i];}),t.stackTotalGroup?.destroy();}}function b(){this.stacking||(this.stacking=new w(this));}function v(t,e,i,s){return !d(t)||t.x!==e||s&&t.stackKey!==s?t={x:e,index:0,key:s,stackKey:s}:t.index++,t.key=[i,e,t.index].join(","),t}function S(){let t;let e=this,i=e.yAxis,s=e.stackKey||"",r=i.stacking.stacks,o=e.processedXData,a=e.options.stacking,n=e[a+"Stacker"];n&&[s,"-"+s].forEach(i=>{let s=o.length,a,h,l;for(;s--;)a=o[s],t=e.getStackIndicator(t,a,e.index,i),h=r[i]?.[a],(l=h?.points[t.key||""])&&n.call(e,l,h,s);});}function k(t,e,i){let s=e.total?100/e.total:0;t[0]=l(t[0]*s),t[1]=l(t[1]*s),this.stackedYData[i]=t[1];}function C(t){(this.is("column")||this.is("columnrange"))&&(this.options.centerInCategory&&!this.options.stacking&&this.chart.series.length>1?n.setStackedPoints.call(this,t,"group"):t.stacking.resetStacks());}function M(t,e){let i,r,o,a,n,h,c,p,g;let f=e||this.options.stacking;if(!f||!this.reserveSpace()||(({group:"xAxis"})[f]||"yAxis")!==t.coll)return;let x=this.processedXData,y=this.processedYData,b=[],v=y.length,S=this.options,k=S.threshold||0,C=S.startFromThreshold?k:0,M=S.stack,w=e?`${this.type},${f}`:this.stackKey||"",T="-"+w,A=this.negStacks,P=t.stacking,L=P.stacks,O=P.oldStacks;for(P.stacksTouched+=1,c=0;c<v;c++){p=x[c],g=y[c],h=(i=this.getStackIndicator(i,p,this.index)).key||"",L[n=(r=A&&g<(C?0:k))?T:w]||(L[n]={}),L[n][p]||(O[n]?.[p]?(L[n][p]=O[n][p],L[n][p].total=null):L[n][p]=new s(t,t.options.stackLabels,!!r,p,M)),o=L[n][p],null!==g?(o.points[h]=o.points[this.index]=[m(o.cumulative,C)],d(o.cumulative)||(o.base=h),o.touched=P.stacksTouched,i.index>0&&!1===this.singleStacks&&(o.points[h][0]=o.points[this.index+","+p+",0"][0])):(delete o.points[h],delete o.points[this.index]);let e=o.total||0;"percent"===f?(a=r?w:T,e=A&&L[a]?.[p]?(a=L[a][p]).total=Math.max(a.total||0,e)+Math.abs(g)||0:l(e+(Math.abs(g)||0))):"group"===f?(u(g)&&(g=g[0]),null!==g&&e++):e=l(e+(g||0)),"group"===f?o.cumulative=(e||1)-1:o.cumulative=l(m(o.cumulative,C)+(g||0)),o.total=e,null!==g&&(o.points[h].push(o.cumulative),b[c]=o.cumulative,o.hasValidPoints=!0);}"percent"===f&&(P.usePercentage=!0),"group"!==f&&(this.stackedYData=b),P.oldStacks={};}class w{constructor(t){this.oldStacks={},this.stacks={},this.stacksTouched=0,this.axis=t;}buildStacks(){let t,e;let i=this.axis,s=i.series,r="xAxis"===i.coll,o=i.options.reversedStacks,a=s.length;for(this.resetStacks(),this.usePercentage=!1,e=a;e--;)t=s[o?e:a-e-1],r&&t.setGroupedPoints(i),t.setStackedPoints(i);if(!r)for(e=0;e<a;e++)s[e].modifyStacks();p(i,"afterBuildStacks");}cleanStacks(){this.oldStacks&&(this.stacks=this.oldStacks,f(this.stacks,t=>{f(t,t=>{t.cumulative=t.total;});}));}resetStacks(){f(this.stacks,t=>{f(t,(e,i)=>{g(e.touched)&&e.touched<this.stacksTouched?(e.destroy(),delete t[i]):(e.total=null,e.cumulative=null);});});}renderStackTotals(){let t=this.axis,e=t.chart,i=e.renderer,s=this.stacks,r=a(e,t.options.stackLabels?.animation||!1),o=this.stackTotalGroup=this.stackTotalGroup||i.g("stack-labels").attr({zIndex:6,opacity:0}).add();o.translate(e.plotLeft,e.plotTop),f(s,t=>{f(t,t=>{t.render(o);});}),o.animate({opacity:1},r);}}return (o||(o={})).compose=function(t,e,i){let s=e.prototype,r=i.prototype;s.getStacks||(h(t,"init",b),h(t,"destroy",y),s.getStacks=x,r.getStackIndicator=v,r.modifyStacks=S,r.percentStacker=k,r.setGroupedPoints=C,r.setStackedPoints=M);},o}),i(e,"Series/Line/LineSeries.js",[e["Core/Series/Series.js"],e["Core/Series/SeriesRegistry.js"],e["Core/Utilities.js"]],function(t,e,i){let{defined:s,merge:r,isObject:o}=i;class a extends t{drawGraph(){let t=this.options,e=(this.gappedPath||this.getGraphPath).call(this),i=this.chart.styledMode;[this,...this.zones].forEach((s,a)=>{let n,h=s.graph,l=h?"animate":"attr",d=s.dashStyle||t.dashStyle;h?(h.endX=this.preventGraphAnimation?null:e.xMap,h.animate({d:e})):e.length&&(s.graph=h=this.chart.renderer.path(e).addClass("highcharts-graph"+(a?` highcharts-zone-graph-${a-1} `:" ")+(a&&s.className||"")).attr({zIndex:1}).add(this.group)),h&&!i&&(n={stroke:!a&&t.lineColor||s.color||this.color||"#cccccc","stroke-width":t.lineWidth||0,fill:this.fillGraph&&this.color||"none"},d?n.dashstyle=d:"square"!==t.linecap&&(n["stroke-linecap"]=n["stroke-linejoin"]="round"),h[l](n).shadow(a<2&&t.shadow&&r({filterUnits:"userSpaceOnUse"},o(t.shadow)?t.shadow:{}))),h&&(h.startX=e.xMap,h.isArea=e.isArea);});}getGraphPath(t,e,i){let r=this,o=r.options,a=[],n=[],h,l=o.step,d=(t=t||r.points).reversed;return d&&t.reverse(),(l=({right:1,center:2})[l]||l&&3)&&d&&(l=4-l),(t=this.getValidPoints(t,!1,!(o.connectNulls&&!e&&!i))).forEach(function(d,c){let p;let u=d.plotX,g=d.plotY,f=t[c-1],m=d.isNull||"number"!=typeof g;(d.leftCliff||f&&f.rightCliff)&&!i&&(h=!0),m&&!s(e)&&c>0?h=!o.connectNulls:m&&!e?h=!0:(0===c||h?p=[["M",d.plotX,d.plotY]]:r.getPointSpline?p=[r.getPointSpline(t,d,c)]:l?(p=1===l?[["L",f.plotX,g]]:2===l?[["L",(f.plotX+u)/2,f.plotY],["L",(f.plotX+u)/2,g]]:[["L",u,f.plotY]]).push(["L",u,g]):p=[["L",u,g]],n.push(d.x),l&&(n.push(d.x),2===l&&n.push(d.x)),a.push.apply(a,p),h=!1);}),a.xMap=n,r.graphPath=a,a}}return a.defaultOptions=r(t.defaultOptions,{legendSymbol:"lineMarker"}),e.registerSeriesType("line",a),a}),i(e,"Series/Area/AreaSeries.js",[e["Core/Series/SeriesRegistry.js"],e["Core/Utilities.js"]],function(t,e){let{seriesTypes:{line:i}}=t,{extend:s,merge:r,objectEach:o,pick:a}=e;class n extends i{drawGraph(){this.areaPath=[],super.drawGraph.apply(this);let{areaPath:t,options:e}=this;[this,...this.zones].forEach((i,s)=>{let r={},o=i.fillColor||e.fillColor,a=i.area,n=a?"animate":"attr";a?(a.endX=this.preventGraphAnimation?null:t.xMap,a.animate({d:t})):(r.zIndex=0,(a=i.area=this.chart.renderer.path(t).addClass("highcharts-area"+(s?` highcharts-zone-area-${s-1} `:" ")+(s&&i.className||"")).add(this.group)).isArea=!0),this.chart.styledMode||(r.fill=o||i.color||this.color,r["fill-opacity"]=o?1:e.fillOpacity??.75,a.css({pointerEvents:this.stickyTracking?"none":"auto"})),a[n](r),a.startX=t.xMap,a.shiftUnit=e.step?2:1;});}getGraphPath(t){let e,s,r;let o=i.prototype.getGraphPath,n=this.options,h=n.stacking,l=this.yAxis,d=[],c=[],p=this.index,u=l.stacking.stacks[this.stackKey],g=n.threshold,f=Math.round(l.getThreshold(n.threshold)),m=a(n.connectNulls,"percent"===h),x=function(i,s,r){let o=t[i],a=h&&u[o.x].points[p],n=o[r+"Null"]||0,m=o[r+"Cliff"]||0,x,y,b=!0;m||n?(x=(n?a[0]:a[1])+m,y=a[0]+m,b=!!n):!h&&t[s]&&t[s].isNull&&(x=y=g),void 0!==x&&(c.push({plotX:e,plotY:null===x?f:l.getThreshold(x),isNull:b,isCliff:!0}),d.push({plotX:e,plotY:null===y?f:l.getThreshold(y),doCurve:!1}));};t=t||this.points,h&&(t=this.getStackPoints(t));for(let i=0,o=t.length;i<o;++i)h||(t[i].leftCliff=t[i].rightCliff=t[i].leftNull=t[i].rightNull=void 0),s=t[i].isNull,e=a(t[i].rectPlotX,t[i].plotX),r=h?a(t[i].yBottom,f):f,s&&!m||(m||x(i,i-1,"left"),s&&!h&&m||(c.push(t[i]),d.push({x:i,plotX:e,plotY:r})),m||x(i,i+1,"right"));let y=o.call(this,c,!0,!0);d.reversed=!0;let b=o.call(this,d,!0,!0),v=b[0];v&&"M"===v[0]&&(b[0]=["L",v[1],v[2]]);let S=y.concat(b);S.length&&S.push(["Z"]);let k=o.call(this,c,!1,m);return S.xMap=y.xMap,this.areaPath=S,k}getStackPoints(t){let e=this,i=[],s=[],r=this.xAxis,n=this.yAxis,h=n.stacking.stacks[this.stackKey],l={},d=n.series,c=d.length,p=n.options.reversedStacks?1:-1,u=d.indexOf(e);if(t=t||this.points,this.options.stacking){for(let e=0;e<t.length;e++)t[e].leftNull=t[e].rightNull=void 0,l[t[e].x]=t[e];o(h,function(t,e){null!==t.total&&s.push(e);}),s.sort(function(t,e){return t-e});let g=d.map(t=>t.visible);s.forEach(function(t,o){let f=0,m,x;if(l[t]&&!l[t].isNull)i.push(l[t]),[-1,1].forEach(function(i){let r=1===i?"rightNull":"leftNull",a=h[s[o+i]],n=0;if(a){let i=u;for(;i>=0&&i<c;){let s=d[i].index;!(m=a.points[s])&&(s===e.index?l[t][r]=!0:g[i]&&(x=h[t].points[s])&&(n-=x[1]-x[0])),i+=p;}}l[t][1===i?"rightCliff":"leftCliff"]=n;});else {let e=u;for(;e>=0&&e<c;){let i=d[e].index;if(m=h[t].points[i]){f=m[1];break}e+=p;}f=a(f,0),f=n.translate(f,0,1,0,1),i.push({isNull:!0,plotX:r.translate(t,0,0,0,1),x:t,plotY:f,yBottom:f});}});}return i}}return n.defaultOptions=r(i.defaultOptions,{threshold:0,legendSymbol:"areaMarker"}),s(n.prototype,{singleStacks:!1}),t.registerSeriesType("area",n),n}),i(e,"Series/Spline/SplineSeries.js",[e["Core/Series/SeriesRegistry.js"],e["Core/Utilities.js"]],function(t,e){let{line:i}=t.seriesTypes,{merge:s,pick:r}=e;class o extends i{getPointSpline(t,e,i){let s,o,a,n;let h=e.plotX||0,l=e.plotY||0,d=t[i-1],c=t[i+1];function p(t){return t&&!t.isNull&&!1!==t.doCurve&&!e.isCliff}if(p(d)&&p(c)){let t=d.plotX||0,i=d.plotY||0,r=c.plotX||0,p=c.plotY||0,u=0;s=(1.5*h+t)/2.5,o=(1.5*l+i)/2.5,a=(1.5*h+r)/2.5,n=(1.5*l+p)/2.5,a!==s&&(u=(n-o)*(a-h)/(a-s)+l-n),o+=u,n+=u,o>i&&o>l?(o=Math.max(i,l),n=2*l-o):o<i&&o<l&&(o=Math.min(i,l),n=2*l-o),n>p&&n>l?(n=Math.max(p,l),o=2*l-n):n<p&&n<l&&(n=Math.min(p,l),o=2*l-n),e.rightContX=a,e.rightContY=n,e.controlPoints={low:[s,o],high:[a,n]};}let u=["C",r(d.rightContX,d.plotX,0),r(d.rightContY,d.plotY,0),r(s,h,0),r(o,l,0),h,l];return d.rightContX=d.rightContY=void 0,u}}return o.defaultOptions=s(i.defaultOptions),t.registerSeriesType("spline",o),o}),i(e,"Series/AreaSpline/AreaSplineSeries.js",[e["Series/Spline/SplineSeries.js"],e["Core/Series/SeriesRegistry.js"],e["Core/Utilities.js"]],function(t,e,i){let{area:s,area:{prototype:r}}=e.seriesTypes,{extend:o,merge:a}=i;class n extends t{}return n.defaultOptions=a(t.defaultOptions,s.defaultOptions),o(n.prototype,{getGraphPath:r.getGraphPath,getStackPoints:r.getStackPoints,drawGraph:r.drawGraph}),e.registerSeriesType("areaspline",n),n}),i(e,"Series/Column/ColumnSeriesDefaults.js",[],function(){return {borderRadius:3,centerInCategory:!1,groupPadding:.2,marker:null,pointPadding:.1,minPointLength:0,cropThreshold:50,pointRange:null,states:{hover:{halo:!1,brightness:.1},select:{color:"#cccccc",borderColor:"#000000"}},dataLabels:{align:void 0,verticalAlign:void 0,y:void 0},startFromThreshold:!0,stickyTracking:!1,tooltip:{distance:6},threshold:0,borderColor:"#ffffff"}}),i(e,"Series/Column/ColumnSeries.js",[e["Core/Animation/AnimationUtilities.js"],e["Core/Color/Color.js"],e["Series/Column/ColumnSeriesDefaults.js"],e["Core/Globals.js"],e["Core/Series/Series.js"],e["Core/Series/SeriesRegistry.js"],e["Core/Utilities.js"]],function(t,e,i,s,r,o,a){let{animObject:n}=t,{parse:h}=e,{noop:l}=s,{clamp:d,defined:c,extend:p,fireEvent:u,isArray:g,isNumber:f,merge:m,pick:x,objectEach:y}=a;class b extends r{animate(t){let e,i;let s=this,r=this.yAxis,o=r.pos,a=s.options,h=this.chart.inverted,l={},c=h?"translateX":"translateY";t?(l.scaleY=.001,i=d(r.toPixels(a.threshold),o,o+r.len),h?l.translateX=i-r.len:l.translateY=i,s.clipBox&&s.setClip(),s.group.attr(l)):(e=Number(s.group.attr(c)),s.group.animate({scaleY:1},p(n(s.options.animation),{step:function(t,i){s.group&&(l[c]=e+i.pos*(o-e),s.group.attr(l));}})));}init(t,e){super.init.apply(this,arguments);let i=this;(t=i.chart).hasRendered&&t.series.forEach(function(t){t.type===i.type&&(t.isDirty=!0);});}getColumnMetrics(){let t=this,e=t.options,i=t.xAxis,s=t.yAxis,r=i.options.reversedStacks,o=i.reversed&&!r||!i.reversed&&r,a={},n,h=0;!1===e.grouping?h=1:t.chart.series.forEach(function(e){let i;let r=e.yAxis,o=e.options;e.type===t.type&&e.reserveSpace()&&s.len===r.len&&s.pos===r.pos&&(o.stacking&&"group"!==o.stacking?(void 0===a[n=e.stackKey]&&(a[n]=h++),i=a[n]):!1!==o.grouping&&(i=h++),e.columnIndex=i);});let l=Math.min(Math.abs(i.transA)*(!i.brokenAxis?.hasBreaks&&i.ordinal?.slope||e.pointRange||i.closestPointRange||i.tickInterval||1),i.len),d=l*e.groupPadding,c=(l-2*d)/(h||1),p=Math.min(e.maxPointWidth||i.len,x(e.pointWidth,c*(1-2*e.pointPadding))),u=(t.columnIndex||0)+(o?1:0);return t.columnMetrics={width:p,offset:(c-p)/2+(d+u*c-l/2)*(o?-1:1),paddedWidth:c,columnCount:h},t.columnMetrics}crispCol(t,e,i,s){let r=this.borderWidth,o=-(r%2?.5:0),a=r%2?.5:1;this.options.crisp&&(i=Math.round(t+i)+o-(t=Math.round(t)+o));let n=Math.round(e+s)+a,h=.5>=Math.abs(e)&&n>.5;return s=n-(e=Math.round(e)+a),h&&s&&(e-=1,s+=1),{x:t,y:e,width:i,height:s}}adjustForMissingColumns(t,e,i,s){if(!i.isNull&&s.columnCount>1){let r=this.xAxis.series.filter(t=>t.visible).map(t=>t.index),o=0,a=0;y(this.xAxis.stacking?.stacks,t=>{if("number"==typeof i.x){let e=t[i.x.toString()];if(e&&g(e.points[this.index])){let t=Object.keys(e.points).filter(t=>!t.match(",")&&e.points[t]&&e.points[t].length>1).map(parseFloat).filter(t=>-1!==r.indexOf(t)).sort((t,e)=>e-t);o=t.indexOf(this.index),a=t.length;}}}),o=this.xAxis.reversed?a-1-o:o;let n=(a-1)*s.paddedWidth+e;t=(i.plotX||0)+n/2-e-o*s.paddedWidth;}return t}translate(){let t=this,e=t.chart,i=t.options,s=t.dense=t.closestPointRange*t.xAxis.transA<2,o=t.borderWidth=x(i.borderWidth,s?0:1),a=t.xAxis,n=t.yAxis,h=i.threshold,l=x(i.minPointLength,5),p=t.getColumnMetrics(),g=p.width,m=t.pointXOffset=p.offset,y=t.dataMin,b=t.dataMax,v=t.barW=Math.max(g,1+2*o),S=t.translatedThreshold=n.getThreshold(h);e.inverted&&(S-=.5),i.pointPadding&&(v=Math.ceil(v)),r.prototype.translate.apply(t),t.points.forEach(function(s){let r=x(s.yBottom,S),o=999+Math.abs(r),u=s.plotX||0,k=d(s.plotY,-o,n.len+o),C,M=Math.min(k,r),w=Math.max(k,r)-M,T=g,A=u+m,P=v;l&&Math.abs(w)<l&&(w=l,C=!n.reversed&&!s.negative||n.reversed&&s.negative,f(h)&&f(b)&&s.y===h&&b<=h&&(n.min||0)<h&&(y!==b||(n.max||0)<=h)&&(C=!C,s.negative=!s.negative),M=Math.abs(M-S)>l?r-l:S-(C?l:0)),c(s.options.pointWidth)&&(A-=Math.round(((T=P=Math.ceil(s.options.pointWidth))-g)/2)),i.centerInCategory&&!i.stacking&&(A=t.adjustForMissingColumns(A,T,s,p)),s.barX=A,s.pointWidth=T,s.tooltipPos=e.inverted?[d(n.len+n.pos-e.plotLeft-k,n.pos-e.plotLeft,n.len+n.pos-e.plotLeft),a.len+a.pos-e.plotTop-A-P/2,w]:[a.left-e.plotLeft+A+P/2,d(k+n.pos-e.plotTop,n.pos-e.plotTop,n.len+n.pos-e.plotTop),w],s.shapeType=t.pointClass.prototype.shapeType||"roundedRect",s.shapeArgs=t.crispCol(A,s.isNull?S:M,P,s.isNull?0:w);}),u(this,"afterColumnTranslate");}drawGraph(){this.group[this.dense?"addClass":"removeClass"]("highcharts-dense-data");}pointAttribs(t,e){let i=this.options,s=this.pointAttrToOptions||{},r=s.stroke||"borderColor",o=s["stroke-width"]||"borderWidth",a,n,l,d=t&&t.color||this.color,c=t&&t[r]||i[r]||d,p=t&&t.options.dashStyle||i.dashStyle,u=t&&t[o]||i[o]||this[o]||0,g=x(t&&t.opacity,i.opacity,1);t&&this.zones.length&&(n=t.getZone(),d=t.options.color||n&&(n.color||t.nonZonedColor)||this.color,n&&(c=n.borderColor||c,p=n.dashStyle||p,u=n.borderWidth||u)),e&&t&&(l=(a=m(i.states[e],t.options.states&&t.options.states[e]||{})).brightness,d=a.color||void 0!==l&&h(d).brighten(a.brightness).get()||d,c=a[r]||c,u=a[o]||u,p=a.dashStyle||p,g=x(a.opacity,g));let f={fill:d,stroke:c,"stroke-width":u,opacity:g};return p&&(f.dashstyle=p),f}drawPoints(t=this.points){let e;let i=this,s=this.chart,r=i.options,o=s.renderer,a=r.animationLimit||250;t.forEach(function(t){let n=t.plotY,h=t.graphic,l=!!h,d=h&&s.pointCount<a?"animate":"attr";f(n)&&null!==t.y?(e=t.shapeArgs,h&&t.hasNewShapeType()&&(h=h.destroy()),i.enabledDataSorting&&(t.startXPos=i.xAxis.reversed?-(e&&e.width||0):i.xAxis.width),!h&&(t.graphic=h=o[t.shapeType](e).add(t.group||i.group),h&&i.enabledDataSorting&&s.hasRendered&&s.pointCount<a&&(h.attr({x:t.startXPos}),l=!0,d="animate")),h&&l&&h[d](m(e)),s.styledMode||h[d](i.pointAttribs(t,t.selected&&"select")).shadow(!1!==t.allowShadow&&r.shadow),h&&(h.addClass(t.getClassName(),!0),h.attr({visibility:t.visible?"inherit":"hidden"}))):h&&(t.graphic=h.destroy());});}drawTracker(t=this.points){let e;let i=this,s=i.chart,r=s.pointer,o=function(t){let e=r?.getPointFromEvent(t);r&&e&&i.options.enableMouseTracking&&(r.isDirectTouch=!0,e.onMouseOver(t));};t.forEach(function(t){e=g(t.dataLabels)?t.dataLabels:t.dataLabel?[t.dataLabel]:[],t.graphic&&(t.graphic.element.point=t),e.forEach(function(e){(e.div||e.element).point=t;});}),i._hasTracking||(i.trackerGroups.forEach(function(t){i[t]&&(i[t].addClass("highcharts-tracker").on("mouseover",o).on("mouseout",function(t){r?.onTrackerMouseOut(t);}).on("touchstart",o),!s.styledMode&&i.options.cursor&&i[t].css({cursor:i.options.cursor}));}),i._hasTracking=!0),u(this,"afterDrawTracker");}remove(){let t=this,e=t.chart;e.hasRendered&&e.series.forEach(function(e){e.type===t.type&&(e.isDirty=!0);}),r.prototype.remove.apply(t,arguments);}}return b.defaultOptions=m(r.defaultOptions,i),p(b.prototype,{directTouch:!0,getSymbol:l,negStacks:!0,trackerGroups:["group","dataLabelsGroup"]}),o.registerSeriesType("column",b),b}),i(e,"Core/Series/DataLabel.js",[e["Core/Animation/AnimationUtilities.js"],e["Core/Templating.js"],e["Core/Utilities.js"]],function(t,e,i){var s;let{getDeferredAnimation:r}=t,{format:o}=e,{defined:a,extend:n,fireEvent:h,isArray:l,isString:d,merge:c,objectEach:p,pick:u,pInt:g,splat:f}=i;return function(t){function e(){return v(this).some(t=>t?.enabled)}function i(t,e,i,s,r){let o=this.chart,h=this.isCartesian&&o.inverted,l=this.enabledDataSorting,d=t.plotX,p=t.plotY,g=i.rotation||0,f=a(d)&&a(p)&&o.isInsidePlot(d,Math.round(p),{inverted:h,paneCoordinates:!0,series:this}),m=0===g&&"justify"===u(i.overflow,l?"none":"justify"),x=this.visible&&!1!==t.visible&&a(d)&&(t.series.forceDL||l&&!m||f||u(i.inside,!!this.options.stacking)&&s&&o.isInsidePlot(d,h?s.x+1:s.y+s.height-1,{inverted:h,paneCoordinates:!0,series:this})),y=t.pos();if(x&&y){var b;let a=e.getBBox(),h=e.getBBox(void 0,0),d={right:1,center:.5}[i.align||0]||0,p={bottom:1,middle:.5}[i.verticalAlign||0]||0;if(s=n({x:y[0],y:Math.round(y[1]),width:0,height:0},s||{}),n(i,{width:a.width,height:a.height}),b=s,l&&this.xAxis&&!m&&this.setDataLabelStartPos(t,e,r,f,b),e.align(c(i,{width:h.width,height:h.height}),!1,s,!1),e.alignAttr.x+=d*(h.width-a.width),e.alignAttr.y+=p*(h.height-a.height),e[e.placed?"animate":"attr"]({x:e.alignAttr.x+(a.width-h.width)/2,y:e.alignAttr.y+(a.height-h.height)/2,rotationOriginX:(e.width||0)/2,rotationOriginY:(e.height||0)/2}),m&&s.height>=0)this.justifyDataLabel(e,i,e.alignAttr,a,s,r);else if(u(i.crop,!0)){let{x:t,y:i}=e.alignAttr;x=o.isInsidePlot(t,i,{paneCoordinates:!0,series:this})&&o.isInsidePlot(t+a.width-1,i+a.height-1,{paneCoordinates:!0,series:this});}i.shape&&!g&&e[r?"attr":"animate"]({anchorX:y[0],anchorY:y[1]});}r&&l&&(e.placed=!1),x||l&&!m?(e.show(),e.placed=!0):(e.hide(),e.placed=!1);}function s(){return this.plotGroup("dataLabelsGroup","data-labels",this.hasRendered?"inherit":"hidden",this.options.dataLabels.zIndex||6)}function m(t){let e=this.hasRendered||0,i=this.initDataLabelsGroup().attr({opacity:+e});return !e&&i&&(this.visible&&i.show(),this.options.animation?i.animate({opacity:1},t):i.attr({opacity:1})),i}function x(t){let e;t=t||this.points;let i=this,s=i.chart,n=i.options,l=s.renderer,{backgroundColor:c,plotBackgroundColor:m}=s.options.chart,x=l.getContrast(d(m)&&m||d(c)&&c||"#000000"),y=v(i),{animation:S,defer:k}=y[0],C=k?r(s,S,i):{defer:0,duration:0};h(this,"drawDataLabels"),i.hasDataLabels?.()&&(e=this.initDataLabels(C),t.forEach(t=>{let r=t.dataLabels||[];f(b(y,t.dlOptions||t.options?.dataLabels)).forEach((h,c)=>{let f=h.enabled&&(t.visible||t.dataLabelOnHidden)&&(!t.isNull||t.dataLabelOnNull)&&function(t,e){let i=e.filter;if(i){let e=i.operator,s=t[i.property],r=i.value;return ">"===e&&s>r||"<"===e&&s<r||">="===e&&s>=r||"<="===e&&s<=r||"=="===e&&s==r||"==="===e&&s===r||"!="===e&&s!=r||"!=="===e&&s!==r}return !0}(t,h),{backgroundColor:m,borderColor:y,distance:b,style:v={}}=h,S,k,C,M,w={},T=r[c],A=!T,P;if(f&&(k=u(h[t.formatPrefix+"Format"],h.format),S=t.getLabelConfig(),C=a(k)?o(k,S,s):(h[t.formatPrefix+"Formatter"]||h.formatter).call(S,h),M=h.rotation,!s.styledMode&&(v.color=u(h.color,v.color,d(i.color)?i.color:void 0,"#000000"),"contrast"===v.color?("none"!==m&&(P=m),t.contrastColor=l.getContrast("auto"!==P&&P||t.color||i.color),v.color=P||!a(b)&&h.inside||0>g(b||0)||n.stacking?t.contrastColor:x):delete t.contrastColor,n.cursor&&(v.cursor=n.cursor)),w={r:h.borderRadius||0,rotation:M,padding:h.padding,zIndex:1},s.styledMode||(w.fill="auto"===m?t.color:m,w.stroke="auto"===y?t.color:y,w["stroke-width"]=h.borderWidth),p(w,(t,e)=>{void 0===t&&delete w[e];})),!T||f&&a(C)&&!!T.div==!!h.useHTML&&(T.rotation&&h.rotation||T.rotation===h.rotation)||(T=void 0,A=!0),f&&a(C)&&(T?w.text=C:(T=l.label(C,0,0,h.shape,void 0,void 0,h.useHTML,void 0,"data-label")).addClass(" highcharts-data-label-color-"+t.colorIndex+" "+(h.className||"")+(h.useHTML?" highcharts-tracker":"")),T)){T.options=h,T.attr(w),s.styledMode||T.css(v).shadow(h.shadow);let o=h[t.formatPrefix+"TextPath"]||h.textPath;o&&!h.useHTML&&(T.setTextPath(t.getDataLabelPath?.(T)||t.graphic,o),t.dataLabelPath&&!o.enabled&&(t.dataLabelPath=t.dataLabelPath.destroy())),T.added||T.add(e),i.alignDataLabel(t,T,h,void 0,A),T.isActive=!0,r[c]&&r[c]!==T&&r[c].destroy(),r[c]=T;}});let h=r.length;for(;h--;)r[h]&&r[h].isActive?r[h].isActive=!1:(r[h]?.destroy(),r.splice(h,1));t.dataLabel=r[0],t.dataLabels=r;})),h(this,"afterDrawDataLabels");}function y(t,e,i,s,r,o){let a=this.chart,n=e.align,h=e.verticalAlign,l=t.box?0:t.padding||0,{x:d=0,y:c=0}=e,p,u;return (p=(i.x||0)+l)<0&&("right"===n&&d>=0?(e.align="left",e.inside=!0):d-=p,u=!0),(p=(i.x||0)+s.width-l)>a.plotWidth&&("left"===n&&d<=0?(e.align="right",e.inside=!0):d+=a.plotWidth-p,u=!0),(p=i.y+l)<0&&("bottom"===h&&c>=0?(e.verticalAlign="top",e.inside=!0):c-=p,u=!0),(p=(i.y||0)+s.height-l)>a.plotHeight&&("top"===h&&c<=0?(e.verticalAlign="bottom",e.inside=!0):c+=a.plotHeight-p,u=!0),u&&(e.x=d,e.y=c,t.placed=!o,t.align(e,void 0,r)),u}function b(t,e){let i=[],s;if(l(t)&&!l(e))i=t.map(function(t){return c(t,e)});else if(l(e)&&!l(t))i=e.map(function(e){return c(t,e)});else if(l(t)||l(e)){if(l(t)&&l(e))for(s=Math.max(t.length,e.length);s--;)i[s]=c(t[s],e[s]);}else i=c(t,e);return i}function v(t){let e=t.chart.options.plotOptions;return f(b(b(e?.series?.dataLabels,e?.[t.type]?.dataLabels),t.options.dataLabels))}function S(t,e,i,s,r){let o=this.chart,a=o.inverted,n=this.xAxis,h=n.reversed,l=((a?e.height:e.width)||0)/2,d=t.pointWidth,c=d?d/2:0;e.startXPos=a?r.x:h?-l-c:n.width-l+c,e.startYPos=a?h?this.yAxis.height-l+c:-l-c:r.y,s?"hidden"===e.visibility&&(e.show(),e.attr({opacity:0}).animate({opacity:1})):e.attr({opacity:1}).animate({opacity:0},void 0,e.hide),o.hasRendered&&(i&&e.attr({x:e.startXPos,y:e.startYPos}),e.placed=!0);}t.compose=function(t){let r=t.prototype;r.initDataLabels||(r.initDataLabels=m,r.initDataLabelsGroup=s,r.alignDataLabel=i,r.drawDataLabels=x,r.justifyDataLabel=y,r.setDataLabelStartPos=S,r.hasDataLabels=e);};}(s||(s={})),s}),i(e,"Series/Column/ColumnDataLabel.js",[e["Core/Series/DataLabel.js"],e["Core/Globals.js"],e["Core/Series/SeriesRegistry.js"],e["Core/Utilities.js"]],function(t,e,i,s){var r;let{composed:o}=e,{series:a}=i,{merge:n,pick:h,pushUnique:l}=s;return function(e){function i(t,e,i,s,r){let o=this.chart.inverted,l=t.series,d=(l.xAxis?l.xAxis.len:this.chart.plotSizeX)||0,c=(l.yAxis?l.yAxis.len:this.chart.plotSizeY)||0,p=t.dlBox||t.shapeArgs,u=h(t.below,t.plotY>h(this.translatedThreshold,c)),g=h(i.inside,!!this.options.stacking);if(p){if(s=n(p),!("allow"===i.overflow&&!1===i.crop)){s.y<0&&(s.height+=s.y,s.y=0);let t=s.y+s.height-c;t>0&&t<s.height&&(s.height-=t);}o&&(s={x:c-s.y-s.height,y:d-s.x-s.width,width:s.height,height:s.width}),g||(o?(s.x+=u?0:s.width,s.width=0):(s.y+=u?s.height:0,s.height=0));}i.align=h(i.align,!o||g?"center":u?"right":"left"),i.verticalAlign=h(i.verticalAlign,o||g?"middle":u?"top":"bottom"),a.prototype.alignDataLabel.call(this,t,e,i,s,r),i.inside&&t.contrastColor&&e.css({color:t.contrastColor});}e.compose=function(e){t.compose(a),l(o,"ColumnDataLabel")&&(e.prototype.alignDataLabel=i);};}(r||(r={})),r}),i(e,"Series/Bar/BarSeries.js",[e["Series/Column/ColumnSeries.js"],e["Core/Series/SeriesRegistry.js"],e["Core/Utilities.js"]],function(t,e,i){let{extend:s,merge:r}=i;class o extends t{}return o.defaultOptions=r(t.defaultOptions,{}),s(o.prototype,{inverted:!0}),e.registerSeriesType("bar",o),o}),i(e,"Series/Scatter/ScatterSeriesDefaults.js",[],function(){return {lineWidth:0,findNearestPointBy:"xy",jitter:{x:0,y:0},marker:{enabled:!0},tooltip:{headerFormat:'<span style="color:{point.color}">●</span> <span style="font-size: 0.8em"> {series.name}</span><br/>',pointFormat:"x: <b>{point.x}</b><br/>y: <b>{point.y}</b><br/>"}}}),i(e,"Series/Scatter/ScatterSeries.js",[e["Series/Scatter/ScatterSeriesDefaults.js"],e["Core/Series/SeriesRegistry.js"],e["Core/Utilities.js"]],function(t,e,i){let{column:s,line:r}=e.seriesTypes,{addEvent:o,extend:a,merge:n}=i;class h extends r{applyJitter(){let t=this,e=this.options.jitter,i=this.points.length;e&&this.points.forEach(function(s,r){["x","y"].forEach(function(o,a){if(e[o]&&!s.isNull){let n=`plot${o.toUpperCase()}`,h=t[`${o}Axis`],l=e[o]*h.transA;if(h&&!h.logarithmic){let t=Math.max(0,(s[n]||0)-l),e=Math.min(h.len,(s[n]||0)+l);s[n]=t+(e-t)*function(t){let e=1e4*Math.sin(t);return e-Math.floor(e)}(r+a*i),"x"===o&&(s.clientX=s.plotX);}}});});}drawGraph(){this.options.lineWidth?super.drawGraph():this.graph&&(this.graph=this.graph.destroy());}}return h.defaultOptions=n(r.defaultOptions,t),a(h.prototype,{drawTracker:s.prototype.drawTracker,sorted:!1,requireSorting:!1,noSharedTooltip:!0,trackerGroups:["group","markerGroup","dataLabelsGroup"]}),o(h,"afterTranslate",function(){this.applyJitter();}),e.registerSeriesType("scatter",h),h}),i(e,"Series/CenteredUtilities.js",[e["Core/Globals.js"],e["Core/Series/Series.js"],e["Core/Utilities.js"]],function(t,e,i){var s,r;let{deg2rad:o}=t,{fireEvent:a,isNumber:n,pick:h,relativeLength:l}=i;return (r=s||(s={})).getCenter=function(){let t=this.options,i=this.chart,s=2*(t.slicedOffset||0),r=i.plotWidth-2*s,o=i.plotHeight-2*s,d=t.center,c=Math.min(r,o),p=t.thickness,u,g=t.size,f=t.innerSize||0,m,x;"string"==typeof g&&(g=parseFloat(g)),"string"==typeof f&&(f=parseFloat(f));let y=[h(d[0],"50%"),h(d[1],"50%"),h(g&&g<0?void 0:t.size,"100%"),h(f&&f<0?void 0:t.innerSize||0,"0%")];for(!i.angular||this instanceof e||(y[3]=0),m=0;m<4;++m)x=y[m],u=m<2||2===m&&/%$/.test(x),y[m]=l(x,[r,o,c,y[2]][m])+(u?s:0);return y[3]>y[2]&&(y[3]=y[2]),n(p)&&2*p<y[2]&&p>0&&(y[3]=y[2]-2*p),a(this,"afterGetCenter",{positions:y}),y},r.getStartAndEndRadians=function(t,e){let i=n(t)?t:0,s=n(e)&&e>i&&e-i<360?e:i+360;return {start:o*(i+-90),end:o*(s+-90)}},s}),i(e,"Series/Pie/PiePoint.js",[e["Core/Animation/AnimationUtilities.js"],e["Core/Series/Point.js"],e["Core/Utilities.js"]],function(t,e,i){let{setAnimation:s}=t,{addEvent:r,defined:o,extend:a,isNumber:n,pick:h,relativeLength:l}=i;class d extends e{getConnectorPath(t){let e=t.dataLabelPosition,i=t.options||{},s=i.connectorShape,r=this.connectorShapes[s]||s;return e&&r.call(this,{...e.computed,alignment:e.alignment},e.connectorPosition,i)||[]}getTranslate(){return this.sliced&&this.slicedTranslation||{translateX:0,translateY:0}}haloPath(t){let e=this.shapeArgs;return this.sliced||!this.visible?[]:this.series.chart.renderer.symbols.arc(e.x,e.y,e.r+t,e.r+t,{innerR:e.r-1,start:e.start,end:e.end,borderRadius:e.borderRadius})}constructor(t,e,i){super(t,e,i),this.half=0,this.name??(this.name="Slice");let s=t=>{this.slice("select"===t.type);};r(this,"select",s),r(this,"unselect",s);}isValid(){return n(this.y)&&this.y>=0}setVisible(t,e=!0){t!==this.visible&&this.update({visible:t??!this.visible},e,void 0,!1);}slice(t,e,i){let r=this.series;s(i,r.chart),e=h(e,!0),this.sliced=this.options.sliced=t=o(t)?t:!this.sliced,r.options.data[r.data.indexOf(this)]=this.options,this.graphic&&this.graphic.animate(this.getTranslate());}}return a(d.prototype,{connectorShapes:{fixedOffset:function(t,e,i){let s=e.breakAt,r=e.touchingSliceAt,o=i.softConnector?["C",t.x+("left"===t.alignment?-5:5),t.y,2*s.x-r.x,2*s.y-r.y,s.x,s.y]:["L",s.x,s.y];return [["M",t.x,t.y],o,["L",r.x,r.y]]},straight:function(t,e){let i=e.touchingSliceAt;return [["M",t.x,t.y],["L",i.x,i.y]]},crookedLine:function(t,e,i){let{breakAt:s,touchingSliceAt:r}=e,{series:o}=this,[a,n,h]=o.center,d=h/2,{plotLeft:c,plotWidth:p}=o.chart,u="left"===t.alignment,{x:g,y:f}=t,m=s.x;if(i.crookDistance){let t=l(i.crookDistance,1);m=u?a+d+(p+c-a-d)*(1-t):c+(a-d)*t;}else m=a+(n-f)*Math.tan((this.angle||0)-Math.PI/2);let x=[["M",g,f]];return (u?m<=g&&m>=s.x:m>=g&&m<=s.x)&&x.push(["L",m,f]),x.push(["L",s.x,s.y],["L",r.x,r.y]),x}}}),d}),i(e,"Series/Pie/PieSeriesDefaults.js",[],function(){return {borderRadius:3,center:[null,null],clip:!1,colorByPoint:!0,dataLabels:{connectorPadding:5,connectorShape:"crookedLine",crookDistance:void 0,distance:30,enabled:!0,formatter:function(){return this.point.isNull?void 0:this.point.name},softConnector:!0,x:0},fillColor:void 0,ignoreHiddenPoint:!0,inactiveOtherPoints:!0,legendType:"point",marker:null,size:null,showInLegend:!1,slicedOffset:10,stickyTracking:!1,tooltip:{followPointer:!0},borderColor:"#ffffff",borderWidth:1,lineWidth:void 0,states:{hover:{brightness:.1}}}}),i(e,"Series/Pie/PieSeries.js",[e["Series/CenteredUtilities.js"],e["Series/Column/ColumnSeries.js"],e["Core/Globals.js"],e["Series/Pie/PiePoint.js"],e["Series/Pie/PieSeriesDefaults.js"],e["Core/Series/Series.js"],e["Core/Series/SeriesRegistry.js"],e["Core/Renderer/SVG/Symbols.js"],e["Core/Utilities.js"]],function(t,e,i,s,r,o,a,n,h){let{getStartAndEndRadians:l}=t,{noop:d}=i,{clamp:c,extend:p,fireEvent:u,merge:g,pick:f}=h;class m extends o{animate(t){let e=this,i=e.points,s=e.startAngleRad;t||i.forEach(function(t){let i=t.graphic,r=t.shapeArgs;i&&r&&(i.attr({r:f(t.startR,e.center&&e.center[3]/2),start:s,end:s}),i.animate({r:r.r,start:r.start,end:r.end},e.options.animation));});}drawEmpty(){let t,e;let i=this.startAngleRad,s=this.endAngleRad,r=this.options;0===this.total&&this.center?(t=this.center[0],e=this.center[1],this.graph||(this.graph=this.chart.renderer.arc(t,e,this.center[1]/2,0,i,s).addClass("highcharts-empty-series").add(this.group)),this.graph.attr({d:n.arc(t,e,this.center[2]/2,0,{start:i,end:s,innerR:this.center[3]/2})}),this.chart.styledMode||this.graph.attr({"stroke-width":r.borderWidth,fill:r.fillColor||"none",stroke:r.color||"#cccccc"})):this.graph&&(this.graph=this.graph.destroy());}drawPoints(){let t=this.chart.renderer;this.points.forEach(function(e){e.graphic&&e.hasNewShapeType()&&(e.graphic=e.graphic.destroy()),e.graphic||(e.graphic=t[e.shapeType](e.shapeArgs).add(e.series.group),e.delayedRendering=!0);});}generatePoints(){super.generatePoints(),this.updateTotals();}getX(t,e,i,s){let r=this.center,o=this.radii?this.radii[i.index]||0:r[2]/2,a=s.dataLabelPosition,n=a?.distance||0,h=Math.asin(c((t-r[1])/(o+n),-1,1));return r[0]+Math.cos(h)*(o+n)*(e?-1:1)+(n>0?(e?-1:1)*(s.padding||0):0)}hasData(){return !!this.processedXData.length}redrawPoints(){let t,e,i,s;let r=this,o=r.chart;this.drawEmpty(),r.group&&!o.styledMode&&r.group.shadow(r.options.shadow),r.points.forEach(function(a){let n={};e=a.graphic,!a.isNull&&e?(s=a.shapeArgs,t=a.getTranslate(),o.styledMode||(i=r.pointAttribs(a,a.selected&&"select")),a.delayedRendering?(e.setRadialReference(r.center).attr(s).attr(t),o.styledMode||e.attr(i).attr({"stroke-linejoin":"round"}),a.delayedRendering=!1):(e.setRadialReference(r.center),o.styledMode||g(!0,n,i),g(!0,n,s,t),e.animate(n)),e.attr({visibility:a.visible?"inherit":"hidden"}),e.addClass(a.getClassName(),!0)):e&&(a.graphic=e.destroy());});}sortByAngle(t,e){t.sort(function(t,i){return void 0!==t.angle&&(i.angle-t.angle)*e});}translate(t){u(this,"translate"),this.generatePoints();let e=this.options,i=e.slicedOffset,s=l(e.startAngle,e.endAngle),r=this.startAngleRad=s.start,o=(this.endAngleRad=s.end)-r,a=this.points,n=e.ignoreHiddenPoint,h=a.length,d,c,p,g,f,m,x,y=0;for(t||(this.center=t=this.getCenter()),m=0;m<h;m++){x=a[m],d=r+y*o,x.isValid()&&(!n||x.visible)&&(y+=x.percentage/100),c=r+y*o;let e={x:t[0],y:t[1],r:t[2]/2,innerR:t[3]/2,start:Math.round(1e3*d)/1e3,end:Math.round(1e3*c)/1e3};x.shapeType="arc",x.shapeArgs=e,(p=(c+d)/2)>1.5*Math.PI?p-=2*Math.PI:p<-Math.PI/2&&(p+=2*Math.PI),x.slicedTranslation={translateX:Math.round(Math.cos(p)*i),translateY:Math.round(Math.sin(p)*i)},g=Math.cos(p)*t[2]/2,f=Math.sin(p)*t[2]/2,x.tooltipPos=[t[0]+.7*g,t[1]+.7*f],x.half=p<-Math.PI/2||p>Math.PI/2?1:0,x.angle=p;}u(this,"afterTranslate");}updateTotals(){let t=this.points,e=t.length,i=this.options.ignoreHiddenPoint,s,r,o=0;for(s=0;s<e;s++)(r=t[s]).isValid()&&(!i||r.visible)&&(o+=r.y);for(s=0,this.total=o;s<e;s++)(r=t[s]).percentage=o>0&&(r.visible||!i)?r.y/o*100:0,r.total=o;}}return m.defaultOptions=g(o.defaultOptions,r),p(m.prototype,{axisTypes:[],directTouch:!0,drawGraph:void 0,drawTracker:e.prototype.drawTracker,getCenter:t.getCenter,getSymbol:d,invertible:!1,isCartesian:!1,noSharedTooltip:!0,pointAttribs:e.prototype.pointAttribs,pointClass:s,requireSorting:!1,searchPoint:d,trackerGroups:["group","dataLabelsGroup"]}),a.registerSeriesType("pie",m),m}),i(e,"Series/Pie/PieDataLabel.js",[e["Core/Series/DataLabel.js"],e["Core/Globals.js"],e["Core/Renderer/RendererUtilities.js"],e["Core/Series/SeriesRegistry.js"],e["Core/Utilities.js"]],function(t,e,i,s,r){var o;let{composed:a,noop:n}=e,{distribute:h}=i,{series:l}=s,{arrayMax:d,clamp:c,defined:p,pick:u,pushUnique:g,relativeLength:f}=r;return function(e){let i={radialDistributionY:function(t,e){return (e.dataLabelPosition?.top||0)+t.distributeBox.pos},radialDistributionX:function(t,e,i,s,r){let o=r.dataLabelPosition;return t.getX(i<(o?.top||0)+2||i>(o?.bottom||0)-2?s:i,e.half,e,r)},justify:function(t,e,i,s){return s[0]+(t.half?-1:1)*(i+(e.dataLabelPosition?.distance||0))},alignToPlotEdges:function(t,e,i,s){let r=t.getBBox().width;return e?r+s:i-r-s},alignToConnectors:function(t,e,i,s){let r=0,o;return t.forEach(function(t){(o=t.dataLabel.getBBox().width)>r&&(r=o);}),e?r+s:i-r-s}};function s(t,e){let{center:i,options:s}=this,r=i[2]/2,o=t.angle||0,a=Math.cos(o),n=Math.sin(o),h=i[0]+a*r,l=i[1]+n*r,d=Math.min((s.slicedOffset||0)+(s.borderWidth||0),e/5);return {natural:{x:h+a*e,y:l+n*e},computed:{},alignment:e<0?"center":t.half?"right":"left",connectorPosition:{breakAt:{x:h+a*d,y:l+n*d},touchingSliceAt:{x:h,y:l}},distance:e}}function r(){let t=this,e=t.points,i=t.chart,s=i.plotWidth,r=i.plotHeight,o=i.plotLeft,a=Math.round(i.chartWidth/3),n=t.center,c=n[2]/2,g=n[1],m=[[],[]],x=[0,0,0,0],y=t.dataLabelPositioners,b,v,S,k=0;t.visible&&t.hasDataLabels?.()&&(e.forEach(t=>{(t.dataLabels||[]).forEach(t=>{t.shortened&&(t.attr({width:"auto"}).css({width:"auto",textOverflow:"clip"}),t.shortened=!1);});}),l.prototype.drawDataLabels.apply(t),e.forEach(t=>{(t.dataLabels||[]).forEach((e,i)=>{let s=n[2]/2,r=e.options,o=f(r?.distance||0,s);0===i&&m[t.half].push(t),!p(r?.style?.width)&&e.getBBox().width>a&&(e.css({width:Math.round(.7*a)+"px"}),e.shortened=!0),e.dataLabelPosition=this.getDataLabelPosition(t,o),k=Math.max(k,o);});}),m.forEach((e,a)=>{let l=e.length,d=[],f,m,b=0,C;l&&(t.sortByAngle(e,a-.5),k>0&&(f=Math.max(0,g-c-k),m=Math.min(g+c+k,i.plotHeight),e.forEach(t=>{(t.dataLabels||[]).forEach(e=>{let s=e.dataLabelPosition;s&&s.distance>0&&(s.top=Math.max(0,g-c-s.distance),s.bottom=Math.min(g+c+s.distance,i.plotHeight),b=e.getBBox().height||21,t.distributeBox={target:(e.dataLabelPosition?.natural.y||0)-s.top+b/2,size:b,rank:t.y},d.push(t.distributeBox));});}),h(d,C=m+b-f,C/5)),e.forEach(i=>{(i.dataLabels||[]).forEach(h=>{let l=h.options||{},g=i.distributeBox,f=h.dataLabelPosition,m=f?.natural.y||0,b=l.connectorPadding||0,k=0,C=m,M="inherit";if(f){if(d&&p(g)&&f.distance>0&&(void 0===g.pos?M="hidden":(S=g.size,C=y.radialDistributionY(i,h))),l.justify)k=y.justify(i,h,c,n);else switch(l.alignTo){case"connectors":k=y.alignToConnectors(e,a,s,o);break;case"plotEdges":k=y.alignToPlotEdges(h,a,s,o);break;default:k=y.radialDistributionX(t,i,C,m,h);}if(f.attribs={visibility:M,align:f.alignment},f.posAttribs={x:k+(l.x||0)+(({left:b,right:-b})[f.alignment]||0),y:C+(l.y||0)-h.getBBox().height/2},f.computed.x=k,f.computed.y=C,u(l.crop,!0)){let t;k-(v=h.getBBox().width)<b&&1===a?(t=Math.round(v-k+b),x[3]=Math.max(t,x[3])):k+v>s-b&&0===a&&(t=Math.round(k+v-s+b),x[1]=Math.max(t,x[1])),C-S/2<0?x[0]=Math.max(Math.round(-C+S/2),x[0]):C+S/2>r&&(x[2]=Math.max(Math.round(C+S/2-r),x[2])),f.sideOverflow=t;}}});}));}),(0===d(x)||this.verifyDataLabelOverflow(x))&&(this.placeDataLabels(),this.points.forEach(e=>{(e.dataLabels||[]).forEach(s=>{let{connectorColor:r,connectorWidth:o=1}=s.options||{},a=s.dataLabelPosition;if(o){let n;b=s.connector,a&&a.distance>0?(n=!b,b||(s.connector=b=i.renderer.path().addClass("highcharts-data-label-connector  highcharts-color-"+e.colorIndex+(e.className?" "+e.className:"")).add(t.dataLabelsGroup)),i.styledMode||b.attr({"stroke-width":o,stroke:r||e.color||"#666666"}),b[n?"attr":"animate"]({d:e.getConnectorPath(s)}),b.attr({visibility:a.attribs?.visibility})):b&&(s.connector=b.destroy());}});})));}function o(){this.points.forEach(t=>{(t.dataLabels||[]).forEach(t=>{let e=t.dataLabelPosition;e?(e.sideOverflow&&(t.css({width:Math.max(t.getBBox().width-e.sideOverflow,0)+"px",textOverflow:(t.options?.style||{}).textOverflow||"ellipsis"}),t.shortened=!0),t.attr(e.attribs),t[t.moved?"animate":"attr"](e.posAttribs),t.moved=!0):t&&t.attr({y:-9999});}),delete t.distributeBox;},this);}function m(t){let e=this.center,i=this.options,s=i.center,r=i.minSize||80,o=r,a=null!==i.size;return !a&&(null!==s[0]?o=Math.max(e[2]-Math.max(t[1],t[3]),r):(o=Math.max(e[2]-t[1]-t[3],r),e[0]+=(t[3]-t[1])/2),null!==s[1]?o=c(o,r,e[2]-Math.max(t[0],t[2])):(o=c(o,r,e[2]-t[0]-t[2]),e[1]+=(t[0]-t[2])/2),o<e[2]?(e[2]=o,e[3]=Math.min(i.thickness?Math.max(0,o-2*i.thickness):Math.max(0,f(i.innerSize||0,o)),o),this.translate(e),this.drawDataLabels&&this.drawDataLabels()):a=!0),a}e.compose=function(e){if(t.compose(l),g(a,"PieDataLabel")){let t=e.prototype;t.dataLabelPositioners=i,t.alignDataLabel=n,t.drawDataLabels=r,t.getDataLabelPosition=s,t.placeDataLabels=o,t.verifyDataLabelOverflow=m;}};}(o||(o={})),o}),i(e,"Extensions/OverlappingDataLabels.js",[e["Core/Utilities.js"]],function(t){let{addEvent:e,fireEvent:i,objectEach:s,pick:r}=t;function o(t){let e=t.length,s=(t,e)=>!(e.x>=t.x+t.width||e.x+e.width<=t.x||e.y>=t.y+t.height||e.y+e.height<=t.y),r,o,n,h,l,d=!1;for(let i=0;i<e;i++)(r=t[i])&&(r.oldOpacity=r.opacity,r.newOpacity=1,r.absoluteBox=function(t){if(t&&(!t.alignAttr||t.placed)){let e=t.box?0:t.padding||0,i=t.alignAttr||{x:t.attr("x"),y:t.attr("y")},s=t.getBBox();return t.width=s.width,t.height=s.height,{x:i.x+(t.parentGroup?.translateX||0)+e,y:i.y+(t.parentGroup?.translateY||0)+e,width:(t.width||0)-2*e,height:(t.height||0)-2*e}}}(r));t.sort((t,e)=>(e.labelrank||0)-(t.labelrank||0));for(let i=0;i<e;++i){h=(o=t[i])&&o.absoluteBox;for(let r=i+1;r<e;++r)l=(n=t[r])&&n.absoluteBox,h&&l&&o!==n&&0!==o.newOpacity&&0!==n.newOpacity&&"hidden"!==o.visibility&&"hidden"!==n.visibility&&s(h,l)&&((o.labelrank<n.labelrank?o:n).newOpacity=0);}for(let e of t)a(e,this)&&(d=!0);d&&i(this,"afterHideAllOverlappingLabels");}function a(t,e){let s,r,o=!1;return t&&(r=t.newOpacity,t.oldOpacity!==r&&(t.hasClass("highcharts-data-label")?(t[r?"removeClass":"addClass"]("highcharts-data-label-hidden"),s=function(){e.styledMode||t.css({pointerEvents:r?"auto":"none"});},o=!0,t[t.isOld?"animate":"attr"]({opacity:r},void 0,s),i(e,"afterHideOverlappingLabel")):t.attr({opacity:r})),t.isOld=!0),o}function n(){let t=this,e=[];for(let i of t.labelCollectors||[])e=e.concat(i());for(let i of t.yAxis||[])i.stacking&&i.options.stackLabels&&!i.options.stackLabels.allowOverlap&&s(i.stacking.stacks,t=>{s(t,t=>{t.label&&e.push(t.label);});});for(let i of t.series||[])if(i.visible&&i.hasDataLabels?.()){let s=i=>{for(let s of i)s.visible&&(s.dataLabels||[]).forEach(i=>{let o=i.options||{};i.labelrank=r(o.labelrank,s.labelrank,s.shapeArgs?.height),o.allowOverlap??Number(o.distance)>0?(i.oldOpacity=i.opacity,i.newOpacity=1,a(i,t)):e.push(i);});};s(i.nodes||[]),s(i.points);}this.hideOverlappingLabels(e);}return {compose:function(t){let i=t.prototype;i.hideOverlappingLabels||(i.hideOverlappingLabels=o,e(t,"render",n));}}}),i(e,"Extensions/BorderRadius.js",[e["Core/Defaults.js"],e["Core/Globals.js"],e["Core/Utilities.js"]],function(t,e,i){let{defaultOptions:s}=t,{noop:r}=e,{addEvent:o,extend:a,isObject:n,merge:h,relativeLength:l}=i,d={radius:0,scope:"stack",where:void 0},c=r,p=r;function u(t,e,i,s,r={}){let o=c(t,e,i,s,r),{innerR:a=0,r:n=i,start:h=0,end:d=0}=r;if(r.open||!r.borderRadius)return o;let p=d-h,u=Math.sin(p/2),g=Math.max(Math.min(l(r.borderRadius||0,n-a),(n-a)/2,n*u/(1+u)),0),f=Math.min(g,p/Math.PI*2*a),m=o.length-1;for(;m--;)!function(t,e,i){let s,r,o;let a=t[e],n=t[e+1];if("Z"===n[0]&&(n=t[0]),("M"===a[0]||"L"===a[0])&&"A"===n[0]?(s=a,r=n,o=!0):"A"===a[0]&&("M"===n[0]||"L"===n[0])&&(s=n,r=a),s&&r&&r.params){let a=r[1],n=r[5],h=r.params,{start:l,end:d,cx:c,cy:p}=h,u=n?a-i:a+i,g=u?Math.asin(i/u):0,f=n?g:-g,m=Math.cos(g)*u;o?(h.start=l+f,s[1]=c+m*Math.cos(l),s[2]=p+m*Math.sin(l),t.splice(e+1,0,["A",i,i,0,0,1,c+a*Math.cos(h.start),p+a*Math.sin(h.start)])):(h.end=d-f,r[6]=c+a*Math.cos(h.end),r[7]=p+a*Math.sin(h.end),t.splice(e+1,0,["A",i,i,0,0,1,c+m*Math.cos(d),p+m*Math.sin(d)])),r[4]=Math.abs(h.end-h.start)<Math.PI?0:1;}}(o,m,m>1?f:g);return o}function g(){if(this.options.borderRadius&&!(this.chart.is3d&&this.chart.is3d())){let{options:t,yAxis:e}=this,i="percent"===t.stacking,r=s.plotOptions?.[this.type]?.borderRadius,o=f(t.borderRadius,n(r)?r:{}),h=e.options.reversed;for(let s of this.points){let{shapeArgs:r}=s;if("roundedRect"===s.shapeType&&r){let{width:n=0,height:d=0,y:c=0}=r,p=c,u=d;if("stack"===o.scope&&s.stackTotal){let r=e.translate(i?100:s.stackTotal,!1,!0,!1,!0),o=e.translate(t.threshold||0,!1,!0,!1,!0),a=this.crispCol(0,Math.min(r,o),0,Math.abs(r-o));p=a.y,u=a.height;}let g=(s.negative?-1:1)*(h?-1:1)==-1,f=o.where;!f&&this.is("waterfall")&&Math.abs((s.yBottom||0)-(this.translatedThreshold||0))>this.borderWidth&&(f="all"),f||(f="end");let m=Math.min(l(o.radius,n),n/2,"all"===f?d/2:1/0)||0;"end"===f&&(g&&(p-=m),u+=m),a(r,{brBoxHeight:u,brBoxY:p,r:m});}}}}function f(t,e){return n(t)||(t={radius:t||0}),h(d,e,t)}function m(){let t=f(this.options.borderRadius);for(let e of this.points){let i=e.shapeArgs;i&&(i.borderRadius=l(t.radius,(i.r||0)-(i.innerR||0)));}}function x(t,e,i,s,r={}){let o=p(t,e,i,s,r),{r:a=0,brBoxHeight:n=s,brBoxY:h=e}=r,l=e-h,d=h+n-(e+s),c=l-a>-.1?0:a,u=d-a>-.1?0:a,g=Math.max(c&&l,0),f=Math.max(u&&d,0),m=[t+c,e],x=[t+i-c,e],y=[t+i,e+c],b=[t+i,e+s-u],v=[t+i-u,e+s],S=[t+u,e+s],k=[t,e+s-u],C=[t,e+c],M=(t,e)=>Math.sqrt(Math.pow(t,2)-Math.pow(e,2));if(g){let t=M(c,c-g);m[0]-=t,x[0]+=t,y[1]=C[1]=e+c-g;}if(s<c-g){let r=M(c,c-g-s);y[0]=b[0]=t+i-c+r,v[0]=Math.min(y[0],v[0]),S[0]=Math.max(b[0],S[0]),k[0]=C[0]=t+c-r,y[1]=C[1]=e+s;}if(f){let t=M(u,u-f);v[0]+=t,S[0]-=t,b[1]=k[1]=e+s-u+f;}if(s<u-f){let r=M(u,u-f-s);y[0]=b[0]=t+i-u+r,x[0]=Math.min(y[0],x[0]),m[0]=Math.max(b[0],m[0]),k[0]=C[0]=t+u-r,b[1]=k[1]=e;}return o.length=0,o.push(["M",...m],["L",...x],["A",c,c,0,0,1,...y],["L",...b],["A",u,u,0,0,1,...v],["L",...S],["A",u,u,0,0,1,...k],["L",...C],["A",c,c,0,0,1,...m],["Z"]),o}return {compose:function(t,e,i){let s=t.types.pie;if(!e.symbolCustomAttribs.includes("borderRadius")){let r=i.prototype.symbols;o(t,"afterColumnTranslate",g,{order:9}),o(s,"afterTranslate",m),e.symbolCustomAttribs.push("borderRadius","brBoxHeight","brBoxY"),c=r.arc,p=r.roundedRect,r.arc=u,r.roundedRect=x;}},optionsToObject:f}}),i(e,"Core/Responsive.js",[e["Core/Utilities.js"]],function(t){var e;let{diffObjects:i,extend:s,find:r,merge:o,pick:a,uniqueKey:n}=t;return function(t){function e(t,e){let i=t.condition;(i.callback||function(){return this.chartWidth<=a(i.maxWidth,Number.MAX_VALUE)&&this.chartHeight<=a(i.maxHeight,Number.MAX_VALUE)&&this.chartWidth>=a(i.minWidth,0)&&this.chartHeight>=a(i.minHeight,0)}).call(this)&&e.push(t._id);}function h(t,e){let s=this.options.responsive,a=this.currentResponsive,h=[],l;!e&&s&&s.rules&&s.rules.forEach(t=>{void 0===t._id&&(t._id=n()),this.matchResponsiveRule(t,h);},this);let d=o(...h.map(t=>r((s||{}).rules||[],e=>e._id===t)).map(t=>t&&t.chartOptions));d.isResponsiveOptions=!0,h=h.toString()||void 0;let c=a&&a.ruleIds;h!==c&&(a&&this.update(a.undoOptions,t,!0),h?((l=i(d,this.options,!0,this.collectionsWithUpdate)).isResponsiveOptions=!0,this.currentResponsive={ruleIds:h,mergedOptions:d,undoOptions:l},this.update(d,t,!0)):this.currentResponsive=void 0);}t.compose=function(t){let i=t.prototype;return i.matchResponsiveRule||s(i,{matchResponsiveRule:e,setResponsive:h}),t};}(e||(e={})),e}),i(e,"masters/highcharts.src.js",[e["Core/Globals.js"],e["Core/Utilities.js"],e["Core/Defaults.js"],e["Core/Animation/Fx.js"],e["Core/Animation/AnimationUtilities.js"],e["Core/Renderer/HTML/AST.js"],e["Core/Templating.js"],e["Core/Renderer/RendererRegistry.js"],e["Core/Renderer/RendererUtilities.js"],e["Core/Renderer/SVG/SVGElement.js"],e["Core/Renderer/SVG/SVGRenderer.js"],e["Core/Renderer/HTML/HTMLElement.js"],e["Core/Axis/Axis.js"],e["Core/Axis/DateTimeAxis.js"],e["Core/Axis/LogarithmicAxis.js"],e["Core/Axis/PlotLineOrBand/PlotLineOrBand.js"],e["Core/Axis/Tick.js"],e["Core/Tooltip.js"],e["Core/Series/Point.js"],e["Core/Pointer.js"],e["Core/Legend/Legend.js"],e["Core/Legend/LegendSymbol.js"],e["Core/Chart/Chart.js"],e["Extensions/ScrollablePlotArea.js"],e["Core/Axis/Stacking/StackingAxis.js"],e["Core/Axis/Stacking/StackItem.js"],e["Core/Series/Series.js"],e["Core/Series/SeriesRegistry.js"],e["Series/Column/ColumnDataLabel.js"],e["Series/Pie/PieDataLabel.js"],e["Core/Series/DataLabel.js"],e["Extensions/OverlappingDataLabels.js"],e["Extensions/BorderRadius.js"],e["Core/Responsive.js"],e["Core/Color/Color.js"],e["Core/Time.js"]],function(t,e,i,s,r,o,a,n,h,l,d,c,p,u,g,f,m,x,y,b,v,S,k,C,M,w,T,A,P,L,O,D,E,I,j,B){return t.AST=o,t.Axis=p,t.Chart=k,t.Color=j,t.DataLabel=O,t.Fx=s,t.HTMLElement=c,t.Legend=v,t.LegendSymbol=S,t.OverlappingDataLabels=t.OverlappingDataLabels||D,t.PlotLineOrBand=f,t.Point=y,t.Pointer=b,t.RendererRegistry=n,t.Series=T,t.SeriesRegistry=A,t.StackItem=w,t.SVGElement=l,t.SVGRenderer=d,t.Templating=a,t.Tick=m,t.Time=B,t.Tooltip=x,t.animate=r.animate,t.animObject=r.animObject,t.chart=k.chart,t.color=j.parse,t.dateFormat=a.dateFormat,t.defaultOptions=i.defaultOptions,t.distribute=h.distribute,t.format=a.format,t.getDeferredAnimation=r.getDeferredAnimation,t.getOptions=i.getOptions,t.numberFormat=a.numberFormat,t.seriesType=A.seriesType,t.setAnimation=r.setAnimation,t.setOptions=i.setOptions,t.stop=r.stop,t.time=i.defaultTime,t.timers=s.timers,E.compose(t.Series,t.SVGElement,t.SVGRenderer),P.compose(t.Series.types.column),O.compose(t.Series),u.compose(t.Axis),c.compose(t.SVGRenderer),v.compose(t.Chart),g.compose(t.Axis),D.compose(t.Chart),L.compose(t.Series.types.pie),f.compose(t.Axis),b.compose(t.Chart),I.compose(t.Chart),C.compose(t.Axis,t.Chart,t.Series),M.compose(t.Axis,t.Chart,t.Series),x.compose(t.Pointer),e.extend(t,e),t}),e["masters/highcharts.src.js"]._modules=e,e["masters/highcharts.src.js"]}); 
	} (highcharts));

	var highchartsExports = highcharts.exports;
	var Highcharts$1 = /*@__PURE__*/getDefaultExportFromCjs(highchartsExports);

	/* src/Chart.svelte generated by Svelte v4.2.17 */

	function create_fragment$6(ctx) {
		const block = {
			c: noop,
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: noop,
			p: noop,
			i: noop,
			o: noop,
			d: noop
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$6.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	data(Highcharts$1);
	more(Highcharts$1);

	var getOverconfidenceSeries = function () {
		return {
			name: 'overconfident',
			fillOpacity: 0.2,
			color: '#FF9900',
			data: [[55, 0, 55], [65, 0, 65], [75, 0, 75], [85, 0, 85], [95, 0, 95]]
		};
	};

	var getUnderconfidenceSeries = function () {
		return {
			name: 'underconfident',
			fillOpacity: 0.2,
			color: '#ADD8E6',
			data: [[55, 55, 100], [65, 65, 100], [75, 75, 100], [85, 85, 100], [95, 95, 100]]
		};
	};

	function createChart() {
		return Highcharts$1.chart("container", {
			chart: {
				type: 'areasplinerange',
				zoomType: 'x',
				alignTicks: false,
				sytle: { display: "block; overflow-y: hidden;" }
			},
			plotOptions: {
				series: { states: { hover: { enabled: false } } }
			},
			credits: { enabled: false },
			title: { text: '' },
			xAxis: {
				type: 'linear',
				tickPositions: [55, 65, 75, 85, 95],
				title: { text: 'reported confidence' }
			},
			yAxis: [
				{
					// primary axis
					min: 55,
					max: 95,
					title: { text: '% correct' }
				},
				{
					// secondary axis for number of questions
					min: 0,
					max: 20,
					title: null,
					// hide ticks and labels
					opposite: true,
					lineWidth: 0,
					minorGridLineWidth: 0,
					gridLineColor: 'transparent',
					labels: { enabled: false }
				}
			],
			tooltip: {
				crosshairs: true,
				shared: true,
				formatter() {
					var point;

					this.points.forEach(function (element) {
						if (element.series.name === 'confidence') {
							point = element.point;
						}
					});

					if (point) {
						var difference = point.high - point.low;

						if (!point.total || point.total === 0) {
							return 'no answers';
						} else if (difference === 0) {
							return 'perfectly confident!';
						} else {
							return (difference > 0 ? 'over' : 'under') + 'confident by ' + Math.abs(point.high - point.low) + ' % points<br>';
						}
					}
				}
			},
			legend: {
				enabled: true,
				itemStyle: {
					'fontSize': '10px',
					'fontWeight': 'normal'
				}
			},
			series: [
				{
					name: 'confidence',
					fillOpacity: 0.1,
					color: 'grey',
					showInLegend: false,
					data: [[55, 55, 55], [65, 65, 65], [75, 75, 75], [85, 85, 85], [95, 95, 95]]
				},
				getUnderconfidenceSeries(),
				getOverconfidenceSeries(),
				{
					name: '#answers',
					type: 'spline',
					yAxis: 1,
					data: [],
					tooltip: { valueSuffix: ' mm' },
					marker: { enabled: false },
					dashStyle: 'shortdot',
					color: 'grey'
				}
			]
		});
	}

	function instance$6($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Chart', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Chart> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({
			Highcharts: Highcharts$1,
			data,
			more,
			getOverconfidenceSeries,
			getUnderconfidenceSeries,
			createChart
		});

		return [];
	}

	class Chart extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Chart",
				options,
				id: create_fragment$6.name
			});
		}
	}

	/* src/Calibrate.svelte generated by Svelte v4.2.17 */

	const { Object: Object_1$1, console: console_1$1 } = globals;
	const file$4 = "src/Calibrate.svelte";

	function get_each_context$1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[7] = list[i];
		child_ctx[9] = i;
		return child_ctx;
	}

	// (79:4) {#if $current === i}
	function create_if_block_1(ctx) {
		let div;
		let question_1;
		let current;

		question_1 = new Question({
				props: { question: /*question*/ ctx[7] },
				$$inline: true
			});

		question_1.$on("answer", /*handleAnswer*/ ctx[3]);

		const block = {
			c: function create() {
				div = element("div");
				create_component(question_1.$$.fragment);
				attr_dev(div, "class", "d-flex justify-content-center p-3");
				add_location(div, file$4, 79, 6, 2037);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				mount_component(question_1, div, null);
				current = true;
			},
			p: function update(ctx, dirty) {
				const question_1_changes = {};
				if (dirty & /*$questions*/ 4) question_1_changes.question = /*question*/ ctx[7];
				question_1.$set(question_1_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(question_1.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(question_1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				destroy_component(question_1);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1.name,
			type: "if",
			source: "(79:4) {#if $current === i}",
			ctx
		});

		return block;
	}

	// (78:2) {#each $questions as question, i}
	function create_each_block$1(ctx) {
		let if_block_anchor;
		let current;
		let if_block = /*$current*/ ctx[0] === /*i*/ ctx[9] && create_if_block_1(ctx);

		const block = {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = empty();
			},
			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (/*$current*/ ctx[0] === /*i*/ ctx[9]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*$current*/ 1) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block_1(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(if_block_anchor);
				}

				if (if_block) if_block.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block$1.name,
			type: "each",
			source: "(78:2) {#each $questions as question, i}",
			ctx
		});

		return block;
	}

	// (90:2) {#if $current > 0}
	function create_if_block$1(ctx) {
		let div;
		let feedback;
		let current;

		feedback = new Feedback({
				props: {
					question: /*$questions*/ ctx[2][/*$current*/ ctx[0] - 1],
					response: /*$responses*/ ctx[1][/*$current*/ ctx[0] - 1]
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				div = element("div");
				create_component(feedback.$$.fragment);
				attr_dev(div, "class", "col d-flex justify-content-center");
				add_location(div, file$4, 90, 4, 2309);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				mount_component(feedback, div, null);
				current = true;
			},
			p: function update(ctx, dirty) {
				const feedback_changes = {};
				if (dirty & /*$questions, $current*/ 5) feedback_changes.question = /*$questions*/ ctx[2][/*$current*/ ctx[0] - 1];
				if (dirty & /*$responses, $current*/ 3) feedback_changes.response = /*$responses*/ ctx[1][/*$current*/ ctx[0] - 1];
				feedback.$set(feedback_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(feedback.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(feedback.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				destroy_component(feedback);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$1.name,
			type: "if",
			source: "(90:2) {#if $current > 0}",
			ctx
		});

		return block;
	}

	function create_fragment$5(ctx) {
		let navbar;
		let t0;
		let main;
		let t1;
		let div1;
		let div0;
		let t2;
		let current;
		navbar = new NavBar({ $$inline: true });
		let each_value = ensure_array_like_dev(/*$questions*/ ctx[2]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		let if_block = /*$current*/ ctx[0] > 0 && create_if_block$1(ctx);

		const block = {
			c: function create() {
				create_component(navbar.$$.fragment);
				t0 = space();
				main = element("main");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t1 = space();
				div1 = element("div");
				div0 = element("div");
				t2 = space();
				if (if_block) if_block.c();
				attr_dev(div0, "id", "container");
				set_style(div0, "width", "70%");
				add_location(div0, file$4, 86, 4, 2234);
				attr_dev(div1, "class", "d-flex justify-content-center");
				add_location(div1, file$4, 85, 2, 2186);
				add_location(main, file$4, 76, 0, 1963);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				mount_component(navbar, target, anchor);
				insert_dev(target, t0, anchor);
				insert_dev(target, main, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(main, null);
					}
				}

				append_dev(main, t1);
				append_dev(main, div1);
				append_dev(div1, div0);
				append_dev(main, t2);
				if (if_block) if_block.m(main, null);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*$questions, handleAnswer, $current*/ 13) {
					each_value = ensure_array_like_dev(/*$questions*/ ctx[2]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$1(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block$1(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(main, t1);
						}
					}

					group_outros();

					for (i = each_value.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}

				if (/*$current*/ ctx[0] > 0) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*$current*/ 1) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$1(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(main, null);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(navbar.$$.fragment, local);

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(navbar.$$.fragment, local);
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(t0);
					detach_dev(main);
				}

				destroy_component(navbar, detaching);
				destroy_each(each_blocks, detaching);
				if (if_block) if_block.d();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$5.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$5($$self, $$props, $$invalidate) {
		let $current;
		let $responses;
		let $questions;
		validate_store(current, 'current');
		component_subscribe($$self, current, $$value => $$invalidate(0, $current = $$value));
		validate_store(responses, 'responses');
		component_subscribe($$self, responses, $$value => $$invalidate(1, $responses = $$value));
		validate_store(questions, 'questions');
		component_subscribe($$self, questions, $$value => $$invalidate(2, $questions = $$value));
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Calibrate', slots, []);
		let confidenceChart = {};

		function drawChart(confidenceSeriesData) {
			confidenceChart.series[0].setData(confidenceSeriesData);
			confidenceChart.series[3].setData(confidenceSeriesData);
		}

		afterUpdate(() => {
			drawChart(getConfidenceSeriesData());
		});

		onMount(async () => {
			fetch("questions.json").then(response => response.json()).then(data => {
				questions.set(data.map(question => {
					var [k1, k2] = Object.keys(question.options);
					question['k1'] = k1;
					question['k2'] = k2;
					question['o1'] = question.options[k1];
					question['o2'] = question.options[k2];
					return question;
				}));
			}).catch(error => {
				console.log(error);
				return [];
			});

			confidenceChart = createChart();
		});

		function getConfidenceSeriesData() {
			let data = [];

			for (var i = 55; i <= 95; i += 10) {
				var total = 0;
				var correct = 0;

				$responses.forEach(response => {
					if (response.confidence === i) {
						total += 1;
						correct += response.correct ? 1 : 0;
					}
				});

				data.push({
					x: i,
					high: i,
					low: total === 0 ? i : correct / total * 100,
					y: total,
					total
				});
			}

			return data;
		}

		function handleAnswer(event) {
			$responses.push({
				response: event.detail.answer,
				confidence: event.detail.confidence,
				fact: event.detail.fact,
				correct: event.detail.fact === event.detail.answer,
				hinted: event.detail.hinted
			});

			set_store_value(current, $current++, $current);
		}

		const writable_props = [];

		Object_1$1.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Calibrate> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({
			onMount,
			afterUpdate,
			responses,
			questions,
			current,
			Question,
			Feedback,
			NavBar,
			Chart,
			createChart,
			confidenceChart,
			drawChart,
			getConfidenceSeriesData,
			handleAnswer,
			$current,
			$responses,
			$questions
		});

		$$self.$inject_state = $$props => {
			if ('confidenceChart' in $$props) confidenceChart = $$props.confidenceChart;
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [$current, $responses, $questions, handleAnswer];
	}

	class Calibrate extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Calibrate",
				options,
				id: create_fragment$5.name
			});
		}
	}

	/* src/Tooltip.svelte generated by Svelte v4.2.17 */
	const file$3 = "src/Tooltip.svelte";

	function create_fragment$4(ctx) {
		let div;
		let t;

		const block = {
			c: function create() {
				div = element("div");
				t = text(/*title*/ ctx[0]);
				set_style(div, "top", /*y*/ ctx[2] + 5 + "px");
				set_style(div, "left", /*x*/ ctx[1] + 5 + "px");
				attr_dev(div, "class", "svelte-1wb4l5o");
				add_location(div, file$3, 6, 0, 72);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, t);
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*title*/ 1) set_data_dev(t, /*title*/ ctx[0]);

				if (dirty & /*y*/ 4) {
					set_style(div, "top", /*y*/ ctx[2] + 5 + "px");
				}

				if (dirty & /*x*/ 2) {
					set_style(div, "left", /*x*/ ctx[1] + 5 + "px");
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$4.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$4($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Tooltip', slots, []);
		let { title } = $$props;
		let { x } = $$props;
		let { y } = $$props;

		$$self.$$.on_mount.push(function () {
			if (title === undefined && !('title' in $$props || $$self.$$.bound[$$self.$$.props['title']])) {
				console.warn("<Tooltip> was created without expected prop 'title'");
			}

			if (x === undefined && !('x' in $$props || $$self.$$.bound[$$self.$$.props['x']])) {
				console.warn("<Tooltip> was created without expected prop 'x'");
			}

			if (y === undefined && !('y' in $$props || $$self.$$.bound[$$self.$$.props['y']])) {
				console.warn("<Tooltip> was created without expected prop 'y'");
			}
		});

		const writable_props = ['title', 'x', 'y'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tooltip> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('title' in $$props) $$invalidate(0, title = $$props.title);
			if ('x' in $$props) $$invalidate(1, x = $$props.x);
			if ('y' in $$props) $$invalidate(2, y = $$props.y);
		};

		$$self.$capture_state = () => ({ title, x, y });

		$$self.$inject_state = $$props => {
			if ('title' in $$props) $$invalidate(0, title = $$props.title);
			if ('x' in $$props) $$invalidate(1, x = $$props.x);
			if ('y' in $$props) $$invalidate(2, y = $$props.y);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [title, x, y];
	}

	class Tooltip extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$4, create_fragment$4, safe_not_equal, { title: 0, x: 1, y: 2 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Tooltip",
				options,
				id: create_fragment$4.name
			});
		}

		get title() {
			throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set title(value) {
			throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get x() {
			throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set x(value) {
			throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get y() {
			throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set y(value) {
			throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	function tooltip(element) {
	  let title;
	  let tooltipComponent;
	  function mouseOver(event) {
	    // NOTE: remove the `title` attribute, to prevent showing the default browser tooltip
	    // remember to set it back on `mouseleave`
	    title = element.getAttribute('title');
	    element.removeAttribute('title');

	    tooltipComponent = new Tooltip({
	      props: {
	        title: title,
	        x: event.pageX,
	        y: event.pageY,
	      },
	      target: document.body,
	    });
	  }
	  function mouseMove(event) {
	    tooltipComponent.$set({
	      x: event.pageX,
	      y: event.pageY,
	    });
	  }
	  function mouseLeave() {
	    tooltipComponent.$destroy();
	    // NOTE: restore the `title` attribute
	    element.setAttribute('title', title);
	  }
	  
	  element.addEventListener('mouseover', mouseOver);
	  element.addEventListener('mouseleave', mouseLeave);
	  element.addEventListener('mousemove', mouseMove);
	  
	  return {
	    destroy() {
	      element.removeEventListener('mouseover', mouseOver);
	      element.removeEventListener('mouseleave', mouseLeave);
	      element.removeEventListener('mousemove', mouseMove);
	    }
	  }
	}

	/* src/Cite.svelte generated by Svelte v4.2.17 */
	const file$2 = "src/Cite.svelte";

	function create_fragment$3(ctx) {
		let sup;
		let t;
		let mounted;
		let dispose;

		const block = {
			c: function create() {
				sup = element("sup");
				t = text(/*citationNumber*/ ctx[1]);
				attr_dev(sup, "title", /*citation*/ ctx[0].id);
				add_location(sup, file$2, 9, 0, 236);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, sup, anchor);
				append_dev(sup, t);

				if (!mounted) {
					dispose = action_destroyer(tooltip.call(null, sup));
					mounted = true;
				}
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(sup);
				}

				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$3.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$3($$self, $$props, $$invalidate) {
		let $citations;
		validate_store(citations, 'citations');
		component_subscribe($$self, citations, $$value => $$invalidate(3, $citations = $$value));
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Cite', slots, []);
		let { id = "" } = $$props;
		const citation = $citations.find(c => c.id === id);
		const citationNumber = $citations.indexOf(citation) + 1;
		const writable_props = ['id'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Cite> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('id' in $$props) $$invalidate(2, id = $$props.id);
		};

		$$self.$capture_state = () => ({
			citations,
			tooltip,
			id,
			citation,
			citationNumber,
			$citations
		});

		$$self.$inject_state = $$props => {
			if ('id' in $$props) $$invalidate(2, id = $$props.id);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [citation, citationNumber, id];
	}

	class Cite extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$3, create_fragment$3, safe_not_equal, { id: 2 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Cite",
				options,
				id: create_fragment$3.name
			});
		}

		get id() {
			throw new Error("<Cite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set id(value) {
			throw new Error("<Cite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/About.svelte generated by Svelte v4.2.17 */
	const file$1 = "src/About.svelte";

	function get_each_context(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[1] = list[i];
		return child_ctx;
	}

	// (93:4) {#each $citations as citation}
	function create_each_block(ctx) {
		let div;
		let raw_value = /*citation*/ ctx[1].text + "";
		let div_id_value;

		const block = {
			c: function create() {
				div = element("div");
				attr_dev(div, "class", "csl-entry svelte-gdrqau");
				attr_dev(div, "id", div_id_value = /*citation*/ ctx[1].id);
				add_location(div, file$1, 93, 4, 9600);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				div.innerHTML = raw_value;
			},
			p: function update(ctx, dirty) {
				if (dirty & /*$citations*/ 1 && raw_value !== (raw_value = /*citation*/ ctx[1].text + "")) div.innerHTML = raw_value;
				if (dirty & /*$citations*/ 1 && div_id_value !== (div_id_value = /*citation*/ ctx[1].id)) {
					attr_dev(div, "id", div_id_value);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block.name,
			type: "each",
			source: "(93:4) {#each $citations as citation}",
			ctx
		});

		return block;
	}

	function create_fragment$2(ctx) {
		let navbar;
		let t0;
		let main;
		let div;
		let p0;
		let t2;
		let p1;
		let t3;
		let em0;
		let t5;
		let blockquote0;
		let p2;
		let t6;
		let em1;
		let t8;
		let a0;
		let t10;
		let t11;
		let blockquote1;
		let p3;
		let t12;
		let sup0;
		let t14;
		let p4;
		let t15;
		let cite0;
		let t16;
		let cite1;
		let t17;
		let t18;
		let p5;
		let t19;
		let cite2;
		let t20;
		let ul0;
		let li0;
		let a1;
		let t22;
		let cite3;
		let t23;
		let t24;
		let li1;
		let t25;
		let cite4;
		let t26;
		let t27;
		let li2;
		let a2;
		let t29;
		let cite5;
		let t30;
		let t31;
		let li3;
		let t32;
		let a3;
		let t34;
		let t35;
		let li4;
		let t36;
		let a4;
		let t38;
		let t39;
		let li5;
		let t40;
		let cite6;
		let t41;
		let t42;
		let li6;
		let t43;
		let sup1;
		let t45;
		let cite7;
		let t46;
		let sup2;
		let t48;
		let t49;
		let p6;
		let t50;
		let a5;
		let t52;
		let cite8;
		let t53;
		let cite9;
		let sup3;
		let cite10;
		let t55;
		let t56;
		let p7;
		let t57;
		let sup4;
		let t59;
		let t60;
		let p8;
		let t61;
		let cite11;
		let t62;
		let cite12;
		let t63;
		let cite13;
		let t64;
		let cite14;
		let sup5;
		let cite15;
		let t66;
		let a6;
		let t68;
		let a7;
		let t70;
		let a8;
		let t72;
		let a9;
		let t74;
		let cite16;
		let t75;
		let t76;
		let cite17;
		let sup6;
		let t78;
		let cite18;
		let t79;
		let ul1;
		let li7;
		let t80;
		let cite19;
		let sup7;
		let t82;
		let t83;
		let li8;
		let t84;
		let cite20;
		let sup8;
		let t86;
		let t87;
		let ul2;
		let li9;
		let t88;
		let cite21;
		let sup9;
		let cite22;
		let t90;
		let t91;
		let p9;
		let t92;
		let cite23;
		let t93;
		let t94;
		let p10;
		let img;
		let img_src_value;
		let t95;
		let p11;
		let t97;
		let h40;
		let t99;
		let ul3;
		let li10;
		let t100;
		let a10;
		let t102;
		let t103;
		let li11;
		let t104;
		let a11;
		let t106;
		let a12;
		let t108;
		let t109;
		let li12;
		let t110;
		let a13;
		let t112;
		let a14;
		let em2;
		let t114;
		let cite24;
		let t115;
		let t116;
		let h41;
		let t118;
		let current;
		let mounted;
		let dispose;
		navbar = new NavBar({ $$inline: true });

		cite0 = new Cite({
				props: { id: "AlpertRaffia1982" },
				$$inline: true
			});

		cite1 = new Cite({
				props: { id: "LichtensteinEtAl1982" },
				$$inline: true
			});

		cite2 = new Cite({
				props: { id: "Wilson1994" },
				$$inline: true
			});

		cite3 = new Cite({
				props: { id: "LichtensteinEtAl1982" },
				$$inline: true
			});

		cite4 = new Cite({
				props: { id: "Silver2012" },
				$$inline: true
			});

		cite5 = new Cite({
				props: { id: "Plous1993" },
				$$inline: true
			});

		cite6 = new Cite({
				props: { id: "RadzevickMoore2009" },
				$$inline: true
			});

		cite7 = new Cite({
				props: { id: "Kahneman2011" },
				$$inline: true
			});

		cite8 = new Cite({
				props: { id: "Marx2013" },
				$$inline: true
			});

		cite9 = new Cite({
				props: { id: "Plous1993" },
				$$inline: true
			});

		cite10 = new Cite({
				props: { id: "Knight1921" },
				$$inline: true
			});

		cite11 = new Cite({
				props: { id: "Jeffery2002" },
				$$inline: true
			});

		cite12 = new Cite({
				props: { id: "LichtensteinFischhoff1978" },
				$$inline: true
			});

		cite13 = new Cite({
				props: { id: "GunzelmannGluck2004" },
				$$inline: true
			});

		cite14 = new Cite({
				props: { id: "Gill2005" },
				$$inline: true
			});

		cite15 = new Cite({
				props: { id: "LindeyEtAl1979" },
				$$inline: true
			});

		cite16 = new Cite({
				props: { id: "McIntyre2007" },
				$$inline: true
			});

		cite17 = new Cite({
				props: { id: "Hubbard2010" },
				$$inline: true
			});

		cite18 = new Cite({
				props: { id: "LichtensteinEtAl1982" },
				$$inline: true
			});

		cite19 = new Cite({
				props: { id: "Plous1993" },
				$$inline: true
			});

		cite20 = new Cite({
				props: { id: "Hubbard2010" },
				$$inline: true
			});

		cite21 = new Cite({
				props: { id: "KassinFong1999" },
				$$inline: true
			});

		cite22 = new Cite({
				props: { id: "Oskamp1965" },
				$$inline: true
			});

		cite23 = new Cite({
				props: { id: "LichtensteinEtAl1982" },
				$$inline: true
			});

		cite24 = new Cite({
				props: { id: "Plous1993" },
				$$inline: true
			});

		let each_value = ensure_array_like_dev(/*$citations*/ ctx[0]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
		}

		const block = {
			c: function create() {
				create_component(navbar.$$.fragment);
				t0 = space();
				main = element("main");
				div = element("div");
				p0 = element("p");
				p0.textContent = "We are terrible guessers.";
				t2 = space();
				p1 = element("p");
				t3 = text("'Guessing' here refers to a properly calibrated probability estimate. If we were to guess the gross domestic earnings of ");
				em0 = element("em");
				em0.textContent = "The Goonies";
				t5 = text(", the answer would probably be wrong, not through personal faults, but because the question tests exact domain knowledge. Rephrasing the question:\n    ");
				blockquote0 = element("blockquote");
				p2 = element("p");
				t6 = text("“What are your high and low estimates for the gross domestic earnings of the ");
				em1 = element("em");
				em1.textContent = "The Goonies";
				t8 = text("? What interval estimate of ");
				a0 = element("a");
				a0.textContent = "confidence";
				t10 = text(" would you give this range?”");
				t11 = text("\n\n    The answer might be:\n    ");
				blockquote1 = element("blockquote");
				p3 = element("p");
				t12 = text("“Between $100,000 to $100,000,000, inclusive, with 90% confidence.”");
				sup0 = element("sup");
				sup0.textContent = "[note]";
				t14 = space();
				p4 = element("p");
				t15 = text("Given enough data points in a sufficiently ideal world, the estimated confidence interval would match observed accuracy. In other words, the range estimates given with 90% confidence should be correct 90% of the time");
				create_component(cite0.$$.fragment);
				t16 = text(". This changes the exercise from a measurement of trivia knowledge to a measurement of ability to gauge uncertainty.  However, that's rarely the case and we habitually estimate with overconfidence. What we know is about 10-35 percentage points less than what we think we know");
				create_component(cite1.$$.fragment);
				t17 = text(".");
				t18 = space();
				p5 = element("p");
				t19 = text("Researchers have explored the limits and prejudices of probability estimates, and have a few theories on potential causes");
				create_component(cite2.$$.fragment);
				t20 = text(".\n    ");
				ul0 = element("ul");
				li0 = element("li");
				a1 = element("a");
				a1.textContent = "Anchoring";
				t22 = text(": the wording and structure of the questions can decrease epistemic accuracy by up to 53 percentage points");
				create_component(cite3.$$.fragment);
				t23 = text(".");
				t24 = space();
				li1 = element("li");
				t25 = text("Pattern-seeking habits of humans create the illusion of signal where there is only noisy data");
				create_component(cite4.$$.fragment);
				t26 = text(".");
				t27 = space();
				li2 = element("li");
				a2 = element("a");
				a2.textContent = "Prospect theory";
				t29 = text(": small probabilities are overweighed, especially when attached to high-consequence events");
				create_component(cite5.$$.fragment);
				t30 = text(".");
				t31 = space();
				li3 = element("li");
				t32 = text("Our educational training emphasizes algebra and calculus as the end goals, ");
				a3 = element("a");
				a3.textContent = "not probability and statistics";
				t34 = text(".");
				t35 = space();
				li4 = element("li");
				t36 = text("We ");
				a4 = element("a");
				a4.textContent = "ignore";
				t38 = text(" prior probabilities.");
				t39 = space();
				li5 = element("li");
				t40 = text("Many social and professional systems reward overconfidence");
				create_component(cite6.$$.fragment);
				t41 = text(".");
				t42 = space();
				li6 = element("li");
				t43 = text("In situations determined primarily by chance, we often build narratives");
				sup1 = element("sup");
				sup1.textContent = "[note]";
				t45 = text(" to coherently explain the events, giving the illusion of control");
				create_component(cite7.$$.fragment);
				t46 = text(". E.g., market fluctuations due to labor reports, portfolio performance due to investment strategies or combat effectiveness predicted by training exercises");
				sup2 = element("sup");
				sup2.textContent = "[note]";
				t48 = text(".");
				t49 = space();
				p6 = element("p");
				t50 = text("These biases are to estimation as ");
				a5 = element("a");
				a5.textContent = "optical illusions";
				t52 = text(" are to psychometrics, where a simple change of the problem context causes a predictable change in the perceived reality. In general, humans have a very troubled relationship with uncertainty. We don't understand it instinctually, we don't communicate it well");
				create_component(cite8.$$.fragment);
				t53 = text(" and we're willing to pay ");
				create_component(cite9.$$.fragment);
				sup3 = element("sup");
				sup3.textContent = ",";
				create_component(cite10.$$.fragment);
				t55 = text(" to avoid it.");
				t56 = space();
				p7 = element("p");
				t57 = text("Even if we don't live in a region with legalized gambling or work in a forecasting profession, everyday failures of estimation hurt our quality of life, whether due to inaccurate project estimates, poor investments or being late to the next appointment. We make decisions based on uncertainty and imperfect knowledge, knowing much less than we think we know. As far as ubiquitous problems of human existence, it's right up there with communicable disease");
				sup4 = element("sup");
				sup4.textContent = "[note]";
				t59 = text(".");
				t60 = space();
				p8 = element("p");
				t61 = text("More importantly, inability to accurately estimate closes the door to powerful tools of probabilistic thinking");
				create_component(cite11.$$.fragment);
				t62 = text(". With accurate prior probabilities, Bayesian prediction avoids the nuances of frequentist statistics, while allowing our mental model to adapt as the facts change. It's something which the Army");
				create_component(cite12.$$.fragment);
				t63 = text(" and Air Force");
				create_component(cite13.$$.fragment);
				t64 = text(" train, and M.D.s understand through years of experience");
				create_component(cite14.$$.fragment);
				sup5 = element("sup");
				sup5.textContent = ",";
				create_component(cite15.$$.fragment);
				t66 = text(". Along with the ");
				a6 = element("a");
				a6.textContent = "distance-rate-time";
				t68 = text(" equation, ");
				a7 = element("a");
				a7.textContent = "time-value";
				t70 = text(" equation and ");
				a8 = element("a");
				a8.textContent = "logical equalities";
				t72 = text(", ");
				a9 = element("a");
				a9.textContent = "Bayes' Theorem";
				t74 = text(" is one of the those unreasonably effective structures of math, which internalizing will vastly improve our thinking");
				create_component(cite16.$$.fragment);
				t75 = text(".");
				t76 = text("\n\n    Overconfidence follows a predictable pattern. Overconfidence is common for difficult assessments (although slightly less for true/false tests");
				create_component(cite17.$$.fragment);
				sup6 = element("sup");
				sup6.textContent = "(p64.)";
				t78 = text("). In some cases, very easy questions inspire underconfidence");
				create_component(cite18.$$.fragment);
				t79 = text(". Two simple calibration techniques can help to correct this:\n    ");
				ul1 = element("ul");
				li7 = element("li");
				t80 = text("Consider the reasons why the judgment might be wrong ");
				create_component(cite19.$$.fragment);
				sup7 = element("sup");
				sup7.textContent = "(p228.)";
				t82 = text(".");
				t83 = space();
				li8 = element("li");
				t84 = text("Range estimates can reduce the anchoring effect of a point estimate, particularly by working towards a narrow range from an absurdly large range");
				create_component(cite20.$$.fragment);
				sup8 = element("sup");
				sup8.textContent = "(p64-5.)";
				t86 = text(".");
				t87 = text("\n    Things that don't fix overconfidence:\n    ");
				ul2 = element("ul");
				li9 = element("li");
				t88 = text("More information. Paradoxically, providing more information to the problem increases one's confidence in the answer, but not accuracy");
				create_component(cite21.$$.fragment);
				sup9 = element("sup");
				sup9.textContent = ", ";
				create_component(cite22.$$.fragment);
				t90 = text(".");
				t91 = space();
				p9 = element("p");
				t92 = text("Most importantly, feedback and iterative practice allow us to improve our estimation techniques");
				create_component(cite23.$$.fragment);
				t93 = text(", which is the purpose of this project. Select the number of questions and the quiz will give instant feedback on your progress. When choosing your confidence level, 95% confidence indicates almost certainty of the correct answer. 55% is almost a toss-up. The line on the chart shows perfect confidence calibration. Anything above the line is underconfidence (e.g., we thought we'd be correct 75% of the time, but actually we were correct more often). Anything below the line is overconfidence.");
				t94 = space();
				p10 = element("p");
				img = element("img");
				t95 = space();
				p11 = element("p");
				p11.textContent = "The more questions have been answered, the more reliable the results will be.";
				t97 = space();
				h40 = element("h4");
				h40.textContent = "Other examples";
				t99 = space();
				ul3 = element("ul");
				li10 = element("li");
				t100 = text("A ");
				a10 = element("a");
				a10.textContent = "list";
				t102 = text(" of them.");
				t103 = space();
				li11 = element("li");
				t104 = text("An ");
				a11 = element("a");
				a11.textContent = "automated quiz";
				t106 = text(" that produces a ");
				a12 = element("a");
				a12.textContent = "nifty graph";
				t108 = text(".");
				t109 = space();
				li12 = element("li");
				t110 = text("A ");
				a13 = element("a");
				a13.textContent = "range estimate quiz";
				t112 = text(" reproduced from ");
				a14 = element("a");
				em2 = element("em");
				em2.textContent = "Decision Traps";
				t114 = text(", and also in Plous's book");
				create_component(cite24.$$.fragment);
				t115 = text(".");
				t116 = space();
				h41 = element("h4");
				h41.textContent = "Sources";
				t118 = space();

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				add_location(p0, file$1, 11, 4, 226);
				add_location(em0, file$1, 16, 127, 407);
				add_location(p1, file$1, 15, 4, 276);
				add_location(em1, file$1, 19, 89, 702);
				attr_dev(a0, "href", "https://en.wikipedia.org/wiki/Confidence_interval");
				add_location(a0, file$1, 19, 137, 750);
				attr_dev(p2, "class", "m-4");
				add_location(p2, file$1, 18, 6, 597);
				add_location(blockquote0, file$1, 17, 4, 578);
				attr_dev(sup0, "class", "note");
				attr_dev(sup0, "title", "It's $61,389,680.");
				add_location(sup0, file$1, 26, 85, 1038);
				attr_dev(p3, "class", "m-4");
				add_location(p3, file$1, 25, 6, 937);
				add_location(blockquote1, file$1, 24, 4, 918);
				add_location(p4, file$1, 30, 4, 1141);
				add_location(p5, file$1, 34, 4, 1720);
				attr_dev(a1, "href", "http://en.wikipedia.org/wiki/Anchoring");
				add_location(a1, file$1, 37, 10, 1895);
				attr_dev(li0, "class", "svelte-gdrqau");
				add_location(li0, file$1, 37, 6, 1891);
				attr_dev(li1, "class", "svelte-gdrqau");
				add_location(li1, file$1, 38, 6, 2109);
				attr_dev(a2, "href", "https://scholar.princeton.edu/sites/default/files/kahneman/files/prospect_theory.pdf");
				add_location(a2, file$1, 39, 10, 2246);
				attr_dev(li2, "class", "svelte-gdrqau");
				add_location(li2, file$1, 39, 6, 2242);
				attr_dev(a3, "href", "http://www.ted.com/talks/arthur_benjamin_s_formula_for_changing_math_education.html");
				add_location(a3, file$1, 40, 85, 2564);
				attr_dev(li3, "class", "svelte-gdrqau");
				add_location(li3, file$1, 40, 6, 2485);
				attr_dev(a4, "href", "http://en.wikipedia.org/wiki/Base_rate_neglect");
				add_location(a4, file$1, 41, 13, 2712);
				attr_dev(li4, "class", "svelte-gdrqau");
				add_location(li4, file$1, 41, 6, 2705);
				attr_dev(li5, "class", "svelte-gdrqau");
				add_location(li5, file$1, 42, 6, 2812);
				attr_dev(sup1, "class", "note");
				attr_dev(sup1, "title", "The term 'Narrative Fallacy' originates from Taleb:\n        “The narrative fallacy addresses our limited ability to look at sequences of facts without weaving an explanation into them, or, equivalently, forcing a logical link, an arrow of relationship upon them. Explanations bind facts together. They make them all the more easily remembered; they help them make more sense. Where this propensity can go wrong is when it increases our impression< of understanding.”\n        —Nassim Nicholas Taleb, The Black Swan (p63-4)");
				add_location(sup1, file$1, 43, 81, 2993);
				attr_dev(sup2, "class", "note");
				attr_dev(sup2, "title", "Narrative building is also used in the benefit of data science: to minimize the effect of 'overfitting', or forcing a quantitative prediction model to prior data (Silver2012, p196).");
				add_location(sup2, file$1, 45, 320, 3829);
				attr_dev(li6, "class", "svelte-gdrqau");
				add_location(li6, file$1, 43, 6, 2918);
				attr_dev(ul0, "class", "svelte-gdrqau");
				add_location(ul0, file$1, 36, 4, 1880);
				attr_dev(a5, "href", "http://en.wikipedia.org/wiki/Checker_shadow_illusion");
				add_location(a5, file$1, 49, 40, 4127);
				add_location(sup3, file$1, 49, 452, 4539);
				add_location(p6, file$1, 48, 4, 4083);
				attr_dev(sup4, "class", "note");
				attr_dev(sup4, "title", "“No problem in judgement in decision making is more prevalent and more potentially catastrophic than overconfidence. As loving Janis (1982) documented in his work on groupthink, American overconfidence enabled the Japanese to destroy Pearl Harbor in World War II. Overconfidence also played a role in the disastrous decision to launch the U.S. space shuttle Challenger. Before the shuttle exploded on its twenty-fifth mission, NASA's official launch risk estimate was 1 catastrophic failure in 100,000 launches (Feynman, 1988, February). This risk estimate is roughly equivalent to launching the shuttle once per day and expecting to see only one accident in three centuries.” (Scott Plous, The Psychology of Judgment and Decision Making p217)");
				add_location(sup4, file$1, 53, 460, 5066);
				add_location(p7, file$1, 52, 4, 4602);
				add_location(sup5, file$1, 57, 495, 6387);
				attr_dev(a6, "href", "http://en.wikipedia.org/wiki/Speed#Definition");
				add_location(a6, file$1, 57, 552, 6444);
				attr_dev(a7, "href", "http://en.wikipedia.org/wiki/Time_value_of_money#Formula");
				add_location(a7, file$1, 57, 641, 6533);
				attr_dev(a8, "href", "http://en.wikipedia.org/wiki/Logical_equality#Alternative_descriptions");
				add_location(a8, file$1, 57, 736, 6628);
				attr_dev(a9, "href", "http://en.wikipedia.org/wiki/Bayes_theorem");
				add_location(a9, file$1, 57, 841, 6733);
				add_location(p8, file$1, 56, 4, 5888);
				add_location(sup6, file$1, 60, 169, 7126);
				add_location(sup7, file$1, 62, 85, 7394);
				attr_dev(li7, "class", "svelte-gdrqau");
				add_location(li7, file$1, 62, 6, 7315);
				add_location(sup8, file$1, 63, 178, 7598);
				attr_dev(li8, "class", "svelte-gdrqau");
				add_location(li8, file$1, 63, 6, 7426);
				attr_dev(ul1, "class", "svelte-gdrqau");
				add_location(ul1, file$1, 61, 4, 7304);
				add_location(sup9, file$1, 67, 170, 7856);
				attr_dev(li9, "class", "svelte-gdrqau");
				add_location(li9, file$1, 67, 6, 7692);
				attr_dev(ul2, "class", "svelte-gdrqau");
				add_location(ul2, file$1, 66, 4, 7681);
				add_location(p9, file$1, 70, 4, 7914);
				attr_dev(img, "alt", "probability distribution");
				if (!src_url_equal(img.src, img_src_value = "images/distribution_highcharts.png")) attr_dev(img, "src", img_src_value);
				add_location(img, file$1, 75, 6, 8591);
				attr_dev(p10, "class", "text-center");
				add_location(p10, file$1, 74, 4, 8561);
				add_location(p11, file$1, 78, 4, 8683);
				attr_dev(h40, "class", "pt-4");
				add_location(h40, file$1, 82, 4, 8785);
				attr_dev(a10, "href", "http://lesswrong.com/lw/1f8/test_your_calibration/");
				add_location(a10, file$1, 85, 12, 8844);
				attr_dev(li10, "class", "svelte-gdrqau");
				add_location(li10, file$1, 85, 6, 8838);
				attr_dev(a11, "href", "http://calibratedprobabilityassessment.org");
				add_location(a11, file$1, 86, 13, 8941);
				attr_dev(a12, "href", "http://calibratedprobabilityassessment.org/graph.php?y=0.28571428571429-0.90909090909091-0.75-1-1&x=55-65-75-85-95");
				add_location(a12, file$1, 86, 101, 9029);
				attr_dev(li11, "class", "svelte-gdrqau");
				add_location(li11, file$1, 86, 6, 8934);
				attr_dev(a13, "href", "http://messymatters.com/calibration/");
				add_location(a13, file$1, 87, 12, 9188);
				add_location(em2, file$1, 87, 257, 9433);
				attr_dev(a14, "href", "http://www.amazon.com/gp/product/0671726099/ref=as_li_ss_tl?ie=UTF8&camp=1789&creative=390957&creativeASIN=0671726099&linkCode=as2&tag=sethrylan-20");
				add_location(a14, file$1, 87, 99, 9275);
				attr_dev(li12, "class", "svelte-gdrqau");
				add_location(li12, file$1, 87, 6, 9182);
				attr_dev(ul3, "class", "svelte-gdrqau");
				add_location(ul3, file$1, 84, 4, 8827);
				attr_dev(h41, "class", "pt-4");
				add_location(h41, file$1, 90, 4, 9530);
				attr_dev(div, "id", "main");
				attr_dev(div, "class", "m-5");
				add_location(div, file$1, 10, 2, 194);
				add_location(main, file$1, 9, 0, 185);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				mount_component(navbar, target, anchor);
				insert_dev(target, t0, anchor);
				insert_dev(target, main, anchor);
				append_dev(main, div);
				append_dev(div, p0);
				append_dev(div, t2);
				append_dev(div, p1);
				append_dev(p1, t3);
				append_dev(p1, em0);
				append_dev(p1, t5);
				append_dev(div, blockquote0);
				append_dev(blockquote0, p2);
				append_dev(p2, t6);
				append_dev(p2, em1);
				append_dev(p2, t8);
				append_dev(p2, a0);
				append_dev(p2, t10);
				append_dev(div, t11);
				append_dev(div, blockquote1);
				append_dev(blockquote1, p3);
				append_dev(p3, t12);
				append_dev(p3, sup0);
				append_dev(div, t14);
				append_dev(div, p4);
				append_dev(p4, t15);
				mount_component(cite0, p4, null);
				append_dev(p4, t16);
				mount_component(cite1, p4, null);
				append_dev(p4, t17);
				append_dev(div, t18);
				append_dev(div, p5);
				append_dev(p5, t19);
				mount_component(cite2, p5, null);
				append_dev(p5, t20);
				append_dev(div, ul0);
				append_dev(ul0, li0);
				append_dev(li0, a1);
				append_dev(li0, t22);
				mount_component(cite3, li0, null);
				append_dev(li0, t23);
				append_dev(ul0, t24);
				append_dev(ul0, li1);
				append_dev(li1, t25);
				mount_component(cite4, li1, null);
				append_dev(li1, t26);
				append_dev(ul0, t27);
				append_dev(ul0, li2);
				append_dev(li2, a2);
				append_dev(li2, t29);
				mount_component(cite5, li2, null);
				append_dev(li2, t30);
				append_dev(ul0, t31);
				append_dev(ul0, li3);
				append_dev(li3, t32);
				append_dev(li3, a3);
				append_dev(li3, t34);
				append_dev(ul0, t35);
				append_dev(ul0, li4);
				append_dev(li4, t36);
				append_dev(li4, a4);
				append_dev(li4, t38);
				append_dev(ul0, t39);
				append_dev(ul0, li5);
				append_dev(li5, t40);
				mount_component(cite6, li5, null);
				append_dev(li5, t41);
				append_dev(ul0, t42);
				append_dev(ul0, li6);
				append_dev(li6, t43);
				append_dev(li6, sup1);
				append_dev(li6, t45);
				mount_component(cite7, li6, null);
				append_dev(li6, t46);
				append_dev(li6, sup2);
				append_dev(li6, t48);
				append_dev(div, t49);
				append_dev(div, p6);
				append_dev(p6, t50);
				append_dev(p6, a5);
				append_dev(p6, t52);
				mount_component(cite8, p6, null);
				append_dev(p6, t53);
				mount_component(cite9, p6, null);
				append_dev(p6, sup3);
				mount_component(cite10, p6, null);
				append_dev(p6, t55);
				append_dev(div, t56);
				append_dev(div, p7);
				append_dev(p7, t57);
				append_dev(p7, sup4);
				append_dev(p7, t59);
				append_dev(div, t60);
				append_dev(div, p8);
				append_dev(p8, t61);
				mount_component(cite11, p8, null);
				append_dev(p8, t62);
				mount_component(cite12, p8, null);
				append_dev(p8, t63);
				mount_component(cite13, p8, null);
				append_dev(p8, t64);
				mount_component(cite14, p8, null);
				append_dev(p8, sup5);
				mount_component(cite15, p8, null);
				append_dev(p8, t66);
				append_dev(p8, a6);
				append_dev(p8, t68);
				append_dev(p8, a7);
				append_dev(p8, t70);
				append_dev(p8, a8);
				append_dev(p8, t72);
				append_dev(p8, a9);
				append_dev(p8, t74);
				mount_component(cite16, p8, null);
				append_dev(p8, t75);
				append_dev(div, t76);
				mount_component(cite17, div, null);
				append_dev(div, sup6);
				append_dev(div, t78);
				mount_component(cite18, div, null);
				append_dev(div, t79);
				append_dev(div, ul1);
				append_dev(ul1, li7);
				append_dev(li7, t80);
				mount_component(cite19, li7, null);
				append_dev(li7, sup7);
				append_dev(li7, t82);
				append_dev(ul1, t83);
				append_dev(ul1, li8);
				append_dev(li8, t84);
				mount_component(cite20, li8, null);
				append_dev(li8, sup8);
				append_dev(li8, t86);
				append_dev(div, t87);
				append_dev(div, ul2);
				append_dev(ul2, li9);
				append_dev(li9, t88);
				mount_component(cite21, li9, null);
				append_dev(li9, sup9);
				mount_component(cite22, li9, null);
				append_dev(li9, t90);
				append_dev(div, t91);
				append_dev(div, p9);
				append_dev(p9, t92);
				mount_component(cite23, p9, null);
				append_dev(p9, t93);
				append_dev(div, t94);
				append_dev(div, p10);
				append_dev(p10, img);
				append_dev(div, t95);
				append_dev(div, p11);
				append_dev(div, t97);
				append_dev(div, h40);
				append_dev(div, t99);
				append_dev(div, ul3);
				append_dev(ul3, li10);
				append_dev(li10, t100);
				append_dev(li10, a10);
				append_dev(li10, t102);
				append_dev(ul3, t103);
				append_dev(ul3, li11);
				append_dev(li11, t104);
				append_dev(li11, a11);
				append_dev(li11, t106);
				append_dev(li11, a12);
				append_dev(li11, t108);
				append_dev(ul3, t109);
				append_dev(ul3, li12);
				append_dev(li12, t110);
				append_dev(li12, a13);
				append_dev(li12, t112);
				append_dev(li12, a14);
				append_dev(a14, em2);
				append_dev(li12, t114);
				mount_component(cite24, li12, null);
				append_dev(li12, t115);
				append_dev(div, t116);
				append_dev(div, h41);
				append_dev(div, t118);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(div, null);
					}
				}

				current = true;

				if (!mounted) {
					dispose = [
						action_destroyer(tooltip.call(null, sup0)),
						action_destroyer(tooltip.call(null, sup1)),
						action_destroyer(tooltip.call(null, sup2)),
						action_destroyer(tooltip.call(null, sup4))
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*$citations*/ 1) {
					each_value = ensure_array_like_dev(/*$citations*/ ctx[0]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(navbar.$$.fragment, local);
				transition_in(cite0.$$.fragment, local);
				transition_in(cite1.$$.fragment, local);
				transition_in(cite2.$$.fragment, local);
				transition_in(cite3.$$.fragment, local);
				transition_in(cite4.$$.fragment, local);
				transition_in(cite5.$$.fragment, local);
				transition_in(cite6.$$.fragment, local);
				transition_in(cite7.$$.fragment, local);
				transition_in(cite8.$$.fragment, local);
				transition_in(cite9.$$.fragment, local);
				transition_in(cite10.$$.fragment, local);
				transition_in(cite11.$$.fragment, local);
				transition_in(cite12.$$.fragment, local);
				transition_in(cite13.$$.fragment, local);
				transition_in(cite14.$$.fragment, local);
				transition_in(cite15.$$.fragment, local);
				transition_in(cite16.$$.fragment, local);
				transition_in(cite17.$$.fragment, local);
				transition_in(cite18.$$.fragment, local);
				transition_in(cite19.$$.fragment, local);
				transition_in(cite20.$$.fragment, local);
				transition_in(cite21.$$.fragment, local);
				transition_in(cite22.$$.fragment, local);
				transition_in(cite23.$$.fragment, local);
				transition_in(cite24.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(navbar.$$.fragment, local);
				transition_out(cite0.$$.fragment, local);
				transition_out(cite1.$$.fragment, local);
				transition_out(cite2.$$.fragment, local);
				transition_out(cite3.$$.fragment, local);
				transition_out(cite4.$$.fragment, local);
				transition_out(cite5.$$.fragment, local);
				transition_out(cite6.$$.fragment, local);
				transition_out(cite7.$$.fragment, local);
				transition_out(cite8.$$.fragment, local);
				transition_out(cite9.$$.fragment, local);
				transition_out(cite10.$$.fragment, local);
				transition_out(cite11.$$.fragment, local);
				transition_out(cite12.$$.fragment, local);
				transition_out(cite13.$$.fragment, local);
				transition_out(cite14.$$.fragment, local);
				transition_out(cite15.$$.fragment, local);
				transition_out(cite16.$$.fragment, local);
				transition_out(cite17.$$.fragment, local);
				transition_out(cite18.$$.fragment, local);
				transition_out(cite19.$$.fragment, local);
				transition_out(cite20.$$.fragment, local);
				transition_out(cite21.$$.fragment, local);
				transition_out(cite22.$$.fragment, local);
				transition_out(cite23.$$.fragment, local);
				transition_out(cite24.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(t0);
					detach_dev(main);
				}

				destroy_component(navbar, detaching);
				destroy_component(cite0);
				destroy_component(cite1);
				destroy_component(cite2);
				destroy_component(cite3);
				destroy_component(cite4);
				destroy_component(cite5);
				destroy_component(cite6);
				destroy_component(cite7);
				destroy_component(cite8);
				destroy_component(cite9);
				destroy_component(cite10);
				destroy_component(cite11);
				destroy_component(cite12);
				destroy_component(cite13);
				destroy_component(cite14);
				destroy_component(cite15);
				destroy_component(cite16);
				destroy_component(cite17);
				destroy_component(cite18);
				destroy_component(cite19);
				destroy_component(cite20);
				destroy_component(cite21);
				destroy_component(cite22);
				destroy_component(cite23);
				destroy_component(cite24);
				destroy_each(each_blocks, detaching);
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$2.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$2($$self, $$props, $$invalidate) {
		let $citations;
		validate_store(citations, 'citations');
		component_subscribe($$self, citations, $$value => $$invalidate(0, $citations = $$value));
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('About', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({
			NavBar,
			Cite,
			tooltip,
			citations,
			$citations
		});

		return [$citations];
	}

	class About extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "About",
				options,
				id: create_fragment$2.name
			});
		}
	}

	function parse(str, loose) {
		if (str instanceof RegExp) return { keys:false, pattern:str };
		var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
		arr[0] || arr.shift();

		while (tmp = arr.shift()) {
			c = tmp[0];
			if (c === '*') {
				keys.push('wild');
				pattern += '/(.*)';
			} else if (c === ':') {
				o = tmp.indexOf('?', 1);
				ext = tmp.indexOf('.', 1);
				keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
				pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
				if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
			} else {
				pattern += '/' + tmp;
			}
		}

		return {
			keys: keys,
			pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
		};
	}

	/* node_modules/svelte-spa-router/Router.svelte generated by Svelte v4.2.17 */

	const { Error: Error_1, Object: Object_1, console: console_1 } = globals;

	// (246:0) {:else}
	function create_else_block(ctx) {
		let switch_instance;
		let switch_instance_anchor;
		let current;
		const switch_instance_spread_levels = [/*props*/ ctx[2]];
		var switch_value = /*component*/ ctx[0];

		function switch_props(ctx, dirty) {
			let switch_instance_props = {};

			for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
				switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
			}

			if (dirty !== undefined && dirty & /*props*/ 4) {
				switch_instance_props = assign(switch_instance_props, get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])]));
			}

			return {
				props: switch_instance_props,
				$$inline: true
			};
		}

		if (switch_value) {
			switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
			switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
		}

		const block = {
			c: function create() {
				if (switch_instance) create_component(switch_instance.$$.fragment);
				switch_instance_anchor = empty();
			},
			m: function mount(target, anchor) {
				if (switch_instance) mount_component(switch_instance, target, anchor);
				insert_dev(target, switch_instance_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (dirty & /*component*/ 1 && switch_value !== (switch_value = /*component*/ ctx[0])) {
					if (switch_instance) {
						group_outros();
						const old_component = switch_instance;

						transition_out(old_component.$$.fragment, 1, 0, () => {
							destroy_component(old_component, 1);
						});

						check_outros();
					}

					if (switch_value) {
						switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx, dirty));
						switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
						create_component(switch_instance.$$.fragment);
						transition_in(switch_instance.$$.fragment, 1);
						mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
					} else {
						switch_instance = null;
					}
				} else if (switch_value) {
					const switch_instance_changes = (dirty & /*props*/ 4)
					? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
					: {};

					switch_instance.$set(switch_instance_changes);
				}
			},
			i: function intro(local) {
				if (current) return;
				if (switch_instance) transition_in(switch_instance.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				if (switch_instance) transition_out(switch_instance.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(switch_instance_anchor);
				}

				if (switch_instance) destroy_component(switch_instance, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block.name,
			type: "else",
			source: "(246:0) {:else}",
			ctx
		});

		return block;
	}

	// (239:0) {#if componentParams}
	function create_if_block(ctx) {
		let switch_instance;
		let switch_instance_anchor;
		let current;
		const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
		var switch_value = /*component*/ ctx[0];

		function switch_props(ctx, dirty) {
			let switch_instance_props = {};

			for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
				switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
			}

			if (dirty !== undefined && dirty & /*componentParams, props*/ 6) {
				switch_instance_props = assign(switch_instance_props, get_spread_update(switch_instance_spread_levels, [
					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
				]));
			}

			return {
				props: switch_instance_props,
				$$inline: true
			};
		}

		if (switch_value) {
			switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
			switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
		}

		const block = {
			c: function create() {
				if (switch_instance) create_component(switch_instance.$$.fragment);
				switch_instance_anchor = empty();
			},
			m: function mount(target, anchor) {
				if (switch_instance) mount_component(switch_instance, target, anchor);
				insert_dev(target, switch_instance_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (dirty & /*component*/ 1 && switch_value !== (switch_value = /*component*/ ctx[0])) {
					if (switch_instance) {
						group_outros();
						const old_component = switch_instance;

						transition_out(old_component.$$.fragment, 1, 0, () => {
							destroy_component(old_component, 1);
						});

						check_outros();
					}

					if (switch_value) {
						switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx, dirty));
						switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
						create_component(switch_instance.$$.fragment);
						transition_in(switch_instance.$$.fragment, 1);
						mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
					} else {
						switch_instance = null;
					}
				} else if (switch_value) {
					const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
					? get_spread_update(switch_instance_spread_levels, [
							dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
							dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
						])
					: {};

					switch_instance.$set(switch_instance_changes);
				}
			},
			i: function intro(local) {
				if (current) return;
				if (switch_instance) transition_in(switch_instance.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				if (switch_instance) transition_out(switch_instance.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(switch_instance_anchor);
				}

				if (switch_instance) destroy_component(switch_instance, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block.name,
			type: "if",
			source: "(239:0) {#if componentParams}",
			ctx
		});

		return block;
	}

	function create_fragment$1(ctx) {
		let current_block_type_index;
		let if_block;
		let if_block_anchor;
		let current;
		const if_block_creators = [create_if_block, create_else_block];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*componentParams*/ ctx[1]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		const block = {
			c: function create() {
				if_block.c();
				if_block_anchor = empty();
			},
			l: function claim(nodes) {
				throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				if_blocks[current_block_type_index].m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(if_block_anchor);
				}

				if_blocks[current_block_type_index].d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$1.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function getLocation() {
		const hashPosition = window.location.href.indexOf('#/');

		let location = hashPosition > -1
		? window.location.href.substr(hashPosition + 1)
		: '/';

		// Check if there's a querystring
		const qsPosition = location.indexOf('?');

		let querystring = '';

		if (qsPosition > -1) {
			querystring = location.substr(qsPosition + 1);
			location = location.substr(0, qsPosition);
		}

		return { location, querystring };
	}

	const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
	function start(set) {
		set(getLocation());

		const update = () => {
			set(getLocation());
		};

		window.addEventListener('hashchange', update, false);

		return function stop() {
			window.removeEventListener('hashchange', update, false);
		};
	});

	const location = derived(loc, _loc => _loc.location);
	const querystring = derived(loc, _loc => _loc.querystring);
	const params = writable(undefined);

	async function push(location) {
		if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
			throw Error('Invalid parameter location');
		}

		// Execute this code when the current call stack is complete
		await tick();

		// Note: this will include scroll state in history even when restoreScrollState is false
		history.replaceState(
			{
				...history.state,
				__svelte_spa_router_scrollX: window.scrollX,
				__svelte_spa_router_scrollY: window.scrollY
			},
			undefined
		);

		window.location.hash = (location.charAt(0) == '#' ? '' : '#') + location;
	}

	async function pop() {
		// Execute this code when the current call stack is complete
		await tick();

		window.history.back();
	}

	async function replace(location) {
		if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
			throw Error('Invalid parameter location');
		}

		// Execute this code when the current call stack is complete
		await tick();

		const dest = (location.charAt(0) == '#' ? '' : '#') + location;

		try {
			const newState = { ...history.state };
			delete newState['__svelte_spa_router_scrollX'];
			delete newState['__svelte_spa_router_scrollY'];
			window.history.replaceState(newState, undefined, dest);
		} catch(e) {
			// eslint-disable-next-line no-console
			console.warn('Caught exception while replacing the current page. If you\'re running this in the Svelte REPL, please note that the `replace` method might not work in this environment.');
		}

		// The method above doesn't trigger the hashchange event, so let's do that manually
		window.dispatchEvent(new Event('hashchange'));
	}

	function link(node, opts) {
		opts = linkOpts(opts);

		// Only apply to <a> tags
		if (!node || !node.tagName || node.tagName.toLowerCase() != 'a') {
			throw Error('Action "link" can only be used with <a> tags');
		}

		updateLink(node, opts);

		return {
			update(updated) {
				updated = linkOpts(updated);
				updateLink(node, updated);
			}
		};
	}

	function restoreScroll(state) {
		// If this exists, then this is a back navigation: restore the scroll position
		if (state) {
			window.scrollTo(state.__svelte_spa_router_scrollX, state.__svelte_spa_router_scrollY);
		} else {
			// Otherwise this is a forward navigation: scroll to top
			window.scrollTo(0, 0);
		}
	}

	// Internal function used by the link function
	function updateLink(node, opts) {
		let href = opts.href || node.getAttribute('href');

		// Destination must start with '/' or '#/'
		if (href && href.charAt(0) == '/') {
			// Add # to the href attribute
			href = '#' + href;
		} else if (!href || href.length < 2 || href.slice(0, 2) != '#/') {
			throw Error('Invalid value for "href" attribute: ' + href);
		}

		node.setAttribute('href', href);

		node.addEventListener('click', event => {
			// Prevent default anchor onclick behaviour
			event.preventDefault();

			if (!opts.disabled) {
				scrollstateHistoryHandler(event.currentTarget.getAttribute('href'));
			}
		});
	}

	// Internal function that ensures the argument of the link action is always an object
	function linkOpts(val) {
		if (val && typeof val == 'string') {
			return { href: val };
		} else {
			return val || {};
		}
	}

	/**
	 * The handler attached to an anchor tag responsible for updating the
	 * current history state with the current scroll state
	 *
	 * @param {string} href - Destination
	 */
	function scrollstateHistoryHandler(href) {
		// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
		history.replaceState(
			{
				...history.state,
				__svelte_spa_router_scrollX: window.scrollX,
				__svelte_spa_router_scrollY: window.scrollY
			},
			undefined
		);

		// This will force an update as desired, but this time our scroll state will be attached
		window.location.hash = href;
	}

	function instance$1($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Router', slots, []);
		let { routes = {} } = $$props;
		let { prefix = '' } = $$props;
		let { restoreScrollState = false } = $$props;

		/**
	 * Container for a route: path, component
	 */
		class RouteItem {
			/**
	 * Initializes the object and creates a regular expression from the path, using regexparam.
	 *
	 * @param {string} path - Path to the route (must start with '/' or '*')
	 * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
	 */
			constructor(path, component) {
				if (!component || typeof component != 'function' && (typeof component != 'object' || component._sveltesparouter !== true)) {
					throw Error('Invalid component object');
				}

				// Path must be a regular or expression, or a string starting with '/' or '*'
				if (!path || typeof path == 'string' && (path.length < 1 || path.charAt(0) != '/' && path.charAt(0) != '*') || typeof path == 'object' && !(path instanceof RegExp)) {
					throw Error('Invalid value for "path" argument - strings must start with / or *');
				}

				const { pattern, keys } = parse(path);
				this.path = path;

				// Check if the component is wrapped and we have conditions
				if (typeof component == 'object' && component._sveltesparouter === true) {
					this.component = component.component;
					this.conditions = component.conditions || [];
					this.userData = component.userData;
					this.props = component.props || {};
				} else {
					// Convert the component to a function that returns a Promise, to normalize it
					this.component = () => Promise.resolve(component);

					this.conditions = [];
					this.props = {};
				}

				this._pattern = pattern;
				this._keys = keys;
			}

			/**
	 * Checks if `path` matches the current route.
	 * If there's a match, will return the list of parameters from the URL (if any).
	 * In case of no match, the method will return `null`.
	 *
	 * @param {string} path - Path to test
	 * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
	 */
			match(path) {
				// If there's a prefix, check if it matches the start of the path.
				// If not, bail early, else remove it before we run the matching.
				if (prefix) {
					if (typeof prefix == 'string') {
						if (path.startsWith(prefix)) {
							path = path.substr(prefix.length) || '/';
						} else {
							return null;
						}
					} else if (prefix instanceof RegExp) {
						const match = path.match(prefix);

						if (match && match[0]) {
							path = path.substr(match[0].length) || '/';
						} else {
							return null;
						}
					}
				}

				// Check if the pattern matches
				const matches = this._pattern.exec(path);

				if (matches === null) {
					return null;
				}

				// If the input was a regular expression, this._keys would be false, so return matches as is
				if (this._keys === false) {
					return matches;
				}

				const out = {};
				let i = 0;

				while (i < this._keys.length) {
					// In the match parameters, URL-decode all values
					try {
						out[this._keys[i]] = decodeURIComponent(matches[i + 1] || '') || null;
					} catch(e) {
						out[this._keys[i]] = null;
					}

					i++;
				}

				return out;
			}

			/**
	 * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
	 * @typedef {Object} RouteDetail
	 * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
	 * @property {string} location - Location path
	 * @property {string} querystring - Querystring from the hash
	 * @property {object} [userData] - Custom data passed by the user
	 * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
	 * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
	 */
			/**
	 * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
	 * 
	 * @param {RouteDetail} detail - Route detail
	 * @returns {boolean} Returns true if all the conditions succeeded
	 */
			async checkConditions(detail) {
				for (let i = 0; i < this.conditions.length; i++) {
					if (!await this.conditions[i](detail)) {
						return false;
					}
				}

				return true;
			}
		}

		// Set up all routes
		const routesList = [];

		if (routes instanceof Map) {
			// If it's a map, iterate on it right away
			routes.forEach((route, path) => {
				routesList.push(new RouteItem(path, route));
			});
		} else {
			// We have an object, so iterate on its own properties
			Object.keys(routes).forEach(path => {
				routesList.push(new RouteItem(path, routes[path]));
			});
		}

		// Props for the component to render
		let component = null;

		let componentParams = null;
		let props = {};

		// Event dispatcher from Svelte
		const dispatch = createEventDispatcher();

		// Just like dispatch, but executes on the next iteration of the event loop
		async function dispatchNextTick(name, detail) {
			// Execute this code when the current call stack is complete
			await tick();

			dispatch(name, detail);
		}

		// If this is set, then that means we have popped into this var the state of our last scroll position
		let previousScrollState = null;

		let popStateChanged = null;

		if (restoreScrollState) {
			popStateChanged = event => {
				// If this event was from our history.replaceState, event.state will contain
				// our scroll history. Otherwise, event.state will be null (like on forward
				// navigation)
				if (event.state && (event.state.__svelte_spa_router_scrollY || event.state.__svelte_spa_router_scrollX)) {
					previousScrollState = event.state;
				} else {
					previousScrollState = null;
				}
			};

			// This is removed in the destroy() invocation below
			window.addEventListener('popstate', popStateChanged);

			afterUpdate(() => {
				restoreScroll(previousScrollState);
			});
		}

		// Always have the latest value of loc
		let lastLoc = null;

		// Current object of the component loaded
		let componentObj = null;

		// Handle hash change events
		// Listen to changes in the $loc store and update the page
		// Do not use the $: syntax because it gets triggered by too many things
		const unsubscribeLoc = loc.subscribe(async newLoc => {
			lastLoc = newLoc;

			// Find a route matching the location
			let i = 0;

			while (i < routesList.length) {
				const match = routesList[i].match(newLoc.location);

				if (!match) {
					i++;
					continue;
				}

				const detail = {
					route: routesList[i].path,
					location: newLoc.location,
					querystring: newLoc.querystring,
					userData: routesList[i].userData,
					params: match && typeof match == 'object' && Object.keys(match).length
					? match
					: null
				};

				// Check if the route can be loaded - if all conditions succeed
				if (!await routesList[i].checkConditions(detail)) {
					// Don't display anything
					$$invalidate(0, component = null);

					componentObj = null;

					// Trigger an event to notify the user, then exit
					dispatchNextTick('conditionsFailed', detail);

					return;
				}

				// Trigger an event to alert that we're loading the route
				// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
				dispatchNextTick('routeLoading', Object.assign({}, detail));

				// If there's a component to show while we're loading the route, display it
				const obj = routesList[i].component;

				// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
				if (componentObj != obj) {
					if (obj.loading) {
						$$invalidate(0, component = obj.loading);
						componentObj = obj;
						$$invalidate(1, componentParams = obj.loadingParams);
						$$invalidate(2, props = {});

						// Trigger the routeLoaded event for the loading component
						// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
						dispatchNextTick('routeLoaded', Object.assign({}, detail, {
							component,
							name: component.name,
							params: componentParams
						}));
					} else {
						$$invalidate(0, component = null);
						componentObj = null;
					}

					// Invoke the Promise
					const loaded = await obj();

					// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
					if (newLoc != lastLoc) {
						// Don't update the component, just exit
						return;
					}

					// If there is a "default" property, which is used by async routes, then pick that
					$$invalidate(0, component = loaded && loaded.default || loaded);

					componentObj = obj;
				}

				// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
				// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
				if (match && typeof match == 'object' && Object.keys(match).length) {
					$$invalidate(1, componentParams = match);
				} else {
					$$invalidate(1, componentParams = null);
				}

				// Set static props, if any
				$$invalidate(2, props = routesList[i].props);

				// Dispatch the routeLoaded event then exit
				// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
				dispatchNextTick('routeLoaded', Object.assign({}, detail, {
					component,
					name: component.name,
					params: componentParams
				})).then(() => {
					params.set(componentParams);
				});

				return;
			}

			// If we're still here, there was no match, so show the empty component
			$$invalidate(0, component = null);

			componentObj = null;
			params.set(undefined);
		});

		onDestroy(() => {
			unsubscribeLoc();
			popStateChanged && window.removeEventListener('popstate', popStateChanged);
		});

		const writable_props = ['routes', 'prefix', 'restoreScrollState'];

		Object_1.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Router> was created with unknown prop '${key}'`);
		});

		function routeEvent_handler(event) {
			bubble.call(this, $$self, event);
		}

		function routeEvent_handler_1(event) {
			bubble.call(this, $$self, event);
		}

		$$self.$$set = $$props => {
			if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
			if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
			if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
		};

		$$self.$capture_state = () => ({
			readable,
			writable,
			derived,
			tick,
			getLocation,
			loc,
			location,
			querystring,
			params,
			push,
			pop,
			replace,
			link,
			restoreScroll,
			updateLink,
			linkOpts,
			scrollstateHistoryHandler,
			onDestroy,
			createEventDispatcher,
			afterUpdate,
			parse,
			routes,
			prefix,
			restoreScrollState,
			RouteItem,
			routesList,
			component,
			componentParams,
			props,
			dispatch,
			dispatchNextTick,
			previousScrollState,
			popStateChanged,
			lastLoc,
			componentObj,
			unsubscribeLoc
		});

		$$self.$inject_state = $$props => {
			if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
			if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
			if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
			if ('component' in $$props) $$invalidate(0, component = $$props.component);
			if ('componentParams' in $$props) $$invalidate(1, componentParams = $$props.componentParams);
			if ('props' in $$props) $$invalidate(2, props = $$props.props);
			if ('previousScrollState' in $$props) previousScrollState = $$props.previousScrollState;
			if ('popStateChanged' in $$props) popStateChanged = $$props.popStateChanged;
			if ('lastLoc' in $$props) lastLoc = $$props.lastLoc;
			if ('componentObj' in $$props) componentObj = $$props.componentObj;
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
				// Update history.scrollRestoration depending on restoreScrollState
				history.scrollRestoration = restoreScrollState ? 'manual' : 'auto';
			}
		};

		return [
			component,
			componentParams,
			props,
			routes,
			prefix,
			restoreScrollState,
			routeEvent_handler,
			routeEvent_handler_1
		];
	}

	class Router extends SvelteComponentDev {
		constructor(options) {
			super(options);

			init(this, options, instance$1, create_fragment$1, safe_not_equal, {
				routes: 3,
				prefix: 4,
				restoreScrollState: 5
			});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Router",
				options,
				id: create_fragment$1.name
			});
		}

		get routes() {
			throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set routes(value) {
			throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get prefix() {
			throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set prefix(value) {
			throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get restoreScrollState() {
			throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set restoreScrollState(value) {
			throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/App.svelte generated by Svelte v4.2.17 */
	const file = "src/App.svelte";

	function create_fragment(ctx) {
		let html;
		let link;
		let t;
		let body;
		let router;
		let current;

		router = new Router({
				props: { routes: /*routes*/ ctx[0] },
				$$inline: true
			});

		const block = {
			c: function create() {
				html = element("html");
				link = element("link");
				t = space();
				body = element("body");
				create_component(router.$$.fragment);
				document.title = "A tool for calibrated probability estimation";
				attr_dev(html, "lang", "en");
				add_location(html, file, 13, 2, 289);
				attr_dev(link, "rel", "stylesheet");
				attr_dev(link, "href", "https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css");
				add_location(link, file, 14, 2, 310);
				add_location(body, file, 17, 0, 429);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				append_dev(document.head, html);
				append_dev(document.head, link);
				insert_dev(target, t, anchor);
				insert_dev(target, body, anchor);
				mount_component(router, body, null);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(router.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(router.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(t);
					detach_dev(body);
				}

				detach_dev(html);
				detach_dev(link);
				destroy_component(router);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('App', slots, []);
		const routes = { '/': Calibrate, '/about/': About };
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({ Calibrate, About, Router, routes });
		return [routes];
	}

	class App extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance, create_fragment, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "App",
				options,
				id: create_fragment.name
			});
		}
	}

	var app = new App({
	  target: document.body
	});

	return app;

})();
//# sourceMappingURL=bundle.js.map
