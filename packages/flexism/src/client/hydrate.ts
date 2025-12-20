import { render } from 'flexium/dom'
import type { FNodeChild, FlexismState, HydrateOptions } from '../types'
import {
  loadStateFromWindow,
  startHydration,
  endHydration,
  resetSignalCounter,
} from '../runtime'
import { setHydrated } from './state'

declare global {
  interface Window {
    __FLEXISM_STREAMS__?: Record<string, unknown>
  }
}

/**
 * Load stream refs from window (set by SSR)
 */
export function loadStreamsFromWindow(): Record<string, unknown> | null {
  if (typeof window === 'undefined') return null
  return window.__FLEXISM_STREAMS__ ?? null
}

/**
 * Hydrate server-rendered HTML with client-side interactivity
 *
 * @example
 * ```tsx
 * // Basic usage
 * hydrate(<App />, document.getElementById('app')!)
 *
 * // With selector
 * hydrate(<App />, '#app')
 *
 * // With callbacks
 * hydrate(<App />, '#app', {
 *   onHydrated: () => console.log('Ready!'),
 *   onError: (err) => console.error(err),
 * })
 * ```
 */
export function hydrate(
  app: FNodeChild | (() => FNodeChild),
  target: HTMLElement | string,
  options: HydrateOptions = {}
): void {
  const { onHydrated, onError } = options

  try {
    // Load state from window
    const state = loadStateFromWindow()

    if (state) {
      hydrateFromState(app, target, state, options)
    } else {
      // No SSR state - just render normally
      console.warn('[Flexism] No SSR state found, rendering fresh')
      const container = resolveTarget(target)
      render(app, container)
      setHydrated(true)
      onHydrated?.()
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error('[Flexism] Hydration error:', err)
    onError?.(err)

    // Fallback: try full render
    try {
      const container = resolveTarget(target)
      container.innerHTML = ''
      render(app, container)
      setHydrated(true)
    } catch (fallbackError) {
      console.error('[Flexism] Fallback render failed:', fallbackError)
    }
  }
}

/**
 * Hydrate with explicit state (useful for testing or custom state loading)
 */
export function hydrateFromState(
  app: FNodeChild | (() => FNodeChild),
  target: HTMLElement | string,
  state: FlexismState,
  options: HydrateOptions = {}
): void {
  const { onHydrated, onError, deserializer } = options

  try {
    const container = resolveTarget(target)

    // Start hydration mode
    resetSignalCounter()
    startHydration(state)

    // Render the app - signals will pick up hydrated values
    render(app, container)

    // End hydration
    endHydration()
    setHydrated(true)

    onHydrated?.()
  } catch (error) {
    endHydration()
    const err = error instanceof Error ? error : new Error(String(error))
    onError?.(err)
    throw err
  }
}

function resolveTarget(target: HTMLElement | string): HTMLElement {
  if (typeof target === 'string') {
    const el = document.querySelector(target)
    if (!el) {
      throw new Error(`[Flexism] Target element not found: ${target}`)
    }
    return el as HTMLElement
  }
  return target
}
