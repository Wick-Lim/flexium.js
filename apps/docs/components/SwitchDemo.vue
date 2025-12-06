<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const container = ref(null)

onMounted(() => {
  if (!container.value) return

  let status = 'idle' // idle, loading, success, error

  const getStatusContent = () => {
    switch (status) {
      case 'loading':
        return `
          <div style="padding: 24px; background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 8px;">⏳</div>
            <div style="font-weight: 600; color: #92400e;">Loading...</div>
            <div style="font-size: 13px; color: #a16207; margin-top: 4px;">Please wait while we fetch data</div>
          </div>
        `
      case 'success':
        return `
          <div style="padding: 24px; background: #d1fae5; border: 2px solid #10b981; border-radius: 8px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 8px;">✅</div>
            <div style="font-weight: 600; color: #065f46;">Success!</div>
            <div style="font-size: 13px; color: #047857; margin-top: 4px;">Data loaded successfully</div>
          </div>
        `
      case 'error':
        return `
          <div style="padding: 24px; background: #fee2e2; border: 2px solid #ef4444; border-radius: 8px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 8px;">❌</div>
            <div style="font-weight: 600; color: #991b1b;">Error!</div>
            <div style="font-size: 13px; color: #b91c1c; margin-top: 4px;">Something went wrong</div>
          </div>
        `
      default:
        return `
          <div style="padding: 24px; background: #f3f4f6; border: 2px solid #d1d5db; border-radius: 8px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 8px;">💤</div>
            <div style="font-weight: 600; color: #374151;">Idle</div>
            <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">Click a button to change state</div>
          </div>
        `
    }
  }

  const render = () => {
    const btnStyle = (s) => `
      padding: 10px 20px;
      background: ${status === s ? '#4f46e5' : '#e5e7eb'};
      color: ${status === s ? 'white' : '#374151'};
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    `

    container.value.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px; padding: 32px; background: #f9fafb; border-radius: 12px;">
        <div>
          <h3 style="margin: 0 0 4px 0; color: #111; font-size: 20px; font-weight: 600;">Switch & Match Demo</h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Render different content based on multiple conditions</p>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn-idle" style="${btnStyle('idle')}">Idle</button>
          <button class="btn-loading" style="${btnStyle('loading')}">Loading</button>
          <button class="btn-success" style="${btnStyle('success')}">Success</button>
          <button class="btn-error" style="${btnStyle('error')}">Error</button>
        </div>

        <div class="status-content">
          ${getStatusContent()}
        </div>

        <div style="background: #1e1e2e; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 13px; color: #cdd6f4;">
          <div style="color: #89b4fa;">// Current state</div>
          <div>status = <span style="color: #a6e3a1;">"${status}"</span></div>
        </div>
      </div>
    `

    container.value.querySelector('.btn-idle')?.addEventListener('click', () => { status = 'idle'; render() })
    container.value.querySelector('.btn-loading')?.addEventListener('click', () => { status = 'loading'; render() })
    container.value.querySelector('.btn-success')?.addEventListener('click', () => { status = 'success'; render() })
    container.value.querySelector('.btn-error')?.addEventListener('click', () => { status = 'error'; render() })
  }

  render()
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

.flexium-container :deep(button:hover) {
  filter: brightness(110%);
  transform: scale(1.02);
}
</style>
