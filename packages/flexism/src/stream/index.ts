// Stream - Unified streaming data source
export { Stream, SendableStream } from './Stream'

export type {
  StreamCallback,
  StreamOptions,
  SerializedStream,
} from './Stream'

// Runtime stream registry (for dynamic streams without compiler)
export {
  registerRuntimeStream,
  getRuntimeStream,
  hasRuntimeStream,
  clearRuntimeStreams,
} from './Stream'
export type { RuntimeStreamHandler } from './Stream'

// SSE Client
export { SSEClient } from './SSEClient'
export type { SSEClientOptions } from './SSEClient'
