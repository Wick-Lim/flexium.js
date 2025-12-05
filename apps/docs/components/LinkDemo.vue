<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { state } from 'flexium/core'
import { f, render } from 'flexium/dom'

const container = ref(null)

// Link Navigation Demo
function LinkDemo() {
  const [currentPath, setCurrentPath] = state('/')

  // Simulated Link component
  const Link = (props) => {
    const isActive = () => currentPath() === props.href

    return f('a', {
      href: props.href,
      onclick: (e) => {
        e.preventDefault()
        setCurrentPath(props.href)
      },
      style: {
        display: 'inline-block',
        padding: '8px 16px',
        marginRight: '8px',
        textDecoration: 'none',
        borderRadius: '6px',
        fontWeight: '500',
        transition: 'all 0.2s',
        background: () => isActive() ? '#4f46e5' : '#e5e7eb',
        color: () => isActive() ? 'white' : '#374151',
        border: () => isActive() ? '2px solid #4338ca' : '2px solid transparent'
      },
      class: () => isActive() ? 'active' : ''
    }, props.children)
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
      }, 'Link Navigation Demo'),
      f('p', {
        style: {
          margin: 0,
          fontSize: '14px',
          color: '#6b7280'
        }
      }, 'Links automatically highlight when active')
    ]),

    // Navigation Links
    f('nav', {
      style: {
        padding: '16px',
        background: '#f9fafb',
        borderRadius: '8px',
        marginBottom: '20px'
      }
    }, [
      f('div', { style: { marginBottom: '12px' } }, [
        f('h4', {
          style: {
            margin: '0 0 12px',
            fontSize: '14px',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }
        }, 'Main Navigation')
      ]),
      Link({ href: '/', children: 'Home' }),
      Link({ href: '/products', children: 'Products' }),
      Link({ href: '/about', children: 'About' }),
      Link({ href: '/contact', children: 'Contact' })
    ]),

    // Current Page Display
    f('div', {
      style: {
        padding: '20px',
        background: '#f9fafb',
        borderRadius: '8px',
        marginBottom: '16px'
      }
    }, [
      f('h4', {
        style: {
          margin: '0 0 12px',
          fontSize: '16px',
          color: '#111827'
        }
      }, () => {
        const path = currentPath()
        if (path === '/') return 'Home Page'
        if (path === '/products') return 'Products Page'
        if (path === '/about') return 'About Page'
        if (path === '/contact') return 'Contact Page'
        return 'Page'
      }),
      f('p', {
        style: {
          margin: 0,
          color: '#6b7280',
          fontSize: '14px'
        }
      }, () => {
        const path = currentPath()
        if (path === '/') return 'Welcome to our website!'
        if (path === '/products') return 'Browse our amazing products.'
        if (path === '/about') return 'Learn more about our company.'
        if (path === '/contact') return 'Get in touch with us!'
        return 'Content goes here'
      })
    ]),

    // Info Display
    f('div', {
      style: {
        padding: '12px',
        background: '#eff6ff',
        borderRadius: '6px',
        fontSize: '14px',
        color: '#1e40af'
      }
    }, [
      'Current path: ',
      f('code', {
        style: {
          background: '#dbeafe',
          padding: '2px 6px',
          borderRadius: '4px',
          fontWeight: '600'
        }
      }, [currentPath]),
      f('div', {
        style: {
          marginTop: '8px',
          fontSize: '13px',
          color: '#3b82f6'
        }
      }, 'The active link is styled differently with activeClass applied')
    ])
  ])
}

onMounted(() => {
  if (container.value) {
    render(LinkDemo(), container.value)
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

.demo-wrapper :deep(a:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.demo-wrapper :deep(a:active) {
  transform: translateY(0);
}
</style>
