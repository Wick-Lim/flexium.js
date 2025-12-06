<script setup>
import { onMounted, ref } from 'vue'

const container = ref(null)

onMounted(() => {
  if (!container.value) return

  let animationType = 'fade'
  let isAnimating = false
  let springConfig = 'smooth'

  const springConfigs = {
    bouncy: { tension: 300, friction: 10 },
    smooth: { tension: 170, friction: 26 },
    stiff: { tension: 400, friction: 30 },
    slow: { tension: 100, friction: 20 }
  }

  const render = () => {
    container.value.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 32px; padding: 24px; background: #f9fafb; border-radius: 12px;">
        <div>
          <h3 style="margin: 0 0 4px 0; color: #111; font-size: 20px; font-weight: 600;">Motion Component Demo</h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Declarative animations using Web Animations API</p>
        </div>

        <!-- Animation Preview -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Animation Preview</h4>
          <div style="height: 200px; background: #1f2937; border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
            <div
              class="motion-box"
              style="width: 80px; height: 80px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 14px;"
            >
              Motion
            </div>
          </div>

          <!-- Animation Controls -->
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="anim-btn ${animationType === 'fade' ? 'active' : ''}" data-type="fade" style="padding: 8px 16px; background: ${animationType === 'fade' ? '#4f46e5' : '#e5e7eb'}; color: ${animationType === 'fade' ? 'white' : '#374151'}; border: none; border-radius: 6px; font-weight: 500; cursor: pointer;">
              Fade
            </button>
            <button class="anim-btn ${animationType === 'scale' ? 'active' : ''}" data-type="scale" style="padding: 8px 16px; background: ${animationType === 'scale' ? '#4f46e5' : '#e5e7eb'}; color: ${animationType === 'scale' ? 'white' : '#374151'}; border: none; border-radius: 6px; font-weight: 500; cursor: pointer;">
              Scale
            </button>
            <button class="anim-btn ${animationType === 'slide' ? 'active' : ''}" data-type="slide" style="padding: 8px 16px; background: ${animationType === 'slide' ? '#4f46e5' : '#e5e7eb'}; color: ${animationType === 'slide' ? 'white' : '#374151'}; border: none; border-radius: 6px; font-weight: 500; cursor: pointer;">
              Slide
            </button>
            <button class="anim-btn ${animationType === 'rotate' ? 'active' : ''}" data-type="rotate" style="padding: 8px 16px; background: ${animationType === 'rotate' ? '#4f46e5' : '#e5e7eb'}; color: ${animationType === 'rotate' ? 'white' : '#374151'}; border: none; border-radius: 6px; font-weight: 500; cursor: pointer;">
              Rotate
            </button>
            <button class="anim-btn ${animationType === 'combo' ? 'active' : ''}" data-type="combo" style="padding: 8px 16px; background: ${animationType === 'combo' ? '#4f46e5' : '#e5e7eb'}; color: ${animationType === 'combo' ? 'white' : '#374151'}; border: none; border-radius: 6px; font-weight: 500; cursor: pointer;">
              Combo
            </button>
          </div>

          <button class="play-btn" style="padding: 12px 24px; background: #10b981; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <span style="font-size: 18px;">▶</span> Play Animation
          </button>
        </div>

        <!-- Spring Physics -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Spring Physics</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px;">
            <button class="spring-btn ${springConfig === 'bouncy' ? 'active' : ''}" data-spring="bouncy" style="padding: 16px; background: ${springConfig === 'bouncy' ? '#fef3c7' : 'white'}; border: 2px solid ${springConfig === 'bouncy' ? '#f59e0b' : '#e5e7eb'}; border-radius: 8px; cursor: pointer; text-align: left;">
              <div style="font-weight: 600; color: #111;">Bouncy</div>
              <div style="font-size: 12px; color: #6b7280;">tension: 300, friction: 10</div>
            </button>
            <button class="spring-btn ${springConfig === 'smooth' ? 'active' : ''}" data-spring="smooth" style="padding: 16px; background: ${springConfig === 'smooth' ? '#dbeafe' : 'white'}; border: 2px solid ${springConfig === 'smooth' ? '#3b82f6' : '#e5e7eb'}; border-radius: 8px; cursor: pointer; text-align: left;">
              <div style="font-weight: 600; color: #111;">Smooth</div>
              <div style="font-size: 12px; color: #6b7280;">tension: 170, friction: 26</div>
            </button>
            <button class="spring-btn ${springConfig === 'stiff' ? 'active' : ''}" data-spring="stiff" style="padding: 16px; background: ${springConfig === 'stiff' ? '#fce7f3' : 'white'}; border: 2px solid ${springConfig === 'stiff' ? '#ec4899' : '#e5e7eb'}; border-radius: 8px; cursor: pointer; text-align: left;">
              <div style="font-weight: 600; color: #111;">Stiff</div>
              <div style="font-size: 12px; color: #6b7280;">tension: 400, friction: 30</div>
            </button>
            <button class="spring-btn ${springConfig === 'slow' ? 'active' : ''}" data-spring="slow" style="padding: 16px; background: ${springConfig === 'slow' ? '#d1fae5' : 'white'}; border: 2px solid ${springConfig === 'slow' ? '#10b981' : '#e5e7eb'}; border-radius: 8px; cursor: pointer; text-align: left;">
              <div style="font-weight: 600; color: #111;">Slow</div>
              <div style="font-size: 12px; color: #6b7280;">tension: 100, friction: 20</div>
            </button>
          </div>
        </div>

        <!-- Staggered Animation -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Staggered List Animation</h4>
          <div class="stagger-container" style="display: flex; gap: 12px; flex-wrap: wrap;">
            ${[1,2,3,4,5].map(i => `
              <div class="stagger-item" data-index="${i}" style="width: 60px; height: 60px; background: linear-gradient(135deg, hsl(${i * 50}, 70%, 60%) 0%, hsl(${i * 50 + 30}, 70%, 50%) 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; opacity: 0; transform: translateY(20px);">${i}</div>
            `).join('')}
          </div>
          <button class="stagger-btn" style="padding: 10px 20px; background: #8b5cf6; color: white; border: none; border-radius: 6px; font-weight: 500; cursor: pointer; align-self: flex-start;">
            Animate List
          </button>
        </div>

        <!-- Hover Card Demo -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Interactive Hover</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;">
            <div class="hover-card" style="padding: 24px; background: white; border-radius: 12px; border: 2px solid #e5e7eb; cursor: pointer; text-align: center; transition: none;">
              <div style="font-size: 32px; margin-bottom: 8px;">🚀</div>
              <div style="font-weight: 600;">Hover Me</div>
            </div>
            <div class="hover-card" style="padding: 24px; background: white; border-radius: 12px; border: 2px solid #e5e7eb; cursor: pointer; text-align: center; transition: none;">
              <div style="font-size: 32px; margin-bottom: 8px;">💫</div>
              <div style="font-weight: 600;">Hover Me</div>
            </div>
            <div class="hover-card" style="padding: 24px; background: white; border-radius: 12px; border: 2px solid #e5e7eb; cursor: pointer; text-align: center; transition: none;">
              <div style="font-size: 32px; margin-bottom: 8px;">✨</div>
              <div style="font-weight: 600;">Hover Me</div>
            </div>
          </div>
        </div>

        <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center;">
          Motion uses Web Animations API for GPU-accelerated, smooth animations
        </p>
      </div>
    `

    // Animation type buttons
    container.value.querySelectorAll('.anim-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        animationType = btn.dataset.type
        render()
      })
    })

    // Spring config buttons
    container.value.querySelectorAll('.spring-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        springConfig = btn.dataset.spring
        render()
      })
    })

    // Play animation button
    const playBtn = container.value.querySelector('.play-btn')
    const motionBox = container.value.querySelector('.motion-box')
    if (playBtn && motionBox) {
      playBtn.addEventListener('click', () => {
        if (isAnimating) return
        isAnimating = true

        const spring = springConfigs[springConfig]
        const duration = Math.min(1000, (4.6 / ((spring.friction / (2 * Math.sqrt(spring.tension))) * Math.sqrt(spring.tension))) * 1000)
        const easing = spring.friction < Math.sqrt(spring.tension) * 2
          ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'
          : 'cubic-bezier(0.22, 1, 0.36, 1)'

        let keyframes
        switch (animationType) {
          case 'fade':
            keyframes = [
              { opacity: 0 },
              { opacity: 1 }
            ]
            break
          case 'scale':
            keyframes = [
              { transform: 'scale(0.5)' },
              { transform: 'scale(1)' }
            ]
            break
          case 'slide':
            keyframes = [
              { transform: 'translateX(-100px)', opacity: 0 },
              { transform: 'translateX(0)', opacity: 1 }
            ]
            break
          case 'rotate':
            keyframes = [
              { transform: 'rotate(-180deg) scale(0.8)' },
              { transform: 'rotate(0deg) scale(1)' }
            ]
            break
          case 'combo':
            keyframes = [
              { transform: 'translateY(50px) scale(0.5) rotate(-45deg)', opacity: 0 },
              { transform: 'translateY(0) scale(1) rotate(0deg)', opacity: 1 }
            ]
            break
        }

        const animation = motionBox.animate(keyframes, {
          duration,
          easing,
          fill: 'forwards'
        })

        animation.onfinish = () => {
          isAnimating = false
        }
      })
    }

    // Stagger animation
    const staggerBtn = container.value.querySelector('.stagger-btn')
    const staggerItems = container.value.querySelectorAll('.stagger-item')
    if (staggerBtn && staggerItems.length) {
      staggerBtn.addEventListener('click', () => {
        staggerItems.forEach((item, index) => {
          // Reset first
          item.style.opacity = '0'
          item.style.transform = 'translateY(20px)'

          setTimeout(() => {
            item.animate([
              { opacity: 0, transform: 'translateY(20px)' },
              { opacity: 1, transform: 'translateY(0)' }
            ], {
              duration: 400,
              easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
              delay: 0,
              fill: 'forwards'
            })
          }, index * 80)
        })
      })
    }

    // Hover cards
    container.value.querySelectorAll('.hover-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.animate([
          { transform: 'scale(1) translateY(0)' },
          { transform: 'scale(1.05) translateY(-4px)' }
        ], {
          duration: 200,
          easing: 'ease-out',
          fill: 'forwards'
        })
        card.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)'
        card.style.borderColor = '#6366f1'
      })
      card.addEventListener('mouseleave', () => {
        card.animate([
          { transform: 'scale(1.05) translateY(-4px)' },
          { transform: 'scale(1) translateY(0)' }
        ], {
          duration: 200,
          easing: 'ease-out',
          fill: 'forwards'
        })
        card.style.boxShadow = 'none'
        card.style.borderColor = '#e5e7eb'
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

.flexium-container :deep(button:hover) {
  filter: brightness(105%);
}
</style>
