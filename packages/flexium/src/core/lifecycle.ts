import { hook } from './hook'

// Reactive effect system
export let activeEffect: ReactiveEffect | undefined

export class ReactiveEffectLike {
    deps: Set<any>[] = []
    active = true

    constructor(
        public fn: () => void,
        public scheduler?: () => void
    ) { }

    run() {
        if (!this.active) {
            return this.fn()
        }

        let parent: ReactiveEffect | undefined = activeEffect
        try {
            this.cleanup()
            activeEffect = this
            return this.fn()
        } finally {
            activeEffect = parent
        }
    }

    stop() {
        if (this.active) {
            this.cleanup()
            this.active = false
        }
    }

    cleanup() {
        const { deps } = this
        if (deps.length) {
            for (let i = 0; i < deps.length; i++) {
                deps[i].delete(this)
            }
            deps.length = 0
        }
    }
}

export type ReactiveEffect = ReactiveEffectLike

export function unsafeEffect(fn: () => void, options: { scheduler?: () => void } = {}) {
    const _effect = new ReactiveEffectLike(fn, options.scheduler)
    _effect.run()

    const runner: any = _effect.run.bind(_effect)
    runner.effect = _effect
    return runner
}

export function trackEffect(dep: Set<ReactiveEffect>) {
    if (activeEffect) {
        dep.add(activeEffect)
        activeEffect.deps.push(dep)
    }
}

const queue = new Set<ReactiveEffect>()
let isFlushPending = false
let isBatching = false

export function queueJob(effect: ReactiveEffect) {
    if (!queue.has(effect)) {
        queue.add(effect)
        if (!isFlushPending && !isBatching) {
            isFlushPending = true
            Promise.resolve().then(flush)
        }
    }
}

export function flush() {
    isFlushPending = false
    const effects = [...queue]
    queue.clear()
    for (const effect of effects) {
        if (effect.active) {
            effect.run()
        }
    }
}

export function setBatching(value: boolean) {
    isBatching = value
}

export function triggerEffects(dep: Set<ReactiveEffect>) {
    const effects = [...dep]
    for (const effect of effects) {
        if (effect !== activeEffect) {
            if (effect.scheduler) {
                effect.scheduler()
            } else {
                queueJob(effect)
            }
        }
    }
}

// Lifecycle hooks
export function useEffect(fn: () => (void | (() => void)), deps?: any[]) {
    const state = hook(() => {
        return {
            cleanup: undefined as undefined | (() => void),
            deps: undefined as undefined | any[],
            effect: undefined as undefined | ReactiveEffect,
            hasRun: false
        }
    })

    let hasChanged = true
    if (state.hasRun && deps && state.deps) {
        hasChanged = deps.some((d, i) => d !== state.deps![i])
    }

    if (hasChanged) {
        if (state.cleanup) {
            state.cleanup()
            state.cleanup = undefined
        }

        const cleanup = fn()
        if (typeof cleanup === 'function') {
            state.cleanup = cleanup
        }

        state.deps = deps
        state.hasRun = true
    }
}

/**
 * Unified sync API
 * - useSync(): Force refresh (flush pending effects)
 * - useSync(fn): Batch updates (run fn then flush)
 */
export function useSync(fn?: () => void) {
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
