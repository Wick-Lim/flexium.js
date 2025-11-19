/**
 * Reactive DOM Rendering
 *
 * Integrates the signal system with the DOM renderer to enable fine-grained
 * reactive updates. Only the specific DOM nodes that depend on changed signals
 * will be updated, without re-rendering the entire component tree.
 */

import type { VNode } from '../../core/renderer';
import { effect, batch } from '../../core/signal';
import { domRenderer } from './index';
import { isVNode } from './h';

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
  vnode: VNode | string | number | null | undefined,
  parent?: Node
): Node | null {
  // Handle null/undefined
  if (vnode === null || vnode === undefined) {
    return null;
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
      let currentVNode: VNode | string | number | null | undefined = null;

      // Create reactive effect for component re-rendering
      const dispose = effect(() => {
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

        currentVNode = result;
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

    // Skip non-reactive props
    if (typeof value !== 'function' || key.startsWith('on')) {
      continue;
    }

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

  return disposers;
}

/**
 * Clean up reactive bindings when a node is removed
 */
function cleanupReactive(node: Node): void {
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
  vnode: VNode | string | number | null | undefined,
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
  let currentVNode: VNode | null = null;
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

        currentVNode = vnode;
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

      currentVNode = null;
    },
  };
}

/**
 * Helper to create reactive text nodes that update when signals change
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
