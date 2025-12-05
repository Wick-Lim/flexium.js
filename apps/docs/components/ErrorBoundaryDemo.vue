<script setup>
import { onMounted, ref } from 'vue'

const container = ref(null)

// State
let count = 0
let hasError = false
let errorMessage = ''
let retryCount = 0
let errorLog = []

const reset = () => {
  hasError = false
  errorMessage = ''
  count = 0
  retryCount++
  render()
}

const triggerError = (msg) => {
  hasError = true
  errorMessage = msg
  errorLog.unshift({ msg, time: new Date().toLocaleTimeString(), retry: retryCount })
  if (errorLog.length > 5) errorLog.pop()
  render()
}

const safeIncrement = () => {
  count++
  render()
}

const riskyIncrement = () => {
  if (Math.random() < 0.4) {
    triggerError('Random failure! (40% chance)')
  } else {
    count++
    render()
  }
}

const crashAt5 = () => {
  count++
  if (count >= 5) {
    triggerError('Counter crashed at 5!')
  } else {
    render()
  }
}

const asyncError = () => {
  const btn = container.value?.querySelector('.async-btn')
  if (btn) {
    btn.textContent = '⏳ Loading...'
    btn.disabled = true
  }
  setTimeout(() => {
    triggerError('Async operation failed!')
  }, 1000)
}

const render = () => {
  if (!container.value) return

  container.value.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px; padding: 28px; background: #f9fafb; border-radius: 16px;">

      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h3 style="margin: 0 0 4px 0; color: #111; font-size: 20px;">Error Boundary Demo</h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Graceful error handling & recovery</p>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 14px;">
          <span>Retry Count:</span>
          <span style="background: #e5e7eb; padding: 4px 12px; border-radius: 20px; font-weight: 600;">${retryCount}</span>
        </div>
      </div>

      ${hasError ? `
        <!-- Error State -->
        <div style="padding: 24px; background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px solid #fca5a5; border-radius: 16px;">
          <div style="display: flex; align-items: flex-start; gap: 16px;">
            <div style="width: 56px; height: 56px; background: #ef4444; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0;">
              💥
            </div>
            <div style="flex: 1;">
              <h4 style="margin: 0 0 8px 0; color: #dc2626; font-size: 18px;">Error Caught!</h4>
              <p style="margin: 0 0 4px 0; color: #7f1d1d; font-size: 14px; font-family: monospace; background: #fecaca40; padding: 8px 12px; border-radius: 6px;">
                ${errorMessage}
              </p>
            </div>
          </div>
          <div style="display: flex; gap: 12px; margin-top: 20px;">
            <button class="reset-btn" style="flex: 1; padding: 12px 24px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 15px;">
              🔄 Reset & Try Again
            </button>
          </div>
        </div>
      ` : `
        <!-- Normal State -->
        <div style="padding: 24px; background: white; border: 1px solid #e5e7eb; border-radius: 16px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 24px; margin-bottom: 20px;">
            <span style="font-size: 64px; font-weight: 800; color: #111; font-variant-numeric: tabular-nums;">${count}</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
            <button class="safe-btn" style="padding: 14px; background: #10b981; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;">
              ✅ Safe +1
            </button>
            <button class="risky-btn" style="padding: 14px; background: #f59e0b; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;">
              🎲 Risky +1 <span style="font-size: 12px; opacity: 0.8;">(40% fail)</span>
            </button>
            <button class="crash-btn" style="padding: 14px; background: #8b5cf6; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;">
              💣 Crash at 5 <span style="font-size: 12px; opacity: 0.8;">(${5 - count} left)</span>
            </button>
            <button class="async-btn" style="padding: 14px; background: #ef4444; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;">
              ⚡ Async Error
            </button>
          </div>
        </div>
      `}

      <!-- Error Log -->
      ${errorLog.length > 0 ? `
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="padding: 12px 16px; background: #f3f4f6; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151; font-size: 14px;">
            📋 Error Log (${errorLog.length})
          </div>
          <div style="max-height: 150px; overflow-y: auto;">
            ${errorLog.map(e => `
              <div style="padding: 10px 16px; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #dc2626; font-size: 13px;">⚠️ ${e.msg}</span>
                <span style="color: #9ca3af; font-size: 12px;">${e.time} (retry #${e.retry})</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Info -->
      <div style="padding: 14px 18px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; font-size: 14px; color: #1e40af;">
        💡 <strong>ErrorBoundary</strong> catches errors and displays a fallback UI, allowing users to recover without crashing the entire app.
      </div>

    </div>
  `

  // Event listeners
  container.value.querySelector('.reset-btn')?.addEventListener('click', reset)
  container.value.querySelector('.safe-btn')?.addEventListener('click', safeIncrement)
  container.value.querySelector('.risky-btn')?.addEventListener('click', riskyIncrement)
  container.value.querySelector('.crash-btn')?.addEventListener('click', crashAt5)
  container.value.querySelector('.async-btn')?.addEventListener('click', asyncError)
}

onMounted(render)
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
.flexium-container :deep(button:hover:not(:disabled)) {
  filter: brightness(110%);
  transform: translateY(-1px);
}
.flexium-container :deep(button:active:not(:disabled)) {
  transform: translateY(0);
}
</style>
