/**
 * Flexism Utilities
 *
 * Internal utilities for caching, memory management, etc.
 */

// LRU Cache
export { LRUCache, createModuleCache, createFileCache, createHashCache } from './lru-cache'
export type { LRUCacheOptions, CacheStats } from './lru-cache'

// Memory Management
export {
  MemoryMonitor,
  getMemoryUsage,
  formatBytes,
  parseBytes,
  getMemoryPressure,
  isMemoryConstrained,
  logMemoryUsage,
  createMemoryLogger,
} from './memory'
export type {
  MemorySnapshot,
  MemoryStats,
  MemoryThresholds,
  MemoryEventType,
  MemoryMonitorOptions,
} from './memory'
