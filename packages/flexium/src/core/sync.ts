import { ISubscriber } from './graph'

// Batching state
let batchDepth = 0
// Batch queue now needs to store raw subscribers. Set is efficient for uniqueness.
const batchQueue = new Set<ISubscriber>()

// Auto-batching state (Microtask Scheduler)
const autoBatchQueue = new Set<ISubscriber>()
let isAutoBatchScheduled = false

export function scheduleAutoBatch(): void {
    if (!isAutoBatchScheduled) {
        isAutoBatchScheduled = true
        queueMicrotask(flushAutoBatch)
    }
}

export function flushAutoBatch(): void {
    isAutoBatchScheduled = false
    if (autoBatchQueue.size === 0) return

    // Performance: Convert Set to array instead of copying Set (faster)
    const queue = Array.from(autoBatchQueue)
    autoBatchQueue.clear()

    // Execute effects - use for loop instead of forEach (slightly faster)
    for (let i = 0; i < queue.length; i++) {
        queue[i].execute()
    }
}

export function addToAutoBatch(sub: ISubscriber): void {
    autoBatchQueue.add(sub)
}

export function addToBatch(sub: ISubscriber): void {
    batchQueue.add(sub)
}

export function getBatchDepth(): number {
    return batchDepth
}

/**
 * Synchronizes state updates.
 * 
 * - `sync()`: Force flushes any pending auto-batched effects.
 * - `sync(fn)`: Batches updates within `fn`, then flushes them and any pending effects synchronously.
 *
 * @param fn - Optional function containing state updates
 * @returns The return value of fn, if provided
 *
 * @example
 * ```tsx
 * // 1. Force flush pending effects
 * count.value++
 * sync() // DOM is now updated
 *
 * // 2. Batch updates and flush immediately
 * sync(() => {
 *   count.value = 1
 *   name.value = 'Bob'
 * }) // Effects run once here, DOM updated
 * ```
 */
export function sync<T>(fn?: () => T): T | void {
    let result: T | undefined

    if (fn) {
        batchDepth++
        try {
            result = fn()
        } finally {
            batchDepth--
            if (batchDepth === 0) {
                // Execute all queued subscribers from manual batch
                // Performance: Convert Set to array instead of copying Set (faster)
                const queue = Array.from(batchQueue)
                batchQueue.clear()
                // Use for loop instead of forEach (slightly faster)
                for (let i = 0; i < queue.length; i++) {
                    queue[i].execute()
                }
            }
        }
    }

    // Always flushing auto-batch queue to ensure everything is synced
    flushAutoBatch()

    return result
}
