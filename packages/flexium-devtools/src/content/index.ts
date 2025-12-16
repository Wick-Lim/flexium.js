import type { DevToolsMessage } from '../types'

// Inject the hook script into the page
function injectHook() {
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL('hook.js')
  script.onload = () => script.remove()
  ;(document.head || document.documentElement).appendChild(script)
}

// Listen for messages from the page (hook)
window.addEventListener('message', (event) => {
  if (event.source !== window) return
  if (!event.data || event.data.source !== 'flexium-devtools-hook') return

  // Forward to background script
  const message: DevToolsMessage = {
    ...event.data,
    source: 'flexium-devtools',
  }
  chrome.runtime.sendMessage(message)
})

// Listen for messages from the devtools panel (via background)
chrome.runtime.onMessage.addListener((message: DevToolsMessage) => {
  if (message.source !== 'flexium-devtools') return
  if (message.type === 'FLEXIUM_GET_STATE') {
    // Request state from the hook
    window.postMessage({ type: 'FLEXIUM_GET_STATE', source: 'flexium-devtools-content' }, '*')
  }
})

// Inject hook when document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectHook)
} else {
  injectHook()
}

console.log('[Flexium DevTools] Content script initialized')
