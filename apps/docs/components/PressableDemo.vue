<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { state } from 'flexium/core'
import { f, render } from 'flexium/dom'
import { Pressable, Text, Row, Column } from 'flexium/primitives'

const container = ref(null)

function PressableDemo() {
  const [pressCount, setPressCount] = state(0)
  const [isPressed1, setIsPressed1] = state(false)
  const [isPressed2, setIsPressed2] = state(false)
  const [isPressed3, setIsPressed3] = state(false)
  const [lastAction, setLastAction] = state('None')

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
    }, ['Pressable Component']),

    // Status display
    f('div', {
      style: {
        padding: '12px 16px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
      }
    }, [
      f('div', {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }
      }, [
        f('span', {
          style: {
            fontSize: '14px',
            color: '#6b7280',
          }
        }, ['Press Count:']),
        f('span', {
          style: {
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#4f46e5',
          }
        }, [pressCount])
      ]),
      f('div', {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
        }
      }, [
        f('span', {
          style: {
            fontSize: '14px',
            color: '#6b7280',
          }
        }, ['Last Action:']),
        f('span', {
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#10b981',
          }
        }, [lastAction])
      ])
    ]),

    // Basic pressable
    f('h4', {
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '8px',
      }
    }, ['Basic Pressable']),

    Pressable({
      onPress: () => {
        setPressCount(c => c + 1)
        setLastAction('Basic Press')
      },
      style: {
        padding: '16px 24px',
        backgroundColor: '#4f46e5',
        borderRadius: '8px',
        display: 'inline-block',
        cursor: 'pointer',
      }
    }, [
      Text({
        style: {
          color: 'white',
          fontWeight: '600',
          fontSize: '16px',
        }
      }, ['Click Me'])
    ]),

    // Pressable with visual feedback
    f('h4', {
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151',
        marginTop: '16px',
        marginBottom: '8px',
      }
    }, ['With Press Feedback (onPressIn/Out)']),

    Pressable({
      onPress: () => {
        setPressCount(c => c + 1)
        setLastAction('Press with Feedback')
      },
      onPressIn: () => setIsPressed1(true),
      onPressOut: () => setIsPressed1(false),
      style: {
        padding: '16px 24px',
        backgroundColor: () => isPressed1() ? '#3730a3' : '#4f46e5',
        borderRadius: '8px',
        display: 'inline-block',
        cursor: 'pointer',
        transform: () => isPressed1() ? 'scale(0.98)' : 'scale(1)',
        transition: 'all 0.1s',
      }
    }, [
      Text({
        style: {
          color: 'white',
          fontWeight: '600',
          fontSize: '16px',
        }
      }, [() => isPressed1() ? 'Pressing...' : 'Press Me'])
    ]),

    // Multiple pressables in a row
    f('h4', {
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151',
        marginTop: '16px',
        marginBottom: '8px',
      }
    }, ['Interactive Cards']),

    Row({ gap: 12, wrap: true }, [
      // Card 1
      Pressable({
        onPress: () => {
          setPressCount(c => c + 1)
          setLastAction('Pressed Card 1')
        },
        onPressIn: () => setIsPressed2(true),
        onPressOut: () => setIsPressed2(false),
        style: {
          padding: '20px',
          backgroundColor: 'white',
          border: () => isPressed2() ? '2px solid #4f46e5' : '2px solid #e5e7eb',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: () => isPressed2()
            ? '0 8px 16px rgba(79, 70, 229, 0.2)'
            : '0 2px 4px rgba(0, 0, 0, 0.1)',
          transform: () => isPressed2() ? 'translateY(-2px)' : 'translateY(0)',
          minWidth: '150px',
        }
      }, [
        Column({ gap: 8 }, [
          f('div', {
            style: {
              fontSize: '32px',
            }
          }, ['🎨']),
          Text({
            style: {
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827',
            }
          }, ['Design']),
          Text({
            style: {
              fontSize: '14px',
              color: '#6b7280',
            }
          }, ['Click to select'])
        ])
      ]),

      // Card 2
      Pressable({
        onPress: () => {
          setPressCount(c => c + 1)
          setLastAction('Pressed Card 2')
        },
        onPressIn: () => setIsPressed3(true),
        onPressOut: () => setIsPressed3(false),
        style: {
          padding: '20px',
          backgroundColor: 'white',
          border: () => isPressed3() ? '2px solid #10b981' : '2px solid #e5e7eb',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: () => isPressed3()
            ? '0 8px 16px rgba(16, 185, 129, 0.2)'
            : '0 2px 4px rgba(0, 0, 0, 0.1)',
          transform: () => isPressed3() ? 'translateY(-2px)' : 'translateY(0)',
          minWidth: '150px',
        }
      }, [
        Column({ gap: 8 }, [
          f('div', {
            style: {
              fontSize: '32px',
            }
          }, ['⚡']),
          Text({
            style: {
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827',
            }
          }, ['Development']),
          Text({
            style: {
              fontSize: '14px',
              color: '#6b7280',
            }
          }, ['Click to select'])
        ])
      ]),
    ]),

    // Disabled state
    f('h4', {
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151',
        marginTop: '16px',
        marginBottom: '8px',
      }
    }, ['Disabled State']),

    Row({ gap: 12 }, [
      Pressable({
        onPress: () => {
          setPressCount(c => c + 1)
          setLastAction('Enabled Press')
        },
        style: {
          padding: '12px 24px',
          backgroundColor: '#10b981',
          borderRadius: '8px',
          display: 'inline-block',
          cursor: 'pointer',
        }
      }, [
        Text({
          style: {
            color: 'white',
            fontWeight: '600',
          }
        }, ['Enabled'])
      ]),

      Pressable({
        onPress: () => {
          // This won't fire
        },
        disabled: true,
        style: {
          padding: '12px 24px',
          backgroundColor: '#9ca3af',
          borderRadius: '8px',
          display: 'inline-block',
        }
      }, [
        Text({
          style: {
            color: 'white',
            fontWeight: '600',
          }
        }, ['Disabled'])
      ]),
    ]),

    // Info text
    f('p', {
      style: {
        marginTop: '16px',
        color: '#6b7280',
        fontSize: '14px',
        fontStyle: 'italic',
      }
    }, ['Pressable provides a cross-platform wrapper for handling touch and click events. Try pressing the different areas to see visual feedback!'])
  ])
}

onMounted(() => {
  if (container.value) {
    const app = PressableDemo()
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
</style>
