import { getIsHydrating } from '../runtime'

let hydrated = false

/**
 * Check if currently in hydration phase
 */
export function isHydrating(): boolean {
  return getIsHydrating()
}

/**
 * Check if hydration has completed
 */
export function isHydrated(): boolean {
  return hydrated
}

/**
 * Mark hydration as complete (internal)
 */
export function setHydrated(value: boolean): void {
  hydrated = value
}
