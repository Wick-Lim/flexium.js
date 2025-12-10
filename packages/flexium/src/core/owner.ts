/**
 * Owner.ts
 *
 * Managing reactive scopes and cleanup contexts.
 */

// ==================================================================================
// 1. Owner & Scope Management
// ==================================================================================

export interface Owner {
    cleanups: (() => void)[]
    context: Record<symbol, unknown> | null
    owner: Owner | null // Parent owner
}

let owner: Owner | null = null

/**
 * Get the current owner (scope)
 * @internal
 */
export function getOwner(): Owner | null {
    return owner
}

/**
 * Set the current owner (scope)
 * @internal
 */
export function setOwner(newOwner: Owner | null): void {
    owner = newOwner
}

/**
 * Creates a disposal scope.
 * The return value of the function is returned, and a dispose function is returned.
 *
 * @param fn - Function to run within a new root scope
 * @returns [return value of fn, dispose function]
 *
 * @example
 * ```tsx
 * const [val, dispose] = root((dispose) => {
 *   effect(() => console.log('Inside root'));
 *   return 123;
 * });
 * dispose(); // Cleans up all effects created inside
 * ```
 */
export function root<T>(fn: (dispose: () => void) => T): T {
    const prevOwner = owner
    const newOwner: Owner = {
        cleanups: [],
        context: prevOwner ? Object.create(prevOwner.context) : null,
        owner: prevOwner,
    }

    owner = newOwner

    const dispose = () => {
        for (const cleanup of newOwner.cleanups) {
            cleanup()
        }
        newOwner.cleanups = []
    }

    try {
        return fn(dispose)
    } finally {
        owner = prevOwner
    }
}

/**
 * Runs a function once when the component mounts.
 * Unlike effect(), onMount does not track dependencies - it runs exactly once.
 *
 * @param fn - Function to run on mount. Can return a cleanup function.
 */
export function onMount(fn: () => void | (() => void)): void {
    // Schedule the mount callback to run after the current execution
    // This ensures the component is fully rendered before mount runs
    queueMicrotask(() => {
        const cleanup = fn()

        // Register cleanup with owner if available
        if (cleanup && typeof cleanup === 'function' && owner) {
            owner.cleanups.push(cleanup)
        }
    })
}
