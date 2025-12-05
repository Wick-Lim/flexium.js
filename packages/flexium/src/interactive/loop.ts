/**
 * Loop - Core animation/game loop implementation with delta time and fixed timestep
 */

export interface LoopOptions {
  /** Target FPS for fixed update (default: 60) */
  fixedFps?: number
  /** Called every frame with delta time in seconds */
  onUpdate?: (delta: number) => void
  /** Called at fixed intervals (for physics) */
  onFixedUpdate?: (fixedDelta: number) => void
  /** Called every frame for rendering */
  onRender?: (alpha: number) => void
}

export interface Loop {
  /** Start the loop */
  start(): void
  /** Stop the loop */
  stop(): void
  /** Check if loop is running */
  isRunning(): boolean
  /** Get current FPS */
  getFps(): number
}

/**
 * Create an animation loop with delta time and optional fixed timestep
 */
export function createLoop(options: LoopOptions = {}): Loop {
  const { fixedFps = 60, onUpdate, onFixedUpdate, onRender } = options

  const fixedDelta = 1 / fixedFps
  let running = false
  let rafId: number | undefined
  let lastTime = 0
  let accumulator = 0
  let fps = 0
  let frameCount = 0
  let fpsTime = 0
  let isFirstFrame = true

  function loop(currentTime: number): void {
    if (!running) return

    rafId = requestAnimationFrame(loop)

    // Convert to seconds
    const time = currentTime / 1000

    // Initialize lastTime on first frame and skip processing
    if (isFirstFrame) {
      lastTime = time
      isFirstFrame = false
      return
    }

    const delta = Math.min(time - lastTime, 0.25) // Cap at 250ms
    lastTime = time

    // FPS counter
    frameCount++
    fpsTime += delta
    if (fpsTime >= 1) {
      fps = frameCount
      frameCount = 0
      fpsTime -= 1
    }

    // Variable update
    if (onUpdate) {
      onUpdate(delta)
    }

    // Fixed update (for physics)
    if (onFixedUpdate) {
      accumulator += delta

      while (accumulator >= fixedDelta) {
        onFixedUpdate(fixedDelta)
        accumulator -= fixedDelta
      }
    }

    // Render with interpolation alpha
    if (onRender) {
      const alpha = onFixedUpdate ? accumulator / fixedDelta : 1
      onRender(alpha)
    }
  }

  return {
    start() {
      if (running) return
      running = true
      isFirstFrame = true
      accumulator = 0
      rafId = requestAnimationFrame(loop)
    },

    stop() {
      running = false
      if (rafId !== undefined) {
        cancelAnimationFrame(rafId)
        rafId = undefined
      }
    },

    isRunning() {
      return running
    },

    getFps() {
      return fps
    },
  }
}
