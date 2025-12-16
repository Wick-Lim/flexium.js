// DevTools integration for Flexium
// This module provides hooks for browser DevTools extension

interface SignalInfo {
  id: number
  name: string
  value: unknown
  type: string
  subscribers: number
  createdAt: number
}

interface DevToolsHook {
  signals: Map<number, SignalInfo>
  onSignalCreate: (info: SignalInfo) => void
  onSignalUpdate: (id: number, value: unknown) => void
  onRender: (event: { timestamp: number; componentName: string; trigger: string; duration: number }) => void
}

declare global {
  interface Window {
    __FLEXIUM_DEVTOOLS__?: DevToolsHook
  }
}

let signalIdCounter = 0
const signalRegistry = new Map<object, number>()

function getDevToolsHook(): DevToolsHook | undefined {
  if (typeof window !== 'undefined') {
    return window.__FLEXIUM_DEVTOOLS__
  }
  return undefined
}

export function registerSignal(container: object, name?: string): number {
  const hook = getDevToolsHook()
  if (!hook) return -1

  const id = ++signalIdCounter
  signalRegistry.set(container, id)

  const info: SignalInfo = {
    id,
    name: name || `signal_${id}`,
    value: (container as any).value,
    type: (container as any).type || 'signal',
    subscribers: 0,
    createdAt: Date.now(),
  }

  hook.onSignalCreate(info)
  return id
}

export function updateSignal(container: object, value: unknown): void {
  const hook = getDevToolsHook()
  if (!hook) return

  const id = signalRegistry.get(container)
  if (id !== undefined) {
    hook.onSignalUpdate(id, value)
  }
}

export function reportRender(componentName: string, trigger: string, duration: number): void {
  const hook = getDevToolsHook()
  if (!hook) return

  hook.onRender({
    timestamp: Date.now(),
    componentName,
    trigger,
    duration,
  })
}

export function isDevToolsEnabled(): boolean {
  return getDevToolsHook() !== undefined
}
