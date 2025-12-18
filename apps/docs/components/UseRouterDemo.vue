<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { use } from 'flexium/core'
import { f, render } from 'flexium/dom'

const container = ref(null)

// router() Function Demo
function RouterDemo() {
  const [path, setPath] = use('/')
  const [params, setParams] = use({})
  const [query, setQuery] = use({})
  const [history, setHistory] = use(['/'])

  // Simulated router() function
  const createRouter = () => {
    const navigate = (newPath, options = {}) => {
      if (!options.replace) {
        setHistory(h => [...h, newPath])
      }

      // Parse path and query
      const [pathPart, queryPart] = newPath.split('?')
      setPath(pathPart)

      // Parse query string
      if (queryPart) {
        const queryParams = {}
        queryPart.split('&').forEach(param => {
          const [key, value] = param.split('=')
          queryParams[key] = value
        })
        setQuery(queryParams)
      } else {
        setQuery({})
      }

      // Extract params (simplified)
      if (pathPart.includes('/users/')) {
        const id = pathPart.split('/users/')[1]
        setParams({ id })
      } else {
        setParams({})
      }
    }

    const back = () => {
      if (history.length > 1) {
        const newHistory = history.slice(0, -1)
        setHistory(newHistory)
        navigate(newHistory[newHistory.length - 1], { replace: true })
      }
    }

    const forward = () => {
      // Simplified - would need forward stack in real implementation
    }

    return {
      navigate,
      back,
      forward
    }
  }

  const r = createRouter()

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
      }, 'router() Function Demo'),
      f('p', {
        style: {
          margin: 0,
          fontSize: '14px',
          color: '#6b7280'
        }
      }, 'Programmatic navigation and route information')
    ]),

    // Navigation Buttons
    f('div', {
      style: {
        marginBottom: '20px',
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
      }, 'Navigate to:'),
      f('div', {
        style: {
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px'
        }
      }, [
        f('button', {
          onclick: () => r.navigate('/'),
          style: {
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: '#4f46e5',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }
        }, 'Home'),
        f('button', {
          onclick: () => r.navigate('/users/123'),
          style: {
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: '#4f46e5',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }
        }, 'User Profile'),
        f('button', {
          onclick: () => r.navigate('/search?q=flexium&page=1'),
          style: {
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: '#4f46e5',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }
        }, 'Search Page'),
        f('button', {
          onclick: () => r.navigate('/about'),
          style: {
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: '#4f46e5',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }
        }, 'About')
      ])
    ]),

    // History Controls
    f('div', {
      style: {
        marginBottom: '20px',
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
      }, 'History Navigation:'),
      f('div', {
        style: {
          display: 'flex',
          gap: '8px'
        }
      }, [
        f('button', {
          onclick: () => r.back(),
          disabled: () => history.length <= 1,
          style: {
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: () => history.length <= 1 ? '#d1d5db' : '#6b7280',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            cursor: () => history.length <= 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }
        }, '← Back'),
        f('button', {
          onclick: () => r.forward(),
          disabled: true,
          style: {
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: '#d1d5db',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'not-allowed',
            transition: 'all 0.2s'
          }
        }, 'Forward →')
      ])
    ]),

    // Current Route Info
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
      }, 'Current Route Information:'),

      // Path
      f('div', {
        style: {
          marginBottom: '8px',
          fontSize: '14px',
          color: '#374151'
        }
      }, [
        f('strong', {}, 'Path: '),
        f('code', {
          style: {
            background: '#e5e7eb',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: '600'
          }
        }, [path])
      ]),

      // Params
      f('div', {
        style: {
          marginBottom: '8px',
          fontSize: '14px',
          color: '#374151'
        }
      }, [
        f('strong', {}, 'Params: '),
        f('code', {
          style: {
            background: '#e5e7eb',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: '600'
          }
        }, [() => JSON.stringify(params)])
      ]),

      // Query
      f('div', {
        style: {
          fontSize: '14px',
          color: '#374151'
        }
      }, [
        f('strong', {}, 'Query: '),
        f('code', {
          style: {
            background: '#e5e7eb',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: '600'
          }
        }, [() => JSON.stringify(query)])
      ])
    ]),

    // History Display
    f('div', {
      style: {
        padding: '12px',
        background: '#eff6ff',
        borderRadius: '6px',
        fontSize: '13px',
        color: '#1e40af'
      }
    }, [
      f('strong', {}, 'History: '),
      () => history.map((h, i) =>
        f('span', {
          style: {
            display: 'inline-block',
            marginLeft: '4px'
          }
        }, [
          f('code', {
            style: {
              background: '#dbeafe',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: i === history.length - 1 ? '700' : '500'
            }
          }, h),
          i < history.length - 1 ? ' → ' : ''
        ])
      )
    ])
  ])
}

onMounted(() => {
  if (container.value) {
    render(RouterDemo, container.value)
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
