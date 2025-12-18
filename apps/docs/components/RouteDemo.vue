<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { use } from 'flexium/core'
import { f, render } from 'flexium/dom'

const container = ref(null)

// Route Matching Demo
function RouteDemo() {
  const [testPath, setTestPath] = use('/users/123')

  // Route patterns to test
  const routes = [
    { pattern: '/', description: 'Static root path' },
    { pattern: '/about', description: 'Static path' },
    { pattern: '/users/:id', description: 'Dynamic parameter :id' },
    { pattern: '/posts/:slug', description: 'Dynamic parameter :slug' },
    { pattern: '/products/:category/:id', description: 'Multiple parameters' },
    { pattern: '/docs/*', description: 'Catch-all wildcard' },
    { pattern: '*', description: 'Fallback (404)' }
  ]

  // Simple route matcher
  const matchRoute = (pattern, path) => {
    if (pattern === path) return { match: true, params: {} }
    if (pattern === '*') return { match: true, params: {} }

    const patternParts = pattern.split('/').filter(Boolean)
    const pathParts = path.split('/').filter(Boolean)

    // Check for wildcard
    if (pattern.endsWith('/*')) {
      const basePattern = pattern.slice(0, -2)
      if (path.startsWith(basePattern)) {
        return { match: true, params: {} }
      }
    }

    if (patternParts.length !== pathParts.length) return { match: false, params: {} }

    const params = {}
    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i]
      const pathPart = pathParts[i]

      if (patternPart.startsWith(':')) {
        params[patternPart.slice(1)] = pathPart
      } else if (patternPart !== pathPart) {
        return { match: false, params: {} }
      }
    }

    return { match: true, params }
  }

  // Render a single route row
  const RouteRow = (route) => {
    return f('div', {
      style: () => {
        const result = matchRoute(route.pattern, testPath)
        return {
          display: 'flex',
          alignItems: 'center',
          padding: '12px',
          marginBottom: '8px',
          borderRadius: '6px',
          background: result.match ? '#dcfce7' : '#f9fafb',
          border: result.match ? '2px solid #16a34a' : '1px solid #e5e7eb',
          transition: 'all 0.2s'
        }
      }
    }, [
      f('div', { style: { flex: '1' } }, [
        f('code', {
          style: () => {
            const result = matchRoute(route.pattern, testPath)
            return {
              fontSize: '14px',
              fontWeight: '600',
              color: result.match ? '#15803d' : '#374151',
              background: result.match ? '#bbf7d0' : '#e5e7eb',
              padding: '4px 8px',
              borderRadius: '4px'
            }
          }
        }, route.pattern),
        f('div', {
          style: {
            fontSize: '13px',
            color: '#6b7280',
            marginTop: '4px'
          }
        }, route.description)
      ]),
      f('div', {
        style: () => {
          const result = matchRoute(route.pattern, testPath)
          return {
            fontSize: '13px',
            fontWeight: '600',
            color: result.match ? '#15803d' : '#9ca3af'
          }
        }
      }, () => {
        const result = matchRoute(route.pattern, testPath)
        if (!result.match) return 'No match'
        if (Object.keys(result.params).length === 0) return 'Match'
        return `Match: ${JSON.stringify(result.params)}`
      })
    ])
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
      }, 'Route Matching Demo'),
      f('p', {
        style: {
          margin: 0,
          fontSize: '14px',
          color: '#6b7280'
        }
      }, 'See how different route patterns match paths')
    ]),

    // Path Input
    f('div', {
      style: {
        marginBottom: '20px',
        padding: '16px',
        background: '#f9fafb',
        borderRadius: '8px'
      }
    }, [
      f('label', {
        style: {
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '8px'
        }
      }, 'Test Path:'),
      f('input', {
        type: 'text',
        value: testPath,
        oninput: (e) => setTestPath(e.target.value),
        onkeydown: (e) => e.stopPropagation(),
        style: {
          width: '100%',
          padding: '10px 12px',
          fontSize: '14px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontFamily: 'monospace',
          boxSizing: 'border-box'
        },
        placeholder: '/path/to/test'
      }),
      f('div', {
        style: {
          marginTop: '8px',
          fontSize: '12px',
          color: '#6b7280'
        }
      }, 'Try: /users/123, /products/electronics/456, /docs/guide, /about')
    ]),

    // Route List
    f('div', {}, routes.map(route => RouteRow(route))),

    // Info
    f('div', {
      style: {
        marginTop: '16px',
        padding: '12px',
        background: '#eff6ff',
        borderRadius: '6px',
        fontSize: '13px',
        color: '#1e40af'
      }
    }, [
      f('strong', {}, 'How it works:'),
      ' Routes are matched in order from top to bottom. Dynamic segments (e.g., :id) extract parameters.'
    ])
  ])
}

onMounted(() => {
  if (container.value) {
    render(RouteDemo, container.value)
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

.demo-wrapper :deep(input:focus) {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}
</style>
