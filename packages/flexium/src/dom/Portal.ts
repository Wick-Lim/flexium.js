import type { FNodeChild } from './index'
import { hook } from '../core/hook'

export interface PortalProps {
  children: FNodeChild
  container?: Element | null
}

// Portal marker symbol
export const PORTAL_MARKER = Symbol('flexium.portal')

// Store for portal render functions (set by dom/index.ts)
let portalRenderer: ((children: FNodeChild, container: Element) => void) | null = null

/**
 * Set the portal renderer function
 * Called by dom/index.ts to provide renderNode access
 */
export function setPortalRenderer(renderer: (children: FNodeChild, container: Element) => void): void {
  portalRenderer = renderer
}

/**
 * Portal - Render children into a DOM node outside the parent hierarchy
 *
 * Usage:
 * <Portal container={document.getElementById('modal-root')}>
 *   <Modal />
 * </Portal>
 */
export function Portal(props: PortalProps): null {
  const { children, container } = props

  // Determine target container
  const target = container ?? (typeof document !== 'undefined' ? document.body : null)

  if (!target) {
    return null
  }

  // Create and manage portal container
  const portalState = hook(() => {
    const portalDiv = document.createElement('div')
    portalDiv.setAttribute('data-flexium-portal', '')
    return {
      container: portalDiv,
      mounted: false,
      cleanup: null as (() => void) | null
    }
  })

  // Mount portal container if not already mounted
  if (!portalState.mounted && target) {
    target.appendChild(portalState.container)
    portalState.mounted = true
  }

  // Render children into portal container
  if (portalRenderer && portalState.mounted) {
    // Clear previous content
    portalState.container.innerHTML = ''
    portalRenderer(children, portalState.container)
  }

  // Return null - Portal renders nothing at its location
  return null
}

// Mark as portal component
(Portal as any)[PORTAL_MARKER] = true

/**
 * Check if a component is a Portal
 */
export function isPortal(component: any): boolean {
  return component && component[PORTAL_MARKER] === true
}
