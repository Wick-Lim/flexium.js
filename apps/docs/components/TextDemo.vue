<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { state } from 'flexium/core'
import { f, render } from 'flexium/dom'
import { Text, Column, Row, Pressable } from 'flexium/primitives'

const container = ref(null)

function TextDemo() {
  const [dynamicText, setDynamicText] = state('Dynamic Text')
  const [counter, setCounter] = state(0)

  const texts = [
    'Dynamic Text',
    'Hello World!',
    'Flexium is awesome!',
    'Cross-platform UI',
  ]

  const rotateText = () => {
    setCounter(c => {
      const next = (c + 1) % texts.length
      setDynamicText(texts[next])
      return next
    })
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
    }, ['Text Component']),

    // Font sizes
    f('h4', {
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '8px',
      }
    }, ['Font Sizes']),

    Column({ gap: 8 }, [
      Text({
        style: {
          fontSize: '12px',
          color: '#374151',
        }
      }, ['Small text (12px)']),

      Text({
        style: {
          fontSize: '14px',
          color: '#374151',
        }
      }, ['Normal text (14px)']),

      Text({
        style: {
          fontSize: '16px',
          color: '#374151',
        }
      }, ['Medium text (16px)']),

      Text({
        style: {
          fontSize: '20px',
          color: '#374151',
        }
      }, ['Large text (20px)']),

      Text({
        style: {
          fontSize: '24px',
          color: '#374151',
        }
      }, ['Extra large text (24px)']),

      Text({
        style: {
          fontSize: '32px',
          color: '#374151',
        }
      }, ['Heading text (32px)']),
    ]),

    // Font weights
    f('h4', {
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151',
        marginTop: '16px',
        marginBottom: '8px',
      }
    }, ['Font Weights']),

    Column({ gap: 8 }, [
      Text({
        style: {
          fontSize: '16px',
          fontWeight: '300',
          color: '#374151',
        }
      }, ['Light weight (300)']),

      Text({
        style: {
          fontSize: '16px',
          fontWeight: '400',
          color: '#374151',
        }
      }, ['Normal weight (400)']),

      Text({
        style: {
          fontSize: '16px',
          fontWeight: '500',
          color: '#374151',
        }
      }, ['Medium weight (500)']),

      Text({
        style: {
          fontSize: '16px',
          fontWeight: '600',
          color: '#374151',
        }
      }, ['Semibold weight (600)']),

      Text({
        style: {
          fontSize: '16px',
          fontWeight: '700',
          color: '#374151',
        }
      }, ['Bold weight (700)']),

      Text({
        style: {
          fontSize: '16px',
          fontWeight: '800',
          color: '#374151',
        }
      }, ['Extra bold weight (800)']),
    ]),

    // Colors
    f('h4', {
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151',
        marginTop: '16px',
        marginBottom: '8px',
      }
    }, ['Text Colors']),

    Row({ gap: 12, wrap: true }, [
      Text({
        style: {
          fontSize: '16px',
          color: '#111827',
          fontWeight: '600',
        }
      }, ['Black']),

      Text({
        style: {
          fontSize: '16px',
          color: '#6b7280',
          fontWeight: '600',
        }
      }, ['Gray']),

      Text({
        style: {
          fontSize: '16px',
          color: '#4f46e5',
          fontWeight: '600',
        }
      }, ['Indigo']),

      Text({
        style: {
          fontSize: '16px',
          color: '#10b981',
          fontWeight: '600',
        }
      }, ['Green']),

      Text({
        style: {
          fontSize: '16px',
          color: '#f59e0b',
          fontWeight: '600',
        }
      }, ['Amber']),

      Text({
        style: {
          fontSize: '16px',
          color: '#ef4444',
          fontWeight: '600',
        }
      }, ['Red']),
    ]),

    // Text styles
    f('h4', {
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151',
        marginTop: '16px',
        marginBottom: '8px',
      }
    }, ['Text Styles']),

    Column({ gap: 8 }, [
      Text({
        style: {
          fontSize: '16px',
          color: '#374151',
          fontStyle: 'italic',
        }
      }, ['Italic text']),

      Text({
        style: {
          fontSize: '16px',
          color: '#374151',
          textDecoration: 'underline',
        }
      }, ['Underlined text']),

      Text({
        style: {
          fontSize: '16px',
          color: '#374151',
          textDecoration: 'line-through',
        }
      }, ['Strikethrough text']),

      Text({
        style: {
          fontSize: '16px',
          color: '#374151',
          textTransform: 'uppercase',
        }
      }, ['Uppercase text']),

      Text({
        style: {
          fontSize: '16px',
          color: '#374151',
          textTransform: 'lowercase',
        }
      }, ['LOWERCASE TEXT']),

      Text({
        style: {
          fontSize: '16px',
          color: '#374151',
          textTransform: 'capitalize',
        }
      }, ['capitalized text']),
    ]),

    // Text alignment
    f('h4', {
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151',
        marginTop: '16px',
        marginBottom: '8px',
      }
    }, ['Text Alignment']),

    Column({ gap: 8, style: { width: '100%' } }, [
      Text({
        style: {
          fontSize: '16px',
          color: '#374151',
          textAlign: 'left',
          display: 'block',
          width: '100%',
        }
      }, ['Left aligned text']),

      Text({
        style: {
          fontSize: '16px',
          color: '#374151',
          textAlign: 'center',
          display: 'block',
          width: '100%',
        }
      }, ['Center aligned text']),

      Text({
        style: {
          fontSize: '16px',
          color: '#374151',
          textAlign: 'right',
          display: 'block',
          width: '100%',
        }
      }, ['Right aligned text']),
    ]),

    // Dynamic text
    f('h4', {
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151',
        marginTop: '16px',
        marginBottom: '8px',
      }
    }, ['Dynamic Text']),

    Column({ gap: 12, align: 'start' }, [
      f('div', {
        style: {
          padding: '16px',
          backgroundColor: '#eff6ff',
          borderRadius: '8px',
          border: '2px solid #4f46e5',
        }
      }, [
        Text({
          style: {
            fontSize: '18px',
            fontWeight: '700',
            color: '#4f46e5',
          }
        }, [dynamicText])
      ]),

      Pressable({
        onPress: rotateText,
        style: {
          padding: '12px 24px',
          backgroundColor: '#4f46e5',
          borderRadius: '8px',
          cursor: 'pointer',
        }
      }, [
        Text({
          style: {
            color: 'white',
            fontWeight: '600',
          }
        }, ['Change Text'])
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
    }, ['The Text component is a universal primitive for displaying text with full styling support.'])
  ])
}

onMounted(() => {
  if (container.value) {
    const app = TextDemo()
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
