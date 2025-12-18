import { use } from '../core/use'
import { MouseButton, type MouseOptions, type MouseState } from './types'

export { MouseButton, type MouseOptions, type MouseState }

export function mouse(options: MouseOptions = {}): MouseState {
  const target = options.target || window
  const canvasGetter = typeof options.canvas === 'function' ? options.canvas : () => options.canvas as HTMLCanvasElement | undefined

  const [position, setPosition] = use({ x: 0, y: 0 }, { key: ['mouse', 'position'] })
  const [delta, setDelta] = use({ x: 0, y: 0 }, { key: ['mouse', 'delta'] })
  const [wheelDelta, setWheelDelta] = use(0, { key: ['mouse', 'wheel'] })
  const [buttons, setButtons] = use<Set<number>>(new Set<number>(), { key: ['mouse', 'buttons'] })

  let lastX = 0
  let lastY = 0

  const handleMouseMove = (e: Event) => {
    const me = e as MouseEvent
    const canvas = canvasGetter()

    let x = me.clientX
    let y = me.clientY

    // If canvas is provided, calculate position relative to canvas
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      x = me.clientX - rect.left
      y = me.clientY - rect.top
    }

    setPosition({ x, y })
    setDelta({ x: x - lastX, y: y - lastY })
    lastX = x
    lastY = y
  }

  const handleMouseDown = (e: Event) => {
    const button = (e as MouseEvent).button
    const currentButtons = buttons as Set<number>
    const newButtons = new Set(currentButtons)
    newButtons.add(button)
    setButtons(newButtons)
  }

  const handleMouseUp = (e: Event) => {
    const button = (e as MouseEvent).button
    const currentButtons = buttons as Set<number>
    const newButtons = new Set(currentButtons)
    newButtons.delete(button)
    setButtons(newButtons)
  }

  const handleWheel = (e: Event) => {
    const we = e as WheelEvent
    setWheelDelta(we.deltaY)
  }

  target.addEventListener('mousemove', handleMouseMove)
  target.addEventListener('mousedown', handleMouseDown)
  target.addEventListener('mouseup', handleMouseUp)
  target.addEventListener('wheel', handleWheel)

  const currentButtons = buttons as Set<number>
  const currentPosition = position as { x: number; y: number }
  const currentDelta = delta as { x: number; y: number }
  const currentWheelDelta = wheelDelta as number

  return {
    get x() { return currentPosition.x },
    get y() { return currentPosition.y },
    get deltaX() { return currentDelta.x },
    get deltaY() { return currentDelta.y },
    get wheelDelta() { return currentWheelDelta },

    isPressed: (button: MouseButton) => currentButtons?.has(button) || false,

    isLeftPressed: () => currentButtons?.has(MouseButton.Left) || false,

    isRightPressed: () => currentButtons?.has(MouseButton.Right) || false,

    isMiddlePressed: () => currentButtons?.has(MouseButton.Middle) || false,

    clearFrameState: () => {
      setDelta({ x: 0, y: 0 })
      setWheelDelta(0)
    },

    dispose: () => {
      target.removeEventListener('mousemove', handleMouseMove)
      target.removeEventListener('mousedown', handleMouseDown)
      target.removeEventListener('mouseup', handleMouseUp)
      target.removeEventListener('wheel', handleWheel)
    }
  }
}
