<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const container = ref(null)

onMounted(() => {
  if (!container.value) return

  container.value.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 32px; padding: 24px; background: #f9fafb; border-radius: 12px;">
      <div>
        <h3 style="margin: 0 0 4px 0; color: #111; font-size: 20px; font-weight: 600;">Stack Component Demo</h3>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Overlay elements using absolute positioning with z-index control</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
        <!-- Basic Stack -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #374151;">Basic Stack (Layered)</h4>
          <div style="position: relative; height: 200px; background: #f3f4f6; border-radius: 8px; overflow: hidden;">
            <div style="position: absolute; top: 20px; left: 20px; width: 120px; height: 120px; background: #3b82f6; border-radius: 8px; opacity: 0.9;"></div>
            <div style="position: absolute; top: 40px; left: 40px; width: 120px; height: 120px; background: #8b5cf6; border-radius: 8px; opacity: 0.9;"></div>
            <div style="position: absolute; top: 60px; left: 60px; width: 120px; height: 120px; background: #ec4899; border-radius: 8px; opacity: 0.9;"></div>
          </div>
        </div>

        <!-- Centered Stack -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #374151;">Centered Overlay</h4>
          <div style="position: relative; height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 160px; height: 160px; background: rgba(255,255,255,0.2); border-radius: 50%;"></div>
            <div style="position: absolute; width: 120px; height: 120px; background: rgba(255,255,255,0.3); border-radius: 50%;"></div>
            <div style="position: absolute; width: 80px; height: 80px; background: rgba(255,255,255,0.4); border-radius: 50%;"></div>
            <div style="position: relative; color: white; font-weight: 700; font-size: 20px; z-index: 10;">Center</div>
          </div>
        </div>

        <!-- Avatar Stack -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #374151;">Avatar Stack</h4>
          <div style="position: relative; height: 200px; background: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            <div style="display: flex; position: relative;">
              <div style="width: 48px; height: 48px; border-radius: 50%; background: #3b82f6; border: 3px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">A</div>
              <div style="width: 48px; height: 48px; border-radius: 50%; background: #8b5cf6; border: 3px solid white; margin-left: -16px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">B</div>
              <div style="width: 48px; height: 48px; border-radius: 50%; background: #ec4899; border: 3px solid white; margin-left: -16px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">C</div>
              <div style="width: 48px; height: 48px; border-radius: 50%; background: #10b981; border: 3px solid white; margin-left: -16px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">+3</div>
            </div>
          </div>
        </div>

        <!-- Badge Overlay -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #374151;">Badge Overlay</h4>
          <div style="position: relative; height: 200px; background: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            <div style="position: relative;">
              <div style="width: 80px; height: 80px; background: #4f46e5; border-radius: 16px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px;">📦</span>
              </div>
              <div style="position: absolute; top: -8px; right: -8px; width: 28px; height: 28px; background: #ef4444; border-radius: 50%; color: white; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; border: 2px solid white;">3</div>
            </div>
          </div>
        </div>

        <!-- Card with Overlay -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #374151;">Image Overlay</h4>
          <div style="position: relative; height: 200px; border-radius: 8px; overflow: hidden;">
            <div style="position: absolute; inset: 0; background: linear-gradient(45deg, #12c2e9, #c471ed, #f64f59);"></div>
            <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);"></div>
            <div style="position: absolute; bottom: 16px; left: 16px; right: 16px; color: white;">
              <div style="font-weight: 700; font-size: 18px;">Beautiful Sunset</div>
              <div style="font-size: 14px; opacity: 0.8;">Gradient overlay effect</div>
            </div>
          </div>
        </div>

        <!-- Loading Overlay -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #374151;">Loading Overlay</h4>
          <div style="position: relative; height: 200px; background: white; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden;">
            <div style="padding: 16px;">
              <div style="height: 16px; background: #e5e7eb; border-radius: 4px; margin-bottom: 12px; width: 60%;"></div>
              <div style="height: 12px; background: #f3f4f6; border-radius: 4px; margin-bottom: 8px;"></div>
              <div style="height: 12px; background: #f3f4f6; border-radius: 4px; width: 80%;"></div>
            </div>
            <div style="position: absolute; inset: 0; background: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px);">
              <div style="width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top-color: #4f46e5; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            </div>
          </div>
        </div>
      </div>

      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>

      <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center;">
        Stack uses position: absolute to layer children on top of each other
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
