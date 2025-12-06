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
export { createReactiveRoot, mountReactive, reactiveText } from './reactive'

// JSX factory
export { f, Fragment, isFNode } from './f'

// Types from core
export type {
  Renderer,
  RenderNode,
  EventHandler,
  CommonProps,
  FNode,
} from '../../core/renderer'
