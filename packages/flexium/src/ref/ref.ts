import { hook } from '../core/hook'
import type { RefObject } from './types'

/**
 * Creates a mutable ref object that persists across renders
 *
 * @example
 * ```tsx
 * function InputWithFocus() {
 *   const inputRef = ref<HTMLInputElement>()
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
export function ref<T>(initialValue: T): RefObject<T>
export function ref<T>(initialValue: T | null): RefObject<T | null>
export function ref<T = undefined>(): RefObject<T | undefined>
export function ref<T>(initialValue?: T): RefObject<T | undefined> {
  return hook(() => ({
    current: initialValue
  }))
}
