<script setup>
import { onMounted, ref } from 'vue'

const container = ref(null)

onMounted(() => {
  if (!container.value) return

  const createBox = (text, color) => `
    <div style="background: ${color}; padding: 16px 24px; border-radius: 8px; color: white; font-weight: 600; font-size: 14px; text-align: center;">
      ${text}
    </div>
  `

  container.value.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 32px; padding: 24px; background: #f9fafb; border-radius: 12px;">
      <div>
        <h3 style="margin: 0 0 4px 0; color: #111; font-size: 20px; font-weight: 600;">Column Component Demo</h3>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Vertical flex layout with gap and alignment options</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px;">
        <!-- Basic Column -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #374151;">Basic Column</h4>
          <div style="display: flex; flex-direction: column; gap: 12px; background: #f3f4f6; padding: 16px; border-radius: 8px;">
            ${createBox('Item 1', '#3b82f6')}
            ${createBox('Item 2', '#8b5cf6')}
            ${createBox('Item 3', '#ec4899')}
          </div>
        </div>

        <!-- Align Start -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #374151;">align="start"</h4>
          <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start; background: #f3f4f6; padding: 16px; border-radius: 8px;">
            ${createBox('Short', '#10b981')}
            ${createBox('Medium Width', '#f59e0b')}
            ${createBox('Long Content Here', '#ef4444')}
          </div>
        </div>

        <!-- Align Center -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #374151;">align="center"</h4>
          <div style="display: flex; flex-direction: column; gap: 12px; align-items: center; background: #f3f4f6; padding: 16px; border-radius: 8px;">
            ${createBox('Short', '#10b981')}
            ${createBox('Medium Width', '#f59e0b')}
            ${createBox('Long Content Here', '#ef4444')}
          </div>
        </div>

        <!-- Align End -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #374151;">align="end"</h4>
          <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-end; background: #f3f4f6; padding: 16px; border-radius: 8px;">
            ${createBox('Short', '#10b981')}
            ${createBox('Medium Width', '#f59e0b')}
            ${createBox('Long Content Here', '#ef4444')}
          </div>
        </div>

        <!-- Align Stretch -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #374151;">align="stretch"</h4>
          <div style="display: flex; flex-direction: column; gap: 12px; align-items: stretch; background: #f3f4f6; padding: 16px; border-radius: 8px;">
            ${createBox('Full Width', '#06b6d4')}
            ${createBox('Also Full', '#8b5cf6')}
            ${createBox('Stretched', '#ec4899')}
          </div>
        </div>

        <!-- Different Gaps -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #374151;">gap={24}</h4>
          <div style="display: flex; flex-direction: column; gap: 24px; background: #f3f4f6; padding: 16px; border-radius: 8px;">
            ${createBox('Wide', '#3b82f6')}
            ${createBox('Gap', '#8b5cf6')}
            ${createBox('Spacing', '#ec4899')}
          </div>
        </div>
      </div>

      <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center;">
        Column uses flexbox with flex-direction: column for vertical layouts
      </p>
    </div>
  `
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
