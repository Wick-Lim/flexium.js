<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { f, render } from 'flexium/dom'
import { Grid, Column } from 'flexium/primitives'

const container = ref(null)

function GridDemoApp() {
  // Helper to create a grid item
  const createGridItem = (number, color) => {
    return f('div', {
      style: {
        backgroundColor: color,
        padding: '24px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
        fontSize: '18px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80px',
      }
    }, [String(number)])
  }

  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316']

  return f('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      width: '100%',
    }
  }, [
    // Demo 1: Basic 3-Column Grid
    f('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [
      f('h4', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#374151' } }, ['Basic Grid (cols={3})']),
      Grid({
        cols: 3,
        gap: 16,
        style: {
          backgroundColor: '#f3f4f6',
          padding: '16px',
          borderRadius: '8px'
        }
      }, [
        createGridItem(1, colors[0]),
        createGridItem(2, colors[1]),
        createGridItem(3, colors[2]),
        createGridItem(4, colors[3]),
        createGridItem(5, colors[4]),
        createGridItem(6, colors[5]),
      ])
    ]),

    // Demo 2: Responsive Grid
    f('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [
      f('h4', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#374151' } }, ['Responsive Grid']),
      f('p', { style: { margin: '0', fontSize: '12px', color: '#6b7280' } }, ['cols={{ base: 1, md: 2, lg: 3 }} - Resize window to see effect']),
      Grid({
        cols: { base: 1, md: 2, lg: 3 },
        gap: 16,
        style: {
          backgroundColor: '#f3f4f6',
          padding: '16px',
          borderRadius: '8px'
        }
      }, [
        createGridItem(1, colors[6]),
        createGridItem(2, colors[7]),
        createGridItem(3, colors[8]),
        createGridItem(4, colors[0]),
        createGridItem(5, colors[1]),
        createGridItem(6, colors[2]),
      ])
    ]),

    // Demo 3: Different Column Sizes
    f('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [
      f('h4', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#374151' } }, ['Custom Column Template']),
      f('p', { style: { margin: '0', fontSize: '12px', color: '#6b7280' } }, ['cols="2fr 1fr 1fr" - First column is twice as wide']),
      Grid({
        cols: '2fr 1fr 1fr',
        gap: 16,
        style: {
          backgroundColor: '#f3f4f6',
          padding: '16px',
          borderRadius: '8px'
        }
      }, [
        createGridItem('2x', colors[3]),
        createGridItem('1x', colors[4]),
        createGridItem('1x', colors[5]),
      ])
    ]),

    // Demo 4: Column and Row Gap
    f('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [
      f('h4', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#374151' } }, ['Different Row & Column Gaps']),
      f('p', { style: { margin: '0', fontSize: '12px', color: '#6b7280' } }, ['columnGap={24}, rowGap={8}']),
      Grid({
        cols: 4,
        columnGap: 24,
        rowGap: 8,
        style: {
          backgroundColor: '#f3f4f6',
          padding: '16px',
          borderRadius: '8px'
        }
      }, [
        createGridItem(1, colors[0]),
        createGridItem(2, colors[1]),
        createGridItem(3, colors[2]),
        createGridItem(4, colors[3]),
        createGridItem(5, colors[4]),
        createGridItem(6, colors[5]),
        createGridItem(7, colors[6]),
        createGridItem(8, colors[7]),
      ])
    ]),

    // Demo 5: Card Grid Example
    f('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [
      f('h4', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#374151' } }, ['Product Card Grid']),
      Grid({
        cols: { base: 1, md: 2, lg: 3 },
        gap: 20,
      }, [
        // Card 1
        Column({
          gap: 12,
          style: {
            backgroundColor: '#ffffff',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
          }
        }, [
          f('div', {
            style: {
              backgroundColor: '#3b82f6',
              height: '120px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
            }
          }, ['📱']),
          f('h5', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#111827' } }, ['Product 1']),
          f('p', { style: { margin: '0', fontSize: '14px', color: '#6b7280' } }, ['Description of product 1']),
          f('div', { style: { fontSize: '18px', fontWeight: 'bold', color: '#3b82f6' } }, ['$99.99']),
        ]),

        // Card 2
        Column({
          gap: 12,
          style: {
            backgroundColor: '#ffffff',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
          }
        }, [
          f('div', {
            style: {
              backgroundColor: '#8b5cf6',
              height: '120px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
            }
          }, ['💻']),
          f('h5', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#111827' } }, ['Product 2']),
          f('p', { style: { margin: '0', fontSize: '14px', color: '#6b7280' } }, ['Description of product 2']),
          f('div', { style: { fontSize: '18px', fontWeight: 'bold', color: '#8b5cf6' } }, ['$199.99']),
        ]),

        // Card 3
        Column({
          gap: 12,
          style: {
            backgroundColor: '#ffffff',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
          }
        }, [
          f('div', {
            style: {
              backgroundColor: '#ec4899',
              height: '120px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
            }
          }, ['🎧']),
          f('h5', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#111827' } }, ['Product 3']),
          f('p', { style: { margin: '0', fontSize: '14px', color: '#6b7280' } }, ['Description of product 3']),
          f('div', { style: { fontSize: '18px', fontWeight: 'bold', color: '#ec4899' } }, ['$79.99']),
        ]),
      ])
    ]),
  ])
}

onMounted(() => {
  if (container.value) {
    const app = GridDemoApp()
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
