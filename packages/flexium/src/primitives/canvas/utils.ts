/**
 * Canvas utilities
 */

import { isSignal as coreIsSignal } from '../../core/state'
import type { StateValue } from '../../core/state'

/**
 * Check if a value is a Signal
 */
export function isSignal<T>(value: T | StateValue<T>): value is StateValue<T> {
  // Use core isSignal which checks for SIGNAL_MARKER symbol
  // Signals are functions with properties, not plain objects
  return coreIsSignal(value)
}

/**
 * Unwrap a value that might be a Signal
 */
export function unwrapSignal<T>(value: T | StateValue<T>): T {
  // Check for real signals first (have STATE_SIGNAL)
  if (isSignal(value)) {
    return (value as StateValue<T>)()
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
