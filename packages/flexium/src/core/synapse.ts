export interface Synapse<T> {
    id: symbol;
    defaultValue: T;
}

/**
 * Define a new Synapse channel for passing data down the component tree.
 * Uses a unique Symbol to prevent prop name collisions.
 * 
 * @param defaultValue The default value if no provider is found
 */
export function defineSynapse<T>(defaultValue: T): Synapse<T> {
    return {
        id: Symbol('FlexiumSynapse'),
        defaultValue
    };
}

/**
 * A read-only interface to access Synapse values
 */
export interface SynapseGetter {
    get<T>(synapse: Synapse<T>): T;
}
