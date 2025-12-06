<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const container = ref(null)

onMounted(() => {
  if (!container.value) return

  const createBox = (text, color) => `
    <div style="background: ${color}; padding: 20px; border-radius: 8px; color: white; font-weight: 600; font-size: 14px; text-align: center;">
      ${text}
    </div>
  `

  container.value.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 32px; padding: 24px; background: #f9fafb; border-radius: 12px;">
      <div>
        <h3 style="margin: 0 0 4px 0; color: #111; font-size: 20px; font-weight: 600;">Grid Component Demo</h3>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">CSS Grid layout with columns, rows, and gap controls</p>
      </div>

      <!-- Fixed Columns -->
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Fixed Columns (columns={3})</h4>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: #f3f4f6; padding: 16px; border-radius: 8px;">
          ${createBox('1', '#3b82f6')}
          ${createBox('2', '#8b5cf6')}
          ${createBox('3', '#ec4899')}
          ${createBox('4', '#10b981')}
          ${createBox('5', '#f59e0b')}
          ${createBox('6', '#ef4444')}
        </div>
      </div>

      <!-- Auto-fit Responsive -->
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Responsive (minChildWidth={150})</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; background: #f3f4f6; padding: 16px; border-radius: 8px;">
          ${createBox('Card 1', '#06b6d4')}
          ${createBox('Card 2', '#84cc16')}
          ${createBox('Card 3', '#f97316')}
          ${createBox('Card 4', '#a855f7')}
          ${createBox('Card 5', '#14b8a6')}
        </div>
      </div>

      <!-- Different Gaps -->
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Column & Row Gap (columnGap={24}, rowGap={8})</h4>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); column-gap: 24px; row-gap: 8px; background: #f3f4f6; padding: 16px; border-radius: 8px;">
          ${createBox('A', '#3b82f6')}
          ${createBox('B', '#8b5cf6')}
          ${createBox('C', '#ec4899')}
          ${createBox('D', '#10b981')}
          ${createBox('E', '#f59e0b')}
          ${createBox('F', '#ef4444')}
        </div>
      </div>

      <!-- 4 Columns -->
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Four Columns (columns={4})</h4>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; background: #f3f4f6; padding: 16px; border-radius: 8px;">
          ${[1,2,3,4,5,6,7,8].map(i => createBox(i, `hsl(${i * 40}, 70%, 50%)`)).join('')}
        </div>
      </div>

      <!-- Template Areas Example -->
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Custom Template</h4>
        <div style="display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 12px; background: #f3f4f6; padding: 16px; border-radius: 8px;">
          <div style="background: #3b82f6; padding: 20px; border-radius: 8px; color: white; font-weight: 600; text-align: center;">Sidebar</div>
          <div style="background: #10b981; padding: 40px 20px; border-radius: 8px; color: white; font-weight: 600; text-align: center;">Main Content (2fr)</div>
          <div style="background: #f59e0b; padding: 20px; border-radius: 8px; color: white; font-weight: 600; text-align: center;">Aside</div>
        </div>
      </div>

      <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center;">
        Grid uses CSS Grid for powerful two-dimensional layouts
      </p>
    </div>
  `
})

onUnmounted(() => {
  if (container.value) {
    container.value.innerHTML = ''
  }
})
</script>

<template>
  <div class="showcase-wrapper">
    <div ref="container" class="flexium-container"></div>
  </div>
</template>

<style scoped>
.showcase-wrapper {
  margin: 40px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
}
</style>
