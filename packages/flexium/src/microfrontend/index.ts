/**
 * Flexium Micro Frontend Module
 *
 * Provides comprehensive micro frontend architecture support including:
 * - Lifecycle management (load, mount, unmount)
 * - Module Federation style remote loading
 * - Cross-app event bus communication
 * - Shared state management
 * - Style isolation (Shadow DOM & CSS scoping)
 * - Router integration
 *
 * @example
 * ```tsx
 * import {
 *   registerMicroApp,
 *   mountMicroApp,
 *   emit,
 *   subscribe,
 *   sharedState,
 *   createIsolatedContainer
 * } from 'flexium/microfrontend'
 *
 * // Register a micro app
 * registerMicroApp({
 *   name: 'header',
 *   container: '#header-container',
 *   lifecycle: {
 *     mount: (container) => {
 *       render(<Header />, container)
 *     },
 *     unmount: (container) => {
 *       container.innerHTML = ''
 *     }
 *   }
 * })
 *
 * // Mount the app
 * await mountMicroApp('header')
 *
 * // Cross-app communication
 * emit('user:login', { userId: '123' })
 * subscribe('user:login', (msg) => console.log(msg.payload))
 *
 * // Shared state
 * const [user, setUser] = sharedState('currentUser', null)
 * ```
 */

// Internal imports for setupMicroFrontend
import {
  configureOrchestrator as _configureOrchestrator,
  registerMicroApp as _registerMicroApp,
  unregisterMicroApp as _unregisterMicroApp,
  mountMicroApp as _mountMicroApp,
  unmountMicroApp as _unmountMicroApp,
} from './lifecycle'

import {
  configureEventBus as _configureEventBus,
  emit as _emit,
  subscribe as _subscribe,
  once as _once,
  request as _request,
  respond as _respond,
} from './event-bus'

import {
  configureStateBridge as _configureStateBridge,
  sharedState as _sharedState,
  getSharedState as _getSharedState,
  setSharedState as _setSharedState,
  watchSharedState as _watchSharedState,
  enableCrossTabSync as _enableCrossTabSync,
} from './state-bridge'

import {
  initMicroRouter as _initMicroRouter,
  navigate as _navigate,
  registerMicroRoute as _registerMicroRoute,
  getPathname as _getPathname,
  beforeNavigate as _beforeNavigate,
} from './router'

// Types
export type {
  MicroAppState,
  MicroAppLifecycle,
  MicroAppConfig,
  MicroAppInstance,
  RemoteEntry,
  SharedModule,
  FederationConfig,
  BusMessage,
  BusSubscriber,
  BusSubscriptionOptions,
  SharedStateConfig,
  StyleIsolationConfig,
  MicroRouterConfig,
  OrchestratorConfig,
  MicroRender,
} from './types'

// Lifecycle Management
export {
  configureOrchestrator,
  registerMicroApp,
  unregisterMicroApp,
  loadMicroApp,
  bootstrapMicroApp,
  mountMicroApp,
  unmountMicroApp,
  updateMicroApp,
  getMicroApp,
  getAllMicroApps,
  getAppStates,
  checkAppActivity,
  startRouteBasedMounting,
  defineMicroApp,
} from './lifecycle'

// Module Federation / Remote Loading
export {
  initFederation,
  registerSharedModule,
  setSharedModuleFactory,
  getSharedModule,
  loadRemote,
  loadRemoteModule,
  importFederated,
  exposeModules,
  getExposedModule,
  getRemoteLoadingStates,
  getLoadedRemotes,
  isRemoteLoaded,
  preloadRemotes,
  federatedComponent,
} from './loader'

// Event Bus
export {
  configureEventBus,
  setEventSource,
  emit,
  subscribe,
  once,
  unsubscribeAll,
  sendTo,
  request,
  respond,
  getMessageHistory,
  getMessageHistorySignal,
  clearMessageHistory,
  replayMessages,
  createChannel,
  createEventBus,
} from './event-bus'

// Shared State Bridge
export {
  configureStateBridge,
  sharedState,
  watchSharedState,
  getSharedState,
  setSharedState,
  deleteSharedState,
  getSharedStateKeys,
  getSharedStateInfo,
  clearAllSharedStates,
  createStateStore,
  enableCrossTabSync,
  createStateSnapshot,
  restoreStateSnapshot,
} from './state-bridge'

// Style Isolation
export {
  createIsolatedContainer,
  createScopedContainer,
  scopeStyles,
  createStyleSheet,
  withStyleIsolation,
  loadCSSModule,
  adoptStyles,
  createResetStyles,
} from './isolation'

// Router Integration
export {
  initMicroRouter,
  matchRoute,
  registerMicroRoute,
  configureMicroRouter,
  navigate,
  goBack,
  goForward,
  go,
  beforeNavigate,
  afterNavigate,
  getRouterState,
  getPathname,
  getSearchParams,
  getHash,
  getParams,
  createScopedRouter,
  createLinkHandler,
  watchRoute,
  preloadRoute,
} from './router'

/**
 * Quick setup function for micro frontend orchestrator
 *
 * @example
 * ```tsx
 * import { setupMicroFrontend } from 'flexium/microfrontend'
 *
 * const { registerApp, mount, bus, state } = setupMicroFrontend({
 *   debug: true,
 *   defaultContainer: '#app'
 * })
 *
 * registerApp({
 *   name: 'dashboard',
 *   activeWhen: '/dashboard',
 *   lifecycle: dashboardLifecycle
 * })
 * ```
 */
export function setupMicroFrontend(options: {
  debug?: boolean
  defaultContainer?: string
  enableRouting?: boolean
  enableCrossTabSync?: boolean
  appName?: string
} = {}): {
  registerApp: typeof import('./lifecycle').registerMicroApp
  unregisterApp: typeof import('./lifecycle').unregisterMicroApp
  mount: typeof import('./lifecycle').mountMicroApp
  unmount: typeof import('./lifecycle').unmountMicroApp
  bus: {
    emit: typeof import('./event-bus').emit
    subscribe: typeof import('./event-bus').subscribe
    once: typeof import('./event-bus').once
    request: typeof import('./event-bus').request
    respond: typeof import('./event-bus').respond
  }
  state: {
    shared: typeof import('./state-bridge').sharedState
    get: typeof import('./state-bridge').getSharedState
    set: typeof import('./state-bridge').setSharedState
    watch: typeof import('./state-bridge').watchSharedState
  }
  router: {
    navigate: typeof import('./router').navigate
    registerRoute: typeof import('./router').registerMicroRoute
    getPath: typeof import('./router').getPathname
    beforeNavigate: typeof import('./router').beforeNavigate
  }
  cleanup: () => void
} {
  const cleanupFunctions: (() => void)[] = []

  // Configure orchestrator
  _configureOrchestrator({
    debug: options.debug,
    defaultContainer: options.defaultContainer,
  })

  // Configure event bus
  if (options.appName) {
    _configureEventBus({ appName: options.appName, debug: options.debug })
    _configureStateBridge({ appName: options.appName, debug: options.debug })
  }

  // Initialize routing if enabled
  if (options.enableRouting !== false) {
    const routerCleanup = _initMicroRouter()
    cleanupFunctions.push(routerCleanup)
  }

  // Enable cross-tab sync if requested
  if (options.enableCrossTabSync) {
    const syncCleanup = _enableCrossTabSync()
    cleanupFunctions.push(syncCleanup)
  }

  return {
    registerApp: _registerMicroApp,
    unregisterApp: _unregisterMicroApp,
    mount: _mountMicroApp,
    unmount: _unmountMicroApp,
    bus: {
      emit: _emit,
      subscribe: _subscribe,
      once: _once,
      request: _request,
      respond: _respond,
    },
    state: {
      shared: _sharedState,
      get: _getSharedState,
      set: _setSharedState,
      watch: _watchSharedState,
    },
    router: {
      navigate: _navigate,
      registerRoute: _registerMicroRoute,
      getPath: _getPathname,
      beforeNavigate: _beforeNavigate,
    },
    cleanup: () => {
      for (const fn of cleanupFunctions) {
        fn()
      }
    },
  }
}
