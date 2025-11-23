/**
 * Internal Exports for Testing
 * 
 * This file exposes internal APIs that are no longer part of the public interface
 * but are still required for unit testing the core logic.
 */

// Core Signal System
export { 
  signal, 
  computed, 
  effect, 
  root, 
  isSignal, 
  onCleanup, 
  createResource,
  onMount
} from './core/signal';

export { state } from './core/state';

// Context
export { createContext, useContext } from './core/context';

// Store
export { createStore } from './store/store';

// Router
export { createLocation, matchPath } from './router/core';
export { Router, Route, Outlet, Link, useRouter } from './router/components';

export { createReactiveRoot } from './renderers/dom/reactive';

// Flow
export { For, Show, Switch, Match } from './core/flow';
export { Suspense } from './core/suspense';
export { ErrorBoundary } from './core/error-boundary'; // New export

// State

// DOM
export { h, render } from './renderers/dom/exports';
export { domRenderer } from './renderers/dom/index';
export { Portal } from './renderers/dom/portal';
