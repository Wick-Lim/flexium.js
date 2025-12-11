import { ErrorCodes, logError } from './errors'
import {
    Graph,

    type Link,
    type ISubscriber,
    SubscriberFlags,
    NodeType
} from './graph'
import {
    Owner,
    getOwner,
    setOwner,
    getActiveEffect,
    setActiveEffect
} from './owner'

export class EffectNode implements ISubscriber {
    depsHead: Link | undefined
    cleanups: (() => void)[] = []
    flags = 0 // detached by default, will set flags during execution
    nodeType = NodeType.Effect

    private owner: Owner | null = null

    constructor(
        public fn: () => void | (() => void),
        public onError?: (error: Error) => void
    ) {
        this.owner = getOwner()
    }

    execute(): void {
        // Performance: Inline bit operations for better performance
        if ((this.flags & SubscriberFlags.Running) !== 0) {
            this.flags |= SubscriberFlags.Notified
            return
        }

        this.flags |= SubscriberFlags.Running

        try {
            this.run()
        } finally {
            // Performance: Inline bit operations
            this.flags &= ~SubscriberFlags.Running
            if ((this.flags & SubscriberFlags.Notified) !== 0) {
                this.flags &= ~SubscriberFlags.Notified
                // Schedule microtask to avoid stack overflow and infinite sync loops
                queueMicrotask(() => this.execute())
            }
        }
    }

    private run(): void {
        // Performance: Fast path when no cleanups
        if (this.cleanups.length > 0) {
            // Performance: Run cleanups in reverse order (most recent first)
            // This ensures proper dependency cleanup order and matches React's behavior
            for (let i = this.cleanups.length - 1; i >= 0; i--) {
                this.cleanups[i]()
            }
            this.cleanups = []
        }

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
        // Performance: Run cleanups in reverse order (most recent first)
        // This ensures proper dependency cleanup order
        if (this.cleanups.length > 0) {
            for (let i = this.cleanups.length - 1; i >= 0; i--) {
                this.cleanups[i]()
            }
            this.cleanups = []
        }
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
 * ```ts
 * const [count, setCount] = state(0);
 * 
 * effect(() => {
 *   console.log(count());
 * });
 * 
 * setCount(1); // logs: 1
 * ```
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
