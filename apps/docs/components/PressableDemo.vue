<script setup>
import { onMounted, ref } from 'vue'

const container = ref(null)

onMounted(() => {
  if (!container.value) return

  let pressCount = 0
  let lastEvent = 'None'

  const render = () => {
    container.value.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 32px; padding: 24px; background: #f9fafb; border-radius: 12px;">
        <div>
          <h3 style="margin: 0 0 4px 0; color: #111; font-size: 20px; font-weight: 600;">Pressable Component Demo</h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Touch-friendly interactive surfaces with press states</p>
        </div>

        <!-- Event Counter -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div style="padding: 20px; background: white; border-radius: 8px; border: 2px solid #6366f1; text-align: center;">
            <div style="font-size: 12px; font-weight: 600; color: #4f46e5; text-transform: uppercase; margin-bottom: 4px;">Press Count</div>
            <div style="font-size: 36px; font-weight: 800; color: #6366f1;">${pressCount}</div>
          </div>
          <div style="padding: 20px; background: white; border-radius: 8px; border: 2px solid #10b981; text-align: center;">
            <div style="font-size: 12px; font-weight: 600; color: #059669; text-transform: uppercase; margin-bottom: 4px;">Last Event</div>
            <div style="font-size: 18px; font-weight: 600; color: #10b981;">${lastEvent}</div>
          </div>
        </div>

        <!-- Basic Pressables -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Basic Pressable Areas</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 12px;">
            <div class="pressable" style="padding: 16px 24px; background: #4f46e5; color: white; border-radius: 8px; cursor: pointer; font-weight: 600; user-select: none; transition: all 0.1s;">
              Press Me
            </div>
            <div class="pressable" style="padding: 16px 24px; background: #10b981; color: white; border-radius: 8px; cursor: pointer; font-weight: 600; user-select: none; transition: all 0.1s;">
              Click Here
            </div>
            <div class="pressable" style="padding: 16px 24px; background: #f59e0b; color: white; border-radius: 8px; cursor: pointer; font-weight: 600; user-select: none; transition: all 0.1s;">
              Tap Touch
            </div>
          </div>
        </div>

        <!-- Card Pressables -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Pressable Cards</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
            <div class="pressable-card" style="padding: 20px; background: white; border-radius: 12px; border: 2px solid #e5e7eb; cursor: pointer; transition: all 0.15s;">
              <div style="font-size: 24px; margin-bottom: 8px;">📱</div>
              <div style="font-weight: 600; color: #111; margin-bottom: 4px;">Mobile App</div>
              <div style="font-size: 14px; color: #6b7280;">Build native-like experiences</div>
            </div>
            <div class="pressable-card" style="padding: 20px; background: white; border-radius: 12px; border: 2px solid #e5e7eb; cursor: pointer; transition: all 0.15s;">
              <div style="font-size: 24px; margin-bottom: 8px;">🎮</div>
              <div style="font-weight: 600; color: #111; margin-bottom: 4px;">Games</div>
              <div style="font-size: 14px; color: #6b7280;">Interactive game controls</div>
            </div>
            <div class="pressable-card" style="padding: 20px; background: white; border-radius: 12px; border: 2px solid #e5e7eb; cursor: pointer; transition: all 0.15s;">
              <div style="font-size: 24px; margin-bottom: 8px;">🛒</div>
              <div style="font-weight: 600; color: #111; margin-bottom: 4px;">Shopping</div>
              <div style="font-size: 14px; color: #6b7280;">Product listings & carts</div>
            </div>
          </div>
        </div>

        <!-- Pressable States -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Visual States</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 16px;">
            <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
              <div style="padding: 16px 24px; background: #4f46e5; color: white; border-radius: 8px; font-weight: 600;">Normal</div>
              <div style="font-size: 12px; color: #6b7280;">Default state</div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
              <div style="padding: 16px 24px; background: #6366f1; color: white; border-radius: 8px; font-weight: 600; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);">Focused</div>
              <div style="font-size: 12px; color: #6b7280;">Keyboard focus</div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
              <div style="padding: 16px 24px; background: #818cf8; color: white; border-radius: 8px; font-weight: 600;">Hovered</div>
              <div style="font-size: 12px; color: #6b7280;">Mouse hover</div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
              <div style="padding: 16px 24px; background: #3730a3; color: white; border-radius: 8px; font-weight: 600; transform: scale(0.95);">Pressed</div>
              <div style="font-size: 12px; color: #6b7280;">Active/pressed</div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
              <div style="padding: 16px 24px; background: #9ca3af; color: white; border-radius: 8px; font-weight: 600; cursor: not-allowed;">Disabled</div>
              <div style="font-size: 12px; color: #6b7280;">Not interactive</div>
            </div>
          </div>
        </div>

        <div style="padding: 16px; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
          <div style="font-weight: 600; color: #1e40af; margin-bottom: 4px;">Accessibility</div>
          <div style="font-size: 14px; color: #3b82f6;">
            Pressable provides keyboard navigation, focus management, and proper ARIA attributes for accessible interactions.
          </div>
        </div>
      </div>
    `

    // Add event listeners
    container.value.querySelectorAll('.pressable').forEach(el => {
      el.addEventListener('click', () => {
        pressCount++
        lastEvent = 'onPress'
        render()
      })
      el.addEventListener('mousedown', () => {
        el.style.transform = 'scale(0.95)'
        el.style.filter = 'brightness(0.9)'
      })
      el.addEventListener('mouseup', () => {
        el.style.transform = ''
        el.style.filter = ''
      })
      el.addEventListener('mouseleave', () => {
        el.style.transform = ''
        el.style.filter = ''
      })
    })

    container.value.querySelectorAll('.pressable-card').forEach(el => {
      el.addEventListener('click', () => {
        pressCount++
        lastEvent = 'Card Press'
        render()
      })
      el.addEventListener('mouseenter', () => {
        el.style.borderColor = '#6366f1'
        el.style.transform = 'translateY(-2px)'
        el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
      })
      el.addEventListener('mouseleave', () => {
        el.style.borderColor = '#e5e7eb'
        el.style.transform = ''
        el.style.boxShadow = ''
      })
      el.addEventListener('mousedown', () => {
        el.style.transform = 'scale(0.98)'
      })
      el.addEventListener('mouseup', () => {
        el.style.transform = 'translateY(-2px)'
      })
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
</style>
