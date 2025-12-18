<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { use } from 'flexium/core'

const container = ref(null)
let frameId = null

onMounted(() => {
  if (!container.value) return

  // State
  const [text, setText] = use('FLEXIUM')
  const [fontSize, setFontSize] = use(48)
  const [fontFamily, setFontFamily] = use('sans-serif')
  const [textAlign, setTextAlign] = use('center')
  const [time, setTime] = use(0)

  // Build DOM
  const wrapper = document.createElement('div')
  wrapper.style.cssText = 'padding: 24px; background: #f9fafb; border-radius: 12px; width: 100%; max-width: 100%; box-sizing: border-box;'

  const title = document.createElement('h3')
  title.textContent = 'Canvas Text Demo'
  title.style.cssText = 'margin: 0 0 8px; color: #374151;'

  const desc = document.createElement('p')
  desc.textContent = 'Customize text rendering on canvas'
  desc.style.cssText = 'margin: 0 0 16px; color: #6b7280; font-size: 14px;'

  const canvasWrapper = document.createElement('div')
  canvasWrapper.style.cssText = 'text-align: center; margin-bottom: 16px;'

  const canvas = document.createElement('canvas')
  canvas.width = 400
  canvas.height = 300
  canvas.style.cssText = 'background: #1a1a2e; border-radius: 8px; display: inline-block;'

  canvasWrapper.appendChild(canvas)

  const controls = document.createElement('div')
  controls.style.cssText = 'display: flex; flex-direction: column; gap: 12px; max-width: 600px; margin: 0 auto;'

  // Text input
  const textInputDiv = document.createElement('div')
  textInputDiv.style.cssText = 'display: flex; flex-direction: column; gap: 4px;'

  const textLabel = document.createElement('label')
  textLabel.textContent = 'Text'
  textLabel.style.cssText = 'color: #374151; font-size: 13px; font-weight: 500;'

  const textInput = document.createElement('input')
  textInput.type = 'text'
  textInput.value = text
  textInput.style.cssText = 'padding: 8px 12px; border: 2px solid #d1d5db; border-radius: 6px; font-size: 14px;'
  textInput.addEventListener('input', (e) => setText(e.target.value || 'FLEXIUM'))

  textInputDiv.appendChild(textLabel)
  textInputDiv.appendChild(textInput)

  // Font size slider
  const createSlider = (label, value, min, max, step, onChange) => {
    const div = document.createElement('div')
    div.style.cssText = 'display: flex; flex-direction: column; gap: 4px;'

    const labelEl = document.createElement('label')
    labelEl.textContent = label
    labelEl.style.cssText = 'color: #374151; font-size: 13px; font-weight: 500;'

    const input = document.createElement('input')
    input.type = 'range'
    input.min = min
    input.max = max
    input.step = step
    input.value = value
    input.style.cssText = 'width: 100%;'

    const valueEl = document.createElement('span')
    valueEl.textContent = `${value}px`
    valueEl.style.cssText = 'color: #6b7280; font-size: 12px;'

    input.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value)
      valueEl.textContent = `${val}px`
      onChange(val)
    })

    div.appendChild(labelEl)
    div.appendChild(input)
    div.appendChild(valueEl)
    return div
  }

  // Font family buttons
  const createFontButtons = () => {
    const div = document.createElement('div')
    div.style.cssText = 'display: flex; gap: 8px; flex-wrap: wrap;'

    const fonts = [
      { label: 'Sans', value: 'sans-serif' },
      { label: 'Serif', value: 'serif' },
      { label: 'Mono', value: 'monospace' },
      { label: 'Cursive', value: 'cursive' }
    ]

    fonts.forEach(font => {
      const btn = document.createElement('button')
      btn.textContent = font.label
      btn.style.cssText = `
        padding: 8px 16px;
        border: 2px solid #d1d5db;
        background: ${font.value === fontFamily ? '#3b82f6' : '#ffffff'};
        color: ${font.value === fontFamily ? '#ffffff' : '#374151'};
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        font-family: ${font.value};
      `

      btn.addEventListener('click', () => {
        setFontFamily(font.value)
        Array.from(div.children).forEach((b, i) => {
          b.style.background = fonts[i].value === font.value ? '#3b82f6' : '#ffffff'
          b.style.color = fonts[i].value === font.value ? '#ffffff' : '#374151'
        })
      })

      div.appendChild(btn)
    })

    return div
  }

  // Text align buttons
  const createAlignButtons = () => {
    const div = document.createElement('div')
    div.style.cssText = 'display: flex; gap: 8px;'

    const aligns = [
      { label: 'Left', value: 'left' },
      { label: 'Center', value: 'center' },
      { label: 'Right', value: 'right' }
    ]

    aligns.forEach(align => {
      const btn = document.createElement('button')
      btn.textContent = align.label
      btn.style.cssText = `
        padding: 8px 16px;
        border: 2px solid #d1d5db;
        background: ${align.value === textAlign ? '#3b82f6' : '#ffffff'};
        color: ${align.value === textAlign ? '#ffffff' : '#374151'};
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
      `

      btn.addEventListener('click', () => {
        setTextAlign(align.value)
        Array.from(div.children).forEach((b, i) => {
          b.style.background = aligns[i].value === align.value ? '#3b82f6' : '#ffffff'
          b.style.color = aligns[i].value === align.value ? '#ffffff' : '#374151'
        })
      })

      div.appendChild(btn)
    })

    return div
  }

  const fontSizeSlider = createSlider('Font Size', fontSize, 12, 80, 1, (val) => setFontSize(val))
  const fontButtons = createFontButtons()
  const alignButtons = createAlignButtons()

  const fontLabel = document.createElement('label')
  fontLabel.textContent = 'Font Family'
  fontLabel.style.cssText = 'color: #374151; font-size: 13px; font-weight: 500; margin-top: 4px;'

  const alignLabel = document.createElement('label')
  alignLabel.textContent = 'Text Align'
  alignLabel.style.cssText = 'color: #374151; font-size: 13px; font-weight: 500; margin-top: 4px;'

  controls.appendChild(textInputDiv)
  controls.appendChild(fontSizeSlider)
  controls.appendChild(fontLabel)
  controls.appendChild(fontButtons)
  controls.appendChild(alignLabel)
  controls.appendChild(alignButtons)

  wrapper.appendChild(title)
  wrapper.appendChild(desc)
  wrapper.appendChild(canvasWrapper)
  wrapper.appendChild(controls)
  container.value.appendChild(wrapper)

  const ctx = canvas.getContext('2d')

  // Animation loop
  const animate = () => {
    setTime(t => t + 0.03)

    if (ctx) {
      // Clear canvas
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, 400, 300)

      const currentTime = time
      const currentText = text
      const currentFontSize = fontSize
      const currentFontFamily = fontFamily
      const currentAlign = textAlign

      // Calculate base X position based on alignment
      let baseX = 200
      if (currentAlign === 'left') baseX = 50
      if (currentAlign === 'right') baseX = 350

      // Draw animated background text
      ctx.globalAlpha = 0.1
      for (let i = 0; i < 5; i++) {
        const y = 60 + i * 50
        const offset = Math.sin(currentTime + i) * 20
        ctx.font = `${20 + i * 5}px ${currentFontFamily}`
        ctx.textAlign = 'center'
        ctx.fillStyle = `hsl(${(i * 60 + currentTime * 50) % 360}, 70%, 60%)`
        ctx.fillText(currentText, 200 + offset, y)
      }
      ctx.globalAlpha = 1

      // Draw main text with gradient
      ctx.font = `bold ${currentFontSize}px ${currentFontFamily}`
      ctx.textAlign = currentAlign
      ctx.textBaseline = 'middle'

      const mainY = 150

      // Create gradient
      const gradient = ctx.createLinearGradient(0, mainY - currentFontSize / 2, 0, mainY + currentFontSize / 2)
      gradient.addColorStop(0, '#8b5cf6')
      gradient.addColorStop(0.5, '#ec4899')
      gradient.addColorStop(1, '#f59e0b')

      // Draw text shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 3
      ctx.shadowOffsetY = 3
      ctx.fillStyle = gradient
      ctx.fillText(currentText, baseX, mainY)

      // Reset shadow
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // Draw text stroke
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.strokeText(currentText, baseX, mainY)

      // Draw wavy text animation
      const wavyY = 240
      const wavyText = 'Canvas Text Effects'
      ctx.font = '16px monospace'
      ctx.textAlign = 'left'

      for (let i = 0; i < wavyText.length; i++) {
        const char = wavyText[i]
        const charWidth = ctx.measureText(char).width
        const x = 80 + i * charWidth
        const y = wavyY + Math.sin(currentTime * 2 + i * 0.5) * 10
        const hue = (currentTime * 50 + i * 10) % 360

        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(Math.sin(currentTime + i * 0.3) * 0.2)
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`
        ctx.fillText(char, 0, 0)
        ctx.restore()
      }

      // Draw alignment indicator line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(baseX, 100)
      ctx.lineTo(baseX, 200)
      ctx.stroke()
      ctx.setLineDash([])

      // Draw size reference
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, mainY - currentFontSize / 2)
      ctx.lineTo(400, mainY - currentFontSize / 2)
      ctx.moveTo(0, mainY + currentFontSize / 2)
      ctx.lineTo(400, mainY + currentFontSize / 2)
      ctx.stroke()

      // Draw sample text styles in corners
      const samples = [
        { text: 'Bold', font: 'bold 14px sans-serif', x: 30, y: 20 },
        { text: 'Italic', font: 'italic 14px serif', x: 340, y: 20 },
        { text: 'Small', font: '10px monospace', x: 30, y: 280 },
        { text: 'Large', font: 'bold 18px cursive', x: 320, y: 280 }
      ]

      samples.forEach(sample => {
        ctx.font = sample.font
        ctx.textAlign = 'left'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.fillText(sample.text, sample.x, sample.y)
      })
    }

    frameId = requestAnimationFrame(animate)
  }

  animate()
})

onUnmounted(() => {
  if (frameId) cancelAnimationFrame(frameId)
  if (container.value) {
    container.value.innerHTML = ''
  }
})
</script>

<template>
  <div class="demo-wrapper">
    <div ref="container"></div>
  </div>
</template>

<style scoped>
.demo-wrapper {
  margin: 20px 0;
}
</style>
