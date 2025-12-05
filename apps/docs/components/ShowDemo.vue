<script setup>
import { onMounted, ref, onUnmounted } from 'vue'

const container = ref(null)

onMounted(() => {
  if (!container.value) return

  let isVisible = false
  let isLoggedIn = false

  const render = () => {
    container.value.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px; padding: 32px; background: #f9fafb; border-radius: 12px;">
        <div>
          <h3 style="margin: 0 0 4px 0; color: #111; font-size: 20px; font-weight: 600;">Show Component Demo</h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Conditionally render content based on state</p>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #374151;">Simple Toggle</h4>
          <button class="toggle-btn" style="padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 16px;">
            ${isVisible ? 'Hide Content' : 'Show Content'}
          </button>
          ${isVisible ? `
            <div style="padding: 16px; background: #eff6ff; border: 2px solid #3b82f6; border-radius: 6px; color: #1e40af; font-weight: 500;">
              ✨ This content is conditionally rendered!
            </div>
          ` : ''}
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #374151;">Auth State with Fallback</h4>
          <button class="auth-btn" style="padding: 10px 20px; background: ${isLoggedIn ? '#ef4444' : '#10b981'}; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 16px;">
            ${isLoggedIn ? 'Logout' : 'Login'}
          </button>
          ${isLoggedIn ? `
            <div style="padding: 16px; background: #d1fae5; border: 2px solid #34d399; border-radius: 6px; color: #065f46;">
              <div style="font-weight: 600; margin-bottom: 8px; font-size: 16px;">Welcome back!</div>
              <div style="font-size: 14px;">Logged in as: <strong>Alice</strong></div>
            </div>
          ` : `
            <div style="padding: 16px; background: #fef2f2; border: 2px solid #fca5a5; border-radius: 6px; color: #991b1b; font-weight: 500;">
              Please login to see your profile
            </div>
          `}
        </div>

        <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center;">
          The Show component creates/destroys content when the condition changes
        </p>
      </div>
    `

    container.value.querySelector('.toggle-btn')?.addEventListener('click', () => {
      isVisible = !isVisible
      render()
    })

    container.value.querySelector('.auth-btn')?.addEventListener('click', () => {
      isLoggedIn = !isLoggedIn
      render()
    })
  }

  render()
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
}

.flexium-container :deep(button:active) {
  filter: brightness(90%);
}
</style>
