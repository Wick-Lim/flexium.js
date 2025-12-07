/**
 * mouse - Reactive mouse input handler
 *
 * Creates a mouse input handler with reactive signals.
 * Philosophy: No hooks, just factory functions that return signal-based state.
 */

import { signal, type Signal } from '../core/signal'

export interface Vec2 {
  x: number
  y: number
}

export interface MouseState {
  /** Current mouse position relative to target */
  readonly position: Signal<Vec2>
  /** Mouse position delta since last frame */
  readonly delta: Signal<Vec2>
  /** Check if a mouse button is pressed (0=left, 1=middle, 2=right) */
  isPressed(button: number): boolean
  /** Check if left mouse button is pressed */
  isLeftPressed(): boolean
  /** Check if right mouse button is pressed */
  isRightPressed(): boolean
  /** Check if middle mouse button is pressed */
  isMiddlePressed(): boolean
  /** Wheel delta (positive = scroll down) */
  readonly wheelDelta: Signal<number>
  /** Clear frame state (call at end of frame) */
  clearFrameState(): void
  /** Cleanup event listeners */
  dispose(): void
}

export interface MouseOptions {
  /** Element to track mouse relative to (default: window) */
  target?: EventTarget
  /** Canvas element for coordinate calculation (if different from target) */
  canvas?: HTMLCanvasElement
}

/**
 * Create a mouse input handler with reactive state
 *
 * @example
 * ```tsx
 * const m = mouse()
 *
 * effect(() => {
 *   console.log('Mouse at:', m.position.value)
 *   if (m.isLeftPressed()) {
 *     draw(m.position.value)
 *   }
 * })
 * ```
 */
export function mouse(options: MouseOptions = {}): MouseState {
  const { target = window, canvas } = options

  const position = signal<Vec2>({ x: 0, y: 0 })
  const delta = signal<Vec2>({ x: 0, y: 0 })
  const wheelDelta = signal<number>(0)
  const buttons = signal<Set<number>>(new Set())

  let lastX = 0
  let lastY = 0
  let frameDeltaX = 0
  let frameDeltaY = 0
  let frameWheelDelta = 0

  function getCanvasCoordinates(event: MouseEvent): Vec2 {
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      }
    }
    return {
      x: event.clientX,
      y: event.clientY,
    }
  }

  function handleMouseMove(e: Event): void {
    const event = e as MouseEvent
    const coords = getCanvasCoordinates(event)

    frameDeltaX += coords.x - lastX
    frameDeltaY += coords.y - lastY
    lastX = coords.x
    lastY = coords.y

    position.value = coords
    delta.value = { x: frameDeltaX, y: frameDeltaY }
  }

  function handleMouseDown(e: Event): void {
    const event = e as MouseEvent
    const newButtons = new Set(buttons.value)
    newButtons.add(event.button)
    buttons.value = newButtons
  }

  function handleMouseUp(e: Event): void {
    const event = e as MouseEvent
    const newButtons = new Set(buttons.value)
    newButtons.delete(event.button)
    buttons.value = newButtons
  }

  function handleWheel(e: Event): void {
    const event = e as WheelEvent
    frameWheelDelta += Math.sign(event.deltaY)
    wheelDelta.value = frameWheelDelta
  }

  function handleMouseLeave(): void {
    buttons.value = new Set()
  }

  function handleContextMenu(_e: Event): void {
    // Prevent context menu in game contexts if needed
    // e.preventDefault()
  }

  // Add event listeners
  const eventTarget = canvas || target
  eventTarget.addEventListener('mousemove', handleMouseMove)
  eventTarget.addEventListener('mousedown', handleMouseDown)
  eventTarget.addEventListener('mouseup', handleMouseUp)
  eventTarget.addEventListener('wheel', handleWheel, { passive: true })
  eventTarget.addEventListener('mouseleave', handleMouseLeave)
  eventTarget.addEventListener('contextmenu', handleContextMenu)

  // Handle mouse up outside target
  if (target !== window) {
    window.addEventListener('mouseup', handleMouseUp)
  }

  return {
    get position() {
      return position
    },

    get delta() {
      return delta
    },

    get wheelDelta() {
      return wheelDelta
    },

    isPressed(button: number): boolean {
      return buttons.value.has(button)
    },

    isLeftPressed(): boolean {
      return buttons.value.has(0)
    },

    isRightPressed(): boolean {
      return buttons.value.has(2)
    },

    isMiddlePressed(): boolean {
      return buttons.value.has(1)
    },

    clearFrameState(): void {
      frameDeltaX = 0
      frameDeltaY = 0
      frameWheelDelta = 0
      delta.value = { x: 0, y: 0 }
      wheelDelta.value = 0
    },

    dispose(): void {
      eventTarget.removeEventListener('mousemove', handleMouseMove)
      eventTarget.removeEventListener('mousedown', handleMouseDown)
      eventTarget.removeEventListener('mouseup', handleMouseUp)
      eventTarget.removeEventListener('wheel', handleWheel)
      eventTarget.removeEventListener('mouseleave', handleMouseLeave)
      eventTarget.removeEventListener('contextmenu', handleContextMenu)

      if (target !== window) {
        window.removeEventListener('mouseup', handleMouseUp)
      }
    },
  }
}

/** Mouse button constants */
export const MouseButton = {
  Left: 0,
  Middle: 1,
  Right: 2,
} as const
