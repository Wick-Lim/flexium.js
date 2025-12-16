import type { SerializedState } from './types'

let isServerRendering = false
let serverStateCollector: Map<string, unknown> | null = null
let hydrationIdCounter = 0

export function getIsServer(): boolean {
  return isServerRendering
}

export function enterServerRender(): void {
  isServerRendering = true
  serverStateCollector = new Map()
  hydrationIdCounter = 0
}

export function exitServerRender(): SerializedState {
  isServerRendering = false
  const states = Object.fromEntries(serverStateCollector || new Map())
  serverStateCollector = null

  return { states }
}

export function collectServerState(key: string, value: unknown): void {
  if (serverStateCollector) {
    serverStateCollector.set(key, value)
  }
}

export function generateHydrationId(): string {
  return `fid-${hydrationIdCounter++}`
}

export function resetHydrationIdCounter(): void {
  hydrationIdCounter = 0
}
