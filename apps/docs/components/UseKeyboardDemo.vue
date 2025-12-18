<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { use } from 'flexium/core'
import { f, render } from 'flexium/dom'

const container = ref(null)

// Keyboard Input Demo
function UseKeyboardDemo() {
  const [pressedKeys, setPressedKeys] = use(new Set())
  const [lastPressed, setLastPressed] = use('')
  const [lastReleased, setLastReleased] = use('')
  const [keyLog, setKeyLog] = use([])

  // Keyboard event handlers
  const handleKeyDown = (e) => {
    if (e.repeat) return // Ignore repeated keydown events

    setPressedKeys(keys => {
      const newKeys = new Set(keys)
      newKeys.add(e.key)
      return newKeys
    })
    setLastPressed(e.key)
    setKeyLog(log => [...log.slice(-9), { type: 'pressed', key: e.key, time: Date.now() }])
  }

  const handleKeyUp = (e) => {
    setPressedKeys(keys => {
      const newKeys = new Set(keys)
      newKeys.delete(e.key)
      return newKeys
    })
    setLastReleased(e.key)
  }

  // Keyboard visualization
  const KeyboardVisualizer = () => {
    const commonKeys = [
      ['Escape', 'F1', 'F2', 'F3', 'F4'],
      ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
      ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
      ['CapsLock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
      ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
      ['Control', 'Alt', ' ', 'Alt', 'Control', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight']
    ]

    const isPressed = (key) => {
      const keys = pressedKeys()
      return keys.has(key) || keys.has(key.toUpperCase()) || keys.has(key.toLowerCase())
    }

    return f('div', {
      style: {
        marginBottom: '20px',
        padding: '16px',
        background: '#1f2937',
        borderRadius: '8px'
      }
    }, commonKeys.map(row =>
      f('div', {
        style: {
          display: 'flex',
          gap: '4px',
          marginBottom: '4px',
          justifyContent: 'center'
        }
      }, row.map(key =>
        f('div', {
          style: {
            padding: key === ' ' ? '8px 80px' : '8px 12px',
            borderRadius: '4px',
            fontSize: key.length > 1 && key !== ' ' ? '10px' : '12px',
            fontWeight: '500',
            background: () => isPressed(key) ? '#3b82f6' : '#374151',
            color: () => isPressed(key) ? 'white' : '#9ca3af',
            border: () => isPressed(key) ? '2px solid #60a5fa' : '1px solid #4b5563',
            transition: 'all 0.1s',
            minWidth: key.length > 5 ? '60px' : '32px',
            textAlign: 'center',
            fontFamily: 'monospace'
          }
        }, key === ' ' ? 'Space' : key)
      ))
    ))
  }

  return f('div', {
    style: {
      padding: '24px',
      background: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    tabindex: '0',
    onkeydown: handleKeyDown,
    onkeyup: handleKeyUp
  }, [
    f('div', { style: { marginBottom: '20px' } }, [
      f('h3', {
        style: {
          margin: '0 0 8px',
          fontSize: '20px',
          color: '#111827',
          fontWeight: '600'
        }
      }, 'keyboard() Demo'),
      f('p', {
        style: {
          margin: 0,
          fontSize: '14px',
          color: '#6b7280'
        }
      }, 'Click here and press keys to see them light up')
    ]),

    // Keyboard Visualizer
    KeyboardVisualizer(),

    // Currently Pressed Keys
    f('div', {
      style: {
        marginBottom: '16px',
        padding: '16px',
        background: '#f9fafb',
        borderRadius: '8px'
      }
    }, [
      f('h4', {
        style: {
          margin: '0 0 12px',
          fontSize: '14px',
          color: '#374151',
          fontWeight: '600'
        }
      }, 'Currently Pressed:'),
      f('div', {
        style: {
          minHeight: '40px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          alignItems: 'center'
        }
      }, () => {
        const keys = Array.from(pressedKeys())
        if (keys.length === 0) {
          return f('span', {
            style: { color: '#9ca3af', fontSize: '14px' }
          }, 'No keys pressed')
        }
        return keys.map(key =>
          f('span', {
            style: {
              padding: '6px 12px',
              background: '#3b82f6',
              color: 'white',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: 'monospace'
            }
          }, key === ' ' ? 'Space' : key)
        )
      })
    ]),

    // Key Events Log
    f('div', {
      style: {
        marginBottom: '16px',
        padding: '16px',
        background: '#f9fafb',
        borderRadius: '8px'
      }
    }, [
      f('h4', {
        style: {
          margin: '0 0 12px',
          fontSize: '14px',
          color: '#374151',
          fontWeight: '600'
        }
      }, 'Recent Key Events:'),
      f('div', {
        style: {
          fontSize: '13px',
          fontFamily: 'monospace',
          color: '#374151'
        }
      }, () => {
        if (keyLog.length === 0) {
          return f('div', { style: { color: '#9ca3af' } }, 'No events yet')
        }
        return keyLog.slice().reverse().map((event, i) =>
          f('div', {
            style: {
              padding: '4px 8px',
              marginBottom: '4px',
              background: '#e5e7eb',
              borderRadius: '4px',
              opacity: 1 - (i * 0.1)
            }
          }, [
            f('span', {
              style: {
                color: event.type === 'pressed' ? '#16a34a' : '#dc2626',
                fontWeight: '600'
              }
            }, event.type === 'pressed' ? '↓' : '↑'),
            ' ',
            f('code', {
              style: {
                background: '#d1d5db',
                padding: '2px 6px',
                borderRadius: '3px'
              }
            }, event.key === ' ' ? 'Space' : event.key)
          ])
        )
      })
    ]),

    // Info Display
    f('div', {
      style: {
        padding: '12px',
        background: '#eff6ff',
        borderRadius: '6px',
        fontSize: '13px',
        color: '#1e40af'
      }
    }, [
      f('div', { style: { marginBottom: '4px' } }, [
        f('strong', {}, 'Last Pressed: '),
        f('code', {
          style: {
            background: '#dbeafe',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: '600'
          }
        }, [() => lastPressed() || 'None'])
      ]),
      f('div', {}, [
        f('strong', {}, 'Last Released: '),
        f('code', {
          style: {
            background: '#dbeafe',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: '600'
          }
        }, [() => lastReleased() || 'None'])
      ])
    ])
  ])
}

onMounted(() => {
  if (container.value) {
    const demo = UseKeyboardDemo()
    render(demo, container.value)
    // Auto-focus the demo
    setTimeout(() => {
      const demoEl = container.value.querySelector('[tabindex="0"]')
      if (demoEl) demoEl.focus()
    }, 100)
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

.demo-wrapper :deep([tabindex="0"]:focus) {
  outline: 2px solid #4f46e5;
  outline-offset: 2px;
}
</style>
