<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { state } from 'flexium/core'
import { f, render } from 'flexium/dom'

const container = ref(null)

// render() Function Demo
function RenderDemo() {
  const [mountedApps, setMountedApps] = state([])
  const [counter, setCounter] = state(0)

  // Simple app component
  const SimpleApp = (id, color) => {
    const [count, setCount] = state(0)

    return f('div', {
      style: {
        padding: '16px',
        background: color,
        borderRadius: '8px',
        marginBottom: '12px',
        border: '2px solid rgba(0, 0, 0, 0.1)'
      }
    }, [
      f('div', {
        style: {
          fontSize: '14px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '8px'
        }
      }, `App #${id}`),
      f('div', {
        style: {
          fontSize: '24px',
          fontWeight: '700',
          color: '#111827',
          marginBottom: '8px',
          fontFamily: 'monospace'
        }
      }, [count]),
      f('div', {
        style: {
          display: 'flex',
          gap: '8px'
        }
      }, [
        f('button', {
          onclick: () => setCount(c => c - 1),
          style: {
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            background: '#6b7280',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }
        }, '-'),
        f('button', {
          onclick: () => setCount(c => c + 1),
          style: {
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            background: '#3b82f6',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }
        }, '+')
      ])
    ])
  }

  // Container for dynamically mounted apps
  let appsContainer = null

  // Mount a new app
  const mountNewApp = () => {
    const id = counter + 1
    setCounter(id)

    const colors = ['#dbeafe', '#fce7f3', '#dcfce7', '#fef3c7', '#e0e7ff']
    const color = colors[id % colors.length]

    const appContainer = document.createElement('div')
    appsContainer.appendChild(appContainer)

    const dispose = render(SimpleApp(id, color), appContainer)

    setMountedApps(apps => [...apps, { id, dispose, container: appContainer }])
  }

  // Unmount the last app
  const unmountLastApp = () => {
    if (mountedApps.length === 0) return

    const lastApp = mountedApps[mountedApps.length - 1]
    lastApp.dispose()
    lastApp.container.remove()

    setMountedApps(mountedApps.slice(0, -1))
  }

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
      }, 'render() Function Demo'),
      f('p', {
        style: {
          margin: 0,
          fontSize: '14px',
          color: '#6b7280'
        }
      }, 'Mount and unmount Flexium apps dynamically')
    ]),

    // Controls
    f('div', {
      style: {
        marginBottom: '20px',
        padding: '16px',
        background: '#f9fafb',
        borderRadius: '8px'
      }
    }, [
      f('div', {
        style: {
          display: 'flex',
          gap: '12px',
          marginBottom: '12px'
        }
      }, [
        f('button', {
          onclick: mountNewApp,
          style: {
            padding: '10px 20px',
            borderRadius: '6px',
            border: 'none',
            background: '#10b981',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }
        }, '+ Mount New App'),
        f('button', {
          onclick: unmountLastApp,
          disabled: () => mountedApps.length === 0,
          style: {
            padding: '10px 20px',
            borderRadius: '6px',
            border: 'none',
            background: () => mountedApps.length === 0 ? '#d1d5db' : '#ef4444',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: () => mountedApps.length === 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }
        }, '- Unmount Last')
      ]),
      f('div', {
        style: {
          fontSize: '14px',
          color: '#6b7280'
        }
      }, [
        'Mounted apps: ',
        f('strong', {
          style: {
            color: '#111827',
            fontSize: '18px'
          }
        }, [() => mountedApps.length.toString()])
      ])
    ]),

    // Apps Container
    f('div', {
      ref: (el) => { appsContainer = el },
      style: {
        minHeight: '100px',
        marginBottom: '16px'
      }
    }, [
      () => mountedApps.length === 0 ? f('div', {
        style: {
          padding: '40px',
          textAlign: 'center',
          color: '#9ca3af',
          background: '#f9fafb',
          borderRadius: '8px',
          border: '2px dashed #d1d5db'
        }
      }, [
        f('div', {
          style: {
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '8px'
          }
        }, 'No apps mounted'),
        f('div', {
          style: {
            fontSize: '14px'
          }
        }, 'Click "Mount New App" to add an app')
      ]) : null
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
      f('div', { style: { fontWeight: '600', marginBottom: '4px' } }, 'How it works:'),
      f('div', {}, 'Each app is independently mounted using '),
      f('code', {
        style: {
          background: '#dbeafe',
          padding: '2px 6px',
          borderRadius: '4px',
          fontWeight: '600'
        }
      }, 'render(element, container)'),
      f('div', { style: { marginTop: '4px' } }, 'Calling the returned dispose function unmounts the app and cleans up all reactive subscriptions.')
    ])
  ])
}

onMounted(() => {
  if (container.value) {
    render(RenderDemo, container.value)
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

.demo-wrapper :deep(button:not([disabled]):hover) {
  transform: translateY(-1px);
  filter: brightness(110%);
}

.demo-wrapper :deep(button:not([disabled]):active) {
  transform: translateY(0);
  filter: brightness(90%);
}
</style>
