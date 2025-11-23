import { signal, batch, Signal } from '../core/signal';

// Internal symbol to store signals on objects
const SIGNALS = Symbol('store-signals');

type StoreNode = {
    [SIGNALS]?: Map<string | symbol, Signal<any>>;
    [key: string]: any;
};

export type SetStoreFunction = (...args: any[]) => void;

function getSignal(target: StoreNode, prop: string | symbol, value: any): Signal<any> {
    let signals = target[SIGNALS];
    if (!signals) {
        signals = new Map();
        Object.defineProperty(target, SIGNALS, { value: signals, enumerable: false });
    }
    let s = signals.get(prop);
    if (!s) {
        s = signal(value);
        signals.set(prop, s);
    }
    return s;
}

const proxyTraps: ProxyHandler<any> = {
    get(target, prop, receiver) {
        if (prop === SIGNALS) return target[SIGNALS];

        const value = Reflect.get(target, prop, receiver);

        // If it's a symbol or prototype access, just return
        if (typeof prop === 'symbol') return value;

        // Track dependency
        const s = getSignal(target, prop, value);
        s.value; // Access to track

        // If it's an object, return a proxy to it (lazy proxying)
        if (value && typeof value === 'object') {
            return new Proxy(value, proxyTraps);
        }

        return value;
    },

    set(_target, _prop, _value, _receiver) {
        // Stores are read-only via direct assignment
        console.warn('Cannot mutate store directly. Use setStore instead.');
        return true;
    }
};

export function createStore<T extends object>(initialState: T): [T, SetStoreFunction] {
    // Deep clone initial state to avoid mutation of original object
    // For simplicity in this MVP, we assume JSON-serializable or simple objects
    const state = JSON.parse(JSON.stringify(initialState));

    const store = new Proxy(state, proxyTraps);

    const setStore = (...args: any[]) => {
        batch(() => {
            let current = state;
            for (let i = 0; i < args.length - 1; i++) {
                const key = args[i];
                if (i === args.length - 2) {
                    // Last key, update value
                    const newVal = args[i + 1];
                    updateValue(current, key, newVal);
                } else {
                    // Navigate down
                    current = current[key];
                }
            }
        });
    };

    return [store, setStore];
}

function updateValue(target: StoreNode, prop: string, newValue: any) {
    const oldValue = target[prop];

    if (oldValue !== newValue) {
        target[prop] = newValue;

        // Trigger signal update
        const signals = target[SIGNALS];
        if (signals && signals.has(prop)) {
            signals.get(prop)!.value = newValue;
        }
    }
}
