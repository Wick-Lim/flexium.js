import { use } from '../core/use'
import { isReactive } from '../core/reactive'
import type { CanvasProps, CanvasDrawNode, CanvasContext, CanvasRenderContext } from './types'

export type { CanvasProps }

// Canvas render context for children to access
let currentRenderContext: CanvasRenderContext | null = null
const drawQueue: CanvasDrawNode[] = []

/** Get current canvas render context (mode, ctx, dimensions) */
export function getCanvasRenderContext(): CanvasRenderContext | null {
  return currentRenderContext
}

/** Get current 2D canvas context (returns null if not in 2D mode) */
export function getCanvasContext(): CanvasRenderingContext2D | null {
  if (currentRenderContext?.mode === '2d') {
    return currentRenderContext.ctx as CanvasRenderingContext2D | null
  }
  return null
}

/** Get current WebGL context (returns null if not in WebGL mode) */
export function getWebGLContext(): WebGLRenderingContext | null {
  if (currentRenderContext?.mode === 'webgl') {
    return currentRenderContext.ctx as WebGLRenderingContext | null
  }
  return null
}

/** Get current WebGL2 context (returns null if not in WebGL2 mode) */
export function getWebGL2Context(): WebGL2RenderingContext | null {
  if (currentRenderContext?.mode === 'webgl2') {
    return currentRenderContext.ctx as WebGL2RenderingContext | null
  }
  return null
}

export function queueDraw(node: CanvasDrawNode) {
  if (currentRenderContext?.mode !== '2d') {
    console.warn(`Draw components only work in 2D mode. Current mode: ${currentRenderContext?.mode}`)
    return
  }
  drawQueue.push(node)
}

export function Canvas(props: CanvasProps) {
  const { width, height, mode = '2d', webglAttributes, children, style, ref, onContext } = props

  let canvas: HTMLCanvasElement | undefined
  let ctx: CanvasContext | null = null

  const render = () => {
    if (!canvas || !ctx) return

    // Set render context for children
    currentRenderContext = { mode, ctx, width, height }

    // For 2D mode, use the draw queue system
    if (mode === '2d' && ctx instanceof CanvasRenderingContext2D) {
      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Clear draw queue
      drawQueue.length = 0

      // Render children (they will queue draw commands)
      if (Array.isArray(children)) {
        children.forEach(child => {
          if (typeof child === 'function') {
            child()
          }
        })
      } else if (typeof children === 'function') {
        children()
      }

      // Execute draw queue
      drawQueue.forEach(node => {
        drawNode(ctx as CanvasRenderingContext2D, node)
      })
    }
    // For WebGL modes, just call children if they exist (they handle their own rendering)
    else {
      if (Array.isArray(children)) {
        children.forEach(child => {
          if (typeof child === 'function') {
            child()
          }
        })
      } else if (typeof children === 'function') {
        children()
      }
    }

    // Clear render context
    currentRenderContext = null
  }

  use(() => {
    if (canvas) {
      render()
    }
  })

  return (
    <canvas
      ref={(el: HTMLCanvasElement) => {
        canvas = el
        // Get the appropriate context based on mode
        if (mode === '2d') {
          ctx = el.getContext('2d')
        } else if (mode === 'webgl') {
          ctx = el.getContext('webgl', webglAttributes) || el.getContext('experimental-webgl', webglAttributes) as WebGLRenderingContext | null
        } else if (mode === 'webgl2') {
          ctx = el.getContext('webgl2', webglAttributes)
        }
        if (ref) ref(el)
        if (onContext && ctx) onContext(ctx)
        render()
      }}
      width={width}
      height={height}
      style={style}
    />
  )
}

function getValue(val: any): any {
  if (isReactive(val)) {
    return val.valueOf?.() ?? val
  }
  return val
}

function drawNode(ctx: CanvasRenderingContext2D, node: CanvasDrawNode) {
  const { type, props } = node

  // Apply opacity
  const opacity = getValue(props.opacity)
  if (opacity !== undefined) {
    ctx.globalAlpha = opacity
  }

  switch (type) {
    case 'rect': {
      const x = getValue(props.x)
      const y = getValue(props.y)
      const w = getValue(props.width)
      const h = getValue(props.height)
      const fill = getValue(props.fill)
      const stroke = getValue(props.stroke)
      const strokeWidth = getValue(props.strokeWidth)

      if (fill) {
        ctx.fillStyle = fill
        ctx.fillRect(x, y, w, h)
      }

      if (stroke) {
        ctx.strokeStyle = stroke
        if (strokeWidth) ctx.lineWidth = strokeWidth
        ctx.strokeRect(x, y, w, h)
      }
      break
    }

    case 'circle': {
      const x = getValue(props.x)
      const y = getValue(props.y)
      const radius = getValue(props.radius)
      const fill = getValue(props.fill)
      const stroke = getValue(props.stroke)
      const strokeWidth = getValue(props.strokeWidth)

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)

      if (fill) {
        ctx.fillStyle = fill
        ctx.fill()
      }

      if (stroke) {
        ctx.strokeStyle = stroke
        if (strokeWidth) ctx.lineWidth = strokeWidth
        ctx.stroke()
      }
      break
    }

    case 'arc': {
      const x = getValue(props.x)
      const y = getValue(props.y)
      const radius = getValue(props.radius)
      const startAngle = getValue(props.startAngle)
      const endAngle = getValue(props.endAngle)
      const counterclockwise = getValue(props.counterclockwise) || false
      const fill = getValue(props.fill)
      const stroke = getValue(props.stroke)
      const strokeWidth = getValue(props.strokeWidth)

      ctx.beginPath()
      ctx.arc(x, y, radius, startAngle, endAngle, counterclockwise)

      if (fill) {
        ctx.fillStyle = fill
        ctx.fill()
      }

      if (stroke) {
        ctx.strokeStyle = stroke
        if (strokeWidth) ctx.lineWidth = strokeWidth
        ctx.stroke()
      }
      break
    }

    case 'line': {
      const x1 = getValue(props.x1)
      const y1 = getValue(props.y1)
      const x2 = getValue(props.x2)
      const y2 = getValue(props.y2)
      const stroke = getValue(props.stroke) || 'black'
      const strokeWidth = getValue(props.strokeWidth) || 1

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = stroke
      ctx.lineWidth = strokeWidth
      ctx.stroke()
      break
    }

    case 'text': {
      const x = getValue(props.x)
      const y = getValue(props.y)
      const text = getValue(props.text)
      const fill = getValue(props.fill) || 'black'
      const fontSize = getValue(props.fontSize) || 16
      const fontFamily = getValue(props.fontFamily) || 'sans-serif'
      const fontWeight = getValue(props.fontWeight) || 'normal'
      const textAlign = getValue(props.textAlign) || 'left'

      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
      ctx.textAlign = textAlign as CanvasTextAlign
      ctx.fillStyle = fill
      ctx.fillText(text, x, y)
      break
    }

    case 'path': {
      const d = getValue(props.d)
      const fill = getValue(props.fill)
      const stroke = getValue(props.stroke)
      const strokeWidth = getValue(props.strokeWidth)

      // Parse SVG path data
      const path = new Path2D(d)

      if (fill) {
        ctx.fillStyle = fill
        ctx.fill(path)
      }

      if (stroke) {
        ctx.strokeStyle = stroke
        if (strokeWidth) ctx.lineWidth = strokeWidth
        ctx.stroke(path)
      }
      break
    }
  }

  // Reset opacity
  if (opacity !== undefined) {
    ctx.globalAlpha = 1
  }
}
