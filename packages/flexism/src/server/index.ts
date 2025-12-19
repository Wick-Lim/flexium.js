/**
 * Flexism Server - SSR utilities
 *
 * @example
 * ```tsx
 * import { renderToString, renderToHtml, renderToStream } from 'flexism/server'
 *
 * // Basic SSR
 * const { html, state, stateScript } = renderToString(<App />)
 *
 * // Full HTML document
 * const fullHtml = renderToHtml(<App />, {
 *   title: 'My App',
 *   scripts: ['/client.js']
 * })
 *
 * // Streaming (Edge/Cloudflare Workers)
 * const { stream } = renderToStream(<App />)
 * return new Response(stream, { headers: { 'Content-Type': 'text/html' } })
 *
 * // Streaming (Node.js/Express)
 * const { pipe } = renderToPipeableStream(<App />)
 * pipe(res)
 * ```
 */

// String rendering
export { renderToString, renderToStaticMarkup } from './render'
export { renderToHtml } from './html'
export type { RenderToHtmlOptions } from './html'

// Streaming
export {
  renderToStream,
  renderToPipeableStream,
  renderToHtmlStream,
} from './stream'
export type { StreamOptions, StreamResult, PipeableStream } from './stream'

// SSE (Server-Sent Events)
export { sse, sseMiddleware } from './sse'
export type { SSEContext, SSEHandler, SSEResponse } from './sse'
