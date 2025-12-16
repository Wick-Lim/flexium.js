import type { DevToolsMessage, SignalInfo, RenderEvent } from '../types'

// Panel state
let isConnected = false
let signals: SignalInfo[] = []
let renderLog: RenderEvent[] = []

// DOM elements
const statusEl = document.getElementById('status')!
const signalTreeEl = document.getElementById('signal-tree')!
const renderLogEl = document.getElementById('render-log')!
const emptyStateEl = document.getElementById('empty-state')!
const tabs = document.querySelectorAll('.tab')
const tabContents = document.querySelectorAll('.tab-content')

// Connect to background script
const port = chrome.runtime.connect({ name: 'flexium-devtools' })

// Register this panel with the background script
port.postMessage({
  type: 'INIT',
  source: 'flexium-devtools',
  tabId: chrome.devtools.inspectedWindow.tabId,
})

// Listen for messages from background script
port.onMessage.addListener((message: DevToolsMessage) => {
  switch (message.type) {
    case 'FLEXIUM_DETECTED':
      setConnected(true)
      break

    case 'FLEXIUM_SIGNALS':
      if (message.data?.signals) {
        signals = message.data.signals
        renderSignalTree()
      }
      break

    case 'FLEXIUM_RENDER':
      if (message.data?.render) {
        renderLog.unshift(message.data.render)
        if (renderLog.length > 100) renderLog.pop()
        renderRenderLog()
      }
      break

    case 'FLEXIUM_DISCONNECT':
      setConnected(false)
      break
  }
})

// Request initial state when panel opens
function requestState() {
  chrome.devtools.inspectedWindow.eval(
    `window.postMessage({ type: 'FLEXIUM_GET_STATE', source: 'flexium-devtools-content' }, '*')`
  )
}

// Tab switching
tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const tabName = tab.getAttribute('data-tab')!

    tabs.forEach((t) => t.classList.remove('active'))
    tab.classList.add('active')

    tabContents.forEach((content) => {
      const el = content as HTMLElement
      el.style.display = el.id === `tab-${tabName}` ? 'block' : 'none'
    })
  })
})

function setConnected(connected: boolean) {
  isConnected = connected
  statusEl.textContent = connected ? 'Connected' : 'Disconnected'
  statusEl.className = `status ${connected ? 'connected' : 'disconnected'}`
  emptyStateEl.style.display = connected ? 'none' : 'flex'

  if (connected) {
    requestState()
  }
}

function formatValue(value: unknown): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return `"${value}"`
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return '[Object]'
    }
  }
  return String(value)
}

function renderSignalTree() {
  if (signals.length === 0) {
    signalTreeEl.innerHTML = '<div style="color:#858585;padding:8px">No signals found</div>'
    return
  }

  signalTreeEl.innerHTML = signals
    .map(
      (signal) => `
      <div class="signal-item">
        <span class="signal-name">${signal.name || `signal_${signal.id}`}</span>
        <span class="signal-value">${formatValue(signal.value)}</span>
        <span class="signal-type">${signal.type}</span>
      </div>
    `
    )
    .join('')
}

function renderRenderLog() {
  if (renderLog.length === 0) {
    renderLogEl.innerHTML = '<div style="color:#858585;padding:8px">No renders recorded</div>'
    return
  }

  renderLogEl.innerHTML = renderLog
    .map(
      (event) => `
      <div class="signal-item">
        <span class="signal-name">${event.componentName}</span>
        <span class="signal-value">${event.duration.toFixed(2)}ms</span>
        <span class="signal-type">${event.trigger}</span>
      </div>
    `
    )
    .join('')
}

// Initial render
renderSignalTree()
renderRenderLog()

// Try to detect Flexium on load
setTimeout(requestState, 500)

console.log('[Flexium DevTools] Panel initialized')
