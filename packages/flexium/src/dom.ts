/**
 * Flexium DOM Renderer
 *
 * Complete DOM rendering system with reactive components
 */

// Core reactivity is NO LONGER re-exported.
// Please import directly from 'flexium/core'.
// export { effect, root } from './core/signal'
// export { state } from './core/state'

// DOM renderer
export { DOMRenderer, domRenderer } from './renderers/dom'
export { f, Fragment } from './renderers/dom/f'
export { render, createRoot } from './renderers/dom/render'
export { mountReactive, createReactiveRoot } from './renderers/dom/reactive'
export { Portal } from './renderers/dom/portal'
export { hydrate } from './renderers/dom/hydrate'

// Types (public API - no VNode exposure)
export type { Renderer, CommonProps } from './core/renderer'
