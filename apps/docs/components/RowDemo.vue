<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { f, render } from 'flexium/dom'
import { Row } from 'flexium/primitives'

const container = ref(null)

function RowDemoApp() {
  // Helper to create a colored box
  const createBox = (text, color) => {
    return f('div', {
      style: {
        backgroundColor: color,
        padding: '16px 24px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
        fontSize: '14px',
        textAlign: 'center',
        minWidth: '80px',
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
    // Demo 1: Basic Row with Gap
    f('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [
      f('h4', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#374151' } }, ['Basic Row with Gap']),
      Row({ gap: 16 }, [
        createBox('Box 1', '#3b82f6'),
        createBox('Box 2', '#8b5cf6'),
        createBox('Box 3', '#ec4899'),
      ])
    ]),

    // Demo 2: Alignment Options
    f('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [
      f('h4', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#374151' } }, ['Vertical Alignment (align)']),

      f('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } }, [
        f('p', { style: { margin: '0', fontSize: '12px', color: '#6b7280' } }, ['align="start"']),
        Row({
          gap: 16,
          align: 'start',
          style: {
            backgroundColor: '#f3f4f6',
            padding: '16px',
            borderRadius: '8px',
            minHeight: '120px'
          }
        }, [
          createBox('Tall\nBox', '#3b82f6'),
          createBox('Short', '#8b5cf6'),
          createBox('Medium\nHeight', '#ec4899'),
        ])
      ]),

      f('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } }, [
        f('p', { style: { margin: '0', fontSize: '12px', color: '#6b7280' } }, ['align="center"']),
        Row({
          gap: 16,
          align: 'center',
          style: {
            backgroundColor: '#f3f4f6',
            padding: '16px',
            borderRadius: '8px',
            minHeight: '120px'
          }
        }, [
          createBox('Tall\nBox', '#3b82f6'),
          createBox('Short', '#8b5cf6'),
          createBox('Medium\nHeight', '#ec4899'),
        ])
      ]),

      f('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } }, [
        f('p', { style: { margin: '0', fontSize: '12px', color: '#6b7280' } }, ['align="end"']),
        Row({
          gap: 16,
          align: 'end',
          style: {
            backgroundColor: '#f3f4f6',
            padding: '16px',
            borderRadius: '8px',
            minHeight: '120px'
          }
        }, [
          createBox('Tall\nBox', '#3b82f6'),
          createBox('Short', '#8b5cf6'),
          createBox('Medium\nHeight', '#ec4899'),
        ])
      ]),
    ]),

    // Demo 3: Justify Options
    f('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [
      f('h4', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#374151' } }, ['Horizontal Distribution (justify)']),

      f('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } }, [
        f('p', { style: { margin: '0', fontSize: '12px', color: '#6b7280' } }, ['justify="start"']),
        Row({
          gap: 16,
          justify: 'start',
          style: {
            backgroundColor: '#f3f4f6',
            padding: '16px',
            borderRadius: '8px'
          }
        }, [
          createBox('A', '#10b981'),
          createBox('B', '#f59e0b'),
          createBox('C', '#ef4444'),
        ])
      ]),

      f('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } }, [
        f('p', { style: { margin: '0', fontSize: '12px', color: '#6b7280' } }, ['justify="center"']),
        Row({
          gap: 16,
          justify: 'center',
          style: {
            backgroundColor: '#f3f4f6',
            padding: '16px',
            borderRadius: '8px'
          }
        }, [
          createBox('A', '#10b981'),
          createBox('B', '#f59e0b'),
          createBox('C', '#ef4444'),
        ])
      ]),

      f('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } }, [
        f('p', { style: { margin: '0', fontSize: '12px', color: '#6b7280' } }, ['justify="between"']),
        Row({
          gap: 16,
          justify: 'between',
          style: {
            backgroundColor: '#f3f4f6',
            padding: '16px',
            borderRadius: '8px'
          }
        }, [
          createBox('A', '#10b981'),
          createBox('B', '#f59e0b'),
          createBox('C', '#ef4444'),
        ])
      ]),

      f('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } }, [
        f('p', { style: { margin: '0', fontSize: '12px', color: '#6b7280' } }, ['justify="evenly"']),
        Row({
          gap: 16,
          justify: 'evenly',
          style: {
            backgroundColor: '#f3f4f6',
            padding: '16px',
            borderRadius: '8px'
          }
        }, [
          createBox('A', '#10b981'),
          createBox('B', '#f59e0b'),
          createBox('C', '#ef4444'),
        ])
      ]),
    ]),

    // Demo 4: Wrapping
    f('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [
      f('h4', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#374151' } }, ['Wrapping (wrap={true})']),
      Row({
        gap: 12,
        wrap: true,
        style: {
          backgroundColor: '#f3f4f6',
          padding: '16px',
          borderRadius: '8px'
        }
      }, [
        createBox('Tag 1', '#3b82f6'),
        createBox('Tag 2', '#8b5cf6'),
        createBox('Tag 3', '#ec4899'),
        createBox('Tag 4', '#10b981'),
        createBox('Tag 5', '#f59e0b'),
        createBox('Tag 6', '#ef4444'),
        createBox('Tag 7', '#06b6d4'),
        createBox('Tag 8', '#84cc16'),
      ])
    ]),
  ])
}

onMounted(() => {
  if (container.value) {
    const app = RowDemoApp()
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
