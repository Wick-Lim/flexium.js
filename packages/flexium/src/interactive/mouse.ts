import { state } from '../core/state'

export enum MouseButton {
  Left = 0,
  Middle = 1,
  Right = 2
}

export interface MouseOptions {
  canvas?: HTMLCanvasElement | (() => HTMLCanvasElement | undefined)
  target?: EventTarget
}

export interface MouseState {
  position: { valueOf: () => { x: number; y: number } }
  delta: { valueOf: () => { x: number; y: number } }
  wheelDelta: { valueOf: () => number }
  isPressed: (button: MouseButton) => boolean
  isLeftPressed: () => boolean
  isRightPressed: () => boolean
  isMiddlePressed: () => boolean
  clearFrameState: () => void
  dispose: () => void
}

export function mouse(options: MouseOptions = {}): MouseState {
  const target = options.target || window
  const canvasGetter = typeof options.canvas === 'function' ? options.canvas : () => options.canvas as HTMLCanvasElement | undefined

  const [position, setPosition] = state({ x: 0, y: 0 }, { key: ['mouse', 'position'] })
  const [delta, setDelta] = state({ x: 0, y: 0 }, { key: ['mouse', 'delta'] })
  const [wheelDelta, setWheelDelta] = state(0, { key: ['mouse', 'wheel'] })
  const [buttons, setButtons] = state<Set<number>>(new Set<number>(), { key: ['mouse', 'buttons'] })

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
    const newButtons = new Set(buttons)
    newButtons.add(button)
    setButtons(newButtons)
  }

  const handleMouseUp = (e: Event) => {
    const button = (e as MouseEvent).button
    const newButtons = new Set(buttons)
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

  return {
    position: {
      valueOf: () => position
    },

    delta: {
      valueOf: () => delta
    },

    wheelDelta: {
      valueOf: () => wheelDelta
    },

    isPressed: (button: MouseButton) => buttons?.has(button) || false,

    isLeftPressed: () => buttons?.has(MouseButton.Left) || false,

    isRightPressed: () => buttons?.has(MouseButton.Right) || false,

    isMiddlePressed: () => buttons?.has(MouseButton.Middle) || false,

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
