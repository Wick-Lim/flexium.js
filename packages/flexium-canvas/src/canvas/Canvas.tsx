import { use, Context, isReactive, getContextValue, pushContext, popContext } from 'flexium/core'
import { drawNodeWebGL } from './webgl/renderer'
import type { CanvasProps, CanvasDrawNode, CanvasContext as CanvasCtxType, CanvasRenderContext } from './types'

export type { CanvasProps }

// Canvas context for children to access render information
export const CanvasCtx = new Context<CanvasRenderContext | null>(null)

const drawQueue: CanvasDrawNode[] = []

/** Get current canvas render context (mode, ctx, dimensions) */
export function getCanvasRenderContext(): CanvasRenderContext | null {
  return getContextValue(CanvasCtx)
}

/** Get current 2D canvas context (returns null if not in 2D mode) */
export function getCanvasContext(): CanvasRenderingContext2D | null {
  const renderContext = getContextValue(CanvasCtx)
  if (renderContext?.mode === '2d') {
    return renderContext.ctx as CanvasRenderingContext2D | null
  }
  return null
}

/** Get current WebGL context (returns null if not in WebGL mode) */
export function getWebGLContext(): WebGLRenderingContext | null {
  const renderContext = getContextValue(CanvasCtx)
  if (renderContext?.mode === 'webgl') {
    return renderContext.ctx as WebGLRenderingContext | null
  }
  return null
}

/** Get current WebGL2 context (returns null if not in WebGL2 mode) */
export function getWebGL2Context(): WebGL2RenderingContext | null {
  const renderContext = getContextValue(CanvasCtx)
  if (renderContext?.mode === 'webgl2') {
    return renderContext.ctx as WebGL2RenderingContext | null
  }
  return null
}

export function queueDraw(node: CanvasDrawNode) {
  drawQueue.push(node)
}

export function Canvas(props: CanvasProps) {
  const { width, height, mode = '2d', webglAttributes, children, style, ref } = props

  let canvas: HTMLCanvasElement | undefined
  let ctx: CanvasCtxType | null = null

  const render = () => {
    if (!canvas || !ctx) return

    // Push render context for children
    const renderContext: CanvasRenderContext = { mode, ctx, width, height }
    const prevContext = pushContext(CanvasCtx.id, renderContext)

    // Clear draw queue
    drawQueue.length = 0

    try {
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

      // Execute draw queue based on mode
      if (mode === '2d' && ctx instanceof CanvasRenderingContext2D) {
        ctx.clearRect(0, 0, width, height)
        drawQueue.forEach(node => {
          drawNode2D(ctx as CanvasRenderingContext2D, node)
        })
      } else if ((mode === 'webgl' || mode === 'webgl2') && ctx instanceof WebGLRenderingContext) {
        const gl = ctx as WebGLRenderingContext
        gl.viewport(0, 0, width, height)
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        drawQueue.forEach(node => {
          drawNodeWebGL(gl, node, getValue)
        })
      }
    } finally {
      // Restore previous context
      popContext(CanvasCtx.id, prevContext)
    }
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

function drawNode2D(ctx: CanvasRenderingContext2D, node: CanvasDrawNode) {
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
