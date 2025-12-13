<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { state } from 'flexium/core'

const container = ref(null)
let frameId = null

onMounted(() => {
  if (!container.value) return

  // State
  const [scale, setScale] = state(1)
  const [rotation, setRotation] = state(0)
  const [selectedPath, setSelectedPath] = state('star')
  const [time, setTime] = state(0)

  // SVG Path definitions
  const paths = {
    star: 'M 50 10 L 61 40 L 92 40 L 67 58 L 78 88 L 50 70 L 22 88 L 33 58 L 8 40 L 39 40 Z',
    heart: 'M 50 25 C 50 15, 35 10, 25 20 C 15 30, 15 40, 25 50 L 50 75 L 75 50 C 85 40, 85 30, 75 20 C 65 10, 50 15, 50 25 Z',
    triangle: 'M 50 10 L 90 80 L 10 80 Z',
    arrow: 'M 20 50 L 60 50 L 60 30 L 90 55 L 60 80 L 60 60 L 20 60 Z',
    gear: 'M50,10 L55,20 L65,18 L63,28 L73,30 L68,40 L78,45 L70,52 L78,59 L68,64 L73,74 L63,76 L65,86 L55,84 L50,94 L45,84 L35,86 L37,76 L27,74 L32,64 L22,59 L30,52 L22,45 L32,40 L27,30 L37,28 L35,18 L45,20 Z',
    cloud: 'M 25 60 Q 25 40, 40 35 Q 40 20, 55 20 Q 70 20, 70 35 Q 85 40, 85 60 Q 85 75, 70 75 L 40 75 Q 25 75, 25 60'
  }

  // Build DOM
  const wrapper = document.createElement('div')
  wrapper.style.cssText = 'padding: 24px; background: #f9fafb; border-radius: 12px; width: 100%; max-width: 100%; box-sizing: border-box;'

  const title = document.createElement('h3')
  title.textContent = 'Path Demo'
  title.style.cssText = 'margin: 0 0 8px; color: #374151;'

  const desc = document.createElement('p')
  desc.textContent = 'Draw complex shapes using SVG path syntax'
  desc.style.cssText = 'margin: 0 0 16px; color: #6b7280; font-size: 14px;'

  const canvasWrapper = document.createElement('div')
  canvasWrapper.style.cssText = 'text-align: center; margin-bottom: 16px;'

  const canvas = document.createElement('canvas')
  canvas.width = 400
  canvas.height = 300
  canvas.style.cssText = 'background: #1a1a2e; border-radius: 8px; display: inline-block;'

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

  const createShapeButtons = () => {
    const div = document.createElement('div')
    div.style.cssText = 'display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;'

    const shapeOptions = [
      { label: 'Star', value: 'star' },
      { label: 'Heart', value: 'heart' },
      { label: 'Triangle', value: 'triangle' },
      { label: 'Arrow', value: 'arrow' },
      { label: 'Gear', value: 'gear' },
      { label: 'Cloud', value: 'cloud' }
    ]

    shapeOptions.forEach(option => {
      const btn = document.createElement('button')
      btn.textContent = option.label
      btn.style.cssText = `
        padding: 8px 16px;
        border: 2px solid #d1d5db;
        background: ${option.value === selectedPath() ? '#3b82f6' : '#ffffff'};
        color: ${option.value === selectedPath() ? '#ffffff' : '#374151'};
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s;
      `

      btn.addEventListener('click', () => {
        setSelectedPath(option.value)
        // Update all button styles
        Array.from(div.children).forEach((b, i) => {
          b.style.background = shapeOptions[i].value === option.value ? '#3b82f6' : '#ffffff'
          b.style.color = shapeOptions[i].value === option.value ? '#ffffff' : '#374151'
        })
      })

      div.appendChild(btn)
    })

    return div
  }

  const sliderContainer = document.createElement('div')
  sliderContainer.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 12px;'
  sliderContainer.appendChild(createSlider('Scale', scale, 0.5, 3, 0.1, (val) => setScale(val)))
  sliderContainer.appendChild(createSlider('Rotation', rotation, 0, 360, 1, (val) => setRotation(val)))

  const shapeButtons = createShapeButtons()

  controls.appendChild(shapeButtons)
  controls.appendChild(sliderContainer)

  wrapper.appendChild(title)
  wrapper.appendChild(desc)
  wrapper.appendChild(canvasWrapper)
  wrapper.appendChild(controls)
  container.value.appendChild(wrapper)

  const ctx = canvas.getContext('2d')

  // Helper function to parse and draw SVG path
  const drawPath = (ctx, pathData, x, y, scaleVal, rotationVal) => {
    const path = new Path2D(pathData)

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate((rotationVal * Math.PI) / 180)
    ctx.scale(scaleVal, scaleVal)
    ctx.translate(-50, -50) // Center the path (assuming 100x100 viewbox)

    ctx.fill(path)
    ctx.stroke(path)

    ctx.restore()
  }

  // Animation loop
  const animate = () => {
    setTime(t => t + 0.02)

    if (ctx) {
      // Clear canvas
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, 400, 300)

      const currentTime = time
      const currentScale = scale
      const currentRotation = rotation
      const currentPath = paths[selectedPath]

      // Draw decorative background paths
      Object.entries(paths).forEach(([key, pathData], i) => {
        const angle = (i / Object.keys(paths).length) * Math.PI * 2 + currentTime * 0.3
        const radius = 120
        const x = 200 + Math.cos(angle) * radius
        const y = 150 + Math.sin(angle) * radius
        const miniScale = 0.4 + Math.sin(currentTime + i) * 0.1
        const miniRotation = currentTime * 30 + i * 60

        ctx.globalAlpha = 0.15
        ctx.fillStyle = `hsl(${(i * 60 + currentTime * 50) % 360}, 70%, 60%)`
        ctx.strokeStyle = 'transparent'
        ctx.lineWidth = 0

        drawPath(ctx, pathData, x, y, miniScale, miniRotation)
        ctx.globalAlpha = 1
      })

      // Draw main path with gradient
      const gradient = ctx.createLinearGradient(150, 100, 250, 200)
      gradient.addColorStop(0, '#8b5cf6')
      gradient.addColorStop(0.5, '#ec4899')
      gradient.addColorStop(1, '#f59e0b')

      ctx.fillStyle = gradient
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 3
      ctx.lineJoin = 'round'

      drawPath(ctx, currentPath, 200, 150, currentScale * 2, currentRotation)

      // Draw smaller examples
      const examplePaths = Object.entries(paths)
      const exampleY = 270
      const startX = 40

      examplePaths.forEach(([key, pathData], i) => {
        const x = startX + i * 60
        const isSelected = key === selectedPath

        ctx.globalAlpha = isSelected ? 1 : 0.4
        ctx.fillStyle = isSelected ? '#3b82f6' : '#6b7280'
        ctx.strokeStyle = isSelected ? '#ffffff' : 'transparent'
        ctx.lineWidth = 2

        drawPath(ctx, pathData, x, exampleY, 0.4, 0)

        ctx.globalAlpha = 1
        ctx.fillStyle = isSelected ? '#ffffff' : '#6b7280'
        ctx.font = '10px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(key.substring(0, 4), x, exampleY + 35)
      })

      ctx.globalAlpha = 1
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
