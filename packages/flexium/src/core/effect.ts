// Circular dependency detection constants
const MAX_EFFECT_DEPTH = 100
const MAX_UPDATES_PER_EFFECT = 1000
const MAX_FLUSH_ITERATIONS = 100

// Track current execution state
let currentEffectDepth = 0
let flushIterationCount = 0

export let activeEffect: ReactiveEffect | undefined

export class ReactiveEffectLike {
    deps: Set<any>[] = []
    active = true
    private updateCounter = 0

    constructor(
        public fn: () => void,
        public scheduler?: () => void
    ) { }

    run() {
        if (!this.active) {
            return this.fn()
        }

        // Circular dependency detection (development only)
        if (process.env.NODE_ENV !== 'production') {
            currentEffectDepth++
            this.updateCounter++

            if (currentEffectDepth > MAX_EFFECT_DEPTH) {
                currentEffectDepth = 0
                throw new Error(
                    `[Flexium] Maximum effect depth (${MAX_EFFECT_DEPTH}) exceeded. ` +
                    `This likely indicates a circular dependency between reactive effects. ` +
                    `Check your state() and effect() calls for mutual dependencies.`
                )
            }

            if (this.updateCounter > MAX_UPDATES_PER_EFFECT) {
                console.warn(
                    `[Flexium] Effect has been triggered ${MAX_UPDATES_PER_EFFECT}+ times. ` +
                    `This may indicate a circular dependency or infinite loop. ` +
                    `Consider reviewing your reactive dependencies.`
                )
                this.updateCounter = 0  // Reset to allow continued execution with warning
            }
        }

        let parent: ReactiveEffect | undefined = activeEffect
        try {
            this.cleanup()
            activeEffect = this
            return this.fn()
        } finally {
            activeEffect = parent

            if (process.env.NODE_ENV !== 'production') {
                currentEffectDepth--
            }
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

    // Detect infinite flush loops (development only)
    if (process.env.NODE_ENV !== 'production') {
        flushIterationCount++

        if (flushIterationCount > MAX_FLUSH_ITERATIONS) {
            flushIterationCount = 0
            throw new Error(
                `[Flexium] Maximum flush iterations (${MAX_FLUSH_ITERATIONS}) exceeded. ` +
                `This indicates a circular dependency where effects keep triggering each other. ` +
                `Review your reactive state updates to break the cycle.`
            )
        }

        // Reset counter on next microtask (after all synchronous flushes complete)
        Promise.resolve().then(() => {
            flushIterationCount = 0
        })
    }

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

/**
 * Reset circular dependency detection counters
 * Useful for testing purposes
 */
export function __resetDetectionCounters(): void {
    currentEffectDepth = 0
    flushIterationCount = 0
}
