import type { SignalInfo, RenderEvent } from '../types'

// This script runs in the page context and accesses Flexium internals

interface FlexiumDevToolsHook {
  signals: Map<number, SignalInfo>
  onSignalCreate: (info: SignalInfo) => void
  onSignalUpdate: (id: number, value: unknown) => void
  onRender: (event: RenderEvent) => void
}

declare global {
  interface Window {
    __FLEXIUM_DEVTOOLS__?: FlexiumDevToolsHook
  }
}

let signalIdCounter = 0
const signals = new Map<number, SignalInfo>()

// Create the devtools hook that Flexium core will communicate with
window.__FLEXIUM_DEVTOOLS__ = {
  signals,

  onSignalCreate(info: SignalInfo) {
    signals.set(info.id, info)
    sendToDevTools('FLEXIUM_SIGNALS', { signals: Array.from(signals.values()) })
  },

  onSignalUpdate(id: number, value: unknown) {
    const signal = signals.get(id)
    if (signal) {
      signal.value = value
      sendToDevTools('FLEXIUM_SIGNALS', { signals: Array.from(signals.values()) })
    }
  },

  onRender(event: RenderEvent) {
    sendToDevTools('FLEXIUM_RENDER', { render: event })
  },
}

function sendToDevTools(type: string, data: Record<string, unknown>) {
  window.postMessage(
    {
      type,
      source: 'flexium-devtools-hook',
      data,
    },
    '*'
  )
}

// Listen for requests from content script
window.addEventListener('message', (event) => {
  if (event.source !== window) return
  if (!event.data || event.data.source !== 'flexium-devtools-content') return

  if (event.data.type === 'FLEXIUM_GET_STATE') {
    sendToDevTools('FLEXIUM_SIGNALS', { signals: Array.from(signals.values()) })
  }
})

// Check if Flexium is already loaded
function detectFlexium() {
  // Look for Flexium markers in the DOM or global scope
  const hasFlexiumMarker =
    document.querySelector('[data-flexium]') !== null ||
    document.querySelector('[data-fid]') !== null

  if (hasFlexiumMarker) {
    sendToDevTools('FLEXIUM_DETECTED', { version: '0.12.x' })
  }
}

// Initial detection
setTimeout(detectFlexium, 100)

// Observe DOM for Flexium markers
const observer = new MutationObserver(() => {
  detectFlexium()
})

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['data-flexium', 'data-fid'],
})

console.log('[Flexium DevTools] Hook initialized')
