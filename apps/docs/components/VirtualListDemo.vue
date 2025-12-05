<script setup>
import { onMounted, ref, onUnmounted } from 'vue'

const container = ref(null)

// Configuration
const ITEM_COUNT = 10000
const ITEM_HEIGHT = 50
const CONTAINER_HEIGHT = 400
const OVERSCAN = 5

// Generate items
const items = Array.from({ length: ITEM_COUNT }, (_, i) => ({
  id: i,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  avatar: `hsl(${(i * 37) % 360}, 70%, 60%)`
}))

let scrollTop = 0
let visibleStart = 0
let visibleEnd = 0

const getVisibleRange = (scrollY) => {
  const start = Math.max(0, Math.floor(scrollY / ITEM_HEIGHT) - OVERSCAN)
  const visibleCount = Math.ceil(CONTAINER_HEIGHT / ITEM_HEIGHT)
  const end = Math.min(ITEM_COUNT, start + visibleCount + OVERSCAN * 2)
  return { start, end }
}

const renderList = () => {
  if (!container.value) return

  const listContainer = container.value.querySelector('.virtual-list-content')
  if (!listContainer) return

  const { start, end } = getVisibleRange(scrollTop)
  visibleStart = start
  visibleEnd = end

  // Update stats
  const statsEl = container.value.querySelector('.stats')
  if (statsEl) {
    statsEl.textContent = `Showing items ${start + 1} - ${end} of ${ITEM_COUNT.toLocaleString()} (only ${end - start} DOM nodes)`
  }

  // Clear and render visible items
  listContainer.innerHTML = ''

  for (let i = start; i < end; i++) {
    const item = items[i]
    const div = document.createElement('div')
    div.className = 'virtual-item'
    div.style.cssText = `
      position: absolute;
      top: ${i * ITEM_HEIGHT}px;
      left: 0;
      right: 0;
      height: ${ITEM_HEIGHT}px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 16px;
      border-bottom: 1px solid #e5e7eb;
      background: ${i % 2 === 0 ? '#ffffff' : '#f9fafb'};
    `

    div.innerHTML = `
      <div style="
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: ${item.avatar};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 14px;
      ">${item.name.charAt(0)}</div>
      <div style="flex: 1;">
        <div style="font-weight: 600; color: #111827;">${item.name}</div>
        <div style="font-size: 13px; color: #6b7280;">${item.email}</div>
      </div>
      <div style="color: #9ca3af; font-size: 13px;">#${item.id + 1}</div>
    `

    listContainer.appendChild(div)
  }
}

const handleScroll = (e) => {
  scrollTop = e.target.scrollTop
  renderList()
}

const scrollToIndex = (index) => {
  const scrollContainer = container.value?.querySelector('.virtual-list-scroll')
  if (scrollContainer) {
    scrollContainer.scrollTop = index * ITEM_HEIGHT
  }
}

onMounted(() => {
  if (container.value) {
    container.value.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 24px; background: #f9fafb; border-radius: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="font-size: 18px; font-weight: 600; color: #111827;">Virtual List Demo</div>
            <div class="stats" style="font-size: 14px; color: #6b7280; margin-top: 4px;">Loading...</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-top" style="padding: 8px 16px; background: #4f46e5; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">Top</button>
            <button class="btn-middle" style="padding: 8px 16px; background: #4f46e5; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">Middle</button>
            <button class="btn-bottom" style="padding: 8px 16px; background: #4f46e5; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">Bottom</button>
          </div>
        </div>

        <div class="virtual-list-scroll" style="
          height: ${CONTAINER_HEIGHT}px;
          overflow-y: auto;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          position: relative;
        ">
          <div class="virtual-list-content" style="
            position: relative;
            height: ${ITEM_COUNT * ITEM_HEIGHT}px;
            width: 100%;
          "></div>
        </div>

        <div style="font-size: 13px; color: #6b7280; text-align: center;">
          Efficiently rendering ${ITEM_COUNT.toLocaleString()} items with virtualization
        </div>
      </div>
    `

    const scrollContainer = container.value.querySelector('.virtual-list-scroll')
    scrollContainer?.addEventListener('scroll', handleScroll)

    container.value.querySelector('.btn-top')?.addEventListener('click', () => scrollToIndex(0))
    container.value.querySelector('.btn-middle')?.addEventListener('click', () => scrollToIndex(Math.floor(ITEM_COUNT / 2)))
    container.value.querySelector('.btn-bottom')?.addEventListener('click', () => scrollToIndex(ITEM_COUNT - 1))

    renderList()
  }
})

onUnmounted(() => {
  const scrollContainer = container.value?.querySelector('.virtual-list-scroll')
  scrollContainer?.removeEventListener('scroll', handleScroll)
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

.flexium-container :deep(.virtual-list-scroll::-webkit-scrollbar) {
  width: 8px;
}

.flexium-container :deep(.virtual-list-scroll::-webkit-scrollbar-track) {
  background: #f1f1f1;
}

.flexium-container :deep(.virtual-list-scroll::-webkit-scrollbar-thumb) {
  background: #c1c1c1;
  border-radius: 4px;
}

.flexium-container :deep(.virtual-list-scroll::-webkit-scrollbar-thumb:hover) {
  background: #a1a1a1;
}
</style>
