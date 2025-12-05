/**
 * Canvas utilities
 */

import { isSignal as coreIsSignal } from '../../core/signal'
import type { Signal } from '../../core/signal'

/**
 * Check if a value is a Signal
 */
export function isSignal<T>(value: T | Signal<T>): value is Signal<T> {
  // Use core isSignal which checks for SIGNAL_MARKER symbol
  // Signals are functions with properties, not plain objects
  return coreIsSignal(value)
}

/**
 * Unwrap a value that might be a Signal
 */
export function unwrapSignal<T>(value: T | Signal<T>): T {
  // Check for real signals first (have SIGNAL_MARKER)
  if (isSignal(value)) {
    return value.value
  }
  // Handle signal-like objects (for testing) - duck typing
  // Check if it's an object with a 'value' property
  if (
    value !== null &&
    typeof value === 'object' &&
    'value' in value &&
    'peek' in value
  ) {
    return (value as any).value
  }
  return value
}
