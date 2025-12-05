<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { state } from 'flexium/core'
import { f, render } from 'flexium/dom'
import { Row, Column } from 'flexium/primitives'

const container = ref(null)

function ButtonDemo() {
  const [clickCount, setClickCount] = state(0)
  const [isLoading, setIsLoading] = state(false)

  // Helper to create button styles
  const createButtonStyle = (variant) => {
    const variants = {
      primary: {
        backgroundColor: '#4f46e5',
        color: 'white',
        border: 'none',
      },
      secondary: {
        backgroundColor: '#6b7280',
        color: 'white',
        border: 'none',
      },
      outline: {
        backgroundColor: 'transparent',
        color: '#4f46e5',
        border: '2px solid #4f46e5',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '#4f46e5',
        border: 'none',
      },
      danger: {
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
      },
    }

    return {
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      ...variants[variant],
    }
  }

  const handleAsyncClick = async () => {
    setIsLoading(true)
    setClickCount(c => c + 1)
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
  }

  return Column({ gap: 24, style: { padding: '20px' } }, [
    // Title
    f('h3', {
      style: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 0,
        marginBottom: '8px',
      }
    }, ['Button Variants']),

    // Click counter
    f('div', {
      style: {
        padding: '12px 16px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        textAlign: 'center',
      }
    }, [
      f('span', {
        style: {
          fontSize: '14px',
          color: '#6b7280',
          marginRight: '8px',
        }
      }, ['Total Clicks:']),
      f('span', {
        style: {
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#4f46e5',
        }
      }, [clickCount])
    ]),

    // Button variants
    Row({ gap: 12, wrap: true, style: { marginBottom: '16px' } }, [
      f('button', {
        onclick: () => setClickCount(c => c + 1),
        style: createButtonStyle('primary')
      }, ['Primary']),

      f('button', {
        onclick: () => setClickCount(c => c + 1),
        style: createButtonStyle('secondary')
      }, ['Secondary']),

      f('button', {
        onclick: () => setClickCount(c => c + 1),
        style: createButtonStyle('outline')
      }, ['Outline']),

      f('button', {
        onclick: () => setClickCount(c => c + 1),
        style: createButtonStyle('ghost')
      }, ['Ghost']),

      f('button', {
        onclick: () => setClickCount(c => c + 1),
        style: createButtonStyle('danger')
      }, ['Danger']),
    ]),

    // Sizes section
    f('h3', {
      style: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#111827',
        marginTop: '16px',
        marginBottom: '8px',
      }
    }, ['Button Sizes']),

    Row({ gap: 12, align: 'center', wrap: true, style: { marginBottom: '16px' } }, [
      f('button', {
        onclick: () => setClickCount(c => c + 1),
        style: {
          ...createButtonStyle('primary'),
          padding: '8px 16px',
          fontSize: '14px',
        }
      }, ['Small']),

      f('button', {
        onclick: () => setClickCount(c => c + 1),
        style: createButtonStyle('primary')
      }, ['Medium']),

      f('button', {
        onclick: () => setClickCount(c => c + 1),
        style: {
          ...createButtonStyle('primary'),
          padding: '16px 32px',
          fontSize: '18px',
        }
      }, ['Large']),
    ]),

    // States section
    f('h3', {
      style: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#111827',
        marginTop: '16px',
        marginBottom: '8px',
      }
    }, ['Button States']),

    Row({ gap: 12, wrap: true }, [
      f('button', {
        onclick: handleAsyncClick,
        disabled: isLoading,
        style: {
          ...createButtonStyle('primary'),
          opacity: () => isLoading() ? 0.6 : 1,
          cursor: () => isLoading() ? 'wait' : 'pointer',
        }
      }, [() => isLoading() ? 'Loading...' : 'Async Action']),

      f('button', {
        disabled: true,
        style: {
          ...createButtonStyle('primary'),
          opacity: 0.5,
          cursor: 'not-allowed',
        }
      }, ['Disabled']),
    ]),

    // Info text
    f('p', {
      style: {
        marginTop: '16px',
        color: '#6b7280',
        fontSize: '14px',
        fontStyle: 'italic',
      }
    }, ['Click any button to increment the counter. Try the async button to see loading state!'])
  ])
}

onMounted(() => {
  if (container.value) {
    const app = ButtonDemo()
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
  <div class="demo-wrapper">
    <div ref="container" class="flexium-container"></div>
  </div>
</template>

<style scoped>
.demo-wrapper {
  margin: 40px 0;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
}

.flexium-container :deep(button:not(:disabled):hover) {
  transform: translateY(-1px);
  filter: brightness(110%);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.flexium-container :deep(button:not(:disabled):active) {
  transform: translateY(0);
  filter: brightness(90%);
}
</style>
