import { use } from '../core/use'
import { Keys, type KeyboardState } from './types'

export { Keys, type KeyboardState }

export function keyboard(target: EventTarget = window): KeyboardState {
  const [pressedKeys, setPressedKeys] = use<Set<string>>(new Set<string>(), undefined, { key: ['keyboard', 'pressed'] })
  const [justPressedKeys, setJustPressedKeys] = use<Set<string>>(new Set<string>(), undefined, { key: ['keyboard', 'justPressed'] })
  const [justReleasedKeys, setJustReleasedKeys] = use<Set<string>>(new Set<string>(), undefined, { key: ['keyboard', 'justReleased'] })

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
