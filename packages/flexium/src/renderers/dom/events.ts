import type { EventHandler } from '../../core/renderer'
import { logError, ErrorCodes } from '../../core/errors'

// Map of event names to global listener status
const globalListeners = new Set<string>()

// Events that do not bubble and must be captured
const NON_BUBBLING_EVENTS = new Set([
  'focus',
  'blur',
  'mouseenter',
  'mouseleave',
  'load',
  'unload',
  'scroll',
])

// WeakMap to store event handlers for each node
// Key: DOM Node, Value: Map<EventName, Handler>
const nodeHandlers = new WeakMap<Node, Map<string, EventHandler>>()

/**
 * Global event dispatcher that handles delegation
 */
function dispatchEvent(event: Event) {

  const eventType = event.type.toLowerCase()
  const bubbles = !NON_BUBBLING_EVENTS.has(eventType)

  // Use composedPath if available (handles Shadow DOM and is faster)
  // Fallback to parentNode traversal for older browsers
  const path = event.composedPath?.() || []
  let current: Node | null = event.target as Node

  if (path.length === 0 && current) {
    // Build path manually if composedPath not available
    while (current) {
      path.push(current)
      current = current.parentNode
    }
  }

  for (const node of path) {
    const targetNode = node as Node
    // Stop at document or if we hit the end
    if (targetNode === document || !targetNode) break

    const handlers = nodeHandlers.get(targetNode)
    if (handlers?.has(eventType)) {
      const handler = handlers.get(eventType)
      if (handler) {
        try {
          handler(event)
        } catch (error) {
          logError(ErrorCodes.EVENT_HANDLER_FAILED, { eventType }, error)
        }
        if (event.cancelBubble) return
      }
    }

    if (!bubbles) break
  }
}

/**
 * Register a global event listener for delegation
 */
function ensureGlobalListener(eventName: string) {
  // SSR guard
  if (typeof document === 'undefined') return

  if (!globalListeners.has(eventName)) {
    const capture = NON_BUBBLING_EVENTS.has(eventName)
    document.addEventListener(eventName, dispatchEvent, { capture })
    globalListeners.add(eventName)
  }
}

/**
 * Clear all global event listeners (useful for SSR cleanup and testing)
 */
export function clearGlobalListeners(): void {
  // SSR guard
  if (typeof document === 'undefined') return

  for (const eventName of globalListeners) {
    const capture = NON_BUBBLING_EVENTS.has(eventName)
    document.removeEventListener(eventName, dispatchEvent, { capture })
  }
  globalListeners.clear()
}

/**
 * Event Delegation System
 */
export const eventDelegator = {
  /**
   * Attach an event handler to a node (virtual attachment)
   */
  on(node: Node, eventName: string, handler: EventHandler) {
    // normalize event name (e.g., 'click' -> 'click')
    const lowerEvent = eventName.toLowerCase()

    let handlers = nodeHandlers.get(node)
    if (!handlers) {
      handlers = new Map()
      nodeHandlers.set(node, handlers)
    }

    handlers.set(lowerEvent, handler)
    ensureGlobalListener(lowerEvent)
  },

  /**
   * Detach an event handler from a node
   */
  off(node: Node, eventName: string) {
    const lowerEvent = eventName.toLowerCase()
    const handlers = nodeHandlers.get(node)
    if (handlers) {
      handlers.delete(lowerEvent)
    }
  },
}
