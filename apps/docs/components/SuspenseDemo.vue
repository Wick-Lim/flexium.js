<script setup>
import { onMounted, ref } from 'vue'

const container = ref(null)

onMounted(() => {
  if (!container.value) return

  let status = 'idle' // idle, loading, success, error
  let userData = null

  const fetchData = async () => {
    status = 'loading'
    render()

    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))

    if (Math.random() > 0.3) {
      userData = {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'Developer',
        avatar: '👩‍💻'
      }
      status = 'success'
    } else {
      status = 'error'
    }
    render()
  }

  const reset = () => {
    status = 'idle'
    userData = null
    render()
  }

  const render = () => {
    let content = ''

    switch (status) {
      case 'loading':
        content = `
          <div style="padding: 48px; text-align: center;">
            <div class="spinner" style="width: 48px; height: 48px; border: 4px solid #e5e7eb; border-top-color: #6366f1; border-radius: 50%; margin: 0 auto 16px; animation: spin 1s linear infinite;"></div>
            <div style="color: #6b7280; font-weight: 500;">Loading user data...</div>
          </div>
        `
        break
      case 'success':
        content = `
          <div style="padding: 24px; background: white; border-radius: 12px; text-align: center;">
            <div style="font-size: 64px; margin-bottom: 16px;">${userData.avatar}</div>
            <div style="font-size: 24px; font-weight: 700; color: #111; margin-bottom: 4px;">${userData.name}</div>
            <div style="color: #6b7280; margin-bottom: 8px;">${userData.email}</div>
            <div style="display: inline-block; padding: 4px 12px; background: #eff6ff; color: #3b82f6; border-radius: 9999px; font-size: 13px; font-weight: 500;">${userData.role}</div>
            <button class="reset-btn" style="display: block; margin: 24px auto 0; padding: 10px 24px; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Reset</button>
          </div>
        `
        break
      case 'error':
        content = `
          <div style="padding: 48px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">😵</div>
            <div style="font-size: 18px; font-weight: 600; color: #dc2626; margin-bottom: 8px;">Failed to load data</div>
            <div style="color: #6b7280; margin-bottom: 16px;">Something went wrong. Please try again.</div>
            <button class="retry-btn" style="padding: 10px 24px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Retry</button>
          </div>
        `
        break
      default:
        content = `
          <div style="padding: 48px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">📡</div>
            <div style="color: #374151; font-weight: 500; margin-bottom: 16px;">Click to fetch user data</div>
            <button class="fetch-btn" style="padding: 12px 32px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 16px;">Fetch Data</button>
          </div>
        `
    }

    container.value.innerHTML = `
      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
      <div style="display: flex; flex-direction: column; gap: 24px; padding: 32px; background: #f9fafb; border-radius: 12px;">
        <div>
          <h3 style="margin: 0 0 4px 0; color: #111; font-size: 20px; font-weight: 600;">Suspense Demo</h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Handle async operations with loading states</p>
        </div>

        <div style="background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%); border-radius: 12px; min-height: 200px; display: flex; align-items: center; justify-content: center;">
          ${content}
        </div>

        <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center;">
          Suspense shows a fallback while async content loads (30% chance of error for demo)
        </p>
      </div>
    `

    container.value.querySelector('.fetch-btn')?.addEventListener('click', fetchData)
    container.value.querySelector('.retry-btn')?.addEventListener('click', fetchData)
    container.value.querySelector('.reset-btn')?.addEventListener('click', reset)
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
  transform: scale(1.02);
}
</style>
