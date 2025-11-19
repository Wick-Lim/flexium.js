/**
 * DOM Render Function
 *
 * This module provides the main render function for mounting components to the DOM.
 * It includes simple reconciliation logic for mounting and unmounting components.
 */

import type { VNode } from '../../core/renderer';
import { domRenderer } from './index';
import { isVNode } from './h';

/**
 * Internal node data stored on DOM nodes
 */
interface NodeData {
  vnode: VNode | null;
  props: Record<string, any>;
}

const NODE_DATA = new WeakMap<Node, NodeData>();

/**
 * Render a component to a DOM container
 *
 * @param vnode - Virtual node to render
 * @param container - DOM element to render into
 * @returns The rendered DOM node
 */
export function render(
  vnode: VNode | string | number | null | undefined,
  container: HTMLElement
): Node | null {
  // Clear container if it has existing content
  if (container.firstChild) {
    unmount(container);
  }

  // Mount new content
  const node = mount(vnode);
  if (node) {
    container.appendChild(node);
  }

  return node;
}

/**
 * Mount a virtual node to create a DOM node
 */
function mount(vnode: VNode | string | number | null | undefined): Node | null {
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
      const result = component({ ...vnode.props, children: vnode.children });
      return mount(result);
    }

    // Handle fragments
    if (vnode.type === 'fragment') {
      const fragment = document.createDocumentFragment();
      for (const child of vnode.children) {
        const childNode = mount(child);
        if (childNode) {
          fragment.appendChild(childNode);
        }
      }
      return fragment;
    }

    // Handle built-in elements
    const node = domRenderer.createNode(vnode.type as string, vnode.props);

    // Store node data for future reconciliation
    NODE_DATA.set(node, {
      vnode,
      props: vnode.props,
    });

    // Mount children
    for (const child of vnode.children) {
      const childNode = mount(child);
      if (childNode) {
        domRenderer.appendChild(node, childNode);
      }
    }

    return node;
  }

  return null;
}

/**
 * Unmount a DOM node and clean up
 */
function unmount(node: Node): void {
  // Clean up children first
  const childNodes = Array.from(node.childNodes);
  for (const child of childNodes) {
    unmount(child);
  }

  // Remove from parent
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }

  // Clean up stored data
  NODE_DATA.delete(node);
}

/**
 * Update an existing DOM node with a new virtual node
 * (Simple implementation - will be enhanced with proper reconciliation later)
 */
export function update(
  node: HTMLElement,
  oldVNode: VNode,
  newVNode: VNode
): void {
  // If types don't match, replace the node
  if (oldVNode.type !== newVNode.type) {
    const newNode = mount(newVNode);
    if (newNode && node.parentNode) {
      node.parentNode.replaceChild(newNode, node);
    }
    unmount(node);
    return;
  }

  // Update props
  domRenderer.updateNode(node, oldVNode.props, newVNode.props);

  // Update stored data
  NODE_DATA.set(node, {
    vnode: newVNode,
    props: newVNode.props,
  });

  // Update children (simple approach for now)
  const oldChildren = oldVNode.children;
  const newChildren = newVNode.children;

  // Simple reconciliation: update/add/remove based on index
  const maxLength = Math.max(oldChildren.length, newChildren.length);

  for (let i = 0; i < maxLength; i++) {
    const oldChild = oldChildren[i];
    const newChild = newChildren[i];
    const childNode = node.childNodes[i];

    if (!newChild) {
      // Remove old child
      if (childNode) {
        unmount(childNode);
      }
    } else if (!oldChild) {
      // Add new child
      const newChildNode = mount(newChild);
      if (newChildNode) {
        domRenderer.appendChild(node, newChildNode);
      }
    } else if (typeof oldChild === 'string' || typeof oldChild === 'number') {
      // Update text node
      if (typeof newChild === 'string' || typeof newChild === 'number') {
        if (oldChild !== newChild && childNode) {
          domRenderer.updateTextNode(childNode as Text, String(newChild));
        }
      } else {
        // Replace text with element
        const newChildNode = mount(newChild);
        if (newChildNode && childNode) {
          node.replaceChild(newChildNode, childNode);
          unmount(childNode);
        }
      }
    } else if (isVNode(oldChild)) {
      if (typeof newChild === 'string' || typeof newChild === 'number') {
        // Replace element with text
        const newChildNode = mount(newChild);
        if (newChildNode && childNode) {
          node.replaceChild(newChildNode, childNode);
          unmount(childNode);
        }
      } else if (isVNode(newChild)) {
        // Update element
        if (childNode instanceof HTMLElement) {
          update(childNode, oldChild, newChild);
        }
      }
    }
  }
}

/**
 * Create a root for rendering with reactivity support
 */
export function createRoot(container: HTMLElement) {
  let currentVNode: VNode | null = null;
  let currentNode: Node | null = null;

  return {
    render(vnode: VNode) {
      if (!currentVNode) {
        // Initial render
        currentNode = render(vnode, container);
        currentVNode = vnode;
      } else {
        // Update render
        if (currentNode instanceof HTMLElement) {
          update(currentNode, currentVNode, vnode);
          currentVNode = vnode;
        }
      }
    },
    unmount() {
      if (currentNode) {
        unmount(currentNode);
        currentVNode = null;
        currentNode = null;
      }
    },
  };
}
