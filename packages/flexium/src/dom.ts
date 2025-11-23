/**
 * Flexium DOM Renderer
 *
 * Complete DOM rendering system with reactive components
 */

// Re-export core reactivity
export { signal, computed, effect, batch, untrack, root } from './core/signal'
export type { Signal, Computed } from './core/signal'

// DOM renderer
export { DOMRenderer } from './renderers/dom'
export { h, Fragment, isVNode, createTextVNode } from './renderers/dom/h'
export { render, createRoot } from './renderers/dom/render'
export { mountReactive, createReactiveRoot } from './renderers/dom/reactive'
export { hydrate } from './renderers/dom/hydrate'

// Types
export type { Renderer, VNode, CommonProps } from './core/renderer'
