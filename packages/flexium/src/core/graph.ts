/**
 * Dependency Graph Data Structures
 * 
 * 이 파일의 역할:
 * 1. 의존성 그래프 데이터 구조 정의 (Link, ISubscriber, IObservable)
 * 2. Graph.connect() - 의존성 연결
 * 3. Graph.disconnectDependencies() - 의존성 해제
 * 4. LinkPool - 메모리 최적화를 위한 객체 풀링
 * 
 * 핵심 원리:
 * - Doubly Linked List로 의존성 그래프 구현
 * - O(1) 연결/해제 연산
 * - Link 풀링으로 GC 압력 감소
 * 
 * 다른 파일과의 관계:
 * - proxy.ts: Graph.connect() 사용 (의존성 추적 시)
 * - effect.ts: Graph.disconnectDependencies() 사용 (의존성 해제 시)
 * - 순환 참조 방지를 위해 다른 core 모듈에 의존하지 않음
 */

// ==================================================================================
// 1. Data Structures
// ==================================================================================

/**
 * Flags for subscriber state (Optimization: Bitmasking)
 */
export const enum SubscriberFlags {
    Running = 1 << 0,
    Notified = 1 << 1,
    Dirty = 1 << 2,
    Stale = 1 << 3,
    Tracking = 1 << 4,
}

/**
 * Node type identifiers for fast type checking (Performance: Avoid instanceof)
 */
export const enum NodeType {
    Signal = 1,
    Computed = 2,
    Effect = 3,
    Resource = 4,
}

/**
 * Link node connecting a Subscriber (Effect/Computed) to a Dependency (Signal/Computed).
 *
 * ASCII Visualization of the Doubly Linked Graph:
 *
 * [Signal A] <==> [Link 1] <==> [Effect B]
 *                    ^
 *                    | (Prev/Next Sub on Signal A)
 *                    v
 *                 [Link 2] <==> [Effect C]
 *
 * Each Link serves as a node in TWO lists simultaneously:
 * 1. The Subscriber's list of dependencies (prevDep/nextDep)
 * 2. The Dependency's list of subscribers (prevSub/nextSub)
 */
export interface Link {
    dep: IObservable | undefined
    sub: ISubscriber | undefined

    // Pointers for Dependency's subscriber list
    prevSub: Link | undefined
    nextSub: Link | undefined

    // Pointers for Subscriber's dependency list
    prevDep: Link | undefined
    nextDep: Link | undefined
}

/**
 * Base interface for subscriber nodes (Effect, Computed)
 */
export interface ISubscriber {
    execute(): void
    depsHead: Link | undefined // Head of dependencies list
    flags: SubscriberFlags
    nodeType: NodeType // Fast type checking (Performance optimization)
}

/**
 * Base interface for observable nodes (Signal, Computed)
 */
export interface IObservable {
    subsHead: Link | undefined // Head of subscribers list
    version: number // For epoch-based check
    notify(): void
    nodeType: NodeType // Fast type checking (Performance optimization)
}

// ==================================================================================
// 2. Object Pool (Memory Optimization)
// ==================================================================================

/**
 * Pool for Link objects to eliminate GC pressure.
 */
export namespace LinkPool {
    const pool: Link[] = []
    let size = 0

    export function alloc(dep: IObservable, sub: ISubscriber): Link {
        if (size > 0) {
            const link = pool[--size]
            link.dep = dep
            link.sub = sub
            link.prevSub = undefined
            link.nextSub = undefined
            link.prevDep = undefined
            link.nextDep = undefined
            return link
        }
        return {
            dep,
            sub,
            prevSub: undefined,
            nextSub: undefined,
            prevDep: undefined,
            nextDep: undefined,
        }
    }

    export function free(link: Link): void {
        link.dep = undefined
        link.sub = undefined
        // Clearing pointers is optional for safety but good for debugging leaks
        link.prevSub = undefined
        link.nextSub = undefined
        link.prevDep = undefined
        link.nextDep = undefined

        if (size < 10000) { // Safety cap
            pool[size++] = link
        }
    }
}

// ==================================================================================
// 3. Graph Operations
// ==================================================================================

/**
 * Internal Graph operations to manage the "Hardcore" Linked List structure.
 * Encapsulates raw pointer arithmetic for readability.
 */
export namespace Graph {
    /**
     * Connects a dependency (Signal) to a subscriber (Effect/Computed).
     * Allocates a Link from the pool and stitches it into both lists.
     */
    export function connect(dep: IObservable, sub: ISubscriber): void {
        const link = LinkPool.alloc(dep, sub)

        // Add to Subscriber's dependency list (prepend)
        // Performance: Cache depsHead to avoid repeated property access
        const depsHead = sub.depsHead
        link.nextDep = depsHead
        if (depsHead) {
            depsHead.prevDep = link
        }
        sub.depsHead = link

        // Add to Dependency's subscriber list (prepend)
        // Performance: Cache subsHead to avoid repeated property access
        const subsHead = dep.subsHead
        link.nextSub = subsHead
        if (subsHead) {
            subsHead.prevSub = link
        }
        dep.subsHead = link
    }

    /**
     * Fully disconnects a subscriber from all its dependencies.
     * Walks the 'depsHead' list and unlinks each one.
     */
    export function disconnectDependencies(sub: ISubscriber): void {
        let link = sub.depsHead
        while (link) {
            const dep = link.dep!
            // Performance: Cache nextDep and pointers before modifying link
            const nextDep = link.nextDep
            const prevSub = link.prevSub
            const nextSub = link.nextSub

            // Remove link from dependency's subscriber list
            // This is a standard doubly-linked list removal
            // Performance: Branch prediction - middle nodes are more common
            if (prevSub) {
                prevSub.nextSub = nextSub
            } else {
                dep.subsHead = nextSub
            }
            if (nextSub) {
                nextSub.prevSub = prevSub
            }

            LinkPool.free(link)
            link = nextDep
        }
        sub.depsHead = undefined
    }
}

/**
 * Flag helpers for readability
 */
export namespace Flags {
    export function has(obj: { flags: number }, flag: SubscriberFlags): boolean {
        return (obj.flags & flag) !== 0
    }

    export function add(obj: { flags: number }, flag: SubscriberFlags): void {
        obj.flags |= flag
    }

    export function remove(obj: { flags: number }, flag: SubscriberFlags): void {
        obj.flags &= ~flag
    }
}
