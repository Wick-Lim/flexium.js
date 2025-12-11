/**
 * keyboard - Reactive keyboard input handler
 *
 * Creates a keyboard input handler with reactive signals.
 * Philosophy: No hooks, just factory functions that return signal-based state.
 */

import { state, type StateValue } from '../core/state'

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
  keys: StateValue<Set<string>>

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
  // Map of key code -> [signal, setter]
  const keys = new Map<string, [StateValue<boolean>, (v: boolean) => void]>()
  const [anyKeyPressed, setAnyKeyPressed] = state(false)
  const justPressed = new Set<string>()
  const justReleased = new Set<string>()

  function normalizeKey(key: string): string {
    return key.toLowerCase()
  }

  function getKeySignal(code: string): [StateValue<boolean>, (v: boolean) => void] {
    let s = keys.get(code)
    if (!s) {
      s = state(false)
      keys.set(code, s)
    }
    return s
  }

  // Cleanup original handlers if they exist or just overwrite?
  // Previous replace might have mixed things.
  // Re-implement handlers fully.

  function handleKeyDown(e: KeyboardEvent): void {
    const key = normalizeKey(e.code)
    const [s, setS] = getKeySignal(key)
    if (!s()) {
      setS(true)
      justPressed.add(key)
      setAnyKeyPressed(true)
    }
  }

  function handleKeyUp(e: KeyboardEvent): void {
    const key = normalizeKey(e.code)
    const [s, setS] = getKeySignal(key)
    if (s()) {
      setS(false)
      justReleased.add(key)
      // Re-check any key
      let any = false
      for (const [sig] of keys.values()) {
        if (sig()) {
          any = true
          break
        }
      }
      setAnyKeyPressed(any)
    }
  }

  function handleBlur(): void {
    // Clear all keys when window loses focus
    for (const [, setS] of keys.values()) {
      setS(false)
    }
    setAnyKeyPressed(false)
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
      return s ? s[0]() : false
    },

    isJustPressed(key: string) {
      return justPressed.has(normalizeKey(key))
    },

    isJustReleased(key: string) {
      return justReleased.has(normalizeKey(key))
    },

    getPressedKeys(): string[] {
      const pressed: string[] = []
      for (const [key, [sig]] of keys.entries()) {
        if (sig()) {
          pressed.push(key)
        }
      }
      return pressed
    },

    getPressed(): string[] {
      return this.getPressedKeys()
    },

    get keys() {
      // This getter returns a computed signal that derives from the individual key signals
      const [keysSignal] = state(() => {
        const pressed = new Set<string>()
        for (const [key, [sig]] of keys.entries()) {
          if (sig()) {
            pressed.add(key)
          }
        }
        return pressed
      })
      return keysSignal as unknown as StateValue<Set<string>>
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
