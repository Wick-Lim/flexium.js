<script setup>
import { onMounted, ref } from 'vue'

const container = ref(null)

onMounted(() => {
  if (!container.value) return

  const createBox = (text, color) => `
    <div style="background: ${color}; padding: 16px 24px; border-radius: 8px; color: white; font-weight: 600; font-size: 14px; text-align: center; min-width: 60px;">
      ${text}
    </div>
  `

  container.value.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 32px; padding: 24px; background: #f9fafb; border-radius: 12px;">
      <div>
        <h3 style="margin: 0 0 4px 0; color: #111; font-size: 20px; font-weight: 600;">Row Component Demo</h3>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Horizontal flex layout with gap, alignment, and wrapping</p>
      </div>

      <!-- Basic Row -->
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Basic Row with Gap</h4>
        <div style="display: flex; flex-direction: row; gap: 16px;">
          ${createBox('Box 1', '#3b82f6')}
          ${createBox('Box 2', '#8b5cf6')}
          ${createBox('Box 3', '#ec4899')}
        </div>
      </div>

      <!-- Vertical Alignment -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Vertical Alignment (align)</h4>

        <div style="display: flex; flex-direction: column; gap: 4px;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">align="start"</p>
          <div style="display: flex; flex-direction: row; gap: 16px; align-items: flex-start; background: #f3f4f6; padding: 16px; border-radius: 8px; min-height: 100px;">
            <div style="background: #3b82f6; padding: 24px; border-radius: 8px; color: white; font-weight: 600;">Tall</div>
            <div style="background: #8b5cf6; padding: 12px; border-radius: 8px; color: white; font-weight: 600;">Short</div>
            <div style="background: #ec4899; padding: 18px; border-radius: 8px; color: white; font-weight: 600;">Medium</div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 4px;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">align="center"</p>
          <div style="display: flex; flex-direction: row; gap: 16px; align-items: center; background: #f3f4f6; padding: 16px; border-radius: 8px; min-height: 100px;">
            <div style="background: #3b82f6; padding: 24px; border-radius: 8px; color: white; font-weight: 600;">Tall</div>
            <div style="background: #8b5cf6; padding: 12px; border-radius: 8px; color: white; font-weight: 600;">Short</div>
            <div style="background: #ec4899; padding: 18px; border-radius: 8px; color: white; font-weight: 600;">Medium</div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 4px;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">align="end"</p>
          <div style="display: flex; flex-direction: row; gap: 16px; align-items: flex-end; background: #f3f4f6; padding: 16px; border-radius: 8px; min-height: 100px;">
            <div style="background: #3b82f6; padding: 24px; border-radius: 8px; color: white; font-weight: 600;">Tall</div>
            <div style="background: #8b5cf6; padding: 12px; border-radius: 8px; color: white; font-weight: 600;">Short</div>
            <div style="background: #ec4899; padding: 18px; border-radius: 8px; color: white; font-weight: 600;">Medium</div>
          </div>
        </div>
      </div>

      <!-- Horizontal Distribution -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Horizontal Distribution (justify)</h4>

        <div style="display: flex; flex-direction: column; gap: 4px;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">justify="start"</p>
          <div style="display: flex; flex-direction: row; gap: 16px; justify-content: flex-start; background: #f3f4f6; padding: 16px; border-radius: 8px;">
            ${createBox('A', '#10b981')}
            ${createBox('B', '#f59e0b')}
            ${createBox('C', '#ef4444')}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 4px;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">justify="center"</p>
          <div style="display: flex; flex-direction: row; gap: 16px; justify-content: center; background: #f3f4f6; padding: 16px; border-radius: 8px;">
            ${createBox('A', '#10b981')}
            ${createBox('B', '#f59e0b')}
            ${createBox('C', '#ef4444')}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 4px;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">justify="between"</p>
          <div style="display: flex; flex-direction: row; justify-content: space-between; background: #f3f4f6; padding: 16px; border-radius: 8px;">
            ${createBox('A', '#10b981')}
            ${createBox('B', '#f59e0b')}
            ${createBox('C', '#ef4444')}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 4px;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">justify="evenly"</p>
          <div style="display: flex; flex-direction: row; justify-content: space-evenly; background: #f3f4f6; padding: 16px; border-radius: 8px;">
            ${createBox('A', '#10b981')}
            ${createBox('B', '#f59e0b')}
            ${createBox('C', '#ef4444')}
          </div>
        </div>
      </div>

      <!-- Wrapping -->
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Wrapping (wrap={true})</h4>
        <div style="display: flex; flex-direction: row; gap: 12px; flex-wrap: wrap; background: #f3f4f6; padding: 16px; border-radius: 8px;">
          ${createBox('Tag 1', '#3b82f6')}
          ${createBox('Tag 2', '#8b5cf6')}
          ${createBox('Tag 3', '#ec4899')}
          ${createBox('Tag 4', '#10b981')}
          ${createBox('Tag 5', '#f59e0b')}
          ${createBox('Tag 6', '#ef4444')}
          ${createBox('Tag 7', '#06b6d4')}
          ${createBox('Tag 8', '#84cc16')}
        </div>
      </div>
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
