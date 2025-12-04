import type { VNodeChild } from './renderer';

const contextStack = new Map<symbol, unknown[]>();

export interface Context<T> {
    id: symbol;
    Provider: (props: { value: T; children: VNodeChild }) => VNodeChild;
    defaultValue: T;
}

export function createContext<T>(defaultValue: T): Context<T> {
    const id = Symbol('context');

    const Provider = (props: { value: T, children: VNodeChild }): VNodeChild => {
        return props.children;
    };
    (Provider as unknown as { _contextId: symbol })._contextId = id;

    return {
        id,
        Provider,
        defaultValue
    };
}

export function useContext<T>(context: Context<T>): T {
    const stack = contextStack.get(context.id);
    if (stack && stack.length > 0) {
        return stack[stack.length - 1] as T;
    }
    return context.defaultValue;
}

export function pushProvider(id: symbol, value: unknown): void {
    if (!contextStack.has(id)) {
        contextStack.set(id, []);
    }
    contextStack.get(id)!.push(value);
}

export function popProvider(id: symbol) {
    const stack = contextStack.get(id);
    if (stack) {
        stack.pop();
    }
}

/**
 * Capture the current context state
 */
export function captureContext(): Map<symbol, unknown> {
    const snapshot = new Map<symbol, unknown>();
    for (const [id, stack] of contextStack) {
        if (stack.length > 0) {
            snapshot.set(id, stack[stack.length - 1]);
        }
    }
    return snapshot;
}

/**
 * Run a function with the captured context restored
 */
export function runWithContext<T>(snapshot: Map<symbol, unknown>, fn: () => T): T {
    const pushedIds: symbol[] = [];
    for (const [id, value] of snapshot) {
        pushProvider(id, value);
        pushedIds.push(id);
    }

    try {
        return fn();
    } finally {
        for (const id of pushedIds) {
            popProvider(id);
        }
    }
}
