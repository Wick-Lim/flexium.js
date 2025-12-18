/**
 * Flexism - Isomorphic SSR framework for Flexium
 *
 * Provides SSR with automatic state hydration. Use the same `use()` hook
 * on both server and client - state is automatically serialized and restored.
 *
 * @example
 * ```tsx
 * // shared/App.tsx - Works on both server and client
 * import { use } from 'flexism'
 *
 * function Counter() {
 *   const [count, setCount] = use(0)
 *   return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
 * }
 *
 * // server.ts
 * import { renderToHtml } from 'flexism/server'
 *
 * app.get('/', (req, res) => {
 *   const html = renderToHtml(<App />, {
 *     title: 'My App',
 *     scripts: ['/client.js']
 *   })
 *   res.send(html)
 * })
 *
 * // client.ts
 * import { hydrate } from 'flexism/client'
 *
 * hydrate(<App />, '#app')
 * ```
 *
 * @packageDocumentation
 */

// SSR-aware use hook
export { use, Context } from './use'
export type { Setter, ResourceControl, UseContext, UseOptions } from './use'

// Runtime utilities
export {
  getIsServer,
  getIsHydrating,
} from './runtime'

// Types
export type {
  FlexismState,
  RenderOptions,
  RenderResult,
  HydrateOptions,
  FlexismApp,
} from './types'

export { FLEXISM_STATE_KEY } from './types'
