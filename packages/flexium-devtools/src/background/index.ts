import type { DevToolsMessage } from '../types'

// Map of tabId to connected devtools panel ports
const connections = new Map<number, chrome.runtime.Port>()

// Listen for connections from devtools panels
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'flexium-devtools') return

  const listener = (message: DevToolsMessage) => {
    if (message.tabId) {
      connections.set(message.tabId, port)
    }
  }

  port.onMessage.addListener(listener)

  port.onDisconnect.addListener(() => {
    port.onMessage.removeListener(listener)
    // Remove from connections
    for (const [tabId, p] of connections) {
      if (p === port) {
        connections.delete(tabId)
        break
      }
    }
  })
})

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message: DevToolsMessage, sender) => {
  if (message.source !== 'flexium-devtools') return

  const tabId = sender.tab?.id
  if (!tabId) return

  // Forward to the devtools panel for this tab
  const port = connections.get(tabId)
  if (port) {
    port.postMessage({ ...message, tabId })
  }
})

console.log('[Flexium DevTools] Background service worker initialized')
