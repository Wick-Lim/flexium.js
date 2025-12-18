import { use } from 'flexium/core'
import { render } from 'flexium/dom'

export interface PortalProps {
  /** Target element or CSS selector to render children into */
  target: HTMLElement | string
  /** Children to render in the portal */
  children?: any
}

/**
 * Portal - Renders children into a different DOM node
 *
 * Useful for modals, tooltips, and dropdowns that need to escape
 * their parent's overflow or z-index stacking context.
 *
 * @example
 * ```tsx
 * function Modal({ open, onClose, children }) {
 *   if (!open) return null
 *
 *   return (
 *     <Portal target={document.body}>
 *       <div class="modal-backdrop" onClick={onClose}>
 *         <div class="modal-content" onClick={e => e.stopPropagation()}>
 *           {children}
 *         </div>
 *       </div>
 *     </Portal>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Using CSS selector
 * <Portal target="#modal-root">
 *   <Dialog />
 * </Portal>
 * ```
 */
export function Portal(props: PortalProps): null {
  const { target, children } = props

  use(({ onCleanup }) => {
    // Resolve target container
    let container: HTMLElement | null = null

    if (typeof target === 'string') {
      container = document.querySelector(target)
    } else if (target instanceof HTMLElement) {
      container = target
    }

    if (!container) {
      console.warn('[Portal] Target container not found:', target)
      return
    }

    // Create wrapper for portal content
    const wrapper = document.createElement('div')
    wrapper.setAttribute('data-flexium-portal', 'true')
    container.appendChild(wrapper)

    // Render children into wrapper
    render(children, wrapper)

    // Cleanup on unmount
    onCleanup(() => {
      if (wrapper.parentNode) {
        wrapper.parentNode.removeChild(wrapper)
      }
    })
  }, [target, children])

  // Portal renders nothing in original location
  return null
}
