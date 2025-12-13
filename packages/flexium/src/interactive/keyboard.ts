import { state } from '../core/state'

export enum Keys {
  // Arrow keys
  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',

  // WASD
  KeyW = 'KeyW',
  KeyA = 'KeyA',
  KeyS = 'KeyS',
  KeyD = 'KeyD',

  // Common keys
  Space = 'Space',
  Enter = 'Enter',
  Escape = 'Escape',
  Tab = 'Tab',

  // Modifiers
  ShiftLeft = 'ShiftLeft',
  ShiftRight = 'ShiftRight',
  ControlLeft = 'ControlLeft',
  ControlRight = 'ControlRight',
  AltLeft = 'AltLeft',
  AltRight = 'AltRight',

  // Numbers
  Digit0 = 'Digit0',
  Digit1 = 'Digit1',
  Digit2 = 'Digit2',
  Digit3 = 'Digit3',
  Digit4 = 'Digit4',
  Digit5 = 'Digit5',
  Digit6 = 'Digit6',
  Digit7 = 'Digit7',
  Digit8 = 'Digit8',
  Digit9 = 'Digit9',

  // Letters (additional common ones)
  KeyE = 'KeyE',
  KeyQ = 'KeyQ',
  KeyR = 'KeyR',
  KeyF = 'KeyF',
}

export interface KeyboardState {
  isPressed: (key: string) => boolean
  isJustPressed: (key: string) => boolean
  isJustReleased: (key: string) => boolean
  getPressedKeys: () => string[]
  clearFrameState: () => void
  dispose: () => void
}

export function keyboard(target: EventTarget = window): KeyboardState {
  const [pressedKeys, setPressedKeys] = state<Set<string>>(new Set<string>(), { key: ['keyboard', 'pressed'] })
  const [justPressedKeys, setJustPressedKeys] = state<Set<string>>(new Set<string>(), { key: ['keyboard', 'justPressed'] })
  const [justReleasedKeys, setJustReleasedKeys] = state<Set<string>>(new Set<string>(), { key: ['keyboard', 'justReleased'] })

  const handleKeyDown = (e: Event) => {
    const key = (e as KeyboardEvent).code
    const currentPressed = pressedKeys as Set<string>

    if (!currentPressed.has(key)) {
      const newPressed = new Set(currentPressed)
      newPressed.add(key)
      setPressedKeys(newPressed)

      const currentJustPressed = justPressedKeys as Set<string>
      const newJustPressed = new Set(currentJustPressed)
      newJustPressed.add(key)
      setJustPressedKeys(newJustPressed)
    }
  }

  const handleKeyUp = (e: Event) => {
    const key = (e as KeyboardEvent).code
    const currentPressed = pressedKeys as Set<string>

    const newPressed = new Set(currentPressed)
    newPressed.delete(key)
    setPressedKeys(newPressed)

    const currentJustReleased = justReleasedKeys as Set<string>
    const newJustReleased = new Set(currentJustReleased)
    newJustReleased.add(key)
    setJustReleasedKeys(newJustReleased)
  }

  target.addEventListener('keydown', handleKeyDown)
  target.addEventListener('keyup', handleKeyUp)

  return {
    isPressed: (key: string) => {
      const current = pressedKeys as Set<string>
      return current?.has(key) || false
    },

    isJustPressed: (key: string) => {
      const current = justPressedKeys as Set<string>
      return current?.has(key) || false
    },

    isJustReleased: (key: string) => {
      const current = justReleasedKeys as Set<string>
      return current?.has(key) || false
    },

    getPressedKeys: () => {
      const current = pressedKeys as Set<string>
      return Array.from(current || [])
    },

    clearFrameState: () => {
      setJustPressedKeys(new Set<string>())
      setJustReleasedKeys(new Set<string>())
    },

    dispose: () => {
      target.removeEventListener('keydown', handleKeyDown)
      target.removeEventListener('keyup', handleKeyUp)
    }
  }
}
