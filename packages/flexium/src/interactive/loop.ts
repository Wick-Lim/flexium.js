import type { LoopCallbacks, Loop } from './types'

export type { LoopCallbacks, Loop }

export function loop(callbacks: LoopCallbacks): Loop {
  const { fixedFps = 60, onUpdate, onFixedUpdate, onRender } = callbacks

  const fixedDelta = 1 / fixedFps
  const maxDelta = 0.25 // Cap delta at 250ms to prevent spiral of death

  let running = false
  let lastTime = 0
  let accumulator = 0
  let fps = 0
  let frameCount = 0
  let fpsTime = 0
  let rafId: number | null = null

  function loop(currentTime: number) {
    if (!running) return

    // Calculate delta in seconds
    const delta = Math.min((currentTime - lastTime) / 1000, maxDelta)
    lastTime = currentTime

    // Variable timestep update
    if (onUpdate) {
      onUpdate(delta)
    }

    // Fixed timestep update
    if (onFixedUpdate) {
      accumulator += delta

      while (accumulator >= fixedDelta) {
        onFixedUpdate(fixedDelta)
        accumulator -= fixedDelta
      }
    }

    // Render with interpolation alpha
    if (onRender) {
      const alpha = accumulator / fixedDelta
      onRender(alpha)
    }

    // FPS calculation
    frameCount++
    if (currentTime - fpsTime >= 1000) {
      fps = frameCount
      frameCount = 0
      fpsTime = currentTime
    }

    rafId = requestAnimationFrame(loop)
  }

  return {
    start: () => {
      if (running) return
      running = true
      lastTime = performance.now()
      accumulator = 0
      rafId = requestAnimationFrame(loop)
    },

    stop: () => {
      running = false
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
    },

    isRunning: () => running,

    getFps: () => fps
  }
}
