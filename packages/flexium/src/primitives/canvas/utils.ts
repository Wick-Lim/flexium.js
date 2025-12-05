/**
 * Canvas utilities
 */

import type { Signal } from '../../core/signal'

/**
 * Check if a value is a Signal
 */
export function isSignal<T>(value: T | Signal<T>): value is Signal<T> {
  return (
    value &&
    typeof value === 'object' &&
    'value' in value &&
    'peek' in value &&
    'set' in value
  )
}

/**
 * Unwrap a value that might be a Signal
 */
export function unwrapSignal<T>(value: T | Signal<T>): T {
  if (isSignal(value)) {
    return value.value
  }
  return value
}
