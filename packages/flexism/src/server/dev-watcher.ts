/**
 * Dev Mode File Watcher
 *
 * Tracks file changes and only invalidates caches when files actually change
 */

import { watch, type FSWatcher } from 'fs'
import { join, relative } from 'path'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DevWatcherOptions {
  /** Directory to watch (usually serverDir) */
  watchDir: string
  /** Callback when files change */
  onInvalidate: (changedFiles: Set<string>) => void
  /** Debounce time in ms (default: 100) */
  debounceMs?: number
}

export interface DevWatcher {
  /** Check if any files have changed since last check */
  hasChanges: () => boolean
  /** Get changed files and reset the change set */
  consumeChanges: () => Set<string>
  /** Stop watching */
  close: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Simple Change Tracker (No external dependencies)
// ─────────────────────────────────────────────────────────────────────────────

let changedFiles = new Set<string>()
let hasAnyChanges = false
let watcher: FSWatcher | null = null
let debounceTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Create a dev watcher for file changes
 *
 * Uses Node.js built-in fs.watch for zero dependencies
 */
export function createDevWatcher(options: DevWatcherOptions): DevWatcher {
  const { watchDir, onInvalidate, debounceMs = 100 } = options

  // Reset state
  changedFiles = new Set()
  hasAnyChanges = false

  try {
    // Watch the directory recursively
    watcher = watch(watchDir, { recursive: true }, (eventType, filename) => {
      if (!filename) return

      // Ignore non-JS/TS files
      if (!filename.match(/\.(js|ts|tsx|jsx|json)$/)) return

      const fullPath = join(watchDir, filename)
      changedFiles.add(fullPath)
      hasAnyChanges = true

      // Debounce the invalidation callback
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
      debounceTimer = setTimeout(() => {
        onInvalidate(new Set(changedFiles))
      }, debounceMs)
    })

    watcher.on('error', (error) => {
      console.error('[flexism] Dev watcher error:', error)
    })
  } catch (error) {
    // Fall back to always-invalidate if watch fails
    console.warn('[flexism] Could not start file watcher, falling back to always-invalidate mode')
    hasAnyChanges = true
  }

  return {
    hasChanges: () => hasAnyChanges,

    consumeChanges: () => {
      const changes = new Set(changedFiles)
      changedFiles.clear()
      hasAnyChanges = false
      return changes
    },

    close: () => {
      if (watcher) {
        watcher.close()
        watcher = null
      }
      if (debounceTimer) {
        clearTimeout(debounceTimer)
        debounceTimer = null
      }
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Singleton Watcher (for handler.ts integration)
// ─────────────────────────────────────────────────────────────────────────────

let globalWatcher: DevWatcher | null = null
let watchedDir: string | null = null

/**
 * Get or create the global dev watcher
 */
export function getDevWatcher(serverDir: string): DevWatcher {
  // If already watching the same directory, return existing watcher
  if (globalWatcher && watchedDir === serverDir) {
    return globalWatcher
  }

  // Close existing watcher if watching different directory
  if (globalWatcher) {
    globalWatcher.close()
  }

  watchedDir = serverDir
  globalWatcher = createDevWatcher({
    watchDir: serverDir,
    onInvalidate: (files) => {
      // Log changed files in dev mode
      if (files.size > 0) {
        const relPaths = Array.from(files).map((f) =>
          relative(serverDir, f)
        )
        console.log(`[flexism] Files changed: ${relPaths.join(', ')}`)
      }
    },
  })

  return globalWatcher
}

/**
 * Check if cache should be invalidated
 *
 * Returns true only if files have actually changed
 */
export function shouldInvalidateCache(serverDir: string): boolean {
  const watcher = getDevWatcher(serverDir)
  return watcher.hasChanges()
}

/**
 * Get changed files and mark them as processed
 */
export function getAndClearChangedFiles(serverDir: string): Set<string> {
  const watcher = getDevWatcher(serverDir)
  return watcher.consumeChanges()
}

/**
 * Force invalidation (for initial request or manual refresh)
 */
export function forceInvalidation(): void {
  hasAnyChanges = true
}
