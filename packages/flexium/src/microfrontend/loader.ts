/**
 * Module Federation Style Remote Loading
 *
 * Provides dynamic remote module loading similar to Webpack Module Federation
 */

import { signal } from '../core/signal'
import type {
  RemoteEntry,
  SharedModule,
  FederationConfig,
} from './types'

/** Registry of loaded remote containers */
const remoteContainers = new Map<string, RemoteContainer>()

/** Registry of shared modules */
const sharedModules = new Map<string, SharedModuleInstance>()

/** Current federation configuration */
let federationConfig: FederationConfig | null = null

/** Loading states for remotes */
const remoteLoadingStates = signal<Map<string, 'loading' | 'loaded' | 'error'>>(new Map())

/**
 * Remote container interface (similar to Webpack's container)
 */
interface RemoteContainer {
  name: string
  url: string
  init: (shareScope: Record<string, unknown>) => Promise<void>
  get: (moduleName: string) => Promise<() => unknown>
  modules: Map<string, unknown>
  initialized: boolean
}

/**
 * Shared module instance
 */
interface SharedModuleInstance {
  name: string
  version: string
  singleton: boolean
  eager: boolean
  module: unknown
  factory: () => Promise<unknown>
  loaded: boolean
}

/**
 * Initialize federation with configuration
 */
export function initFederation(config: FederationConfig): void {
  federationConfig = config

  // Register shared modules
  if (config.shared) {
    for (const shared of config.shared) {
      registerSharedModule(shared)
    }
  }

  // Load eager remotes
  if (config.remotes) {
    for (const remote of config.remotes) {
      loadRemote(remote).catch((err) => {
        console.error(`Failed to load remote "${remote.name}":`, err)
      })
    }
  }
}

/**
 * Register a shared module
 */
export function registerSharedModule(config: SharedModule): void {
  if (sharedModules.has(config.name)) {
    const existing = sharedModules.get(config.name)!
    // Check version compatibility if singleton
    if (config.singleton && existing.singleton) {
      console.warn(
        `Shared module "${config.name}" already registered. Using existing version: ${existing.version}`
      )
      return
    }
  }

  sharedModules.set(config.name, {
    name: config.name,
    version: config.version ?? '0.0.0',
    singleton: config.singleton ?? false,
    eager: config.eager ?? false,
    module: null,
    factory: async () => {
      // Default factory - will be overridden when module is actually loaded
      throw new Error(`Shared module "${config.name}" factory not set`)
    },
    loaded: false,
  })
}

/**
 * Set the factory function for a shared module
 */
export function setSharedModuleFactory(
  name: string,
  factory: () => Promise<unknown>
): void {
  const shared = sharedModules.get(name)
  if (shared) {
    shared.factory = factory
  } else {
    sharedModules.set(name, {
      name,
      version: '0.0.0',
      singleton: false,
      eager: false,
      module: null,
      factory,
      loaded: false,
    })
  }
}

/**
 * Get a shared module
 */
export async function getSharedModule(name: string): Promise<unknown> {
  const shared = sharedModules.get(name)
  if (!shared) {
    throw new Error(`Shared module "${name}" not registered`)
  }

  if (shared.loaded) {
    return shared.module
  }

  shared.module = await shared.factory()
  shared.loaded = true
  return shared.module
}

/**
 * Load a remote entry
 */
export async function loadRemote(config: RemoteEntry): Promise<RemoteContainer> {
  // Check cache
  if (remoteContainers.has(config.name)) {
    return remoteContainers.get(config.name)!
  }

  // Update loading state
  const newStates = new Map(remoteLoadingStates.value)
  newStates.set(config.name, 'loading')
  remoteLoadingStates.value = newStates

  try {
    const container = await createRemoteContainer(config)
    remoteContainers.set(config.name, container)

    // Update loading state
    const loadedStates = new Map(remoteLoadingStates.value)
    loadedStates.set(config.name, 'loaded')
    remoteLoadingStates.value = loadedStates

    return container
  } catch (error) {
    // Update loading state
    const errorStates = new Map(remoteLoadingStates.value)
    errorStates.set(config.name, 'error')
    remoteLoadingStates.value = errorStates
    throw error
  }
}

/**
 * Create a remote container from an entry point
 */
async function createRemoteContainer(config: RemoteEntry): Promise<RemoteContainer> {
  const format = config.format ?? 'esm'

  let moduleExports: Record<string, unknown>

  switch (format) {
    case 'esm':
      moduleExports = await import(/* @vite-ignore */ config.url)
      break

    case 'system':
      moduleExports = await loadSystemModule(config.url)
      break

    case 'umd':
    case 'global':
      moduleExports = await loadUmdModule(config.url, config.name)
      break

    default:
      throw new Error(`Unsupported module format: ${format}`)
  }

  const container: RemoteContainer = {
    name: config.name,
    url: config.url,
    modules: new Map(),
    initialized: false,

    async init(shareScope: Record<string, unknown>) {
      // Initialize shared modules from scope
      for (const [name, module] of Object.entries(shareScope)) {
        if (!sharedModules.has(name)) {
          sharedModules.set(name, {
            name,
            version: '0.0.0',
            singleton: false,
            eager: false,
            module,
            factory: async () => module,
            loaded: true,
          })
        }
      }
      this.initialized = true
    },

    async get(moduleName: string) {
      // Check cache
      if (this.modules.has(moduleName)) {
        return () => this.modules.get(moduleName)
      }

      // Try to get module from exports
      const defaultExport = moduleExports.default as Record<string, unknown> | undefined
      const module = moduleExports[moduleName] ?? defaultExport?.[moduleName]
      if (module === undefined) {
        throw new Error(`Module "${moduleName}" not found in remote "${config.name}"`)
      }

      this.modules.set(moduleName, module)
      return () => module
    },
  }

  // Initialize with current share scope
  const shareScope: Record<string, unknown> = {}
  for (const [name, shared] of sharedModules) {
    if (shared.loaded) {
      shareScope[name] = shared.module
    }
  }
  await container.init(shareScope)

  return container
}

/**
 * Load a SystemJS module
 */
async function loadSystemModule(url: string): Promise<Record<string, unknown>> {
  // Check if SystemJS is available
  if (typeof (window as unknown as { System?: { import: (url: string) => Promise<unknown> } }).System !== 'undefined') {
    const System = (window as unknown as { System: { import: (url: string) => Promise<unknown> } }).System
    return System.import(url) as Promise<Record<string, unknown>>
  }

  // Fallback to dynamic import
  return import(/* @vite-ignore */ url)
}

/**
 * Load a UMD/Global module
 */
async function loadUmdModule(
  url: string,
  globalName: string
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.async = true

    script.onload = () => {
      const module = (window as unknown as Record<string, unknown>)[globalName]
      if (module) {
        resolve(module as Record<string, unknown>)
      } else {
        reject(new Error(`Global "${globalName}" not found after loading "${url}"`))
      }
    }

    script.onerror = () => {
      reject(new Error(`Failed to load script: ${url}`))
    }

    document.head.appendChild(script)
  })
}

/**
 * Load a module from a remote
 */
export async function loadRemoteModule<T = unknown>(
  remoteName: string,
  moduleName: string
): Promise<T> {
  let container = remoteContainers.get(remoteName)

  // Load remote if not already loaded
  if (!container) {
    const remoteConfig = federationConfig?.remotes?.find((r) => r.name === remoteName)
    if (!remoteConfig) {
      throw new Error(`Remote "${remoteName}" not configured`)
    }
    container = await loadRemote(remoteConfig)
  }

  const factory = await container.get(moduleName)
  return factory() as T
}

/**
 * Import a federated module using path syntax
 * Example: importFederated('remoteApp/Button')
 */
export async function importFederated<T = unknown>(path: string): Promise<T> {
  const [remoteName, ...moduleParts] = path.split('/')
  const moduleName = moduleParts.join('/')

  if (!remoteName || !moduleName) {
    throw new Error(`Invalid federated import path: "${path}". Expected format: "remoteName/modulePath"`)
  }

  return loadRemoteModule<T>(remoteName, moduleName)
}

/**
 * Expose modules for other apps to consume
 */
export function exposeModules(
  exposes: Record<string, () => Promise<unknown>>
): void {
  if (!federationConfig) {
    federationConfig = { name: 'anonymous', exposes: {} }
  }
  federationConfig.exposes = { ...federationConfig.exposes, ...exposes }
}

/**
 * Get an exposed module
 */
export async function getExposedModule<T = unknown>(moduleName: string): Promise<T> {
  if (!federationConfig?.exposes?.[moduleName]) {
    throw new Error(`Module "${moduleName}" is not exposed`)
  }

  return federationConfig.exposes[moduleName]() as Promise<T>
}

/**
 * Get remote loading states
 */
export function getRemoteLoadingStates(): typeof remoteLoadingStates {
  return remoteLoadingStates
}

/**
 * Get all loaded remotes
 */
export function getLoadedRemotes(): string[] {
  return Array.from(remoteContainers.keys())
}

/**
 * Check if a remote is loaded
 */
export function isRemoteLoaded(name: string): boolean {
  return remoteContainers.has(name)
}

/**
 * Preload remote entries without executing them
 */
export async function preloadRemotes(remotes: RemoteEntry[]): Promise<void> {
  const preloadPromises = remotes.map(async (remote) => {
    // Create a link preload hint
    const link = document.createElement('link')
    link.rel = 'modulepreload'
    link.href = remote.url
    document.head.appendChild(link)

    // Return promise that resolves when the script is loaded
    return new Promise<void>((resolve) => {
      link.onload = () => resolve()
      link.onerror = () => resolve() // Don't fail on preload errors
    })
  })

  await Promise.all(preloadPromises)
}

/**
 * Create a lazy component wrapper for federated imports
 */
export function federatedComponent<Props = Record<string, unknown>>(
  path: string,
  fallback?: () => unknown
): (props: Props) => Promise<unknown> {
  let cachedComponent: unknown = null
  let loadPromise: Promise<unknown> | null = null

  return async (props: Props) => {
    if (cachedComponent) {
      return typeof cachedComponent === 'function'
        ? cachedComponent(props)
        : cachedComponent
    }

    if (!loadPromise) {
      loadPromise = importFederated(path).then((module) => {
        // Handle both default export and direct export
        cachedComponent = (module as { default?: unknown }).default ?? module
        return cachedComponent
      })
    }

    try {
      const component = await loadPromise
      return typeof component === 'function' ? component(props) : component
    } catch (error) {
      if (fallback) {
        return fallback()
      }
      throw error
    }
  }
}
