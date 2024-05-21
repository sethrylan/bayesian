
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
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
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
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
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
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
        flushing = false;
        seen_callbacks.clear();
    }
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
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

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
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
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
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
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
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
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
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
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

    /* src/Question.svelte generated by Svelte v3.44.0 */
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
    			if (detaching) detach_dev(div5);
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

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*question*/ ctx[0] === undefined && !('question' in props)) {
    			console.warn("<Question> was created without expected prop 'question'");
    		}
    	}

    	get question() {
    		throw new Error("<Question>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set question(value) {
    		throw new Error("<Question>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Feedback.svelte generated by Svelte v3.44.0 */

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
    			if (detaching) detach_dev(h6);
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
    			if (detaching) detach_dev(h6);
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
    			if (detaching) detach_dev(div1);
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

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*question*/ ctx[0] === undefined && !('question' in props)) {
    			console.warn("<Feedback> was created without expected prop 'question'");
    		}

    		if (/*response*/ ctx[1] === undefined && !('response' in props)) {
    			console.warn("<Feedback> was created without expected prop 'response'");
    		}
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

    /* src/NavBar.svelte generated by Svelte v3.44.0 */

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
    			if (detaching) detach_dev(nav);
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

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    /*
     Highcharts JS v9.3.2 (2021-11-29)

     (c) 2009-2021 Torstein Honsi

     License: www.highcharts.com/license
    */

    var highchartsMore = createCommonjsModule(function (module) {
    (function(d){module.exports?(d["default"]=d,module.exports=d):d("undefined"!==typeof Highcharts?Highcharts:void 0);})(function(d){function A(d,e,l,a){d.hasOwnProperty(e)||(d[e]=a.apply(null,l));}d=d?d._modules:{};A(d,"Extensions/Pane.js",[d["Core/Chart/Chart.js"],d["Series/CenteredUtilities.js"],d["Core/Globals.js"],d["Core/Pointer.js"],
    d["Core/Utilities.js"]],function(d,e,l,a,c){function t(b,m,n){return Math.sqrt(Math.pow(b-n[0],2)+Math.pow(m-n[1],2))<=n[2]/2}var p=c.addEvent,k=c.extend,x=c.merge,w=c.pick,b=c.splat;d.prototype.collectionsWithUpdate.push("pane");c=function(){function g(b,g){this.options=this.chart=this.center=this.background=void 0;this.coll="pane";this.defaultOptions={center:["50%","50%"],size:"85%",innerSize:"0%",startAngle:0};this.defaultBackgroundOptions={shape:"circle",borderWidth:1,borderColor:"#cccccc",backgroundColor:{linearGradient:{x1:0,
    y1:0,x2:0,y2:1},stops:[[0,"#ffffff"],[1,"#e6e6e6"]]},from:-Number.MAX_VALUE,innerRadius:0,to:Number.MAX_VALUE,outerRadius:"105%"};this.init(b,g);}g.prototype.init=function(b,g){this.chart=g;this.background=[];g.pane.push(this);this.setOptions(b);};g.prototype.setOptions=function(b){this.options=x(this.defaultOptions,this.chart.angular?{background:{}}:void 0,b);};g.prototype.render=function(){var g=this.options,n=this.options.background,q=this.chart.renderer;this.group||(this.group=q.g("pane-group").attr({zIndex:g.zIndex||
    0}).add());this.updateCenter();if(n)for(n=b(n),g=Math.max(n.length,this.background.length||0),q=0;q<g;q++)n[q]&&this.axis?this.renderBackground(x(this.defaultBackgroundOptions,n[q]),q):this.background[q]&&(this.background[q]=this.background[q].destroy(),this.background.splice(q,1));};g.prototype.renderBackground=function(b,g){var n="animate",m={"class":"highcharts-pane "+(b.className||"")};this.chart.styledMode||k(m,{fill:b.backgroundColor,stroke:b.borderColor,"stroke-width":b.borderWidth});this.background[g]||
    (this.background[g]=this.chart.renderer.path().add(this.group),n="attr");this.background[g][n]({d:this.axis.getPlotBandPath(b.from,b.to,b)}).attr(m);};g.prototype.updateCenter=function(b){this.center=(b||this.axis||{}).center=e.getCenter.call(this);};g.prototype.update=function(b,g){x(!0,this.options,b);this.setOptions(this.options);this.render();this.chart.axes.forEach(function(b){b.pane===this&&(b.pane=null,b.update({},g));},this);};return g}();d.prototype.getHoverPane=function(b){var g=this,n;b&&g.pane.forEach(function(q){var m=
    b.chartX-g.plotLeft,a=b.chartY-g.plotTop;t(g.inverted?a:m,g.inverted?m:a,q.center)&&(n=q);});return n};p(d,"afterIsInsidePlot",function(b){this.polar&&(b.isInsidePlot=this.pane.some(function(g){return t(b.x,b.y,g.center)}));});p(a,"beforeGetHoverData",function(b){var g=this.chart;g.polar?(g.hoverPane=g.getHoverPane(b),b.filter=function(n){return n.visible&&!(!b.shared&&n.directTouch)&&w(n.options.enableMouseTracking,!0)&&(!g.hoverPane||n.xAxis.pane===g.hoverPane)}):g.hoverPane=void 0;});p(a,"afterGetHoverData",
    function(b){var g=this.chart;b.hoverPoint&&b.hoverPoint.plotX&&b.hoverPoint.plotY&&g.hoverPane&&!t(b.hoverPoint.plotX,b.hoverPoint.plotY,g.hoverPane.center)&&(b.hoverPoint=void 0);});l.Pane=c;return l.Pane});A(d,"Core/Axis/RadialAxis.js",[d["Core/Axis/AxisDefaults.js"],d["Core/DefaultOptions.js"],d["Core/Globals.js"],d["Core/Utilities.js"]],function(d,e,l,a){var c=e.defaultOptions,t=l.noop,p=a.addEvent,k=a.correctFloat,x=a.defined,w=a.extend,b=a.fireEvent,g=a.merge,m=a.pick,n=a.relativeLength,q=a.wrap,
    H;(function(a){function e(){this.autoConnect=this.isCircular&&"undefined"===typeof m(this.userMax,this.options.max)&&k(this.endAngleRad-this.startAngleRad)===k(2*Math.PI);!this.isCircular&&this.chart.inverted&&this.max++;this.autoConnect&&(this.max+=this.categories&&1||this.pointRange||this.closestPointRange||0);}function y(){var h=this;return function(){if(h.isRadial&&h.tickPositions&&h.options.labels&&!0!==h.options.labels.allowOverlap)return h.tickPositions.map(function(f){return h.ticks[f]&&h.ticks[f].label}).filter(function(h){return !!h})}}
    function z(){return t}function f(h,f,b){var r=this.pane.center,u=h.value;if(this.isCircular){if(x(u))h.point&&(g=h.point.shapeArgs||{},g.start&&(u=this.chart.inverted?this.translate(h.point.rectPlotY,!0):h.point.x));else {var g=h.chartX||0;var v=h.chartY||0;u=this.translate(Math.atan2(v-b,g-f)-this.startAngleRad,!0);}h=this.getPosition(u);g=h.x;v=h.y;}else x(u)||(g=h.chartX,v=h.chartY),x(g)&&x(v)&&(b=r[1]+this.chart.plotTop,u=this.translate(Math.min(Math.sqrt(Math.pow(g-f,2)+Math.pow(v-b,2)),r[2]/2)-
    r[3]/2,!0));return [u,g||0,v||0]}function h(h,f,b){h=this.pane.center;var r=this.chart,u=this.left||0,g=this.top||0,v=m(f,h[2]/2-this.offset);"undefined"===typeof b&&(b=this.horiz?0:this.center&&-this.center[3]/2);b&&(v+=b);this.isCircular||"undefined"!==typeof f?(f=this.chart.renderer.symbols.arc(u+h[0],g+h[1],v,v,{start:this.startAngleRad,end:this.endAngleRad,open:!0,innerR:0}),f.xBounds=[u+h[0]],f.yBounds=[g+h[1]-v]):(f=this.postTranslate(this.angleRad,v),f=[["M",this.center[0]+r.plotLeft,this.center[1]+
    r.plotTop],["L",f.x,f.y]]);return f}function u(){this.constructor.prototype.getOffset.call(this);this.chart.axisOffset[this.side]=0;}function r(h,f,b){var r=this.chart,u=function(h){if("string"===typeof h){var f=parseInt(h,10);y.test(h)&&(f=f*B/100);return f}return h},g=this.center,v=this.startAngleRad,B=g[2]/2,n=Math.min(this.offset,0),q=this.left||0,a=this.top||0,y=/%$/,z=this.isCircular,c=m(u(b.outerRadius),B),k=u(b.innerRadius);u=m(u(b.thickness),10);if("polygon"===this.options.gridLineInterpolation)n=
    this.getPlotLinePath({value:h}).concat(this.getPlotLinePath({value:f,reverse:!0}));else {h=Math.max(h,this.min);f=Math.min(f,this.max);h=this.translate(h);f=this.translate(f);z||(c=h||0,k=f||0);if("circle"!==b.shape&&z)b=v+(h||0),v+=f||0;else {b=-Math.PI/2;v=1.5*Math.PI;var E=!0;}c-=n;n=r.renderer.symbols.arc(q+g[0],a+g[1],c,c,{start:Math.min(b,v),end:Math.max(b,v),innerR:m(k,c-(u-n)),open:E});z&&(z=(v+b)/2,q=q+g[0]+g[2]/2*Math.cos(z),n.xBounds=z>-Math.PI/2&&z<Math.PI/2?[q,r.plotWidth]:[0,q],n.yBounds=
    [a+g[1]+g[2]/2*Math.sin(z)],n.yBounds[0]+=z>-Math.PI&&0>z||z>Math.PI?-10:10);}return n}function B(h){var f=this,b=this.pane.center,r=this.chart,u=r.inverted,g=h.reverse,v=this.pane.options.background?this.pane.options.background[0]||this.pane.options.background:{},B=v.innerRadius||"0%",q=v.outerRadius||"100%",a=b[0]+r.plotLeft,z=b[1]+r.plotTop,c=this.height,y=h.isCrosshair;v=b[3]/2;var m=h.value,k;var E=this.getPosition(m);var e=E.x;E=E.y;y&&(E=this.getCrosshairPosition(h,a,z),m=E[0],e=E[1],E=E[2]);
    if(this.isCircular)m=Math.sqrt(Math.pow(e-a,2)+Math.pow(E-z,2)),g="string"===typeof B?n(B,1):B/m,r="string"===typeof q?n(q,1):q/m,b&&v&&(v/=m,g<v&&(g=v),r<v&&(r=v)),b=[["M",a+g*(e-a),z-g*(z-E)],["L",e-(1-r)*(e-a),E+(1-r)*(z-E)]];else if((m=this.translate(m))&&(0>m||m>c)&&(m=0),"circle"===this.options.gridLineInterpolation)b=this.getLinePath(0,m,v);else if(b=[],r[u?"yAxis":"xAxis"].forEach(function(h){h.pane===f.pane&&(k=h);}),k)for(a=k.tickPositions,k.autoConnect&&(a=a.concat([a[0]])),g&&(a=a.slice().reverse()),
    m&&(m+=v),z=0;z<a.length;z++)v=k.getPosition(a[z],m),b.push(z?["L",v.x,v.y]:["M",v.x,v.y]);return b}function v(h,f){h=this.translate(h);return this.postTranslate(this.isCircular?h:this.angleRad,m(this.isCircular?f:0>h?0:h,this.center[2]/2)-this.offset)}function E(){var h=this.center,f=this.chart,b=this.options.title;return {x:f.plotLeft+h[0]+(b.x||0),y:f.plotTop+h[1]-{high:.5,middle:.25,low:0}[b.align]*h[2]+(b.y||0)}}function l(b){b.beforeSetTickPositions=e;b.createLabelCollector=y;b.getCrosshairPosition=
    f;b.getLinePath=h;b.getOffset=u;b.getPlotBandPath=r;b.getPlotLinePath=B;b.getPosition=v;b.getTitlePosition=E;b.postTranslate=O;b.setAxisSize=A;b.setAxisTranslation=P;b.setOptions=Q;}function L(){var h=this.chart,f=this.options,b=this.pane,r=b&&b.options;h.angular&&this.isXAxis||!b||!h.angular&&!h.polar||(this.angleRad=(f.angle||0)*Math.PI/180,this.startAngleRad=(r.startAngle-90)*Math.PI/180,this.endAngleRad=(m(r.endAngle,r.startAngle+360)-90)*Math.PI/180,this.offset=f.offset||0);}function H(h){this.isRadial&&
    (h.align=void 0,h.preventDefault());}function K(){if(this.chart&&this.chart.labelCollectors){var h=this.labelCollector?this.chart.labelCollectors.indexOf(this.labelCollector):-1;0<=h&&this.chart.labelCollectors.splice(h,1);}}function C(h){var f=this.chart,b=f.inverted,r=f.angular,u=f.polar,v=this.isXAxis,B=this.coll,n=r&&v,a=f.options;h=h.userOptions.pane||0;h=this.pane=f.pane&&f.pane[h];var q;if("colorAxis"===B)this.isRadial=!1;else {if(r){if(n?(this.isHidden=!0,this.createLabelCollector=z,this.getOffset=
    t,this.render=this.redraw=G,this.setTitle=this.setCategories=this.setScale=t):l(this),q=!v)this.defaultPolarOptions=R;}else u&&(l(this),this.defaultPolarOptions=(q=this.horiz)?S:g("xAxis"===B?d.defaultXAxisOptions:d.defaultYAxisOptions,T),b&&"yAxis"===B&&(this.defaultPolarOptions.stackLabels=d.defaultYAxisOptions.stackLabels,this.defaultPolarOptions.reversedStacks=!0));r||u?(this.isRadial=!0,a.chart.zoomType=null,this.labelCollector||(this.labelCollector=this.createLabelCollector()),this.labelCollector&&
    f.labelCollectors.push(this.labelCollector)):this.isRadial=!1;h&&q&&(h.axis=this);this.isCircular=q;}}function U(){this.isRadial&&this.beforeSetTickPositions();}function J(h){var f=this.label;if(f){var b=this.axis,r=f.getBBox(),u=b.options.labels,v=(b.translate(this.pos)+b.startAngleRad+Math.PI/2)/Math.PI*180%360,g=Math.round(v),B=x(u.y)?0:.3*-r.height,a=u.y,q=20,z=u.align,c="end",y=0>g?g+360:g,E=y,k=0,e=0;if(b.isRadial){var l=b.getPosition(this.pos,b.center[2]/2+n(m(u.distance,-25),b.center[2]/2,-b.center[2]/
    2));"auto"===u.rotation?f.attr({rotation:v}):x(a)||(a=b.chart.renderer.fontMetrics(f.styles&&f.styles.fontSize).b-r.height/2);x(z)||(b.isCircular?(r.width>b.len*b.tickInterval/(b.max-b.min)&&(q=0),z=v>q&&v<180-q?"left":v>180+q&&v<360-q?"right":"center"):z="center",f.attr({align:z}));if("auto"===z&&2===b.tickPositions.length&&b.isCircular){90<y&&180>y?y=180-y:270<y&&360>=y&&(y=540-y);180<E&&360>=E&&(E=360-E);if(b.pane.options.startAngle===g||b.pane.options.startAngle===g+360||b.pane.options.startAngle===
    g-360)c="start";z=-90<=g&&90>=g||-360<=g&&-270>=g||270<=g&&360>=g?"start"===c?"right":"left":"start"===c?"left":"right";70<E&&110>E&&(z="center");15>y||180<=y&&195>y?k=.3*r.height:15<=y&&35>=y?k="start"===c?0:.75*r.height:195<=y&&215>=y?k="start"===c?.75*r.height:0:35<y&&90>=y?k="start"===c?.25*-r.height:r.height:215<y&&270>=y&&(k="start"===c?r.height:.25*-r.height);15>E?e="start"===c?.15*-r.height:.15*r.height:165<E&&180>=E&&(e="start"===c?.15*r.height:.15*-r.height);f.attr({align:z});f.translate(e,
    k+B);}h.pos.x=l.x+(u.x||0);h.pos.y=l.y+(a||0);}}}function V(h){this.axis.getPosition&&w(h.pos,this.axis.getPosition(this.pos));}function O(h,f){var b=this.chart,r=this.center;h=this.startAngleRad+h;return {x:b.plotLeft+r[0]+Math.cos(h)*f,y:b.plotTop+r[1]+Math.sin(h)*f}}function G(){this.isDirty=!1;}function A(){this.constructor.prototype.setAxisSize.call(this);if(this.isRadial){this.pane.updateCenter(this);var h=this.center=this.pane.center.slice();if(this.isCircular)this.sector=this.endAngleRad-this.startAngleRad;
    else {var f=this.postTranslate(this.angleRad,h[3]/2);h[0]=f.x-this.chart.plotLeft;h[1]=f.y-this.chart.plotTop;}this.len=this.width=this.height=(h[2]-h[3])*m(this.sector,1)/2;}}function P(){this.constructor.prototype.setAxisTranslation.call(this);this.center&&(this.transA=this.isCircular?(this.endAngleRad-this.startAngleRad)/(this.max-this.min||1):(this.center[2]-this.center[3])/2/(this.max-this.min||1),this.minPixelPadding=this.isXAxis?this.transA*this.minPointOffset:0);}function Q(h){h=this.options=
    g(this.constructor.defaultOptions,this.defaultPolarOptions,c[this.coll],h);h.plotBands||(h.plotBands=[]);b(this,"afterSetOptions");}function W(h,f,b,r,u,g,v){var B=this.axis;B.isRadial?(h=B.getPosition(this.pos,B.center[2]/2+r),f=["M",f,b,"L",h.x,h.y]):f=h.call(this,f,b,r,u,g,v);return f}var N=[],S={gridLineWidth:1,labels:{align:void 0,distance:15,x:0,y:void 0,style:{textOverflow:"none"}},maxPadding:0,minPadding:0,showLastLabel:!1,tickLength:0},R={labels:{align:"center",x:0,y:void 0},minorGridLineWidth:0,
    minorTickInterval:"auto",minorTickLength:10,minorTickPosition:"inside",minorTickWidth:1,tickLength:10,tickPosition:"inside",tickWidth:2,title:{rotation:0},zIndex:2},T={gridLineInterpolation:"circle",gridLineWidth:1,labels:{align:"right",x:-3,y:-2},showLastLabel:!1,title:{x:4,text:null,rotation:90}};a.compose=function(h,f){-1===N.indexOf(h)&&(N.push(h),p(h,"afterInit",L),p(h,"autoLabelAlign",H),p(h,"destroy",K),p(h,"init",C),p(h,"initialAxisTranslation",U));-1===N.indexOf(f)&&(N.push(f),p(f,"afterGetLabelPosition",
    J),p(f,"afterGetPosition",V),q(f.prototype,"getMarkPath",W));return h};})(H||(H={}));return H});A(d,"Series/AreaRange/AreaRangePoint.js",[d["Series/Area/AreaSeries.js"],d["Core/Series/Point.js"],d["Core/Utilities.js"]],function(d,e,l){var a=this&&this.__extends||function(){var a=function(c,k){a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(b,g){b.__proto__=g;}||function(b,g){for(var a in g)g.hasOwnProperty(a)&&(b[a]=g[a]);};return a(c,k)};return function(c,k){function b(){this.constructor=
    c;}a(c,k);c.prototype=null===k?Object.create(k):(b.prototype=k.prototype,new b);}}(),c=e.prototype,t=l.defined,p=l.isNumber;return function(k){function e(){var a=null!==k&&k.apply(this,arguments)||this;a.high=void 0;a.low=void 0;a.options=void 0;a.plotHigh=void 0;a.plotLow=void 0;a.plotHighX=void 0;a.plotLowX=void 0;a.plotX=void 0;a.series=void 0;return a}a(e,k);e.prototype.setState=function(){var a=this.state,b=this.series,g=b.chart.polar;t(this.plotHigh)||(this.plotHigh=b.yAxis.toPixels(this.high,
    !0));t(this.plotLow)||(this.plotLow=this.plotY=b.yAxis.toPixels(this.low,!0));b.stateMarkerGraphic&&(b.lowerStateMarkerGraphic=b.stateMarkerGraphic,b.stateMarkerGraphic=b.upperStateMarkerGraphic);this.graphic=this.upperGraphic;this.plotY=this.plotHigh;g&&(this.plotX=this.plotHighX);c.setState.apply(this,arguments);this.state=a;this.plotY=this.plotLow;this.graphic=this.lowerGraphic;g&&(this.plotX=this.plotLowX);b.stateMarkerGraphic&&(b.upperStateMarkerGraphic=b.stateMarkerGraphic,b.stateMarkerGraphic=
    b.lowerStateMarkerGraphic,b.lowerStateMarkerGraphic=void 0);c.setState.apply(this,arguments);};e.prototype.haloPath=function(){var a=this.series.chart.polar,b=[];this.plotY=this.plotLow;a&&(this.plotX=this.plotLowX);this.isInside&&(b=c.haloPath.apply(this,arguments));this.plotY=this.plotHigh;a&&(this.plotX=this.plotHighX);this.isTopInside&&(b=b.concat(c.haloPath.apply(this,arguments)));return b};e.prototype.isValid=function(){return p(this.low)&&p(this.high)};return e}(d.prototype.pointClass)});A(d,
    "Series/AreaRange/AreaRangeSeries.js",[d["Series/AreaRange/AreaRangePoint.js"],d["Series/Area/AreaSeries.js"],d["Series/Column/ColumnSeries.js"],d["Core/Globals.js"],d["Core/Series/Series.js"],d["Core/Series/SeriesRegistry.js"],d["Core/Utilities.js"]],function(d,e,l,a,c,t,p){var k=this&&this.__extends||function(){var b=function(g,a){b=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(b,f){b.__proto__=f;}||function(b,f){for(var h in f)f.hasOwnProperty(h)&&(b[h]=f[h]);};return b(g,a)};return function(g,
    a){function n(){this.constructor=g;}b(g,a);g.prototype=null===a?Object.create(a):(n.prototype=a.prototype,new n);}}(),x=e.prototype,w=l.prototype;l=a.noop;var b=c.prototype,g=p.defined,m=p.extend,n=p.isArray,q=p.pick,H=p.merge;c=function(a){function c(){var b=null!==a&&a.apply(this,arguments)||this;b.data=void 0;b.options=void 0;b.points=void 0;b.lowerStateMarkerGraphic=void 0;b.xAxis=void 0;return b}k(c,a);c.prototype.toYData=function(b){return [b.low,b.high]};c.prototype.highToXY=function(b){var g=
    this.chart,f=this.xAxis.postTranslate(b.rectPlotX||0,this.yAxis.len-b.plotHigh);b.plotHighX=f.x-g.plotLeft;b.plotHigh=f.y-g.plotTop;b.plotLowX=b.plotX;};c.prototype.translate=function(){var b=this,g=b.yAxis;x.translate.apply(b);b.points.forEach(function(f){var h=f.high,u=f.plotY;f.isNull?f.plotY=null:(f.plotLow=u,f.plotHigh=g.translate(b.dataModify?b.dataModify.modifyValue(h):h,0,1,0,1),b.dataModify&&(f.yBottom=f.plotHigh));});this.chart.polar&&this.points.forEach(function(f){b.highToXY(f);f.tooltipPos=
    [(f.plotHighX+f.plotLowX)/2,(f.plotHigh+f.plotLow)/2];});};c.prototype.getGraphPath=function(b){var g=[],f=[],h,u=x.getGraphPath;var r=this.options;var a=this.chart.polar,v=a&&!1!==r.connectEnds,n=r.connectNulls,c=r.step;b=b||this.points;for(h=b.length;h--;){var m=b[h];var k=a?{plotX:m.rectPlotX,plotY:m.yBottom,doCurve:!1}:{plotX:m.plotX,plotY:m.plotY,doCurve:!1};m.isNull||v||n||b[h+1]&&!b[h+1].isNull||f.push(k);var e={polarPlotY:m.polarPlotY,rectPlotX:m.rectPlotX,yBottom:m.yBottom,plotX:q(m.plotHighX,
    m.plotX),plotY:m.plotHigh,isNull:m.isNull};f.push(e);g.push(e);m.isNull||v||n||b[h-1]&&!b[h-1].isNull||f.push(k);}b=u.call(this,b);c&&(!0===c&&(c="left"),r.step={left:"right",center:"center",right:"left"}[c]);g=u.call(this,g);f=u.call(this,f);r.step=c;r=[].concat(b,g);!this.chart.polar&&f[0]&&"M"===f[0][0]&&(f[0]=["L",f[0][1],f[0][2]]);this.graphPath=r;this.areaPath=b.concat(f);r.isArea=!0;r.xMap=b.xMap;this.areaPath.xMap=b.xMap;return r};c.prototype.drawDataLabels=function(){var g=this.points,a=g.length,
    f,h=[],u=this.options.dataLabels,r,B=this.chart.inverted;if(u){if(n(u)){var v=u[0]||{enabled:!1};var c=u[1]||{enabled:!1};}else v=m({},u),v.x=u.xHigh,v.y=u.yHigh,c=m({},u),c.x=u.xLow,c.y=u.yLow;if(v.enabled||this._hasPointLabels){for(f=a;f--;)if(r=g[f]){var q=v.inside?r.plotHigh<r.plotLow:r.plotHigh>r.plotLow;r.y=r.high;r._plotY=r.plotY;r.plotY=r.plotHigh;h[f]=r.dataLabel;r.dataLabel=r.dataLabelUpper;r.below=q;B?v.align||(v.align=q?"right":"left"):v.verticalAlign||(v.verticalAlign=q?"top":"bottom");}this.options.dataLabels=
    v;b.drawDataLabels&&b.drawDataLabels.apply(this,arguments);for(f=a;f--;)if(r=g[f])r.dataLabelUpper=r.dataLabel,r.dataLabel=h[f],delete r.dataLabels,r.y=r.low,r.plotY=r._plotY;}if(c.enabled||this._hasPointLabels){for(f=a;f--;)if(r=g[f])q=c.inside?r.plotHigh<r.plotLow:r.plotHigh>r.plotLow,r.below=!q,B?c.align||(c.align=q?"left":"right"):c.verticalAlign||(c.verticalAlign=q?"bottom":"top");this.options.dataLabels=c;b.drawDataLabels&&b.drawDataLabels.apply(this,arguments);}if(v.enabled)for(f=a;f--;)if(r=
    g[f])r.dataLabels=[r.dataLabelUpper,r.dataLabel].filter(function(h){return !!h});this.options.dataLabels=u;}};c.prototype.alignDataLabel=function(){w.alignDataLabel.apply(this,arguments);};c.prototype.drawPoints=function(){var a=this.points.length,c;b.drawPoints.apply(this,arguments);for(c=0;c<a;){var f=this.points[c];f.origProps={plotY:f.plotY,plotX:f.plotX,isInside:f.isInside,negative:f.negative,zone:f.zone,y:f.y};f.lowerGraphic=f.graphic;f.graphic=f.upperGraphic;f.plotY=f.plotHigh;g(f.plotHighX)&&
    (f.plotX=f.plotHighX);f.y=q(f.high,f.origProps.y);f.negative=f.y<(this.options.threshold||0);this.zones.length&&(f.zone=f.getZone());this.chart.polar||(f.isInside=f.isTopInside="undefined"!==typeof f.plotY&&0<=f.plotY&&f.plotY<=this.yAxis.len&&0<=f.plotX&&f.plotX<=this.xAxis.len);c++;}b.drawPoints.apply(this,arguments);for(c=0;c<a;)f=this.points[c],f.upperGraphic=f.graphic,f.graphic=f.lowerGraphic,f.origProps&&(m(f,f.origProps),delete f.origProps),c++;};c.defaultOptions=H(e.defaultOptions,{lineWidth:1,
    threshold:null,tooltip:{pointFormat:'<span style="color:{series.color}">\u25cf</span> {series.name}: <b>{point.low}</b> - <b>{point.high}</b><br/>'},trackByArea:!0,dataLabels:{align:void 0,verticalAlign:void 0,xLow:0,xHigh:0,yLow:0,yHigh:0}});return c}(e);m(c.prototype,{pointArrayMap:["low","high"],pointValKey:"low",deferTranslatePolar:!0,pointClass:d,setStackedPoints:l});t.registerSeriesType("arearange",c);return c});A(d,"Series/AreaSplineRange/AreaSplineRangeSeries.js",[d["Series/AreaRange/AreaRangeSeries.js"],
    d["Core/Series/SeriesRegistry.js"],d["Core/Utilities.js"]],function(d,e,l){var a=this&&this.__extends||function(){var a=function(c,k){a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(b,g){b.__proto__=g;}||function(b,g){for(var a in g)g.hasOwnProperty(a)&&(b[a]=g[a]);};return a(c,k)};return function(c,k){function b(){this.constructor=c;}a(c,k);c.prototype=null===k?Object.create(k):(b.prototype=k.prototype,new b);}}(),c=e.seriesTypes.spline,t=l.merge;l=l.extend;var p=function(c){function k(){var a=
    null!==c&&c.apply(this,arguments)||this;a.options=void 0;a.data=void 0;a.points=void 0;return a}a(k,c);k.defaultOptions=t(d.defaultOptions);return k}(d);l(p.prototype,{getPointSpline:c.prototype.getPointSpline});e.registerSeriesType("areasplinerange",p);return p});A(d,"Series/BoxPlot/BoxPlotSeries.js",[d["Series/Column/ColumnSeries.js"],d["Core/Globals.js"],d["Core/Series/SeriesRegistry.js"],d["Core/Utilities.js"]],function(d,e,l,a){var c=this&&this.__extends||function(){var a=function(c,b){a=
    Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(b,a){b.__proto__=a;}||function(b,a){for(var g in a)a.hasOwnProperty(g)&&(b[g]=a[g]);};return a(c,b)};return function(c,b){function g(){this.constructor=c;}a(c,b);c.prototype=null===b?Object.create(b):(g.prototype=b.prototype,new g);}}();e=e.noop;var t=a.extend,p=a.merge,k=a.pick;a=function(a){function e(){var b=null!==a&&a.apply(this,arguments)||this;b.data=void 0;b.options=void 0;b.points=void 0;return b}c(e,a);e.prototype.pointAttribs=
    function(){return {}};e.prototype.translate=function(){var b=this.yAxis,g=this.pointArrayMap;a.prototype.translate.apply(this);this.points.forEach(function(a){g.forEach(function(g){null!==a[g]&&(a[g+"Plot"]=b.translate(a[g],0,1,0,1));});a.plotHigh=a.highPlot;});};e.prototype.drawPoints=function(){var b=this,g=b.options,a=b.chart,c=a.renderer,q,e,l,p,y,z,f=0,h,u,r,B,v=!1!==b.doQuartiles,E,d=b.options.whiskerLength;b.points.forEach(function(n){var m=n.graphic,H=m?"animate":"attr",t=n.shapeArgs,x={},I={},
    w={},L={},M=n.color||b.color;"undefined"!==typeof n.plotY&&(h=Math.round(t.width),u=Math.floor(t.x),r=u+h,B=Math.round(h/2),q=Math.floor(v?n.q1Plot:n.lowPlot),e=Math.floor(v?n.q3Plot:n.lowPlot),l=Math.floor(n.highPlot),p=Math.floor(n.lowPlot),m||(n.graphic=m=c.g("point").add(b.group),n.stem=c.path().addClass("highcharts-boxplot-stem").add(m),d&&(n.whiskers=c.path().addClass("highcharts-boxplot-whisker").add(m)),v&&(n.box=c.path(void 0).addClass("highcharts-boxplot-box").add(m)),n.medianShape=c.path(void 0).addClass("highcharts-boxplot-median").add(m)),
    a.styledMode||(I.stroke=n.stemColor||g.stemColor||M,I["stroke-width"]=k(n.stemWidth,g.stemWidth,g.lineWidth),I.dashstyle=n.stemDashStyle||g.stemDashStyle||g.dashStyle,n.stem.attr(I),d&&(w.stroke=n.whiskerColor||g.whiskerColor||M,w["stroke-width"]=k(n.whiskerWidth,g.whiskerWidth,g.lineWidth),w.dashstyle=n.whiskerDashStyle||g.whiskerDashStyle||g.dashStyle,n.whiskers.attr(w)),v&&(x.fill=n.fillColor||g.fillColor||M,x.stroke=g.lineColor||M,x["stroke-width"]=g.lineWidth||0,x.dashstyle=n.boxDashStyle||g.boxDashStyle||
    g.dashStyle,n.box.attr(x)),L.stroke=n.medianColor||g.medianColor||M,L["stroke-width"]=k(n.medianWidth,g.medianWidth,g.lineWidth),L.dashstyle=n.medianDashStyle||g.medianDashStyle||g.dashStyle,n.medianShape.attr(L)),z=n.stem.strokeWidth()%2/2,f=u+B+z,m=[["M",f,e],["L",f,l],["M",f,q],["L",f,p]],n.stem[H]({d:m}),v&&(z=n.box.strokeWidth()%2/2,q=Math.floor(q)+z,e=Math.floor(e)+z,u+=z,r+=z,m=[["M",u,e],["L",u,q],["L",r,q],["L",r,e],["L",u,e],["Z"]],n.box[H]({d:m})),d&&(z=n.whiskers.strokeWidth()%2/2,l+=
    z,p+=z,E=/%$/.test(d)?B*parseFloat(d)/100:d/2,m=[["M",f-E,l],["L",f+E,l],["M",f-E,p],["L",f+E,p]],n.whiskers[H]({d:m})),y=Math.round(n.medianPlot),z=n.medianShape.strokeWidth()%2/2,y+=z,m=[["M",u,y],["L",r,y]],n.medianShape[H]({d:m}));});};e.prototype.toYData=function(b){return [b.low,b.q1,b.median,b.q3,b.high]};e.defaultOptions=p(d.defaultOptions,{threshold:null,tooltip:{pointFormat:'<span style="color:{point.color}">\u25cf</span> <b> {series.name}</b><br/>Maximum: {point.high}<br/>Upper quartile: {point.q3}<br/>Median: {point.median}<br/>Lower quartile: {point.q1}<br/>Minimum: {point.low}<br/>'},
    whiskerLength:"50%",fillColor:"#ffffff",lineWidth:1,medianWidth:2,whiskerWidth:2});return e}(d);t(a.prototype,{pointArrayMap:["low","q1","median","q3","high"],pointValKey:"high",drawDataLabels:e,setStackedPoints:e});l.registerSeriesType("boxplot",a);return a});A(d,"Series/Bubble/BubbleLegendDefaults.js",[],function(){return {borderColor:void 0,borderWidth:2,className:void 0,color:void 0,connectorClassName:void 0,connectorColor:void 0,connectorDistance:60,connectorWidth:1,enabled:!1,labels:{className:void 0,
    allowOverlap:!1,format:"",formatter:void 0,align:"right",style:{fontSize:"10px",color:"#000000"},x:0,y:0},maxSize:60,minSize:10,legendIndex:0,ranges:{value:void 0,borderColor:void 0,color:void 0,connectorColor:void 0},sizeBy:"area",sizeByAbsoluteValue:!1,zIndex:1,zThreshold:0}});A(d,"Series/Bubble/BubbleLegendItem.js",[d["Core/Color/Color.js"],d["Core/FormatUtilities.js"],d["Core/Globals.js"],d["Core/Utilities.js"]],function(d,e,l,a){var c=d.parse,t=l.noop,p=a.arrayMax,k=a.arrayMin,x=a.isNumber,w=
    a.merge,b=a.pick,g=a.stableSort;return function(){function a(b,a){this.options=this.symbols=this.visible=this.selected=this.ranges=this.movementX=this.maxLabel=this.legendSymbol=this.legendItemWidth=this.legendItemHeight=this.legendItem=this.legendGroup=this.legend=this.fontMetrics=this.chart=void 0;this.setState=t;this.init(b,a);}a.prototype.init=function(b,a){this.options=b;this.visible=!0;this.chart=a.chart;this.legend=a;};a.prototype.addToLegend=function(b){b.splice(this.options.legendIndex,
    0,this);};a.prototype.drawLegendSymbol=function(a){var c=this.chart,n=this.options,e=b(a.options.itemDistance,20),k=n.ranges,m=n.connectorDistance;this.fontMetrics=c.renderer.fontMetrics(n.labels.style.fontSize);k&&k.length&&x(k[0].value)?(g(k,function(b,f){return f.value-b.value}),this.ranges=k,this.setOptions(),this.render(),a=this.getMaxLabelSize(),k=this.ranges[0].radius,c=2*k,m=m-k+a.width,m=0<m?m:0,this.maxLabel=a,this.movementX="left"===n.labels.align?m:0,this.legendItemWidth=c+m+e,this.legendItemHeight=
    c+this.fontMetrics.h/2):a.options.bubbleLegend.autoRanges=!0;};a.prototype.setOptions=function(){var a=this.ranges,g=this.options,k=this.chart.series[g.seriesIndex],e=this.legend.baseline,m={zIndex:g.zIndex,"stroke-width":g.borderWidth},l={zIndex:g.zIndex,"stroke-width":g.connectorWidth},z={align:this.legend.options.rtl||"left"===g.labels.align?"right":"left",zIndex:g.zIndex},f=k.options.marker.fillOpacity,h=this.chart.styledMode;a.forEach(function(u,r){h||(m.stroke=b(u.borderColor,g.borderColor,k.color),
    m.fill=b(u.color,g.color,1!==f?c(k.color).setOpacity(f).get("rgba"):k.color),l.stroke=b(u.connectorColor,g.connectorColor,k.color));a[r].radius=this.getRangeRadius(u.value);a[r]=w(a[r],{center:a[0].radius-a[r].radius+e});h||w(!0,a[r],{bubbleAttribs:w(m),connectorAttribs:w(l),labelAttribs:z});},this);};a.prototype.getRangeRadius=function(b){var a=this.options;return this.chart.series[this.options.seriesIndex].getRadius.call(this,a.ranges[a.ranges.length-1].value,a.ranges[0].value,a.minSize,a.maxSize,
    b)};a.prototype.render=function(){var b=this.chart.renderer,a=this.options.zThreshold;this.symbols||(this.symbols={connectors:[],bubbleItems:[],labels:[]});this.legendSymbol=b.g("bubble-legend");this.legendItem=b.g("bubble-legend-item");this.legendSymbol.translateX=0;this.legendSymbol.translateY=0;this.ranges.forEach(function(b){b.value>=a&&this.renderRange(b);},this);this.legendSymbol.add(this.legendItem);this.legendItem.add(this.legendGroup);this.hideOverlappingLabels();};a.prototype.renderRange=
    function(b){var a=this.options,g=a.labels,c=this.chart,n=c.series[a.seriesIndex],k=c.renderer,e=this.symbols;c=e.labels;var f=b.center,h=Math.abs(b.radius),u=a.connectorDistance||0,r=g.align,B=a.connectorWidth,v=this.ranges[0].radius||0,m=f-h-a.borderWidth/2+B/2,l=this.fontMetrics;l=l.f/2-(l.h-l.f)/2;var d=k.styledMode;u=this.legend.options.rtl||"left"===r?-u:u;"center"===r&&(u=0,a.connectorDistance=0,b.labelAttribs.align="center");r=m+a.labels.y;var p=v+u+a.labels.x;e.bubbleItems.push(k.circle(v,
    f+((m%1?1:.5)-(B%2?0:.5)),h).attr(d?{}:b.bubbleAttribs).addClass((d?"highcharts-color-"+n.colorIndex+" ":"")+"highcharts-bubble-legend-symbol "+(a.className||"")).add(this.legendSymbol));e.connectors.push(k.path(k.crispLine([["M",v,m],["L",v+u,m]],a.connectorWidth)).attr(d?{}:b.connectorAttribs).addClass((d?"highcharts-color-"+this.options.seriesIndex+" ":"")+"highcharts-bubble-legend-connectors "+(a.connectorClassName||"")).add(this.legendSymbol));b=k.text(this.formatLabel(b),p,r+l).attr(d?{}:b.labelAttribs).css(d?
    {}:g.style).addClass("highcharts-bubble-legend-labels "+(a.labels.className||"")).add(this.legendSymbol);c.push(b);b.placed=!0;b.alignAttr={x:p,y:r+l};};a.prototype.getMaxLabelSize=function(){var b,a;this.symbols.labels.forEach(function(g){a=g.getBBox(!0);b=b?a.width>b.width?a:b:a;});return b||{}};a.prototype.formatLabel=function(b){var a=this.options,g=a.labels.formatter;a=a.labels.format;var c=this.chart.numberFormatter;return a?e.format(a,b):g?g.call(b):c(b.value,1)};a.prototype.hideOverlappingLabels=
    function(){var b=this.chart,a=this.symbols;!this.options.labels.allowOverlap&&a&&(b.hideOverlappingLabels(a.labels),a.labels.forEach(function(b,g){b.newOpacity?b.newOpacity!==b.oldOpacity&&a.connectors[g].show():a.connectors[g].hide();}));};a.prototype.getRanges=function(){var a=this.legend.bubbleLegend,g=a.options.ranges,c,e=Number.MAX_VALUE,m=-Number.MAX_VALUE;a.chart.series.forEach(function(a){a.isBubble&&!a.ignoreSeries&&(c=a.zData.filter(x),c.length&&(e=b(a.options.zMin,Math.min(e,Math.max(k(c),
    !1===a.options.displayNegative?a.options.zThreshold:-Number.MAX_VALUE))),m=b(a.options.zMax,Math.max(m,p(c)))));});var l=e===m?[{value:m}]:[{value:e},{value:(e+m)/2},{value:m,autoRanges:!0}];g.length&&g[0].radius&&l.reverse();l.forEach(function(b,f){g&&g[f]&&(l[f]=w(g[f],b));});return l};a.prototype.predictBubbleSizes=function(){var b=this.chart,a=this.fontMetrics,g=b.legend.options,c=g.floating,k=(g="horizontal"===g.layout)?b.legend.lastLineHeight:0,e=b.plotSizeX,m=b.plotSizeY,f=b.series[this.options.seriesIndex],
    h=f.getPxExtremes();b=Math.ceil(h.minPxSize);h=Math.ceil(h.maxPxSize);var u=Math.min(m,e);f=f.options.maxSize;if(c||!/%$/.test(f))a=h;else if(f=parseFloat(f),a=(u+k-a.h/2)*f/100/(f/100+1),g&&m-a>=e||!g&&e-a>=m)a=h;return [b,Math.ceil(a)]};a.prototype.updateRanges=function(b,a){var g=this.legend.options.bubbleLegend;g.minSize=b;g.maxSize=a;g.ranges=this.getRanges();};a.prototype.correctSizes=function(){var b=this.legend,a=this.chart.series[this.options.seriesIndex].getPxExtremes();1<Math.abs(Math.ceil(a.maxPxSize)-
    this.options.maxSize)&&(this.updateRanges(this.options.minSize,a.maxPxSize),b.render());};return a}()});A(d,"Series/Bubble/BubbleLegendComposition.js",[d["Series/Bubble/BubbleLegendDefaults.js"],d["Series/Bubble/BubbleLegendItem.js"],d["Core/DefaultOptions.js"],d["Core/Utilities.js"]],function(d,e,l,a){var c=l.setOptions,t=a.addEvent,p=a.objectEach,k=a.wrap,x;(function(a){function b(b,a,c){var f=this.legend,h=0<=g(this);if(f&&f.options.enabled&&f.bubbleLegend&&f.options.bubbleLegend.autoRanges&&h){var u=
    f.bubbleLegend.options;h=f.bubbleLegend.predictBubbleSizes();f.bubbleLegend.updateRanges(h[0],h[1]);u.placed||(f.group.placed=!1,f.allItems.forEach(function(h){h.legendGroup.translateY=null;}));f.render();this.getMargins();this.axes.forEach(function(h){h.visible&&h.render();u.placed||(h.setScale(),h.updateNames(),p(h.ticks,function(h){h.isNew=!0;h.isNewLabel=!0;}));});u.placed=!0;this.getMargins();b.call(this,a,c);f.bubbleLegend.correctSizes();x(f,m(f));}else b.call(this,a,c),f&&f.options.enabled&&f.bubbleLegend&&
    (f.render(),x(f,m(f)));}function g(b){b=b.series;for(var a=0;a<b.length;){if(b[a]&&b[a].isBubble&&b[a].visible&&b[a].zData.length)return a;a++;}return -1}function m(b){b=b.allItems;var a=[],g=b.length,f,h=0;for(f=0;f<g;f++)if(b[f].legendItemHeight&&(b[f].itemHeight=b[f].legendItemHeight),b[f]===b[g-1]||b[f+1]&&b[f]._legendItemPos[1]!==b[f+1]._legendItemPos[1]){a.push({height:0});var u=a[a.length-1];for(h;h<=f;h++)b[h].itemHeight>u.height&&(u.height=b[h].itemHeight);u.step=f;}return a}function n(b){var a=
    this.bubbleLegend,c=this.options,f=c.bubbleLegend,h=g(this.chart);a&&a.ranges&&a.ranges.length&&(f.ranges.length&&(f.autoRanges=!!f.ranges[0].autoRanges),this.destroyItem(a));0<=h&&c.enabled&&f.enabled&&(f.seriesIndex=h,this.bubbleLegend=new e(f,this),this.bubbleLegend.addToLegend(b.allItems));}function l(){var b=this.chart,a=this.visible,c=this.chart.legend;c&&c.bubbleLegend&&(this.visible=!a,this.ignoreSeries=a,b=0<=g(b),c.bubbleLegend.visible!==b&&(c.update({bubbleLegend:{enabled:b}}),c.bubbleLegend.visible=
    b),this.visible=a);}function x(b,a){var g=b.options.rtl,f,h,u,r=0;b.allItems.forEach(function(b,c){f=b.legendGroup.translateX;h=b._legendItemPos[1];if((u=b.movementX)||g&&b.ranges)u=g?f-b.options.maxSize/2:f+u,b.legendGroup.attr({translateX:u});c>a[r].step&&r++;b.legendGroup.attr({translateY:Math.round(h+a[r].height/2)});b._legendItemPos[1]=h+a[r].height/2;});}var w=[];a.compose=function(a,g,e){-1===w.indexOf(a)&&(w.push(a),c({legend:{bubbleLegend:d}}),k(a.prototype,"drawChartBox",b));-1===w.indexOf(g)&&
    (w.push(g),t(g,"afterGetAllItems",n));-1===w.indexOf(e)&&(w.push(e),t(e,"legendItemClick",l));};})(x||(x={}));return x});A(d,"Series/Bubble/BubblePoint.js",[d["Core/Series/Point.js"],d["Core/Series/SeriesRegistry.js"],d["Core/Utilities.js"]],function(d,e,l){var a=this&&this.__extends||function(){var a=function(c,e){a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(a,c){a.__proto__=c;}||function(a,c){for(var e in c)c.hasOwnProperty(e)&&(a[e]=c[e]);};return a(c,e)};return function(c,e){function k(){this.constructor=
    c;}a(c,e);c.prototype=null===e?Object.create(e):(k.prototype=e.prototype,new k);}}();l=l.extend;e=function(c){function e(){var a=null!==c&&c.apply(this,arguments)||this;a.options=void 0;a.series=void 0;return a}a(e,c);e.prototype.haloPath=function(a){return d.prototype.haloPath.call(this,0===a?0:(this.marker?this.marker.radius||0:0)+a)};return e}(e.seriesTypes.scatter.prototype.pointClass);l(e.prototype,{ttBelow:!1});return e});A(d,"Series/Bubble/BubbleSeries.js",[d["Core/Axis/Axis.js"],d["Series/Bubble/BubbleLegendComposition.js"],
    d["Series/Bubble/BubblePoint.js"],d["Core/Color/Color.js"],d["Core/Globals.js"],d["Core/Series/Series.js"],d["Core/Series/SeriesRegistry.js"],d["Core/Utilities.js"]],function(d,e,l,a,c,t,p,k){var x=this&&this.__extends||function(){var b=function(f,h){b=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(b,h){b.__proto__=h;}||function(b,h){for(var f in h)h.hasOwnProperty(f)&&(b[f]=h[f]);};return b(f,h)};return function(f,h){function a(){this.constructor=f;}b(f,h);f.prototype=null===h?Object.create(h):
    (a.prototype=h.prototype,new a);}}(),w=a.parse;a=c.noop;var b=p.seriesTypes;c=b.column;var g=b.scatter;b=k.addEvent;var m=k.arrayMax,n=k.arrayMin,q=k.clamp,H=k.extend,K=k.isNumber,I=k.merge,y=k.pick;k=function(b){function f(){var h=null!==b&&b.apply(this,arguments)||this;h.data=void 0;h.maxPxSize=void 0;h.minPxSize=void 0;h.options=void 0;h.points=void 0;h.radii=void 0;h.yData=void 0;h.zData=void 0;return h}x(f,b);f.prototype.animate=function(b){!b&&this.points.length<this.options.animationLimit&&
    this.points.forEach(function(b){var h=b.graphic;h&&h.width&&(this.hasRendered||h.attr({x:b.plotX,y:b.plotY,width:1,height:1}),h.animate(this.markerAttribs(b),this.options.animation));},this);};f.prototype.getRadii=function(){var b=this,f=this.zData,a=this.yData,g=[],c=this.chart.bubbleZExtremes;var e=this.getPxExtremes();var m=e.minPxSize,k=e.maxPxSize;if(!c){var n=Number.MAX_VALUE,l=-Number.MAX_VALUE,d;this.chart.series.forEach(function(h){h.bubblePadding&&(h.visible||!b.chart.options.chart.ignoreHiddenSeries)&&
    (h=h.getZExtremes())&&(n=Math.min(n||h.zMin,h.zMin),l=Math.max(l||h.zMax,h.zMax),d=!0);});d?(c={zMin:n,zMax:l},this.chart.bubbleZExtremes=c):c={zMin:0,zMax:0};}var p=0;for(e=f.length;p<e;p++){var q=f[p];g.push(this.getRadius(c.zMin,c.zMax,m,k,q,a[p]));}this.radii=g;};f.prototype.getRadius=function(b,f,a,g,c,e){var h=this.options,r="width"!==h.sizeBy,u=h.zThreshold,v=f-b,m=.5;if(null===e||null===c)return null;if(K(c)){h.sizeByAbsoluteValue&&(c=Math.abs(c-u),v=Math.max(f-u,Math.abs(b-u)),b=0);if(c<b)return a/
    2-1;0<v&&(m=(c-b)/v);}r&&0<=m&&(m=Math.sqrt(m));return Math.ceil(a+m*(g-a))/2};f.prototype.hasData=function(){return !!this.processedXData.length};f.prototype.pointAttribs=function(b,f){var h=this.options.marker.fillOpacity;b=t.prototype.pointAttribs.call(this,b,f);1!==h&&(b.fill=w(b.fill).setOpacity(h).get("rgba"));return b};f.prototype.translate=function(){b.prototype.translate.call(this);this.getRadii();this.translateBubble();};f.prototype.translateBubble=function(){for(var b=this.data,f=this.radii,
    a=this.getPxExtremes().minPxSize,g=b.length;g--;){var c=b[g],e=f?f[g]:0;K(e)&&e>=a/2?(c.marker=H(c.marker,{radius:e,width:2*e,height:2*e}),c.dlBox={x:c.plotX-e,y:c.plotY-e,width:2*e,height:2*e}):c.shapeArgs=c.plotY=c.dlBox=void 0;}};f.prototype.getPxExtremes=function(){var b=Math.min(this.chart.plotWidth,this.chart.plotHeight),f=function(h){if("string"===typeof h){var f=/%$/.test(h);h=parseInt(h,10);}return f?b*h/100:h},a=f(y(this.options.minSize,8));f=Math.max(f(y(this.options.maxSize,"20%")),a);return {minPxSize:a,
    maxPxSize:f}};f.prototype.getZExtremes=function(){var b=this.options,f=(this.zData||[]).filter(K);if(f.length){var a=y(b.zMin,q(n(f),!1===b.displayNegative?b.zThreshold||0:-Number.MAX_VALUE,Number.MAX_VALUE));b=y(b.zMax,m(f));if(K(a)&&K(b))return {zMin:a,zMax:b}}};f.compose=e.compose;f.defaultOptions=I(g.defaultOptions,{dataLabels:{formatter:function(){var b=this.series.chart.numberFormatter,f=this.point.z;return K(f)?b(f,-1):""},inside:!0,verticalAlign:"middle"},animationLimit:250,marker:{lineColor:null,
    lineWidth:1,fillOpacity:.5,radius:null,states:{hover:{radiusPlus:0}},symbol:"circle"},minSize:8,maxSize:"20%",softThreshold:!1,states:{hover:{halo:{size:5}}},tooltip:{pointFormat:"({point.x}, {point.y}), Size: {point.z}"},turboThreshold:0,zThreshold:0,zoneAxis:"z"});return f}(g);H(k.prototype,{alignDataLabel:c.prototype.alignDataLabel,applyZones:a,bubblePadding:!0,buildKDTree:a,directTouch:!0,isBubble:!0,pointArrayMap:["y","z"],pointClass:l,parallelArrays:["x","y","z"],trackerGroups:["group","dataLabelsGroup"],
    specialGroup:"group",zoneAxis:"z"});b(k,"updatedData",function(b){delete b.target.chart.bubbleZExtremes;});d.prototype.beforePadding=function(){var b=this,f=this.len,h=this.chart,a=0,g=f,c=this.isXAxis,v=c?"xData":"yData",e=this.min,m=this.max-e,k=f/m,n;this.series.forEach(function(f){if(f.bubblePadding&&(f.visible||!h.options.chart.ignoreHiddenSeries)){n=b.allowZoomOutside=!0;var r=f[v];c&&f.getRadii(0,0,f);if(0<m)for(var u=r.length;u--;)if(K(r[u])&&b.dataMin<=r[u]&&r[u]<=b.max){var B=f.radii&&f.radii[u]||
    0;a=Math.min((r[u]-e)*k-B,a);g=Math.max((r[u]-e)*k+B,g);}}});n&&0<m&&!this.logarithmic&&(g-=f,k*=(f+Math.max(0,a)-Math.min(g,f))/f,[["min","userMin",a],["max","userMax",g]].forEach(function(h){"undefined"===typeof y(b.options[h[0]],b[h[1]])&&(b[h[0]]+=h[2]/k);}));};p.registerSeriesType("bubble",k);return k});A(d,"Series/ColumnRange/ColumnRangePoint.js",[d["Core/Series/SeriesRegistry.js"],d["Core/Utilities.js"]],function(d,e){var l=this&&this.__extends||function(){var a=function(c,e){a=Object.setPrototypeOf||
    {__proto__:[]}instanceof Array&&function(a,b){a.__proto__=b;}||function(a,b){for(var g in b)b.hasOwnProperty(g)&&(a[g]=b[g]);};return a(c,e)};return function(c,e){function k(){this.constructor=c;}a(c,e);c.prototype=null===e?Object.create(e):(k.prototype=e.prototype,new k);}}(),a=d.seriesTypes;d=a.column.prototype.pointClass;var c=e.extend,t=e.isNumber;e=function(a){function c(){var c=null!==a&&a.apply(this,arguments)||this;c.series=void 0;c.options=void 0;c.barX=void 0;c.pointWidth=void 0;c.shapeType=
    void 0;return c}l(c,a);c.prototype.isValid=function(){return t(this.low)};return c}(a.arearange.prototype.pointClass);c(e.prototype,{setState:d.prototype.setState});return e});A(d,"Series/ColumnRange/ColumnRangeSeries.js",[d["Series/ColumnRange/ColumnRangePoint.js"],d["Core/Globals.js"],d["Core/Series/SeriesRegistry.js"],d["Core/Utilities.js"]],function(d,e,l,a){var c=this&&this.__extends||function(){var b=function(a,g){b=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(b,a){b.__proto__=
    a;}||function(b,a){for(var g in a)a.hasOwnProperty(g)&&(b[g]=a[g]);};return b(a,g)};return function(a,g){function c(){this.constructor=a;}b(a,g);a.prototype=null===g?Object.create(g):(c.prototype=g.prototype,new c);}}();e=e.noop;var t=l.seriesTypes,p=t.arearange,k=t.column,x=k.prototype,w=p.prototype,b=a.clamp,g=a.merge,m=a.pick;a=a.extend;var n={pointRange:null,marker:null,states:{hover:{halo:!1}}};t=function(a){function e(){var b=null!==a&&a.apply(this,arguments)||this;b.data=void 0;b.points=void 0;
    b.options=void 0;return b}c(e,a);e.prototype.setOptions=function(){g(!0,arguments[0],{stacking:void 0});return w.setOptions.apply(this,arguments)};e.prototype.translate=function(){var a=this,g=a.yAxis,c=a.xAxis,e=c.startAngleRad,f,h=a.chart,u=a.xAxis.isRadial,r=Math.max(h.chartWidth,h.chartHeight)+999,k;x.translate.apply(a);a.points.forEach(function(v){var n=v.shapeArgs||{},B=a.options.minPointLength;v.plotHigh=k=b(g.translate(v.high,0,1,0,1),-r,r);v.plotLow=b(v.plotY,-r,r);var l=k;var d=m(v.rectPlotY,
    v.plotY)-k;Math.abs(d)<B?(B-=d,d+=B,l-=B/2):0>d&&(d*=-1,l-=d);u?(f=v.barX+e,v.shapeType="arc",v.shapeArgs=a.polarArc(l+d,l,f,f+v.pointWidth)):(n.height=d,n.y=l,B=n.x,B=void 0===B?0:B,n=n.width,n=void 0===n?0:n,v.tooltipPos=h.inverted?[g.len+g.pos-h.plotLeft-l-d/2,c.len+c.pos-h.plotTop-B-n/2,d]:[c.left-h.plotLeft+B+n/2,g.pos-h.plotTop+l+d/2,d]);});};e.prototype.crispCol=function(){return x.crispCol.apply(this,arguments)};e.prototype.drawPoints=function(){return x.drawPoints.apply(this,arguments)};e.prototype.drawTracker=
    function(){return x.drawTracker.apply(this,arguments)};e.prototype.getColumnMetrics=function(){return x.getColumnMetrics.apply(this,arguments)};e.prototype.pointAttribs=function(){return x.pointAttribs.apply(this,arguments)};e.prototype.adjustForMissingColumns=function(){return x.adjustForMissingColumns.apply(this,arguments)};e.prototype.animate=function(){return x.animate.apply(this,arguments)};e.prototype.translate3dPoints=function(){return x.translate3dPoints.apply(this,arguments)};e.prototype.translate3dShapes=
    function(){return x.translate3dShapes.apply(this,arguments)};e.defaultOptions=g(k.defaultOptions,p.defaultOptions,n);return e}(p);a(t.prototype,{directTouch:!0,trackerGroups:["group","dataLabelsGroup"],drawGraph:e,getSymbol:e,polarArc:function(){return x.polarArc.apply(this,arguments)},pointClass:d});l.registerSeriesType("columnrange",t);return t});A(d,"Series/ColumnPyramid/ColumnPyramidSeries.js",[d["Series/Column/ColumnSeries.js"],d["Core/Series/SeriesRegistry.js"],d["Core/Utilities.js"]],function(d,
    e,l){var a=this&&this.__extends||function(){var a=function(c,b){a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(b,a){b.__proto__=a;}||function(b,a){for(var g in a)a.hasOwnProperty(g)&&(b[g]=a[g]);};return a(c,b)};return function(c,b){function g(){this.constructor=c;}a(c,b);c.prototype=null===b?Object.create(b):(g.prototype=b.prototype,new g);}}(),c=d.prototype,t=l.clamp,p=l.merge,k=l.pick;l=function(e){function l(){var b=null!==e&&e.apply(this,arguments)||this;b.data=void 0;b.options=
    void 0;b.points=void 0;return b}a(l,e);l.prototype.translate=function(){var b=this,a=b.chart,e=b.options,n=b.dense=2>b.closestPointRange*b.xAxis.transA;n=b.borderWidth=k(e.borderWidth,n?0:1);var d=b.yAxis,l=e.threshold,p=b.translatedThreshold=d.getThreshold(l),x=k(e.minPointLength,5),w=b.getColumnMetrics(),z=w.width,f=b.barW=Math.max(z,1+2*n),h=b.pointXOffset=w.offset;a.inverted&&(p-=.5);e.pointPadding&&(f=Math.ceil(f));c.translate.apply(b);b.points.forEach(function(g){var c=k(g.yBottom,p),u=999+
    Math.abs(c),v=t(g.plotY,-u,d.len+u);u=g.plotX+h;var m=f/2,n=Math.min(v,c);c=Math.max(v,c)-n;var q;g.barX=u;g.pointWidth=z;g.tooltipPos=a.inverted?[d.len+d.pos-a.plotLeft-v,b.xAxis.len-u-m,c]:[u+m,v+d.pos-a.plotTop,c];v=l+(g.total||g.y);"percent"===e.stacking&&(v=l+(0>g.y)?-100:100);v=d.toPixels(v,!0);var w=(q=a.plotHeight-v-(a.plotHeight-p))?m*(n-v)/q:0;var y=q?m*(n+c-v)/q:0;q=u-w+m;w=u+w+m;var C=u+y+m;y=u-y+m;var H=n-x;var D=n+c;0>g.y&&(H=n,D=n+c+x);a.inverted&&(C=d.width-n,q=v-(d.width-p),w=m*(v-
    C)/q,y=m*(v-(C-c))/q,q=u+m+w,w=q-2*w,C=u-y+m,y=u+y+m,H=n,D=n+c-x,0>g.y&&(D=n+c+x));g.shapeType="path";g.shapeArgs={x:q,y:H,width:w-q,height:c,d:[["M",q,H],["L",w,H],["L",C,D],["L",y,D],["Z"]]};});};l.defaultOptions=p(d.defaultOptions,{});return l}(d);e.registerSeriesType("columnpyramid",l);return l});A(d,"Series/ErrorBar/ErrorBarSeries.js",[d["Series/BoxPlot/BoxPlotSeries.js"],d["Series/Column/ColumnSeries.js"],d["Core/Series/SeriesRegistry.js"],d["Core/Utilities.js"]],function(d,e,l,a){var c=this&&
    this.__extends||function(){var a=function(c,b){a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(b,a){b.__proto__=a;}||function(b,a){for(var g in a)a.hasOwnProperty(g)&&(b[g]=a[g]);};return a(c,b)};return function(c,b){function g(){this.constructor=c;}a(c,b);c.prototype=null===b?Object.create(b):(g.prototype=b.prototype,new g);}}(),t=l.seriesTypes.arearange,p=a.merge;a=a.extend;var k=function(a){function k(){var b=null!==a&&a.apply(this,arguments)||this;b.data=void 0;b.options=void 0;
    b.points=void 0;return b}c(k,a);k.prototype.getColumnMetrics=function(){return this.linkedParent&&this.linkedParent.columnMetrics||e.prototype.getColumnMetrics.call(this)};k.prototype.drawDataLabels=function(){var b=this.pointValKey;t&&(t.prototype.drawDataLabels.call(this),this.data.forEach(function(a){a.y=a[b];}));};k.prototype.toYData=function(b){return [b.low,b.high]};k.defaultOptions=p(d.defaultOptions,{color:"#000000",grouping:!1,linkedTo:":previous",tooltip:{pointFormat:'<span style="color:{point.color}">\u25cf</span> {series.name}: <b>{point.low}</b> - <b>{point.high}</b><br/>'},
    whiskerWidth:null});return k}(d);a(k.prototype,{pointArrayMap:["low","high"],pointValKey:"high",doQuartiles:!1});l.registerSeriesType("errorbar",k);return k});A(d,"Series/Gauge/GaugePoint.js",[d["Core/Series/SeriesRegistry.js"]],function(d){var e=this&&this.__extends||function(){var e=function(a,c){e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(a,c){a.__proto__=c;}||function(a,c){for(var e in c)c.hasOwnProperty(e)&&(a[e]=c[e]);};return e(a,c)};return function(a,c){function d(){this.constructor=
    a;}e(a,c);a.prototype=null===c?Object.create(c):(d.prototype=c.prototype,new d);}}();return function(d){function a(){var a=null!==d&&d.apply(this,arguments)||this;a.options=void 0;a.series=void 0;a.shapeArgs=void 0;return a}e(a,d);a.prototype.setState=function(a){this.state=a;};return a}(d.series.prototype.pointClass)});A(d,"Series/Gauge/GaugeSeries.js",[d["Series/Gauge/GaugePoint.js"],d["Core/Globals.js"],d["Core/Series/SeriesRegistry.js"],d["Core/Utilities.js"]],function(d,e,l,a){var c=this&&this.__extends||
    function(){var b=function(a,g){b=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(b,a){b.__proto__=a;}||function(b,a){for(var g in a)a.hasOwnProperty(g)&&(b[g]=a[g]);};return b(a,g)};return function(a,g){function c(){this.constructor=a;}b(a,g);a.prototype=null===g?Object.create(g):(c.prototype=g.prototype,new c);}}();e=e.noop;var t=l.series,p=l.seriesTypes.column,k=a.clamp,x=a.isNumber,w=a.extend,b=a.merge,g=a.pick,m=a.pInt;a=function(a){function e(){var b=null!==a&&a.apply(this,arguments)||
    this;b.data=void 0;b.points=void 0;b.options=void 0;b.yAxis=void 0;return b}c(e,a);e.prototype.translate=function(){var a=this.yAxis,c=this.options,e=a.center;this.generatePoints();this.points.forEach(function(d){var n=b(c.dial,d.dial),f=m(g(n.radius,"80%"))*e[2]/200,h=m(g(n.baseLength,"70%"))*f/100,u=m(g(n.rearLength,"10%"))*f/100,r=n.baseWidth||3,l=n.topWidth||1,v=c.overshoot,p=a.startAngleRad+a.translate(d.y,null,null,null,!0);if(x(v)||!1===c.wrap)v=x(v)?v/180*Math.PI:0,p=k(p,a.startAngleRad-v,
    a.endAngleRad+v);p=180*p/Math.PI;d.shapeType="path";d.shapeArgs={d:n.path||[["M",-u,-r/2],["L",h,-r/2],["L",f,-l/2],["L",f,l/2],["L",h,r/2],["L",-u,r/2],["Z"]],translateX:e[0],translateY:e[1],rotation:p};d.plotX=e[0];d.plotY=e[1];});};e.prototype.drawPoints=function(){var a=this,c=a.chart,e=a.yAxis.center,d=a.pivot,m=a.options,f=m.pivot,h=c.renderer;a.points.forEach(function(f){var g=f.graphic,e=f.shapeArgs,u=e.d,d=b(m.dial,f.dial);g?(g.animate(e),e.d=u):f.graphic=h[f.shapeType](e).attr({rotation:e.rotation,
    zIndex:1}).addClass("highcharts-dial").add(a.group);if(!c.styledMode)f.graphic[g?"animate":"attr"]({stroke:d.borderColor||"none","stroke-width":d.borderWidth||0,fill:d.backgroundColor||"#000000"});});d?d.animate({translateX:e[0],translateY:e[1]}):(a.pivot=h.circle(0,0,g(f.radius,5)).attr({zIndex:2}).addClass("highcharts-pivot").translate(e[0],e[1]).add(a.group),c.styledMode||a.pivot.attr({"stroke-width":f.borderWidth||0,stroke:f.borderColor||"#cccccc",fill:f.backgroundColor||"#000000"}));};e.prototype.animate=
    function(b){var a=this;b||a.points.forEach(function(b){var g=b.graphic;g&&(g.attr({rotation:180*a.yAxis.startAngleRad/Math.PI}),g.animate({rotation:b.shapeArgs.rotation},a.options.animation));});};e.prototype.render=function(){this.group=this.plotGroup("group","series",this.visible?"visible":"hidden",this.options.zIndex,this.chart.seriesGroup);t.prototype.render.call(this);this.group.clip(this.chart.clipRect);};e.prototype.setData=function(b,a){t.prototype.setData.call(this,b,!1);this.processData();
    this.generatePoints();g(a,!0)&&this.chart.redraw();};e.prototype.hasData=function(){return !!this.points.length};e.defaultOptions=b(t.defaultOptions,{dataLabels:{borderColor:"#cccccc",borderRadius:3,borderWidth:1,crop:!1,defer:!1,enabled:!0,verticalAlign:"top",y:15,zIndex:2},dial:{},pivot:{},tooltip:{headerFormat:""},showInLegend:!1});return e}(t);w(a.prototype,{angular:!0,directTouch:!0,drawGraph:e,drawTracker:p.prototype.drawTracker,fixedBox:!0,forceDL:!0,noSharedTooltip:!0,pointClass:d,trackerGroups:["group",
    "dataLabelsGroup"]});l.registerSeriesType("gauge",a);return a});A(d,"Series/PackedBubble/PackedBubblePoint.js",[d["Core/Chart/Chart.js"],d["Core/Series/Point.js"],d["Core/Series/SeriesRegistry.js"]],function(d,e,l){var a=this&&this.__extends||function(){var a=function(c,e){a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(a,c){a.__proto__=c;}||function(a,c){for(var e in c)c.hasOwnProperty(e)&&(a[e]=c[e]);};return a(c,e)};return function(c,e){function d(){this.constructor=c;}a(c,e);
    c.prototype=null===e?Object.create(e):(d.prototype=e.prototype,new d);}}();return function(c){function l(){var a=null!==c&&c.apply(this,arguments)||this;a.degree=NaN;a.mass=NaN;a.radius=NaN;a.options=void 0;a.series=void 0;a.value=null;return a}a(l,c);l.prototype.destroy=function(){this.series.layout&&this.series.layout.removeElementFromCollection(this,this.series.layout.nodes);return e.prototype.destroy.apply(this,arguments)};l.prototype.firePointEvent=function(){var a=this.series.options;if(this.isParentNode&&
    a.parentNode){var c=a.allowPointSelect;a.allowPointSelect=a.parentNode.allowPointSelect;e.prototype.firePointEvent.apply(this,arguments);a.allowPointSelect=c;}else e.prototype.firePointEvent.apply(this,arguments);};l.prototype.select=function(){var a=this.series.chart;this.isParentNode?(a.getSelectedPoints=a.getSelectedParentNodes,e.prototype.select.apply(this,arguments),a.getSelectedPoints=d.prototype.getSelectedPoints):e.prototype.select.apply(this,arguments);};return l}(l.seriesTypes.bubble.prototype.pointClass)});
    A(d,"Series/Networkgraph/DraggableNodes.js",[d["Core/Chart/Chart.js"],d["Core/Globals.js"],d["Core/Utilities.js"]],function(d,e,l){var a=l.addEvent;e.dragNodesMixin={onMouseDown:function(a,e){e=this.chart.pointer.normalize(e);a.fixedPosition={chartX:e.chartX,chartY:e.chartY,plotX:a.plotX,plotY:a.plotY};a.inDragMode=!0;},onMouseMove:function(a,e){if(a.fixedPosition&&a.inDragMode){var c=this.chart,d=c.pointer.normalize(e);e=a.fixedPosition.chartX-d.chartX;d=a.fixedPosition.chartY-d.chartY;var l=void 0,
    w=void 0,b=c.graphLayoutsLookup;if(5<Math.abs(e)||5<Math.abs(d))l=a.fixedPosition.plotX-e,w=a.fixedPosition.plotY-d,c.isInsidePlot(l,w)&&(a.plotX=l,a.plotY=w,a.hasDragged=!0,this.redrawHalo(a),b.forEach(function(b){b.restartSimulation();}));}},onMouseUp:function(a,e){a.fixedPosition&&(a.hasDragged&&(this.layout.enableSimulation?this.layout.start():this.chart.redraw()),a.inDragMode=a.hasDragged=!1,this.options.fixedDraggable||delete a.fixedPosition);},redrawHalo:function(a){a&&this.halo&&this.halo.attr({d:a.haloPath(this.options.states.hover.halo.size)});}};
    a(d,"load",function(){var c=this,e,d,l;c.container&&(e=a(c.container,"mousedown",function(e){var k=c.hoverPoint;k&&k.series&&k.series.hasDraggableNodes&&k.series.options.draggable&&(k.series.onMouseDown(k,e),d=a(c.container,"mousemove",function(b){return k&&k.series&&k.series.onMouseMove(k,b)}),l=a(c.container.ownerDocument,"mouseup",function(b){d();l();return k&&k.series&&k.series.onMouseUp(k,b)}));}));a(c,"destroy",function(){e();});});});A(d,"Series/Networkgraph/Integrations.js",[d["Core/Globals.js"]],
    function(d){d.networkgraphIntegrations={verlet:{attractiveForceFunction:function(e,d){return (d-e)/e},repulsiveForceFunction:function(e,d){return (d-e)/e*(d>e?1:0)},barycenter:function(){var e=this.options.gravitationalConstant,d=this.barycenter.xFactor,a=this.barycenter.yFactor;d=(d-(this.box.left+this.box.width)/2)*e;a=(a-(this.box.top+this.box.height)/2)*e;this.nodes.forEach(function(c){c.fixedPosition||(c.plotX-=d/c.mass/c.degree,c.plotY-=a/c.mass/c.degree);});},repulsive:function(e,d,a){d=d*this.diffTemperature/
    e.mass/e.degree;e.fixedPosition||(e.plotX+=a.x*d,e.plotY+=a.y*d);},attractive:function(e,d,a){var c=e.getMass(),l=-a.x*d*this.diffTemperature;d=-a.y*d*this.diffTemperature;e.fromNode.fixedPosition||(e.fromNode.plotX-=l*c.fromNode/e.fromNode.degree,e.fromNode.plotY-=d*c.fromNode/e.fromNode.degree);e.toNode.fixedPosition||(e.toNode.plotX+=l*c.toNode/e.toNode.degree,e.toNode.plotY+=d*c.toNode/e.toNode.degree);},integrate:function(e,d){var a=-e.options.friction,c=e.options.maxSpeed,l=(d.plotX+d.dispX-d.prevX)*
    a;a*=d.plotY+d.dispY-d.prevY;var p=Math.abs,k=p(l)/(l||1);p=p(a)/(a||1);l=k*Math.min(c,Math.abs(l));a=p*Math.min(c,Math.abs(a));d.prevX=d.plotX+d.dispX;d.prevY=d.plotY+d.dispY;d.plotX+=l;d.plotY+=a;d.temperature=e.vectorLength({x:l,y:a});},getK:function(e){return Math.pow(e.box.width*e.box.height/e.nodes.length,.5)}},euler:{attractiveForceFunction:function(e,d){return e*e/d},repulsiveForceFunction:function(e,d){return d*d/e},barycenter:function(){var e=this.options.gravitationalConstant,d=this.barycenter.xFactor,
    a=this.barycenter.yFactor;this.nodes.forEach(function(c){if(!c.fixedPosition){var l=c.getDegree();l*=1+l/2;c.dispX+=(d-c.plotX)*e*l/c.degree;c.dispY+=(a-c.plotY)*e*l/c.degree;}});},repulsive:function(e,d,a,c){e.dispX+=a.x/c*d/e.degree;e.dispY+=a.y/c*d/e.degree;},attractive:function(e,d,a,c){var l=e.getMass(),p=a.x/c*d;d*=a.y/c;e.fromNode.fixedPosition||(e.fromNode.dispX-=p*l.fromNode/e.fromNode.degree,e.fromNode.dispY-=d*l.fromNode/e.fromNode.degree);e.toNode.fixedPosition||(e.toNode.dispX+=p*l.toNode/
    e.toNode.degree,e.toNode.dispY+=d*l.toNode/e.toNode.degree);},integrate:function(e,d){d.dispX+=d.dispX*e.options.friction;d.dispY+=d.dispY*e.options.friction;var a=d.temperature=e.vectorLength({x:d.dispX,y:d.dispY});0!==a&&(d.plotX+=d.dispX/a*Math.min(Math.abs(d.dispX),e.temperature),d.plotY+=d.dispY/a*Math.min(Math.abs(d.dispY),e.temperature));},getK:function(e){return Math.pow(e.box.width*e.box.height/e.nodes.length,.3)}}};});A(d,"Series/Networkgraph/QuadTree.js",[d["Core/Globals.js"],d["Core/Utilities.js"]],
    function(d,e){e=e.extend;var l=d.QuadTreeNode=function(a){this.box=a;this.boxSize=Math.min(a.width,a.height);this.nodes=[];this.body=this.isInternal=!1;this.isEmpty=!0;};e(l.prototype,{insert:function(a,c){this.isInternal?this.nodes[this.getBoxPosition(a)].insert(a,c-1):(this.isEmpty=!1,this.body?c?(this.isInternal=!0,this.divideBox(),!0!==this.body&&(this.nodes[this.getBoxPosition(this.body)].insert(this.body,c-1),this.body=!0),this.nodes[this.getBoxPosition(a)].insert(a,c-1)):(c=new l({top:a.plotX,
    left:a.plotY,width:.1,height:.1}),c.body=a,c.isInternal=!1,this.nodes.push(c)):(this.isInternal=!1,this.body=a));},updateMassAndCenter:function(){var a=0,c=0,e=0;this.isInternal?(this.nodes.forEach(function(d){d.isEmpty||(a+=d.mass,c+=d.plotX*d.mass,e+=d.plotY*d.mass);}),c/=a,e/=a):this.body&&(a=this.body.mass,c=this.body.plotX,e=this.body.plotY);this.mass=a;this.plotX=c;this.plotY=e;},divideBox:function(){var a=this.box.width/2,c=this.box.height/2;this.nodes[0]=new l({left:this.box.left,top:this.box.top,
    width:a,height:c});this.nodes[1]=new l({left:this.box.left+a,top:this.box.top,width:a,height:c});this.nodes[2]=new l({left:this.box.left+a,top:this.box.top+c,width:a,height:c});this.nodes[3]=new l({left:this.box.left,top:this.box.top+c,width:a,height:c});},getBoxPosition:function(a){var c=a.plotY<this.box.top+this.box.height/2;return a.plotX<this.box.left+this.box.width/2?c?0:3:c?1:2}});d=d.QuadTree=function(a,c,e,d){this.box={left:a,top:c,width:e,height:d};this.maxDepth=25;this.root=new l(this.box,
    "0");this.root.isInternal=!0;this.root.isRoot=!0;this.root.divideBox();};e(d.prototype,{insertNodes:function(a){a.forEach(function(a){this.root.insert(a,this.maxDepth);},this);},visitNodeRecursive:function(a,c,e){var d;a||(a=this.root);a===this.root&&c&&(d=c(a));!1!==d&&(a.nodes.forEach(function(a){if(a.isInternal){c&&(d=c(a));if(!1===d)return;this.visitNodeRecursive(a,c,e);}else a.body&&c&&c(a.body);e&&e(a);},this),a===this.root&&e&&e(a));},calculateMassAndCenter:function(){this.visitNodeRecursive(null,
    null,function(a){a.updateMassAndCenter();});}});});A(d,"Series/Networkgraph/Layouts.js",[d["Core/Chart/Chart.js"],d["Core/Animation/AnimationUtilities.js"],d["Core/Globals.js"],d["Core/Utilities.js"]],function(d,e,l,a){var c=e.setAnimation;e=a.addEvent;var t=a.clamp,p=a.defined,k=a.extend,x=a.isFunction,w=a.pick;l.layouts={"reingold-fruchterman":function(){}};k(l.layouts["reingold-fruchterman"].prototype,{init:function(b){this.options=b;this.nodes=[];this.links=[];this.series=[];this.box={x:0,y:0,width:0,
    height:0};this.setInitialRendering(!0);this.integration=l.networkgraphIntegrations[b.integration];this.enableSimulation=b.enableSimulation;this.attractiveForce=w(b.attractiveForce,this.integration.attractiveForceFunction);this.repulsiveForce=w(b.repulsiveForce,this.integration.repulsiveForceFunction);this.approximation=b.approximation;},updateSimulation:function(b){this.enableSimulation=w(b,this.options.enableSimulation);},start:function(){var b=this.series,a=this.options;this.currentStep=0;this.forces=
    b[0]&&b[0].forces||[];this.chart=b[0]&&b[0].chart;this.initialRendering&&(this.initPositions(),b.forEach(function(b){b.finishedAnimating=!0;b.render();}));this.setK();this.resetSimulation(a);this.enableSimulation&&this.step();},step:function(){var b=this,a=this.series;b.currentStep++;"barnes-hut"===b.approximation&&(b.createQuadTree(),b.quadTree.calculateMassAndCenter());b.forces.forEach(function(a){b[a+"Forces"](b.temperature);});b.applyLimits(b.temperature);b.temperature=b.coolDown(b.startTemperature,
    b.diffTemperature,b.currentStep);b.prevSystemTemperature=b.systemTemperature;b.systemTemperature=b.getSystemTemperature();b.enableSimulation&&(a.forEach(function(b){b.chart&&b.render();}),b.maxIterations--&&isFinite(b.temperature)&&!b.isStable()?(b.simulation&&l.win.cancelAnimationFrame(b.simulation),b.simulation=l.win.requestAnimationFrame(function(){b.step();})):b.simulation=!1);},stop:function(){this.simulation&&l.win.cancelAnimationFrame(this.simulation);},setArea:function(b,a,c,e){this.box={left:b,
    top:a,width:c,height:e};},setK:function(){this.k=this.options.linkLength||this.integration.getK(this);},addElementsToCollection:function(b,a){b.forEach(function(b){-1===a.indexOf(b)&&a.push(b);});},removeElementFromCollection:function(b,a){b=a.indexOf(b);-1!==b&&a.splice(b,1);},clear:function(){this.nodes.length=0;this.links.length=0;this.series.length=0;this.resetSimulation();},resetSimulation:function(){this.forcedStop=!1;this.systemTemperature=0;this.setMaxIterations();this.setTemperature();this.setDiffTemperature();},
    restartSimulation:function(){this.simulation?this.resetSimulation():(this.setInitialRendering(!1),this.enableSimulation?this.start():this.setMaxIterations(1),this.chart&&this.chart.redraw(),this.setInitialRendering(!0));},setMaxIterations:function(b){this.maxIterations=w(b,this.options.maxIterations);},setTemperature:function(){this.temperature=this.startTemperature=Math.sqrt(this.nodes.length);},setDiffTemperature:function(){this.diffTemperature=this.startTemperature/(this.options.maxIterations+1);},
    setInitialRendering:function(b){this.initialRendering=b;},createQuadTree:function(){this.quadTree=new l.QuadTree(this.box.left,this.box.top,this.box.width,this.box.height);this.quadTree.insertNodes(this.nodes);},initPositions:function(){var b=this.options.initialPositions;x(b)?(b.call(this),this.nodes.forEach(function(b){p(b.prevX)||(b.prevX=b.plotX);p(b.prevY)||(b.prevY=b.plotY);b.dispX=0;b.dispY=0;})):"circle"===b?this.setCircularPositions():this.setRandomPositions();},setCircularPositions:function(){function b(a){a.linksFrom.forEach(function(a){l[a.toNode.id]||
    (l[a.toNode.id]=!0,k.push(a.toNode),b(a.toNode));});}var a=this.box,c=this.nodes,e=2*Math.PI/(c.length+1),d=c.filter(function(b){return 0===b.linksTo.length}),k=[],l={},p=this.options.initialPositionRadius;d.forEach(function(a){k.push(a);b(a);});k.length?c.forEach(function(b){-1===k.indexOf(b)&&k.push(b);}):k=c;k.forEach(function(b,c){b.plotX=b.prevX=w(b.plotX,a.width/2+p*Math.cos(c*e));b.plotY=b.prevY=w(b.plotY,a.height/2+p*Math.sin(c*e));b.dispX=0;b.dispY=0;});},setRandomPositions:function(){function b(b){b=
    b*b/Math.PI;return b-=Math.floor(b)}var a=this.box,c=this.nodes,e=c.length+1;c.forEach(function(c,g){c.plotX=c.prevX=w(c.plotX,a.width*b(g));c.plotY=c.prevY=w(c.plotY,a.height*b(e+g));c.dispX=0;c.dispY=0;});},force:function(b){this.integration[b].apply(this,Array.prototype.slice.call(arguments,1));},barycenterForces:function(){this.getBarycenter();this.force("barycenter");},getBarycenter:function(){var b=0,a=0,c=0;this.nodes.forEach(function(g){a+=g.plotX*g.mass;c+=g.plotY*g.mass;b+=g.mass;});return this.barycenter=
    {x:a,y:c,xFactor:a/b,yFactor:c/b}},barnesHutApproximation:function(b,a){var c=this.getDistXY(b,a),g=this.vectorLength(c);if(b!==a&&0!==g)if(a.isInternal)if(a.boxSize/g<this.options.theta&&0!==g){var e=this.repulsiveForce(g,this.k);this.force("repulsive",b,e*a.mass,c,g);var d=!1;}else d=!0;else e=this.repulsiveForce(g,this.k),this.force("repulsive",b,e*a.mass,c,g);return d},repulsiveForces:function(){var b=this;"barnes-hut"===b.approximation?b.nodes.forEach(function(a){b.quadTree.visitNodeRecursive(null,
    function(c){return b.barnesHutApproximation(a,c)});}):b.nodes.forEach(function(a){b.nodes.forEach(function(c){if(a!==c&&!a.fixedPosition){var g=b.getDistXY(a,c);var e=b.vectorLength(g);if(0!==e){var d=b.repulsiveForce(e,b.k);b.force("repulsive",a,d*c.mass,g,e);}}});});},attractiveForces:function(){var b=this,a,c,e;b.links.forEach(function(g){g.fromNode&&g.toNode&&(a=b.getDistXY(g.fromNode,g.toNode),c=b.vectorLength(a),0!==c&&(e=b.attractiveForce(c,b.k),b.force("attractive",g,e,a,c)));});},applyLimits:function(){var b=
    this;b.nodes.forEach(function(a){a.fixedPosition||(b.integration.integrate(b,a),b.applyLimitBox(a,b.box),a.dispX=0,a.dispY=0);});},applyLimitBox:function(b,a){var c=b.radius;b.plotX=t(b.plotX,a.left+c,a.width-c);b.plotY=t(b.plotY,a.top+c,a.height-c);},coolDown:function(b,a,c){return b-a*c},isStable:function(){return .00001>Math.abs(this.systemTemperature-this.prevSystemTemperature)||0>=this.temperature},getSystemTemperature:function(){return this.nodes.reduce(function(b,a){return b+a.temperature},0)},
    vectorLength:function(b){return Math.sqrt(b.x*b.x+b.y*b.y)},getDistR:function(b,a){b=this.getDistXY(b,a);return this.vectorLength(b)},getDistXY:function(b,a){var c=b.plotX-a.plotX;b=b.plotY-a.plotY;return {x:c,y:b,absX:Math.abs(c),absY:Math.abs(b)}}});e(d,"predraw",function(){this.graphLayoutsLookup&&this.graphLayoutsLookup.forEach(function(b){b.stop();});});e(d,"render",function(){function b(b){b.maxIterations--&&isFinite(b.temperature)&&!b.isStable()&&!b.enableSimulation&&(b.beforeStep&&b.beforeStep(),
    b.step(),e=!1,a=!0);}var a=!1;if(this.graphLayoutsLookup){c(!1,this);for(this.graphLayoutsLookup.forEach(function(b){b.start();});!e;){var e=!0;this.graphLayoutsLookup.forEach(b);}a&&this.series.forEach(function(b){b&&b.layout&&b.render();});}});e(d,"beforePrint",function(){this.graphLayoutsLookup&&(this.graphLayoutsLookup.forEach(function(b){b.updateSimulation(!1);}),this.redraw());});e(d,"afterPrint",function(){this.graphLayoutsLookup&&this.graphLayoutsLookup.forEach(function(b){b.updateSimulation();});
    this.redraw();});});A(d,"Series/PackedBubble/PackedBubbleComposition.js",[d["Core/Chart/Chart.js"],d["Core/Globals.js"],d["Core/Utilities.js"]],function(d,e,l){var a=e.layouts["reingold-fruchterman"],c=l.addEvent,t=l.extendClass,p=l.pick;d.prototype.getSelectedParentNodes=function(){var a=[];this.series.forEach(function(c){c.parentNode&&c.parentNode.selected&&a.push(c.parentNode);});return a};e.networkgraphIntegrations.packedbubble={repulsiveForceFunction:function(a,c,e,b){return Math.min(a,(e.marker.radius+
    b.marker.radius)/2)},barycenter:function(){var a=this,c=a.options.gravitationalConstant,e=a.box,b=a.nodes,d,m;b.forEach(function(g){a.options.splitSeries&&!g.isParentNode?(d=g.series.parentNode.plotX,m=g.series.parentNode.plotY):(d=e.width/2,m=e.height/2);g.fixedPosition||(g.plotX-=(g.plotX-d)*c/(g.mass*Math.sqrt(b.length)),g.plotY-=(g.plotY-m)*c/(g.mass*Math.sqrt(b.length)));});},repulsive:function(a,c,e,b){var g=c*this.diffTemperature/a.mass/a.degree;c=e.x*g;e=e.y*g;a.fixedPosition||(a.plotX+=c,a.plotY+=
    e);b.fixedPosition||(b.plotX-=c,b.plotY-=e);},integrate:e.networkgraphIntegrations.verlet.integrate,getK:e.noop};e.layouts.packedbubble=t(a,{beforeStep:function(){this.options.marker&&this.series.forEach(function(a){a&&a.calculateParentRadius();});},isStable:function(){var a=Math.abs(this.prevSystemTemperature-this.systemTemperature);return 1>Math.abs(10*this.systemTemperature/Math.sqrt(this.nodes.length))&&.00001>a||0>=this.temperature},setCircularPositions:function(){var a=this,c=a.box,e=a.nodes,b=
    2*Math.PI/(e.length+1),g,d,n=a.options.initialPositionRadius;e.forEach(function(e,k){a.options.splitSeries&&!e.isParentNode?(g=e.series.parentNode.plotX,d=e.series.parentNode.plotY):(g=c.width/2,d=c.height/2);e.plotX=e.prevX=p(e.plotX,g+n*Math.cos(e.index||k*b));e.plotY=e.prevY=p(e.plotY,d+n*Math.sin(e.index||k*b));e.dispX=0;e.dispY=0;});},repulsiveForces:function(){var a=this,c,e,b,g=a.options.bubblePadding;a.nodes.forEach(function(d){d.degree=d.mass;d.neighbours=0;a.nodes.forEach(function(k){c=0;
    d===k||d.fixedPosition||!a.options.seriesInteraction&&d.series!==k.series||(b=a.getDistXY(d,k),e=a.vectorLength(b)-(d.marker.radius+k.marker.radius+g),0>e&&(d.degree+=.01,d.neighbours++,c=a.repulsiveForce(-e/Math.sqrt(d.neighbours),a.k,d,k)),a.force("repulsive",d,c*k.mass,b,k,e));});});},applyLimitBox:function(c){if(this.options.splitSeries&&!c.isParentNode&&this.options.parentNodeLimit){var e=this.getDistXY(c,c.series.parentNode);var d=c.series.parentNodeRadius-c.marker.radius-this.vectorLength(e);
    0>d&&d>-2*c.marker.radius&&(c.plotX-=.01*e.x,c.plotY-=.01*e.y);}a.prototype.applyLimitBox.apply(this,arguments);}});c(d,"beforeRedraw",function(){this.allDataPoints&&delete this.allDataPoints;});});A(d,"Series/PackedBubble/PackedBubbleSeries.js",[d["Core/Color/Color.js"],d["Core/Globals.js"],d["Series/PackedBubble/PackedBubblePoint.js"],d["Core/Series/SeriesRegistry.js"],d["Core/Utilities.js"]],function(d,e,l,a,c){var t=this&&this.__extends||function(){var a=function(b,h){a=Object.setPrototypeOf||{__proto__:[]}instanceof
    Array&&function(a,b){a.__proto__=b;}||function(a,b){for(var h in b)b.hasOwnProperty(h)&&(a[h]=b[h]);};return a(b,h)};return function(b,h){function f(){this.constructor=b;}a(b,h);b.prototype=null===h?Object.create(h):(f.prototype=h.prototype,new f);}}(),p=d.parse,k=a.series,x=a.seriesTypes.bubble,w=c.addEvent,b=c.clamp,g=c.defined,m=c.extend,n=c.fireEvent,q=c.isArray,H=c.isNumber,A=c.merge,I=c.pick,y=e.dragNodesMixin;d=function(a){function f(){var b=null!==a&&a.apply(this,arguments)||this;b.chart=void 0;
    b.data=void 0;b.layout=void 0;b.options=void 0;b.points=void 0;b.xData=void 0;return b}t(f,a);f.prototype.accumulateAllPoints=function(a){var b=a.chart,h=[],f,c;for(f=0;f<b.series.length;f++)if(a=b.series[f],a.is("packedbubble")&&a.visible||!b.options.chart.ignoreHiddenSeries)for(c=0;c<a.yData.length;c++)h.push([null,null,a.yData[c],a.index,c,{id:c,marker:{radius:0}}]);return h};f.prototype.addLayout=function(){var a=this.options.layoutAlgorithm,b=this.chart.graphLayoutsStorage,f=this.chart.graphLayoutsLookup,
    c=this.chart.options.chart;b||(this.chart.graphLayoutsStorage=b={},this.chart.graphLayoutsLookup=f=[]);var d=b[a.type];d||(a.enableSimulation=g(c.forExport)?!c.forExport:a.enableSimulation,b[a.type]=d=new e.layouts[a.type],d.init(a),f.splice(d.index,0,d));this.layout=d;this.points.forEach(function(a){a.mass=2;a.degree=1;a.collisionNmb=1;});d.setArea(0,0,this.chart.plotWidth,this.chart.plotHeight);d.addElementsToCollection([this],d.series);d.addElementsToCollection(this.points,d.nodes);};f.prototype.addSeriesLayout=
    function(){var a=this.options.layoutAlgorithm,b=this.chart.graphLayoutsStorage,f=this.chart.graphLayoutsLookup,c=A(a,a.parentNodeOptions,{enableSimulation:this.layout.options.enableSimulation});var d=b[a.type+"-series"];d||(b[a.type+"-series"]=d=new e.layouts[a.type],d.init(c),f.splice(d.index,0,d));this.parentNodeLayout=d;this.createParentNodes();};f.prototype.calculateParentRadius=function(){var a=this.seriesBox();this.parentNodeRadius=b(Math.sqrt(2*this.parentNodeMass/Math.PI)+20,20,a?Math.max(Math.sqrt(Math.pow(a.width,
    2)+Math.pow(a.height,2))/2+20,20):Math.sqrt(2*this.parentNodeMass/Math.PI)+20);this.parentNode&&(this.parentNode.marker.radius=this.parentNode.radius=this.parentNodeRadius);};f.prototype.calculateZExtremes=function(){var a=this.options.zMin,b=this.options.zMax,f=Infinity,c=-Infinity;if(a&&b)return [a,b];this.chart.series.forEach(function(a){a.yData.forEach(function(a){g(a)&&(a>c&&(c=a),a<f&&(f=a));});});a=I(a,f);b=I(b,c);return [a,b]};f.prototype.checkOverlap=function(a,b){var h=a[0]-b[0],f=a[1]-b[1];
    return -.001>Math.sqrt(h*h+f*f)-Math.abs(a[2]+b[2])};f.prototype.createParentNodes=function(){var a=this,b=a.chart,f=a.parentNodeLayout,c,e=a.parentNode,d=a.pointClass,g=a.layout.options,k={radius:a.parentNodeRadius,lineColor:a.color,fillColor:p(a.color).brighten(.4).get()};g.parentNodeOptions&&(k=A(g.parentNodeOptions.marker||{},k));a.parentNodeMass=0;a.points.forEach(function(b){a.parentNodeMass+=Math.PI*Math.pow(b.marker.radius,2);});a.calculateParentRadius();f.nodes.forEach(function(b){b.seriesIndex===
    a.index&&(c=!0);});f.setArea(0,0,b.plotWidth,b.plotHeight);c||(e||(e=(new d).init(this,{mass:a.parentNodeRadius/2,marker:k,dataLabels:{inside:!1},states:{normal:{marker:k},hover:{marker:k}},dataLabelOnNull:!0,degree:a.parentNodeRadius,isParentNode:!0,seriesIndex:a.index})),a.parentNode&&(e.plotX=a.parentNode.plotX,e.plotY=a.parentNode.plotY),a.parentNode=e,f.addElementsToCollection([a],f.series),f.addElementsToCollection([e],f.nodes));};f.prototype.deferLayout=function(){var a=this.options.layoutAlgorithm;
    this.visible&&(this.addLayout(),a.splitSeries&&this.addSeriesLayout());};f.prototype.destroy=function(){this.chart.graphLayoutsLookup&&this.chart.graphLayoutsLookup.forEach(function(a){a.removeElementFromCollection(this,a.series);},this);this.parentNode&&this.parentNodeLayout&&(this.parentNodeLayout.removeElementFromCollection(this.parentNode,this.parentNodeLayout.nodes),this.parentNode.dataLabel&&(this.parentNode.dataLabel=this.parentNode.dataLabel.destroy()));k.prototype.destroy.apply(this,arguments);};
    f.prototype.drawDataLabels=function(){var a=this.options.dataLabels.textPath,b=this.points;k.prototype.drawDataLabels.apply(this,arguments);this.parentNode&&(this.parentNode.formatPrefix="parentNode",this.points=[this.parentNode],this.options.dataLabels.textPath=this.options.dataLabels.parentNodeTextPath,k.prototype.drawDataLabels.apply(this,arguments),this.points=b,this.options.dataLabels.textPath=a);};f.prototype.drawGraph=function(){if(this.layout&&this.layout.options.splitSeries){var a=this.chart;
    var b=this.layout.options.parentNodeOptions.marker;var f={fill:b.fillColor||p(this.color).brighten(.4).get(),opacity:b.fillOpacity,stroke:b.lineColor||this.color,"stroke-width":I(b.lineWidth,this.options.lineWidth)};this.parentNodesGroup||(this.parentNodesGroup=this.plotGroup("parentNodesGroup","parentNode",this.visible?"inherit":"hidden",.1,a.seriesGroup),this.group.attr({zIndex:2}));this.calculateParentRadius();b=A({x:this.parentNode.plotX-this.parentNodeRadius,y:this.parentNode.plotY-this.parentNodeRadius,
    width:2*this.parentNodeRadius,height:2*this.parentNodeRadius},f);this.parentNode.graphic||(this.graph=this.parentNode.graphic=a.renderer.symbol(f.symbol).add(this.parentNodesGroup));this.parentNode.graphic.attr(b);}};f.prototype.drawTracker=function(){var b=this.parentNode;a.prototype.drawTracker.call(this);if(b){var f=q(b.dataLabels)?b.dataLabels:b.dataLabel?[b.dataLabel]:[];b.graphic&&(b.graphic.element.point=b);f.forEach(function(a){a.div?a.div.point=b:a.element.point=b;});}};f.prototype.getPointRadius=
    function(){var a=this,f=a.chart,c=a.options,e=c.useSimulation,d=Math.min(f.plotWidth,f.plotHeight),g={},k=[],l=f.allDataPoints,n,m,p,z;["minSize","maxSize"].forEach(function(a){var b=parseInt(c[a],10),f=/%$/.test(c[a]);g[a]=f?d*b/100:b*Math.sqrt(l.length);});f.minRadius=n=g.minSize/Math.sqrt(l.length);f.maxRadius=m=g.maxSize/Math.sqrt(l.length);var q=e?a.calculateZExtremes():[n,m];(l||[]).forEach(function(f,h){p=e?b(f[2],q[0],q[1]):f[2];z=a.getRadius(q[0],q[1],n,m,p);0===z&&(z=null);l[h][2]=z;k.push(z);});
    a.radii=k;};f.prototype.init=function(){k.prototype.init.apply(this,arguments);this.eventsToUnbind.push(w(this,"updatedData",function(){this.chart.series.forEach(function(a){a.type===this.type&&(a.isDirty=!0);},this);}));return this};f.prototype.onMouseUp=function(a){if(a.fixedPosition&&!a.removed){var b,f,h=this.layout,c=this.parentNodeLayout;c&&h.options.dragBetweenSeries&&c.nodes.forEach(function(c){a&&a.marker&&c!==a.series.parentNode&&(b=h.getDistXY(a,c),f=h.vectorLength(b)-c.marker.radius-a.marker.radius,
    0>f&&(c.series.addPoint(A(a.options,{plotX:a.plotX,plotY:a.plotY}),!1),h.removeElementFromCollection(a,h.nodes),a.remove()));});y.onMouseUp.apply(this,arguments);}};f.prototype.placeBubbles=function(a){var b=this.checkOverlap,f=this.positionBubble,c=[],h=1,e=0,d=0;var g=[];var k;a=a.sort(function(a,b){return b[2]-a[2]});if(a.length){c.push([[0,0,a[0][2],a[0][3],a[0][4]]]);if(1<a.length)for(c.push([[0,0-a[1][2]-a[0][2],a[1][2],a[1][3],a[1][4]]]),k=2;k<a.length;k++)a[k][2]=a[k][2]||1,g=f(c[h][e],c[h-
    1][d],a[k]),b(g,c[h][0])?(c.push([]),d=0,c[h+1].push(f(c[h][e],c[h][0],a[k])),h++,e=0):1<h&&c[h-1][d+1]&&b(g,c[h-1][d+1])?(d++,c[h].push(f(c[h][e],c[h-1][d],a[k])),e++):(e++,c[h].push(g));this.chart.stages=c;this.chart.rawPositions=[].concat.apply([],c);this.resizeRadius();g=this.chart.rawPositions;}return g};f.prototype.pointAttribs=function(a,b){var f=this.options,c=f.marker;a&&a.isParentNode&&f.layoutAlgorithm&&f.layoutAlgorithm.parentNodeOptions&&(c=f.layoutAlgorithm.parentNodeOptions.marker);
    f=c.fillOpacity;a=k.prototype.pointAttribs.call(this,a,b);1!==f&&(a["fill-opacity"]=f);return a};f.prototype.positionBubble=function(a,b,f){var c=Math.sqrt,h=Math.asin,e=Math.acos,d=Math.pow,g=Math.abs;c=c(d(a[0]-b[0],2)+d(a[1]-b[1],2));e=e((d(c,2)+d(f[2]+b[2],2)-d(f[2]+a[2],2))/(2*(f[2]+b[2])*c));h=h(g(a[0]-b[0])/c);a=(0>a[1]-b[1]?0:Math.PI)+e+h*(0>(a[0]-b[0])*(a[1]-b[1])?1:-1);return [b[0]+(b[2]+f[2])*Math.sin(a),b[1]-(b[2]+f[2])*Math.cos(a),f[2],f[3],f[4]]};f.prototype.render=function(){var a=[];
    k.prototype.render.apply(this,arguments);this.options.dataLabels.allowOverlap||(this.data.forEach(function(b){q(b.dataLabels)&&b.dataLabels.forEach(function(b){a.push(b);});}),this.options.useSimulation&&this.chart.hideOverlappingLabels(a));};f.prototype.resizeRadius=function(){var a=this.chart,b=a.rawPositions,f=Math.min,c=Math.max,e=a.plotLeft,d=a.plotTop,g=a.plotHeight,k=a.plotWidth,l,n,m;var p=l=Number.POSITIVE_INFINITY;var z=n=Number.NEGATIVE_INFINITY;for(m=0;m<b.length;m++){var q=b[m][2];p=f(p,
    b[m][0]-q);z=c(z,b[m][0]+q);l=f(l,b[m][1]-q);n=c(n,b[m][1]+q);}m=[z-p,n-l];f=f.apply([],[(k-e)/m[0],(g-d)/m[1]]);if(1e-10<Math.abs(f-1)){for(m=0;m<b.length;m++)b[m][2]*=f;this.placeBubbles(b);}else a.diffY=g/2+d-l-(n-l)/2,a.diffX=k/2+e-p-(z-p)/2;};f.prototype.seriesBox=function(){var a=this.chart,b=Math.max,f=Math.min,c,e=[a.plotLeft,a.plotLeft+a.plotWidth,a.plotTop,a.plotTop+a.plotHeight];this.data.forEach(function(a){g(a.plotX)&&g(a.plotY)&&a.marker.radius&&(c=a.marker.radius,e[0]=f(e[0],a.plotX-c),
    e[1]=b(e[1],a.plotX+c),e[2]=f(e[2],a.plotY-c),e[3]=b(e[3],a.plotY+c));});return H(e.width/e.height)?e:null};f.prototype.setVisible=function(){var a=this;k.prototype.setVisible.apply(a,arguments);a.parentNodeLayout&&a.graph?a.visible?(a.graph.show(),a.parentNode.dataLabel&&a.parentNode.dataLabel.show()):(a.graph.hide(),a.parentNodeLayout.removeElementFromCollection(a.parentNode,a.parentNodeLayout.nodes),a.parentNode.dataLabel&&a.parentNode.dataLabel.hide()):a.layout&&(a.visible?a.layout.addElementsToCollection(a.points,
    a.layout.nodes):a.points.forEach(function(b){a.layout.removeElementFromCollection(b,a.layout.nodes);}));};f.prototype.translate=function(){var a=this.chart,b=this.data,f=this.index,c,e=this.options.useSimulation;this.processedXData=this.xData;this.generatePoints();g(a.allDataPoints)||(a.allDataPoints=this.accumulateAllPoints(this),this.getPointRadius());if(e)var d=a.allDataPoints;else d=this.placeBubbles(a.allDataPoints),this.options.draggable=!1;for(c=0;c<d.length;c++)if(d[c][3]===f){var k=b[d[c][4]];
    var l=I(d[c][2],void 0);e||(k.plotX=d[c][0]-a.plotLeft+a.diffX,k.plotY=d[c][1]-a.plotTop+a.diffY);H(l)&&(k.marker=m(k.marker,{radius:l,width:2*l,height:2*l}),k.radius=l);}e&&this.deferLayout();n(this,"afterTranslate");};f.defaultOptions=A(x.defaultOptions,{minSize:"10%",maxSize:"50%",sizeBy:"area",zoneAxis:"y",crisp:!1,tooltip:{pointFormat:"Value: {point.value}"},draggable:!0,useSimulation:!0,parentNode:{allowPointSelect:!1},dataLabels:{formatter:function(){var a=this.series.chart.numberFormatter,b=
    this.point.value;return H(b)?a(b,-1):""},parentNodeFormatter:function(){return this.name},parentNodeTextPath:{enabled:!0},padding:0,style:{transition:"opacity 2000ms"}},layoutAlgorithm:{initialPositions:"circle",initialPositionRadius:20,bubblePadding:5,parentNodeLimit:!1,seriesInteraction:!0,dragBetweenSeries:!1,parentNodeOptions:{maxIterations:400,gravitationalConstant:.03,maxSpeed:50,initialPositionRadius:100,seriesInteraction:!0,marker:{fillColor:null,fillOpacity:1,lineWidth:null,lineColor:null,
    symbol:"circle"}},enableSimulation:!0,type:"packedbubble",integration:"packedbubble",maxIterations:1E3,splitSeries:!1,maxSpeed:5,gravitationalConstant:.01,friction:-.981}});return f}(x);m(d.prototype,{alignDataLabel:k.prototype.alignDataLabel,axisTypes:[],directTouch:!0,forces:["barycenter","repulsive"],hasDraggableNodes:!0,isCartesian:!1,noSharedTooltip:!0,onMouseDown:y.onMouseDown,onMouseMove:y.onMouseMove,pointArrayMap:["value"],pointClass:l,pointValKey:"value",redrawHalo:y.redrawHalo,requireSorting:!1,
    searchPoint:e.noop,trackerGroups:["group","dataLabelsGroup","parentNodesGroup"]});a.registerSeriesType("packedbubble",d);return d});A(d,"Series/Polygon/PolygonSeries.js",[d["Core/Globals.js"],d["Core/Legend/LegendSymbol.js"],d["Core/Series/SeriesRegistry.js"],d["Core/Utilities.js"]],function(d,e,l,a){var c=this&&this.__extends||function(){var a=function(b,c){a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(a,b){a.__proto__=b;}||function(a,b){for(var c in b)b.hasOwnProperty(c)&&
    (a[c]=b[c]);};return a(b,c)};return function(b,c){function e(){this.constructor=b;}a(b,c);b.prototype=null===c?Object.create(c):(e.prototype=c.prototype,new e);}}();d=d.noop;var t=l.series,p=l.seriesTypes,k=p.area,x=p.line,w=p.scatter;p=a.extend;var b=a.merge;a=function(a){function e(){var b=null!==a&&a.apply(this,arguments)||this;b.data=void 0;b.options=void 0;b.points=void 0;return b}c(e,a);e.prototype.getGraphPath=function(){for(var a=x.prototype.getGraphPath.call(this),b=a.length+1;b--;)(b===a.length||
    "M"===a[b][0])&&0<b&&a.splice(b,0,["Z"]);return this.areaPath=a};e.prototype.drawGraph=function(){this.options.fillColor=this.color;k.prototype.drawGraph.call(this);};e.defaultOptions=b(w.defaultOptions,{marker:{enabled:!1,states:{hover:{enabled:!1}}},stickyTracking:!1,tooltip:{followPointer:!0,pointFormat:""},trackByArea:!0});return e}(w);p(a.prototype,{type:"polygon",drawLegendSymbol:e.drawRectangle,drawTracker:t.prototype.drawTracker,setStackedPoints:d});l.registerSeriesType("polygon",a);return a});
    A(d,"Core/Axis/WaterfallAxis.js",[d["Extensions/Stacking.js"],d["Core/Utilities.js"]],function(d,e){var l=e.addEvent,a=e.objectEach,c;(function(c){function e(){var a=this.waterfall.stacks;a&&(a.changed=!1,delete a.alreadyChanged);}function k(){var a=this.options.stackLabels;a&&a.enabled&&this.waterfall.stacks&&this.waterfall.renderStackTotals();}function x(){for(var a=this.axes,b=this.series,c=b.length;c--;)b[c].options.stacking&&(a.forEach(function(a){a.isXAxis||(a.waterfall.stacks.changed=!0);}),c=
    0);}function w(){this.waterfall||(this.waterfall=new b(this));}var b=function(){function b(a){this.axis=a;this.stacks={changed:!1};}b.prototype.renderStackTotals=function(){var b=this.axis,c=b.waterfall.stacks,e=b.stacking&&b.stacking.stackTotalGroup,g=new d(b,b.options.stackLabels,!1,0,void 0);this.dummyStackItem=g;a(c,function(b){a(b,function(a){g.total=a.stackTotal;a.label&&(g.label=a.label);d.prototype.render.call(g,e);a.label=g.label;delete g.label;});});g.total=null;};return b}();c.Composition=b;
    c.compose=function(a,b){l(a,"init",w);l(a,"afterBuildStacks",e);l(a,"afterRender",k);l(b,"beforeRedraw",x);};})(c||(c={}));return c});A(d,"Series/Waterfall/WaterfallPoint.js",[d["Series/Column/ColumnSeries.js"],d["Core/Series/Point.js"],d["Core/Utilities.js"]],function(d,e,l){var a=this&&this.__extends||function(){var a=function(c,e){a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(a,c){a.__proto__=c;}||function(a,c){for(var b in c)c.hasOwnProperty(b)&&(a[b]=c[b]);};return a(c,e)};return function(c,
    e){function d(){this.constructor=c;}a(c,e);c.prototype=null===e?Object.create(e):(d.prototype=e.prototype,new d);}}(),c=l.isNumber;return function(d){function l(){var a=null!==d&&d.apply(this,arguments)||this;a.options=void 0;a.series=void 0;return a}a(l,d);l.prototype.getClassName=function(){var a=e.prototype.getClassName.call(this);this.isSum?a+=" highcharts-sum":this.isIntermediateSum&&(a+=" highcharts-intermediate-sum");return a};l.prototype.isValid=function(){return c(this.y)||this.isSum||!!this.isIntermediateSum};
    return l}(d.prototype.pointClass)});A(d,"Series/Waterfall/WaterfallSeries.js",[d["Core/Axis/Axis.js"],d["Core/Chart/Chart.js"],d["Core/Series/SeriesRegistry.js"],d["Core/Utilities.js"],d["Core/Axis/WaterfallAxis.js"],d["Series/Waterfall/WaterfallPoint.js"]],function(d,e,l,a,c,t){var p=this&&this.__extends||function(){var a=function(b,c){a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(a,b){a.__proto__=b;}||function(a,b){for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c]);};return a(b,c)};
    return function(b,c){function f(){this.constructor=b;}a(b,c);b.prototype=null===c?Object.create(c):(f.prototype=c.prototype,new f);}}(),k=l.seriesTypes,x=k.column,w=k.line,b=a.arrayMax,g=a.arrayMin,m=a.correctFloat;k=a.extend;var n=a.isNumber,q=a.merge,A=a.objectEach,J=a.pick;a=function(a){function c(){var b=null!==a&&a.apply(this,arguments)||this;b.chart=void 0;b.data=void 0;b.options=void 0;b.points=void 0;b.stackedYNeg=void 0;b.stackedYPos=void 0;b.stackKey=void 0;b.xData=void 0;b.yAxis=void 0;b.yData=
    void 0;return b}p(c,a);c.prototype.generatePoints=function(){var a;x.prototype.generatePoints.apply(this);var b=0;for(a=this.points.length;b<a;b++){var c=this.points[b];var e=this.processedYData[b];if(c.isIntermediateSum||c.isSum)c.y=m(e);}};c.prototype.translate=function(){var a=this.options,b=this.yAxis,c=J(a.minPointLength,5),e=c/2,d=a.threshold||0,g=d,k=d;a=a.stacking;var l=b.waterfall.stacks[this.stackKey];x.prototype.translate.apply(this);for(var m=this.points,p=0;p<m.length;p++){var q=m[p];
    var w=this.processedYData[p];var C=q.shapeArgs;if(C&&n(w)){var t=[0,w];var D=q.y;if(a){if(l){t=l[p];if("overlap"===a){var y=t.stackState[t.stateIndex--];y=0<=D?y:y-D;Object.hasOwnProperty.call(t,"absolutePos")&&delete t.absolutePos;Object.hasOwnProperty.call(t,"absoluteNeg")&&delete t.absoluteNeg;}else 0<=D?(y=t.threshold+t.posTotal,t.posTotal-=D):(y=t.threshold+t.negTotal,t.negTotal-=D,y-=D),!t.posTotal&&Object.hasOwnProperty.call(t,"absolutePos")&&(t.posTotal=t.absolutePos,delete t.absolutePos),
    !t.negTotal&&Object.hasOwnProperty.call(t,"absoluteNeg")&&(t.negTotal=t.absoluteNeg,delete t.absoluteNeg);q.isSum||(t.connectorThreshold=t.threshold+t.stackTotal);b.reversed?(w=0<=D?y-D:y+D,D=y):(w=y,D=y-D);q.below=w<=d;C.y=b.translate(w,!1,!0,!1,!0)||0;C.height=Math.abs(C.y-(b.translate(D,!1,!0,!1,!0)||0));if(D=b.waterfall.dummyStackItem)D.x=p,D.label=l[p].label,D.setOffset(this.pointXOffset||0,this.barW||0,this.stackedYNeg[p],this.stackedYPos[p]);}}else y=Math.max(g,g+D)+t[0],C.y=b.translate(y,!1,
    !0,!1,!0)||0,q.isSum?(C.y=b.translate(t[1],!1,!0,!1,!0)||0,C.height=Math.min(b.translate(t[0],!1,!0,!1,!0)||0,b.len)-C.y,q.below=t[1]<=d):q.isIntermediateSum?(0<=D?(w=t[1]+k,D=k):(w=k,D=t[1]+k),b.reversed&&(w^=D,D^=w,w^=D),C.y=b.translate(w,!1,!0,!1,!0)||0,C.height=Math.abs(C.y-Math.min(b.translate(D,!1,!0,!1,!0)||0,b.len)),k+=t[1],q.below=w<=d):(C.height=0<w?(b.translate(g,!1,!0,!1,!0)||0)-C.y:(b.translate(g,!1,!0,!1,!0)||0)-(b.translate(g-w,!1,!0,!1,!0)||0),g+=w,q.below=g<d),0>C.height&&(C.y+=C.height,
    C.height*=-1);q.plotY=C.y=Math.round(C.y||0)-this.borderWidth%2/2;C.height=Math.max(Math.round(C.height||0),.001);q.yBottom=C.y+C.height;C.height<=c&&!q.isNull?(C.height=c,C.y-=e,q.plotY=C.y,q.minPointLengthOffset=0>q.y?-e:e):(q.isNull&&(C.width=0),q.minPointLengthOffset=0);D=q.plotY+(q.negative?C.height:0);q.below&&(q.plotY+=C.height);q.tooltipPos&&(this.chart.inverted?q.tooltipPos[0]=b.len-D:q.tooltipPos[1]=D);}}};c.prototype.processData=function(b){var c=this.options,e=this.yData,d=c.data,g=e.length,
    k=c.threshold||0,l,n,p,q,t;for(t=n=l=p=q=0;t<g;t++){var z=e[t];var w=d&&d[t]?d[t]:{};"sum"===z||w.isSum?e[t]=m(n):"intermediateSum"===z||w.isIntermediateSum?(e[t]=m(l),l=0):(n+=z,l+=z);p=Math.min(n,p);q=Math.max(n,q);}a.prototype.processData.call(this,b);c.stacking||(this.dataMin=p+k,this.dataMax=q);};c.prototype.toYData=function(a){return a.isSum?"sum":a.isIntermediateSum?"intermediateSum":a.y};c.prototype.updateParallelArrays=function(b,c){a.prototype.updateParallelArrays.call(this,b,c);if("sum"===
    this.yData[0]||"intermediateSum"===this.yData[0])this.yData[0]=null;};c.prototype.pointAttribs=function(a,b){var c=this.options.upColor;c&&!a.options.color&&(a.color=0<a.y?c:null);a=x.prototype.pointAttribs.call(this,a,b);delete a.dashstyle;return a};c.prototype.getGraphPath=function(){return [["M",0,0]]};c.prototype.getCrispPath=function(){var a=this.data,b=this.yAxis,c=a.length,e=Math.round(this.graph.strokeWidth())%2/2,d=Math.round(this.borderWidth)%2/2,g=this.xAxis.reversed,k=this.yAxis.reversed,
    l=this.options.stacking,m=[],n;for(n=1;n<c;n++){var p=a[n].shapeArgs;var q=a[n-1];var t=a[n-1].shapeArgs;var w=b.waterfall.stacks[this.stackKey];var x=0<q.y?-t.height:0;w&&t&&p&&(w=w[n-1],l?(w=w.connectorThreshold,x=Math.round(b.translate(w,0,1,0,1)+(k?x:0))-e):x=t.y+q.minPointLengthOffset+d-e,m.push(["M",(t.x||0)+(g?0:t.width||0),x],["L",(p.x||0)+(g?p.width||0:0),x]));t&&m.length&&(!l&&0>q.y&&!k||0<q.y&&k)&&((q=m[m.length-2])&&"number"===typeof q[2]&&(q[2]+=t.height||0),(q=m[m.length-1])&&"number"===
    typeof q[2]&&(q[2]+=t.height||0));}return m};c.prototype.drawGraph=function(){w.prototype.drawGraph.call(this);this.graph.attr({d:this.getCrispPath()});};c.prototype.setStackedPoints=function(){function a(a,b,c,f){if(J)for(c;c<J;c++)A.stackState[c]+=f;else A.stackState[0]=a,J=A.stackState.length;A.stackState.push(A.stackState[J-1]+b);}var b=this.options,c=this.yAxis.waterfall.stacks,e=b.threshold,d=e||0,g=d,k=this.stackKey,l=this.xData,m=l.length,n,p,q;this.yAxis.stacking.usePercentage=!1;var t=p=q=
    d;if(this.visible||!this.chart.options.chart.ignoreHiddenSeries){var w=c.changed;(n=c.alreadyChanged)&&0>n.indexOf(k)&&(w=!0);c[k]||(c[k]={});n=c[k];for(var x=0;x<m;x++){var y=l[x];if(!n[y]||w)n[y]={negTotal:0,posTotal:0,stackTotal:0,threshold:0,stateIndex:0,stackState:[],label:w&&n[y]?n[y].label:void 0};var A=n[y];var G=this.yData[x];0<=G?A.posTotal+=G:A.negTotal+=G;var F=b.data[x];y=A.absolutePos=A.posTotal;var H=A.absoluteNeg=A.negTotal;A.stackTotal=y+H;var J=A.stackState.length;F&&F.isIntermediateSum?
    (a(q,p,0,q),q=p,p=e,d^=g,g^=d,d^=g):F&&F.isSum?(a(e,t,J),d=e):(a(d,G,0,t),F&&(t+=G,p+=G));A.stateIndex++;A.threshold=d;d+=A.stackTotal;}c.changed=!1;c.alreadyChanged||(c.alreadyChanged=[]);c.alreadyChanged.push(k);}};c.prototype.getExtremes=function(){var a=this.options.stacking;if(a){var c=this.yAxis;c=c.waterfall.stacks;var e=this.stackedYNeg=[];var d=this.stackedYPos=[];"overlap"===a?A(c[this.stackKey],function(a){e.push(g(a.stackState));d.push(b(a.stackState));}):A(c[this.stackKey],function(a){e.push(a.negTotal+
    a.threshold);d.push(a.posTotal+a.threshold);});return {dataMin:g(e),dataMax:b(d)}}return {dataMin:this.dataMin,dataMax:this.dataMax}};c.defaultOptions=q(x.defaultOptions,{dataLabels:{inside:!0},lineWidth:1,lineColor:"#333333",dashStyle:"Dot",borderColor:"#333333",states:{hover:{lineWidthPlus:0}}});return c}(x);k(a.prototype,{getZonesGraphs:w.prototype.getZonesGraphs,pointValKey:"y",showLine:!0,pointClass:t});l.registerSeriesType("waterfall",a);c.compose(d,e);return a});A(d,"Extensions/Polar.js",[d["Core/Animation/AnimationUtilities.js"],
    d["Core/Chart/Chart.js"],d["Core/Globals.js"],d["Extensions/Pane.js"],d["Core/Pointer.js"],d["Core/Series/Series.js"],d["Core/Series/SeriesRegistry.js"],d["Core/Renderer/SVG/SVGRenderer.js"],d["Core/Utilities.js"]],function(d,e,l,a,c,t,p,k,x){var w=d.animObject;p=p.seriesTypes;var b=x.addEvent,g=x.defined,m=x.find,n=x.isNumber,q=x.pick,A=x.splat,J=x.uniqueKey;d=x.wrap;var I=t.prototype;c=c.prototype;I.searchPointByAngle=function(a){var b=this.chart,c=this.xAxis.pane.center;return this.searchKDTree({clientX:180+
    -180/Math.PI*Math.atan2(a.chartX-c[0]-b.plotLeft,a.chartY-c[1]-b.plotTop)})};I.getConnectors=function(a,b,c,e){var f=e?1:0;var d=0<=b&&b<=a.length-1?b:0>b?a.length-1+b:0;b=0>d-1?a.length-(1+f):d-1;f=d+1>a.length-1?f:d+1;var g=a[b];f=a[f];var h=g.plotX;g=g.plotY;var k=f.plotX;var l=f.plotY;f=a[d].plotX;d=a[d].plotY;h=(1.5*f+h)/2.5;g=(1.5*d+g)/2.5;k=(1.5*f+k)/2.5;var r=(1.5*d+l)/2.5;l=Math.sqrt(Math.pow(h-f,2)+Math.pow(g-d,2));var n=Math.sqrt(Math.pow(k-f,2)+Math.pow(r-d,2));h=Math.atan2(g-d,h-f);r=
    Math.PI/2+(h+Math.atan2(r-d,k-f))/2;Math.abs(h-r)>Math.PI/2&&(r-=Math.PI);h=f+Math.cos(r)*l;g=d+Math.sin(r)*l;k=f+Math.cos(Math.PI+r)*n;r=d+Math.sin(Math.PI+r)*n;f={rightContX:k,rightContY:r,leftContX:h,leftContY:g,plotX:f,plotY:d};c&&(f.prevPointCont=this.getConnectors(a,b,!1,e));return f};I.toXY=function(a){var b=this.chart,c=this.xAxis,f=this.yAxis,d=a.plotX,e=a.plotY,g=a.series,k=b.inverted,l=a.y,m=k?d:f.len-e;k&&g&&!g.isRadialBar&&(a.plotY=e="number"===typeof l?f.translate(l)||0:0);a.rectPlotX=
    d;a.rectPlotY=e;f.center&&(m+=f.center[3]/2);n(e)&&(f=k?f.postTranslate(e,m):c.postTranslate(d,m),a.plotX=a.polarPlotX=f.x-b.plotLeft,a.plotY=a.polarPlotY=f.y-b.plotTop);this.kdByAngle?(b=(d/Math.PI*180+c.pane.options.startAngle)%360,0>b&&(b+=360),a.clientX=b):a.clientX=a.plotX;};p.spline&&(d(p.spline.prototype,"getPointSpline",function(a,b,c,d){this.chart.polar?d?(a=this.getConnectors(b,d,!0,this.connectEnds),b=a.prevPointCont&&a.prevPointCont.rightContX,c=a.prevPointCont&&a.prevPointCont.rightContY,
    a=["C",n(b)?b:a.plotX,n(c)?c:a.plotY,n(a.leftContX)?a.leftContX:a.plotX,n(a.leftContY)?a.leftContY:a.plotY,a.plotX,a.plotY]):a=["M",c.plotX,c.plotY]:a=a.call(this,b,c,d);return a}),p.areasplinerange&&(p.areasplinerange.prototype.getPointSpline=p.spline.prototype.getPointSpline));b(t,"afterTranslate",function(){var a=this.chart;if(a.polar&&this.xAxis){(this.kdByAngle=a.tooltip&&a.tooltip.shared)?this.searchPoint=this.searchPointByAngle:this.options.findNearestPointBy="xy";if(!this.preventPostTranslate)for(var c=
    this.points,d=c.length;d--;)this.toXY(c[d]),!a.hasParallelCoordinates&&!this.yAxis.reversed&&c[d].y<this.yAxis.min&&(c[d].isNull=!0);this.hasClipCircleSetter||(this.hasClipCircleSetter=!!this.eventsToUnbind.push(b(this,"afterRender",function(){if(a.polar){var b=this.yAxis.pane.center;this.clipCircle?this.clipCircle.animate({x:b[0],y:b[1],r:b[2]/2,innerR:b[3]/2}):this.clipCircle=a.renderer.clipCircle(b[0],b[1],b[2]/2,b[3]/2);this.group.clip(this.clipCircle);this.setClip=l.noop;}})));}},{order:2});d(p.line.prototype,
    "getGraphPath",function(a,b){var c=this,d;if(this.chart.polar){b=b||this.points;for(d=0;d<b.length;d++)if(!b[d].isNull){var e=d;break}if(!1!==this.options.connectEnds&&"undefined"!==typeof e){this.connectEnds=!0;b.splice(b.length,0,b[e]);var f=!0;}b.forEach(function(a){"undefined"===typeof a.polarPlotY&&c.toXY(a);});}d=a.apply(this,[].slice.call(arguments,1));f&&b.pop();return d});var y=function(a,b){var c=this,d=this.chart,e=this.options.animation,f=this.group,g=this.markerGroup,h=this.xAxis&&this.xAxis.center,
    k=d.plotLeft,n=d.plotTop,m,p,t,x;if(d.polar)if(c.isRadialBar)b||(c.startAngleRad=q(c.translatedThreshold,c.xAxis.startAngleRad),l.seriesTypes.pie.prototype.animate.call(c,b));else {if(d.renderer.isSVG)if(e=w(e),c.is("column")){if(!b){var y=h[3]/2;c.points.forEach(function(a){m=a.graphic;t=(p=a.shapeArgs)&&p.r;x=p&&p.innerR;m&&p&&(m.attr({r:y,innerR:y}),m.animate({r:t,innerR:x},c.options.animation));});}}else b?(a={translateX:h[0]+k,translateY:h[1]+n,scaleX:.001,scaleY:.001},f.attr(a),g&&g.attr(a)):(a=
    {translateX:k,translateY:n,scaleX:1,scaleY:1},f.animate(a,e),g&&g.animate(a,e));}else a.call(this,b);};d(I,"animate",y);if(p.column){var z=p.arearange.prototype;p=p.column.prototype;p.polarArc=function(a,b,c,d){var e=this.xAxis.center,f=this.yAxis.len,g=e[3]/2;b=f-b+g;a=f-q(a,f)+g;this.yAxis.reversed&&(0>b&&(b=g),0>a&&(a=g));return {x:e[0],y:e[1],r:b,innerR:a,start:c,end:d}};d(p,"animate",y);d(p,"translate",function(a){var b=this.options,c=b.stacking,d=this.chart,e=this.xAxis,f=this.yAxis,k=f.reversed,
    l=f.center,m=e.startAngleRad,p=e.endAngleRad-m;this.preventPostTranslate=!0;a.call(this);if(e.isRadial){a=this.points;e=a.length;var q=f.translate(f.min);var t=f.translate(f.max);b=b.threshold||0;if(d.inverted&&n(b)){var w=f.translate(b);g(w)&&(0>w?w=0:w>p&&(w=p),this.translatedThreshold=w+m);}for(;e--;){b=a[e];var y=b.barX;var z=b.x;var A=b.y;b.shapeType="arc";if(d.inverted){b.plotY=f.translate(A);if(c&&f.stacking){if(A=f.stacking.stacks[(0>A?"-":"")+this.stackKey],this.visible&&A&&A[z]&&!b.isNull){var G=
    A[z].points[this.getStackIndicator(void 0,z,this.index).key];var F=f.translate(G[0]);G=f.translate(G[1]);g(F)&&(F=x.clamp(F,0,p));}}else F=w,G=b.plotY;F>G&&(G=[F,F=G][0]);if(!k)if(F<q)F=q;else if(G>t)G=t;else {if(G<q||F>t)F=G=0;}else if(G>q)G=q;else if(F<t)F=t;else if(F>q||G<t)F=G=p;f.min>f.max&&(F=G=k?p:0);F+=m;G+=m;l&&(b.barX=y+=l[3]/2);z=Math.max(y,0);A=Math.max(y+b.pointWidth,0);b.shapeArgs={x:l&&l[0],y:l&&l[1],r:A,innerR:z,start:F,end:G};b.opacity=F===G?0:void 0;b.plotY=(g(this.translatedThreshold)&&
    (F<this.translatedThreshold?F:G))-m;}else F=y+m,b.shapeArgs=this.polarArc(b.yBottom,b.plotY,F,F+b.pointWidth);this.toXY(b);d.inverted?(y=f.postTranslate(b.rectPlotY,y+b.pointWidth/2),b.tooltipPos=[y.x-d.plotLeft,y.y-d.plotTop]):b.tooltipPos=[b.plotX,b.plotY];l&&(b.ttBelow=b.plotY>l[1]);}}});p.findAlignments=function(a,b){null===b.align&&(b.align=20<a&&160>a?"left":200<a&&340>a?"right":"center");null===b.verticalAlign&&(b.verticalAlign=45>a||315<a?"bottom":135<a&&225>a?"top":"middle");return b};z&&(z.findAlignments=
    p.findAlignments);d(p,"alignDataLabel",function(a,b,c,d,e,g){var f=this.chart,h=q(d.inside,!!this.options.stacking);f.polar?(a=b.rectPlotX/Math.PI*180,f.inverted?(this.forceDL=f.isInsidePlot(b.plotX,Math.round(b.plotY)),h&&b.shapeArgs?(e=b.shapeArgs,e=this.yAxis.postTranslate(((e.start||0)+(e.end||0))/2-this.xAxis.startAngleRad,b.barX+b.pointWidth/2),e={x:e.x-f.plotLeft,y:e.y-f.plotTop}):b.tooltipPos&&(e={x:b.tooltipPos[0],y:b.tooltipPos[1]}),d.align=q(d.align,"center"),d.verticalAlign=q(d.verticalAlign,
    "middle")):this.findAlignments&&(d=this.findAlignments(a,d)),I.alignDataLabel.call(this,b,c,d,e,g),this.isRadialBar&&b.shapeArgs&&b.shapeArgs.start===b.shapeArgs.end&&c.hide(!0)):a.call(this,b,c,d,e,g);});}d(c,"getCoordinates",function(a,b){var c=this.chart,d={xAxis:[],yAxis:[]};c.polar?c.axes.forEach(function(a){var e=a.isXAxis,f=a.center;if("colorAxis"!==a.coll){var g=b.chartX-f[0]-c.plotLeft;f=b.chartY-f[1]-c.plotTop;d[e?"xAxis":"yAxis"].push({axis:a,value:a.translate(e?Math.PI-Math.atan2(g,f):Math.sqrt(Math.pow(g,
    2)+Math.pow(f,2)),!0)});}}):d=a.call(this,b);return d});k.prototype.clipCircle=function(a,b,c,d){var e=J(),f=this.createElement("clipPath").attr({id:e}).add(this.defs);a=d?this.arc(a,b,c,d,0,2*Math.PI).add(f):this.circle(a,b,c).add(f);a.id=e;a.clipPath=f;return a};b(e,"getAxes",function(){this.pane||(this.pane=[]);this.options.pane=A(this.options.pane);this.options.pane.forEach(function(b){new a(b,this);},this);});b(e,"afterDrawChartBox",function(){this.pane.forEach(function(a){a.render();});});b(t,"afterInit",
    function(){var a=this.chart;a.inverted&&a.polar&&(this.isRadialSeries=!0,this.is("column")&&(this.isRadialBar=!0));});d(e.prototype,"get",function(a,b){return m(this.pane||[],function(a){return a.options.id===b})||a.call(this,b)});});A(d,"masters/highcharts-more.src.js",[d["Core/Globals.js"],d["Core/Axis/RadialAxis.js"],d["Series/Bubble/BubbleSeries.js"]],function(d,e,l){e.compose(d.Axis,d.Tick);l.compose(d.Chart,d.Legend,d.Series);});});

    });

    /*
     Highcharts JS v9.3.2 (2021-11-29)

     Data module

     (c) 2012-2021 Torstein Honsi

     License: www.highcharts.com/license
    */

    var data = createCommonjsModule(function (module) {
    (function(b){module.exports?(b["default"]=b,module.exports=b):b("undefined"!==typeof Highcharts?Highcharts:void 0);})(function(b){function p(b,h,w,p){b.hasOwnProperty(h)||(b[h]=p.apply(null,w));}b=b?b._modules:{};p(b,"Core/HttpUtilities.js",[b["Core/Globals.js"],b["Core/Utilities.js"]],function(b,h){var w=b.doc,p=h.createElement,v=h.discardElement,
    q=h.merge,E=h.objectEach,x={ajax:function(b){var m=q(!0,{url:!1,type:"get",dataType:"json",success:!1,error:!1,data:!1,headers:{}},b);b={json:"application/json",xml:"application/xml",text:"text/plain",octet:"application/octet-stream"};var h=new XMLHttpRequest;if(!m.url)return !1;h.open(m.type.toUpperCase(),m.url,!0);m.headers["Content-Type"]||h.setRequestHeader("Content-Type",b[m.dataType]||b.text);E(m.headers,function(b,m){h.setRequestHeader(m,b);});h.onreadystatechange=function(){if(4===h.readyState){if(200===
    h.status){var b=h.responseText;if("json"===m.dataType)try{b=JSON.parse(b);}catch(B){m.error&&m.error(h,B);return}return m.success&&m.success(b)}m.error&&m.error(h,h.responseText);}};try{m.data=JSON.stringify(m.data);}catch(F){}h.send(m.data||!0);},getJSON:function(b,h){x.ajax({url:b,success:h,dataType:"json",headers:{"Content-Type":"text/plain"}});},post:function(b,h,x){var m=p("form",q({method:"post",action:b,enctype:"multipart/form-data"},x),{display:"none"},w.body);E(h,function(b,h){p("input",{type:"hidden",
    name:h,value:b},null,m);});m.submit();v(m);}};return x});p(b,"Extensions/Data.js",[b["Core/Chart/Chart.js"],b["Core/Globals.js"],b["Core/HttpUtilities.js"],b["Core/Series/Point.js"],b["Core/Series/SeriesRegistry.js"],b["Core/Utilities.js"]],function(b,h,p,H,I,q){var v=h.doc,x=p.ajax,w=I.seriesTypes;p=q.addEvent;var m=q.defined,J=q.extend,F=q.fireEvent,B=q.isNumber,C=q.merge,K=q.objectEach,D=q.pick,L=q.splat;q=function(){function b(a,c,g){this.options=this.rawColumns=this.firstRowAsNames=this.chartOptions=
    this.chart=void 0;this.dateFormats={"YYYY/mm/dd":{regex:/^([0-9]{4})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{1,2})$/,parser:function(a){return a?Date.UTC(+a[1],a[2]-1,+a[3]):NaN}},"dd/mm/YYYY":{regex:/^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{4})$/,parser:function(a){return a?Date.UTC(+a[3],a[2]-1,+a[1]):NaN},alternative:"mm/dd/YYYY"},"mm/dd/YYYY":{regex:/^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{4})$/,parser:function(a){return a?Date.UTC(+a[3],a[1]-1,+a[2]):NaN}},"dd/mm/YY":{regex:/^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{2})$/,
    parser:function(a){if(!a)return NaN;var c=+a[3];c=c>(new Date).getFullYear()-2E3?c+1900:c+2E3;return Date.UTC(c,a[2]-1,+a[1])},alternative:"mm/dd/YY"},"mm/dd/YY":{regex:/^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{2})$/,parser:function(a){return a?Date.UTC(+a[3]+2E3,a[1]-1,+a[2]):NaN}}};this.init(a,c,g);}b.prototype.init=function(a,c,g){var d=a.decimalPoint;c&&(this.chartOptions=c);g&&(this.chart=g);"."!==d&&","!==d&&(d=void 0);this.options=a;this.columns=a.columns||this.rowsToColumns(a.rows)||
    [];this.firstRowAsNames=D(a.firstRowAsNames,this.firstRowAsNames,!0);this.decimalRegex=d&&new RegExp("^(-?[0-9]+)"+d+"([0-9]+)$");this.rawColumns=[];if(this.columns.length){this.dataFound();var e=!0;}this.hasURLOption(a)&&(clearTimeout(this.liveDataTimeout),e=!1);e||(e=this.fetchLiveData());e||(e=!!this.parseCSV().length);e||(e=!!this.parseTable().length);e||(e=this.parseGoogleSpreadsheet());!e&&a.afterComplete&&a.afterComplete();};b.prototype.hasURLOption=function(a){return !(!a||!(a.rowsURL||a.csvURL||
    a.columnsURL))};b.prototype.getColumnDistribution=function(){var a=this.chartOptions,c=this.options,g=[],d=function(a){return (w[a||"line"].prototype.pointArrayMap||[0]).length},e=a&&a.chart&&a.chart.type,b=[],l=[],n=0;c=c&&c.seriesMapping||a&&a.series&&a.series.map(function(){return {x:0}})||[];var f;(a&&a.series||[]).forEach(function(a){b.push(d(a.type||e));});c.forEach(function(a){g.push(a.x||0);});0===g.length&&g.push(0);c.forEach(function(c){var g=new G,k=b[n]||d(e),h=(a&&a.series||[])[n]||{},u=
    w[h.type||e||"line"].prototype.pointArrayMap,p=u||["y"];(m(c.x)||h.isCartesian||!u)&&g.addColumnReader(c.x,"x");K(c,function(a,c){"x"!==c&&g.addColumnReader(a,c);});for(f=0;f<k;f++)g.hasReader(p[f])||g.addColumnReader(void 0,p[f]);l.push(g);n++;});c=w[e||"line"].prototype.pointArrayMap;"undefined"===typeof c&&(c=["y"]);this.valueCount={global:d(e),xColumns:g,individual:b,seriesBuilders:l,globalPointArrayMap:c};};b.prototype.dataFound=function(){this.options.switchRowsAndColumns&&(this.columns=this.rowsToColumns(this.columns));
    this.getColumnDistribution();this.parseTypes();!1!==this.parsed()&&this.complete();};b.prototype.parseCSV=function(a){function c(a,c,g,d){function b(c){k=a[c];l=a[c-1];r=a[c+1];}function e(a){m.length<y+1&&m.push([a]);m[y][m[y].length-1]!==a&&m[y].push(a);}function n(){f>t||t>h?(++t,u=""):(!isNaN(parseFloat(u))&&isFinite(u)?(u=parseFloat(u),e("number")):isNaN(Date.parse(u))?e("string"):(u=u.replace(/\//g,"-"),e("date")),p.length<y+1&&p.push([]),g||(p[y][c]=u),u="",++y,++t);}var z=0,k="",l="",r="",u="",
    t=0,y=0;if(a.trim().length&&"#"!==a.trim()[0]){for(;z<a.length;z++)if(b(z),'"'===k)for(b(++z);z<a.length&&('"'!==k||'"'===l||'"'===r);){if('"'!==k||'"'===k&&'"'!==l)u+=k;b(++z);}else d&&d[k]?d[k](k,u)&&n():k===q?n():u+=k;n();}}function g(a){var c=0,g=0,d=!1;a.some(function(a,d){var b=!1,e="";if(13<d)return !0;for(var k=0;k<a.length;k++){d=a[k];var n=a[k+1];var l=a[k-1];if("#"===d)break;if('"'===d)if(b){if('"'!==l&&'"'!==n){for(;" "===n&&k<a.length;)n=a[++k];"undefined"!==typeof t[n]&&t[n]++;b=!1;}}else b=
    !0;else "undefined"!==typeof t[d]?(e=e.trim(),isNaN(Date.parse(e))?!isNaN(e)&&isFinite(e)||t[d]++:t[d]++,e=""):e+=d;","===d&&g++;"."===d&&c++;}});d=t[";"]>t[","]?";":",";b.decimalPoint||(b.decimalPoint=c>g?".":",",e.decimalRegex=new RegExp("^(-?[0-9]+)"+b.decimalPoint+"([0-9]+)$"));return d}function d(a,c){var d=[],g=0,k=!1,n=[],l=[],f;if(!c||c>a.length)c=a.length;for(;g<c;g++)if("undefined"!==typeof a[g]&&a[g]&&a[g].length){var r=a[g].trim().replace(/\//g," ").replace(/\-/g," ").replace(/\./g," ").split(" ");
    d=["","",""];for(f=0;f<r.length;f++)f<d.length&&(r[f]=parseInt(r[f],10),r[f]&&(l[f]=!l[f]||l[f]<r[f]?r[f]:l[f],"undefined"!==typeof n[f]?n[f]!==r[f]&&(n[f]=!1):n[f]=r[f],31<r[f]?d[f]=100>r[f]?"YY":"YYYY":12<r[f]&&31>=r[f]?(d[f]="dd",k=!0):d[f].length||(d[f]="mm")));}if(k){for(f=0;f<n.length;f++)!1!==n[f]?12<l[f]&&"YY"!==d[f]&&"YYYY"!==d[f]&&(d[f]="YY"):12<l[f]&&"mm"===d[f]&&(d[f]="dd");3===d.length&&"dd"===d[1]&&"dd"===d[2]&&(d[2]="YY");a=d.join("/");return (b.dateFormats||e.dateFormats)[a]?a:(F("deduceDateFailed"),
    "YYYY/mm/dd")}return "YYYY/mm/dd"}var e=this,b=a||this.options,l=b.csv;a="undefined"!==typeof b.startRow&&b.startRow?b.startRow:0;var n=b.endRow||Number.MAX_VALUE,f="undefined"!==typeof b.startColumn&&b.startColumn?b.startColumn:0,h=b.endColumn||Number.MAX_VALUE,r=0,m=[],t={",":0,";":0,"\t":0};var p=this.columns=[];l&&b.beforeParse&&(l=b.beforeParse.call(this,l));if(l){l=l.replace(/\r\n/g,"\n").replace(/\r/g,"\n").split(b.lineDelimiter||"\n");if(!a||0>a)a=0;if(!n||n>=l.length)n=l.length-1;if(b.itemDelimiter)var q=
    b.itemDelimiter;else q=null,q=g(l);var A=0;for(r=a;r<=n;r++)"#"===l[r][0]?A++:c(l[r],r-a-A);b.columnTypes&&0!==b.columnTypes.length||!m.length||!m[0].length||"date"!==m[0][1]||b.dateFormat||(b.dateFormat=d(p[0]));this.dataFound();}return p};b.prototype.parseTable=function(){var a=this.options,c=a.table,g=this.columns||[],d=a.startRow||0,b=a.endRow||Number.MAX_VALUE,k=a.startColumn||0,l=a.endColumn||Number.MAX_VALUE;c&&("string"===typeof c&&(c=v.getElementById(c)),[].forEach.call(c.getElementsByTagName("tr"),
    function(a,c){c>=d&&c<=b&&[].forEach.call(a.children,function(a,b){var e=g[b-k],f=1;if(("TD"===a.tagName||"TH"===a.tagName)&&b>=k&&b<=l)for(g[b-k]||(g[b-k]=[]),g[b-k][c-d]=a.innerHTML;c-d>=f&&void 0===e[c-d-f];)e[c-d-f]=null,f++;});}),this.dataFound());return g};b.prototype.fetchLiveData=function(){function a(e){function f(f,n,h){function r(){k&&g.liveDataURL===f&&(c.liveDataTimeout=setTimeout(a,l));}if(!f||!/^(http|\/|\.\/|\.\.\/)/.test(f))return f&&d.error&&d.error("Invalid URL"),!1;e&&(clearTimeout(c.liveDataTimeout),
    g.liveDataURL=f);x({url:f,dataType:h||"json",success:function(a){g&&g.series&&n(a);r();},error:function(a,c){3>++b&&r();return d.error&&d.error(c,a)}});return !0}f(n.csvURL,function(a){g.update({data:{csv:a}});},"text")||f(n.rowsURL,function(a){g.update({data:{rows:a}});})||f(n.columnsURL,function(a){g.update({data:{columns:a}});});}var c=this,g=this.chart,d=this.options,b=0,k=d.enablePolling,l=1E3*(d.dataRefreshRate||2),n=C(d);if(!this.hasURLOption(d))return !1;1E3>l&&(l=1E3);delete d.csvURL;delete d.rowsURL;
    delete d.columnsURL;a(!0);return this.hasURLOption(d)};b.prototype.parseGoogleSpreadsheet=function(){function a(c){var b=["https://sheets.googleapis.com/v4/spreadsheets",d,"values",l(),"?alt=json&majorDimension=COLUMNS&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING&key="+g.googleAPIKey].join("/");x({url:b,dataType:"json",success:function(d){c(d);g.enablePolling&&setTimeout(function(){a(c);},k);},error:function(a,c){return g.error&&g.error(c,a)}});}var c=this,g=this.options,
    d=g.googleSpreadsheetKey,b=this.chart,k=Math.max(1E3*(g.dataRefreshRate||2),4E3),l=function(){if(g.googleSpreadsheetRange)return g.googleSpreadsheetRange;var a=("ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(g.startColumn||0)||"A")+((g.startRow||0)+1),c="ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(D(g.endColumn,-1))||"ZZ";m(g.endRow)&&(c+=g.endRow+1);return a+":"+c};d&&(delete g.googleSpreadsheetKey,a(function(a){a=a.values;if(!a||0===a.length)return !1;var d=a.reduce(function(a,c){return Math.max(a,c.length)},0);a.forEach(function(a){for(var c=
    0;c<d;c++)"undefined"===typeof a[c]&&(a[c]=null);});b&&b.series?b.update({data:{columns:a}}):(c.columns=a,c.dataFound());}));return !1};b.prototype.trim=function(a,c){"string"===typeof a&&(a=a.replace(/^\s+|\s+$/g,""),c&&/^[0-9\s]+$/.test(a)&&(a=a.replace(/\s/g,"")),this.decimalRegex&&(a=a.replace(this.decimalRegex,"$1.$2")));return a};b.prototype.parseTypes=function(){for(var a=this.columns,c=a.length;c--;)this.parseColumn(a[c],c);};b.prototype.parseColumn=function(a,c){var b=this.rawColumns,d=this.columns,
    e=a.length,k=this.firstRowAsNames,l=-1!==this.valueCount.xColumns.indexOf(c),n,f=[],h=this.chartOptions,m,p=(this.options.columnTypes||[])[c];h=l&&(h&&h.xAxis&&"category"===L(h.xAxis)[0].type||"string"===p);for(b[c]||(b[c]=[]);e--;){var t=f[e]||a[e];var q=this.trim(t);var A=this.trim(t,!0);var v=parseFloat(A);"undefined"===typeof b[c][e]&&(b[c][e]=q);h||0===e&&k?a[e]=""+q:+A===v?(a[e]=v,31536E6<v&&"float"!==p?a.isDatetime=!0:a.isNumeric=!0,"undefined"!==typeof a[e+1]&&(m=v>a[e+1])):(q&&q.length&&
    (n=this.parseDate(t)),l&&B(n)&&"float"!==p?(f[e]=t,a[e]=n,a.isDatetime=!0,"undefined"!==typeof a[e+1]&&(t=n>a[e+1],t!==m&&"undefined"!==typeof m&&(this.alternativeFormat?(this.dateFormat=this.alternativeFormat,e=a.length,this.alternativeFormat=this.dateFormats[this.dateFormat].alternative):a.unsorted=!0),m=t)):(a[e]=""===q?null:q,0!==e&&(a.isDatetime||a.isNumeric)&&(a.mixed=!0)));}l&&a.mixed&&(d[c]=b[c]);if(l&&m&&this.options.sort)for(c=0;c<d.length;c++)d[c].reverse(),k&&d[c].unshift(d[c].pop());};
    b.prototype.parseDate=function(a){var c=this.options.parseDate,b,d=this.options.dateFormat||this.dateFormat,e;if(c)var k=c(a);else if("string"===typeof a){if(d)(c=this.dateFormats[d])||(c=this.dateFormats["YYYY/mm/dd"]),(e=a.match(c.regex))&&(k=c.parser(e));else for(b in this.dateFormats)if(c=this.dateFormats[b],e=a.match(c.regex)){this.dateFormat=b;this.alternativeFormat=c.alternative;k=c.parser(e);break}e||(a.match(/:.+(GMT|UTC|[Z+-])/)&&(a=a.replace(/\s*(?:GMT|UTC)?([+-])(\d\d)(\d\d)$/,"$1$2:$3").replace(/(?:\s+|GMT|UTC)([+-])/,
    "$1").replace(/(\d)\s*(?:GMT|UTC|Z)$/,"$1+00:00")),e=Date.parse(a),"object"===typeof e&&null!==e&&e.getTime?k=e.getTime()-6E4*e.getTimezoneOffset():B(e)&&(k=e-6E4*(new Date(e)).getTimezoneOffset()));}return k};b.prototype.rowsToColumns=function(a){var c,b;if(a){var d=[];var e=a.length;for(c=0;c<e;c++){var k=a[c].length;for(b=0;b<k;b++)d[b]||(d[b]=[]),d[b][c]=a[c][b];}}return d};b.prototype.getData=function(){if(this.columns)return this.rowsToColumns(this.columns).slice(1)};b.prototype.parsed=function(){if(this.options.parsed)return this.options.parsed.call(this,
    this.columns)};b.prototype.getFreeIndexes=function(a,c){var b,d=[],e=[];for(b=0;b<a;b+=1)d.push(!0);for(a=0;a<c.length;a+=1){var k=c[a].getReferencedColumnIndexes();for(b=0;b<k.length;b+=1)d[k[b]]=!1;}for(b=0;b<d.length;b+=1)d[b]&&e.push(b);return e};b.prototype.complete=function(){var a=this.columns,c,b=this.options,d,e,k=[];if(b.complete||b.afterComplete){if(this.firstRowAsNames)for(d=0;d<a.length;d++){var l=a[d];m(l.name)||(l.name=D(l.shift(),"").toString());}l=[];var h=this.getFreeIndexes(a.length,
    this.valueCount.seriesBuilders);for(d=0;d<this.valueCount.seriesBuilders.length;d++){var f=this.valueCount.seriesBuilders[d];f.populateColumns(h)&&k.push(f);}for(;0<h.length;){f=new G;f.addColumnReader(0,"x");d=h.indexOf(0);-1!==d&&h.splice(d,1);for(d=0;d<this.valueCount.global;d++)f.addColumnReader(void 0,this.valueCount.globalPointArrayMap[d]);f.populateColumns(h)&&k.push(f);}0<k.length&&0<k[0].readers.length&&(f=a[k[0].readers[0].columnIndex],"undefined"!==typeof f&&(f.isDatetime?c="datetime":f.isNumeric||
    (c="category")));if("category"===c)for(d=0;d<k.length;d++)for(f=k[d],h=0;h<f.readers.length;h++)"x"===f.readers[h].configName&&(f.readers[h].configName="name");for(d=0;d<k.length;d++){f=k[d];h=[];for(e=0;e<a[0].length;e++)h[e]=f.read(a,e);l[d]={data:h};f.name&&(l[d].name=f.name);"category"===c&&(l[d].turboThreshold=0);}a={series:l};c&&(a.xAxis={type:c},"category"===c&&(a.xAxis.uniqueNames=!1));b.complete&&b.complete(a);b.afterComplete&&b.afterComplete(a);}};b.prototype.update=function(a,c){var b=this.chart;
    a&&(a.afterComplete=function(a){a&&(a.xAxis&&b.xAxis[0]&&a.xAxis.type===b.xAxis[0].options.type&&delete a.xAxis,b.update(a,c,!0));},C(!0,b.options.data,a),this.init(b.options.data));};return b}();h.data=function(b,a,c){return new h.Data(b,a,c)};p(b,"init",function(b){var a=this,c=b.args[0]||{},g=b.args[1];c&&c.data&&!a.hasDataDef&&(a.hasDataDef=!0,a.data=new h.Data(J(c.data,{afterComplete:function(b){var d;if(Object.hasOwnProperty.call(c,"series"))if("object"===typeof c.series)for(d=Math.max(c.series.length,
    b&&b.series?b.series.length:0);d--;){var k=c.series[d]||{};c.series[d]=C(k,b&&b.series?b.series[d]:{});}else delete c.series;c=C(b,c);a.init(c,g);}}),c,a),b.preventDefault());});var G=function(){function b(){this.readers=[];this.pointIsArray=!0;this.name=void 0;}b.prototype.populateColumns=function(a){var b=!0;this.readers.forEach(function(b){"undefined"===typeof b.columnIndex&&(b.columnIndex=a.shift());});this.readers.forEach(function(a){"undefined"===typeof a.columnIndex&&(b=!1);});return b};b.prototype.read=
    function(a,b){var c=this.pointIsArray,d=c?[]:{};this.readers.forEach(function(e){var g=a[e.columnIndex][b];c?d.push(g):0<e.configName.indexOf(".")?H.prototype.setNestedProperty(d,g,e.configName):d[e.configName]=g;});if("undefined"===typeof this.name&&2<=this.readers.length){var e=this.getReferencedColumnIndexes();2<=e.length&&(e.shift(),e.sort(function(a,b){return a-b}),this.name=a[e.shift()].name);}return d};b.prototype.addColumnReader=function(a,b){this.readers.push({columnIndex:a,configName:b});
    "x"!==b&&"y"!==b&&"undefined"!==typeof b&&(this.pointIsArray=!1);};b.prototype.getReferencedColumnIndexes=function(){var a,b=[];for(a=0;a<this.readers.length;a+=1){var g=this.readers[a];"undefined"!==typeof g.columnIndex&&b.push(g.columnIndex);}return b};b.prototype.hasReader=function(a){var b;for(b=0;b<this.readers.length;b+=1){var g=this.readers[b];if(g.configName===a)return !0}};return b}();h.Data=q;return h.Data});p(b,"masters/modules/data.src.js",[b["Core/Globals.js"],b["Core/HttpUtilities.js"],
    b["Extensions/Data.js"]],function(b,h,p){b.ajax=h.ajax;b.getJSON=h.getJSON;b.post=h.post;b.Data=p;b.HttpUtilities=h;});});

    });

    /*
     Highcharts JS v9.3.2 (2021-11-29)

     (c) 2009-2021 Torstein Honsi

     License: www.highcharts.com/license
    */

    var highcharts = createCommonjsModule(function (module) {
    (function(Z,M){module.exports?(M["default"]=M,module.exports=Z.document?M(Z):M):(Z.Highcharts&&Z.Highcharts.error(16,!0),Z.Highcharts=M(Z));})("undefined"!==typeof window?window:commonjsGlobal,function(Z){function M(v,a,z,F){v.hasOwnProperty(a)||(v[a]=F.apply(null,z));}var a={};M(a,"Core/Globals.js",[],function(){var v="undefined"!==typeof Z?Z:"undefined"!==typeof window?window:
    {},a;(function(a){a.SVG_NS="http://www.w3.org/2000/svg";a.product="Highcharts";a.version="9.3.2";a.win=v;a.doc=a.win.document;a.svg=a.doc&&a.doc.createElementNS&&!!a.doc.createElementNS(a.SVG_NS,"svg").createSVGRect;a.userAgent=a.win.navigator&&a.win.navigator.userAgent||"";a.isChrome=-1!==a.userAgent.indexOf("Chrome");a.isFirefox=-1!==a.userAgent.indexOf("Firefox");a.isMS=/(edge|msie|trident)/i.test(a.userAgent)&&!a.win.opera;a.isSafari=!a.isChrome&&-1!==a.userAgent.indexOf("Safari");a.isTouchDevice=
    /(Mobile|Android|Windows Phone)/.test(a.userAgent);a.isWebKit=-1!==a.userAgent.indexOf("AppleWebKit");a.deg2rad=2*Math.PI/360;a.hasBidiBug=a.isFirefox&&4>parseInt(a.userAgent.split("Firefox/")[1],10);a.hasTouch=!!a.win.TouchEvent;a.marginNames=["plotTop","marginRight","marginBottom","plotLeft"];a.noop=function(){};a.supportsPassiveEvents=function(){var v=!1;if(!a.isMS){var u=Object.defineProperty({},"passive",{get:function(){v=!0;}});a.win.addEventListener&&a.win.removeEventListener&&(a.win.addEventListener("testPassive",
    a.noop,u),a.win.removeEventListener("testPassive",a.noop,u));}return v}();a.charts=[];a.dateFormats={};a.seriesTypes={};a.symbolSizes={};a.chartCount=0;})(a||(a={}));return a});M(a,"Core/Utilities.js",[a["Core/Globals.js"]],function(a){function v(m,b,d,g){var D=b?"Highcharts error":"Highcharts warning";32===m&&(m=D+": Deprecated member");var x=n(m),c=x?D+" #"+m+": www.highcharts.com/errors/"+m+"/":m.toString();if("undefined"!==typeof g){var r="";x&&(c+="?");B(g,function(m,b){r+="\n - "+b+": "+m;
    x&&(c+=encodeURI(b)+"="+encodeURI(m));});c+=r;}J(a,"displayError",{chart:d,code:m,message:c,params:g},function(){if(b)throw Error(c);l.console&&-1===v.messages.indexOf(c)&&console.warn(c);});v.messages.push(c);}function z(m,b){var d={};B(m,function(D,x){if(H(m[x],!0)&&!m.nodeType&&b[x])D=z(m[x],b[x]),Object.keys(D).length&&(d[x]=D);else if(H(m[x])||m[x]!==b[x])d[x]=m[x];});return d}function F(m,b){return parseInt(m,b||10)}function y(m){return "string"===typeof m}function G(m){m=Object.prototype.toString.call(m);
    return "[object Array]"===m||"[object Array Iterator]"===m}function H(m,b){return !!m&&"object"===typeof m&&(!b||!G(m))}function A(m){return H(m)&&"number"===typeof m.nodeType}function q(m){var b=m&&m.constructor;return !(!H(m,!0)||A(m)||!b||!b.name||"Object"===b.name)}function n(m){return "number"===typeof m&&!isNaN(m)&&Infinity>m&&-Infinity<m}function k(m){return "undefined"!==typeof m&&null!==m}function e(m,b,d){var D;y(b)?k(d)?m.setAttribute(b,d):m&&m.getAttribute&&((D=m.getAttribute(b))||"class"!==
    b||(D=m.getAttribute(b+"Name"))):B(b,function(b,d){k(b)?m.setAttribute(d,b):m.removeAttribute(d);});return D}function c(b,d){var m;b||(b={});for(m in d)b[m]=d[m];return b}function h(){for(var b=arguments,d=b.length,x=0;x<d;x++){var g=b[x];if("undefined"!==typeof g&&null!==g)return g}}function f(b,d){a.isMS&&!a.svg&&d&&"undefined"!==typeof d.opacity&&(d.filter="alpha(opacity="+100*d.opacity+")");c(b.style,d);}function w(b,d){return 1E14<b?b:parseFloat(b.toPrecision(d||14))}function p(b,d,x){var m=a.getStyle||
    p;if("width"===d)return d=Math.min(b.offsetWidth,b.scrollWidth),x=b.getBoundingClientRect&&b.getBoundingClientRect().width,x<d&&x>=d-1&&(d=Math.floor(x)),Math.max(0,d-(m(b,"padding-left",!0)||0)-(m(b,"padding-right",!0)||0));if("height"===d)return Math.max(0,Math.min(b.offsetHeight,b.scrollHeight)-(m(b,"padding-top",!0)||0)-(m(b,"padding-bottom",!0)||0));l.getComputedStyle||v(27,!0);if(b=l.getComputedStyle(b,void 0)){var g=b.getPropertyValue(d);h(x,"opacity"!==d)&&(g=F(g));}return g}function B(b,d,
    g){for(var m in b)Object.hasOwnProperty.call(b,m)&&d.call(g||b[m],b[m],m,b);}function t(b,d,g){function m(d,m){var L=b.removeEventListener||a.removeEventListenerPolyfill;L&&L.call(b,d,m,!1);}function x(g){var x;if(b.nodeName){if(d){var L={};L[d]=!0;}else L=g;B(L,function(b,d){if(g[d])for(x=g[d].length;x--;)m(d,g[d][x].fn);});}}var D="function"===typeof b&&b.prototype||b;if(Object.hasOwnProperty.call(D,"hcEvents")){var l=D.hcEvents;d?(D=l[d]||[],g?(l[d]=D.filter(function(b){return g!==b.fn}),m(d,g)):(x(l),
    l[d]=[])):(x(l),delete D.hcEvents);}}function J(b,d,g,l){g=g||{};if(r.createEvent&&(b.dispatchEvent||b.fireEvent&&b!==a)){var m=r.createEvent("Events");m.initEvent(d,!0,!0);g=c(m,g);b.dispatchEvent?b.dispatchEvent(g):b.fireEvent(d,g);}else if(b.hcEvents){g.target||c(g,{preventDefault:function(){g.defaultPrevented=!0;},target:b,type:d});m=[];for(var x=b,D=!1;x.hcEvents;)Object.hasOwnProperty.call(x,"hcEvents")&&x.hcEvents[d]&&(m.length&&(D=!0),m.unshift.apply(m,x.hcEvents[d])),x=Object.getPrototypeOf(x);
    D&&m.sort(function(b,d){return b.order-d.order});m.forEach(function(d){!1===d.fn.call(b,g)&&g.preventDefault();});}l&&!g.defaultPrevented&&l.call(b,g);}var C=a.charts,r=a.doc,l=a.win;(v||(v={})).messages=[];Math.easeInOutSine=function(b){return -.5*(Math.cos(Math.PI*b)-1)};var b=Array.prototype.find?function(b,d){return b.find(d)}:function(b,d){var m,g=b.length;for(m=0;m<g;m++)if(d(b[m],m))return b[m]};B({map:"map",each:"forEach",grep:"filter",reduce:"reduce",some:"some"},function(b,d){a[d]=function(m){var g;
    v(32,!1,void 0,(g={},g["Highcharts."+d]="use Array."+b,g));return Array.prototype[b].apply(m,[].slice.call(arguments,1))};});var g,d=function(){var b=Math.random().toString(36).substring(2,9)+"-",d=0;return function(){return "highcharts-"+(g?"":b)+d++}}();l.jQuery&&(l.jQuery.fn.highcharts=function(){var b=[].slice.call(arguments);if(this[0])return b[0]?(new (a[y(b[0])?b.shift():"Chart"])(this[0],b[0],b[1]),this):C[e(this[0],"data-highcharts-chart")]});b={addEvent:function(b,d,g,l){void 0===l&&(l={});
    var m="function"===typeof b&&b.prototype||b;Object.hasOwnProperty.call(m,"hcEvents")||(m.hcEvents={});m=m.hcEvents;a.Point&&b instanceof a.Point&&b.series&&b.series.chart&&(b.series.chart.runTrackerClick=!0);var x=b.addEventListener||a.addEventListenerPolyfill;x&&x.call(b,d,g,a.supportsPassiveEvents?{passive:void 0===l.passive?-1!==d.indexOf("touch"):l.passive,capture:!1}:!1);m[d]||(m[d]=[]);m[d].push({fn:g,order:"number"===typeof l.order?l.order:Infinity});m[d].sort(function(b,d){return b.order-
    d.order});return function(){t(b,d,g);}},arrayMax:function(b){for(var d=b.length,m=b[0];d--;)b[d]>m&&(m=b[d]);return m},arrayMin:function(b){for(var d=b.length,m=b[0];d--;)b[d]<m&&(m=b[d]);return m},attr:e,clamp:function(b,d,g){return b>d?b<g?b:g:d},cleanRecursively:z,clearTimeout:function(b){k(b)&&clearTimeout(b);},correctFloat:w,createElement:function(b,d,g,l,e){b=r.createElement(b);d&&c(b,d);e&&f(b,{padding:"0",border:"none",margin:"0"});g&&f(b,g);l&&l.appendChild(b);return b},css:f,defined:k,destroyObjectProperties:function(b,
    d){B(b,function(m,g){m&&m!==d&&m.destroy&&m.destroy();delete b[g];});},discardElement:function(b){b&&b.parentElement&&b.parentElement.removeChild(b);},erase:function(b,d){for(var m=b.length;m--;)if(b[m]===d){b.splice(m,1);break}},error:v,extend:c,extendClass:function(b,d){var m=function(){};m.prototype=new b;c(m.prototype,d);return m},find:b,fireEvent:J,getMagnitude:function(b){return Math.pow(10,Math.floor(Math.log(b)/Math.LN10))},getNestedProperty:function(b,d){for(b=b.split(".");b.length&&k(d);){var m=
    b.shift();if("undefined"===typeof m||"__proto__"===m)return;d=d[m];if(!k(d)||"function"===typeof d||"number"===typeof d.nodeType||d===l)return}return d},getStyle:p,inArray:function(b,d,g){v(32,!1,void 0,{"Highcharts.inArray":"use Array.indexOf"});return d.indexOf(b,g)},isArray:G,isClass:q,isDOMElement:A,isFunction:function(b){return "function"===typeof b},isNumber:n,isObject:H,isString:y,keys:function(b){v(32,!1,void 0,{"Highcharts.keys":"use Object.keys"});return Object.keys(b)},merge:function(){var b,
    d=arguments,g={},l=function(b,d){"object"!==typeof b&&(b={});B(d,function(m,g){"__proto__"!==g&&"constructor"!==g&&(!H(m,!0)||q(m)||A(m)?b[g]=d[g]:b[g]=l(b[g]||{},m));});return b};!0===d[0]&&(g=d[1],d=Array.prototype.slice.call(d,2));var c=d.length;for(b=0;b<c;b++)g=l(g,d[b]);return g},normalizeTickInterval:function(b,d,g,l,c){var m=b;g=h(g,1);var r=b/g;d||(d=c?[1,1.2,1.5,2,2.5,3,4,5,6,8,10]:[1,2,2.5,5,10],!1===l&&(1===g?d=d.filter(function(b){return 0===b%1}):.1>=g&&(d=[1/g])));for(l=0;l<d.length&&
    !(m=d[l],c&&m*g>=b||!c&&r<=(d[l]+(d[l+1]||d[l]))/2);l++);return m=w(m*g,-Math.round(Math.log(.001)/Math.LN10))},objectEach:B,offset:function(b){var d=r.documentElement;b=b.parentElement||b.parentNode?b.getBoundingClientRect():{top:0,left:0,width:0,height:0};return {top:b.top+(l.pageYOffset||d.scrollTop)-(d.clientTop||0),left:b.left+(l.pageXOffset||d.scrollLeft)-(d.clientLeft||0),width:b.width,height:b.height}},pad:function(b,d,g){return Array((d||2)+1-String(b).replace("-","").length).join(g||"0")+
    b},pick:h,pInt:F,relativeLength:function(b,d,g){return /%$/.test(b)?d*parseFloat(b)/100+(g||0):parseFloat(b)},removeEvent:t,splat:function(b){return G(b)?b:[b]},stableSort:function(b,d){var g=b.length,m,l;for(l=0;l<g;l++)b[l].safeI=l;b.sort(function(b,g){m=d(b,g);return 0===m?b.safeI-g.safeI:m});for(l=0;l<g;l++)delete b[l].safeI;},syncTimeout:function(b,d,g){if(0<d)return setTimeout(b,d,g);b.call(0,g);return -1},timeUnits:{millisecond:1,second:1E3,minute:6E4,hour:36E5,day:864E5,week:6048E5,month:24192E5,
    year:314496E5},uniqueKey:d,useSerialIds:function(b){return g=h(b,g)},wrap:function(b,d,g){var m=b[d];b[d]=function(){var b=Array.prototype.slice.call(arguments),d=arguments,l=this;l.proceed=function(){m.apply(l,arguments.length?arguments:d);};b.unshift(m);b=g.apply(this,b);l.proceed=null;return b};}};return b});M(a,"Core/Chart/ChartDefaults.js",[],function(){return {panning:{enabled:!1,type:"x"},styledMode:!1,borderRadius:0,colorCount:10,defaultSeriesType:"line",ignoreHiddenSeries:!0,spacing:[10,
    10,15,10],resetZoomButton:{theme:{zIndex:6},position:{align:"right",x:-10,y:10}},zoomBySingleTouch:!1,width:null,height:null,borderColor:"#335cad",backgroundColor:"#ffffff",plotBorderColor:"#cccccc"}});M(a,"Core/Color/Color.js",[a["Core/Globals.js"],a["Core/Utilities.js"]],function(a,u){var v=u.isNumber,F=u.merge,y=u.pInt;u=function(){function u(v){this.rgba=[NaN,NaN,NaN,NaN];this.input=v;var A=a.Color;if(A&&A!==u)return new A(v);if(!(this instanceof u))return new u(v);this.init(v);}u.parse=function(a){return a?
    new u(a):u.None};u.prototype.init=function(a){var A;if("object"===typeof a&&"undefined"!==typeof a.stops)this.stops=a.stops.map(function(e){return new u(e[1])});else if("string"===typeof a){this.input=a=u.names[a.toLowerCase()]||a;if("#"===a.charAt(0)){var q=a.length;var n=parseInt(a.substr(1),16);7===q?A=[(n&16711680)>>16,(n&65280)>>8,n&255,1]:4===q&&(A=[(n&3840)>>4|(n&3840)>>8,(n&240)>>4|n&240,(n&15)<<4|n&15,1]);}if(!A)for(n=u.parsers.length;n--&&!A;){var k=u.parsers[n];(q=k.regex.exec(a))&&(A=k.parse(q));}}A&&
    (this.rgba=A);};u.prototype.get=function(a){var A=this.input,q=this.rgba;if("object"===typeof A&&"undefined"!==typeof this.stops){var n=F(A);n.stops=[].slice.call(n.stops);this.stops.forEach(function(k,e){n.stops[e]=[n.stops[e][0],k.get(a)];});return n}return q&&v(q[0])?"rgb"===a||!a&&1===q[3]?"rgb("+q[0]+","+q[1]+","+q[2]+")":"a"===a?""+q[3]:"rgba("+q.join(",")+")":A};u.prototype.brighten=function(a){var A=this.rgba;if(this.stops)this.stops.forEach(function(n){n.brighten(a);});else if(v(a)&&0!==a)for(var q=
    0;3>q;q++)A[q]+=y(255*a),0>A[q]&&(A[q]=0),255<A[q]&&(A[q]=255);return this};u.prototype.setOpacity=function(a){this.rgba[3]=a;return this};u.prototype.tweenTo=function(a,A){var q=this.rgba,n=a.rgba;if(!v(q[0])||!v(n[0]))return a.input||"none";a=1!==n[3]||1!==q[3];return (a?"rgba(":"rgb(")+Math.round(n[0]+(q[0]-n[0])*(1-A))+","+Math.round(n[1]+(q[1]-n[1])*(1-A))+","+Math.round(n[2]+(q[2]-n[2])*(1-A))+(a?","+(n[3]+(q[3]-n[3])*(1-A)):"")+")"};u.names={white:"#ffffff",black:"#000000"};u.parsers=[{regex:/rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]?(?:\.[0-9]+)?)\s*\)/,
    parse:function(a){return [y(a[1]),y(a[2]),y(a[3]),parseFloat(a[4],10)]}},{regex:/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/,parse:function(a){return [y(a[1]),y(a[2]),y(a[3]),1]}}];u.None=new u("");return u}();return u});M(a,"Core/Color/Palettes.js",[],function(){return {colors:"#7cb5ec #434348 #90ed7d #f7a35c #8085e9 #f15c80 #e4d354 #2b908f #f45b5b #91e8e1".split(" ")}});M(a,"Core/Time.js",[a["Core/Globals.js"],a["Core/Utilities.js"]],function(a,u){var v=a.win,F=u.defined,y=
    u.error,G=u.extend,H=u.isObject,A=u.merge,q=u.objectEach,n=u.pad,k=u.pick,e=u.splat,c=u.timeUnits,h=a.isSafari&&v.Intl&&v.Intl.DateTimeFormat.prototype.formatRange,f=a.isSafari&&v.Intl&&!v.Intl.DateTimeFormat.prototype.formatRange;u=function(){function w(c){this.options={};this.variableTimezone=this.useUTC=!1;this.Date=v.Date;this.getTimezoneOffset=this.timezoneOffsetFunction();this.update(c);}w.prototype.get=function(c,e){if(this.variableTimezone||this.timezoneOffset){var p=e.getTime(),f=p-this.getTimezoneOffset(e);
    e.setTime(f);c=e["getUTC"+c]();e.setTime(p);return c}return this.useUTC?e["getUTC"+c]():e["get"+c]()};w.prototype.set=function(c,e,f){if(this.variableTimezone||this.timezoneOffset){if("Milliseconds"===c||"Seconds"===c||"Minutes"===c&&0===this.getTimezoneOffset(e)%36E5)return e["setUTC"+c](f);var p=this.getTimezoneOffset(e);p=e.getTime()-p;e.setTime(p);e["setUTC"+c](f);c=this.getTimezoneOffset(e);p=e.getTime()+c;return e.setTime(p)}return this.useUTC||h&&"FullYear"===c?e["setUTC"+c](f):e["set"+c](f)};
    w.prototype.update=function(c){var e=k(c&&c.useUTC,!0);this.options=c=A(!0,this.options||{},c);this.Date=c.Date||v.Date||Date;this.timezoneOffset=(this.useUTC=e)&&c.timezoneOffset;this.getTimezoneOffset=this.timezoneOffsetFunction();this.variableTimezone=e&&!(!c.getTimezoneOffset&&!c.timezone);};w.prototype.makeTime=function(c,e,h,w,C,r){if(this.useUTC){var l=this.Date.UTC.apply(0,arguments);var b=this.getTimezoneOffset(l);l+=b;var g=this.getTimezoneOffset(l);b!==g?l+=g-b:b-36E5!==this.getTimezoneOffset(l-
    36E5)||f||(l-=36E5);}else l=(new this.Date(c,e,k(h,1),k(w,0),k(C,0),k(r,0))).getTime();return l};w.prototype.timezoneOffsetFunction=function(){var c=this,e=this.options,f=e.getTimezoneOffset,h=e.moment||v.moment;if(!this.useUTC)return function(c){return 6E4*(new Date(c.toString())).getTimezoneOffset()};if(e.timezone){if(h)return function(c){return 6E4*-h.tz(c,e.timezone).utcOffset()};y(25);}return this.useUTC&&f?function(c){return 6E4*f(c.valueOf())}:function(){return 6E4*(c.timezoneOffset||0)}};w.prototype.dateFormat=
    function(c,e,f){if(!F(e)||isNaN(e))return a.defaultOptions.lang&&a.defaultOptions.lang.invalidDate||"";c=k(c,"%Y-%m-%d %H:%M:%S");var p=this,h=new this.Date(e),r=this.get("Hours",h),l=this.get("Day",h),b=this.get("Date",h),g=this.get("Month",h),d=this.get("FullYear",h),m=a.defaultOptions.lang,D=m&&m.weekdays,x=m&&m.shortWeekdays;h=G({a:x?x[l]:D[l].substr(0,3),A:D[l],d:n(b),e:n(b,2," "),w:l,b:m.shortMonths[g],B:m.months[g],m:n(g+1),o:g+1,y:d.toString().substr(2,2),Y:d,H:n(r),k:r,I:n(r%12||12),l:r%
    12||12,M:n(this.get("Minutes",h)),p:12>r?"AM":"PM",P:12>r?"am":"pm",S:n(h.getSeconds()),L:n(Math.floor(e%1E3),3)},a.dateFormats);q(h,function(b,d){for(;-1!==c.indexOf("%"+d);)c=c.replace("%"+d,"function"===typeof b?b.call(p,e):b);});return f?c.substr(0,1).toUpperCase()+c.substr(1):c};w.prototype.resolveDTLFormat=function(c){return H(c,!0)?c:(c=e(c),{main:c[0],from:c[1],to:c[2]})};w.prototype.getTimeTicks=function(e,h,f,w){var p=this,r=[],l={},b=new p.Date(h),g=e.unitRange,d=e.count||1,m;w=k(w,1);if(F(h)){p.set("Milliseconds",
    b,g>=c.second?0:d*Math.floor(p.get("Milliseconds",b)/d));g>=c.second&&p.set("Seconds",b,g>=c.minute?0:d*Math.floor(p.get("Seconds",b)/d));g>=c.minute&&p.set("Minutes",b,g>=c.hour?0:d*Math.floor(p.get("Minutes",b)/d));g>=c.hour&&p.set("Hours",b,g>=c.day?0:d*Math.floor(p.get("Hours",b)/d));g>=c.day&&p.set("Date",b,g>=c.month?1:Math.max(1,d*Math.floor(p.get("Date",b)/d)));if(g>=c.month){p.set("Month",b,g>=c.year?0:d*Math.floor(p.get("Month",b)/d));var D=p.get("FullYear",b);}g>=c.year&&p.set("FullYear",
    b,D-D%d);g===c.week&&(D=p.get("Day",b),p.set("Date",b,p.get("Date",b)-D+w+(D<w?-7:0)));D=p.get("FullYear",b);w=p.get("Month",b);var x=p.get("Date",b),t=p.get("Hours",b);h=b.getTime();!p.variableTimezone&&p.useUTC||!F(f)||(m=f-h>4*c.month||p.getTimezoneOffset(h)!==p.getTimezoneOffset(f));h=b.getTime();for(b=1;h<f;)r.push(h),h=g===c.year?p.makeTime(D+b*d,0):g===c.month?p.makeTime(D,w+b*d):!m||g!==c.day&&g!==c.week?m&&g===c.hour&&1<d?p.makeTime(D,w,x,t+b*d):h+g*d:p.makeTime(D,w,x+b*d*(g===c.day?1:7)),
    b++;r.push(h);g<=c.hour&&1E4>r.length&&r.forEach(function(b){0===b%18E5&&"000000000"===p.dateFormat("%H%M%S%L",b)&&(l[b]="day");});}r.info=G(e,{higherRanks:l,totalRange:g*d});return r};w.prototype.getDateFormat=function(e,h,f,w){var p=this.dateFormat("%m-%d %H:%M:%S.%L",h),r={millisecond:15,second:12,minute:9,hour:6,day:3},l="millisecond";for(b in c){if(e===c.week&&+this.dateFormat("%w",h)===f&&"00:00:00.000"===p.substr(6)){var b="week";break}if(c[b]>e){b=l;break}if(r[b]&&p.substr(r[b])!=="01-01 00:00:00.000".substr(r[b]))break;
    "week"!==b&&(l=b);}if(b)var g=this.resolveDTLFormat(w[b]).main;return g};return w}();return u});M(a,"Core/DefaultOptions.js",[a["Core/Chart/ChartDefaults.js"],a["Core/Color/Color.js"],a["Core/Globals.js"],a["Core/Color/Palettes.js"],a["Core/Time.js"],a["Core/Utilities.js"]],function(a,u,z,F,y,G){u=u.parse;var v=G.merge,A={colors:F.colors,symbols:["circle","diamond","square","triangle","triangle-down"],lang:{loading:"Loading...",months:"January February March April May June July August September October November December".split(" "),
    shortMonths:"Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" "),weekdays:"Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),decimalPoint:".",numericSymbols:"kMGTPE".split(""),resetZoom:"Reset zoom",resetZoomTitle:"Reset zoom level 1:1",thousandsSep:" "},global:{},time:{Date:void 0,getTimezoneOffset:void 0,timezone:void 0,timezoneOffset:0,useUTC:!0},chart:a,title:{text:"Chart title",align:"center",margin:15,widthAdjust:-44},subtitle:{text:"",align:"center",widthAdjust:-44},
    caption:{margin:15,text:"",align:"left",verticalAlign:"bottom"},plotOptions:{},labels:{style:{position:"absolute",color:"#333333"}},legend:{enabled:!0,align:"center",alignColumns:!0,className:"highcharts-no-tooltip",layout:"horizontal",labelFormatter:function(){return this.name},borderColor:"#999999",borderRadius:0,navigation:{activeColor:"#003399",inactiveColor:"#cccccc"},itemStyle:{color:"#333333",cursor:"pointer",fontSize:"12px",fontWeight:"bold",textOverflow:"ellipsis"},itemHoverStyle:{color:"#000000"},
    itemHiddenStyle:{color:"#cccccc"},shadow:!1,itemCheckboxStyle:{position:"absolute",width:"13px",height:"13px"},squareSymbol:!0,symbolPadding:5,verticalAlign:"bottom",x:0,y:0,title:{style:{fontWeight:"bold"}}},loading:{labelStyle:{fontWeight:"bold",position:"relative",top:"45%"},style:{position:"absolute",backgroundColor:"#ffffff",opacity:.5,textAlign:"center"}},tooltip:{enabled:!0,animation:z.svg,borderRadius:3,dateTimeLabelFormats:{millisecond:"%A, %b %e, %H:%M:%S.%L",second:"%A, %b %e, %H:%M:%S",
    minute:"%A, %b %e, %H:%M",hour:"%A, %b %e, %H:%M",day:"%A, %b %e, %Y",week:"Week from %A, %b %e, %Y",month:"%B %Y",year:"%Y"},footerFormat:"",headerShape:"callout",hideDelay:500,padding:8,shape:"callout",shared:!1,snap:z.isTouchDevice?25:10,headerFormat:'<span style="font-size: 10px">{point.key}</span><br/>',pointFormat:'<span style="color:{point.color}">\u25cf</span> {series.name}: <b>{point.y}</b><br/>',backgroundColor:u("#f7f7f7").setOpacity(.85).get(),borderWidth:1,shadow:!0,stickOnContact:!1,
    style:{color:"#333333",cursor:"default",fontSize:"12px",whiteSpace:"nowrap"},useHTML:!1},credits:{enabled:!0,href:"https://www.highcharts.com?credits",position:{align:"right",x:-10,verticalAlign:"bottom",y:-5},style:{cursor:"pointer",color:"#999999",fontSize:"9px"},text:"Highcharts.com"}};A.chart.styledMode=!1;var q=new y(v(A.global,A.time));a={defaultOptions:A,defaultTime:q,getOptions:function(){return A},setOptions:function(n){v(!0,A,n);if(n.time||n.global)z.time?z.time.update(v(A.global,A.time,
    n.global,n.time)):z.time=q;return A}};return a});M(a,"Core/Animation/Fx.js",[a["Core/Color/Color.js"],a["Core/Globals.js"],a["Core/Utilities.js"]],function(a,u,z){var v=a.parse,y=u.win,G=z.isNumber,H=z.objectEach;return function(){function a(a,n,k){this.pos=NaN;this.options=n;this.elem=a;this.prop=k;}a.prototype.dSetter=function(){var a=this.paths,n=a&&a[0];a=a&&a[1];var k=this.now||0,e=[];if(1!==k&&n&&a)if(n.length===a.length&&1>k)for(var c=0;c<a.length;c++){for(var h=n[c],f=a[c],w=[],p=0;p<f.length;p++){var B=
    h[p],t=f[p];G(B)&&G(t)&&("A"!==f[0]||4!==p&&5!==p)?w[p]=B+k*(t-B):w[p]=t;}e.push(w);}else e=a;else e=this.toD||[];this.elem.attr("d",e,void 0,!0);};a.prototype.update=function(){var a=this.elem,n=this.prop,k=this.now,e=this.options.step;if(this[n+"Setter"])this[n+"Setter"]();else a.attr?a.element&&a.attr(n,k,null,!0):a.style[n]=k+this.unit;e&&e.call(a,k,this);};a.prototype.run=function(q,n,k){var e=this,c=e.options,h=function(c){return h.stopped?!1:e.step(c)},f=y.requestAnimationFrame||function(c){setTimeout(c,
    13);},w=function(){for(var c=0;c<a.timers.length;c++)a.timers[c]()||a.timers.splice(c--,1);a.timers.length&&f(w);};q!==n||this.elem["forceAnimate:"+this.prop]?(this.startTime=+new Date,this.start=q,this.end=n,this.unit=k,this.now=this.start,this.pos=0,h.elem=this.elem,h.prop=this.prop,h()&&1===a.timers.push(h)&&f(w)):(delete c.curAnim[this.prop],c.complete&&0===Object.keys(c.curAnim).length&&c.complete.call(this.elem));};a.prototype.step=function(a){var n=+new Date,k=this.options,e=this.elem,c=k.complete,
    h=k.duration,f=k.curAnim;if(e.attr&&!e.element)a=!1;else if(a||n>=h+this.startTime){this.now=this.end;this.pos=1;this.update();var w=f[this.prop]=!0;H(f,function(c){!0!==c&&(w=!1);});w&&c&&c.call(e);a=!1;}else this.pos=k.easing((n-this.startTime)/h),this.now=this.start+(this.end-this.start)*this.pos,this.update(),a=!0;return a};a.prototype.initPath=function(a,n,k){function e(c,e){for(;c.length<J;){var l=c[0],b=e[J-c.length];b&&"M"===l[0]&&(c[0]="C"===b[0]?["C",l[1],l[2],l[1],l[2],l[1],l[2]]:["L",l[1],
    l[2]]);c.unshift(l);w&&(l=c.pop(),c.push(c[c.length-1],l));}}function c(c,e){for(;c.length<J;)if(e=c[Math.floor(c.length/p)-1].slice(),"C"===e[0]&&(e[1]=e[5],e[2]=e[6]),w){var l=c[Math.floor(c.length/p)].slice();c.splice(c.length/2,0,e,l);}else c.push(e);}var h=a.startX,f=a.endX;k=k.slice();var w=a.isArea,p=w?2:1;n=n&&n.slice();if(!n)return [k,k];if(h&&f&&f.length){for(a=0;a<h.length;a++)if(h[a]===f[0]){var B=a;break}else if(h[0]===f[f.length-h.length+a]){B=a;var t=!0;break}else if(h[h.length-1]===f[f.length-
    h.length+a]){B=h.length-a;break}"undefined"===typeof B&&(n=[]);}if(n.length&&G(B)){var J=k.length+B*p;t?(e(n,k),c(k,n)):(e(k,n),c(n,k));}return [n,k]};a.prototype.fillSetter=function(){a.prototype.strokeSetter.apply(this,arguments);};a.prototype.strokeSetter=function(){this.elem.attr(this.prop,v(this.start).tweenTo(v(this.end),this.pos),void 0,!0);};a.timers=[];return a}()});M(a,"Core/Animation/AnimationUtilities.js",[a["Core/Animation/Fx.js"],a["Core/Utilities.js"]],function(a,u){function v(c){return q(c)?
    n({duration:500,defer:0},c):{duration:c?500:0,defer:0}}function F(c,e){for(var h=a.timers.length;h--;)a.timers[h].elem!==c||e&&e!==a.timers[h].prop||(a.timers[h].stopped=!0);}var y=u.defined,G=u.getStyle,H=u.isArray,A=u.isNumber,q=u.isObject,n=u.merge,k=u.objectEach,e=u.pick;return {animate:function(c,e,f){var h,p="",B,t;if(!q(f)){var J=arguments;f={duration:J[2],easing:J[3],complete:J[4]};}A(f.duration)||(f.duration=400);f.easing="function"===typeof f.easing?f.easing:Math[f.easing]||Math.easeInOutSine;
    f.curAnim=n(e);k(e,function(k,r){F(c,r);t=new a(c,f,r);B=void 0;"d"===r&&H(e.d)?(t.paths=t.initPath(c,c.pathArray,e.d),t.toD=e.d,h=0,B=1):c.attr?h=c.attr(r):(h=parseFloat(G(c,r))||0,"opacity"!==r&&(p="px"));B||(B=k);"string"===typeof B&&B.match("px")&&(B=B.replace(/px/g,""));t.run(h,B,p);});},animObject:v,getDeferredAnimation:function(c,e,f){var h=v(e),p=0,a=0;(f?[f]:c.series).forEach(function(c){c=v(c.options.animation);p=e&&y(e.defer)?h.defer:Math.max(p,c.duration+c.defer);a=Math.min(h.duration,c.duration);});
    c.renderer.forExport&&(p=0);return {defer:Math.max(0,p-a),duration:Math.min(p,a)}},setAnimation:function(c,h){h.renderer.globalAnimation=e(c,h.options.chart.animation,!0);},stop:F}});M(a,"Core/Renderer/HTML/AST.js",[a["Core/Globals.js"],a["Core/Utilities.js"]],function(a,u){var v=a.SVG_NS,F=u.attr,y=u.createElement,G=u.error,H=u.isFunction,A=u.isString,q=u.objectEach,n=u.splat,k=(u=a.win.trustedTypes)&&H(u.createPolicy)&&u.createPolicy("highcharts",{createHTML:function(c){return c}}),e=k?k.createHTML(""):
    "";try{var c=!!(new DOMParser).parseFromString(e,"text/html");}catch(h){c=!1;}H=function(){function h(c){this.nodes="string"===typeof c?this.parseMarkup(c):c;}h.filterUserAttributes=function(c){q(c,function(e,p){var f=!0;-1===h.allowedAttributes.indexOf(p)&&(f=!1);-1!==["background","dynsrc","href","lowsrc","src"].indexOf(p)&&(f=A(e)&&h.allowedReferences.some(function(c){return 0===e.indexOf(c)}));f||(G("Highcharts warning: Invalid attribute '"+p+"' in config"),delete c[p]);});return c};h.setElementHTML=
    function(c,e){c.innerHTML=h.emptyHTML;e&&(new h(e)).addToDOM(c);};h.prototype.addToDOM=function(c){function e(c,f){var p;n(c).forEach(function(c){var t=c.tagName,r=c.textContent?a.doc.createTextNode(c.textContent):void 0;if(t)if("#text"===t)var l=r;else if(-1!==h.allowedTags.indexOf(t)){t=a.doc.createElementNS("svg"===t?v:f.namespaceURI||v,t);var b=c.attributes||{};q(c,function(c,d){"tagName"!==d&&"attributes"!==d&&"children"!==d&&"textContent"!==d&&(b[d]=c);});F(t,h.filterUserAttributes(b));r&&t.appendChild(r);
    e(c.children||[],t);l=t;}else G("Highcharts warning: Invalid tagName "+t+" in config");l&&f.appendChild(l);p=l;});return p}return e(this.nodes,c)};h.prototype.parseMarkup=function(e){var h=[];e=e.trim();if(c)e=(new DOMParser).parseFromString(k?k.createHTML(e):e,"text/html");else {var p=y("div");p.innerHTML=e;e={body:p};}var f=function(c,e){var h=c.nodeName.toLowerCase(),r={tagName:h};"#text"===h&&(r.textContent=c.textContent||"");if(h=c.attributes){var l={};[].forEach.call(h,function(b){l[b.name]=b.value;});
    r.attributes=l;}if(c.childNodes.length){var b=[];[].forEach.call(c.childNodes,function(c){f(c,b);});b.length&&(r.children=b);}e.push(r);};[].forEach.call(e.body.childNodes,function(c){return f(c,h)});return h};h.allowedAttributes="aria-controls aria-describedby aria-expanded aria-haspopup aria-hidden aria-label aria-labelledby aria-live aria-pressed aria-readonly aria-roledescription aria-selected class clip-path color colspan cx cy d dx dy disabled fill height href id in markerHeight markerWidth offset opacity orient padding paddingLeft paddingRight patternUnits r refX refY role scope slope src startOffset stdDeviation stroke stroke-linecap stroke-width style tableValues result rowspan summary target tabindex text-align textAnchor textLength title type valign width x x1 x2 y y1 y2 zIndex".split(" ");
    h.allowedReferences="https:// http:// mailto: / ../ ./ #".split(" ");h.allowedTags="a abbr b br button caption circle clipPath code dd defs div dl dt em feComponentTransfer feFuncA feFuncB feFuncG feFuncR feGaussianBlur feOffset feMerge feMergeNode filter h1 h2 h3 h4 h5 h6 hr i img li linearGradient marker ol p path pattern pre rect small span stop strong style sub sup svg table text thead tbody tspan td th tr u ul #text".split(" ");h.emptyHTML=e;return h}();return H});M(a,"Core/FormatUtilities.js",
    [a["Core/DefaultOptions.js"],a["Core/Utilities.js"]],function(a,u){function v(a,k,e,c){a=+a||0;k=+k;var h=F.lang,f=(a.toString().split(".")[1]||"").split("e")[0].length,w=a.toString().split("e"),p=k;if(-1===k)k=Math.min(f,20);else if(!H(k))k=2;else if(k&&w[1]&&0>w[1]){var B=k+ +w[1];0<=B?(w[0]=(+w[0]).toExponential(B).split("e")[0],k=B):(w[0]=w[0].split(".")[0]||0,a=20>k?(w[0]*Math.pow(10,w[1])).toFixed(k):0,w[1]=0);}B=(Math.abs(w[1]?w[0]:a)+Math.pow(10,-Math.max(k,f)-1)).toFixed(k);f=String(q(B));
    var t=3<f.length?f.length%3:0;e=A(e,h.decimalPoint);c=A(c,h.thousandsSep);a=(0>a?"-":"")+(t?f.substr(0,t)+c:"");a=0>+w[1]&&!p?"0":a+f.substr(t).replace(/(\d{3})(?=\d)/g,"$1"+c);k&&(a+=e+B.slice(-k));w[1]&&0!==+a&&(a+="e"+w[1]);return a}var F=a.defaultOptions,y=a.defaultTime,G=u.getNestedProperty,H=u.isNumber,A=u.pick,q=u.pInt;return {dateFormat:function(a,k,e){return y.dateFormat(a,k,e)},format:function(a,k,e){var c="{",h=!1,f=/f$/,w=/\.([0-9])/,p=F.lang,B=e&&e.time||y;e=e&&e.numberFormatter||v;for(var t=
    [];a;){var J=a.indexOf(c);if(-1===J)break;var C=a.slice(0,J);if(h){C=C.split(":");c=G(C.shift()||"",k);if(C.length&&"number"===typeof c)if(C=C.join(":"),f.test(C)){var r=parseInt((C.match(w)||["","-1"])[1],10);null!==c&&(c=e(c,r,p.decimalPoint,-1<C.indexOf(",")?p.thousandsSep:""));}else c=B.dateFormat(C,c);t.push(c);}else t.push(C);a=a.slice(J+1);c=(h=!h)?"}":"{";}t.push(a);return t.join("")},numberFormat:v}});M(a,"Core/Renderer/RendererUtilities.js",[a["Core/Utilities.js"]],function(a){var v=a.clamp,
    z=a.pick,F=a.stableSort,y;(function(a){function u(a,q,n){var k=a,e=k.reducedLen||q,c=function(c,e){return (e.rank||0)-(c.rank||0)},h=function(c,e){return c.target-e.target},f,w=!0,p=[],B=0;for(f=a.length;f--;)B+=a[f].size;if(B>e){F(a,c);for(B=f=0;B<=e;)B+=a[f].size,f++;p=a.splice(f-1,a.length);}F(a,h);for(a=a.map(function(c){return {size:c.size,targets:[c.target],align:z(c.align,.5)}});w;){for(f=a.length;f--;)e=a[f],c=(Math.min.apply(0,e.targets)+Math.max.apply(0,e.targets))/2,e.pos=v(c-e.size*e.align,
    0,q-e.size);f=a.length;for(w=!1;f--;)0<f&&a[f-1].pos+a[f-1].size>a[f].pos&&(a[f-1].size+=a[f].size,a[f-1].targets=a[f-1].targets.concat(a[f].targets),a[f-1].align=.5,a[f-1].pos+a[f-1].size>q&&(a[f-1].pos=q-a[f-1].size),a.splice(f,1),w=!0);}k.push.apply(k,p);f=0;a.some(function(c){var e=0;return (c.targets||[]).some(function(){k[f].pos=c.pos+e;if("undefined"!==typeof n&&Math.abs(k[f].pos-k[f].target)>n)return k.slice(0,f+1).forEach(function(c){return delete c.pos}),k.reducedLen=(k.reducedLen||q)-.1*
    q,k.reducedLen>.1*q&&u(k,q,n),!0;e+=k[f].size;f++;return !1})});F(k,h);return k}a.distribute=u;})(y||(y={}));return y});M(a,"Core/Renderer/SVG/SVGElement.js",[a["Core/Animation/AnimationUtilities.js"],a["Core/Renderer/HTML/AST.js"],a["Core/Color/Color.js"],a["Core/Globals.js"],a["Core/Utilities.js"]],function(a,u,z,F,y){var v=a.animate,H=a.animObject,A=a.stop,q=F.deg2rad,n=F.doc,k=F.noop,e=F.svg,c=F.SVG_NS,h=F.win,f=y.addEvent,w=y.attr,p=y.createElement,B=y.css,t=y.defined,J=y.erase,C=y.extend,r=y.fireEvent,
    l=y.isArray,b=y.isFunction,g=y.isNumber,d=y.isString,m=y.merge,D=y.objectEach,x=y.pick,I=y.pInt,P=y.syncTimeout,S=y.uniqueKey;a=function(){function a(){this.element=void 0;this.onEvents={};this.opacity=1;this.renderer=void 0;this.SVG_NS=c;this.symbolCustomAttribs="x y width height r start end innerR anchorX anchorY rounded".split(" ");}a.prototype._defaultGetter=function(b){b=x(this[b+"Value"],this[b],this.element?this.element.getAttribute(b):null,0);/^[\-0-9\.]+$/.test(b)&&(b=parseFloat(b));return b};
    a.prototype._defaultSetter=function(b,d,c){c.setAttribute(d,b);};a.prototype.add=function(b){var d=this.renderer,c=this.element;b&&(this.parentGroup=b);this.parentInverted=b&&b.inverted;"undefined"!==typeof this.textStr&&"text"===this.element.nodeName&&d.buildText(this);this.added=!0;if(!b||b.handleZ||this.zIndex)var g=this.zIndexSetter();g||(b?b.element:d.box).appendChild(c);if(this.onAdd)this.onAdd();return this};a.prototype.addClass=function(b,d){var c=d?"":this.attr("class")||"";b=(b||"").split(/ /g).reduce(function(b,
    d){-1===c.indexOf(d)&&b.push(d);return b},c?[c]:[]).join(" ");b!==c&&this.attr("class",b);return this};a.prototype.afterSetters=function(){this.doTransform&&(this.updateTransform(),this.doTransform=!1);};a.prototype.align=function(b,c,g){var m={},L=this.renderer,e=L.alignedObjects,l,a,E;if(b){if(this.alignOptions=b,this.alignByTranslate=c,!g||d(g))this.alignTo=l=g||"renderer",J(e,this),e.push(this),g=void 0;}else b=this.alignOptions,c=this.alignByTranslate,l=this.alignTo;g=x(g,L[l],"scrollablePlotBox"===
    l?L.plotBox:void 0,L);l=b.align;var r=b.verticalAlign;L=(g.x||0)+(b.x||0);e=(g.y||0)+(b.y||0);"right"===l?a=1:"center"===l&&(a=2);a&&(L+=(g.width-(b.width||0))/a);m[c?"translateX":"x"]=Math.round(L);"bottom"===r?E=1:"middle"===r&&(E=2);E&&(e+=(g.height-(b.height||0))/E);m[c?"translateY":"y"]=Math.round(e);this[this.placed?"animate":"attr"](m);this.placed=!0;this.alignAttr=m;return this};a.prototype.alignSetter=function(b){var d={left:"start",center:"middle",right:"end"};d[b]&&(this.alignValue=b,this.element.setAttribute("text-anchor",
    d[b]));};a.prototype.animate=function(b,d,c){var g=this,m=H(x(d,this.renderer.globalAnimation,!0));d=m.defer;x(n.hidden,n.msHidden,n.webkitHidden,!1)&&(m.duration=0);0!==m.duration?(c&&(m.complete=c),P(function(){g.element&&v(g,b,m);},d)):(this.attr(b,void 0,c),D(b,function(b,d){m.step&&m.step.call(this,b,{prop:d,pos:1,elem:this});},this));return this};a.prototype.applyTextOutline=function(b){var d=this.element;-1!==b.indexOf("contrast")&&(b=b.replace(/contrast/g,this.renderer.getContrast(d.style.fill)));
    var g=b.split(" ");b=g[g.length-1];if((g=g[0])&&"none"!==g&&F.svg){this.fakeTS=!0;this.ySetter=this.xSetter;g=g.replace(/(^[\d\.]+)(.*?)$/g,function(b,d,c){return 2*Number(d)+c});this.removeTextOutline();var m=n.createElementNS(c,"tspan");w(m,{"class":"highcharts-text-outline",fill:b,stroke:b,"stroke-width":g,"stroke-linejoin":"round"});[].forEach.call(d.childNodes,function(b){var d=b.cloneNode(!0);d.removeAttribute&&["fill","stroke","stroke-width","stroke"].forEach(function(b){return d.removeAttribute(b)});
    m.appendChild(d);});var e=n.createElementNS(c,"tspan");e.textContent="\u200b";["x","y"].forEach(function(b){var c=d.getAttribute(b);c&&e.setAttribute(b,c);});m.appendChild(e);d.insertBefore(m,d.firstChild);}};a.prototype.attr=function(b,d,c,g){var m=this.element,e=this.symbolCustomAttribs,L,l=this,E,a;if("string"===typeof b&&"undefined"!==typeof d){var K=b;b={};b[K]=d;}"string"===typeof b?l=(this[b+"Getter"]||this._defaultGetter).call(this,b,m):(D(b,function(d,c){E=!1;g||A(this,c);this.symbolName&&-1!==
    e.indexOf(c)&&(L||(this.symbolAttr(b),L=!0),E=!0);!this.rotation||"x"!==c&&"y"!==c||(this.doTransform=!0);E||(a=this[c+"Setter"]||this._defaultSetter,a.call(this,d,c,m),!this.styledMode&&this.shadows&&/^(width|height|visibility|x|y|d|transform|cx|cy|r)$/.test(c)&&this.updateShadows(c,d,a));},this),this.afterSetters());c&&c.call(this);return l};a.prototype.clip=function(b){return this.attr("clip-path",b?"url("+this.renderer.url+"#"+b.id+")":"none")};a.prototype.crisp=function(b,d){d=d||b.strokeWidth||
    0;var c=Math.round(d)%2/2;b.x=Math.floor(b.x||this.x||0)+c;b.y=Math.floor(b.y||this.y||0)+c;b.width=Math.floor((b.width||this.width||0)-2*c);b.height=Math.floor((b.height||this.height||0)-2*c);t(b.strokeWidth)&&(b.strokeWidth=d);return b};a.prototype.complexColor=function(b,d,c){var g=this.renderer,e,L,a,h,E,x,p,f,k,w,B=[],I;r(this.renderer,"complexColor",{args:arguments},function(){b.radialGradient?L="radialGradient":b.linearGradient&&(L="linearGradient");if(L){a=b[L];E=g.gradients;x=b.stops;k=c.radialReference;
    l(a)&&(b[L]=a={x1:a[0],y1:a[1],x2:a[2],y2:a[3],gradientUnits:"userSpaceOnUse"});"radialGradient"===L&&k&&!t(a.gradientUnits)&&(h=a,a=m(a,g.getRadialAttr(k,h),{gradientUnits:"userSpaceOnUse"}));D(a,function(b,d){"id"!==d&&B.push(d,b);});D(x,function(b){B.push(b);});B=B.join(",");if(E[B])w=E[B].attr("id");else {a.id=w=S();var K=E[B]=g.createElement(L).attr(a).add(g.defs);K.radAttr=h;K.stops=[];x.forEach(function(b){0===b[1].indexOf("rgba")?(e=z.parse(b[1]),p=e.get("rgb"),f=e.get("a")):(p=b[1],f=1);b=g.createElement("stop").attr({offset:b[0],
    "stop-color":p,"stop-opacity":f}).add(K);K.stops.push(b);});}I="url("+g.url+"#"+w+")";c.setAttribute(d,I);c.gradient=B;b.toString=function(){return I};}});};a.prototype.css=function(b){var d=this.styles,c={},g=this.element,m=["textOutline","textOverflow","width"],a="",l=!d;b&&b.color&&(b.fill=b.color);d&&D(b,function(b,g){d&&d[g]!==b&&(c[g]=b,l=!0);});if(l){d&&(b=C(d,c));if(b)if(null===b.width||"auto"===b.width)delete this.textWidth;else if("text"===g.nodeName.toLowerCase()&&b.width)var r=this.textWidth=
    I(b.width);this.styles=b;r&&!e&&this.renderer.forExport&&delete b.width;if(g.namespaceURI===this.SVG_NS){var E=function(b,d){return "-"+d.toLowerCase()};D(b,function(b,d){-1===m.indexOf(d)&&(a+=d.replace(/([A-Z])/g,E)+":"+b+";");});a&&w(g,"style",a);}else B(g,b);this.added&&("text"===this.element.nodeName&&this.renderer.buildText(this),b&&b.textOutline&&this.applyTextOutline(b.textOutline));}return this};a.prototype.dashstyleSetter=function(b){var d=this["stroke-width"];"inherit"===d&&(d=1);if(b=b&&b.toLowerCase()){var c=
    b.replace("shortdashdotdot","3,1,1,1,1,1,").replace("shortdashdot","3,1,1,1").replace("shortdot","1,1,").replace("shortdash","3,1,").replace("longdash","8,3,").replace(/dot/g,"1,3,").replace("dash","4,3,").replace(/,$/,"").split(",");for(b=c.length;b--;)c[b]=""+I(c[b])*x(d,NaN);b=c.join(",").replace(/NaN/g,"none");this.element.setAttribute("stroke-dasharray",b);}};a.prototype.destroy=function(){var b=this,d=b.element||{},c=b.renderer,g=d.ownerSVGElement,m=c.isSVG&&"SPAN"===d.nodeName&&b.parentGroup||
    void 0;d.onclick=d.onmouseout=d.onmouseover=d.onmousemove=d.point=null;A(b);if(b.clipPath&&g){var e=b.clipPath;[].forEach.call(g.querySelectorAll("[clip-path],[CLIP-PATH]"),function(b){-1<b.getAttribute("clip-path").indexOf(e.element.id)&&b.removeAttribute("clip-path");});b.clipPath=e.destroy();}if(b.stops){for(g=0;g<b.stops.length;g++)b.stops[g].destroy();b.stops.length=0;b.stops=void 0;}b.safeRemoveChild(d);for(c.styledMode||b.destroyShadows();m&&m.div&&0===m.div.childNodes.length;)d=m.parentGroup,
    b.safeRemoveChild(m.div),delete m.div,m=d;b.alignTo&&J(c.alignedObjects,b);D(b,function(d,c){b[c]&&b[c].parentGroup===b&&b[c].destroy&&b[c].destroy();delete b[c];});};a.prototype.destroyShadows=function(){(this.shadows||[]).forEach(function(b){this.safeRemoveChild(b);},this);this.shadows=void 0;};a.prototype.destroyTextPath=function(b,d){var c=b.getElementsByTagName("text")[0];if(c){if(c.removeAttribute("dx"),c.removeAttribute("dy"),d.element.setAttribute("id",""),this.textPathWrapper&&c.getElementsByTagName("textPath").length){for(b=
    this.textPathWrapper.element.childNodes;b.length;)c.appendChild(b[0]);c.removeChild(this.textPathWrapper.element);}}else if(b.getAttribute("dx")||b.getAttribute("dy"))b.removeAttribute("dx"),b.removeAttribute("dy");this.textPathWrapper&&(this.textPathWrapper=this.textPathWrapper.destroy());};a.prototype.dSetter=function(b,d,c){l(b)&&("string"===typeof b[0]&&(b=this.renderer.pathToSegments(b)),this.pathArray=b,b=b.reduce(function(b,d,c){return d&&d.join?(c?b+" ":"")+d.join(" "):(d||"").toString()},""));
    /(NaN| {2}|^$)/.test(b)&&(b="M 0 0");this[d]!==b&&(c.setAttribute(d,b),this[d]=b);};a.prototype.fadeOut=function(b){var d=this;d.animate({opacity:0},{duration:x(b,150),complete:function(){d.attr({y:-9999}).hide();}});};a.prototype.fillSetter=function(b,d,c){"string"===typeof b?c.setAttribute(d,b):b&&this.complexColor(b,d,c);};a.prototype.getBBox=function(d,c){var g=this.renderer,m=this.element,e=this.styles,l=this.textStr,r=g.cache,h=g.cacheKeys,E=m.namespaceURI===this.SVG_NS;c=x(c,this.rotation,0);var p=
    g.styledMode?m&&a.prototype.getStyle.call(m,"font-size"):e&&e.fontSize,f;if(t(l)){var D=l.toString();-1===D.indexOf("<")&&(D=D.replace(/[0-9]/g,"0"));D+=["",c,p,this.textWidth,e&&e.textOverflow,e&&e.fontWeight].join();}D&&!d&&(f=r[D]);if(!f){if(E||g.forExport){try{var k=this.fakeTS&&function(b){var d=m.querySelector(".highcharts-text-outline");d&&B(d,{display:b});};b(k)&&k("none");f=m.getBBox?C({},m.getBBox()):{width:m.offsetWidth,height:m.offsetHeight};b(k)&&k("");}catch(X){}if(!f||0>f.width)f={width:0,
    height:0};}else f=this.htmlGetBBox();g.isSVG&&(d=f.width,g=f.height,E&&(f.height=g={"11px,17":14,"13px,20":16}[(p||"")+","+Math.round(g)]||g),c&&(E=c*q,f.width=Math.abs(g*Math.sin(E))+Math.abs(d*Math.cos(E)),f.height=Math.abs(g*Math.cos(E))+Math.abs(d*Math.sin(E))));if(D&&(""===l||0<f.height)){for(;250<h.length;)delete r[h.shift()];r[D]||h.push(D);r[D]=f;}}return f};a.prototype.getStyle=function(b){return h.getComputedStyle(this.element||this,"").getPropertyValue(b)};a.prototype.hasClass=function(b){return -1!==
    (""+this.attr("class")).split(" ").indexOf(b)};a.prototype.hide=function(b){b?this.attr({y:-9999}):this.attr({visibility:"hidden"});return this};a.prototype.htmlGetBBox=function(){return {height:0,width:0,x:0,y:0}};a.prototype.init=function(b,d){this.element="span"===d?p(d):n.createElementNS(this.SVG_NS,d);this.renderer=b;r(this,"afterInit");};a.prototype.invert=function(b){this.inverted=b;this.updateTransform();return this};a.prototype.on=function(b,d){var c=this.onEvents;if(c[b])c[b]();c[b]=f(this.element,
    b,d);return this};a.prototype.opacitySetter=function(b,d,c){this.opacity=b=Number(Number(b).toFixed(3));c.setAttribute(d,b);};a.prototype.removeClass=function(b){return this.attr("class",(""+this.attr("class")).replace(d(b)?new RegExp("(^| )"+b+"( |$)"):b," ").replace(/ +/g," ").trim())};a.prototype.removeTextOutline=function(){var b=this.element.querySelector("tspan.highcharts-text-outline");b&&this.safeRemoveChild(b);};a.prototype.safeRemoveChild=function(b){var d=b.parentNode;d&&d.removeChild(b);};
    a.prototype.setRadialReference=function(b){var d=this.element.gradient&&this.renderer.gradients[this.element.gradient];this.element.radialReference=b;d&&d.radAttr&&d.animate(this.renderer.getRadialAttr(b,d.radAttr));return this};a.prototype.setTextPath=function(b,d){var c=this.element,e=this.text?this.text.element:c,a={textAnchor:"text-anchor"},l=!1,r=this.textPathWrapper,x=!r;d=m(!0,{enabled:!0,attributes:{dy:-5,startOffset:"50%",textAnchor:"middle"}},d);var E=u.filterUserAttributes(d.attributes);
    if(b&&d&&d.enabled){r&&null===r.element.parentNode?(x=!0,r=r.destroy()):r&&this.removeTextOutline.call(r.parentGroup);this.options&&this.options.padding&&(E.dx=-this.options.padding);r||(this.textPathWrapper=r=this.renderer.createElement("textPath"),l=!0);var p=r.element;(d=b.element.getAttribute("id"))||b.element.setAttribute("id",d=S());if(x)for(e.setAttribute("y",0),g(E.dx)&&e.setAttribute("x",-E.dx),b=[].slice.call(e.childNodes),x=0;x<b.length;x++){var f=b[x];f.nodeType!==h.Node.TEXT_NODE&&"tspan"!==
    f.nodeName||p.appendChild(f);}l&&r&&r.add({element:e});p.setAttributeNS("http://www.w3.org/1999/xlink","href",this.renderer.url+"#"+d);t(E.dy)&&(p.parentNode.setAttribute("dy",E.dy),delete E.dy);t(E.dx)&&(p.parentNode.setAttribute("dx",E.dx),delete E.dx);D(E,function(b,d){p.setAttribute(a[d]||d,b);});c.removeAttribute("transform");this.removeTextOutline.call(r);this.text&&!this.renderer.styledMode&&this.attr({fill:"none","stroke-width":0});this.applyTextOutline=this.updateTransform=k;}else r&&(delete this.updateTransform,
    delete this.applyTextOutline,this.destroyTextPath(c,b),this.updateTransform(),this.options&&this.options.rotation&&this.applyTextOutline(this.options.style.textOutline));return this};a.prototype.shadow=function(b,d,c){var g=[],m=this.element,e=this.oldShadowOptions,a={color:"#000000",offsetX:this.parentInverted?-1:1,offsetY:this.parentInverted?-1:1,opacity:.15,width:3},l=!1,E;!0===b?E=a:"object"===typeof b&&(E=C(a,b));E&&(E&&e&&D(E,function(b,d){b!==e[d]&&(l=!0);}),l&&this.destroyShadows(),this.oldShadowOptions=
    E);if(!E)this.destroyShadows();else if(!this.shadows){var L=E.opacity/E.width;var r=this.parentInverted?"translate("+E.offsetY+", "+E.offsetX+")":"translate("+E.offsetX+", "+E.offsetY+")";for(a=1;a<=E.width;a++){var h=m.cloneNode(!1);var x=2*E.width+1-2*a;w(h,{stroke:b.color||"#000000","stroke-opacity":L*a,"stroke-width":x,transform:r,fill:"none"});h.setAttribute("class",(h.getAttribute("class")||"")+" highcharts-shadow");c&&(w(h,"height",Math.max(w(h,"height")-x,0)),h.cutHeight=x);d?d.element.appendChild(h):
    m.parentNode&&m.parentNode.insertBefore(h,m);g.push(h);}this.shadows=g;}return this};a.prototype.show=function(b){return this.attr({visibility:b?"inherit":"visible"})};a.prototype.strokeSetter=function(b,d,c){this[d]=b;this.stroke&&this["stroke-width"]?(a.prototype.fillSetter.call(this,this.stroke,"stroke",c),c.setAttribute("stroke-width",this["stroke-width"]),this.hasStroke=!0):"stroke-width"===d&&0===b&&this.hasStroke?(c.removeAttribute("stroke"),this.hasStroke=!1):this.renderer.styledMode&&this["stroke-width"]&&
    (c.setAttribute("stroke-width",this["stroke-width"]),this.hasStroke=!0);};a.prototype.strokeWidth=function(){if(!this.renderer.styledMode)return this["stroke-width"]||0;var b=this.getStyle("stroke-width"),d=0;if(b.indexOf("px")===b.length-2)d=I(b);else if(""!==b){var g=n.createElementNS(c,"rect");w(g,{width:b,"stroke-width":0});this.element.parentNode.appendChild(g);d=g.getBBox().width;g.parentNode.removeChild(g);}return d};a.prototype.symbolAttr=function(b){var d=this;"x y r start end width height innerR anchorX anchorY clockwise".split(" ").forEach(function(c){d[c]=
    x(b[c],d[c]);});d.attr({d:d.renderer.symbols[d.symbolName](d.x,d.y,d.width,d.height,d)});};a.prototype.textSetter=function(b){b!==this.textStr&&(delete this.textPxLength,this.textStr=b,this.added&&this.renderer.buildText(this));};a.prototype.titleSetter=function(b){var d=this.element,c=d.getElementsByTagName("title")[0]||n.createElementNS(this.SVG_NS,"title");d.insertBefore?d.insertBefore(c,d.firstChild):d.appendChild(c);c.textContent=String(x(b,"")).replace(/<[^>]*>/g,"").replace(/&lt;/g,"<").replace(/&gt;/g,
    ">");};a.prototype.toFront=function(){var b=this.element;b.parentNode.appendChild(b);return this};a.prototype.translate=function(b,d){return this.attr({translateX:b,translateY:d})};a.prototype.updateShadows=function(b,d,c){var g=this.shadows;if(g)for(var m=g.length;m--;)c.call(g[m],"height"===b?Math.max(d-(g[m].cutHeight||0),0):"d"===b?this.d:d,b,g[m]);};a.prototype.updateTransform=function(){var b=this.scaleX,d=this.scaleY,c=this.inverted,g=this.rotation,m=this.matrix,e=this.element,a=this.translateX||
    0,l=this.translateY||0;c&&(a+=this.width,l+=this.height);a=["translate("+a+","+l+")"];t(m)&&a.push("matrix("+m.join(",")+")");c?a.push("rotate(90) scale(-1,1)"):g&&a.push("rotate("+g+" "+x(this.rotationOriginX,e.getAttribute("x"),0)+" "+x(this.rotationOriginY,e.getAttribute("y")||0)+")");(t(b)||t(d))&&a.push("scale("+x(b,1)+" "+x(d,1)+")");a.length&&e.setAttribute("transform",a.join(" "));};a.prototype.visibilitySetter=function(b,d,c){"inherit"===b?c.removeAttribute(d):this[d]!==b&&c.setAttribute(d,
    b);this[d]=b;};a.prototype.xGetter=function(b){"circle"===this.element.nodeName&&("x"===b?b="cx":"y"===b&&(b="cy"));return this._defaultGetter(b)};a.prototype.zIndexSetter=function(b,d){var c=this.renderer,g=this.parentGroup,m=(g||c).element||c.box,e=this.element;c=m===c.box;var a=!1;var l=this.added;var E;t(b)?(e.setAttribute("data-z-index",b),b=+b,this[d]===b&&(l=!1)):t(this[d])&&e.removeAttribute("data-z-index");this[d]=b;if(l){(b=this.zIndex)&&g&&(g.handleZ=!0);d=m.childNodes;for(E=d.length-1;0<=
    E&&!a;E--){g=d[E];l=g.getAttribute("data-z-index");var r=!t(l);if(g!==e)if(0>b&&r&&!c&&!E)m.insertBefore(e,d[E]),a=!0;else if(I(l)<=b||r&&(!t(b)||0<=b))m.insertBefore(e,d[E+1]||null),a=!0;}a||(m.insertBefore(e,d[c?3:0]||null),a=!0);}return a};return a}();a.prototype["stroke-widthSetter"]=a.prototype.strokeSetter;a.prototype.yGetter=a.prototype.xGetter;a.prototype.matrixSetter=a.prototype.rotationOriginXSetter=a.prototype.rotationOriginYSetter=a.prototype.rotationSetter=a.prototype.scaleXSetter=a.prototype.scaleYSetter=
    a.prototype.translateXSetter=a.prototype.translateYSetter=a.prototype.verticalAlignSetter=function(b,d){this[d]=b;this.doTransform=!0;};return a});M(a,"Core/Renderer/RendererRegistry.js",[a["Core/Globals.js"]],function(a){var v;(function(v){v.rendererTypes={};var u;v.getRendererType=function(a){void 0===a&&(a=u);return v.rendererTypes[a]||v.rendererTypes[u]};v.registerRendererType=function(y,z,H){v.rendererTypes[y]=z;if(!u||H)u=y,a.Renderer=z;};})(v||(v={}));return v});M(a,"Core/Renderer/SVG/SVGLabel.js",
    [a["Core/Renderer/SVG/SVGElement.js"],a["Core/Utilities.js"]],function(a,u){var v=this&&this.__extends||function(){var a=function(k,e){a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(c,e){c.__proto__=e;}||function(c,e){for(var a in e)e.hasOwnProperty(a)&&(c[a]=e[a]);};return a(k,e)};return function(k,e){function c(){this.constructor=k;}a(k,e);k.prototype=null===e?Object.create(e):(c.prototype=e.prototype,new c);}}(),F=u.defined,y=u.extend,G=u.isNumber,H=u.merge,A=u.pick,q=u.removeEvent;
    return function(n){function k(e,c,a,f,w,p,B,t,J,C){var r=n.call(this)||this;r.paddingLeftSetter=r.paddingSetter;r.paddingRightSetter=r.paddingSetter;r.init(e,"g");r.textStr=c;r.x=a;r.y=f;r.anchorX=p;r.anchorY=B;r.baseline=J;r.className=C;r.addClass("button"===C?"highcharts-no-tooltip":"highcharts-label");C&&r.addClass("highcharts-"+C);r.text=e.text(void 0,0,0,t).attr({zIndex:1});var l;"string"===typeof w&&((l=/^url\((.*?)\)$/.test(w))||r.renderer.symbols[w])&&(r.symbolKey=w);r.bBox=k.emptyBBox;r.padding=
    3;r.baselineOffset=0;r.needsBox=e.styledMode||l;r.deferredAttr={};r.alignFactor=0;return r}v(k,n);k.prototype.alignSetter=function(e){e={left:0,center:.5,right:1}[e];e!==this.alignFactor&&(this.alignFactor=e,this.bBox&&G(this.xSetting)&&this.attr({x:this.xSetting}));};k.prototype.anchorXSetter=function(e,c){this.anchorX=e;this.boxAttr(c,Math.round(e)-this.getCrispAdjust()-this.xSetting);};k.prototype.anchorYSetter=function(e,c){this.anchorY=e;this.boxAttr(c,e-this.ySetting);};k.prototype.boxAttr=function(e,
    c){this.box?this.box.attr(e,c):this.deferredAttr[e]=c;};k.prototype.css=function(e){if(e){var c={};e=H(e);k.textProps.forEach(function(a){"undefined"!==typeof e[a]&&(c[a]=e[a],delete e[a]);});this.text.css(c);var h="width"in c;"fontSize"in c||"fontWeight"in c?this.updateTextPadding():h&&this.updateBoxSize();}return a.prototype.css.call(this,e)};k.prototype.destroy=function(){q(this.element,"mouseenter");q(this.element,"mouseleave");this.text&&this.text.destroy();this.box&&(this.box=this.box.destroy());
    a.prototype.destroy.call(this);};k.prototype.fillSetter=function(e,c){e&&(this.needsBox=!0);this.fill=e;this.boxAttr(c,e);};k.prototype.getBBox=function(){this.textStr&&0===this.bBox.width&&0===this.bBox.height&&this.updateBoxSize();var e=this.padding,c=A(this.paddingLeft,e);return {width:this.width,height:this.height,x:this.bBox.x-c,y:this.bBox.y-e}};k.prototype.getCrispAdjust=function(){return this.renderer.styledMode&&this.box?this.box.strokeWidth()%2/2:(this["stroke-width"]?parseInt(this["stroke-width"],
    10):0)%2/2};k.prototype.heightSetter=function(e){this.heightSetting=e;};k.prototype.onAdd=function(){var e=this.textStr;this.text.add(this);this.attr({text:F(e)?e:"",x:this.x,y:this.y});this.box&&F(this.anchorX)&&this.attr({anchorX:this.anchorX,anchorY:this.anchorY});};k.prototype.paddingSetter=function(e,c){G(e)?e!==this[c]&&(this[c]=e,this.updateTextPadding()):this[c]=void 0;};k.prototype.rSetter=function(e,c){this.boxAttr(c,e);};k.prototype.shadow=function(e){e&&!this.renderer.styledMode&&(this.updateBoxSize(),
    this.box&&this.box.shadow(e));return this};k.prototype.strokeSetter=function(e,c){this.stroke=e;this.boxAttr(c,e);};k.prototype["stroke-widthSetter"]=function(e,c){e&&(this.needsBox=!0);this["stroke-width"]=e;this.boxAttr(c,e);};k.prototype["text-alignSetter"]=function(e){this.textAlign=e;};k.prototype.textSetter=function(e){"undefined"!==typeof e&&this.text.attr({text:e});this.updateTextPadding();};k.prototype.updateBoxSize=function(){var e=this.text.element.style,c={},a=this.padding,f=this.bBox=G(this.widthSetting)&&
    G(this.heightSetting)&&!this.textAlign||!F(this.text.textStr)?k.emptyBBox:this.text.getBBox();this.width=this.getPaddedWidth();this.height=(this.heightSetting||f.height||0)+2*a;e=this.renderer.fontMetrics(e&&e.fontSize,this.text);this.baselineOffset=a+Math.min((this.text.firstLineMetrics||e).b,f.height||Infinity);this.heightSetting&&(this.baselineOffset+=(this.heightSetting-e.h)/2);this.needsBox&&(this.box||(a=this.box=this.symbolKey?this.renderer.symbol(this.symbolKey):this.renderer.rect(),a.addClass(("button"===
    this.className?"":"highcharts-label-box")+(this.className?" highcharts-"+this.className+"-box":"")),a.add(this)),a=this.getCrispAdjust(),c.x=a,c.y=(this.baseline?-this.baselineOffset:0)+a,c.width=Math.round(this.width),c.height=Math.round(this.height),this.box.attr(y(c,this.deferredAttr)),this.deferredAttr={});};k.prototype.updateTextPadding=function(){var a=this.text;this.updateBoxSize();var c=this.baseline?0:this.baselineOffset,h=A(this.paddingLeft,this.padding);F(this.widthSetting)&&this.bBox&&
    ("center"===this.textAlign||"right"===this.textAlign)&&(h+={center:.5,right:1}[this.textAlign]*(this.widthSetting-this.bBox.width));if(h!==a.x||c!==a.y)a.attr("x",h),a.hasBoxWidthChanged&&(this.bBox=a.getBBox(!0)),"undefined"!==typeof c&&a.attr("y",c);a.x=h;a.y=c;};k.prototype.widthSetter=function(a){this.widthSetting=G(a)?a:void 0;};k.prototype.getPaddedWidth=function(){var a=this.padding,c=A(this.paddingLeft,a);a=A(this.paddingRight,a);return (this.widthSetting||this.bBox.width||0)+c+a};k.prototype.xSetter=
    function(a){this.x=a;this.alignFactor&&(a-=this.alignFactor*this.getPaddedWidth(),this["forceAnimate:x"]=!0);this.xSetting=Math.round(a);this.attr("translateX",this.xSetting);};k.prototype.ySetter=function(a){this.ySetting=this.y=Math.round(a);this.attr("translateY",this.ySetting);};k.emptyBBox={width:0,height:0,x:0,y:0};k.textProps="color direction fontFamily fontSize fontStyle fontWeight lineHeight textAlign textDecoration textOutline textOverflow width".split(" ");return k}(a)});M(a,"Core/Renderer/SVG/Symbols.js",
    [a["Core/Utilities.js"]],function(a){function v(a,q,n,k,e){var c=[];if(e){var h=e.start||0,f=H(e.r,n);n=H(e.r,k||n);var w=(e.end||0)-.001;k=e.innerR;var p=H(e.open,.001>Math.abs((e.end||0)-h-2*Math.PI)),B=Math.cos(h),t=Math.sin(h),J=Math.cos(w),C=Math.sin(w);h=H(e.longArc,.001>w-h-Math.PI?0:1);c.push(["M",a+f*B,q+n*t],["A",f,n,0,h,H(e.clockwise,1),a+f*J,q+n*C]);y(k)&&c.push(p?["M",a+k*J,q+k*C]:["L",a+k*J,q+k*C],["A",k,k,0,h,y(e.clockwise)?1-e.clockwise:0,a+k*B,q+k*t]);p||c.push(["Z"]);}return c}function z(a,
    q,n,k,e){return e&&e.r?F(a,q,n,k,e):[["M",a,q],["L",a+n,q],["L",a+n,q+k],["L",a,q+k],["Z"]]}function F(a,q,n,k,e){e=e&&e.r||0;return [["M",a+e,q],["L",a+n-e,q],["C",a+n,q,a+n,q,a+n,q+e],["L",a+n,q+k-e],["C",a+n,q+k,a+n,q+k,a+n-e,q+k],["L",a+e,q+k],["C",a,q+k,a,q+k,a,q+k-e],["L",a,q+e],["C",a,q,a,q,a+e,q]]}var y=a.defined,G=a.isNumber,H=a.pick;return {arc:v,callout:function(a,q,n,k,e){var c=Math.min(e&&e.r||0,n,k),h=c+6,f=e&&e.anchorX;e=e&&e.anchorY||0;var w=F(a,q,n,k,{r:c});if(!G(f))return w;a+f>=n?
    e>q+h&&e<q+k-h?w.splice(3,1,["L",a+n,e-6],["L",a+n+6,e],["L",a+n,e+6],["L",a+n,q+k-c]):w.splice(3,1,["L",a+n,k/2],["L",f,e],["L",a+n,k/2],["L",a+n,q+k-c]):0>=a+f?e>q+h&&e<q+k-h?w.splice(7,1,["L",a,e+6],["L",a-6,e],["L",a,e-6],["L",a,q+c]):w.splice(7,1,["L",a,k/2],["L",f,e],["L",a,k/2],["L",a,q+c]):e&&e>k&&f>a+h&&f<a+n-h?w.splice(5,1,["L",f+6,q+k],["L",f,q+k+6],["L",f-6,q+k],["L",a+c,q+k]):e&&0>e&&f>a+h&&f<a+n-h&&w.splice(1,1,["L",f-6,q],["L",f,q-6],["L",f+6,q],["L",n-c,q]);return w},circle:function(a,
    q,n,k){return v(a+n/2,q+k/2,n/2,k/2,{start:.5*Math.PI,end:2.5*Math.PI,open:!1})},diamond:function(a,q,n,k){return [["M",a+n/2,q],["L",a+n,q+k/2],["L",a+n/2,q+k],["L",a,q+k/2],["Z"]]},rect:z,roundedRect:F,square:z,triangle:function(a,q,n,k){return [["M",a+n/2,q],["L",a+n,q+k],["L",a,q+k],["Z"]]},"triangle-down":function(a,q,n,k){return [["M",a,q],["L",a+n,q],["L",a+n/2,q+k],["Z"]]}}});M(a,"Core/Renderer/SVG/TextBuilder.js",[a["Core/Renderer/HTML/AST.js"],a["Core/Globals.js"],a["Core/Utilities.js"]],function(a,
    u,z){var v=u.doc,y=u.SVG_NS,G=u.win,H=z.attr,A=z.isString,q=z.objectEach,n=z.pick;return function(){function k(a){var c=a.styles;this.renderer=a.renderer;this.svgElement=a;this.width=a.textWidth;this.textLineHeight=c&&c.lineHeight;this.textOutline=c&&c.textOutline;this.ellipsis=!(!c||"ellipsis"!==c.textOverflow);this.noWrap=!(!c||"nowrap"!==c.whiteSpace);this.fontSize=c&&c.fontSize;}k.prototype.buildSVG=function(){var e=this.svgElement,c=e.element,h=e.renderer,f=n(e.textStr,"").toString(),k=-1!==f.indexOf("<"),
    p=c.childNodes;h=this.width&&!e.added&&h.box;var B=/<br.*?>/g,t=[f,this.ellipsis,this.noWrap,this.textLineHeight,this.textOutline,this.fontSize,this.width].join();if(t!==e.textCache){e.textCache=t;delete e.actualWidth;for(t=p.length;t--;)c.removeChild(p[t]);k||this.ellipsis||this.width||-1!==f.indexOf(" ")&&(!this.noWrap||B.test(f))?""!==f&&(h&&h.appendChild(c),f=new a(f),this.modifyTree(f.nodes),f.addToDOM(e.element),this.modifyDOM(),this.ellipsis&&-1!==(c.textContent||"").indexOf("\u2026")&&e.attr("title",
    this.unescapeEntities(e.textStr||"",["&lt;","&gt;"])),h&&h.removeChild(c)):c.appendChild(v.createTextNode(this.unescapeEntities(f)));A(this.textOutline)&&e.applyTextOutline&&e.applyTextOutline(this.textOutline);}};k.prototype.modifyDOM=function(){var a=this,c=this.svgElement,h=H(c.element,"x");c.firstLineMetrics=void 0;for(var f;f=c.element.firstChild;)if(/^[\s\u200B]*$/.test(f.textContent||" "))c.element.removeChild(f);else break;[].forEach.call(c.element.querySelectorAll("tspan.highcharts-br"),function(e,
    p){e.nextSibling&&e.previousSibling&&(0===p&&1===e.previousSibling.nodeType&&(c.firstLineMetrics=c.renderer.fontMetrics(void 0,e.previousSibling)),H(e,{dy:a.getLineHeight(e.nextSibling),x:h}));});var k=this.width||0;if(k){var p=function(e,p){var f=e.textContent||"",r=f.replace(/([^\^])-/g,"$1- ").split(" "),l=!a.noWrap&&(1<r.length||1<c.element.childNodes.length),b=a.getLineHeight(p),g=0,d=c.actualWidth;if(a.ellipsis)f&&a.truncate(e,f,void 0,0,Math.max(0,k-parseInt(a.fontSize||12,10)),function(b,d){return b.substring(0,
    d)+"\u2026"});else if(l){f=[];for(l=[];p.firstChild&&p.firstChild!==e;)l.push(p.firstChild),p.removeChild(p.firstChild);for(;r.length;)r.length&&!a.noWrap&&0<g&&(f.push(e.textContent||""),e.textContent=r.join(" ").replace(/- /g,"-")),a.truncate(e,void 0,r,0===g?d||0:0,k,function(b,d){return r.slice(0,d).join(" ").replace(/- /g,"-")}),d=c.actualWidth,g++;l.forEach(function(b){p.insertBefore(b,e);});f.forEach(function(d){p.insertBefore(v.createTextNode(d),e);d=v.createElementNS(y,"tspan");d.textContent=
    "\u200b";H(d,{dy:b,x:h});p.insertBefore(d,e);});}},B=function(a){[].slice.call(a.childNodes).forEach(function(e){e.nodeType===G.Node.TEXT_NODE?p(e,a):(-1!==e.className.baseVal.indexOf("highcharts-br")&&(c.actualWidth=0),B(e));});};B(c.element);}};k.prototype.getLineHeight=function(a){var c;a=a.nodeType===G.Node.TEXT_NODE?a.parentElement:a;this.renderer.styledMode||(c=a&&/(px|em)$/.test(a.style.fontSize)?a.style.fontSize:this.fontSize||this.renderer.style.fontSize||12);return this.textLineHeight?parseInt(this.textLineHeight.toString(),
    10):this.renderer.fontMetrics(c,a||this.svgElement.element).h};k.prototype.modifyTree=function(a){var c=this,e=function(h,k){var p=h.attributes;p=void 0===p?{}:p;var f=h.children,t=h.tagName,w=c.renderer.styledMode;if("b"===t||"strong"===t)w?p["class"]="highcharts-strong":p.style="font-weight:bold;"+(p.style||"");else if("i"===t||"em"===t)w?p["class"]="highcharts-emphasized":p.style="font-style:italic;"+(p.style||"");A(p.style)&&(p.style=p.style.replace(/(;| |^)color([ :])/,"$1fill$2"));"br"===t?
    (p["class"]="highcharts-br",h.textContent="\u200b",(k=a[k+1])&&k.textContent&&(k.textContent=k.textContent.replace(/^ +/gm,""))):"a"===t&&f&&f.some(function(c){return "#text"===c.tagName})&&(h.children=[{children:f,tagName:"tspan"}]);"#text"!==t&&"a"!==t&&(h.tagName="tspan");h.attributes=p;f&&f.filter(function(c){return "#text"!==c.tagName}).forEach(e);};a.forEach(e);};k.prototype.truncate=function(a,c,h,f,k,p){var e=this.svgElement,t=e.renderer,w=e.rotation,n=[],r=h?1:0,l=(c||h||"").length,b=l,g,d=function(b,
    d){d=d||b;var g=a.parentNode;if(g&&"undefined"===typeof n[d])if(g.getSubStringLength)try{n[d]=f+g.getSubStringLength(0,h?d+1:d);}catch(P){}else t.getSpanWidth&&(a.textContent=p(c||h,b),n[d]=f+t.getSpanWidth(e,a));return n[d]};e.rotation=0;var m=d(a.textContent.length);if(f+m>k){for(;r<=l;)b=Math.ceil((r+l)/2),h&&(g=p(h,b)),m=d(b,g&&g.length-1),r===l?r=l+1:m>k?l=b-1:r=b;0===l?a.textContent="":c&&l===c.length-1||(a.textContent=g||p(c||h,b));}h&&h.splice(0,b);e.actualWidth=m;e.rotation=w;};k.prototype.unescapeEntities=
    function(a,c){q(this.renderer.escapes,function(e,f){c&&-1!==c.indexOf(e)||(a=a.toString().replace(new RegExp(e,"g"),f));});return a};return k}()});M(a,"Core/Renderer/SVG/SVGRenderer.js",[a["Core/Renderer/HTML/AST.js"],a["Core/Color/Color.js"],a["Core/Globals.js"],a["Core/Renderer/RendererRegistry.js"],a["Core/Renderer/SVG/SVGElement.js"],a["Core/Renderer/SVG/SVGLabel.js"],a["Core/Renderer/SVG/Symbols.js"],a["Core/Renderer/SVG/TextBuilder.js"],a["Core/Utilities.js"]],function(a,u,z,F,y,G,H,A,q){var n=
    z.charts,k=z.deg2rad,e=z.doc,c=z.isFirefox,h=z.isMS,f=z.isWebKit,w=z.noop,p=z.SVG_NS,B=z.symbolSizes,t=z.win,J=q.addEvent,C=q.attr,r=q.createElement,l=q.css,b=q.defined,g=q.destroyObjectProperties,d=q.extend,m=q.isArray,D=q.isNumber,x=q.isObject,I=q.isString,P=q.merge,v=q.pick,O=q.pInt,U=q.uniqueKey,Y;z=function(){function L(b,d,a,c,g,m,e){this.width=this.url=this.style=this.isSVG=this.imgCount=this.height=this.gradients=this.globalAnimation=this.defs=this.chartIndex=this.cacheKeys=this.cache=this.boxWrapper=
    this.box=this.alignedObjects=void 0;this.init(b,d,a,c,g,m,e);}L.prototype.init=function(b,d,a,g,m,E,L){var r=this.createElement("svg").attr({version:"1.1","class":"highcharts-root"}),K=r.element;L||r.css(this.getStyle(g));b.appendChild(K);C(b,"dir","ltr");-1===b.innerHTML.indexOf("xmlns")&&C(K,"xmlns",this.SVG_NS);this.isSVG=!0;this.box=K;this.boxWrapper=r;this.alignedObjects=[];this.url=this.getReferenceURL();this.createElement("desc").add().element.appendChild(e.createTextNode("Created with Highcharts 9.3.2"));
    this.defs=this.createElement("defs").add();this.allowHTML=E;this.forExport=m;this.styledMode=L;this.gradients={};this.cache={};this.cacheKeys=[];this.imgCount=0;this.setSize(d,a,!1);var p;c&&b.getBoundingClientRect&&(d=function(){l(b,{left:0,top:0});p=b.getBoundingClientRect();l(b,{left:Math.ceil(p.left)-p.left+"px",top:Math.ceil(p.top)-p.top+"px"});},d(),this.unSubPixelFix=J(t,"resize",d));};L.prototype.definition=function(b){return (new a([b])).addToDOM(this.defs.element)};L.prototype.getReferenceURL=
    function(){if((c||f)&&e.getElementsByTagName("base").length){if(!b(Y)){var d=U();d=(new a([{tagName:"svg",attributes:{width:8,height:8},children:[{tagName:"defs",children:[{tagName:"clipPath",attributes:{id:d},children:[{tagName:"rect",attributes:{width:4,height:4}}]}]},{tagName:"rect",attributes:{id:"hitme",width:8,height:8,"clip-path":"url(#"+d+")",fill:"rgba(0,0,0,0.001)"}}]}])).addToDOM(e.body);l(d,{position:"fixed",top:0,left:0,zIndex:9E5});var g=e.elementFromPoint(6,6);Y="hitme"===(g&&g.id);
    e.body.removeChild(d);}if(Y)return t.location.href.split("#")[0].replace(/<[^>]*>/g,"").replace(/([\('\)])/g,"\\$1").replace(/ /g,"%20")}return ""};L.prototype.getStyle=function(b){return this.style=d({fontFamily:'"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif',fontSize:"12px"},b)};L.prototype.setStyle=function(b){this.boxWrapper.css(this.getStyle(b));};L.prototype.isHidden=function(){return !this.boxWrapper.getBBox().width};L.prototype.destroy=function(){var b=this.defs;this.box=
    null;this.boxWrapper=this.boxWrapper.destroy();g(this.gradients||{});this.gradients=null;b&&(this.defs=b.destroy());this.unSubPixelFix&&this.unSubPixelFix();return this.alignedObjects=null};L.prototype.createElement=function(b){var d=new this.Element;d.init(this,b);return d};L.prototype.getRadialAttr=function(b,d){return {cx:b[0]-b[2]/2+(d.cx||0)*b[2],cy:b[1]-b[2]/2+(d.cy||0)*b[2],r:(d.r||0)*b[2]}};L.prototype.buildText=function(b){(new A(b)).buildSVG();};L.prototype.getContrast=function(b){b=u.parse(b).rgba;
    b[0]*=1;b[1]*=1.2;b[2]*=.5;return 459<b[0]+b[1]+b[2]?"#000000":"#FFFFFF"};L.prototype.button=function(b,c,g,m,e,l,L,r,p,x){var E=this.label(b,c,g,p,void 0,void 0,x,void 0,"button"),f=this.styledMode,K=0,D=e?P(e):{};b=D&&D.style||{};D=a.filterUserAttributes(D);E.attr(P({padding:8,r:2},D));if(!f){D=P({fill:"#f7f7f7",stroke:"#cccccc","stroke-width":1,style:{color:"#333333",cursor:"pointer",fontWeight:"normal"}},{style:b},D);var k=D.style;delete D.style;l=P(D,{fill:"#e6e6e6"},a.filterUserAttributes(l||
    {}));var N=l.style;delete l.style;L=P(D,{fill:"#e6ebf5",style:{color:"#000000",fontWeight:"bold"}},a.filterUserAttributes(L||{}));var w=L.style;delete L.style;r=P(D,{style:{color:"#cccccc"}},a.filterUserAttributes(r||{}));var t=r.style;delete r.style;}J(E.element,h?"mouseover":"mouseenter",function(){3!==K&&E.setState(1);});J(E.element,h?"mouseout":"mouseleave",function(){3!==K&&E.setState(K);});E.setState=function(b){1!==b&&(E.state=K=b);E.removeClass(/highcharts-button-(normal|hover|pressed|disabled)/).addClass("highcharts-button-"+
    ["normal","hover","pressed","disabled"][b||0]);f||E.attr([D,l,L,r][b||0]).css([k,N,w,t][b||0]);};f||E.attr(D).css(d({cursor:"default"},k));return E.on("touchstart",function(b){return b.stopPropagation()}).on("click",function(b){3!==K&&m.call(E,b);})};L.prototype.crispLine=function(d,a,c){void 0===c&&(c="round");var g=d[0],m=d[1];b(g[1])&&g[1]===m[1]&&(g[1]=m[1]=Math[c](g[1])-a%2/2);b(g[2])&&g[2]===m[2]&&(g[2]=m[2]=Math[c](g[2])+a%2/2);return d};L.prototype.path=function(b){var a=this.styledMode?{}:
    {fill:"none"};m(b)?a.d=b:x(b)&&d(a,b);return this.createElement("path").attr(a)};L.prototype.circle=function(b,d,a){b=x(b)?b:"undefined"===typeof b?{}:{x:b,y:d,r:a};d=this.createElement("circle");d.xSetter=d.ySetter=function(b,d,a){a.setAttribute("c"+d,b);};return d.attr(b)};L.prototype.arc=function(b,d,a,c,g,m){x(b)?(c=b,d=c.y,a=c.r,b=c.x):c={innerR:c,start:g,end:m};b=this.symbol("arc",b,d,a,a,c);b.r=a;return b};L.prototype.rect=function(b,d,a,c,g,m){g=x(b)?b.r:g;var e=this.createElement("rect");
    b=x(b)?b:"undefined"===typeof b?{}:{x:b,y:d,width:Math.max(a,0),height:Math.max(c,0)};this.styledMode||("undefined"!==typeof m&&(b["stroke-width"]=m,b=e.crisp(b)),b.fill="none");g&&(b.r=g);e.rSetter=function(b,d,a){e.r=b;C(a,{rx:b,ry:b});};e.rGetter=function(){return e.r||0};return e.attr(b)};L.prototype.setSize=function(b,d,a){this.width=b;this.height=d;this.boxWrapper.animate({width:b,height:d},{step:function(){this.attr({viewBox:"0 0 "+this.attr("width")+" "+this.attr("height")});},duration:v(a,
    !0)?void 0:0});this.alignElements();};L.prototype.g=function(b){var d=this.createElement("g");return b?d.attr({"class":"highcharts-"+b}):d};L.prototype.image=function(b,d,a,c,g,m){var e={preserveAspectRatio:"none"},l=function(b,d){b.setAttributeNS?b.setAttributeNS("http://www.w3.org/1999/xlink","href",d):b.setAttribute("hc-svg-href",d);};D(d)&&(e.x=d);D(a)&&(e.y=a);D(c)&&(e.width=c);D(g)&&(e.height=g);var E=this.createElement("image").attr(e);d=function(d){l(E.element,b);m.call(E,d);};m?(l(E.element,
    "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="),a=new t.Image,J(a,"load",d),a.src=b,a.complete&&d({})):l(E.element,b);return E};L.prototype.symbol=function(a,c,g,m,L,E){var p=this,h=/^url\((.*?)\)$/,x=h.test(a),f=!x&&(this.symbols[a]?a:"circle"),D=f&&this.symbols[f],k;if(D){"number"===typeof c&&(k=D.call(this.symbols,Math.round(c||0),Math.round(g||0),m||0,L||0,E));var K=this.path(k);p.styledMode||K.attr("fill","none");d(K,{symbolName:f||void 0,x:c,y:g,width:m,height:L});
    E&&d(K,E);}else if(x){var w=a.match(h)[1];var t=K=this.image(w);t.imgwidth=v(B[w]&&B[w].width,E&&E.width);t.imgheight=v(B[w]&&B[w].height,E&&E.height);var I=function(b){return b.attr({width:b.width,height:b.height})};["width","height"].forEach(function(d){t[d+"Setter"]=function(d,a){var c=this["img"+a];this[a]=d;b(c)&&(E&&"within"===E.backgroundSize&&this.width&&this.height&&(c=Math.round(c*Math.min(this.width/this.imgwidth,this.height/this.imgheight))),this.element&&this.element.setAttribute(a,c),
    this.alignByTranslate||(d=((this[a]||0)-c)/2,this.attr("width"===a?{translateX:d}:{translateY:d})));};});b(c)&&t.attr({x:c,y:g});t.isImg=!0;b(t.imgwidth)&&b(t.imgheight)?I(t):(t.attr({width:0,height:0}),r("img",{onload:function(){var b=n[p.chartIndex];0===this.width&&(l(this,{position:"absolute",top:"-999em"}),e.body.appendChild(this));B[w]={width:this.width,height:this.height};t.imgwidth=this.width;t.imgheight=this.height;t.element&&I(t);this.parentNode&&this.parentNode.removeChild(this);p.imgCount--;
    if(!p.imgCount&&b&&!b.hasLoaded)b.onload();},src:w}),this.imgCount++);}return K};L.prototype.clipRect=function(b,d,a,c){var g=U()+"-",m=this.createElement("clipPath").attr({id:g}).add(this.defs);b=this.rect(b,d,a,c,0).add(m);b.id=g;b.clipPath=m;b.count=0;return b};L.prototype.text=function(d,a,c,g){var m={};if(g&&(this.allowHTML||!this.forExport))return this.html(d,a,c);m.x=Math.round(a||0);c&&(m.y=Math.round(c));b(d)&&(m.text=d);d=this.createElement("text").attr(m);if(!g||this.forExport&&!this.allowHTML)d.xSetter=
    function(b,d,a){for(var c=a.getElementsByTagName("tspan"),g=a.getAttribute(d),m=0,e;m<c.length;m++)e=c[m],e.getAttribute(d)===g&&e.setAttribute(d,b);a.setAttribute(d,b);};return d};L.prototype.fontMetrics=function(b,d){b=!this.styledMode&&/px/.test(b)||!t.getComputedStyle?b||d&&d.style&&d.style.fontSize||this.style&&this.style.fontSize:d&&y.prototype.getStyle.call(d,"font-size");b=/px/.test(b)?O(b):12;d=24>b?b+3:Math.round(1.2*b);return {h:d,b:Math.round(.8*d),f:b}};L.prototype.rotCorr=function(b,d,
    a){var c=b;d&&a&&(c=Math.max(c*Math.cos(d*k),4));return {x:-b/3*Math.sin(d*k),y:c}};L.prototype.pathToSegments=function(b){for(var d=[],a=[],c={A:8,C:7,H:2,L:3,M:3,Q:5,S:5,T:3,V:2},g=0;g<b.length;g++)I(a[0])&&D(b[g])&&a.length===c[a[0].toUpperCase()]&&b.splice(g,0,a[0].replace("M","L").replace("m","l")),"string"===typeof b[g]&&(a.length&&d.push(a.slice(0)),a.length=0),a.push(b[g]);d.push(a.slice(0));return d};L.prototype.label=function(b,d,a,c,g,m,e,l,L){return new G(this,b,d,a,c,g,m,e,l,L)};L.prototype.alignElements=
    function(){this.alignedObjects.forEach(function(b){return b.align()});};return L}();d(z.prototype,{Element:y,SVG_NS:p,escapes:{"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"},symbols:H,draw:w});F.registerRendererType("svg",z,!0);return z});M(a,"Core/Renderer/HTML/HTMLElement.js",[a["Core/Globals.js"],a["Core/Renderer/SVG/SVGElement.js"],a["Core/Utilities.js"]],function(a,u,z){var v=this&&this.__extends||function(){var a=function(c,e){a=Object.setPrototypeOf||{__proto__:[]}instanceof
    Array&&function(a,c){a.__proto__=c;}||function(a,c){for(var e in c)c.hasOwnProperty(e)&&(a[e]=c[e]);};return a(c,e)};return function(c,e){function p(){this.constructor=c;}a(c,e);c.prototype=null===e?Object.create(e):(p.prototype=e.prototype,new p);}}(),y=a.isFirefox,G=a.isMS,H=a.isWebKit,A=a.win,q=z.css,n=z.defined,k=z.extend,e=z.pick,c=z.pInt;return function(a){function h(){return null!==a&&a.apply(this,arguments)||this}v(h,a);h.compose=function(a){if(-1===h.composedClasses.indexOf(a)){h.composedClasses.push(a);
    var c=h.prototype,e=a.prototype;e.getSpanCorrection=c.getSpanCorrection;e.htmlCss=c.htmlCss;e.htmlGetBBox=c.htmlGetBBox;e.htmlUpdateTransform=c.htmlUpdateTransform;e.setSpanRotation=c.setSpanRotation;}return a};h.prototype.getSpanCorrection=function(a,c,e){this.xCorr=-a*e;this.yCorr=-c;};h.prototype.htmlCss=function(a){var c="SPAN"===this.element.tagName&&a&&"width"in a,h=e(c&&a.width,void 0);if(c){delete a.width;this.textWidth=h;var f=!0;}a&&"ellipsis"===a.textOverflow&&(a.whiteSpace="nowrap",a.overflow=
    "hidden");this.styles=k(this.styles,a);q(this.element,a);f&&this.htmlUpdateTransform();return this};h.prototype.htmlGetBBox=function(){var a=this.element;return {x:a.offsetLeft,y:a.offsetTop,width:a.offsetWidth,height:a.offsetHeight}};h.prototype.htmlUpdateTransform=function(){if(this.added){var a=this.renderer,e=this.element,h=this.translateX||0,f=this.translateY||0,k=this.x||0,C=this.y||0,r=this.textAlign||"left",l={left:0,center:.5,right:1}[r],b=this.styles;b=b&&b.whiteSpace;q(e,{marginLeft:h,marginTop:f});
    !a.styledMode&&this.shadows&&this.shadows.forEach(function(b){q(b,{marginLeft:h+1,marginTop:f+1});});this.inverted&&[].forEach.call(e.childNodes,function(b){a.invertChild(b,e);});if("SPAN"===e.tagName){var g=this.rotation,d=this.textWidth&&c(this.textWidth),m=[g,r,e.innerHTML,this.textWidth,this.textAlign].join(),D=void 0;D=!1;if(d!==this.oldTextWidth){if(this.textPxLength)var x=this.textPxLength;else q(e,{width:"",whiteSpace:b||"nowrap"}),x=e.offsetWidth;(d>this.oldTextWidth||x>d)&&(/[ \-]/.test(e.textContent||
    e.innerText)||"ellipsis"===e.style.textOverflow)&&(q(e,{width:x>d||g?d+"px":"auto",display:"block",whiteSpace:b||"normal"}),this.oldTextWidth=d,D=!0);}this.hasBoxWidthChanged=D;m!==this.cTT&&(D=a.fontMetrics(e.style.fontSize,e).b,!n(g)||g===(this.oldRotation||0)&&r===this.oldAlign||this.setSpanRotation(g,l,D),this.getSpanCorrection(!n(g)&&this.textPxLength||e.offsetWidth,D,l,g,r));q(e,{left:k+(this.xCorr||0)+"px",top:C+(this.yCorr||0)+"px"});this.cTT=m;this.oldRotation=g;this.oldAlign=r;}}else this.alignOnAdd=
    !0;};h.prototype.setSpanRotation=function(a,c,e){var h={},p=G&&!/Edge/.test(A.navigator.userAgent)?"-ms-transform":H?"-webkit-transform":y?"MozTransform":A.opera?"-o-transform":void 0;p&&(h[p]=h.transform="rotate("+a+"deg)",h[p+(y?"Origin":"-origin")]=h.transformOrigin=100*c+"% "+e+"px",q(this.element,h));};h.composedClasses=[];return h}(u)});M(a,"Core/Renderer/HTML/HTMLRenderer.js",[a["Core/Renderer/HTML/AST.js"],a["Core/Renderer/SVG/SVGElement.js"],a["Core/Renderer/SVG/SVGRenderer.js"],a["Core/Utilities.js"]],
    function(a,u,z,F){var v=this&&this.__extends||function(){var a=function(k,e){a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(a,e){a.__proto__=e;}||function(a,e){for(var c in e)e.hasOwnProperty(c)&&(a[c]=e[c]);};return a(k,e)};return function(k,e){function c(){this.constructor=k;}a(k,e);k.prototype=null===e?Object.create(e):(c.prototype=e.prototype,new c);}}(),G=F.attr,H=F.createElement,A=F.extend,q=F.pick;return function(n){function k(){return null!==n&&n.apply(this,arguments)||this}
    v(k,n);k.compose=function(a){-1===k.composedClasses.indexOf(a)&&(k.composedClasses.push(a),a.prototype.html=k.prototype.html);return a};k.prototype.html=function(e,c,h){var f=this.createElement("span"),k=f.element,p=f.renderer,n=p.isSVG,t=function(a,c){["opacity","visibility"].forEach(function(e){a[e+"Setter"]=function(l,b,g){var d=a.div?a.div.style:c;u.prototype[e+"Setter"].call(this,l,b,g);d&&(d[b]=l);};});a.addedSetters=!0;};f.textSetter=function(c){c!==this.textStr&&(delete this.bBox,delete this.oldTextWidth,
    a.setElementHTML(this.element,q(c,"")),this.textStr=c,f.doTransform=!0);};n&&t(f,f.element.style);f.xSetter=f.ySetter=f.alignSetter=f.rotationSetter=function(a,c){"align"===c?f.alignValue=f.textAlign=a:f[c]=a;f.doTransform=!0;};f.afterSetters=function(){this.doTransform&&(this.htmlUpdateTransform(),this.doTransform=!1);};f.attr({text:e,x:Math.round(c),y:Math.round(h)}).css({position:"absolute"});p.styledMode||f.css({fontFamily:this.style.fontFamily,fontSize:this.style.fontSize});k.style.whiteSpace="nowrap";
    f.css=f.htmlCss;n&&(f.add=function(a){var c=p.box.parentNode,e=[];if(this.parentGroup=a){var l=a.div;if(!l){for(;a;)e.push(a),a=a.parentGroup;e.reverse().forEach(function(b){function a(d,a){b[a]=d;"translateX"===a?r.left=d+"px":r.top=d+"px";b.doTransform=!0;}var d=G(b.element,"class"),m=b.styles||{};l=b.div=b.div||H("div",d?{className:d}:void 0,{position:"absolute",left:(b.translateX||0)+"px",top:(b.translateY||0)+"px",display:b.display,opacity:b.opacity,cursor:m.cursor,pointerEvents:m.pointerEvents,
    visibility:b.visibility},l||c);var r=l.style;A(b,{classSetter:function(b){return function(d){this.element.setAttribute("class",d);b.className=d;}}(l),on:function(){e[0].div&&f.on.apply({element:e[0].div,onEvents:b.onEvents},arguments);return b},translateXSetter:a,translateYSetter:a});b.addedSetters||t(b);});}}else l=c;l.appendChild(k);f.added=!0;f.alignOnAdd&&f.htmlUpdateTransform();return f});return f};k.composedClasses=[];return k}(z)});M(a,"Core/Axis/AxisDefaults.js",[],function(){var a;(function(a){a.defaultXAxisOptions=
    {alignTicks:!0,allowDecimals:void 0,panningEnabled:!0,zIndex:2,zoomEnabled:!0,dateTimeLabelFormats:{millisecond:{main:"%H:%M:%S.%L",range:!1},second:{main:"%H:%M:%S",range:!1},minute:{main:"%H:%M",range:!1},hour:{main:"%H:%M",range:!1},day:{main:"%e. %b"},week:{main:"%e. %b"},month:{main:"%b '%y"},year:{main:"%Y"}},endOnTick:!1,gridLineDashStyle:"Solid",gridZIndex:1,labels:{autoRotation:void 0,autoRotationLimit:80,distance:void 0,enabled:!0,indentation:10,overflow:"justify",padding:5,reserveSpace:void 0,
    rotation:void 0,staggerLines:0,step:0,useHTML:!1,x:0,zIndex:7,style:{color:"#666666",cursor:"default",fontSize:"11px"}},maxPadding:.01,minorGridLineDashStyle:"Solid",minorTickLength:2,minorTickPosition:"outside",minPadding:.01,offset:void 0,opposite:!1,reversed:void 0,reversedStacks:!1,showEmpty:!0,showFirstLabel:!0,showLastLabel:!0,startOfWeek:1,startOnTick:!1,tickLength:10,tickPixelInterval:100,tickmarkPlacement:"between",tickPosition:"outside",title:{align:"middle",rotation:0,useHTML:!1,x:0,y:0,
    style:{color:"#666666"}},type:"linear",uniqueNames:!0,visible:!0,minorGridLineColor:"#f2f2f2",minorGridLineWidth:1,minorTickColor:"#999999",lineColor:"#ccd6eb",lineWidth:1,gridLineColor:"#e6e6e6",gridLineWidth:void 0,tickColor:"#ccd6eb"};a.defaultYAxisOptions={reversedStacks:!0,endOnTick:!0,maxPadding:.05,minPadding:.05,tickPixelInterval:72,showLastLabel:!0,labels:{x:-8},startOnTick:!0,title:{rotation:270,text:"Values"},stackLabels:{animation:{},allowOverlap:!1,enabled:!1,crop:!0,overflow:"justify",
    formatter:function(){var a=this.axis.chart.numberFormatter;return a(this.total,-1)},style:{color:"#000000",fontSize:"11px",fontWeight:"bold",textOutline:"1px contrast"}},gridLineWidth:1,lineWidth:0};a.defaultLeftAxisOptions={labels:{x:-15},title:{rotation:270}};a.defaultRightAxisOptions={labels:{x:15},title:{rotation:90}};a.defaultBottomAxisOptions={labels:{autoRotation:[-45],x:0},margin:15,title:{rotation:0}};a.defaultTopAxisOptions={labels:{autoRotation:[-45],x:0},margin:15,title:{rotation:0}};})(a||
    (a={}));return a});M(a,"Core/Foundation.js",[a["Core/Utilities.js"]],function(a){var v=a.addEvent,z=a.isFunction,F=a.objectEach,y=a.removeEvent,G;(function(a){a.registerEventOptions=function(a,q){a.eventOptions=a.eventOptions||{};F(q.events,function(n,k){a.eventOptions[k]!==n&&(a.eventOptions[k]&&(y(a,k,a.eventOptions[k]),delete a.eventOptions[k]),z(n)&&(a.eventOptions[k]=n,v(a,k,n)));});};})(G||(G={}));return G});M(a,"Core/Axis/Tick.js",[a["Core/FormatUtilities.js"],a["Core/Globals.js"],a["Core/Utilities.js"]],
    function(a,u,z){var v=u.deg2rad,y=z.clamp,G=z.correctFloat,H=z.defined,A=z.destroyObjectProperties,q=z.extend,n=z.fireEvent,k=z.isNumber,e=z.merge,c=z.objectEach,h=z.pick;u=function(){function f(a,c,e,h,f){this.isNewLabel=this.isNew=!0;this.axis=a;this.pos=c;this.type=e||"";this.parameters=f||{};this.tickmarkOffset=this.parameters.tickmarkOffset;this.options=this.parameters.options;n(this,"init");e||h||this.addLabel();}f.prototype.addLabel=function(){var c=this,e=c.axis,f=e.options,t=e.chart,J=e.categories,
    C=e.logarithmic,r=e.names,l=c.pos,b=h(c.options&&c.options.labels,f.labels),g=e.tickPositions,d=l===g[0],m=l===g[g.length-1],D=(!b.step||1===b.step)&&1===e.tickInterval;g=g.info;var x=c.label,I;J=this.parameters.category||(J?h(J[l],r[l],l):l);C&&k(J)&&(J=G(C.lin2log(J)));if(e.dateTime)if(g){var P=t.time.resolveDTLFormat(f.dateTimeLabelFormats[!f.grid&&g.higherRanks[l]||g.unitName]);var v=P.main;}else k(J)&&(v=e.dateTime.getXDateFormat(J,f.dateTimeLabelFormats||{}));c.isFirst=d;c.isLast=m;var O={axis:e,
    chart:t,dateTimeLabelFormat:v,isFirst:d,isLast:m,pos:l,tick:c,tickPositionInfo:g,value:J};n(this,"labelFormat",O);var u=function(d){return b.formatter?b.formatter.call(d,d):b.format?(d.text=e.defaultLabelFormatter.call(d),a.format(b.format,d,t)):e.defaultLabelFormatter.call(d,d)};f=u.call(O,O);var A=P&&P.list;c.shortenLabel=A?function(){for(I=0;I<A.length;I++)if(q(O,{dateTimeLabelFormat:A[I]}),x.attr({text:u.call(O,O)}),x.getBBox().width<e.getSlotWidth(c)-2*b.padding)return;x.attr({text:""});}:void 0;
    D&&e._addedPlotLB&&c.moveLabel(f,b);H(x)||c.movedLabel?x&&x.textStr!==f&&!D&&(!x.textWidth||b.style.width||x.styles.width||x.css({width:null}),x.attr({text:f}),x.textPxLength=x.getBBox().width):(c.label=x=c.createLabel({x:0,y:0},f,b),c.rotation=0);};f.prototype.createLabel=function(a,c,h){var f=this.axis,p=f.chart;if(a=H(c)&&h.enabled?p.renderer.text(c,a.x,a.y,h.useHTML).add(f.labelGroup):null)p.styledMode||a.css(e(h.style)),a.textPxLength=a.getBBox().width;return a};f.prototype.destroy=function(){A(this,
    this.axis);};f.prototype.getPosition=function(a,c,e,h){var f=this.axis,p=f.chart,r=h&&p.oldChartHeight||p.chartHeight;a={x:a?G(f.translate(c+e,null,null,h)+f.transB):f.left+f.offset+(f.opposite?(h&&p.oldChartWidth||p.chartWidth)-f.right-f.left:0),y:a?r-f.bottom+f.offset-(f.opposite?f.height:0):G(r-f.translate(c+e,null,null,h)-f.transB)};a.y=y(a.y,-1E5,1E5);n(this,"afterGetPosition",{pos:a});return a};f.prototype.getLabelPosition=function(a,c,e,h,f,k,r,l){var b=this.axis,g=b.transA,d=b.isLinked&&b.linkedParent?
    b.linkedParent.reversed:b.reversed,m=b.staggerLines,D=b.tickRotCorr||{x:0,y:0},x=h||b.reserveSpaceDefault?0:-b.labelOffset*("center"===b.labelAlign?.5:1),p={},t=f.y;H(t)||(t=0===b.side?e.rotation?-8:-e.getBBox().height:2===b.side?D.y+8:Math.cos(e.rotation*v)*(D.y-e.getBBox(!1,0).height/2));a=a+f.x+x+D.x-(k&&h?k*g*(d?-1:1):0);c=c+t-(k&&!h?k*g*(d?1:-1):0);m&&(e=r/(l||1)%m,b.opposite&&(e=m-e-1),c+=b.labelOffset/m*e);p.x=a;p.y=Math.round(c);n(this,"afterGetLabelPosition",{pos:p,tickmarkOffset:k,index:r});
    return p};f.prototype.getLabelSize=function(){return this.label?this.label.getBBox()[this.axis.horiz?"height":"width"]:0};f.prototype.getMarkPath=function(a,c,e,h,f,k){return k.crispLine([["M",a,c],["L",a+(f?0:-e),c+(f?e:0)]],h)};f.prototype.handleOverflow=function(a){var c=this.axis,e=c.options.labels,f=a.x,k=c.chart.chartWidth,n=c.chart.spacing,r=h(c.labelLeft,Math.min(c.pos,n[3]));n=h(c.labelRight,Math.max(c.isRadial?0:c.pos+c.len,k-n[1]));var l=this.label,b=this.rotation,g={left:0,center:.5,right:1}[c.labelAlign||
    l.attr("align")],d=l.getBBox().width,m=c.getSlotWidth(this),D={},x=m,I=1,w;if(b||"justify"!==e.overflow)0>b&&f-g*d<r?w=Math.round(f/Math.cos(b*v)-r):0<b&&f+g*d>n&&(w=Math.round((k-f)/Math.cos(b*v)));else if(k=f+(1-g)*d,f-g*d<r?x=a.x+x*(1-g)-r:k>n&&(x=n-a.x+x*g,I=-1),x=Math.min(m,x),x<m&&"center"===c.labelAlign&&(a.x+=I*(m-x-g*(m-Math.min(d,x)))),d>x||c.autoRotation&&(l.styles||{}).width)w=x;w&&(this.shortenLabel?this.shortenLabel():(D.width=Math.floor(w)+"px",(e.style||{}).textOverflow||(D.textOverflow=
    "ellipsis"),l.css(D)));};f.prototype.moveLabel=function(a,e){var h=this,f=h.label,k=h.axis,p=k.reversed,r=!1;f&&f.textStr===a?(h.movedLabel=f,r=!0,delete h.label):c(k.ticks,function(b){r||b.isNew||b===h||!b.label||b.label.textStr!==a||(h.movedLabel=b.label,r=!0,b.labelPos=h.movedLabel.xy,delete b.label);});if(!r&&(h.labelPos||f)){var l=h.labelPos||f.xy;f=k.horiz?p?0:k.width+k.left:l.x;k=k.horiz?l.y:p?k.width+k.left:0;h.movedLabel=h.createLabel({x:f,y:k},a,e);h.movedLabel&&h.movedLabel.attr({opacity:0});}};
    f.prototype.render=function(a,c,e){var f=this.axis,k=f.horiz,p=this.pos,r=h(this.tickmarkOffset,f.tickmarkOffset);p=this.getPosition(k,p,r,c);r=p.x;var l=p.y;f=k&&r===f.pos+f.len||!k&&l===f.pos?-1:1;k=h(e,this.label&&this.label.newOpacity,1);e=h(e,1);this.isActive=!0;this.renderGridLine(c,e,f);this.renderMark(p,e,f);this.renderLabel(p,c,k,a);this.isNew=!1;n(this,"afterRender");};f.prototype.renderGridLine=function(a,c,e){var f=this.axis,k=f.options,p={},r=this.pos,l=this.type,b=h(this.tickmarkOffset,
    f.tickmarkOffset),g=f.chart.renderer,d=this.gridLine,m=k.gridLineWidth,D=k.gridLineColor,x=k.gridLineDashStyle;"minor"===this.type&&(m=k.minorGridLineWidth,D=k.minorGridLineColor,x=k.minorGridLineDashStyle);d||(f.chart.styledMode||(p.stroke=D,p["stroke-width"]=m||0,p.dashstyle=x),l||(p.zIndex=1),a&&(c=0),this.gridLine=d=g.path().attr(p).addClass("highcharts-"+(l?l+"-":"")+"grid-line").add(f.gridGroup));if(d&&(e=f.getPlotLinePath({value:r+b,lineWidth:d.strokeWidth()*e,force:"pass",old:a})))d[a||this.isNew?
    "attr":"animate"]({d:e,opacity:c});};f.prototype.renderMark=function(a,c,e){var f=this.axis,k=f.options,p=f.chart.renderer,r=this.type,l=f.tickSize(r?r+"Tick":"tick"),b=a.x;a=a.y;var g=h(k["minor"!==r?"tickWidth":"minorTickWidth"],!r&&f.isXAxis?1:0);k=k["minor"!==r?"tickColor":"minorTickColor"];var d=this.mark,m=!d;l&&(f.opposite&&(l[0]=-l[0]),d||(this.mark=d=p.path().addClass("highcharts-"+(r?r+"-":"")+"tick").add(f.axisGroup),f.chart.styledMode||d.attr({stroke:k,"stroke-width":g})),d[m?"attr":"animate"]({d:this.getMarkPath(b,
    a,l[0],d.strokeWidth()*e,f.horiz,p),opacity:c}));};f.prototype.renderLabel=function(a,c,e,f){var p=this.axis,n=p.horiz,r=p.options,l=this.label,b=r.labels,g=b.step;p=h(this.tickmarkOffset,p.tickmarkOffset);var d=a.x;a=a.y;var m=!0;l&&k(d)&&(l.xy=a=this.getLabelPosition(d,a,l,n,b,p,f,g),this.isFirst&&!this.isLast&&!r.showFirstLabel||this.isLast&&!this.isFirst&&!r.showLastLabel?m=!1:!n||b.step||b.rotation||c||0===e||this.handleOverflow(a),g&&f%g&&(m=!1),m&&k(a.y)?(a.opacity=e,l[this.isNewLabel?"attr":
    "animate"](a),this.isNewLabel=!1):(l.attr("y",-9999),this.isNewLabel=!0));};f.prototype.replaceMovedLabel=function(){var a=this.label,c=this.axis,e=c.reversed;if(a&&!this.isNew){var f=c.horiz?e?c.left:c.width+c.left:a.xy.x;e=c.horiz?a.xy.y:e?c.width+c.top:c.top;a.animate({x:f,y:e,opacity:0},void 0,a.destroy);delete this.label;}c.isDirty=!0;this.label=this.movedLabel;delete this.movedLabel;};return f}();return u});M(a,"Core/Axis/Axis.js",[a["Core/Animation/AnimationUtilities.js"],a["Core/Axis/AxisDefaults.js"],
    a["Core/Color/Color.js"],a["Core/DefaultOptions.js"],a["Core/Foundation.js"],a["Core/Globals.js"],a["Core/Axis/Tick.js"],a["Core/Utilities.js"]],function(a,u,z,F,y,G,H,A){var q=a.animObject,n=F.defaultOptions,k=y.registerEventOptions,e=G.deg2rad,c=A.arrayMax,h=A.arrayMin,f=A.clamp,w=A.correctFloat,p=A.defined,B=A.destroyObjectProperties,t=A.erase,J=A.error,C=A.extend,r=A.fireEvent,l=A.getMagnitude,b=A.isArray,g=A.isNumber,d=A.isString,m=A.merge,D=A.normalizeTickInterval,x=A.objectEach,I=A.pick,P=
    A.relativeLength,v=A.removeEvent,O=A.splat,U=A.syncTimeout;a=function(){function a(b,d){this.zoomEnabled=this.width=this.visible=this.userOptions=this.translationSlope=this.transB=this.transA=this.top=this.ticks=this.tickRotCorr=this.tickPositions=this.tickmarkOffset=this.tickInterval=this.tickAmount=this.side=this.series=this.right=this.positiveValuesOnly=this.pos=this.pointRangePadding=this.pointRange=this.plotLinesAndBandsGroups=this.plotLinesAndBands=this.paddedTicks=this.overlap=this.options=
    this.offset=this.names=this.minPixelPadding=this.minorTicks=this.minorTickInterval=this.min=this.maxLabelLength=this.max=this.len=this.left=this.labelFormatter=this.labelEdge=this.isLinked=this.height=this.hasVisibleSeries=this.hasNames=this.eventOptions=this.coll=this.closestPointRange=this.chart=this.categories=this.bottom=this.alternateBands=void 0;this.init(b,d);}a.prototype.init=function(b,d){var a=d.isX;this.chart=b;this.horiz=b.inverted&&!this.isZAxis?!a:a;this.isXAxis=a;this.coll=this.coll||
    (a?"xAxis":"yAxis");r(this,"init",{userOptions:d});this.opposite=I(d.opposite,this.opposite);this.side=I(d.side,this.side,this.horiz?this.opposite?0:2:this.opposite?1:3);this.setOptions(d);var c=this.options,e=c.labels,m=c.type;this.userOptions=d;this.minPixelPadding=0;this.reversed=I(c.reversed,this.reversed);this.visible=c.visible;this.zoomEnabled=c.zoomEnabled;this.hasNames="category"===m||!0===c.categories;this.categories=c.categories||this.hasNames;this.names||(this.names=[],this.names.keys=
    {});this.plotLinesAndBandsGroups={};this.positiveValuesOnly=!!this.logarithmic;this.isLinked=p(c.linkedTo);this.ticks={};this.labelEdge=[];this.minorTicks={};this.plotLinesAndBands=[];this.alternateBands={};this.len=0;this.minRange=this.userMinRange=c.minRange||c.maxZoom;this.range=c.range;this.offset=c.offset||0;this.min=this.max=null;d=I(c.crosshair,O(b.options.tooltip.crosshairs)[a?0:1]);this.crosshair=!0===d?{}:d;-1===b.axes.indexOf(this)&&(a?b.axes.splice(b.xAxis.length,0,this):b.axes.push(this),
    b[this.coll].push(this));this.series=this.series||[];b.inverted&&!this.isZAxis&&a&&"undefined"===typeof this.reversed&&(this.reversed=!0);this.labelRotation=g(e.rotation)?e.rotation:void 0;k(this,c);r(this,"afterInit");};a.prototype.setOptions=function(b){this.options=m(u.defaultXAxisOptions,"yAxis"===this.coll&&u.defaultYAxisOptions,[u.defaultTopAxisOptions,u.defaultRightAxisOptions,u.defaultBottomAxisOptions,u.defaultLeftAxisOptions][this.side],m(n[this.coll],b));r(this,"afterSetOptions",{userOptions:b});};
    a.prototype.defaultLabelFormatter=function(b){var d=this.axis;b=this.chart.numberFormatter;var a=g(this.value)?this.value:NaN,c=d.chart.time,e=this.dateTimeLabelFormat,m=n.lang,l=m.numericSymbols;m=m.numericSymbolMagnitude||1E3;var f=d.logarithmic?Math.abs(a):d.tickInterval,h=l&&l.length;if(d.categories)var r=""+this.value;else if(e)r=c.dateFormat(e,a);else if(h&&1E3<=f)for(;h--&&"undefined"===typeof r;)d=Math.pow(m,h+1),f>=d&&0===10*a%d&&null!==l[h]&&0!==a&&(r=b(a/d,-1)+l[h]);"undefined"===typeof r&&
    (r=1E4<=Math.abs(a)?b(a,-1):b(a,-1,void 0,""));return r};a.prototype.getSeriesExtremes=function(){var b=this,d=b.chart,a;r(this,"getSeriesExtremes",null,function(){b.hasVisibleSeries=!1;b.dataMin=b.dataMax=b.threshold=null;b.softThreshold=!b.isXAxis;b.stacking&&b.stacking.buildStacks();b.series.forEach(function(c){if(c.visible||!d.options.chart.ignoreHiddenSeries){var e=c.options,m=e.threshold;b.hasVisibleSeries=!0;b.positiveValuesOnly&&0>=m&&(m=null);if(b.isXAxis){if(e=c.xData,e.length){e=b.logarithmic?
    e.filter(b.validatePositiveValue):e;a=c.getXExtremes(e);var l=a.min;var f=a.max;g(l)||l instanceof Date||(e=e.filter(g),a=c.getXExtremes(e),l=a.min,f=a.max);e.length&&(b.dataMin=Math.min(I(b.dataMin,l),l),b.dataMax=Math.max(I(b.dataMax,f),f));}}else if(c=c.applyExtremes(),g(c.dataMin)&&(l=c.dataMin,b.dataMin=Math.min(I(b.dataMin,l),l)),g(c.dataMax)&&(f=c.dataMax,b.dataMax=Math.max(I(b.dataMax,f),f)),p(m)&&(b.threshold=m),!e.softThreshold||b.positiveValuesOnly)b.softThreshold=!1;}});});r(this,"afterGetSeriesExtremes");};
    a.prototype.translate=function(b,d,a,c,e,m){var l=this.linkedParent||this,f=c&&l.old?l.old.min:l.min,r=l.minPixelPadding;e=(l.isOrdinal||l.brokenAxis&&l.brokenAxis.hasBreaks||l.logarithmic&&e)&&l.lin2val;var h=1,k=0;c=c&&l.old?l.old.transA:l.transA;c||(c=l.transA);a&&(h*=-1,k=l.len);l.reversed&&(h*=-1,k-=h*(l.sector||l.len));d?(b=(b*h+k-r)/c+f,e&&(b=l.lin2val(b))):(e&&(b=l.val2lin(b)),b=g(f)?h*(b-f)*c+k+h*r+(g(m)?c*m:0):void 0);return b};a.prototype.toPixels=function(b,d){return this.translate(b,
    !1,!this.horiz,null,!0)+(d?0:this.pos)};a.prototype.toValue=function(b,d){return this.translate(b-(d?0:this.pos),!0,!this.horiz,null,!0)};a.prototype.getPlotLinePath=function(b){function d(b,d,a){if("pass"!==n&&b<d||b>a)n?b=f(b,d,a):B=!0;return b}var a=this,c=a.chart,e=a.left,m=a.top,l=b.old,h=b.value,k=b.lineWidth,x=l&&c.oldChartHeight||c.chartHeight,D=l&&c.oldChartWidth||c.chartWidth,L=a.transB,p=b.translatedValue,n=b.force,t,C,w,q,B;b={value:h,lineWidth:k,old:l,force:n,acrossPanes:b.acrossPanes,
    translatedValue:p};r(this,"getPlotLinePath",b,function(b){p=I(p,a.translate(h,null,null,l));p=f(p,-1E5,1E5);t=w=Math.round(p+L);C=q=Math.round(x-p-L);g(p)?a.horiz?(C=m,q=x-a.bottom,t=w=d(t,e,e+a.width)):(t=e,w=D-a.right,C=q=d(C,m,m+a.height)):(B=!0,n=!1);b.path=B&&!n?null:c.renderer.crispLine([["M",t,C],["L",w,q]],k||1);});return b.path};a.prototype.getLinearTickPositions=function(b,d,a){var c=w(Math.floor(d/b)*b);a=w(Math.ceil(a/b)*b);var e=[],g;w(c+b)===c&&(g=20);if(this.single)return [d];for(d=c;d<=
    a;){e.push(d);d=w(d+b,g);if(d===m)break;var m=d;}return e};a.prototype.getMinorTickInterval=function(){var b=this.options;return !0===b.minorTicks?I(b.minorTickInterval,"auto"):!1===b.minorTicks?null:b.minorTickInterval};a.prototype.getMinorTickPositions=function(){var b=this.options,d=this.tickPositions,a=this.minorTickInterval,c=this.pointRangePadding||0,e=this.min-c;c=this.max+c;var g=c-e,m=[];if(g&&g/a<this.len/3){var l=this.logarithmic;if(l)this.paddedTicks.forEach(function(b,d,c){d&&m.push.apply(m,
    l.getLogTickPositions(a,c[d-1],c[d],!0));});else if(this.dateTime&&"auto"===this.getMinorTickInterval())m=m.concat(this.getTimeTicks(this.dateTime.normalizeTimeTickInterval(a),e,c,b.startOfWeek));else for(b=e+(d[0]-e)%a;b<=c&&b!==m[0];b+=a)m.push(b);}0!==m.length&&this.trimTicks(m);return m};a.prototype.adjustForMinRange=function(){var b=this.options,d=this.logarithmic,a=this.min,e=this.max,g=0,m,l,f,r;this.isXAxis&&"undefined"===typeof this.minRange&&!d&&(p(b.min)||p(b.max)||p(b.floor)||p(b.ceiling)?
    this.minRange=null:(this.series.forEach(function(b){f=b.xData;r=b.xIncrement?1:f.length-1;if(1<f.length)for(m=r;0<m;m--)if(l=f[m]-f[m-1],!g||l<g)g=l;}),this.minRange=Math.min(5*g,this.dataMax-this.dataMin)));if(e-a<this.minRange){var k=this.dataMax-this.dataMin>=this.minRange;var x=this.minRange;var D=(x-e+a)/2;D=[a-D,I(b.min,a-D)];k&&(D[2]=this.logarithmic?this.logarithmic.log2lin(this.dataMin):this.dataMin);a=c(D);e=[a+x,I(b.max,a+x)];k&&(e[2]=d?d.log2lin(this.dataMax):this.dataMax);e=h(e);e-a<x&&
    (D[0]=e-x,D[1]=I(b.min,e-x),a=c(D));}this.min=a;this.max=e;};a.prototype.getClosest=function(){var b;this.categories?b=1:this.series.forEach(function(d){var a=d.closestPointRange,c=d.visible||!d.chart.options.chart.ignoreHiddenSeries;!d.noSharedTooltip&&p(a)&&c&&(b=p(b)?Math.min(b,a):a);});return b};a.prototype.nameToX=function(d){var a=b(this.categories),c=a?this.categories:this.names,e=d.options.x;d.series.requireSorting=!1;p(e)||(e=this.options.uniqueNames?a?c.indexOf(d.name):I(c.keys[d.name],-1):
    d.series.autoIncrement());if(-1===e){if(!a)var g=c.length;}else g=e;"undefined"!==typeof g&&(this.names[g]=d.name,this.names.keys[d.name]=g);return g};a.prototype.updateNames=function(){var b=this,d=this.names;0<d.length&&(Object.keys(d.keys).forEach(function(b){delete d.keys[b];}),d.length=0,this.minRange=this.userMinRange,(this.series||[]).forEach(function(d){d.xIncrement=null;if(!d.points||d.isDirtyData)b.max=Math.max(b.max,d.xData.length-1),d.processData(),d.generatePoints();d.data.forEach(function(a,
    c){if(a&&a.options&&"undefined"!==typeof a.name){var e=b.nameToX(a);"undefined"!==typeof e&&e!==a.x&&(a.x=e,d.xData[c]=e);}});}));};a.prototype.setAxisTranslation=function(){var b=this,a=b.max-b.min,c=b.linkedParent,e=!!b.categories,g=b.isXAxis,m=b.axisPointRange||0,l=0,f=0,h=b.transA;if(g||e||m){var k=b.getClosest();c?(l=c.minPointOffset,f=c.pointRangePadding):b.series.forEach(function(a){var c=e?1:g?I(a.options.pointRange,k,0):b.axisPointRange||0,h=a.options.pointPlacement;m=Math.max(m,c);if(!b.single||
    e)a=a.is("xrange")?!g:g,l=Math.max(l,a&&d(h)?0:c/2),f=Math.max(f,a&&"on"===h?0:c);});c=b.ordinal&&b.ordinal.slope&&k?b.ordinal.slope/k:1;b.minPointOffset=l*=c;b.pointRangePadding=f*=c;b.pointRange=Math.min(m,b.single&&e?1:a);g&&(b.closestPointRange=k);}b.translationSlope=b.transA=h=b.staticScale||b.len/(a+f||1);b.transB=b.horiz?b.left:b.bottom;b.minPixelPadding=h*l;r(this,"afterSetAxisTranslation");};a.prototype.minFromRange=function(){return this.max-this.range};a.prototype.setTickInterval=function(b){var d=
    this.chart,a=this.logarithmic,c=this.options,e=this.isXAxis,m=this.isLinked,f=c.tickPixelInterval,h=this.categories,k=this.softThreshold,x=c.maxPadding,L=c.minPadding,n=g(c.tickInterval)&&0<=c.tickInterval?c.tickInterval:void 0,t=g(this.threshold)?this.threshold:null;this.dateTime||h||m||this.getTickAmount();var C=I(this.userMin,c.min);var q=I(this.userMax,c.max);if(m){this.linkedParent=d[this.coll][c.linkedTo];var B=this.linkedParent.getExtremes();this.min=I(B.min,B.dataMin);this.max=I(B.max,B.dataMax);
    c.type!==this.linkedParent.options.type&&J(11,1,d);}else {if(k&&p(t))if(this.dataMin>=t)B=t,L=0;else if(this.dataMax<=t){var P=t;x=0;}this.min=I(C,B,this.dataMin);this.max=I(q,P,this.dataMax);}a&&(this.positiveValuesOnly&&!b&&0>=Math.min(this.min,I(this.dataMin,this.min))&&J(10,1,d),this.min=w(a.log2lin(this.min),16),this.max=w(a.log2lin(this.max),16));this.range&&p(this.max)&&(this.userMin=this.min=C=Math.max(this.dataMin,this.minFromRange()),this.userMax=q=this.max,this.range=null);r(this,"foundExtremes");
    this.beforePadding&&this.beforePadding();this.adjustForMinRange();!(h||this.axisPointRange||this.stacking&&this.stacking.usePercentage||m)&&p(this.min)&&p(this.max)&&(d=this.max-this.min)&&(!p(C)&&L&&(this.min-=d*L),!p(q)&&x&&(this.max+=d*x));g(this.userMin)||(g(c.softMin)&&c.softMin<this.min&&(this.min=C=c.softMin),g(c.floor)&&(this.min=Math.max(this.min,c.floor)));g(this.userMax)||(g(c.softMax)&&c.softMax>this.max&&(this.max=q=c.softMax),g(c.ceiling)&&(this.max=Math.min(this.max,c.ceiling)));k&&
    p(this.dataMin)&&(t=t||0,!p(C)&&this.min<t&&this.dataMin>=t?this.min=this.options.minRange?Math.min(t,this.max-this.minRange):t:!p(q)&&this.max>t&&this.dataMax<=t&&(this.max=this.options.minRange?Math.max(t,this.min+this.minRange):t));g(this.min)&&g(this.max)&&!this.chart.polar&&this.min>this.max&&(p(this.options.min)?this.max=this.min:p(this.options.max)&&(this.min=this.max));this.tickInterval=this.min===this.max||"undefined"===typeof this.min||"undefined"===typeof this.max?1:m&&this.linkedParent&&
    !n&&f===this.linkedParent.options.tickPixelInterval?n=this.linkedParent.tickInterval:I(n,this.tickAmount?(this.max-this.min)/Math.max(this.tickAmount-1,1):void 0,h?1:(this.max-this.min)*f/Math.max(this.len,f));if(e&&!b){var v=this.min!==(this.old&&this.old.min)||this.max!==(this.old&&this.old.max);this.series.forEach(function(b){b.forceCrop=b.forceCropping&&b.forceCropping();b.processData(v);});r(this,"postProcessData",{hasExtemesChanged:v});}this.setAxisTranslation();r(this,"initialAxisTranslation");
    this.pointRange&&!n&&(this.tickInterval=Math.max(this.pointRange,this.tickInterval));b=I(c.minTickInterval,this.dateTime&&!this.series.some(function(b){return b.noSharedTooltip})?this.closestPointRange:0);!n&&this.tickInterval<b&&(this.tickInterval=b);this.dateTime||this.logarithmic||n||(this.tickInterval=D(this.tickInterval,void 0,l(this.tickInterval),I(c.allowDecimals,.5>this.tickInterval||void 0!==this.tickAmount),!!this.tickAmount));this.tickAmount||(this.tickInterval=this.unsquish());this.setTickPositions();};
    a.prototype.setTickPositions=function(){var b=this.options,d=b.tickPositions,a=this.getMinorTickInterval(),c=this.hasVerticalPanning(),e="colorAxis"===this.coll,g=(e||!c)&&b.startOnTick;c=(e||!c)&&b.endOnTick;e=b.tickPositioner;this.tickmarkOffset=this.categories&&"between"===b.tickmarkPlacement&&1===this.tickInterval?.5:0;this.minorTickInterval="auto"===a&&this.tickInterval?this.tickInterval/5:a;this.single=this.min===this.max&&p(this.min)&&!this.tickAmount&&(parseInt(this.min,10)===this.min||!1!==
    b.allowDecimals);this.tickPositions=a=d&&d.slice();!a&&(this.ordinal&&this.ordinal.positions||!((this.max-this.min)/this.tickInterval>Math.max(2*this.len,200))?a=this.dateTime?this.getTimeTicks(this.dateTime.normalizeTimeTickInterval(this.tickInterval,b.units),this.min,this.max,b.startOfWeek,this.ordinal&&this.ordinal.positions,this.closestPointRange,!0):this.logarithmic?this.logarithmic.getLogTickPositions(this.tickInterval,this.min,this.max):this.getLinearTickPositions(this.tickInterval,this.min,
    this.max):(a=[this.min,this.max],J(19,!1,this.chart)),a.length>this.len&&(a=[a[0],a.pop()],a[0]===a[1]&&(a.length=1)),this.tickPositions=a,e&&(e=e.apply(this,[this.min,this.max])))&&(this.tickPositions=a=e);this.paddedTicks=a.slice(0);this.trimTicks(a,g,c);this.isLinked||(this.single&&2>a.length&&!this.categories&&!this.series.some(function(b){return b.is("heatmap")&&"between"===b.options.pointPlacement})&&(this.min-=.5,this.max+=.5),d||e||this.adjustTickAmount());r(this,"afterSetTickPositions");};
    a.prototype.trimTicks=function(b,d,a){var c=b[0],e=b[b.length-1],g=!this.isOrdinal&&this.minPointOffset||0;r(this,"trimTicks");if(!this.isLinked){if(d&&-Infinity!==c)this.min=c;else for(;this.min-g>b[0];)b.shift();if(a)this.max=e;else for(;this.max+g<b[b.length-1];)b.pop();0===b.length&&p(c)&&!this.options.tickPositions&&b.push((e+c)/2);}};a.prototype.alignToOthers=function(){var b={},d=this.options,a;!1!==this.chart.options.chart.alignTicks&&d.alignTicks&&!1!==d.startOnTick&&!1!==d.endOnTick&&!this.logarithmic&&
    this.chart[this.coll].forEach(function(d){var c=d.options;c=[d.horiz?c.left:c.top,c.width,c.height,c.pane].join();d.series.length&&(b[c]?a=!0:b[c]=1);});return a};a.prototype.getTickAmount=function(){var b=this.options,d=b.tickPixelInterval,a=b.tickAmount;!p(b.tickInterval)&&!a&&this.len<d&&!this.isRadial&&!this.logarithmic&&b.startOnTick&&b.endOnTick&&(a=2);!a&&this.alignToOthers()&&(a=Math.ceil(this.len/d)+1);4>a&&(this.finalTickAmt=a,a=5);this.tickAmount=a;};a.prototype.adjustTickAmount=function(){var b=
    this.options,d=this.tickInterval,a=this.tickPositions,c=this.tickAmount,e=this.finalTickAmt,m=a&&a.length,l=I(this.threshold,this.softThreshold?0:null);if(this.hasData()&&g(this.min)&&g(this.max)){if(m<c){for(;a.length<c;)a.length%2||this.min===l?a.push(w(a[a.length-1]+d)):a.unshift(w(a[0]-d));this.transA*=(m-1)/(c-1);this.min=b.startOnTick?a[0]:Math.min(this.min,a[0]);this.max=b.endOnTick?a[a.length-1]:Math.max(this.max,a[a.length-1]);}else m>c&&(this.tickInterval*=2,this.setTickPositions());if(p(e)){for(d=
    b=a.length;d--;)(3===e&&1===d%2||2>=e&&0<d&&d<b-1)&&a.splice(d,1);this.finalTickAmt=void 0;}}};a.prototype.setScale=function(){var b=!1,d=!1;this.series.forEach(function(a){b=b||a.isDirtyData||a.isDirty;d=d||a.xAxis&&a.xAxis.isDirty||!1;});this.setAxisSize();var a=this.len!==(this.old&&this.old.len);a||b||d||this.isLinked||this.forceRedraw||this.userMin!==(this.old&&this.old.userMin)||this.userMax!==(this.old&&this.old.userMax)||this.alignToOthers()?(this.stacking&&this.stacking.resetStacks(),this.forceRedraw=
    !1,this.getSeriesExtremes(),this.setTickInterval(),this.isDirty||(this.isDirty=a||this.min!==(this.old&&this.old.min)||this.max!==(this.old&&this.old.max))):this.stacking&&this.stacking.cleanStacks();b&&this.panningState&&(this.panningState.isDirty=!0);r(this,"afterSetScale");};a.prototype.setExtremes=function(b,d,a,c,e){var g=this,m=g.chart;a=I(a,!0);g.series.forEach(function(b){delete b.kdTree;});e=C(e,{min:b,max:d});r(g,"setExtremes",e,function(){g.userMin=b;g.userMax=d;g.eventArgs=e;a&&m.redraw(c);});};
    a.prototype.zoom=function(b,d){var a=this,c=this.dataMin,e=this.dataMax,g=this.options,m=Math.min(c,I(g.min,c)),l=Math.max(e,I(g.max,e));b={newMin:b,newMax:d};r(this,"zoom",b,function(b){var d=b.newMin,g=b.newMax;if(d!==a.min||g!==a.max)a.allowZoomOutside||(p(c)&&(d<m&&(d=m),d>l&&(d=l)),p(e)&&(g<m&&(g=m),g>l&&(g=l))),a.displayBtn="undefined"!==typeof d||"undefined"!==typeof g,a.setExtremes(d,g,!1,void 0,{trigger:"zoom"});b.zoomed=!0;});return b.zoomed};a.prototype.setAxisSize=function(){var b=this.chart,
    d=this.options,a=d.offsets||[0,0,0,0],c=this.horiz,e=this.width=Math.round(P(I(d.width,b.plotWidth-a[3]+a[1]),b.plotWidth)),g=this.height=Math.round(P(I(d.height,b.plotHeight-a[0]+a[2]),b.plotHeight)),m=this.top=Math.round(P(I(d.top,b.plotTop+a[0]),b.plotHeight,b.plotTop));d=this.left=Math.round(P(I(d.left,b.plotLeft+a[3]),b.plotWidth,b.plotLeft));this.bottom=b.chartHeight-g-m;this.right=b.chartWidth-e-d;this.len=Math.max(c?e:g,0);this.pos=c?d:m;};a.prototype.getExtremes=function(){var b=this.logarithmic;
    return {min:b?w(b.lin2log(this.min)):this.min,max:b?w(b.lin2log(this.max)):this.max,dataMin:this.dataMin,dataMax:this.dataMax,userMin:this.userMin,userMax:this.userMax}};a.prototype.getThreshold=function(b){var d=this.logarithmic,a=d?d.lin2log(this.min):this.min;d=d?d.lin2log(this.max):this.max;null===b||-Infinity===b?b=a:Infinity===b?b=d:a>b?b=a:d<b&&(b=d);return this.translate(b,0,1,0,1)};a.prototype.autoLabelAlign=function(b){var d=(I(b,0)-90*this.side+720)%360;b={align:"center"};r(this,"autoLabelAlign",
    b,function(b){15<d&&165>d?b.align="right":195<d&&345>d&&(b.align="left");});return b.align};a.prototype.tickSize=function(b){var d=this.options,a=I(d["tick"===b?"tickWidth":"minorTickWidth"],"tick"===b&&this.isXAxis&&!this.categories?1:0),c=d["tick"===b?"tickLength":"minorTickLength"];if(a&&c){"inside"===d[b+"Position"]&&(c=-c);var e=[c,a];}b={tickSize:e};r(this,"afterTickSize",b);return b.tickSize};a.prototype.labelMetrics=function(){var b=this.tickPositions&&this.tickPositions[0]||0;return this.chart.renderer.fontMetrics(this.options.labels.style.fontSize,
    this.ticks[b]&&this.ticks[b].label)};a.prototype.unsquish=function(){var b=this.options.labels,d=this.horiz,a=this.tickInterval,c=this.len/(((this.categories?1:0)+this.max-this.min)/a),m=b.rotation,l=this.labelMetrics(),f=Math.max(this.max-this.min,0),h=function(b){var d=b/(c||1);d=1<d?Math.ceil(d):1;d*a>f&&Infinity!==b&&Infinity!==c&&f&&(d=Math.ceil(f/a));return w(d*a)},r=a,k,x,D=Number.MAX_VALUE;if(d){if(!b.staggerLines&&!b.step)if(g(m))var p=[m];else c<b.autoRotationLimit&&(p=b.autoRotation);p&&
    p.forEach(function(b){if(b===m||b&&-90<=b&&90>=b){x=h(Math.abs(l.h/Math.sin(e*b)));var d=x+Math.abs(b/360);d<D&&(D=d,k=b,r=x);}});}else b.step||(r=h(l.h));this.autoRotation=p;this.labelRotation=I(k,g(m)?m:0);return r};a.prototype.getSlotWidth=function(b){var d=this.chart,a=this.horiz,c=this.options.labels,e=Math.max(this.tickPositions.length-(this.categories?0:1),1),m=d.margin[3];if(b&&g(b.slotWidth))return b.slotWidth;if(a&&2>c.step)return c.rotation?0:(this.staggerLines||1)*this.len/e;if(!a){b=c.style.width;
    if(void 0!==b)return parseInt(String(b),10);if(m)return m-d.spacing[3]}return .33*d.chartWidth};a.prototype.renderUnsquish=function(){var b=this.chart,a=b.renderer,c=this.tickPositions,e=this.ticks,g=this.options.labels,m=g.style,l=this.horiz,f=this.getSlotWidth(),h=Math.max(1,Math.round(f-2*g.padding)),r={},k=this.labelMetrics(),x=m.textOverflow,D=0;d(g.rotation)||(r.rotation=g.rotation||0);c.forEach(function(b){b=e[b];b.movedLabel&&b.replaceMovedLabel();b&&b.label&&b.label.textPxLength>D&&(D=b.label.textPxLength);});
    this.maxLabelLength=D;if(this.autoRotation)D>h&&D>k.h?r.rotation=this.labelRotation:this.labelRotation=0;else if(f){var p=h;if(!x){var n="clip";for(h=c.length;!l&&h--;){var I=c[h];if(I=e[I].label)I.styles&&"ellipsis"===I.styles.textOverflow?I.css({textOverflow:"clip"}):I.textPxLength>f&&I.css({width:f+"px"}),I.getBBox().height>this.len/c.length-(k.h-k.f)&&(I.specificTextOverflow="ellipsis");}}}r.rotation&&(p=D>.5*b.chartHeight?.33*b.chartHeight:D,x||(n="ellipsis"));if(this.labelAlign=g.align||this.autoLabelAlign(this.labelRotation))r.align=
    this.labelAlign;c.forEach(function(b){var d=(b=e[b])&&b.label,a=m.width,c={};d&&(d.attr(r),b.shortenLabel?b.shortenLabel():p&&!a&&"nowrap"!==m.whiteSpace&&(p<d.textPxLength||"SPAN"===d.element.tagName)?(c.width=p+"px",x||(c.textOverflow=d.specificTextOverflow||n),d.css(c)):d.styles&&d.styles.width&&!c.width&&!a&&d.css({width:null}),delete d.specificTextOverflow,b.rotation=r.rotation);},this);this.tickRotCorr=a.rotCorr(k.b,this.labelRotation||0,0!==this.side);};a.prototype.hasData=function(){return this.series.some(function(b){return b.hasData()})||
    this.options.showEmpty&&p(this.min)&&p(this.max)};a.prototype.addTitle=function(b){var d=this.chart.renderer,a=this.horiz,c=this.opposite,e=this.options.title,g=this.chart.styledMode,l;this.axisTitle||((l=e.textAlign)||(l=(a?{low:"left",middle:"center",high:"right"}:{low:c?"right":"left",middle:"center",high:c?"left":"right"})[e.align]),this.axisTitle=d.text(e.text||"",0,0,e.useHTML).attr({zIndex:7,rotation:e.rotation,align:l}).addClass("highcharts-axis-title"),g||this.axisTitle.css(m(e.style)),this.axisTitle.add(this.axisGroup),
    this.axisTitle.isNew=!0);g||e.style.width||this.isRadial||this.axisTitle.css({width:this.len+"px"});this.axisTitle[b?"show":"hide"](b);};a.prototype.generateTick=function(b){var d=this.ticks;d[b]?d[b].addLabel():d[b]=new H(this,b);};a.prototype.getOffset=function(){var b=this,d=this,a=d.chart,c=d.horiz,e=d.options,g=d.side,m=d.ticks,l=d.tickPositions,f=d.coll,h=d.axisParent,k=a.renderer,D=a.inverted&&!d.isZAxis?[1,0,3,2][g]:g,n=d.hasData(),t=e.title,C=e.labels,q=a.axisOffset;a=a.clipOffset;var w=[-1,
    1,1,-1][g],B=e.className,P,J=0,ja=0,ca=0;d.showAxis=P=n||e.showEmpty;d.staggerLines=d.horiz&&C.staggerLines||void 0;if(!d.axisGroup){var v=function(d,a,c){return k.g(d).attr({zIndex:c}).addClass("highcharts-"+f.toLowerCase()+a+" "+(b.isRadial?"highcharts-radial-axis"+a+" ":"")+(B||"")).add(h)};d.gridGroup=v("grid","-grid",e.gridZIndex);d.axisGroup=v("axis","",e.zIndex);d.labelGroup=v("axis-labels","-labels",C.zIndex);}n||d.isLinked?(l.forEach(function(b){d.generateTick(b);}),d.renderUnsquish(),d.reserveSpaceDefault=
    0===g||2===g||{1:"left",3:"right"}[g]===d.labelAlign,I(C.reserveSpace,"center"===d.labelAlign?!0:null,d.reserveSpaceDefault)&&l.forEach(function(b){ca=Math.max(m[b].getLabelSize(),ca);}),d.staggerLines&&(ca*=d.staggerLines),d.labelOffset=ca*(d.opposite?-1:1)):x(m,function(b,d){b.destroy();delete m[d];});if(t&&t.text&&!1!==t.enabled&&(d.addTitle(P),P&&!1!==t.reserveSpace)){d.titleOffset=J=d.axisTitle.getBBox()[c?"height":"width"];var O=t.offset;ja=p(O)?0:I(t.margin,c?5:10);}d.renderLine();d.offset=w*
    I(e.offset,q[g]?q[g]+(e.margin||0):0);d.tickRotCorr=d.tickRotCorr||{x:0,y:0};t=0===g?-d.labelMetrics().h:2===g?d.tickRotCorr.y:0;n=Math.abs(ca)+ja;ca&&(n=n-t+w*(c?I(C.y,d.tickRotCorr.y+8*w):C.x));d.axisTitleMargin=I(O,n);d.getMaxLabelDimensions&&(d.maxLabelDimensions=d.getMaxLabelDimensions(m,l));"colorAxis"!==f&&(c=this.tickSize("tick"),q[g]=Math.max(q[g],(d.axisTitleMargin||0)+J+w*d.offset,n,l&&l.length&&c?c[0]+w*d.offset:0),e=!d.axisLine||e.offset?0:2*Math.floor(d.axisLine.strokeWidth()/2),a[D]=
    Math.max(a[D],e));r(this,"afterGetOffset");};a.prototype.getLinePath=function(b){var d=this.chart,a=this.opposite,c=this.offset,e=this.horiz,g=this.left+(a?this.width:0)+c;c=d.chartHeight-this.bottom-(a?this.height:0)+c;a&&(b*=-1);return d.renderer.crispLine([["M",e?this.left:g,e?c:this.top],["L",e?d.chartWidth-this.right:g,e?c:d.chartHeight-this.bottom]],b)};a.prototype.renderLine=function(){this.axisLine||(this.axisLine=this.chart.renderer.path().addClass("highcharts-axis-line").add(this.axisGroup),
    this.chart.styledMode||this.axisLine.attr({stroke:this.options.lineColor,"stroke-width":this.options.lineWidth,zIndex:7}));};a.prototype.getTitlePosition=function(){var b=this.horiz,d=this.left,a=this.top,c=this.len,e=this.options.title,g=b?d:a,m=this.opposite,l=this.offset,f=e.x,h=e.y,k=this.axisTitle,x=this.chart.renderer.fontMetrics(e.style.fontSize,k);k=Math.max(k.getBBox(null,0).height-x.h-1,0);c={low:g+(b?0:c),middle:g+c/2,high:g+(b?c:0)}[e.align];d=(b?a+this.height:d)+(b?1:-1)*(m?-1:1)*this.axisTitleMargin+
    [-k,k,x.f,-k][this.side];b={x:b?c+f:d+(m?this.width:0)+l+f,y:b?d+h-(m?this.height:0)+l:c+h};r(this,"afterGetTitlePosition",{titlePosition:b});return b};a.prototype.renderMinorTick=function(b,d){var a=this.minorTicks;a[b]||(a[b]=new H(this,b,"minor"));d&&a[b].isNew&&a[b].render(null,!0);a[b].render(null,!1,1);};a.prototype.renderTick=function(b,d,a){var c=this.ticks;if(!this.isLinked||b>=this.min&&b<=this.max||this.grid&&this.grid.isColumn)c[b]||(c[b]=new H(this,b)),a&&c[b].isNew&&c[b].render(d,!0,
    -1),c[b].render(d);};a.prototype.render=function(){var b=this,d=b.chart,a=b.logarithmic,c=b.options,e=b.isLinked,m=b.tickPositions,l=b.axisTitle,f=b.ticks,h=b.minorTicks,k=b.alternateBands,D=c.stackLabels,p=c.alternateGridColor,n=b.tickmarkOffset,I=b.axisLine,t=b.showAxis,C=q(d.renderer.globalAnimation),w,B;b.labelEdge.length=0;b.overlap=!1;[f,h,k].forEach(function(b){x(b,function(b){b.isActive=!1;});});if(b.hasData()||e){var P=b.chart.hasRendered&&b.old&&g(b.old.min);b.minorTickInterval&&!b.categories&&
    b.getMinorTickPositions().forEach(function(d){b.renderMinorTick(d,P);});m.length&&(m.forEach(function(d,a){b.renderTick(d,a,P);}),n&&(0===b.min||b.single)&&(f[-1]||(f[-1]=new H(b,-1,null,!0)),f[-1].render(-1)));p&&m.forEach(function(c,e){B="undefined"!==typeof m[e+1]?m[e+1]+n:b.max-n;0===e%2&&c<b.max&&B<=b.max+(d.polar?-n:n)&&(k[c]||(k[c]=new G.PlotLineOrBand(b)),w=c+n,k[c].options={from:a?a.lin2log(w):w,to:a?a.lin2log(B):B,color:p,className:"highcharts-alternate-grid"},k[c].render(),k[c].isActive=
    !0);});b._addedPlotLB||(b._addedPlotLB=!0,(c.plotLines||[]).concat(c.plotBands||[]).forEach(function(d){b.addPlotBandOrLine(d);}));}[f,h,k].forEach(function(b){var a=[],c=C.duration;x(b,function(b,d){b.isActive||(b.render(d,!1,0),b.isActive=!1,a.push(d));});U(function(){for(var d=a.length;d--;)b[a[d]]&&!b[a[d]].isActive&&(b[a[d]].destroy(),delete b[a[d]]);},b!==k&&d.hasRendered&&c?c:0);});I&&(I[I.isPlaced?"animate":"attr"]({d:this.getLinePath(I.strokeWidth())}),I.isPlaced=!0,I[t?"show":"hide"](t));l&&t&&
    (c=b.getTitlePosition(),g(c.y)?(l[l.isNew?"attr":"animate"](c),l.isNew=!1):(l.attr("y",-9999),l.isNew=!0));D&&D.enabled&&b.stacking&&b.stacking.renderStackTotals();b.old={len:b.len,max:b.max,min:b.min,transA:b.transA,userMax:b.userMax,userMin:b.userMin};b.isDirty=!1;r(this,"afterRender");};a.prototype.redraw=function(){this.visible&&(this.render(),this.plotLinesAndBands.forEach(function(b){b.render();}));this.series.forEach(function(b){b.isDirty=!0;});};a.prototype.getKeepProps=function(){return this.keepProps||
    a.keepProps};a.prototype.destroy=function(b){var d=this,a=d.plotLinesAndBands,c=this.eventOptions;r(this,"destroy",{keepEvents:b});b||v(d);[d.ticks,d.minorTicks,d.alternateBands].forEach(function(b){B(b);});if(a)for(b=a.length;b--;)a[b].destroy();"axisLine axisTitle axisGroup gridGroup labelGroup cross scrollbar".split(" ").forEach(function(b){d[b]&&(d[b]=d[b].destroy());});for(var e in d.plotLinesAndBandsGroups)d.plotLinesAndBandsGroups[e]=d.plotLinesAndBandsGroups[e].destroy();x(d,function(b,a){-1===
    d.getKeepProps().indexOf(a)&&delete d[a];});this.eventOptions=c;};a.prototype.drawCrosshair=function(b,d){var a=this.crosshair,c=I(a&&a.snap,!0),e=this.chart,g,m=this.cross;r(this,"drawCrosshair",{e:b,point:d});b||(b=this.cross&&this.cross.e);if(a&&!1!==(p(d)||!c)){c?p(d)&&(g=I("colorAxis"!==this.coll?d.crosshairPos:null,this.isXAxis?d.plotX:this.len-d.plotY)):g=b&&(this.horiz?b.chartX-this.pos:this.len-b.chartY+this.pos);if(p(g)){var l={value:d&&(this.isXAxis?d.x:I(d.stackY,d.y)),translatedValue:g};
    e.polar&&C(l,{isCrosshair:!0,chartX:b&&b.chartX,chartY:b&&b.chartY,point:d});l=this.getPlotLinePath(l)||null;}if(!p(l)){this.hideCrosshair();return}c=this.categories&&!this.isRadial;m||(this.cross=m=e.renderer.path().addClass("highcharts-crosshair highcharts-crosshair-"+(c?"category ":"thin ")+(a.className||"")).attr({zIndex:I(a.zIndex,2)}).add(),e.styledMode||(m.attr({stroke:a.color||(c?z.parse("#ccd6eb").setOpacity(.25).get():"#cccccc"),"stroke-width":I(a.width,1)}).css({"pointer-events":"none"}),
    a.dashStyle&&m.attr({dashstyle:a.dashStyle})));m.show().attr({d:l});c&&!a.width&&m.attr({"stroke-width":this.transA});this.cross.e=b;}else this.hideCrosshair();r(this,"afterDrawCrosshair",{e:b,point:d});};a.prototype.hideCrosshair=function(){this.cross&&this.cross.hide();r(this,"afterHideCrosshair");};a.prototype.hasVerticalPanning=function(){var b=this.chart.options.chart.panning;return !!(b&&b.enabled&&/y/.test(b.type))};a.prototype.validatePositiveValue=function(b){return g(b)&&0<b};a.prototype.update=
    function(b,d){var a=this.chart;b=m(this.userOptions,b);this.destroy(!0);this.init(a,b);a.isDirtyBox=!0;I(d,!0)&&a.redraw();};a.prototype.remove=function(b){for(var d=this.chart,a=this.coll,c=this.series,e=c.length;e--;)c[e]&&c[e].remove(!1);t(d.axes,this);t(d[a],this);d[a].forEach(function(b,d){b.options.index=b.userOptions.index=d;});this.destroy();d.isDirtyBox=!0;I(b,!0)&&d.redraw();};a.prototype.setTitle=function(b,d){this.update({title:b},d);};a.prototype.setCategories=function(b,d){this.update({categories:b},
    d);};a.defaultOptions=u.defaultXAxisOptions;a.keepProps="extKey hcEvents names series userMax userMin".split(" ");return a}();return a});M(a,"Core/Axis/DateTimeAxis.js",[a["Core/Utilities.js"]],function(a){var v=a.addEvent,z=a.getMagnitude,F=a.normalizeTickInterval,y=a.timeUnits,G;(function(a){function u(){return this.chart.time.getTimeTicks.apply(this.chart.time,arguments)}function q(a){"datetime"!==a.userOptions.type?this.dateTime=void 0:this.dateTime||(this.dateTime=new k(this));}var n=[];a.compose=
    function(a){-1===n.indexOf(a)&&(n.push(a),a.keepProps.push("dateTime"),a.prototype.getTimeTicks=u,v(a,"init",q));return a};var k=function(){function a(a){this.axis=a;}a.prototype.normalizeTimeTickInterval=function(a,e){var c=e||[["millisecond",[1,2,5,10,20,25,50,100,200,500]],["second",[1,2,5,10,15,30]],["minute",[1,2,5,10,15,30]],["hour",[1,2,3,4,6,8,12]],["day",[1,2]],["week",[1,2]],["month",[1,2,3,4,6]],["year",null]];e=c[c.length-1];var h=y[e[0]],k=e[1],n;for(n=0;n<c.length&&!(e=c[n],h=y[e[0]],
    k=e[1],c[n+1]&&a<=(h*k[k.length-1]+y[c[n+1][0]])/2);n++);h===y.year&&a<5*h&&(k=[1,2,5]);a=F(a/h,k,"year"===e[0]?Math.max(z(a/h),1):1);return {unitRange:h,count:a,unitName:e[0]}};a.prototype.getXDateFormat=function(a,e){var c=this.axis;return c.closestPointRange?c.chart.time.getDateFormat(c.closestPointRange,a,c.options.startOfWeek,e)||e.year:e.day};return a}();a.Additions=k;})(G||(G={}));return G});M(a,"Core/Axis/LogarithmicAxis.js",[a["Core/Utilities.js"]],function(a){var v=a.addEvent,z=a.getMagnitude,
    F=a.normalizeTickInterval,y=a.pick,G;(function(a){function u(a){var c=this.logarithmic;"logarithmic"!==a.userOptions.type?this.logarithmic=void 0:c||(this.logarithmic=new k(this));}function q(){var a=this.logarithmic;a&&(this.lin2val=function(c){return a.lin2log(c)},this.val2lin=function(c){return a.log2lin(c)});}var n=[];a.compose=function(a){-1===n.indexOf(a)&&(n.push(a),a.keepProps.push("logarithmic"),v(a,"init",u),v(a,"afterInit",q));return a};var k=function(){function a(a){this.axis=a;}a.prototype.getLogTickPositions=
    function(a,e,f,k){var c=this.axis,h=c.len,n=c.options,q=[];k||(this.minorAutoInterval=void 0);if(.5<=a)a=Math.round(a),q=c.getLinearTickPositions(a,e,f);else if(.08<=a){var C=Math.floor(e),r,l=n=void 0;for(h=.3<a?[1,2,4]:.15<a?[1,2,4,6,8]:[1,2,3,4,5,6,7,8,9];C<f+1&&!l;C++){var b=h.length;for(r=0;r<b&&!l;r++){var g=this.log2lin(this.lin2log(C)*h[r]);g>e&&(!k||n<=f)&&"undefined"!==typeof n&&q.push(n);n>f&&(l=!0);n=g;}}}else e=this.lin2log(e),f=this.lin2log(f),a=k?c.getMinorTickInterval():n.tickInterval,
    a=y("auto"===a?null:a,this.minorAutoInterval,n.tickPixelInterval/(k?5:1)*(f-e)/((k?h/c.tickPositions.length:h)||1)),a=F(a,void 0,z(a)),q=c.getLinearTickPositions(a,e,f).map(this.log2lin),k||(this.minorAutoInterval=a/5);k||(c.tickInterval=a);return q};a.prototype.lin2log=function(a){return Math.pow(10,a)};a.prototype.log2lin=function(a){return Math.log(a)/Math.LN10};return a}();a.Additions=k;})(G||(G={}));return G});M(a,"Core/Axis/PlotLineOrBand/PlotLineOrBandAxis.js",[a["Core/Utilities.js"]],function(a){var v=
    a.erase,z=a.extend,F=a.isNumber,y;(function(a){var u=[],A;a.compose=function(a,k){A||(A=a);-1===u.indexOf(k)&&(u.push(k),z(k.prototype,q.prototype));return k};var q=function(){function a(){}a.prototype.getPlotBandPath=function(a,e,c){void 0===c&&(c=this.options);var h=this.getPlotLinePath({value:e,force:!0,acrossPanes:c.acrossPanes}),f=[],k=this.horiz;e=!F(this.min)||!F(this.max)||a<this.min&&e<this.min||a>this.max&&e>this.max;a=this.getPlotLinePath({value:a,force:!0,acrossPanes:c.acrossPanes});c=
    1;if(a&&h){if(e){var p=a.toString()===h.toString();c=0;}for(e=0;e<a.length;e+=2){var n=a[e],t=a[e+1],q=h[e],C=h[e+1];"M"!==n[0]&&"L"!==n[0]||"M"!==t[0]&&"L"!==t[0]||"M"!==q[0]&&"L"!==q[0]||"M"!==C[0]&&"L"!==C[0]||(k&&q[1]===n[1]?(q[1]+=c,C[1]+=c):k||q[2]!==n[2]||(q[2]+=c,C[2]+=c),f.push(["M",n[1],n[2]],["L",t[1],t[2]],["L",C[1],C[2]],["L",q[1],q[2]],["Z"]));f.isFlat=p;}}return f};a.prototype.addPlotBand=function(a){return this.addPlotBandOrLine(a,"plotBands")};a.prototype.addPlotLine=function(a){return this.addPlotBandOrLine(a,
    "plotLines")};a.prototype.addPlotBandOrLine=function(a,e){var c=this,h=this.userOptions,f=new A(this,a);this.visible&&(f=f.render());if(f){this._addedPlotLB||(this._addedPlotLB=!0,(h.plotLines||[]).concat(h.plotBands||[]).forEach(function(a){c.addPlotBandOrLine(a);}));if(e){var k=h[e]||[];k.push(a);h[e]=k;}this.plotLinesAndBands.push(f);}return f};a.prototype.removePlotBandOrLine=function(a){var e=this.plotLinesAndBands,c=this.options,h=this.userOptions;if(e){for(var f=e.length;f--;)e[f].id===a&&e[f].destroy();
    [c.plotLines||[],h.plotLines||[],c.plotBands||[],h.plotBands||[]].forEach(function(c){for(f=c.length;f--;)(c[f]||{}).id===a&&v(c,c[f]);});}};a.prototype.removePlotBand=function(a){this.removePlotBandOrLine(a);};a.prototype.removePlotLine=function(a){this.removePlotBandOrLine(a);};return a}();})(y||(y={}));return y});M(a,"Core/Axis/PlotLineOrBand/PlotLineOrBand.js",[a["Core/Axis/PlotLineOrBand/PlotLineOrBandAxis.js"],a["Core/Utilities.js"]],function(a,u){var v=u.arrayMax,F=u.arrayMin,y=u.defined,G=u.destroyObjectProperties,
    H=u.erase,A=u.fireEvent,q=u.merge,n=u.objectEach,k=u.pick;u=function(){function e(a,e){this.axis=a;e&&(this.options=e,this.id=e.id);}e.compose=function(c){return a.compose(e,c)};e.prototype.render=function(){A(this,"render");var a=this,e=a.axis,f=e.horiz,w=e.logarithmic,p=a.options,B=p.color,t=k(p.zIndex,0),v=p.events,C={},r=e.chart.renderer,l=p.label,b=a.label,g=p.to,d=p.from,m=p.value,D=a.svgElem,x=[],I=y(d)&&y(g);x=y(m);var P=!D,S={"class":"highcharts-plot-"+(I?"band ":"line ")+(p.className||"")},
    O=I?"bands":"lines";w&&(d=w.log2lin(d),g=w.log2lin(g),m=w.log2lin(m));e.chart.styledMode||(x?(S.stroke=B||"#999999",S["stroke-width"]=k(p.width,1),p.dashStyle&&(S.dashstyle=p.dashStyle)):I&&(S.fill=B||"#e6ebf5",p.borderWidth&&(S.stroke=p.borderColor,S["stroke-width"]=p.borderWidth)));C.zIndex=t;O+="-"+t;(w=e.plotLinesAndBandsGroups[O])||(e.plotLinesAndBandsGroups[O]=w=r.g("plot-"+O).attr(C).add());P&&(a.svgElem=D=r.path().attr(S).add(w));if(x)x=e.getPlotLinePath({value:m,lineWidth:D.strokeWidth(),
    acrossPanes:p.acrossPanes});else if(I)x=e.getPlotBandPath(d,g,p);else return;!a.eventsAdded&&v&&(n(v,function(b,d){D.on(d,function(b){v[d].apply(a,[b]);});}),a.eventsAdded=!0);(P||!D.d)&&x&&x.length?D.attr({d:x}):D&&(x?(D.show(!0),D.animate({d:x})):D.d&&(D.hide(),b&&(a.label=b=b.destroy())));l&&(y(l.text)||y(l.formatter))&&x&&x.length&&0<e.width&&0<e.height&&!x.isFlat?(l=q({align:f&&I&&"center",x:f?!I&&4:10,verticalAlign:!f&&I&&"middle",y:f?I?16:10:I?6:-4,rotation:f&&!I&&90},l),this.renderLabel(l,x,
    I,t)):b&&b.hide();return a};e.prototype.renderLabel=function(a,e,f,k){var c=this.axis,h=c.chart.renderer,n=this.label;n||(this.label=n=h.text(this.getLabelText(a),0,0,a.useHTML).attr({align:a.textAlign||a.align,rotation:a.rotation,"class":"highcharts-plot-"+(f?"band":"line")+"-label "+(a.className||""),zIndex:k}).add(),c.chart.styledMode||n.css(q({textOverflow:"ellipsis"},a.style)));k=e.xBounds||[e[0][1],e[1][1],f?e[2][1]:e[0][1]];e=e.yBounds||[e[0][2],e[1][2],f?e[2][2]:e[0][2]];f=F(k);h=F(e);n.align(a,
    !1,{x:f,y:h,width:v(k)-f,height:v(e)-h});n.alignValue&&"left"!==n.alignValue||n.css({width:(90===n.rotation?c.height-(n.alignAttr.y-c.top):c.width-(n.alignAttr.x-c.left))+"px"});n.show(!0);};e.prototype.getLabelText=function(a){return y(a.formatter)?a.formatter.call(this):a.text};e.prototype.destroy=function(){H(this.axis.plotLinesAndBands,this);delete this.axis;G(this);};return e}();return u});M(a,"Core/Tooltip.js",[a["Core/FormatUtilities.js"],a["Core/Globals.js"],a["Core/Renderer/RendererUtilities.js"],
    a["Core/Renderer/RendererRegistry.js"],a["Core/Utilities.js"]],function(a,u,z,F,y){var v=a.format,H=u.doc,A=z.distribute,q=y.addEvent,n=y.clamp,k=y.css,e=y.defined,c=y.discardElement,h=y.extend,f=y.fireEvent,w=y.isArray,p=y.isNumber,B=y.isString,t=y.merge,J=y.pick,C=y.splat,r=y.syncTimeout;a=function(){function a(b,a){this.allowShared=!0;this.container=void 0;this.crosshairs=[];this.distance=0;this.isHidden=!0;this.isSticky=!1;this.now={};this.options={};this.outside=!1;this.chart=b;this.init(b,a);}
    a.prototype.applyFilter=function(){var b=this.chart;b.renderer.definition({tagName:"filter",attributes:{id:"drop-shadow-"+b.index,opacity:.5},children:[{tagName:"feGaussianBlur",attributes:{"in":"SourceAlpha",stdDeviation:1}},{tagName:"feOffset",attributes:{dx:1,dy:1}},{tagName:"feComponentTransfer",children:[{tagName:"feFuncA",attributes:{type:"linear",slope:.3}}]},{tagName:"feMerge",children:[{tagName:"feMergeNode"},{tagName:"feMergeNode",attributes:{"in":"SourceGraphic"}}]}]});};a.prototype.bodyFormatter=
    function(b){return b.map(function(b){var a=b.series.tooltipOptions;return (a[(b.point.formatPrefix||"point")+"Formatter"]||b.point.tooltipFormatter).call(b.point,a[(b.point.formatPrefix||"point")+"Format"]||"")})};a.prototype.cleanSplit=function(b){this.chart.series.forEach(function(a){var d=a&&a.tt;d&&(!d.isActive||b?a.tt=d.destroy():d.isActive=!1);});};a.prototype.defaultFormatter=function(b){var a=this.points||C(this);var d=[b.tooltipFooterHeaderFormatter(a[0])];d=d.concat(b.bodyFormatter(a));d.push(b.tooltipFooterHeaderFormatter(a[0],
    !0));return d};a.prototype.destroy=function(){this.label&&(this.label=this.label.destroy());this.split&&this.tt&&(this.cleanSplit(!0),this.tt=this.tt.destroy());this.renderer&&(this.renderer=this.renderer.destroy(),c(this.container));y.clearTimeout(this.hideTimer);y.clearTimeout(this.tooltipTimeout);};a.prototype.getAnchor=function(b,a){var d=this.chart,c=d.pointer,e=d.inverted,g=d.plotTop,l=d.plotLeft,f,r,h=0,k=0;b=C(b);this.followPointer&&a?("undefined"===typeof a.chartX&&(a=c.normalize(a)),c=[a.chartX-
    l,a.chartY-g]):b[0].tooltipPos?c=b[0].tooltipPos:(b.forEach(function(b){f=b.series.yAxis;r=b.series.xAxis;h+=b.plotX||0;k+=b.plotLow?(b.plotLow+(b.plotHigh||0))/2:b.plotY||0;r&&f&&(e?(h+=g+d.plotHeight-r.len-r.pos,k+=l+d.plotWidth-f.len-f.pos):(h+=r.pos-l,k+=f.pos-g));}),h/=b.length,k/=b.length,c=[e?d.plotWidth-k:h,e?d.plotHeight-h:k],this.shared&&1<b.length&&a&&(e?c[0]=a.chartX-l:c[1]=a.chartY-g));return c.map(Math.round)};a.prototype.getLabel=function(){var b=this,a=this.chart.styledMode,d=this.options,
    c=this.split&&this.allowShared,l="tooltip"+(e(d.className)?" "+d.className:""),f=d.style.pointerEvents||(!this.followPointer&&d.stickOnContact?"auto":"none"),r=function(){b.inContact=!0;},h=function(a){var d=b.chart.hoverSeries;b.inContact=b.shouldStickOnContact()&&b.chart.pointer.inClass(a.relatedTarget,"highcharts-tooltip");if(!b.inContact&&d&&d.onMouseOut)d.onMouseOut();},p,n=this.chart.renderer;if(b.label){var t=!b.label.hasClass("highcharts-label");(c&&!t||!c&&t)&&b.destroy();}if(!this.label){if(this.outside){t=
    this.chart.options.chart.style;var C=F.getRendererType();this.container=p=u.doc.createElement("div");p.className="highcharts-tooltip-container";k(p,{position:"absolute",top:"1px",pointerEvents:f,zIndex:Math.max(this.options.style.zIndex||0,(t&&t.zIndex||0)+3)});q(p,"mouseenter",r);q(p,"mouseleave",h);u.doc.body.appendChild(p);this.renderer=n=new C(p,0,0,t,void 0,void 0,n.styledMode);}c?this.label=n.g(l):(this.label=n.label("",0,0,d.shape,void 0,void 0,d.useHTML,void 0,l).attr({padding:d.padding,r:d.borderRadius}),
    a||this.label.attr({fill:d.backgroundColor,"stroke-width":d.borderWidth}).css(d.style).css({pointerEvents:f}).shadow(d.shadow));a&&d.shadow&&(this.applyFilter(),this.label.attr({filter:"url(#drop-shadow-"+this.chart.index+")"}));if(b.outside&&!b.split){var B=this.label,w=B.xSetter,v=B.ySetter;B.xSetter=function(a){w.call(B,b.distance);p.style.left=a+"px";};B.ySetter=function(a){v.call(B,b.distance);p.style.top=a+"px";};}this.label.on("mouseenter",r).on("mouseleave",h).attr({zIndex:8}).add();}return this.label};
    a.prototype.getPosition=function(b,a,d){var c=this.chart,e=this.distance,g={},l=c.inverted&&d.h||0,f=this.outside,r=f?H.documentElement.clientWidth-2*e:c.chartWidth,h=f?Math.max(H.body.scrollHeight,H.documentElement.scrollHeight,H.body.offsetHeight,H.documentElement.offsetHeight,H.documentElement.clientHeight):c.chartHeight,k=c.pointer.getChartPosition(),p=function(g){var m="x"===g;return [g,m?r:h,m?b:a].concat(f?[m?b*k.scaleX:a*k.scaleY,m?k.left-e+(d.plotX+c.plotLeft)*k.scaleX:k.top-e+(d.plotY+c.plotTop)*
    k.scaleY,0,m?r:h]:[m?b:a,m?d.plotX+c.plotLeft:d.plotY+c.plotTop,m?c.plotLeft:c.plotTop,m?c.plotLeft+c.plotWidth:c.plotTop+c.plotHeight])},n=p("y"),t=p("x"),C;p=!!d.negative;!c.polar&&c.hoverSeries&&c.hoverSeries.yAxis&&c.hoverSeries.yAxis.reversed&&(p=!p);var q=!this.followPointer&&J(d.ttBelow,!c.inverted===p),B=function(b,a,d,c,m,r,h){var x=f?"y"===b?e*k.scaleY:e*k.scaleX:e,D=(d-c)/2,p=c<m-e,E=m+e+c<a,n=m-x-d+D;m=m+x-D;if(q&&E)g[b]=m;else if(!q&&p)g[b]=n;else if(p)g[b]=Math.min(h-c,0>n-l?n:n-l);
    else if(E)g[b]=Math.max(r,m+l+d>a?m:m+l);else return !1},w=function(b,a,d,c,m){var l;m<e||m>a-e?l=!1:g[b]=m<d/2?1:m>a-c/2?a-c-2:m-d/2;return l},E=function(b){var a=n;n=t;t=a;C=b;},T=function(){!1!==B.apply(0,n)?!1!==w.apply(0,t)||C||(E(!0),T()):C?g.x=g.y=0:(E(!0),T());};(c.inverted||1<this.len)&&E();T();return g};a.prototype.hide=function(b){var a=this;y.clearTimeout(this.hideTimer);b=J(b,this.options.hideDelay);this.isHidden||(this.hideTimer=r(function(){a.getLabel().fadeOut(b?void 0:b);a.isHidden=
    !0;},b));};a.prototype.init=function(b,a){this.chart=b;this.options=a;this.crosshairs=[];this.now={x:0,y:0};this.isHidden=!0;this.split=a.split&&!b.inverted&&!b.polar;this.shared=a.shared||this.split;this.outside=J(a.outside,!(!b.scrollablePixelsX&&!b.scrollablePixelsY));};a.prototype.shouldStickOnContact=function(){return !(this.followPointer||!this.options.stickOnContact)};a.prototype.isStickyOnContact=function(){return !(!this.shouldStickOnContact()||!this.inContact)};a.prototype.move=function(b,a,
    d,c){var e=this,g=e.now,m=!1!==e.options.animation&&!e.isHidden&&(1<Math.abs(b-g.x)||1<Math.abs(a-g.y)),l=e.followPointer||1<e.len;h(g,{x:m?(2*g.x+b)/3:b,y:m?(g.y+a)/2:a,anchorX:l?void 0:m?(2*g.anchorX+d)/3:d,anchorY:l?void 0:m?(g.anchorY+c)/2:c});e.getLabel().attr(g);e.drawTracker();m&&(y.clearTimeout(this.tooltipTimeout),this.tooltipTimeout=setTimeout(function(){e&&e.move(b,a,d,c);},32));};a.prototype.refresh=function(b,a){var d=this.chart,c=this.options,e=C(b),g=e[0],l=[],r=c.formatter||this.defaultFormatter,
    h=this.shared,k=d.styledMode,p={};if(c.enabled){y.clearTimeout(this.hideTimer);this.allowShared=!(!w(b)&&b.series&&b.series.noSharedTooltip);this.followPointer=!this.split&&g.series.tooltipOptions.followPointer;b=this.getAnchor(b,a);var n=b[0],t=b[1];h&&this.allowShared?(d.pointer.applyInactiveState(e),e.forEach(function(b){b.setState("hover");l.push(b.getLabelConfig());}),p={x:g.category,y:g.y},p.points=l):p=g.getLabelConfig();this.len=l.length;r=r.call(p,this);h=g.series;this.distance=J(h.tooltipOptions.distance,
    16);if(!1===r)this.hide();else {if(this.split&&this.allowShared)this.renderSplit(r,e);else {var q=n,B=t;a&&d.pointer.isDirectTouch&&(q=a.chartX-d.plotLeft,B=a.chartY-d.plotTop);if(d.polar||!1===h.options.clip||e.some(function(b){return b.series.shouldShowTooltip(q,B)}))a=this.getLabel(),c.style.width&&!k||a.css({width:this.chart.spacingBox.width+"px"}),a.attr({text:r&&r.join?r.join(""):r}),a.removeClass(/highcharts-color-[\d]+/g).addClass("highcharts-color-"+J(g.colorIndex,h.colorIndex)),k||a.attr({stroke:c.borderColor||
    g.color||h.color||"#666666"}),this.updatePosition({plotX:n,plotY:t,negative:g.negative,ttBelow:g.ttBelow,h:b[2]||0});else {this.hide();return}}this.isHidden&&this.label&&this.label.attr({opacity:1}).show();this.isHidden=!1;}f(this,"refresh");}};a.prototype.renderSplit=function(b,a){function d(b,a,d,e,g){void 0===g&&(g=!0);d?(a=X?0:G,b=n(b-e/2,N.left,N.right-e-(c.outside?R:0))):(a-=z,b=g?b-e-y:b+y,b=n(b,g?b:N.left,N.right));return {x:b,y:a}}var c=this,e=c.chart,g=c.chart,l=g.chartWidth,f=g.chartHeight,
    r=g.plotHeight,k=g.plotLeft,p=g.plotTop,t=g.pointer,C=g.scrollablePixelsY;C=void 0===C?0:C;var q=g.scrollablePixelsX,w=g.scrollingContainer;w=void 0===w?{scrollLeft:0,scrollTop:0}:w;var v=w.scrollLeft;w=w.scrollTop;var u=g.styledMode,y=c.distance,E=c.options,T=c.options.positioner,N=c.outside&&"number"!==typeof q?H.documentElement.getBoundingClientRect():{left:v,right:v+l,top:w,bottom:w+f},V=c.getLabel(),W=this.renderer||e.renderer,X=!(!e.xAxis[0]||!e.xAxis[0].opposite);e=t.getChartPosition();var R=
    e.left;e=e.top;var z=p+w,aa=0,G=r-C;B(b)&&(b=[!1,b]);b=b.slice(0,a.length+1).reduce(function(b,e,g){if(!1!==e&&""!==e){g=a[g-1]||{isHeader:!0,plotX:a[0].plotX,plotY:r,series:{}};var m=g.isHeader,l=m?c:g.series;e=e.toString();var f=l.tt,h=g.isHeader;var x=g.series;var D="highcharts-color-"+J(g.colorIndex,x.colorIndex,"none");f||(f={padding:E.padding,r:E.borderRadius},u||(f.fill=E.backgroundColor,f["stroke-width"]=E.borderWidth),f=W.label("",0,0,E[h?"headerShape":"shape"],void 0,void 0,E.useHTML).addClass((h?
    "highcharts-tooltip-header ":"")+"highcharts-tooltip-box "+D).attr(f).add(V));f.isActive=!0;f.attr({text:e});u||f.css(E.style).shadow(E.shadow).attr({stroke:E.borderColor||g.color||x.color||"#333333"});l=l.tt=f;h=l.getBBox();e=h.width+l.strokeWidth();m&&(aa=h.height,G+=aa,X&&(z-=aa));x=g.plotX;x=void 0===x?0:x;D=g.plotY;D=void 0===D?0:D;f=g.series;if(g.isHeader){x=k+x;var t=p+r/2;}else {var I=f.xAxis,C=f.yAxis;x=I.pos+n(x,-y,I.len+y);f.shouldShowTooltip(0,C.pos-p+D,{ignoreX:!0})&&(t=C.pos+D);}x=n(x,
    N.left-y,N.right+y);"number"===typeof t?(h=h.height+1,D=T?T.call(c,e,h,g):d(x,t,m,e),b.push({align:T?0:void 0,anchorX:x,anchorY:t,boxWidth:e,point:g,rank:J(D.rank,m?1:0),size:h,target:D.y,tt:l,x:D.x})):l.isActive=!1;}return b},[]);!T&&b.some(function(b){var a=(c.outside?R:0)+b.anchorX;return a<N.left&&a+b.boxWidth<N.right?!0:a<R-N.left+b.boxWidth&&N.right-a>a})&&(b=b.map(function(b){var a=d(b.anchorX,b.anchorY,b.point.isHeader,b.boxWidth,!1);return h(b,{target:a.y,x:a.x})}));c.cleanSplit();A(b,G);
    var F=R,ba=R;b.forEach(function(b){var a=b.x,d=b.boxWidth;b=b.isHeader;b||(c.outside&&R+a<F&&(F=R+a),!b&&c.outside&&F+d>ba&&(ba=R+a));});b.forEach(function(b){var a=b.x,d=b.anchorX,e=b.pos,g=b.point.isHeader;e={visibility:"undefined"===typeof e?"hidden":"inherit",x:a,y:e+z,anchorX:d,anchorY:b.anchorY};if(c.outside&&a<d){var m=R-F;0<m&&(g||(e.x=a+m,e.anchorX=d+m),g&&(e.x=(ba-F)/2,e.anchorX=d+m));}b.tt.attr(e);});b=c.container;C=c.renderer;c.outside&&b&&C&&(g=V.getBBox(),C.setSize(g.width+g.x,g.height+
    g.y,!1),b.style.left=F+"px",b.style.top=e+"px");};a.prototype.drawTracker=function(){if(this.followPointer||!this.options.stickOnContact)this.tracker&&this.tracker.destroy();else {var b=this.chart,a=this.label,d=this.shared?b.hoverPoints:b.hoverPoint;if(a&&d){var c={x:0,y:0,width:0,height:0};d=this.getAnchor(d);var e=a.getBBox();d[0]+=b.plotLeft-a.translateX;d[1]+=b.plotTop-a.translateY;c.x=Math.min(0,d[0]);c.y=Math.min(0,d[1]);c.width=0>d[0]?Math.max(Math.abs(d[0]),e.width-d[0]):Math.max(Math.abs(d[0]),
    e.width);c.height=0>d[1]?Math.max(Math.abs(d[1]),e.height-Math.abs(d[1])):Math.max(Math.abs(d[1]),e.height);this.tracker?this.tracker.attr(c):(this.tracker=a.renderer.rect(c).addClass("highcharts-tracker").add(a),b.styledMode||this.tracker.attr({fill:"rgba(0,0,0,0)"}));}}};a.prototype.styledModeFormat=function(b){return b.replace('style="font-size: 10px"','class="highcharts-header"').replace(/style="color:{(point|series)\.color}"/g,'class="highcharts-color-{$1.colorIndex}"')};a.prototype.tooltipFooterHeaderFormatter=
    function(b,a){var d=b.series,c=d.tooltipOptions,e=d.xAxis,g=e&&e.dateTime;e={isFooter:a,labelConfig:b};var l=c.xDateFormat,r=c[a?"footerFormat":"headerFormat"];f(this,"headerFormatter",e,function(a){g&&!l&&p(b.key)&&(l=g.getXDateFormat(b.key,c.dateTimeLabelFormats));g&&l&&(b.point&&b.point.tooltipDateKeys||["key"]).forEach(function(b){r=r.replace("{point."+b+"}","{point."+b+":"+l+"}");});d.chart.styledMode&&(r=this.styledModeFormat(r));a.text=v(r,{point:b,series:d},this.chart);});return e.text};a.prototype.update=
    function(b){this.destroy();t(!0,this.chart.options.tooltip.userOptions,b);this.init(this.chart,t(!0,this.options,b));};a.prototype.updatePosition=function(b){var a=this.chart,d=this.options,c=a.pointer,e=this.getLabel();c=c.getChartPosition();var l=(d.positioner||this.getPosition).call(this,e.width,e.height,b),f=b.plotX+a.plotLeft;b=b.plotY+a.plotTop;if(this.outside){d=d.borderWidth+2*this.distance;this.renderer.setSize(e.width+d,e.height+d,!1);if(1!==c.scaleX||1!==c.scaleY)k(this.container,{transform:"scale("+
    c.scaleX+", "+c.scaleY+")"}),f*=c.scaleX,b*=c.scaleY;f+=c.left-l.x;b+=c.top-l.y;}this.move(Math.round(l.x),Math.round(l.y||0),f,b);};return a}();return a});M(a,"Core/Series/Point.js",[a["Core/Renderer/HTML/AST.js"],a["Core/Animation/AnimationUtilities.js"],a["Core/DefaultOptions.js"],a["Core/FormatUtilities.js"],a["Core/Utilities.js"]],function(a,u,z,F,y){var v=u.animObject,H=z.defaultOptions,A=F.format,q=y.addEvent,n=y.defined,k=y.erase,e=y.extend,c=y.fireEvent,h=y.getNestedProperty,f=y.isArray,
    w=y.isFunction,p=y.isNumber,B=y.isObject,t=y.merge,J=y.objectEach,C=y.pick,r=y.syncTimeout,l=y.removeEvent,b=y.uniqueKey;u=function(){function g(){this.colorIndex=this.category=void 0;this.formatPrefix="point";this.id=void 0;this.isNull=!1;this.percentage=this.options=this.name=void 0;this.selected=!1;this.total=this.series=void 0;this.visible=!0;this.x=void 0;}g.prototype.animateBeforeDestroy=function(){var b=this,a={x:b.startXPos,opacity:0},c=b.getGraphicalProps();c.singular.forEach(function(d){b[d]=
    b[d].animate("dataLabel"===d?{x:b[d].startXPos,y:b[d].startYPos,opacity:0}:a);});c.plural.forEach(function(a){b[a].forEach(function(a){a.element&&a.animate(e({x:b.startXPos},a.startYPos?{x:a.startXPos,y:a.startYPos}:{}));});});};g.prototype.applyOptions=function(b,a){var d=this.series,c=d.options.pointValKey||d.pointValKey;b=g.prototype.optionsToObject.call(this,b);e(this,b);this.options=this.options?e(this.options,b):b;b.group&&delete this.group;b.dataLabels&&delete this.dataLabels;c&&(this.y=g.prototype.getNestedProperty.call(this,
    c));this.formatPrefix=(this.isNull=C(this.isValid&&!this.isValid(),null===this.x||!p(this.y)))?"null":"point";this.selected&&(this.state="select");"name"in this&&"undefined"===typeof a&&d.xAxis&&d.xAxis.hasNames&&(this.x=d.xAxis.nameToX(this));"undefined"===typeof this.x&&d?this.x="undefined"===typeof a?d.autoIncrement():a:p(b.x)&&d.options.relativeXValue&&(this.x=d.autoIncrement(b.x));return this};g.prototype.destroy=function(){function b(){if(a.graphic||a.dataLabel||a.dataLabels)l(a),a.destroyElements();
    for(h in a)a[h]=null;}var a=this,c=a.series,e=c.chart;c=c.options.dataSorting;var g=e.hoverPoints,f=v(a.series.chart.renderer.globalAnimation),h;a.legendItem&&e.legend.destroyItem(a);g&&(a.setState(),k(g,a),g.length||(e.hoverPoints=null));if(a===e.hoverPoint)a.onMouseOut();c&&c.enabled?(this.animateBeforeDestroy(),r(b,f.duration)):b();e.pointCount--;};g.prototype.destroyElements=function(b){var a=this;b=a.getGraphicalProps(b);b.singular.forEach(function(b){a[b]=a[b].destroy();});b.plural.forEach(function(b){a[b].forEach(function(b){b.element&&
    b.destroy();});delete a[b];});};g.prototype.firePointEvent=function(b,a,e){var d=this,g=this.series.options;(g.point.events[b]||d.options&&d.options.events&&d.options.events[b])&&d.importEvents();"click"===b&&g.allowPointSelect&&(e=function(b){d.select&&d.select(null,b.ctrlKey||b.metaKey||b.shiftKey);});c(d,b,a,e);};g.prototype.getClassName=function(){return "highcharts-point"+(this.selected?" highcharts-point-select":"")+(this.negative?" highcharts-negative":"")+(this.isNull?" highcharts-null-point":"")+
    ("undefined"!==typeof this.colorIndex?" highcharts-color-"+this.colorIndex:"")+(this.options.className?" "+this.options.className:"")+(this.zone&&this.zone.className?" "+this.zone.className.replace("highcharts-negative",""):"")};g.prototype.getGraphicalProps=function(b){var a=this,d=[],c={singular:[],plural:[]},e;b=b||{graphic:1,dataLabel:1};b.graphic&&d.push("graphic","upperGraphic","shadowGroup");b.dataLabel&&d.push("dataLabel","dataLabelUpper","connector");for(e=d.length;e--;){var g=d[e];a[g]&&
    c.singular.push(g);}["dataLabel","connector"].forEach(function(d){var e=d+"s";b[d]&&a[e]&&c.plural.push(e);});return c};g.prototype.getLabelConfig=function(){return {x:this.category,y:this.y,color:this.color,colorIndex:this.colorIndex,key:this.name||this.category,series:this.series,point:this,percentage:this.percentage,total:this.total||this.stackTotal}};g.prototype.getNestedProperty=function(b){if(b)return 0===b.indexOf("custom.")?h(b,this.options):this[b]};g.prototype.getZone=function(){var b=this.series,
    a=b.zones;b=b.zoneAxis||"y";var c,e=0;for(c=a[e];this[b]>=c.value;)c=a[++e];this.nonZonedColor||(this.nonZonedColor=this.color);this.color=c&&c.color&&!this.options.color?c.color:this.nonZonedColor;return c};g.prototype.hasNewShapeType=function(){return (this.graphic&&(this.graphic.symbolName||this.graphic.element.nodeName))!==this.shapeType};g.prototype.init=function(a,e,g){this.series=a;this.applyOptions(e,g);this.id=n(this.id)?this.id:b();this.resolveColor();a.chart.pointCount++;c(this,"afterInit");
    return this};g.prototype.optionsToObject=function(b){var a=this.series,d=a.options.keys,c=d||a.pointArrayMap||["y"],e=c.length,l={},r=0,h=0;if(p(b)||null===b)l[c[0]]=b;else if(f(b))for(!d&&b.length>e&&(a=typeof b[0],"string"===a?l.name=b[0]:"number"===a&&(l.x=b[0]),r++);h<e;)d&&"undefined"===typeof b[r]||(0<c[h].indexOf(".")?g.prototype.setNestedProperty(l,b[r],c[h]):l[c[h]]=b[r]),r++,h++;else "object"===typeof b&&(l=b,b.dataLabels&&(a._hasPointLabels=!0),b.marker&&(a._hasPointMarkers=!0));return l};
    g.prototype.resolveColor=function(){var b=this.series,a=b.chart.styledMode;var c=b.chart.options.chart.colorCount;delete this.nonZonedColor;if(b.options.colorByPoint){if(!a){c=b.options.colors||b.chart.options.colors;var e=c[b.colorCounter];c=c.length;}a=b.colorCounter;b.colorCounter++;b.colorCounter===c&&(b.colorCounter=0);}else a||(e=b.color),a=b.colorIndex;this.colorIndex=C(this.options.colorIndex,a);this.color=C(this.options.color,e);};g.prototype.setNestedProperty=function(b,a,c){c.split(".").reduce(function(b,
    d,c,e){b[d]=e.length-1===c?a:B(b[d],!0)?b[d]:{};return b[d]},b);return b};g.prototype.tooltipFormatter=function(b){var a=this.series,d=a.tooltipOptions,c=C(d.valueDecimals,""),e=d.valuePrefix||"",g=d.valueSuffix||"";a.chart.styledMode&&(b=a.chart.tooltip.styledModeFormat(b));(a.pointArrayMap||["y"]).forEach(function(a){a="{point."+a;if(e||g)b=b.replace(RegExp(a+"}","g"),e+a+"}"+g);b=b.replace(RegExp(a+"}","g"),a+":,."+c+"f}");});return A(b,{point:this,series:this.series},a.chart)};g.prototype.update=
    function(b,a,c,e){function d(){g.applyOptions(b);var d=m&&g.hasDummyGraphic;d=null===g.y?!d:d;m&&d&&(g.graphic=m.destroy(),delete g.hasDummyGraphic);B(b,!0)&&(m&&m.element&&b&&b.marker&&"undefined"!==typeof b.marker.symbol&&(g.graphic=m.destroy()),b&&b.dataLabels&&g.dataLabel&&(g.dataLabel=g.dataLabel.destroy()),g.connector&&(g.connector=g.connector.destroy()));h=g.index;l.updateParallelArrays(g,h);r.data[h]=B(r.data[h],!0)||B(b,!0)?g.options:C(b,r.data[h]);l.isDirty=l.isDirtyData=!0;!l.fixedBox&&
    l.hasCartesianSeries&&(f.isDirtyBox=!0);"point"===r.legendType&&(f.isDirtyLegend=!0);a&&f.redraw(c);}var g=this,l=g.series,m=g.graphic,f=l.chart,r=l.options,h;a=C(a,!0);!1===e?d():g.firePointEvent("update",{options:b},d);};g.prototype.remove=function(b,a){this.series.removePoint(this.series.data.indexOf(this),b,a);};g.prototype.select=function(b,a){var d=this,c=d.series,e=c.chart;this.selectedStaging=b=C(b,!d.selected);d.firePointEvent(b?"select":"unselect",{accumulate:a},function(){d.selected=d.options.selected=
    b;c.options.data[c.data.indexOf(d)]=d.options;d.setState(b&&"select");a||e.getSelectedPoints().forEach(function(b){var a=b.series;b.selected&&b!==d&&(b.selected=b.options.selected=!1,a.options.data[a.data.indexOf(b)]=b.options,b.setState(e.hoverPoints&&a.options.inactiveOtherPoints?"inactive":""),b.firePointEvent("unselect"));});});delete this.selectedStaging;};g.prototype.onMouseOver=function(b){var a=this.series.chart,d=a.pointer;b=b?d.normalize(b):d.getChartCoordinatesFromPoint(this,a.inverted);d.runPointActions(b,
    this);};g.prototype.onMouseOut=function(){var b=this.series.chart;this.firePointEvent("mouseOut");this.series.options.inactiveOtherPoints||(b.hoverPoints||[]).forEach(function(b){b.setState();});b.hoverPoints=b.hoverPoint=null;};g.prototype.importEvents=function(){if(!this.hasImportedEvents){var b=this,a=t(b.series.options.point,b.options).events;b.events=a;J(a,function(a,d){w(a)&&q(b,d,a);});this.hasImportedEvents=!0;}};g.prototype.setState=function(b,g){var d=this.series,l=this.state,m=d.options.states[b||
    "normal"]||{},f=H.plotOptions[d.type].marker&&d.options.marker,r=f&&!1===f.enabled,h=f&&f.states&&f.states[b||"normal"]||{},k=!1===h.enabled,n=this.marker||{},t=d.chart,q=f&&d.markerAttribs,w=d.halo,B,v=d.stateMarkerGraphic;b=b||"";if(!(b===this.state&&!g||this.selected&&"select"!==b||!1===m.enabled||b&&(k||r&&!1===h.enabled)||b&&n.states&&n.states[b]&&!1===n.states[b].enabled)){this.state=b;q&&(B=d.markerAttribs(this,b));if(this.graphic&&!this.hasDummyGraphic){l&&this.graphic.removeClass("highcharts-point-"+
    l);b&&this.graphic.addClass("highcharts-point-"+b);if(!t.styledMode){var J=d.pointAttribs(this,b);var E=C(t.options.chart.animation,m.animation);d.options.inactiveOtherPoints&&p(J.opacity)&&((this.dataLabels||[]).forEach(function(b){b&&b.animate({opacity:J.opacity},E);}),this.connector&&this.connector.animate({opacity:J.opacity},E));this.graphic.animate(J,E);}B&&this.graphic.animate(B,C(t.options.chart.animation,h.animation,f.animation));v&&v.hide();}else {if(b&&h){l=n.symbol||d.symbol;v&&v.currentSymbol!==
    l&&(v=v.destroy());if(B)if(v)v[g?"animate":"attr"]({x:B.x,y:B.y});else l&&(d.stateMarkerGraphic=v=t.renderer.symbol(l,B.x,B.y,B.width,B.height).add(d.markerGroup),v.currentSymbol=l);!t.styledMode&&v&&"inactive"!==this.state&&v.attr(d.pointAttribs(this,b));}v&&(v[b&&this.isInside?"show":"hide"](),v.element.point=this,v.addClass(this.getClassName(),!0));}m=m.halo;B=(v=this.graphic||v)&&v.visibility||"inherit";m&&m.size&&v&&"hidden"!==B&&!this.isCluster?(w||(d.halo=w=t.renderer.path().add(v.parentGroup)),
    w.show()[g?"animate":"attr"]({d:this.haloPath(m.size)}),w.attr({"class":"highcharts-halo highcharts-color-"+C(this.colorIndex,d.colorIndex)+(this.className?" "+this.className:""),visibility:B,zIndex:-1}),w.point=this,t.styledMode||w.attr(e({fill:this.color||d.color,"fill-opacity":m.opacity},a.filterUserAttributes(m.attributes||{})))):w&&w.point&&w.point.haloPath&&w.animate({d:w.point.haloPath(0)},null,w.hide);c(this,"afterSetState",{state:b});}};g.prototype.haloPath=function(b){return this.series.chart.renderer.symbols.circle(Math.floor(this.plotX)-
    b,this.plotY-b,2*b,2*b)};return g}();return u});M(a,"Core/Pointer.js",[a["Core/Color/Color.js"],a["Core/Globals.js"],a["Core/Tooltip.js"],a["Core/Utilities.js"]],function(a,u,z,F){var v=a.parse,G=u.charts,H=u.noop,A=F.addEvent,q=F.attr,n=F.css,k=F.defined,e=F.extend,c=F.find,h=F.fireEvent,f=F.isNumber,w=F.isObject,p=F.objectEach,B=F.offset,t=F.pick,J=F.splat;a=function(){function a(a,c){this.lastValidTouch={};this.pinchDown=[];this.runChartClick=!1;this.eventsToUnbind=[];this.chart=a;this.hasDragged=
    !1;this.options=c;this.init(a,c);}a.prototype.applyInactiveState=function(a){var c=[],b;(a||[]).forEach(function(a){b=a.series;c.push(b);b.linkedParent&&c.push(b.linkedParent);b.linkedSeries&&(c=c.concat(b.linkedSeries));b.navigatorSeries&&c.push(b.navigatorSeries);});this.chart.series.forEach(function(b){-1===c.indexOf(b)?b.setState("inactive",!0):b.options.inactiveOtherPoints&&b.setAllPointsToState("inactive");});};a.prototype.destroy=function(){var c=this;this.eventsToUnbind.forEach(function(a){return a()});
    this.eventsToUnbind=[];u.chartCount||(a.unbindDocumentMouseUp&&(a.unbindDocumentMouseUp=a.unbindDocumentMouseUp()),a.unbindDocumentTouchEnd&&(a.unbindDocumentTouchEnd=a.unbindDocumentTouchEnd()));clearInterval(c.tooltipTimeout);p(c,function(a,b){c[b]=void 0;});};a.prototype.drag=function(a){var c=this.chart,b=c.options.chart,e=this.zoomHor,d=this.zoomVert,m=c.plotLeft,f=c.plotTop,h=c.plotWidth,r=c.plotHeight,k=this.mouseDownX||0,p=this.mouseDownY||0,n=w(b.panning)?b.panning&&b.panning.enabled:b.panning,
    t=b.panKey&&a[b.panKey+"Key"],q=a.chartX,B=a.chartY,C=this.selectionMarker;if(!C||!C.touch)if(q<m?q=m:q>m+h&&(q=m+h),B<f?B=f:B>f+r&&(B=f+r),this.hasDragged=Math.sqrt(Math.pow(k-q,2)+Math.pow(p-B,2)),10<this.hasDragged){var J=c.isInsidePlot(k-m,p-f,{visiblePlotOnly:!0});!c.hasCartesianSeries&&!c.mapView||!this.zoomX&&!this.zoomY||!J||t||C||(this.selectionMarker=C=c.renderer.rect(m,f,e?1:h,d?1:r,0).attr({"class":"highcharts-selection-marker",zIndex:7}).add(),c.styledMode||C.attr({fill:b.selectionMarkerFill||
    v("#335cad").setOpacity(.25).get()}));C&&e&&(e=q-k,C.attr({width:Math.abs(e),x:(0<e?0:e)+k}));C&&d&&(e=B-p,C.attr({height:Math.abs(e),y:(0<e?0:e)+p}));J&&!C&&n&&c.pan(a,b.panning);}};a.prototype.dragStart=function(a){var c=this.chart;c.mouseIsDown=a.type;c.cancelClick=!1;c.mouseDownX=this.mouseDownX=a.chartX;c.mouseDownY=this.mouseDownY=a.chartY;};a.prototype.drop=function(a){var c=this,b=this.chart,g=this.hasPinched;if(this.selectionMarker){var d=this.selectionMarker,m=d.attr?d.attr("x"):d.x,r=d.attr?
    d.attr("y"):d.y,p=d.attr?d.attr("width"):d.width,t=d.attr?d.attr("height"):d.height,q={originalEvent:a,xAxis:[],yAxis:[],x:m,y:r,width:p,height:t},B=!!b.mapView;if(this.hasDragged||g)b.axes.forEach(function(b){if(b.zoomEnabled&&k(b.min)&&(g||c[{xAxis:"zoomX",yAxis:"zoomY"}[b.coll]])&&f(m)&&f(r)){var d=b.horiz,e="touchend"===a.type?b.minPixelPadding:0,l=b.toValue((d?m:r)+e);d=b.toValue((d?m+p:r+t)-e);q[b.coll].push({axis:b,min:Math.min(l,d),max:Math.max(l,d)});B=!0;}}),B&&h(b,"selection",q,function(a){b.zoom(e(a,
    g?{animation:!1}:null));});f(b.index)&&(this.selectionMarker=this.selectionMarker.destroy());g&&this.scaleGroups();}b&&f(b.index)&&(n(b.container,{cursor:b._cursor}),b.cancelClick=10<this.hasDragged,b.mouseIsDown=this.hasDragged=this.hasPinched=!1,this.pinchDown=[]);};a.prototype.findNearestKDPoint=function(a,c,b){var e=this.chart,d=e.hoverPoint;e=e.tooltip;if(d&&e&&e.isStickyOnContact())return d;var l;a.forEach(function(a){var d=!(a.noSharedTooltip&&c)&&0>a.options.findNearestPointBy.indexOf("y");a=
    a.searchPoint(b,d);if((d=w(a,!0)&&a.series)&&!(d=!w(l,!0))){d=l.distX-a.distX;var e=l.dist-a.dist,g=(a.series.group&&a.series.group.zIndex)-(l.series.group&&l.series.group.zIndex);d=0<(0!==d&&c?d:0!==e?e:0!==g?g:l.series.index>a.series.index?-1:1);}d&&(l=a);});return l};a.prototype.getChartCoordinatesFromPoint=function(a,c){var b=a.series,e=b.xAxis;b=b.yAxis;var d=a.shapeArgs;if(e&&b){var l=t(a.clientX,a.plotX),h=a.plotY||0;a.isNode&&d&&f(d.x)&&f(d.y)&&(l=d.x,h=d.y);return c?{chartX:b.len+b.pos-h,chartY:e.len+
    e.pos-l}:{chartX:l+e.pos,chartY:h+b.pos}}if(d&&d.x&&d.y)return {chartX:d.x,chartY:d.y}};a.prototype.getChartPosition=function(){if(this.chartPosition)return this.chartPosition;var a=this.chart.container,c=B(a);this.chartPosition={left:c.left,top:c.top,scaleX:1,scaleY:1};var b=a.offsetWidth;a=a.offsetHeight;2<b&&2<a&&(this.chartPosition.scaleX=c.width/b,this.chartPosition.scaleY=c.height/a);return this.chartPosition};a.prototype.getCoordinates=function(a){var c={xAxis:[],yAxis:[]};this.chart.axes.forEach(function(b){c[b.isXAxis?
    "xAxis":"yAxis"].push({axis:b,value:b.toValue(a[b.horiz?"chartX":"chartY"])});});return c};a.prototype.getHoverData=function(a,e,b,g,d,m){var l=[];g=!(!g||!a);var f={chartX:m?m.chartX:void 0,chartY:m?m.chartY:void 0,shared:d};h(this,"beforeGetHoverData",f);var r=e&&!e.stickyTracking?[e]:b.filter(function(b){return f.filter?f.filter(b):b.visible&&!(!d&&b.directTouch)&&t(b.options.enableMouseTracking,!0)&&b.stickyTracking});var k=g||!m?a:this.findNearestKDPoint(r,d,m);e=k&&k.series;k&&(d&&!e.noSharedTooltip?
    (r=b.filter(function(b){return f.filter?f.filter(b):b.visible&&!(!d&&b.directTouch)&&t(b.options.enableMouseTracking,!0)&&!b.noSharedTooltip}),r.forEach(function(b){var a=c(b.points,function(b){return b.x===k.x&&!b.isNull});w(a)&&(b.chart.isBoosting&&(a=b.getPoint(a)),l.push(a));})):l.push(k));f={hoverPoint:k};h(this,"afterGetHoverData",f);return {hoverPoint:f.hoverPoint,hoverSeries:e,hoverPoints:l}};a.prototype.getPointFromEvent=function(a){a=a.target;for(var c;a&&!c;)c=a.point,a=a.parentNode;return c};
    a.prototype.onTrackerMouseOut=function(a){a=a.relatedTarget||a.toElement;var c=this.chart.hoverSeries;this.isDirectTouch=!1;if(!(!c||!a||c.stickyTracking||this.inClass(a,"highcharts-tooltip")||this.inClass(a,"highcharts-series-"+c.index)&&this.inClass(a,"highcharts-tracker")))c.onMouseOut();};a.prototype.inClass=function(a,c){for(var b;a;){if(b=q(a,"class")){if(-1!==b.indexOf(c))return !0;if(-1!==b.indexOf("highcharts-container"))return !1}a=a.parentNode;}};a.prototype.init=function(a,c){this.options=
    c;this.chart=a;this.runChartClick=!(!c.chart.events||!c.chart.events.click);this.pinchDown=[];this.lastValidTouch={};z&&(a.tooltip=new z(a,c.tooltip),this.followTouchMove=t(c.tooltip.followTouchMove,!0));this.setDOMEvents();};a.prototype.normalize=function(a,c){var b=a.touches,g=b?b.length?b.item(0):t(b.changedTouches,a.changedTouches)[0]:a;c||(c=this.getChartPosition());b=g.pageX-c.left;g=g.pageY-c.top;b/=c.scaleX;g/=c.scaleY;return e(a,{chartX:Math.round(b),chartY:Math.round(g)})};a.prototype.onContainerClick=
    function(a){var c=this.chart,b=c.hoverPoint;a=this.normalize(a);var g=c.plotLeft,d=c.plotTop;c.cancelClick||(b&&this.inClass(a.target,"highcharts-tracker")?(h(b.series,"click",e(a,{point:b})),c.hoverPoint&&b.firePointEvent("click",a)):(e(a,this.getCoordinates(a)),c.isInsidePlot(a.chartX-g,a.chartY-d,{visiblePlotOnly:!0})&&h(c,"click",a)));};a.prototype.onContainerMouseDown=function(a){var c=1===((a.buttons||a.button)&1);a=this.normalize(a);if(u.isFirefox&&0!==a.button)this.onContainerMouseMove(a);
    if("undefined"===typeof a.button||c)this.zoomOption(a),c&&a.preventDefault&&a.preventDefault(),this.dragStart(a);};a.prototype.onContainerMouseLeave=function(c){var e=G[t(a.hoverChartIndex,-1)],b=this.chart.tooltip;b&&b.shouldStickOnContact()&&this.inClass(c.relatedTarget,"highcharts-tooltip-container")||(c=this.normalize(c),e&&(c.relatedTarget||c.toElement)&&(e.pointer.reset(),e.pointer.chartPosition=void 0),b&&!b.isHidden&&this.reset());};a.prototype.onContainerMouseEnter=function(a){delete this.chartPosition;};
    a.prototype.onContainerMouseMove=function(a){var c=this.chart;a=this.normalize(a);this.setHoverChartIndex();a.preventDefault||(a.returnValue=!1);("mousedown"===c.mouseIsDown||this.touchSelect(a))&&this.drag(a);c.openMenu||!this.inClass(a.target,"highcharts-tracker")&&!c.isInsidePlot(a.chartX-c.plotLeft,a.chartY-c.plotTop,{visiblePlotOnly:!0})||(this.inClass(a.target,"highcharts-no-tooltip")?this.reset(!1,0):this.runPointActions(a));};a.prototype.onDocumentTouchEnd=function(c){var e=G[t(a.hoverChartIndex,
    -1)];e&&e.pointer.drop(c);};a.prototype.onContainerTouchMove=function(a){if(this.touchSelect(a))this.onContainerMouseMove(a);else this.touch(a);};a.prototype.onContainerTouchStart=function(a){if(this.touchSelect(a))this.onContainerMouseDown(a);else this.zoomOption(a),this.touch(a,!0);};a.prototype.onDocumentMouseMove=function(a){var c=this.chart,b=this.chartPosition;a=this.normalize(a,b);var e=c.tooltip;!b||e&&e.isStickyOnContact()||c.isInsidePlot(a.chartX-c.plotLeft,a.chartY-c.plotTop,{visiblePlotOnly:!0})||
    this.inClass(a.target,"highcharts-tracker")||this.reset();};a.prototype.onDocumentMouseUp=function(c){var e=G[t(a.hoverChartIndex,-1)];e&&e.pointer.drop(c);};a.prototype.pinch=function(a){var c=this,b=c.chart,g=c.pinchDown,d=a.touches||[],m=d.length,f=c.lastValidTouch,k=c.hasZoom,p={},r=1===m&&(c.inClass(a.target,"highcharts-tracker")&&b.runTrackerClick||c.runChartClick),n={},q=c.selectionMarker;1<m?c.initiated=!0:1===m&&this.followTouchMove&&(c.initiated=!1);k&&c.initiated&&!r&&!1!==a.cancelable&&
    a.preventDefault();[].map.call(d,function(b){return c.normalize(b)});"touchstart"===a.type?([].forEach.call(d,function(b,a){g[a]={chartX:b.chartX,chartY:b.chartY};}),f.x=[g[0].chartX,g[1]&&g[1].chartX],f.y=[g[0].chartY,g[1]&&g[1].chartY],b.axes.forEach(function(a){if(a.zoomEnabled){var d=b.bounds[a.horiz?"h":"v"],c=a.minPixelPadding,e=a.toPixels(Math.min(t(a.options.min,a.dataMin),a.dataMin)),g=a.toPixels(Math.max(t(a.options.max,a.dataMax),a.dataMax)),m=Math.max(e,g);d.min=Math.min(a.pos,Math.min(e,
    g)-c);d.max=Math.max(a.pos+a.len,m+c);}}),c.res=!0):c.followTouchMove&&1===m?this.runPointActions(c.normalize(a)):g.length&&(h(b,"touchpan",{originalEvent:a},function(){q||(c.selectionMarker=q=e({destroy:H,touch:!0},b.plotBox));c.pinchTranslate(g,d,p,q,n,f);c.hasPinched=k;c.scaleGroups(p,n);}),c.res&&(c.res=!1,this.reset(!1,0)));};a.prototype.pinchTranslate=function(a,c,b,e,d,m){this.zoomHor&&this.pinchTranslateDirection(!0,a,c,b,e,d,m);this.zoomVert&&this.pinchTranslateDirection(!1,a,c,b,e,d,m);};a.prototype.pinchTranslateDirection=
    function(a,c,b,e,d,m,f,h){var g=this.chart,l=a?"x":"y",k=a?"X":"Y",p="chart"+k,r=a?"width":"height",n=g["plot"+(a?"Left":"Top")],t=g.inverted,x=g.bounds[a?"h":"v"],q=1===c.length,D=c[0][p],B=!q&&c[1][p];c=function(){"number"===typeof v&&20<Math.abs(D-B)&&(C=h||Math.abs(N-v)/Math.abs(D-B));E=(n-N)/C+D;w=g["plot"+(a?"Width":"Height")]/C;};var w,E,C=h||1,N=b[0][p],v=!q&&b[1][p];c();b=E;if(b<x.min){b=x.min;var J=!0;}else b+w>x.max&&(b=x.max-w,J=!0);J?(N-=.8*(N-f[l][0]),"number"===typeof v&&(v-=.8*(v-f[l][1])),
    c()):f[l]=[N,v];t||(m[l]=E-n,m[r]=w);m=t?1/C:C;d[r]=w;d[l]=b;e[t?a?"scaleY":"scaleX":"scale"+k]=C;e["translate"+k]=m*n+(N-m*D);};a.prototype.reset=function(a,c){var b=this.chart,e=b.hoverSeries,d=b.hoverPoint,m=b.hoverPoints,f=b.tooltip,l=f&&f.shared?m:d;a&&l&&J(l).forEach(function(b){b.series.isCartesian&&"undefined"===typeof b.plotX&&(a=!1);});if(a)f&&l&&J(l).length&&(f.refresh(l),f.shared&&m?m.forEach(function(b){b.setState(b.state,!0);b.series.isCartesian&&(b.series.xAxis.crosshair&&b.series.xAxis.drawCrosshair(null,
    b),b.series.yAxis.crosshair&&b.series.yAxis.drawCrosshair(null,b));}):d&&(d.setState(d.state,!0),b.axes.forEach(function(b){b.crosshair&&d.series[b.coll]===b&&b.drawCrosshair(null,d);})));else {if(d)d.onMouseOut();m&&m.forEach(function(b){b.setState();});if(e)e.onMouseOut();f&&f.hide(c);this.unDocMouseMove&&(this.unDocMouseMove=this.unDocMouseMove());b.axes.forEach(function(b){b.hideCrosshair();});this.hoverX=b.hoverPoints=b.hoverPoint=null;}};a.prototype.runPointActions=function(e,f){var b=this.chart,
    g=b.tooltip&&b.tooltip.options.enabled?b.tooltip:void 0,d=g?g.shared:!1,m=f||b.hoverPoint,l=m&&m.series||b.hoverSeries;f=this.getHoverData(m,l,b.series,(!e||"touchmove"!==e.type)&&(!!f||l&&l.directTouch&&this.isDirectTouch),d,e);m=f.hoverPoint;l=f.hoverSeries;var h=f.hoverPoints;f=l&&l.tooltipOptions.followPointer&&!l.tooltipOptions.split;d=d&&l&&!l.noSharedTooltip;if(m&&(m!==b.hoverPoint||g&&g.isHidden)){(b.hoverPoints||[]).forEach(function(b){-1===h.indexOf(b)&&b.setState();});if(b.hoverSeries!==
    l)l.onMouseOver();this.applyInactiveState(h);(h||[]).forEach(function(b){b.setState("hover");});b.hoverPoint&&b.hoverPoint.firePointEvent("mouseOut");if(!m.series)return;b.hoverPoints=h;b.hoverPoint=m;m.firePointEvent("mouseOver");g&&g.refresh(d?h:m,e);}else f&&g&&!g.isHidden&&(m=g.getAnchor([{}],e),b.isInsidePlot(m[0],m[1],{visiblePlotOnly:!0})&&g.updatePosition({plotX:m[0],plotY:m[1]}));this.unDocMouseMove||(this.unDocMouseMove=A(b.container.ownerDocument,"mousemove",function(b){var d=G[a.hoverChartIndex];
    if(d)d.pointer.onDocumentMouseMove(b);}),this.eventsToUnbind.push(this.unDocMouseMove));b.axes.forEach(function(a){var d=t((a.crosshair||{}).snap,!0),g;d&&((g=b.hoverPoint)&&g.series[a.coll]===a||(g=c(h,function(b){return b.series[a.coll]===a})));g||!d?a.drawCrosshair(e,g):a.hideCrosshair();});};a.prototype.scaleGroups=function(a,c){var b=this.chart;b.series.forEach(function(e){var d=a||e.getPlotBox();e.group&&(e.xAxis&&e.xAxis.zoomEnabled||b.mapView)&&(e.group.attr(d),e.markerGroup&&(e.markerGroup.attr(d),
    e.markerGroup.clip(c?b.clipRect:null)),e.dataLabelsGroup&&e.dataLabelsGroup.attr(d));});b.clipRect.attr(c||b.clipBox);};a.prototype.setDOMEvents=function(){var c=this,e=this.chart.container,b=e.ownerDocument;e.onmousedown=this.onContainerMouseDown.bind(this);e.onmousemove=this.onContainerMouseMove.bind(this);e.onclick=this.onContainerClick.bind(this);this.eventsToUnbind.push(A(e,"mouseenter",this.onContainerMouseEnter.bind(this)));this.eventsToUnbind.push(A(e,"mouseleave",this.onContainerMouseLeave.bind(this)));
    a.unbindDocumentMouseUp||(a.unbindDocumentMouseUp=A(b,"mouseup",this.onDocumentMouseUp.bind(this)));for(var g=this.chart.renderTo.parentElement;g&&"BODY"!==g.tagName;)this.eventsToUnbind.push(A(g,"scroll",function(){delete c.chartPosition;})),g=g.parentElement;u.hasTouch&&(this.eventsToUnbind.push(A(e,"touchstart",this.onContainerTouchStart.bind(this),{passive:!1})),this.eventsToUnbind.push(A(e,"touchmove",this.onContainerTouchMove.bind(this),{passive:!1})),a.unbindDocumentTouchEnd||(a.unbindDocumentTouchEnd=
    A(b,"touchend",this.onDocumentTouchEnd.bind(this),{passive:!1})));};a.prototype.setHoverChartIndex=function(){var c=this.chart,e=u.charts[t(a.hoverChartIndex,-1)];if(e&&e!==c)e.pointer.onContainerMouseLeave({relatedTarget:!0});e&&e.mouseIsDown||(a.hoverChartIndex=c.index);};a.prototype.touch=function(a,c){var b=this.chart;this.setHoverChartIndex();if(1===a.touches.length)if(a=this.normalize(a),(b.isInsidePlot(a.chartX-b.plotLeft,a.chartY-b.plotTop,{visiblePlotOnly:!0}))&&!b.openMenu){c&&this.runPointActions(a);
    if("touchmove"===a.type){c=this.pinchDown;var d=c[0]?4<=Math.sqrt(Math.pow(c[0].chartX-a.chartX,2)+Math.pow(c[0].chartY-a.chartY,2)):!1;}t(d,!0)&&this.pinch(a);}else c&&this.reset();else 2===a.touches.length&&this.pinch(a);};a.prototype.touchSelect=function(a){return !(!this.chart.options.chart.zoomBySingleTouch||!a.touches||1!==a.touches.length)};a.prototype.zoomOption=function(a){var c=this.chart,b=c.options.chart;c=c.inverted;var e=b.zoomType||"";/touch/.test(a.type)&&(e=t(b.pinchType,e));this.zoomX=
    a=/x/.test(e);this.zoomY=b=/y/.test(e);this.zoomHor=a&&!c||b&&c;this.zoomVert=b&&!c||a&&c;this.hasZoom=a||b;};return a}();return a});M(a,"Core/MSPointer.js",[a["Core/Globals.js"],a["Core/Pointer.js"],a["Core/Utilities.js"]],function(a,u,z){function v(){var a=[];a.item=function(a){return this[a]};c(f,function(c){a.push({pageX:c.pageX,pageY:c.pageY,target:c.target});});return a}function y(a,c,e,f){var h=H[u.hoverChartIndex||NaN];"touch"!==a.pointerType&&a.pointerType!==a.MSPOINTER_TYPE_TOUCH||!h||
    (h=h.pointer,f(a),h[c]({type:e,target:a.currentTarget,preventDefault:q,touches:v()}));}var G=this&&this.__extends||function(){var a=function(c,e){a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(a,c){a.__proto__=c;}||function(a,c){for(var e in c)c.hasOwnProperty(e)&&(a[e]=c[e]);};return a(c,e)};return function(c,e){function f(){this.constructor=c;}a(c,e);c.prototype=null===e?Object.create(e):(f.prototype=e.prototype,new f);}}(),H=a.charts,A=a.doc,q=a.noop,n=a.win,k=z.addEvent,e=z.css,
    c=z.objectEach,h=z.removeEvent,f={},w=!!n.PointerEvent;return function(c){function p(){return null!==c&&c.apply(this,arguments)||this}G(p,c);p.isRequired=function(){return !(a.hasTouch||!n.PointerEvent&&!n.MSPointerEvent)};p.prototype.batchMSEvents=function(a){a(this.chart.container,w?"pointerdown":"MSPointerDown",this.onContainerPointerDown);a(this.chart.container,w?"pointermove":"MSPointerMove",this.onContainerPointerMove);a(A,w?"pointerup":"MSPointerUp",this.onDocumentPointerUp);};p.prototype.destroy=
    function(){this.batchMSEvents(h);c.prototype.destroy.call(this);};p.prototype.init=function(a,f){c.prototype.init.call(this,a,f);this.hasZoom&&e(a.container,{"-ms-touch-action":"none","touch-action":"none"});};p.prototype.onContainerPointerDown=function(a){y(a,"onContainerTouchStart","touchstart",function(a){f[a.pointerId]={pageX:a.pageX,pageY:a.pageY,target:a.currentTarget};});};p.prototype.onContainerPointerMove=function(a){y(a,"onContainerTouchMove","touchmove",function(a){f[a.pointerId]={pageX:a.pageX,
    pageY:a.pageY};f[a.pointerId].target||(f[a.pointerId].target=a.currentTarget);});};p.prototype.onDocumentPointerUp=function(a){y(a,"onDocumentTouchEnd","touchend",function(a){delete f[a.pointerId];});};p.prototype.setDOMEvents=function(){c.prototype.setDOMEvents.call(this);(this.hasZoom||this.followTouchMove)&&this.batchMSEvents(k);};return p}(u)});M(a,"Core/Legend/Legend.js",[a["Core/Animation/AnimationUtilities.js"],a["Core/FormatUtilities.js"],a["Core/Globals.js"],a["Core/Series/Point.js"],a["Core/Renderer/RendererUtilities.js"],
    a["Core/Utilities.js"]],function(a,u,z,F,y,G){var v=a.animObject,A=a.setAnimation,q=u.format;a=z.isFirefox;var n=z.marginNames;z=z.win;var k=y.distribute,e=G.addEvent,c=G.createElement,h=G.css,f=G.defined,w=G.discardElement,p=G.find,B=G.fireEvent,t=G.isNumber,J=G.merge,C=G.pick,r=G.relativeLength,l=G.stableSort,b=G.syncTimeout;y=G.wrap;G=function(){function a(b,a){this.allItems=[];this.contentGroup=this.box=void 0;this.display=!1;this.group=void 0;this.offsetWidth=this.maxLegendWidth=this.maxItemWidth=
    this.legendWidth=this.legendHeight=this.lastLineHeight=this.lastItemY=this.itemY=this.itemX=this.itemMarginTop=this.itemMarginBottom=this.itemHeight=this.initialItemY=0;this.options={};this.padding=0;this.pages=[];this.proximate=!1;this.scrollGroup=void 0;this.widthOption=this.totalItemWidth=this.titleHeight=this.symbolWidth=this.symbolHeight=0;this.chart=b;this.init(b,a);}a.prototype.init=function(b,a){this.chart=b;this.setOptions(a);a.enabled&&(this.render(),e(this.chart,"endResize",function(){this.legend.positionCheckboxes();}),
    this.proximate?this.unchartrender=e(this.chart,"render",function(){this.legend.proximatePositions();this.legend.positionItems();}):this.unchartrender&&this.unchartrender());};a.prototype.setOptions=function(b){var a=C(b.padding,8);this.options=b;this.chart.styledMode||(this.itemStyle=b.itemStyle,this.itemHiddenStyle=J(this.itemStyle,b.itemHiddenStyle));this.itemMarginTop=b.itemMarginTop||0;this.itemMarginBottom=b.itemMarginBottom||0;this.padding=a;this.initialItemY=a-5;this.symbolWidth=C(b.symbolWidth,
    16);this.pages=[];this.proximate="proximate"===b.layout&&!this.chart.inverted;this.baseline=void 0;};a.prototype.update=function(b,a){var c=this.chart;this.setOptions(J(!0,this.options,b));this.destroy();c.isDirtyLegend=c.isDirtyBox=!0;C(a,!0)&&c.redraw();B(this,"afterUpdate");};a.prototype.colorizeItem=function(b,a){b.legendGroup[a?"removeClass":"addClass"]("highcharts-legend-item-hidden");if(!this.chart.styledMode){var c=this.options,d=b.legendItem,e=b.legendLine,g=b.legendSymbol,f=this.itemHiddenStyle.color;
    c=a?c.itemStyle.color:f;var m=a?b.color||f:f,h=b.options&&b.options.marker,l={fill:m};d&&d.css({fill:c,color:c});e&&e.attr({stroke:m});g&&(h&&g.isMarker&&(l=b.pointAttribs(),a||(l.stroke=l.fill=f)),g.attr(l));}B(this,"afterColorizeItem",{item:b,visible:a});};a.prototype.positionItems=function(){this.allItems.forEach(this.positionItem,this);this.chart.isResizing||this.positionCheckboxes();};a.prototype.positionItem=function(b){var a=this,c=this.options,d=c.symbolPadding,e=!c.rtl,g=b._legendItemPos;c=
    g[0];g=g[1];var h=b.checkbox,l=b.legendGroup;l&&l.element&&(d={translateX:e?c:this.legendWidth-c-2*d-4,translateY:g},e=function(){B(a,"afterPositionItem",{item:b});},f(l.translateY)?l.animate(d,void 0,e):(l.attr(d),e()));h&&(h.x=c,h.y=g);};a.prototype.destroyItem=function(b){var a=b.checkbox;["legendItem","legendLine","legendSymbol","legendGroup"].forEach(function(a){b[a]&&(b[a]=b[a].destroy());});a&&w(b.checkbox);};a.prototype.destroy=function(){function b(b){this[b]&&(this[b]=this[b].destroy());}this.getAllItems().forEach(function(a){["legendItem",
    "legendGroup"].forEach(b,a);});"clipRect up down pager nav box title group".split(" ").forEach(b,this);this.display=null;};a.prototype.positionCheckboxes=function(){var b=this.group&&this.group.alignAttr,a=this.clipHeight||this.legendHeight,c=this.titleHeight;if(b){var e=b.translateY;this.allItems.forEach(function(d){var g=d.checkbox;if(g){var f=e+c+g.y+(this.scrollOffset||0)+3;h(g,{left:b.translateX+d.checkboxOffset+g.x-20+"px",top:f+"px",display:this.proximate||f>e-6&&f<e+a-6?"":"none"});}},this);}};
    a.prototype.renderTitle=function(){var b=this.options,a=this.padding,c=b.title,e=0;c.text&&(this.title||(this.title=this.chart.renderer.label(c.text,a-3,a-4,null,null,null,b.useHTML,null,"legend-title").attr({zIndex:1}),this.chart.styledMode||this.title.css(c.style),this.title.add(this.group)),c.width||this.title.css({width:this.maxLegendWidth+"px"}),b=this.title.getBBox(),e=b.height,this.offsetWidth=b.width,this.contentGroup.attr({translateY:e}));this.titleHeight=e;};a.prototype.setText=function(b){var a=
    this.options;b.legendItem.attr({text:a.labelFormat?q(a.labelFormat,b,this.chart):a.labelFormatter.call(b)});};a.prototype.renderItem=function(b){var a=this.chart,c=a.renderer,d=this.options,e=this.symbolWidth,g=d.symbolPadding||0,f=this.itemStyle,h=this.itemHiddenStyle,l="horizontal"===d.layout?C(d.itemDistance,20):0,k=!d.rtl,p=!b.series,n=!p&&b.series.drawLegendSymbol?b.series:b,r=n.options,t=this.createCheckboxForItem&&r&&r.showCheckbox,q=d.useHTML,w=b.options.className,E=b.legendItem;r=e+g+l+(t?
    20:0);E||(b.legendGroup=c.g("legend-item").addClass("highcharts-"+n.type+"-series highcharts-color-"+b.colorIndex+(w?" "+w:"")+(p?" highcharts-series-"+b.index:"")).attr({zIndex:1}).add(this.scrollGroup),b.legendItem=E=c.text("",k?e+g:-g,this.baseline||0,q),a.styledMode||E.css(J(b.visible?f:h)),E.attr({align:k?"left":"right",zIndex:2}).add(b.legendGroup),this.baseline||(this.fontMetrics=c.fontMetrics(a.styledMode?12:f.fontSize,E),this.baseline=this.fontMetrics.f+3+this.itemMarginTop,E.attr("y",this.baseline),
    this.symbolHeight=d.symbolHeight||this.fontMetrics.f,d.squareSymbol&&(this.symbolWidth=C(d.symbolWidth,Math.max(this.symbolHeight,16)),r=this.symbolWidth+g+l+(t?20:0),k&&E.attr("x",this.symbolWidth+g))),n.drawLegendSymbol(this,b),this.setItemEvents&&this.setItemEvents(b,E,q));t&&!b.checkbox&&this.createCheckboxForItem&&this.createCheckboxForItem(b);this.colorizeItem(b,b.visible);!a.styledMode&&f.width||E.css({width:(d.itemWidth||this.widthOption||a.spacingBox.width)-r+"px"});this.setText(b);a=E.getBBox();
    c=this.fontMetrics&&this.fontMetrics.h||0;b.itemWidth=b.checkboxOffset=d.itemWidth||b.legendItemWidth||a.width+r;this.maxItemWidth=Math.max(this.maxItemWidth,b.itemWidth);this.totalItemWidth+=b.itemWidth;this.itemHeight=b.itemHeight=Math.round(b.legendItemHeight||(a.height>1.5*c?a.height:c));};a.prototype.layoutItem=function(b){var a=this.options,c=this.padding,d="horizontal"===a.layout,e=b.itemHeight,g=this.itemMarginBottom,f=this.itemMarginTop,h=d?C(a.itemDistance,20):0,l=this.maxLegendWidth;a=a.alignColumns&&
    this.totalItemWidth>l?this.maxItemWidth:b.itemWidth;d&&this.itemX-c+a>l&&(this.itemX=c,this.lastLineHeight&&(this.itemY+=f+this.lastLineHeight+g),this.lastLineHeight=0);this.lastItemY=f+this.itemY+g;this.lastLineHeight=Math.max(e,this.lastLineHeight);b._legendItemPos=[this.itemX,this.itemY];d?this.itemX+=a:(this.itemY+=f+e+g,this.lastLineHeight=e);this.offsetWidth=this.widthOption||Math.max((d?this.itemX-c-(b.checkbox?0:h):a)+c,this.offsetWidth);};a.prototype.getAllItems=function(){var b=[];this.chart.series.forEach(function(a){var c=
    a&&a.options;a&&C(c.showInLegend,f(c.linkedTo)?!1:void 0,!0)&&(b=b.concat(a.legendItems||("point"===c.legendType?a.data:a)));});B(this,"afterGetAllItems",{allItems:b});return b};a.prototype.getAlignment=function(){var b=this.options;return this.proximate?b.align.charAt(0)+"tv":b.floating?"":b.align.charAt(0)+b.verticalAlign.charAt(0)+b.layout.charAt(0)};a.prototype.adjustMargins=function(b,a){var c=this.chart,d=this.options,e=this.getAlignment();e&&[/(lth|ct|rth)/,/(rtv|rm|rbv)/,/(rbh|cb|lbh)/,/(lbv|lm|ltv)/].forEach(function(g,
    h){g.test(e)&&!f(b[h])&&(c[n[h]]=Math.max(c[n[h]],c.legend[(h+1)%2?"legendHeight":"legendWidth"]+[1,-1,-1,1][h]*d[h%2?"x":"y"]+C(d.margin,12)+a[h]+(c.titleOffset[h]||0)));});};a.prototype.proximatePositions=function(){var b=this.chart,a=[],c="left"===this.options.align;this.allItems.forEach(function(d){var e;var g=c;if(d.yAxis){d.xAxis.options.reversed&&(g=!g);d.points&&(e=p(g?d.points:d.points.slice(0).reverse(),function(b){return t(b.plotY)}));g=this.itemMarginTop+d.legendItem.getBBox().height+this.itemMarginBottom;
    var f=d.yAxis.top-b.plotTop;d.visible?(e=e?e.plotY:d.yAxis.height,e+=f-.3*g):e=f+d.yAxis.height;a.push({target:e,size:g,item:d});}},this);k(a,b.plotHeight).forEach(function(a){a.item._legendItemPos&&(a.item._legendItemPos[1]=b.plotTop-b.spacing[0]+a.pos);});};a.prototype.render=function(){var b=this.chart,a=b.renderer,c=this.options,e=this.padding,g=this.getAllItems(),f=this.group,h=this.box;this.itemX=e;this.itemY=this.initialItemY;this.lastItemY=this.offsetWidth=0;this.widthOption=r(c.width,b.spacingBox.width-
    e);var k=b.spacingBox.width-2*e-c.x;-1<["rm","lm"].indexOf(this.getAlignment().substring(0,2))&&(k/=2);this.maxLegendWidth=this.widthOption||k;f||(this.group=f=a.g("legend").addClass(c.className||"").attr({zIndex:7}).add(),this.contentGroup=a.g().attr({zIndex:1}).add(f),this.scrollGroup=a.g().add(this.contentGroup));this.renderTitle();l(g,function(b,a){return (b.options&&b.options.legendIndex||0)-(a.options&&a.options.legendIndex||0)});c.reversed&&g.reverse();this.allItems=g;this.display=k=!!g.length;
    this.itemHeight=this.totalItemWidth=this.maxItemWidth=this.lastLineHeight=0;g.forEach(this.renderItem,this);g.forEach(this.layoutItem,this);g=(this.widthOption||this.offsetWidth)+e;var p=this.lastItemY+this.lastLineHeight+this.titleHeight;p=this.handleOverflow(p);p+=e;h||(this.box=h=a.rect().addClass("highcharts-legend-box").attr({r:c.borderRadius}).add(f),h.isNew=!0);b.styledMode||h.attr({stroke:c.borderColor,"stroke-width":c.borderWidth||0,fill:c.backgroundColor||"none"}).shadow(c.shadow);0<g&&
    0<p&&(h[h.isNew?"attr":"animate"](h.crisp.call({},{x:0,y:0,width:g,height:p},h.strokeWidth())),h.isNew=!1);h[k?"show":"hide"]();b.styledMode&&"none"===f.getStyle("display")&&(g=p=0);this.legendWidth=g;this.legendHeight=p;k&&this.align();this.proximate||this.positionItems();B(this,"afterRender");};a.prototype.align=function(b){void 0===b&&(b=this.chart.spacingBox);var a=this.chart,c=this.options,d=b.y;/(lth|ct|rth)/.test(this.getAlignment())&&0<a.titleOffset[0]?d+=a.titleOffset[0]:/(lbh|cb|rbh)/.test(this.getAlignment())&&
    0<a.titleOffset[2]&&(d-=a.titleOffset[2]);d!==b.y&&(b=J(b,{y:d}));this.group.align(J(c,{width:this.legendWidth,height:this.legendHeight,verticalAlign:this.proximate?"top":c.verticalAlign}),!0,b);};a.prototype.handleOverflow=function(b){var a=this,c=this.chart,d=c.renderer,e=this.options,g=e.y,f="top"===e.verticalAlign,h=this.padding,l=e.maxHeight,k=e.navigation,p=C(k.animation,!0),n=k.arrowSize||12,r=this.pages,t=this.allItems,q=function(b){"number"===typeof b?v.attr({height:b}):v&&(a.clipRect=v.destroy(),
    a.contentGroup.clip());a.contentGroup.div&&(a.contentGroup.div.style.clip=b?"rect("+h+"px,9999px,"+(h+b)+"px,0)":"auto");},w=function(b){a[b]=d.circle(0,0,1.3*n).translate(n/2,n/2).add(N);c.styledMode||a[b].attr("fill","rgba(0,0,0,0.0001)");return a[b]},E,B;g=c.spacingBox.height+(f?-g:g)-h;var N=this.nav,v=this.clipRect;"horizontal"!==e.layout||"middle"===e.verticalAlign||e.floating||(g/=2);l&&(g=Math.min(g,l));r.length=0;b&&0<g&&b>g&&!1!==k.enabled?(this.clipHeight=E=Math.max(g-20-this.titleHeight-
    h,0),this.currentPage=C(this.currentPage,1),this.fullHeight=b,t.forEach(function(b,a){var c=b._legendItemPos[1],d=Math.round(b.legendItem.getBBox().height),e=r.length;if(!e||c-r[e-1]>E&&(B||c)!==r[e-1])r.push(B||c),e++;b.pageIx=e-1;B&&(t[a-1].pageIx=e-1);a===t.length-1&&c+d-r[e-1]>E&&d<=E&&(r.push(c),b.pageIx=e);c!==B&&(B=c);}),v||(v=a.clipRect=d.clipRect(0,h,9999,0),a.contentGroup.clip(v)),q(E),N||(this.nav=N=d.g().attr({zIndex:1}).add(this.group),this.up=d.symbol("triangle",0,0,n,n).add(N),w("upTracker").on("click",
    function(){a.scroll(-1,p);}),this.pager=d.text("",15,10).addClass("highcharts-legend-navigation"),c.styledMode||this.pager.css(k.style),this.pager.add(N),this.down=d.symbol("triangle-down",0,0,n,n).add(N),w("downTracker").on("click",function(){a.scroll(1,p);})),a.scroll(0),b=g):N&&(q(),this.nav=N.destroy(),this.scrollGroup.attr({translateY:1}),this.clipHeight=0);return b};a.prototype.scroll=function(a,c){var d=this,e=this.chart,g=this.pages,f=g.length,h=this.clipHeight,l=this.options.navigation,m=this.pager,
    k=this.padding,p=this.currentPage+a;p>f&&(p=f);0<p&&("undefined"!==typeof c&&A(c,e),this.nav.attr({translateX:k,translateY:h+this.padding+7+this.titleHeight,visibility:"visible"}),[this.up,this.upTracker].forEach(function(b){b.attr({"class":1===p?"highcharts-legend-nav-inactive":"highcharts-legend-nav-active"});}),m.attr({text:p+"/"+f}),[this.down,this.downTracker].forEach(function(b){b.attr({x:18+this.pager.getBBox().width,"class":p===f?"highcharts-legend-nav-inactive":"highcharts-legend-nav-active"});},
    this),e.styledMode||(this.up.attr({fill:1===p?l.inactiveColor:l.activeColor}),this.upTracker.css({cursor:1===p?"default":"pointer"}),this.down.attr({fill:p===f?l.inactiveColor:l.activeColor}),this.downTracker.css({cursor:p===f?"default":"pointer"})),this.scrollOffset=-g[p-1]+this.initialItemY,this.scrollGroup.animate({translateY:this.scrollOffset}),this.currentPage=p,this.positionCheckboxes(),a=v(C(c,e.renderer.globalAnimation,!0)),b(function(){B(d,"afterScroll",{currentPage:p});},a.duration));};a.prototype.setItemEvents=
    function(b,a,c){var d=this,e=d.chart.renderer.boxWrapper,g=b instanceof F,f="highcharts-legend-"+(g?"point":"series")+"-active",h=d.chart.styledMode,l=function(a){d.allItems.forEach(function(c){b!==c&&[c].concat(c.linkedSeries||[]).forEach(function(b){b.setState(a,!g);});});};(c?[a,b.legendSymbol]:[b.legendGroup]).forEach(function(c){if(c)c.on("mouseover",function(){b.visible&&l("inactive");b.setState("hover");b.visible&&e.addClass(f);h||a.css(d.options.itemHoverStyle);}).on("mouseout",function(){d.chart.styledMode||
    a.css(J(b.visible?d.itemStyle:d.itemHiddenStyle));l("");e.removeClass(f);b.setState();}).on("click",function(a){var c=function(){b.setVisible&&b.setVisible();l(b.visible?"inactive":"");};e.removeClass(f);a={browserEvent:a};b.firePointEvent?b.firePointEvent("legendItemClick",a,c):B(b,"legendItemClick",a,c);});});};a.prototype.createCheckboxForItem=function(b){b.checkbox=c("input",{type:"checkbox",className:"highcharts-legend-checkbox",checked:b.selected,defaultChecked:b.selected},this.options.itemCheckboxStyle,
    this.chart.container);e(b.checkbox,"click",function(a){B(b.series||b,"checkboxClick",{checked:a.target.checked,item:b},function(){b.select();});});};return a}();(/Trident\/7\.0/.test(z.navigator&&z.navigator.userAgent)||a)&&y(G.prototype,"positionItem",function(b,a){var c=this,d=function(){a._legendItemPos&&b.call(c,a);};d();c.bubbleLegend||setTimeout(d);});return G});M(a,"Core/Series/SeriesRegistry.js",[a["Core/Globals.js"],a["Core/DefaultOptions.js"],a["Core/Series/Point.js"],a["Core/Utilities.js"]],
    function(a,u,z,F){var v=u.defaultOptions,G=F.error,H=F.extendClass,A=F.merge,q;(function(n){function k(a,c){var e=v.plotOptions||{},f=c.defaultOptions;c.prototype.pointClass||(c.prototype.pointClass=z);c.prototype.type=a;f&&(e[a]=f);n.seriesTypes[a]=c;}n.seriesTypes=a.seriesTypes;n.getSeries=function(a,c){void 0===c&&(c={});var e=a.options.chart;e=c.type||e.type||e.defaultSeriesType||"";var f=n.seriesTypes[e];n||G(17,!0,a,{missingModuleFor:e});e=new f;"function"===typeof e.init&&e.init(a,c);return e};
    n.registerSeriesType=k;n.seriesType=function(a,c,h,f,q){var e=v.plotOptions||{};c=c||"";e[a]=A(e[c],h);k(a,H(n.seriesTypes[c]||function(){},f));n.seriesTypes[a].prototype.type=a;q&&(n.seriesTypes[a].prototype.pointClass=H(z,q));return n.seriesTypes[a]};})(q||(q={}));return q});M(a,"Core/Chart/Chart.js",[a["Core/Animation/AnimationUtilities.js"],a["Core/Axis/Axis.js"],a["Core/FormatUtilities.js"],a["Core/Foundation.js"],a["Core/Globals.js"],a["Core/Legend/Legend.js"],a["Core/MSPointer.js"],a["Core/DefaultOptions.js"],
    a["Core/Pointer.js"],a["Core/Renderer/RendererRegistry.js"],a["Core/Series/SeriesRegistry.js"],a["Core/Renderer/SVG/SVGRenderer.js"],a["Core/Time.js"],a["Core/Utilities.js"],a["Core/Renderer/HTML/AST.js"]],function(a,u,z,F,y,G,H,A,q,n,k,e,c,h,f){var w=a.animate,p=a.animObject,B=a.setAnimation,t=z.numberFormat,v=F.registerEventOptions,C=y.charts,r=y.doc,l=y.marginNames,b=y.svg,g=y.win,d=A.defaultOptions,m=A.defaultTime,D=k.seriesTypes,x=h.addEvent,I=h.attr,P=h.cleanRecursively,S=h.createElement,O=
    h.css,U=h.defined,Y=h.discardElement,L=h.erase,K=h.error,M=h.extend,da=h.find,Q=h.fireEvent,ea=h.getStyle,E=h.isArray,T=h.isNumber,N=h.isObject,V=h.isString,W=h.merge,X=h.objectEach,R=h.pick,fa=h.pInt,aa=h.relativeLength,ia=h.removeEvent,ha=h.splat,ba=h.syncTimeout,ka=h.uniqueKey;a=function(){function a(b,a,c){this.series=this.renderTo=this.renderer=this.pointer=this.pointCount=this.plotWidth=this.plotTop=this.plotLeft=this.plotHeight=this.plotBox=this.options=this.numberFormatter=this.margin=this.legend=
    this.labelCollectors=this.isResizing=this.index=this.eventOptions=this.container=this.colorCounter=this.clipBox=this.chartWidth=this.chartHeight=this.bounds=this.axisOffset=this.axes=void 0;this.sharedClips={};this.yAxis=this.xAxis=this.userOptions=this.titleOffset=this.time=this.symbolCounter=this.spacingBox=this.spacing=void 0;this.getArgs(b,a,c);}a.chart=function(b,c,d){return new a(b,c,d)};a.prototype.getArgs=function(b,a,c){V(b)||b.nodeName?(this.renderTo=b,this.init(a,c)):this.init(b,a);};a.prototype.init=
    function(b,a){var e=b.plotOptions||{};Q(this,"init",{args:arguments},function(){var g=W(d,b),f=g.chart;X(g.plotOptions,function(b,a){N(b)&&(b.tooltip=e[a]&&W(e[a].tooltip)||void 0);});g.tooltip.userOptions=b.chart&&b.chart.forExport&&b.tooltip.userOptions||b.tooltip;this.userOptions=b;this.margin=[];this.spacing=[];this.bounds={h:{},v:{}};this.labelCollectors=[];this.callback=a;this.isResizing=0;this.options=g;this.axes=[];this.series=[];this.time=b.time&&Object.keys(b.time).length?new c(b.time):y.time;
    this.numberFormatter=f.numberFormatter||t;this.styledMode=f.styledMode;this.hasCartesianSeries=f.showAxes;this.index=C.length;C.push(this);y.chartCount++;v(this,f);this.xAxis=[];this.yAxis=[];this.pointCount=this.colorCounter=this.symbolCounter=0;Q(this,"afterInit");this.firstRender();});};a.prototype.initSeries=function(b){var a=this.options.chart;a=b.type||a.type||a.defaultSeriesType;var c=D[a];c||K(17,!0,this,{missingModuleFor:a});a=new c;"function"===typeof a.init&&a.init(this,b);return a};a.prototype.setSeriesData=
    function(){this.getSeriesOrderByLinks().forEach(function(b){b.points||b.data||!b.enabledDataSorting||b.setData(b.options.data,!1);});};a.prototype.getSeriesOrderByLinks=function(){return this.series.concat().sort(function(b,a){return b.linkedSeries.length||a.linkedSeries.length?a.linkedSeries.length-b.linkedSeries.length:0})};a.prototype.orderSeries=function(b){var a=this.series;b=b||0;for(var c=a.length;b<c;++b)a[b]&&(a[b].index=b,a[b].name=a[b].getName());};a.prototype.isInsidePlot=function(b,a,c){void 0===
    c&&(c={});var d=this.inverted,e=this.plotBox,g=this.plotLeft,f=this.plotTop,h=this.scrollablePlotBox,l=0;var k=0;c.visiblePlotOnly&&this.scrollingContainer&&(k=this.scrollingContainer,l=k.scrollLeft,k=k.scrollTop);var m=c.series;e=c.visiblePlotOnly&&h||e;h=c.inverted?a:b;a=c.inverted?b:a;b={x:h,y:a,isInsidePlot:!0};if(!c.ignoreX){var p=m&&(d?m.yAxis:m.xAxis)||{pos:g,len:Infinity};h=c.paneCoordinates?p.pos+h:g+h;h>=Math.max(l+g,p.pos)&&h<=Math.min(l+g+e.width,p.pos+p.len)||(b.isInsidePlot=!1);}!c.ignoreY&&
    b.isInsidePlot&&(d=m&&(d?m.xAxis:m.yAxis)||{pos:f,len:Infinity},c=c.paneCoordinates?d.pos+a:f+a,c>=Math.max(k+f,d.pos)&&c<=Math.min(k+f+e.height,d.pos+d.len)||(b.isInsidePlot=!1));Q(this,"afterIsInsidePlot",b);return b.isInsidePlot};a.prototype.redraw=function(b){Q(this,"beforeRedraw");var a=this.hasCartesianSeries?this.axes:this.colorAxis||[],c=this.series,d=this.pointer,e=this.legend,g=this.userOptions.legend,f=this.renderer,h=f.isHidden(),l=[],k=this.isDirtyBox,m=this.isDirtyLegend;this.setResponsive&&
    this.setResponsive(!1);B(this.hasRendered?b:!1,this);h&&this.temporaryDisplay();this.layOutTitles();for(b=c.length;b--;){var p=c[b];if(p.options.stacking||p.options.centerInCategory){var n=!0;if(p.isDirty){var E=!0;break}}}if(E)for(b=c.length;b--;)p=c[b],p.options.stacking&&(p.isDirty=!0);c.forEach(function(b){b.isDirty&&("point"===b.options.legendType?("function"===typeof b.updateTotals&&b.updateTotals(),m=!0):g&&(g.labelFormatter||g.labelFormat)&&(m=!0));b.isDirtyData&&Q(b,"updatedData");});m&&e&&
    e.options.enabled&&(e.render(),this.isDirtyLegend=!1);n&&this.getStacks();a.forEach(function(b){b.updateNames();b.setScale();});this.getMargins();a.forEach(function(b){b.isDirty&&(k=!0);});a.forEach(function(b){var a=b.min+","+b.max;b.extKey!==a&&(b.extKey=a,l.push(function(){Q(b,"afterSetExtremes",M(b.eventArgs,b.getExtremes()));delete b.eventArgs;}));(k||n)&&b.redraw();});k&&this.drawChartBox();Q(this,"predraw");c.forEach(function(b){(k||b.isDirty)&&b.visible&&b.redraw();b.isDirtyData=!1;});d&&d.reset(!0);
    f.draw();Q(this,"redraw");Q(this,"render");h&&this.temporaryDisplay(!0);l.forEach(function(b){b.call();});};a.prototype.get=function(b){function a(a){return a.id===b||a.options&&a.options.id===b}for(var c=this.series,d=da(this.axes,a)||da(this.series,a),e=0;!d&&e<c.length;e++)d=da(c[e].points||[],a);return d};a.prototype.getAxes=function(){var b=this,a=this.options,c=a.xAxis=ha(a.xAxis||{});a=a.yAxis=ha(a.yAxis||{});Q(this,"getAxes");c.forEach(function(b,a){b.index=a;b.isX=!0;});a.forEach(function(b,
    a){b.index=a;});c.concat(a).forEach(function(a){new u(b,a);});Q(this,"afterGetAxes");};a.prototype.getSelectedPoints=function(){return this.series.reduce(function(b,a){a.getPointsCollection().forEach(function(a){R(a.selectedStaging,a.selected)&&b.push(a);});return b},[])};a.prototype.getSelectedSeries=function(){return this.series.filter(function(b){return b.selected})};a.prototype.setTitle=function(b,a,c){this.applyDescription("title",b);this.applyDescription("subtitle",a);this.applyDescription("caption",
    void 0);this.layOutTitles(c);};a.prototype.applyDescription=function(b,a){var c=this,d="title"===b?{color:"#333333",fontSize:this.options.isStock?"16px":"18px"}:{color:"#666666"};d=this.options[b]=W(!this.styledMode&&{style:d},this.options[b],a);var e=this[b];e&&a&&(this[b]=e=e.destroy());d&&!e&&(e=this.renderer.text(d.text,0,0,d.useHTML).attr({align:d.align,"class":"highcharts-"+b,zIndex:d.zIndex||4}).add(),e.update=function(a){c[{title:"setTitle",subtitle:"setSubtitle",caption:"setCaption"}[b]](a);},
    this.styledMode||e.css(d.style),this[b]=e);};a.prototype.layOutTitles=function(b){var a=[0,0,0],c=this.renderer,d=this.spacingBox;["title","subtitle","caption"].forEach(function(b){var e=this[b],g=this.options[b],f=g.verticalAlign||"top";b="title"===b?"top"===f?-3:0:"top"===f?a[0]+2:0;var h;if(e){this.styledMode||(h=g.style&&g.style.fontSize);h=c.fontMetrics(h,e).b;e.css({width:(g.width||d.width+(g.widthAdjust||0))+"px"});var l=Math.round(e.getBBox(g.useHTML).height);e.align(M({y:"bottom"===f?h:b+
    h,height:l},g),!1,"spacingBox");g.floating||("top"===f?a[0]=Math.ceil(a[0]+l):"bottom"===f&&(a[2]=Math.ceil(a[2]+l)));}},this);a[0]&&"top"===(this.options.title.verticalAlign||"top")&&(a[0]+=this.options.title.margin);a[2]&&"bottom"===this.options.caption.verticalAlign&&(a[2]+=this.options.caption.margin);var e=!this.titleOffset||this.titleOffset.join(",")!==a.join(",");this.titleOffset=a;Q(this,"afterLayOutTitles");!this.isDirtyBox&&e&&(this.isDirtyBox=this.isDirtyLegend=e,this.hasRendered&&R(b,!0)&&
    this.isDirtyBox&&this.redraw());};a.prototype.getChartSize=function(){var b=this.options.chart,a=b.width;b=b.height;var c=this.renderTo;U(a)||(this.containerWidth=ea(c,"width"));U(b)||(this.containerHeight=ea(c,"height"));this.chartWidth=Math.max(0,a||this.containerWidth||600);this.chartHeight=Math.max(0,aa(b,this.chartWidth)||(1<this.containerHeight?this.containerHeight:400));};a.prototype.temporaryDisplay=function(b){var a=this.renderTo;if(b)for(;a&&a.style;)a.hcOrigStyle&&(O(a,a.hcOrigStyle),delete a.hcOrigStyle),
    a.hcOrigDetached&&(r.body.removeChild(a),a.hcOrigDetached=!1),a=a.parentNode;else for(;a&&a.style;){r.body.contains(a)||a.parentNode||(a.hcOrigDetached=!0,r.body.appendChild(a));if("none"===ea(a,"display",!1)||a.hcOricDetached)a.hcOrigStyle={display:a.style.display,height:a.style.height,overflow:a.style.overflow},b={display:"block",overflow:"hidden"},a!==this.renderTo&&(b.height=0),O(a,b),a.offsetWidth||a.style.setProperty("display","block","important");a=a.parentNode;if(a===r.body)break}};a.prototype.setClassName=
    function(b){this.container.className="highcharts-container "+(b||"");};a.prototype.getContainer=function(){var a=this.options,c=a.chart,d=ka(),g,h=this.renderTo;h||(this.renderTo=h=c.renderTo);V(h)&&(this.renderTo=h=r.getElementById(h));h||K(13,!0,this);var l=fa(I(h,"data-highcharts-chart"));T(l)&&C[l]&&C[l].hasRendered&&C[l].destroy();I(h,"data-highcharts-chart",this.index);h.innerHTML=f.emptyHTML;c.skipClone||h.offsetWidth||this.temporaryDisplay();this.getChartSize();l=this.chartWidth;var k=this.chartHeight;
    O(h,{overflow:"hidden"});this.styledMode||(g=M({position:"relative",overflow:"hidden",width:l+"px",height:k+"px",textAlign:"left",lineHeight:"normal",zIndex:0,"-webkit-tap-highlight-color":"rgba(0,0,0,0)",userSelect:"none","touch-action":"manipulation",outline:"none"},c.style||{}));this.container=d=S("div",{id:d},g,h);this._cursor=d.style.cursor;this.renderer=new (c.renderer||!b?n.getRendererType(c.renderer):e)(d,l,k,void 0,c.forExport,a.exporting&&a.exporting.allowHTML,this.styledMode);B(void 0,
    this);this.setClassName(c.className);if(this.styledMode)for(var m in a.defs)this.renderer.definition(a.defs[m]);else this.renderer.setStyle(c.style);this.renderer.chartIndex=this.index;Q(this,"afterGetContainer");};a.prototype.getMargins=function(b){var a=this.spacing,c=this.margin,d=this.titleOffset;this.resetMargins();d[0]&&!U(c[0])&&(this.plotTop=Math.max(this.plotTop,d[0]+a[0]));d[2]&&!U(c[2])&&(this.marginBottom=Math.max(this.marginBottom,d[2]+a[2]));this.legend&&this.legend.display&&this.legend.adjustMargins(c,
    a);Q(this,"getMargins");b||this.getAxisMargins();};a.prototype.getAxisMargins=function(){var b=this,a=b.axisOffset=[0,0,0,0],c=b.colorAxis,d=b.margin,e=function(b){b.forEach(function(b){b.visible&&b.getOffset();});};b.hasCartesianSeries?e(b.axes):c&&c.length&&e(c);l.forEach(function(c,e){U(d[e])||(b[c]+=a[e]);});b.setChartSize();};a.prototype.reflow=function(b){var a=this,c=a.options.chart,d=a.renderTo,e=U(c.width)&&U(c.height),f=c.width||ea(d,"width");c=c.height||ea(d,"height");d=b?b.target:g;delete a.pointer.chartPosition;
    if(!e&&!a.isPrinting&&f&&c&&(d===g||d===r)){if(f!==a.containerWidth||c!==a.containerHeight)h.clearTimeout(a.reflowTimeout),a.reflowTimeout=ba(function(){a.container&&a.setSize(void 0,void 0,!1);},b?100:0);a.containerWidth=f;a.containerHeight=c;}};a.prototype.setReflow=function(b){var a=this;!1===b||this.unbindReflow?!1===b&&this.unbindReflow&&(this.unbindReflow=this.unbindReflow()):(this.unbindReflow=x(g,"resize",function(b){a.options&&a.reflow(b);}),x(this,"destroy",this.unbindReflow));};a.prototype.setSize=
    function(b,a,c){var d=this,e=d.renderer;d.isResizing+=1;B(c,d);c=e.globalAnimation;d.oldChartHeight=d.chartHeight;d.oldChartWidth=d.chartWidth;"undefined"!==typeof b&&(d.options.chart.width=b);"undefined"!==typeof a&&(d.options.chart.height=a);d.getChartSize();d.styledMode||(c?w:O)(d.container,{width:d.chartWidth+"px",height:d.chartHeight+"px"},c);d.setChartSize(!0);e.setSize(d.chartWidth,d.chartHeight,c);d.axes.forEach(function(b){b.isDirty=!0;b.setScale();});d.isDirtyLegend=!0;d.isDirtyBox=!0;d.layOutTitles();
    d.getMargins();d.redraw(c);d.oldChartHeight=null;Q(d,"resize");ba(function(){d&&Q(d,"endResize",null,function(){--d.isResizing;});},p(c).duration);};a.prototype.setChartSize=function(b){var a=this.inverted,c=this.renderer,d=this.chartWidth,e=this.chartHeight,g=this.options.chart,f=this.spacing,h=this.clipOffset,l,k,m,p;this.plotLeft=l=Math.round(this.plotLeft);this.plotTop=k=Math.round(this.plotTop);this.plotWidth=m=Math.max(0,Math.round(d-l-this.marginRight));this.plotHeight=p=Math.max(0,Math.round(e-
    k-this.marginBottom));this.plotSizeX=a?p:m;this.plotSizeY=a?m:p;this.plotBorderWidth=g.plotBorderWidth||0;this.spacingBox=c.spacingBox={x:f[3],y:f[0],width:d-f[3]-f[1],height:e-f[0]-f[2]};this.plotBox=c.plotBox={x:l,y:k,width:m,height:p};a=2*Math.floor(this.plotBorderWidth/2);d=Math.ceil(Math.max(a,h[3])/2);e=Math.ceil(Math.max(a,h[0])/2);this.clipBox={x:d,y:e,width:Math.floor(this.plotSizeX-Math.max(a,h[1])/2-d),height:Math.max(0,Math.floor(this.plotSizeY-Math.max(a,h[2])/2-e))};b||(this.axes.forEach(function(b){b.setAxisSize();
    b.setAxisTranslation();}),c.alignElements());Q(this,"afterSetChartSize",{skipAxes:b});};a.prototype.resetMargins=function(){Q(this,"resetMargins");var b=this,a=b.options.chart;["margin","spacing"].forEach(function(c){var d=a[c],e=N(d)?d:[d,d,d,d];["Top","Right","Bottom","Left"].forEach(function(d,g){b[c][g]=R(a[c+d],e[g]);});});l.forEach(function(a,c){b[a]=R(b.margin[c],b.spacing[c]);});b.axisOffset=[0,0,0,0];b.clipOffset=[0,0,0,0];};a.prototype.drawChartBox=function(){var b=this.options.chart,a=this.renderer,
    c=this.chartWidth,d=this.chartHeight,e=this.styledMode,g=this.plotBGImage,f=b.backgroundColor,h=b.plotBackgroundColor,l=b.plotBackgroundImage,k=this.plotLeft,m=this.plotTop,p=this.plotWidth,n=this.plotHeight,E=this.plotBox,r=this.clipRect,t=this.clipBox,q=this.chartBackground,N=this.plotBackground,w=this.plotBorder,B,C="animate";q||(this.chartBackground=q=a.rect().addClass("highcharts-background").add(),C="attr");if(e)var x=B=q.strokeWidth();else {x=b.borderWidth||0;B=x+(b.shadow?8:0);f={fill:f||"none"};
    if(x||q["stroke-width"])f.stroke=b.borderColor,f["stroke-width"]=x;q.attr(f).shadow(b.shadow);}q[C]({x:B/2,y:B/2,width:c-B-x%2,height:d-B-x%2,r:b.borderRadius});C="animate";N||(C="attr",this.plotBackground=N=a.rect().addClass("highcharts-plot-background").add());N[C](E);e||(N.attr({fill:h||"none"}).shadow(b.plotShadow),l&&(g?(l!==g.attr("href")&&g.attr("href",l),g.animate(E)):this.plotBGImage=a.image(l,k,m,p,n).add()));r?r.animate({width:t.width,height:t.height}):this.clipRect=a.clipRect(t);C="animate";
    w||(C="attr",this.plotBorder=w=a.rect().addClass("highcharts-plot-border").attr({zIndex:1}).add());e||w.attr({stroke:b.plotBorderColor,"stroke-width":b.plotBorderWidth||0,fill:"none"});w[C](w.crisp({x:k,y:m,width:p,height:n},-w.strokeWidth()));this.isDirtyBox=!1;Q(this,"afterDrawChartBox");};a.prototype.propFromSeries=function(){var b=this,a=b.options.chart,c=b.options.series,d,e,g;["inverted","angular","polar"].forEach(function(f){e=D[a.type||a.defaultSeriesType];g=a[f]||e&&e.prototype[f];for(d=c&&
    c.length;!g&&d--;)(e=D[c[d].type])&&e.prototype[f]&&(g=!0);b[f]=g;});};a.prototype.linkSeries=function(){var b=this,a=b.series;a.forEach(function(b){b.linkedSeries.length=0;});a.forEach(function(a){var c=a.options.linkedTo;V(c)&&(c=":previous"===c?b.series[a.index-1]:b.get(c))&&c.linkedParent!==a&&(c.linkedSeries.push(a),a.linkedParent=c,c.enabledDataSorting&&a.setDataSortingOptions(),a.visible=R(a.options.visible,c.options.visible,a.visible));});Q(this,"afterLinkSeries");};a.prototype.renderSeries=function(){this.series.forEach(function(b){b.translate();
    b.render();});};a.prototype.renderLabels=function(){var b=this,a=b.options.labels;a.items&&a.items.forEach(function(c){var d=M(a.style,c.style),e=fa(d.left)+b.plotLeft,g=fa(d.top)+b.plotTop+12;delete d.left;delete d.top;b.renderer.text(c.html,e,g).attr({zIndex:2}).css(d).add();});};a.prototype.render=function(){var b=this.axes,a=this.colorAxis,c=this.renderer,d=this.options,e=function(b){b.forEach(function(b){b.visible&&b.render();});},g=0;this.setTitle();this.legend=new G(this,d.legend);this.getStacks&&
    this.getStacks();this.getMargins(!0);this.setChartSize();d=this.plotWidth;b.some(function(b){if(b.horiz&&b.visible&&b.options.labels.enabled&&b.series.length)return g=21,!0});var f=this.plotHeight=Math.max(this.plotHeight-g,0);b.forEach(function(b){b.setScale();});this.getAxisMargins();var h=1.1<d/this.plotWidth,l=1.05<f/this.plotHeight;if(h||l)b.forEach(function(b){(b.horiz&&h||!b.horiz&&l)&&b.setTickInterval(!0);}),this.getMargins();this.drawChartBox();this.hasCartesianSeries?e(b):a&&a.length&&e(a);
    this.seriesGroup||(this.seriesGroup=c.g("series-group").attr({zIndex:3}).add());this.renderSeries();this.renderLabels();this.addCredits();this.setResponsive&&this.setResponsive();this.hasRendered=!0;};a.prototype.addCredits=function(b){var a=this,c=W(!0,this.options.credits,b);c.enabled&&!this.credits&&(this.credits=this.renderer.text(c.text+(this.mapCredits||""),0,0).addClass("highcharts-credits").on("click",function(){c.href&&(g.location.href=c.href);}).attr({align:c.position.align,zIndex:8}),a.styledMode||
    this.credits.css(c.style),this.credits.add().align(c.position),this.credits.update=function(b){a.credits=a.credits.destroy();a.addCredits(b);});};a.prototype.destroy=function(){var b=this,a=b.axes,c=b.series,d=b.container,e=d&&d.parentNode,g;Q(b,"destroy");b.renderer.forExport?L(C,b):C[b.index]=void 0;y.chartCount--;b.renderTo.removeAttribute("data-highcharts-chart");ia(b);for(g=a.length;g--;)a[g]=a[g].destroy();this.scroller&&this.scroller.destroy&&this.scroller.destroy();for(g=c.length;g--;)c[g]=
    c[g].destroy();"title subtitle chartBackground plotBackground plotBGImage plotBorder seriesGroup clipRect credits pointer rangeSelector legend resetZoomButton tooltip renderer".split(" ").forEach(function(a){var c=b[a];c&&c.destroy&&(b[a]=c.destroy());});d&&(d.innerHTML=f.emptyHTML,ia(d),e&&Y(d));X(b,function(a,c){delete b[c];});};a.prototype.firstRender=function(){var b=this,a=b.options;if(!b.isReadyToRender||b.isReadyToRender()){b.getContainer();b.resetMargins();b.setChartSize();b.propFromSeries();
    b.getAxes();(E(a.series)?a.series:[]).forEach(function(a){b.initSeries(a);});b.linkSeries();b.setSeriesData();Q(b,"beforeRender");q&&(H.isRequired()?b.pointer=new H(b,a):b.pointer=new q(b,a));b.render();b.pointer.getChartPosition();if(!b.renderer.imgCount&&!b.hasLoaded)b.onload();b.temporaryDisplay(!0);}};a.prototype.onload=function(){this.callbacks.concat([this.callback]).forEach(function(b){b&&"undefined"!==typeof this.index&&b.apply(this,[this]);},this);Q(this,"load");Q(this,"render");U(this.index)&&
    this.setReflow(this.options.chart.reflow);this.hasLoaded=!0;};a.prototype.addSeries=function(b,a,c){var d=this,e;b&&(a=R(a,!0),Q(d,"addSeries",{options:b},function(){e=d.initSeries(b);d.isDirtyLegend=!0;d.linkSeries();e.enabledDataSorting&&e.setData(b.data,!1);Q(d,"afterAddSeries",{series:e});a&&d.redraw(c);}));return e};a.prototype.addAxis=function(b,a,c,d){return this.createAxis(a?"xAxis":"yAxis",{axis:b,redraw:c,animation:d})};a.prototype.addColorAxis=function(b,a,c){return this.createAxis("colorAxis",
    {axis:b,redraw:a,animation:c})};a.prototype.createAxis=function(b,a){b=new u(this,W(a.axis,{index:this[b].length,isX:"xAxis"===b}));R(a.redraw,!0)&&this.redraw(a.animation);return b};a.prototype.showLoading=function(b){var a=this,c=a.options,d=c.loading,e=function(){g&&O(g,{left:a.plotLeft+"px",top:a.plotTop+"px",width:a.plotWidth+"px",height:a.plotHeight+"px"});},g=a.loadingDiv,h=a.loadingSpan;g||(a.loadingDiv=g=S("div",{className:"highcharts-loading highcharts-loading-hidden"},null,a.container));
    h||(a.loadingSpan=h=S("span",{className:"highcharts-loading-inner"},null,g),x(a,"redraw",e));g.className="highcharts-loading";f.setElementHTML(h,R(b,c.lang.loading,""));a.styledMode||(O(g,M(d.style,{zIndex:10})),O(h,d.labelStyle),a.loadingShown||(O(g,{opacity:0,display:""}),w(g,{opacity:d.style.opacity||.5},{duration:d.showDuration||0})));a.loadingShown=!0;e();};a.prototype.hideLoading=function(){var b=this.options,a=this.loadingDiv;a&&(a.className="highcharts-loading highcharts-loading-hidden",this.styledMode||
    w(a,{opacity:0},{duration:b.loading.hideDuration||100,complete:function(){O(a,{display:"none"});}}));this.loadingShown=!1;};a.prototype.update=function(b,a,d,e){var g=this,f={credits:"addCredits",title:"setTitle",subtitle:"setSubtitle",caption:"setCaption"},h=b.isResponsiveOptions,l=[],k,p;Q(g,"update",{options:b});h||g.setResponsive(!1,!0);b=P(b,g.options);g.userOptions=W(g.userOptions,b);var n=b.chart;if(n){W(!0,g.options.chart,n);"className"in n&&g.setClassName(n.className);"reflow"in n&&g.setReflow(n.reflow);
    if("inverted"in n||"polar"in n||"type"in n){g.propFromSeries();var E=!0;}"alignTicks"in n&&(E=!0);"events"in n&&v(this,n);X(n,function(b,a){-1!==g.propsRequireUpdateSeries.indexOf("chart."+a)&&(k=!0);-1!==g.propsRequireDirtyBox.indexOf(a)&&(g.isDirtyBox=!0);-1!==g.propsRequireReflow.indexOf(a)&&(h?g.isDirtyBox=!0:p=!0);});!g.styledMode&&n.style&&g.renderer.setStyle(g.options.chart.style||{});}!g.styledMode&&b.colors&&(this.options.colors=b.colors);b.time&&(this.time===m&&(this.time=new c(b.time)),W(!0,
    g.options.time,b.time));X(b,function(a,c){if(g[c]&&"function"===typeof g[c].update)g[c].update(a,!1);else if("function"===typeof g[f[c]])g[f[c]](a);else "colors"!==c&&-1===g.collectionsWithUpdate.indexOf(c)&&W(!0,g.options[c],b[c]);"chart"!==c&&-1!==g.propsRequireUpdateSeries.indexOf(c)&&(k=!0);});this.collectionsWithUpdate.forEach(function(a){if(b[a]){var c=[];g[a].forEach(function(b,a){b.options.isInternal||c.push(R(b.options.index,a));});ha(b[a]).forEach(function(b,e){var f=U(b.id),h;f&&(h=g.get(b.id));
    !h&&g[a]&&(h=g[a][c?c[e]:e])&&f&&U(h.options.id)&&(h=void 0);h&&h.coll===a&&(h.update(b,!1),d&&(h.touched=!0));!h&&d&&g.collectionsWithInit[a]&&(g.collectionsWithInit[a][0].apply(g,[b].concat(g.collectionsWithInit[a][1]||[]).concat([!1])).touched=!0);});d&&g[a].forEach(function(b){b.touched||b.options.isInternal?delete b.touched:l.push(b);});}});l.forEach(function(b){b.chart&&b.remove&&b.remove(!1);});E&&g.axes.forEach(function(b){b.update({},!1);});k&&g.getSeriesOrderByLinks().forEach(function(b){b.chart&&
    b.update({},!1);},this);E=n&&n.width;n=n&&(V(n.height)?aa(n.height,E||g.chartWidth):n.height);p||T(E)&&E!==g.chartWidth||T(n)&&n!==g.chartHeight?g.setSize(E,n,e):R(a,!0)&&g.redraw(e);Q(g,"afterUpdate",{options:b,redraw:a,animation:e});};a.prototype.setSubtitle=function(b,a){this.applyDescription("subtitle",b);this.layOutTitles(a);};a.prototype.setCaption=function(b,a){this.applyDescription("caption",b);this.layOutTitles(a);};a.prototype.showResetZoom=function(){function b(){a.zoomOut();}var a=this,c=d.lang,
    e=a.options.chart.resetZoomButton,g=e.theme,f=g.states,h="chart"===e.relativeTo||"spacingBox"===e.relativeTo?null:"scrollablePlotBox";Q(this,"beforeShowResetZoom",null,function(){a.resetZoomButton=a.renderer.button(c.resetZoom,null,null,b,g,f&&f.hover).attr({align:e.position.align,title:c.resetZoomTitle}).addClass("highcharts-reset-zoom").add().align(e.position,!1,h);});Q(this,"afterShowResetZoom");};a.prototype.zoomOut=function(){Q(this,"selection",{resetSelection:!0},this.zoom);};a.prototype.zoom=
    function(b){var a=this,c=a.pointer,d=a.inverted?c.mouseDownX:c.mouseDownY,e=!1,g;!b||b.resetSelection?(a.axes.forEach(function(b){g=b.zoom();}),c.initiated=!1):b.xAxis.concat(b.yAxis).forEach(function(b){var f=b.axis,h=a.inverted?f.left:f.top,l=a.inverted?h+f.width:h+f.height,k=f.isXAxis,m=!1;if(!k&&d>=h&&d<=l||k||!U(d))m=!0;c[k?"zoomX":"zoomY"]&&m&&(g=f.zoom(b.min,b.max),f.displayBtn&&(e=!0));});var f=a.resetZoomButton;e&&!f?a.showResetZoom():!e&&N(f)&&(a.resetZoomButton=f.destroy());g&&a.redraw(R(a.options.chart.animation,
    b&&b.animation,100>a.pointCount));};a.prototype.pan=function(b,a){var c=this,d=c.hoverPoints;a="object"===typeof a?a:{enabled:a,type:"x"};var e=c.options.chart,g=c.options.mapNavigation&&c.options.mapNavigation.enabled;e&&e.panning&&(e.panning=a);var f=a.type,h;Q(this,"pan",{originalEvent:b},function(){d&&d.forEach(function(b){b.setState();});var a=c.xAxis;"xy"===f?a=a.concat(c.yAxis):"y"===f&&(a=c.yAxis);var e={};a.forEach(function(a){if(a.options.panningEnabled&&!a.options.isInternal){var d=a.horiz,
    l=b[d?"chartX":"chartY"];d=d?"mouseDownX":"mouseDownY";var k=c[d],m=a.minPointOffset||0,p=a.reversed&&!c.inverted||!a.reversed&&c.inverted?-1:1,n=a.getExtremes(),E=a.toValue(k-l,!0)+m*p,r=a.toValue(k+a.len-l,!0)-(m*p||a.isXAxis&&a.pointRangePadding||0),t=r<E;p=a.hasVerticalPanning();k=t?r:E;E=t?E:r;var q=a.panningState;!p||a.isXAxis||q&&!q.isDirty||a.series.forEach(function(b){var a=b.getProcessedData(!0);a=b.getExtremes(a.yData,!0);q||(q={startMin:Number.MAX_VALUE,startMax:-Number.MAX_VALUE});T(a.dataMin)&&
    T(a.dataMax)&&(q.startMin=Math.min(R(b.options.threshold,Infinity),a.dataMin,q.startMin),q.startMax=Math.max(R(b.options.threshold,-Infinity),a.dataMax,q.startMax));});p=Math.min(R(q&&q.startMin,n.dataMin),m?n.min:a.toValue(a.toPixels(n.min)-a.minPixelPadding));r=Math.max(R(q&&q.startMax,n.dataMax),m?n.max:a.toValue(a.toPixels(n.max)+a.minPixelPadding));a.panningState=q;a.isOrdinal||(m=p-k,0<m&&(E+=m,k=p),m=E-r,0<m&&(E=r,k-=m),a.series.length&&k!==n.min&&E!==n.max&&k>=p&&E<=r&&(a.setExtremes(k,E,!1,
    !1,{trigger:"pan"}),c.resetZoomButton||g||k===p||E===r||!f.match("y")||(c.showResetZoom(),a.displayBtn=!1),h=!0),e[d]=l);}});X(e,function(b,a){c[a]=b;});h&&c.redraw(!1);O(c.container,{cursor:"move"});});};return a}();M(a.prototype,{callbacks:[],collectionsWithInit:{xAxis:[a.prototype.addAxis,[!0]],yAxis:[a.prototype.addAxis,[!1]],series:[a.prototype.addSeries]},collectionsWithUpdate:["xAxis","yAxis","series"],propsRequireDirtyBox:"backgroundColor borderColor borderWidth borderRadius plotBackgroundColor plotBackgroundImage plotBorderColor plotBorderWidth plotShadow shadow".split(" "),
    propsRequireReflow:"margin marginTop marginRight marginBottom marginLeft spacing spacingTop spacingRight spacingBottom spacingLeft".split(" "),propsRequireUpdateSeries:"chart.inverted chart.polar chart.ignoreHiddenSeries chart.type colors plotOptions time tooltip".split(" ")});return a});M(a,"Core/Legend/LegendSymbol.js",[a["Core/Utilities.js"]],function(a){var v=a.merge,z=a.pick,F;(function(a){a.drawLineMarker=function(a){var u=this.options,A=a.symbolWidth,q=a.symbolHeight,n=q/2,k=this.chart.renderer,
    e=this.legendGroup;a=a.baseline-Math.round(.3*a.fontMetrics.b);var c={},h=u.marker;this.chart.styledMode||(c={"stroke-width":u.lineWidth||0},u.dashStyle&&(c.dashstyle=u.dashStyle));this.legendLine=k.path([["M",0,a],["L",A,a]]).addClass("highcharts-graph").attr(c).add(e);h&&!1!==h.enabled&&A&&(u=Math.min(z(h.radius,n),n),0===this.symbol.indexOf("url")&&(h=v(h,{width:q,height:q}),u=0),this.legendSymbol=A=k.symbol(this.symbol,A/2-u,a-u,2*u,2*u,h).addClass("highcharts-point").add(e),A.isMarker=!0);};a.drawRectangle=
    function(a,v){var u=a.symbolHeight,q=a.options.squareSymbol;v.legendSymbol=this.chart.renderer.rect(q?(a.symbolWidth-u)/2:0,a.baseline-u+1,q?u:a.symbolWidth,u,z(a.options.symbolRadius,u/2)).addClass("highcharts-point").attr({zIndex:3}).add(v.legendGroup);};})(F||(F={}));return F});M(a,"Core/Series/SeriesDefaults.js",[],function(){return {lineWidth:2,allowPointSelect:!1,crisp:!0,showCheckbox:!1,animation:{duration:1E3},events:{},marker:{enabledThreshold:2,lineColor:"#ffffff",lineWidth:0,radius:4,states:{normal:{animation:!0},
    hover:{animation:{duration:50},enabled:!0,radiusPlus:2,lineWidthPlus:1},select:{fillColor:"#cccccc",lineColor:"#000000",lineWidth:2}}},point:{events:{}},dataLabels:{animation:{},align:"center",defer:!0,formatter:function(){var a=this.series.chart.numberFormatter;return "number"!==typeof this.y?"":a(this.y,-1)},padding:5,style:{fontSize:"11px",fontWeight:"bold",color:"contrast",textOutline:"1px contrast"},verticalAlign:"bottom",x:0,y:0},cropThreshold:300,opacity:1,pointRange:0,softThreshold:!0,states:{normal:{animation:!0},
    hover:{animation:{duration:50},lineWidthPlus:1,marker:{},halo:{size:10,opacity:.25}},select:{animation:{duration:0}},inactive:{animation:{duration:50},opacity:.2}},stickyTracking:!0,turboThreshold:1E3,findNearestPointBy:"x"}});M(a,"Core/Series/Series.js",[a["Core/Animation/AnimationUtilities.js"],a["Core/DefaultOptions.js"],a["Core/Foundation.js"],a["Core/Globals.js"],a["Core/Legend/LegendSymbol.js"],a["Core/Series/Point.js"],a["Core/Series/SeriesDefaults.js"],a["Core/Series/SeriesRegistry.js"],a["Core/Renderer/SVG/SVGElement.js"],
    a["Core/Utilities.js"]],function(a,u,z,F,y,G,H,A,q,n){var k=a.animObject,e=a.setAnimation,c=u.defaultOptions,h=z.registerEventOptions,f=F.hasTouch,w=F.svg,p=F.win,B=A.seriesTypes,t=n.addEvent,v=n.arrayMax,C=n.arrayMin,r=n.clamp,l=n.cleanRecursively,b=n.correctFloat,g=n.defined,d=n.erase,m=n.error,D=n.extend,x=n.find,I=n.fireEvent,P=n.getNestedProperty,S=n.isArray,O=n.isNumber,U=n.isString,Y=n.merge,L=n.objectEach,K=n.pick,M=n.removeEvent,da=n.splat,Q=n.syncTimeout;a=function(){function a(){this.zones=
    this.yAxis=this.xAxis=this.userOptions=this.tooltipOptions=this.processedYData=this.processedXData=this.points=this.options=this.linkedSeries=this.index=this.eventsToUnbind=this.eventOptions=this.data=this.chart=this._i=void 0;}a.prototype.init=function(a,b){I(this,"init",{options:b});var c=this,d=a.series;this.eventsToUnbind=[];c.chart=a;c.options=c.setOptions(b);b=c.options;c.linkedSeries=[];c.bindAxes();D(c,{name:b.name,state:"",visible:!1!==b.visible,selected:!0===b.selected});h(this,b);var e=
    b.events;if(e&&e.click||b.point&&b.point.events&&b.point.events.click||b.allowPointSelect)a.runTrackerClick=!0;c.getColor();c.getSymbol();c.parallelArrays.forEach(function(a){c[a+"Data"]||(c[a+"Data"]=[]);});c.isCartesian&&(a.hasCartesianSeries=!0);var g;d.length&&(g=d[d.length-1]);c._i=K(g&&g._i,-1)+1;c.opacity=c.options.opacity;a.orderSeries(this.insert(d));b.dataSorting&&b.dataSorting.enabled?c.setDataSortingOptions():c.points||c.data||c.setData(b.data,!1);I(this,"afterInit");};a.prototype.is=function(a){return B[a]&&
    this instanceof B[a]};a.prototype.insert=function(a){var b=this.options.index,c;if(O(b)){for(c=a.length;c--;)if(b>=K(a[c].options.index,a[c]._i)){a.splice(c+1,0,this);break}-1===c&&a.unshift(this);c+=1;}else a.push(this);return K(c,a.length-1)};a.prototype.bindAxes=function(){var a=this,b=a.options,c=a.chart,d;I(this,"bindAxes",null,function(){(a.axisTypes||[]).forEach(function(e){var g=0;c[e].forEach(function(c){d=c.options;if(b[e]===g&&!d.isInternal||"undefined"!==typeof b[e]&&b[e]===d.id||"undefined"===
    typeof b[e]&&0===d.index)a.insert(c.series),a[e]=c,c.isDirty=!0;d.isInternal||g++;});a[e]||a.optionalAxis===e||m(18,!0,c);});});I(this,"afterBindAxes");};a.prototype.updateParallelArrays=function(a,b){var c=a.series,d=arguments,e=O(b)?function(d){var e="y"===d&&c.toYData?c.toYData(a):a[d];c[d+"Data"][b]=e;}:function(a){Array.prototype[b].apply(c[a+"Data"],Array.prototype.slice.call(d,2));};c.parallelArrays.forEach(e);};a.prototype.hasData=function(){return this.visible&&"undefined"!==typeof this.dataMax&&
    "undefined"!==typeof this.dataMin||this.visible&&this.yData&&0<this.yData.length};a.prototype.autoIncrement=function(a){var b=this.options,c=b.pointIntervalUnit,d=b.relativeXValue,e=this.chart.time,g=this.xIncrement,f;g=K(g,b.pointStart,0);this.pointInterval=f=K(this.pointInterval,b.pointInterval,1);d&&O(a)&&(f*=a);c&&(b=new e.Date(g),"day"===c?e.set("Date",b,e.get("Date",b)+f):"month"===c?e.set("Month",b,e.get("Month",b)+f):"year"===c&&e.set("FullYear",b,e.get("FullYear",b)+f),f=b.getTime()-g);if(d&&
    O(a))return g+f;this.xIncrement=g+f;return g};a.prototype.setDataSortingOptions=function(){var a=this.options;D(this,{requireSorting:!1,sorted:!1,enabledDataSorting:!0,allowDG:!1});g(a.pointRange)||(a.pointRange=1);};a.prototype.setOptions=function(a){var b=this.chart,d=b.options,e=d.plotOptions,f=b.userOptions||{};a=Y(a);b=b.styledMode;var h={plotOptions:e,userOptions:a};I(this,"setOptions",h);var l=h.plotOptions[this.type],k=f.plotOptions||{};this.userOptions=h.userOptions;f=Y(l,e.series,f.plotOptions&&
    f.plotOptions[this.type],a);this.tooltipOptions=Y(c.tooltip,c.plotOptions.series&&c.plotOptions.series.tooltip,c.plotOptions[this.type].tooltip,d.tooltip.userOptions,e.series&&e.series.tooltip,e[this.type].tooltip,a.tooltip);this.stickyTracking=K(a.stickyTracking,k[this.type]&&k[this.type].stickyTracking,k.series&&k.series.stickyTracking,this.tooltipOptions.shared&&!this.noSharedTooltip?!0:f.stickyTracking);null===l.marker&&delete f.marker;this.zoneAxis=f.zoneAxis;e=this.zones=(f.zones||[]).slice();
    !f.negativeColor&&!f.negativeFillColor||f.zones||(d={value:f[this.zoneAxis+"Threshold"]||f.threshold||0,className:"highcharts-negative"},b||(d.color=f.negativeColor,d.fillColor=f.negativeFillColor),e.push(d));e.length&&g(e[e.length-1].value)&&e.push(b?{}:{color:this.color,fillColor:this.fillColor});I(this,"afterSetOptions",{options:f});return f};a.prototype.getName=function(){return K(this.options.name,"Series "+(this.index+1))};a.prototype.getCyclic=function(a,b,c){var d=this.chart,e=this.userOptions,
    f=a+"Index",h=a+"Counter",l=c?c.length:K(d.options.chart[a+"Count"],d[a+"Count"]);if(!b){var k=K(e[f],e["_"+f]);g(k)||(d.series.length||(d[h]=0),e["_"+f]=k=d[h]%l,d[h]+=1);c&&(b=c[k]);}"undefined"!==typeof k&&(this[f]=k);this[a]=b;};a.prototype.getColor=function(){this.chart.styledMode?this.getCyclic("color"):this.options.colorByPoint?this.color="#cccccc":this.getCyclic("color",this.options.color||c.plotOptions[this.type].color,this.chart.options.colors);};a.prototype.getPointsCollection=function(){return (this.hasGroupedData?
    this.points:this.data)||[]};a.prototype.getSymbol=function(){this.getCyclic("symbol",this.options.marker.symbol,this.chart.options.symbols);};a.prototype.findPointIndex=function(a,b){var c=a.id,d=a.x,e=this.points,g=this.options.dataSorting,f,h;if(c)g=this.chart.get(c),g instanceof G&&(f=g);else if(this.linkedParent||this.enabledDataSorting||this.options.relativeXValue)if(f=function(b){return !b.touched&&b.index===a.index},g&&g.matchByName?f=function(b){return !b.touched&&b.name===a.name}:this.options.relativeXValue&&
    (f=function(b){return !b.touched&&b.options.x===a.x}),f=x(e,f),!f)return;if(f){var l=f&&f.index;"undefined"!==typeof l&&(h=!0);}"undefined"===typeof l&&O(d)&&(l=this.xData.indexOf(d,b));-1!==l&&"undefined"!==typeof l&&this.cropped&&(l=l>=this.cropStart?l-this.cropStart:l);!h&&O(l)&&e[l]&&e[l].touched&&(l=void 0);return l};a.prototype.updateData=function(a,b){var c=this.options,d=c.dataSorting,e=this.points,f=[],h=this.requireSorting,l=a.length===e.length,k,m,p,n=!0;this.xIncrement=null;a.forEach(function(a,
    b){var m=g(a)&&this.pointClass.prototype.optionsToObject.call({series:this},a)||{},n=m.x;if(m.id||O(n)){if(m=this.findPointIndex(m,p),-1===m||"undefined"===typeof m?f.push(a):e[m]&&a!==c.data[m]?(e[m].update(a,!1,null,!1),e[m].touched=!0,h&&(p=m+1)):e[m]&&(e[m].touched=!0),!l||b!==m||d&&d.enabled||this.hasDerivedData)k=!0;}else f.push(a);},this);if(k)for(a=e.length;a--;)(m=e[a])&&!m.touched&&m.remove&&m.remove(!1,b);else !l||d&&d.enabled?n=!1:(a.forEach(function(a,b){a!==e[b].y&&e[b].update&&e[b].update(a,
    !1,null,!1);}),f.length=0);e.forEach(function(a){a&&(a.touched=!1);});if(!n)return !1;f.forEach(function(a){this.addPoint(a,!1,null,null,!1);},this);null===this.xIncrement&&this.xData&&this.xData.length&&(this.xIncrement=v(this.xData),this.autoIncrement());return !0};a.prototype.setData=function(a,b,c,d){var e=this,g=e.points,f=g&&g.length||0,h=e.options,l=e.chart,k=h.dataSorting,p=e.xAxis,n=h.turboThreshold,r=this.xData,E=this.yData,t=e.pointArrayMap;t=t&&t.length;var q=h.keys,w,B=0,C=1,x=null;a=a||[];
    var v=a.length;b=K(b,!0);k&&k.enabled&&(a=this.sortData(a));!1!==d&&v&&f&&!e.cropped&&!e.hasGroupedData&&e.visible&&!e.isSeriesBoosting&&(w=this.updateData(a,c));if(!w){e.xIncrement=null;e.colorCounter=0;this.parallelArrays.forEach(function(a){e[a+"Data"].length=0;});if(n&&v>n)if(x=e.getFirstValidPoint(a),O(x))for(c=0;c<v;c++)r[c]=this.autoIncrement(),E[c]=a[c];else if(S(x))if(t)if(x.length===t)for(c=0;c<v;c++)r[c]=this.autoIncrement(),E[c]=a[c];else for(c=0;c<v;c++)d=a[c],r[c]=d[0],E[c]=d.slice(1,
    t+1);else if(q&&(B=q.indexOf("x"),C=q.indexOf("y"),B=0<=B?B:0,C=0<=C?C:1),1===x.length&&(C=0),B===C)for(c=0;c<v;c++)r[c]=this.autoIncrement(),E[c]=a[c][C];else for(c=0;c<v;c++)d=a[c],r[c]=d[B],E[c]=d[C];else m(12,!1,l);else for(c=0;c<v;c++)"undefined"!==typeof a[c]&&(d={series:e},e.pointClass.prototype.applyOptions.apply(d,[a[c]]),e.updateParallelArrays(d,c));E&&U(E[0])&&m(14,!0,l);e.data=[];e.options.data=e.userOptions.data=a;for(c=f;c--;)g[c]&&g[c].destroy&&g[c].destroy();p&&(p.minRange=p.userMinRange);
    e.isDirty=l.isDirtyBox=!0;e.isDirtyData=!!g;c=!1;}"point"===h.legendType&&(this.processData(),this.generatePoints());b&&l.redraw(c);};a.prototype.sortData=function(a){var b=this,c=b.options.dataSorting.sortKey||"y",d=function(a,b){return g(b)&&a.pointClass.prototype.optionsToObject.call({series:a},b)||{}};a.forEach(function(c,e){a[e]=d(b,c);a[e].index=e;},this);a.concat().sort(function(a,b){a=P(c,a);b=P(c,b);return b<a?-1:b>a?1:0}).forEach(function(a,b){a.x=b;},this);b.linkedSeries&&b.linkedSeries.forEach(function(b){var c=
    b.options,e=c.data;c.dataSorting&&c.dataSorting.enabled||!e||(e.forEach(function(c,g){e[g]=d(b,c);a[g]&&(e[g].x=a[g].x,e[g].index=g);}),b.setData(e,!1));});return a};a.prototype.getProcessedData=function(a){var b=this.xAxis,c=this.options,d=c.cropThreshold,e=a||this.getExtremesFromAll||c.getExtremesFromAll,g=this.isCartesian;a=b&&b.val2lin;c=!(!b||!b.logarithmic);var f=0,h=this.xData,l=this.yData,k=this.requireSorting;var p=!1;var n=h.length;if(b){p=b.getExtremes();var r=p.min;var E=p.max;p=b.categories&&
    !b.names.length;}if(g&&this.sorted&&!e&&(!d||n>d||this.forceCrop))if(h[n-1]<r||h[0]>E)h=[],l=[];else if(this.yData&&(h[0]<r||h[n-1]>E)){var t=this.cropData(this.xData,this.yData,r,E);h=t.xData;l=t.yData;f=t.start;t=!0;}for(d=h.length||1;--d;)if(b=c?a(h[d])-a(h[d-1]):h[d]-h[d-1],0<b&&("undefined"===typeof q||b<q))var q=b;else 0>b&&k&&!p&&(m(15,!1,this.chart),k=!1);return {xData:h,yData:l,cropped:t,cropStart:f,closestPointRange:q}};a.prototype.processData=function(a){var b=this.xAxis;if(this.isCartesian&&
    !this.isDirty&&!b.isDirty&&!this.yAxis.isDirty&&!a)return !1;a=this.getProcessedData();this.cropped=a.cropped;this.cropStart=a.cropStart;this.processedXData=a.xData;this.processedYData=a.yData;this.closestPointRange=this.basePointRange=a.closestPointRange;I(this,"afterProcessData");};a.prototype.cropData=function(a,b,c,d,e){var g=a.length,f,h=0,l=g;e=K(e,this.cropShoulder);for(f=0;f<g;f++)if(a[f]>=c){h=Math.max(0,f-e);break}for(c=f;c<g;c++)if(a[c]>d){l=c+e;break}return {xData:a.slice(h,l),yData:b.slice(h,
    l),start:h,end:l}};a.prototype.generatePoints=function(){var a=this.options,b=a.data,c=this.processedXData,d=this.processedYData,e=this.pointClass,g=c.length,f=this.cropStart||0,h=this.hasGroupedData,l=a.keys,k=[];a=a.dataGrouping&&a.dataGrouping.groupAll?f:0;var m,p,n=this.data;if(!n&&!h){var r=[];r.length=b.length;n=this.data=r;}l&&h&&(this.options.keys=!1);for(p=0;p<g;p++){r=f+p;if(h){var t=(new e).init(this,[c[p]].concat(da(d[p])));t.dataGroup=this.groupMap[a+p];t.dataGroup.options&&(t.options=
    t.dataGroup.options,D(t,t.dataGroup.options),delete t.dataLabels);}else (t=n[r])||"undefined"===typeof b[r]||(n[r]=t=(new e).init(this,b[r],c[p]));t&&(t.index=h?a+p:r,k[p]=t);}this.options.keys=l;if(n&&(g!==(m=n.length)||h))for(p=0;p<m;p++)p!==f||h||(p+=g),n[p]&&(n[p].destroyElements(),n[p].plotX=void 0);this.data=n;this.points=k;I(this,"afterGeneratePoints");};a.prototype.getXExtremes=function(a){return {min:C(a),max:v(a)}};a.prototype.getExtremes=function(a,b){var c=this.xAxis,d=this.yAxis,e=this.processedXData||
    this.xData,g=[],f=this.requireSorting?this.cropShoulder:0;d=d?d.positiveValuesOnly:!1;var h,l=0,k=0,m=0;a=a||this.stackedYData||this.processedYData||[];var p=a.length;if(c){var n=c.getExtremes();l=n.min;k=n.max;}for(h=0;h<p;h++){var r=e[h];n=a[h];var t=(O(n)||S(n))&&(n.length||0<n||!d);r=b||this.getExtremesFromAll||this.options.getExtremesFromAll||this.cropped||!c||(e[h+f]||r)>=l&&(e[h-f]||r)<=k;if(t&&r)if(t=n.length)for(;t--;)O(n[t])&&(g[m++]=n[t]);else g[m++]=n;}a={activeYData:g,dataMin:C(g),dataMax:v(g)};
    I(this,"afterGetExtremes",{dataExtremes:a});return a};a.prototype.applyExtremes=function(){var a=this.getExtremes();this.dataMin=a.dataMin;this.dataMax=a.dataMax;return a};a.prototype.getFirstValidPoint=function(a){for(var b=a.length,c=0,d=null;null===d&&c<b;)d=a[c],c++;return d};a.prototype.translate=function(){this.processedXData||this.processData();this.generatePoints();var a=this.options,c=a.stacking,d=this.xAxis,e=d.categories,f=this.enabledDataSorting,h=this.yAxis,l=this.points,k=l.length,m=
    this.pointPlacementToXValue(),p=!!m,n=a.threshold,t=a.startFromThreshold?n:0,q=this.zoneAxis||"y",w,B,C=Number.MAX_VALUE;for(w=0;w<k;w++){var x=l[w],v=x.x,u=void 0,D=void 0,J=x.y,A=x.low,y=c&&h.stacking&&h.stacking.stacks[(this.negStacks&&J<(t?0:n)?"-":"")+this.stackKey];if(h.positiveValuesOnly&&!h.validatePositiveValue(J)||d.positiveValuesOnly&&!d.validatePositiveValue(v))x.isNull=!0;x.plotX=B=b(r(d.translate(v,0,0,0,1,m,"flags"===this.type),-1E5,1E5));if(c&&this.visible&&y&&y[v]){var z=this.getStackIndicator(z,
    v,this.index);x.isNull||(u=y[v],D=u.points[z.key]);}S(D)&&(A=D[0],J=D[1],A===t&&z.key===y[v].base&&(A=K(O(n)&&n,h.min)),h.positiveValuesOnly&&0>=A&&(A=null),x.total=x.stackTotal=u.total,x.percentage=u.total&&x.y/u.total*100,x.stackY=J,this.irregularWidths||u.setOffset(this.pointXOffset||0,this.barW||0));x.yBottom=g(A)?r(h.translate(A,0,1,0,1),-1E5,1E5):null;this.dataModify&&(J=this.dataModify.modifyValue(J,w));x.plotY=void 0;O(J)&&(u=h.translate(J,!1,!0,!1,!0),"undefined"!==typeof u&&(x.plotY=r(u,
    -1E5,1E5)));x.isInside=this.isPointInside(x);x.clientX=p?b(d.translate(v,0,0,0,1,m)):B;x.negative=x[q]<(a[q+"Threshold"]||n||0);x.category=e&&"undefined"!==typeof e[x.x]?e[x.x]:x.x;if(!x.isNull&&!1!==x.visible){"undefined"!==typeof F&&(C=Math.min(C,Math.abs(B-F)));var F=B;}x.zone=this.zones.length?x.getZone():void 0;!x.graphic&&this.group&&f&&(x.isNew=!0);}this.closestPointRangePx=C;I(this,"afterTranslate");};a.prototype.getValidPoints=function(a,b,c){var d=this.chart;return (a||this.points||[]).filter(function(a){return b&&
    !d.isInsidePlot(a.plotX,a.plotY,{inverted:d.inverted})?!1:!1!==a.visible&&(c||!a.isNull)})};a.prototype.getClipBox=function(){var a=this.chart,b=this.xAxis,c=this.yAxis,d=Y(a.clipBox);b&&b.len!==a.plotSizeX&&(d.width=b.len);c&&c.len!==a.plotSizeY&&(d.height=c.len);return d};a.prototype.getSharedClipKey=function(){return this.sharedClipKey=(this.options.xAxis||0)+","+(this.options.yAxis||0)};a.prototype.setClip=function(){var a=this.chart,b=this.group,c=this.markerGroup,d=a.sharedClips;a=a.renderer;
    var e=this.getClipBox(),g=this.getSharedClipKey(),f=d[g];f?f.animate(e):d[g]=f=a.clipRect(e);b&&b.clip(!1===this.options.clip?void 0:f);c&&c.clip();};a.prototype.animate=function(a){var b=this.chart,c=this.group,d=this.markerGroup,e=b.inverted,g=k(this.options.animation),f=[this.getSharedClipKey(),g.duration,g.easing,g.defer].join(),h=b.sharedClips[f],l=b.sharedClips[f+"m"];if(a&&c)g=this.getClipBox(),h?h.attr("height",g.height):(g.width=0,e&&(g.x=b.plotHeight),h=b.renderer.clipRect(g),b.sharedClips[f]=
    h,l=b.renderer.clipRect({x:e?(b.plotSizeX||0)+99:-99,y:e?-b.plotLeft:-b.plotTop,width:99,height:e?b.chartWidth:b.chartHeight}),b.sharedClips[f+"m"]=l),c.clip(h),d&&d.clip(l);else if(h&&!h.hasClass("highcharts-animating")){b=this.getClipBox();var m=g.step;d&&d.element.childNodes.length&&(g.step=function(a,b){m&&m.apply(b,arguments);l&&l.element&&l.attr(b.prop,"width"===b.prop?a+99:a);});h.addClass("highcharts-animating").animate(b,g);}};a.prototype.afterAnimate=function(){var a=this;this.setClip();L(this.chart.sharedClips,
    function(b,c,d){b&&!a.chart.container.querySelector('[clip-path="url(#'+b.id+')"]')&&(b.destroy(),delete d[c]);});this.finishedAnimating=!0;I(this,"afterAnimate");};a.prototype.drawPoints=function(){var a=this.points,b=this.chart,c=this.options.marker,d=this[this.specialGroup]||this.markerGroup,e=this.xAxis,g=K(c.enabled,!e||e.isRadial?!0:null,this.closestPointRangePx>=c.enabledThreshold*c.radius),f,h;if(!1!==c.enabled||this._hasPointMarkers)for(f=0;f<a.length;f++){var l=a[f];var k=(h=l.graphic)?"animate":
    "attr";var m=l.marker||{};var p=!!l.marker;if((g&&"undefined"===typeof m.enabled||m.enabled)&&!l.isNull&&!1!==l.visible){var n=K(m.symbol,this.symbol,"rect");var r=this.markerAttribs(l,l.selected&&"select");this.enabledDataSorting&&(l.startXPos=e.reversed?-(r.width||0):e.width);var t=!1!==l.isInside;h?h[t?"show":"hide"](t).animate(r):t&&(0<(r.width||0)||l.hasImage)&&(l.graphic=h=b.renderer.symbol(n,r.x,r.y,r.width,r.height,p?m:c).add(d),this.enabledDataSorting&&b.hasRendered&&(h.attr({x:l.startXPos}),
    k="animate"));h&&"animate"===k&&h[t?"show":"hide"](t).animate(r);if(h&&!b.styledMode)h[k](this.pointAttribs(l,l.selected&&"select"));h&&h.addClass(l.getClassName(),!0);}else h&&(l.graphic=h.destroy());}};a.prototype.markerAttribs=function(a,b){var c=this.options,d=c.marker,e=a.marker||{},g=e.symbol||d.symbol,f=K(e.radius,d.radius);b&&(d=d.states[b],b=e.states&&e.states[b],f=K(b&&b.radius,d&&d.radius,f+(d&&d.radiusPlus||0)));a.hasImage=g&&0===g.indexOf("url");a.hasImage&&(f=0);a={x:c.crisp?Math.floor(a.plotX-
    f):a.plotX-f,y:a.plotY-f};f&&(a.width=a.height=2*f);return a};a.prototype.pointAttribs=function(a,b){var c=this.options.marker,d=a&&a.options,e=d&&d.marker||{},g=d&&d.color,f=a&&a.color,h=a&&a.zone&&a.zone.color,l=this.color;a=K(e.lineWidth,c.lineWidth);d=1;l=g||h||f||l;g=e.fillColor||c.fillColor||l;f=e.lineColor||c.lineColor||l;b=b||"normal";c=c.states[b]||{};b=e.states&&e.states[b]||{};a=K(b.lineWidth,c.lineWidth,a+K(b.lineWidthPlus,c.lineWidthPlus,0));g=b.fillColor||c.fillColor||g;f=b.lineColor||
    c.lineColor||f;d=K(b.opacity,c.opacity,d);return {stroke:f,"stroke-width":a,fill:g,opacity:d}};a.prototype.destroy=function(a){var b=this,c=b.chart,e=/AppleWebKit\/533/.test(p.navigator.userAgent),g=b.data||[],f,h,l,k;I(b,"destroy");this.removeEvents(a);(b.axisTypes||[]).forEach(function(a){(k=b[a])&&k.series&&(d(k.series,b),k.isDirty=k.forceRedraw=!0);});b.legendItem&&b.chart.legend.destroyItem(b);for(h=g.length;h--;)(l=g[h])&&l.destroy&&l.destroy();b.clips&&b.clips.forEach(function(a){return a.destroy()});
    n.clearTimeout(b.animationTimeout);L(b,function(a,b){a instanceof q&&!a.survive&&(f=e&&"group"===b?"hide":"destroy",a[f]());});c.hoverSeries===b&&(c.hoverSeries=void 0);d(c.series,b);c.orderSeries();L(b,function(c,d){a&&"hcEvents"===d||delete b[d];});};a.prototype.applyZones=function(){var a=this,b=this.chart,c=b.renderer,d=this.zones,e=this.clips||[],g=this.graph,f=this.area,h=Math.max(b.chartWidth,b.chartHeight),l=this[(this.zoneAxis||"y")+"Axis"],k=b.inverted,m,p,n,t,q,x,w,B,C=!1;if(d.length&&(g||
    f)&&l&&"undefined"!==typeof l.min){var v=l.reversed;var u=l.horiz;g&&!this.showLine&&g.hide();f&&f.hide();var D=l.getExtremes();d.forEach(function(d,E){m=v?u?b.plotWidth:0:u?0:l.toPixels(D.min)||0;m=r(K(p,m),0,h);p=r(Math.round(l.toPixels(K(d.value,D.max),!0)||0),0,h);C&&(m=p=l.toPixels(D.max));t=Math.abs(m-p);q=Math.min(m,p);x=Math.max(m,p);l.isXAxis?(n={x:k?x:q,y:0,width:t,height:h},u||(n.x=b.plotHeight-n.x)):(n={x:0,y:k?x:q,width:h,height:t},u&&(n.y=b.plotWidth-n.y));k&&c.isVML&&(n=l.isXAxis?{x:0,
    y:v?q:x,height:n.width,width:b.chartWidth}:{x:n.y-b.plotLeft-b.spacingBox.x,y:0,width:n.height,height:b.chartHeight});e[E]?e[E].animate(n):e[E]=c.clipRect(n);w=a["zone-area-"+E];B=a["zone-graph-"+E];g&&B&&B.clip(e[E]);f&&w&&w.clip(e[E]);C=d.value>D.max;a.resetZones&&0===p&&(p=void 0);});this.clips=e;}else a.visible&&(g&&g.show(!0),f&&f.show(!0));};a.prototype.invertGroups=function(a){function b(){["group","markerGroup"].forEach(function(b){c[b]&&(d.renderer.isVML&&c[b].attr({width:c.yAxis.len,height:c.xAxis.len}),
    c[b].width=c.yAxis.len,c[b].height=c.xAxis.len,c[b].invert(c.isRadialSeries?!1:a));});}var c=this,d=c.chart;c.xAxis&&(c.eventsToUnbind.push(t(d,"resize",b)),b(),c.invertGroups=b);};a.prototype.plotGroup=function(a,b,c,d,e){var f=this[a],h=!f;c={visibility:c,zIndex:d||.1};"undefined"===typeof this.opacity||this.chart.styledMode||"inactive"===this.state||(c.opacity=this.opacity);h&&(this[a]=f=this.chart.renderer.g().add(e));f.addClass("highcharts-"+b+" highcharts-series-"+this.index+" highcharts-"+this.type+
    "-series "+(g(this.colorIndex)?"highcharts-color-"+this.colorIndex+" ":"")+(this.options.className||"")+(f.hasClass("highcharts-tracker")?" highcharts-tracker":""),!0);f.attr(c)[h?"attr":"animate"](this.getPlotBox());return f};a.prototype.getPlotBox=function(){var a=this.chart,b=this.xAxis,c=this.yAxis;a.inverted&&(b=c,c=this.xAxis);return {translateX:b?b.left:a.plotLeft,translateY:c?c.top:a.plotTop,scaleX:1,scaleY:1}};a.prototype.removeEvents=function(a){a||M(this);this.eventsToUnbind.length&&(this.eventsToUnbind.forEach(function(a){a();}),
    this.eventsToUnbind.length=0);};a.prototype.render=function(){var a=this,b=a.chart,c=a.options,d=k(c.animation),e=a.visible?"inherit":"hidden",g=c.zIndex,f=a.hasRendered,h=b.seriesGroup,l=b.inverted;b=!a.finishedAnimating&&b.renderer.isSVG?d.duration:0;I(this,"render");var m=a.plotGroup("group","series",e,g,h);a.markerGroup=a.plotGroup("markerGroup","markers",e,g,h);!1!==c.clip&&a.setClip();a.animate&&b&&a.animate(!0);m.inverted=K(a.invertible,a.isCartesian)?l:!1;a.drawGraph&&(a.drawGraph(),a.applyZones());
    a.visible&&a.drawPoints();a.drawDataLabels&&a.drawDataLabels();a.redrawPoints&&a.redrawPoints();a.drawTracker&&!1!==a.options.enableMouseTracking&&a.drawTracker();a.invertGroups(l);a.animate&&b&&a.animate();f||(b&&d.defer&&(b+=d.defer),a.animationTimeout=Q(function(){a.afterAnimate();},b||0));a.isDirty=!1;a.hasRendered=!0;I(a,"afterRender");};a.prototype.redraw=function(){var a=this.chart,b=this.isDirty||this.isDirtyData,c=this.group,d=this.xAxis,e=this.yAxis;c&&(a.inverted&&c.attr({width:a.plotWidth,
    height:a.plotHeight}),c.animate({translateX:K(d&&d.left,a.plotLeft),translateY:K(e&&e.top,a.plotTop)}));this.translate();this.render();b&&delete this.kdTree;};a.prototype.searchPoint=function(a,b){var c=this.xAxis,d=this.yAxis,e=this.chart.inverted;return this.searchKDTree({clientX:e?c.len-a.chartY+c.pos:a.chartX-c.pos,plotY:e?d.len-a.chartX+d.pos:a.chartY-d.pos},b,a)};a.prototype.buildKDTree=function(a){function b(a,d,e){var g=a&&a.length;if(g){var f=c.kdAxisArray[d%e];a.sort(function(a,b){return a[f]-
    b[f]});g=Math.floor(g/2);return {point:a[g],left:b(a.slice(0,g),d+1,e),right:b(a.slice(g+1),d+1,e)}}}this.buildingKdTree=!0;var c=this,d=-1<c.options.findNearestPointBy.indexOf("y")?2:1;delete c.kdTree;Q(function(){c.kdTree=b(c.getValidPoints(null,!c.directTouch),d,d);c.buildingKdTree=!1;},c.options.kdNow||a&&"touchstart"===a.type?0:1);};a.prototype.searchKDTree=function(a,b,c){function d(a,b,c,k){var m=b.point,p=e.kdAxisArray[c%k],n=m,r=g(a[f])&&g(m[f])?Math.pow(a[f]-m[f],2):null;var t=g(a[h])&&g(m[h])?
    Math.pow(a[h]-m[h],2):null;t=(r||0)+(t||0);m.dist=g(t)?Math.sqrt(t):Number.MAX_VALUE;m.distX=g(r)?Math.sqrt(r):Number.MAX_VALUE;p=a[p]-m[p];t=0>p?"left":"right";r=0>p?"right":"left";b[t]&&(t=d(a,b[t],c+1,k),n=t[l]<n[l]?t:m);b[r]&&Math.sqrt(p*p)<n[l]&&(a=d(a,b[r],c+1,k),n=a[l]<n[l]?a:n);return n}var e=this,f=this.kdAxisArray[0],h=this.kdAxisArray[1],l=b?"distX":"dist";b=-1<e.options.findNearestPointBy.indexOf("y")?2:1;this.kdTree||this.buildingKdTree||this.buildKDTree(c);if(this.kdTree)return d(a,
    this.kdTree,b,b)};a.prototype.pointPlacementToXValue=function(){var a=this.options,b=a.pointRange,c=this.xAxis;a=a.pointPlacement;"between"===a&&(a=c.reversed?-.5:.5);return O(a)?a*(b||c.pointRange):0};a.prototype.isPointInside=function(a){var b=this.chart,c=this.xAxis,d=this.yAxis;return "undefined"!==typeof a.plotY&&"undefined"!==typeof a.plotX&&0<=a.plotY&&a.plotY<=(d?d.len:b.plotHeight)&&0<=a.plotX&&a.plotX<=(c?c.len:b.plotWidth)};a.prototype.drawTracker=function(){var a=this,b=a.options,c=b.trackByArea,
    d=[].concat(c?a.areaPath:a.graphPath),e=a.chart,g=e.pointer,h=e.renderer,l=e.options.tooltip.snap,m=a.tracker,k=function(b){if(e.hoverSeries!==a)a.onMouseOver();},p="rgba(192,192,192,"+(w?.0001:.002)+")";m?m.attr({d:d}):a.graph&&(a.tracker=h.path(d).attr({visibility:a.visible?"visible":"hidden",zIndex:2}).addClass(c?"highcharts-tracker-area":"highcharts-tracker-line").add(a.group),e.styledMode||a.tracker.attr({"stroke-linecap":"round","stroke-linejoin":"round",stroke:p,fill:c?p:"none","stroke-width":a.graph.strokeWidth()+
    (c?0:2*l)}),[a.tracker,a.markerGroup,a.dataLabelsGroup].forEach(function(a){if(a&&(a.addClass("highcharts-tracker").on("mouseover",k).on("mouseout",function(a){g.onTrackerMouseOut(a);}),b.cursor&&!e.styledMode&&a.css({cursor:b.cursor}),f))a.on("touchstart",k);}));I(this,"afterDrawTracker");};a.prototype.addPoint=function(a,b,c,d,e){var g=this.options,f=this.data,h=this.chart,l=this.xAxis;l=l&&l.hasNames&&l.names;var m=g.data,k=this.xData,p;b=K(b,!0);var n={series:this};this.pointClass.prototype.applyOptions.apply(n,
    [a]);var r=n.x;var t=k.length;if(this.requireSorting&&r<k[t-1])for(p=!0;t&&k[t-1]>r;)t--;this.updateParallelArrays(n,"splice",t,0,0);this.updateParallelArrays(n,t);l&&n.name&&(l[r]=n.name);m.splice(t,0,a);p&&(this.data.splice(t,0,null),this.processData());"point"===g.legendType&&this.generatePoints();c&&(f[0]&&f[0].remove?f[0].remove(!1):(f.shift(),this.updateParallelArrays(n,"shift"),m.shift()));!1!==e&&I(this,"addPoint",{point:n});this.isDirtyData=this.isDirty=!0;b&&h.redraw(d);};a.prototype.removePoint=
    function(a,b,c){var d=this,g=d.data,f=g[a],h=d.points,l=d.chart,k=function(){h&&h.length===g.length&&h.splice(a,1);g.splice(a,1);d.options.data.splice(a,1);d.updateParallelArrays(f||{series:d},"splice",a,1);f&&f.destroy();d.isDirty=!0;d.isDirtyData=!0;b&&l.redraw();};e(c,l);b=K(b,!0);f?f.firePointEvent("remove",null,k):k();};a.prototype.remove=function(a,b,c,d){function e(){g.destroy(d);f.isDirtyLegend=f.isDirtyBox=!0;f.linkSeries();K(a,!0)&&f.redraw(b);}var g=this,f=g.chart;!1!==c?I(g,"remove",null,
    e):e();};a.prototype.update=function(a,b){a=l(a,this.userOptions);I(this,"update",{options:a});var c=this,d=c.chart,e=c.userOptions,g=c.initialType||c.type,f=d.options.plotOptions,h=B[g].prototype,k=c.finishedAnimating&&{animation:!1},p={},n,r=["eventOptions","navigatorSeries","baseSeries"],t=a.type||e.type||d.options.chart.type,q=!(this.hasDerivedData||t&&t!==this.type||"undefined"!==typeof a.pointStart||"undefined"!==typeof a.pointInterval||"undefined"!==typeof a.relativeXValue||c.hasOptionChanged("dataGrouping")||
    c.hasOptionChanged("pointStart")||c.hasOptionChanged("pointInterval")||c.hasOptionChanged("pointIntervalUnit")||c.hasOptionChanged("keys"));t=t||g;q&&(r.push("data","isDirtyData","points","processedXData","processedYData","xIncrement","cropped","_hasPointMarkers","_hasPointLabels","clips","nodes","layout","mapMap","mapData","minY","maxY","minX","maxX"),!1!==a.visible&&r.push("area","graph"),c.parallelArrays.forEach(function(a){r.push(a+"Data");}),a.data&&(a.dataSorting&&D(c.options.dataSorting,a.dataSorting),
    this.setData(a.data,!1)));a=Y(e,k,{index:"undefined"===typeof e.index?c.index:e.index,pointStart:K(f&&f.series&&f.series.pointStart,e.pointStart,c.xData[0])},!q&&{data:c.options.data},a);q&&a.data&&(a.data=c.options.data);r=["group","markerGroup","dataLabelsGroup","transformGroup"].concat(r);r.forEach(function(a){r[a]=c[a];delete c[a];});f=!1;if(B[t]){if(f=t!==c.type,c.remove(!1,!1,!1,!0),f)if(Object.setPrototypeOf)Object.setPrototypeOf(c,B[t].prototype);else {k=Object.hasOwnProperty.call(c,"hcEvents")&&
    c.hcEvents;for(n in h)c[n]=void 0;D(c,B[t].prototype);k?c.hcEvents=k:delete c.hcEvents;}}else m(17,!0,d,{missingModuleFor:t});r.forEach(function(a){c[a]=r[a];});c.init(d,a);if(q&&this.points){var x=c.options;!1===x.visible?(p.graphic=1,p.dataLabel=1):c._hasPointLabels||(a=x.marker,h=x.dataLabels,!a||!1!==a.enabled&&(e.marker&&e.marker.symbol)===a.symbol||(p.graphic=1),h&&!1===h.enabled&&(p.dataLabel=1));this.points.forEach(function(a){a&&a.series&&(a.resolveColor(),Object.keys(p).length&&a.destroyElements(p),
    !1===x.showInLegend&&a.legendItem&&d.legend.destroyItem(a));},this);}c.initialType=g;d.linkSeries();f&&c.linkedSeries.length&&(c.isDirtyData=!0);I(this,"afterUpdate");K(b,!0)&&d.redraw(q?void 0:!1);};a.prototype.setName=function(a){this.name=this.options.name=this.userOptions.name=a;this.chart.isDirtyLegend=!0;};a.prototype.hasOptionChanged=function(a){var b=this.options[a],c=this.chart.options.plotOptions,d=this.userOptions[a];return d?b!==d:b!==K(c&&c[this.type]&&c[this.type][a],c&&c.series&&c.series[a],
    b)};a.prototype.onMouseOver=function(){var a=this.chart,b=a.hoverSeries;a.pointer.setHoverChartIndex();if(b&&b!==this)b.onMouseOut();this.options.events.mouseOver&&I(this,"mouseOver");this.setState("hover");a.hoverSeries=this;};a.prototype.onMouseOut=function(){var a=this.options,b=this.chart,c=b.tooltip,d=b.hoverPoint;b.hoverSeries=null;if(d)d.onMouseOut();this&&a.events.mouseOut&&I(this,"mouseOut");!c||this.stickyTracking||c.shared&&!this.noSharedTooltip||c.hide();b.series.forEach(function(a){a.setState("",
    !0);});};a.prototype.setState=function(a,b){var c=this,d=c.options,e=c.graph,g=d.inactiveOtherPoints,f=d.states,h=K(f[a||"normal"]&&f[a||"normal"].animation,c.chart.options.chart.animation),l=d.lineWidth,k=0,m=d.opacity;a=a||"";if(c.state!==a&&([c.group,c.markerGroup,c.dataLabelsGroup].forEach(function(b){b&&(c.state&&b.removeClass("highcharts-series-"+c.state),a&&b.addClass("highcharts-series-"+a));}),c.state=a,!c.chart.styledMode)){if(f[a]&&!1===f[a].enabled)return;a&&(l=f[a].lineWidth||l+(f[a].lineWidthPlus||
    0),m=K(f[a].opacity,m));if(e&&!e.dashstyle)for(d={"stroke-width":l},e.animate(d,h);c["zone-graph-"+k];)c["zone-graph-"+k].animate(d,h),k+=1;g||[c.group,c.markerGroup,c.dataLabelsGroup,c.labelBySeries].forEach(function(a){a&&a.animate({opacity:m},h);});}b&&g&&c.points&&c.setAllPointsToState(a||void 0);};a.prototype.setAllPointsToState=function(a){this.points.forEach(function(b){b.setState&&b.setState(a);});};a.prototype.setVisible=function(a,b){var c=this,d=c.chart,e=c.legendItem,g=d.options.chart.ignoreHiddenSeries,
    f=c.visible,h=(c.visible=a=c.options.visible=c.userOptions.visible="undefined"===typeof a?!f:a)?"show":"hide";["group","dataLabelsGroup","markerGroup","tracker","tt"].forEach(function(a){if(c[a])c[a][h]();});if(d.hoverSeries===c||(d.hoverPoint&&d.hoverPoint.series)===c)c.onMouseOut();e&&d.legend.colorizeItem(c,a);c.isDirty=!0;c.options.stacking&&d.series.forEach(function(a){a.options.stacking&&a.visible&&(a.isDirty=!0);});c.linkedSeries.forEach(function(b){b.setVisible(a,!1);});g&&(d.isDirtyBox=!0);
    I(c,h);!1!==b&&d.redraw();};a.prototype.show=function(){this.setVisible(!0);};a.prototype.hide=function(){this.setVisible(!1);};a.prototype.select=function(a){this.selected=a=this.options.selected="undefined"===typeof a?!this.selected:a;this.checkbox&&(this.checkbox.checked=a);I(this,a?"select":"unselect");};a.prototype.shouldShowTooltip=function(a,b,c){void 0===c&&(c={});c.series=this;c.visiblePlotOnly=!0;return this.chart.isInsidePlot(a,b,c)};a.defaultOptions=H;return a}();D(a.prototype,{axisTypes:["xAxis",
    "yAxis"],coll:"series",colorCounter:0,cropShoulder:1,directTouch:!1,drawLegendSymbol:y.drawLineMarker,isCartesian:!0,kdAxisArray:["clientX","plotY"],parallelArrays:["x","y"],pointClass:G,requireSorting:!0,sorted:!0});A.series=a;return a});M(a,"Extensions/ScrollablePlotArea.js",[a["Core/Animation/AnimationUtilities.js"],a["Core/Axis/Axis.js"],a["Core/Chart/Chart.js"],a["Core/Series/Series.js"],a["Core/Renderer/RendererRegistry.js"],a["Core/Utilities.js"]],function(a,u,z,F,y,G){var v=a.stop,A=
    G.addEvent,q=G.createElement,n=G.merge,k=G.pick;A(z,"afterSetChartSize",function(a){var c=this.options.chart.scrollablePlotArea,e=c&&c.minWidth;c=c&&c.minHeight;if(!this.renderer.forExport){if(e){if(this.scrollablePixelsX=e=Math.max(0,e-this.chartWidth)){this.scrollablePlotBox=this.renderer.scrollablePlotBox=n(this.plotBox);this.plotBox.width=this.plotWidth+=e;this.inverted?this.clipBox.height+=e:this.clipBox.width+=e;var f={1:{name:"right",value:e}};}}else c&&(this.scrollablePixelsY=e=Math.max(0,
    c-this.chartHeight))&&(this.scrollablePlotBox=this.renderer.scrollablePlotBox=n(this.plotBox),this.plotBox.height=this.plotHeight+=e,this.inverted?this.clipBox.width+=e:this.clipBox.height+=e,f={2:{name:"bottom",value:e}});f&&!a.skipAxes&&this.axes.forEach(function(a){f[a.side]?a.getPlotLinePath=function(){var c=f[a.side].name,e=this[c];this[c]=e-f[a.side].value;var h=u.prototype.getPlotLinePath.apply(this,arguments);this[c]=e;return h}:(a.setAxisSize(),a.setAxisTranslation());});}});A(z,"render",function(){this.scrollablePixelsX||
    this.scrollablePixelsY?(this.setUpScrolling&&this.setUpScrolling(),this.applyFixed()):this.fixedDiv&&this.applyFixed();});z.prototype.setUpScrolling=function(){var a=this,c={WebkitOverflowScrolling:"touch",overflowX:"hidden",overflowY:"hidden"};this.scrollablePixelsX&&(c.overflowX="auto");this.scrollablePixelsY&&(c.overflowY="auto");this.scrollingParent=q("div",{className:"highcharts-scrolling-parent"},{position:"relative"},this.renderTo);this.scrollingContainer=q("div",{className:"highcharts-scrolling"},
    c,this.scrollingParent);A(this.scrollingContainer,"scroll",function(){a.pointer&&delete a.pointer.chartPosition;});this.innerContainer=q("div",{className:"highcharts-inner-container"},null,this.scrollingContainer);this.innerContainer.appendChild(this.container);this.setUpScrolling=null;};z.prototype.moveFixedElements=function(){var a=this.container,c=this.fixedRenderer,h=".highcharts-contextbutton .highcharts-credits .highcharts-legend .highcharts-legend-checkbox .highcharts-navigator-series .highcharts-navigator-xaxis .highcharts-navigator-yaxis .highcharts-navigator .highcharts-reset-zoom .highcharts-drillup-button .highcharts-scrollbar .highcharts-subtitle .highcharts-title".split(" "),
    f;this.scrollablePixelsX&&!this.inverted?f=".highcharts-yaxis":this.scrollablePixelsX&&this.inverted?f=".highcharts-xaxis":this.scrollablePixelsY&&!this.inverted?f=".highcharts-xaxis":this.scrollablePixelsY&&this.inverted&&(f=".highcharts-yaxis");f&&h.push(f+":not(.highcharts-radial-axis)",f+"-labels:not(.highcharts-radial-axis-labels)");h.forEach(function(e){[].forEach.call(a.querySelectorAll(e),function(a){(a.namespaceURI===c.SVG_NS?c.box:c.box.parentNode).appendChild(a);a.style.pointerEvents="auto";});});};
    z.prototype.applyFixed=function(){var a=!this.fixedDiv,c=this.options.chart,h=c.scrollablePlotArea,f=y.getRendererType();a?(this.fixedDiv=q("div",{className:"highcharts-fixed"},{position:"absolute",overflow:"hidden",pointerEvents:"none",zIndex:(c.style&&c.style.zIndex||0)+2,top:0},null,!0),this.scrollingContainer&&this.scrollingContainer.parentNode.insertBefore(this.fixedDiv,this.scrollingContainer),this.renderTo.style.overflow="visible",this.fixedRenderer=c=new f(this.fixedDiv,this.chartWidth,this.chartHeight,
    this.options.chart.style),this.scrollableMask=c.path().attr({fill:this.options.chart.backgroundColor||"#fff","fill-opacity":k(h.opacity,.85),zIndex:-1}).addClass("highcharts-scrollable-mask").add(),A(this,"afterShowResetZoom",this.moveFixedElements),A(this,"afterDrilldown",this.moveFixedElements),A(this,"afterLayOutTitles",this.moveFixedElements)):this.fixedRenderer.setSize(this.chartWidth,this.chartHeight);if(this.scrollableDirty||a)this.scrollableDirty=!1,this.moveFixedElements();c=this.chartWidth+
    (this.scrollablePixelsX||0);f=this.chartHeight+(this.scrollablePixelsY||0);v(this.container);this.container.style.width=c+"px";this.container.style.height=f+"px";this.renderer.boxWrapper.attr({width:c,height:f,viewBox:[0,0,c,f].join(" ")});this.chartBackground.attr({width:c,height:f});this.scrollingContainer.style.height=this.chartHeight+"px";a&&(h.scrollPositionX&&(this.scrollingContainer.scrollLeft=this.scrollablePixelsX*h.scrollPositionX),h.scrollPositionY&&(this.scrollingContainer.scrollTop=this.scrollablePixelsY*
    h.scrollPositionY));f=this.axisOffset;a=this.plotTop-f[0]-1;h=this.plotLeft-f[3]-1;c=this.plotTop+this.plotHeight+f[2]+1;f=this.plotLeft+this.plotWidth+f[1]+1;var n=this.plotLeft+this.plotWidth-(this.scrollablePixelsX||0),p=this.plotTop+this.plotHeight-(this.scrollablePixelsY||0);a=this.scrollablePixelsX?[["M",0,a],["L",this.plotLeft-1,a],["L",this.plotLeft-1,c],["L",0,c],["Z"],["M",n,a],["L",this.chartWidth,a],["L",this.chartWidth,c],["L",n,c],["Z"]]:this.scrollablePixelsY?[["M",h,0],["L",h,this.plotTop-
    1],["L",f,this.plotTop-1],["L",f,0],["Z"],["M",h,p],["L",h,this.chartHeight],["L",f,this.chartHeight],["L",f,p],["Z"]]:[["M",0,0]];"adjustHeight"!==this.redrawTrigger&&this.scrollableMask.attr({d:a});};A(u,"afterInit",function(){this.chart.scrollableDirty=!0;});A(F,"show",function(){this.chart.scrollableDirty=!0;});});M(a,"Core/Axis/StackingAxis.js",[a["Core/Animation/AnimationUtilities.js"],a["Core/Axis/Axis.js"],a["Core/Utilities.js"]],function(a,u,z){var v=a.getDeferredAnimation,y=z.addEvent,G=
    z.destroyObjectProperties,H=z.fireEvent,A=z.isNumber,q=z.objectEach,n;(function(a){function e(){var a=this.stacking;if(a){var c=a.stacks;q(c,function(a,e){G(a);c[e]=null;});a&&a.stackTotalGroup&&a.stackTotalGroup.destroy();}}function c(){this.stacking||(this.stacking=new f(this));}var h=[];a.compose=function(a){-1===h.indexOf(a)&&(h.push(a),y(a,"init",c),y(a,"destroy",e));return a};var f=function(){function a(a){this.oldStacks={};this.stacks={};this.stacksTouched=0;this.axis=a;}a.prototype.buildStacks=
    function(){var a=this.axis,c=a.series,e=a.options.reversedStacks,f=c.length,h;if(!a.isXAxis){this.usePercentage=!1;for(h=f;h--;){var k=c[e?h:f-h-1];k.setStackedPoints();k.setGroupedPoints();}for(h=0;h<f;h++)c[h].modifyStacks();H(a,"afterBuildStacks");}};a.prototype.cleanStacks=function(){if(!this.axis.isXAxis){if(this.oldStacks)var a=this.stacks=this.oldStacks;q(a,function(a){q(a,function(a){a.cumulative=a.total;});});}};a.prototype.resetStacks=function(){var a=this,c=a.stacks;a.axis.isXAxis||q(c,function(c){q(c,
    function(e,f){A(e.touched)&&e.touched<a.stacksTouched?(e.destroy(),delete c[f]):(e.total=null,e.cumulative=null);});});};a.prototype.renderStackTotals=function(){var a=this.axis,c=a.chart,e=c.renderer,f=this.stacks;a=v(c,a.options.stackLabels&&a.options.stackLabels.animation||!1);var h=this.stackTotalGroup=this.stackTotalGroup||e.g("stack-labels").attr({visibility:"visible",zIndex:6,opacity:0}).add();h.translate(c.plotLeft,c.plotTop);q(f,function(a){q(a,function(a){a.render(h);});});h.animate({opacity:1},
    a);};return a}();a.Additions=f;})(n||(n={}));return n});M(a,"Extensions/Stacking.js",[a["Core/Axis/Axis.js"],a["Core/Chart/Chart.js"],a["Core/FormatUtilities.js"],a["Core/Globals.js"],a["Core/Series/Series.js"],a["Core/Axis/StackingAxis.js"],a["Core/Utilities.js"]],function(a,u,z,F,y,G,H){var v=z.format,q=H.correctFloat,n=H.defined,k=H.destroyObjectProperties,e=H.isArray,c=H.isNumber,h=H.objectEach,f=H.pick,w=function(){function a(a,c,e,f,h){var l=a.chart.inverted;this.axis=a;this.isNegative=e;this.options=
    c=c||{};this.x=f;this.total=null;this.points={};this.hasValidPoints=!1;this.stack=h;this.rightCliff=this.leftCliff=0;this.alignOptions={align:c.align||(l?e?"left":"right":"center"),verticalAlign:c.verticalAlign||(l?"middle":e?"bottom":"top"),y:c.y,x:c.x};this.textAlign=c.textAlign||(l?e?"right":"left":"center");}a.prototype.destroy=function(){k(this,this.axis);};a.prototype.render=function(a){var c=this.axis.chart,e=this.options,h=e.format;h=h?v(h,this,c):e.formatter.call(this);this.label?this.label.attr({text:h,
    visibility:"hidden"}):(this.label=c.renderer.label(h,null,null,e.shape,null,null,e.useHTML,!1,"stack-labels"),h={r:e.borderRadius||0,text:h,rotation:e.rotation,padding:f(e.padding,5),visibility:"hidden"},c.styledMode||(h.fill=e.backgroundColor,h.stroke=e.borderColor,h["stroke-width"]=e.borderWidth,this.label.css(e.style)),this.label.attr(h),this.label.added||this.label.add(a));this.label.labelrank=c.plotSizeY;};a.prototype.setOffset=function(a,e,h,k,p){var l=this.axis,b=l.chart;k=l.translate(l.stacking.usePercentage?
    100:k?k:this.total,0,0,0,1);h=l.translate(h?h:0);h=n(k)&&Math.abs(k-h);a=f(p,b.xAxis[0].translate(this.x))+a;l=n(k)&&this.getStackBox(b,this,a,k,e,h,l);e=this.label;h=this.isNegative;a="justify"===f(this.options.overflow,"justify");var g=this.textAlign;e&&l&&(p=e.getBBox(),k=e.padding,g="left"===g?b.inverted?-k:k:"right"===g?p.width:b.inverted&&"center"===g?p.width/2:b.inverted?h?p.width+k:-k:p.width/2,h=b.inverted?p.height/2:h?-k:p.height,this.alignOptions.x=f(this.options.x,0),this.alignOptions.y=
    f(this.options.y,0),l.x-=g,l.y-=h,e.align(this.alignOptions,null,l),b.isInsidePlot(e.alignAttr.x+g-this.alignOptions.x,e.alignAttr.y+h-this.alignOptions.y)?e.show():(e.alignAttr.y=-9999,a=!1),a&&y.prototype.justifyDataLabel.call(this.axis,e,this.alignOptions,e.alignAttr,p,l),e.attr({x:e.alignAttr.x,y:e.alignAttr.y}),f(!a&&this.options.crop,!0)&&((b=c(e.x)&&c(e.y)&&b.isInsidePlot(e.x-k+e.width,e.y)&&b.isInsidePlot(e.x+k,e.y))||e.hide()));};a.prototype.getStackBox=function(a,c,e,f,h,l,b){var g=c.axis.reversed,
    d=a.inverted,k=b.height+b.pos-(d?a.plotLeft:a.plotTop);c=c.isNegative&&!g||!c.isNegative&&g;return {x:d?c?f-b.right:f-l+b.pos-a.plotLeft:e+a.xAxis[0].transB-a.plotLeft,y:d?b.height-e-h:c?k-f-l:k-f,width:d?l:h,height:d?h:l}};return a}();u.prototype.getStacks=function(){var a=this,c=a.inverted;a.yAxis.forEach(function(a){a.stacking&&a.stacking.stacks&&a.hasVisibleSeries&&(a.stacking.oldStacks=a.stacking.stacks);});a.series.forEach(function(e){var h=e.xAxis&&e.xAxis.options||{};!e.options.stacking||!0!==
    e.visible&&!1!==a.options.chart.ignoreHiddenSeries||(e.stackKey=[e.type,f(e.options.stack,""),c?h.top:h.left,c?h.height:h.width].join());});};G.compose(a);y.prototype.setGroupedPoints=function(){var a=this.yAxis.stacking;this.options.centerInCategory&&(this.is("column")||this.is("columnrange"))&&!this.options.stacking&&1<this.chart.series.length?y.prototype.setStackedPoints.call(this,"group"):a&&h(a.stacks,function(c,e){"group"===e.slice(-5)&&(h(c,function(a){return a.destroy()}),delete a.stacks[e]);});};
    y.prototype.setStackedPoints=function(a){var c=a||this.options.stacking;if(c&&(!0===this.visible||!1===this.chart.options.chart.ignoreHiddenSeries)){var h=this.processedXData,k=this.processedYData,p=[],r=k.length,l=this.options,b=l.threshold,g=f(l.startFromThreshold&&b,0);l=l.stack;a=a?this.type+","+c:this.stackKey;var d="-"+a,m=this.negStacks,v=this.yAxis,x=v.stacking.stacks,u=v.stacking.oldStacks,A,y;v.stacking.stacksTouched+=1;for(y=0;y<r;y++){var z=h[y];var F=k[y];var H=this.getStackIndicator(H,
    z,this.index);var G=H.key;var K=(A=m&&F<(g?0:b))?d:a;x[K]||(x[K]={});x[K][z]||(u[K]&&u[K][z]?(x[K][z]=u[K][z],x[K][z].total=null):x[K][z]=new w(v,v.options.stackLabels,A,z,l));K=x[K][z];null!==F?(K.points[G]=K.points[this.index]=[f(K.cumulative,g)],n(K.cumulative)||(K.base=G),K.touched=v.stacking.stacksTouched,0<H.index&&!1===this.singleStacks&&(K.points[G][0]=K.points[this.index+","+z+",0"][0])):K.points[G]=K.points[this.index]=null;"percent"===c?(A=A?a:d,m&&x[A]&&x[A][z]?(A=x[A][z],K.total=A.total=
    Math.max(A.total,K.total)+Math.abs(F)||0):K.total=q(K.total+(Math.abs(F)||0))):"group"===c?(e(F)&&(F=F[0]),null!==F&&(K.total=(K.total||0)+1)):K.total=q(K.total+(F||0));K.cumulative="group"===c?(K.total||1)-1:f(K.cumulative,g)+(F||0);null!==F&&(K.points[G].push(K.cumulative),p[y]=K.cumulative,K.hasValidPoints=!0);}"percent"===c&&(v.stacking.usePercentage=!0);"group"!==c&&(this.stackedYData=p);v.stacking.oldStacks={};}};y.prototype.modifyStacks=function(){var a=this,c=a.stackKey,e=a.yAxis.stacking.stacks,
    f=a.processedXData,h,k=a.options.stacking;a[k+"Stacker"]&&[c,"-"+c].forEach(function(c){for(var b=f.length,g,d;b--;)if(g=f[b],h=a.getStackIndicator(h,g,a.index,c),d=(g=e[c]&&e[c][g])&&g.points[h.key])a[k+"Stacker"](d,g,b);});};y.prototype.percentStacker=function(a,c,e){c=c.total?100/c.total:0;a[0]=q(a[0]*c);a[1]=q(a[1]*c);this.stackedYData[e]=a[1];};y.prototype.getStackIndicator=function(a,c,e,f){!n(a)||a.x!==c||f&&a.key!==f?a={x:c,index:0,key:f}:a.index++;a.key=[e,c,a.index].join();return a};F.StackItem=
    w;return F.StackItem});M(a,"Series/Line/LineSeries.js",[a["Core/Series/Series.js"],a["Core/Series/SeriesRegistry.js"],a["Core/Utilities.js"]],function(a,u,z){var v=this&&this.__extends||function(){var a=function(v,q){a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(a,k){a.__proto__=k;}||function(a,k){for(var e in k)k.hasOwnProperty(e)&&(a[e]=k[e]);};return a(v,q)};return function(v,q){function n(){this.constructor=v;}a(v,q);v.prototype=null===q?Object.create(q):(n.prototype=q.prototype,
    new n);}}(),y=z.defined,G=z.merge;z=function(u){function A(){var a=null!==u&&u.apply(this,arguments)||this;a.data=void 0;a.options=void 0;a.points=void 0;return a}v(A,u);A.prototype.drawGraph=function(){var a=this,n=this.options,k=(this.gappedPath||this.getGraphPath).call(this),e=this.chart.styledMode,c=[["graph","highcharts-graph"]];e||c[0].push(n.lineColor||this.color||"#cccccc",n.dashStyle);c=a.getZonesGraphs(c);c.forEach(function(c,f){var h=c[0],p=a[h],q=p?"animate":"attr";p?(p.endX=a.preventGraphAnimation?
    null:k.xMap,p.animate({d:k})):k.length&&(a[h]=p=a.chart.renderer.path(k).addClass(c[1]).attr({zIndex:1}).add(a.group));p&&!e&&(h={stroke:c[2],"stroke-width":n.lineWidth,fill:a.fillGraph&&a.color||"none"},c[3]?h.dashstyle=c[3]:"square"!==n.linecap&&(h["stroke-linecap"]=h["stroke-linejoin"]="round"),p[q](h).shadow(2>f&&n.shadow));p&&(p.startX=k.xMap,p.isArea=k.isArea);});};A.prototype.getGraphPath=function(a,n,k){var e=this,c=e.options,h=[],f=[],q,p=c.step;a=a||e.points;var v=a.reversed;v&&a.reverse();
    (p={right:1,center:2}[p]||p&&3)&&v&&(p=4-p);a=this.getValidPoints(a,!1,!(c.connectNulls&&!n&&!k));a.forEach(function(t,v){var w=t.plotX,r=t.plotY,l=a[v-1];(t.leftCliff||l&&l.rightCliff)&&!k&&(q=!0);t.isNull&&!y(n)&&0<v?q=!c.connectNulls:t.isNull&&!n?q=!0:(0===v||q?v=[["M",t.plotX,t.plotY]]:e.getPointSpline?v=[e.getPointSpline(a,t,v)]:p?(v=1===p?[["L",l.plotX,r]]:2===p?[["L",(l.plotX+w)/2,l.plotY],["L",(l.plotX+w)/2,r]]:[["L",w,l.plotY]],v.push(["L",w,r])):v=[["L",w,r]],f.push(t.x),p&&(f.push(t.x),
    2===p&&f.push(t.x)),h.push.apply(h,v),q=!1);});h.xMap=f;return e.graphPath=h};A.prototype.getZonesGraphs=function(a){this.zones.forEach(function(n,k){k=["zone-graph-"+k,"highcharts-graph highcharts-zone-graph-"+k+" "+(n.className||"")];this.chart.styledMode||k.push(n.color||this.color,n.dashStyle||this.options.dashStyle);a.push(k);},this);return a};A.defaultOptions=G(a.defaultOptions,{});return A}(a);u.registerSeriesType("line",z);return z});M(a,"Series/Area/AreaSeries.js",[a["Core/Color/Color.js"],
    a["Core/Legend/LegendSymbol.js"],a["Core/Series/SeriesRegistry.js"],a["Core/Utilities.js"]],function(a,u,z,F){var v=this&&this.__extends||function(){var a=function(e,c){a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(a,c){a.__proto__=c;}||function(a,c){for(var e in c)c.hasOwnProperty(e)&&(a[e]=c[e]);};return a(e,c)};return function(e,c){function h(){this.constructor=e;}a(e,c);e.prototype=null===c?Object.create(c):(h.prototype=c.prototype,new h);}}(),G=a.parse,H=z.seriesTypes.line;a=
    F.extend;var A=F.merge,q=F.objectEach,n=F.pick;F=function(a){function e(){var c=null!==a&&a.apply(this,arguments)||this;c.data=void 0;c.options=void 0;c.points=void 0;return c}v(e,a);e.prototype.drawGraph=function(){this.areaPath=[];a.prototype.drawGraph.apply(this);var c=this,e=this.areaPath,f=this.options,k=[["area","highcharts-area",this.color,f.fillColor]];this.zones.forEach(function(a,e){k.push(["zone-area-"+e,"highcharts-area highcharts-zone-area-"+e+" "+a.className,a.color||c.color,a.fillColor||
    f.fillColor]);});k.forEach(function(a){var h=a[0],k=c[h],p=k?"animate":"attr",q={};k?(k.endX=c.preventGraphAnimation?null:e.xMap,k.animate({d:e})):(q.zIndex=0,k=c[h]=c.chart.renderer.path(e).addClass(a[1]).add(c.group),k.isArea=!0);c.chart.styledMode||(q.fill=n(a[3],G(a[2]).setOpacity(n(f.fillOpacity,.75)).get()));k[p](q);k.startX=e.xMap;k.shiftUnit=f.step?2:1;});};e.prototype.getGraphPath=function(a){var c=H.prototype.getGraphPath,e=this.options,k=e.stacking,p=this.yAxis,q,t=[],v=[],u=this.index,r=
    p.stacking.stacks[this.stackKey],l=e.threshold,b=Math.round(p.getThreshold(e.threshold));e=n(e.connectNulls,"percent"===k);var g=function(c,d,e){var g=a[c];c=k&&r[g.x].points[u];var f=g[e+"Null"]||0;e=g[e+"Cliff"]||0;g=!0;if(e||f){var h=(f?c[0]:c[1])+e;var n=c[0]+e;g=!!f;}else !k&&a[d]&&a[d].isNull&&(h=n=l);"undefined"!==typeof h&&(v.push({plotX:m,plotY:null===h?b:p.getThreshold(h),isNull:g,isCliff:!0}),t.push({plotX:m,plotY:null===n?b:p.getThreshold(n),doCurve:!1}));};a=a||this.points;k&&(a=this.getStackPoints(a));
    for(q=0;q<a.length;q++){k||(a[q].leftCliff=a[q].rightCliff=a[q].leftNull=a[q].rightNull=void 0);var d=a[q].isNull;var m=n(a[q].rectPlotX,a[q].plotX);var D=k?n(a[q].yBottom,b):b;if(!d||e)e||g(q,q-1,"left"),d&&!k&&e||(v.push(a[q]),t.push({x:q,plotX:m,plotY:D})),e||g(q,q+1,"right");}q=c.call(this,v,!0,!0);t.reversed=!0;d=c.call(this,t,!0,!0);(D=d[0])&&"M"===D[0]&&(d[0]=["L",D[1],D[2]]);d=q.concat(d);d.length&&d.push(["Z"]);c=c.call(this,v,!1,e);d.xMap=q.xMap;this.areaPath=d;return c};e.prototype.getStackPoints=
    function(a){var c=this,e=[],k=[],p=this.xAxis,v=this.yAxis,t=v.stacking.stacks[this.stackKey],u={},C=v.series,r=C.length,l=v.options.reversedStacks?1:-1,b=C.indexOf(c);a=a||this.points;if(this.options.stacking){for(var g=0;g<a.length;g++)a[g].leftNull=a[g].rightNull=void 0,u[a[g].x]=a[g];q(t,function(a,b){null!==a.total&&k.push(b);});k.sort(function(a,b){return a-b});var d=C.map(function(a){return a.visible});k.forEach(function(a,g){var f=0,h,m;if(u[a]&&!u[a].isNull)e.push(u[a]),[-1,1].forEach(function(e){var f=
    1===e?"rightNull":"leftNull",n=0,p=t[k[g+e]];if(p)for(var q=b;0<=q&&q<r;){var v=C[q].index;h=p.points[v];h||(v===c.index?u[a][f]=!0:d[q]&&(m=t[a].points[v])&&(n-=m[1]-m[0]));q+=l;}u[a][1===e?"rightCliff":"leftCliff"]=n;});else {for(var q=b;0<=q&&q<r;){if(h=t[a].points[C[q].index]){f=h[1];break}q+=l;}f=n(f,0);f=v.translate(f,0,1,0,1);e.push({isNull:!0,plotX:p.translate(a,0,0,0,1),x:a,plotY:f,yBottom:f});}});}return e};e.defaultOptions=A(H.defaultOptions,{threshold:0});return e}(H);a(F.prototype,{singleStacks:!1,
    drawLegendSymbol:u.drawRectangle});z.registerSeriesType("area",F);return F});M(a,"Series/Spline/SplineSeries.js",[a["Core/Series/SeriesRegistry.js"],a["Core/Utilities.js"]],function(a,u){var v=this&&this.__extends||function(){var a=function(v,q){a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(a,k){a.__proto__=k;}||function(a,k){for(var e in k)k.hasOwnProperty(e)&&(a[e]=k[e]);};return a(v,q)};return function(v,q){function n(){this.constructor=v;}a(v,q);v.prototype=null===q?Object.create(q):
    (n.prototype=q.prototype,new n);}}(),F=a.seriesTypes.line,y=u.merge,G=u.pick;u=function(a){function u(){var q=null!==a&&a.apply(this,arguments)||this;q.data=void 0;q.options=void 0;q.points=void 0;return q}v(u,a);u.prototype.getPointSpline=function(a,n,k){var e=n.plotX||0,c=n.plotY||0,h=a[k-1];k=a[k+1];if(h&&!h.isNull&&!1!==h.doCurve&&!n.isCliff&&k&&!k.isNull&&!1!==k.doCurve&&!n.isCliff){a=h.plotY||0;var f=k.plotX||0;k=k.plotY||0;var q=0;var p=(1.5*e+(h.plotX||0))/2.5;var v=(1.5*c+a)/2.5;f=(1.5*e+
    f)/2.5;var t=(1.5*c+k)/2.5;f!==p&&(q=(t-v)*(f-e)/(f-p)+c-t);v+=q;t+=q;v>a&&v>c?(v=Math.max(a,c),t=2*c-v):v<a&&v<c&&(v=Math.min(a,c),t=2*c-v);t>k&&t>c?(t=Math.max(k,c),v=2*c-t):t<k&&t<c&&(t=Math.min(k,c),v=2*c-t);n.rightContX=f;n.rightContY=t;}n=["C",G(h.rightContX,h.plotX,0),G(h.rightContY,h.plotY,0),G(p,e,0),G(v,c,0),e,c];h.rightContX=h.rightContY=void 0;return n};u.defaultOptions=y(F.defaultOptions);return u}(F);a.registerSeriesType("spline",u);return u});M(a,"Series/AreaSpline/AreaSplineSeries.js",
    [a["Series/Area/AreaSeries.js"],a["Series/Spline/SplineSeries.js"],a["Core/Legend/LegendSymbol.js"],a["Core/Series/SeriesRegistry.js"],a["Core/Utilities.js"]],function(a,u,z,F,y){var v=this&&this.__extends||function(){var a=function(k,e){a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(a,e){a.__proto__=e;}||function(a,e){for(var c in e)e.hasOwnProperty(c)&&(a[c]=e[c]);};return a(k,e)};return function(k,e){function c(){this.constructor=k;}a(k,e);k.prototype=null===e?Object.create(e):
    (c.prototype=e.prototype,new c);}}(),H=a.prototype,A=y.extend,q=y.merge;y=function(n){function k(){var a=null!==n&&n.apply(this,arguments)||this;a.data=void 0;a.points=void 0;a.options=void 0;return a}v(k,n);k.defaultOptions=q(u.defaultOptions,a.defaultOptions);return k}(u);A(y.prototype,{getGraphPath:H.getGraphPath,getStackPoints:H.getStackPoints,drawGraph:H.drawGraph,drawLegendSymbol:z.drawRectangle});F.registerSeriesType("areaspline",y);return y});M(a,"Series/Column/ColumnSeries.js",[a["Core/Animation/AnimationUtilities.js"],
    a["Core/Color/Color.js"],a["Core/Globals.js"],a["Core/Legend/LegendSymbol.js"],a["Core/Series/Series.js"],a["Core/Series/SeriesRegistry.js"],a["Core/Utilities.js"]],function(a,u,z,F,y,G,H){var v=this&&this.__extends||function(){var a=function(c,b){a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(a,b){a.__proto__=b;}||function(a,b){for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c]);};return a(c,b)};return function(c,b){function e(){this.constructor=c;}a(c,b);c.prototype=null===b?Object.create(b):
    (e.prototype=b.prototype,new e);}}(),q=a.animObject,n=u.parse,k=z.hasTouch;a=z.noop;var e=H.clamp,c=H.css,h=H.defined,f=H.extend,w=H.fireEvent,p=H.isArray,B=H.isNumber,t=H.merge,J=H.pick,C=H.objectEach;H=function(a){function l(){var b=null!==a&&a.apply(this,arguments)||this;b.borderWidth=void 0;b.data=void 0;b.group=void 0;b.options=void 0;b.points=void 0;return b}v(l,a);l.prototype.animate=function(a){var b=this,c=this.yAxis,h=b.options,l=this.chart.inverted,k={},n=l?"translateX":"translateY";if(a)k.scaleY=
    .001,a=e(c.toPixels(h.threshold),c.pos,c.pos+c.len),l?k.translateX=a-c.len:k.translateY=a,b.clipBox&&b.setClip(),b.group.attr(k);else {var p=Number(b.group.attr(n));b.group.animate({scaleY:1},f(q(b.options.animation),{step:function(a,d){b.group&&(k[n]=p+d.pos*(c.pos-p),b.group.attr(k));}}));}};l.prototype.init=function(b,c){a.prototype.init.apply(this,arguments);var d=this;b=d.chart;b.hasRendered&&b.series.forEach(function(a){a.type===d.type&&(a.isDirty=!0);});};l.prototype.getColumnMetrics=function(){var a=
    this,c=a.options,d=a.xAxis,e=a.yAxis,f=d.options.reversedStacks;f=d.reversed&&!f||!d.reversed&&f;var h={},l,k=0;!1===c.grouping?k=1:a.chart.series.forEach(function(b){var c=b.yAxis,d=b.options;if(b.type===a.type&&(b.visible||!a.chart.options.chart.ignoreHiddenSeries)&&e.len===c.len&&e.pos===c.pos){if(d.stacking&&"group"!==d.stacking){l=b.stackKey;"undefined"===typeof h[l]&&(h[l]=k++);var g=h[l];}else !1!==d.grouping&&(g=k++);b.columnIndex=g;}});var n=Math.min(Math.abs(d.transA)*(d.ordinal&&d.ordinal.slope||
    c.pointRange||d.closestPointRange||d.tickInterval||1),d.len),p=n*c.groupPadding,r=(n-2*p)/(k||1);c=Math.min(c.maxPointWidth||d.len,J(c.pointWidth,r*(1-2*c.pointPadding)));a.columnMetrics={width:c,offset:(r-c)/2+(p+((a.columnIndex||0)+(f?1:0))*r-n/2)*(f?-1:1),paddedWidth:r,columnCount:k};return a.columnMetrics};l.prototype.crispCol=function(a,c,d,e){var b=this.chart,g=this.borderWidth,f=-(g%2?.5:0);g=g%2?.5:1;b.inverted&&b.renderer.isVML&&(g+=1);this.options.crisp&&(d=Math.round(a+d)+f,a=Math.round(a)+
    f,d-=a);e=Math.round(c+e)+g;f=.5>=Math.abs(c)&&.5<e;c=Math.round(c)+g;e-=c;f&&e&&(--c,e+=1);return {x:a,y:c,width:d,height:e}};l.prototype.adjustForMissingColumns=function(a,c,d,e){var b=this,g=this.options.stacking;if(!d.isNull&&1<e.columnCount){var f=0,h=0;C(this.yAxis.stacking&&this.yAxis.stacking.stacks,function(a){if("number"===typeof d.x&&(a=a[d.x.toString()])){var c=a.points[b.index],e=a.total;g?(c&&(f=h),a.hasValidPoints&&h++):p(c)&&(f=c[1],h=e||0);}});a=(d.plotX||0)+((h-1)*e.paddedWidth+c)/
    2-c-f*e.paddedWidth;}return a};l.prototype.translate=function(){var a=this,c=a.chart,d=a.options,f=a.dense=2>a.closestPointRange*a.xAxis.transA;f=a.borderWidth=J(d.borderWidth,f?0:1);var l=a.xAxis,k=a.yAxis,n=d.threshold,p=a.translatedThreshold=k.getThreshold(n),r=J(d.minPointLength,5),q=a.getColumnMetrics(),t=q.width,v=a.pointXOffset=q.offset,u=a.dataMin,w=a.dataMax,C=a.barW=Math.max(t,1+2*f);c.inverted&&(p-=.5);d.pointPadding&&(C=Math.ceil(C));y.prototype.translate.apply(a);a.points.forEach(function(b){var g=
    J(b.yBottom,p),f=999+Math.abs(g),m=b.plotX||0;f=e(b.plotY,-f,k.len+f);var x=Math.min(f,g),D=Math.max(f,g)-x,y=t,A=m+v,z=C;r&&Math.abs(D)<r&&(D=r,m=!k.reversed&&!b.negative||k.reversed&&b.negative,B(n)&&B(w)&&b.y===n&&w<=n&&(k.min||0)<n&&(u!==w||(k.max||0)<=n)&&(m=!m),x=Math.abs(x-p)>r?g-r:p-(m?r:0));h(b.options.pointWidth)&&(y=z=Math.ceil(b.options.pointWidth),A-=Math.round((y-t)/2));d.centerInCategory&&(A=a.adjustForMissingColumns(A,y,b,q));b.barX=A;b.pointWidth=y;b.tooltipPos=c.inverted?[e(k.len+
    k.pos-c.plotLeft-f,k.pos-c.plotLeft,k.len+k.pos-c.plotLeft),l.len+l.pos-c.plotTop-A-z/2,D]:[l.left-c.plotLeft+A+z/2,e(f+k.pos-c.plotTop,k.pos-c.plotTop,k.len+k.pos-c.plotTop),D];b.shapeType=a.pointClass.prototype.shapeType||"rect";b.shapeArgs=a.crispCol.apply(a,b.isNull?[A,p,z,0]:[A,x,z,D]);});};l.prototype.drawGraph=function(){this.group[this.dense?"addClass":"removeClass"]("highcharts-dense-data");};l.prototype.pointAttribs=function(a,c){var b=this.options,e=this.pointAttrToOptions||{},g=e.stroke||
    "borderColor",f=e["stroke-width"]||"borderWidth",h=a&&a.color||this.color,l=a&&a[g]||b[g]||h;e=a&&a.options.dashStyle||b.dashStyle;var k=a&&a[f]||b[f]||this[f]||0,p=J(a&&a.opacity,b.opacity,1);if(a&&this.zones.length){var r=a.getZone();h=a.options.color||r&&(r.color||a.nonZonedColor)||this.color;r&&(l=r.borderColor||l,e=r.dashStyle||e,k=r.borderWidth||k);}c&&a&&(a=t(b.states[c],a.options.states&&a.options.states[c]||{}),c=a.brightness,h=a.color||"undefined"!==typeof c&&n(h).brighten(a.brightness).get()||
    h,l=a[g]||l,k=a[f]||k,e=a.dashStyle||e,p=J(a.opacity,p));g={fill:h,stroke:l,"stroke-width":k,opacity:p};e&&(g.dashstyle=e);return g};l.prototype.drawPoints=function(){var a=this,c=this.chart,d=a.options,e=c.renderer,f=d.animationLimit||250,h;a.points.forEach(function(b){var g=b.graphic,l=!!g,k=g&&c.pointCount<f?"animate":"attr";if(B(b.plotY)&&null!==b.y){h=b.shapeArgs;g&&b.hasNewShapeType()&&(g=g.destroy());a.enabledDataSorting&&(b.startXPos=a.xAxis.reversed?-(h?h.width||0:0):a.xAxis.width);g||(b.graphic=
    g=e[b.shapeType](h).add(b.group||a.group))&&a.enabledDataSorting&&c.hasRendered&&c.pointCount<f&&(g.attr({x:b.startXPos}),l=!0,k="animate");if(g&&l)g[k](t(h));if(d.borderRadius)g[k]({r:d.borderRadius});c.styledMode||g[k](a.pointAttribs(b,b.selected&&"select")).shadow(!1!==b.allowShadow&&d.shadow,null,d.stacking&&!d.borderRadius);g&&(g.addClass(b.getClassName(),!0),g.attr({visibility:b.visible?"inherit":"hidden"}));}else g&&(b.graphic=g.destroy());});};l.prototype.drawTracker=function(){var a=this,e=
    a.chart,d=e.pointer,f=function(a){var b=d.getPointFromEvent(a);"undefined"!==typeof b&&(d.isDirectTouch=!0,b.onMouseOver(a));},h;a.points.forEach(function(a){h=p(a.dataLabels)?a.dataLabels:a.dataLabel?[a.dataLabel]:[];a.graphic&&(a.graphic.element.point=a);h.forEach(function(b){b.div?b.div.point=a:b.element.point=a;});});a._hasTracking||(a.trackerGroups.forEach(function(b){if(a[b]){a[b].addClass("highcharts-tracker").on("mouseover",f).on("mouseout",function(a){d.onTrackerMouseOut(a);});if(k)a[b].on("touchstart",
    f);!e.styledMode&&a.options.cursor&&a[b].css(c).css({cursor:a.options.cursor});}}),a._hasTracking=!0);w(this,"afterDrawTracker");};l.prototype.remove=function(){var a=this,c=a.chart;c.hasRendered&&c.series.forEach(function(b){b.type===a.type&&(b.isDirty=!0);});y.prototype.remove.apply(a,arguments);};l.defaultOptions=t(y.defaultOptions,{borderRadius:0,centerInCategory:!1,groupPadding:.2,marker:null,pointPadding:.1,minPointLength:0,cropThreshold:50,pointRange:null,states:{hover:{halo:!1,brightness:.1},
    select:{color:"#cccccc",borderColor:"#000000"}},dataLabels:{align:void 0,verticalAlign:void 0,y:void 0},startFromThreshold:!0,stickyTracking:!1,tooltip:{distance:6},threshold:0,borderColor:"#ffffff"});return l}(y);f(H.prototype,{cropShoulder:0,directTouch:!0,drawLegendSymbol:F.drawRectangle,getSymbol:a,negStacks:!0,trackerGroups:["group","dataLabelsGroup"]});G.registerSeriesType("column",H);return H});M(a,"Core/Series/DataLabel.js",[a["Core/Animation/AnimationUtilities.js"],a["Core/FormatUtilities.js"],
    a["Core/Utilities.js"]],function(a,u,z){var v=a.getDeferredAnimation,y=u.format,G=z.defined,H=z.extend,A=z.fireEvent,q=z.isArray,n=z.merge,k=z.objectEach,e=z.pick,c=z.splat,h;(function(a){function f(a,b,c,d,f){var g=this,h=this.chart,l=this.isCartesian&&h.inverted,k=this.enabledDataSorting,m=e(a.dlBox&&a.dlBox.centerX,a.plotX,-9999),n=e(a.plotY,-9999),p=b.getBBox(),r=c.rotation,q=c.align,t=h.isInsidePlot(m,Math.round(n),{inverted:l,paneCoordinates:!0,series:g}),v=function(c){k&&g.xAxis&&!u&&g.setDataLabelStartPos(a,
    b,f,t,c);},u="justify"===e(c.overflow,k?"none":"justify"),w=this.visible&&!1!==a.visible&&(a.series.forceDL||k&&!u||t||e(c.inside,!!this.options.stacking)&&d&&h.isInsidePlot(m,l?d.x+1:d.y+d.height-1,{inverted:l,paneCoordinates:!0,series:g}));if(w){var C=h.renderer.fontMetrics(h.styledMode?void 0:c.style.fontSize,b).b;d=H({x:l?this.yAxis.len-n:m,y:Math.round(l?this.xAxis.len-m:n),width:0,height:0},d);H(c,{width:p.width,height:p.height});r?(u=!1,m=h.renderer.rotCorr(C,r),m={x:d.x+(c.x||0)+d.width/2+
    m.x,y:d.y+(c.y||0)+{top:0,middle:.5,bottom:1}[c.verticalAlign]*d.height},v(m),b[f?"attr":"animate"](m).attr({align:q}),v=(r+720)%360,v=180<v&&360>v,"left"===q?m.y-=v?p.height:0:"center"===q?(m.x-=p.width/2,m.y-=p.height/2):"right"===q&&(m.x-=p.width,m.y-=v?0:p.height),b.placed=!0,b.alignAttr=m):(v(d),b.align(c,void 0,d),m=b.alignAttr);u&&0<=d.height?this.justifyDataLabel(b,c,m,p,d,f):e(c.crop,!0)&&(w=h.isInsidePlot(m.x,m.y,{paneCoordinates:!0,series:g})&&h.isInsidePlot(m.x+p.width,m.y+p.height,{paneCoordinates:!0,
    series:g}));if(c.shape&&!r)b[f?"attr":"animate"]({anchorX:l?h.plotWidth-a.plotY:a.plotX,anchorY:l?h.plotHeight-a.plotX:a.plotY});}f&&k&&(b.placed=!1);w||k&&!u||(b.hide(!0),b.placed=!1);}function h(a,b){var c=b.filter;return c?(b=c.operator,a=a[c.property],c=c.value,">"===b&&a>c||"<"===b&&a<c||">="===b&&a>=c||"<="===b&&a<=c||"=="===b&&a==c||"==="===b&&a===c?!0:!1):!0}function u(){var a=this,b=a.chart,g=a.options,d=a.points,f=a.hasRendered||0,n=b.renderer,p=g.dataLabels,r,t=p.animation;t=p.defer?v(b,
    t,a):{defer:0,duration:0};p=z(z(b.options.plotOptions&&b.options.plotOptions.series&&b.options.plotOptions.series.dataLabels,b.options.plotOptions&&b.options.plotOptions[a.type]&&b.options.plotOptions[a.type].dataLabels),p);A(this,"drawDataLabels");if(q(p)||p.enabled||a._hasPointLabels){var u=a.plotGroup("dataLabelsGroup","data-labels",f?"inherit":"hidden",p.zIndex||6);u.attr({opacity:+f});!f&&(f=a.dataLabelsGroup)&&(a.visible&&u.show(!0),f[g.animation?"animate":"attr"]({opacity:1},t));d.forEach(function(d){r=
    c(z(p,d.dlOptions||d.options&&d.options.dataLabels));r.forEach(function(c,f){var l=c.enabled&&(!d.isNull||d.dataLabelOnNull)&&h(d,c),m=d.connectors?d.connectors[f]:d.connector,p=d.dataLabels?d.dataLabels[f]:d.dataLabel,r=e(c.distance,d.labelDistance),q=!p;if(l){var t=d.getLabelConfig();var v=e(c[d.formatPrefix+"Format"],c.format);t=G(v)?y(v,t,b):(c[d.formatPrefix+"Formatter"]||c.formatter).call(t,c);v=c.style;var w=c.rotation;b.styledMode||(v.color=e(c.color,v.color,a.color,"#000000"),"contrast"===
    v.color?(d.contrastColor=n.getContrast(d.color||a.color),v.color=!G(r)&&c.inside||0>r||g.stacking?d.contrastColor:"#000000"):delete d.contrastColor,g.cursor&&(v.cursor=g.cursor));var C={r:c.borderRadius||0,rotation:w,padding:c.padding,zIndex:1};b.styledMode||(C.fill=c.backgroundColor,C.stroke=c.borderColor,C["stroke-width"]=c.borderWidth);k(C,function(a,b){"undefined"===typeof a&&delete C[b];});}!p||l&&G(t)&&!!p.div===!!c.useHTML||(d.dataLabel=p=d.dataLabel&&d.dataLabel.destroy(),d.dataLabels&&(1===
    d.dataLabels.length?delete d.dataLabels:delete d.dataLabels[f]),f||delete d.dataLabel,m&&(d.connector=d.connector.destroy(),d.connectors&&(1===d.connectors.length?delete d.connectors:delete d.connectors[f])));l&&G(t)&&(p?C.text=t:(d.dataLabels=d.dataLabels||[],p=d.dataLabels[f]=w?n.text(t,0,-9999,c.useHTML).addClass("highcharts-data-label"):n.label(t,0,-9999,c.shape,null,null,c.useHTML,null,"data-label"),f||(d.dataLabel=p),p.addClass(" highcharts-data-label-color-"+d.colorIndex+" "+(c.className||
    "")+(c.useHTML?" highcharts-tracker":""))),p.options=c,p.attr(C),b.styledMode||p.css(v).shadow(c.shadow),p.added||p.add(u),c.textPath&&!c.useHTML&&(p.setTextPath(d.getDataLabelPath&&d.getDataLabelPath(p)||d.graphic,c.textPath),d.dataLabelPath&&!c.textPath.enabled&&(d.dataLabelPath=d.dataLabelPath.destroy())),a.alignDataLabel(d,p,c,null,q));});});}A(this,"afterDrawDataLabels");}function t(a,b,c,d,e,f){var g=this.chart,h=b.align,k=b.verticalAlign,l=a.box?0:a.padding||0,m=b.x;m=void 0===m?0:m;var n=b.y;
    n=void 0===n?0:n;var p=(c.x||0)+l;if(0>p){"right"===h&&0<=m?(b.align="left",b.inside=!0):m-=p;var r=!0;}p=(c.x||0)+d.width-l;p>g.plotWidth&&("left"===h&&0>=m?(b.align="right",b.inside=!0):m+=g.plotWidth-p,r=!0);p=c.y+l;0>p&&("bottom"===k&&0<=n?(b.verticalAlign="top",b.inside=!0):n-=p,r=!0);p=(c.y||0)+d.height-l;p>g.plotHeight&&("top"===k&&0>=n?(b.verticalAlign="bottom",b.inside=!0):n+=g.plotHeight-p,r=!0);r&&(b.x=m,b.y=n,a.placed=!f,a.align(b,void 0,e));return r}function z(a,b){var c=[],d;if(q(a)&&
    !q(b))c=a.map(function(a){return n(a,b)});else if(q(b)&&!q(a))c=b.map(function(b){return n(a,b)});else if(q(a)||q(b))for(d=Math.max(a.length,b.length);d--;)c[d]=n(a[d],b[d]);else c=n(a,b);return c}function C(a,b,c,d,e){var g=this.chart,f=g.inverted,h=this.xAxis,k=h.reversed,l=f?b.height/2:b.width/2;a=(a=a.pointWidth)?a/2:0;b.startXPos=f?e.x:k?-l-a:h.width-l+a;b.startYPos=f?k?this.yAxis.height-l+a:-l-a:e.y;d?"hidden"===b.visibility&&(b.show(),b.attr({opacity:0}).animate({opacity:1})):b.attr({opacity:1}).animate({opacity:0},
    void 0,b.hide);g.hasRendered&&(c&&b.attr({x:b.startXPos,y:b.startYPos}),b.placed=!0);}var r=[];a.compose=function(a){if(-1===r.indexOf(a)){var b=a.prototype;r.push(a);b.alignDataLabel=f;b.drawDataLabels=u;b.justifyDataLabel=t;b.setDataLabelStartPos=C;}};})(h||(h={}));return h});M(a,"Series/Column/ColumnDataLabel.js",[a["Core/Series/DataLabel.js"],a["Core/Series/SeriesRegistry.js"],a["Core/Utilities.js"]],function(a,u,z){var v=u.series,y=z.merge,G=z.pick,H;(function(u){function q(a,e,c,h,f){var k=
    this.chart.inverted,n=a.series,q=(n.xAxis?n.xAxis.len:this.chart.plotSizeX)||0;n=(n.yAxis?n.yAxis.len:this.chart.plotSizeY)||0;var t=a.dlBox||a.shapeArgs,u=G(a.below,a.plotY>G(this.translatedThreshold,n)),C=G(c.inside,!!this.options.stacking);t&&(h=y(t),0>h.y&&(h.height+=h.y,h.y=0),t=h.y+h.height-n,0<t&&t<h.height&&(h.height-=t),k&&(h={x:n-h.y-h.height,y:q-h.x-h.width,width:h.height,height:h.width}),C||(k?(h.x+=u?0:h.width,h.width=0):(h.y+=u?h.height:0,h.height=0)));c.align=G(c.align,!k||C?"center":
    u?"right":"left");c.verticalAlign=G(c.verticalAlign,k||C?"middle":u?"top":"bottom");v.prototype.alignDataLabel.call(this,a,e,c,h,f);c.inside&&a.contrastColor&&e.css({color:a.contrastColor});}var n=[];u.compose=function(k){a.compose(v);-1===n.indexOf(k)&&(n.push(k),k.prototype.alignDataLabel=q);};})(H||(H={}));return H});M(a,"Series/Bar/BarSeries.js",[a["Series/Column/ColumnSeries.js"],a["Core/Series/SeriesRegistry.js"],a["Core/Utilities.js"]],function(a,u,z){var v=this&&this.__extends||function(){var a=
    function(v,q){a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(a,k){a.__proto__=k;}||function(a,k){for(var e in k)k.hasOwnProperty(e)&&(a[e]=k[e]);};return a(v,q)};return function(v,q){function n(){this.constructor=v;}a(v,q);v.prototype=null===q?Object.create(q):(n.prototype=q.prototype,new n);}}(),y=z.extend,G=z.merge;z=function(u){function y(){var a=null!==u&&u.apply(this,arguments)||this;a.data=void 0;a.options=void 0;a.points=void 0;return a}v(y,u);y.defaultOptions=G(a.defaultOptions,
    {});return y}(a);y(z.prototype,{inverted:!0});u.registerSeriesType("bar",z);return z});M(a,"Series/Scatter/ScatterSeries.js",[a["Series/Column/ColumnSeries.js"],a["Series/Line/LineSeries.js"],a["Core/Series/SeriesRegistry.js"],a["Core/Utilities.js"]],function(a,u,z,F){var v=this&&this.__extends||function(){var a=function(n,k){a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(a,c){a.__proto__=c;}||function(a,c){for(var e in c)c.hasOwnProperty(e)&&(a[e]=c[e]);};return a(n,k)};return function(n,
    k){function e(){this.constructor=n;}a(n,k);n.prototype=null===k?Object.create(k):(e.prototype=k.prototype,new e);}}(),G=F.addEvent,H=F.extend,A=F.merge;F=function(a){function n(){var k=null!==a&&a.apply(this,arguments)||this;k.data=void 0;k.options=void 0;k.points=void 0;return k}v(n,a);n.prototype.applyJitter=function(){var a=this,e=this.options.jitter,c=this.points.length;e&&this.points.forEach(function(h,f){["x","y"].forEach(function(k,n){var p="plot"+k.toUpperCase();if(e[k]&&!h.isNull){var q=a[k+
    "Axis"];var v=e[k]*q.transA;if(q&&!q.isLog){var u=Math.max(0,h[p]-v);q=Math.min(q.len,h[p]+v);n=1E4*Math.sin(f+n*c);h[p]=u+(q-u)*(n-Math.floor(n));"x"===k&&(h.clientX=h.plotX);}}});});};n.prototype.drawGraph=function(){this.options.lineWidth?a.prototype.drawGraph.call(this):this.graph&&(this.graph=this.graph.destroy());};n.defaultOptions=A(u.defaultOptions,{lineWidth:0,findNearestPointBy:"xy",jitter:{x:0,y:0},marker:{enabled:!0},tooltip:{headerFormat:'<span style="color:{point.color}">\u25cf</span> <span style="font-size: 10px"> {series.name}</span><br/>',
    pointFormat:"x: <b>{point.x}</b><br/>y: <b>{point.y}</b><br/>"}});return n}(u);H(F.prototype,{drawTracker:a.prototype.drawTracker,sorted:!1,requireSorting:!1,noSharedTooltip:!0,trackerGroups:["group","markerGroup","dataLabelsGroup"],takeOrdinalPosition:!1});G(F,"afterTranslate",function(){this.applyJitter();});z.registerSeriesType("scatter",F);return F});M(a,"Series/CenteredUtilities.js",[a["Core/Globals.js"],a["Core/Series/Series.js"],a["Core/Utilities.js"]],function(a,u,z){var v=a.deg2rad,y=z.isNumber,
    G=z.pick,H=z.relativeLength,A;(function(a){a.getCenter=function(){var a=this.options,k=this.chart,e=2*(a.slicedOffset||0),c=k.plotWidth-2*e,h=k.plotHeight-2*e,f=a.center,q=Math.min(c,h),p=a.size,v=a.innerSize||0;"string"===typeof p&&(p=parseFloat(p));"string"===typeof v&&(v=parseFloat(v));a=[G(f[0],"50%"),G(f[1],"50%"),G(p&&0>p?void 0:a.size,"100%"),G(v&&0>v?void 0:a.innerSize||0,"0%")];!k.angular||this instanceof u||(a[3]=0);for(f=0;4>f;++f)p=a[f],k=2>f||2===f&&/%$/.test(p),a[f]=H(p,[c,h,q,a[2]][f])+
    (k?e:0);a[3]>a[2]&&(a[3]=a[2]);return a};a.getStartAndEndRadians=function(a,k){a=y(a)?a:0;k=y(k)&&k>a&&360>k-a?k:a+360;return {start:v*(a+-90),end:v*(k+-90)}};})(A||(A={}));return A});M(a,"Series/Pie/PiePoint.js",[a["Core/Animation/AnimationUtilities.js"],a["Core/Series/Point.js"],a["Core/Utilities.js"]],function(a,u,z){var v=this&&this.__extends||function(){var a=function(e,c){a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(a,c){a.__proto__=c;}||function(a,c){for(var e in c)c.hasOwnProperty(e)&&
    (a[e]=c[e]);};return a(e,c)};return function(e,c){function h(){this.constructor=e;}a(e,c);e.prototype=null===c?Object.create(c):(h.prototype=c.prototype,new h);}}(),y=a.setAnimation,G=z.addEvent,H=z.defined;a=z.extend;var A=z.isNumber,q=z.pick,n=z.relativeLength;u=function(a){function e(){var c=null!==a&&a.apply(this,arguments)||this;c.labelDistance=void 0;c.options=void 0;c.series=void 0;return c}v(e,a);e.prototype.getConnectorPath=function(){var a=this.labelPosition,e=this.series.options.dataLabels,
    f=this.connectorShapes,k=e.connectorShape;f[k]&&(k=f[k]);return k.call(this,{x:a.final.x,y:a.final.y,alignment:a.alignment},a.connectorPosition,e)};e.prototype.getTranslate=function(){return this.sliced?this.slicedTranslation:{translateX:0,translateY:0}};e.prototype.haloPath=function(a){var c=this.shapeArgs;return this.sliced||!this.visible?[]:this.series.chart.renderer.symbols.arc(c.x,c.y,c.r+a,c.r+a,{innerR:c.r-1,start:c.start,end:c.end})};e.prototype.init=function(){var c=this;a.prototype.init.apply(this,
    arguments);this.name=q(this.name,"Slice");var e=function(a){c.slice("select"===a.type);};G(this,"select",e);G(this,"unselect",e);return this};e.prototype.isValid=function(){return A(this.y)&&0<=this.y};e.prototype.setVisible=function(a,e){var c=this,h=this.series,k=h.chart,n=h.options.ignoreHiddenPoint;e=q(e,n);a!==this.visible&&(this.visible=this.options.visible=a="undefined"===typeof a?!this.visible:a,h.options.data[h.data.indexOf(this)]=this.options,["graphic","dataLabel","connector","shadowGroup"].forEach(function(e){if(c[e])c[e][a?
    "show":"hide"](a);}),this.legendItem&&k.legend.colorizeItem(this,a),a||"hover"!==this.state||this.setState(""),n&&(h.isDirty=!0),e&&k.redraw());};e.prototype.slice=function(a,e,f){var c=this.series;y(f,c.chart);q(e,!0);this.sliced=this.options.sliced=H(a)?a:!this.sliced;c.options.data[c.data.indexOf(this)]=this.options;this.graphic&&this.graphic.animate(this.getTranslate());this.shadowGroup&&this.shadowGroup.animate(this.getTranslate());};return e}(u);a(u.prototype,{connectorShapes:{fixedOffset:function(a,
    e,c){var h=e.breakAt;e=e.touchingSliceAt;return [["M",a.x,a.y],c.softConnector?["C",a.x+("left"===a.alignment?-5:5),a.y,2*h.x-e.x,2*h.y-e.y,h.x,h.y]:["L",h.x,h.y],["L",e.x,e.y]]},straight:function(a,e){e=e.touchingSliceAt;return [["M",a.x,a.y],["L",e.x,e.y]]},crookedLine:function(a,e,c){e=e.touchingSliceAt;var h=this.series,f=h.center[0],k=h.chart.plotWidth,p=h.chart.plotLeft;h=a.alignment;var q=this.shapeArgs.r;c=n(c.crookDistance,1);k="left"===h?f+q+(k+p-f-q)*(1-c):p+(f-q)*c;c=["L",k,a.y];f=!0;if("left"===
    h?k>a.x||k<e.x:k<a.x||k>e.x)f=!1;a=[["M",a.x,a.y]];f&&a.push(c);a.push(["L",e.x,e.y]);return a}}});return u});M(a,"Series/Pie/PieSeries.js",[a["Series/CenteredUtilities.js"],a["Series/Column/ColumnSeries.js"],a["Core/Globals.js"],a["Core/Legend/LegendSymbol.js"],a["Series/Pie/PiePoint.js"],a["Core/Series/Series.js"],a["Core/Series/SeriesRegistry.js"],a["Core/Renderer/SVG/Symbols.js"],a["Core/Utilities.js"]],function(a,u,z,F,y,G,H,A,q){var n=this&&this.__extends||function(){var a=function(c,e){a=Object.setPrototypeOf||
    {__proto__:[]}instanceof Array&&function(a,c){a.__proto__=c;}||function(a,c){for(var e in c)c.hasOwnProperty(e)&&(a[e]=c[e]);};return a(c,e)};return function(c,e){function f(){this.constructor=c;}a(c,e);c.prototype=null===e?Object.create(e):(f.prototype=e.prototype,new f);}}(),k=a.getStartAndEndRadians;z=z.noop;var e=q.clamp,c=q.extend,h=q.fireEvent,f=q.merge,v=q.pick,p=q.relativeLength;q=function(a){function c(){var c=null!==a&&a.apply(this,arguments)||this;c.center=void 0;c.data=void 0;c.maxLabelDistance=
    void 0;c.options=void 0;c.points=void 0;return c}n(c,a);c.prototype.animate=function(a){var c=this,e=c.points,f=c.startAngleRad;a||e.forEach(function(a){var b=a.graphic,d=a.shapeArgs;b&&d&&(b.attr({r:v(a.startR,c.center&&c.center[3]/2),start:f,end:f}),b.animate({r:d.r,start:d.start,end:d.end},c.options.animation));});};c.prototype.drawEmpty=function(){var a=this.startAngleRad,c=this.endAngleRad,e=this.options;if(0===this.total&&this.center){var f=this.center[0];var b=this.center[1];this.graph||(this.graph=
    this.chart.renderer.arc(f,b,this.center[1]/2,0,a,c).addClass("highcharts-empty-series").add(this.group));this.graph.attr({d:A.arc(f,b,this.center[2]/2,0,{start:a,end:c,innerR:this.center[3]/2})});this.chart.styledMode||this.graph.attr({"stroke-width":e.borderWidth,fill:e.fillColor||"none",stroke:e.color||"#cccccc"});}else this.graph&&(this.graph=this.graph.destroy());};c.prototype.drawPoints=function(){var a=this.chart.renderer;this.points.forEach(function(c){c.graphic&&c.hasNewShapeType()&&(c.graphic=
    c.graphic.destroy());c.graphic||(c.graphic=a[c.shapeType](c.shapeArgs).add(c.series.group),c.delayedRendering=!0);});};c.prototype.generatePoints=function(){a.prototype.generatePoints.call(this);this.updateTotals();};c.prototype.getX=function(a,c,f){var h=this.center,b=this.radii?this.radii[f.index]||0:h[2]/2;a=Math.asin(e((a-h[1])/(b+f.labelDistance),-1,1));return h[0]+(c?-1:1)*Math.cos(a)*(b+f.labelDistance)+(0<f.labelDistance?(c?-1:1)*this.options.dataLabels.padding:0)};c.prototype.hasData=function(){return !!this.processedXData.length};
    c.prototype.redrawPoints=function(){var a=this,c=a.chart,e=c.renderer,h=a.options.shadow,b,g,d,k;this.drawEmpty();!h||a.shadowGroup||c.styledMode||(a.shadowGroup=e.g("shadow").attr({zIndex:-1}).add(a.group));a.points.forEach(function(l){var m={};g=l.graphic;if(!l.isNull&&g){var n=void 0;k=l.shapeArgs;b=l.getTranslate();c.styledMode||(n=l.shadowGroup,h&&!n&&(n=l.shadowGroup=e.g("shadow").add(a.shadowGroup)),n&&n.attr(b),d=a.pointAttribs(l,l.selected&&"select"));l.delayedRendering?(g.setRadialReference(a.center).attr(k).attr(b),
    c.styledMode||g.attr(d).attr({"stroke-linejoin":"round"}).shadow(h,n),l.delayedRendering=!1):(g.setRadialReference(a.center),c.styledMode||f(!0,m,d),f(!0,m,k,b),g.animate(m));g.attr({visibility:l.visible?"inherit":"hidden"});g.addClass(l.getClassName(),!0);}else g&&(l.graphic=g.destroy());});};c.prototype.sortByAngle=function(a,c){a.sort(function(a,e){return "undefined"!==typeof a.angle&&(e.angle-a.angle)*c});};c.prototype.translate=function(a){this.generatePoints();var c=this.options,e=c.slicedOffset,
    f=e+(c.borderWidth||0),b=k(c.startAngle,c.endAngle),g=this.startAngleRad=b.start;b=(this.endAngleRad=b.end)-g;var d=this.points,m=c.dataLabels.distance;c=c.ignoreHiddenPoint;var n=d.length,q,t=0;a||(this.center=a=this.getCenter());for(q=0;q<n;q++){var u=d[q];var w=g+t*b;!u.isValid()||c&&!u.visible||(t+=u.percentage/100);var y=g+t*b;var B={x:a[0],y:a[1],r:a[2]/2,innerR:a[3]/2,start:Math.round(1E3*w)/1E3,end:Math.round(1E3*y)/1E3};u.shapeType="arc";u.shapeArgs=B;u.labelDistance=v(u.options.dataLabels&&
    u.options.dataLabels.distance,m);u.labelDistance=p(u.labelDistance,B.r);this.maxLabelDistance=Math.max(this.maxLabelDistance||0,u.labelDistance);y=(y+w)/2;y>1.5*Math.PI?y-=2*Math.PI:y<-Math.PI/2&&(y+=2*Math.PI);u.slicedTranslation={translateX:Math.round(Math.cos(y)*e),translateY:Math.round(Math.sin(y)*e)};B=Math.cos(y)*a[2]/2;var A=Math.sin(y)*a[2]/2;u.tooltipPos=[a[0]+.7*B,a[1]+.7*A];u.half=y<-Math.PI/2||y>Math.PI/2?1:0;u.angle=y;w=Math.min(f,u.labelDistance/5);u.labelPosition={natural:{x:a[0]+B+
    Math.cos(y)*u.labelDistance,y:a[1]+A+Math.sin(y)*u.labelDistance},"final":{},alignment:0>u.labelDistance?"center":u.half?"right":"left",connectorPosition:{breakAt:{x:a[0]+B+Math.cos(y)*w,y:a[1]+A+Math.sin(y)*w},touchingSliceAt:{x:a[0]+B,y:a[1]+A}}};}h(this,"afterTranslate");};c.prototype.updateTotals=function(){var a=this.points,c=a.length,e=this.options.ignoreHiddenPoint,f,b=0;for(f=0;f<c;f++){var g=a[f];!g.isValid()||e&&!g.visible||(b+=g.y);}this.total=b;for(f=0;f<c;f++)g=a[f],g.percentage=0<b&&(g.visible||
    !e)?g.y/b*100:0,g.total=b;};c.defaultOptions=f(G.defaultOptions,{center:[null,null],clip:!1,colorByPoint:!0,dataLabels:{allowOverlap:!0,connectorPadding:5,connectorShape:"fixedOffset",crookDistance:"70%",distance:30,enabled:!0,formatter:function(){return this.point.isNull?void 0:this.point.name},softConnector:!0,x:0},fillColor:void 0,ignoreHiddenPoint:!0,inactiveOtherPoints:!0,legendType:"point",marker:null,size:null,showInLegend:!1,slicedOffset:10,stickyTracking:!1,tooltip:{followPointer:!0},borderColor:"#ffffff",
    borderWidth:1,lineWidth:void 0,states:{hover:{brightness:.1}}});return c}(G);c(q.prototype,{axisTypes:[],directTouch:!0,drawGraph:void 0,drawLegendSymbol:F.drawRectangle,drawTracker:u.prototype.drawTracker,getCenter:a.getCenter,getSymbol:z,isCartesian:!1,noSharedTooltip:!0,pointAttribs:u.prototype.pointAttribs,pointClass:y,requireSorting:!1,searchPoint:z,trackerGroups:["group","dataLabelsGroup"]});H.registerSeriesType("pie",q);return q});M(a,"Series/Pie/PieDataLabel.js",[a["Core/Series/DataLabel.js"],
    a["Core/Globals.js"],a["Core/Renderer/RendererUtilities.js"],a["Core/Series/SeriesRegistry.js"],a["Core/Utilities.js"]],function(a,u,z,F,y){var v=u.noop,H=z.distribute,A=F.series,q=y.arrayMax,n=y.clamp,k=y.defined,e=y.merge,c=y.pick,h=y.relativeLength,f;(function(f){function p(){var a=this,f=a.data,b=a.chart,g=a.options.dataLabels||{},d=g.connectorPadding,h=b.plotWidth,n=b.plotHeight,p=b.plotLeft,v=Math.round(b.chartWidth/3),t=a.center,u=t[2]/2,w=t[1],C=[[],[]],y=[0,0,0,0],B=a.dataLabelPositioners,
    z,F,G,J,M,E,T,N,V,W,X,R;a.visible&&(g.enabled||a._hasPointLabels)&&(f.forEach(function(a){a.dataLabel&&a.visible&&a.dataLabel.shortened&&(a.dataLabel.attr({width:"auto"}).css({width:"auto",textOverflow:"clip"}),a.dataLabel.shortened=!1);}),A.prototype.drawDataLabels.apply(a),f.forEach(function(a){a.dataLabel&&(a.visible?(C[a.half].push(a),a.dataLabel._pos=null,!k(g.style.width)&&!k(a.options.dataLabels&&a.options.dataLabels.style&&a.options.dataLabels.style.width)&&a.dataLabel.getBBox().width>v&&(a.dataLabel.css({width:Math.round(.7*
    v)+"px"}),a.dataLabel.shortened=!0)):(a.dataLabel=a.dataLabel.destroy(),a.dataLabels&&1===a.dataLabels.length&&delete a.dataLabels));}),C.forEach(function(e,f){var l=e.length,m=[],r;if(l){a.sortByAngle(e,f-.5);if(0<a.maxLabelDistance){var q=Math.max(0,w-u-a.maxLabelDistance);var v=Math.min(w+u+a.maxLabelDistance,b.plotHeight);e.forEach(function(a){0<a.labelDistance&&a.dataLabel&&(a.top=Math.max(0,w-u-a.labelDistance),a.bottom=Math.min(w+u+a.labelDistance,b.plotHeight),r=a.dataLabel.getBBox().height||
    21,a.distributeBox={target:a.labelPosition.natural.y-a.top+r/2,size:r,rank:a.y},m.push(a.distributeBox));});q=v+r-q;H(m,q,q/5);}for(X=0;X<l;X++){z=e[X];E=z.labelPosition;J=z.dataLabel;W=!1===z.visible?"hidden":"inherit";V=q=E.natural.y;m&&k(z.distributeBox)&&("undefined"===typeof z.distributeBox.pos?W="hidden":(T=z.distributeBox.size,V=B.radialDistributionY(z)));delete z.positionIndex;if(g.justify)N=B.justify(z,u,t);else switch(g.alignTo){case "connectors":N=B.alignToConnectors(e,f,h,p);break;case "plotEdges":N=
    B.alignToPlotEdges(J,f,h,p);break;default:N=B.radialDistributionX(a,z,V,q);}J._attr={visibility:W,align:E.alignment};R=z.options.dataLabels||{};J._pos={x:N+c(R.x,g.x)+({left:d,right:-d}[E.alignment]||0),y:V+c(R.y,g.y)-10};E.final.x=N;E.final.y=V;c(g.crop,!0)&&(M=J.getBBox().width,q=null,N-M<d&&1===f?(q=Math.round(M-N+d),y[3]=Math.max(q,y[3])):N+M>h-d&&0===f&&(q=Math.round(N+M-h+d),y[1]=Math.max(q,y[1])),0>V-T/2?y[0]=Math.max(Math.round(-V+T/2),y[0]):V+T/2>n&&(y[2]=Math.max(Math.round(V+T/2-n),y[2])),
    J.sideOverflow=q);}}}),0===q(y)||this.verifyDataLabelOverflow(y))&&(this.placeDataLabels(),this.points.forEach(function(d){R=e(g,d.options.dataLabels);if(F=c(R.connectorWidth,1)){var f;G=d.connector;if((J=d.dataLabel)&&J._pos&&d.visible&&0<d.labelDistance){W=J._attr.visibility;if(f=!G)d.connector=G=b.renderer.path().addClass("highcharts-data-label-connector  highcharts-color-"+d.colorIndex+(d.className?" "+d.className:"")).add(a.dataLabelsGroup),b.styledMode||G.attr({"stroke-width":F,stroke:R.connectorColor||
    d.color||"#666666"});G[f?"attr":"animate"]({d:d.getConnectorPath()});G.attr("visibility",W);}else G&&(d.connector=G.destroy());}}));}function u(){this.points.forEach(function(a){var c=a.dataLabel,b;c&&a.visible&&((b=c._pos)?(c.sideOverflow&&(c._attr.width=Math.max(c.getBBox().width-c.sideOverflow,0),c.css({width:c._attr.width+"px",textOverflow:(this.options.dataLabels.style||{}).textOverflow||"ellipsis"}),c.shortened=!0),c.attr(c._attr),c[c.moved?"animate":"attr"](b),c.moved=!0):c&&c.attr({y:-9999}));
    delete a.distributeBox;},this);}function t(a){var c=this.center,b=this.options,e=b.center,d=b.minSize||80,f=null!==b.size;if(!f){if(null!==e[0])var k=Math.max(c[2]-Math.max(a[1],a[3]),d);else k=Math.max(c[2]-a[1]-a[3],d),c[0]+=(a[3]-a[1])/2;null!==e[1]?k=n(k,d,c[2]-Math.max(a[0],a[2])):(k=n(k,d,c[2]-a[0]-a[2]),c[1]+=(a[0]-a[2])/2);k<c[2]?(c[2]=k,c[3]=Math.min(h(b.innerSize||0,k),k),this.translate(c),this.drawDataLabels&&this.drawDataLabels()):f=!0;}return f}var w=[],C={radialDistributionY:function(a){return a.top+
    a.distributeBox.pos},radialDistributionX:function(a,c,b,e){return a.getX(b<c.top+2||b>c.bottom-2?e:b,c.half,c)},justify:function(a,c,b){return b[0]+(a.half?-1:1)*(c+a.labelDistance)},alignToPlotEdges:function(a,c,b,e){a=a.getBBox().width;return c?a+e:b-a-e},alignToConnectors:function(a,c,b,e){var d=0,g;a.forEach(function(a){g=a.dataLabel.getBBox().width;g>d&&(d=g);});return c?d+e:b-d-e}};f.compose=function(c){a.compose(A);-1===w.indexOf(c)&&(w.push(c),c=c.prototype,c.dataLabelPositioners=C,c.alignDataLabel=
    v,c.drawDataLabels=p,c.placeDataLabels=u,c.verifyDataLabelOverflow=t);};})(f||(f={}));return f});M(a,"Extensions/OverlappingDataLabels.js",[a["Core/Chart/Chart.js"],a["Core/Utilities.js"]],function(a,u){function v(a,k){var e=!1;if(a){var c=a.newOpacity;a.oldOpacity!==c&&(a.alignAttr&&a.placed?(a[c?"removeClass":"addClass"]("highcharts-data-label-hidden"),e=!0,a.alignAttr.opacity=c,a[a.isOld?"animate":"attr"](a.alignAttr,null,function(){k.styledMode||a.css({pointerEvents:c?"auto":"none"});}),y(k,"afterHideOverlappingLabel")):
    a.attr({opacity:c}));a.isOld=!0;}return e}var F=u.addEvent,y=u.fireEvent,G=u.isArray,H=u.isNumber,A=u.objectEach,q=u.pick;F(a,"render",function(){var a=this,k=[];(this.labelCollectors||[]).forEach(function(a){k=k.concat(a());});(this.yAxis||[]).forEach(function(a){a.stacking&&a.options.stackLabels&&!a.options.stackLabels.allowOverlap&&A(a.stacking.stacks,function(a){A(a,function(a){a.label&&"hidden"!==a.label.visibility&&k.push(a.label);});});});(this.series||[]).forEach(function(e){var c=e.options.dataLabels;
    e.visible&&(!1!==c.enabled||e._hasPointLabels)&&(c=function(c){return c.forEach(function(c){c.visible&&(G(c.dataLabels)?c.dataLabels:c.dataLabel?[c.dataLabel]:[]).forEach(function(e){var f=e.options;e.labelrank=q(f.labelrank,c.labelrank,c.shapeArgs&&c.shapeArgs.height);f.allowOverlap?(e.oldOpacity=e.opacity,e.newOpacity=1,v(e,a)):k.push(e);});})},c(e.nodes||[]),c(e.points));});this.hideOverlappingLabels(k);});a.prototype.hideOverlappingLabels=function(a){var k=this,e=a.length,c=k.renderer,h,f,n,p=!1;
    var q=function(a){var e,f=a.box?0:a.padding||0,b=e=0,g;if(a&&(!a.alignAttr||a.placed)){var d=a.alignAttr||{x:a.attr("x"),y:a.attr("y")};var h=a.parentGroup;a.width||(e=a.getBBox(),a.width=e.width,a.height=e.height,e=c.fontMetrics(null,a.element).h);var k=a.width-2*f;(g={left:"0",center:"0.5",right:"1"}[a.alignValue])?b=+g*k:H(a.x)&&Math.round(a.x)!==a.translateX&&(b=a.x-a.translateX);return {x:d.x+(h.translateX||0)+f-(b||0),y:d.y+(h.translateY||0)+f-e,width:a.width-2*f,height:a.height-2*f}}};for(f=
    0;f<e;f++)if(h=a[f])h.oldOpacity=h.opacity,h.newOpacity=1,h.absoluteBox=q(h);a.sort(function(a,c){return (c.labelrank||0)-(a.labelrank||0)});for(f=0;f<e;f++){var t=(q=a[f])&&q.absoluteBox;for(h=f+1;h<e;++h){var u=(n=a[h])&&n.absoluteBox;!t||!u||q===n||0===q.newOpacity||0===n.newOpacity||u.x>=t.x+t.width||u.x+u.width<=t.x||u.y>=t.y+t.height||u.y+u.height<=t.y||((q.labelrank<n.labelrank?q:n).newOpacity=0);}}a.forEach(function(a){v(a,k)&&(p=!0);});p&&y(k,"afterHideAllOverlappingLabels");};});M(a,"Core/Responsive.js",
    [a["Core/Utilities.js"]],function(a){var v=a.extend,z=a.find,F=a.isArray,y=a.isObject,G=a.merge,H=a.objectEach,A=a.pick,q=a.splat,n=a.uniqueKey,k;(function(a){var c=[];a.compose=function(a){-1===c.indexOf(a)&&(c.push(a),v(a.prototype,e.prototype));return a};var e=function(){function a(){}a.prototype.currentOptions=function(a){function c(a,f,h,k){var b;H(a,function(a,d){if(!k&&-1<e.collectionsWithUpdate.indexOf(d)&&f[d])for(a=q(a),h[d]=[],b=0;b<Math.max(a.length,f[d].length);b++)f[d][b]&&(void 0===
    a[b]?h[d][b]=f[d][b]:(h[d][b]={},c(a[b],f[d][b],h[d][b],k+1)));else y(a)?(h[d]=F(a)?[]:{},c(a,f[d]||{},h[d],k+1)):h[d]="undefined"===typeof f[d]?null:f[d];});}var e=this,f={};c(a,this.options,f,0);return f};a.prototype.matchResponsiveRule=function(a,c){var e=a.condition;(e.callback||function(){return this.chartWidth<=A(e.maxWidth,Number.MAX_VALUE)&&this.chartHeight<=A(e.maxHeight,Number.MAX_VALUE)&&this.chartWidth>=A(e.minWidth,0)&&this.chartHeight>=A(e.minHeight,0)}).call(this)&&c.push(a._id);};a.prototype.setResponsive=
    function(a,c){var e=this,f=this.options.responsive,h=this.currentResponsive,k=[];!c&&f&&f.rules&&f.rules.forEach(function(a){"undefined"===typeof a._id&&(a._id=n());e.matchResponsiveRule(a,k);},this);c=G.apply(void 0,k.map(function(a){return z((f||{}).rules||[],function(c){return c._id===a})}).map(function(a){return a&&a.chartOptions}));c.isResponsiveOptions=!0;k=k.toString()||void 0;k!==(h&&h.ruleIds)&&(h&&this.update(h.undoOptions,a,!0),k?(h=this.currentOptions(c),h.isResponsiveOptions=!0,this.currentResponsive=
    {ruleIds:k,mergedOptions:c,undoOptions:h},this.update(c,a,!0)):this.currentResponsive=void 0);};return a}();})(k||(k={}));return k});M(a,"masters/highcharts.src.js",[a["Core/Globals.js"],a["Core/Utilities.js"],a["Core/DefaultOptions.js"],a["Core/Animation/Fx.js"],a["Core/Animation/AnimationUtilities.js"],a["Core/Renderer/HTML/AST.js"],a["Core/FormatUtilities.js"],a["Core/Renderer/RendererUtilities.js"],a["Core/Renderer/SVG/SVGElement.js"],a["Core/Renderer/SVG/SVGRenderer.js"],a["Core/Renderer/HTML/HTMLElement.js"],
    a["Core/Renderer/HTML/HTMLRenderer.js"],a["Core/Axis/Axis.js"],a["Core/Axis/DateTimeAxis.js"],a["Core/Axis/LogarithmicAxis.js"],a["Core/Axis/PlotLineOrBand/PlotLineOrBand.js"],a["Core/Axis/Tick.js"],a["Core/Tooltip.js"],a["Core/Series/Point.js"],a["Core/Pointer.js"],a["Core/MSPointer.js"],a["Core/Legend/Legend.js"],a["Core/Chart/Chart.js"],a["Core/Series/Series.js"],a["Core/Series/SeriesRegistry.js"],a["Series/Column/ColumnSeries.js"],a["Series/Column/ColumnDataLabel.js"],a["Series/Pie/PieSeries.js"],
    a["Series/Pie/PieDataLabel.js"],a["Core/Series/DataLabel.js"],a["Core/Responsive.js"],a["Core/Color/Color.js"],a["Core/Time.js"]],function(a,u,z,F,y,G,H,A,q,n,k,e,c,h,f,w,p,B,t,J,C,r,l,b,g,d,m,D,x,I,M,S,O){a.animate=y.animate;a.animObject=y.animObject;a.getDeferredAnimation=y.getDeferredAnimation;a.setAnimation=y.setAnimation;a.stop=y.stop;a.timers=F.timers;a.AST=G;a.Axis=c;a.Chart=l;a.chart=l.chart;a.Fx=F;a.Legend=r;a.PlotLineOrBand=w;a.Point=t;a.Pointer=C.isRequired()?C:J;a.Series=b;a.SVGElement=
    q;a.SVGRenderer=n;a.Tick=p;a.Time=O;a.Tooltip=B;a.Color=S;a.color=S.parse;e.compose(n);k.compose(q);a.defaultOptions=z.defaultOptions;a.getOptions=z.getOptions;a.time=z.defaultTime;a.setOptions=z.setOptions;a.dateFormat=H.dateFormat;a.format=H.format;a.numberFormat=H.numberFormat;a.addEvent=u.addEvent;a.arrayMax=u.arrayMax;a.arrayMin=u.arrayMin;a.attr=u.attr;a.clearTimeout=u.clearTimeout;a.correctFloat=u.correctFloat;a.createElement=u.createElement;a.css=u.css;a.defined=u.defined;a.destroyObjectProperties=
    u.destroyObjectProperties;a.discardElement=u.discardElement;a.distribute=A.distribute;a.erase=u.erase;a.error=u.error;a.extend=u.extend;a.extendClass=u.extendClass;a.find=u.find;a.fireEvent=u.fireEvent;a.getMagnitude=u.getMagnitude;a.getStyle=u.getStyle;a.inArray=u.inArray;a.isArray=u.isArray;a.isClass=u.isClass;a.isDOMElement=u.isDOMElement;a.isFunction=u.isFunction;a.isNumber=u.isNumber;a.isObject=u.isObject;a.isString=u.isString;a.keys=u.keys;a.merge=u.merge;a.normalizeTickInterval=u.normalizeTickInterval;
    a.objectEach=u.objectEach;a.offset=u.offset;a.pad=u.pad;a.pick=u.pick;a.pInt=u.pInt;a.relativeLength=u.relativeLength;a.removeEvent=u.removeEvent;a.seriesType=g.seriesType;a.splat=u.splat;a.stableSort=u.stableSort;a.syncTimeout=u.syncTimeout;a.timeUnits=u.timeUnits;a.uniqueKey=u.uniqueKey;a.useSerialIds=u.useSerialIds;a.wrap=u.wrap;m.compose(d);I.compose(b);h.compose(c);f.compose(c);x.compose(D);w.compose(c);M.compose(l);return a});a["masters/highcharts.src.js"]._modules=a;return a["masters/highcharts.src.js"]});

    });

    /* src/Chart.svelte generated by Svelte v3.44.0 */

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

    data(highcharts);
    highchartsMore(highcharts);

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
    	return highcharts.chart("container", {
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
    		Highcharts: highcharts,
    		data,
    		more: highchartsMore,
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

    /* src/Calibrate.svelte generated by Svelte v3.44.0 */

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
    	let question;
    	let current;

    	question = new Question({
    			props: { question: /*question*/ ctx[7] },
    			$$inline: true
    		});

    	question.$on("answer", /*handleAnswer*/ ctx[3]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(question.$$.fragment);
    			attr_dev(div, "class", "d-flex justify-content-center p-3");
    			add_location(div, file$4, 79, 6, 2037);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(question, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const question_changes = {};
    			if (dirty & /*$questions*/ 4) question_changes.question = /*question*/ ctx[7];
    			question.$set(question_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(question.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(question.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(question);
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
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    			if (detaching) detach_dev(div);
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
    	let each_value = /*$questions*/ ctx[2];
    	validate_each_argument(each_value);
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
    				each_blocks[i].m(main, null);
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
    				each_value = /*$questions*/ ctx[2];
    				validate_each_argument(each_value);
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
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
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

    /* src/Tooltip.svelte generated by Svelte v3.44.0 */

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
    			if (detaching) detach_dev(div);
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

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !('title' in props)) {
    			console.warn("<Tooltip> was created without expected prop 'title'");
    		}

    		if (/*x*/ ctx[1] === undefined && !('x' in props)) {
    			console.warn("<Tooltip> was created without expected prop 'x'");
    		}

    		if (/*y*/ ctx[2] === undefined && !('y' in props)) {
    			console.warn("<Tooltip> was created without expected prop 'y'");
    		}
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

    /* src/Cite.svelte generated by Svelte v3.44.0 */
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
    			if (detaching) detach_dev(sup);
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

    /* src/About.svelte generated by Svelte v3.44.0 */
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
    			if (detaching) detach_dev(div);
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

    	let each_value = /*$citations*/ ctx[0];
    	validate_each_argument(each_value);
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
    				each_blocks[i].m(div, null);
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
    				each_value = /*$citations*/ ctx[0];
    				validate_each_argument(each_value);
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
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
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

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap$1(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
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

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.44.0 */

    const { Error: Error_1, Object: Object_1, console: console_1 } = globals;

    // (251:0) {:else}
    function create_else_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
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
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(251:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (244:0) {#if componentParams}
    function create_if_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
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
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(244:0) {#if componentParams}",
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
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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

    function wrap(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn('Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading');

    	return wrap$1({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
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

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);
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
    		undefined,
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
    		undefined,
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
    			if (event.state && event.state.__svelte_spa_router_scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		};

    		// This is removed in the destroy() invocation below
    		window.addEventListener('popstate', popStateChanged);

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.__svelte_spa_router_scrollX, previousScrollState.__svelte_spa_router_scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
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
    		_wrap: wrap$1,
    		wrap,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		params,
    		push,
    		pop,
    		replace,
    		link,
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

    /* src/App.svelte generated by Svelte v3.44.0 */
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
    			add_location(html, file, 11, 2, 289);
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css");
    			add_location(link, file, 12, 2, 310);
    			add_location(body, file, 15, 0, 429);
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
    			detach_dev(html);
    			detach_dev(link);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(body);
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
