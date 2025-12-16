import type { FNodeChild } from '../dom/types'
import type { ForwardedRef, Ref } from './types'

// Symbol to identify forwarded components
export const FORWARD_REF_SYMBOL = Symbol('flexium.forwardRef')

export interface ForwardRefRenderFunction<P, T> {
  (props: P, ref: ForwardedRef<T>): FNodeChild
}

export interface ForwardRefComponent<P, T> {
  (props: P & { ref?: Ref<T> }): FNodeChild
  $$typeof: typeof FORWARD_REF_SYMBOL
  render: ForwardRefRenderFunction<P, T>
}

/**
 * Forwards a ref through a component to a child element
 *
 * @example
 * ```tsx
 * const FancyInput = forwardRef<{ placeholder?: string }, HTMLInputElement>(
 *   (props, ref) => {
 *     return (
 *       <input
 *         ref={ref}
 *         class="fancy-input"
 *         placeholder={props.placeholder}
 *       />
 *     )
 *   }
 * )
 *
 * function Parent() {
 *   const inputRef = useRef<HTMLInputElement>()
 *
 *   return (
 *     <div>
 *       <FancyInput ref={inputRef} placeholder="Type here..." />
 *       <button onClick={() => inputRef.current?.select()}>
 *         Select All
 *       </button>
 *     </div>
 *   )
 * }
 * ```
 */
export function forwardRef<P = {}, T = HTMLElement>(
  render: ForwardRefRenderFunction<P, T>
): ForwardRefComponent<P, T> {
  const ForwardRefComponent = (props: P & { ref?: Ref<T> }): FNodeChild => {
    const { ref, ...otherProps } = props as P & { ref?: Ref<T> }
    return render(otherProps as P, ref ?? null)
  }

  // Mark as forwarded component
  ForwardRefComponent.$$typeof = FORWARD_REF_SYMBOL
  ForwardRefComponent.render = render

  return ForwardRefComponent
}
