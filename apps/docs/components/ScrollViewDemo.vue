<script setup>
import { onMounted, ref } from 'vue'

const container = ref(null)

onMounted(() => {
  if (!container.value) return

  container.value.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 32px; padding: 24px; background: #f9fafb; border-radius: 12px;">
      <div>
        <h3 style="margin: 0 0 4px 0; color: #111; font-size: 20px; font-weight: 600;">ScrollView Component Demo</h3>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Scrollable containers with various scroll directions and styling</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
        <!-- Vertical Scroll -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #374151;">Vertical Scroll</h4>
          <div style="height: 200px; overflow-y: auto; background: white; border-radius: 8px; border: 1px solid #e5e7eb; padding: 12px;">
            ${Array.from({length: 15}, (_, i) => `
              <div style="padding: 12px; background: ${i % 2 === 0 ? '#f9fafb' : 'white'}; border-radius: 6px; margin-bottom: 8px; border: 1px solid #e5e7eb;">
                <div style="font-weight: 500; color: #111;">Item ${i + 1}</div>
                <div style="font-size: 13px; color: #6b7280;">Description for item ${i + 1}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Horizontal Scroll -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #374151;">Horizontal Scroll</h4>
          <div style="overflow-x: auto; background: white; border-radius: 8px; border: 1px solid #e5e7eb; padding: 12px;">
            <div style="display: flex; gap: 12px; width: max-content;">
              ${Array.from({length: 10}, (_, i) => `
                <div style="width: 120px; height: 160px; background: linear-gradient(135deg, hsl(${i * 36}, 70%, 60%) 0%, hsl(${i * 36 + 20}, 70%, 50%) 100%); border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">
                  Card ${i + 1}
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Chat-like Scroll -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #374151;">Chat Messages</h4>
          <div style="height: 200px; overflow-y: auto; background: #1f2937; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px;">
            <div style="align-self: flex-start; max-width: 80%; padding: 10px 14px; background: #374151; border-radius: 12px 12px 12px 4px; color: white; font-size: 14px;">
              Hey, how are you?
            </div>
            <div style="align-self: flex-end; max-width: 80%; padding: 10px 14px; background: #4f46e5; border-radius: 12px 12px 4px 12px; color: white; font-size: 14px;">
              I'm doing great, thanks!
            </div>
            <div style="align-self: flex-start; max-width: 80%; padding: 10px 14px; background: #374151; border-radius: 12px 12px 12px 4px; color: white; font-size: 14px;">
              Did you check out the new ScrollView component?
            </div>
            <div style="align-self: flex-end; max-width: 80%; padding: 10px 14px; background: #4f46e5; border-radius: 12px 12px 4px 12px; color: white; font-size: 14px;">
              Yes! It's amazing. The smooth scrolling is really nice.
            </div>
            <div style="align-self: flex-start; max-width: 80%; padding: 10px 14px; background: #374151; border-radius: 12px 12px 12px 4px; color: white; font-size: 14px;">
              Glad you like it! 🎉
            </div>
            <div style="align-self: flex-end; max-width: 80%; padding: 10px 14px; background: #4f46e5; border-radius: 12px 12px 4px 12px; color: white; font-size: 14px;">
              The horizontal scroll for cards is perfect for carousels
            </div>
            <div style="align-self: flex-start; max-width: 80%; padding: 10px 14px; background: #374151; border-radius: 12px 12px 12px 4px; color: white; font-size: 14px;">
              Exactly! And it handles touch events well too
            </div>
          </div>
        </div>

        <!-- Image Gallery -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #374151;">Image Gallery</h4>
          <div style="overflow-x: auto; background: white; border-radius: 8px; border: 1px solid #e5e7eb; padding: 12px;">
            <div style="display: flex; gap: 8px; width: max-content;">
              ${Array.from({length: 8}, (_, i) => `
                <div style="width: 100px; height: 100px; background: linear-gradient(${45 + i * 15}deg, hsl(${i * 45}, 80%, 65%) 0%, hsl(${i * 45 + 30}, 80%, 55%) 100%); border-radius: 8px; flex-shrink: 0;"></div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Nested Scroll -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #374151;">Nested ScrollView</h4>
          <div style="height: 200px; overflow-y: auto; background: white; border-radius: 8px; border: 1px solid #e5e7eb; padding: 12px;">
            <div style="margin-bottom: 12px;">
              <div style="font-weight: 500; color: #111; margin-bottom: 8px;">Section 1</div>
              <div style="overflow-x: auto; padding-bottom: 8px;">
                <div style="display: flex; gap: 8px; width: max-content;">
                  ${Array.from({length: 5}, (_, i) => `
                    <div style="width: 80px; height: 60px; background: #3b82f6; border-radius: 6px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 500;">A${i + 1}</div>
                  `).join('')}
                </div>
              </div>
            </div>
            <div style="margin-bottom: 12px;">
              <div style="font-weight: 500; color: #111; margin-bottom: 8px;">Section 2</div>
              <div style="overflow-x: auto; padding-bottom: 8px;">
                <div style="display: flex; gap: 8px; width: max-content;">
                  ${Array.from({length: 5}, (_, i) => `
                    <div style="width: 80px; height: 60px; background: #10b981; border-radius: 6px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 500;">B${i + 1}</div>
                  `).join('')}
                </div>
              </div>
            </div>
            <div style="margin-bottom: 12px;">
              <div style="font-weight: 500; color: #111; margin-bottom: 8px;">Section 3</div>
              <div style="overflow-x: auto; padding-bottom: 8px;">
                <div style="display: flex; gap: 8px; width: max-content;">
                  ${Array.from({length: 5}, (_, i) => `
                    <div style="width: 80px; height: 60px; background: #f59e0b; border-radius: 6px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 500;">C${i + 1}</div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pull to Refresh Simulation -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #374151;">With Scroll Events</h4>
          <div class="scroll-container" style="height: 200px; overflow-y: auto; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
            <div style="padding: 12px;">
              <div class="scroll-indicator" style="text-align: center; padding: 8px; color: #9ca3af; font-size: 13px;">Scroll position: 0px</div>
              ${Array.from({length: 12}, (_, i) => `
                <div style="padding: 12px; background: ${i % 2 === 0 ? '#f9fafb' : 'white'}; border-radius: 6px; margin-bottom: 8px; display: flex; align-items: center; gap: 12px;">
                  <div style="width: 36px; height: 36px; background: hsl(${i * 30}, 70%, 60%); border-radius: 50%; flex-shrink: 0;"></div>
                  <div>
                    <div style="font-weight: 500; color: #111;">List Item ${i + 1}</div>
                    <div style="font-size: 12px; color: #6b7280;">Secondary text</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center;">
        ScrollView provides smooth scrolling with optional scroll event handlers
      </p>
    </div>
  `

  // Add scroll event listener
  const scrollContainer = container.value.querySelector('.scroll-container')
  const scrollIndicator = container.value.querySelector('.scroll-indicator')
  if (scrollContainer && scrollIndicator) {
    scrollContainer.addEventListener('scroll', () => {
      scrollIndicator.textContent = `Scroll position: ${Math.round(scrollContainer.scrollTop)}px`
    })
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

/* Custom scrollbar styling */
.flexium-container :deep(::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

.flexium-container :deep(::-webkit-scrollbar-track) {
  background: #f1f1f1;
  border-radius: 3px;
}

.flexium-container :deep(::-webkit-scrollbar-thumb) {
  background: #c1c1c1;
  border-radius: 3px;
}

.flexium-container :deep(::-webkit-scrollbar-thumb:hover) {
  background: #a1a1a1;
}
</style>
