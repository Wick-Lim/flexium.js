<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { state } from 'flexium/core'
import { f, render } from 'flexium/dom'

const container = ref(null)

// Simulated Router Demo
function RouterDemo() {
  const [currentRoute, setCurrentRoute] = state('/')

  const navigate = (path) => {
    setCurrentRoute(path)
  }

  // Navigation component
  const Nav = () => {
    return f('nav', {
      style: {
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        padding: '12px',
        background: '#f3f4f6',
        borderRadius: '8px'
      }
    }, [
      f('button', {
        onclick: () => navigate('/'),
        style: {
          padding: '8px 16px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          background: () => currentRoute === '/' ? '#4f46e5' : '#e5e7eb',
          color: () => currentRoute === '/' ? 'white' : '#374151',
          fontWeight: '500',
          transition: 'all 0.2s'
        }
      }, 'Home'),
      f('button', {
        onclick: () => navigate('/about'),
        style: {
          padding: '8px 16px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          background: () => currentRoute === '/about' ? '#4f46e5' : '#e5e7eb',
          color: () => currentRoute === '/about' ? 'white' : '#374151',
          fontWeight: '500',
          transition: 'all 0.2s'
        }
      }, 'About'),
      f('button', {
        onclick: () => navigate('/contact'),
        style: {
          padding: '8px 16px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          background: () => currentRoute === '/contact' ? '#4f46e5' : '#e5e7eb',
          color: () => currentRoute === '/contact' ? 'white' : '#374151',
          fontWeight: '500',
          transition: 'all 0.2s'
        }
      }, 'Contact')
    ])
  }

  // Page components
  const HomePage = () => f('div', {
    style: {
      padding: '20px',
      background: '#f9fafb',
      borderRadius: '8px'
    }
  }, [
    f('h2', { style: { margin: '0 0 12px', color: '#111827' } }, 'Home Page'),
    f('p', { style: { margin: 0, color: '#6b7280' } }, 'Welcome to the home page!')
  ])

  const AboutPage = () => f('div', {
    style: {
      padding: '20px',
      background: '#f9fafb',
      borderRadius: '8px'
    }
  }, [
    f('h2', { style: { margin: '0 0 12px', color: '#111827' } }, 'About Page'),
    f('p', { style: { margin: 0, color: '#6b7280' } }, 'Learn more about us on this page.')
  ])

  const ContactPage = () => f('div', {
    style: {
      padding: '20px',
      background: '#f9fafb',
      borderRadius: '8px'
    }
  }, [
    f('h2', { style: { margin: '0 0 12px', color: '#111827' } }, 'Contact Page'),
    f('p', { style: { margin: 0, color: '#6b7280' } }, 'Get in touch with us!')
  ])

  // Router simulation
  const Router = () => {
    const getPage = () => {
      const route = currentRoute
      if (route === '/') return HomePage()
      if (route === '/about') return AboutPage()
      if (route === '/contact') return ContactPage()
      return HomePage()
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
      f('div', { style: { marginBottom: '16px' } }, [
        f('h3', {
          style: {
            margin: '0 0 8px',
            fontSize: '20px',
            color: '#111827',
            fontWeight: '600'
          }
        }, 'Router Demo'),
        f('p', {
          style: {
            margin: 0,
            fontSize: '14px',
            color: '#6b7280'
          }
        }, 'Click the buttons to simulate navigation')
      ]),
      Nav(),
      f('div', { style: { marginTop: '16px' } }, [
        () => getPage()
      ]),
      f('div', {
        style: {
          marginTop: '16px',
          padding: '12px',
          background: '#eff6ff',
          borderRadius: '6px',
          fontSize: '14px',
          color: '#1e40af'
        }
      }, [
        'Current route: ',
        f('code', {
          style: {
            background: '#dbeafe',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: '600'
          }
        }, [currentRoute])
      ])
    ])
  }

  return Router()
}

onMounted(() => {
  if (container.value) {
    render(RouterDemo(), container.value)
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

.demo-wrapper :deep(button:hover) {
  transform: translateY(-1px);
  filter: brightness(105%);
}

.demo-wrapper :deep(button:active) {
  transform: translateY(0);
}
</style>
