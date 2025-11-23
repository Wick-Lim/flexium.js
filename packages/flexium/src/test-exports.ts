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
  batch, 
  untrack, 
  root, 
  isSignal, 
  onCleanup, 
  createResource 
} from './core/signal';

// Context
export { createContext, useContext } from './core/context';

// Store
export { createStore } from './store/store';

// Router
export { createLocation, matchPath } from './router/core';
