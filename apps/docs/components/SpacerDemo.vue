<script setup>
import { onMounted, ref } from 'vue'

const container = ref(null)

onMounted(() => {
  if (!container.value) return

  container.value.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 32px; padding: 24px; background: #f9fafb; border-radius: 12px;">
      <div>
        <h3 style="margin: 0 0 4px 0; color: #111; font-size: 20px; font-weight: 600;">Spacer Component Demo</h3>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Flexible space that fills available room in flex containers</p>
      </div>

      <!-- Horizontal Spacer -->
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Horizontal Spacer (in Row)</h4>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div>
            <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280;">Push items to ends:</p>
            <div style="display: flex; align-items: center; background: #f3f4f6; padding: 16px; border-radius: 8px;">
              <div style="padding: 12px 20px; background: #3b82f6; color: white; border-radius: 6px; font-weight: 600;">Logo</div>
              <div style="flex: 1; background: repeating-linear-gradient(90deg, #ddd, #ddd 4px, transparent 4px, transparent 8px); height: 2px; margin: 0 8px;"></div>
              <div style="padding: 12px 20px; background: #10b981; color: white; border-radius: 6px; font-weight: 600;">Login</div>
            </div>
          </div>

          <div>
            <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280;">Center content with spacers on both sides:</p>
            <div style="display: flex; align-items: center; background: #f3f4f6; padding: 16px; border-radius: 8px;">
              <div style="flex: 1; background: repeating-linear-gradient(90deg, #ddd, #ddd 4px, transparent 4px, transparent 8px); height: 2px; margin-right: 8px;"></div>
              <div style="padding: 12px 24px; background: #8b5cf6; color: white; border-radius: 6px; font-weight: 600;">Centered</div>
              <div style="flex: 1; background: repeating-linear-gradient(90deg, #ddd, #ddd 4px, transparent 4px, transparent 8px); height: 2px; margin-left: 8px;"></div>
            </div>
          </div>

          <div>
            <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280;">Navigation with spacer:</p>
            <div style="display: flex; align-items: center; gap: 8px; background: #1f2937; padding: 12px 16px; border-radius: 8px;">
              <div style="padding: 8px 16px; color: white; font-weight: 500;">Home</div>
              <div style="padding: 8px 16px; color: #9ca3af; font-weight: 500;">About</div>
              <div style="padding: 8px 16px; color: #9ca3af; font-weight: 500;">Products</div>
              <div style="flex: 1;"></div>
              <div style="padding: 8px 16px; background: #4f46e5; color: white; border-radius: 6px; font-weight: 500;">Sign Up</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vertical Spacer -->
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Vertical Spacer (in Column)</h4>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">Card with footer:</p>
            <div style="display: flex; flex-direction: column; height: 200px; background: white; border-radius: 8px; border: 1px solid #e5e7eb; padding: 16px;">
              <div style="font-weight: 600; color: #111;">Card Title</div>
              <div style="font-size: 14px; color: #6b7280; margin-top: 8px;">Some content here</div>
              <div style="flex: 1;"></div>
              <div style="padding-top: 16px; border-top: 1px solid #e5e7eb;">
                <button style="padding: 8px 16px; background: #4f46e5; color: white; border: none; border-radius: 6px; font-weight: 500; cursor: pointer;">Action</button>
              </div>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 4px;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">Sidebar layout:</p>
            <div style="display: flex; flex-direction: column; height: 200px; background: #1f2937; border-radius: 8px; padding: 16px;">
              <div style="padding: 8px 12px; color: white; font-weight: 500; background: #374151; border-radius: 6px; margin-bottom: 8px;">Dashboard</div>
              <div style="padding: 8px 12px; color: #9ca3af;">Settings</div>
              <div style="padding: 8px 12px; color: #9ca3af;">Profile</div>
              <div style="flex: 1;"></div>
              <div style="padding: 8px 12px; color: #ef4444; border-top: 1px solid #374151; margin-top: 8px;">Logout</div>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 4px;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">Modal layout:</p>
            <div style="display: flex; flex-direction: column; height: 200px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
              <div style="padding: 16px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Modal Header</div>
              <div style="flex: 1; padding: 16px; color: #6b7280; font-size: 14px;">Modal content goes here...</div>
              <div style="padding: 16px; border-top: 1px solid #e5e7eb; display: flex; gap: 8px; justify-content: flex-end;">
                <button style="padding: 8px 16px; background: #f3f4f6; border: none; border-radius: 6px; font-weight: 500; cursor: pointer;">Cancel</button>
                <button style="padding: 8px 16px; background: #4f46e5; color: white; border: none; border-radius: 6px; font-weight: 500; cursor: pointer;">Confirm</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="padding: 16px; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
        <div style="font-weight: 600; color: #1e40af; margin-bottom: 4px;">How Spacer Works</div>
        <div style="font-size: 14px; color: #3b82f6;">
          Spacer uses <code style="background: #dbeafe; padding: 2px 6px; border-radius: 4px;">flex: 1</code> to consume all available space in a flex container,
          pushing sibling elements to the edges.
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

.flexium-container :deep(button:hover) {
  filter: brightness(110%);
}
</style>
