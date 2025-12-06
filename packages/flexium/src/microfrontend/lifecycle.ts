/**
 * Micro Frontend Lifecycle Management
 *
 * Handles registration, loading, mounting, and unmounting of micro frontends
 */

import { signal, effect, batch } from '../core/signal'
import type {
  MicroAppConfig,
  MicroAppInstance,
  MicroAppLifecycle,
  MicroAppState,
  OrchestratorConfig,
} from './types'

/** Global registry of all registered micro apps */
const appRegistry = new Map<string, MicroAppInstance>()

/** Reactive signal for app states (for UI updates) */
const appStates = signal<Map<string, MicroAppState>>(new Map())

/** Orchestrator configuration */
let orchestratorConfig: OrchestratorConfig = {}

/**
 * Configure the micro frontend orchestrator
 */
export function configureOrchestrator(config: OrchestratorConfig): void {
  orchestratorConfig = { ...orchestratorConfig, ...config }
}

/**
 * Get orchestrator debug mode
 */
function isDebug(): boolean {
  return orchestratorConfig.debug ?? false
}

/**
 * Log debug messages
 */
function debug(message: string, ...args: unknown[]): void {
  if (isDebug()) {
    console.log(`[MicroFrontend] ${message}`, ...args)
  }
}

/**
 * Update app state with proper error handling and notifications
 */
function updateAppState(name: string, state: MicroAppState, error?: Error): void {
  const app = appRegistry.get(name)
  if (!app) return

  app.state = state
  app.error = error ?? null
  app.lastStateChange = Date.now()

  batch(() => {
    const newStates = new Map(appStates.value)
    newStates.set(name, state)
    appStates.value = newStates
  })

  orchestratorConfig.onStateChange?.(name, state)
  debug(`App "${name}" state changed to: ${state}`, error)
}

/**
 * Register a micro frontend application
 */
export function registerMicroApp<Props = Record<string, unknown>>(
  config: MicroAppConfig<Props>
): MicroAppInstance<Props> {
  if (appRegistry.has(config.name)) {
    throw new Error(`Micro app "${config.name}" is already registered`)
  }

  const instance: MicroAppInstance<Props> = {
    name: config.name,
    state: 'unloaded',
    lifecycle: config.lifecycle ?? null,
    container: null,
    config,
    error: null,
    lastStateChange: Date.now(),
  }

  appRegistry.set(config.name, instance as MicroAppInstance)

  batch(() => {
    const newStates = new Map(appStates.value)
    newStates.set(config.name, 'unloaded')
    appStates.value = newStates
  })

  debug(`Registered app: ${config.name}`)

  // Eager load if specified
  if (config.loadStrategy === 'eager' && config.entry) {
    loadMicroApp(config.name).catch((err) => {
      console.error(`Failed to eager load "${config.name}":`, err)
    })
  }

  return instance
}

/**
 * Unregister a micro frontend application
 */
export async function unregisterMicroApp(name: string): Promise<void> {
  const app = appRegistry.get(name)
  if (!app) {
    throw new Error(`Micro app "${name}" is not registered`)
  }

  // Unmount if mounted
  if (app.state === 'mounted') {
    await unmountMicroApp(name)
  }

  appRegistry.delete(name)

  batch(() => {
    const newStates = new Map(appStates.value)
    newStates.delete(name)
    appStates.value = newStates
  })

  debug(`Unregistered app: ${name}`)
}

/**
 * Load a micro frontend application (fetch and parse entry)
 */
export async function loadMicroApp(name: string): Promise<MicroAppLifecycle> {
  const app = appRegistry.get(name)
  if (!app) {
    throw new Error(`Micro app "${name}" is not registered`)
  }

  // Already loaded
  if (app.lifecycle && app.state !== 'unloaded' && app.state !== 'error') {
    return app.lifecycle
  }

  // If lifecycle is provided directly, no need to load
  if (app.config.lifecycle) {
    app.lifecycle = app.config.lifecycle
    updateAppState(name, 'loaded')
    return app.lifecycle
  }

  // Remote loading
  if (!app.config.entry) {
    throw new Error(`Micro app "${name}" has no entry point or lifecycle`)
  }

  updateAppState(name, 'loading')

  try {
    const timeout = app.config.loadTimeout ?? 30000
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const lifecycle = await loadRemoteEntry(app.config.entry, controller.signal)
    clearTimeout(timeoutId)

    app.lifecycle = lifecycle
    updateAppState(name, 'loaded')
    return lifecycle
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    updateAppState(name, 'error', err)
    app.config.onError?.(err, app)
    orchestratorConfig.onError?.(err, name)
    throw err
  }
}

/**
 * Load a remote entry and extract lifecycle hooks
 */
async function loadRemoteEntry(
  url: string,
  signal?: AbortSignal
): Promise<MicroAppLifecycle> {
  // Dynamic import for ES modules
  try {
    const module = await import(/* @vite-ignore */ url)

    // Check for standard lifecycle exports
    if (module.mount && typeof module.mount === 'function') {
      return {
        bootstrap: module.bootstrap,
        mount: module.mount,
        unmount: module.unmount ?? (() => {}),
        update: module.update,
      }
    }

    // Check for default export with lifecycle
    if (module.default) {
      const def = module.default
      if (def.mount && typeof def.mount === 'function') {
        return {
          bootstrap: def.bootstrap,
          mount: def.mount,
          unmount: def.unmount ?? (() => {}),
          update: def.update,
        }
      }
    }

    throw new Error(`Module at "${url}" does not export valid lifecycle hooks`)
  } catch (error) {
    if (signal?.aborted) {
      throw new Error(`Loading "${url}" timed out`)
    }
    throw error
  }
}

/**
 * Bootstrap a micro frontend application
 */
export async function bootstrapMicroApp(name: string): Promise<void> {
  const app = appRegistry.get(name)
  if (!app) {
    throw new Error(`Micro app "${name}" is not registered`)
  }

  // Load if not loaded
  if (!app.lifecycle) {
    await loadMicroApp(name)
  }

  if (!app.lifecycle) {
    throw new Error(`Micro app "${name}" failed to load`)
  }

  // Already bootstrapped
  if (app.state === 'mounted' || app.state === 'bootstrapping') {
    return
  }

  updateAppState(name, 'bootstrapping')

  try {
    if (app.lifecycle.bootstrap) {
      await app.lifecycle.bootstrap(app.config.props ?? {})
    }
    debug(`Bootstrapped app: ${name}`)
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    updateAppState(name, 'error', err)
    app.config.onError?.(err, app)
    orchestratorConfig.onError?.(err, name)
    throw err
  }
}

/**
 * Resolve container element
 */
function resolveContainer(
  config: MicroAppConfig
): HTMLElement {
  if (config.container) {
    if (typeof config.container === 'string') {
      const el = document.querySelector(config.container)
      if (!el) {
        throw new Error(`Container "${config.container}" not found`)
      }
      return el as HTMLElement
    }
    return config.container
  }

  if (orchestratorConfig.defaultContainer) {
    const el = document.querySelector(orchestratorConfig.defaultContainer)
    if (el) return el as HTMLElement
  }

  throw new Error(`No container specified for micro app "${config.name}"`)
}

/**
 * Mount a micro frontend application
 */
export async function mountMicroApp(
  name: string,
  containerOverride?: HTMLElement
): Promise<void> {
  const app = appRegistry.get(name)
  if (!app) {
    throw new Error(`Micro app "${name}" is not registered`)
  }

  // Bootstrap first if needed
  if (app.state === 'unloaded' || app.state === 'loaded') {
    await bootstrapMicroApp(name)
  }

  if (!app.lifecycle) {
    throw new Error(`Micro app "${name}" has no lifecycle`)
  }

  // Already mounted
  if (app.state === 'mounted') {
    debug(`App "${name}" is already mounted`)
    return
  }

  try {
    const container = containerOverride ?? resolveContainer(app.config)
    app.container = container

    // Apply style isolation if configured
    let mountTarget = container
    if (app.config.sandboxStyles) {
      mountTarget = createShadowContainer(container, name)
    }

    await app.lifecycle.mount(mountTarget, app.config.props ?? {})
    updateAppState(name, 'mounted')
    debug(`Mounted app: ${name}`)
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    updateAppState(name, 'error', err)
    app.config.onError?.(err, app)
    orchestratorConfig.onError?.(err, name)
    throw err
  }
}

/**
 * Create a shadow DOM container for style isolation
 */
function createShadowContainer(parent: HTMLElement, appName: string): HTMLElement {
  const host = document.createElement('div')
  host.setAttribute('data-micro-app', appName)
  host.setAttribute('data-shadow-host', 'true')
  parent.appendChild(host)

  const shadow = host.attachShadow({ mode: 'open' })
  const container = document.createElement('div')
  container.setAttribute('data-shadow-container', 'true')
  shadow.appendChild(container)

  return container
}

/**
 * Unmount a micro frontend application
 */
export async function unmountMicroApp(name: string): Promise<void> {
  const app = appRegistry.get(name)
  if (!app) {
    throw new Error(`Micro app "${name}" is not registered`)
  }

  if (app.state !== 'mounted') {
    debug(`App "${name}" is not mounted`)
    return
  }

  if (!app.lifecycle || !app.container) {
    return
  }

  updateAppState(name, 'unmounting')

  try {
    await app.lifecycle.unmount(app.container)

    // Clean up shadow DOM if used
    const shadowHost = app.container.closest('[data-shadow-host]')
    if (shadowHost) {
      shadowHost.remove()
    } else {
      app.container.innerHTML = ''
    }

    app.container = null
    updateAppState(name, 'loaded')
    debug(`Unmounted app: ${name}`)
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    updateAppState(name, 'error', err)
    app.config.onError?.(err, app)
    orchestratorConfig.onError?.(err, name)
    throw err
  }
}

/**
 * Update a mounted micro frontend with new props
 */
export async function updateMicroApp<Props = Record<string, unknown>>(
  name: string,
  props: Props
): Promise<void> {
  const app = appRegistry.get(name)
  if (!app) {
    throw new Error(`Micro app "${name}" is not registered`)
  }

  if (app.state !== 'mounted') {
    throw new Error(`Micro app "${name}" is not mounted`)
  }

  if (!app.lifecycle) {
    return
  }

  // Update stored props
  app.config.props = { ...app.config.props, ...props } as Record<string, unknown>

  // Call update if available, otherwise remount
  if (app.lifecycle.update) {
    await app.lifecycle.update(app.config.props)
  } else {
    // Remount with new props
    if (app.container) {
      const container = app.container
      await unmountMicroApp(name)
      await mountMicroApp(name, container)
    }
  }

  debug(`Updated app: ${name}`, props)
}

/**
 * Get a registered micro app instance
 */
export function getMicroApp(name: string): MicroAppInstance | undefined {
  return appRegistry.get(name)
}

/**
 * Get all registered micro apps
 */
export function getAllMicroApps(): Map<string, MicroAppInstance> {
  return new Map(appRegistry)
}

/**
 * Get reactive app states signal
 */
export function getAppStates(): typeof appStates {
  return appStates
}

/**
 * Check if a micro app should be active based on current location
 */
export function checkAppActivity(name: string, location?: Location): boolean {
  const app = appRegistry.get(name)
  if (!app) return false

  const currentLocation = location ?? window.location
  const { activeWhen } = app.config

  if (!activeWhen) return true

  if (typeof activeWhen === 'function') {
    return activeWhen(currentLocation)
  }

  if (typeof activeWhen === 'string') {
    return currentLocation.pathname.startsWith(activeWhen)
  }

  if (Array.isArray(activeWhen)) {
    return activeWhen.some((path) => currentLocation.pathname.startsWith(path))
  }

  return true
}

/**
 * Auto-mount/unmount apps based on route changes
 */
export function startRouteBasedMounting(): () => void {
  const handleRouteChange = (): void => {
    for (const [name, app] of appRegistry) {
      const shouldBeActive = checkAppActivity(name)

      if (shouldBeActive && app.state !== 'mounted') {
        mountMicroApp(name).catch((err) => {
          console.error(`Failed to mount "${name}" on route change:`, err)
        })
      } else if (!shouldBeActive && app.state === 'mounted') {
        unmountMicroApp(name).catch((err) => {
          console.error(`Failed to unmount "${name}" on route change:`, err)
        })
      }
    }
  }

  // Initial check
  handleRouteChange()

  // Listen for navigation events
  window.addEventListener('popstate', handleRouteChange)
  window.addEventListener('hashchange', handleRouteChange)

  // Patch history methods
  const originalPushState = history.pushState.bind(history)
  const originalReplaceState = history.replaceState.bind(history)

  history.pushState = (...args) => {
    originalPushState(...args)
    handleRouteChange()
  }

  history.replaceState = (...args) => {
    originalReplaceState(...args)
    handleRouteChange()
  }

  // Return cleanup function
  return () => {
    window.removeEventListener('popstate', handleRouteChange)
    window.removeEventListener('hashchange', handleRouteChange)
    history.pushState = originalPushState
    history.replaceState = originalReplaceState
  }
}

/**
 * Create a helper to define micro app lifecycle with type safety
 */
export function defineMicroApp<Props = Record<string, unknown>>(
  lifecycle: MicroAppLifecycle<Props>
): MicroAppLifecycle<Props> {
  return lifecycle
}
