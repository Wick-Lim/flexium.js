<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { state, effect } from 'flexium/core'
import { sync } from 'flexium/advanced'
import { f, render } from 'flexium/dom'

const container = ref(null)

function SyncExample() {
  const [counter1, setCounter1] = state(0)
  const [counter2, setCounter2] = state(0)
  const [counter3, setCounter3] = state(0)
  const [renderCount, setRenderCount] = state(0)

  // Track renders using an effect
  effect(() => {
    // Read all counters to track when they change
    counter1()
    counter2()
    counter3()
    // Increment render count
    setRenderCount(c => c + 1)
  })

  const incrementAll = () => {
    setCounter1(c => c + 1)
    setCounter2(c => c + 1)
    setCounter3(c => c + 1)
  }

  const incrementAllSynced = () => {
    sync(() => {
      setCounter1(c => c + 1)
      setCounter2(c => c + 1)
      setCounter3(c => c + 1)
    })
  }

  const resetAll = () => {
    sync(() => {
      setCounter1(0)
      setCounter2(0)
      setCounter3(0)
      setRenderCount(0)
    })
  }

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
      }, ['Sync Updates Demo']),
      f('p', {
        style: {
          margin: '0',
          color: '#6b7280',
          fontSize: '14px'
        }
      }, ['Compare synced vs unsynced updates to see performance difference'])
    ]),

    // Render Count Display
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
      }, ['Render Count']),
      f('div', {
        style: {
          fontSize: '48px',
          fontWeight: '800',
          color: '#6366f1',
          fontVariantNumeric: 'tabular-nums'
        }
      }, [renderCount]),
      f('p', {
        style: {
          margin: '8px 0 0 0',
          fontSize: '13px',
          color: '#6b7280'
        }
      }, ['Number of times effects have run'])
    ]),

    // Counters
    f('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px'
      }
    }, [
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
        }, ['Counter 1']),
        f('div', {
          style: {
            fontSize: '36px',
            fontWeight: '800',
            color: '#10b981',
            fontVariantNumeric: 'tabular-nums'
          }
        }, [counter1])
      ]),

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
        }, ['Counter 2']),
        f('div', {
          style: {
            fontSize: '36px',
            fontWeight: '800',
            color: '#f59e0b',
            fontVariantNumeric: 'tabular-nums'
          }
        }, [counter2])
      ]),

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
        }, ['Counter 3']),
        f('div', {
          style: {
            fontSize: '36px',
            fontWeight: '800',
            color: '#ec4899',
            fontVariantNumeric: 'tabular-nums'
          }
        }, [counter3])
      ])
    ]),

    // Control Buttons
    f('div', {
      style: {
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }
    }, [
      f('div', {
        style: {
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }
      }, [
        f('button', {
          onclick: incrementAll,
          style: {
            padding: '12px 24px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            flex: '1',
            minWidth: '200px'
          }
        }, ['Increment All (Unsynced)']),

        f('button', {
          onclick: incrementAllSynced,
          style: {
            padding: '12px 24px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            flex: '1',
            minWidth: '200px'
          }
        }, ['Increment All (Synced)']),

        f('button', {
          onclick: resetAll,
          style: {
            padding: '12px 24px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            minWidth: '200px'
          }
        }, ['Reset All'])
      ])
    ]),

    // Info boxes
    f('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '12px'
      }
    }, [
      f('div', {
        style: {
          padding: '16px',
          background: '#fee2e2',
          border: '2px solid #f87171',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#991b1b'
        }
      }, [
        f('div', {
          style: {
            fontWeight: '700',
            marginBottom: '4px'
          }
        }, ['Unsynced (Red)']),
        f('div', {}, ['Updates each counter separately, causing 3 separate renders'])
      ]),

      f('div', {
        style: {
          padding: '16px',
          background: '#d1fae5',
          border: '2px solid #34d399',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#065f46'
        }
      }, [
        f('div', {
          style: {
            fontWeight: '700',
            marginBottom: '4px'
          }
        }, ['Synced (Green)']),
        f('div', {}, ['Updates all counters together, causing only 1 render'])
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
    }, ['Watch the render count: synced updates are more efficient!'])
  ])

  return containerNode
}

onMounted(() => {
  if (container.value) {
    const app = SyncExample()
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

.flexium-container :deep(button:hover) {
  filter: brightness(110%);
}

.flexium-container :deep(button:active) {
  filter: brightness(90%);
}
</style>
