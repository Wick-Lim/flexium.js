import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  MemoryMonitor,
  getMemoryUsage,
  formatBytes,
  parseBytes,
  getMemoryPressure,
  isMemoryConstrained,
  createMemoryLogger,
} from '../utils/memory'

describe('Memory Utilities', () => {
  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 B')
      expect(formatBytes(500)).toBe('500.00 B')
      expect(formatBytes(1024)).toBe('1.00 KB')
      expect(formatBytes(1024 * 1024)).toBe('1.00 MB')
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1.00 GB')
      expect(formatBytes(1024 * 1024 * 1024 * 1024)).toBe('1.00 TB')
    })

    it('should handle decimal values', () => {
      expect(formatBytes(1536)).toBe('1.50 KB')
      expect(formatBytes(1024 * 1024 * 1.5)).toBe('1.50 MB')
    })
  })

  describe('parseBytes', () => {
    it('should parse byte strings', () => {
      expect(parseBytes('0')).toBe(0)
      expect(parseBytes('100')).toBe(100)
      expect(parseBytes('100 B')).toBe(100)
      expect(parseBytes('1 KB')).toBe(1024)
      expect(parseBytes('1 MB')).toBe(1024 * 1024)
      expect(parseBytes('1 GB')).toBe(1024 * 1024 * 1024)
      expect(parseBytes('1 TB')).toBe(1024 * 1024 * 1024 * 1024)
    })

    it('should handle decimal values', () => {
      expect(parseBytes('1.5 KB')).toBe(1536)
      expect(parseBytes('2.5 MB')).toBe(Math.round(2.5 * 1024 * 1024))
    })

    it('should be case insensitive', () => {
      expect(parseBytes('1 kb')).toBe(1024)
      expect(parseBytes('1 Kb')).toBe(1024)
      expect(parseBytes('1 KB')).toBe(1024)
    })

    it('should return 0 for invalid input', () => {
      expect(parseBytes('')).toBe(0)
      expect(parseBytes('invalid')).toBe(0)
      expect(parseBytes('abc KB')).toBe(0)
    })
  })

  describe('getMemoryUsage', () => {
    it('should return memory snapshot', () => {
      const snapshot = getMemoryUsage()

      expect(snapshot).toHaveProperty('timestamp')
      expect(snapshot).toHaveProperty('heapUsed')
      expect(snapshot).toHaveProperty('heapTotal')
      expect(snapshot).toHaveProperty('external')
      expect(snapshot).toHaveProperty('rss')
      expect(snapshot).toHaveProperty('arrayBuffers')

      expect(typeof snapshot.timestamp).toBe('number')
      expect(typeof snapshot.heapUsed).toBe('number')
      expect(snapshot.heapUsed).toBeGreaterThan(0)
    })
  })

  describe('getMemoryPressure', () => {
    it('should return a percentage between 0 and 100', () => {
      const pressure = getMemoryPressure()

      expect(pressure).toBeGreaterThanOrEqual(0)
      expect(pressure).toBeLessThanOrEqual(100)
    })
  })

  describe('isMemoryConstrained', () => {
    it('should return boolean', () => {
      const result = isMemoryConstrained()
      expect(typeof result).toBe('boolean')
    })

    it('should accept custom threshold', () => {
      // Very high threshold should return false
      const notConstrained = isMemoryConstrained(100)
      expect(notConstrained).toBe(false)

      // Very low threshold should return true
      const constrained = isMemoryConstrained(0)
      expect(constrained).toBe(true)
    })
  })
})

describe('MemoryMonitor', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should start and stop monitoring', () => {
    const monitor = new MemoryMonitor({ interval: 1000 })

    monitor.start()
    expect(monitor.getStats().history.length).toBeGreaterThan(0)

    monitor.stop()
  })

  it('should collect history over time', () => {
    const monitor = new MemoryMonitor({ interval: 1000, historySize: 10 })

    monitor.start()

    vi.advanceTimersByTime(3000)

    const stats = monitor.getStats()
    expect(stats.history.length).toBeGreaterThanOrEqual(3)

    monitor.stop()
  })

  it('should limit history size', () => {
    const monitor = new MemoryMonitor({ interval: 100, historySize: 5 })

    monitor.start()

    vi.advanceTimersByTime(1000) // 10 intervals

    const stats = monitor.getStats()
    expect(stats.history.length).toBeLessThanOrEqual(5)

    monitor.stop()
  })

  it('should track peak memory', () => {
    const monitor = new MemoryMonitor({ interval: 1000 })

    monitor.start()

    vi.advanceTimersByTime(3000)

    const stats = monitor.getStats()
    expect(stats.peak).toBeDefined()
    expect(stats.peak.heapUsed).toBeGreaterThan(0)

    monitor.stop()
  })

  it('should emit events on threshold crossing', () => {
    const onEvent = vi.fn()
    const monitor = new MemoryMonitor({
      interval: 1000,
      thresholds: {
        warning: 1, // 1 byte - always exceeded
        critical: Number.MAX_SAFE_INTEGER,
      },
      onEvent,
    })

    monitor.start()

    expect(onEvent).toHaveBeenCalledWith('warning', expect.any(Object))

    monitor.stop()
  })

  it('should report uptime', () => {
    const monitor = new MemoryMonitor({ interval: 1000 })

    monitor.start()

    vi.advanceTimersByTime(5000)

    const stats = monitor.getStats()
    expect(stats.uptime).toBeGreaterThanOrEqual(5000)

    monitor.stop()
  })
})

describe('Memory Logger', () => {
  it('should create memory logger', () => {
    const logger = createMemoryLogger(1000, 'Test')

    expect(logger).toHaveProperty('start')
    expect(logger).toHaveProperty('stop')
    expect(typeof logger.start).toBe('function')
    expect(typeof logger.stop).toBe('function')
  })

  it('should log memory usage', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const logger = createMemoryLogger(1000, 'Test')
    logger.start()

    expect(consoleSpy).toHaveBeenCalled()

    logger.stop()
    consoleSpy.mockRestore()
  })
})
