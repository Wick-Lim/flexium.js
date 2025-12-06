<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const container = ref(null)

onMounted(() => {
  if (!container.value) return

  let clickCount = 0
  let isLoading = false

  const render = () => {
    const btnStyle = (variant) => {
      const variants = {
        primary: 'background: #4f46e5; color: white; border: none;',
        secondary: 'background: #6b7280; color: white; border: none;',
        outline: 'background: transparent; color: #4f46e5; border: 2px solid #4f46e5;',
        ghost: 'background: transparent; color: #4f46e5; border: none;',
        danger: 'background: #ef4444; color: white; border: none;',
      }
      return `padding: 12px 24px; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s; ${variants[variant]}`
    }

    container.value.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px; padding: 24px; background: #f9fafb; border-radius: 12px;">
        <div>
          <h3 style="margin: 0 0 4px 0; color: #111; font-size: 20px; font-weight: 600;">Button Variants</h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Click any button to increment the counter</p>
        </div>

        <div style="padding: 16px; background: white; border-radius: 8px; text-align: center; border: 2px solid #6366f1;">
          <div style="font-size: 12px; font-weight: 600; color: #4f46e5; text-transform: uppercase; margin-bottom: 4px;">Click Count</div>
          <div style="font-size: 36px; font-weight: 800; color: #6366f1;">${clickCount}</div>
        </div>

        <div>
          <h4 style="margin: 0 0 12px 0; color: #374151; font-size: 16px;">Variants</h4>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <button class="btn-primary" style="${btnStyle('primary')}">Primary</button>
            <button class="btn-secondary" style="${btnStyle('secondary')}">Secondary</button>
            <button class="btn-outline" style="${btnStyle('outline')}">Outline</button>
            <button class="btn-ghost" style="${btnStyle('ghost')}">Ghost</button>
            <button class="btn-danger" style="${btnStyle('danger')}">Danger</button>
          </div>
        </div>

        <div>
          <h4 style="margin: 0 0 12px 0; color: #374151; font-size: 16px;">Sizes</h4>
          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <button class="btn-sm" style="padding: 8px 16px; font-size: 14px; background: #4f46e5; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Small</button>
            <button class="btn-md" style="${btnStyle('primary')}">Medium</button>
            <button class="btn-lg" style="padding: 16px 32px; font-size: 18px; background: #4f46e5; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Large</button>
          </div>
        </div>

        <div>
          <h4 style="margin: 0 0 12px 0; color: #374151; font-size: 16px;">States</h4>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <button class="btn-async" style="padding: 12px 24px; background: ${isLoading ? '#9ca3af' : '#10b981'}; color: white; border: none; border-radius: 8px; cursor: ${isLoading ? 'wait' : 'pointer'}; font-weight: 600; font-size: 16px; opacity: ${isLoading ? 0.7 : 1};">
              ${isLoading ? 'Loading...' : 'Async Action'}
            </button>
            <button disabled style="padding: 12px 24px; background: #4f46e5; color: white; border: none; border-radius: 8px; cursor: not-allowed; font-weight: 600; font-size: 16px; opacity: 0.5;">Disabled</button>
          </div>
        </div>

        <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center; font-style: italic;">
          Try the async button to see loading state (2 second delay)
        </p>
      </div>
    `

    const handleClick = () => {
      clickCount++
      render()
    }

    const handleAsync = async () => {
      if (isLoading) return
      isLoading = true
      clickCount++
      render()
      await new Promise(resolve => setTimeout(resolve, 2000))
      isLoading = false
      render()
    }

    container.value.querySelectorAll('.btn-primary, .btn-secondary, .btn-outline, .btn-ghost, .btn-danger, .btn-sm, .btn-md, .btn-lg')
      .forEach(btn => btn.addEventListener('click', handleClick))
    container.value.querySelector('.btn-async')?.addEventListener('click', handleAsync)
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

.flexium-container :deep(button:not(:disabled):hover) {
  filter: brightness(110%);
  transform: translateY(-1px);
}

.flexium-container :deep(button:not(:disabled):active) {
  filter: brightness(90%);
  transform: translateY(0);
}
</style>
