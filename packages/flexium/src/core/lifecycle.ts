import { hook } from './hook'
import { ReactiveEffect, flush, setBatching } from './effect'

export function effect(fn: () => (void | (() => void)), deps?: any[]) {
    // Use hook to store state across renders
    const state = hook(() => {
        // Initial State of the Hook (Runs once)
        return {
            cleanup: undefined as undefined | (() => void),
            deps: undefined as undefined | any[],
            effect: undefined as undefined | ReactiveEffect,
            hasRun: false
        }
    })

    // This runs on every render (update)

    // 1. Check dependencies
    let hasChanged = true
    if (state.hasRun && deps && state.deps) {
        hasChanged = deps.some((d, i) => d !== state.deps![i])
    }

    // 2. If changed, run effect
    if (hasChanged) {
        // Cleanup previous run
        if (state.cleanup) {
            state.cleanup()
            state.cleanup = undefined
        }

        // Run effect
        const cleanup = fn()
        if (typeof cleanup === 'function') {
            state.cleanup = cleanup
        }

        state.deps = deps
        state.hasRun = true
    }

    // Cleanup on component unmount logic is handled by the renderer via ComponentInstance context
}

export function memo<T>(factory: () => T, deps?: any[]): T {
    const state = hook(() => ({
        value: undefined as undefined | T,
        deps: undefined as undefined | any[],
        hasRun: false
    }))

    let hasChanged = true
    if (state.hasRun && deps && state.deps) {
        hasChanged = deps.some((d, i) => d !== state.deps![i])
    }

    if (hasChanged) {
        state.value = factory()
        state.deps = deps
        state.hasRun = true
    }

    return state.value as T
}

/**
 * Unified sync API
 * - sync(): Force refresh (flush pending effects)
 * - sync(fn): Batch updates (run fn then flush)
 */
export function sync(fn?: () => void) {
    if (fn) {
        setBatching(true)
        try {
            fn()
        } finally {
            setBatching(false)
            flush()
        }
    } else {
        flush()
    }
}

export function batch(fn: () => void) {
    sync(fn)
}
