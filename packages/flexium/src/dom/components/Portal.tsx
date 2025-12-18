import { use } from '../../core/use'
import { hook } from '../../core/hook'
import { render } from '../render'
import type { PortalProps } from './types'

/**
 * Portal component that renders children into a different DOM node
 *
 * @deprecated Use Portal from 'flexium-ui' instead:
 * ```tsx
 * import { Portal } from 'flexium-ui'
 * ```
 *
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose, children }) {
 *   if (!isOpen) return null
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
 */
export function Portal(props: PortalProps): null {
  const { target, children } = props

  // Store rendered container for cleanup
  const portalState = hook(() => ({
    container: null as HTMLElement | null,
    mounted: false
  }))

  use(({ onCleanup }) => {
    // Resolve target container
    let container: HTMLElement | null = null

    if (typeof target === 'string') {
      container = document.querySelector(target)
    } else if (target instanceof HTMLElement) {
      container = target
    }

    if (!container) {
      console.warn('[Flexium Portal] Target container not found:', target)
      return
    }

    // Create a wrapper div to contain portal content
    const portalWrapper = document.createElement('div')
    portalWrapper.setAttribute('data-flexium-portal', 'true')
    container.appendChild(portalWrapper)

    portalState.container = portalWrapper
    portalState.mounted = true

    // Render children into the portal wrapper
    render(children, portalWrapper)

    // Cleanup function
    onCleanup(() => {
      if (portalWrapper.parentNode) {
        portalWrapper.parentNode.removeChild(portalWrapper)
      }
      portalState.container = null
      portalState.mounted = false
    })
  }, [target, children])

  // Portal renders nothing in its original location
  return null
}
