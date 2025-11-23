/**
 * Canvas renderer - renders canvas primitives to canvas context
 */

import type {
  RectProps,
  CircleProps,
  PathProps,
  CanvasTextProps,
  LineProps,
  ArcProps,
} from '../types'
import { unwrapSignal } from './utils'

/**
 * Render canvas children to context
 */
export function renderCanvasChildren(
  ctx: CanvasRenderingContext2D,
  children: any,
  _width: number,
  _height: number
): void {
  if (!children) return

  const childArray = Array.isArray(children) ? children : [children]

  for (const child of childArray) {
    if (!child || !child.type) continue

    switch (child.type) {
      case 'canvas-rect':
        renderRect(ctx, child.props)
        break
      case 'canvas-circle':
        renderCircle(ctx, child.props)
        break
      case 'canvas-path':
        renderPath(ctx, child.props)
        break
      case 'canvas-text':
        renderText(ctx, child.props)
        break
      case 'canvas-line':
        renderLine(ctx, child.props)
        break
      case 'canvas-arc':
        renderArc(ctx, child.props)
        break
    }
  }
}

/**
 * Render rectangle
 */
function renderRect(ctx: CanvasRenderingContext2D, props: RectProps): void {
  const x = unwrapSignal(props.x)
  const y = unwrapSignal(props.y)
  const width = unwrapSignal(props.width)
  const height = unwrapSignal(props.height)
  const fill = unwrapSignal(props.fill)
  const stroke = unwrapSignal(props.stroke)
  const strokeWidth = unwrapSignal(props.strokeWidth)
  const opacity = unwrapSignal(props.opacity)

  ctx.save()

  if (opacity !== undefined) {
    ctx.globalAlpha = opacity
  }

  if (fill) {
    ctx.fillStyle = fill
    ctx.fillRect(x, y, width, height)
  }

  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = strokeWidth || 1
    ctx.strokeRect(x, y, width, height)
  }

  ctx.restore()
}

/**
 * Render circle
 */
function renderCircle(ctx: CanvasRenderingContext2D, props: CircleProps): void {
  const x = unwrapSignal(props.x)
  const y = unwrapSignal(props.y)
  const radius = unwrapSignal(props.radius)
  const fill = unwrapSignal(props.fill)
  const stroke = unwrapSignal(props.stroke)
  const strokeWidth = unwrapSignal(props.strokeWidth)
  const opacity = unwrapSignal(props.opacity)

  ctx.save()

  if (opacity !== undefined) {
    ctx.globalAlpha = opacity
  }

  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI)

  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }

  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = strokeWidth || 1
    ctx.stroke()
  }

  ctx.restore()
}

/**
 * Render path
 */
function renderPath(ctx: CanvasRenderingContext2D, props: PathProps): void {
  const d = unwrapSignal(props.d)
  const fill = unwrapSignal(props.fill)
  const stroke = unwrapSignal(props.stroke)
  const strokeWidth = unwrapSignal(props.strokeWidth)
  const opacity = unwrapSignal(props.opacity)

  ctx.save()

  if (opacity !== undefined) {
    ctx.globalAlpha = opacity
  }

  // Parse SVG path (simplified - only supports basic commands)
  const path = new Path2D(d)

  if (fill) {
    ctx.fillStyle = fill
    ctx.fill(path)
  }

  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = strokeWidth || 1
    ctx.stroke(path)
  }

  ctx.restore()
}

/**
 * Render text
 */
function renderText(ctx: CanvasRenderingContext2D, props: CanvasTextProps): void {
  const x = unwrapSignal(props.x)
  const y = unwrapSignal(props.y)
  const text = unwrapSignal(props.text)
  const fill = unwrapSignal(props.fill)
  const fontSize = unwrapSignal(props.fontSize) || 12
  const fontFamily = props.fontFamily || 'sans-serif'
  const fontWeight = props.fontWeight || 'normal'
  const textAlign = props.textAlign || 'left'
  const textBaseline = props.textBaseline || 'alphabetic'

  ctx.save()

  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
  ctx.textAlign = textAlign
  ctx.textBaseline = textBaseline

  if (fill) {
    ctx.fillStyle = fill
    ctx.fillText(text, x, y)
  }

  ctx.restore()
}

/**
 * Render line
 */
function renderLine(ctx: CanvasRenderingContext2D, props: LineProps): void {
  const x1 = unwrapSignal(props.x1)
  const y1 = unwrapSignal(props.y1)
  const x2 = unwrapSignal(props.x2)
  const y2 = unwrapSignal(props.y2)
  const stroke = unwrapSignal(props.stroke) || 'black'
  const strokeWidth = unwrapSignal(props.strokeWidth) || 1
  const opacity = unwrapSignal(props.opacity)

  ctx.save()

  if (opacity !== undefined) {
    ctx.globalAlpha = opacity
  }

  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)

  ctx.strokeStyle = stroke
  ctx.lineWidth = strokeWidth
  ctx.stroke()

  ctx.restore()
}

/**
 * Render arc
 */
function renderArc(ctx: CanvasRenderingContext2D, props: ArcProps): void {
  const x = unwrapSignal(props.x)
  const y = unwrapSignal(props.y)
  const radius = unwrapSignal(props.radius)
  const startAngle = unwrapSignal(props.startAngle)
  const endAngle = unwrapSignal(props.endAngle)
  const counterclockwise = props.counterclockwise || false
  const fill = unwrapSignal(props.fill)
  const stroke = unwrapSignal(props.stroke)
  const strokeWidth = unwrapSignal(props.strokeWidth)
  const opacity = unwrapSignal(props.opacity)

  ctx.save()

  if (opacity !== undefined) {
    ctx.globalAlpha = opacity
  }

  ctx.beginPath()
  ctx.arc(x, y, radius, startAngle, endAngle, counterclockwise)

  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }

  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = strokeWidth || 1
    ctx.stroke()
  }

  ctx.restore()
}
