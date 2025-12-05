<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { state } from 'flexium/core'

const container = ref(null)
let frameId = null

onMounted(() => {
  if (!container.value) return

  // State
  const [mouseX, setMouseX] = state(150)
  const [mouseY, setMouseY] = state(150)
  const [hue, setHue] = state(0)
  const [particles, setParticles] = state([])

  // Build DOM directly (Vue handles the wrapper)
  const wrapper = document.createElement('div')
  wrapper.style.cssText = 'padding: 24px; background: #f9fafb; border-radius: 12px; max-width: 400px; margin: 0 auto; text-align: center;'

  const title = document.createElement('h3')
  title.textContent = 'Canvas Animation'
  title.style.cssText = 'margin: 0 0 16px; color: #374151;'

  const desc = document.createElement('p')
  desc.textContent = 'Move your mouse over the canvas'
  desc.style.cssText = 'margin: 0 0 16px; color: #6b7280; font-size: 14px;'

  const canvas = document.createElement('canvas')
  canvas.width = 300
  canvas.height = 300
  canvas.style.cssText = 'background: #1a1a2e; border-radius: 12px; cursor: crosshair; display: block; margin: 0 auto;'

  wrapper.appendChild(title)
  wrapper.appendChild(desc)
  wrapper.appendChild(canvas)
  container.value.appendChild(wrapper)

  const ctx = canvas.getContext('2d')

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setMouseX(x)
    setMouseY(y)

    setParticles(prev => [...prev.slice(-20), {
      x, y,
      size: Math.random() * 10 + 5,
      hue: hue()
    }])
  })

  // Animation loop
  const animate = () => {
    setHue(h => (h + 1) % 360)

    if (ctx) {
      ctx.fillStyle = 'rgba(26, 26, 46, 0.1)'
      ctx.fillRect(0, 0, 300, 300)

      // Draw particles
      const pts = particles()
      pts.forEach((p, i) => {
        const alpha = (i + 1) / pts.length
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${alpha})`
        ctx.fill()
      })

      // Draw main circle
      ctx.beginPath()
      ctx.arc(mouseX(), mouseY(), 20, 0, Math.PI * 2)
      ctx.fillStyle = `hsl(${hue()}, 70%, 60%)`
      ctx.fill()

      ctx.beginPath()
      ctx.arc(mouseX(), mouseY(), 30, 0, Math.PI * 2)
      ctx.strokeStyle = `hsla(${hue()}, 70%, 60%, 0.5)`
      ctx.lineWidth = 3
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
