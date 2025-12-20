/**
 * Memory Monitoring Utilities
 *
 * Track and manage memory usage in development server
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface MemorySnapshot {
  timestamp: number
  heapUsed: number
  heapTotal: number
  external: number
  rss: number
  arrayBuffers: number
}

export interface MemoryStats {
  current: MemorySnapshot
  peak: MemorySnapshot
  history: MemorySnapshot[]
  uptime: number
}

export interface MemoryThresholds {
  /** Warning threshold in bytes */
  warning: number
  /** Critical threshold in bytes */
  critical: number
}

export type MemoryEventType = 'warning' | 'critical' | 'recovered'

export interface MemoryMonitorOptions {
  /** Interval for memory checks in ms (default: 30000) */
  interval?: number
  /** Keep history of last N snapshots (default: 60) */
  historySize?: number
  /** Memory thresholds */
  thresholds?: Partial<MemoryThresholds>
  /** Event handler */
  onEvent?: (type: MemoryEventType, stats: MemoryStats) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Memory Monitor
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Memory usage monitor for long-running processes
 *
 * @example
 * ```ts
 * const monitor = new MemoryMonitor({
 *   interval: 30000, // Check every 30s
 *   thresholds: {
 *     warning: 500 * 1024 * 1024,  // 500MB
 *     critical: 1024 * 1024 * 1024, // 1GB
 *   },
 *   onEvent: (type, stats) => {
 *     console.log(`Memory ${type}: ${formatBytes(stats.current.heapUsed)}`)
 *   }
 * })
 *
 * monitor.start()
 * ```
 */
export class MemoryMonitor {
  private options: Required<MemoryMonitorOptions>
  private history: MemorySnapshot[] = []
  private peak: MemorySnapshot | null = null
  private startTime: number = 0
  private timer: NodeJS.Timeout | null = null
  private lastEventType: MemoryEventType | null = null

  constructor(options: MemoryMonitorOptions = {}) {
    this.options = {
      interval: options.interval ?? 30000,
      historySize: options.historySize ?? 60,
      thresholds: {
        warning: options.thresholds?.warning ?? 500 * 1024 * 1024, // 500MB
        critical: options.thresholds?.critical ?? 1024 * 1024 * 1024, // 1GB
      },
      onEvent: options.onEvent ?? (() => {}),
    }
  }

  /**
   * Start monitoring
   */
  start(): void {
    if (this.timer) return

    this.startTime = Date.now()
    this.history = []
    this.peak = null
    this.lastEventType = null

    // Initial snapshot
    this.takeSnapshot()

    // Start interval
    this.timer = setInterval(() => this.takeSnapshot(), this.options.interval)

    // Don't prevent process exit
    this.timer.unref()
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  /**
   * Get current stats
   */
  getStats(): MemoryStats {
    const current = this.createSnapshot()

    return {
      current,
      peak: this.peak ?? current,
      history: [...this.history],
      uptime: Date.now() - this.startTime,
    }
  }

  /**
   * Force garbage collection (if available)
   */
  forceGC(): boolean {
    if (typeof global.gc === 'function') {
      global.gc()
      return true
    }
    return false
  }

  /**
   * Take a memory snapshot
   */
  private takeSnapshot(): MemorySnapshot {
    const snapshot = this.createSnapshot()

    // Update history
    this.history.push(snapshot)
    if (this.history.length > this.options.historySize) {
      this.history.shift()
    }

    // Update peak
    if (!this.peak || snapshot.heapUsed > this.peak.heapUsed) {
      this.peak = snapshot
    }

    // Check thresholds
    this.checkThresholds(snapshot)

    return snapshot
  }

  /**
   * Create a memory snapshot
   */
  private createSnapshot(): MemorySnapshot {
    const memory = process.memoryUsage()
    return {
      timestamp: Date.now(),
      heapUsed: memory.heapUsed,
      heapTotal: memory.heapTotal,
      external: memory.external,
      rss: memory.rss,
      arrayBuffers: memory.arrayBuffers,
    }
  }

  /**
   * Check memory thresholds and emit events
   */
  private checkThresholds(snapshot: MemorySnapshot): void {
    const { warning, critical } = this.options.thresholds

    let eventType: MemoryEventType | null = null

    if (snapshot.heapUsed >= critical) {
      eventType = 'critical'
    } else if (snapshot.heapUsed >= warning) {
      eventType = 'warning'
    } else if (this.lastEventType === 'warning' || this.lastEventType === 'critical') {
      eventType = 'recovered'
    }

    if (eventType && eventType !== this.lastEventType) {
      this.lastEventType = eventType
      this.options.onEvent(eventType, this.getStats())
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get current memory usage
 */
export function getMemoryUsage(): MemorySnapshot {
  const memory = process.memoryUsage()
  return {
    timestamp: Date.now(),
    heapUsed: memory.heapUsed,
    heapTotal: memory.heapTotal,
    external: memory.external,
    rss: memory.rss,
    arrayBuffers: memory.arrayBuffers,
  }
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`
}

/**
 * Parse memory string to bytes
 */
export function parseBytes(str: string): number {
  const match = str.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB|TB)?$/i)
  if (!match) return 0

  const value = parseFloat(match[1])
  const unit = (match[2] || 'B').toUpperCase()

  const units: Record<string, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
  }

  return Math.round(value * (units[unit] || 1))
}

/**
 * Calculate memory pressure (0-100)
 */
export function getMemoryPressure(): number {
  const { heapUsed, heapTotal } = process.memoryUsage()
  return Math.round((heapUsed / heapTotal) * 100)
}

/**
 * Check if memory is under pressure
 */
export function isMemoryConstrained(threshold: number = 80): boolean {
  return getMemoryPressure() >= threshold
}

// ─────────────────────────────────────────────────────────────────────────────
// Development Logging
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Log memory usage (for development)
 */
export function logMemoryUsage(label: string = 'Memory'): void {
  const { heapUsed, heapTotal, rss } = process.memoryUsage()
  console.log(
    `[${label}] Heap: ${formatBytes(heapUsed)}/${formatBytes(heapTotal)} | RSS: ${formatBytes(rss)} | Pressure: ${getMemoryPressure()}%`
  )
}

/**
 * Create a memory logger that logs at intervals
 */
export function createMemoryLogger(
  interval: number = 60000,
  label: string = 'Memory'
): { start: () => void; stop: () => void } {
  let timer: NodeJS.Timeout | null = null

  return {
    start() {
      if (timer) return
      logMemoryUsage(label)
      timer = setInterval(() => logMemoryUsage(label), interval)
      timer.unref()
    },
    stop() {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    },
  }
}
