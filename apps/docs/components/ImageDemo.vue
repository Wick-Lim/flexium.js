<script setup>
import { onMounted, ref } from 'vue'

const container = ref(null)

onMounted(() => {
  if (!container.value) return

  container.value.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 32px; padding: 24px; background: #f9fafb; border-radius: 12px;">
      <div>
        <h3 style="margin: 0 0 4px 0; color: #111; font-size: 20px; font-weight: 600;">Image Component Demo</h3>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Display images with various object-fit modes and styling options</p>
      </div>

      <!-- Object Fit Modes -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Object Fit Modes</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px;">
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="font-size: 12px; color: #6b7280;">cover</div>
            <div style="width: 100%; height: 150px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; overflow: hidden;">
              <div style="width: 100%; height: 100%; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 150\"><rect fill=\"%234f46e5\" width=\"200\" height=\"150\"/><text x=\"50%\" y=\"50%\" fill=\"white\" font-size=\"16\" text-anchor=\"middle\" dy=\".3em\">Cover</text></svg>'); background-size: cover; background-position: center;"></div>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="font-size: 12px; color: #6b7280;">contain</div>
            <div style="width: 100%; height: 150px; background: #f3f4f6; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
              <div style="width: 80%; height: 60%; background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">Contain</div>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="font-size: 12px; color: #6b7280;">fill</div>
            <div style="width: 100%; height: 150px; background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">Fill (stretched)</div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="font-size: 12px; color: #6b7280;">none</div>
            <div style="width: 100%; height: 150px; background: #f3f4f6; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
              <div style="width: 120px; height: 80px; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 14px;">None (actual size)</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Border Radius -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Border Radius Variants</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
          <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); border-radius: 0;"></div>
            <div style="font-size: 12px; color: #6b7280;">none</div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); border-radius: 8px;"></div>
            <div style="font-size: 12px; color: #6b7280;">8px</div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); border-radius: 16px;"></div>
            <div style="font-size: 12px; color: #6b7280;">16px</div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #ec4899 0%, #ef4444 100%); border-radius: 50%;"></div>
            <div style="font-size: 12px; color: #6b7280;">circle</div>
          </div>
        </div>
      </div>

      <!-- Avatar Examples -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Avatar Sizes</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: end;">
          <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
            <div style="width: 32px; height: 32px; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: 600;">A</div>
            <div style="font-size: 12px; color: #6b7280;">xs</div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
            <div style="width: 40px; height: 40px; background: #8b5cf6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; font-weight: 600;">B</div>
            <div style="font-size: 12px; color: #6b7280;">sm</div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
            <div style="width: 56px; height: 56px; background: #ec4899; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; font-weight: 600;">C</div>
            <div style="font-size: 12px; color: #6b7280;">md</div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
            <div style="width: 72px; height: 72px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: 600;">D</div>
            <div style="font-size: 12px; color: #6b7280;">lg</div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
            <div style="width: 96px; height: 96px; background: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: 600;">E</div>
            <div style="font-size: 12px; color: #6b7280;">xl</div>
          </div>
        </div>
      </div>

      <!-- Image Gallery -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Gallery Layout</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px;">
          ${[1,2,3,4,5,6].map(i => `
            <div style="aspect-ratio: 1; background: linear-gradient(135deg, hsl(${i * 60}, 70%, 60%) 0%, hsl(${i * 60 + 30}, 70%, 50%) 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">
              ${i}
            </div>
          `).join('')}
        </div>
      </div>

      <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center;">
        Image component provides consistent image rendering with loading states and fallbacks
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
