import { ErrorCodes, logError } from './errors'
import {
    Graph,
    Flags,
    type Link,
    type ISubscriber,
    SubscriberFlags
} from './graph'
import {
    Owner,
    getOwner,
    setOwner,
    getActiveEffect,
    setActiveEffect
} from './owner'

/**
 * Internal effect node for dependency tracking
 */
export class EffectNode implements ISubscriber {
    depsHead: Link | undefined
    cleanups: (() => void)[] = []
    flags = 0 // detached by default, will set flags during execution

    private owner: Owner | null = null

    constructor(
        public fn: () => void | (() => void),
        public onError?: (error: Error) => void
    ) {
        this.owner = getOwner()
    }

    execute(): void {
        if (Flags.has(this, SubscriberFlags.Running)) {
            Flags.add(this, SubscriberFlags.Notified)
            return
        }

        Flags.add(this, SubscriberFlags.Running)

        try {
            this.run()
        } finally {
            Flags.remove(this, SubscriberFlags.Running)
            if (Flags.has(this, SubscriberFlags.Notified)) {
                Flags.remove(this, SubscriberFlags.Notified)
                // Schedule microtask to avoid stack overflow and infinite sync loops
                queueMicrotask(() => this.execute())
            }
        }
    }

    private run(): void {
        for (const cleanup of this.cleanups) {
            cleanup()
        }
        this.cleanups = []

        // Clean up previous dependencies via Graph helper
        Graph.disconnectDependencies(this)

        const prevEffect = getActiveEffect()
        const prevOwner = getOwner()
        setActiveEffect(this)
        setOwner(this.owner)

        try {
            const result = this.fn()
            if (typeof result === 'function') {
                this.cleanups.push(result)
            }
        } catch (error) {
            if (this.onError) {
                this.onError(error as Error)
            } else {
                logError(ErrorCodes.EFFECT_EXECUTION_FAILED, undefined, error)
            }
        } finally {
            setActiveEffect(prevEffect)
            setOwner(prevOwner)
        }
    }

    dispose(): void {
        for (const cleanup of this.cleanups) {
            cleanup()
        }
        this.cleanups = []
        Graph.disconnectDependencies(this)
    }
}

/**
 * Creates a side effect that runs when dependencies change
 *
 * @param fn - Effect function, can return a cleanup function
 * @param options - Optional error handler
 * @returns Dispose function to stop the effect
 *
 * @example
 * const count = signal(0);
 * const dispose = effect(() => {
 *   console.log('Count:', count.value);
 *   return () => console.log('Cleanup');
 * });
 */
export function effect(
    fn: () => void | (() => void),
    options?: { onError?: (error: Error) => void; name?: string }
): () => void {
    // DevTools hooks integration would go here if needed
    // For now we rely on the devtools hooks in signal.ts or need to export them properly
    // This implementation is sufficient for core logic

    const node = new EffectNode(fn, options?.onError)
    node.execute()
    const dispose = () => node.dispose()

    const owner = getOwner()
    if (owner) {
        owner.cleanups.push(dispose)
    }

    return dispose
}
