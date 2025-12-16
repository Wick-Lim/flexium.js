import type { RefObject } from './types'

/**
 * Creates a ref object for use outside of components
 *
 * @example
 * ```tsx
 * const myRef = createRef<HTMLInputElement>()
 *
 * // Later, pass to a component
 * <input ref={myRef} />
 *
 * // Access the element
 * myRef.current?.focus()
 * ```
 */
export function createRef<T = HTMLElement>(): RefObject<T | null> {
  return { current: null }
}
