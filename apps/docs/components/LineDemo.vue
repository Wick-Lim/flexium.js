<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { state } from 'flexium/core'

const container = ref(null)
let frameId = null

onMounted(() => {
  if (!container.value) return

  // State
  const [strokeWidth, setStrokeWidth] = state(3)
  const [lineCap, setLineCap] = state('round')
  const [points, setPoints] = state([])
  const [time, setTime] = state(0)
  const [isDrawing, setIsDrawing] = state(false)

  // Build DOM
  const wrapper = document.createElement('div')
  wrapper.style.cssText = 'padding: 24px; background: #f9fafb; border-radius: 12px; width: 100%; max-width: 100%; box-sizing: border-box;'

  const title = document.createElement('h3')
  title.textContent = 'Line Demo'
  title.style.cssText = 'margin: 0 0 8px; color: #374151;'

  const desc = document.createElement('p')
  desc.textContent = 'Click and drag to draw lines, or watch the animation'
  desc.style.cssText = 'margin: 0 0 16px; color: #6b7280; font-size: 14px;'

  const canvasWrapper = document.createElement('div')
  canvasWrapper.style.cssText = 'text-align: center; margin-bottom: 16px;'

  const canvas = document.createElement('canvas')
  canvas.width = 400
  canvas.height = 300
  canvas.style.cssText = 'background: #1a1a2e; border-radius: 8px; display: inline-block; cursor: crosshair;'

  canvasWrapper.appendChild(canvas)

  const controls = document.createElement('div')
  controls.style.cssText = 'display: flex; flex-direction: column; gap: 12px; max-width: 600px; margin: 0 auto;'

  const createSlider = (label, value, min, max, step, onChange) => {
    const div = document.createElement('div')
    div.style.cssText = 'display: flex; flex-direction: column; gap: 4px;'

    const labelEl = document.createElement('label')
    labelEl.textContent = label
    labelEl.style.cssText = 'color: #374151; font-size: 13px; font-weight: 500;'

    const input = document.createElement('input')
    input.type = 'range'
    input.min = min
    input.max = max
    input.step = step
    input.value = value
    input.style.cssText = 'width: 100%;'

    const valueEl = document.createElement('span')
    valueEl.textContent = value
    valueEl.style.cssText = 'color: #6b7280; font-size: 12px;'

    input.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value)
      valueEl.textContent = val
      onChange(val)
    })

    div.appendChild(labelEl)
    div.appendChild(input)
    div.appendChild(valueEl)
    return div
  }

  const createButtonGroup = () => {
    const div = document.createElement('div')
    div.style.cssText = 'display: flex; gap: 8px; justify-content: center;'

    const capOptions = [
      { label: 'Round', value: 'round' },
      { label: 'Square', value: 'butt' },
      { label: 'Project', value: 'square' }
    ]

    capOptions.forEach(option => {
      const btn = document.createElement('button')
      btn.textContent = option.label
      btn.style.cssText = `
        padding: 8px 16px;
        border: 2px solid #d1d5db;
        background: ${option.value === lineCap() ? '#3b82f6' : '#ffffff'};
        color: ${option.value === lineCap() ? '#ffffff' : '#374151'};
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s;
      `

      btn.addEventListener('click', () => {
        setLineCap(option.value)
        // Update all button styles
        Array.from(div.children).forEach((b, i) => {
          b.style.background = capOptions[i].value === option.value ? '#3b82f6' : '#ffffff'
          b.style.color = capOptions[i].value === option.value ? '#ffffff' : '#374151'
        })
      })

      div.appendChild(btn)
    })

    const clearBtn = document.createElement('button')
    clearBtn.textContent = 'Clear'
    clearBtn.style.cssText = `
      padding: 8px 16px;
      border: 2px solid #ef4444;
      background: #ffffff;
      color: #ef4444;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      margin-left: auto;
    `
    clearBtn.addEventListener('click', () => setPoints([]))
    div.appendChild(clearBtn)

    return div
  }

  const sliderDiv = document.createElement('div')
  sliderDiv.appendChild(createSlider('Line Width', strokeWidth(), 1, 20, 0.5, setStrokeWidth))

  const buttonDiv = createButtonGroup()

  controls.appendChild(sliderDiv)
  controls.appendChild(buttonDiv)

  wrapper.appendChild(title)
  wrapper.appendChild(desc)
  wrapper.appendChild(canvasWrapper)
  wrapper.appendChild(controls)
  container.value.appendChild(wrapper)

  const ctx = canvas.getContext('2d')

  // Drawing interaction
  canvas.addEventListener('mousedown', (e) => {
    setIsDrawing(true)
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setPoints([[x, y]])
  })

  canvas.addEventListener('mousemove', (e) => {
    if (isDrawing()) {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setPoints(prev => [...prev, [x, y]])
    }
  })

  canvas.addEventListener('mouseup', () => setIsDrawing(false))
  canvas.addEventListener('mouseleave', () => setIsDrawing(false))

  // Animation loop
  const animate = () => {
    setTime(t => t + 0.02)

    if (ctx) {
      // Clear canvas
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, 400, 300)

      const currentTime = time()
      const currentStrokeWidth = strokeWidth()
      const currentLineCap = lineCap()

      // Draw animated wave pattern
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'

      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        for (let x = 0; x <= 400; x += 5) {
          const y = 150 + Math.sin(x * 0.02 + currentTime + i) * (20 + i * 10)
          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
      }

      // Draw connecting lines pattern
      const nodeCount = 8
      const nodes = []
      for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 2 + currentTime * 0.5
        const radius = 80 + Math.sin(currentTime + i) * 20
        nodes.push({
          x: 200 + Math.cos(angle) * radius,
          y: 150 + Math.sin(angle) * radius
        })
      }

      // Draw lines between nodes
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)'
      ctx.lineWidth = 1
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const distance = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y)
          if (distance < 120) {
            const alpha = (1 - distance / 120) * 0.5
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`
            ctx.stroke()
          }
        }
      }

      // Draw nodes
      nodes.forEach((node, i) => {
        ctx.beginPath()
        ctx.arc(node.x, node.y, 4, 0, Math.PI * 2)
        ctx.fillStyle = `hsl(${(i * 45 + currentTime * 50) % 360}, 70%, 60%)`
        ctx.fill()
      })

      // Draw user-drawn lines
      const currentPoints = points()
      if (currentPoints.length > 1) {
        ctx.lineCap = currentLineCap
        ctx.lineWidth = currentStrokeWidth
        ctx.strokeStyle = '#4ade80'

        ctx.beginPath()
        ctx.moveTo(currentPoints[0][0], currentPoints[0][1])
        for (let i = 1; i < currentPoints.length; i++) {
          ctx.lineTo(currentPoints[i][0], currentPoints[i][1])
        }
        ctx.stroke()

        // Draw points along the line
        currentPoints.forEach((point, i) => {
          if (i % 5 === 0) {
            ctx.beginPath()
            ctx.arc(point[0], point[1], 3, 0, Math.PI * 2)
            ctx.fillStyle = '#4ade80'
            ctx.fill()
          }
        })
      }

      // Draw line cap examples in corner
      const exampleY = 30
      const capExamples = [
        { cap: 'butt', x: 50, label: 'butt' },
        { cap: 'round', x: 150, label: 'round' },
        { cap: 'square', x: 250, label: 'square' }
      ]

      capExamples.forEach(example => {
        ctx.lineCap = example.cap
        ctx.lineWidth = 15
        ctx.strokeStyle = currentLineCap === example.cap ? '#f59e0b' : 'rgba(255, 255, 255, 0.3)'

        ctx.beginPath()
        ctx.moveTo(example.x - 30, exampleY)
        ctx.lineTo(example.x + 30, exampleY)
        ctx.stroke()

        // Draw endpoint markers
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(example.x - 30, exampleY - 12)
        ctx.lineTo(example.x - 30, exampleY + 12)
        ctx.moveTo(example.x + 30, exampleY - 12)
        ctx.lineTo(example.x + 30, exampleY + 12)
        ctx.stroke()

        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.font = '11px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(example.label, example.x, exampleY + 25)
      })
    }

    frameId = requestAnimationFrame(animate)
  }

  animate()
})

onUnmounted(() => {
  if (frameId) cancelAnimationFrame(frameId)
  if (container.value) {
    container.value.innerHTML = ''
  }
})
</script>

<template>
  <div class="demo-wrapper">
    <div ref="container"></div>
  </div>
</template>

<style scoped>
.demo-wrapper {
  margin: 20px 0;
}
</style>
