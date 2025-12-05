/**
 * useKeyboard - Reactive keyboard input hook
 */

import { signal, type Signal } from '../core/signal'

export interface KeyboardState {
  /** Check if a key is currently pressed */
  isPressed(key: string): boolean
  /** Check if a key was just pressed this frame */
  isJustPressed(key: string): boolean
  /** Check if a key was just released this frame */
  isJustReleased(key: string): boolean
  /** Get all currently pressed keys */
  getPressedKeys(): string[]
  /** Signal that updates when any key state changes */
  readonly keys: Signal<Set<string>>
  /** Clear just pressed/released state (call at end of frame) */
  clearFrameState(): void
  /** Cleanup event listeners */
  dispose(): void
}

/**
 * Create a keyboard input handler with reactive state
 */
export function useKeyboard(target: EventTarget = window): KeyboardState {
  const keys = signal<Set<string>>(new Set())
  const justPressed = new Set<string>()
  const justReleased = new Set<string>()

  function normalizeKey(key: string): string {
    return key.toLowerCase()
  }

  function handleKeyDown(e: Event): void {
    const event = e as KeyboardEvent
    const key = normalizeKey(event.code)

    if (!keys.value.has(key)) {
      justPressed.add(key)
      const newKeys = new Set(keys.value)
      newKeys.add(key)
      keys.value = newKeys
    }
  }

  function handleKeyUp(e: Event): void {
    const event = e as KeyboardEvent
    const key = normalizeKey(event.code)

    if (keys.value.has(key)) {
      justReleased.add(key)
      const newKeys = new Set(keys.value)
      newKeys.delete(key)
      keys.value = newKeys
    }
  }

  function handleBlur(): void {
    // Clear all keys when window loses focus
    keys.value = new Set()
    justPressed.clear()
    justReleased.clear()
  }

  // Add event listeners
  target.addEventListener('keydown', handleKeyDown)
  target.addEventListener('keyup', handleKeyUp)
  if (target === window) {
    target.addEventListener('blur', handleBlur)
  }

  return {
    isPressed(key: string): boolean {
      return keys.value.has(normalizeKey(key))
    },

    isJustPressed(key: string): boolean {
      return justPressed.has(normalizeKey(key))
    },

    isJustReleased(key: string): boolean {
      return justReleased.has(normalizeKey(key))
    },

    getPressedKeys(): string[] {
      return Array.from(keys.value)
    },

    get keys() {
      return keys
    },

    clearFrameState(): void {
      justPressed.clear()
      justReleased.clear()
    },

    dispose(): void {
      target.removeEventListener('keydown', handleKeyDown)
      target.removeEventListener('keyup', handleKeyUp)
      if (target === window) {
        target.removeEventListener('blur', handleBlur)
      }
    },
  }
}

/** Common key codes for convenience */
export const Keys = {
  // Arrow keys
  ArrowUp: 'arrowup',
  ArrowDown: 'arrowdown',
  ArrowLeft: 'arrowleft',
  ArrowRight: 'arrowright',

  // WASD
  KeyW: 'keyw',
  KeyA: 'keya',
  KeyS: 'keys',
  KeyD: 'keyd',

  // Common keys
  Space: 'space',
  Enter: 'enter',
  Escape: 'escape',
  ShiftLeft: 'shiftleft',
  ShiftRight: 'shiftright',
  ControlLeft: 'controlleft',
  ControlRight: 'controlright',
  AltLeft: 'altleft',
  AltRight: 'altright',
  Tab: 'tab',

  // Numbers
  Digit0: 'digit0',
  Digit1: 'digit1',
  Digit2: 'digit2',
  Digit3: 'digit3',
  Digit4: 'digit4',
  Digit5: 'digit5',
  Digit6: 'digit6',
  Digit7: 'digit7',
  Digit8: 'digit8',
  Digit9: 'digit9',
} as const
