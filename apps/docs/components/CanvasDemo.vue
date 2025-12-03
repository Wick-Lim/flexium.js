<script setup>
import { onMounted, ref, onUnmounted } from 'vue'

const canvasRef = ref(null)
let frameId = null
let hue = 0
let mouseX = 150
let mouseY = 150
let particles = []

const handleMouseMove = (e) => {
  const rect = e.target.getBoundingClientRect()
  mouseX = e.clientX - rect.left
  mouseY = e.clientY - rect.top

  // Add particle
  particles.push({
    x: mouseX,
    y: mouseY,
    size: Math.random() * 10 + 5,
    hue: hue
  })

  // Keep only last 20 particles
  if (particles.length > 20) {
    particles = particles.slice(-20)
  }
}

const animate = () => {
  const canvas = canvasRef.value
  if (!canvas) {
    frameId = requestAnimationFrame(animate)
    return
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    frameId = requestAnimationFrame(animate)
    return
  }

  // Update hue
  hue = (hue + 1) % 360

  // Clear with fade effect
  ctx.fillStyle = 'rgba(26, 26, 46, 0.15)'
  ctx.fillRect(0, 0, 300, 300)

  // Draw particles
  const len = particles.length
  particles.forEach((p, i) => {
    const alpha = (i + 1) / len
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${alpha})`
    ctx.fill()
  })

  // Draw outer ring
  ctx.beginPath()
  ctx.arc(mouseX, mouseY, 30, 0, Math.PI * 2)
  ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.5)`
  ctx.lineWidth = 3
  ctx.stroke()

  // Draw main cursor circle
  ctx.beginPath()
  ctx.arc(mouseX, mouseY, 20, 0, Math.PI * 2)
  ctx.fillStyle = `hsl(${hue}, 70%, 60%)`
  ctx.fill()

  frameId = requestAnimationFrame(animate)
}

onMounted(() => {
  if (canvasRef.value) {
    // Initialize canvas with dark background
    const ctx = canvasRef.value.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, 300, 300)
    }
    // Start animation
    frameId = requestAnimationFrame(animate)
  }
})

onUnmounted(() => {
  if (frameId) {
    cancelAnimationFrame(frameId)
    frameId = null
  }
})
</script>

<template>
  <div class="demo-wrapper">
    <div class="canvas-container">
      <h3>Canvas Animation</h3>
      <p>Move your mouse over the canvas</p>
      <canvas
        ref="canvasRef"
        width="300"
        height="300"
        @mousemove="handleMouseMove"
      />
    </div>
  </div>
</template>

<style scoped>
.demo-wrapper {
  margin: 20px 0;
}

.canvas-container {
  padding: 24px;
  background: #f9fafb;
  border-radius: 12px;
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}

.canvas-container h3 {
  margin: 0 0 16px;
  color: #374151;
}

.canvas-container p {
  margin: 0 0 16px;
  color: #6b7280;
  font-size: 14px;
}

.canvas-container canvas {
  background: #1a1a2e;
  border-radius: 12px;
  cursor: crosshair;
  display: block;
  margin: 0 auto;
}
</style>
