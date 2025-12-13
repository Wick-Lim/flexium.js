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

    if (!pressedKeys.has(key)) {
      const newPressed = new Set(pressedKeys)
      newPressed.add(key)
      setPressedKeys(newPressed)

      const newJustPressed = new Set(justPressedKeys)
      newJustPressed.add(key)
      setJustPressedKeys(newJustPressed)
    }
  }

  const handleKeyUp = (e: Event) => {
    const key = (e as KeyboardEvent).code

    const newPressed = new Set(pressedKeys)
    newPressed.delete(key)
    setPressedKeys(newPressed)

    const newJustReleased = new Set(justReleasedKeys)
    newJustReleased.add(key)
    setJustReleasedKeys(newJustReleased)
  }

  target.addEventListener('keydown', handleKeyDown)
  target.addEventListener('keyup', handleKeyUp)

  return {
    isPressed: (key: string) => pressedKeys?.has(key) || false,

    isJustPressed: (key: string) => justPressedKeys?.has(key) || false,

    isJustReleased: (key: string) => justReleasedKeys?.has(key) || false,

    getPressedKeys: () => Array.from(pressedKeys || []),

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
