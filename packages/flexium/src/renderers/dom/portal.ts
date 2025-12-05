import { mountReactive, cleanupReactive } from './reactive'
import { onCleanup } from '../../core/signal'

interface PortalProps {
  mount?: HTMLElement
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: any
}

/**
 * <Portal> component renders its children into a different part of the DOM.
 * Useful for modals, tooltips, etc.
 *
 * @example
 * <Portal mount={document.body}>
 *   <div class="modal">...</div>
 * </Portal>
 */
export function Portal(props: PortalProps) {
  const container = props.mount || document.body

  // Placeholder to keep position in the VDOM tree
  const placeholder = document.createComment('portal')

  // We use a fragment to hold portal content references
  let portalContent: Node | null = null

  // Mount children to the target container
  // This runs synchronously when Portal component is executed (inside effect)
  portalContent = mountReactive(props.children, container)

  // Cleanup when Portal is unmounted
  onCleanup(() => {
    if (portalContent) {
      cleanupReactive(portalContent)
      if (portalContent.parentNode === container) {
        container.removeChild(portalContent)
      }
    }
  })

  return placeholder
}
