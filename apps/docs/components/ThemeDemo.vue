<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { state } from 'flexium/core'
import { f, render } from 'flexium/dom'

const container = ref(null)

function ThemeDemo() {
  const [isDark, setIsDark] = state(false)
  const [primaryColor, setPrimaryColor] = state('#4f46e5')

  const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return f('div', {
    style: () => ({
      padding: '24px',
      background: isDark ? '#1f2937' : '#f9fafb',
      borderRadius: '12px',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box',
      transition: 'all 0.3s ease'
    })
  }, [
    f('h3', {
      style: () => ({
        margin: '0 0 20px',
        color: isDark ? '#f9fafb' : '#374151',
        transition: 'color 0.3s'
      })
    }, ['Theme Switcher']),

    // Theme toggle
    f('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '12px',
        background: () => isDark ? '#374151' : 'white',
        borderRadius: '8px',
        transition: 'background 0.3s'
      }
    }, [
      f('span', {
        style: () => ({
          color: isDark ? '#e5e7eb' : '#374151',
          fontWeight: '500'
        })
      }, ['Dark Mode']),
      f('button', {
        onclick: () => setIsDark(d => !d),
        style: () => ({
          width: '56px',
          height: '28px',
          borderRadius: '14px',
          border: 'none',
          background: isDark ? primaryColor : '#d1d5db',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.3s'
        })
      }, [
        f('div', {
          style: () => ({
            width: '24px',
            height: '24px',
            borderRadius: '12px',
            background: 'white',
            position: 'absolute',
            top: '2px',
            left: isDark ? '30px' : '2px',
            transition: 'left 0.3s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          })
        })
      ])
    ]),

    // Color picker
    f('div', { style: { marginBottom: '20px' } }, [
      f('span', {
        style: () => ({
          display: 'block',
          marginBottom: '12px',
          color: isDark ? '#e5e7eb' : '#374151',
          fontWeight: '500'
        })
      }, ['Primary Color']),
      f('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
        colors.map(color =>
          f('button', {
            onclick: () => setPrimaryColor(color),
            style: () => ({
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: primaryColor === color ? '3px solid white' : 'none',
              background: color,
              cursor: 'pointer',
              boxShadow: primaryColor === color ? `0 0 0 2px ${color}` : 'none',
              transition: 'all 0.2s'
            })
          })
        )
      )
    ]),

    // Preview card
    f('div', {
      style: () => ({
        padding: '16px',
        background: isDark ? '#111827' : 'white',
        borderRadius: '8px',
        border: `2px solid ${primaryColor}`,
        transition: 'all 0.3s'
      })
    }, [
      f('div', {
        style: () => ({
          fontSize: '18px',
          fontWeight: '600',
          color: primaryColor,
          marginBottom: '8px'
        })
      }, ['Preview Card']),
      f('p', {
        style: () => ({
          margin: 0,
          color: isDark ? '#9ca3af' : '#6b7280',
          fontSize: '14px'
        })
      }, ['This card updates reactively as you change theme settings.']),
      f('button', {
        style: () => ({
          marginTop: '12px',
          padding: '8px 16px',
          background: primaryColor,
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '500'
        })
      }, ['Action Button'])
    ])
  ])
}

onMounted(() => {
  if (container.value) {
    render(ThemeDemo(), container.value)
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
