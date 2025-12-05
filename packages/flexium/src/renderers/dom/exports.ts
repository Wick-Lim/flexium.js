/**
 * DOM Renderer Exports
 *
 * Main entry point for the DOM renderer package.
 * Re-exports all public APIs for use in applications.
 */

// Renderer implementation
export { DOMRenderer, domRenderer } from './index'

// Rendering functions
export { render, update, createRoot } from './render'

// Reactive rendering
export {
  renderReactive,
  createReactiveRoot,
  mountReactive,
  reactiveText,
  bind,
  ReactiveText,
} from './reactive'

// JSX factory
export { f, Fragment, isFNode, createTextVNode } from './h'

// Types from core
export type {
  Renderer,
  RenderNode,
  EventHandler,
  CommonProps,
  FNode,
} from '../../core/renderer'
