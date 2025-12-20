import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { LRUCache, createModuleCache, createFileCache, createHashCache } from '../utils/lru-cache'

describe('LRU Cache', () => {
  describe('Basic Operations', () => {
    it('should set and get values', () => {
      const cache = new LRUCache<string, number>()
      cache.set('a', 1)
      cache.set('b', 2)

      expect(cache.get('a')).toBe(1)
      expect(cache.get('b')).toBe(2)
      expect(cache.get('c')).toBeUndefined()
    })

    it('should check if key exists', () => {
      const cache = new LRUCache<string, number>()
      cache.set('a', 1)

      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
    })

    it('should delete keys', () => {
      const cache = new LRUCache<string, number>()
      cache.set('a', 1)
      cache.set('b', 2)

      expect(cache.delete('a')).toBe(true)
      expect(cache.has('a')).toBe(false)
      expect(cache.delete('a')).toBe(false)
    })

    it('should clear all entries', () => {
      const cache = new LRUCache<string, number>()
      cache.set('a', 1)
      cache.set('b', 2)
      cache.clear()

      expect(cache.size).toBe(0)
      expect(cache.has('a')).toBe(false)
    })

    it('should track size correctly', () => {
      const cache = new LRUCache<string, number>()
      expect(cache.size).toBe(0)

      cache.set('a', 1)
      expect(cache.size).toBe(1)

      cache.set('b', 2)
      expect(cache.size).toBe(2)

      cache.delete('a')
      expect(cache.size).toBe(1)
    })

    it('should update existing key', () => {
      const cache = new LRUCache<string, number>()
      cache.set('a', 1)
      cache.set('a', 2)

      expect(cache.get('a')).toBe(2)
      expect(cache.size).toBe(1)
    })
  })

  describe('LRU Eviction', () => {
    it('should evict least recently used item when maxSize reached', () => {
      const cache = new LRUCache<string, number>({ maxSize: 3 })

      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4) // Should evict 'a'

      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })

    it('should update LRU order on access', () => {
      const cache = new LRUCache<string, number>({ maxSize: 3 })

      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      // Access 'a' to make it most recently used
      cache.get('a')

      cache.set('d', 4) // Should evict 'b' (now least recently used)

      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })
  })

  describe('Memory Limits', () => {
    it('should evict items when memory limit exceeded', () => {
      const cache = new LRUCache<string, Buffer>({
        maxSize: 100,
        maxMemory: 100,
        sizeOf: (buffer) => buffer.length,
      })

      cache.set('a', Buffer.alloc(40))
      cache.set('b', Buffer.alloc(40))
      cache.set('c', Buffer.alloc(40)) // Should evict 'a'

      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(true)
    })

    it('should track memory usage', () => {
      const cache = new LRUCache<string, Buffer>({
        maxSize: 100,
        sizeOf: (buffer) => buffer.length,
      })

      cache.set('a', Buffer.alloc(50))
      expect(cache.memory).toBe(50)

      cache.set('b', Buffer.alloc(30))
      expect(cache.memory).toBe(80)

      cache.delete('a')
      expect(cache.memory).toBe(30)
    })
  })

  describe('TTL (Time To Live)', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    it('should expire items after TTL', () => {
      const cache = new LRUCache<string, number>({ ttl: 1000 })

      cache.set('a', 1)
      expect(cache.get('a')).toBe(1)

      vi.advanceTimersByTime(1500)

      expect(cache.get('a')).toBeUndefined()
    })

    it('should report expired items in has()', () => {
      const cache = new LRUCache<string, number>({ ttl: 1000 })

      cache.set('a', 1)
      expect(cache.has('a')).toBe(true)

      vi.advanceTimersByTime(1500)

      expect(cache.has('a')).toBe(false)
    })

    it('should prune expired items', () => {
      const cache = new LRUCache<string, number>({ ttl: 1000 })

      cache.set('a', 1)
      cache.set('b', 2)

      vi.advanceTimersByTime(500)
      cache.set('c', 3)

      vi.advanceTimersByTime(700) // 'a' and 'b' expired, 'c' still valid

      const pruned = cache.prune()

      expect(pruned).toBe(2)
      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(true)
    })

    afterEach(() => {
      vi.useRealTimers()
    })
  })

  describe('Eviction Callbacks', () => {
    it('should call onEvict when item is evicted', () => {
      const onEvict = vi.fn()
      const cache = new LRUCache<string, number>({
        maxSize: 2,
        onEvict,
      })

      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3) // Evicts 'a'

      expect(onEvict).toHaveBeenCalledWith('a', 1, 'size')
    })

    it('should call onEvict when item is deleted manually', () => {
      const onEvict = vi.fn()
      const cache = new LRUCache<string, number>({ onEvict })

      cache.set('a', 1)
      cache.delete('a')

      expect(onEvict).toHaveBeenCalledWith('a', 1, 'manual')
    })

    it('should call onEvict when item expires', () => {
      vi.useFakeTimers()

      const onEvict = vi.fn()
      const cache = new LRUCache<string, number>({
        ttl: 1000,
        onEvict,
      })

      cache.set('a', 1)
      vi.advanceTimersByTime(1500)

      // Trigger expiry check
      cache.get('a')

      expect(onEvict).toHaveBeenCalledWith('a', 1, 'ttl')

      vi.useRealTimers()
    })
  })

  describe('Iterators', () => {
    it('should iterate over keys', () => {
      const cache = new LRUCache<string, number>()
      cache.set('a', 1)
      cache.set('b', 2)

      const keys = Array.from(cache.keys())
      expect(keys).toEqual(['a', 'b'])
    })

    it('should iterate over values', () => {
      const cache = new LRUCache<string, number>()
      cache.set('a', 1)
      cache.set('b', 2)

      const values = Array.from(cache.values())
      expect(values).toEqual([1, 2])
    })
  })

  describe('Stats', () => {
    it('should return correct stats', () => {
      const cache = new LRUCache<string, number>({
        maxSize: 100,
        maxMemory: 1000,
        ttl: 5000,
      })

      cache.set('a', 1)
      cache.set('b', 2)

      const stats = cache.stats()

      expect(stats.size).toBe(2)
      expect(stats.maxSize).toBe(100)
      expect(stats.maxMemory).toBe(1000)
      expect(stats.ttl).toBe(5000)
      expect(stats.expiredCount).toBe(0)
    })
  })

  describe('Factory Functions', () => {
    it('should create module cache with defaults', () => {
      const cache = createModuleCache()
      expect(cache).toBeInstanceOf(LRUCache)

      const stats = cache.stats()
      expect(stats.maxSize).toBe(500)
    })

    it('should create file cache with memory limit', () => {
      const cache = createFileCache(50) // 50MB
      expect(cache).toBeInstanceOf(LRUCache)

      const stats = cache.stats()
      expect(stats.maxMemory).toBe(50 * 1024 * 1024)
    })

    it('should create hash cache', () => {
      const cache = createHashCache()
      expect(cache).toBeInstanceOf(LRUCache)

      cache.set('file.ts', 'abc123')
      expect(cache.get('file.ts')).toBe('abc123')
    })
  })
})
