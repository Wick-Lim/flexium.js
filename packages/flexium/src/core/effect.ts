/**
 * Effect System
 * 
 * 이 파일의 역할:
 * 1. EffectNode 클래스 (사이드 이펙트 실행)
 * 2. effect() 함수 (이펙트 생성)
 * 3. onCleanup() 함수 (정리 함수 등록)
 * 
 * 핵심 원리:
 * - EffectNode가 실행될 때 activeEffect로 설정됨
 * - Proxy.get() 호출 시 자동으로 의존성 추적됨
 * - 의존성이 변경되면 자동으로 재실행됨
 * 
 * 다른 파일과의 관계:
 * - proxy.ts: getActiveEffect(), setActiveEffect() 사용
 * - owner.ts: getOwner(), setOwner() 사용 (스코프 관리)
 * - graph.ts: Graph.disconnectDependencies() 사용 (의존성 해제)
 * - errors.ts: 에러 로깅
 */

import { ErrorCodes, logError, logWarning } from './errors'
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
    setOwner
} from './owner'
import {
    getActiveEffect,
    setActiveEffect
} from './proxy'

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
 * const count = state(0);
 * 
 * effect(() => {
 *   console.log(count());
 * });
 * 
 * count.set(1); // logs: 1
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

/**
 * Registers a cleanup function that runs before the current effect re-runs or is disposed
 *
 * @param fn - Cleanup function
 */
export function onCleanup(fn: () => void): void {
    const activeEffect = getActiveEffect()
    // Performance: Use nodeType instead of instanceof
    if (activeEffect && activeEffect.nodeType === NodeType.Effect) {
        (activeEffect as EffectNode).cleanups.push(fn)
    } else {
        logWarning(ErrorCodes.CLEANUP_OUTSIDE_EFFECT)
    }
}
