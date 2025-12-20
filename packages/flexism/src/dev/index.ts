/**
 * Flexism Development Tools
 *
 * Dev server with HMR support
 */

export { createDevServer, startDevServer } from './server'
export type { DevServerOptions } from './server'

// HMR
export { HMRManager, getHMRClientScript, injectHMRScript } from './hmr'
export type { HMRUpdate, HMRUpdateType, HMRClient, HMRManagerOptions } from './hmr'
