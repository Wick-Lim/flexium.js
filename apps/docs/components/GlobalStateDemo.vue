<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { state, clearGlobalState } from 'flexium/core'
import { f, render } from 'flexium/dom'

const container = ref(null)

// Component A - can read and write global state
function CounterA() {
  const [count, setCount] = state(0, { key: ['app', 'count'] })

  return f('div', {
    style: {
      padding: '20px',
      background: '#dbeafe',
      borderRadius: '8px',
      border: '2px solid #3b82f6'
    }
  }, [
    f('div', {
      style: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#1d4ed8',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '12px'
      }
    }, ['Component A']),
    f('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }
    }, [
      f('button', {
        onclick: () => setCount(c => c - 1),
        style: {
          width: '36px',
          height: '36px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '20px',
          cursor: 'pointer'
        }
      }, ['-']),
      f('span', {
        style: {
          fontSize: '24px',
          fontWeight: '700',
          color: '#1e40af',
          minWidth: '60px',
          textAlign: 'center'
        }
      }, [count]),
      f('button', {
        onclick: () => setCount(c => c + 1),
        style: {
          width: '36px',
          height: '36px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '20px',
          cursor: 'pointer'
        }
      }, ['+'])
    ])
  ])
}

// Component B - shares the same global state
function CounterB() {
  const [count, setCount] = state(0, { key: ['app', 'count'] })
  const [doubled] = state(() => count * 2)

  return f('div', {
    style: {
      padding: '20px',
      background: '#dcfce7',
      borderRadius: '8px',
      border: '2px solid #22c55e'
    }
  }, [
    f('div', {
      style: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#15803d',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '12px'
      }
    }, ['Component B']),
    f('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }
    }, [
      f('button', {
        onclick: () => setCount(c => c - 1),
        style: {
          width: '36px',
          height: '36px',
          background: '#22c55e',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '20px',
          cursor: 'pointer'
        }
      }, ['-']),
      f('span', {
        style: {
          fontSize: '24px',
          fontWeight: '700',
          color: '#166534',
          minWidth: '60px',
          textAlign: 'center'
        }
      }, [count]),
      f('button', {
        onclick: () => setCount(c => c + 1),
        style: {
          width: '36px',
          height: '36px',
          background: '#22c55e',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '20px',
          cursor: 'pointer'
        }
      }, ['+'])
    ]),
    f('div', {
      style: {
        marginTop: '12px',
        fontSize: '14px',
        color: '#166534'
      }
    }, ['Doubled: ', f('strong', {}, [doubled])])
  ])
}

// Component C - displays the shared state
function DisplayC() {
  const [count] = state(0, { key: ['app', 'count'] })

  return f('div', {
    style: {
      padding: '20px',
      background: '#fef3c7',
      borderRadius: '8px',
      border: '2px solid #f59e0b',
      textAlign: 'center'
    }
  }, [
    f('div', {
      style: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#b45309',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '8px'
      }
    }, ['Component C (Read Only)']),
    f('div', {
      style: {
        fontSize: '32px',
        fontWeight: '800',
        color: '#d97706'
      }
    }, [count])
  ])
}

function GlobalDemo() {
  // Reset global state on mount
  clearGlobalState()

  const containerNode = f('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '32px',
      background: '#f9fafb',
      borderRadius: '12px',
      boxSizing: 'border-box'
    }
  }, [
    // Title
    f('div', {}, [
      f('h3', {
        style: {
          margin: '0 0 4px 0',
          color: '#111',
          fontSize: '20px',
          fontWeight: '600'
        }
      }, ['Global State Demo']),
      f('p', {
        style: {
          margin: '0',
          color: '#6b7280',
          fontSize: '14px'
        }
      }, ['Three independent components sharing the same state via key'])
    ]),

    // Components grid
    f('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px'
      }
    }, [
      CounterA(),
      CounterB(),
      DisplayC()
    ]),

    // Code hint
    f('div', {
      style: {
        padding: '12px 16px',
        background: '#1f2937',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#e5e7eb',
        overflowX: 'auto'
      }
    }, ["const [count, setCount] = state(0, { key: ['app', 'count'] })"])
  ])

  return containerNode
}

onMounted(() => {
  if (container.value) {
    const app = GlobalDemo()
    render(app, container.value)
  }
})

onUnmounted(() => {
  if (container.value) {
    container.value.innerHTML = ''
    clearGlobalState()
  }
})
</script>

<template>
  <div class="demo-wrapper">
    <div ref="container" class="flexium-container"></div>
  </div>
</template>

<style scoped>
.demo-wrapper {
  margin: 40px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
}

.flexium-container :deep(button:hover) {
  filter: brightness(110%);
}

.flexium-container :deep(button:active) {
  transform: scale(0.95);
}
</style>
