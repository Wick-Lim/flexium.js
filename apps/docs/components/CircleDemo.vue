<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { state } from 'flexium/core'

const container = ref(null)
let frameId = null

onMounted(() => {
  if (!container.value) return

  // State
  const [centerX, setCenterX] = state(200)
  const [centerY, setCenterY] = state(150)
  const [radius, setRadius] = state(50)
  const [strokeWidth, setStrokeWidth] = state(3)
  const [ripples, setRipples] = state([])
  const [time, setTime] = state(0)

  // Build DOM
  const wrapper = document.createElement('div')
  wrapper.style.cssText = 'padding: 24px; background: #f9fafb; border-radius: 12px; width: 100%; max-width: 100%; box-sizing: border-box;'

  const title = document.createElement('h3')
  title.textContent = 'Circle Demo'
  title.style.cssText = 'margin: 0 0 8px; color: #374151;'

  const desc = document.createElement('p')
  desc.textContent = 'Click to create ripple effects'
  desc.style.cssText = 'margin: 0 0 16px; color: #6b7280; font-size: 14px;'

  const canvasWrapper = document.createElement('div')
  canvasWrapper.style.cssText = 'text-align: center; margin-bottom: 16px;'

  const canvas = document.createElement('canvas')
  canvas.width = 400
  canvas.height = 300
  canvas.style.cssText = 'background: #1a1a2e; border-radius: 8px; display: inline-block; cursor: pointer;'

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

  controls.appendChild(createControl('Center X', centerX(), 50, 350, 1, setCenterX))
  controls.appendChild(createControl('Center Y', centerY(), 50, 250, 1, setCenterY))
  controls.appendChild(createControl('Radius', radius(), 20, 120, 1, setRadius))
  controls.appendChild(createControl('Stroke Width', strokeWidth(), 1, 10, 0.5, setStrokeWidth))

  wrapper.appendChild(title)
  wrapper.appendChild(desc)
  wrapper.appendChild(canvasWrapper)
  wrapper.appendChild(controls)
  container.value.appendChild(wrapper)

  const ctx = canvas.getContext('2d')

  // Click to create ripples
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setRipples(prev => [...prev, {
      x,
      y,
      radius: 0,
      maxRadius: Math.random() * 50 + 50,
      speed: Math.random() * 2 + 1,
      hue: Math.random() * 360
    }])
  })

  // Animation loop
  const animate = () => {
    setTime(t => t + 0.02)

    if (ctx) {
      // Clear canvas
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, 400, 300)

      // Update and draw ripples
      const currentRipples = ripples()
      const updatedRipples = currentRipples
        .map(r => ({
          ...r,
          radius: r.radius + r.speed
        }))
        .filter(r => r.radius < r.maxRadius)

      setRipples(updatedRipples)

      updatedRipples.forEach(ripple => {
        const alpha = 1 - (ripple.radius / ripple.maxRadius)
        ctx.beginPath()
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `hsla(${ripple.hue}, 70%, 60%, ${alpha})`
        ctx.lineWidth = 2
        ctx.stroke()
      })

      // Draw orbiting circles
      const currentTime = time()
      const currentCenterX = centerX()
      const currentCenterY = centerY()
      const currentRadius = radius()

      for (let i = 0; i < 3; i++) {
        const angle = currentTime + (i * Math.PI * 2 / 3)
        const orbitRadius = currentRadius + 40
        const x = currentCenterX + Math.cos(angle) * orbitRadius
        const y = currentCenterY + Math.sin(angle) * orbitRadius
        const hue = (i * 120) + (currentTime * 50)

        ctx.beginPath()
        ctx.arc(x, y, 15, 0, Math.PI * 2)
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`
        ctx.fill()
        ctx.strokeStyle = `hsl(${hue}, 70%, 80%)`
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Draw main circle with pulse effect
      const pulse = Math.sin(currentTime * 3) * 5
      const mainRadius = currentRadius + pulse

      // Shadow
      ctx.beginPath()
      ctx.arc(currentCenterX + 3, currentCenterY + 3, mainRadius, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.fill()

      // Main circle fill
      const gradient = ctx.createRadialGradient(
        currentCenterX, currentCenterY, 0,
        currentCenterX, currentCenterY, mainRadius
      )
      gradient.addColorStop(0, 'hsl(280, 70%, 70%)')
      gradient.addColorStop(1, 'hsl(280, 70%, 50%)')

      ctx.beginPath()
      ctx.arc(currentCenterX, currentCenterY, mainRadius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Main circle stroke
      ctx.strokeStyle = 'hsl(280, 70%, 80%)'
      ctx.lineWidth = strokeWidth()
      ctx.stroke()

      // Inner circle
      ctx.beginPath()
      ctx.arc(currentCenterX, currentCenterY, mainRadius * 0.6, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 2
      ctx.stroke()
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
