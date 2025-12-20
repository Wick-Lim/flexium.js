/**
 * LRU Cache Implementation
 *
 * Memory-efficient cache with size limits and TTL support
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface LRUCacheOptions<K, V> {
  /** Maximum number of items in cache */
  maxSize?: number
  /** Maximum memory in bytes (approximate) */
  maxMemory?: number
  /** TTL in milliseconds (0 = no expiry) */
  ttl?: number
  /** Custom size calculator for values */
  sizeOf?: (value: V, key: K) => number
  /** Called when item is evicted */
  onEvict?: (key: K, value: V, reason: 'size' | 'ttl' | 'manual') => void
}

interface CacheEntry<V> {
  value: V
  size: number
  createdAt: number
  accessedAt: number
}

// ─────────────────────────────────────────────────────────────────────────────
// LRU Cache
// ─────────────────────────────────────────────────────────────────────────────

/**
 * LRU (Least Recently Used) Cache with TTL and memory limits
 *
 * @example
 * ```ts
 * const cache = new LRUCache<string, Buffer>({
 *   maxSize: 100,
 *   maxMemory: 50 * 1024 * 1024, // 50MB
 *   ttl: 60000, // 1 minute
 *   sizeOf: (value) => value.length,
 * })
 *
 * cache.set('key', buffer)
 * const value = cache.get('key')
 * ```
 */
export class LRUCache<K, V> {
  private cache: Map<K, CacheEntry<V>>
  private options: Required<LRUCacheOptions<K, V>>
  private currentMemory: number = 0

  constructor(options: LRUCacheOptions<K, V> = {}) {
    this.cache = new Map()
    this.options = {
      maxSize: options.maxSize ?? 1000,
      maxMemory: options.maxMemory ?? 0, // 0 = unlimited
      ttl: options.ttl ?? 0, // 0 = no expiry
      sizeOf: options.sizeOf ?? (() => 1),
      onEvict: options.onEvict ?? (() => {}),
    }
  }

  /**
   * Get value from cache
   */
  get(key: K): V | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined

    // Check TTL
    if (this.options.ttl > 0) {
      const age = Date.now() - entry.createdAt
      if (age > this.options.ttl) {
        this.delete(key, 'ttl')
        return undefined
      }
    }

    // Update access time (LRU)
    entry.accessedAt = Date.now()

    // Move to end (most recently used)
    this.cache.delete(key)
    this.cache.set(key, entry)

    return entry.value
  }

  /**
   * Set value in cache
   */
  set(key: K, value: V): this {
    const size = this.options.sizeOf(value, key)

    // Delete existing entry if present
    const existing = this.cache.get(key)
    if (existing) {
      this.currentMemory -= existing.size
      this.cache.delete(key)
    }

    // Evict entries if needed
    this.evictIfNeeded(size)

    // Add new entry
    const entry: CacheEntry<V> = {
      value,
      size,
      createdAt: Date.now(),
      accessedAt: Date.now(),
    }

    this.cache.set(key, entry)
    this.currentMemory += size

    return this
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: K): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    // Check TTL
    if (this.options.ttl > 0) {
      const age = Date.now() - entry.createdAt
      if (age > this.options.ttl) {
        this.delete(key, 'ttl')
        return false
      }
    }

    return true
  }

  /**
   * Delete a key from cache
   */
  delete(key: K, reason: 'size' | 'ttl' | 'manual' = 'manual'): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    this.cache.delete(key)
    this.currentMemory -= entry.size
    this.options.onEvict(key, entry.value, reason)

    return true
  }

  /**
   * Clear all entries
   */
  clear(): void {
    for (const [key, entry] of this.cache) {
      this.options.onEvict(key, entry.value, 'manual')
    }
    this.cache.clear()
    this.currentMemory = 0
  }

  /**
   * Get current cache size
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * Get current memory usage (approximate)
   */
  get memory(): number {
    return this.currentMemory
  }

  /**
   * Get all keys
   */
  keys(): IterableIterator<K> {
    return this.cache.keys()
  }

  /**
   * Get all values
   */
  *values(): IterableIterator<V> {
    for (const entry of this.cache.values()) {
      yield entry.value
    }
  }

  /**
   * Get cache stats
   */
  stats(): CacheStats {
    let expiredCount = 0
    const now = Date.now()

    if (this.options.ttl > 0) {
      for (const entry of this.cache.values()) {
        if (now - entry.createdAt > this.options.ttl) {
          expiredCount++
        }
      }
    }

    return {
      size: this.cache.size,
      memory: this.currentMemory,
      maxSize: this.options.maxSize,
      maxMemory: this.options.maxMemory,
      ttl: this.options.ttl,
      expiredCount,
    }
  }

  /**
   * Prune expired entries
   */
  prune(): number {
    if (this.options.ttl === 0) return 0

    let pruned = 0
    const now = Date.now()

    for (const [key, entry] of this.cache) {
      if (now - entry.createdAt > this.options.ttl) {
        this.delete(key, 'ttl')
        pruned++
      }
    }

    return pruned
  }

  /**
   * Evict entries to make room for new entry
   */
  private evictIfNeeded(newEntrySize: number): void {
    // Check size limit
    while (this.cache.size >= this.options.maxSize) {
      this.evictLRU()
    }

    // Check memory limit
    if (this.options.maxMemory > 0) {
      while (this.currentMemory + newEntrySize > this.options.maxMemory && this.cache.size > 0) {
        this.evictLRU()
      }
    }
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    // First key is the oldest (LRU)
    const firstKey = this.cache.keys().next().value
    if (firstKey !== undefined) {
      this.delete(firstKey, 'size')
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CacheStats {
  size: number
  memory: number
  maxSize: number
  maxMemory: number
  ttl: number
  expiredCount: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a module cache with sensible defaults
 */
export function createModuleCache<T>(options: Partial<LRUCacheOptions<string, T>> = {}): LRUCache<string, T> {
  return new LRUCache<string, T>({
    maxSize: 500,
    ttl: 0, // No expiry for modules
    ...options,
  })
}

/**
 * Create a file cache with memory limits
 */
export function createFileCache(maxMemoryMB: number = 100): LRUCache<string, Buffer> {
  return new LRUCache<string, Buffer>({
    maxSize: 10000,
    maxMemory: maxMemoryMB * 1024 * 1024,
    sizeOf: (buffer) => buffer.length,
  })
}

/**
 * Create a hash cache for incremental builds
 */
export function createHashCache(): LRUCache<string, string> {
  return new LRUCache<string, string>({
    maxSize: 10000,
    ttl: 0,
  })
}
