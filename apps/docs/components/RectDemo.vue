<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { state } from 'flexium/core'

const container = ref(null)
let frameId = null

onMounted(() => {
  if (!container.value) return

  // State
  const [x, setX] = state(50)
  const [y, setY] = state(50)
  const [width, setWidth] = state(100)
  const [height, setHeight] = state(60)
  const [rotation, setRotation] = state(0)
  const [hue, setHue] = state(200)

  // Build DOM
  const wrapper = document.createElement('div')
  wrapper.style.cssText = 'padding: 24px; background: #f9fafb; border-radius: 12px; width: 100%; max-width: 100%; box-sizing: border-box;'

  const title = document.createElement('h3')
  title.textContent = 'Rectangle Demo'
  title.style.cssText = 'margin: 0 0 8px; color: #374151;'

  const desc = document.createElement('p')
  desc.textContent = 'Interactive rectangle with controls'
  desc.style.cssText = 'margin: 0 0 16px; color: #6b7280; font-size: 14px;'

  const canvasWrapper = document.createElement('div')
  canvasWrapper.style.cssText = 'text-align: center; margin-bottom: 16px;'

  const canvas = document.createElement('canvas')
  canvas.width = 400
  canvas.height = 300
  canvas.style.cssText = 'background: #1a1a2e; border-radius: 8px; display: inline-block; cursor: move;'

  canvasWrapper.appendChild(canvas)

  const controls = document.createElement('div')
  controls.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; max-width: 600px; margin: 0 auto;'

  const createControl = (label, value, min, max, step, onChange) => {
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

  controls.appendChild(createControl('X Position', x(), 0, 300, 1, setX))
  controls.appendChild(createControl('Y Position', y(), 0, 240, 1, setY))
  controls.appendChild(createControl('Width', width(), 20, 300, 1, setWidth))
  controls.appendChild(createControl('Height', height(), 20, 200, 1, setHeight))
  controls.appendChild(createControl('Rotation', rotation(), 0, 360, 1, setRotation))
  controls.appendChild(createControl('Color (Hue)', hue(), 0, 360, 1, setHue))

  wrapper.appendChild(title)
  wrapper.appendChild(desc)
  wrapper.appendChild(canvasWrapper)
  wrapper.appendChild(controls)
  container.value.appendChild(wrapper)

  const ctx = canvas.getContext('2d')

  // Drag functionality
  let isDragging = false
  let dragOffsetX = 0
  let dragOffsetY = 0

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const currentX = x()
    const currentY = y()
    const currentWidth = width()
    const currentHeight = height()

    if (mouseX >= currentX && mouseX <= currentX + currentWidth &&
        mouseY >= currentY && mouseY <= currentY + currentHeight) {
      isDragging = true
      dragOffsetX = mouseX - currentX
      dragOffsetY = mouseY - currentY
    }
  })

  canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      setX(Math.max(0, Math.min(300, mouseX - dragOffsetX)))
      setY(Math.max(0, Math.min(240, mouseY - dragOffsetY)))
    }
  })

  canvas.addEventListener('mouseup', () => {
    isDragging = false
  })

  canvas.addEventListener('mouseleave', () => {
    isDragging = false
  })

  // Animation loop
  const animate = () => {
    if (ctx) {
      // Clear canvas
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, 400, 300)

      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.lineWidth = 1
      for (let i = 0; i < 400; i += 20) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, 300)
        ctx.stroke()
      }
      for (let i = 0; i < 300; i += 20) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(400, i)
        ctx.stroke()
      }

      // Draw rectangles with different styles
      const currentX = x()
      const currentY = y()
      const currentWidth = width()
      const currentHeight = height()
      const currentRotation = rotation()
      const currentHue = hue()

      // Shadow rectangle
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.fillRect(currentX + 4, currentY + 4, currentWidth, currentHeight)

      // Main rectangle with rotation
      ctx.save()
      ctx.translate(currentX + currentWidth / 2, currentY + currentHeight / 2)
      ctx.rotate((currentRotation * Math.PI) / 180)

      // Filled rectangle
      ctx.fillStyle = `hsl(${currentHue}, 70%, 60%)`
      ctx.fillRect(-currentWidth / 2, -currentHeight / 2, currentWidth, currentHeight)

      // Stroked rectangle
      ctx.strokeStyle = `hsl(${currentHue}, 70%, 80%)`
      ctx.lineWidth = 3
      ctx.strokeRect(-currentWidth / 2, -currentHeight / 2, currentWidth, currentHeight)

      ctx.restore()

      // Draw additional decorative rectangles
      ctx.globalAlpha = 0.3
      ctx.fillStyle = `hsl(${currentHue}, 70%, 70%)`
      ctx.fillRect(10, 10, 40, 30)
      ctx.fillStyle = `hsl(${(currentHue + 120) % 360}, 70%, 70%)`
      ctx.fillRect(350, 10, 40, 30)
      ctx.fillStyle = `hsl(${(currentHue + 240) % 360}, 70%, 70%)`
      ctx.fillRect(10, 260, 40, 30)
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
