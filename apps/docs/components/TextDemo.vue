<script setup>
import { onMounted, ref } from 'vue'

const container = ref(null)

onMounted(() => {
  if (!container.value) return

  container.value.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 32px; padding: 24px; background: #f9fafb; border-radius: 12px;">
      <div>
        <h3 style="margin: 0 0 4px 0; color: #111; font-size: 20px; font-weight: 600;">Text Component Demo</h3>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Typography primitives with size, weight, and color variants</p>
      </div>

      <!-- Headings -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Heading Sizes</h4>
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <div style="font-size: 48px; font-weight: 800; color: #111; margin-bottom: 8px;">Heading 1</div>
          <div style="font-size: 36px; font-weight: 700; color: #111; margin-bottom: 8px;">Heading 2</div>
          <div style="font-size: 28px; font-weight: 700; color: #111; margin-bottom: 8px;">Heading 3</div>
          <div style="font-size: 24px; font-weight: 600; color: #111; margin-bottom: 8px;">Heading 4</div>
          <div style="font-size: 20px; font-weight: 600; color: #111; margin-bottom: 8px;">Heading 5</div>
          <div style="font-size: 16px; font-weight: 600; color: #111;">Heading 6</div>
        </div>
      </div>

      <!-- Body Text -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Body Text Sizes</h4>
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; display: flex; flex-direction: column; gap: 12px;">
          <div style="font-size: 18px; color: #374151;">Large body text (18px) - Good for introductions and emphasis</div>
          <div style="font-size: 16px; color: #374151;">Default body text (16px) - Standard paragraph text</div>
          <div style="font-size: 14px; color: #6b7280;">Small text (14px) - Secondary content and captions</div>
          <div style="font-size: 12px; color: #9ca3af;">Extra small (12px) - Labels and fine print</div>
        </div>
      </div>

      <!-- Font Weights -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Font Weights</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px;">
          <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; text-align: center;">
            <div style="font-weight: 300; font-size: 24px; color: #111;">Light</div>
            <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">weight: 300</div>
          </div>
          <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; text-align: center;">
            <div style="font-weight: 400; font-size: 24px; color: #111;">Regular</div>
            <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">weight: 400</div>
          </div>
          <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; text-align: center;">
            <div style="font-weight: 500; font-size: 24px; color: #111;">Medium</div>
            <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">weight: 500</div>
          </div>
          <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; text-align: center;">
            <div style="font-weight: 600; font-size: 24px; color: #111;">Semibold</div>
            <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">weight: 600</div>
          </div>
          <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; text-align: center;">
            <div style="font-weight: 700; font-size: 24px; color: #111;">Bold</div>
            <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">weight: 700</div>
          </div>
          <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; text-align: center;">
            <div style="font-weight: 800; font-size: 24px; color: #111;">Extra Bold</div>
            <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">weight: 800</div>
          </div>
        </div>
      </div>

      <!-- Colors -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Text Colors</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 12px;">
          <div style="padding: 12px 20px; background: white; border-radius: 8px; border: 1px solid #e5e7eb; color: #111; font-weight: 500;">Default</div>
          <div style="padding: 12px 20px; background: white; border-radius: 8px; border: 1px solid #e5e7eb; color: #6b7280; font-weight: 500;">Muted</div>
          <div style="padding: 12px 20px; background: white; border-radius: 8px; border: 1px solid #e5e7eb; color: #3b82f6; font-weight: 500;">Primary</div>
          <div style="padding: 12px 20px; background: white; border-radius: 8px; border: 1px solid #e5e7eb; color: #10b981; font-weight: 500;">Success</div>
          <div style="padding: 12px 20px; background: white; border-radius: 8px; border: 1px solid #e5e7eb; color: #f59e0b; font-weight: 500;">Warning</div>
          <div style="padding: 12px 20px; background: white; border-radius: 8px; border: 1px solid #e5e7eb; color: #ef4444; font-weight: 500;">Error</div>
          <div style="padding: 12px 20px; background: #1f2937; border-radius: 8px; color: white; font-weight: 500;">Inverted</div>
        </div>
      </div>

      <!-- Text Decorations -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Decorations & Styles</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">
          <span style="text-decoration: underline; font-size: 16px;">Underlined</span>
          <span style="text-decoration: line-through; font-size: 16px; color: #9ca3af;">Strikethrough</span>
          <span style="font-style: italic; font-size: 16px;">Italic</span>
          <span style="text-transform: uppercase; font-size: 14px; letter-spacing: 1px; font-weight: 600;">Uppercase</span>
          <code style="font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 14px;">Monospace</code>
          <span style="background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700; font-size: 18px;">Gradient</span>
        </div>
      </div>

      <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center;">
        Text component provides consistent typography across your application
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
