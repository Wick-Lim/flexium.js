/**
 * Flexism Client - Hydration utilities
 *
 * @example
 * ```tsx
 * import { hydrate } from 'flexism/client'
 *
 * // Hydrate the server-rendered app
 * hydrate(<App />, document.getElementById('app')!)
 *
 * // Or with options
 * hydrate(<App />, '#app', {
 *   onHydrated: () => console.log('App is interactive!'),
 *   onError: (err) => console.error('Hydration failed:', err),
 * })
 * ```
 */

export { hydrate, hydrateFromState } from './hydrate'
export { isHydrating, isHydrated } from './state'
