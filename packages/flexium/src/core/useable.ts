/**
 * Useable - Base class for reactive data sources that work with use()
 *
 * Extend this class to create custom data sources (Context, Stream, Shared, etc.)
 *
 * @example
 * ```tsx
 * class MySource<T> extends Useable<T> {
 *   getInitial() { return this.initialValue }
 *   subscribe(params, callback) {
 *     // setup subscription
 *     return () => { // cleanup }
 *   }
 * }
 *
 * const source = new MySource(...)
 * const [value] = use(source)
 * ```
 *
 * @typeParam T - The value type
 * @typeParam P - The params type for subscribe/send
 * @typeParam Actions - Tuple of additional actions returned by use() after the value
 */
export abstract class Useable<T, P = void, Actions extends unknown[] = []> {
  /**
   * Unique identifier for this Useable type
   * Used internally by use() for type checking
   */
  readonly _useableTag = true as const

  /**
   * Get the initial/current value synchronously
   * Called when use() first accesses this source
   */
  abstract getInitial(params?: P): T

  /**
   * Subscribe to value changes
   * Called by use() to receive updates
   *
   * @param params - Optional parameters for the subscription
   * @param callback - Function called when value changes
   * @returns Cleanup function to unsubscribe
   */
  abstract subscribe(
    params: P | undefined,
    callback: (value: T) => void
  ): () => void

  /**
   * Get additional actions to include in the use() tuple
   * Override this to return [action1, action2, ...] that will be appended to [value, ...]
   *
   * @example
   * ```tsx
   * class SendableStream extends Useable<T, P> {
   *   getActions() {
   *     return [this.send.bind(this)]
   *   }
   * }
   *
   * const [value, send] = use(stream)
   * ```
   */
  getActions(): Actions | undefined {
    return undefined
  }
}

/**
 * Type guard to check if a value is a Useable instance
 */
export function isUseable(value: unknown): value is Useable<any, any> {
  return (
    value !== null &&
    typeof value === 'object' &&
    '_useableTag' in value &&
    (value as any)._useableTag === true
  )
}
