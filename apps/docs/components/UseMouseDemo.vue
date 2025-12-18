<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { use } from 'flexium/core'
import { f, render } from 'flexium/dom'

const container = ref(null)

// Mouse Input Demo
function UseMouseDemo() {
  const [mouseX, setMouseX] = use(0)
  const [mouseY, setMouseY] = use(0)
  const [leftPressed, setLeftPressed] = use(false)
  const [rightPressed, setRightPressed] = use(false)
  const [middlePressed, setMiddlePressed] = use(false)
  const [clickLog, setClickLog] = use([])
  const [isInside, setIsInside] = use(false)

  let trackingArea = null

  // Mouse event handlers
  const handleMouseMove = (e) => {
    if (!trackingArea) return
    const rect = trackingArea.getBoundingClientRect()
    setMouseX(e.clientX - rect.left)
    setMouseY(e.clientY - rect.top)
  }

  const handleMouseDown = (e) => {
    e.preventDefault()
    if (e.button === 0) {
      setLeftPressed(true)
      setClickLog(log => [...log.slice(-9), { type: 'left press', x: mouseX, y: mouseY, time: Date.now() }])
    }
    if (e.button === 1) setMiddlePressed(true)
    if (e.button === 2) {
      setRightPressed(true)
      setClickLog(log => [...log.slice(-9), { type: 'right press', x: mouseX, y: mouseY, time: Date.now() }])
    }
  }

  const handleMouseUp = (e) => {
    if (e.button === 0) setLeftPressed(false)
    if (e.button === 1) setMiddlePressed(false)
    if (e.button === 2) setRightPressed(false)
  }

  const handleMouseEnter = () => setIsInside(true)
  const handleMouseLeave = () => setIsInside(false)

  const handleContextMenu = (e) => e.preventDefault()

  return f('div', {
    style: {
      padding: '24px',
      background: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }
  }, [
    f('div', { style: { marginBottom: '20px' } }, [
      f('h3', {
        style: {
          margin: '0 0 8px',
          fontSize: '20px',
          color: '#111827',
          fontWeight: '600'
        }
      }, 'useMouse() Demo'),
      f('p', {
        style: {
          margin: 0,
          fontSize: '14px',
          color: '#6b7280'
        }
      }, 'Move your mouse and click in the tracking area')
    ]),

    // Tracking Area
    f('div', {
      ref: (el) => { trackingArea = el },
      onmousemove: handleMouseMove,
      onmousedown: handleMouseDown,
      onmouseup: handleMouseUp,
      onmouseenter: handleMouseEnter,
      onmouseleave: handleMouseLeave,
      oncontextmenu: handleContextMenu,
      style: {
        position: 'relative',
        height: '300px',
        marginBottom: '20px',
        background: () => isInside ? '#f9fafb' : '#f3f4f6',
        border: '2px dashed #d1d5db',
        borderRadius: '8px',
        cursor: 'crosshair',
        overflow: 'hidden',
        transition: 'background 0.2s'
      }
    }, [
      // Instructions
      f('div', {
        style: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#9ca3af',
          pointerEvents: 'none',
          fontSize: '14px'
        }
      }, [
        f('div', { style: { fontSize: '16px', fontWeight: '600', marginBottom: '8px' } }, 'Move mouse here'),
        f('div', {}, 'Try left-click and right-click')
      ]),

      // Mouse Cursor
      () => isInside ? f('div', {
        style: {
          position: 'absolute',
          left: `${mouseX}px`,
          top: `${mouseY}px`,
          width: '20px',
          height: '20px',
          marginLeft: '-10px',
          marginTop: '-10px',
          borderRadius: '50%',
          background: () => leftPressed || rightPressed ? '#ef4444' : '#3b82f6',
          border: '3px solid white',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          pointerEvents: 'none',
          transition: 'background 0.1s'
        }
      }) : null,

      // Trail effect
      () => isInside && (leftPressed || rightPressed) ? f('div', {
        style: {
          position: 'absolute',
          left: `${mouseX}px`,
          top: `${mouseY}px`,
          width: '40px',
          height: '40px',
          marginLeft: '-20px',
          marginTop: '-20px',
          borderRadius: '50%',
          background: () => leftPressed ? 'rgba(59, 130, 246, 0.3)' : 'rgba(239, 68, 68, 0.3)',
          pointerEvents: 'none'
        }
      }) : null
    ]),

    // Mouse Info Grid
    f('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        marginBottom: '16px'
      }
    }, [
      // Position
      f('div', {
        style: {
          padding: '16px',
          background: '#f9fafb',
          borderRadius: '8px'
        }
      }, [
        f('h4', {
          style: {
            margin: '0 0 8px',
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '600'
          }
        }, 'Position'),
        f('div', {
          style: {
            fontSize: '24px',
            fontWeight: '700',
            color: '#111827',
            fontFamily: 'monospace'
          }
        }, [
          () => `${Math.round(mouseX)}, ${Math.round(mouseY)}`
        ])
      ]),

      // Button States
      f('div', {
        style: {
          padding: '16px',
          background: '#f9fafb',
          borderRadius: '8px'
        }
      }, [
        f('h4', {
          style: {
            margin: '0 0 8px',
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '600'
          }
        }, 'Buttons'),
        f('div', {
          style: {
            display: 'flex',
            gap: '8px'
          }
        }, [
          f('div', {
            style: {
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600',
              background: () => leftPressed ? '#3b82f6' : '#e5e7eb',
              color: () => leftPressed ? 'white' : '#6b7280',
              transition: 'all 0.1s'
            }
          }, 'Left'),
          f('div', {
            style: {
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600',
              background: () => middlePressed ? '#8b5cf6' : '#e5e7eb',
              color: () => middlePressed ? 'white' : '#6b7280',
              transition: 'all 0.1s'
            }
          }, 'Middle'),
          f('div', {
            style: {
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600',
              background: () => rightPressed ? '#ef4444' : '#e5e7eb',
              color: () => rightPressed ? 'white' : '#6b7280',
              transition: 'all 0.1s'
            }
          }, 'Right')
        ])
      ])
    ]),

    // Click Log
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
      }, 'Click Events Log:'),
      f('div', {
        style: {
          fontSize: '13px',
          fontFamily: 'monospace',
          maxHeight: '150px',
          overflowY: 'auto'
        }
      }, () => {
        if (clickLog.length === 0) {
          return f('div', { style: { color: '#9ca3af' } }, 'No clicks yet')
        }
        return clickLog.slice().reverse().map((event, i) =>
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
                color: event.type.includes('left') ? '#3b82f6' : '#ef4444',
                fontWeight: '600'
              }
            }, event.type === 'left press' ? 'L' : 'R'),
            ' ',
            f('span', {}, `(${Math.round(event.x)}, ${Math.round(event.y)})`)
          ])
        )
      })
    ]),

    // Info
    f('div', {
      style: {
        padding: '12px',
        background: '#eff6ff',
        borderRadius: '6px',
        fontSize: '13px',
        color: '#1e40af'
      }
    }, [
      'The mouse position is tracked relative to the tracking area. ',
      'Left and right clicks are detected and logged.'
    ])
  ])
}

onMounted(() => {
  if (container.value) {
    render(UseMouseDemo, container.value)
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
