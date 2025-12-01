<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { state, effect } from 'flexium'
import { h, render } from 'flexium/dom'

const container = ref(null)
let animationCleanup = null

function CanvasDemo() {
  const [mouseX, setMouseX] = state(150)
  const [mouseY, setMouseY] = state(150)
  const [hue, setHue] = state(0)
  const [particles, setParticles] = state([])

  const canvas = h('canvas', {
    width: 300,
    height: 300,
    onmousemove: (e) => {
      const rect = e.target.getBoundingClientRect()
      setMouseX(e.clientX - rect.left)
      setMouseY(e.clientY - rect.top)

      // Add particle
      setParticles(prev => [...prev.slice(-20), {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        size: Math.random() * 10 + 5,
        hue: hue()
      }])
    },
    style: {
      background: '#1a1a2e',
      borderRadius: '12px',
      cursor: 'crosshair',
      display: 'block',
      margin: '0 auto'
    }
  })

  // Animation loop
  let frameId
  const animate = () => {
    setHue(h => (h + 1) % 360)

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = 'rgba(26, 26, 46, 0.1)'
      ctx.fillRect(0, 0, 300, 300)

      // Draw particles
      particles().forEach((p, i) => {
        const alpha = (i + 1) / particles().length
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

  // Start animation after a small delay to ensure canvas is mounted
  setTimeout(() => {
    animate()
  }, 100)

  animationCleanup = () => {
    if (frameId) cancelAnimationFrame(frameId)
  }

  return h('div', {
    style: {
      padding: '24px',
      background: '#f9fafb',
      borderRadius: '12px',
      maxWidth: '400px',
      margin: '0 auto',
      textAlign: 'center'
    }
  }, [
    h('h3', { style: { margin: '0 0 16px', color: '#374151' } }, ['Canvas Animation']),
    h('p', { style: { margin: '0 0 16px', color: '#6b7280', fontSize: '14px' } },
      ['Move your mouse over the canvas']),
    canvas
  ])
}

onMounted(() => {
  if (container.value) {
    render(CanvasDemo(), container.value)
  }
})

onUnmounted(() => {
  if (animationCleanup) animationCleanup()
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
