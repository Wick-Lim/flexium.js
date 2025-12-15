<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { state, effect } from 'flexium/core'
import { f, render } from 'flexium/dom'

const container = ref(null)

function CanvasDemo() {
  let canvasRef = null
  let frameId = null
  let cleanupAnimation = null

  // Use plain variables instead of state for animation values
  let mouseX = 150
  let mouseY = 150
  let hue = 0
  let particles = []

  const handleMouseMove = (e) => {
    const rect = canvasRef.getBoundingClientRect()
    mouseX = e.clientX - rect.left
    mouseY = e.clientY - rect.top

    particles = [...particles.slice(-20), {
      x: mouseX,
      y: mouseY,
      size: Math.random() * 10 + 5,
      hue: hue
    }]
  }

  const animate = () => {
    hue = (hue + 1) % 360

    if (canvasRef) {
      const ctx = canvasRef.getContext('2d')
      ctx.fillStyle = 'rgba(26, 26, 46, 0.1)'
      ctx.fillRect(0, 0, 300, 300)

      // Draw particles
      particles.forEach((p, i) => {
        const alpha = (i + 1) / particles.length
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${alpha})`
        ctx.fill()
      })

      // Draw main circle
      ctx.beginPath()
      ctx.arc(mouseX, mouseY, 20, 0, Math.PI * 2)
      ctx.fillStyle = `hsl(${hue}, 70%, 60%)`
      ctx.fill()

      ctx.beginPath()
      ctx.arc(mouseX, mouseY, 30, 0, Math.PI * 2)
      ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.5)`
      ctx.lineWidth = 3
      ctx.stroke()
    }

    frameId = requestAnimationFrame(animate)
  }

  // Cleanup on component unmount
  effect(() => {
    return () => {
      if (cleanupAnimation) cleanupAnimation()
    }
  })

  return f('div', {
    style: {
      padding: '24px',
      background: '#f9fafb',
      borderRadius: '12px',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box',
      textAlign: 'center'
    }
  }, [
    f('h3', { style: { margin: '0 0 16px', color: '#374151' } }, ['Canvas Animation']),
    f('p', { style: { margin: '0 0 16px', color: '#6b7280', fontSize: '14px' } }, ['Move your mouse over the canvas']),
    f('canvas', {
      ref: (el) => {
        canvasRef = el
        if (el) {
          el.addEventListener('mousemove', handleMouseMove)
          // Start animation loop when canvas is created
          frameId = requestAnimationFrame(animate)
          cleanupAnimation = () => {
            if (frameId) cancelAnimationFrame(frameId)
          }
        }
      },
      width: 300,
      height: 300,
      style: {
        background: '#1a1a2e',
        borderRadius: '12px',
        cursor: 'crosshair',
        display: 'block',
        margin: '0 auto'
      }
    })
  ])
}

onMounted(() => {
  if (container.value) {
    render(CanvasDemo, container.value)
  }
})

onUnmounted(() => {
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
