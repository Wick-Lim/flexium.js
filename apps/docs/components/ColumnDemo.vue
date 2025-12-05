<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { f, render } from 'flexium/dom'
import { Column, Row } from 'flexium/primitives'

const container = ref(null)

function ColumnDemoApp() {
  // Helper to create a colored box
  const createBox = (text, color, width = 'auto') => {
    return f('div', {
      style: {
        backgroundColor: color,
        padding: '16px 24px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
        fontSize: '14px',
        textAlign: 'center',
        width,
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
    // Demo 1: Basic Column with Gap
    f('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [
      f('h4', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#374151' } }, ['Basic Column with Gap']),
      Column({
        gap: 16,
        style: {
          backgroundColor: '#f3f4f6',
          padding: '16px',
          borderRadius: '8px'
        }
      }, [
        createBox('Item 1', '#3b82f6'),
        createBox('Item 2', '#8b5cf6'),
        createBox('Item 3', '#ec4899'),
      ])
    ]),

    // Demo 2: Horizontal Alignment (align)
    f('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [
      f('h4', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#374151' } }, ['Horizontal Alignment (align)']),

      Row({ gap: 16 }, [
        f('div', { style: { flex: '1', display: 'flex', flexDirection: 'column', gap: '8px' } }, [
          f('p', { style: { margin: '0', fontSize: '12px', color: '#6b7280' } }, ['align="start"']),
          Column({
            gap: 12,
            align: 'start',
            style: {
              backgroundColor: '#f3f4f6',
              padding: '16px',
              borderRadius: '8px',
              minHeight: '200px'
            }
          }, [
            createBox('Short', '#3b82f6', '80px'),
            createBox('Medium Width', '#8b5cf6', '140px'),
            createBox('Wide Box', '#ec4899', '180px'),
          ])
        ]),

        f('div', { style: { flex: '1', display: 'flex', flexDirection: 'column', gap: '8px' } }, [
          f('p', { style: { margin: '0', fontSize: '12px', color: '#6b7280' } }, ['align="center"']),
          Column({
            gap: 12,
            align: 'center',
            style: {
              backgroundColor: '#f3f4f6',
              padding: '16px',
              borderRadius: '8px',
              minHeight: '200px'
            }
          }, [
            createBox('Short', '#3b82f6', '80px'),
            createBox('Medium Width', '#8b5cf6', '140px'),
            createBox('Wide Box', '#ec4899', '180px'),
          ])
        ]),

        f('div', { style: { flex: '1', display: 'flex', flexDirection: 'column', gap: '8px' } }, [
          f('p', { style: { margin: '0', fontSize: '12px', color: '#6b7280' } }, ['align="end"']),
          Column({
            gap: 12,
            align: 'end',
            style: {
              backgroundColor: '#f3f4f6',
              padding: '16px',
              borderRadius: '8px',
              minHeight: '200px'
            }
          }, [
            createBox('Short', '#3b82f6', '80px'),
            createBox('Medium Width', '#8b5cf6', '140px'),
            createBox('Wide Box', '#ec4899', '180px'),
          ])
        ]),
      ])
    ]),

    // Demo 3: Vertical Distribution (justify)
    f('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [
      f('h4', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#374151' } }, ['Vertical Distribution (justify)']),

      Row({ gap: 16 }, [
        f('div', { style: { flex: '1', display: 'flex', flexDirection: 'column', gap: '8px' } }, [
          f('p', { style: { margin: '0', fontSize: '12px', color: '#6b7280' } }, ['justify="start"']),
          Column({
            gap: 8,
            justify: 'start',
            style: {
              backgroundColor: '#f3f4f6',
              padding: '16px',
              borderRadius: '8px',
              minHeight: '200px'
            }
          }, [
            createBox('A', '#10b981'),
            createBox('B', '#f59e0b'),
          ])
        ]),

        f('div', { style: { flex: '1', display: 'flex', flexDirection: 'column', gap: '8px' } }, [
          f('p', { style: { margin: '0', fontSize: '12px', color: '#6b7280' } }, ['justify="center"']),
          Column({
            gap: 8,
            justify: 'center',
            style: {
              backgroundColor: '#f3f4f6',
              padding: '16px',
              borderRadius: '8px',
              minHeight: '200px'
            }
          }, [
            createBox('A', '#10b981'),
            createBox('B', '#f59e0b'),
          ])
        ]),

        f('div', { style: { flex: '1', display: 'flex', flexDirection: 'column', gap: '8px' } }, [
          f('p', { style: { margin: '0', fontSize: '12px', color: '#6b7280' } }, ['justify="between"']),
          Column({
            gap: 8,
            justify: 'between',
            style: {
              backgroundColor: '#f3f4f6',
              padding: '16px',
              borderRadius: '8px',
              minHeight: '200px'
            }
          }, [
            createBox('A', '#10b981'),
            createBox('B', '#f59e0b'),
          ])
        ]),
      ])
    ]),

    // Demo 4: Form Layout Example
    f('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [
      f('h4', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#374151' } }, ['Form Layout Example']),
      Column({
        gap: 16,
        style: {
          backgroundColor: '#ffffff',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          maxWidth: '400px'
        }
      }, [
        Column({ gap: 6 }, [
          f('label', { style: { fontSize: '14px', fontWeight: '500', color: '#374151' } }, ['Email']),
          f('input', {
            type: 'email',
            placeholder: 'Enter your email',
            style: {
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
            }
          }),
        ]),

        Column({ gap: 6 }, [
          f('label', { style: { fontSize: '14px', fontWeight: '500', color: '#374151' } }, ['Password']),
          f('input', {
            type: 'password',
            placeholder: 'Enter your password',
            style: {
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
            }
          }),
        ]),

        f('button', {
          style: {
            padding: '12px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '8px',
          }
        }, ['Sign In'])
      ])
    ]),
  ])
}

onMounted(() => {
  if (container.value) {
    const app = ColumnDemoApp()
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
