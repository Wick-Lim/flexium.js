/**
 * Context API for dependency injection
 */

/**
 * Context interface
 */
export interface Context<T> {
    id: symbol;
    defaultValue: T;
    Provider: (props: { value: T; children: any }) => any;
}

/**
 * Internal map to track current context values
 * Key is the context symbol, value is the stack of values
 */
const contextStacks = new Map<symbol, any[]>();

/**
 * Creates a Context object
 *
 * @param defaultValue - The default value if no provider is found
 * @returns Context object with Provider component
 */
export function createContext<T>(defaultValue: T): Context<T> {
    const id = Symbol('context');

    const Provider = (props: { value: T; children: any }) => {
        return props.children;
    };

    // Mark as a context provider for the renderer
    (Provider as any)._contextId = id;

    return {
        id,
        defaultValue,
        Provider
    };
}

/**
 * Retrieves the current value of a Context
 *
 * @param context - The context object
 * @returns The current value
 */
export function useContext<T>(context: Context<T>): T {
    const stack = contextStacks.get(context.id);
    if (stack && stack.length > 0) {
        return stack[stack.length - 1];
    }
    return context.defaultValue;
}

/**
 * Internal: Push a provider value onto the stack
 * @internal
 */
export function pushProvider(id: symbol, value: any) {
    if (!contextStacks.has(id)) {
        contextStacks.set(id, []);
    }
    contextStacks.get(id)!.push(value);
}

/**
 * Internal: Pop a provider value from the stack
 * @internal
 */
export function popProvider(id: symbol) {
    const stack = contextStacks.get(id);
    if (stack) {
        stack.pop();
    }
}
