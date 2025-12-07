<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { state } from 'flexium/core'
import { f, render } from 'flexium/dom'

const container = ref(null)

function ComputedCalculator() {
  const [num1, setNum1] = state(10)
  const [num2, setNum2] = state(5)

  const [sum] = state(() => num1 + num2)
  const [difference] = state(() => num1 - num2)
  const [product] = state(() => num1 * num2)
  const [average] = state(() => (num1 + num2) / 2)

  const containerNode = f('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
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
      }, ['Computed Values Demo']),
      f('p', {
        style: {
          margin: '0',
          color: '#6b7280',
          fontSize: '14px'
        }
      }, ['See how computed values automatically update when their dependencies change'])
    ]),

    // Input Controls
    f('div', {
      style: {
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap'
      }
    }, [
      // Number 1 Input
      f('div', {
        style: {
          flex: '1',
          minWidth: '200px',
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }
      }, [
        f('label', {
          style: {
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px'
          }
        }, ['First Number']),
        f('input', {
          type: 'number',
          value: num1,
          oninput: (e) => setNum1(parseFloat(e.target.value) || 0),
          style: {
            width: '100%',
            padding: '10px 12px',
            fontSize: '18px',
            fontWeight: '600',
            border: '2px solid #e5e7eb',
            borderRadius: '6px',
            boxSizing: 'border-box',
            color: '#111'
          }
        })
      ]),

      // Number 2 Input
      f('div', {
        style: {
          flex: '1',
          minWidth: '200px',
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }
      }, [
        f('label', {
          style: {
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px'
          }
        }, ['Second Number']),
        f('input', {
          type: 'number',
          value: num2,
          oninput: (e) => setNum2(parseFloat(e.target.value) || 0),
          style: {
            width: '100%',
            padding: '10px 12px',
            fontSize: '18px',
            fontWeight: '600',
            border: '2px solid #e5e7eb',
            borderRadius: '6px',
            boxSizing: 'border-box',
            color: '#111'
          }
        })
      ])
    ]),

    // Computed Results
    f('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px'
      }
    }, [
      // Sum
      f('div', {
        style: {
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '2px solid #10b981',
          textAlign: 'center'
        }
      }, [
        f('div', {
          style: {
            fontSize: '12px',
            fontWeight: '600',
            color: '#059669',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px'
          }
        }, ['Sum']),
        f('div', {
          style: {
            fontSize: '32px',
            fontWeight: '800',
            color: '#10b981',
            fontVariantNumeric: 'tabular-nums'
          }
        }, [sum])
      ]),

      // Difference
      f('div', {
        style: {
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '2px solid #f59e0b',
          textAlign: 'center'
        }
      }, [
        f('div', {
          style: {
            fontSize: '12px',
            fontWeight: '600',
            color: '#d97706',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px'
          }
        }, ['Difference']),
        f('div', {
          style: {
            fontSize: '32px',
            fontWeight: '800',
            color: '#f59e0b',
            fontVariantNumeric: 'tabular-nums'
          }
        }, [difference])
      ]),

      // Product
      f('div', {
        style: {
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '2px solid #6366f1',
          textAlign: 'center'
        }
      }, [
        f('div', {
          style: {
            fontSize: '12px',
            fontWeight: '600',
            color: '#4f46e5',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px'
          }
        }, ['Product']),
        f('div', {
          style: {
            fontSize: '32px',
            fontWeight: '800',
            color: '#6366f1',
            fontVariantNumeric: 'tabular-nums'
          }
        }, [product])
      ]),

      // Average
      f('div', {
        style: {
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '2px solid #ec4899',
          textAlign: 'center'
        }
      }, [
        f('div', {
          style: {
            fontSize: '12px',
            fontWeight: '600',
            color: '#db2777',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px'
          }
        }, ['Average']),
        f('div', {
          style: {
            fontSize: '32px',
            fontWeight: '800',
            color: '#ec4899',
            fontVariantNumeric: 'tabular-nums'
          }
        }, [average])
      ])
    ]),

    // Info text
    f('p', {
      style: {
        margin: '0',
        color: '#6b7280',
        fontSize: '13px',
        textAlign: 'center'
      }
    }, ['All values update automatically as you type. No manual calculation needed!'])
  ])

  return containerNode
}

onMounted(() => {
  if (container.value) {
    const app = ComputedCalculator()
    render(app, container.value)
  }
})

onUnmounted(() => {
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
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
}

.flexium-container :deep(input:focus) {
  outline: none;
  border-color: #6366f1;
}
</style>
