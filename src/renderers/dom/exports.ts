/**
 * DOM Renderer Exports
 *
 * Main entry point for the DOM renderer package.
 * Re-exports all public APIs for use in applications.
 */

// Renderer implementation
export { DOMRenderer, domRenderer } from './index';

// Rendering functions
export { render, update, createRoot } from './render';

// Reactive rendering
export {
  renderReactive,
  createReactiveRoot,
  mountReactive,
  reactiveText,
} from './reactive';

// JSX factory
export { h, Fragment, isVNode, createTextVNode } from './h';

// Types from core
export type {
  Renderer,
  RenderNode,
  EventHandler,
  CommonProps,
  VNode,
} from '../../core/renderer';
