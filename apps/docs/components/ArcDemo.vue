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
  const [radius, setRadius] = state(60)
  const [startAngle, setStartAngle] = state(0)
  const [endAngle, setEndAngle] = state(180)
  const [time, setTime] = state(0)

  // Build DOM
  const wrapper = document.createElement('div')
  wrapper.style.cssText = 'padding: 24px; background: #f9fafb; border-radius: 12px; width: 100%; max-width: 100%; box-sizing: border-box;'

  const title = document.createElement('h3')
  title.textContent = 'Arc Demo'
  title.style.cssText = 'margin: 0 0 8px; color: #374151;'

  const desc = document.createElement('p')
  desc.textContent = 'Adjust arc angles to create different shapes'
  desc.style.cssText = 'margin: 0 0 16px; color: #6b7280; font-size: 14px;'

  const canvasWrapper = document.createElement('div')
  canvasWrapper.style.cssText = 'text-align: center; margin-bottom: 16px;'

  const canvas = document.createElement('canvas')
  canvas.width = 400
  canvas.height = 300
  canvas.style.cssText = 'background: #1a1a2e; border-radius: 8px; display: inline-block;'

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
    valueEl.textContent = `${value}°`
    valueEl.style.cssText = 'color: #6b7280; font-size: 12px;'

    input.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value)
      valueEl.textContent = `${val}°`
      onChange(val)
    })

    div.appendChild(labelEl)
    div.appendChild(input)
    div.appendChild(valueEl)
    return div
  }

  controls.appendChild(createControl('Center X', centerX(), 60, 340, 1, (v) => {
    setCenterX(v)
    controls.children[0].querySelector('span').textContent = v
  }))
  controls.appendChild(createControl('Center Y', centerY(), 60, 240, 1, (v) => {
    setCenterY(v)
    controls.children[1].querySelector('span').textContent = v
  }))
  controls.appendChild(createControl('Radius', radius(), 20, 100, 1, (v) => {
    setRadius(v)
    controls.children[2].querySelector('span').textContent = v
  }))
  controls.appendChild(createControl('Start Angle', startAngle(), 0, 360, 1, setStartAngle))
  controls.appendChild(createControl('End Angle', endAngle(), 0, 360, 1, setEndAngle))

  // Fix the display for non-angle controls
  controls.children[0].querySelector('span').textContent = centerX()
  controls.children[1].querySelector('span').textContent = centerY()
  controls.children[2].querySelector('span').textContent = radius()

  wrapper.appendChild(title)
  wrapper.appendChild(desc)
  wrapper.appendChild(canvasWrapper)
  wrapper.appendChild(controls)
  container.value.appendChild(wrapper)

  const ctx = canvas.getContext('2d')

  // Animation loop
  const animate = () => {
    setTime(t => t + 0.02)

    if (ctx) {
      // Clear canvas
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, 400, 300)

      const currentCenterX = centerX()
      const currentCenterY = centerY()
      const currentRadius = radius()
      const currentStartAngle = (startAngle() * Math.PI) / 180
      const currentEndAngle = (endAngle() * Math.PI) / 180
      const currentTime = time()

      // Draw decorative arcs
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3
        const x = currentCenterX + Math.cos(currentTime + angle) * 80
        const y = currentCenterY + Math.sin(currentTime + angle) * 60
        const arcStart = currentTime + angle
        const arcEnd = arcStart + Math.PI / 2
        const hue = (i * 60 + currentTime * 30) % 360

        ctx.beginPath()
        ctx.arc(x, y, 20, arcStart, arcEnd)
        ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.5)`
        ctx.lineWidth = 3
        ctx.stroke()
      }

      // Draw main arc with fill
      ctx.beginPath()
      ctx.moveTo(currentCenterX, currentCenterY)
      ctx.arc(currentCenterX, currentCenterY, currentRadius, currentStartAngle, currentEndAngle)
      ctx.closePath()
      ctx.fillStyle = 'hsla(200, 70%, 60%, 0.3)'
      ctx.fill()
      ctx.strokeStyle = 'hsl(200, 70%, 70%)'
      ctx.lineWidth = 3
      ctx.stroke()

      // Draw arc outline only (no fill)
      ctx.beginPath()
      ctx.arc(currentCenterX, currentCenterY, currentRadius + 20, currentStartAngle, currentEndAngle)
      ctx.strokeStyle = 'hsl(280, 70%, 70%)'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw angle indicators
      const drawAngleIndicator = (angle, color, label) => {
        const x = currentCenterX + Math.cos(angle) * (currentRadius + 35)
        const y = currentCenterY + Math.sin(angle) * (currentRadius + 35)

        ctx.beginPath()
        ctx.moveTo(currentCenterX, currentCenterY)
        ctx.lineTo(x, y)
        ctx.strokeStyle = color
        ctx.lineWidth = 1
        ctx.setLineDash([5, 5])
        ctx.stroke()
        ctx.setLineDash([])

        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()

        ctx.fillStyle = color
        ctx.font = '12px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(label, x, y - 10)
      }

      drawAngleIndicator(currentStartAngle, '#4ade80', 'start')
      drawAngleIndicator(currentEndAngle, '#f87171', 'end')

      // Draw center point
      ctx.beginPath()
      ctx.arc(currentCenterX, currentCenterY, 3, 0, Math.PI * 2)
      ctx.fillStyle = '#ffffff'
      ctx.fill()

      // Draw gauge/progress example
      const gaugeX = 80
      const gaugeY = 260
      const gaugeRadius = 40
      const progress = ((Math.sin(currentTime) + 1) / 2) * 270

      // Background arc
      ctx.beginPath()
      ctx.arc(gaugeX, gaugeY, gaugeRadius, (Math.PI * 0.75), (Math.PI * 2.25))
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 8
      ctx.stroke()

      // Progress arc
      ctx.beginPath()
      ctx.arc(gaugeX, gaugeY, gaugeRadius, (Math.PI * 0.75), (Math.PI * 0.75) + (progress * Math.PI / 180))
      const gaugeGradient = ctx.createLinearGradient(gaugeX - gaugeRadius, gaugeY, gaugeX + gaugeRadius, gaugeY)
      gaugeGradient.addColorStop(0, '#4ade80')
      gaugeGradient.addColorStop(1, '#3b82f6')
      ctx.strokeStyle = gaugeGradient
      ctx.lineWidth = 8
      ctx.lineCap = 'round'
      ctx.stroke()

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`${Math.round((progress / 270) * 100)}%`, gaugeX, gaugeY + 5)
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
