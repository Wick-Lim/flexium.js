/**
 * Micro Frontend Types
 *
 * Type definitions for the micro frontend architecture support
 */

import type { FNodeChild } from '../core/renderer'

/**
 * Lifecycle states for a micro frontend application
 */
export type MicroAppState =
  | 'unloaded'
  | 'loading'
  | 'loaded'
  | 'bootstrapping'
  | 'mounted'
  | 'unmounting'
  | 'error'

/**
 * Lifecycle hooks that a micro frontend must implement
 */
export interface MicroAppLifecycle<Props = Record<string, unknown>> {
  /** Called once when the app is first loaded */
  bootstrap?: (props: Props) => Promise<void> | void
  /** Called when the app should render to the DOM */
  mount: (container: HTMLElement, props: Props) => Promise<void> | void
  /** Called when the app should be removed from the DOM */
  unmount: (container: HTMLElement) => Promise<void> | void
  /** Optional: Called to update the app with new props without remounting */
  update?: (props: Props) => Promise<void> | void
}

/**
 * Configuration for registering a micro frontend application
 */
export interface MicroAppConfig<Props = Record<string, unknown>> {
  /** Unique identifier for the micro app */
  name: string
  /** URL to load the micro app from (for remote loading) */
  entry?: string
  /** Local lifecycle object (for local apps) */
  lifecycle?: MicroAppLifecycle<Props>
  /** Container element or selector where the app will be mounted */
  container?: string | HTMLElement
  /** Function to determine if the app should be active based on location */
  activeWhen?: string | string[] | ((location: Location) => boolean)
  /** Custom props to pass to the micro app */
  props?: Props
  /** Whether to load the app immediately or lazily */
  loadStrategy?: 'eager' | 'lazy'
  /** Timeout for loading the app (in milliseconds) */
  loadTimeout?: number
  /** Whether to isolate styles using Shadow DOM */
  sandboxStyles?: boolean
  /** Whether to isolate JavaScript scope */
  sandboxJS?: boolean
  /** Custom error handler for this app */
  onError?: (error: Error, app: MicroAppInstance) => void
}

/**
 * Runtime instance of a registered micro app
 */
export interface MicroAppInstance<Props = Record<string, unknown>> {
  /** The app's unique name */
  name: string
  /** Current state of the app */
  state: MicroAppState
  /** The resolved lifecycle object */
  lifecycle: MicroAppLifecycle<Props> | null
  /** The container element */
  container: HTMLElement | null
  /** The app's configuration */
  config: MicroAppConfig<Props>
  /** Any error that occurred */
  error: Error | null
  /** Timestamp of last state change */
  lastStateChange: number
}

/**
 * Remote entry configuration for Module Federation style loading
 */
export interface RemoteEntry {
  /** Name of the remote */
  name: string
  /** URL to the remote entry file */
  url: string
  /** Format of the remote entry */
  format?: 'esm' | 'system' | 'umd' | 'global'
  /** Exposed modules from the remote */
  exposes?: Record<string, string>
}

/**
 * Shared module configuration for Module Federation
 */
export interface SharedModule {
  /** Name of the shared module */
  name: string
  /** Required version (semver range) */
  requiredVersion?: string
  /** Singleton mode - only one version loaded */
  singleton?: boolean
  /** Eager loading - load immediately */
  eager?: boolean
  /** Provided version */
  version?: string
}

/**
 * Module Federation configuration
 */
export interface FederationConfig {
  /** Name of the host application */
  name: string
  /** Remote entries to load */
  remotes?: RemoteEntry[]
  /** Modules to share between apps */
  shared?: SharedModule[]
  /** Exposed modules from this host */
  exposes?: Record<string, () => Promise<unknown>>
}

/**
 * Event bus message structure
 */
export interface BusMessage<T = unknown> {
  /** Event type/topic */
  type: string
  /** Event payload */
  payload: T
  /** Source app name */
  source?: string
  /** Target app name (for direct messaging) */
  target?: string
  /** Timestamp of the event */
  timestamp: number
  /** Unique message ID */
  id: string
}

/**
 * Event bus subscriber function
 */
export type BusSubscriber<T = unknown> = (message: BusMessage<T>) => void

/**
 * Event bus subscription options
 */
export interface BusSubscriptionOptions {
  /** Only receive messages from specific source */
  fromSource?: string
  /** Only receive messages if this app is the target */
  onlyTargeted?: boolean
  /** Maximum number of messages to receive before auto-unsubscribe */
  maxMessages?: number
}

/**
 * Shared state configuration
 */
export interface SharedStateConfig {
  /** Unique key for the shared state */
  key: string
  /** Initial value */
  initialValue?: unknown
  /** Whether changes should be persisted */
  persist?: boolean
  /** Storage key for persistence */
  storageKey?: string
  /** Validation function for state updates */
  validate?: (value: unknown) => boolean
}

/**
 * Style isolation configuration
 */
export interface StyleIsolationConfig {
  /** Use Shadow DOM for style encapsulation */
  shadowDOM?: boolean
  /** CSS scope prefix for scoped styles */
  scopePrefix?: string
  /** Styles to inherit from parent document */
  inheritStyles?: boolean
  /** External stylesheets to include */
  externalStyles?: string[]
}

/**
 * Router integration configuration
 */
export interface MicroRouterConfig {
  /** Base path for this micro app's routes */
  basePath?: string
  /** Whether to handle navigation within the app */
  handleNavigation?: boolean
  /** Function to transform routes */
  routeTransform?: (route: string) => string
}

/**
 * Global orchestrator configuration
 */
export interface OrchestratorConfig {
  /** Default container selector */
  defaultContainer?: string
  /** Global error handler */
  onError?: (error: Error, appName?: string) => void
  /** Callback when any app state changes */
  onStateChange?: (appName: string, state: MicroAppState) => void
  /** Whether to log debug information */
  debug?: boolean
}

/**
 * Render function for Flexium components in micro frontend context
 */
export type MicroRender = (
  component: FNodeChild,
  container: HTMLElement
) => () => void
