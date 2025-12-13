<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { state } from 'flexium/core'
import { f, render } from 'flexium/dom'

const container = ref(null)
let cleanup = null

// Flexium Counter Component Logic
function Counter() {
  const [count, setCount] = state(0)
  const [doubled] = state(() => count * 2)

  const containerNode = f('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '24px',
      padding: '40px',
      background: '#f9fafb',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box',
      border: '1px solid #e5e7eb'
    }
  }, [
    // Title
    f('h1', {
      style: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#4f46e5',
        marginBottom: '8px',
        marginTop: '0'
      }
    }, ['Flexium Playground']),

    // Count display
    f('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }
    }, [
      f('div', {
        style: {
          fontSize: '14px',
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontWeight: '600'
        }
      }, ['Current Count']),

      f('div', {
        style: {
          fontSize: '72px',
          fontWeight: '800',
          color: '#111827',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: '1'
        }
      }, [count])
    ]),

    // Doubled display
    f('div', {
      style: {
        fontSize: '18px',
        color: '#4b5563',
        background: '#eff6ff',
        padding: '8px 16px',
        borderRadius: '9999px',
        fontWeight: '500'
      }
    }, [
      'Doubled: ',
      f('span', {
        style: { fontWeight: 'bold', color: '#2563eb' }
      }, [doubled])
    ]),

    // Buttons
    f('div', {
      style: {
        display: 'flex',
        gap: '12px',
        marginTop: '16px'
      }
    }, [
      f('button', {
        onclick: () => { setCount(c => c - 1) },
        style: {
          padding: '12px 24px',
          borderRadius: '8px',
          border: 'none',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          background: '#ef4444',
          color: 'white',
          transition: 'all 0.2s',
          boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
        }
      }, ['- Decrement']),

      f('button', {
        onclick: () => { setCount(0) },
        style: {
          padding: '12px 24px',
          borderRadius: '8px',
          border: 'none',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          background: '#9ca3af',
          color: 'white',
          transition: 'all 0.2s'
        }
      }, ['Reset']),

      f('button', {
        onclick: () => { setCount(c => c + 1) },
        style: {
          padding: '12px 24px',
          borderRadius: '8px',
          border: 'none',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          background: '#10b981',
          color: 'white',
          transition: 'all 0.2s',
          boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
        }
      }, ['+ Increment'])
    ]),
    
    f('p', {
        style: {
            marginTop: '1rem',
            color: '#6b7280',
            fontSize: '0.875rem'
        }
    }, ['This demo is running entirely with Flexium inside a Vue component container.'])
  ])

  return containerNode
}

onMounted(() => {
  if (container.value) {
    // Render Flexium app into the Vue ref container
    render(Counter, container.value)
  }
})

onUnmounted(() => {
  // In a real app we would destroy the root, but Flexium handles DOM cleanup mostly automatically
  if (container.value) {
    container.value.innerHTML = ''
  }
})
</script>

<template>
  <div class="showcase-wrapper">
    <div ref="container" class="flexium-container"></div>
  </div>
</template>

<style scoped>
.showcase-wrapper {
  margin: 40px 0;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
}

/* Ensure internal styles don't conflict too much with VitePress */
.flexium-container :deep(button:hover) {
  transform: translateY(-1px);
  filter: brightness(110%);
}

.flexium-container :deep(button:active) {
  transform: translateY(0);
  filter: brightness(90%);
}
</style>
