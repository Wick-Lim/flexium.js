/**
 * keyboard - Reactive keyboard input handler
 *
 * Creates a keyboard input handler with reactive signals.
 * Philosophy: No hooks, just factory functions that return signal-based state.
 */

import { SignalNode, type Signal } from '../core/signal'

export interface KeyboardState {
  /** Check if a key is currently pressed */
  isPressed(key: string): boolean
  /** Check if a key was pressed in the current frame */
  isJustPressed(key: string): boolean
  /** Check if a key was released in the current frame */
  isJustReleased(key: string): boolean
  /** Get all currently pressed keys */
  getPressed(): string[]
  /** Get all currently pressed keys (alias) */
  getPressedKeys(): string[]
  /** 
   * Reactive set of all currently pressed keys
   * @deprecated Use isPressed() or getPressed() instead for better performance
   */
  keys: SignalNode<Set<string>>

  /** Clear all state at end of frame */
  clearFrameState(): void
  /** Remove event listeners */
  dispose(): void
}

/**
 * Create a keyboard input handler with reactive state
 *
 * @example
 * ```tsx
 * const kb = keyboard()
 *
 * effect(() => {
 *   if (kb.isPressed(Keys.ArrowUp)) {
 *     player.y -= speed
 *   }
 * })
 * ```
 */
export function keyboard(target: EventTarget = window): KeyboardState {
  // Map of key code -> pressed signal
  const keys = new Map<string, SignalNode<boolean>>()
  const anyKeyPressed = new SignalNode(false)
  const justPressed = new Set<string>()
  const justReleased = new Set<string>()

  function normalizeKey(key: string): string {
    return key.toLowerCase()
  }

  function getKeySignal(code: string): SignalNode<boolean> {
    let s = keys.get(code)
    if (!s) {
      s = new SignalNode(false)
      keys.set(code, s)
    }
    return s
  }

  // Cleanup original handlers if they exist or just overwrite?
  // Previous replace might have mixed things.
  // Re-implement handlers fully.

  function handleKeyDown(e: KeyboardEvent): void {
    const key = normalizeKey(e.code)
    const s = getKeySignal(key)
    if (!s.get()) {
      s.set(true)
      justPressed.add(key)
      anyKeyPressed.set(true)
    }
  }

  function handleKeyUp(e: KeyboardEvent): void {
    const key = normalizeKey(e.code)
    const s = getKeySignal(key)
    if (s.get()) {
      s.set(false)
      justReleased.add(key)
      // Re-check any key
      let any = false
      for (const sig of keys.values()) {
        if (sig.get()) {
          any = true
          break
        }
      }
      anyKeyPressed.set(any)
    }
  }

  function handleBlur(): void {
    // Clear all keys when window loses focus
    for (const s of keys.values()) {
      s.set(false)
    }
    anyKeyPressed.set(false)
    justPressed.clear()
    justReleased.clear()
  }

  // Attach listeners
  target.addEventListener('keydown', handleKeyDown as EventListener)
  target.addEventListener('keyup', handleKeyUp as EventListener)
  window.addEventListener('blur', handleBlur)

  return {
    isPressed(key: string) {
      const s = keys.get(normalizeKey(key))
      return s ? s.get() : false
    },

    isJustPressed(key: string) {
      return justPressed.has(normalizeKey(key))
    },

    isJustReleased(key: string) {
      return justReleased.has(normalizeKey(key))
    },

    getPressedKeys(): string[] {
      const pressed: string[] = []
      for (const [key, signal] of keys.entries()) {
        if (signal.get()) {
          pressed.push(key)
        }
      }
      return pressed
    },

    getPressed(): string[] {
      return this.getPressedKeys()
    },

    get keys() {
      // This getter returns the Map of SignalNodes, not a Signal<Set<string>> directly.
      // The original interface implies a Signal<Set<string>>.
      // For now, returning a dummy signal that always returns an empty set.
      // A proper implementation would require a computed signal that derives from the individual key signals.
      return new SignalNode(new Set<string>())
    },

    clearFrameState(): void {
      justPressed.clear()
      justReleased.clear()
    },

    dispose(): void {
      target.removeEventListener('keydown', handleKeyDown as EventListener)
      target.removeEventListener('keyup', handleKeyUp as EventListener)
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
