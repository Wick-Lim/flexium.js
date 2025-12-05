---
title: Drawing App Example - Interactive Canvas
description: Build an interactive drawing application with Flexium's Canvas API. Learn mouse tracking, path drawing, and canvas tools.
head:
  - - meta
    - property: og:title
      content: Drawing App Example - Flexium Canvas
  - - meta
    - property: og:description
      content: Interactive drawing application using Flexium's declarative canvas API. Mouse tracking, paths, and drawing tools.
---

# Drawing App Example

Build an interactive drawing application with Flexium's Canvas API.

## Basic Drawing App

```tsx
import { state } from 'flexium/core'
import { Canvas, Path, Circle } from 'flexium/canvas'
import { Column, Row, Text, Pressable } from 'flexium/primitives'

interface Point {
  x: number
  y: number
}

interface Stroke {
  points: Point[]
  color: string
  width: number
}

function DrawingApp() {
  const [strokes, setStrokes] = state<Stroke[]>([])
  const [currentStroke, setCurrentStroke] = state<Point[]>([])
  const [isDrawing, setIsDrawing] = state(false)
  const [color, setColor] = state('#646cff')
  const [strokeWidth, setStrokeWidth] = state(3)

  const startDrawing = (e: MouseEvent) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    setIsDrawing(true)
    setCurrentStroke([point])
  }

  const draw = (e: MouseEvent) => {
    if (!isDrawing()) return
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    setCurrentStroke(prev => [...prev, point])
  }

  const stopDrawing = () => {
    if (isDrawing() && currentStroke().length > 1) {
      setStrokes(prev => [...prev, {
        points: currentStroke(),
        color: color(),
        width: strokeWidth()
      }])
    }
    setIsDrawing(false)
    setCurrentStroke([])
  }

  const clear = () => setStrokes([])

  const pointsToPath = (points: Point[]) => {
    if (points.length < 2) return ''
    return points.reduce((path, point, i) => {
      return i === 0
        ? `M ${point.x} ${point.y}`
        : `${path} L ${point.x} ${point.y}`
    }, '')
  }

  const colors = ['#646cff', '#ff6b6b', '#4ecdc4', '#ffd93d', '#333']

  return (
    <Column gap={16}>
      <Row gap={8} style={{ alignItems: 'center' }}>
        <Text>Color:</Text>
        {colors.map(c => (
          <Pressable onPress={() => setColor(c)}>
            <div style={{
              width: '30px',
              height: '30px',
              background: c,
              border: color() === c ? '3px solid black' : '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }} />
          </Pressable>
        ))}

        <Text style={{ marginLeft: '16px' }}>Width:</Text>
        <input
          type="range"
          min="1"
          max="20"
          value={strokeWidth()}
          oninput={(e) => setStrokeWidth(Number(e.target.value))}
        />
        <Text>{strokeWidth()}px</Text>

        <Pressable onPress={clear}>
          <Text style={{
            marginLeft: '16px',
            padding: '8px 16px',
            background: '#ff6b6b',
            color: 'white',
            borderRadius: '4px'
          }}>
            Clear
          </Text>
        </Pressable>
      </Row>

      <Canvas
        width={600}
        height={400}
        style={{
          border: '2px solid #ccc',
          background: 'white',
          cursor: 'crosshair'
        }}
        onmousedown={startDrawing}
        onmousemove={draw}
        onmouseup={stopDrawing}
        onmouseleave={stopDrawing}
      >
        {/* Completed strokes */}
        {strokes().map(stroke => (
          <Path
            d={pointsToPath(stroke.points)}
            stroke={stroke.color}
            strokeWidth={stroke.width}
            fill="none"
            lineCap="round"
            lineJoin="round"
          />
        ))}

        {/* Current stroke being drawn */}
        {currentStroke().length > 1 && (
          <Path
            d={pointsToPath(currentStroke())}
            stroke={color()}
            strokeWidth={strokeWidth()}
            fill="none"
            lineCap="round"
            lineJoin="round"
          />
        )}
      </Canvas>
    </Column>
  )
}
```

## With Undo/Redo

```tsx
import { state } from 'flexium/core'
import { Canvas, Path } from 'flexium/canvas'
import { Column, Row, Text, Pressable } from 'flexium/primitives'

interface Point {
  x: number
  y: number
}

interface Stroke {
  points: Point[]
  color: string
  width: number
}

function DrawingAppWithHistory() {
  const [strokes, setStrokes] = state<Stroke[]>([])
  const [currentStroke, setCurrentStroke] = state<Point[]>([])
  const [isDrawing, setIsDrawing] = state(false)
  const [history, setHistory] = state<Stroke[][]>([[]])
  const [historyIndex, setHistoryIndex] = state(0)
  const [color, setColor] = state('#646cff')
  const [strokeWidth, setStrokeWidth] = state(3)

  const pointsToPath = (points: Point[]) => {
    if (points.length < 2) return ''
    return points.reduce((path, point, i) => {
      return i === 0 ? `M ${point.x} ${point.y}` : `${path} L ${point.x} ${point.y}`
    }, '')
  }

  const startDrawing = (e: MouseEvent) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    setIsDrawing(true)
    setCurrentStroke([point])
  }

  const draw = (e: MouseEvent) => {
    if (!isDrawing()) return
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    setCurrentStroke(prev => [...prev, point])
  }

  const stopDrawing = () => {
    if (isDrawing() && currentStroke().length > 1) {
      const newStroke = { points: currentStroke(), color: color(), width: strokeWidth() }
      const newStrokes = [...strokes(), newStroke]
      setStrokes(newStrokes)

      // Add to history, removing any redo states
      const newHistory = history().slice(0, historyIndex() + 1)
      newHistory.push(newStrokes)
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }
    setIsDrawing(false)
    setCurrentStroke([])
  }

  const undo = () => {
    if (historyIndex() > 0) {
      const newIndex = historyIndex() - 1
      setHistoryIndex(newIndex)
      setStrokes(history()[newIndex])
    }
  }

  const redo = () => {
    if (historyIndex() < history().length - 1) {
      const newIndex = historyIndex() + 1
      setHistoryIndex(newIndex)
      setStrokes(history()[newIndex])
    }
  }

  const clear = () => {
    setStrokes([])
    setHistory([[]])
    setHistoryIndex(0)
  }

  const [canUndo] = state(() => historyIndex() > 0)
  const [canRedo] = state(() => historyIndex() < history().length - 1)

  const colors = ['#646cff', '#ff6b6b', '#4ecdc4', '#ffd93d', '#333']

  return (
    <Column gap={16}>
      <Row gap={8} style={{ alignItems: 'center' }}>
        <Pressable onPress={undo}>
          <Text style={{
            padding: '8px 16px',
            background: canUndo() ? '#646cff' : '#ccc',
            color: 'white',
            borderRadius: '4px',
            opacity: canUndo() ? 1 : 0.5
          }}>
            Undo
          </Text>
        </Pressable>
        <Pressable onPress={redo}>
          <Text style={{
            padding: '8px 16px',
            background: canRedo() ? '#646cff' : '#ccc',
            color: 'white',
            borderRadius: '4px',
            opacity: canRedo() ? 1 : 0.5
          }}>
            Redo
          </Text>
        </Pressable>
        <Pressable onPress={clear}>
          <Text style={{
            padding: '8px 16px',
            background: '#ff6b6b',
            color: 'white',
            borderRadius: '4px'
          }}>
            Clear
          </Text>
        </Pressable>

        <Text style={{ marginLeft: '16px' }}>Color:</Text>
        {colors.map(c => (
          <Pressable onPress={() => setColor(c)}>
            <div style={{
              width: '24px',
              height: '24px',
              background: c,
              border: color() === c ? '2px solid black' : '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }} />
          </Pressable>
        ))}
      </Row>

      <Canvas
        width={600}
        height={400}
        style={{
          border: '2px solid #ccc',
          background: 'white',
          cursor: 'crosshair'
        }}
        onmousedown={startDrawing}
        onmousemove={draw}
        onmouseup={stopDrawing}
        onmouseleave={stopDrawing}
      >
        {/* Completed strokes */}
        {strokes().map(stroke => (
          <Path
            d={pointsToPath(stroke.points)}
            stroke={stroke.color}
            strokeWidth={stroke.width}
            fill="none"
            lineCap="round"
            lineJoin="round"
          />
        ))}

        {/* Current stroke being drawn */}
        {currentStroke().length > 1 && (
          <Path
            d={pointsToPath(currentStroke())}
            stroke={color()}
            strokeWidth={strokeWidth()}
            fill="none"
            lineCap="round"
            lineJoin="round"
          />
        )}
      </Canvas>

      <Text style={{ color: '#666' }}>
        History: {historyIndex() + 1} / {history().length}
      </Text>
    </Column>
  )
}
```

## Key Concepts

- **Path Drawing**: Converting point arrays to SVG-like path commands
- **Mouse Events**: Tracking mousedown, mousemove, mouseup for drawing
- **State Management**: Managing stroke history for undo/redo
- **Reactive Canvas**: Real-time rendering as user draws
