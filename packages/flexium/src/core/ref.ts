import { hook } from './hook'
import type { RefObject } from './types'

/**
 * Creates a mutable ref object that persists across renders
 *
 * @example
 * ```tsx
 * function InputWithFocus() {
 *   const inputRef = useRef<HTMLInputElement>()
 *
 *   const focusInput = () => {
 *     inputRef.current?.focus()
 *   }
 *
 *   return (
 *     <div>
 *       <input ref={inputRef} type="text" />
 *       <button onClick={focusInput}>Focus Input</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useRef<T>(initialValue: T): RefObject<T>
export function useRef<T>(initialValue: T | null): RefObject<T | null>
export function useRef<T = undefined>(): RefObject<T | undefined>
export function useRef<T>(initialValue?: T): RefObject<T | undefined> {
  return hook(() => ({
    current: initialValue
  }))
}
