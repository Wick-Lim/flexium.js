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

import type { ISubscriber } from './graph'

// Global context for dependency tracking
let activeEffect: ISubscriber | null = null

export function getActiveEffect(): ISubscriber | null {
    return activeEffect
}

export function setActiveEffect(effect: ISubscriber | null): void {
    activeEffect = effect
}

/**
 * Execute a function without tracking signal dependencies.
 * Useful when you need to read signals inside an effect without creating dependencies.
 *
 * @param fn - Function to execute without tracking
 * @returns The return value of fn
 */
export function untrack<T>(fn: () => T): T {
    const prev = activeEffect
    activeEffect = null
    try {
        return fn()
    } finally {
        activeEffect = prev
    }
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
        // Performance: Fast path when no cleanups
        if (newOwner.cleanups.length === 0) return
        
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


