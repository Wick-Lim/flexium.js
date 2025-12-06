/**
 * Micro Frontend Router Integration
 *
 * Provides routing coordination between micro frontend applications
 */

import { signal, effect, batch } from '../core/signal'
import type { MicroRouterConfig } from './types'
import { emit, subscribe } from './event-bus'
import { getMicroApp, mountMicroApp, unmountMicroApp } from './lifecycle'

/** Route match result */
interface RouteMatch {
  matched: boolean
  params: Record<string, string>
  path: string
  basePath: string
}

/** Route definition for micro apps */
interface MicroRoute {
  path: string
  appName: string
  exact?: boolean
  children?: MicroRoute[]
}

/** Navigation event */
interface NavigationEvent {
  from: string
  to: string
  params: Record<string, string>
  type: 'push' | 'replace' | 'pop'
}

/** Global router state */
const routerState = signal<{
  pathname: string
  search: string
  hash: string
  params: Record<string, string>
}>({
  pathname: typeof window !== 'undefined' ? window.location.pathname : '/',
  search: typeof window !== 'undefined' ? window.location.search : '',
  hash: typeof window !== 'undefined' ? window.location.hash : '',
  params: {},
})

/** Registered micro routes */
const microRoutes: MicroRoute[] = []

/** Route configurations per app */
const appRouterConfigs = new Map<string, MicroRouterConfig>()

/** Navigation guards */
const beforeNavigateGuards: ((to: string, from: string) => boolean | Promise<boolean>)[] = []
const afterNavigateCallbacks: ((to: string, from: string) => void)[] = []

/** History listener cleanup */
let historyListenerCleanup: (() => void) | null = null

/**
 * Initialize the micro frontend router
 */
export function initMicroRouter(): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }

  // Listen for browser navigation
  const handlePopState = (): void => {
    updateRouterState('pop')
  }

  window.addEventListener('popstate', handlePopState)

  // Patch history methods
  const originalPushState = history.pushState.bind(history)
  const originalReplaceState = history.replaceState.bind(history)

  history.pushState = (state, title, url) => {
    const result = originalPushState(state, title, url)
    updateRouterState('push')
    return result
  }

  history.replaceState = (state, title, url) => {
    const result = originalReplaceState(state, title, url)
    updateRouterState('replace')
    return result
  }

  // Initial route handling
  updateRouterState('pop')

  // Cleanup function
  historyListenerCleanup = () => {
    window.removeEventListener('popstate', handlePopState)
    history.pushState = originalPushState
    history.replaceState = originalReplaceState
  }

  return historyListenerCleanup
}

/**
 * Update router state and notify apps
 */
async function updateRouterState(type: 'push' | 'replace' | 'pop'): Promise<void> {
  const from = routerState.value.pathname
  const to = window.location.pathname

  // Run before guards
  for (const guard of beforeNavigateGuards) {
    const canProceed = await guard(to, from)
    if (!canProceed) {
      // Restore previous URL if navigation is blocked
      if (type === 'push' || type === 'replace') {
        history.replaceState(null, '', from)
      }
      return
    }
  }

  // Update state
  batch(() => {
    routerState.value = {
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      params: {},
    }
  })

  // Emit navigation event
  const navEvent: NavigationEvent = {
    from,
    to,
    params: routerState.value.params,
    type,
  }
  emit('router:navigate', navEvent)

  // Handle micro app mounting/unmounting based on routes
  await handleRouteChange()

  // Run after callbacks
  for (const callback of afterNavigateCallbacks) {
    callback(to, from)
  }
}

/**
 * Handle route changes and mount/unmount apps accordingly
 */
async function handleRouteChange(): Promise<void> {
  const currentPath = routerState.value.pathname

  for (const route of microRoutes) {
    const match = matchRoute(currentPath, route.path, route.exact)
    const app = getMicroApp(route.appName)

    if (!app) continue

    if (match.matched) {
      // Update params in router state
      routerState.value = {
        ...routerState.value,
        params: { ...routerState.value.params, ...match.params },
      }

      // Mount if not already mounted
      if (app.state !== 'mounted') {
        try {
          await mountMicroApp(route.appName)
        } catch (error) {
          console.error(`Failed to mount app "${route.appName}" for route:`, error)
        }
      }
    } else {
      // Unmount if mounted
      if (app.state === 'mounted') {
        try {
          await unmountMicroApp(route.appName)
        } catch (error) {
          console.error(`Failed to unmount app "${route.appName}":`, error)
        }
      }
    }
  }
}

/**
 * Match a path against a route pattern
 */
export function matchRoute(
  pathname: string,
  pattern: string,
  exact = false
): RouteMatch {
  const params: Record<string, string> = {}

  // Normalize paths
  const normalizedPath = pathname.replace(/\/$/, '') || '/'
  const normalizedPattern = pattern.replace(/\/$/, '') || '/'

  // Convert pattern to regex
  const paramNames: string[] = []
  const regexPattern = normalizedPattern
    .replace(/:[^/]+/g, (match) => {
      paramNames.push(match.slice(1))
      return '([^/]+)'
    })
    .replace(/\*/g, '.*')

  const regex = exact
    ? new RegExp(`^${regexPattern}$`)
    : new RegExp(`^${regexPattern}`)

  const match = normalizedPath.match(regex)

  if (!match) {
    return { matched: false, params: {}, path: pathname, basePath: pattern }
  }

  // Extract params
  paramNames.forEach((name, index) => {
    params[name] = match[index + 1] || ''
  })

  return {
    matched: true,
    params,
    path: pathname,
    basePath: pattern,
  }
}

/**
 * Register a route for a micro app
 */
export function registerMicroRoute(route: MicroRoute): () => void {
  microRoutes.push(route)

  // Check if current route matches and mount if needed
  const currentPath = routerState.value.pathname
  const match = matchRoute(currentPath, route.path, route.exact)

  if (match.matched) {
    mountMicroApp(route.appName).catch((err) => {
      console.error(`Failed to mount "${route.appName}" on route registration:`, err)
    })
  }

  // Return unregister function
  return () => {
    const index = microRoutes.findIndex(
      (r) => r.path === route.path && r.appName === route.appName
    )
    if (index !== -1) {
      microRoutes.splice(index, 1)
    }
  }
}

/**
 * Configure router for a specific micro app
 */
export function configureMicroRouter(
  appName: string,
  config: MicroRouterConfig
): void {
  appRouterConfigs.set(appName, config)
}

/**
 * Navigate to a path
 */
export async function navigate(
  path: string,
  options: { replace?: boolean; state?: unknown } = {}
): Promise<boolean> {
  if (typeof window === 'undefined') return false

  const from = routerState.value.pathname

  // Run before guards
  for (const guard of beforeNavigateGuards) {
    const canProceed = await guard(path, from)
    if (!canProceed) {
      return false
    }
  }

  if (options.replace) {
    history.replaceState(options.state ?? null, '', path)
  } else {
    history.pushState(options.state ?? null, '', path)
  }

  return true
}

/**
 * Navigate back
 */
export function goBack(): void {
  if (typeof window !== 'undefined') {
    history.back()
  }
}

/**
 * Navigate forward
 */
export function goForward(): void {
  if (typeof window !== 'undefined') {
    history.forward()
  }
}

/**
 * Go to a specific history index
 */
export function go(delta: number): void {
  if (typeof window !== 'undefined') {
    history.go(delta)
  }
}

/**
 * Add a navigation guard
 */
export function beforeNavigate(
  guard: (to: string, from: string) => boolean | Promise<boolean>
): () => void {
  beforeNavigateGuards.push(guard)
  return () => {
    const index = beforeNavigateGuards.indexOf(guard)
    if (index !== -1) {
      beforeNavigateGuards.splice(index, 1)
    }
  }
}

/**
 * Add an after-navigation callback
 */
export function afterNavigate(
  callback: (to: string, from: string) => void
): () => void {
  afterNavigateCallbacks.push(callback)
  return () => {
    const index = afterNavigateCallbacks.indexOf(callback)
    if (index !== -1) {
      afterNavigateCallbacks.splice(index, 1)
    }
  }
}

/**
 * Get current router state
 */
export function getRouterState(): typeof routerState {
  return routerState
}

/**
 * Get current pathname
 */
export function getPathname(): string {
  return routerState.value.pathname
}

/**
 * Get current search params
 */
export function getSearchParams(): URLSearchParams {
  return new URLSearchParams(routerState.value.search)
}

/**
 * Get current hash
 */
export function getHash(): string {
  return routerState.value.hash
}

/**
 * Get route params
 */
export function getParams(): Record<string, string> {
  return routerState.value.params
}

/**
 * Create a scoped router for a micro app
 */
export function createScopedRouter(
  appName: string,
  basePath: string
): {
  navigate: (path: string, options?: { replace?: boolean }) => Promise<boolean>
  getRelativePath: () => string
  isActive: (path: string) => boolean
  onNavigate: (callback: (path: string) => void) => () => void
} {
  configureMicroRouter(appName, { basePath })

  return {
    navigate: async (path: string, options?: { replace?: boolean }) => {
      const fullPath = basePath + path
      return navigate(fullPath, options)
    },

    getRelativePath: () => {
      const current = routerState.value.pathname
      if (current.startsWith(basePath)) {
        return current.slice(basePath.length) || '/'
      }
      return '/'
    },

    isActive: (path: string) => {
      const current = routerState.value.pathname
      const fullPath = basePath + path
      return current === fullPath || current.startsWith(fullPath + '/')
    },

    onNavigate: (callback: (path: string) => void) => {
      return subscribe('router:navigate', (message) => {
        const event = message.payload as NavigationEvent
        if (event.to.startsWith(basePath)) {
          callback(event.to.slice(basePath.length) || '/')
        }
      })
    },
  }
}

/**
 * Create a link handler for micro frontend navigation
 */
export function createLinkHandler(): (event: MouseEvent) => void {
  return (event: MouseEvent) => {
    const target = event.target as HTMLElement
    const anchor = target.closest('a')

    if (!anchor) return

    const href = anchor.getAttribute('href')
    if (!href) return

    // Skip external links
    if (href.startsWith('http://') || href.startsWith('https://')) {
      return
    }

    // Skip hash-only links
    if (href.startsWith('#')) {
      return
    }

    // Skip download links
    if (anchor.hasAttribute('download')) {
      return
    }

    // Skip target="_blank" links
    if (anchor.getAttribute('target') === '_blank') {
      return
    }

    // Prevent default and navigate
    event.preventDefault()
    navigate(href)
  }
}

/**
 * Watch for route changes affecting a specific path
 */
export function watchRoute(
  pattern: string,
  callback: (match: RouteMatch) => void,
  exact = false
): () => void {
  return effect(() => {
    const pathname = routerState.value.pathname
    const match = matchRoute(pathname, pattern, exact)
    callback(match)
  })
}

/**
 * Preload an app for a route (for faster navigation)
 */
export async function preloadRoute(path: string): Promise<void> {
  for (const route of microRoutes) {
    const match = matchRoute(path, route.path, route.exact)
    if (match.matched) {
      const app = getMicroApp(route.appName)
      if (app && app.state === 'unloaded') {
        // Import dynamically to preload
        const { loadMicroApp } = await import('./lifecycle')
        await loadMicroApp(route.appName)
      }
    }
  }
}
