/**
 * Reactive DOM Rendering
 *
 * Integrates the signal system with the DOM renderer to enable fine-grained
 * reactive updates. Only the specific DOM nodes that depend on changed signals
 * will be updated, without re-rendering the entire component tree.
 */

import type { VNode } from '../../core/renderer';
import { effect, batch, isSignal } from '../../core/signal';
import type { Signal, Computed } from '../../core/signal';
import { domRenderer } from './index';
import { isVNode } from './h';
import { pushProvider, popProvider } from '../../core/context';
import { reconcileArrays } from './reconcile';

/**
 * Track reactive bindings for cleanup
 */
const REACTIVE_BINDINGS = new WeakMap<Node, Set<() => void>>();

/**
 * Mount a virtual node with reactive tracking
 *
 * This function creates DOM nodes and automatically sets up reactive effects
 * for any signal dependencies in props or children.
 */
export function mountReactive(
  vnode: VNode | string | number | Signal<any> | Computed<any> | null | undefined | Function | any[],
  parent?: Node
): Node | null {
  // Handle null/undefined
  if (vnode === null || vnode === undefined) {
    return null;
  }

  // Handle signals and functions (reactive children)
  if (isSignal(vnode) || typeof vnode === 'function') {
    // Placeholder node to mark position
    const startNode = document.createTextNode('');
    // Wrapper fragment to hold startNode and initial content
    // This is crucial because startNode isn't attached to the real parent yet during initial render
    const wrapperFragment = document.createDocumentFragment();
    wrapperFragment.appendChild(startNode);

    let currentNode: Node | null = startNode;
    let currentVNode: any = null;
    let currentVNodeList: VNode[] = []; // Track array children for reconciliation

    const dispose = effect(() => {
      const value = isSignal(vnode) ? (vnode as Signal<any>).value : (vnode as Function)();

      // Handle Array (List Rendering) with Reconciliation
      if (Array.isArray(value)) {
        // Normalize children (filter nulls, etc.)
        const newVNodes = value.filter(c => c != null);
        
        // Determine container: 
        // 1. If startNode is in DOM, use its parent (Update phase)
        // 2. If startNode is in wrapperFragment, use wrapperFragment (Initial phase)
        // 3. Fallback to parent (Should rarely happen if logic is correct)
        const container = currentNode && currentNode.parentNode ? currentNode.parentNode : parent;
        
        if (container) {
          if (currentVNodeList.length > 0 && container !== wrapperFragment) {
            // Update: Reconcile (Only if we are mounted in real DOM)
            const nextSibling = currentNode!.nextSibling; 
            reconcileArrays(container, currentVNodeList, newVNodes, nextSibling);
          } else {
            // Initial Render OR First render in real DOM OR Switched from single
            
            // If previously single node, remove it
            if (currentNode && currentNode !== startNode && !currentVNodeList.length) {
               if (currentNode.parentNode) {
                 domRenderer.removeChild(currentNode.parentNode, currentNode);
               }
            }

            const fragment = document.createDocumentFragment();
            for (const child of newVNodes) {
              const childNode = mountReactive(child, fragment);
              if (childNode && typeof child === 'object') {
                (child as any)._node = childNode;
              }
            }
            
            // Insert after startNode
            if (startNode.parentNode) {
                // This works for both wrapperFragment and real DOM
                startNode.parentNode.insertBefore(fragment, startNode.nextSibling);
            }
          }
          
          // Update references
          currentVNodeList = newVNodes;
          currentVNode = value;
          currentNode = startNode; // Keep anchor
        }
        return;
      }

      // Handle Single Value (Text/Element) ... (rest is same, simplified logic needed)
      // If previously was array, clear it
      if (currentVNodeList.length > 0) {
         const container = startNode.parentNode;
         if (container) {
             for (const vnode of currentVNodeList) {
                 if (vnode._node) {
                     domRenderer.removeChild(container, vnode._node);
                 }
             }
         }
         currentVNodeList = [];
      }

      // If value is different from current
      if (value !== currentVNode) {
        if ((typeof value === 'string' || typeof value === 'number') &&
          currentNode && currentNode.nodeType === Node.TEXT_NODE && currentNode !== startNode) {
          domRenderer.updateTextNode(currentNode as Text, String(value));
        } else {
          const newNode = mountReactive(value);
          
          // If we have a newNode, replace the old one (or insert if first time)
          if (newNode) {
              if (currentNode && currentNode !== startNode && currentNode.parentNode) {
                  currentNode.parentNode.replaceChild(newNode, currentNode);
              } else if (startNode.parentNode) {
                  // Initial render or switching from array/placeholder
                  startNode.parentNode.insertBefore(newNode, startNode.nextSibling);
              }
              currentNode = newNode;
          } else {
              // If newNode is null (e.g. null/false return), we should just have the startNode
              if (currentNode && currentNode !== startNode && currentNode.parentNode) {
                  domRenderer.removeChild(currentNode.parentNode, currentNode);
              }
              currentNode = startNode;
          }
        }
        currentVNode = value;
      }
    });

    // Store cleanup
    // We attach to startNode because it's the stable anchor
    // If startNode was replaced, attach to the new node (currentNode)
    const targetNode = currentNode || startNode;
    if (targetNode) {
      if (!REACTIVE_BINDINGS.has(targetNode)) {
        REACTIVE_BINDINGS.set(targetNode, new Set());
      }
      REACTIVE_BINDINGS.get(targetNode)!.add(dispose);
    }

    // Determine the result node to append/return
    const resultNode = (currentNode !== startNode && currentNode) ? currentNode : wrapperFragment;

    // If parent is provided, append the result
    if (parent) {
        domRenderer.appendChild(parent, resultNode);
    }

    // If we appended wrapperFragment, it's now empty.
    // We should return the anchor (startNode) so the caller can track/remove it.
    if (resultNode === wrapperFragment) {
        return startNode;
    }

    return resultNode;
  }

  // Handle arrays (fragments)
  if (Array.isArray(vnode)) {
    const fragment = document.createDocumentFragment();
    for (const child of vnode) {
      const childNode = mountReactive(child, fragment);
      if (childNode) {
        fragment.appendChild(childNode);
      }
    }
    return fragment;
  }

  // Handle text nodes
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return domRenderer.createTextNode(String(vnode));
  }

  // Handle VNodes
  if (isVNode(vnode)) {
    // Handle function components
    if (typeof vnode.type === 'function') {
      const component = vnode.type as Function;

      // Create a container for the component's output
      let currentNode: Node | null = null;

      // Create reactive effect for component re-rendering
      const dispose = effect(() => {
        const contextId = (component as any)._contextId;
        if (contextId) {
          pushProvider(contextId, vnode.props.value);
        }

        try {
          const result = component({ ...vnode.props, children: vnode.children });

          if (currentNode) {
            // Update existing node
            const newNode = mountReactive(result);
            if (newNode && parent) {
              parent.replaceChild(newNode, currentNode);
              cleanupReactive(currentNode);
              currentNode = newNode;
            }
          } else {
            // Initial render
            currentNode = mountReactive(result, parent);
          }
        } finally {
          if (contextId) {
            popProvider(contextId);
          }
        }
      });

      // Store cleanup function
      if (currentNode) {
        if (!REACTIVE_BINDINGS.has(currentNode)) {
          REACTIVE_BINDINGS.set(currentNode, new Set());
        }
        REACTIVE_BINDINGS.get(currentNode)!.add(dispose);
      }

      return currentNode;
    }

    // Handle fragments
    if (vnode.type === 'fragment') {
      const fragment = document.createDocumentFragment();
      for (const child of vnode.children) {
        const childNode = mountReactive(child, fragment);
        if (childNode) {
          fragment.appendChild(childNode);
        }
      }
      return fragment;
    }

    // Handle built-in elements
    const node = domRenderer.createNode(vnode.type as string, vnode.props);

    // Set up reactive bindings for props
    const disposeProps = setupReactiveProps(node, vnode.props);
    if (disposeProps.length > 0) {
      REACTIVE_BINDINGS.set(node, new Set(disposeProps));
    }

    // Mount children with reactive tracking
    for (const child of vnode.children) {
      const childNode = mountReactive(child, node);
      if (childNode) {
        domRenderer.appendChild(node, childNode);
      }
    }

    if (parent) {
      domRenderer.appendChild(parent, node);
    }

    return node;
  }

  return null;
}

/**
 * Set up reactive effects for props that might contain signals
 */
function setupReactiveProps(
  node: HTMLElement,
  props: Record<string, any>
): (() => void)[] {
  const disposers: (() => void)[] = [];

  // Check each prop for potential reactivity
  for (const key in props) {
    const value = props[key];

    // Skip event handlers
    if (key.startsWith('on')) {
      continue;
    }

    // Handle signals directly
    if (isSignal(value)) {
      const dispose = effect(() => {
        const computedValue = value.value;
        const oldProps = { [key]: undefined };
        const newProps = { [key]: computedValue };
        domRenderer.updateNode(node, oldProps, newProps);
      });
      disposers.push(dispose);
      continue;
    }

    // Handle functions that might be computed values
    if (typeof value === 'function') {
      // Create reactive effect for computed/signal values
      const dispose = effect(() => {
        try {
          // Try to execute as a getter function
          const computedValue = value();

          // Update the prop with the computed value
          const oldProps = { [key]: undefined };
          const newProps = { [key]: computedValue };
          domRenderer.updateNode(node, oldProps, newProps);
        } catch (e) {
          // Not a signal/computed, ignore
        }
      });

      disposers.push(dispose);
    }
  }

  return disposers;
}

/**
 * Clean up reactive bindings when a node is removed
 */
export function cleanupReactive(node: Node): void {
  const bindings = REACTIVE_BINDINGS.get(node);
  if (bindings) {
    bindings.forEach((dispose) => dispose());
    REACTIVE_BINDINGS.delete(node);
  }

  // Clean up children
  if (node.childNodes) {
    node.childNodes.forEach((child) => cleanupReactive(child));
  }
}

/**
 * Render a component with reactive tracking
 */
export function renderReactive(
  vnode: VNode | string | number | null | undefined | Function,
  container: HTMLElement
): Node | null {
  // Clear container
  while (container.firstChild) {
    cleanupReactive(container.firstChild);
    container.removeChild(container.firstChild);
  }

  // Mount with reactive tracking
  const node = mountReactive(vnode, container);
  if (node) {
    container.appendChild(node);
  }

  return node;
}

/**
 * Create a reactive root for rendering
 */
export function createReactiveRoot(container: HTMLElement) {
  let rootDispose: (() => void) | null = null;

  return {
    render(vnode: VNode) {
      // Batch all updates together
      batch(() => {
        // Clean up previous render
        if (rootDispose) {
          rootDispose();
        }

        // Create new render effect
        rootDispose = effect(() => {
          renderReactive(vnode, container);
        });

      });
    },
    unmount() {
      if (rootDispose) {
        rootDispose();
        rootDispose = null;
      }

      while (container.firstChild) {
        cleanupReactive(container.firstChild);
        container.removeChild(container.firstChild);
      }

    },
  };
}

/**
 * Helper to create reactive text nodes that update when signals change
 *
 * @deprecated Use signals directly as children instead
 * @example
 * // Old way:
 * reactiveText(() => count.value)
 *
 * // New way:
 * h('div', {}, [count])
 */
export function reactiveText(getText: () => string): Text {
  const textNode = document.createTextNode('');

  const dispose = effect(() => {
    const text = getText();
    domRenderer.updateTextNode(textNode, text);
  });

  // Store cleanup
  REACTIVE_BINDINGS.set(textNode, new Set([dispose]));

  return textNode;
}

/**
 * Helper function to bind a signal to an element property
 * Useful for more complex bindings beyond simple text content
 *
 * @param signal - The signal to bind
 * @param transform - Optional transform function
 * @returns An object that can be spread into props
 *
 * @example
 * const isDisabled = signal(false);
 * h('button', { ...bind(isDisabled, (val) => ({ disabled: val })) })
 */
export function bind<T>(
  signal: Signal<T> | Computed<T>,
  transform?: (value: T) => Record<string, any>
): Record<string, Signal<any> | Computed<any>> {
  if (transform) {
    // If there's a transform, we need to return signals for each prop
    // For simplicity, we'll just pass the signal directly and let setupReactiveProps handle it
    return { __signal__: signal };
  }
  return { value: signal };
}

/**
 * Reactive Text Component
 * A convenience component that accepts signals directly as children
 *
 * @example
 * // Simple usage:
 * h(ReactiveText, {}, [count])
 *
 * // With styling:
 * h(ReactiveText, { fontSize: 24, color: 'blue' }, [count])
 */
export function ReactiveText(props: {
  children?: any[];
  [key: string]: any;
}): VNode {
  const { children = [], ...otherProps } = props;

  return {
    type: 'span',
    props: otherProps,
    children: children,
  };
}
