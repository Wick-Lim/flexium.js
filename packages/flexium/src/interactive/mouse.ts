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
  x: number | null
  y: number | null
  deltaX: number
  deltaY: number
  wheelDelta: number
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

  const position = state({ x: 0, y: 0 }, { key: ['mouse', 'position'] })
  const delta = state({ x: 0, y: 0 }, { key: ['mouse', 'delta'] })
  const wheelDelta = state(0, { key: ['mouse', 'wheel'] })
  const buttons = state<Set<number>>(new Set<number>(), { key: ['mouse', 'buttons'] })

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

    position.set({ x, y })
    delta.set({ x: x - lastX, y: y - lastY })
    lastX = x
    lastY = y
  }

  const handleMouseDown = (e: Event) => {
    const button = (e as MouseEvent).button
    const currentButtons = buttons as Set<number>
    const newButtons = new Set(currentButtons)
    newButtons.add(button)
    buttons.set(newButtons)
  }

  const handleMouseUp = (e: Event) => {
    const button = (e as MouseEvent).button
    const currentButtons = buttons as Set<number>
    const newButtons = new Set(currentButtons)
    newButtons.delete(button)
    buttons.set(newButtons)
  }

  const handleWheel = (e: Event) => {
    const we = e as WheelEvent
    wheelDelta.set(we.deltaY)
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
      delta.set({ x: 0, y: 0 })
      wheelDelta.set(0)
    },

    dispose: () => {
      target.removeEventListener('mousemove', handleMouseMove)
      target.removeEventListener('mousedown', handleMouseDown)
      target.removeEventListener('mouseup', handleMouseUp)
      target.removeEventListener('wheel', handleWheel)
    }
  }
}
