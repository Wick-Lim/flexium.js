import type { EventHandler } from '../../core/renderer';

// Map of event names to global listener status
const globalListeners = new Set<string>();

// Events that do not bubble and must be captured
const NON_BUBBLING_EVENTS = new Set([
  'focus',
  'blur',
  'mouseenter',
  'mouseleave',
  'load',
  'unload',
  'scroll'
]);

// WeakMap to store event handlers for each node
// Key: DOM Node, Value: Map<EventName, Handler>
const nodeHandlers = new WeakMap<Node, Map<string, EventHandler>>();

/**
 * Global event dispatcher that handles delegation
 */
function dispatchEvent(event: Event) {
  let target = event.target as Node | null;
  const eventType = event.type.toLowerCase();
  const bubbles = !NON_BUBBLING_EVENTS.has(eventType);

  // Bubble up from target to document (or just target if non-bubbling)
  while (target && target !== document) {
    const handlers = nodeHandlers.get(target);
    if (handlers && handlers.has(eventType)) {
      const handler = handlers.get(eventType);
      if (handler) {
        handler(event);
        if (event.cancelBubble) {
          break;
        }
      }
    }
    
    if (!bubbles) break; // Stop if event doesn't bubble
    
    target = target.parentNode;
  }
}

/**
 * Register a global event listener for delegation
 */
function ensureGlobalListener(eventName: string) {
  if (!globalListeners.has(eventName)) {
    const capture = NON_BUBBLING_EVENTS.has(eventName);
    document.addEventListener(eventName, dispatchEvent, { capture });
    globalListeners.add(eventName);
  }
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
    const lowerEvent = eventName.toLowerCase();
    
    let handlers = nodeHandlers.get(node);
    if (!handlers) {
      handlers = new Map();
      nodeHandlers.set(node, handlers);
    }
    
    handlers.set(lowerEvent, handler);
    ensureGlobalListener(lowerEvent);
  },

  /**
   * Detach an event handler from a node
   */
  off(node: Node, eventName: string) {
    const lowerEvent = eventName.toLowerCase();
    const handlers = nodeHandlers.get(node);
    if (handlers) {
      handlers.delete(lowerEvent);
    }
  }
};
