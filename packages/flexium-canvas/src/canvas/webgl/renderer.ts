import { createShader, createProgram, basicVertexShader, basicFragmentShader, textureVertexShader, textureFragmentShader } from './shaders'
import type { CanvasDrawNode } from '../types'

interface WebGLState {
  program: WebGLProgram
  positionBuffer: WebGLBuffer
  positionLocation: number
  resolutionLocation: WebGLUniformLocation
  colorLocation: WebGLUniformLocation
  // Texture program for text
  textureProgram: WebGLProgram
  texPositionBuffer: WebGLBuffer
  texCoordBuffer: WebGLBuffer
  texPositionLocation: number
  texCoordLocation: number
  texResolutionLocation: WebGLUniformLocation
  texOpacityLocation: WebGLUniformLocation
}

const glStateCache = new WeakMap<WebGLRenderingContext, WebGLState>()
const textCanvasCache = new WeakMap<WebGLRenderingContext, HTMLCanvasElement>()

function getGLState(gl: WebGLRenderingContext): WebGLState | null {
  let state = glStateCache.get(gl)
  if (state) return state

  // Basic shape program
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, basicVertexShader)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, basicFragmentShader)
  if (!vertexShader || !fragmentShader) return null

  const program = createProgram(gl, vertexShader, fragmentShader)
  if (!program) return null

  const positionBuffer = gl.createBuffer()
  if (!positionBuffer) return null

  const positionLocation = gl.getAttribLocation(program, 'a_position')
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
  const colorLocation = gl.getUniformLocation(program, 'u_color')
  if (resolutionLocation === null || colorLocation === null) return null

  // Texture program for text
  const texVertexShader = createShader(gl, gl.VERTEX_SHADER, textureVertexShader)
  const texFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, textureFragmentShader)
  if (!texVertexShader || !texFragmentShader) return null

  const textureProgram = createProgram(gl, texVertexShader, texFragmentShader)
  if (!textureProgram) return null

  const texPositionBuffer = gl.createBuffer()
  const texCoordBuffer = gl.createBuffer()
  if (!texPositionBuffer || !texCoordBuffer) return null

  const texPositionLocation = gl.getAttribLocation(textureProgram, 'a_position')
  const texCoordLocation = gl.getAttribLocation(textureProgram, 'a_texCoord')
  const texResolutionLocation = gl.getUniformLocation(textureProgram, 'u_resolution')
  const texOpacityLocation = gl.getUniformLocation(textureProgram, 'u_opacity')
  if (texResolutionLocation === null || texOpacityLocation === null) return null

  state = {
    program, positionBuffer, positionLocation, resolutionLocation, colorLocation,
    textureProgram, texPositionBuffer, texCoordBuffer, texPositionLocation, texCoordLocation, texResolutionLocation, texOpacityLocation
  }
  glStateCache.set(gl, state)
  return state
}

function parseColor(color: string): [number, number, number, number] {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16) / 255
      const g = parseInt(hex[1] + hex[1], 16) / 255
      const b = parseInt(hex[2] + hex[2], 16) / 255
      return [r, g, b, 1]
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16) / 255
      const g = parseInt(hex.slice(2, 4), 16) / 255
      const b = parseInt(hex.slice(4, 6), 16) / 255
      return [r, g, b, 1]
    }
  }
  // Handle rgb/rgba
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (rgbMatch) {
    return [
      parseInt(rgbMatch[1]) / 255,
      parseInt(rgbMatch[2]) / 255,
      parseInt(rgbMatch[3]) / 255,
      rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1
    ]
  }
  // Handle named colors (basic set)
  const namedColors: Record<string, [number, number, number, number]> = {
    black: [0, 0, 0, 1],
    white: [1, 1, 1, 1],
    red: [1, 0, 0, 1],
    green: [0, 0.5, 0, 1],
    blue: [0, 0, 1, 1],
    yellow: [1, 1, 0, 1],
    cyan: [0, 1, 1, 1],
    magenta: [1, 0, 1, 1],
    gray: [0.5, 0.5, 0.5, 1],
    orange: [1, 0.65, 0, 1],
    purple: [0.5, 0, 0.5, 1],
  }
  return namedColors[color.toLowerCase()] || [0, 0, 0, 1]
}

function drawShape(gl: WebGLRenderingContext, state: WebGLState, positions: number[], color: string, opacity: number) {
  gl.useProgram(state.program)

  gl.bindBuffer(gl.ARRAY_BUFFER, state.positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  gl.enableVertexAttribArray(state.positionLocation)
  gl.vertexAttribPointer(state.positionLocation, 2, gl.FLOAT, false, 0, 0)

  gl.uniform2f(state.resolutionLocation, gl.canvas.width, gl.canvas.height)

  const [r, g, b, a] = parseColor(color)
  gl.uniform4f(state.colorLocation, r, g, b, a * opacity)

  gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2)
}

function drawLineGL(gl: WebGLRenderingContext, state: WebGLState, positions: number[], color: string, opacity: number, lineWidth: number) {
  gl.useProgram(state.program)

  gl.bindBuffer(gl.ARRAY_BUFFER, state.positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  gl.enableVertexAttribArray(state.positionLocation)
  gl.vertexAttribPointer(state.positionLocation, 2, gl.FLOAT, false, 0, 0)

  gl.uniform2f(state.resolutionLocation, gl.canvas.width, gl.canvas.height)

  const [r, g, b, a] = parseColor(color)
  gl.uniform4f(state.colorLocation, r, g, b, a * opacity)

  gl.lineWidth(lineWidth)
  gl.drawArrays(gl.LINES, 0, positions.length / 2)
}

export function drawNodeWebGL(gl: WebGLRenderingContext, node: CanvasDrawNode, getValue: (val: any) => any) {
  const state = getGLState(gl)
  if (!state) return

  const { type, props } = node
  const opacity = getValue(props.opacity) ?? 1

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  switch (type) {
    case 'rect': {
      const x = getValue(props.x)
      const y = getValue(props.y)
      const w = getValue(props.width)
      const h = getValue(props.height)
      const fill = getValue(props.fill)

      if (fill) {
        // Two triangles for rectangle
        const positions = [
          x, y,
          x + w, y,
          x, y + h,
          x, y + h,
          x + w, y,
          x + w, y + h
        ]
        drawShape(gl, state, positions, fill, opacity)
      }
      break
    }

    case 'circle': {
      const cx = getValue(props.x)
      const cy = getValue(props.y)
      const radius = getValue(props.radius)
      const fill = getValue(props.fill)

      if (fill) {
        // Create triangle fan for circle
        const segments = 32
        const positions: number[] = []
        for (let i = 0; i < segments; i++) {
          const angle1 = (i / segments) * Math.PI * 2
          const angle2 = ((i + 1) / segments) * Math.PI * 2
          // Center
          positions.push(cx, cy)
          // Point 1
          positions.push(cx + Math.cos(angle1) * radius, cy + Math.sin(angle1) * radius)
          // Point 2
          positions.push(cx + Math.cos(angle2) * radius, cy + Math.sin(angle2) * radius)
        }
        drawShape(gl, state, positions, fill, opacity)
      }
      break
    }

    case 'arc': {
      const cx = getValue(props.x)
      const cy = getValue(props.y)
      const radius = getValue(props.radius)
      const startAngle = getValue(props.startAngle)
      const endAngle = getValue(props.endAngle)
      const fill = getValue(props.fill)

      if (fill) {
        const segments = 32
        const positions: number[] = []
        const angleRange = endAngle - startAngle
        for (let i = 0; i < segments; i++) {
          const angle1 = startAngle + (i / segments) * angleRange
          const angle2 = startAngle + ((i + 1) / segments) * angleRange
          positions.push(cx, cy)
          positions.push(cx + Math.cos(angle1) * radius, cy + Math.sin(angle1) * radius)
          positions.push(cx + Math.cos(angle2) * radius, cy + Math.sin(angle2) * radius)
        }
        drawShape(gl, state, positions, fill, opacity)
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

      drawLineGL(gl, state, [x1, y1, x2, y2], stroke, opacity, strokeWidth)
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

      drawTextWebGL(gl, state, text, x, y, fill, fontSize, fontFamily, fontWeight, textAlign, opacity)
      break
    }

    case 'path': {
      const d = getValue(props.d)
      const fill = getValue(props.fill)

      if (fill) {
        const positions = parseSVGPath(d)
        if (positions.length > 0) {
          drawShape(gl, state, positions, fill, opacity)
        }
      }
      break
    }
  }
}

function getTextCanvas(gl: WebGLRenderingContext): HTMLCanvasElement {
  let canvas = textCanvasCache.get(gl)
  if (!canvas) {
    canvas = document.createElement('canvas')
    textCanvasCache.set(gl, canvas)
  }
  return canvas
}

function drawTextWebGL(
  gl: WebGLRenderingContext,
  state: WebGLState,
  text: string,
  x: number,
  y: number,
  fill: string,
  fontSize: number,
  fontFamily: string,
  fontWeight: string,
  textAlign: string,
  opacity: number
) {
  // Render text to 2D canvas
  const textCanvas = getTextCanvas(gl)
  const ctx = textCanvas.getContext('2d')
  if (!ctx) return

  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
  const metrics = ctx.measureText(text)
  const textWidth = Math.ceil(metrics.width) + 4
  const textHeight = Math.ceil(fontSize * 1.5)

  textCanvas.width = textWidth
  textCanvas.height = textHeight

  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
  ctx.textAlign = textAlign as CanvasTextAlign
  ctx.textBaseline = 'top'
  ctx.fillStyle = fill
  ctx.clearRect(0, 0, textWidth, textHeight)

  let drawX = 2
  if (textAlign === 'center') drawX = textWidth / 2
  else if (textAlign === 'right') drawX = textWidth - 2

  ctx.fillText(text, drawX, 2)

  // Create WebGL texture
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

  // Calculate position
  let posX = x
  if (textAlign === 'center') posX = x - textWidth / 2
  else if (textAlign === 'right') posX = x - textWidth

  const posY = y - fontSize

  // Draw textured quad
  gl.useProgram(state.textureProgram)

  gl.bindBuffer(gl.ARRAY_BUFFER, state.texPositionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    posX, posY,
    posX + textWidth, posY,
    posX, posY + textHeight,
    posX, posY + textHeight,
    posX + textWidth, posY,
    posX + textWidth, posY + textHeight
  ]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(state.texPositionLocation)
  gl.vertexAttribPointer(state.texPositionLocation, 2, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ARRAY_BUFFER, state.texCoordBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0, 0, 1, 0, 0, 1,
    0, 1, 1, 0, 1, 1
  ]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(state.texCoordLocation)
  gl.vertexAttribPointer(state.texCoordLocation, 2, gl.FLOAT, false, 0, 0)

  gl.uniform2f(state.texResolutionLocation, gl.canvas.width, gl.canvas.height)
  gl.uniform1f(state.texOpacityLocation, opacity)

  gl.drawArrays(gl.TRIANGLES, 0, 6)

  gl.deleteTexture(texture)
}

// Simple SVG path parser - supports M, L, H, V, Z commands
function parseSVGPath(d: string): number[] {
  const positions: number[] = []
  const commands = d.match(/[MLHVCSQTAZ][^MLHVCSQTAZ]*/gi) || []

  let x = 0, y = 0
  let startX = 0, startY = 0
  const points: [number, number][] = []

  for (const cmd of commands) {
    const type = cmd[0].toUpperCase()
    const isRelative = cmd[0] === cmd[0].toLowerCase()
    const nums = cmd.slice(1).trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n))

    switch (type) {
      case 'M':
        x = isRelative ? x + nums[0] : nums[0]
        y = isRelative ? y + nums[1] : nums[1]
        startX = x
        startY = y
        points.push([x, y])
        break
      case 'L':
        x = isRelative ? x + nums[0] : nums[0]
        y = isRelative ? y + nums[1] : nums[1]
        points.push([x, y])
        break
      case 'H':
        x = isRelative ? x + nums[0] : nums[0]
        points.push([x, y])
        break
      case 'V':
        y = isRelative ? y + nums[0] : nums[0]
        points.push([x, y])
        break
      case 'Z':
        x = startX
        y = startY
        break
    }
  }

  // Triangulate polygon (simple ear clipping for convex polygons)
  if (points.length >= 3) {
    for (let i = 1; i < points.length - 1; i++) {
      positions.push(points[0][0], points[0][1])
      positions.push(points[i][0], points[i][1])
      positions.push(points[i + 1][0], points[i + 1][1])
    }
  }

  return positions
}
