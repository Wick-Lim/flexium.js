import { renderToString as flexiumRenderToString } from 'flexium/server'
import type { FNodeChild, RenderOptions, RenderResult, FlexismState } from '../types'
import {
  setIsServer,
  resetSignalCounter,
  getCollectedSignals,
  createStateScript,
  serializeValue,
} from '../runtime'

const FLEXISM_VERSION = '0.1.0'

/**
 * Render component tree to HTML string with state serialization
 *
 * @example
 * ```tsx
 * const { html, state, stateScript } = renderToString(<App />)
 *
 * // html: '<div data-fid="fid-0">Hello</div>'
 * // state: { signals: { s0: 'initial' }, version: '0.1.0' }
 * // stateScript: '<script>window.__FLEXISM_STATE__={...}</script>'
 * ```
 */
export function renderToString(
  app: FNodeChild | (() => FNodeChild),
  options: RenderOptions = {}
): RenderResult {
  const { hydrate = true, serializer } = options

  // Enter server mode
  setIsServer(true)
  resetSignalCounter()

  try {
    // Use flexium's renderToString
    const { html } = flexiumRenderToString(app, { hydrate })

    // Collect all signals
    const signals = getCollectedSignals()

    // Serialize values
    const serializedSignals: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(signals)) {
      serializedSignals[key] = serializeValue(value, serializer)
    }

    const state: FlexismState = {
      signals: serializedSignals,
      version: FLEXISM_VERSION,
    }

    return {
      html,
      state,
      stateScript: createStateScript(state),
    }
  } finally {
    setIsServer(false)
  }
}

/**
 * Render to static HTML without hydration markers
 * Use for emails, static pages, RSS feeds, etc.
 */
export function renderToStaticMarkup(
  app: FNodeChild | (() => FNodeChild)
): string {
  const { html } = renderToString(app, { hydrate: false })
  return html
}
