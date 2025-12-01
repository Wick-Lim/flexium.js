---
title: Charts Example - Data Visualization
description: Create interactive charts and data visualizations with Flexium's Canvas API. Bar charts, line graphs, and pie charts.
head:
  - - meta
    - property: og:title
      content: Charts Example - Flexium Canvas
  - - meta
    - property: og:description
      content: Build beautiful data visualizations with Flexium. Bar charts, line graphs, pie charts with reactive data binding.
---

# Charts Example

Create interactive data visualizations with Flexium's Canvas API.

## Bar Chart

```tsx
import { state } from 'flexium'
import { Canvas, Rect, Line, CanvasText } from 'flexium'
import { Column, Row, Text, Pressable } from 'flexium'

interface DataPoint {
  label: string
  value: number
  color: string
}

function BarChart() {
  const [data, setData] = state<DataPoint[]>([
    { label: 'Jan', value: 65, color: '#646cff' },
    { label: 'Feb', value: 45, color: '#4ecdc4' },
    { label: 'Mar', value: 78, color: '#ff6b6b' },
    { label: 'Apr', value: 52, color: '#ffd93d' },
    { label: 'May', value: 88, color: '#646cff' },
    { label: 'Jun', value: 71, color: '#4ecdc4' }
  ])

  const width = 500
  const height = 300
  const padding = 40
  const barWidth = (width - padding * 2) / data().length - 10

  const [maxValue] = state(() => Math.max(...data().map(d => d.value)))

  const scaleY = (value: number) => {
    return height - padding - (value / maxValue()) * (height - padding * 2)
  }

  const randomizeData = () => {
    setData(prev => prev.map(d => ({
      ...d,
      value: Math.floor(Math.random() * 100)
    })))
  }

  return (
    <Column gap={16}>
      <Pressable onPress={randomizeData}>
        <Text style={{ padding: '8px 16px', background: '#646cff', color: 'white' }}>
          Randomize Data
        </Text>
      </Pressable>

      <Canvas width={width} height={height} style={{ background: '#f5f5f5' }}>
        {/* Y-axis */}
        <Line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#333"
          strokeWidth={2}
        />

        {/* X-axis */}
        <Line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#333"
          strokeWidth={2}
        />

        {/* Bars */}
        {data().map((d, i) => {
          const x = padding + 10 + i * (barWidth + 10)
          const barHeight = (d.value / maxValue()) * (height - padding * 2)

          return (
            <>
              <Rect
                x={x}
                y={scaleY(d.value)}
                width={barWidth}
                height={barHeight}
                fill={d.color}
              />
              <CanvasText
                x={x + barWidth / 2}
                y={height - padding + 20}
                text={d.label}
                fontSize={12}
                textAlign="center"
                fill="#333"
              />
              <CanvasText
                x={x + barWidth / 2}
                y={scaleY(d.value) - 10}
                text={String(d.value)}
                fontSize={12}
                textAlign="center"
                fill="#333"
              />
            </>
          )
        })}
      </Canvas>
    </Column>
  )
}
```

## Line Chart

```tsx
function LineChart() {
  const [data] = state([
    { x: 0, y: 30 },
    { x: 1, y: 45 },
    { x: 2, y: 35 },
    { x: 3, y: 60 },
    { x: 4, y: 55 },
    { x: 5, y: 75 },
    { x: 6, y: 65 }
  ])

  const width = 500
  const height = 300
  const padding = 40

  const [maxY] = state(() => Math.max(...data().map(d => d.y)))

  const scaleX = (x: number) => padding + (x / 6) * (width - padding * 2)
  const scaleY = (y: number) => height - padding - (y / maxY()) * (height - padding * 2)

  // Generate path for line
  const [linePath] = state(() => {
    return data().reduce((path, point, i) => {
      const x = scaleX(point.x)
      const y = scaleY(point.y)
      return i === 0 ? `M ${x} ${y}` : `${path} L ${x} ${y}`
    }, '')
  })

  return (
    <Canvas width={width} height={height} style={{ background: '#f5f5f5' }}>
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map(v => (
        <Line
          x1={padding}
          y1={scaleY(v * maxY() / 100)}
          x2={width - padding}
          y2={scaleY(v * maxY() / 100)}
          stroke="#ddd"
          strokeWidth={1}
        />
      ))}

      {/* Line */}
      <Path
        d={linePath()}
        stroke="#646cff"
        strokeWidth={3}
        fill="none"
      />

      {/* Data points */}
      {data().map(point => (
        <Circle
          x={scaleX(point.x)}
          y={scaleY(point.y)}
          radius={5}
          fill="#646cff"
        />
      ))}
    </Canvas>
  )
}
```

## Pie Chart

```tsx
function PieChart() {
  const [data] = state([
    { label: 'Product A', value: 35, color: '#646cff' },
    { label: 'Product B', value: 25, color: '#4ecdc4' },
    { label: 'Product C', value: 20, color: '#ff6b6b' },
    { label: 'Product D', value: 20, color: '#ffd93d' }
  ])

  const centerX = 200
  const centerY = 150
  const radius = 100

  const [total] = state(() => data().reduce((sum, d) => sum + d.value, 0))

  // Calculate arc paths
  const [arcs] = state(() => {
    let startAngle = -Math.PI / 2
    return data().map(d => {
      const angle = (d.value / total()) * Math.PI * 2
      const endAngle = startAngle + angle

      const x1 = centerX + Math.cos(startAngle) * radius
      const y1 = centerY + Math.sin(startAngle) * radius
      const x2 = centerX + Math.cos(endAngle) * radius
      const y2 = centerY + Math.sin(endAngle) * radius

      const largeArc = angle > Math.PI ? 1 : 0
      const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`

      const result = { ...d, path, startAngle, endAngle }
      startAngle = endAngle
      return result
    })
  })

  return (
    <Column gap={16}>
      <Canvas width={400} height={300} style={{ background: '#f5f5f5' }}>
        {arcs().map(arc => (
          <Path d={arc.path} fill={arc.color} stroke="white" strokeWidth={2} />
        ))}
      </Canvas>

      {/* Legend */}
      <Row gap={16} style={{ flexWrap: 'wrap' }}>
        {data().map(d => (
          <Row gap={8} style={{ alignItems: 'center' }}>
            <div style={{
              width: '16px',
              height: '16px',
              background: d.color,
              borderRadius: '2px'
            }} />
            <Text>{d.label}: {d.value}%</Text>
          </Row>
        ))}
      </Row>
    </Column>
  )
}
```

## Key Concepts

- **Coordinate Scaling**: Converting data values to canvas coordinates
- **Path Generation**: Building SVG-like paths for lines and arcs
- **Computed Values**: Using derived state for max values and paths
- **Dynamic Updates**: Reactively updating charts when data changes
