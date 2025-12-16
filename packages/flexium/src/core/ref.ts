import { hook } from './hook'

/**
 * Ref object type - mutable reference that persists across renders
 */
export interface Ref<T> {
  current: T
}

/**
 * useRef - Create a mutable ref object that persists across renders
 * Similar to React's useRef
 */
export function useRef<T>(initialValue: T): Ref<T>
export function useRef<T = undefined>(): Ref<T | undefined>
export function useRef<T>(initialValue?: T): Ref<T | undefined> {
  return hook(() => ({ current: initialValue }))
}

/**
 * createRef - Create a ref object outside of components
 * Useful for class-based patterns or external ref storage
 */
export function createRef<T = unknown>(): Ref<T | null> {
  return { current: null }
}

/**
 * ForwardRef render function type
 */
export type ForwardRefRenderFunction<T, P = {}> = (
  props: P,
  ref: Ref<T> | ((instance: T) => void) | null
) => any

/**
 * ForwardRef component type
 */
export interface ForwardRefComponent<T, P = {}> {
  (props: P & { ref?: Ref<T> | ((instance: T) => void) }): any
  displayName?: string
  __forwardRef: true
}

/**
 * forwardRef - Forward refs to child components
 * Allows parent components to access child DOM elements or component instances
 */
export function forwardRef<T, P = {}>(
  render: ForwardRefRenderFunction<T, P>
): ForwardRefComponent<T, P> {
  const ForwardRefComponent = (props: P & { ref?: Ref<T> | ((instance: T) => void) }) => {
    const { ref, ...restProps } = props as any
    return render(restProps as P, ref ?? null)
  }

  const component = ForwardRefComponent as any
  component.__forwardRef = true
  component.__render = render

  return component as ForwardRefComponent<T, P>
}

/**
 * Apply a ref value - handles both callback refs and ref objects
 */
export function applyRef<T>(
  ref: Ref<T> | ((instance: T) => void) | null | undefined,
  value: T
): void {
  if (ref === null || ref === undefined) return

  if (typeof ref === 'function') {
    ref(value)
  } else if (typeof ref === 'object' && 'current' in ref) {
    ref.current = value
  }
}

/**
 * Check if a value is a Ref object
 */
export function isRef<T>(value: any): value is Ref<T> {
  return value !== null && typeof value === 'object' && 'current' in value
}
