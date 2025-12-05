<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { f, render } from 'flexium/dom'
import { Row, Column, Spacer } from 'flexium/primitives'

const container = ref(null)

function SpacerDemoApp() {
  // Helper to create a colored box
  const createBox = (text, color) => {
    return f('div', {
      style: {
        backgroundColor: color,
        padding: '12px 20px',
        borderRadius: '6px',
        color: 'white',
        fontWeight: '600',
        fontSize: '14px',
        textAlign: 'center',
      }
    }, [text])
  }

  return f('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      width: '100%',
    }
  }, [
    // Demo 1: Before/After Comparison
    f('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [
      f('h4', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#374151' } }, ['Push Items Apart']),

      // Without Spacer
      f('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } }, [
        f('p', { style: { margin: '0', fontSize: '12px', color: '#6b7280' } }, ['Without Spacer:']),
        Row({
          gap: 8,
          style: {
            backgroundColor: '#f3f4f6',
            padding: '16px',
            borderRadius: '8px',
          }
        }, [
          createBox('Left', '#3b82f6'),
          createBox('Right', '#ec4899'),
        ])
      ]),

      // With Spacer
      f('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } }, [
        f('p', { style: { margin: '0', fontSize: '12px', color: '#6b7280' } }, ['With Spacer (pushes items apart):']),
        Row({
          gap: 8,
          style: {
            backgroundColor: '#f3f4f6',
            padding: '16px',
            borderRadius: '8px',
          }
        }, [
          createBox('Left', '#3b82f6'),
          Spacer({ style: { backgroundColor: '#dbeafe', borderRadius: '4px' } }),
          createBox('Right', '#ec4899'),
        ])
      ]),
    ]),

    // Demo 2: Fixed Size Spacer
    f('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [
      f('h4', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#374151' } }, ['Fixed Size Spacer']),
      f('p', { style: { margin: '0', fontSize: '12px', color: '#6b7280' } }, ['Spacer with size={40} creates a fixed 40px gap']),

      Column({
        gap: 0,
        style: {
          backgroundColor: '#f3f4f6',
          padding: '16px',
          borderRadius: '8px',
        }
      }, [
        createBox('Item 1', '#8b5cf6'),
        Spacer({ size: 40, style: { backgroundColor: '#e9d5ff', borderRadius: '4px' } }),
        createBox('Item 2', '#10b981'),
      ])
    ]),

    // Demo 3: Multiple Spacers for Even Distribution
    f('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [
      f('h4', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#374151' } }, ['Multiple Spacers for Distribution']),
      f('p', { style: { margin: '0', fontSize: '12px', color: '#6b7280' } }, ['Each Spacer has flex: 1, distributing space evenly']),

      Row({
        style: {
          backgroundColor: '#f3f4f6',
          padding: '16px',
          borderRadius: '8px',
        }
      }, [
        createBox('A', '#3b82f6'),
        Spacer({ style: { backgroundColor: '#dbeafe', borderRadius: '4px', minHeight: '4px' } }),
        createBox('B', '#8b5cf6'),
        Spacer({ style: { backgroundColor: '#dbeafe', borderRadius: '4px', minHeight: '4px' } }),
        createBox('C', '#ec4899'),
        Spacer({ style: { backgroundColor: '#dbeafe', borderRadius: '4px', minHeight: '4px' } }),
        createBox('D', '#10b981'),
      ])
    ]),

    // Demo 4: Toolbar Example
    f('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [
      f('h4', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#374151' } }, ['Toolbar Example']),
      f('p', { style: { margin: '0', fontSize: '12px', color: '#6b7280' } }, ['Common pattern: Left actions, spacer, right actions']),

      Row({
        gap: 8,
        align: 'center',
        style: {
          backgroundColor: '#ffffff',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
        }
      }, [
        f('div', { style: { fontSize: '18px', fontWeight: '600', color: '#111827' } }, ['My App']),
        Spacer(),
        f('button', {
          style: {
            padding: '8px 16px',
            backgroundColor: 'transparent',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            color: '#374151',
          }
        }, ['Sign In']),
        f('button', {
          style: {
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            color: 'white',
          }
        }, ['Sign Up']),
      ])
    ]),

    // Demo 5: Vertical Spacer in Column
    f('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [
      f('h4', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#374151' } }, ['Vertical Spacer in Column']),
      f('p', { style: { margin: '0', fontSize: '12px', color: '#6b7280' } }, ['Spacer pushes footer to the bottom']),

      Column({
        style: {
          backgroundColor: '#f3f4f6',
          padding: '20px',
          borderRadius: '8px',
          minHeight: '300px',
        }
      }, [
        f('h5', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#111827' } }, ['Header']),
        f('p', { style: { margin: '8px 0 0 0', fontSize: '14px', color: '#6b7280' } }, ['Some content here']),

        Spacer({ style: { backgroundColor: '#e5e7eb', borderRadius: '4px', minWidth: '4px' } }),

        f('div', {
          style: {
            padding: '12px',
            backgroundColor: '#3b82f6',
            color: 'white',
            borderRadius: '6px',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: '600',
          }
        }, ['Footer (pushed to bottom)'])
      ])
    ]),

    // Demo 6: Custom Flex Values
    f('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [
      f('h4', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#374151' } }, ['Custom Flex Values']),
      f('p', { style: { margin: '0', fontSize: '12px', color: '#6b7280' } }, ['First spacer has flex={2}, second has flex={1}']),

      Row({
        style: {
          backgroundColor: '#f3f4f6',
          padding: '16px',
          borderRadius: '8px',
        }
      }, [
        createBox('Start', '#3b82f6'),
        Spacer({ flex: 2, style: { backgroundColor: '#dbeafe', borderRadius: '4px', minHeight: '4px' } }),
        createBox('Middle', '#8b5cf6'),
        Spacer({ flex: 1, style: { backgroundColor: '#e9d5ff', borderRadius: '4px', minHeight: '4px' } }),
        createBox('End', '#ec4899'),
      ])
    ]),

    // Demo 7: Explicit Width/Height
    f('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [
      f('h4', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#374151' } }, ['Explicit Dimensions']),
      f('p', { style: { margin: '0', fontSize: '12px', color: '#6b7280' } }, ['Spacer with width={100} and height={60}']),

      Row({
        gap: 16,
        align: 'center',
        style: {
          backgroundColor: '#f3f4f6',
          padding: '16px',
          borderRadius: '8px',
        }
      }, [
        createBox('Before', '#10b981'),
        Spacer({
          width: 100,
          height: 60,
          style: {
            backgroundColor: '#a7f3d0',
            borderRadius: '4px',
            border: '2px dashed #059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: '#065f46',
            fontWeight: '600',
          }
        }, ['100×60']),
        createBox('After', '#f59e0b'),
      ])
    ]),
  ])
}

onMounted(() => {
  if (container.value) {
    const app = SpacerDemoApp()
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
  margin: 24px 0;
  padding: 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
}

.flexium-container {
  width: 100%;
}
</style>
